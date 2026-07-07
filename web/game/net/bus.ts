export type Occupant = { sessionId: string; name: string };

type Listener = (payload?: any) => void;

/**
 * Thin event bridge between the React UI shell (login, HUD) and the Phaser
 * scenes running inside the single canvas. React never touches game state
 * directly; it only emits intents ("send this chat message") and reacts to
 * facts the scenes publish ("you're now inside house X").
 *
 * A tiny hand-rolled emitter rather than Phaser's — this module is imported
 * from "use client" components that still render once on the server, and
 * Phaser touches `window` at import time so it can't be a top-level import
 * anywhere outside the dynamically-imported game code (see GameCanvas.tsx).
 */
class Bus {
  private listeners = new Map<string, Set<Listener>>();

  on(event: string, listener: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
  }

  off(event: string, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  emit(event: string, payload?: any) {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  }
}

export const bus = new Bus();

export const BusEvents = {
  ViewNeighborhood: "view:neighborhood",
  ViewHouse: "view:house", // { houseId, houseName }
  OccupantsUpdate: "occupants:update", // { occupants: Occupant[] }
  ChatSend: "chat:send", // { text }
  ReportSend: "report:send", // { targetSessionId }
  LeaveHouse: "leave:house",
  GameError: "game:error", // { message }
} as const;
