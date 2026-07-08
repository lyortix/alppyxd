import * as Phaser from "phaser";
import type { PlayerActor } from "../entities/PlayerActor";
import { CHAT_BUBBLE_LIFETIME_MS, EMOTE_LIFETIME_MS } from "../config";

const EMOTE_EMOJI: Record<string, string> = {
  wave: "👋",
  heart: "❤️",
  laugh: "😂",
  star: "⭐",
  zzz: "💤",
  music: "🎵",
  surprise: "😮",
  sad: "😢",
};

interface ActiveBubble {
  actor: PlayerActor;
  container: Phaser.GameObjects.Container;
}

/**
 * Roblox-style overhead speech bubbles + emote pops. Bubbles follow their
 * actor, pop in, hold, then fade. One bubble per actor — a new message
 * replaces the old one immediately (fast chatter stays readable).
 */
export class BubbleSystem {
  private scene: Phaser.Scene;
  private bubbles = new Map<PlayerActor, ActiveBubble>();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  say(actor: PlayerActor, text: string) {
    this.bubbles.get(actor)?.container.destroy();
    this.bubbles.delete(actor);

    const label = this.scene.add
      .text(0, 0, text, {
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontSize: "13px",
        color: "#3a2e2c",
        wordWrap: { width: 170 },
        align: "center",
      })
      .setOrigin(0.5, 0.5);
    const w = Math.max(40, label.width + 20);
    const h = label.height + 14;
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xfff7ea, 0.96);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    bg.fillTriangle(-6, h / 2 - 1, 6, h / 2 - 1, 0, h / 2 + 8);
    bg.lineStyle(1.5, 0xd8c9b0, 0.8);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);

    const container = this.scene.add
      .container(actor.x, actor.bubbleAnchorY - h / 2, [bg, label])
      .setDepth(95000)
      .setScale(0.6)
      .setAlpha(0)
      .setData("h", h);
    this.scene.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      duration: 160,
      ease: "back.out",
    });
    this.scene.tweens.add({
      targets: container,
      alpha: 0,
      y: "-=10",
      delay: CHAT_BUBBLE_LIFETIME_MS,
      duration: 400,
      onComplete: () => {
        container.destroy();
        if (this.bubbles.get(actor)?.container === container) this.bubbles.delete(actor);
      },
    });

    this.bubbles.set(actor, { actor, container });
  }

  emote(actor: PlayerActor, emoteId: string) {
    const emoji = EMOTE_EMOJI[emoteId];
    if (!emoji) return;
    if (emoteId === "wave") actor.wave();
    const pop = this.scene.add
      .text(actor.x + 14, actor.bubbleAnchorY, emoji, { fontSize: "26px" })
      .setOrigin(0.5, 1)
      .setDepth(96000)
      .setScale(0.4)
      .setAlpha(0);
    this.scene.tweens.add({
      targets: pop,
      alpha: 1,
      scale: 1.15,
      y: "-=26",
      duration: 260,
      ease: "back.out",
    });
    this.scene.tweens.add({
      targets: pop,
      alpha: 0,
      y: "-=18",
      scale: 0.9,
      delay: EMOTE_LIFETIME_MS,
      duration: 300,
      onComplete: () => pop.destroy(),
    });
  }

  /** Keeps live bubbles glued above their (possibly moving) actor. */
  update() {
    for (const [actor, bubble] of this.bubbles) {
      if (!bubble.container.active) {
        this.bubbles.delete(actor);
        continue;
      }
      bubble.container.x = actor.x;
      // Leave y to the fade tween once fading; while alive, track the actor.
      if (bubble.container.alpha >= 0.99) {
        bubble.container.y = actor.bubbleAnchorY - (bubble.container.getData("h") as number) / 2;
      }
    }
  }

  destroy() {
    this.bubbles.forEach((b) => b.container.destroy());
    this.bubbles.clear();
  }
}
