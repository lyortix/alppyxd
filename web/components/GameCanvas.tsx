"use client";

import { useEffect, useRef } from "react";
import type { JoinProfile } from "@/game/net/connection";

interface GameCanvasProps {
  profile: JoinProfile;
  mapId: string;
}

export function GameCanvas({ profile, mapId }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: import("phaser").Game | undefined;
    let disposed = false;

    (async () => {
      // Phaser touches `window` at import time, so the whole game module is
      // loaded dynamically to stay safe under Next.js SSR.
      const { createGame } = await import("@/game/main");
      if (disposed || !containerRef.current) return;
      game = createGame(containerRef.current, profile, mapId);
    })();

    return () => {
      disposed = true;
      game?.destroy(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}
