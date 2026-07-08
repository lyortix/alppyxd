import * as Phaser from "phaser";

/**
 * The street cat — a tiny procedural companion with an idle tail-flick and a
 * slow pad-walk. One shared texture + two animations. Bottom-anchored like
 * every other actor.
 */

export const CAT_W = 40;
export const CAT_H = 32;
const FRAMES = 4;

export function ensureCat(scene: Phaser.Scene): string {
  const key = "npc-cat";
  if (scene.textures.exists(key)) return key;

  const tex = scene.textures.createCanvas(key, CAT_W * FRAMES, CAT_H);
  if (!tex) return key;
  const ctx = tex.getContext();
  for (let i = 0; i < FRAMES; i++) {
    ctx.save();
    ctx.translate(i * CAT_W, 0);
    drawCat(ctx, i);
    ctx.restore();
    tex.add(`cat-${i}`, 0, i * CAT_W, 0, CAT_W, CAT_H);
  }
  tex.refresh();

  scene.anims.create({
    key: "cat:idle",
    frames: [
      { key, frame: "cat-0" },
      { key, frame: "cat-1" },
    ],
    frameRate: 2,
    repeat: -1,
  });
  scene.anims.create({
    key: "cat:walk",
    frames: [
      { key, frame: "cat-2" },
      { key, frame: "cat-3" },
    ],
    frameRate: 5,
    repeat: -1,
  });
  return key;
}

function drawCat(ctx: CanvasRenderingContext2D, frame: number) {
  const body = "#4a4552";
  const dark = "#3a3540";
  const belly = "#6b6478";
  const walking = frame >= 2;
  const step = frame === 3 ? 2 : 0;
  const tail = frame === 1 ? -6 : 0;

  // tail
  ctx.strokeStyle = body;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(8, 22);
  ctx.quadraticCurveTo(2, 16 + tail, 6, 8 + tail);
  ctx.stroke();

  // body
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(22, 22, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(22, 26, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs
  ctx.fillStyle = dark;
  ctx.fillRect(16 + (walking ? step : 0), 27, 3, 5);
  ctx.fillRect(26 - (walking ? step : 0), 27, 3, 5);

  // head
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(32, 18, 8, 0, Math.PI * 2);
  ctx.fill();
  // ears
  ctx.beginPath();
  ctx.moveTo(27, 12);
  ctx.lineTo(29, 5);
  ctx.lineTo(32, 12);
  ctx.moveTo(33, 12);
  ctx.lineTo(36, 5);
  ctx.lineTo(38, 12);
  ctx.fill();
  // eyes
  ctx.fillStyle = "#9dff6b";
  ctx.beginPath();
  ctx.arc(30, 18, 1.6, 0, Math.PI * 2);
  ctx.arc(35, 18, 1.6, 0, Math.PI * 2);
  ctx.fill();
  // nose
  ctx.fillStyle = "#e8a0b4";
  ctx.beginPath();
  ctx.arc(32.5, 21, 1, 0, Math.PI * 2);
  ctx.fill();
}
