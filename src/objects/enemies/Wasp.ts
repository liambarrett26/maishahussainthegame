import Phaser from 'phaser';

export interface WaspConfig {
  patrolDistance?: number;
  speed?: number;
  detectRange?: number;
  chaseSpeed?: number;
}

const DEFAULT_CONFIG: Required<WaspConfig> = {
  patrolDistance: 80,
  speed: 60,
  detectRange: 100,
  chaseSpeed: 100,
};

export class Wasp extends Phaser.Physics.Arcade.Sprite {
  private config: Required<WaspConfig>;
  private startX: number;
  private startY: number;
  private direction: number = 1;
  private aiState: 'patrol' | 'chase' | 'return' | 'flee' = 'patrol';
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  private isDead: boolean = false;
  private fleeMode: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: WaspConfig = {}) {
    super(scene, x, y, 'wasp', 'wasp_0');

    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startX = x;
    this.startY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(20, 16);
    body.setOffset(6, 8);

    // Play fly animation
    this.play('wasp-fly');
  }

  setTarget(target: Phaser.Physics.Arcade.Sprite): void {
    this.target = target;
  }

  setFleeMode(flee: boolean): void {
    if (flee && !this.fleeMode) {
      // Entering flee mode
      this.fleeMode = true;
      this.aiState = 'flee';
      // Visual indication - tint yellow/scared
      this.setTint(0xffff00);
    } else if (!flee && this.fleeMode) {
      // Exiting flee mode
      this.fleeMode = false;
      this.aiState = 'return';
      this.clearTint();
    }
  }

  update(): void {
    if (this.isDead) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    switch (this.aiState) {
      case 'patrol':
        this.updatePatrol(body);
        break;
      case 'chase':
        this.updateChase(body);
        break;
      case 'return':
        this.updateReturn(body);
        break;
      case 'flee':
        this.updateFlee(body);
        break;
    }

    // Check for player in range (only if not fleeing)
    if (this.target && this.aiState === 'patrol' && !this.fleeMode) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.target.x,
        this.target.y
      );
      if (distance < this.config.detectRange) {
        this.aiState = 'chase';
      }
    }

    // Add slight vertical oscillation for more natural movement (only in patrol/return, not chase/flee)
    if (this.aiState === 'patrol' || this.aiState === 'return') {
      const oscillation = Math.sin(this.scene.time.now * 0.005) * 0.5;
      body.velocity.y = oscillation * 20;
    }
  }

  private updatePatrol(body: Phaser.Physics.Arcade.Body): void {
    body.velocity.x = this.config.speed * this.direction;

    // Check patrol bounds
    if (this.x > this.startX + this.config.patrolDistance) {
      this.direction = -1;
      this.setFlipX(true);
    } else if (this.x < this.startX - this.config.patrolDistance) {
      this.direction = 1;
      this.setFlipX(false);
    }
  }

  private updateChase(body: Phaser.Physics.Arcade.Body): void {
    if (!this.target) {
      this.aiState = 'return';
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    );

    // Give up chase if too far
    if (distance > this.config.detectRange * 2) {
      this.aiState = 'return';
      return;
    }

    // Move toward player
    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    );

    body.velocity.x = Math.cos(angle) * this.config.chaseSpeed;
    body.velocity.y = Math.sin(angle) * this.config.chaseSpeed;

    // Face movement direction
    this.setFlipX(body.velocity.x < 0);
  }

  private updateReturn(body: Phaser.Physics.Arcade.Body): void {
    const distanceToStart = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.startX,
      this.startY
    );

    if (distanceToStart < 5) {
      this.aiState = 'patrol';
      this.x = this.startX;
      this.y = this.startY;
      return;
    }

    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      this.startX,
      this.startY
    );

    body.velocity.x = Math.cos(angle) * this.config.speed;
    body.velocity.y = Math.sin(angle) * this.config.speed;

    this.setFlipX(body.velocity.x < 0);
  }

  private updateFlee(body: Phaser.Physics.Arcade.Body): void {
    if (!this.target) {
      this.aiState = 'return';
      return;
    }

    // Calculate direction away from player
    const angle = Phaser.Math.Angle.Between(
      this.target.x,
      this.target.y,
      this.x,
      this.y
    );

    // Flee at chase speed (faster than patrol)
    const fleeSpeed = this.config.chaseSpeed * 1.2;
    body.velocity.x = Math.cos(angle) * fleeSpeed;
    body.velocity.y = Math.sin(angle) * fleeSpeed;

    // Face movement direction
    this.setFlipX(body.velocity.x < 0);

    // Add panicked wobble
    const wobble = Math.sin(this.scene.time.now * 0.02) * 10;
    this.setAngle(wobble);
  }

  stomp(): void {
    if (this.isDead) return;
    this.isDead = true;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;

    // Death animation
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.3,
      scaleX: 1.3,
      alpha: 0,
      y: this.y + 10,
      angle: this.flipX ? -45 : 45,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.createDeathParticles();
        this.destroy();
      },
    });

    // Play squish sound
    this.playDeathSound();
  }

  private createDeathParticles(): void {
    if (!this.scene.textures.exists('particle-yellow')) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xffd700, 1);
      graphics.fillCircle(2, 2, 2);
      graphics.generateTexture('particle-yellow', 4, 4);
      graphics.destroy();
    }

    const particles = this.scene.add.particles(this.x, this.y, 'particle-yellow', {
      speed: { min: 30, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 6,
      emitting: false,
    });

    particles.explode();

    this.scene.time.delayedCall(500, () => particles.destroy());
  }

  private playDeathSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    }
  }

  getDamage(): number {
    return 1;
  }

  isAlive(): boolean {
    return !this.isDead;
  }
}
