import * as Phaser from "phaser";
import { Room, getStateCallbacks } from "colyseus.js";
import { getMapDef, DEFAULT_MAP_ID } from "../data/maps";
import type { MapDef } from "../data/maps/types";
import { joinMap, type JoinProfile } from "../net/connection";
import { PlayerActor } from "../entities/PlayerActor";
import { drawGround, drawLightOverlay } from "../render/ground";
import { bus, BusEvents } from "../net/bus";
import { PLAYER_SPEED, MOVE_SEND_INTERVAL_MS, GAME_BG_COLOR } from "../config";

interface MoveKeys {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
}

/**
 * The generic world scene: renders whichever MapDef it is started with and
 * keeps it in sync with the map's Colyseus room. Travelling to another
 * location = leave room + scene.restart with a new mapId. There is exactly
 * one scene class no matter how many maps exist.
 */
export class WorldScene extends Phaser.Scene {
  private mapId: string = DEFAULT_MAP_ID;
  private mapDef!: MapDef;
  private room?: Room;
  private self?: PlayerActor;
  private selfBody?: Phaser.Physics.Arcade.Body;
  private remotes = new Map<string, PlayerActor>();
  private keys!: MoveKeys;
  private lastSent = { x: 0, y: 0, dir: "down", moving: false };
  private nextSendAt = 0;
  private busUnsubs: Array<() => void> = [];
  private destroyed = false;

  constructor() {
    super("World");
  }

  init(data: { mapId?: string }) {
    this.mapId = data?.mapId ?? DEFAULT_MAP_ID;
    this.remotes = new Map();
    this.room = undefined;
    this.self = undefined;
    this.busUnsubs = [];
    this.destroyed = false;
  }

  create() {
    const profile = this.game.registry.get("profile") as JoinProfile;
    this.mapDef = getMapDef(this.mapId);
    const { width, height, spawn } = this.mapDef;

    this.cameras.main.setBackgroundColor(GAME_BG_COLOR);
    this.cameras.main.setBounds(0, 0, width, height);
    this.physics.world.setBounds(0, 0, width, height);

    drawGround(this, this.mapDef);
    drawLightOverlay(this, this.mapDef);

    // Local player: physics-driven, client-authoritative.
    this.self = new PlayerActor(this, profile, profile.name, spawn.x, spawn.y, true);
    this.physics.add.existing(this.self.container);
    const body = this.self.container.body as Phaser.Physics.Arcade.Body;
    body.setSize(30, 18);
    body.setOffset(-15, -14);
    body.setCollideWorldBounds(true);
    this.selfBody = body;

    this.cameras.main.startFollow(this.self.container, false, 0.12, 0.12);

    const kb = this.input.keyboard!;
    this.keys = kb.addKeys("up,down,left,right,w,a,s,d") as MoveKeys;

    this.connect(profile);

    bus.emit(BusEvents.WorldEntered, {
      mapId: this.mapDef.id,
      label: this.mapDef.label,
      kind: this.mapDef.kind,
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.teardown());
  }

  private async connect(profile: JoinProfile) {
    let room: Room;
    try {
      room = await joinMap(this.mapId, profile);
    } catch (err) {
      console.error("join failed", err);
      bus.emit(BusEvents.GameError, {
        message: "Couldn't reach the neighborhood. Is the realtime server awake?",
      });
      return;
    }
    if (this.destroyed) {
      room.leave();
      return;
    }
    this.room = room;
    const $ = getStateCallbacks(room);

    $(room.state).players.onAdd((player: any, sessionId: string) => {
      if (this.destroyed) return;
      if (sessionId === room.sessionId) {
        // Adopt the server-assigned spawn scatter so everyone agrees.
        this.self?.setLocal(player.x, player.y, player.dir, false, "");
        this.lastSent = { x: player.x, y: player.y, dir: player.dir, moving: false };
        return;
      }
      const actor = new PlayerActor(
        this,
        { body: player.body, palette: player.palette, accessory: player.accessory },
        player.name,
        player.x,
        player.y,
        false
      );
      this.remotes.set(sessionId, actor);
      $(player).onChange(() => {
        actor.applyState({
          x: player.x,
          y: player.y,
          dir: player.dir,
          moving: player.moving,
          action: player.action,
        });
      });
    });

    $(room.state).players.onRemove((_player: any, sessionId: string) => {
      this.remotes.get(sessionId)?.destroy();
      this.remotes.delete(sessionId);
    });

    // Registered now so Colyseus doesn't warn; the social phase wires these
    // into bubbles/emote pops.
    room.onMessage("chat", () => {});
    room.onMessage("emote", () => {});
    room.onMessage("moderation-ack", () => {});

    room.onLeave(() => {
      if (!this.destroyed) {
        bus.emit(BusEvents.GameError, { message: "Connection lost. Refresh to rejoin." });
      }
    });
  }

  update(time: number) {
    if (!this.self || !this.selfBody) return;

    // --- local movement ---
    const k = this.keys;
    let vx = 0;
    let vy = 0;
    if (k.left.isDown || k.a.isDown) vx -= 1;
    if (k.right.isDown || k.d.isDown) vx += 1;
    if (k.up.isDown || k.w.isDown) vy -= 1;
    if (k.down.isDown || k.s.isDown) vy += 1;
    const moving = vx !== 0 || vy !== 0;
    if (moving) {
      const len = Math.hypot(vx, vy);
      this.selfBody.setVelocity((vx / len) * PLAYER_SPEED, (vy / len) * PLAYER_SPEED);
    } else {
      this.selfBody.setVelocity(0, 0);
    }

    let dir = this.self.dir;
    if (moving) {
      if (Math.abs(vx) >= Math.abs(vy)) dir = vx > 0 ? "right" : "left";
      else dir = vy > 0 ? "down" : "up";
    }
    const action = moving ? "" : this.self.action;
    this.self.setLocal(this.self.container.x, this.self.container.y, dir, moving, action);

    // --- throttled network send ---
    if (this.room && time >= this.nextSendAt) {
      const { x, y } = this.self.container;
      const changed =
        Math.abs(x - this.lastSent.x) > 0.5 ||
        Math.abs(y - this.lastSent.y) > 0.5 ||
        dir !== this.lastSent.dir ||
        moving !== this.lastSent.moving;
      if (changed) {
        this.room.send("move", { x, y, dir, moving });
        this.lastSent = { x, y, dir, moving };
        this.nextSendAt = time + MOVE_SEND_INTERVAL_MS;
      }
    }

    // --- remote interpolation ---
    for (const actor of this.remotes.values()) {
      actor.updateRemote();
    }
  }

  private teardown() {
    this.destroyed = true;
    this.busUnsubs.forEach((u) => u());
    this.busUnsubs = [];
    this.room?.removeAllListeners();
    this.room?.leave();
    this.room = undefined;
    this.remotes.forEach((a) => a.destroy());
    this.remotes.clear();
  }
}
