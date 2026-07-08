import * as Phaser from "phaser";

/**
 * Screen-space weather particles (rain streaks / drifting snow). Rendered
 * with scrollFactor 0 so one emitter covers the viewport regardless of map
 * size — cheap enough for phones. Driven by synced room state, so world
 * events that change the weather appear for everyone at once.
 */
export class WeatherSystem {
  private scene: Phaser.Scene;
  private rain?: Phaser.GameObjects.Particles.ParticleEmitter;
  private snow?: Phaser.GameObjects.Particles.ParticleEmitter;
  private current = "clear";

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    if (!scene.textures.exists("particle-rain")) {
      const g = scene.add.graphics();
      g.fillStyle(0xbdd7e8, 1);
      g.fillRoundedRect(0, 0, 2.5, 14, 1);
      g.generateTexture("particle-rain", 3, 14);
      g.clear();
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 3.5);
      g.generateTexture("particle-snow", 8, 8);
      g.destroy();
    }
  }

  set(weather: string) {
    if (weather === this.current) return;
    this.current = weather;
    this.rain?.destroy();
    this.snow?.destroy();
    this.rain = undefined;
    this.snow = undefined;

    // Wide emit band so window resizes stay covered.
    const w = 2800;
    if (weather === "rain") {
      this.rain = this.scene.add.particles(0, 0, "particle-rain", {
        x: { min: -200, max: w },
        y: -30,
        lifespan: 1300,
        speedY: { min: 850, max: 1050 },
        speedX: { min: 90, max: 140 },
        alpha: { start: 0.5, end: 0.15 },
        scale: { min: 0.7, max: 1.1 },
        quantity: 3,
        frequency: 16,
        rotate: -8,
      });
      this.rain.setScrollFactor(0).setDepth(120000);
    } else if (weather === "snow") {
      this.snow = this.scene.add.particles(0, 0, "particle-snow", {
        x: { min: -200, max: w },
        y: -20,
        lifespan: 9000,
        speedY: { min: 45, max: 110 },
        speedX: { min: -35, max: 35 },
        alpha: { start: 0.9, end: 0.3 },
        scale: { min: 0.4, max: 1 },
        quantity: 1,
        frequency: 36,
      });
      this.snow.setScrollFactor(0).setDepth(120000);
    }
  }

  destroy() {
    this.rain?.destroy();
    this.snow?.destroy();
  }
}
