import Phaser from 'phaser';

export class Bat extends Phaser.Physics.Arcade.Sprite {
  public readonly batId: string;
  private collected: boolean = false;
  private floatTween!: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, id: string) {
    super(scene, x, y, 'bat', 'bat_0');

    this.batId = id;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    this.setSize(24, 24);
    this.setOffset(4, 4);

    // Play idle animation
    this.play('bat-idle');

    // Add floating effect
    this.floatTween = scene.tweens.add({
      targets: this,
      y: y - 3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Slight rotation wobble
    scene.tweens.add({
      targets: this,
      angle: { from: -5, to: 5 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  collect(onComplete?: () => void): void {
    if (this.collected) return;
    this.collected = true;

    // Stop floating
    this.floatTween.stop();

    // Disable physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;

    // Collection animation - bat spins toward player
    this.scene.tweens.add({
      targets: this,
      y: this.y - 40,
      scaleX: 1.3,
      scaleY: 1.3,
      angle: 360,
      alpha: 0,
      duration: 400,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.createCollectParticles();
        onComplete?.();
        this.destroy();
      },
    });

    // Play power-up sound
    this.playCollectSound();
  }

  private createCollectParticles(): void {
    // Create brown wood particle texture if not exists
    if (!this.scene.textures.exists('particle-wood')) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0x8b4513, 1);
      graphics.fillCircle(2, 2, 2);
      graphics.generateTexture('particle-wood', 4, 4);
      graphics.destroy();
    }

    const particles = this.scene.add.particles(this.x, this.y - 20, 'particle-wood', {
      speed: { min: 50, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 8,
      emitting: false,
    });

    particles.explode();

    this.scene.time.delayedCall(500, () => particles.destroy());
  }

  private playCollectSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Power-up sound - ascending notes
      [440, 554, 659].forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'square';
        oscillator.frequency.value = freq;

        const startTime = ctx.currentTime + i * 0.08;
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.15);
      });
    }
  }

  isCollected(): boolean {
    return this.collected;
  }
}
