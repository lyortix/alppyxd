import * as Phaser from "phaser";
import { PALETTE } from "../config";

/**
 * Draws every placeholder sprite as vector shapes baked into textures once,
 * at boot. No image files are loaded — this keeps the MVP free of any
 * licensed/pre-made art while still being trivially swappable later: point
 * a real spritesheet loader at these same texture keys and every scene
 * below keeps working unchanged.
 */
interface BootData {
  name: string;
  deviceId: string;
}

export class BootScene extends Phaser.Scene {
  private sceneData!: BootData;

  constructor() {
    super("Boot");
  }

  init(data: BootData) {
    this.sceneData = data;
  }

  create() {
    this.drawPlayerTexture();
    this.drawHouseTexture();
    this.drawTreeTexture();
    this.drawLampTexture();
    this.drawGroundTile();
    this.scene.start("Neighborhood", this.sceneData);
  }

  private drawPlayerTexture() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const w = 40;
    const h = 52;
    // body (chibi: big soft head, tiny body)
    g.fillStyle(0xf4d9c6, 1);
    g.fillEllipse(w / 2, h - 14, 22, 20);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(w / 2, 18, 18);
    // hair/cap shading on top of head
    g.fillStyle(0xffffff, 1);
    g.fillCircle(w / 2, 18, 18);
    // cheeks
    g.fillStyle(0xf5a4a0, 0.55);
    g.fillCircle(w / 2 - 8, 21, 3);
    g.fillCircle(w / 2 + 8, 21, 3);
    // eyes
    g.fillStyle(0x3a2e2c, 1);
    g.fillCircle(w / 2 - 6, 17, 2.2);
    g.fillCircle(w / 2 + 6, 17, 2.2);
    g.generateTexture("player", w, h);
    g.destroy();
  }

  private drawHouseTexture() {
    const w = 160;
    const h = 150;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    // wall
    g.fillStyle(PALETTE.houseWall, 1);
    g.fillRoundedRect(10, 60, w - 20, h - 70, 10);
    // roof
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(0, 65, w / 2, 5, w, 65);
    // door
    g.fillStyle(0x8a5a3c, 1);
    g.fillRoundedRect(w / 2 - 16, h - 55, 32, 45, 6);
    // window
    g.fillStyle(0xbfe3e0, 1);
    g.fillRoundedRect(28, 85, 26, 24, 4);
    g.fillRoundedRect(w - 54, 85, 26, 24, 4);
    g.generateTexture("house", w, h);
    g.destroy();
  }

  private drawTreeTexture() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const w = 70;
    const h = 90;
    g.fillStyle(PALETTE.treeTrunk, 1);
    g.fillRect(w / 2 - 5, h - 30, 10, 30);
    g.fillStyle(PALETTE.treeLeaf, 1);
    g.fillCircle(w / 2, h - 55, 26);
    g.fillCircle(w / 2 - 18, h - 40, 18);
    g.fillCircle(w / 2 + 18, h - 40, 18);
    g.generateTexture("tree", w, h);
    g.destroy();
  }

  private drawLampTexture() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const w = 20;
    const h = 80;
    g.fillStyle(0x4a4038, 1);
    g.fillRect(w / 2 - 2, 20, 4, h - 20);
    g.fillStyle(PALETTE.lampGlow, 1);
    g.fillCircle(w / 2, 14, 10);
    g.generateTexture("lamp", w, h);
    g.destroy();
  }

  private drawGroundTile() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const size = 64;
    g.fillStyle(PALETTE.ground, 1);
    g.fillRect(0, 0, size, size);
    g.fillStyle(0x8fbd95, 0.5);
    g.fillCircle(16, 20, 5);
    g.fillCircle(46, 44, 4);
    g.generateTexture("ground", size, size);
    g.destroy();
  }
}
