import Phaser from 'phaser';

export class MayoJar extends Phaser.Physics.Arcade.Sprite {
  public readonly mayoId: string;
  private collected: boolean = false;
  private floatTween!: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, id: string) {
    super(scene, x, y, 'mayo', 'mayo_0');

    this.mayoId = id;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    this.setSize(20, 24);
    this.setOffset(6, 4);

    // Play bob animation
    this.play('mayo-bob');

    // Add floating effect
    this.floatTween = scene.tweens.add({
      targets: this,
      y: y - 4,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Add subtle glow effect
    this.setTint(0xffffff);
  }

  collect(onComplete?: () => void): void {
    if (this.collected) return;
    this.collected = true;

    // Stop floating
    this.floatTween.stop();

    // Disable physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;

    // Collection animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 30,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 300,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.createCollectParticles();
        onComplete?.();
        this.destroy();
      },
    });

    // Play collect sound
    this.playCollectSound();
  }

  private createCollectParticles(): void {
    // Create gold sparkle texture if not exists
    if (!this.scene.textures.exists('sparkle-gold')) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xffd700, 1);
      graphics.fillCircle(3, 3, 3);
      graphics.generateTexture('sparkle-gold', 6, 6);
      graphics.destroy();
    }

    const particles = this.scene.add.particles(this.x, this.y - 15, 'sparkle-gold', {
      speed: { min: 60, max: 120 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 12,
      emitting: false,
    });

    particles.explode();

    this.scene.time.delayedCall(600, () => particles.destroy());
  }

  private playCollectSound(): void {
    // Create a simple collect sound using Web Audio
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    }
  }

  isCollected(): boolean {
    return this.collected;
  }
}
