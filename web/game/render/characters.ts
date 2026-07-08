import type Phaser from "phaser";
import { PALETTES, type AvatarRecipe } from "@/lib/avatar";

/**
 * Procedural chibi character renderer. For every avatar recipe
 * (body × palette × accessory) it lazily draws a full animation sheet into a
 * canvas texture — walk/idle in 3 facings (left mirrors right via flipX),
 * plus sit / dance / wave — and registers the matching Phaser animations.
 *
 * This is deliberately the ONLY module that knows how a character looks.
 * Replacing placeholder art with real illustrated spritesheets later means
 * reimplementing `ensureCharacter` to load frames instead of drawing them;
 * recipe indices and animation key names stay stable.
 */

export const FRAME_W = 48;
export const FRAME_H = 72;
const COLS = 6;
const ROWS = 5;

type Facing = "down" | "up" | "side";

interface FrameSpec {
  name: string;
  facing: Facing;
  /** -1..1 walk cycle phase; 0 = neutral stand. */
  leg: number;
  arm: number;
  /** Vertical body bob in px. */
  bob: number;
  pose: "stand" | "sit" | "dance" | "wave";
  /** Pose-specific sub-frame (dance sway side, wave arm angle…). */
  alt: number;
}

function stand(name: string, facing: Facing, leg: number, arm: number, bob: number): FrameSpec {
  return { name, facing, leg, arm, bob, pose: "stand", alt: 0 };
}

const FRAMES: FrameSpec[] = [
  // 4-frame walk cycles: contact / pass / contact / pass
  stand("walk-down-0", "down", 1, -1, 0),
  stand("walk-down-1", "down", 0, 0, -1.5),
  stand("walk-down-2", "down", -1, 1, 0),
  stand("walk-down-3", "down", 0, 0, -1.5),
  stand("walk-up-0", "up", 1, -1, 0),
  stand("walk-up-1", "up", 0, 0, -1.5),
  stand("walk-up-2", "up", -1, 1, 0),
  stand("walk-up-3", "up", 0, 0, -1.5),
  stand("walk-side-0", "side", 1, -1, 0),
  stand("walk-side-1", "side", 0, 0, -1.5),
  stand("walk-side-2", "side", -1, 1, 0),
  stand("walk-side-3", "side", 0, 0, -1.5),
  // 2-frame idle breathing
  stand("idle-down-0", "down", 0, 0, 0),
  stand("idle-down-1", "down", 0, 0, 1.2),
  stand("idle-up-0", "up", 0, 0, 0),
  stand("idle-up-1", "up", 0, 0, 1.2),
  stand("idle-side-0", "side", 0, 0, 0),
  stand("idle-side-1", "side", 0, 0, 1.2),
  { name: "sit-0", facing: "down", leg: 0, arm: 0, bob: 0, pose: "sit", alt: 0 },
  { name: "sit-1", facing: "down", leg: 0, arm: 0, bob: 1, pose: "sit", alt: 1 },
  { name: "dance-0", facing: "down", leg: 0, arm: 0, bob: -2, pose: "dance", alt: 0 },
  { name: "dance-1", facing: "down", leg: 0, arm: 0, bob: 0, pose: "dance", alt: 1 },
  { name: "dance-2", facing: "down", leg: 0, arm: 0, bob: -2, pose: "dance", alt: 2 },
  { name: "dance-3", facing: "down", leg: 0, arm: 0, bob: 0, pose: "dance", alt: 3 },
  { name: "wave-0", facing: "down", leg: 0, arm: 0, bob: 0, pose: "wave", alt: 0 },
  { name: "wave-1", facing: "down", leg: 0, arm: 0, bob: 0, pose: "wave", alt: 1 },
];

export function characterKey(recipe: AvatarRecipe): string {
  return `char-${recipe.body}-${recipe.palette}-${recipe.accessory}`;
}

export function animKey(texKey: string, anim: string): string {
  return `${texKey}:${anim}`;
}

/** Creates the texture + animations for a recipe if not already present. */
export function ensureCharacter(scene: Phaser.Scene, recipe: AvatarRecipe): string {
  const key = characterKey(recipe);
  if (scene.textures.exists(key)) return key;

  const tex = scene.textures.createCanvas(key, FRAME_W * COLS, FRAME_H * ROWS);
  if (!tex) return key;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = true;

  FRAMES.forEach((frame, i) => {
    const ox = (i % COLS) * FRAME_W;
    const oy = Math.floor(i / COLS) * FRAME_H;
    ctx.save();
    ctx.translate(ox, oy);
    drawFrame(ctx, recipe, frame);
    ctx.restore();
    tex.add(frame.name, 0, ox, oy, FRAME_W, FRAME_H);
  });
  tex.refresh();

  const mk = (anim: string, frames: string[], frameRate: number, repeat = -1) => {
    scene.anims.create({
      key: animKey(key, anim),
      frames: frames.map((f) => ({ key, frame: f })),
      frameRate,
      repeat,
    });
  };
  mk("walk-down", ["walk-down-0", "walk-down-1", "walk-down-2", "walk-down-3"], 9);
  mk("walk-up", ["walk-up-0", "walk-up-1", "walk-up-2", "walk-up-3"], 9);
  mk("walk-side", ["walk-side-0", "walk-side-1", "walk-side-2", "walk-side-3"], 9);
  mk("idle-down", ["idle-down-0", "idle-down-1"], 1.6);
  mk("idle-up", ["idle-up-0", "idle-up-1"], 1.6);
  mk("idle-side", ["idle-side-0", "idle-side-1"], 1.6);
  mk("sit", ["sit-0", "sit-1"], 1.2);
  mk("dance", ["dance-0", "dance-1", "dance-2", "dance-3"], 5);
  mk("wave", ["wave-0", "wave-1"], 4);
  return key;
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

const CX = FRAME_W / 2; // 24
const FEET_Y = 66;

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawFrame(ctx: CanvasRenderingContext2D, recipe: AvatarRecipe, f: FrameSpec) {
  const pal = PALETTES[recipe.palette] ?? PALETTES[0];
  const bodyStyle = recipe.body;
  const acc = recipe.accessory;

  const sitting = f.pose === "sit";
  const dancing = f.pose === "dance";
  const waving = f.pose === "wave";
  const bob = f.bob + (sitting ? 8 : 0);
  const sway = dancing ? (f.alt % 2 === 0 ? -2 : 2) : 0;

  // Torso metrics per body style.
  const torsoW = bodyStyle === 2 ? 28 : bodyStyle === 1 ? 20 : 24;
  const torsoH = bodyStyle === 1 ? 25 : 22;
  const torsoTop = 34 + bob;
  const headR = 13;
  const headCY = 22 + bob + (sitting ? 1 : 0);
  const headCX = CX + sway;

  // --- legs (skip when sitting: drawn as stubs in front) ---
  ctx.fillStyle = pal.outfitShade;
  if (sitting) {
    rr(ctx, CX - 10, torsoTop + torsoH - 4, 8, 8, 3);
    ctx.fill();
    rr(ctx, CX + 2, torsoTop + torsoH - 4, 8, 8, 3);
    ctx.fill();
  } else {
    const lift = 3 * f.leg;
    const legW = 7;
    if (f.facing === "side") {
      rr(ctx, CX - 8 + 3 * f.leg, torsoTop + torsoH - 3, legW, FEET_Y - (torsoTop + torsoH) + 3 - Math.max(0, lift), 3);
      ctx.fill();
      rr(ctx, CX + 1 - 3 * f.leg, torsoTop + torsoH - 3, legW, FEET_Y - (torsoTop + torsoH) + 3 - Math.max(0, -lift), 3);
      ctx.fill();
    } else {
      rr(ctx, CX - 9, torsoTop + torsoH - 3, legW, FEET_Y - (torsoTop + torsoH) + 3 - Math.max(0, lift), 3);
      ctx.fill();
      rr(ctx, CX + 2, torsoTop + torsoH - 3, legW, FEET_Y - (torsoTop + torsoH) + 3 - Math.max(0, -lift), 3);
      ctx.fill();
    }
  }

  // --- backpack (behind torso for down/side) ---
  if (acc === 3 && f.facing !== "up") {
    ctx.fillStyle = pal.accent;
    if (f.facing === "side") {
      rr(ctx, CX - torsoW / 2 - 7, torsoTop + 2, 9, 16, 4);
      ctx.fill();
    }
  }

  // --- torso ---
  ctx.fillStyle = pal.outfit;
  if (bodyStyle === 2) {
    ctx.beginPath();
    ctx.ellipse(CX + sway * 0.5, torsoTop + torsoH / 2, torsoW / 2, torsoH / 2 + 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    rr(ctx, CX - torsoW / 2 + sway * 0.5, torsoTop, torsoW, torsoH, bodyStyle === 0 ? 8 : 6);
    ctx.fill();
  }
  // Style details
  ctx.strokeStyle = pal.outfitShade;
  ctx.lineWidth = 2;
  if (bodyStyle === 0 && f.facing === "down") {
    // hoodie pocket + drawstrings
    ctx.beginPath();
    ctx.moveTo(CX - 7, torsoTop + 13);
    ctx.lineTo(CX + 7, torsoTop + 13);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CX - 3, torsoTop + 2);
    ctx.lineTo(CX - 3, torsoTop + 7);
    ctx.moveTo(CX + 3, torsoTop + 2);
    ctx.lineTo(CX + 3, torsoTop + 7);
    ctx.stroke();
  } else if (bodyStyle === 1 && f.facing === "down") {
    // jacket zip
    ctx.beginPath();
    ctx.moveTo(CX, torsoTop + 2);
    ctx.lineTo(CX, torsoTop + torsoH - 3);
    ctx.stroke();
  }

  // --- arms ---
  ctx.fillStyle = pal.outfit;
  ctx.strokeStyle = pal.outfitShade;
  const shoulderY = torsoTop + 4;
  const armLen = 13;
  const drawArm = (side: -1 | 1, angleDeg: number) => {
    const a = (angleDeg * Math.PI) / 180;
    const sx = CX + side * (torsoW / 2 - 1) + sway * 0.5;
    ctx.save();
    ctx.translate(sx, shoulderY);
    ctx.rotate(side * a);
    rr(ctx, -3, 0, 6, armLen, 3);
    ctx.fill();
    // hand
    ctx.fillStyle = pal.skin;
    ctx.beginPath();
    ctx.arc(0, armLen, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.outfit;
    ctx.restore();
  };
  if (sitting) {
    drawArm(-1, 8);
    drawArm(1, 8);
  } else if (dancing) {
    // arms up, alternating
    const up = f.alt % 2 === 0;
    drawArm(-1, up ? 150 : 120);
    drawArm(1, up ? 120 : 150);
  } else if (waving) {
    drawArm(-1, 6);
    drawArm(1, f.alt === 0 ? 140 : 165);
  } else if (f.facing === "side") {
    drawArm(1, 10 + 25 * f.arm);
  } else {
    drawArm(-1, 8 + 20 * f.arm);
    drawArm(1, 8 - 20 * f.arm);
  }

  // --- scarf (over torso, under head) ---
  if (acc === 4) {
    ctx.fillStyle = pal.accent;
    rr(ctx, CX - 9 + sway, torsoTop - 3, 18, 7, 3);
    ctx.fill();
    if (f.facing !== "up") {
      rr(ctx, CX + (f.facing === "side" ? -2 : 2) + sway, torsoTop + 3, 6, 12, 3);
      ctx.fill();
    }
  }

  // --- head ---
  ctx.fillStyle = pal.skin;
  ctx.beginPath();
  ctx.arc(headCX, headCY, headR, 0, Math.PI * 2);
  ctx.fill();

  // hair
  ctx.fillStyle = pal.hair;
  if (f.facing === "up") {
    // full back of head
    ctx.beginPath();
    ctx.arc(headCX, headCY, headR, 0, Math.PI * 2);
    ctx.fill();
  } else if (f.facing === "side") {
    ctx.beginPath();
    ctx.arc(headCX, headCY, headR, Math.PI * 0.75, Math.PI * 2.05);
    ctx.lineTo(headCX, headCY);
    ctx.closePath();
    ctx.fill();
    // sideburn
    rr(ctx, headCX - headR, headCY - 4, 5, 9, 2);
    ctx.fill();
  } else {
    // fringe cap
    ctx.beginPath();
    ctx.arc(headCX, headCY, headR, Math.PI * 0.95, Math.PI * 2.05);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headCX, headCY - 6, headR - 1, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // face
  if (f.facing !== "up") {
    ctx.fillStyle = "#2c2430";
    const blink = f.pose === "sit" && f.alt === 1;
    const eyeY = headCY + 2;
    if (f.facing === "side") {
      if (blink) {
        ctx.fillRect(headCX + 5, eyeY, 4, 1.5);
      } else {
        ctx.beginPath();
        ctx.arc(headCX + 6, eyeY, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      if (blink) {
        ctx.fillRect(headCX - 6.5, eyeY, 4, 1.5);
        ctx.fillRect(headCX + 2.5, eyeY, 4, 1.5);
      } else {
        ctx.beginPath();
        ctx.arc(headCX - 4.5, eyeY, 1.8, 0, Math.PI * 2);
        ctx.arc(headCX + 4.5, eyeY, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      // blush
      ctx.fillStyle = "rgba(240,130,120,0.35)";
      ctx.beginPath();
      ctx.ellipse(headCX - 7.5, eyeY + 4, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.ellipse(headCX + 7.5, eyeY + 4, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // tiny smile
      ctx.strokeStyle = "#2c2430";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(headCX, eyeY + 4.5, 2.6, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
    }
  }

  // --- accessories on the head ---
  if (acc === 1) {
    // headphones: band + cups
    ctx.strokeStyle = "#3a3440";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(headCX, headCY - 2, headR + 1, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    ctx.fillStyle = "#3a3440";
    if (f.facing === "side") {
      rr(ctx, headCX - 2, headCY - 4, 7, 10, 3);
      ctx.fill();
    } else {
      rr(ctx, headCX - headR - 3, headCY - 4, 6, 9, 3);
      ctx.fill();
      rr(ctx, headCX + headR - 3, headCY - 4, 6, 9, 3);
      ctx.fill();
    }
  } else if (acc === 2) {
    // beanie
    ctx.fillStyle = pal.accent;
    ctx.beginPath();
    ctx.arc(headCX, headCY - 3, headR, Math.PI, Math.PI * 2);
    ctx.fill();
    rr(ctx, headCX - headR, headCY - 6, headR * 2, 5, 2);
    ctx.fill();
  }

  // backpack straps for down view (over torso)
  if (acc === 3 && f.facing === "down") {
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CX - 7, torsoTop + 1);
    ctx.lineTo(CX - 7, torsoTop + 12);
    ctx.moveTo(CX + 7, torsoTop + 1);
    ctx.lineTo(CX + 7, torsoTop + 12);
    ctx.stroke();
  } else if (acc === 3 && f.facing === "up") {
    ctx.fillStyle = pal.accent;
    rr(ctx, CX - 9, torsoTop + 2, 18, 16, 5);
    ctx.fill();
    ctx.strokeStyle = pal.outfitShade;
    ctx.lineWidth = 1.5;
    rr(ctx, CX - 6, torsoTop + 6, 12, 7, 3);
    ctx.stroke();
  }
}

/**
 * Draws a single preview frame (idle-down) onto a raw canvas — used by the
 * React intro screen so the picker shows exactly what spawns in the world.
 */
export function drawAvatarPreview(canvas: HTMLCanvasElement, recipe: AvatarRecipe) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  const scale = Math.min(canvas.width / FRAME_W, canvas.height / FRAME_H);
  ctx.translate((canvas.width - FRAME_W * scale) / 2, (canvas.height - FRAME_H * scale) / 2);
  ctx.scale(scale, scale);
  drawFrame(ctx, recipe, { name: "preview", facing: "down", leg: 0, arm: 0, bob: 0, pose: "stand", alt: 0 });
  ctx.restore();
}
