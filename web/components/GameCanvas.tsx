"use client";

import { useEffect, useRef } from "react";
import { WORLD_SIZE } from "@/game/config";

interface GameCanvasProps {
  name: string;
  deviceId: string;
}

export function GameCanvas({ name, deviceId }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: import("phaser").Game | undefined;
    let disposed = false;

    (async () => {
      // Phaser touches `window` at import time, so it's loaded dynamically
      // to keep this component safe under Next.js SSR. Its ESM build has no
      // default export, only named ones, hence the namespace import.
      const Phaser = await import("phaser");
      const { BootScene } = await import("@/game/scenes/BootScene");
      const { NeighborhoodScene } = await import("@/game/scenes/NeighborhoodScene");
      const { HouseScene } = await import("@/game/scenes/HouseScene");
      if (disposed || !containerRef.current) return;

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: WORLD_SIZE.width > 1000 ? 1000 : WORLD_SIZE.width,
        height: 650,
        backgroundColor: "#f7c9a3",
        physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false } },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [BootScene, NeighborhoodScene, HouseScene],
      });
      game.scene.start("Boot", { name, deviceId });
    })();

    return () => {
      disposed = true;
      game?.destroy(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="game-canvas" />;
}
