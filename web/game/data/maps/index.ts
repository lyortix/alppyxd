import type { MapDef } from "./types";
import { sunsetMap } from "./sunset";
import { rainyMap } from "./rainy";
import { snowMap } from "./snow";
import { neonMap } from "./neon";
import { cafeMap, arcadeMap, cozyHouseMap, rooftopMap } from "./interiors";

/**
 * Map registry. Ids must match server/src/config/maps.ts — the server keeps
 * a tiny matchmaking copy (capacity, bounds, spawn) since the two services
 * deploy independently with no shared package.
 */
const ALL_MAPS: MapDef[] = [
  sunsetMap,
  rainyMap,
  snowMap,
  neonMap,
  cafeMap,
  arcadeMap,
  cozyHouseMap,
  rooftopMap,
];

export const MAPS_BY_ID = new Map(ALL_MAPS.map((m) => [m.id, m]));

export function getMapDef(id: string): MapDef {
  const map = MAPS_BY_ID.get(id);
  if (!map) throw new Error(`Unknown map: ${id}`);
  return map;
}

/** Locations listed in the travel picker, outdoor themes first. */
export function listTravelMaps(): MapDef[] {
  return [...ALL_MAPS].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "outdoor" ? -1 : 1));
}

export const DEFAULT_MAP_ID = "sunset";
