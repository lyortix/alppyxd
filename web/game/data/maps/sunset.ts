import type { MapDef } from "./types";

/**
 * Theme 1 — Sunset Neighborhood. Warm dusk light, small houses, the corner
 * café, a park strip on the east side. (Props/buildings arrive with the
 * Phase 2 world engine; Phase 1 only needs ground + spawn.)
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
  ],
  buildings: [],
  props: [],
  portals: [],
  signs: [],
  colliders: [],
  npcs: [],
  ambience: "sunset",
};
