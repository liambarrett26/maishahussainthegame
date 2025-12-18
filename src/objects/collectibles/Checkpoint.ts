import Phaser from 'phaser';
import { SaveManager } from '../../utils/SaveManager';

export class Checkpoint extends Phaser.GameObjects.Container {
  public readonly checkpointId: string;
  private activated: boolean = false;
  private flag!: Phaser.GameObjects.Graphics;
  private pole!: Phaser.GameObjects.Graphics;
  private hitArea!: Phaser.GameObjects.Zone;
  private levelId: string;

  constructor(scene: Phaser.Scene, x: number, y: number, id: string, levelId: string) {
    super(scene, x, y);

    this.checkpointId = id;
    this.levelId = levelId;

    scene.add.existing(this);

    this.createVisuals();
    this.createHitArea();
  }

  private createVisuals(): void {
    // Pole
    this.pole = this.scene.add.graphics();
    this.pole.fillStyle(0x8b4513, 1);
    this.pole.fillRect(-2, -40, 4, 40);
    this.add(this.pole);

    // Flag (triangle)
    this.flag = this.scene.add.graphics();
    this.drawFlag(false);
    this.add(this.flag);

    // Subtle wave animation for flag
    this.scene.tweens.add({
      targets: this.flag,
      scaleX: 0.95,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private drawFlag(activated: boolean): void {
    this.flag.clear();

    const color = activated ? 0x4ade80 : 0xe94560;
    this.flag.fillStyle(color, 1);
    this.flag.beginPath();
    this.flag.moveTo(2, -40);
    this.flag.lineTo(22, -32);
    this.flag.lineTo(2, -24);
    this.flag.closePath();
    this.flag.fillPath();

    // Flag highlight
    this.flag.fillStyle(0xffffff, 0.3);
    this.flag.beginPath();
    this.flag.moveTo(2, -40);
    this.flag.lineTo(12, -36);
    this.flag.lineTo(2, -32);
    this.flag.closePath();
    this.flag.fillPath();
  }

  private createHitArea(): void {
    // Make hit area span full screen height so checkpoint triggers anywhere along y axis
    const screenHeight = 270; // GAME_HEIGHT
    this.hitArea = this.scene.add.zone(this.x, screenHeight / 2, 32, screenHeight);
    this.scene.physics.add.existing(this.hitArea, true);
  }

  getHitArea(): Phaser.GameObjects.Zone {
    return this.hitArea;
  }

  activate(): void {
    if (this.activated) return;
    this.activated = true;

    // Visual feedback
    this.drawFlag(true);

    // Save checkpoint
    SaveManager.setCheckpoint(this.levelId, this.checkpointId);

    // Activation animation
    this.scene.tweens.add({
      targets: this,
      scaleY: 1.1,
      scaleX: 1.1,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    // Create celebration particles
    this.createActivationParticles();

    // Play activation sound
    this.playActivateSound();
  }

  private createActivationParticles(): void {
    if (!this.scene.textures.exists('sparkle-green')) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0x4ade80, 1);
      graphics.fillCircle(2, 2, 2);
      graphics.generateTexture('sparkle-green', 4, 4);
      graphics.destroy();
    }

    const particles = this.scene.add.particles(this.x + 10, this.y - 32, 'sparkle-green', {
      speed: { min: 30, max: 60 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 8,
      emitting: false,
    });

    particles.explode();

    this.scene.time.delayedCall(700, () => particles.destroy());
  }

  private playActivateSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Play a rising chime
      [523, 659, 784].forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = freq;

        const startTime = ctx.currentTime + i * 0.1;
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    }
  }

  isActivated(): boolean {
    return this.activated;
  }

  getSpawnPoint(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.x, this.y);
  }
}
