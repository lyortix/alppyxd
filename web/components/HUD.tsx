"use client";

import { useEffect, useState } from "react";
import { bus, BusEvents } from "@/game/net/bus";

/**
 * React overlay above the Phaser canvas. Phase 1 scope: current location
 * badge + connection errors. Chat panel, emotes, settings and photo mode
 * arrive with their phases.
 */
export function HUD() {
  const [location, setLocation] = useState<{ label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const offs = [
      bus.on(BusEvents.WorldEntered, (p: { label: string }) => setLocation(p)),
      bus.on(BusEvents.GameError, (p: { message: string }) => setError(p.message)),
    ];
    return () => offs.forEach((off) => off());
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 text-[#f2ecdf]">
      {location && (
        <div className="absolute top-4 left-4 rounded-full bg-[#1c1a24]/70 backdrop-blur border border-white/10 px-4 py-1.5 text-sm">
          📍 {location.label}
        </div>
      )}
      {error && (
        <div className="absolute inset-x-0 top-1/3 flex justify-center px-4">
          <div className="pointer-events-auto rounded-2xl bg-[#3a2430]/95 border border-[#ff8f8f]/30 px-6 py-4 text-center shadow-xl">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-[#ff8f8f] text-[#2c2430] px-4 py-1.5 text-sm font-semibold"
            >
              reload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
