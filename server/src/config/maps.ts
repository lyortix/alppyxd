/**
 * Server-side map registry. The web client keeps a richer copy of each map
 * (tiles, props, collision, portals) in `web/game/data/maps/` — the two
 * projects deploy separately with no shared package, so only the small
 * matchmaking-relevant subset lives here. When adding a map, add it to both
 * sides (ids must match).
 */

export type WeatherKind = "clear" | "rain" | "snow";

export interface MapConfig {
  id: string;
  label: string;
  kind: "outdoor" | "interior";
  /** Target cozy group size — a fresh room instance opens beyond this. */
  capacity: number;
  /** World-pixel bounds used to clamp reported positions server-side. */
  width: number;
  height: number;
  spawn: { x: number; y: number };
  weather: WeatherKind;
}

export const MAPS: MapConfig[] = [
  // Outdoor themes
  { id: "sunset", label: "Sunset Neighborhood", kind: "outdoor", capacity: 12, width: 1920, height: 1280, spawn: { x: 960, y: 780 }, weather: "clear" },
  { id: "rainy", label: "Rainy City", kind: "outdoor", capacity: 12, width: 1920, height: 1280, spawn: { x: 960, y: 800 }, weather: "rain" },
  { id: "snow", label: "Snow Village", kind: "outdoor", capacity: 12, width: 1920, height: 1280, spawn: { x: 960, y: 800 }, weather: "snow" },
  { id: "neon", label: "Neon District", kind: "outdoor", capacity: 12, width: 1920, height: 1280, spawn: { x: 960, y: 820 }, weather: "clear" },
  // Interiors (portals from the outdoor maps lead here)
  { id: "cafe", label: "Corner Café", kind: "interior", capacity: 6, width: 960, height: 704, spawn: { x: 480, y: 560 }, weather: "clear" },
  { id: "arcade", label: "Pixel Arcade", kind: "interior", capacity: 6, width: 960, height: 704, spawn: { x: 480, y: 560 }, weather: "clear" },
  { id: "cozyhouse", label: "Cozy House", kind: "interior", capacity: 4, width: 896, height: 640, spawn: { x: 448, y: 500 }, weather: "clear" },
  { id: "rooftop", label: "Rooftop", kind: "interior", capacity: 6, width: 1024, height: 704, spawn: { x: 512, y: 560 }, weather: "rain" },
];

export function getMap(id: string): MapConfig | undefined {
  return MAPS.find((m) => m.id === id);
}
