import * as Phaser from "phaser";
import type { PropType, ThemeId } from "../data/maps/types";

/**
 * Procedural prop textures (trees, lamps, benches, café tables…). Each
 * (type, theme, variant) combination is generated once via Graphics →
 * generateTexture and reused by every sprite that needs it — placing fifty
 * trees costs one texture. All sprites are bottom-anchored (origin 0.5, 1)
 * and depth-sorted by their baseline y, same as characters.
 */

export interface PropSpec {
  key: string;
  /** Collision box (centered on x, up from the baseline). 0 = walk-through. */
  collideW: number;
  collideH: number;
  /** Where a player snaps when sitting on this prop (relative to baseline). */
  seatOffsetY?: number;
}

type G = Phaser.GameObjects.Graphics;

export function ensureProp(scene: Phaser.Scene, type: PropType, theme: ThemeId, variant = 0): PropSpec {
  const key = `prop-${type}-${theme}-${variant}`;
  const spec = SPECS[type];
  if (!scene.textures.exists(key)) {
    const g = scene.add.graphics();
    DRAWERS[type](g, theme, variant);
    g.generateTexture(key, spec.w, spec.h);
    g.destroy();
  }
  return { key, collideW: spec.collideW, collideH: spec.collideH, seatOffsetY: spec.seatOffsetY };
}

interface SizeSpec {
  w: number;
  h: number;
  collideW: number;
  collideH: number;
  seatOffsetY?: number;
}

const SPECS: Record<PropType, SizeSpec> = {
  tree: { w: 96, h: 128, collideW: 24, collideH: 16 },
  pine: { w: 80, h: 128, collideW: 24, collideH: 16 },
  lamp: { w: 48, h: 112, collideW: 10, collideH: 10 },
  neonlamp: { w: 48, h: 112, collideW: 10, collideH: 10 },
  bench: { w: 80, h: 48, collideW: 72, collideH: 18, seatOffsetY: -26 },
  bush: { w: 64, h: 44, collideW: 52, collideH: 18 },
  flowerbed: { w: 80, h: 40, collideW: 72, collideH: 22 },
  snowman: { w: 56, h: 76, collideW: 30, collideH: 16 },
  puddle: { w: 88, h: 36, collideW: 0, collideH: 0 },
  vending: { w: 56, h: 88, collideW: 48, collideH: 20 },
  umbrella: { w: 104, h: 120, collideW: 12, collideH: 10 },
  table: { w: 88, h: 72, collideW: 60, collideH: 30, seatOffsetY: -20 },
  counter: { w: 200, h: 84, collideW: 192, collideH: 40 },
  arcadecab: { w: 56, h: 92, collideW: 48, collideH: 24 },
  sofa: { w: 112, h: 64, collideW: 100, collideH: 26, seatOffsetY: -30 },
  rug: { w: 160, h: 96, collideW: 0, collideH: 0 },
  plant: { w: 40, h: 64, collideW: 24, collideH: 14 },
  bookshelf: { w: 96, h: 110, collideW: 90, collideH: 24 },
  bed: { w: 88, h: 120, collideW: 80, collideH: 90 },
  fireplace: { w: 96, h: 100, collideW: 90, collideH: 28 },
  acunit: { w: 72, h: 60, collideW: 64, collideH: 30 },
  stringlights: { w: 220, h: 48, collideW: 0, collideH: 0 },
};

const DRAWERS: Record<PropType, (g: G, theme: ThemeId, variant: number) => void> = {
  tree(g, theme, variant) {
    // trunk
    g.fillStyle(0x6b4a3a);
    g.fillRoundedRect(42, 84, 12, 40, 4);
    // canopy: three blobs; sunset gets warm autumn tint on variant 1
    const leaf = theme === "neon" ? 0x3d6b5e : variant === 1 ? 0xc98a4b : 0x6f9c76;
    const leafHi = theme === "neon" ? 0x549e83 : variant === 1 ? 0xe0a45e : 0x8ab88f;
    g.fillStyle(leaf);
    g.fillCircle(48, 46, 34);
    g.fillCircle(24, 62, 24);
    g.fillCircle(72, 62, 24);
    g.fillStyle(leafHi, 0.6);
    g.fillCircle(38, 40, 16);
    g.fillCircle(62, 52, 12);
  },
  pine(g, _theme, variant) {
    g.fillStyle(0x5a4032);
    g.fillRoundedRect(35, 96, 10, 28, 3);
    const green = 0x4a7860;
    g.fillStyle(green);
    g.fillTriangle(40, 8, 12, 60, 68, 60);
    g.fillTriangle(40, 34, 6, 92, 74, 92);
    g.fillTriangle(40, 62, 2, 112, 78, 112);
    if (variant === 1) {
      // snow caps
      g.fillStyle(0xf4f6fb, 0.9);
      g.fillTriangle(40, 8, 26, 36, 54, 36);
      g.fillEllipse(40, 60, 44, 10);
      g.fillEllipse(40, 92, 56, 10);
    }
  },
  lamp(g, _theme, _v) {
    g.fillStyle(0x4a4552);
    g.fillRoundedRect(21, 24, 6, 84, 3);
    g.fillRoundedRect(14, 104, 20, 8, 3);
    // warm head
    g.fillStyle(0x3a3440);
    g.fillRoundedRect(12, 8, 24, 20, 6);
    g.fillStyle(0xffe3a0);
    g.fillRoundedRect(16, 12, 16, 12, 4);
  },
  neonlamp(g, theme, _v) {
    g.fillStyle(0x2e3038);
    g.fillRoundedRect(21, 20, 6, 88, 3);
    g.fillRoundedRect(14, 104, 20, 8, 3);
    const c = theme === "neon" ? 0x6bf0ff : 0xb7c7ff;
    g.fillStyle(c, 0.95);
    g.fillRoundedRect(10, 8, 28, 8, 4);
    g.fillStyle(c, 0.28);
    g.fillCircle(24, 12, 18);
  },
  bench(g, theme, _v) {
    const wood = theme === "snow" ? 0x7a5d4a : 0x8a6a50;
    const woodHi = theme === "snow" ? 0x8f715c : 0xa07f61;
    g.fillStyle(0x4a4552);
    g.fillRoundedRect(6, 30, 8, 16, 2);
    g.fillRoundedRect(66, 30, 8, 16, 2);
    g.fillStyle(wood);
    g.fillRoundedRect(2, 20, 76, 12, 4); // seat
    g.fillStyle(woodHi);
    g.fillRoundedRect(2, 6, 76, 10, 4); // back
    if (theme === "snow") {
      g.fillStyle(0xf4f6fb, 0.9);
      g.fillRoundedRect(2, 4, 76, 5, 3);
    }
  },
  bush(g, theme, _v) {
    const c = theme === "neon" ? 0x3d6b5e : 0x76a67c;
    g.fillStyle(c);
    g.fillCircle(20, 28, 16);
    g.fillCircle(42, 24, 19);
    g.fillCircle(54, 32, 11);
    g.fillStyle(0xffffff, theme === "snow" ? 0.7 : 0);
    if (theme === "snow") {
      g.fillEllipse(32, 16, 44, 12);
    }
  },
  flowerbed(g, _theme, variant) {
    g.fillStyle(0x7a5a42);
    g.fillRoundedRect(0, 14, 80, 24, 8);
    g.fillStyle(0x5f8a5c);
    g.fillRoundedRect(4, 12, 72, 18, 8);
    const colors = variant === 1 ? [0xe8a0b4, 0xfff0c8] : [0xd9756b, 0xf3d05e];
    for (let i = 0; i < 8; i++) {
      g.fillStyle(colors[i % 2]);
      g.fillCircle(10 + i * 8.5, 14 + (i % 3) * 5, 4);
    }
  },
  snowman(g, _theme, _v) {
    g.fillStyle(0xf4f6fb);
    g.fillCircle(28, 58, 17);
    g.fillCircle(28, 34, 13);
    g.fillStyle(0x2c2430);
    g.fillCircle(24, 31, 1.8);
    g.fillCircle(32, 31, 1.8);
    g.fillStyle(0xe08a3c);
    g.fillTriangle(28, 35, 28, 39, 38, 37);
    // scarf + twig arms
    g.fillStyle(0xc96f5b);
    g.fillRoundedRect(19, 43, 18, 6, 3);
    g.lineStyle(3, 0x6b4a3a);
    g.lineBetween(12, 50, 0, 40);
    g.lineBetween(44, 50, 56, 40);
  },
  puddle(g, theme, _v) {
    const c = theme === "neon" ? 0x2a3550 : 0x4d6a80;
    g.fillStyle(c, 0.55);
    g.fillEllipse(44, 18, 84, 28);
    g.fillStyle(0xbdd7e8, 0.35);
    g.fillEllipse(38, 14, 40, 10);
  },
  vending(g, theme, _v) {
    const body = theme === "neon" ? 0x8a3d6e : 0xc0554a;
    g.fillStyle(0x2e3038);
    g.fillRoundedRect(2, 80, 52, 8, 2);
    g.fillStyle(body);
    g.fillRoundedRect(4, 4, 48, 80, 6);
    g.fillStyle(0xbfe8f5, 0.95);
    g.fillRoundedRect(9, 10, 26, 44, 4);
    // little cans
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 2; c++) {
        g.fillStyle([0xf3d05e, 0x7fa8d9, 0xe8a0b4][r]);
        g.fillRoundedRect(12 + c * 12, 14 + r * 13, 8, 10, 2);
      }
    g.fillStyle(0x3a3440);
    g.fillRoundedRect(40, 12, 9, 30, 2);
    g.fillRoundedRect(9, 60, 38, 14, 3);
  },
  umbrella(g, theme, variant) {
    g.fillStyle(0x4a4552);
    g.fillRoundedRect(49, 30, 6, 88, 3);
    const cols = theme === "neon" ? [0x6bf0ff, 0x2e3038] : variant === 1 ? [0xe8a0b4, 0xfff2f5] : [0xd9756b, 0xf3e6c2];
    for (let i = 0; i < 6; i++) {
      g.fillStyle(cols[i % 2]);
      const a0 = Math.PI + (i * Math.PI) / 6;
      g.slice(52, 34, 48, a0, a0 + Math.PI / 6, false);
      g.fillPath();
    }
    g.fillStyle(cols[0]);
    g.fillCircle(52, 30, 4);
  },
  table(g, _theme, _v) {
    // two stools + round table, top-down-ish front view
    g.fillStyle(0x8a6a50);
    g.fillEllipse(16, 52, 22, 12);
    g.fillEllipse(72, 52, 22, 12);
    g.fillStyle(0x5f5346);
    g.fillRoundedRect(40, 34, 8, 32, 3);
    g.fillStyle(0xa07f61);
    g.fillEllipse(44, 30, 66, 26);
    g.fillStyle(0xb8977a);
    g.fillEllipse(44, 27, 58, 20);
    // little cup
    g.fillStyle(0xfff7ea);
    g.fillRoundedRect(38, 18, 10, 8, 2);
  },
  counter(g, theme, _v) {
    const front = theme === "interior" ? 0x8a6a50 : 0x8a6a50;
    g.fillStyle(front);
    g.fillRoundedRect(0, 24, 200, 56, 6);
    g.fillStyle(0xa07f61);
    g.fillRect(0, 24, 200, 10);
    g.fillStyle(0xb8977a);
    g.fillRoundedRect(0, 12, 200, 16, 6);
    // espresso machine + cups
    g.fillStyle(0x4a4552);
    g.fillRoundedRect(20, 0, 36, 18, 4);
    g.fillStyle(0xfff7ea);
    g.fillRoundedRect(70, 6, 10, 8, 2);
    g.fillRoundedRect(86, 6, 10, 8, 2);
    g.fillStyle(0xd9756b);
    g.fillRoundedRect(150, 2, 26, 14, 3); // cake box
  },
  arcadecab(g, _theme, variant) {
    const body = [0x5d4a8a, 0x8a3d6e, 0x2e6b7a][variant % 3];
    g.fillStyle(body);
    g.fillRoundedRect(4, 8, 48, 80, 6);
    g.fillStyle(0x1c1a24);
    g.fillRoundedRect(10, 16, 36, 26, 4);
    const glow = [0x6bf0ff, 0xffd166, 0x9dff6b][variant % 3];
    g.fillStyle(glow, 0.9);
    g.fillRoundedRect(13, 19, 30, 20, 3);
    g.fillStyle(0x3a3440);
    g.fillRoundedRect(10, 48, 36, 12, 3);
    g.fillStyle(0xff6b8f);
    g.fillCircle(20, 54, 3.5);
    g.fillStyle(0x6bf0ff);
    g.fillCircle(32, 54, 3.5);
  },
  sofa(g, _theme, variant) {
    const c = variant === 1 ? 0x5d8aa8 : 0xa8705f;
    const hi = variant === 1 ? 0x729cb8 : 0xb8846f;
    g.fillStyle(c);
    g.fillRoundedRect(0, 8, 112, 40, 10); // back
    g.fillStyle(hi);
    g.fillRoundedRect(6, 30, 100, 26, 8); // seat
    g.fillStyle(c);
    g.fillRoundedRect(0, 26, 14, 32, 6); // arms
    g.fillRoundedRect(98, 26, 14, 32, 6);
  },
  rug(g, _theme, variant) {
    const outer = variant === 1 ? 0x5d8aa8 : 0xc96f5b;
    const inner = variant === 1 ? 0xcfe8f0 : 0xf3e6c2;
    g.fillStyle(outer, 0.9);
    g.fillEllipse(80, 48, 160, 92);
    g.fillStyle(inner, 0.55);
    g.fillEllipse(80, 48, 118, 64);
    g.fillStyle(outer, 0.7);
    g.fillEllipse(80, 48, 70, 38);
  },
  plant(g, _theme, _v) {
    g.fillStyle(0xc96f5b);
    g.fillRoundedRect(12, 44, 16, 16, 4);
    g.fillStyle(0x5f8a5c);
    g.fillEllipse(20, 30, 12, 26);
    g.fillEllipse(10, 34, 10, 20);
    g.fillEllipse(30, 34, 10, 20);
  },
  bookshelf(g, _theme, _v) {
    g.fillStyle(0x6b5442);
    g.fillRoundedRect(0, 0, 96, 108, 4);
    for (let s = 0; s < 3; s++) {
      g.fillStyle(0x3a3028);
      g.fillRect(6, 10 + s * 32, 84, 24);
      let bx = 8;
      const cols = [0xd9756b, 0x7fa8d9, 0xf3d05e, 0x8ab88f, 0xa86f96];
      for (let b = 0; b < 9 && bx < 84; b++) {
        const bw = 6 + ((s * 7 + b * 3) % 5);
        g.fillStyle(cols[(s + b) % cols.length]);
        g.fillRect(bx, 12 + s * 32, bw, 20);
        bx += bw + 2;
      }
    }
  },
  bed(g, _theme, _v) {
    g.fillStyle(0x6b5442);
    g.fillRoundedRect(0, 6, 88, 110, 8);
    g.fillStyle(0x8d7bb8);
    g.fillRoundedRect(4, 34, 80, 78, 6); // blanket
    g.fillStyle(0xa793cc);
    g.fillRoundedRect(4, 34, 80, 16, 6);
    g.fillStyle(0xfff7ea);
    g.fillRoundedRect(14, 12, 60, 20, 8); // pillow
  },
  fireplace(g, _theme, _v) {
    g.fillStyle(0x7a6a5c);
    g.fillRoundedRect(0, 10, 96, 90, 4);
    g.fillStyle(0x4a4038);
    g.fillRoundedRect(14, 34, 68, 56, 4);
    // fire
    g.fillStyle(0xe08a3c);
    g.fillTriangle(48, 44, 30, 86, 66, 86);
    g.fillStyle(0xf3d05e);
    g.fillTriangle(48, 58, 38, 86, 58, 86);
    g.fillStyle(0x6b5442);
    g.fillRoundedRect(0, 0, 96, 12, 4); // mantle
  },
  acunit(g, _theme, _v) {
    g.fillStyle(0x9aa2ad);
    g.fillRoundedRect(4, 8, 64, 48, 6);
    g.fillStyle(0x6f7883);
    for (let i = 0; i < 4; i++) g.fillRect(10, 16 + i * 9, 52, 4);
    g.fillStyle(0x4a4552);
    g.fillCircle(56, 20, 6);
  },
  stringlights(g, theme, _v) {
    g.lineStyle(2, 0x3a3440, 0.8);
    g.beginPath();
    g.moveTo(0, 8);
    for (let x = 0; x <= 220; x += 10) {
      g.lineTo(x, 8 + Math.sin((x / 220) * Math.PI) * 14);
    }
    g.strokePath();
    const colors = theme === "neon" ? [0x6bf0ff, 0xff6b8f, 0x9dff6b] : [0xffd166, 0xffe9b0, 0xffb46b];
    for (let i = 0; i < 9; i++) {
      const x = 12 + i * 24;
      const y = 10 + Math.sin((x / 220) * Math.PI) * 14;
      g.fillStyle(colors[i % colors.length], 0.95);
      g.fillCircle(x, y + 5, 4);
      g.fillStyle(colors[i % colors.length], 0.3);
      g.fillCircle(x, y + 5, 8);
    }
  },
};
