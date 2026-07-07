import { Room, Client } from "colyseus";
import { HouseState, Player } from "./schema/HouseState";
import { HOUSES } from "../houses";
import { moderateMessage } from "../moderation/profanityFilter";
import { reportAndBlock, isBlockedPair } from "../moderation/store";

interface JoinOptions {
  name: string;
  deviceId: string;
}

interface ChatMessage {
  type: "chat";
  text: string;
}

interface ReportMessage {
  type: "report";
  targetSessionId: string;
}

const MAX_NAME_LENGTH = 20;

/**
 * One instance = one "house" of chill group chat. Multiple concurrent
 * instances of the same house id are normal (Colyseus spins up a fresh one
 * once the current instance is full or has a blocked-pair conflict) — this
 * doubles as the no-rematch mechanism: a rejected join simply lands the
 * client in a different instance next attempt.
 */
export class HouseRoom extends Room<HouseState> {
  maxClients = 6;

  /** sessionId -> anonymous device id. Never exposed via schema. */
  private deviceIdBySession = new Map<string, string>();

  onCreate(options: { houseId: string }) {
    const house = HOUSES.find((h) => h.id === options.houseId);
    if (!house) {
      throw new Error(`Unknown house id: ${options.houseId}`);
    }
    this.maxClients = house.capacity;
    this.setState(new HouseState());
    this.state.houseId = house.id;
    this.setMetadata({ houseId: house.id });

    this.onMessage("chat", (client, message: ChatMessage) => {
      if (!message || typeof message.text !== "string") return;
      const clean = moderateMessage(message.text);
      if (!clean) return;
      const player = this.state.players.get(client.sessionId);
      this.broadcast("chat", {
        sessionId: client.sessionId,
        name: player?.name ?? "?",
        text: clean,
      });
    });

    this.onMessage("move", (client, message: { x: number; y: number; dir: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || !message) return;
      player.x = message.x;
      player.y = message.y;
      if (typeof message.dir === "string") player.dir = message.dir;
    });

    this.onMessage("report", (client, message: ReportMessage) => {
      if (!message || typeof message.targetSessionId !== "string") return;
      const reporterDeviceId = this.deviceIdBySession.get(client.sessionId);
      const targetDeviceId = this.deviceIdBySession.get(message.targetSessionId);
      if (!reporterDeviceId || !targetDeviceId) return;
      reportAndBlock(reporterDeviceId, targetDeviceId);
      client.send("report-ack", { targetSessionId: message.targetSessionId });
    });
  }

  onAuth(_client: Client, options: JoinOptions) {
    if (!options?.deviceId || typeof options.deviceId !== "string") {
      throw new Error("Missing anonymous device id");
    }
    if (!options?.name || typeof options.name !== "string") {
      throw new Error("Missing display name");
    }
    // No-rematch enforcement happens here, before the client is ever added
    // to state: if anyone already present has an active block with this
    // device id, reject the join. The client is expected to retry against a
    // fresh instance of the same house (see net/houseClient.ts on the front end).
    for (const existingDeviceId of this.deviceIdBySession.values()) {
      if (isBlockedPair(options.deviceId, existingDeviceId)) {
        throw new Error("blocked-pair");
      }
    }
    return true;
  }

  onJoin(client: Client, options: JoinOptions) {
    this.deviceIdBySession.set(client.sessionId, options.deviceId);
    const player = new Player();
    player.name = options.name.slice(0, MAX_NAME_LENGTH);
    // Spawn scattered near the center of the room so new joiners don't stack exactly.
    player.x = 400 + (Math.random() * 120 - 60);
    player.y = 300 + (Math.random() * 80 - 40);
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    this.deviceIdBySession.delete(client.sessionId);
  }

  onDispose() {
    this.deviceIdBySession.clear();
  }
}
