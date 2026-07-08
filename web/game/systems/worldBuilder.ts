import * as Phaser from "phaser";
import type { MapDef, PortalDef } from "../data/maps/types";
import { ensureProp } from "../render/props";
import { ensureBuilding } from "../render/buildings";

/**
 * Turns a MapDef into live scene objects: building/prop sprites (depth-
 * sorted by baseline), static collision bodies, door portals, sittable
 * seats and readable signs. Pure construction — per-frame behavior stays in
 * WorldScene.
 */

export interface Seat {
  x: number;
  y: number;
  /** Where the player snaps when sitting. */
  sitY: number;
}

export interface BuiltPortal {
  def: PortalDef;
  zone: Phaser.GameObjects.Zone;
  /** For door portals: world position of the glow/badge above the door. */
  badgeX: number;
  badgeY: number;
  /** Interior map id this door leads to (for live population badges). */
  toMap: string;
  label: Phaser.GameObjects.Text;
  glow?: Phaser.GameObjects.Ellipse;
}

export interface BuiltWorld {
  colliders: Phaser.Physics.Arcade.StaticGroup;
  portals: BuiltPortal[];
  seats: Seat[];
  signs: { x: number; y: number; text: string }[];
}

export function buildWorld(scene: Phaser.Scene, map: MapDef): BuiltWorld {
  const colliders = scene.physics.add.staticGroup();
  const portals: BuiltPortal[] = [];
  const seats: Seat[] = [];

  const addCollider = (cx: number, cy: number, w: number, h: number) => {
    if (w <= 0 || h <= 0) return;
    const zone = scene.add.zone(cx, cy, w, h);
    colliders.add(zone);
  };

  // --- buildings ---
  for (const def of map.buildings) {
    const spec = ensureBuilding(scene, def, map.theme);
    scene.add
      .image(def.x, def.y, spec.key)
      .setOrigin(0.5, 1)
      .setDepth(def.y);
    // Walls block movement; the mat in front of the door stays walkable
    // because the collider is the wall box only.
    addCollider(def.x, def.y - def.h / 2 + 6, def.w, def.h - 24);

    if (def.label) {
      scene.add
        .text(def.x, def.y - def.h - 14, def.label, {
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          fontSize: "13px",
          color: "#fff2dc",
          stroke: "#1c1a24",
          strokeThickness: 4,
        })
        .setOrigin(0.5, 1)
        .setDepth(def.y + 1);
    }

    if (def.portalTo) {
      const zone = scene.add.zone(def.x, def.y + 10, 72, 30);
      scene.physics.add.existing(zone, true);
      const glow = scene.add
        .ellipse(def.x, def.y + 6, 52, 18, 0xffe9a8, 0.25)
        .setDepth(def.y - 1);
      scene.tweens.add({
        targets: glow,
        alpha: { from: 0.15, to: 0.4 },
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: "sine.inout",
      });
      const label = scene.add
        .text(def.x, def.y - def.h + 40, "", {
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          fontSize: "12px",
          color: "#ffe9b0",
          stroke: "#1c1a24",
          strokeThickness: 4,
        })
        .setOrigin(0.5, 1)
        .setDepth(def.y + 2);
      portals.push({
        def: { x: def.x - 36, y: def.y - 5, w: 72, h: 30, toMap: def.portalTo, label: def.label ?? def.portalTo },
        zone,
        badgeX: def.x,
        badgeY: def.y - def.h + 40,
        toMap: def.portalTo,
        label,
        glow,
      });
    }
  }

  // --- explicit portals (exit mats etc.) ---
  for (const def of map.portals) {
    const cx = def.x + def.w / 2;
    const cy = def.y + def.h / 2;
    const zone = scene.add.zone(cx, cy, def.w, def.h);
    scene.physics.add.existing(zone, true);
    // visible exit mat
    const mat = scene.add
      .rectangle(cx, cy, def.w, Math.max(def.h, 18), 0xffe9a8, 0.2)
      .setDepth(-500);
    scene.tweens.add({
      targets: mat,
      alpha: { from: 0.12, to: 0.3 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "sine.inout",
    });
    const label = scene.add
      .text(cx, cy - 16, `⬇ ${def.label}`, {
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontSize: "12px",
        color: "#ffe9b0",
        stroke: "#1c1a24",
        strokeThickness: 4,
      })
      .setOrigin(0.5, 1)
      .setDepth(cy + 1);
    portals.push({ def, zone, badgeX: cx, badgeY: cy - 16, toMap: def.toMap, label });
  }

  // --- props ---
  for (const def of map.props) {
    const spec = ensureProp(scene, def.type, map.theme, def.variant ?? 0);
    const img = scene.add.image(def.x, def.y, spec.key).setOrigin(0.5, 1);
    // Flat decals (rugs, puddles, string lights) sit under everything else.
    const flat = def.type === "rug" || def.type === "puddle";
    const hanging = def.type === "stringlights";
    img.setDepth(flat ? -600 : hanging ? def.y + 400 : def.y);
    if (spec.collideW > 0) {
      addCollider(def.x, def.y - spec.collideH / 2, spec.collideW, spec.collideH);
    }
    if (def.sit && spec.seatOffsetY !== undefined) {
      seats.push({ x: def.x, y: def.y, sitY: def.y + spec.seatOffsetY });
    }
  }

  // --- signs ---
  for (const def of map.signs) {
    const key = `prop-signpost-${map.theme}`;
    if (!scene.textures.exists(key)) {
      const g = scene.add.graphics();
      g.fillStyle(0x6b5442);
      g.fillRoundedRect(18, 16, 6, 40, 2);
      g.fillStyle(0x8a6a50);
      g.fillRoundedRect(2, 2, 38, 22, 4);
      g.fillStyle(0xfff2dc, 0.85);
      g.fillRoundedRect(6, 6, 30, 14, 2);
      g.generateTexture(key, 44, 56);
      g.destroy();
    }
    scene.add.image(def.x, def.y, key).setOrigin(0.5, 1).setDepth(def.y);
    addCollider(def.x, def.y - 6, 20, 10);
  }

  // --- extra colliders from map data ---
  for (const c of map.colliders) {
    addCollider(c.x + c.w / 2, c.y + c.h / 2, c.w, c.h);
  }

  return { colliders, portals, seats, signs: map.signs };
}
