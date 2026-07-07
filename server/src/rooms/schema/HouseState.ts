import { Schema, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") name: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  /** Facing/animation direction: "down" | "up" | "left" | "right". */
  @type("string") dir: string = "down";
  // Note: deviceId is intentionally NOT part of the synced schema — it's
  // moderation-only and kept server-side (Room.deviceIdBySession) so a
  // malicious client can never read another player's device id and spoof
  // report calls against it.
}

export class HouseState extends Schema {
  @type("string") houseId: string = "";
  @type({ map: Player }) players = new MapSchema<Player>();
}
