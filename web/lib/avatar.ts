/**
 * Avatar catalog shared by the React intro screen (preview/picker) and the
 * Phaser character renderer. Indices — not colors or names — are what gets
 * synced through the server (Player.body / .palette / .accessory), so this
 * file is the single source of truth for what those indices mean.
 *
 * All art is procedural placeholder (drawn at runtime); swapping in real
 * illustrated spritesheets later only means replacing
 * `game/render/characters.ts` while keeping these indices stable.
 */

export interface AvatarRecipe {
  body: number;
  palette: number;
  accessory: number;
}

export const BODIES = [
  { id: "hoodie", label: "Hoodie" },
  { id: "jacket", label: "Jacket" },
  { id: "onesie", label: "Onesie" },
] as const;

export interface AvatarPalette {
  id: string;
  label: string;
  /** CSS hex strings; Phaser converts as needed. */
  skin: string;
  hair: string;
  outfit: string;
  outfitShade: string;
  accent: string;
}

export const PALETTES: AvatarPalette[] = [
  { id: "dusk", label: "Dusk", skin: "#f5cfa8", hair: "#4a3742", outfit: "#8d7bb8", outfitShade: "#6f5f96", accent: "#ffd9a0" },
  { id: "matcha", label: "Matcha", skin: "#eebfa0", hair: "#2e3b32", outfit: "#7fa878", outfitShade: "#5f8a5c", accent: "#f3e6c2" },
  { id: "ember", label: "Ember", skin: "#f2c39b", hair: "#5a2f28", outfit: "#c96f5b", outfitShade: "#a5503f", accent: "#ffe0b8" },
  { id: "tide", label: "Tide", skin: "#e8b98e", hair: "#26333f", outfit: "#5d8aa8", outfitShade: "#456c86", accent: "#cfe8f0" },
  { id: "plum", label: "Plum", skin: "#d9a878", hair: "#3d2a3a", outfit: "#a86f96", outfitShade: "#875578", accent: "#f2cfe0" },
  { id: "honey", label: "Honey", skin: "#c98d5f", hair: "#221c18", outfit: "#d9a856", outfitShade: "#b3873c", accent: "#fff0c8" },
  { id: "slate", label: "Slate", skin: "#b57f52", hair: "#191d24", outfit: "#5f6a7d", outfitShade: "#485261", accent: "#c8d4e8" },
  { id: "sakura", label: "Sakura", skin: "#f7d4b0", hair: "#8a5a66", outfit: "#e8a0b4", outfitShade: "#c47f95", accent: "#fff2f5" },
];

export const ACCESSORIES = [
  { id: "none", label: "None" },
  { id: "headphones", label: "Headphones" },
  { id: "beanie", label: "Beanie" },
  { id: "backpack", label: "Backpack" },
  { id: "scarf", label: "Scarf" },
] as const;

export function randomAvatar(): AvatarRecipe {
  return {
    body: Math.floor(Math.random() * BODIES.length),
    palette: Math.floor(Math.random() * PALETTES.length),
    accessory: Math.floor(Math.random() * ACCESSORIES.length),
  };
}
