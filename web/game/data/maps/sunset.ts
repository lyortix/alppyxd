import type { MapDef } from "./types";

/**
 * Theme 1 — Sunset Neighborhood. Warm dusk light, small houses along the
 * main street, the corner café (enterable), and a park with a pond in the
 * south-east. The default place everyone spawns first.
 */
export const sunsetMap: MapDef = {
  id: "sunset",
  label: "Sunset Neighborhood",
  kind: "outdoor",
  theme: "sunset",
  width: 1920,
  height: 1280,
  spawn: { x: 960, y: 780 },
  weather: "clear",
  ambient: {
    ground: "#9cc9a1",
    groundShade: "#8bb890",
    path: "#e8d9b5",
    lightTint: "#ff9e6b",
    lightAlpha: 0.14,
  },
  paths: [
    { x: 0, y: 700, w: 1920, h: 120 }, // main street
    { x: 900, y: 0, w: 120, h: 1280 }, // cross street
    { x: 1300, y: 950, w: 460, h: 60 }, // park walk
  ],
  water: [{ x: 1460, y: 1020, w: 300, h: 190 }], // park pond
  buildings: [
    { type: "house", x: 280, y: 680, w: 180, h: 110, variant: 0 },
    { type: "house", x: 500, y: 690, w: 160, h: 100, variant: 1 },
    { type: "cafe", x: 740, y: 690, w: 220, h: 120, label: "corner café", portalTo: "cafe" },
    { type: "house", x: 1180, y: 680, w: 180, h: 110, variant: 1 },
    { type: "house", x: 1400, y: 690, w: 170, h: 105, variant: 0 },
    { type: "shop", x: 1650, y: 685, w: 160, h: 100, variant: 1, label: "corner store" },
    { type: "house", x: 350, y: 1100, w: 180, h: 110, variant: 1 },
    { type: "house", x: 620, y: 1130, w: 160, h: 100, variant: 0 },
  ],
  props: [
    // street lamps along the main street
    { type: "lamp", x: 160, y: 700 }, { type: "lamp", x: 560, y: 840 },
    { type: "lamp", x: 860, y: 700 }, { type: "lamp", x: 1100, y: 840 },
    { type: "lamp", x: 1500, y: 840 }, { type: "lamp", x: 1780, y: 700 },
    { type: "lamp", x: 960, y: 1100 }, { type: "lamp", x: 960, y: 400 },
    // trees
    { type: "tree", x: 120, y: 620 }, { type: "tree", x: 640, y: 640, variant: 1 },
    { type: "tree", x: 1080, y: 630 }, { type: "tree", x: 1550, y: 620, variant: 1 },
    { type: "tree", x: 200, y: 950 }, { type: "tree", x: 760, y: 1000, variant: 1 },
    { type: "tree", x: 1850, y: 500 }, { type: "tree", x: 1300, y: 1150 },
    { type: "tree", x: 1830, y: 1080, variant: 1 }, { type: "tree", x: 480, y: 420 },
    { type: "tree", x: 1350, y: 300, variant: 1 }, { type: "tree", x: 300, y: 200 },
    // park furniture
    { type: "bench", x: 1380, y: 920, sit: true }, { type: "bench", x: 1650, y: 920, sit: true },
    { type: "bench", x: 830, y: 860, sit: true }, { type: "bench", x: 400, y: 860, sit: true },
    { type: "flowerbed", x: 1200, y: 900 }, { type: "flowerbed", x: 560, y: 660, variant: 1 },
    { type: "bush", x: 1750, y: 950 }, { type: "bush", x: 1280, y: 990 },
    { type: "bush", x: 150, y: 830 }, { type: "bush", x: 700, y: 400 },
    { type: "flowerbed", x: 1000, y: 250, variant: 1 },
  ],
  portals: [],
  signs: [
    { x: 1030, y: 840, text: "welcome to lo-fi square 🌇 say hi to a stranger" },
    { x: 1330, y: 1010, text: "pond rules: no rush. sit a while." },
  ],
  colliders: [],
  npcs: [],
  ambience: "sunset",
};
