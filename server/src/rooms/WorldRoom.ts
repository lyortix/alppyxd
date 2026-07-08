import { Room, Client } from "colyseus";
import { WorldState, Player } from "./schema/WorldState";
import { getMap, MapConfig } from "../config/maps";
import { moderateMessage, containsProfanity } from "../moderation/profanityFilter";
import { reportAndBlock, blockPair, isBlockedPair } from "../moderation/store";
import { scheduleWorldEvents } from "../systems/worldEvents";

interface JoinOptions {
  name: string;
  deviceId: string;
  body?: number;
  palette?: number;
  accessory?: number;
}

const MAX_NAME_LENGTH = 20;
const MAX_CHAT_LENGTH = 140;
/** Ids the client may send for one-shot emotes; anything else is dropped. */
const EMOTES = new Set(["wave", "heart", "laugh", "star", "zzz", "music", "surprise", "sad"]);
const ACTIONS = new Set(["", "sit", "dance"]);

/**
 * One instance = one live "room" of a location (map). Multiple concurrent
 * instances of the same map are normal: Colyseus opens a fresh one once the
 * current instance reaches the map's cozy capacity, or when a blocked pair
 * would otherwise meet — a rejected join simply lands the client in a
 * different instance (that is the no-rematch mechanism).
 */
export class WorldRoom extends Room<WorldState> {
  private map!: MapConfig;
  /** sessionId -> anonymous device id. Never exposed via schema. */
  private deviceIdBySession = new Map<string, string>();
  private disposeEvents?: () => void;

  onCreate(options: { mapId: string }) {
    const map = getMap(options?.mapId);
    if (!map) throw new Error(`Unknown map id: ${options?.mapId}`);
    this.map = map;
    this.maxClients = map.capacity;
    this.setState(new WorldState());
    this.state.mapId = map.id;
    this.state.weather = map.weather;
    this.setMetadata({ mapId: map.id });

    if (map.kind === "outdoor") {
      this.disposeEvents = scheduleWorldEvents(this);
    }

    this.onMessage("move", (client, msg: { x: number; y: number; dir: string; moving: boolean }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || !msg || typeof msg.x !== "number" || typeof msg.y !== "number") return;
      player.x = Math.max(0, Math.min(this.map.width, msg.x));
      player.y = Math.max(0, Math.min(this.map.height, msg.y));
      if (msg.dir === "down" || msg.dir === "up" || msg.dir === "left" || msg.dir === "right") {
        player.dir = msg.dir;
      }
      player.moving = !!msg.moving;
      // Any movement cancels a sticky action (stand up from bench, stop dancing).
      if (player.moving && player.action) player.action = "";
    });

    this.onMessage("action", (client, msg: { action: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || !msg || !ACTIONS.has(msg.action)) return;
      player.action = msg.action;
    });

    this.onMessage("chat", (client, msg: { text: string }) => {
      if (!msg || typeof msg.text !== "string") return;
      const clean = moderateMessage(msg.text.slice(0, MAX_CHAT_LENGTH));
      if (!clean) return;
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      this.sendToUnblocked(client, "chat", {
        sessionId: client.sessionId,
        name: player.name,
        text: clean,
      });
    });

    this.onMessage("emote", (client, msg: { emote: string }) => {
      if (!msg || !EMOTES.has(msg.emote)) return;
      this.sendToUnblocked(client, "emote", {
        sessionId: client.sessionId,
        emote: msg.emote,
      });
    });

    this.onMessage("report", (client, msg: { targetSessionId: string }) => {
      this.handleModeration(client, msg?.targetSessionId, "report");
    });

    this.onMessage("block", (client, msg: { targetSessionId: string }) => {
      this.handleModeration(client, msg?.targetSessionId, "block");
    });
  }

  /**
   * Report and block both record a mutual device-id block (report is a block
   * that additionally flags the target for review counters). The acting
   * client then relocates to a fresh instance client-side, and onAuth keeps
   * the pair from ever landing in the same instance again.
   */
  private handleModeration(client: Client, targetSessionId: string | undefined, kind: "report" | "block") {
    if (typeof targetSessionId !== "string") return;
    const actorDeviceId = this.deviceIdBySession.get(client.sessionId);
    const targetDeviceId = this.deviceIdBySession.get(targetSessionId);
    if (!actorDeviceId || !targetDeviceId) return;
    if (kind === "report") reportAndBlock(actorDeviceId, targetDeviceId);
    else blockPair(actorDeviceId, targetDeviceId);
    client.send("moderation-ack", { kind, targetSessionId });
  }

  /** Broadcast that skips recipients who have a block pairing with the sender. */
  private sendToUnblocked(sender: Client, type: string, payload: unknown) {
    const senderDeviceId = this.deviceIdBySession.get(sender.sessionId);
    for (const client of this.clients) {
      const deviceId = this.deviceIdBySession.get(client.sessionId);
      if (
        senderDeviceId &&
        deviceId &&
        client.sessionId !== sender.sessionId &&
        isBlockedPair(senderDeviceId, deviceId)
      ) {
        continue;
      }
      client.send(type, payload);
    }
  }

  onAuth(_client: Client, options: JoinOptions) {
    if (!options?.deviceId || typeof options.deviceId !== "string") {
      throw new Error("Missing anonymous device id");
    }
    if (!options?.name || typeof options.name !== "string" || !options.name.trim()) {
      throw new Error("Missing display name");
    }
    // No-rematch: if anyone already present has an active block with this
    // device id, reject before the client ever appears in state. The client
    // retries against a brand-new instance (see web/game/net/connection.ts).
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
    const rawName = options.name.trim().slice(0, MAX_NAME_LENGTH);
    player.name = !rawName || containsProfanity(rawName) ? "stranger" : rawName;
    player.body = clampIndex(options.body, 3);
    player.palette = clampIndex(options.palette, 8);
    player.accessory = clampIndex(options.accessory, 5);
    // Scatter around the map's spawn point so joiners never stack exactly.
    player.x = this.map.spawn.x + (Math.random() * 120 - 60);
    player.y = this.map.spawn.y + (Math.random() * 60 - 30);
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    this.deviceIdBySession.delete(client.sessionId);
  }

  onDispose() {
    this.disposeEvents?.();
    this.deviceIdBySession.clear();
  }
}

function clampIndex(value: unknown, count: number): number {
  const n = typeof value === "number" ? Math.floor(value) : 0;
  return n >= 0 && n < count ? n : 0;
}
