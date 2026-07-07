import * as Phaser from "phaser";
import { Room, getStateCallbacks } from "colyseus.js";
import { joinHouse } from "../net/colyseusClient";
import { bus, BusEvents } from "../net/bus";
import { CHAT_BUBBLE_LIFETIME_MS } from "../config";

interface HouseData {
  houseId: string;
  houseName: string;
  name: string;
  deviceId: string;
  returnX: number;
  returnY: number;
}

const ROOM_AREA = { x: 140, y: 150, width: 760, height: 420 };
const MOVE_SEND_INTERVAL_MS = 90;

interface AvatarEntry {
  sprite: Phaser.GameObjects.Sprite;
  nameLabel: Phaser.GameObjects.Text;
  bubble?: Phaser.GameObjects.Text;
  bubbleTimer?: Phaser.Time.TimerEvent;
}

/** Deterministic pastel tint per session id, so avatars are visually distinct without real art. */
function tintForSessionId(sessionId: string): number {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) hash = (hash * 31 + sessionId.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  const color = Phaser.Display.Color.HSLToColor(hue / 360, 0.55, 0.82);
  return color.color;
}

export class HouseScene extends Phaser.Scene {
  private sceneData!: HouseData;
  private room?: Room;
  private avatars = new Map<string, AvatarEntry>();
  private localBody?: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private lastSentAt = 0;
  private lastSent = { x: 0, y: 0 };
  private busUnbinds: Array<() => void> = [];

  constructor() {
    super("House");
  }

  init(data: HouseData) {
    this.sceneData = data;
  }

  create() {
    // Phaser reuses this Scene instance across visits (scene.start() doesn't
    // re-construct it), so per-visit bookkeeping has to be reset by hand —
    // otherwise stale entries from a previous house visit linger here.
    this.room = undefined;
    this.avatars = new Map();
    this.localBody = undefined;
    this.lastSentAt = 0;
    this.lastSent = { x: 0, y: 0 };
    this.busUnbinds = [];

    this.drawInteriorBackground();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey("W"),
      A: this.input.keyboard!.addKey("A"),
      S: this.input.keyboard!.addKey("S"),
      D: this.input.keyboard!.addKey("D"),
    };

    const onChat = ({ text }: { text: string }) => this.room?.send("chat", { text });
    const onReport = ({ targetSessionId }: { targetSessionId: string }) =>
      this.room?.send("report", { targetSessionId });
    const onLeave = () => this.leaveToNeighborhood();
    bus.on(BusEvents.ChatSend, onChat);
    bus.on(BusEvents.ReportSend, onReport);
    bus.on(BusEvents.LeaveHouse, onLeave);
    this.busUnbinds.push(
      () => bus.off(BusEvents.ChatSend, onChat),
      () => bus.off(BusEvents.ReportSend, onReport),
      () => bus.off(BusEvents.LeaveHouse, onLeave)
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.busUnbinds.forEach((fn) => fn());
      this.room?.removeAllListeners();
    });

    this.connect();
  }

  private drawInteriorBackground() {
    const bg = this.add.graphics().setDepth(-10);
    bg.fillStyle(0xfff2df, 1);
    bg.fillRoundedRect(ROOM_AREA.x - 30, ROOM_AREA.y - 30, ROOM_AREA.width + 60, ROOM_AREA.height + 60, 24);
    bg.lineStyle(6, 0xe3c9a3, 1);
    bg.strokeRoundedRect(ROOM_AREA.x - 30, ROOM_AREA.y - 30, ROOM_AREA.width + 60, ROOM_AREA.height + 60, 24);

    this.add
      .text(this.scale.width / 2, 40, this.sceneData.houseName, {
        fontFamily: "system-ui",
        fontSize: "22px",
        color: "#3a2e2c",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100);
  }

  private async connect() {
    try {
      this.room = await joinHouse(this.sceneData.houseId, {
        name: this.sceneData.name,
        deviceId: this.sceneData.deviceId,
      });
    } catch {
      bus.emit(BusEvents.GameError, {
        message: "Bu eve şu an girilemedi. Mahalleye dönülüyor.",
      });
      this.leaveToNeighborhood();
      return;
    }

    bus.emit(BusEvents.ViewHouse, { houseId: this.sceneData.houseId, houseName: this.sceneData.houseName });

    const $ = getStateCallbacks(this.room);
    $(this.room.state).players.onAdd((player, sessionId) => {
      const isLocal = sessionId === this.room!.sessionId;
      const sprite = this.physics.add.sprite(player.x, player.y, "player").setDepth(player.y);
      sprite.setTint(tintForSessionId(sessionId));
      const nameLabel = this.add
        .text(player.x, player.y - 46, player.name, {
          fontFamily: "system-ui",
          fontSize: "12px",
          color: "#3a2e2c",
        })
        .setOrigin(0.5, 1)
        .setDepth(player.y + 1);

      this.avatars.set(sessionId, { sprite, nameLabel });

      if (isLocal) {
        this.localBody = sprite;
        sprite.setCollideWorldBounds(false);
      } else {
        $(player).onChange(() => {
          const entry = this.avatars.get(sessionId);
          if (!entry) return;
          this.tweens.add({ targets: [entry.sprite, entry.nameLabel], x: player.x, duration: 100 });
          this.tweens.add({ targets: entry.sprite, y: player.y, duration: 100 });
          this.tweens.add({ targets: entry.nameLabel, y: player.y - 46, duration: 100 });
          entry.sprite.setDepth(player.y);
        });
      }

      this.emitOccupants();
    });

    $(this.room.state).players.onRemove((_player, sessionId) => {
      const entry = this.avatars.get(sessionId);
      entry?.sprite.destroy();
      entry?.nameLabel.destroy();
      entry?.bubble?.destroy();
      this.avatars.delete(sessionId);
      this.emitOccupants();
    });

    this.room.onMessage("chat", (msg: { sessionId: string; name: string; text: string }) => {
      this.showBubble(msg.sessionId, msg.text);
    });

    this.room.onLeave(() => {
      this.avatars.forEach((entry) => {
        entry.sprite.destroy();
        entry.nameLabel.destroy();
        entry.bubble?.destroy();
      });
      this.avatars.clear();
    });
  }

  private emitOccupants() {
    if (!this.room) return;
    const occupants = Array.from(this.avatars.entries())
      .filter(([sessionId]) => sessionId !== this.room!.sessionId)
      .map(([sessionId, entry]) => ({ sessionId, name: entry.nameLabel.text }));
    bus.emit(BusEvents.OccupantsUpdate, { occupants });
  }

  private showBubble(sessionId: string, text: string) {
    const entry = this.avatars.get(sessionId);
    if (!entry) return;
    entry.bubble?.destroy();
    entry.bubbleTimer?.remove();

    const bubble = this.add
      .text(entry.sprite.x, entry.sprite.y - 66, text, {
        fontFamily: "system-ui",
        fontSize: "13px",
        color: "#3a2e2c",
        backgroundColor: "#fff7eaee",
        padding: { x: 8, y: 5 },
        wordWrap: { width: 170 },
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setDepth(9999);
    entry.bubble = bubble;
    entry.bubbleTimer = this.time.delayedCall(CHAT_BUBBLE_LIFETIME_MS, () => {
      this.tweens.add({
        targets: bubble,
        alpha: 0,
        duration: 400,
        onComplete: () => bubble.destroy(),
      });
    });
  }

  private leaveToNeighborhood() {
    this.room?.leave();
    this.scene.start("Neighborhood", {
      name: this.sceneData.name,
      deviceId: this.sceneData.deviceId,
      spawnX: this.sceneData.returnX,
      spawnY: this.sceneData.returnY,
    });
  }

  update(_time: number, delta: number) {
    if (!this.localBody) return;
    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;

    const vec = new Phaser.Math.Vector2(vx, vy);
    let dir = "down";
    if (vec.length() > 0) {
      vec.normalize();
      dir = Math.abs(vec.x) > Math.abs(vec.y) ? (vec.x > 0 ? "right" : "left") : vec.y > 0 ? "down" : "up";
    }

    const speed = 180 * (delta / 1000);
    const nextX = Phaser.Math.Clamp(this.localBody.x + vec.x * speed, ROOM_AREA.x, ROOM_AREA.x + ROOM_AREA.width);
    const nextY = Phaser.Math.Clamp(this.localBody.y + vec.y * speed, ROOM_AREA.y, ROOM_AREA.y + ROOM_AREA.height);
    this.localBody.setPosition(nextX, nextY);
    this.localBody.setDepth(nextY);

    const myEntry = this.room && this.avatars.get(this.room.sessionId);
    if (myEntry) myEntry.nameLabel.setPosition(nextX, nextY - 46);
    if (myEntry?.bubble) myEntry.bubble.setPosition(nextX, nextY - 66);

    const now = this.time.now;
    const moved = Phaser.Math.Distance.Between(nextX, nextY, this.lastSent.x, this.lastSent.y) > 2;
    if (this.room && moved && now - this.lastSentAt > MOVE_SEND_INTERVAL_MS) {
      this.room.send("move", { x: nextX, y: nextY, dir });
      this.lastSent = { x: nextX, y: nextY };
      this.lastSentAt = now;
    }
  }
}
