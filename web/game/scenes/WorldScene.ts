import * as Phaser from "phaser";
import { Room, getStateCallbacks } from "colyseus.js";
import { getMapDef, DEFAULT_MAP_ID } from "../data/maps";
import type { MapDef } from "../data/maps/types";
import { joinMap, fetchPresence, type JoinProfile } from "../net/connection";
import { PlayerActor } from "../entities/PlayerActor";
import { drawGround, drawLightOverlay } from "../render/ground";
import { buildWorld, type BuiltWorld } from "../systems/worldBuilder";
import { bus, BusEvents } from "../net/bus";
import { PLAYER_SPEED, MOVE_SEND_INTERVAL_MS, GAME_BG_COLOR, PRESENCE_POLL_MS } from "../config";

interface MoveKeys {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
  e: Phaser.Input.Keyboard.Key;
}

interface SceneData {
  mapId?: string;
  spawnAt?: { x: number; y: number };
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
  private spawnAt?: { x: number; y: number };
  private room?: Room;
  private self?: PlayerActor;
  private selfBody?: Phaser.Physics.Arcade.Body;
  private remotes = new Map<string, PlayerActor>();
  private keys!: MoveKeys;
  private world?: BuiltWorld;
  private signTexts: Phaser.GameObjects.Text[] = [];
  private lastSent = { x: 0, y: 0, dir: "down", moving: false };
  private nextSendAt = 0;
  private busUnsubs: Array<() => void> = [];
  private presenceTimer?: Phaser.Time.TimerEvent;
  private traveling = false;
  private portalLockUntil = 0;
  private destroyed = false;

  constructor() {
    super("World");
  }

  init(data: SceneData) {
    this.mapId = data?.mapId ?? DEFAULT_MAP_ID;
    this.spawnAt = data?.spawnAt;
    this.remotes = new Map();
    this.room = undefined;
    this.self = undefined;
    this.world = undefined;
    this.signTexts = [];
    this.busUnsubs = [];
    this.traveling = false;
    this.destroyed = false;
  }

  create() {
    const profile = this.game.registry.get("profile") as JoinProfile;
    this.mapDef = getMapDef(this.mapId);
    const { width, height } = this.mapDef;
    const spawn = this.spawnAt ?? this.mapDef.spawn;

    this.cameras.main.setBackgroundColor(GAME_BG_COLOR);
    this.cameras.main.setBounds(0, 0, width, height);
    this.physics.world.setBounds(0, 0, width, height);

    // Small interiors zoom up to fill the viewport (no dead letterbox);
    // outdoor maps stay 1:1. Recomputed on window resize.
    const applyZoom = () => {
      const cam = this.cameras.main;
      cam.setZoom(Math.max(1, cam.width / width, cam.height / height));
    };
    applyZoom();
    this.scale.on(Phaser.Scale.Events.RESIZE, applyZoom);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () =>
      this.scale.off(Phaser.Scale.Events.RESIZE, applyZoom)
    );

    drawGround(this, this.mapDef);
    this.world = buildWorld(this, this.mapDef);
    drawLightOverlay(this, this.mapDef);

    // Sign bubbles: hidden until the player walks close.
    this.signTexts = this.mapDef.signs.map((s) =>
      this.add
        .text(s.x, s.y - 60, s.text, {
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          fontSize: "13px",
          color: "#3a2e2c",
          backgroundColor: "#fff7ea",
          padding: { x: 10, y: 6 },
          wordWrap: { width: 220 },
          align: "center",
        })
        .setOrigin(0.5, 1)
        .setDepth(90000)
        .setAlpha(0)
    );

    // Local player: physics-driven, client-authoritative.
    this.self = new PlayerActor(this, profile, profile.name, spawn.x, spawn.y, true);
    this.physics.add.existing(this.self.container);
    const body = this.self.container.body as Phaser.Physics.Arcade.Body;
    body.setSize(30, 18);
    body.setOffset(-15, -14);
    body.setCollideWorldBounds(true);
    this.selfBody = body;
    this.physics.add.collider(this.self.container, this.world.colliders);

    this.cameras.main.startFollow(this.self.container, false, 0.12, 0.12);

    const kb = this.input.keyboard!;
    this.keys = kb.addKeys("up,down,left,right,w,a,s,d,e") as MoveKeys;

    // Arriving through a door: brief immunity so the exit mat under our feet
    // doesn't instantly bounce us back.
    this.portalLockUntil = this.time.now + 1000;

    this.connect(profile);
    this.pollPresence();
    this.presenceTimer = this.time.addEvent({
      delay: PRESENCE_POLL_MS,
      loop: true,
      callback: () => this.pollPresence(),
    });

    this.busUnsubs.push(
      bus.on(BusEvents.TravelTo, (p: { mapId: string }) => this.travel(p.mapId)),
      bus.on(BusEvents.ActionSend, (p: { action: string }) => this.doAction(p.action))
    );

    bus.emit(BusEvents.WorldEntered, {
      mapId: this.mapDef.id,
      label: this.mapDef.label,
      kind: this.mapDef.kind,
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.teardown());
  }

  // -------------------------------------------------------------------------
  // Networking
  // -------------------------------------------------------------------------

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
        if (this.spawnAt && this.self) {
          // We arrived through a door: keep the local position and tell the
          // server where we actually are.
          room.send("move", { x: this.self.x, y: this.self.y, dir: "down", moving: false });
          this.lastSent = { x: this.self.x, y: this.self.y, dir: "down", moving: false };
        } else {
          // Adopt the server-assigned spawn scatter so everyone agrees.
          this.self?.setLocal(player.x, player.y, player.dir, false, "");
          this.lastSent = { x: player.x, y: player.y, dir: player.dir, moving: false };
        }
        this.emitRoster();
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
      this.emitRoster();
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
      this.emitRoster();
    });

    // Registered now so Colyseus doesn't warn; the social phase wires these
    // into bubbles/emote pops.
    room.onMessage("chat", () => {});
    room.onMessage("emote", () => {});
    room.onMessage("moderation-ack", () => {});

    room.onLeave(() => {
      if (!this.destroyed && !this.traveling) {
        bus.emit(BusEvents.GameError, { message: "Connection lost. Refresh to rejoin." });
      }
    });
  }

  private emitRoster() {
    if (!this.room) return;
    const players: { sessionId: string; name: string }[] = [];
    this.room.state.players.forEach((p: any, id: string) => {
      players.push({ sessionId: id, name: p.name });
    });
    bus.emit(BusEvents.RosterUpdate, { players, selfId: this.room.sessionId });
  }

  private async pollPresence() {
    if (this.destroyed || !this.world) return;
    try {
      const presence = await fetchPresence();
      if (this.destroyed || !this.world) return;
      for (const portal of this.world.portals) {
        const count = presence.counts[portal.toMap] ?? 0;
        if (portal.glow) {
          portal.glow.fillAlpha = count > 0 ? 0.55 : 0.25;
          portal.glow.fillColor = count > 0 ? 0xffd166 : 0xffe9a8;
        }
        portal.label.setText(count > 0 ? `● ${count} inside` : "");
      }
    } catch {
      // presence is cosmetic — ignore transient failures
    }
  }

  // -------------------------------------------------------------------------
  // Travel & actions
  // -------------------------------------------------------------------------

  private travel(mapId: string, spawnAt?: { x: number; y: number }) {
    if (this.traveling || this.destroyed || mapId === this.mapId) return;
    this.traveling = true;
    this.cameras.main.fadeOut(280, 28, 26, 36);
    const go = () => {
      this.room?.removeAllListeners();
      this.room?.leave();
      this.room = undefined;
      this.scene.restart({ mapId, spawnAt } satisfies SceneData);
    };
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, go);
  }

  private doAction(action: string) {
    if (!this.self || !this.room) return;
    if (action === "sit") {
      // Snap to a nearby seat when there is one; otherwise sit in place.
      const seat = this.world?.seats.find((s) => Phaser.Math.Distance.Between(s.x, s.y, this.self!.x, this.self!.y) < 70);
      if (seat) {
        this.self.setLocal(seat.x, seat.sitY, "down", false, "sit");
        this.room.send("move", { x: seat.x, y: seat.sitY, dir: "down", moving: false });
      } else {
        this.self.setLocal(this.self.x, this.self.y, this.self.dir, false, "sit");
      }
      this.self.action = "sit";
    } else if (action === "dance" || action === "") {
      this.self.action = action;
      this.self.setLocal(this.self.x, this.self.y, this.self.dir, false, action);
    }
    this.room.send("action", { action: this.self.action });
  }

  // -------------------------------------------------------------------------
  // Update loop
  // -------------------------------------------------------------------------

  update(time: number) {
    if (!this.self || !this.selfBody || this.traveling) return;

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

    // E to sit on a nearby bench/chair
    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
      this.doAction(this.self.action === "sit" ? "" : "sit");
    }

    // --- portals ---
    if (time > this.portalLockUntil && this.world) {
      const px = this.self.x;
      const py = this.self.y;
      for (const portal of this.world.portals) {
        const d = portal.def;
        if (px >= d.x && px <= d.x + d.w && py >= d.y - 4 && py <= d.y + d.h + 4) {
          this.travel(d.toMap, d.spawnAt);
          return;
        }
      }
    }

    // --- sign proximity bubbles ---
    for (let i = 0; i < this.signTexts.length; i++) {
      const s = this.mapDef.signs[i];
      const near = Phaser.Math.Distance.Between(s.x, s.y, this.self.x, this.self.y) < 90;
      const target = near ? 1 : 0;
      const t = this.signTexts[i];
      if (t.alpha !== target) {
        t.setAlpha(Phaser.Math.Linear(t.alpha, target, 0.2));
        if (Math.abs(t.alpha - target) < 0.02) t.setAlpha(target);
      }
    }

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
    this.presenceTimer?.remove();
    this.room?.removeAllListeners();
    this.room?.leave();
    this.room = undefined;
    this.remotes.forEach((a) => a.destroy());
    this.remotes.clear();
  }
}
