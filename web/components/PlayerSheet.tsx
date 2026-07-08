"use client";

import { useEffect, useState } from "react";
import { bus, BusEvents } from "@/game/net/bus";

interface Target {
  sessionId: string;
  name: string;
}

/**
 * Tap/click another player → this sheet. Friendly action first (wave),
 * then safety: report (flags + blocks) and block. Both record a mutual
 * anonymous-device-id block server-side and move you to a fresh room —
 * the two of you can never be matched into the same room again.
 */
export function PlayerSheet() {
  const [target, setTarget] = useState<Target | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  useEffect(() => {
    const offs = [
      bus.on(BusEvents.PlayerClicked, (p: Target) => setTarget(p)),
      bus.on(BusEvents.ModerationDone, (p: { kind: string }) => {
        setTarget(null);
        setConfirmation(
          p.kind === "report"
            ? "thanks for the report. you won't meet them again."
            : "blocked. you won't meet them again."
        );
        setTimeout(() => setConfirmation(null), 4000);
      }),
      bus.on(BusEvents.WorldEntered, () => setTarget(null)),
    ];
    return () => offs.forEach((off) => off());
  }, []);

  if (confirmation) {
    return (
      <div className="absolute bottom-24 inset-x-0 flex justify-center px-4">
        <div className="rounded-full bg-[#26303a]/90 backdrop-blur border border-[#9dd9c0]/30 px-5 py-2 text-sm">
          ✅ {confirmation}
        </div>
      </div>
    );
  }

  if (!target) return null;

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-30 flex items-end sm:items-center justify-center bg-[#12101a]/50 p-4"
      onClick={() => setTarget(null)}
    >
      <div
        className="w-full max-w-xs rounded-3xl bg-[#262230]/95 border border-white/10 shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-lg font-semibold truncate">{target.name}</p>
        <p className="text-center text-xs text-[#6b6478] mt-0.5">a fellow stranger</p>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => {
              bus.emit(BusEvents.EmoteSend, { emote: "wave" });
              setTarget(null);
            }}
            className="w-full rounded-xl bg-[#1c1a24] border border-white/10 px-4 py-2.5 text-sm hover:bg-[#2e2a3a] transition-colors"
          >
            👋 wave hello
          </button>
          <button
            type="button"
            onClick={() => bus.emit(BusEvents.BlockPlayer, { targetSessionId: target.sessionId })}
            className="w-full rounded-xl bg-[#1c1a24] border border-white/10 px-4 py-2.5 text-sm hover:bg-[#2e2a3a] transition-colors"
          >
            🚫 block — never match us again
          </button>
          <button
            type="button"
            onClick={() => bus.emit(BusEvents.ReportPlayer, { targetSessionId: target.sessionId })}
            className="w-full rounded-xl bg-[#3a2430] border border-[#ff8f8f]/30 px-4 py-2.5 text-sm text-[#ffb3b3] hover:bg-[#4a2e3c] transition-colors"
          >
            🚩 report — flag and block
          </button>
          <button
            type="button"
            onClick={() => setTarget(null)}
            className="w-full rounded-xl px-4 py-2 text-sm text-[#b8b0c8] hover:text-white transition-colors"
          >
            never mind
          </button>
        </div>
      </div>
    </div>
  );
}
