import type { MapDef } from "./types";

/**
 * Theme 3 — Snow Village. Timber houses under thick snow roofs, pines, a
 * frozen lake, and one cozy house you can actually enter. Steady snowfall.
 */
export const snowMap: MapDef = {
  id: "snow",
  label: "Snow Village",
  kind: "outdoor",
  theme: "snow",
  width: 1920,
  height: 1280,
  spawn: { x: 960, y: 800 },
  weather: "snow",
  ambient: {
    ground: "#e8edf5",
    groundShade: "#d5dcea",
    path: "#c2cbdd",
    lightTint: "#a8c0e8",
    lightAlpha: 0.16,
  },
  paths: [
    { x: 0, y: 700, w: 1920, h: 120 },
    { x: 900, y: 0, w: 120, h: 1280 },
  ],
  water: [{ x: 1350, y: 950, w: 420, h: 250 }], // frozen lake
  buildings: [
    { type: "house", x: 300, y: 680, w: 190, h: 110, variant: 0 },
    { type: "house", x: 560, y: 690, w: 170, h: 100, variant: 1 },
    { type: "house", x: 780, y: 685, w: 160, h: 105, variant: 0, label: "cozy house", portalTo: "cozyhouse" },
    { type: "cafe", x: 1200, y: 690, w: 200, h: 115, variant: 0, label: "hot chocolate hut" },
    { type: "house", x: 1500, y: 680, w: 180, h: 110, variant: 1 },
    { type: "house", x: 1750, y: 690, w: 150, h: 100, variant: 0 },
    { type: "house", x: 400, y: 1120, w: 180, h: 110, variant: 1 },
  ],
  props: [
    { type: "pine", x: 140, y: 620, variant: 1 }, { type: "pine", x: 680, y: 630, variant: 1 },
    { type: "pine", x: 1080, y: 620, variant: 1 }, { type: "pine", x: 1650, y: 630, variant: 1 },
    { type: "pine", x: 220, y: 980, variant: 1 }, { type: "pine", x: 700, y: 1050, variant: 1 },
    { type: "pine", x: 1850, y: 520, variant: 1 }, { type: "pine", x: 1250, y: 1220, variant: 1 },
    { type: "pine", x: 480, y: 380, variant: 1 }, { type: "pine", x: 1400, y: 280, variant: 1 },
    { type: "pine", x: 60, y: 1150, variant: 1 },
    { type: "lamp", x: 200, y: 700 }, { type: "lamp", x: 640, y: 840 },
    { type: "lamp", x: 1060, y: 700 }, { type: "lamp", x: 1560, y: 840 },
    { type: "lamp", x: 960, y: 1120 }, { type: "lamp", x: 960, y: 420 },
    { type: "snowman", x: 820, y: 900 }, { type: "snowman", x: 1180, y: 880 },
    { type: "bench", x: 500, y: 870, sit: true }, { type: "bench", x: 1420, y: 900, sit: true },
    { type: "bush", x: 300, y: 850 }, { type: "bush", x: 1700, y: 950 },
  ],
  portals: [],
  signs: [
    { x: 1030, y: 850, text: "❄️ the lake is frozen solid. skating optional, vibes mandatory" },
    { x: 860, y: 830, text: "cozy house — the fireplace is always on" },
  ],
  colliders: [],
  npcs: [],
  ambience: "winter",
};
