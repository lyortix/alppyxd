import type { Room } from "colyseus";
import type { WorldState } from "../rooms/schema/WorldState";

/**
 * Ambient world events: every few minutes an outdoor room announces a small
 * happening ("a hidden cat appeared…") and may temporarily shift the
 * weather. Purely atmospheric — events write only to synced state, so the
 * client decides how to render them (toast, particles, weather layer).
 */

interface WorldEvent {
  text: string;
  /** Weather override while the event runs; undefined = leave weather alone. */
  weather?: "clear" | "rain" | "snow";
  durationMs: number;
}

const EVENTS: WorldEvent[] = [
  { text: "🌧️ A rain shower is passing through…", weather: "rain", durationMs: 90_000 },
  { text: "🐈 A hidden cat appeared somewhere nearby", durationMs: 60_000 },
  { text: "🏮 The night market opened its lanterns", durationMs: 120_000 },
  { text: "🎐 A soft wind carries distant chimes", durationMs: 60_000 },
  { text: "⭐ Someone swears they saw a shooting star", durationMs: 45_000 },
  { text: "🍜 The café put a fresh pot on the stove", durationMs: 60_000 },
];

const MIN_GAP_MS = Number(process.env.EVENT_MIN_GAP_MS) || 3 * 60_000;
const MAX_GAP_MS = Number(process.env.EVENT_MAX_GAP_MS) || 6 * 60_000;

export function scheduleWorldEvents(room: Room<WorldState>): () => void {
  const baseWeather = room.state.weather;
  let eventTimer: NodeJS.Timeout | undefined;
  let endTimer: NodeJS.Timeout | undefined;

  const scheduleNext = () => {
    const gap = MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);
    eventTimer = setTimeout(() => {
      // Skip empty rooms; the world only stirs when someone is there to see it.
      if (room.clients.length === 0) {
        scheduleNext();
        return;
      }
      const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      room.state.eventText = event.text;
      if (event.weather) room.state.weather = event.weather;
      endTimer = setTimeout(() => {
        room.state.eventText = "";
        room.state.weather = baseWeather;
        scheduleNext();
      }, event.durationMs);
    }, gap);
  };

  scheduleNext();
  return () => {
    if (eventTimer) clearTimeout(eventTimer);
    if (endTimer) clearTimeout(endTimer);
  };
}
