import type { MapDef } from "./types";

/**
 * Theme 2 — Rainy City. Tall blocks, puddle reflections, patio umbrellas,
 * a tower with an accessible rooftop. Permanent light rain.
 */
export const rainyMap: MapDef = {
  id: "rainy",
  label: "Rainy City",
  kind: "outdoor",
  theme: "rainy",
  width: 1920,
  height: 1280,
  spawn: { x: 960, y: 800 },
  weather: "rain",
  ambient: {
    ground: "#525a68",
    groundShade: "#485061",
    path: "#5d6575",
    lightTint: "#3d4a6b",
    lightAlpha: 0.22,
  },
  paths: [
    { x: 0, y: 700, w: 1920, h: 140 },
    { x: 880, y: 0, w: 140, h: 1280 },
    { x: 300, y: 1040, w: 1300, h: 80 },
  ],
  buildings: [
    { type: "tower", x: 240, y: 680, w: 220, h: 280, variant: 0 },
    { type: "tower", x: 520, y: 680, w: 200, h: 340, variant: 1 },
    { type: "cafe", x: 760, y: 690, w: 190, h: 110, variant: 1, label: "rainy day coffee" },
    { type: "tower", x: 1180, y: 680, w: 230, h: 300, variant: 1 },
    { type: "tower", x: 1450, y: 680, w: 190, h: 360, variant: 0, label: "mist tower", portalTo: "rooftop" },
    { type: "shop", x: 1700, y: 685, w: 170, h: 105, variant: 0, label: "24h umbrella shop" },
    { type: "tower", x: 400, y: 1260, w: 240, h: 280, variant: 1 },
    { type: "tower", x: 1300, y: 1270, w: 220, h: 300, variant: 0 },
  ],
  props: [
    { type: "neonlamp", x: 200, y: 700 }, { type: "neonlamp", x: 600, y: 860 },
    { type: "neonlamp", x: 1080, y: 700 }, { type: "neonlamp", x: 1620, y: 860 },
    { type: "neonlamp", x: 960, y: 1160 }, { type: "neonlamp", x: 960, y: 420 },
    { type: "puddle", x: 420, y: 790 }, { type: "puddle", x: 900, y: 830 },
    { type: "puddle", x: 1350, y: 780 }, { type: "puddle", x: 1000, y: 1000 },
    { type: "puddle", x: 700, y: 1120 }, { type: "puddle", x: 950, y: 300 },
    { type: "umbrella", x: 350, y: 900 }, { type: "umbrella", x: 1150, y: 920, variant: 1 },
    { type: "bench", x: 330, y: 890, sit: true }, { type: "bench", x: 1130, y: 910, sit: true },
    { type: "vending", x: 640, y: 680 }, { type: "vending", x: 1580, y: 680 },
    { type: "bush", x: 120, y: 850 }, { type: "bush", x: 1800, y: 950 },
    { type: "tree", x: 130, y: 1000 }, { type: "tree", x: 1820, y: 1150 },
  ],
  portals: [],
  signs: [
    { x: 1040, y: 860, text: "the rain never really stops here. that's the point ☔" },
    { x: 1530, y: 850, text: "mist tower — rooftop open to quiet people" },
  ],
  colliders: [],
  npcs: [],
  ambience: "rain",
};
