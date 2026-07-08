import { Client, Room } from "colyseus.js";
import { getWsBase, getHttpBase } from "@/lib/serverConfig";
import type { AvatarRecipe } from "@/lib/avatar";

let client: Client | null = null;

export function getColyseusClient(): Client {
  if (!client) {
    client = new Client(getWsBase());
  }
  return client;
}

export interface JoinProfile extends AvatarRecipe {
  name: string;
  deviceId: string;
}

const MAX_JOIN_ATTEMPTS = 3;

/**
 * Joins a map's live room, honoring no-rematch: the server rejects the join
 * (via onAuth) when anyone already present has an active report/block with
 * this device id. On rejection we don't retry the same instance — we spin up
 * a brand new one, which can never contain a conflicting occupant.
 */
export async function joinMap(mapId: string, profile: JoinProfile): Promise<Room> {
  const options = { mapId, ...profile };
  const c = getColyseusClient();
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_JOIN_ATTEMPTS; attempt++) {
    try {
      return attempt === 0
        ? await c.joinOrCreate("world", options)
        : await c.create("world", options);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export interface Presence {
  counts: Record<string, number>;
  total: number;
}

export async function fetchPresence(): Promise<Presence> {
  const res = await fetch(`${getHttpBase()}/presence`, { cache: "no-store" });
  if (!res.ok) throw new Error(`presence ${res.status}`);
  return res.json();
}
