import * as Phaser from "phaser";
import type { MapDef } from "../data/maps/types";

export function hexToInt(hex: string): number {
  return Phaser.Display.Color.HexStringToColor(hex).color;
}

/**
 * Base ground pass: flat theme color with soft large-tile variation, painted
 * path/road regions, and water. Drawn once into the scene at the lowest
 * depth. Theme-specific decoration (buildings, props, decals) is layered on
 * top by the world renderer (Phase 2+).
 */
export function drawGround(scene: Phaser.Scene, map: MapDef) {
  const g = scene.add.graphics().setDepth(-1000);
  const ground = hexToInt(map.ambient.ground);
  const shade = hexToInt(map.ambient.groundShade);
  const path = hexToInt(map.ambient.path);

  g.fillStyle(ground, 1);
  g.fillRect(0, 0, map.width, map.height);

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
    for (const w of map.water) {
      g.fillStyle(0x5d8aa8, 1);
      g.fillRoundedRect(w.x, w.y, w.w, w.h, 24);
      g.fillStyle(0x7fb2cc, 0.5);
      g.fillRoundedRect(w.x + 8, w.y + 8, w.w - 16, w.h - 16, 20);
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
