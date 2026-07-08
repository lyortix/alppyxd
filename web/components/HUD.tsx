"use client";

import { useEffect, useState } from "react";
import { bus, BusEvents } from "@/game/net/bus";
import { TravelPicker } from "./TravelPicker";
import { ChatPanel } from "./ChatPanel";
import { EmoteBar } from "./EmoteBar";
import { SettingsMenu } from "./SettingsMenu";
import { EventToast } from "./EventToast";
import { PlayerSheet } from "./PlayerSheet";

/**
 * React overlay above the Phaser canvas: location badge, travel picker,
 * connection errors. Chat, emotes and settings arrive with their phases.
 */
export function HUD() {
  const [location, setLocation] = useState<{ mapId: string; label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTravel, setShowTravel] = useState(false);

  useEffect(() => {
    const offs = [
      bus.on(BusEvents.WorldEntered, (p: { mapId: string; label: string }) => {
        setLocation(p);
        setShowTravel(false);
      }),
      bus.on(BusEvents.GameError, (p: { message: string }) => setError(p.message)),
    ];
    return () => offs.forEach((off) => off());
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 text-[#f2ecdf]">
      {location && (
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="rounded-full bg-[#1c1a24]/70 backdrop-blur border border-white/10 px-4 py-1.5 text-sm">
            📍 {location.label}
          </div>
          <button
            type="button"
            onClick={() => setShowTravel(true)}
            className="pointer-events-auto rounded-full bg-[#1c1a24]/70 backdrop-blur border border-white/10 px-3 py-1.5 text-sm hover:bg-[#2e2a3a] transition-colors"
          >
            🗺️ travel
          </button>
        </div>
      )}

      {showTravel && location && (
        <TravelPicker currentMapId={location.mapId} onClose={() => setShowTravel(false)} />
      )}

      {location && (
        <>
          <ChatPanel />
          <EmoteBar />
          <SettingsMenu />
          <EventToast />
          <PlayerSheet />
        </>
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
