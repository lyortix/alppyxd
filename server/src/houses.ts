/**
 * Central house/room configuration for the neighborhood.
 * Adding a house here is the only step needed to make it joinable —
 * the server registers one Colyseus room definition per entry at boot.
 */
export interface HouseConfig {
  id: string;
  name: string;
  /** Map position (in world units), used by the frontend to place the sprite. */
  x: number;
  y: number;
  /** Target group size before the crowd should be nudged into a fresh instance. */
  capacity: number;
  /**
   * Total concurrent players across the whole neighborhood needed before this
   * house appears on the map at all. Keeps early users clustered together
   * instead of spreading out across a half-empty town (cold-start fix).
   */
  revealAtTotalPlayers: number;
}

export const HOUSES: HouseConfig[] = [
  { id: "cafe", name: "Sahil Kahvesi", x: 420, y: 360, capacity: 6, revealAtTotalPlayers: 0 },
  { id: "cabin", name: "Orman Kulübesi", x: 760, y: 300, capacity: 6, revealAtTotalPlayers: 0 },
  { id: "bookshop", name: "Kitapçı", x: 1080, y: 420, capacity: 6, revealAtTotalPlayers: 3 },
  { id: "arcade", name: "Oyun Salonu", x: 300, y: 620, capacity: 6, revealAtTotalPlayers: 6 },
  { id: "greenhouse", name: "Sera", x: 960, y: 640, capacity: 6, revealAtTotalPlayers: 10 },
];

export function roomNameForHouse(houseId: string): string {
  return `house_${houseId}`;
}
