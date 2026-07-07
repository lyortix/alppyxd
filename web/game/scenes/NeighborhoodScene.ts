import * as Phaser from "phaser";
import { HOUSES, PALETTE, PLAYER_SPEED, WORLD_SIZE } from "../config";
import { getHttpBase } from "@/lib/serverConfig";
import { bus, BusEvents } from "../net/bus";

interface NeighborhoodData {
  name: string;
  deviceId: string;
  spawnX?: number;
  spawnY?: number;
}

/**
 * Houses only need to reach this many total concurrent players before the
 * next one in line unlocks. Mirrors server/src/houses.ts revealAtTotalPlayers
 * (kept here too since the two services aren't a shared-package monorepo).
 */
const REVEAL_THRESHOLDS: Record<string, number> = {
  cafe: 0,
  cabin: 0,
  bookshop: 3,
  arcade: 6,
  greenhouse: 10,
};

const OCCUPANCY_POLL_MS = 3000;
const ENTER_RADIUS = 70;

export class NeighborhoodScene extends Phaser.Scene {
  private sceneData!: NeighborhoodData;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private houseSprites = new Map<
    string,
    { sprite: Phaser.GameObjects.Image; label: Phaser.GameObjects.Text; glow: Phaser.GameObjects.Image }
  >();
  private occupancy: Record<string, number> = {};
  private totalPlayers = 0;
  private pollTimer?: ReturnType<typeof setInterval>;
  private prompt!: Phaser.GameObjects.Text;
  private enterKey!: Phaser.Input.Keyboard.Key;

  // simple on-screen joystick state (mobile)
  private joystickBase?: Phaser.GameObjects.Arc;
  private joystickKnob?: Phaser.GameObjects.Arc;
  private joystickPointerId: number | null = null;
  private joystickVector = new Phaser.Math.Vector2(0, 0);

  constructor() {
    super("Neighborhood");
  }

  init(data: NeighborhoodData) {
    this.sceneData = data;
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD_SIZE.width, WORLD_SIZE.height);
    this.cameras.main.setBounds(0, 0, WORLD_SIZE.width, WORLD_SIZE.height);

    this.drawBackground();
    this.scatterDecorations();
    this.createHouses();

    const startX = this.sceneData.spawnX ?? WORLD_SIZE.width / 2;
    const startY = this.sceneData.spawnY ?? WORLD_SIZE.height / 2 + 100;
    this.player = this.physics.add.sprite(startX, startY, "player").setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(22, 20).setOffset(9, 28);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey("W"),
      A: this.input.keyboard!.addKey("A"),
      S: this.input.keyboard!.addKey("S"),
      D: this.input.keyboard!.addKey("D"),
    };
    this.enterKey = this.input.keyboard!.addKey("E");

    this.prompt = this.add
      .text(0, 0, "", { fontFamily: "system-ui", fontSize: "16px", color: "#3a2e2c", backgroundColor: "#fff7eacc", padding: { x: 8, y: 4 } })
      .setOrigin(0.5, 1)
      .setDepth(50)
      .setVisible(false);

    this.setupTouchJoystick();

    bus.emit(BusEvents.ViewNeighborhood);

    this.pollOccupancy();
    this.pollTimer = setInterval(() => this.pollOccupancy(), OCCUPANCY_POLL_MS);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.pollTimer) clearInterval(this.pollTimer);
    });
  }

  private drawBackground() {
    const sky = this.add.graphics().setScrollFactor(0.15).setDepth(-20);
    sky.fillGradientStyle(PALETTE.skyTop, PALETTE.skyTop, PALETTE.skyBottom, PALETTE.skyBottom, 1);
    sky.fillRect(0, 0, WORLD_SIZE.width, WORLD_SIZE.height);

    const ground = this.add.tileSprite(0, 0, WORLD_SIZE.width, WORLD_SIZE.height, "ground");
    ground.setOrigin(0, 0).setDepth(-10).setAlpha(0.9);

    // winding sandy path connecting the houses, purely decorative
    const path = this.add.graphics().setDepth(-5);
    path.lineStyle(46, PALETTE.groundPath, 0.9);
    path.beginPath();
    path.moveTo(WORLD_SIZE.width / 2, WORLD_SIZE.height - 60);
    for (const h of HOUSES) path.lineTo(h.x, h.y + 60);
    path.strokePath();
  }

  private scatterDecorations() {
    const rand = new Phaser.Math.RandomDataGenerator(["lofi-square-deco"]);
    for (let i = 0; i < 18; i++) {
      const x = rand.between(40, WORLD_SIZE.width - 40);
      const y = rand.between(40, WORLD_SIZE.height - 40);
      const tooCloseToHouse = HOUSES.some((h) => Phaser.Math.Distance.Between(x, y, h.x, h.y) < 140);
      if (tooCloseToHouse) continue;
      const kind = rand.pick(["tree", "tree", "lamp"]);
      this.add.image(x, y, kind).setOrigin(0.5, 1).setDepth(y);
    }
  }

  private createHouses() {
    for (const house of HOUSES) {
      const sprite = this.add.image(house.x, house.y, "house").setOrigin(0.5, 1).setDepth(house.y);
      const glow = this.add
        .image(house.x, house.y - 10, "house")
        .setOrigin(0.5, 1)
        .setDepth(house.y - 1)
        .setTint(PALETTE.houseGlow)
        .setAlpha(0)
        .setScale(1.08);
      const label = this.add
        .text(house.x, house.y - 165, `${house.name}\n0 kişi`, {
          fontFamily: "system-ui",
          fontSize: "14px",
          color: "#3a2e2c",
          align: "center",
          backgroundColor: "#fff7eacc",
          padding: { x: 8, y: 4 },
        })
        .setOrigin(0.5, 1)
        .setDepth(house.y + 1);

      sprite.setInteractive({ useHandCursor: true });
      sprite.on("pointerdown", () => this.tryEnterHouse(house.id, house.name));

      this.houseSprites.set(house.id, { sprite, label, glow });
      sprite.setVisible(false);
      label.setVisible(false);
      glow.setVisible(false);
    }
  }

  private async pollOccupancy() {
    try {
      const res = await fetch(`${getHttpBase()}/occupancy`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { counts: Record<string, number>; total: number };
      this.occupancy = data.counts;
      this.totalPlayers = data.total;
      this.refreshHouseVisuals();
    } catch {
      // Realtime backend unreachable — houses just stay as last known state.
    }
  }

  private refreshHouseVisuals() {
    for (const house of HOUSES) {
      const entry = this.houseSprites.get(house.id);
      if (!entry) continue;
      const revealed = this.totalPlayers >= (REVEAL_THRESHOLDS[house.id] ?? 0);
      entry.sprite.setVisible(revealed);
      entry.label.setVisible(revealed);
      entry.glow.setVisible(revealed);
      if (!revealed) continue;

      const count = this.occupancy[house.id] ?? 0;
      entry.label.setText(`${house.name}\n${count} kişi`);
      // Dim empty houses, let busy ones glow — the eye should land on the crowd.
      const busy = count > 0;
      entry.sprite.setAlpha(busy ? 1 : 0.55);
      entry.glow.setAlpha(busy ? Math.min(0.15 + count * 0.08, 0.55) : 0);
    }
  }

  private tryEnterHouse(houseId: string, houseName: string) {
    const revealed = this.totalPlayers >= (REVEAL_THRESHOLDS[houseId] ?? 0);
    if (!revealed) return;
    this.scene.start("House", {
      houseId,
      houseName,
      name: this.sceneData.name,
      deviceId: this.sceneData.deviceId,
      returnX: this.player.x,
      returnY: this.player.y,
    });
  }

  private setupTouchJoystick() {
    if (!this.sys.game.device.input.touch) return;
    const baseX = 110;
    const baseY = WORLD_SIZE.height ? this.scale.height - 110 : 400;
    this.joystickBase = this.add
      .circle(baseX, baseY, 50, 0xffffff, 0.18)
      .setScrollFactor(0)
      .setDepth(1000)
      .setStrokeStyle(2, 0xffffff, 0.5);
    this.joystickKnob = this.add.circle(baseX, baseY, 22, 0xffffff, 0.35).setScrollFactor(0).setDepth(1001);

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (this.joystickPointerId !== null) return;
      if (Phaser.Math.Distance.Between(p.x, p.y, baseX, baseY) > 90) return;
      this.joystickPointerId = p.id;
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (this.joystickPointerId !== p.id) return;
      const dx = Phaser.Math.Clamp(p.x - baseX, -50, 50);
      const dy = Phaser.Math.Clamp(p.y - baseY, -50, 50);
      this.joystickKnob?.setPosition(baseX + dx, baseY + dy);
      this.joystickVector.set(dx / 50, dy / 50);
    });
    const reset = (p: Phaser.Input.Pointer) => {
      if (this.joystickPointerId !== p.id) return;
      this.joystickPointerId = null;
      this.joystickVector.set(0, 0);
      this.joystickKnob?.setPosition(baseX, baseY);
    };
    this.input.on("pointerup", reset);
    this.input.on("pointerupoutside", reset);
  }

  update() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;

    if (vx === 0 && vy === 0 && this.joystickVector.length() > 0.15) {
      vx = this.joystickVector.x;
      vy = this.joystickVector.y;
    }

    const vec = new Phaser.Math.Vector2(vx, vy);
    if (vec.length() > 0) vec.normalize().scale(PLAYER_SPEED);
    body.setVelocity(vec.x, vec.y);
    this.player.setDepth(this.player.y);

    this.updateNearestHousePrompt();
  }

  private updateNearestHousePrompt() {
    let nearest: string | null = null;
    let nearestName = "";
    let nearestDist = Infinity;
    for (const house of HOUSES) {
      const entry = this.houseSprites.get(house.id);
      if (!entry?.sprite.visible) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, house.x, house.y);
      if (dist < ENTER_RADIUS && dist < nearestDist) {
        nearest = house.id;
        nearestName = house.name;
        nearestDist = dist;
      }
    }
    if (nearest) {
      this.prompt.setText(`${nearestName} — Gir (E)`);
      this.prompt.setPosition(this.player.x, this.player.y - 60);
      this.prompt.setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.tryEnterHouse(nearest, nearestName);
      }
    } else {
      this.prompt.setVisible(false);
    }
  }
}
