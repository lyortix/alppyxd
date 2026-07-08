"use client";

import { useEffect, useState } from "react";
import { bus, BusEvents } from "@/game/net/bus";
import { fetchPresence } from "@/game/net/connection";
import { listTravelMaps } from "@/game/data/maps";

interface TravelPickerProps {
  currentMapId: string;
  onClose: () => void;
}

const THEME_EMOJI: Record<string, string> = {
  sunset: "🌇",
  rainy: "🌧️",
  snow: "❄️",
  neon: "🌃",
  cafe: "☕",
  arcade: "🕹️",
  cozyhouse: "🏠",
  rooftop: "🌆",
};

/**
 * Location list with live population. Busy places glow, empty places dim —
 * the soft nudge that keeps strangers gathering instead of scattering.
 */
export function TravelPicker({ currentMapId, onClose }: TravelPickerProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let alive = true;
    const poll = () =>
      fetchPresence()
        .then((p) => alive && setCounts(p.counts))
        .catch(() => {});
    poll();
    const t = setInterval(poll, 3000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const maps = listTravelMaps();

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-[#12101a]/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl bg-[#262230]/95 border border-white/10 shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Where to?</h2>
          <button type="button" onClick={onClose} className="text-[#b8b0c8] hover:text-white px-2" aria-label="close">
            ✕
          </button>
        </div>
        <ul className="mt-3 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {maps.map((m) => {
            const count = counts[m.id] ?? 0;
            const here = m.id === currentMapId;
            const busy = count > 0;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  disabled={here}
                  onClick={() => {
                    bus.emit(BusEvents.TravelTo, { mapId: m.id });
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                    here
                      ? "border-[#ffb46b]/50 bg-[#ffb46b]/10 cursor-default"
                      : busy
                        ? "border-[#ffd166]/40 bg-[#1c1a24] hover:bg-[#2e2a3a] shadow-[0_0_16px_rgba(255,209,102,0.12)]"
                        : "border-white/10 bg-[#1c1a24]/60 opacity-70 hover:opacity-100 hover:bg-[#2e2a3a]"
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="text-xl">{THEME_EMOJI[m.id] ?? "📍"}</span>
                    <span className="min-w-0">
                      <span className="block truncate">{m.label}</span>
                      <span className="block text-[11px] text-[#6b6478]">
                        {m.kind === "interior" ? "hangout room" : "neighborhood"}
                        {here ? " · you are here" : ""}
                      </span>
                    </span>
                  </span>
                  <span className={`shrink-0 text-xs rounded-full px-2.5 py-1 ${busy ? "bg-[#ffd166]/20 text-[#ffd166]" : "bg-white/5 text-[#6b6478]"}`}>
                    {busy ? `● ${count}` : "quiet"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
