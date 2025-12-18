import Phaser from 'phaser';

// Witty bureaucratic catchphrases
const BUREAUCRAT_QUOTES = [
  'Circle back and double down!',
  'Let\'s take this offline...',
  'Per my last email...',
  'It\'s a process issue.',
  'We need to align on this.',
  'Touch base going forward.',
  'Synergize the deliverables!',
  'That\'s above my pay grade.',
  'I\'ll escalate this upstream.',
  'We\'re all in the loop now.',
  'Action this by EOD.',
  'Let\'s leverage best practices.',
  'Put a pin in that.',
  'It\'s on my radar.',
  'Moving the needle here.',
];

export class Bureaucrat extends Phaser.Physics.Arcade.Sprite {
  private patrolDistance: number;
  private startX: number;
  private direction: number = 1;
  private speed: number = 25; // Very slow - bureaucracy!
  private alive: boolean = true;
  private paperworkTimer: number = 0;
  private speechBubble: Phaser.GameObjects.Graphics | null = null;
  private speechText: Phaser.GameObjects.Text | null = null;
  private speechCooldown: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolDistance: number = 50) {
    super(scene, x, y, 'bureaucrat');

    this.startX = x;
    this.patrolDistance = patrolDistance;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics setup
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setSize(16, 28);
    body.setOffset(8, 4);
    body.setBounce(0);
    body.setCollideWorldBounds(false);

    // Create bureaucrat sprite if it doesn't exist
    this.createBureaucratSprite(scene);

    // Start animation
    this.play('bureaucrat-walk');
  }

  private createBureaucratSprite(scene: Phaser.Scene): void {
    if (scene.textures.exists('bureaucrat')) return;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Draw 4 frames of a bureaucrat with paperwork
    for (let frame = 0; frame < 4; frame++) {
      const x = frame * 32;
      const walkOffset = frame % 2 === 0 ? 0 : 1;

      // Body (grey suit)
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(x + 10, 10, 12, 14);

      // Head
      ctx.fillStyle = '#f5deb3';
      ctx.fillRect(x + 11, 4, 10, 8);

      // Hair (neat, grey-tinged)
      ctx.fillStyle = '#555555';
      ctx.fillRect(x + 11, 2, 10, 4);

      // Glasses
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 12, 6, 3, 2);
      ctx.fillRect(x + 17, 6, 3, 2);
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x + 15, 7);
      ctx.lineTo(x + 17, 7);
      ctx.stroke();

      // Tie
      ctx.fillStyle = '#8b0000';
      ctx.fillRect(x + 15, 10, 2, 8);

      // Stack of paperwork
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 22, 8 + walkOffset, 8, 10);
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(x + 22, 10 + walkOffset, 8, 1);
      ctx.fillRect(x + 22, 13 + walkOffset, 8, 1);
      ctx.fillRect(x + 22, 16 + walkOffset, 8, 1);

      // Legs (walking)
      ctx.fillStyle = '#2c2c2c';
      ctx.fillRect(x + 11 + walkOffset, 24, 4, 8);
      ctx.fillRect(x + 17 - walkOffset, 24, 4, 8);

      // Shoes
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 10 + walkOffset, 30, 6, 2);
      ctx.fillRect(x + 16 - walkOffset, 30, 6, 2);
    }

    scene.textures.addCanvas('bureaucrat', canvas);

    // Create animation
    scene.anims.create({
      key: 'bureaucrat-walk',
      frames: [
        { key: 'bureaucrat', frame: '__BASE' },
      ],
      frameRate: 4, // Slow walk
      repeat: -1,
    });

    scene.anims.create({
      key: 'bureaucrat-hurt',
      frames: [
        { key: 'bureaucrat', frame: '__BASE' },
      ],
      frameRate: 1,
      repeat: 0,
    });
  }

  update(): void {
    if (!this.alive) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Paperwork shuffle timer
    this.paperworkTimer += 0.02;

    // Speech cooldown
    if (this.speechCooldown > 0) {
      this.speechCooldown -= 16; // ~60fps
    }

    // Very slow patrol movement
    body.setVelocityX(this.speed * this.direction);

    // Occasionally stop to "check paperwork" and maybe say something
    if (Math.random() < 0.002) {
      body.setVelocityX(0);

      // 50% chance to say something when stopping
      if (Math.random() < 0.5 && this.speechCooldown <= 0) {
        this.showSpeechBubble();
      }

      this.scene.time.delayedCall(500, () => {
        if (this.alive) {
          body.setVelocityX(this.speed * this.direction);
        }
      });
    }

    // Random chance to speak while walking (more frequent for comedic effect)
    if (Math.random() < 0.002 && this.speechCooldown <= 0) {
      this.showSpeechBubble();
    }

    // Reverse at patrol bounds
    if (this.x > this.startX + this.patrolDistance) {
      this.direction = -1;
    } else if (this.x < this.startX - this.patrolDistance) {
      this.direction = 1;
    }

    // Update speech bubble position if visible
    if (this.speechBubble && this.speechText) {
      this.speechBubble.setPosition(this.x, this.y - 40);
      this.speechText.setPosition(this.x, this.y - 40);
    }

    // Flip sprite based on direction
    this.setFlipX(this.direction < 0);
  }

  private showSpeechBubble(): void {
    // Don't show if one is already visible
    if (this.speechBubble) return;

    this.speechCooldown = 3000; // 3 second cooldown between speeches

    // Pick a random quote
    const quote = BUREAUCRAT_QUOTES[Math.floor(Math.random() * BUREAUCRAT_QUOTES.length)];

    // Calculate bubble dimensions
    const padding = 8;
    const fontSize = 7;
    const maxWidth = 100;

    // Create speech text first to measure
    this.speechText = this.scene.add.text(this.x, this.y - 40, quote, {
      fontSize: `${fontSize}px`,
      color: '#333333',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      wordWrap: { width: maxWidth - padding * 2 },
      align: 'center',
    });
    this.speechText.setOrigin(0.5);
    this.speechText.setDepth(101);

    // Create bubble background
    const textBounds = this.speechText.getBounds();
    const bubbleWidth = Math.max(textBounds.width + padding * 2, 40);
    const bubbleHeight = textBounds.height + padding * 2;

    this.speechBubble = this.scene.add.graphics();
    this.speechBubble.setPosition(this.x, this.y - 40);

    // Draw bubble (centered at origin)
    this.speechBubble.fillStyle(0xffffff, 1);
    this.speechBubble.fillRoundedRect(
      -bubbleWidth / 2,
      -bubbleHeight / 2,
      bubbleWidth,
      bubbleHeight,
      6
    );

    // Speech bubble pointer
    this.speechBubble.fillTriangle(
      -5, bubbleHeight / 2 - 2,
      5, bubbleHeight / 2 - 2,
      0, bubbleHeight / 2 + 6
    );

    // Border
    this.speechBubble.lineStyle(1.5, 0x4a4a4a, 1);
    this.speechBubble.strokeRoundedRect(
      -bubbleWidth / 2,
      -bubbleHeight / 2,
      bubbleWidth,
      bubbleHeight,
      6
    );

    this.speechBubble.setDepth(100);

    // Fade in
    this.speechBubble.setAlpha(0);
    this.speechText.setAlpha(0);

    this.scene.tweens.add({
      targets: [this.speechBubble, this.speechText],
      alpha: 1,
      duration: 150,
      ease: 'Linear',
    });

    // Fade out after delay
    this.scene.time.delayedCall(2500, () => {
      if (this.speechBubble && this.speechText) {
        this.scene.tweens.add({
          targets: [this.speechBubble, this.speechText],
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this.speechBubble?.destroy();
            this.speechText?.destroy();
            this.speechBubble = null;
            this.speechText = null;
          },
        });
      }
    });
  }

  stomp(): void {
    if (!this.alive) return;
    this.alive = false;

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
    this.play('bureaucrat-hurt');
    this.setTint(0xff0000);

    // Stop movement
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(false);

    // Play defeat sound (paperwork rustling)
    this.playDefeatSound();

    // Papers scatter and fade out
    this.scene.tweens.add({
      targets: this,
      rotation: Math.PI * 2,
      alpha: 0,
      y: this.y + 20,
      duration: 600,
      onComplete: () => {
        this.destroy();
      },
    });
  }

  private playDefeatSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      // Paper rustling sound (white noise burst)
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 2000;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + 0.2);
    }
  }

  isAlive(): boolean {
    return this.alive;
  }
}
