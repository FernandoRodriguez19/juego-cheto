import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    const make = (key, w, h, draw) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      draw(g);
      g.generateTexture(key, w, h);
      g.destroy();
    };

    make("player", 24, 32, (g) => {
      g.fillStyle(0x57ff8f, 1);
      g.fillTriangle(12, 2, 2, 28, 22, 28);
      g.fillStyle(0x1d6b37, 1);
      g.fillCircle(12, 18, 4);
    });

    make("grunt", 26, 26, (g) => {
      g.fillStyle(0xff5555, 1);
      g.fillRoundedRect(1, 1, 24, 24, 6);
      g.fillStyle(0x1a0505, 1);
      g.fillCircle(8, 10, 3);
      g.fillCircle(18, 10, 3);
    });

    make("chaser", 24, 24, (g) => {
      g.fillStyle(0xcf7bff, 1);
      g.fillTriangle(12, 2, 2, 22, 22, 22);
      g.fillStyle(0x3a1760, 1);
      g.fillCircle(12, 13, 4);
    });

    make("boss", 110, 80, (g) => {
      g.fillStyle(0xd93a3a, 1);
      g.fillRoundedRect(5, 10, 100, 60, 16);
      g.fillStyle(0x7a1e1e, 1);
      g.fillCircle(22, 26, 12);
      g.fillCircle(88, 26, 12);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(18, 26, 4);
      g.fillCircle(84, 26, 4);
      g.fillStyle(0x111111, 1);
      g.fillCircle(19, 27, 2);
      g.fillCircle(85, 27, 2);
      g.fillStyle(0x2a0a0a, 1);
      g.fillCircle(38, 52, 6);
      g.fillCircle(72, 52, 6);
    });

    make("bullet", 8, 8, (g) => {
      g.fillStyle(0xffe14d, 1);
      g.fillCircle(4, 4, 4);
    });

    make("enemyBullet", 10, 10, (g) => {
      g.fillStyle(0xff8c3d, 1);
      g.fillCircle(5, 5, 5);
    });

    make("star", 4, 4, (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(2, 2, 2);
    });

    this.scene.start("GameScene");
  }
}