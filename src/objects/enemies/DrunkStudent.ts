import Phaser from 'phaser';

type DrunkState = 'stumble' | 'bash' | 'vomit' | 'hit';

// Drunk student quotes - slurred and tipsy!
const DRUNK_QUOTES = [
  "Mate... MATE!",
  "You're my best friend!",
  "I'm not even drunk!",
  "*hic* ...what?",
  "Let's get kebabs!",
  "I love you, man!",
  "One more shot!",
  "Cheeky Nandos?",
  "Wait... where am I?",
  "This is MY song!",
  "I'm gonna be sick...",
  "YOU DON'T KNOW ME!",
  "I'm fiiiine...",
  "Did someone say pub?",
  "Hold my drink!",
  "*incoherent mumbling*",
  "Best night EVER!",
  "No, YOU'RE drunk!",
];

export class DrunkStudent extends Phaser.Physics.Arcade.Sprite {
  private patrolDistance: number;
  private startX: number;
  private direction: number = 1;
  private speed: number = 40;
  private alive: boolean = true;
  private wobbleTimer: number = 0;
  private drunkState: DrunkState = 'stumble';
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  private detectRange: number = 120;
  private bashSpeed: number = 100;
  private attackCooldown: number = 0;
  private variant: 'grey' | 'navy';
  private vomitProjectiles: Phaser.GameObjects.Sprite[] = [];
  // Speech bubble properties
  private speechBubble: Phaser.GameObjects.Graphics | null = null;
  private speechText: Phaser.GameObjects.Text | null = null;
  private speechCooldown: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolDistance: number = 60) {
    // Randomly choose variant
    const variant = Math.random() < 0.5 ? 'grey' : 'navy';
    super(scene, x, y, `drunk_student_${variant}`, 'stumble_0');

    this.variant = variant;
    this.startX = x;
    this.patrolDistance = patrolDistance;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics setup
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setSize(20, 28);
    body.setOffset(6, 4);
    body.setBounce(0);
    body.setCollideWorldBounds(false);

    // Start animation
    this.play(`drunk-${this.variant}-stumble`);
  }

  setTarget(target: Phaser.Physics.Arcade.Sprite): void {
    this.target = target;
  }

  update(): void {
    if (!this.alive) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Decrease attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= 16; // Assuming ~60fps
    }

    // Decrease speech cooldown
    if (this.speechCooldown > 0) {
      this.speechCooldown -= 16;
    }

    // Wobble timer for drunk movement
    this.wobbleTimer += 0.05;

    // Check if player is visible and decide attack
    if (this.target && this.drunkState === 'stumble' && this.attackCooldown <= 0) {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
      if (distance < this.detectRange) {
        // Face the target
        this.direction = this.target.x < this.x ? -1 : 1;

        // 30% chance to attack when player visible
        if (Math.random() < 0.3) {
          // 50% bash, 50% vomit
          if (Math.random() < 0.5) {
            this.startBash();
          } else {
            this.startVomit();
          }
        }
      }
    }

    // State machine
    switch (this.drunkState) {
      case 'stumble':
        this.updateStumble(body);
        break;
      case 'bash':
        this.updateBash(body);
        break;
      case 'vomit':
        // Standing still during vomit
        body.setVelocityX(0);
        break;
    }

    // Update vomit projectiles
    this.updateVomitProjectiles();

    // Random drunk mumbling (frequent because they're drunk!)
    if (Math.random() < 0.003 && this.speechCooldown <= 0 && this.drunkState === 'stumble') {
      this.showSpeechBubble();
    }

    // Update speech bubble position if visible (wobble with the drunk)
    if (this.speechBubble && this.speechText) {
      this.speechBubble.setPosition(this.x, this.y - 35);
      this.speechText.setPosition(this.x, this.y - 35);
      // Wobble the speech bubble too!
      this.speechBubble.setRotation(Math.sin(this.wobbleTimer * 2) * 0.05);
      this.speechText.setRotation(Math.sin(this.wobbleTimer * 2) * 0.05);
    }

    // Flip sprite based on direction
    this.setFlipX(this.direction < 0);
  }

  private updateStumble(body: Phaser.Physics.Arcade.Body): void {
    // Wobble offset for drunk movement
    const wobbleOffset = Math.sin(this.wobbleTimer * 3) * 0.5;
    body.setVelocityX((this.speed + wobbleOffset * 10) * this.direction);

    // Random direction changes (drunk behavior)
    if (Math.random() < 0.005) {
      this.direction *= -1;
    }

    // Reverse at patrol bounds
    if (this.x > this.startX + this.patrolDistance) {
      this.direction = -1;
    } else if (this.x < this.startX - this.patrolDistance) {
      this.direction = 1;
    }

    // Wobble the sprite rotation slightly
    this.setRotation(Math.sin(this.wobbleTimer * 2) * 0.1);
  }

  private startBash(): void {
    this.drunkState = 'bash';
    this.play(`drunk-${this.variant}-bash`);
    this.attackCooldown = 2000; // 2 second cooldown

    // Set a timer to return to stumble
    this.scene.time.delayedCall(1500, () => {
      if (this.alive && this.drunkState === 'bash') {
        this.returnToStumble();
      }
    });
  }

  private updateBash(body: Phaser.Physics.Arcade.Body): void {
    // Charge towards where the player was
    body.setVelocityX(this.bashSpeed * this.direction);
    this.setRotation(0);
  }

  private startVomit(): void {
    this.drunkState = 'vomit';
    this.play(`drunk-${this.variant}-vomit`);
    this.attackCooldown = 3000; // 3 second cooldown

    // Spawn vomit projectile after a short delay
    this.scene.time.delayedCall(400, () => {
      if (this.alive && this.drunkState === 'vomit') {
        this.spawnVomitProjectile();
      }
    });

    // Return to stumble after vomit animation
    this.scene.time.delayedCall(800, () => {
      if (this.alive && this.drunkState === 'vomit') {
        this.returnToStumble();
      }
    });
  }

  private spawnVomitProjectile(): void {
    // Create vomit projectile sprite
    const vomit = this.scene.add.sprite(
      this.x + (this.direction * 15),
      this.y - 5,
      'vomit_projectile',
      'arc_0'
    );
    vomit.play('vomit-arc');
    vomit.setDepth(1);

    // Store reference for collision checking and cleanup
    this.vomitProjectiles.push(vomit);

    // Animate projectile in an arc
    const targetX = this.x + (this.direction * 80);
    const duration = 600;

    this.scene.tweens.add({
      targets: vomit,
      x: targetX,
      y: { value: this.y + 10, duration: duration, ease: 'Quad.easeIn' },
      duration: duration,
      onUpdate: (_tween, _target, key, _current, _start, _end) => {
        // Arc motion - rise then fall
        if (key === 'x') {
          const progress = _tween.progress;
          const arcHeight = 40;
          const yOffset = Math.sin(progress * Math.PI) * arcHeight;
          vomit.y = this.y - 5 - yOffset + (progress * 15);
        }
      },
      onComplete: () => {
        // Create puddle where vomit lands
        this.createVomitPuddle(vomit.x, this.y + 5);
        vomit.destroy();
        // Remove from array
        const index = this.vomitProjectiles.indexOf(vomit);
        if (index > -1) {
          this.vomitProjectiles.splice(index, 1);
        }
      },
    });

    // Play vomit sound
    this.playVomitSound();
  }

  private updateVomitProjectiles(): void {
    // Check collision with player
    if (this.target) {
      this.vomitProjectiles.forEach((vomit) => {
        if (!vomit.active) return;
        const distance = Phaser.Math.Distance.Between(vomit.x, vomit.y, this.target!.x, this.target!.y);
        if (distance < 15) {
          // Hit player - handled by GameScene collision
        }
      });
    }
  }

  private createVomitPuddle(x: number, y: number): void {
    // Create a hazardous puddle that damages the player
    const puddle = this.scene.add.sprite(x, y, 'vomit_puddle', 'puddle_0');
    puddle.setDepth(-1);
    puddle.setScale(0.8);

    // Fade out and destroy after a few seconds
    this.scene.tweens.add({
      targets: puddle,
      alpha: 0,
      scale: 0.5,
      delay: 2000,
      duration: 1000,
      onComplete: () => puddle.destroy(),
    });
  }

  private returnToStumble(): void {
    this.drunkState = 'stumble';
    this.play(`drunk-${this.variant}-stumble`);
  }

  private showSpeechBubble(): void {
    // Don't show if one is already visible
    if (this.speechBubble) return;

    this.speechCooldown = 2500; // 2.5 second cooldown (drunk = talkative)

    // Pick a random quote
    const quote = DRUNK_QUOTES[Math.floor(Math.random() * DRUNK_QUOTES.length)];

    // Calculate bubble dimensions
    const padding = 6;
    const fontSize = 7;
    const maxWidth = 80;

    // Create temp text to measure
    const tempText = this.scene.add.text(0, 0, quote, {
      fontSize: `${fontSize}px`,
      fontFamily: 'monospace',
      wordWrap: { width: maxWidth },
    });
    const textWidth = Math.min(tempText.width, maxWidth);
    const textHeight = tempText.height;
    tempText.destroy();

    const bubbleWidth = textWidth + padding * 2;
    const bubbleHeight = textHeight + padding * 2;

    // Create speech bubble with a wobbly drunk style
    this.speechBubble = this.scene.add.graphics();
    this.speechBubble.setPosition(this.x, this.y - 35);
    this.speechBubble.setDepth(100);

    // Bubble background - slightly messy/drunk looking
    this.speechBubble.fillStyle(0xffffff, 0.9);
    this.speechBubble.fillRoundedRect(
      -bubbleWidth / 2,
      -bubbleHeight / 2,
      bubbleWidth,
      bubbleHeight,
      4
    );

    // Wobbly border
    this.speechBubble.lineStyle(1.5, 0x9b59b6, 1);
    this.speechBubble.strokeRoundedRect(
      -bubbleWidth / 2,
      -bubbleHeight / 2,
      bubbleWidth,
      bubbleHeight,
      4
    );

    // Pointer (slightly off-center for drunk effect)
    this.speechBubble.fillStyle(0xffffff, 0.9);
    this.speechBubble.fillTriangle(-3, bubbleHeight / 2, 5, bubbleHeight / 2, 1, bubbleHeight / 2 + 6);
    this.speechBubble.lineStyle(1.5, 0x9b59b6, 1);
    this.speechBubble.lineBetween(-3, bubbleHeight / 2, 1, bubbleHeight / 2 + 6);
    this.speechBubble.lineBetween(5, bubbleHeight / 2, 1, bubbleHeight / 2 + 6);

    // Create text
    this.speechText = this.scene.add.text(this.x, this.y - 35, quote, {
      fontSize: `${fontSize}px`,
      color: '#4a235a',
      fontFamily: 'monospace',
      wordWrap: { width: maxWidth },
      align: 'center',
    });
    this.speechText.setOrigin(0.5);
    this.speechText.setDepth(101);

    // Animate in with a drunk wobble
    this.speechBubble.setAlpha(0);
    this.speechBubble.setScale(0.3);
    this.speechText.setAlpha(0);
    this.speechText.setScale(0.3);

    this.scene.tweens.add({
      targets: [this.speechBubble, this.speechText],
      alpha: 1,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });

    // Fade out after a while
    this.scene.time.delayedCall(2000, () => {
      if (this.speechBubble && this.speechText) {
        this.scene.tweens.add({
          targets: [this.speechBubble, this.speechText],
          alpha: 0,
          scale: 0.5,
          duration: 300,
          onComplete: () => {
            if (this.speechBubble) {
              this.speechBubble.destroy();
              this.speechBubble = null;
            }
            if (this.speechText) {
              this.speechText.destroy();
              this.speechText = null;
            }
          },
        });
      }
    });

    // Play a slurred mumble sound
    this.playMumbleSound();
  }

  private playMumbleSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      // Low mumble sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      // Random pitch for variety
      osc.frequency.value = 120 + Math.random() * 40;

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }
  }

  getVomitProjectiles(): Phaser.GameObjects.Sprite[] {
    return this.vomitProjectiles;
  }

  stomp(): void {
    if (!this.alive) return;
    this.alive = false;
    this.drunkState = 'hit';

    // Clean up speech bubble
    if (this.speechBubble) {
      this.speechBubble.destroy();
      this.speechBubble = null;
    }
    if (this.speechText) {
      this.speechText.destroy();
      this.speechText = null;
    }

    // Play hurt animation
    this.play(`drunk-${this.variant}-hit`);
    this.setTint(0xff0000);

    // Stop movement
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(false);

    // Play defeat sound
    this.playDefeatSound();

    // Spin and fade out
    this.scene.tweens.add({
      targets: this,
      rotation: Math.PI * 2,
      alpha: 0,
      y: this.y + 20,
      duration: 500,
      onComplete: () => {
        // Clean up any remaining projectiles
        this.vomitProjectiles.forEach((v) => v.destroy());
        this.vomitProjectiles = [];
        this.destroy();
      },
    });
  }

  private playVomitSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      // Gurgling sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.value = 200;

      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  }

  private playDefeatSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      // Descending "ugh" sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  }

  isAlive(): boolean {
    return this.alive;
  }
}
