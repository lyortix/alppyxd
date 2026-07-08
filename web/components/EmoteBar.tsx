"use client";

import { useState } from "react";
import { bus, BusEvents } from "@/game/net/bus";

const EMOTES: Array<{ id: string; emoji: string; label: string }> = [
  { id: "wave", emoji: "👋", label: "wave" },
  { id: "heart", emoji: "❤️", label: "heart" },
  { id: "laugh", emoji: "😂", label: "laugh" },
  { id: "star", emoji: "⭐", label: "star" },
  { id: "music", emoji: "🎵", label: "music" },
  { id: "zzz", emoji: "💤", label: "zzz" },
];

/**
 * Bottom-right social bar: emoji reactions plus sit/dance toggles. Emotes
 * broadcast to the room and pop above your head; sit/dance are sticky until
 * you move.
 */
export function EmoteBar() {
  const [action, setAction] = useState<"" | "sit" | "dance">("");

  const doAction = (next: "" | "sit" | "dance") => {
    const value = action === next ? "" : next;
    setAction(value);
    bus.emit(BusEvents.ActionSend, { action: value });
  };

  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 flex flex-col items-end gap-2">
      <div className="flex gap-1.5 rounded-full bg-[#1c1a24]/70 backdrop-blur border border-white/10 px-2 py-1.5">
        {EMOTES.map((e) => (
          <button
            key={e.id}
            type="button"
            title={e.label}
            onClick={() => bus.emit(BusEvents.EmoteSend, { emote: e.id })}
            className="text-lg leading-none rounded-full w-8 h-8 hover:bg-white/10 active:scale-90 transition-all"
          >
            {e.emoji}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => doAction("sit")}
          className={`rounded-full border px-4 py-1.5 text-sm backdrop-blur transition-colors ${
            action === "sit"
              ? "bg-[#ffb46b] text-[#2c2430] border-transparent font-semibold"
              : "bg-[#1c1a24]/70 border-white/10 hover:bg-[#2e2a3a]"
          }`}
        >
          🪑 sit
        </button>
        <button
          type="button"
          onClick={() => doAction("dance")}
          className={`rounded-full border px-4 py-1.5 text-sm backdrop-blur transition-colors ${
            action === "dance"
              ? "bg-[#ffb46b] text-[#2c2430] border-transparent font-semibold"
              : "bg-[#1c1a24]/70 border-white/10 hover:bg-[#2e2a3a]"
          }`}
        >
          🕺 dance
        </button>
      </div>
    </div>
  );
}
