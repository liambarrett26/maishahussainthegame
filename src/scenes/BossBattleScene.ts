import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

type FighterState = 'idle' | 'walk' | 'punch' | 'kick' | 'block' | 'hurt' | 'special' | 'victory' | 'defeat' | 'attack' | 'throw';

interface Fighter {
  sprite: Phaser.GameObjects.Sprite;
  health: number;
  maxHealth: number;
  state: FighterState;
  x: number;
  facingRight: boolean;
  isBlocking: boolean;
  attackCooldown: number;
  specialMeter: number;
  comboCount: number;
}

export class BossBattleScene extends Phaser.Scene {
  private maisha!: Fighter;
  private nicki!: Fighter;

  private maishaHealthBar!: Phaser.GameObjects.Graphics;
  private nickiHealthBar!: Phaser.GameObjects.Graphics;
  private specialMeterBar!: Phaser.GameObjects.Graphics;

  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    punch: Phaser.Input.Keyboard.Key;
    kick: Phaser.Input.Keyboard.Key;
    block: Phaser.Input.Keyboard.Key;
    special: Phaser.Input.Keyboard.Key;
  };

  private battleStarted: boolean = false;
  private battleEnded: boolean = false;
  private roundText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private phase: number = 1;
  private nickiAITimer: number = 0;
  private beakers: Phaser.GameObjects.Sprite[] = [];
  private puddles: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: SCENES.BOSS_BATTLE });
  }

  create(): void {
    // Create chemistry lab arena
    this.createArena();

    // Create fighters
    this.createFighters();

    // Create UI
    this.createUI();

    // Set up input
    this.setupInput();

    // Play intro sequence
    this.playIntro();
  }

  private createArena(): void {
    const graphics = this.add.graphics();

    // Lab floor (dark tile pattern)
    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);

    // Floor tiles
    graphics.fillStyle(0x34495e, 1);
    for (let x = 0; x < GAME_WIDTH; x += 20) {
      graphics.fillRect(x, GAME_HEIGHT - 50, 18, 48);
    }

    // Lab wall background
    graphics.fillStyle(0xd4c4a8, 1);
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT - 50);

    // Periodic table poster
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(20, 20, 80, 50);
    graphics.fillStyle(0x3498db, 0.8);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        graphics.fillRect(24 + col * 9, 24 + row * 11, 7, 9);
      }
    }

    // Lab bench in background
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(120, GAME_HEIGHT - 90, 100, 40);
    graphics.fillStyle(0x7f8c8d, 1);
    graphics.fillRect(120, GAME_HEIGHT - 95, 100, 8);

    // Beakers and test tubes on bench
    graphics.fillStyle(0x27ae60, 0.8);
    graphics.fillRect(130, GAME_HEIGHT - 110, 10, 20);
    graphics.fillStyle(0xe74c3c, 0.8);
    graphics.fillRect(150, GAME_HEIGHT - 115, 8, 25);
    graphics.fillStyle(0x3498db, 0.8);
    graphics.fillRect(170, GAME_HEIGHT - 108, 12, 18);

    // Bunsen burner
    graphics.fillStyle(0x7f8c8d, 1);
    graphics.fillRect(200, GAME_HEIGHT - 100, 8, 10);
    // Flame
    graphics.fillStyle(0xe67e22, 1);
    graphics.fillTriangle(200, GAME_HEIGHT - 100, 208, GAME_HEIGHT - 100, 204, GAME_HEIGHT - 120);
    graphics.fillStyle(0xf1c40f, 1);
    graphics.fillTriangle(201, GAME_HEIGHT - 100, 207, GAME_HEIGHT - 100, 204, GAME_HEIGHT - 115);

    // Fume hood on right
    graphics.fillStyle(0x95a5a6, 1);
    graphics.fillRect(GAME_WIDTH - 80, 30, 70, 100);
    graphics.fillStyle(0x7f8c8d, 1);
    graphics.fillRect(GAME_WIDTH - 75, 40, 60, 80);

    // "SAFETY FIRST" sign
    const safetySign = this.add.text(GAME_WIDTH - 45, 15, 'SAFETY\nFIRST', {
      fontSize: '6px',
      color: '#e74c3c',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      align: 'center',
    });
    safetySign.setOrigin(0.5);

    // Arena boundaries
    graphics.lineStyle(3, 0xe74c3c);
    graphics.strokeRect(10, GAME_HEIGHT - 52, GAME_WIDTH - 20, 4);
  }

  private createFighters(): void {
    // Maisha (player) - left side - use fighting sprite
    const maishaSprite = this.add.sprite(60, GAME_HEIGHT - 70, 'maisha-fight', 'idle_0');
    maishaSprite.setScale(1.5);
    maishaSprite.play('maisha-fight-idle');

    this.maisha = {
      sprite: maishaSprite,
      health: 100,
      maxHealth: 100,
      state: 'idle',
      x: 60,
      facingRight: true,
      isBlocking: false,
      attackCooldown: 0,
      specialMeter: 0,
      comboCount: 0,
    };

    // Nicki (boss) - right side
    const nickiSprite = this.add.sprite(GAME_WIDTH - 80, GAME_HEIGHT - 80, 'nicki', 'idle_0');
    nickiSprite.setScale(1.8);
    nickiSprite.setFlipX(true);
    nickiSprite.play('nicki-idle');

    this.nicki = {
      sprite: nickiSprite,
      health: 150,
      maxHealth: 150,
      state: 'idle',
      x: GAME_WIDTH - 80,
      facingRight: false,
      isBlocking: false,
      attackCooldown: 0,
      specialMeter: 50,
      comboCount: 0,
    };
  }

  private createUI(): void {
    // VS text
    const vsText = this.add.text(GAME_WIDTH / 2, 15, 'VS', {
      fontSize: '12px',
      color: '#e94560',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    vsText.setOrigin(0.5);

    // Player name
    this.add.text(50, 8, 'MAISHA', {
      fontSize: '10px',
      color: '#ffd93d',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });

    // Boss name
    const nickiName = this.add.text(GAME_WIDTH - 50, 8, 'NICKI', {
      fontSize: '10px',
      color: '#e74c3c',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    nickiName.setOrigin(1, 0);

    // Health bars
    this.maishaHealthBar = this.add.graphics();
    this.nickiHealthBar = this.add.graphics();
    this.specialMeterBar = this.add.graphics();

    this.updateHealthBars();

    // Round/Phase text
    this.roundText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.roundText.setOrigin(0.5);
    this.roundText.setDepth(100);

    // Combo text
    this.comboText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, '', {
      fontSize: '14px',
      color: '#ffd93d',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.comboText.setOrigin(0.5);
    this.comboText.setDepth(100);

    // Controls hint
    const controlsHint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 10, 'A/D: Move | J: Punch | K: Kick | L: Block | SPACE: Special', {
      fontSize: '6px',
      color: '#888888',
      fontFamily: 'monospace',
    });
    controlsHint.setOrigin(0.5);
  }

  private updateHealthBars(): void {
    // Maisha health bar (left side)
    this.maishaHealthBar.clear();
    // Background
    this.maishaHealthBar.fillStyle(0x333333, 1);
    this.maishaHealthBar.fillRect(10, 20, 100, 12);
    // Health fill
    const maishaHealthPercent = this.maisha.health / this.maisha.maxHealth;
    const maishaColor = maishaHealthPercent > 0.5 ? 0x27ae60 : maishaHealthPercent > 0.25 ? 0xf39c12 : 0xe74c3c;
    this.maishaHealthBar.fillStyle(maishaColor, 1);
    this.maishaHealthBar.fillRect(12, 22, 96 * maishaHealthPercent, 8);
    // Border
    this.maishaHealthBar.lineStyle(2, 0xffd93d);
    this.maishaHealthBar.strokeRect(10, 20, 100, 12);

    // Nicki health bar (right side, fills from right)
    this.nickiHealthBar.clear();
    // Background
    this.nickiHealthBar.fillStyle(0x333333, 1);
    this.nickiHealthBar.fillRect(GAME_WIDTH - 110, 20, 100, 12);
    // Health fill
    const nickiHealthPercent = this.nicki.health / this.nicki.maxHealth;
    const nickiColor = nickiHealthPercent > 0.5 ? 0x9b59b6 : nickiHealthPercent > 0.25 ? 0xe74c3c : 0xc0392b;
    this.nickiHealthBar.fillStyle(nickiColor, 1);
    const healthWidth = 96 * nickiHealthPercent;
    this.nickiHealthBar.fillRect(GAME_WIDTH - 108 + (96 - healthWidth), 22, healthWidth, 8);
    // Border
    this.nickiHealthBar.lineStyle(2, 0xe74c3c);
    this.nickiHealthBar.strokeRect(GAME_WIDTH - 110, 20, 100, 12);

    // Special meter (below Maisha's health)
    this.specialMeterBar.clear();
    this.specialMeterBar.fillStyle(0x333333, 1);
    this.specialMeterBar.fillRect(10, 34, 60, 6);
    this.specialMeterBar.fillStyle(0x3498db, 1);
    this.specialMeterBar.fillRect(11, 35, 58 * (this.maisha.specialMeter / 100), 4);
    this.specialMeterBar.lineStyle(1, 0x2980b9);
    this.specialMeterBar.strokeRect(10, 34, 60, 6);

    // "SPECIAL" label
    if (this.maisha.specialMeter >= 100) {
      const specialReady = this.add.text(72, 37, 'READY!', {
        fontSize: '5px',
        color: '#3498db',
        fontFamily: 'monospace',
      });
      specialReady.setOrigin(0, 0.5);
      this.tweens.add({
        targets: specialReady,
        alpha: 0,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;

    this.keys = {
      left: this.input.keyboard.addKey('A'),
      right: this.input.keyboard.addKey('D'),
      punch: this.input.keyboard.addKey('J'),
      kick: this.input.keyboard.addKey('K'),
      block: this.input.keyboard.addKey('L'),
      special: this.input.keyboard.addKey('SPACE'),
    };
  }

  private playIntro(): void {
    // Dramatic intro
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // "CHEMISTRY LAB" title
    const titleText = this.add.text(GAME_WIDTH / 2, 60, 'CHEMISTRY LAB', {
      fontSize: '16px',
      color: '#9b59b6',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    titleText.setOrigin(0.5);
    titleText.setAlpha(0);

    this.tweens.add({
      targets: titleText,
      alpha: 1,
      duration: 500,
      hold: 1000,
      yoyo: true,
      onComplete: () => titleText.destroy(),
    });

    // "ROUND 1" announcement
    this.time.delayedCall(1500, () => {
      this.roundText.setText('ROUND 1');
      this.roundText.setScale(0);

      this.tweens.add({
        targets: this.roundText,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut',
        hold: 500,
        onComplete: () => {
          this.roundText.setText('FIGHT!');
          this.tweens.add({
            targets: this.roundText,
            scale: 0,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              this.roundText.setAlpha(1);
              this.battleStarted = true;
              this.playFightSound();
            },
          });
        },
      });
    });
  }

  private playFightSound(): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Energetic chord
      const frequencies = [261, 329, 392, 523];
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + 0.3);
      });
    }
  }

  update(_time: number, delta: number): void {
    if (!this.battleStarted || this.battleEnded) return;

    // Update cooldowns
    if (this.maisha.attackCooldown > 0) this.maisha.attackCooldown -= delta;
    if (this.nicki.attackCooldown > 0) this.nicki.attackCooldown -= delta;

    // Handle player input
    this.handlePlayerInput();

    // Update Nicki AI
    this.updateNickiAI(delta);

    // Update beakers
    this.updateBeakers();

    // Update fighter positions
    this.updateFighterPositions();

    // Update health bars
    this.updateHealthBars();

    // Check for battle end
    this.checkBattleEnd();
  }

  private handlePlayerInput(): void {
    if (this.maisha.state === 'hurt') return;

    // Movement
    let moving = false;
    if (this.keys.left.isDown && !this.maisha.isBlocking) {
      this.maisha.x = Math.max(30, this.maisha.x - 3);
      this.maisha.facingRight = false;
      moving = true;
    }
    if (this.keys.right.isDown && !this.maisha.isBlocking) {
      this.maisha.x = Math.min(GAME_WIDTH - 30, this.maisha.x + 3);
      this.maisha.facingRight = true;
      moving = true;
    }

    // Block
    this.maisha.isBlocking = this.keys.block.isDown;

    // Attacks
    if (this.maisha.attackCooldown <= 0) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.punch)) {
        this.maishaAttack('punch');
      } else if (Phaser.Input.Keyboard.JustDown(this.keys.kick)) {
        this.maishaAttack('kick');
      } else if (Phaser.Input.Keyboard.JustDown(this.keys.special) && this.maisha.specialMeter >= 100) {
        this.maishaSpecial();
      }
    }

    // Update animation
    if (this.maisha.state === 'idle') {
      if (this.maisha.isBlocking) {
        this.maisha.sprite.play('maisha-fight-block', true);
        this.maisha.sprite.setTint(0x3498db);
      } else {
        this.maisha.sprite.clearTint();
        if (moving) {
          this.maisha.sprite.play('maisha-fight-walk', true);
        } else {
          this.maisha.sprite.play('maisha-fight-idle', true);
        }
      }
    }

    // Update sprite position and flip
    this.maisha.sprite.x = this.maisha.x;
    this.maisha.sprite.setFlipX(!this.maisha.facingRight);
  }

  private maishaAttack(type: 'punch' | 'kick'): void {
    this.maisha.state = type;
    this.maisha.attackCooldown = type === 'punch' ? 300 : 400;

    // Play attack animation with proper arm/leg movement
    if (type === 'punch') {
      this.maisha.sprite.play('maisha-fight-punch');
    } else {
      this.maisha.sprite.play('maisha-fight-kick');
    }

    // Play attack sound
    this.playAttackSound(type === 'punch' ? 400 : 300);

    // Check for hit
    const distance = Math.abs(this.maisha.x - this.nicki.x);
    if (distance < 50) {
      const damage = type === 'punch' ? 8 : 12;
      this.hitNicki(damage);
      this.maisha.specialMeter = Math.min(100, this.maisha.specialMeter + 10);
      this.maisha.comboCount++;
      this.showCombo();
    } else {
      this.maisha.comboCount = 0;
    }

    // Return to idle
    this.time.delayedCall(250, () => {
      if (this.maisha.state === type) {
        this.maisha.state = 'idle';
        this.maisha.sprite.play('maisha-fight-idle');
      }
    });
  }

  private maishaSpecial(): void {
    this.maisha.state = 'special';
    this.maisha.specialMeter = 0;
    this.maisha.attackCooldown = 800;

    // MAYO MAISHA MODE - Devastating attack!
    this.maisha.sprite.setTint(0xffd93d);

    // Screen flash
    this.cameras.main.flash(200, 255, 215, 0);

    // Play special animation
    this.maisha.sprite.play('maisha-fight-victory');

    // Dramatic text
    const specialText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'MAYO MAISHA!', {
      fontSize: '18px',
      color: '#ffd93d',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    specialText.setOrigin(0.5);

    this.tweens.add({
      targets: specialText,
      scale: 1.5,
      alpha: 0,
      duration: 800,
      onComplete: () => specialText.destroy(),
    });

    // Massive damage if close
    const distance = Math.abs(this.maisha.x - this.nicki.x);
    if (distance < 80) {
      this.hitNicki(35);
      this.maisha.comboCount += 3;
      this.showCombo();
    }

    // Play epic sound
    this.playSpecialSound();

    // Return to idle
    this.time.delayedCall(600, () => {
      this.maisha.state = 'idle';
      this.maisha.sprite.clearTint();
      this.maisha.sprite.play('maisha-fight-idle');
    });
  }

  private updateNickiAI(delta: number): void {
    if (this.nicki.state === 'hurt') return;

    this.nickiAITimer += delta;

    // AI decision making based on phase
    const attackInterval = this.phase === 1 ? 1500 : this.phase === 2 ? 1000 : 700;

    if (this.nickiAITimer >= attackInterval && this.nicki.attackCooldown <= 0) {
      this.nickiAITimer = 0;

      const distance = Math.abs(this.maisha.x - this.nicki.x);
      const action = Math.random();

      if (distance > 100) {
        // Far away - throw beaker
        if (action < 0.7) {
          this.nickiThrowBeaker();
        } else {
          // Move towards player
          this.nicki.x += this.nicki.facingRight ? 30 : -30;
        }
      } else {
        // Close - melee attack or block
        if (action < 0.5) {
          this.nickiAttack();
        } else if (action < 0.7) {
          this.nickiThrowBeaker();
        } else {
          // Dodge back
          this.nicki.x += this.nicki.facingRight ? -40 : 40;
        }
      }
    }

    // Face player
    this.nicki.facingRight = this.maisha.x > this.nicki.x;
    this.nicki.sprite.setFlipX(!this.nicki.facingRight);

    // Keep in bounds
    this.nicki.x = Phaser.Math.Clamp(this.nicki.x, 40, GAME_WIDTH - 40);
    this.nicki.sprite.x = this.nicki.x;
  }

  private nickiAttack(): void {
    this.nicki.state = 'attack';
    this.nicki.attackCooldown = 500;

    this.nicki.sprite.play('nicki-attack');
    this.playAttackSound(250);

    // Check for hit
    const distance = Math.abs(this.maisha.x - this.nicki.x);
    if (distance < 60) {
      if (this.maisha.isBlocking) {
        // Blocked!
        this.showBlockedText();
        this.maisha.specialMeter = Math.min(100, this.maisha.specialMeter + 5);
      } else {
        this.hitMaisha(12);
      }
    }

    this.time.delayedCall(400, () => {
      if (this.nicki.state === 'attack') {
        this.nicki.state = 'idle';
        this.nicki.sprite.play('nicki-idle');
      }
    });
  }

  private nickiThrowBeaker(): void {
    this.nicki.state = 'throw';
    this.nicki.attackCooldown = 800;

    this.nicki.sprite.play('nicki-throw');

    // Create beaker projectile
    this.time.delayedCall(200, () => {
      // Use beaker sprite if available, otherwise fallback to tinted mayo
      const hasBeakerSprite = this.textures.exists('beaker');
      const beaker = this.add.sprite(
        this.nicki.x,
        this.nicki.sprite.y - 10,
        hasBeakerSprite ? 'beaker' : 'mayo',
        hasBeakerSprite ? 'beaker_0' : 'mayo_0'
      );
      if (!hasBeakerSprite) {
        beaker.setTint(0x27ae60);
      }
      beaker.setScale(0.8);

      const direction = this.nicki.facingRight ? 1 : -1;
      const velocityX = direction * 4;

      this.beakers.push(beaker);
      (beaker as any).velocityX = velocityX;
      (beaker as any).velocityY = -2;

      this.playThrowSound();
    });

    this.time.delayedCall(500, () => {
      if (this.nicki.state === 'throw') {
        this.nicki.state = 'idle';
        this.nicki.sprite.play('nicki-idle');
      }
    });
  }

  private updateBeakers(): void {
    this.beakers = this.beakers.filter(beaker => {
      // Update position with arc
      (beaker as any).velocityY += 0.15;
      beaker.x += (beaker as any).velocityX;
      beaker.y += (beaker as any).velocityY;
      beaker.angle += 10;

      // Check collision with Maisha
      const distance = Phaser.Math.Distance.Between(beaker.x, beaker.y, this.maisha.x, this.maisha.sprite.y);
      if (distance < 25) {
        if (this.maisha.isBlocking) {
          this.showBlockedText();
        } else {
          this.hitMaisha(10);
        }
        this.createPuddle(beaker.x, GAME_HEIGHT - 55);
        beaker.destroy();
        return false;
      }

      // Check if hit ground
      if (beaker.y > GAME_HEIGHT - 60) {
        this.createPuddle(beaker.x, GAME_HEIGHT - 55);
        beaker.destroy();
        return false;
      }

      // Out of bounds
      if (beaker.x < 0 || beaker.x > GAME_WIDTH) {
        beaker.destroy();
        return false;
      }

      return true;
    });

    // Check puddle damage
    this.puddles.forEach(puddle => {
      const puddleX = (puddle as any).puddleX;
      if (Math.abs(this.maisha.x - puddleX) < 20 && !this.maisha.isBlocking) {
        // Damage over time from acid
        if (Math.random() < 0.02) {
          this.hitMaisha(3);
        }
      }
    });
  }

  private createPuddle(x: number, y: number): void {
    const puddle = this.add.graphics();
    puddle.fillStyle(0x27ae60, 0.6);
    puddle.fillEllipse(x, y, 30, 8);
    (puddle as any).puddleX = x;
    this.puddles.push(puddle);

    // Puddle fades after time
    this.tweens.add({
      targets: puddle,
      alpha: 0,
      duration: 3000,
      onComplete: () => {
        this.puddles = this.puddles.filter(p => p !== puddle);
        puddle.destroy();
      },
    });
  }

  private hitNicki(damage: number): void {
    this.nicki.health = Math.max(0, this.nicki.health - damage);
    this.nicki.state = 'hurt';

    this.nicki.sprite.play('nicki-hurt');
    this.nicki.sprite.setTint(0xff0000);

    // Knockback
    this.nicki.x += this.maisha.facingRight ? 15 : -15;

    // Camera shake
    this.cameras.main.shake(50, 0.01);

    // Show damage number
    this.showDamageNumber(this.nicki.x, this.nicki.sprite.y - 30, damage);

    this.playHitSound();

    // Check phase transition
    const healthPercent = this.nicki.health / this.nicki.maxHealth;
    if (healthPercent <= 0.66 && this.phase === 1) {
      this.phase = 2;
      this.showPhaseChange('PHASE 2');
    } else if (healthPercent <= 0.33 && this.phase === 2) {
      this.phase = 3;
      this.showPhaseChange('FINAL PHASE!');
      this.nicki.sprite.setTint(0xe74c3c);
    }

    this.time.delayedCall(300, () => {
      if (this.nicki.health > 0) {
        this.nicki.state = 'idle';
        this.nicki.sprite.clearTint();
        if (this.phase < 3) {
          this.nicki.sprite.play('nicki-idle');
        }
      }
    });
  }

  private hitMaisha(damage: number): void {
    this.maisha.health = Math.max(0, this.maisha.health - damage);
    this.maisha.state = 'hurt';
    this.maisha.comboCount = 0;

    this.maisha.sprite.play('maisha-fight-hurt');
    this.maisha.sprite.setTint(0xff0000);

    // Knockback
    this.maisha.x += this.nicki.facingRight ? 15 : -15;

    // Camera shake
    this.cameras.main.shake(50, 0.01);

    // Show damage number
    this.showDamageNumber(this.maisha.x, this.maisha.sprite.y - 30, damage);

    this.playHitSound();

    this.time.delayedCall(300, () => {
      if (this.maisha.health > 0) {
        this.maisha.state = 'idle';
        this.maisha.sprite.clearTint();
        this.maisha.sprite.play('maisha-fight-idle');
      }
    });
  }

  private showDamageNumber(x: number, y: number, damage: number): void {
    const text = this.add.text(x, y, `-${damage}`, {
      fontSize: '12px',
      color: '#e74c3c',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    text.setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy(),
    });
  }

  private showCombo(): void {
    if (this.maisha.comboCount > 1) {
      this.comboText.setText(`${this.maisha.comboCount} HIT COMBO!`);
      this.comboText.setScale(0);
      this.comboText.setAlpha(1);

      this.tweens.add({
        targets: this.comboText,
        scale: 1,
        duration: 200,
        ease: 'Back.easeOut',
        hold: 300,
        yoyo: true,
      });
    }
  }

  private showBlockedText(): void {
    const blockedText = this.add.text(this.maisha.x, this.maisha.sprite.y - 40, 'BLOCKED!', {
      fontSize: '10px',
      color: '#3498db',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    blockedText.setOrigin(0.5);

    this.tweens.add({
      targets: blockedText,
      y: blockedText.y - 20,
      alpha: 0,
      duration: 500,
      onComplete: () => blockedText.destroy(),
    });

    this.playBlockSound();
  }

  private showPhaseChange(text: string): void {
    this.roundText.setText(text);
    this.roundText.setScale(0);
    this.roundText.setAlpha(1);

    this.cameras.main.flash(300, 255, 100, 100);

    this.tweens.add({
      targets: this.roundText,
      scale: 1.2,
      duration: 500,
      ease: 'Elastic.easeOut',
      hold: 800,
      onComplete: () => {
        this.tweens.add({
          targets: this.roundText,
          scale: 0,
          alpha: 0,
          duration: 300,
        });
      },
    });
  }

  private updateFighterPositions(): void {
    // Keep fighters in bounds
    this.maisha.x = Phaser.Math.Clamp(this.maisha.x, 30, GAME_WIDTH - 30);
    this.nicki.x = Phaser.Math.Clamp(this.nicki.x, 30, GAME_WIDTH - 30);

    this.maisha.sprite.x = this.maisha.x;
    this.nicki.sprite.x = this.nicki.x;
  }

  private checkBattleEnd(): void {
    if (this.battleEnded) return;

    if (this.nicki.health <= 0) {
      this.battleEnded = true;
      this.playerWins();
    } else if (this.maisha.health <= 0) {
      this.battleEnded = true;
      this.playerLoses();
    }
  }

  private playerWins(): void {
    // Victory sequence
    this.maisha.sprite.play('maisha-fight-victory');
    this.nicki.sprite.play('nicki-hurt');

    // K.O. text
    const koText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'K.O.!', {
      fontSize: '32px',
      color: '#e74c3c',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5,
    });
    koText.setOrigin(0.5);
    koText.setScale(0);

    this.tweens.add({
      targets: koText,
      scale: 1.5,
      duration: 500,
      ease: 'Bounce.easeOut',
    });

    // Screen shake
    this.cameras.main.shake(500, 0.03);

    // Victory message
    this.time.delayedCall(2000, () => {
      const winText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 'MAISHA WINS!', {
        fontSize: '18px',
        color: '#ffd93d',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      });
      winText.setOrigin(0.5);

      this.playVictorySound();

      // Transition to credits
      this.time.delayedCall(3000, () => {
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.CREDITS);
        });
      });
    });
  }

  private playerLoses(): void {
    // Defeat sequence
    this.maisha.sprite.play('maisha-fight-hurt');
    this.nicki.sprite.play('nicki-idle');

    const loseText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'DEFEATED...', {
      fontSize: '24px',
      color: '#e74c3c',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    loseText.setOrigin(0.5);

    // Retry option
    this.time.delayedCall(2000, () => {
      const retryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 'Press SPACE to retry', {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'monospace',
      });
      retryText.setOrigin(0.5);

      this.input.keyboard?.once('keydown-SPACE', () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.restart();
        });
      });
    });
  }

  // Sound effects
  private playAttackSound(freq: number): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  }

  private playHitSound(): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.value = 150;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }
  }

  private playBlockSound(): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  }

  private playThrowSound(): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  }

  private playSpecialSound(): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + i * 0.08;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    }
  }

  private playVictorySound(): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const notes = [392, 440, 494, 523, 587, 659, 784];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    }
  }
}
