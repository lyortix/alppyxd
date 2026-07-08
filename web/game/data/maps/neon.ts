import type { MapDef } from "./types";

/**
 * Theme 4 — Neon District. Dark streets, glowing signs, string lights, the
 * pixel arcade. Cyber but still cozy.
 */
export const neonMap: MapDef = {
  id: "neon",
  label: "Neon District",
  kind: "outdoor",
  theme: "neon",
  width: 1920,
  height: 1280,
  spawn: { x: 960, y: 820 },
  weather: "clear",
  ambient: {
    ground: "#23242e",
    groundShade: "#1d1e27",
    path: "#2c2d3a",
    lightTint: "#3d1a5e",
    lightAlpha: 0.2,
  },
  paths: [
    { x: 0, y: 700, w: 1920, h: 140 },
    { x: 880, y: 0, w: 140, h: 1280 },
  ],
  buildings: [
    { type: "tower", x: 250, y: 680, w: 230, h: 320, variant: 0 },
    { type: "tower", x: 530, y: 680, w: 200, h: 260, variant: 1 },
    { type: "arcade", x: 780, y: 690, w: 210, h: 120, variant: 0, label: "pixel arcade", portalTo: "arcade" },
    { type: "tower", x: 1180, y: 680, w: 220, h: 340, variant: 1 },
    { type: "shop", x: 1450, y: 685, w: 180, h: 110, variant: 1, label: "midnight ramen" },
    { type: "tower", x: 1720, y: 680, w: 200, h: 300, variant: 0 },
    { type: "tower", x: 350, y: 1260, w: 260, h: 300, variant: 1 },
    { type: "tower", x: 1450, y: 1270, w: 240, h: 280, variant: 0 },
  ],
  props: [
    { type: "neonlamp", x: 180, y: 700 }, { type: "neonlamp", x: 620, y: 860 },
    { type: "neonlamp", x: 1100, y: 700 }, { type: "neonlamp", x: 1600, y: 860 },
    { type: "neonlamp", x: 960, y: 1150 }, { type: "neonlamp", x: 960, y: 400 },
    { type: "vending", x: 680, y: 680 }, { type: "vending", x: 1330, y: 680 },
    { type: "vending", x: 1050, y: 1050 },
    { type: "stringlights", x: 780, y: 560 }, { type: "stringlights", x: 1450, y: 560 },
    { type: "bench", x: 400, y: 900, sit: true }, { type: "bench", x: 1250, y: 920, sit: true },
    { type: "umbrella", x: 1230, y: 930 },
    { type: "bush", x: 150, y: 880 }, { type: "bush", x: 1800, y: 960 },
    { type: "tree", x: 120, y: 1050 }, { type: "tree", x: 1850, y: 1120 },
    { type: "puddle", x: 500, y: 800 }, { type: "puddle", x: 1500, y: 820 },
  ],
  portals: [],
  signs: [
    { x: 1040, y: 870, text: "neon district: louder lights, softer people 🌃" },
    { x: 880, y: 850, text: "pixel arcade — high scores reset, friendships don't" },
  ],
  colliders: [],
  npcs: [],
  ambience: "city",
};
