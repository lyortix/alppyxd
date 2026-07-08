import * as Phaser from "phaser";
import { ensureCharacter, animKey, FRAME_W, FRAME_H } from "../render/characters";
import type { AvatarRecipe } from "@/lib/avatar";
import { REMOTE_LERP } from "../config";

export interface ActorState {
  x: number;
  y: number;
  dir: string; // down | up | left | right
  moving: boolean;
  action: string; // "" | sit | dance
}

/**
 * One character in the world — local player, remote player or human NPC.
 * Owns the sprite, soft shadow and name label, picks animations from the
 * synced state, and (for remote actors) lerps toward the server position.
 * Speech bubbles and emote pops attach above `labelY` (see systems/bubbles).
 */
export class PlayerActor {
  readonly container: Phaser.GameObjects.Container;
  readonly sprite: Phaser.GameObjects.Sprite;
  private readonly label: Phaser.GameObjects.Text;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly texKey: string;
  private readonly scene: Phaser.Scene;

  /** Server-authoritative target (remote actors lerp toward it). */
  targetX = 0;
  targetY = 0;
  dir = "down";
  moving = false;
  action = "";
  private waveUntil = 0;

  constructor(
    scene: Phaser.Scene,
    recipe: AvatarRecipe,
    name: string,
    x: number,
    y: number,
    isSelf: boolean,
    onClick?: () => void
  ) {
    this.scene = scene;
    this.texKey = ensureCharacter(scene, recipe);
    this.targetX = x;
    this.targetY = y;

    this.shadow = scene.add.ellipse(0, 2, 30, 12, 0x000000, 0.18);
    this.sprite = scene.add.sprite(0, -FRAME_H / 2 + 6, this.texKey, "idle-down-0");
    this.label = scene.add
      .text(0, -FRAME_H + 2, name, {
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontSize: "13px",
        color: isSelf ? "#ffe9b0" : "#ffffff",
        stroke: "#1c1a24",
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1);

    this.container = scene.add.container(x, y, [this.shadow, this.sprite, this.label]);
    this.container.setDepth(y);
    if (onClick) {
      this.sprite.setInteractive({ useHandCursor: true });
      this.sprite.on(Phaser.Input.Events.POINTER_DOWN, onClick);
    }
    this.playCurrent();
  }

  /** World-space y where overhead UI (bubbles, emotes) should anchor. */
  get bubbleAnchorY(): number {
    return this.container.y - FRAME_H - 6;
  }

  get x() {
    return this.container.x;
  }
  get y() {
    return this.container.y;
  }

  setName(name: string) {
    this.label.setText(name);
  }

  /** Applies a fresh server snapshot (remote actors). */
  applyState(state: ActorState) {
    this.targetX = state.x;
    this.targetY = state.y;
    this.dir = state.dir;
    this.moving = state.moving;
    this.action = state.action;
    this.playCurrent();
  }

  /** For the locally-controlled actor: state is set directly each frame. */
  setLocal(x: number, y: number, dir: string, moving: boolean, action: string) {
    this.container.x = x;
    this.container.y = y;
    this.container.setDepth(y);
    this.dir = dir;
    this.moving = moving;
    this.action = action;
    this.playCurrent();
  }

  /** One-shot wave overlay (from an emote broadcast). */
  wave() {
    this.waveUntil = this.scene.time.now + 900;
    this.playCurrent(true);
    this.scene.time.delayedCall(950, () => {
      if (this.sprite.active) this.playCurrent();
    });
  }

  /** Per-frame update for remote actors: lerp toward the server target. */
  updateRemote() {
    const dx = this.targetX - this.container.x;
    const dy = this.targetY - this.container.y;
    // Snap when far (teleport/join), lerp when near.
    if (Math.abs(dx) > 300 || Math.abs(dy) > 300) {
      this.container.x = this.targetX;
      this.container.y = this.targetY;
    } else {
      this.container.x += dx * REMOTE_LERP;
      this.container.y += dy * REMOTE_LERP;
    }
    this.container.setDepth(this.container.y);
    // Treat residual distance as motion so walk anims don't stutter between packets.
    const actuallyMoving = this.moving || Math.hypot(dx, dy) > 2;
    if (actuallyMoving !== this.moving) {
      this.playAnim(actuallyMoving && !this.action ? "walk" : undefined);
    }
  }

  private playCurrent(forceWave = false) {
    if (forceWave || this.scene.time.now < this.waveUntil) {
      this.play(animKey(this.texKey, "wave"));
      this.sprite.setFlipX(false);
      return;
    }
    if (this.action === "sit") {
      this.play(animKey(this.texKey, "sit"));
      this.sprite.setFlipX(false);
      return;
    }
    if (this.action === "dance") {
      this.play(animKey(this.texKey, "dance"));
      this.sprite.setFlipX(false);
      return;
    }
    this.playAnim(this.moving ? "walk" : "idle");
  }

  private playAnim(kind?: "walk" | "idle") {
    if (!kind) {
      this.playCurrent();
      return;
    }
    const facing = this.dir === "left" || this.dir === "right" ? "side" : this.dir;
    this.sprite.setFlipX(this.dir === "left");
    this.play(animKey(this.texKey, `${kind}-${facing}`));
  }

  private play(key: string) {
    if (this.sprite.anims.currentAnim?.key !== key || !this.sprite.anims.isPlaying) {
      this.sprite.play(key, true);
    }
  }

  destroy() {
    this.container.destroy();
  }
}
