import { Client, Room } from "colyseus.js";
import { getWsBase } from "@/lib/serverConfig";

let client: Client | null = null;

export function getColyseusClient(): Client {
  if (!client) {
    client = new Client(getWsBase());
  }
  return client;
}

interface JoinHouseOptions {
  name: string;
  deviceId: string;
}

const MAX_JOIN_ATTEMPTS = 3;

/**
 * Joins a house, honoring no-rematch: the server rejects the join (via
 * onAuth) if anyone already present has an active report/block with this
 * device id. On rejection we don't retry the same instance — we spin up a
 * brand new one, which can never contain a conflicting occupant.
 */
export async function joinHouse(
  houseId: string,
  options: JoinHouseOptions
): Promise<Room> {
  const roomName = `house_${houseId}`;
  const client = getColyseusClient();
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_JOIN_ATTEMPTS; attempt++) {
    try {
      return attempt === 0
        ? await client.joinOrCreate(roomName, options)
        : await client.create(roomName, options);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
