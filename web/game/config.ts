/**
 * Central visual/gameplay config. Placeholder art is drawn procedurally
 * (Phaser Graphics/textures) rather than loaded from image files, so there
 * is zero risk of shipping copyrighted anime assets and swapping in real
 * art later only means changing `useVectorPlaceholder` + adding a loader.
 */

export const WORLD_SIZE = { width: 1400, height: 900 };

export const PALETTE = {
  skyTop: 0xf7c9a3, // sunset peach
  skyBottom: 0xe89bb0, // dusky pink
  ground: 0x9cc9a1, // soft sage
  groundPath: 0xe8d9b5, // sandy path
  houseWall: 0xf3e3d3,
  houseRoofA: 0xd97b6c,
  houseRoofB: 0x7fa7a3,
  houseGlow: 0xffe9a8,
  treeLeaf: 0x6f9c76,
  treeTrunk: 0x6b4a3a,
  lampGlow: 0xffe3a0,
  textDark: 0x3a2e2c,
  bubbleBg: 0xfff7ea,
  bubbleText: 0x3a2e2c,
} as const;

export const ART = {
  useVectorPlaceholder: true,
};

/**
 * Must mirror server/src/houses.ts (id, x, y). Positions are duplicated
 * here (no shared package between the two independently-deployed services)
 * — occupancy counts and reveal thresholds come live from the server so
 * only the layout needs to stay in sync by hand.
 */
export const HOUSES = [
  { id: "cafe", name: "Sahil Kahvesi", x: 420, y: 360 },
  { id: "cabin", name: "Orman Kulübesi", x: 760, y: 300 },
  { id: "bookshop", name: "Kitapçı", x: 1080, y: 420 },
  { id: "arcade", name: "Oyun Salonu", x: 300, y: 620 },
  { id: "greenhouse", name: "Sera", x: 960, y: 640 },
] as const;

export const PLAYER_SPEED = 220;
export const CHAT_BUBBLE_LIFETIME_MS = 4500;
