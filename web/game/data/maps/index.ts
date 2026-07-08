import type { MapDef } from "./types";
import { sunsetMap } from "./sunset";

/**
 * Map registry. Ids must match server/src/config/maps.ts — the server keeps
 * a tiny matchmaking copy (capacity, bounds, spawn) since the two services
 * deploy independently with no shared package.
 */
const ALL_MAPS: MapDef[] = [sunsetMap];

export const MAPS_BY_ID = new Map(ALL_MAPS.map((m) => [m.id, m]));

export function getMapDef(id: string): MapDef {
  const map = MAPS_BY_ID.get(id);
  if (!map) throw new Error(`Unknown map: ${id}`);
  return map;
}

/** Outdoor locations listed in the intro/location picker. */
export function listOutdoorMaps(): MapDef[] {
  return ALL_MAPS.filter((m) => m.kind === "outdoor");
}

export const DEFAULT_MAP_ID = "sunset";
