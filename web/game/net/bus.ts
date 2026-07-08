type Listener = (payload?: any) => void;

/**
 * Thin event bridge between the React UI shell (intro, HUD) and the Phaser
 * scenes running inside the single canvas. React never touches game state
 * directly; it emits intents ("send this chat message") and reacts to facts
 * the scenes publish ("you entered the café").
 *
 * A tiny hand-rolled emitter rather than Phaser's — this module is imported
 * from "use client" components that still render once on the server, and
 * Phaser touches `window` at import time so it can't be a top-level import
 * anywhere outside the dynamically-imported game code (see GameCanvas.tsx).
 */
class Bus {
  private listeners = new Map<string, Set<Listener>>();

  on(event: string, listener: Listener): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
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
  // Phaser -> React
  WorldEntered: "world:entered", // { mapId, label, kind }
  RosterUpdate: "roster:update", // { players: {sessionId, name}[], selfId }
  ChatReceived: "chat:received", // { sessionId, name, text, self }
  EventAnnounce: "event:announce", // { text } "" = cleared
  GameError: "game:error", // { message }
  // React -> Phaser
  ChatSend: "chat:send", // { text }
  EmoteSend: "emote:send", // { emote }
  ActionSend: "action:send", // { action } "sit" | "dance" | ""
  TravelTo: "travel:to", // { mapId }
  ReportPlayer: "report:player", // { targetSessionId }
  BlockPlayer: "block:player", // { targetSessionId }
  PhotoMode: "photo:mode", // { enabled }
  AudioSettings: "audio:settings", // { music, sfx } booleans
} as const;
