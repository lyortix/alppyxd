import * as Phaser from "phaser";
import type { BuildingDef, ThemeId } from "../data/maps/types";

/**
 * Procedural building textures. Bottom-anchored like props: `y` in a
 * BuildingDef is the wall baseline where the door meets the ground. Each
 * (type, theme, variant, size) is generated once and cached.
 */

const ROOF_H = 56;

export interface BuildingSpec {
  key: string;
  texW: number;
  texH: number;
  /** Door rectangle relative to the building center/baseline. */
  door: { x: number; w: number; h: number };
}

interface ThemeColors {
  wallA: number;
  wallB: number;
  roofA: number;
  roofB: number;
  trim: number;
  window: number;
  windowLit: number;
  door: number;
}

const THEME_COLORS: Record<ThemeId, ThemeColors> = {
  sunset: {
    wallA: 0xf3e3d3, wallB: 0xe8c9a8, roofA: 0xd97b6c, roofB: 0x7fa7a3,
    trim: 0xb8977a, window: 0x8fb6c9, windowLit: 0xffe9a8, door: 0x8a5a42,
  },
  rainy: {
    wallA: 0x9aa5b5, wallB: 0x7d8a9d, roofA: 0x5a6478, roofB: 0x6d7890,
    trim: 0x525c6e, window: 0x3d4657, windowLit: 0xffd98c, door: 0x465061,
  },
  snow: {
    wallA: 0xa8846a, wallB: 0x8f7158, roofA: 0xf4f6fb, roofB: 0xe4e9f2,
    trim: 0x6b5442, window: 0x5d7285, windowLit: 0xffce7a, door: 0x5f4636,
  },
  neon: {
    wallA: 0x3a3d4d, wallB: 0x2e3038, roofA: 0x252733, roofB: 0x2b2d3a,
    trim: 0x6bf0ff, window: 0x1c1e28, windowLit: 0xff6b8f, door: 0x22242e,
  },
  interior: {
    wallA: 0xd9c4a8, wallB: 0xc4ae92, roofA: 0x8a6a50, roofB: 0x7a5d4a,
    trim: 0x8a6a50, window: 0x8fb6c9, windowLit: 0xffe9a8, door: 0x6b4a3a,
  },
};

export function ensureBuilding(scene: Phaser.Scene, def: BuildingDef, theme: ThemeId): BuildingSpec {
  const variant = def.variant ?? 0;
  const key = `bld-${def.type}-${theme}-${variant}-${def.w}x${def.h}`;
  const texW = def.w + 24; // roof overhang
  const texH = def.h + ROOF_H;
  const door = { x: 0, w: 30, h: 44 };
  if (!scene.textures.exists(key)) {
    const g = scene.add.graphics();
    drawBuilding(g, def.type, theme, variant, def.w, def.h, texW, texH);
    g.generateTexture(key, texW, texH);
    g.destroy();
  }
  return { key, texW, texH, door };
}

function drawBuilding(
  g: Phaser.GameObjects.Graphics,
  type: BuildingDef["type"],
  theme: ThemeId,
  variant: number,
  w: number,
  h: number,
  texW: number,
  texH: number
) {
  const c = THEME_COLORS[theme];
  const x0 = (texW - w) / 2; // wall left edge
  const y0 = texH - h; // wall top edge
  const wall = variant % 2 === 0 ? c.wallA : c.wallB;
  const roof = variant % 2 === 0 ? c.roofA : c.roofB;
  const cx = texW / 2;

  // walls
  g.fillStyle(wall);
  g.fillRect(x0, y0, w, h);
  // baseboard shadow
  g.fillStyle(0x000000, 0.12);
  g.fillRect(x0, texH - 8, w, 8);

  // door (center)
  const doorW = 30;
  const doorH = 44;
  g.fillStyle(c.door);
  g.fillRoundedRect(cx - doorW / 2, texH - doorH, doorW, doorH, { tl: 8, tr: 8, bl: 0, br: 0 });
  g.fillStyle(0xffe9a8, 0.9);
  g.fillCircle(cx + doorW / 2 - 7, texH - doorH / 2, 2.5); // handle
  // welcome mat
  g.fillStyle(0x000000, 0.15);
  g.fillRect(cx - doorW / 2 - 4, texH - 4, doorW + 8, 4);

  // windows: two flanking the door + upper row on tall walls
  const drawWindow = (wx: number, wy: number, lit: boolean) => {
    g.fillStyle(c.trim);
    g.fillRoundedRect(wx - 12, wy - 12, 24, 24, 4);
    g.fillStyle(lit ? c.windowLit : c.window);
    g.fillRoundedRect(wx - 9, wy - 9, 18, 18, 3);
    if (lit) {
      g.fillStyle(c.windowLit, 0.25);
      g.fillCircle(wx, wy, 20);
    }
  };

  if (type === "house" || type === "shop") {
    drawWindow(cx - w / 4 - 6, texH - doorH / 2 - 4, variant % 2 === 0);
    drawWindow(cx + w / 4 + 6, texH - doorH / 2 - 4, true);
  }

  if (type === "tower") {
    // grid of city windows, some lit
    const cols = Math.floor((w - 24) / 30);
    const rows = Math.floor((h - doorH - 24) / 34);
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const lit = (r * 31 + col * 17 + variant * 7) % 3 === 0;
        const wx = x0 + 20 + col * 30 + (w - 24 - cols * 30) / 2;
        const wy = y0 + 22 + r * 34;
        g.fillStyle(lit ? c.windowLit : c.window, lit ? 0.95 : 0.8);
        g.fillRoundedRect(wx - 8, wy - 10, 18, 22, 2);
      }
    }
  }

  // roof
  if (type === "house") {
    g.fillStyle(roof);
    g.fillTriangle(x0 - 12, y0 + 2, texW - x0 + 12, y0 + 2, cx, y0 - ROOF_H + 8);
    g.fillStyle(0x000000, 0.1);
    g.fillTriangle(cx, y0 - ROOF_H + 8, texW - x0 + 12, y0 + 2, cx, y0 + 2);
    // chimney
    g.fillStyle(c.trim);
    g.fillRect(cx + w / 4, y0 - ROOF_H / 2, 12, ROOF_H / 2);
    if (theme === "snow") {
      g.fillStyle(0xf4f6fb);
      g.fillTriangle(x0 - 6, y0 - 2, cx, y0 - ROOF_H + 6, cx + 20, y0 - ROOF_H + 16);
    }
  } else if (type === "cafe" || type === "shop" || type === "arcade") {
    // flat roof + parapet
    g.fillStyle(roof);
    g.fillRoundedRect(x0 - 8, y0 - 18, w + 16, 24, 6);
    // awning
    if (type === "cafe") {
      const aw = [0xd9756b, 0xf3e6c2];
      for (let i = 0; i < Math.floor(w / 18); i++) {
        g.fillStyle(aw[i % 2]);
        g.fillRect(x0 + i * 18, y0 + 12, 18, 16);
        g.fillTriangle(x0 + i * 18, y0 + 28, x0 + i * 18 + 18, y0 + 28, x0 + i * 18 + 9, y0 + 36);
      }
      // big shop window
      g.fillStyle(c.trim);
      g.fillRoundedRect(cx + doorW / 2 + 6, texH - 52, w / 2 - doorW / 2 - 18, 40, 4);
      g.fillStyle(c.windowLit, 0.92);
      g.fillRoundedRect(cx + doorW / 2 + 9, texH - 49, w / 2 - doorW / 2 - 24, 34, 3);
      // silhouette cups in window
      g.fillStyle(0x8a5a42, 0.55);
      g.fillRoundedRect(cx + doorW / 2 + 16, texH - 26, 10, 8, 2);
      g.fillRoundedRect(cx + doorW / 2 + 32, texH - 26, 10, 8, 2);
    }
    if (type === "arcade") {
      // marquee
      g.fillStyle(theme === "neon" ? 0xff6b8f : 0x5d4a8a);
      g.fillRoundedRect(x0 + 4, y0 - 10, w - 8, 26, 8);
      g.fillStyle(0xffd166);
      for (let i = 0; i < Math.floor(w / 16); i++) {
        g.fillCircle(x0 + 14 + i * 16, y0 - 10, 3);
      }
      // glowing window
      g.fillStyle(0x6bf0ff, 0.85);
      g.fillRoundedRect(cx + doorW / 2 + 8, texH - 48, Math.max(24, w / 2 - doorW / 2 - 20), 34, 4);
    }
  } else if (type === "tower") {
    g.fillStyle(roof);
    g.fillRect(x0 - 6, y0 - 10, w + 12, 14);
    if (theme === "neon") {
      // neon trim lines up the corners
      g.fillStyle(c.trim, 0.9);
      g.fillRect(x0, y0, 3, h);
      g.fillRect(x0 + w - 3, y0, 3, h);
      g.fillStyle(variant % 2 === 0 ? 0xff6b8f : 0x9dff6b, 0.9);
      g.fillRect(x0 - 6, y0 - 10, w + 12, 3);
    }
    if (theme === "rainy") {
      // rooftop water tank silhouette
      g.fillStyle(0x525c6e);
      g.fillRoundedRect(cx - 14, y0 - 34, 28, 26, 4);
    }
  }
}
