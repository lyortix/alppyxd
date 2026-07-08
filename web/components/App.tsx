"use client";

import { useState } from "react";
import { LoginScreen } from "./LoginScreen";
import { GameCanvas } from "./GameCanvas";
import { HUD } from "./HUD";
import { getDeviceId } from "@/lib/deviceId";

interface Identity {
  name: string;
  age: number;
  deviceId: string;
}

export function App() {
  const [identity, setIdentity] = useState<Identity | null>(null);

  if (!identity) {
    return (
      <LoginScreen
        onEnter={(name, age) => setIdentity({ name, age, deviceId: getDeviceId() })}
      />
    );
  }

  return (
    <div className="game-shell">
      <GameCanvas name={identity.name} deviceId={identity.deviceId} />
      <HUD />
    </div>
  );
}
