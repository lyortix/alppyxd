import { Schema, MapSchema, type } from "@colyseus/schema";

/**
 * One synced player. Note: the anonymous device id is intentionally NOT part
 * of the schema — it is moderation-only and kept server-side
 * (WorldRoom.deviceIdBySession) so a malicious client can never read another
 * player's device id.
 */
export class Player extends Schema {
  @type("string") name: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  /** Facing: "down" | "up" | "left" | "right". */
  @type("string") dir: string = "down";
  @type("boolean") moving: boolean = false;
  /** Sticky action: "" | "sit" | "dance". One-shot actions (wave) are messages. */
  @type("string") action: string = "";
  /** Avatar recipe — body style / palette / accessory indices into the shared catalog. */
  @type("uint8") body: number = 0;
  @type("uint8") palette: number = 0;
  @type("uint8") accessory: number = 0;
}

export class WorldState extends Schema {
  @type("string") mapId: string = "";
  /** Current weather: "clear" | "rain" | "snow". World events may change it. */
  @type("string") weather: string = "clear";
  /** Active world event announcement ("" when none). */
  @type("string") eventText: string = "";
  @type({ map: Player }) players = new MapSchema<Player>();
}
