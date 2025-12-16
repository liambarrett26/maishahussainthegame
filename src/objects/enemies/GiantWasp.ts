import Phaser from 'phaser';

type BossPhase = 1 | 2;
type BossState = 'idle' | 'attack' | 'hurt' | 'rage' | 'defeat' | 'diveBomb' | 'stingerBarrage' | 'groundPound';

export class GiantWasp extends Phaser.Physics.Arcade.Sprite {
  private bossHealth: number = 20;
  private maxHealth: number = 20;
  private phase: BossPhase = 1;
  private bossState: BossState = 'idle';
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  private alive: boolean = true;
  private invulnerable: boolean = false;
  private invulnerableTimer: number = 0;

  // Movement
  private hoverBaseY: number;
  private hoverOffset: number = 0;
  private arenaLeft: number;
  private arenaRight: number;
  private arenaTop: number;
  private arenaBottom: number;

  // Attack patterns
  private attackCooldown: number = 0;
  private attackPattern: number = 0;
  private stingerMissiles: Phaser.GameObjects.Sprite[] = [];
  private swarmWasps: Phaser.GameObjects.Sprite[] = [];

  // Phase 2 rage
  private rageAura: Phaser.GameObjects.Graphics | null = null;
  private rageTimer: number = 0;

  // Crown for defeat animation
  private crown: Phaser.GameObjects.Graphics | null = null;

  // Health bar
  private healthBar: Phaser.GameObjects.Graphics | null = null;
  private healthBarBg: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, arenaConfig: { left: number; right: number; top: number; bottom: number }) {
    super(scene, x, y, 'giant_wasp', 'idle_0');

    this.hoverBaseY = y;
    this.arenaLeft = arenaConfig.left;
    this.arenaRight = arenaConfig.right;
    this.arenaTop = arenaConfig.top;
    this.arenaBottom = arenaConfig.bottom;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics setup
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(48, 48);
    body.setOffset(8, 8);
    body.setBounce(0);
    body.setCollideWorldBounds(false);

    // Create health bar
    this.createHealthBar();

    // Start idle animation
    this.play('giant-wasp-idle');

    // Play boss entrance
    this.playEntranceSequence();
  }

  private createHealthBar(): void {
    // Background
    this.healthBarBg = this.scene.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.8);
    this.healthBarBg.fillRect(0, 0, 200, 16);
    this.healthBarBg.lineStyle(2, 0xffffff, 1);
    this.healthBarBg.strokeRect(0, 0, 200, 16);
    this.healthBarBg.setScrollFactor(0);
    this.healthBarBg.setDepth(200);
    this.healthBarBg.setPosition(140, 10);

    // Health fill
    this.healthBar = this.scene.add.graphics();
    this.healthBar.setScrollFactor(0);
    this.healthBar.setDepth(201);
    this.updateHealthBar();

    // Boss name
    const bossName = this.scene.add.text(240, 12, '👑 THE GIANT WASP 👑', {
      fontSize: '8px',
      color: '#ffd700',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    bossName.setOrigin(0.5, 0.5);
    bossName.setScrollFactor(0);
    bossName.setDepth(202);
  }

  private updateHealthBar(): void {
    if (!this.healthBar) return;

    this.healthBar.clear();
    const healthPercent = this.bossHealth / this.maxHealth;
    const barWidth = 196 * healthPercent;

    // Color changes based on health
    let color = 0x00ff00; // Green
    if (healthPercent < 0.5) color = 0xffff00; // Yellow
    if (healthPercent < 0.25) color = 0xff0000; // Red

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(142, 12, barWidth, 12);
  }

  private playEntranceSequence(): void {
    // Start off-screen
    this.setAlpha(0);
    this.y = this.arenaTop - 100;

    // Dramatic entrance
    this.scene.cameras.main.shake(500, 0.01);

    this.scene.tweens.add({
      targets: this,
      y: this.hoverBaseY,
      alpha: 1,
      duration: 1500,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.playBossRoar();
        this.bossState = 'idle';
      },
    });
  }

  private playBossRoar(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Menacing buzz/roar
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sawtooth';
        filter.type = 'lowpass';
        filter.frequency.value = 300 - i * 50;

        const startTime = ctx.currentTime + i * 0.15;
        osc.frequency.setValueAtTime(150 + i * 30, startTime);
        osc.frequency.exponentialRampToValueAtTime(80, startTime + 0.4);

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      }
    }
  }

  setTarget(target: Phaser.Physics.Arcade.Sprite): void {
    this.target = target;
  }

  update(): void {
    if (!this.alive) return;

    // Update hover animation
    this.hoverOffset += 0.05;
    if (this.bossState !== 'diveBomb' && this.bossState !== 'groundPound') {
      this.y = this.hoverBaseY + Math.sin(this.hoverOffset) * 10;
    }

    // Update invulnerability
    if (this.invulnerable) {
      this.invulnerableTimer -= 16;
      if (this.invulnerableTimer <= 0) {
        this.invulnerable = false;
        this.setAlpha(1);
      } else {
        // Flash during invulnerability
        this.setAlpha(Math.sin(Date.now() * 0.02) > 0 ? 1 : 0.3);
      }
    }

    // Attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= 16;
    }

    // Phase 2 rage effects
    if (this.phase === 2) {
      this.updateRageEffects();
    }

    // Update projectiles
    this.updateProjectiles();

    // State machine
    if (this.bossState === 'idle' && this.attackCooldown <= 0) {
      this.chooseAttack();
    }

    // Face player
    if (this.target && this.bossState === 'idle') {
      this.setFlipX(this.target.x < this.x);
    }

    // Update health bar position (stays fixed on screen)
    this.updateHealthBar();
  }

  private updateRageEffects(): void {
    this.rageTimer += 0.1;

    if (!this.rageAura) {
      this.rageAura = this.scene.add.graphics();
    }

    this.rageAura.clear();
    this.rageAura.setPosition(this.x, this.y);

    // Pulsing red aura
    const pulseSize = 40 + Math.sin(this.rageTimer) * 10;
    const alpha = 0.3 + Math.sin(this.rageTimer * 2) * 0.1;
    this.rageAura.fillStyle(0xff0000, alpha);
    this.rageAura.fillCircle(0, 0, pulseSize);
  }

  private chooseAttack(): void {
    if (!this.target) return;

    const patterns = this.phase === 1
      ? ['hover', 'stingerBarrage', 'diveBomb']
      : ['rageHover', 'summonSwarm', 'stingerSpray', 'groundPound'];

    const pattern = patterns[this.attackPattern % patterns.length];
    this.attackPattern++;

    switch (pattern) {
      case 'hover':
        this.doHover();
        break;
      case 'rageHover':
        this.doRageHover();
        break;
      case 'stingerBarrage':
        this.doStingerBarrage(3);
        break;
      case 'stingerSpray':
        this.doStingerBarrage(5);
        break;
      case 'diveBomb':
        this.doDiveBomb();
        break;
      case 'summonSwarm':
        this.doSummonSwarm();
        break;
      case 'groundPound':
        this.doGroundPound();
        break;
    }
  }

  private doHover(): void {
    this.bossState = 'idle';
    this.attackCooldown = 1500;

    // Move towards player slowly
    if (this.target) {
      const targetX = Phaser.Math.Clamp(this.target.x, this.arenaLeft + 50, this.arenaRight - 50);
      this.scene.tweens.add({
        targets: this,
        x: targetX,
        duration: 1000,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private doRageHover(): void {
    this.bossState = 'idle';
    this.attackCooldown = 800; // Faster in phase 2

    // Erratic movement
    const randomX = Phaser.Math.Between(this.arenaLeft + 50, this.arenaRight - 50);
    const randomY = Phaser.Math.Between(this.arenaTop + 30, this.hoverBaseY + 20);

    this.scene.tweens.add({
      targets: this,
      x: randomX,
      duration: 400,
      ease: 'Sine.easeInOut',
    });

    this.hoverBaseY = randomY;
  }

  private doStingerBarrage(count: number): void {
    this.bossState = 'stingerBarrage';
    this.play('giant-wasp-attack');
    this.attackCooldown = this.phase === 1 ? 2500 : 1800;

    // Fire stingers in sequence
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        if (!this.alive) return;
        this.fireStinger(i, count);
      });
    }

    // Return to idle after attack
    this.scene.time.delayedCall(count * 200 + 300, () => {
      if (this.alive) {
        this.bossState = 'idle';
        this.play('giant-wasp-idle');
      }
    });
  }

  private fireStinger(index: number, total: number): void {
    if (!this.target) return;

    const stinger = this.scene.add.sprite(this.x, this.y + 20, 'stinger_missile', 'fly_0');
    stinger.play('stinger-fly');
    stinger.setDepth(5);

    // Calculate angle - spread for spray pattern
    let angle: number;
    if (total > 3) {
      // Spread pattern
      const spreadAngle = 60; // degrees
      const angleStep = spreadAngle / (total - 1);
      angle = -spreadAngle / 2 + index * angleStep;
      angle = Phaser.Math.DegToRad(90 + angle); // Down + spread
    } else {
      // Aimed at player
      angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
    }

    const speed = 150;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    stinger.setRotation(angle + Math.PI / 2);

    this.stingerMissiles.push(stinger);

    // Animate stinger movement
    this.scene.tweens.add({
      targets: stinger,
      x: stinger.x + vx * 3,
      y: stinger.y + vy * 3,
      duration: 1500,
      onComplete: () => {
        stinger.destroy();
        const idx = this.stingerMissiles.indexOf(stinger);
        if (idx > -1) this.stingerMissiles.splice(idx, 1);
      },
    });

    this.playStingerSound();
  }

  private playStingerSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }
  }

  private doDiveBomb(): void {
    if (!this.target) return;

    this.bossState = 'diveBomb';
    this.play('giant-wasp-attack');
    this.attackCooldown = 3000;

    const targetX = this.target.x;
    const startY = this.y;

    // Telegraph - hover up first
    this.scene.tweens.add({
      targets: this,
      y: this.arenaTop + 20,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Dive!
        this.scene.tweens.add({
          targets: this,
          x: targetX,
          y: this.arenaBottom - 40,
          duration: 400,
          ease: 'Quad.easeIn',
          onComplete: () => {
            // Screen shake on impact
            this.scene.cameras.main.shake(200, 0.02);
            this.playImpactSound();

            // Return to hover
            this.scene.tweens.add({
              targets: this,
              y: startY,
              duration: 800,
              ease: 'Sine.easeOut',
              onComplete: () => {
                this.bossState = 'idle';
                this.hoverBaseY = startY;
                this.play('giant-wasp-idle');
              },
            });
          },
        });
      },
    });
  }

  private doGroundPound(): void {
    if (!this.target) return;

    this.bossState = 'groundPound';
    this.play('giant-wasp-rage');
    this.attackCooldown = 3500;

    const startY = this.y;

    // Rise up
    this.scene.tweens.add({
      targets: this,
      y: this.arenaTop + 10,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // SLAM down
        this.scene.tweens.add({
          targets: this,
          y: this.arenaBottom - 30,
          duration: 300,
          ease: 'Quad.easeIn',
          onComplete: () => {
            // Massive impact
            this.scene.cameras.main.shake(400, 0.04);
            this.playImpactSound();
            this.createShockwave();

            // Return
            this.scene.time.delayedCall(500, () => {
              this.scene.tweens.add({
                targets: this,
                y: startY,
                duration: 1000,
                ease: 'Sine.easeOut',
                onComplete: () => {
                  this.bossState = 'idle';
                  this.hoverBaseY = startY;
                  this.play(this.phase === 2 ? 'giant-wasp-rage' : 'giant-wasp-idle');
                },
              });
            });
          },
        });
      },
    });
  }

  private createShockwave(): void {
    // Visual shockwave
    const wave = this.scene.add.graphics();
    wave.setPosition(this.x, this.arenaBottom - 20);

    let radius = 10;
    const maxRadius = 150;

    const expandWave = () => {
      wave.clear();
      wave.lineStyle(4, 0xffff00, 1 - radius / maxRadius);
      wave.strokeCircle(0, 0, radius);
      radius += 8;

      if (radius < maxRadius) {
        this.scene.time.delayedCall(16, expandWave);
      } else {
        wave.destroy();
      }
    };
    expandWave();
  }

  private doSummonSwarm(): void {
    this.bossState = 'attack';
    this.play('giant-wasp-rage');
    this.attackCooldown = 4000;

    // Summon mini wasps
    const swarmCount = 4;
    for (let i = 0; i < swarmCount; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        if (!this.alive) return;
        this.spawnSwarmWasp();
      });
    }

    this.scene.time.delayedCall(swarmCount * 200 + 500, () => {
      if (this.alive) {
        this.bossState = 'idle';
        this.play('giant-wasp-rage');
      }
    });
  }

  private spawnSwarmWasp(): void {
    const offsetX = Phaser.Math.Between(-30, 30);
    const offsetY = Phaser.Math.Between(-30, 30);

    const wasp = this.scene.add.sprite(this.x + offsetX, this.y + offsetY, 'swarm_wasp', 'fly_0');
    wasp.play('swarm-wasp-fly');
    wasp.setDepth(5);
    wasp.setScale(0.8);

    this.swarmWasps.push(wasp);

    // Fly towards player erratically
    if (this.target) {
      const targetX = this.target.x + Phaser.Math.Between(-50, 50);
      const targetY = this.target.y + Phaser.Math.Between(-30, 30);

      this.scene.tweens.add({
        targets: wasp,
        x: targetX,
        y: targetY,
        duration: Phaser.Math.Between(1500, 2500),
        ease: 'Sine.easeInOut',
        onComplete: () => {
          // Explode after reaching destination
          this.createMiniExplosion(wasp.x, wasp.y);
          wasp.destroy();
          const idx = this.swarmWasps.indexOf(wasp);
          if (idx > -1) this.swarmWasps.splice(idx, 1);
        },
      });
    }

    this.playBuzzSound();
  }

  private createMiniExplosion(x: number, y: number): void {
    const explosion = this.scene.add.graphics();
    explosion.setPosition(x, y);
    explosion.fillStyle(0xffff00, 0.8);
    explosion.fillCircle(0, 0, 15);

    this.scene.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 2,
      duration: 200,
      onComplete: () => explosion.destroy(),
    });
  }

  private playBuzzSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  }

  private playImpactSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Low thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  }

  private updateProjectiles(): void {
    // Check stinger collisions with player
    if (this.target) {
      this.stingerMissiles.forEach((stinger) => {
        if (!stinger.active) return;
        const dist = Phaser.Math.Distance.Between(stinger.x, stinger.y, this.target!.x, this.target!.y);
        if (dist < 20) {
          // Mark for collision handling by GameScene
        }
      });

      this.swarmWasps.forEach((wasp) => {
        if (!wasp.active) return;
        const dist = Phaser.Math.Distance.Between(wasp.x, wasp.y, this.target!.x, this.target!.y);
        if (dist < 15) {
          // Mark for collision handling by GameScene
        }
      });
    }
  }

  getProjectiles(): Phaser.GameObjects.Sprite[] {
    return [...this.stingerMissiles, ...this.swarmWasps];
  }

  takeDamage(): void {
    if (!this.alive || this.invulnerable) return;

    this.bossHealth--;
    this.invulnerable = true;
    this.invulnerableTimer = 500;

    // Flash red
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.alive) this.clearTint();
    });

    // Play hurt animation briefly
    this.play('giant-wasp-hurt');
    this.scene.time.delayedCall(300, () => {
      if (this.alive && this.bossState !== 'defeat') {
        this.play(this.phase === 2 ? 'giant-wasp-rage' : 'giant-wasp-idle');
      }
    });

    // Screen shake
    this.scene.cameras.main.shake(100, 0.01);

    this.playHurtSound();

    // Check for phase transition
    if (this.bossHealth <= 10 && this.phase === 1) {
      this.enterPhase2();
    }

    // Check for defeat
    if (this.bossHealth <= 0) {
      this.defeat();
    }

    this.updateHealthBar();
  }

  private playHurtSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  }

  private enterPhase2(): void {
    this.phase = 2;
    this.bossState = 'rage';

    // Dramatic pause
    this.scene.time.delayedCall(100, () => {
      this.play('giant-wasp-rage');

      // Screen effects
      this.scene.cameras.main.shake(1000, 0.03);
      this.scene.cameras.main.flash(500, 255, 0, 0);

      // Roar
      this.playBossRoar();

      // Show phase 2 text
      const phaseText = this.scene.add.text(240, 135, 'PHASE 2: ENRAGED!', {
        fontSize: '16px',
        color: '#ff0000',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      });
      phaseText.setOrigin(0.5);
      phaseText.setScrollFactor(0);
      phaseText.setDepth(300);

      this.scene.tweens.add({
        targets: phaseText,
        alpha: 0,
        scale: 1.5,
        duration: 2000,
        onComplete: () => phaseText.destroy(),
      });

      // Resume after dramatic moment
      this.scene.time.delayedCall(1500, () => {
        if (this.alive) {
          this.bossState = 'idle';
          this.attackCooldown = 500;
        }
      });
    });
  }

  private defeat(): void {
    this.alive = false;
    this.bossState = 'defeat';

    // Clear all projectiles
    this.stingerMissiles.forEach((s) => s.destroy());
    this.swarmWasps.forEach((w) => w.destroy());
    this.stingerMissiles = [];
    this.swarmWasps = [];

    // Clear rage aura
    if (this.rageAura) {
      this.rageAura.destroy();
      this.rageAura = null;
    }

    // Play defeat animation
    this.play('giant-wasp-defeat');

    // Create falling crown
    this.createFallingCrown();

    // Defeat sequence
    this.scene.cameras.main.shake(500, 0.03);

    // Spin and fall
    this.scene.tweens.add({
      targets: this,
      rotation: Math.PI * 4,
      y: this.arenaBottom - 20,
      alpha: 0,
      duration: 2000,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        // Emit victory event
        this.emit('defeated');
        this.destroy();
      },
    });

    // Victory sound
    this.playDefeatSound();
  }

  private createFallingCrown(): void {
    // Create a crown that falls off
    this.crown = this.scene.add.graphics();
    this.crown.setPosition(this.x, this.y - 30);

    // Draw crown
    this.crown.fillStyle(0xffd700, 1);
    this.crown.fillRect(-10, 0, 20, 8);
    this.crown.fillTriangle(-10, 0, -6, -8, -2, 0);
    this.crown.fillTriangle(-2, 0, 2, -10, 6, 0);
    this.crown.fillTriangle(6, 0, 10, -8, 14, 0);

    // Jewels
    this.crown.fillStyle(0xff0000, 1);
    this.crown.fillCircle(-4, -4, 2);
    this.crown.fillStyle(0x0000ff, 1);
    this.crown.fillCircle(4, -4, 2);

    // Animate crown falling
    this.scene.tweens.add({
      targets: this.crown,
      y: this.arenaBottom - 10,
      rotation: Math.PI * 2,
      duration: 1500,
      ease: 'Bounce.easeOut',
    });
  }

  private playDefeatSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Descending defeat sound
      const notes = [400, 350, 300, 250, 200, 150, 100];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        const startTime = ctx.currentTime + i * 0.15;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    }
  }

  isAlive(): boolean {
    return this.alive;
  }

  isInvulnerable(): boolean {
    return this.invulnerable;
  }

  getHealth(): number {
    return this.bossHealth;
  }

  getPhase(): BossPhase {
    return this.phase;
  }
}
