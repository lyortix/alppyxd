import * as Phaser from "phaser";
import type { MapDef } from "../data/maps/types";

export function hexToInt(hex: string): number {
  return Phaser.Display.Color.HexStringToColor(hex).color;
}

/**
 * Base ground pass, drawn once at the lowest depth. Outdoors: theme-colored
 * ground with soft variation, painted roads/paths, water. Interiors: plank
 * floor plus the back wall band (whose bottom edge is the collider defined
 * in the map data). Theme decoration (buildings, props) is layered on top
 * by the world builder.
 */
export function drawGround(scene: Phaser.Scene, map: MapDef) {
  const g = scene.add.graphics().setDepth(-1000);
  const ground = hexToInt(map.ambient.ground);
  const shade = hexToInt(map.ambient.groundShade);
  const path = hexToInt(map.ambient.path);

  g.fillStyle(ground, 1);
  g.fillRect(0, 0, map.width, map.height);

  if (map.kind === "interior") {
    drawInterior(g, map, ground, shade, path);
    return;
  }

  // Soft variation: sparse large patches of the shade tone, deterministic
  // per map so everyone sees the same ground.
  const rng = new Phaser.Math.RandomDataGenerator([map.id]);
  g.fillStyle(shade, 0.35);
  for (let i = 0; i < (map.width * map.height) / 40000; i++) {
    const x = rng.between(0, map.width);
    const y = rng.between(0, map.height);
    g.fillEllipse(x, y, rng.between(60, 180), rng.between(40, 100));
  }

  if (map.water) {
    const icy = map.theme === "snow";
    for (const w of map.water) {
      g.fillStyle(icy ? 0xbfd4e8 : 0x5d8aa8, 1);
      g.fillRoundedRect(w.x, w.y, w.w, w.h, 24);
      g.fillStyle(icy ? 0xe2ecf7 : 0x7fb2cc, 0.55);
      g.fillRoundedRect(w.x + 8, w.y + 8, w.w - 16, w.h - 16, 20);
      if (icy) {
        // skate scratches
        g.lineStyle(2, 0xffffff, 0.5);
        g.lineBetween(w.x + w.w * 0.2, w.y + w.h * 0.3, w.x + w.w * 0.5, w.y + w.h * 0.6);
        g.lineBetween(w.x + w.w * 0.6, w.y + w.h * 0.25, w.x + w.w * 0.8, w.y + w.h * 0.7);
      }
    }
  }

  g.fillStyle(path, 1);
  for (const p of map.paths) {
    g.fillRect(p.x, p.y, p.w, p.h);
  }
  // Path edge shading for a little depth.
  g.fillStyle(shade, 0.4);
  for (const p of map.paths) {
    g.fillRect(p.x, p.y + p.h - 4, p.w, 4);
  }

  // Street dashes on wide horizontal roads.
  g.fillStyle(0xffffff, map.theme === "snow" ? 0.25 : 0.18);
  for (const p of map.paths) {
    if (p.w > p.h && p.h >= 100) {
      for (let x = p.x + 30; x < p.x + p.w - 40; x += 90) {
        g.fillRoundedRect(x, p.y + p.h / 2 - 3, 44, 6, 3);
      }
    }
  }
}

function drawInterior(g: Phaser.GameObjects.Graphics, map: MapDef, floor: number, shade: number, wall: number) {
  // Plank floor
  g.fillStyle(shade, 0.5);
  for (let y = 0; y < map.height; y += 36) {
    g.fillRect(0, y + 32, map.width, 4);
  }
  g.fillStyle(shade, 0.3);
  for (let x = 0; x < map.width; x += 140) {
    g.fillRect(x + ((x / 140) % 2) * 70, 0, 3, map.height);
  }

  // Back wall band — its bottom must match the map's top collider.
  const wallH = (map.colliders[0]?.h ?? 180) - 10;
  g.fillStyle(wall, 1);
  g.fillRect(0, 0, map.width, wallH);
  // wainscot line + baseboard
  g.fillStyle(0x000000, 0.15);
  g.fillRect(0, wallH - 10, map.width, 10);
  g.fillStyle(0xffffff, 0.06);
  g.fillRect(0, wallH - 26, map.width, 4);

  // Window with a view strip (skip for rooftop-style open maps)
  if (map.id !== "rooftop") {
    const view = map.id === "cozyhouse" ? 0xbfd4e8 : map.id === "arcade" ? 0x2b1e45 : 0xf7c9a3;
    for (const wx of [map.width * 0.28, map.width * 0.72]) {
      g.fillStyle(0x000000, 0.25);
      g.fillRoundedRect(wx - 44, 34, 88, 64, 6);
      g.fillStyle(view, 1);
      g.fillRoundedRect(wx - 40, 38, 80, 56, 4);
      g.fillStyle(0xffffff, 0.25);
      g.fillTriangle(wx - 30, 38, wx - 6, 38, wx - 40, 70);
    }
  } else {
    // rooftop: city skyline silhouette instead of a wall window
    g.fillStyle(0x2b3040, 1);
    for (let i = 0; i < 12; i++) {
      const bw = 50 + ((i * 37) % 60);
      const bh = 40 + ((i * 53) % 70);
      g.fillRect(i * 90, wallH - 10 - bh, bw, bh);
    }
    g.fillStyle(0xffd98c, 0.7);
    for (let i = 0; i < 24; i++) {
      g.fillRect(20 + i * 43, wallH - 30 - ((i * 29) % 60), 5, 7);
    }
  }

  // soft edge vignette on the floor
  g.fillStyle(0x000000, 0.1);
  g.fillRect(0, map.height - 8, map.width, 8);
}

/**
 * Mood lighting: a full-map tint rectangle above the world layer. Kept as a
 * returned handle so photo mode / weather events can tween it later.
 */
export function drawLightOverlay(scene: Phaser.Scene, map: MapDef): Phaser.GameObjects.Rectangle {
  const rect = scene.add
    .rectangle(map.width / 2, map.height / 2, map.width, map.height, hexToInt(map.ambient.lightTint), map.ambient.lightAlpha)
    .setDepth(100000)
    .setBlendMode(Phaser.BlendModes.OVERLAY);
  return rect;
}
