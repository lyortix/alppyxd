"use client";

import { useEffect, useState } from "react";
import { bus, BusEvents } from "@/game/net/bus";

function readSetting(key: string): boolean {
  try {
    return window.localStorage.getItem(key) !== "off";
  } catch {
    return true;
  }
}

/**
 * Top-right ⚙ popover: music & ambience mutes (persisted per browser).
 */
export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [music, setMusic] = useState(true);
  const [sfx, setSfx] = useState(true);

  useEffect(() => {
    setMusic(readSetting("lofi-music"));
    setSfx(readSetting("lofi-sfx"));
  }, []);

  const apply = (nextMusic: boolean, nextSfx: boolean) => {
    setMusic(nextMusic);
    setSfx(nextSfx);
    bus.emit(BusEvents.AudioSettings, { music: nextMusic, sfx: nextSfx });
  };

  return (
    <div className="pointer-events-auto absolute top-4 right-4 flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-[#1c1a24]/70 backdrop-blur border border-white/10 w-9 h-9 text-base hover:bg-[#2e2a3a] transition-colors"
        aria-label="settings"
      >
        ⚙️
      </button>
      {open && (
        <div className="rounded-2xl bg-[#262230]/95 border border-white/10 shadow-xl p-3 w-48 space-y-2 text-sm">
          <Toggle label="🎵 lo-fi music" value={music} onChange={(v) => apply(v, sfx)} />
          <Toggle label="🌧️ ambience" value={sfx} onChange={(v) => apply(music, v)} />
          <p className="text-[10px] text-[#6b6478] leading-snug pt-1">
            all sound is generated live in your browser — nothing is downloaded.
          </p>
        </div>
      )}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5"
    >
      <span>{label}</span>
      <span
        className={`relative inline-block w-9 h-5 rounded-full transition-colors ${value ? "bg-[#ffb46b]" : "bg-white/15"}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-[18px]" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}
