/**
 * Data-driven map format. A map is pure data — the generic WorldScene plus
 * the theme renderers turn it into a live place. Adding a new location means
 * adding a file here (plus its small matchmaking entry in
 * server/src/config/maps.ts) — no new scene code.
 */

export type ThemeId = "sunset" | "rainy" | "snow" | "neon" | "interior";
export type WeatherKind = "clear" | "rain" | "snow";

export type PropType =
  | "tree"
  | "pine"
  | "lamp"
  | "neonlamp"
  | "bench"
  | "bush"
  | "flowerbed"
  | "snowman"
  | "puddle"
  | "vending"
  | "umbrella"   // patio umbrella (rainy city / rooftop)
  | "table"      // interior: café table with chairs
  | "counter"    // interior: café/arcade counter
  | "arcadecab"  // interior: arcade cabinet
  | "sofa"
  | "rug"
  | "plant"
  | "bookshelf"
  | "bed"
  | "fireplace"
  | "acunit"     // rooftop AC unit
  | "stringlights";

export interface PropDef {
  type: PropType;
  x: number;
  y: number;
  /** Theme-renderer-specific variation (palette swap, size…). */
  variant?: number;
  /** Sittable props (bench, sofa, table chairs) snap the player here. */
  sit?: boolean;
}

export type BuildingType = "house" | "cafe" | "arcade" | "tower" | "shop";

export interface BuildingDef {
  type: BuildingType;
  x: number; // center of footprint
  y: number; // baseline (bottom of walls)
  w: number;
  h: number; // wall height (roof drawn above)
  variant?: number;
  label?: string;
  /** If set, the door teleports into this map. */
  portalTo?: string;
}

export interface PortalDef {
  x: number;
  y: number;
  w: number;
  h: number;
  toMap: string;
  label: string;
  /** Where the traveller appears in the destination (defaults to its spawn). */
  spawnAt?: { x: number; y: number };
}

export interface SignDef {
  x: number;
  y: number;
  text: string;
}

export interface RectDef {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface NpcDef {
  id: string;
  name: string;
  /** Reuses the avatar recipe, or "cat" for the street cat. */
  kind: "human" | "cat";
  body?: number;
  palette?: number;
  accessory?: number;
  x: number;
  y: number;
  /** Wander radius in px; 0 = stands still. */
  wander: number;
  /** Lines cycled when a player interacts. */
  lines: string[];
}

export interface MapDef {
  id: string;
  label: string;
  kind: "outdoor" | "interior";
  theme: ThemeId;
  width: number;
  height: number;
  spawn: { x: number; y: number };
  weather: WeatherKind;
  /** Ambient palette for the ground/sky pass, css hex. */
  ambient: {
    ground: string;
    groundShade: string;
    path: string;
    /** Overlay tint applied over the whole world (lighting mood). */
    lightTint: string;
    lightAlpha: number;
  };
  /** Freeform painted regions (roads, plazas, water) under everything. */
  paths: RectDef[];
  water?: RectDef[];
  buildings: BuildingDef[];
  props: PropDef[];
  portals: PortalDef[];
  signs: SignDef[];
  /** Extra invisible colliders (map edges are automatic). */
  colliders: RectDef[];
  npcs: NpcDef[];
  /** Ambience recipe id for the audio system (see systems/audio.ts). */
  ambience: "sunset" | "rain" | "winter" | "city" | "cafe" | "arcade" | "room";
}
