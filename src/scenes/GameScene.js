import Phaser from "phaser";

const PLAYER_SPEED = 260;
const BULLET_SPEED = 430;
const BULLET_COOLDOWN = 180;
const GRUNT_SPEED = 90;
const CHASER_SPEED = 190;
const GRUNT_POINTS = 100;
const CHASER_POINTS = 150;
const SCORE_TO_BOSS = 2000;
const BOSS_HP = 20;
const MAX_ENEMIES = 8;
const START_LIVES = 3;
const INVULNERABLE_MS = 1000;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;

    this.physics.world.setBounds(0, 0, this.W, this.H);

    this.createBackground();

    this.player = this.physics.add.image(this.W / 2, this.H / 2, "player");
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    this.bullets = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D,R");
    this.pointer = this.input.activePointer;

    this.score = 0;
    this.lives = START_LIVES;
    this.isBossActive = false;
    this.isInvulnerable = false;
    this.state = "playing";
    this.lastShot = 0;
    this.boss = null;
    this.bossShootEvent = null;
    this.enemySpawnEvent = null;

    this.physics.add.overlap(this.player, this.enemies, this.onPlayerHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemyBullets, this.onPlayerHitBullet, null, this);
    this.physics.add.overlap(this.bullets, this.enemies, this.onBulletHitEnemy, null, this);
    this.physics.add.overlap(this.bullets, this.enemyBullets, (b, eb) => {
      b.destroy();
      eb.destroy();
    });

    this.physics.world.on("worldbounds", (body) => {
      const go = body.gameObject;
      if (go && (go.texture.key === "bullet" || go.texture.key === "enemyBullet")) {
        go.destroy();
      }
    });

    this.createHUD();

    this.time.delayedCall(600, () => this.spawnEnemy());
    this.enemySpawnEvent = this.time.addEvent({
      delay: 800,
      loop: true,
      callback: () => this.spawnEnemy(),
    });
  }

  createBackground() {
    const stars = this.add.group();
    for (let i = 0; i < 120; i++) {
      const s = stars.create(
        Phaser.Math.Between(0, this.W),
        Phaser.Math.Between(0, this.H),
        "star"
      );
      s.setScale(Phaser.Math.FloatBetween(0.5, 1.6));
      s.setAlpha(Phaser.Math.FloatBetween(0.25, 0.85));
    }
  }

  createHUD() {
    this.scoreText = this.add
      .text(16, 12, "Puntaje: 0", { fontSize: "20px", fontFamily: "Arial", color: "#fff" })
      .setDepth(100);

    this.livesText = this.add
      .text(this.W - 16, 12, `Vidas: ${this.lives}`, {
        fontSize: "20px",
        fontFamily: "Arial",
        color: "#fff",
      })
      .setOrigin(1, 0)
      .setDepth(100);

    this.hintText = this.add
      .text(this.W / 2, this.H - 16, "Mové: WASD / flechas  •  Dispará: clic  •  Reiniciá: R", {
        fontSize: "14px",
        fontFamily: "Arial",
        color: "#888",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(100);

    this.bossBarBg = this.add
      .rectangle(this.W / 2, 26, 320, 14, 0x222222)
      .setFillStyle(0x222222, 0.9)
      .setStrokeStyle(2, 0x666666)
      .setDepth(90)
      .setVisible(false);
    this.bossBar = this.add
      .rectangle(this.W / 2 - 156, 26, 312, 10, 0xee3355)
      .setDepth(91)
      .setOrigin(0, 0.5)
      .setVisible(false);
  }

  update(time) {
    if (this.state === "win" || this.state === "lose") {
      if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
        this.scene.restart();
      }
      return;
    }

    this.updatePlayer(time);

    for (const enemy of this.enemies.getChildren()) {
      this.chasePlayer(enemy);
    }

    this.updateBoss();

    this.updateInvulnerability(time);
  }

  updatePlayer(time) {
    if (!this.player.active) return;

    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.keys.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.keys.S.isDown) vy += 1;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }
    this.player.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);

    if (this.pointer.isDown && time - this.lastShot >= BULLET_COOLDOWN) {
      this.fireBullet();
      this.lastShot = time;
    }
  }

  fireBullet() {
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      this.pointer.x,
      this.pointer.y
    );
    const b = this.bullets.create(this.player.x, this.player.y, "bullet");
    b.setDepth(4);
    b.setRotation(angle);
    this.physics.velocityFromRotation(angle, BULLET_SPEED, b.body.velocity);
    b.body.checkWorldBounds = true;
    b.body.onWorldBounds = true;
  }

  chasePlayer(enemy) {
    if (!enemy.active) return;
    const speed = enemy.type === "chaser" ? CHASER_SPEED : GRUNT_SPEED;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    this.physics.velocityFromRotation(angle, speed, enemy.body.velocity);
  }

  spawnEnemy() {
    if (this.state !== "playing") return;
    if (this.isBossActive) return;
    if (this.enemies.countActive(true) >= MAX_ENEMIES) return;

    const type = Phaser.Math.Between(0, 2) === 0 ? "chaser" : "grunt";
    const edge = Phaser.Math.Between(0, 3);
    let x = 0;
    let y = 0;
    if (edge === 0) {
      x = -30;
      y = Phaser.Math.Between(0, this.H);
    } else if (edge === 1) {
      x = this.W + 30;
      y = Phaser.Math.Between(0, this.H);
    } else if (edge === 2) {
      x = Phaser.Math.Between(0, this.W);
      y = -30;
    } else {
      x = Phaser.Math.Between(0, this.W);
      y = this.H + 30;
    }

    const enemy = this.enemies.create(x, y, type);
    enemy.type = type;
    enemy.hp = 1;
    enemy.points = type === "chaser" ? CHASER_POINTS : GRUNT_POINTS;
    enemy.setDepth(3);
  }

  onPlayerHitEnemy(player, enemy) {
    enemy.destroy();
    this.damagePlayer();
  }

  onPlayerHitBullet(player, bullet) {
    bullet.destroy();
    this.damagePlayer();
  }

  damagePlayer() {
    if (this.isInvulnerable || this.state !== "playing") return;

    this.lives -= 1;
    this.updateHUD();

    if (this.lives <= 0) {
      this.loseGame();
      return;
    }

    this.isInvulnerable = true;
    this.time.delayedCall(INVULNERABLE_MS, () => {
      this.isInvulnerable = false;
      this.player.alpha = 1;
    });
  }

  updateInvulnerability(time) {
    if (this.isInvulnerable && this.player.active) {
      this.player.alpha = Math.floor(time / 60) % 2 === 0 ? 0.35 : 1;
    }
  }

  onBulletHitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.hp -= 1;
    if (enemy.hp <= 0) {
      enemy.destroy();
      this.score += enemy.points;
      this.updateHUD();
      this.checkBossSpawn();
    }
  }

  checkBossSpawn() {
    if (this.score >= SCORE_TO_BOSS && !this.isBossActive && this.state === "playing") {
      this.spawnBoss();
    }
  }

  spawnBoss() {
    this.isBossActive = true;

    if (this.enemySpawnEvent) this.enemySpawnEvent.remove(false);
    const leftovers = this.enemies.getChildren();
    for (const e of leftovers) e.destroy();
    for (const b of this.enemyBullets.getChildren()) b.destroy();

    this.boss = this.physics.add.image(this.W / 2 - 200, 60, "boss");
    this.boss.hp = BOSS_HP;
    this.boss.setDepth(5);
    this.boss.setVelocityX(130);

    this.physics.add.overlap(this.player, this.boss, this.onPlayerHitByBoss, null, this);
    this.physics.add.overlap(this.bullets, this.boss, this.onBulletHitBoss, null, this);

    this.bossBarBg.setVisible(true);
    this.bossBar.setVisible(true);
    this.updateBossBar();

    this.bossShootEvent = this.time.addEvent({
      delay: 750,
      loop: true,
      callback: () => this.bossShoot(),
    });

    this.showMessage("¡APARECE EL JEFE!", 0xff3355, 40);
  }

  updateBoss() {
    if (!this.boss || !this.boss.active) return;

    if (this.boss.x > this.W - 70) {
      this.boss.setVelocityX(-130);
    } else if (this.boss.x < 70) {
      this.boss.setVelocityX(130);
    }
  }

  bossShoot() {
    if (this.state !== "playing" || !this.boss || !this.boss.active) return;

    const base = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
    const spread = [-0.35, -0.17, 0, 0.17, 0.35];
    for (const offset of spread) {
      const b = this.enemyBullets.create(this.boss.x, this.boss.y, "enemyBullet");
      b.setDepth(4);
      b.setRotation(base + offset);
      this.physics.velocityFromRotation(base + offset, 220, b.body.velocity);
      b.body.checkWorldBounds = true;
      b.body.onWorldBounds = true;
    }
  }

  onPlayerHitByBoss(player, boss) {
    this.damagePlayer();
  }

  onBulletHitBoss(bullet, boss) {
    bullet.destroy();
    boss.hp -= 1;
    this.updateBossBar();
    if (boss.hp <= 0) {
      this.winGame();
    }
  }

  updateBossBar() {
    const pct = Phaser.Math.Clamp(this.boss.hp / BOSS_HP, 0, 1);
    const filled = 312 * pct;
    const x = this.W / 2 - 156;
    this.bossBar.setPosition(x + filled / 2, 26);
    this.bossBar.width = filled;
  }

  updateHUD() {
    this.scoreText.setText(`Puntaje: ${this.score}`);
    this.livesText.setText(`Vidas: ${this.lives}`);
  }

  showMessage(text, color, size) {
    const msg = this.add
      .text(this.W / 2, this.H * 0.4, text, {
        fontSize: `${size}px`,
        fontFamily: "Arial",
        color: `#${color.toString(16).padStart(6, "0")}`,
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(200);

    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: msg.y - 40,
      duration: 1800,
      onComplete: () => msg.destroy(),
    });
  }

  stopAction() {
    if (this.enemySpawnEvent) this.enemySpawnEvent.remove(false);
    if (this.bossShootEvent) this.bossShootEvent.remove(false);
    this.enemies.getChildren().forEach((e) => e.setVelocity(0, 0));
    this.enemyBullets.getChildren().forEach((b) => b.setVelocity(0, 0));
  }

  loseGame() {
    this.state = "lose";
    this.stopAction();
    if (this.player.active) this.player.setVisible(false);
    this.bossBarBg.setVisible(false);
    this.bossBar.setVisible(false);

    this.add
      .text(this.W / 2, this.H * 0.35, "GAME OVER", {
        fontSize: "56px",
        fontFamily: "Arial",
        color: "#ff3355",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(200);
    this.add
      .text(this.W / 2, this.H * 0.35 + 60, `Puntaje final: ${this.score}`, {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#fff",
      })
      .setOrigin(0.5)
      .setDepth(200);
    this.add
      .text(this.W / 2, this.H * 0.65, "Presioná R para reiniciar", {
        fontSize: "20px",
        fontFamily: "Arial",
        color: "#ffe14d",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(200);
  }

  winGame() {
    this.state = "win";
    this.stopAction();
    if (this.boss) this.boss.destroy();
    this.bossBarBg.setVisible(false);
    this.bossBar.setVisible(false);

    this.add
      .text(this.W / 2, this.H * 0.35, "¡GANASTE!", {
        fontSize: "56px",
        fontFamily: "Arial",
        color: "#57ff8f",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(200);
    this.add
      .text(this.W / 2, this.H * 0.35 + 60, `Puntaje final: ${this.score}`, {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#fff",
      })
      .setOrigin(0.5)
      .setDepth(200);
    this.add
      .text(this.W / 2, this.H * 0.65, "Presioná R para reiniciar", {
        fontSize: "20px",
        fontFamily: "Arial",
        color: "#ffe14d",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(200);
  }
}