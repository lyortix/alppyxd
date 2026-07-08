import * as Phaser from "phaser";
import { WorldScene } from "./scenes/WorldScene";
import { AudioSystem } from "./systems/audio";
import type { JoinProfile } from "./net/connection";
import { GAME_BG_COLOR } from "./config";

/**
 * Boots the Phaser game into `parent`, filling it (RESIZE scale mode — the
 * React shell owns layout, the canvas just fills whatever box it gets, which
 * is also what makes mobile "just work"). The profile rides in the registry
 * so any scene can reach it.
 */
export function createGame(parent: HTMLElement, profile: JoinProfile, mapId: string): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: GAME_BG_COLOR,
    physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    // preserveDrawingBuffer lets photo mode grab the canvas as a PNG.
    render: { antialias: true, pixelArt: false, preserveDrawingBuffer: true },
    scene: [],
  });
  game.registry.set("profile", profile);
  game.scene.add("World", WorldScene, true, { mapId });
  // App-lifetime soundscape: survives map travel so the music never restarts.
  const audio = new AudioSystem();
  game.events.once(Phaser.Core.Events.DESTROY, () => audio.destroy());
  // Debug/testing handle (also handy in the browser console).
  (window as unknown as Record<string, unknown>).__LOFI__ = game;
  return game;
}
