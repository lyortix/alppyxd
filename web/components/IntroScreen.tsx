"use client";

import { useEffect, useRef, useState } from "react";
import { BODIES, PALETTES, ACCESSORIES, randomAvatar, type AvatarRecipe } from "@/lib/avatar";

interface IntroScreenProps {
  onEnter: (name: string, avatar: AvatarRecipe) => void;
}

/**
 * The front door: nickname + strict 18+ age gate + avatar picker. Nothing
 * entered here is ever persisted anywhere — the age is checked client-side
 * and discarded, the nickname lives only in the room state while connected.
 */
export function IntroScreen({ onEnter }: IntroScreenProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  // Deterministic initial value: this component prerenders on the server, so
  // randomizing here would cause a hydration mismatch. Shuffle after mount.
  const [avatar, setAvatar] = useState<AvatarRecipe>({ body: 0, palette: 0, accessory: 1 });
  useEffect(() => setAvatar(randomAvatar()), []);

  const ageNum = parseInt(age, 10);
  const ageValid = Number.isFinite(ageNum) && ageNum >= 18 && ageNum < 120;
  const underage = Number.isFinite(ageNum) && ageNum > 0 && ageNum < 18;
  const canEnter = name.trim().length >= 2 && ageValid;

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#1c1a24] text-[#f2ecdf] intro-bg">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-[#262230]/90 backdrop-blur border border-white/10 shadow-2xl p-8">
          <h1 className="text-3xl font-bold tracking-tight text-center">
            Lo-Fi <span className="text-[#ffb46b]">Square</span>
          </h1>
          <p className="mt-2 text-center text-sm text-[#b8b0c8]">
            an anonymous lo-fi neighborhood. walk around, meet strangers, stay a while.
          </p>

          <div className="mt-6 flex flex-col items-center gap-3">
            <AvatarPreview avatar={avatar} />
            <div className="grid grid-cols-3 gap-2 w-full text-xs">
              <Cycler
                label="Style"
                value={BODIES[avatar.body].label}
                onPrev={() => setAvatar((a) => ({ ...a, body: (a.body + BODIES.length - 1) % BODIES.length }))}
                onNext={() => setAvatar((a) => ({ ...a, body: (a.body + 1) % BODIES.length }))}
              />
              <Cycler
                label="Colors"
                value={PALETTES[avatar.palette].label}
                onPrev={() => setAvatar((a) => ({ ...a, palette: (a.palette + PALETTES.length - 1) % PALETTES.length }))}
                onNext={() => setAvatar((a) => ({ ...a, palette: (a.palette + 1) % PALETTES.length }))}
              />
              <Cycler
                label="Extra"
                value={ACCESSORIES[avatar.accessory].label}
                onPrev={() =>
                  setAvatar((a) => ({ ...a, accessory: (a.accessory + ACCESSORIES.length - 1) % ACCESSORIES.length }))
                }
                onNext={() => setAvatar((a) => ({ ...a, accessory: (a.accessory + 1) % ACCESSORIES.length }))}
              />
            </div>
            <button
              type="button"
              onClick={() => setAvatar(randomAvatar())}
              className="text-xs text-[#b8b0c8] hover:text-white transition-colors"
            >
              🎲 shuffle
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm text-[#b8b0c8]">Nickname</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                placeholder="e.g. rainykid"
                className="mt-1 w-full rounded-xl bg-[#1c1a24] border border-white/10 px-4 py-3 outline-none focus:border-[#ffb46b]/60 placeholder:text-[#6b6478]"
                autoFocus
              />
            </label>
            <label className="block">
              <span className="text-sm text-[#b8b0c8]">Age</span>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))}
                inputMode="numeric"
                placeholder="18+"
                className="mt-1 w-full rounded-xl bg-[#1c1a24] border border-white/10 px-4 py-3 outline-none focus:border-[#ffb46b]/60 placeholder:text-[#6b6478]"
              />
            </label>
            {underage && (
              <p className="text-sm text-[#ff8f8f]">
                Lo-Fi Square is 18+ only. See you in a few years. 🌙
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={!canEnter}
            onClick={() => canEnter && onEnter(name.trim(), avatar)}
            className="mt-6 w-full rounded-xl bg-[#ffb46b] text-[#2c2430] font-semibold py-3 transition-all enabled:hover:bg-[#ffc78d] enabled:hover:shadow-[0_0_24px_rgba(255,180,107,0.35)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            step outside →
          </button>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-[#6b6478]">
            no accounts · no tracking · nothing stored.
            <br />
            your nickname and age vanish when you leave.
          </p>
        </div>
      </div>
    </div>
  );
}

function AvatarPreview({ avatar }: { avatar: AvatarRecipe }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // characters.ts only type-imports Phaser, so it is safe to load client-side.
      const { drawAvatarPreview } = await import("@/game/render/characters");
      if (!cancelled && canvasRef.current) drawAvatarPreview(canvasRef.current, avatar);
    })();
    return () => {
      cancelled = true;
    };
  }, [avatar]);

  return (
    <div className="rounded-2xl bg-[#1c1a24] border border-white/10 p-2">
      <canvas ref={canvasRef} width={96} height={144} className="block" />
    </div>
  );
}

function Cycler({
  label,
  value,
  onPrev,
  onNext,
}: {
  label: string;
  value: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="rounded-xl bg-[#1c1a24] border border-white/10 px-2 py-1.5 flex items-center justify-between gap-1">
      <button type="button" onClick={onPrev} className="px-1 text-[#b8b0c8] hover:text-white" aria-label={`previous ${label}`}>
        ‹
      </button>
      <div className="text-center min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-[#6b6478]">{label}</div>
        <div className="truncate">{value}</div>
      </div>
      <button type="button" onClick={onNext} className="px-1 text-[#b8b0c8] hover:text-white" aria-label={`next ${label}`}>
        ›
      </button>
    </div>
  );
}
