"use client";

import { useEffect, useState } from "react";
import { bus, BusEvents } from "@/game/net/bus";

/**
 * Photo mode: hide all HUD chrome, push the camera in for a cinematic frame,
 * add letterbox bars, and expose a shutter that grabs the Phaser canvas as a
 * PNG the user can save/share. The whole point is that the world looks good
 * in a screenshot — this makes capturing one effortless.
 */
export function PhotoMode({ onToggle }: { onToggle: (on: boolean) => void }) {
  const [on, setOn] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    onToggle(on);
    bus.emit(BusEvents.PhotoMode, { enabled: on });
  }, [on, onToggle]);

  const capture = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 220);
    // Phaser renders with preserveDrawingBuffer off by default, so grab on the
    // next animation frame right after a render.
    requestAnimationFrame(() => {
      try {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `lofi-square-${Date.now()}.png`;
        a.click();
      } catch {
        /* tainted canvas — ignore */
      }
    });
  };

  if (!on) {
    return (
      <button
        type="button"
        onClick={() => setOn(true)}
        className="pointer-events-auto absolute top-16 right-4 rounded-full bg-[#1c1a24]/70 backdrop-blur border border-white/10 w-9 h-9 text-base hover:bg-[#2e2a3a] transition-colors"
        aria-label="photo mode"
        title="photo mode"
      >
        📷
      </button>
    );
  }

  return (
    <>
      {/* letterbox bars */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[8vh] bg-black/70" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[8vh] bg-black/70" />
      {flash && <div className="pointer-events-none absolute inset-0 bg-white animate-pulse" />}

      <div className="pointer-events-auto absolute bottom-[9vh] inset-x-0 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setOn(false)}
          className="rounded-full bg-[#1c1a24]/80 backdrop-blur border border-white/15 px-4 py-2 text-sm hover:bg-[#2e2a3a] transition-colors"
        >
          ✕ exit
        </button>
        <button
          type="button"
          onClick={capture}
          className="rounded-full bg-white text-[#2c2430] w-16 h-16 text-2xl font-bold shadow-2xl active:scale-95 transition-transform border-4 border-white/40"
          aria-label="capture"
        >
          📸
        </button>
        <div className="w-[72px]" />
      </div>

      <div className="pointer-events-none absolute top-[9vh] inset-x-0 flex justify-center">
        <div className="rounded-full bg-black/50 px-4 py-1.5 text-xs text-white/80">
          photo mode · move freely, then tap 📸
        </div>
      </div>
    </>
  );
}
