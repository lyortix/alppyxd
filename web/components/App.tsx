"use client";

import { useState } from "react";
import { IntroScreen } from "./IntroScreen";
import { GameCanvas } from "./GameCanvas";
import { HUD } from "./HUD";
import { getDeviceId } from "@/lib/deviceId";
import { DEFAULT_MAP_ID } from "@/game/data/maps";
import type { JoinProfile } from "@/game/net/connection";

export function App() {
  const [profile, setProfile] = useState<JoinProfile | null>(null);

  if (!profile) {
    return (
      <IntroScreen
        onEnter={(name, avatar) => setProfile({ name, deviceId: getDeviceId(), ...avatar })}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-[#1c1a24]">
      <GameCanvas profile={profile} mapId={DEFAULT_MAP_ID} />
      <HUD />
    </div>
  );
}
