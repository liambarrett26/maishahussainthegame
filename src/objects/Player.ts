import Phaser from 'phaser';
import {
  PLAYER_SPEED,
  PLAYER_JUMP_VELOCITY,
  PLAYER_MAX_HEALTH,
  COYOTE_TIME,
  JUMP_BUFFER_TIME,
  INVINCIBILITY_DURATION,
} from '../utils/Constants';
import { SaveManager } from '../utils/SaveManager';

type PlayerState = 'idle' | 'run' | 'jump' | 'fall' | 'hurt';

// Mayo Maisha mode constants
const MAYO_MAISHA_THRESHOLD = 10;
const MAYO_MAISHA_DURATION = 5000; // 5 seconds

// Bat attack constants
const BAT_ATTACK_COOLDOWN = 400; // ms between swings
const BAT_SWING_DURATION = 250; // ms for swing animation
const BAT_HIT_RANGE = 30; // pixels in front of player

export class Player extends Phaser.Physics.Arcade.Sprite {
  public health: number = PLAYER_MAX_HEALTH;
  public maxHealth: number = PLAYER_MAX_HEALTH;
  public mayoCount: number = 0;

  private isInvincible: boolean = false;
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private currentState: PlayerState = 'idle';
  private isHurt: boolean = false;
  private isDead: boolean = false;
  private wasdKeys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  } | null = null;
  private mayoMaishaKey: Phaser.Input.Keyboard.Key | null = null;

  // Mayo Maisha power-up state
  private mayoMaishaActive: boolean = false;
  private mayoMaishaTimer: number = 0;
  private mayoGlow!: Phaser.GameObjects.Graphics;

  // Bat attack state
  private hasBat: boolean = false;
  private attackKey: Phaser.Input.Keyboard.Key | null = null;
  private isAttacking: boolean = false;
  private attackCooldown: number = 0;
  private batSprite!: Phaser.GameObjects.Sprite;
  private attackHitbox!: Phaser.GameObjects.Zone;

  // Mayo heal state
  private healKey: Phaser.Input.Keyboard.Key | null = null;
  private static readonly MAYO_HEAL_COST = 10;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'maisha', 'idle_0');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    this.setCollideWorldBounds(true);
    this.setBounce(0);
    // Adjust hitbox to be smaller than sprite for better feel
    this.setSize(16, 24);
    this.setOffset(8, 8);

    // Start with idle animation
    this.play('maisha-idle');

    // Set up WASD keys
    if (scene.input.keyboard) {
      this.wasdKeys = {
        W: scene.input.keyboard.addKey('W'),
        A: scene.input.keyboard.addKey('A'),
        S: scene.input.keyboard.addKey('S'),
        D: scene.input.keyboard.addKey('D'),
      };

      // Mayo Maisha activation key
      this.mayoMaishaKey = scene.input.keyboard.addKey('M');

      // Attack key (X or J)
      this.attackKey = scene.input.keyboard.addKey('X');

      // Heal key (H)
      this.healKey = scene.input.keyboard.addKey('H');
    }

    // Create Mayo Maisha glow effect (initially invisible)
    this.mayoGlow = scene.add.graphics();
    this.mayoGlow.setVisible(false);

    // Create bat sprite (initially invisible)
    this.batSprite = scene.add.sprite(x, y, 'bat-swing', 'swing_0');
    this.batSprite.setVisible(false);
    this.batSprite.setDepth(this.depth + 1);

    // Create attack hitbox zone
    this.attackHitbox = scene.add.zone(x, y, BAT_HIT_RANGE, 24);
    scene.physics.add.existing(this.attackHitbox, false);
    const hitboxBody = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    hitboxBody.setAllowGravity(false);
    hitboxBody.enable = false;
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    if (this.isHurt) return; // Don't process input while hurt

    // Update Mayo Maisha timer
    if (this.mayoMaishaActive) {
      this.mayoMaishaTimer -= this.scene.game.loop.delta;
      this.updateMayoGlow();

      if (this.mayoMaishaTimer <= 0) {
        this.deactivateMayoMaisha();
      }
    }

    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= this.scene.game.loop.delta;
    }

    // Check for Mayo Maisha activation (M key)
    if (this.mayoMaishaKey?.isDown && this.canActivateMayoMaisha()) {
      this.activateMayoMaisha();
    }

    // Check for bat attack (X key)
    if (this.attackKey && Phaser.Input.Keyboard.JustDown(this.attackKey) && this.canAttack()) {
      this.performAttack();
    }

    // Check for heal (H key) - costs 10 mayo to restore 1 heart
    if (this.healKey && Phaser.Input.Keyboard.JustDown(this.healKey) && this.canHealWithMayo()) {
      this.healWithMayo();
    }

    // Update bat sprite position
    this.updateBatPosition();

    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.onFloor();

    // Coyote time - allow jumping shortly after leaving platform
    if (onGround) {
      this.coyoteTimer = COYOTE_TIME;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer -= this.scene.game.loop.delta;
    }

    // Jump buffer - remember jump input shortly before landing
    const jumpPressed =
      cursors.up.isDown ||
      cursors.space.isDown ||
      this.wasdKeys?.W.isDown;

    if (jumpPressed) {
      this.jumpBufferTimer = JUMP_BUFFER_TIME;
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= this.scene.game.loop.delta;
    }

    // Horizontal movement
    const leftPressed = cursors.left.isDown || this.wasdKeys?.A.isDown;
    const rightPressed = cursors.right.isDown || this.wasdKeys?.D.isDown;

    if (leftPressed) {
      this.setVelocityX(-PLAYER_SPEED);
      this.setFlipX(true);
    } else if (rightPressed) {
      this.setVelocityX(PLAYER_SPEED);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    // Jump with coyote time and jump buffer
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.setVelocityY(PLAYER_JUMP_VELOCITY);
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      // Squash effect on jump
      this.applySquashStretch(0.8, 1.2);
    }

    // Variable jump height - cut jump short if button released
    if (!jumpPressed && body.velocity.y < 0) {
      this.setVelocityY(body.velocity.y * 0.5);
    }

    // Landing squash effect
    if (onGround && this.currentState === 'fall') {
      this.applySquashStretch(1.2, 0.8);
    }

    // Update animation state
    this.updateAnimationState(onGround, body.velocity);
  }

  private updateAnimationState(
    onGround: boolean,
    velocity: Phaser.Math.Vector2
  ): void {
    let newState: PlayerState = 'idle';

    if (!onGround) {
      newState = velocity.y < 0 ? 'jump' : 'fall';
    } else if (Math.abs(velocity.x) > 10) {
      newState = 'run';
    }

    if (newState !== this.currentState) {
      this.currentState = newState;
      this.playAnimation(newState);
    }
  }

  private playAnimation(state: PlayerState): void {
    switch (state) {
      case 'idle':
        this.play('maisha-idle', true);
        break;
      case 'run':
        this.play('maisha-run', true);
        break;
      case 'jump':
        this.play('maisha-jump', true);
        break;
      case 'fall':
        // Use the last frame of jump for falling
        this.setFrame('jump_2');
        break;
    }
  }

  private applySquashStretch(scaleX: number, scaleY: number): void {
    this.setScale(scaleX, scaleY);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Back.easeOut',
    });
  }

  takeDamage(amount: number = 1): void {
    // Mayo Maisha mode - completely invincible
    if (this.mayoMaishaActive || this.isInvincible) return;

    this.health -= amount;
    this.isInvincible = true;
    this.isHurt = true;

    // Play hurt animation
    this.play('maisha-hurt');

    // Knockback
    const knockbackDir = this.flipX ? 1 : -1;
    this.setVelocity(knockbackDir * 100, -150);

    // Screen shake
    this.scene.cameras.main.shake(100, 0.01);

    // Flash effect during invincibility
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: Math.floor(INVINCIBILITY_DURATION / 160),
      onComplete: () => {
        this.isInvincible = false;
        this.setAlpha(1);
      },
    });

    // Re-enable control after brief stun
    this.scene.time.delayedCall(300, () => {
      this.isHurt = false;
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  die(): void {
    if (this.isDead) return; // Prevent multiple death triggers

    this.isDead = true;
    this.isHurt = true;
    this.isInvincible = true;

    // Deactivate Mayo Maisha if active
    if (this.mayoMaishaActive) {
      this.deactivateMayoMaisha();
    }

    // Disable physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, -200);

    // Play death animation
    this.play('maisha-hurt');

    // Death visual effect - spin and fade
    this.scene.tweens.add({
      targets: this,
      angle: this.flipX ? -360 : 360,
      alpha: 0,
      y: this.y - 50,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Play death effect
        this.scene.cameras.main.shake(200, 0.02);
        this.scene.cameras.main.flash(200, 255, 100, 100);

        // Show game over screen instead of auto-respawn
        this.scene.time.delayedCall(300, () => {
          const gameScene = this.scene as { showGameOver?: () => void };
          if (gameScene.showGameOver) {
            gameScene.showGameOver();
          }
        });
      },
    });

    // Create death particles
    this.createDeathParticles();
  }

  // Called by GameScene when continuing from game over
  // Restores to base 3 hearts - extra hearts from friends must be regained with mayo
  respawnReset(): void {
    this.health = PLAYER_MAX_HEALTH; // Base 3 hearts
    this.isHurt = false;
    this.isDead = false;
    this.isInvincible = false;
    this.setAlpha(1);
    this.setAngle(0);

    // Re-enable physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.enable = true;
  }

  private createDeathParticles(): void {
    if (!this.scene.textures.exists('particle-red')) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xe94560, 1);
      graphics.fillCircle(2, 2, 2);
      graphics.generateTexture('particle-red', 4, 4);
      graphics.destroy();
    }

    const particles = this.scene.add.particles(this.x, this.y, 'particle-red', {
      speed: { min: 50, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 8,
      emitting: false,
    });

    particles.explode();
    this.scene.time.delayedCall(600, () => particles.destroy());
  }

  collectMayo(): void {
    this.mayoCount += 1;

    // Brief scale pop effect - no auto-heal, player must use H key
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    // Sparkle effect to show collection
    this.createMayoCollectParticles();
  }

  private createMayoCollectParticles(): void {
    if (!this.scene.textures.exists('mayo-sparkle')) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xfff8dc, 1);
      graphics.fillCircle(2, 2, 2);
      graphics.generateTexture('mayo-sparkle', 4, 4);
      graphics.destroy();
    }

    const particles = this.scene.add.particles(this.x, this.y - 10, 'mayo-sparkle', {
      speed: { min: 30, max: 60 },
      angle: { min: 220, max: 320 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 6,
      emitting: false,
    });

    particles.explode();
    this.scene.time.delayedCall(500, () => particles.destroy());
  }

  heal(amount: number = 1): void {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  setMaxHealth(max: number): void {
    this.maxHealth = max;
    this.health = max;
  }

  // Mayo heal methods
  canHealWithMayo(): boolean {
    return this.mayoCount >= Player.MAYO_HEAL_COST && this.health < this.maxHealth;
  }

  private healWithMayo(): void {
    if (!this.canHealWithMayo()) return;

    // Consume mayo
    this.mayoCount -= Player.MAYO_HEAL_COST;
    SaveManager.useMayo(Player.MAYO_HEAL_COST); // Persist change

    // Heal ALL hearts
    this.health = this.maxHealth;

    // Visual/audio feedback
    this.playHealEffect();
  }

  private playHealEffect(): void {
    // Green flash
    this.scene.cameras.main.flash(150, 100, 255, 100, true);

    // Scale pop
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    // Heart particle burst
    if (!this.scene.textures.exists('heal-heart')) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xff69b4, 1);
      graphics.fillCircle(3, 3, 3);
      graphics.fillCircle(7, 3, 3);
      graphics.fillTriangle(0, 4, 10, 4, 5, 10);
      graphics.generateTexture('heal-heart', 10, 10);
      graphics.destroy();
    }

    const particles = this.scene.add.particles(this.x, this.y, 'heal-heart', {
      speed: { min: 50, max: 100 },
      angle: { min: 230, max: 310 },
      scale: { start: 1, end: 0.3 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 8,
      emitting: false,
    });

    particles.explode();
    this.scene.time.delayedCall(700, () => particles.destroy());

    // Heal sound
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Gentle chime
      [440, 554, 659].forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = freq;

        const startTime = ctx.currentTime + i * 0.08;
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.25);
      });
    }
  }

  playVictory(): void {
    this.play('maisha-victory');
  }

  // Mayo Maisha power-up methods
  isMayoMaisha(): boolean {
    return this.mayoMaishaActive;
  }

  getMayoMaishaTimeRemaining(): number {
    return this.mayoMaishaTimer;
  }

  getMayoMaishaDuration(): number {
    return MAYO_MAISHA_DURATION;
  }

  canActivateMayoMaisha(): boolean {
    // Can activate if: have enough mayo, not already active, and key was just pressed (not held)
    return (
      this.mayoCount >= MAYO_MAISHA_THRESHOLD &&
      !this.mayoMaishaActive &&
      this.mayoMaishaKey !== null &&
      Phaser.Input.Keyboard.JustDown(this.mayoMaishaKey)
    );
  }

  private activateMayoMaisha(): void {
    // Consume mayo
    this.mayoCount -= MAYO_MAISHA_THRESHOLD;
    SaveManager.useMayo(MAYO_MAISHA_THRESHOLD); // Persist change

    this.mayoMaishaActive = true;
    this.mayoMaishaTimer = MAYO_MAISHA_DURATION;
    this.mayoGlow.setVisible(true);

    // Set golden tint
    this.setTint(0xffd700);

    // Play activation sound
    this.playMayoMaishaSound();

    // Screen effect
    this.scene.cameras.main.flash(200, 255, 215, 0, true);

    // Create activation particles
    this.createMayoMaishaParticles();
  }

  private deactivateMayoMaisha(): void {
    this.mayoMaishaActive = false;
    this.mayoMaishaTimer = 0;
    this.mayoGlow.setVisible(false);

    // Remove tint
    this.clearTint();

    // Play deactivation sound
    this.playMayoMaishaEndSound();
  }

  private updateMayoGlow(): void {
    this.mayoGlow.clear();

    // Pulsing glow effect
    const pulse = 0.5 + 0.5 * Math.sin(this.scene.time.now * 0.01);
    const glowSize = 20 + pulse * 8;

    // Draw gradient glow
    this.mayoGlow.fillStyle(0xffd700, 0.3 * pulse);
    this.mayoGlow.fillCircle(this.x, this.y, glowSize);
    this.mayoGlow.fillStyle(0xffd700, 0.2 * pulse);
    this.mayoGlow.fillCircle(this.x, this.y, glowSize * 0.7);

    // Warning flash when time is running out
    if (this.mayoMaishaTimer < 1500) {
      const flashRate = this.mayoMaishaTimer < 500 ? 0.02 : 0.01;
      const flash = Math.sin(this.scene.time.now * flashRate) > 0;
      if (flash) {
        this.setTint(0xffd700);
      } else {
        this.clearTint();
      }
    }
  }

  private createMayoMaishaParticles(): void {
    if (!this.scene.textures.exists('sparkle-gold-big')) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xffd700, 1);
      graphics.fillCircle(4, 4, 4);
      graphics.generateTexture('sparkle-gold-big', 8, 8);
      graphics.destroy();
    }

    const particles = this.scene.add.particles(this.x, this.y, 'sparkle-gold-big', {
      speed: { min: 80, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 20,
      emitting: false,
    });

    particles.explode();
    this.scene.time.delayedCall(900, () => particles.destroy());
  }

  private playMayoMaishaSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Play ascending power-up chime
      [523, 659, 784, 1047].forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = freq;

        const startTime = ctx.currentTime + i * 0.08;
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    }
  }

  private playMayoMaishaEndSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Play descending end sound
      [784, 659, 523].forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = freq;

        const startTime = ctx.currentTime + i * 0.1;
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
      });
    }
  }

  // Bat attack methods
  equipBat(): void {
    this.hasBat = true;
    // Brief visual feedback
    this.scene.cameras.main.flash(100, 139, 69, 19, true);
  }

  hasBatEquipped(): boolean {
    return this.hasBat;
  }

  canAttack(): boolean {
    return this.hasBat && !this.isAttacking && this.attackCooldown <= 0;
  }

  isCurrentlyAttacking(): boolean {
    return this.isAttacking;
  }

  getAttackHitbox(): Phaser.GameObjects.Zone {
    return this.attackHitbox;
  }

  private performAttack(): void {
    this.isAttacking = true;
    this.attackCooldown = BAT_ATTACK_COOLDOWN;

    // Show and animate bat
    this.batSprite.setVisible(true);
    this.batSprite.setFlipX(this.flipX);
    this.batSprite.play('bat-swing');

    // Enable hitbox during swing
    const hitboxBody = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    hitboxBody.enable = true;

    // Play swing sound
    this.playSwingSound();

    // End attack after swing duration
    this.scene.time.delayedCall(BAT_SWING_DURATION, () => {
      this.isAttacking = false;
      this.batSprite.setVisible(false);
      hitboxBody.enable = false;
    });
  }

  private updateBatPosition(): void {
    if (!this.batSprite) return;

    // Position bat relative to player
    const offsetX = this.flipX ? -20 : 20;
    this.batSprite.setPosition(this.x + offsetX, this.y - 4);
    this.batSprite.setFlipX(this.flipX);

    // Position attack hitbox
    const hitboxX = this.flipX ? this.x - BAT_HIT_RANGE : this.x + BAT_HIT_RANGE;
    this.attackHitbox.setPosition(hitboxX, this.y);
  }

  private playSwingSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Whoosh sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    }
  }

  playBatHitSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Thwack sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    }
  }
}
