import * as Phaser from "phaser";
import type { MapDef, NpcDef } from "../data/maps/types";
import { PlayerActor } from "../entities/PlayerActor";
import { ensureCat, CAT_H } from "../render/cat";
import { bus, BusEvents } from "../net/bus";

/**
 * Ambient NPCs — cafe owner, old neighbor, street cat. Purely client-side
 * (never synced): they're atmosphere, so each client renders its own from
 * map data. Humans reuse PlayerActor; the cat has its own tiny sprite. They
 * wander gently near their anchor and, when clicked, cycle a friendly line
 * through the chat/bubble layer.
 */

interface ManagedNpc {
  def: NpcDef;
  human?: PlayerActor;
  cat?: Phaser.GameObjects.Sprite;
  catShadow?: Phaser.GameObjects.Ellipse;
  homeX: number;
  homeY: number;
  tx: number;
  ty: number;
  facing: string;
  moving: boolean;
  nextWanderAt: number;
  lineIndex: number;
  say: (actor: NpcSpeaker, text: string) => void;
}

interface NpcSpeaker {
  x: number;
  get bubbleAnchorY(): number;
}

export class NpcSystem {
  private scene: Phaser.Scene;
  private npcs: ManagedNpc[] = [];
  private sayFn: (actor: any, text: string) => void;

  constructor(scene: Phaser.Scene, map: MapDef, sayFn: (actor: any, text: string) => void) {
    this.scene = scene;
    this.sayFn = sayFn;
    for (const def of map.npcs) this.spawn(def);
  }

  private spawn(def: NpcDef) {
    const now = this.scene.time.now;
    if (def.kind === "cat") {
      const key = ensureCat(this.scene);
      const shadow = this.scene.add.ellipse(def.x, def.y + 2, 26, 9, 0x000000, 0.18).setDepth(def.y - 1);
      const sprite = this.scene.add.sprite(def.x, def.y - CAT_H / 2, key, "cat-0").setDepth(def.y);
      sprite.play("cat:idle");
      sprite.setInteractive({ useHandCursor: true });
      sprite.on(Phaser.Input.Events.POINTER_DOWN, () => this.interact(managed));
      const managed: ManagedNpc = {
        def,
        cat: sprite,
        catShadow: shadow,
        homeX: def.x,
        homeY: def.y,
        tx: def.x,
        ty: def.y,
        facing: "right",
        moving: false,
        nextWanderAt: now + 1000 + Math.random() * 2000,
        lineIndex: 0,
        say: this.sayFn,
      };
      this.npcs.push(managed);
      return;
    }

    const human = new PlayerActor(
      this.scene,
      { body: def.body ?? 0, palette: def.palette ?? 0, accessory: def.accessory ?? 0 },
      def.name,
      def.x,
      def.y,
      false,
      () => this.interact(managed)
    );
    const managed: ManagedNpc = {
      def,
      human,
      homeX: def.x,
      homeY: def.y,
      tx: def.x,
      ty: def.y,
      facing: "down",
      moving: false,
      nextWanderAt: now + 1500 + Math.random() * 2500,
      lineIndex: 0,
      say: this.sayFn,
    };
    this.npcs.push(managed);
  }

  private interact(npc: ManagedNpc) {
    const line = npc.def.lines[npc.lineIndex % npc.def.lines.length];
    npc.lineIndex++;
    const speaker: NpcSpeaker =
      npc.human ??
      ({ x: npc.cat!.x, get bubbleAnchorY() { return npc.cat!.y - CAT_H; } } as NpcSpeaker);
    this.sayFn(speaker, line);
    // Echo into the chat log too, tagged with the NPC name.
    bus.emit(BusEvents.ChatReceived, { name: npc.def.name, text: line, self: false });
  }

  update(time: number, delta: number) {
    for (const npc of this.npcs) {
      if (npc.def.wander <= 0) {
        npc.human?.setLocal(npc.homeX, npc.homeY, npc.facing, false, "");
        continue;
      }
      if (time >= npc.nextWanderAt) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * npc.def.wander;
        npc.tx = npc.homeX + Math.cos(angle) * r;
        npc.ty = npc.homeY + Math.sin(angle) * r;
        npc.nextWanderAt = time + 2000 + Math.random() * 3500;
      }
      const cx = npc.human ? npc.human.x : npc.cat!.x;
      const cy = npc.human ? npc.human.y : npc.cat!.y + CAT_H / 2;
      const dx = npc.tx - cx;
      const dy = npc.ty - cy;
      const dist = Math.hypot(dx, dy);
      npc.moving = dist > 3;
      if (npc.moving) {
        const speed = (npc.def.kind === "cat" ? 45 : 60) * (delta / 1000);
        const nx = cx + (dx / dist) * speed;
        const ny = cy + (dy / dist) * speed;
        npc.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
        if (npc.human) {
          npc.human.setLocal(nx, ny, npc.facing, true, "");
        } else {
          npc.cat!.x = nx;
          npc.cat!.y = ny - CAT_H / 2;
          npc.cat!.setDepth(ny);
          npc.cat!.setFlipX(npc.facing === "left");
          npc.catShadow!.setPosition(nx, ny + 2).setDepth(ny - 1);
          if (npc.cat!.anims.currentAnim?.key !== "cat:walk") npc.cat!.play("cat:walk");
        }
      } else if (npc.human) {
        npc.human.setLocal(cx, cy, npc.facing, false, "");
      } else if (npc.cat!.anims.currentAnim?.key !== "cat:idle") {
        npc.cat!.play("cat:idle");
      }
    }
  }

  destroy() {
    for (const npc of this.npcs) {
      npc.human?.destroy();
      npc.cat?.destroy();
      npc.catShadow?.destroy();
    }
    this.npcs = [];
  }
}
