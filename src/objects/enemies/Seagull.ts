import Phaser from 'phaser';

export interface SeagullConfig {
  circleRadius?: number;
  circleSpeed?: number;
  diveSpeed?: number;
  detectRange?: number;
  diveCooldown?: number;
}

const DEFAULT_CONFIG: Required<SeagullConfig> = {
  circleRadius: 60,
  circleSpeed: 0.02,
  diveSpeed: 200,
  detectRange: 120,
  diveCooldown: 3000,
};

type SeagullState = 'circle' | 'dive' | 'recover' | 'flee';

export class Seagull extends Phaser.Physics.Arcade.Sprite {
  private config: Required<SeagullConfig>;
  private startX: number;
  private startY: number;
  private circleAngle: number = 0;
  private aiState: SeagullState = 'circle';
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  private isDead: boolean = false;
  private diveTarget: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  private diveCooldownTimer: number = 0;
  private fleeMode: boolean = false;
  private shadow!: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, x: number, y: number, config: SeagullConfig = {}) {
    super(scene, x, y, 'seagull', 'fly_0');

    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startX = x;
    this.startY = y;
    this.circleAngle = Math.random() * Math.PI * 2;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(20, 16);
    body.setOffset(6, 8);

    // Create shadow beneath seagull
    this.shadow = scene.add.ellipse(x, y + 100, 16, 6, 0x000000, 0.3);
    this.shadow.setDepth(-1);

    // Play fly animation
    this.play('seagull-fly');
  }

  setTarget(target: Phaser.Physics.Arcade.Sprite): void {
    this.target = target;
  }

  setFleeMode(flee: boolean): void {
    if (flee && !this.fleeMode) {
      this.fleeMode = true;
      this.aiState = 'flee';
      this.setTint(0xffff00);
    } else if (!flee && this.fleeMode) {
      this.fleeMode = false;
      this.aiState = 'circle';
      this.clearTint();
    }
  }

  update(): void {
    if (this.isDead) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Update cooldown timer
    if (this.diveCooldownTimer > 0) {
      this.diveCooldownTimer -= this.scene.game.loop.delta;
    }

    switch (this.aiState) {
      case 'circle':
        this.updateCircle(body);
        break;
      case 'dive':
        this.updateDive(body);
        break;
      case 'recover':
        this.updateRecover(body);
        break;
      case 'flee':
        this.updateFlee(body);
        break;
    }

    // Update shadow position
    this.shadow.setPosition(this.x, this.startY + 80);
    // Shadow size based on height (smaller when higher)
    const heightRatio = Math.max(0.3, 1 - (this.startY - this.y) / 100);
    this.shadow.setScale(heightRatio, heightRatio * 0.6);
    this.shadow.setAlpha(0.3 * heightRatio);
  }

  private updateCircle(body: Phaser.Physics.Arcade.Body): void {
    // Circle around start position
    this.circleAngle += this.config.circleSpeed;

    const targetX = this.startX + Math.cos(this.circleAngle) * this.config.circleRadius;
    const targetY = this.startY + Math.sin(this.circleAngle * 0.5) * 20; // Slight vertical bob

    // Smooth movement toward target position
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    body.velocity.x = dx * 3;
    body.velocity.y = dy * 3;

    // Face movement direction
    this.setFlipX(body.velocity.x < 0);

    // Check for player in range to dive
    if (this.target && this.diveCooldownTimer <= 0 && !this.fleeMode) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.target.x,
        this.target.y
      );

      // Only dive if player is below seagull
      if (distance < this.config.detectRange && this.target.y > this.y) {
        this.startDive();
      }
    }
  }

  private startDive(): void {
    if (!this.target) return;

    this.aiState = 'dive';
    // Predict where player will be
    const playerBody = this.target.body as Phaser.Physics.Arcade.Body;
    this.diveTarget.set(
      this.target.x + playerBody.velocity.x * 0.3,
      this.target.y
    );

    // Play dive animation
    this.play('seagull-dive');

    // Warning screech sound
    this.playDiveSound();

    // Set angle toward target
    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      this.diveTarget.x, this.diveTarget.y
    );
    this.setAngle(Phaser.Math.RadToDeg(angle) + 90);
  }

  private updateDive(body: Phaser.Physics.Arcade.Body): void {
    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      this.diveTarget.x, this.diveTarget.y
    );

    body.velocity.x = Math.cos(angle) * this.config.diveSpeed;
    body.velocity.y = Math.sin(angle) * this.config.diveSpeed;

    // Check if reached dive target or gone too low
    const distanceToTarget = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.diveTarget.x, this.diveTarget.y
    );

    if (distanceToTarget < 20 || this.y > this.startY + 50) {
      this.startRecover();
    }
  }

  private startRecover(): void {
    this.aiState = 'recover';
    this.diveCooldownTimer = this.config.diveCooldown;

    // Play fly animation again
    this.play('seagull-fly');
  }

  private updateRecover(body: Phaser.Physics.Arcade.Body): void {
    // Fly back up to circling height
    const dx = this.startX - this.x;
    const dy = this.startY - this.y;

    body.velocity.x = dx * 2;
    body.velocity.y = dy * 2;

    // Gradually return angle to 0
    const currentAngle = this.angle;
    this.setAngle(currentAngle * 0.9);

    this.setFlipX(body.velocity.x < 0);

    // Check if back at start height
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.startX, this.startY
    );

    if (distance < 20) {
      this.aiState = 'circle';
      this.setAngle(0);
    }
  }

  private updateFlee(body: Phaser.Physics.Arcade.Body): void {
    if (!this.target) {
      this.aiState = 'circle';
      return;
    }

    // Fly away from player and upward
    const angle = Phaser.Math.Angle.Between(
      this.target.x, this.target.y,
      this.x, this.y
    );

    body.velocity.x = Math.cos(angle) * this.config.diveSpeed * 0.8;
    body.velocity.y = -80; // Always fly upward when fleeing

    this.setFlipX(body.velocity.x < 0);

    // Panicked wobble
    const wobble = Math.sin(this.scene.time.now * 0.02) * 15;
    this.setAngle(wobble);
  }

  stomp(): void {
    if (this.isDead) return;
    this.isDead = true;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;

    // Remove shadow
    this.shadow.destroy();

    // Death animation - spiral down
    this.scene.tweens.add({
      targets: this,
      y: this.y + 100,
      angle: this.flipX ? -720 : 720,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 600,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.createDeathParticles();
        this.destroy();
      },
    });

    this.playDeathSound();
  }

  private createDeathParticles(): void {
    if (!this.scene.textures.exists('feather')) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xffffff, 1);
      graphics.fillEllipse(2, 4, 3, 6);
      graphics.generateTexture('feather', 6, 10);
      graphics.destroy();
    }

    const particles = this.scene.add.particles(this.x, this.y, 'feather', {
      speed: { min: 20, max: 60 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0.5 },
      rotate: { min: 0, max: 360 },
      lifespan: 800,
      quantity: 8,
      emitting: false,
    });

    particles.explode();
    this.scene.time.delayedCall(900, () => particles.destroy());
  }

  private playDiveSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Descending screech
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    }
  }

  private playDeathSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    }
  }

  getDamage(): number {
    return 1;
  }

  isAlive(): boolean {
    return !this.isDead;
  }

  destroy(fromScene?: boolean): void {
    if (this.shadow) {
      this.shadow.destroy();
    }
    super.destroy(fromScene);
  }
}
