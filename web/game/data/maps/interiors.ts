import type { MapDef } from "./types";

/**
 * Enterable interiors. Small, dense, cozy — these are the real hangout
 * rooms (capacity 4-6 server-side). Each exits back to its outdoor map via
 * the mat at the bottom edge, reappearing in front of the source building.
 */

export const cafeMap: MapDef = {
  id: "cafe",
  label: "Corner Café",
  kind: "interior",
  theme: "interior",
  width: 960,
  height: 704,
  spawn: { x: 480, y: 560 },
  weather: "clear",
  ambient: {
    ground: "#b8977a", // wood floor
    groundShade: "#a8886c",
    path: "#8a6a50", // wall color (interior ground pass draws the wall band)
    lightTint: "#ffb46b",
    lightAlpha: 0.12,
  },
  paths: [],
  buildings: [],
  props: [
    { type: "counter", x: 480, y: 300 },
    { type: "table", x: 220, y: 420, sit: true },
    { type: "table", x: 720, y: 420, sit: true },
    { type: "table", x: 300, y: 580, sit: true },
    { type: "table", x: 660, y: 590, sit: true },
    { type: "rug", x: 480, y: 500 },
    { type: "plant", x: 80, y: 260 },
    { type: "plant", x: 880, y: 260 },
    { type: "stringlights", x: 300, y: 200 },
    { type: "stringlights", x: 660, y: 200 },
    { type: "bookshelf", x: 130, y: 250 },
  ],
  portals: [
    { x: 400, y: 680, w: 160, h: 24, toMap: "sunset", label: "back outside", spawnAt: { x: 740, y: 740 } },
  ],
  signs: [{ x: 620, y: 320, text: "today's special: honey oat latte ☕" }],
  colliders: [{ x: 0, y: 0, w: 960, h: 180 }],
  npcs: [
    {
      id: "owner",
      name: "café owner",
      kind: "human",
      body: 0,
      palette: 2,
      accessory: 4,
      x: 480,
      y: 360,
      wander: 0,
      lines: [
        "welcome in! grab any seat you like.",
        "first cup's on the house. it always is.",
        "quiet today, or busy — either way you're good company.",
        "the rain outside makes the inside cozier, don't you think?",
      ],
    },
  ],
  ambience: "cafe",
};

export const arcadeMap: MapDef = {
  id: "arcade",
  label: "Pixel Arcade",
  kind: "interior",
  theme: "interior",
  width: 960,
  height: 704,
  spawn: { x: 480, y: 560 },
  weather: "clear",
  ambient: {
    ground: "#3a3440",
    groundShade: "#332e39",
    path: "#2c2733",
    lightTint: "#7b3dd9",
    lightAlpha: 0.14,
  },
  paths: [],
  buildings: [],
  props: [
    { type: "counter", x: 760, y: 300 },
    { type: "arcadecab", x: 120, y: 260, variant: 0 },
    { type: "arcadecab", x: 200, y: 260, variant: 1 },
    { type: "arcadecab", x: 280, y: 260, variant: 2 },
    { type: "arcadecab", x: 360, y: 260, variant: 0 },
    { type: "arcadecab", x: 80, y: 420, variant: 1 },
    { type: "arcadecab", x: 80, y: 540, variant: 2 },
    { type: "sofa", x: 620, y: 520, variant: 1, sit: true },
    { type: "rug", x: 450, y: 470, variant: 1 },
    { type: "vending", x: 900, y: 420 },
    { type: "plant", x: 900, y: 550 },
    { type: "stringlights", x: 480, y: 210 },
  ],
  portals: [
    { x: 400, y: 680, w: 160, h: 24, toMap: "neon", label: "back outside", spawnAt: { x: 780, y: 750 } },
  ],
  signs: [{ x: 500, y: 300, text: "insert coin… just kidding, everything is free" }],
  colliders: [{ x: 0, y: 0, w: 960, h: 190 }],
  npcs: [],
  ambience: "arcade",
};

export const cozyHouseMap: MapDef = {
  id: "cozyhouse",
  label: "Cozy House",
  kind: "interior",
  theme: "interior",
  width: 896,
  height: 640,
  spawn: { x: 448, y: 510 },
  weather: "clear",
  ambient: {
    ground: "#a8886c",
    groundShade: "#9a7b60",
    path: "#7a5d4a",
    lightTint: "#ff9e6b",
    lightAlpha: 0.16,
  },
  paths: [],
  buildings: [],
  props: [
    { type: "fireplace", x: 448, y: 250 },
    { type: "bed", x: 120, y: 330 },
    { type: "bookshelf", x: 780, y: 245 },
    { type: "sofa", x: 448, y: 420, sit: true },
    { type: "rug", x: 448, y: 490 },
    { type: "plant", x: 260, y: 250 },
    { type: "plant", x: 640, y: 250 },
    { type: "table", x: 700, y: 480, sit: true },
  ],
  portals: [
    { x: 368, y: 616, w: 160, h: 24, toMap: "snow", label: "back outside", spawnAt: { x: 780, y: 735 } },
  ],
  signs: [{ x: 560, y: 280, text: "someone left cocoa on the stove. help yourself 🍫" }],
  colliders: [{ x: 0, y: 0, w: 896, h: 175 }],
  npcs: [],
  ambience: "room",
};

export const rooftopMap: MapDef = {
  id: "rooftop",
  label: "Rooftop",
  kind: "interior",
  theme: "interior",
  width: 1024,
  height: 704,
  spawn: { x: 512, y: 560 },
  weather: "rain",
  ambient: {
    ground: "#4d5462",
    groundShade: "#454b58",
    path: "#3a4050",
    lightTint: "#3d4a6b",
    lightAlpha: 0.2,
  },
  paths: [],
  buildings: [],
  props: [
    { type: "acunit", x: 140, y: 280 },
    { type: "acunit", x: 880, y: 280 },
    { type: "umbrella", x: 512, y: 400 },
    { type: "table", x: 512, y: 420, sit: true },
    { type: "sofa", x: 250, y: 460, variant: 1, sit: true },
    { type: "bench", x: 780, y: 460, sit: true },
    { type: "stringlights", x: 340, y: 230 },
    { type: "stringlights", x: 680, y: 230 },
    { type: "plant", x: 400, y: 270 },
    { type: "plant", x: 620, y: 270 },
    { type: "puddle", x: 700, y: 580 },
    { type: "puddle", x: 300, y: 600 },
  ],
  portals: [
    { x: 432, y: 680, w: 160, h: 24, toMap: "rainy", label: "take the stairs down", spawnAt: { x: 1450, y: 740 } },
  ],
  signs: [{ x: 640, y: 300, text: "quiet zone. watch the rain, type slowly 🌧️" }],
  colliders: [{ x: 0, y: 0, w: 1024, h: 190 }],
  npcs: [],
  ambience: "rain",
};
