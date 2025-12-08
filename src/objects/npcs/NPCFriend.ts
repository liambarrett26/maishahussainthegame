import Phaser from 'phaser';

export interface NPCFriendConfig {
  id: string;
  name: string;
  spriteKey: string;
}

// NPC Friend data
export const NPC_FRIENDS: Record<string, { name: string; spriteKey: string; level: string; isAdvisor?: boolean; advice?: string }> = {
  liam: { name: 'Liam', spriteKey: 'liam', level: 'varndean' },
  beth_twine: { name: 'Beth Twine', spriteKey: 'beth_twine', level: 'varndean' },
  eliza: { name: 'Eliza', spriteKey: 'eliza', level: 'varndean' },
  sean: {
    name: 'Sean',
    spriteKey: 'sean',
    level: 'varndean',
    isAdvisor: true,
    advice: "The key to chemistry is understanding that everything wants to be stable. Balance your reactions, and you'll balance anything!"
  },
  beth_levy: { name: 'Beth Levy', spriteKey: 'beth_levy', level: 'ucl' },
};

export class NPCFriend extends Phaser.Physics.Arcade.Sprite {
  public readonly friendId: string;
  public readonly friendName: string;
  private collected: boolean = false;
  private isFollowing: boolean = false;
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  private followOffset: number = 0;
  private positionHistory: Array<{ x: number; y: number }> = [];
  private exclamationMark: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, config: NPCFriendConfig) {
    super(scene, x, y, config.spriteKey, 'idle_0');

    this.friendId = config.id;
    this.friendName = config.name;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    this.setSize(20, 28);
    this.setOffset(6, 4);

    // Play idle animation
    this.play(`${config.spriteKey}-idle`);

    // Add exclamation mark above head to show interactable
    this.exclamationMark = scene.add.text(x, y - 25, '!', {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.exclamationMark.setOrigin(0.5);

    // Animate exclamation mark
    scene.tweens.add({
      targets: this.exclamationMark,
      y: y - 30,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  collect(onComplete?: () => void): void {
    if (this.collected) return;
    this.collected = true;

    // Remove exclamation mark
    if (this.exclamationMark) {
      this.exclamationMark.destroy();
      this.exclamationMark = null;
    }

    // Play wave animation
    this.play(`${this.texture.key}-wave`);

    // Create hearts particle effect
    this.createHeartsEffect();

    // Play friendship sound
    this.playFriendshipSound();

    // Flash the screen gold briefly
    this.scene.cameras.main.flash(200, 255, 215, 0, true);

    // Show name popup
    this.showNamePopup();

    // After wave animation completes, start following
    this.scene.time.delayedCall(1200, () => {
      this.isFollowing = true;
      this.play(`${this.texture.key}-idle`);

      // Disable physics collision for following
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.enable = false;

      onComplete?.();
    });
  }

  setFollowTarget(target: Phaser.Physics.Arcade.Sprite, offset: number): void {
    this.target = target;
    this.followOffset = offset;
    this.isFollowing = true;

    // Initialize position history with larger delay for more spacing
    this.positionHistory = [];
    const baseDelay = 40; // Base delay frames
    const offsetDelay = 25; // Additional frames per friend index
    for (let i = 0; i < baseDelay + offset * offsetDelay; i++) {
      this.positionHistory.push({ x: target.x, y: target.y });
    }
  }

  update(): void {
    if (!this.isFollowing || !this.target) return;

    // Add target's current position to history
    this.positionHistory.push({ x: this.target.x, y: this.target.y });

    // Remove oldest position if history is too long
    const baseDelay = 40;
    const offsetDelay = 25;
    const historyLength = baseDelay + this.followOffset * offsetDelay;
    while (this.positionHistory.length > historyLength) {
      this.positionHistory.shift();
    }

    // Follow the delayed position with horizontal stagger
    if (this.positionHistory.length > 0) {
      const delayedPos = this.positionHistory[0];

      // Add horizontal offset based on friend index (alternating left/right)
      const staggerOffset = (this.followOffset % 2 === 0 ? -1 : 1) * (8 + this.followOffset * 4);
      this.x = delayedPos.x + staggerOffset;
      this.y = delayedPos.y;

      // Face toward Maisha (the target)
      if (this.target.x < this.x) {
        this.setFlipX(true);
      } else if (this.target.x > this.x) {
        this.setFlipX(false);
      }
    }
  }

  private createHeartsEffect(): void {
    // Create heart texture if not exists
    if (!this.scene.textures.exists('heart-particle')) {
      const graphics = this.scene.add.graphics();
      // Draw a simple heart shape using circles and triangle
      graphics.fillStyle(0xff69b4, 1);
      // Two circles at top
      graphics.fillCircle(2.5, 2.5, 2.5);
      graphics.fillCircle(5.5, 2.5, 2.5);
      // Triangle bottom
      graphics.fillTriangle(0, 3, 8, 3, 4, 8);
      graphics.generateTexture('heart-particle', 8, 8);
      graphics.destroy();
    }

    // Create particle emitter
    const particles = this.scene.add.particles(this.x, this.y, 'heart-particle', {
      speed: { min: 30, max: 80 },
      angle: { min: 220, max: 320 }, // Mostly upward
      scale: { start: 1.5, end: 0.5 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      quantity: 12,
      emitting: false,
    });

    particles.explode();

    // Create circling hearts
    for (let i = 0; i < 6; i++) {
      const heart = this.scene.add.graphics();
      heart.fillStyle(0xff69b4, 1);
      heart.fillCircle(0, 0, 4);

      const angle = (i / 6) * Math.PI * 2;
      const radius = 25;
      heart.setPosition(
        this.x + Math.cos(angle) * radius,
        this.y + Math.sin(angle) * radius
      );

      // Animate hearts circling and converging
      this.scene.tweens.add({
        targets: heart,
        x: this.x,
        y: this.y - 10,
        scale: 0,
        duration: 800,
        delay: i * 100,
        ease: 'Quad.easeIn',
        onComplete: () => heart.destroy(),
      });
    }

    this.scene.time.delayedCall(1100, () => particles.destroy());
  }

  private showNamePopup(): void {
    // Check if this is an advisor NPC with special advice
    const friendData = NPC_FRIENDS[this.friendId];
    const isAdvisor = friendData?.isAdvisor;
    const advice = friendData?.advice;

    // Create speech bubble with introduction or advice
    const message = isAdvisor && advice
      ? `${this.friendName}: "${advice}"`
      : `Hi, I'm ${this.friendName}!`;

    // Wider bubble for advisor messages
    const bubbleWidth = isAdvisor ? Math.min(message.length * 5 + 30, 280) : message.length * 7 + 20;
    const bubbleHeight = isAdvisor ? 60 : 28;
    const bubbleX = this.x;
    const bubbleY = this.y - (isAdvisor ? 70 : 50);

    // Speech bubble background
    const bubble = this.scene.add.graphics();
    bubble.fillStyle(0xffffff, 1);
    bubble.fillRoundedRect(
      bubbleX - bubbleWidth / 2,
      bubbleY - bubbleHeight / 2,
      bubbleWidth,
      bubbleHeight,
      8
    );

    // Speech bubble pointer (triangle pointing down)
    bubble.fillTriangle(
      bubbleX - 6,
      bubbleY + bubbleHeight / 2 - 2,
      bubbleX + 6,
      bubbleY + bubbleHeight / 2 - 2,
      bubbleX,
      bubbleY + bubbleHeight / 2 + 8
    );

    // Border
    bubble.lineStyle(2, 0x333333, 1);
    bubble.strokeRoundedRect(
      bubbleX - bubbleWidth / 2,
      bubbleY - bubbleHeight / 2,
      bubbleWidth,
      bubbleHeight,
      8
    );

    bubble.setDepth(100);

    // Speech text (with word wrap for advisor messages)
    const speechText = this.scene.add.text(bubbleX, bubbleY, message, {
      fontSize: isAdvisor ? '8px' : '10px',
      color: '#333333',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      wordWrap: { width: bubbleWidth - 20 },
      align: 'center',
    });
    speechText.setOrigin(0.5);
    speechText.setDepth(101);

    // Animate speech bubble appearing then fading
    bubble.setAlpha(0);
    speechText.setAlpha(0);

    // Pop in effect
    this.scene.tweens.add({
      targets: [bubble, speechText],
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });

    // Hold then fade out (longer for advisor messages)
    const holdTime = isAdvisor ? 5000 : 2000;
    this.scene.time.delayedCall(holdTime, () => {
      this.scene.tweens.add({
        targets: [bubble, speechText],
        alpha: 0,
        y: bubbleY - 20,
        duration: 500,
        ease: 'Quad.easeIn',
        onComplete: () => {
          bubble.destroy();
          speechText.destroy();
        },
      });
    });
  }

  private playFriendshipSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Cheerful ascending notes
      const notes = [523, 659, 784, 880, 1047]; // C5, E5, G5, A5, C6
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = freq;

        const startTime = ctx.currentTime + i * 0.1;
        gainNode.gain.setValueAtTime(0.25, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    }
  }

  isCollected(): boolean {
    return this.collected;
  }

  isCurrentlyFollowing(): boolean {
    return this.isFollowing;
  }
}
