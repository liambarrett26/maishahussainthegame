import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

export interface InfoPopupConfig {
  id: string;
  title: string;
  description: string;
  spriteKey?: string;
  spriteFrame?: string;
  color?: number;
  textColor?: string; // Text color for description (default white)
}

// Predefined info popups for game elements
export const INFO_POPUPS: Record<string, InfoPopupConfig> = {
  mayo: {
    id: 'mayo',
    title: 'MAYO JAR!',
    description: 'Collect mayo for special powers!\n\nWith 10+ mayo:\n• Press M for MAYO MAISHA MODE!\n  (Invincible for 5 seconds)\n• Press H to HEAL all hearts',
    spriteKey: 'mayo',
    spriteFrame: 'bob_0',
    color: 0xfff8dc,
    textColor: '#333333', // Dark text for light background
  },
  bat: {
    id: 'bat',
    title: 'CRICKET BAT!',
    description: 'Press X to swing your bat!\nDefeat enemies without stomping.\nWorks on all enemies!',
    color: 0x8b4513,
  },
  wasp: {
    id: 'wasp',
    title: 'WASP!',
    description: 'Jump on its head to defeat it.\nAvoid touching from the sides!',
    spriteKey: 'wasp',
    spriteFrame: 'fly_0',
    color: 0xffcc00,
  },
  seagull: {
    id: 'seagull',
    title: 'SEAGULL!',
    description: 'These dive-bomb from above.\nTime your jumps carefully!',
    spriteKey: 'seagull',
    spriteFrame: 'fly_0',
    color: 0xcccccc,
  },
  drunk_student: {
    id: 'drunk_student',
    title: 'DRUNK STUDENT!',
    description: 'They stumble unpredictably.\nKeep your distance and stomp them!',
    spriteKey: 'drunk_student',
    spriteFrame: 'stumble_0',
    color: 0x9b59b6,
  },
  bureaucrat: {
    id: 'bureaucrat',
    title: 'BUREAUCRAT!',
    description: 'Slow but persistent paper-pushers.\nWatch out for their red tape!',
    spriteKey: 'bureaucrat',
    spriteFrame: 'walk_0',
    color: 0x7f8c8d,
  },
  mayo_blaster: {
    id: 'mayo_blaster',
    title: 'MAYO BLASTER!',
    description: 'Press SPACE to fire mayo globs!\nHits ALL enemies for 1 damage.',
    color: 0xffeaa7,
  },
  checkpoint: {
    id: 'checkpoint',
    title: 'CHECKPOINT!',
    description: 'Your progress has been saved.\nYou\'ll respawn here if defeated!',
    color: 0x27ae60,
  },
};

export class InfoPopup {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private isShowing: boolean = false;
  private onCloseCallback: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(config: InfoPopupConfig, onClose?: () => void): void {
    if (this.isShowing) return;

    this.isShowing = true;
    this.onCloseCallback = onClose || null;

    // Pause the game scene
    this.scene.physics.pause();
    this.scene.time.paused = true;

    // Create container for all popup elements
    this.container = this.scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.container.setScrollFactor(0);
    this.container.setDepth(500);
    this.container.setAlpha(0);
    this.container.setScale(0.5);

    // Semi-transparent background overlay
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(-GAME_WIDTH / 2, -GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT);
    this.container.add(overlay);

    // Main popup box
    const boxWidth = 220;
    const boxHeight = 140;
    const boxColor = config.color || 0x2c3e50;

    const box = this.scene.add.graphics();
    // Shadow
    box.fillStyle(0x000000, 0.3);
    box.fillRoundedRect(-boxWidth / 2 + 3, -boxHeight / 2 + 3, boxWidth, boxHeight, 8);
    // Main box
    box.fillStyle(boxColor, 1);
    box.fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 8);
    // Border
    box.lineStyle(3, 0xffffff, 1);
    box.strokeRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 8);
    // Inner highlight
    box.lineStyle(1, 0xffffff, 0.3);
    box.strokeRoundedRect(-boxWidth / 2 + 4, -boxHeight / 2 + 4, boxWidth - 8, boxHeight - 8, 6);
    this.container.add(box);

    // Title text with glow effect
    const titleShadow = this.scene.add.text(1, -boxHeight / 2 + 18, config.title, {
      fontSize: '14px',
      color: '#000000',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    titleShadow.setOrigin(0.5);
    this.container.add(titleShadow);

    const title = this.scene.add.text(0, -boxHeight / 2 + 17, config.title, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    title.setOrigin(0.5);
    this.container.add(title);

    // Sprite preview (if available)
    let spriteY = 0;
    if (config.spriteKey && this.scene.textures.exists(config.spriteKey)) {
      const sprite = this.scene.add.sprite(0, -15, config.spriteKey, config.spriteFrame);
      sprite.setScale(2);
      this.container.add(sprite);

      // Play animation if it exists
      const animKey = `${config.spriteKey}-fly`;
      if (this.scene.anims.exists(animKey)) {
        sprite.play(animKey);
      }

      spriteY = 15;
    } else {
      // Show icon based on type
      this.createIconForType(config.id, 0, -10);
      spriteY = 10;
    }

    // Description text
    const desc = this.scene.add.text(0, spriteY + 10, config.description, {
      fontSize: '9px',
      color: config.textColor || '#ffffff',
      fontFamily: 'monospace',
      align: 'center',
      lineSpacing: 4,
    });
    desc.setOrigin(0.5);
    this.container.add(desc);

    // "Press ENTER" prompt
    const prompt = this.scene.add.text(0, boxHeight / 2 - 12, '[ Press ENTER to continue ]', {
      fontSize: '7px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    });
    prompt.setOrigin(0.5);
    this.container.add(prompt);

    // Pulse animation for prompt
    this.scene.tweens.add({
      targets: prompt,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Pop-in animation
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Play popup sound
    this.playPopupSound();

    // Listen for ENTER key to close (ENTER only, not SPACE)
    this.scene.input.keyboard?.once('keydown-ENTER', () => {
      this.close();
    });

    // Also allow click/tap to close
    this.scene.input.once('pointerdown', () => {
      this.close();
    });
  }

  private createIconForType(type: string, x: number, y: number): void {
    const icon = this.scene.add.graphics();
    icon.setPosition(x, y);

    switch (type) {
      case 'mayo_blaster':
        // Draw a simple gun/blaster icon
        icon.fillStyle(0xf5f5dc, 1);
        icon.fillRect(-15, -5, 30, 10);
        icon.fillRect(10, -10, 8, 20);
        icon.fillStyle(0xffd700, 1);
        icon.fillCircle(-10, 0, 6);
        break;

      case 'checkpoint':
        // Draw a flag icon
        icon.fillStyle(0x8b4513, 1);
        icon.fillRect(-2, -15, 4, 30);
        icon.fillStyle(0x27ae60, 1);
        icon.beginPath();
        icon.moveTo(2, -15);
        icon.lineTo(20, -8);
        icon.lineTo(2, 0);
        icon.closePath();
        icon.fill();
        break;

      case 'bat':
        // Draw a cricket bat icon
        icon.fillStyle(0x8b4513, 1);
        // Handle
        icon.fillRect(-3, 5, 6, 15);
        // Blade
        icon.fillStyle(0xdeb887, 1);
        icon.fillRoundedRect(-8, -15, 16, 22, 3);
        // Grip lines
        icon.lineStyle(1, 0x654321, 1);
        icon.lineBetween(-2, 8, -2, 18);
        icon.lineBetween(2, 8, 2, 18);
        break;

      case 'mayo':
        // Draw a mayo jar icon
        icon.fillStyle(0xfff8dc, 1);
        icon.fillRoundedRect(-10, -8, 20, 20, 4);
        icon.fillStyle(0xffcc00, 1);
        icon.fillRect(-8, -12, 16, 6);
        icon.lineStyle(1, 0x000000, 0.5);
        icon.strokeRoundedRect(-10, -8, 20, 20, 4);
        break;

      default:
        // Generic star icon
        icon.fillStyle(0xffd700, 1);
        icon.fillCircle(0, 0, 10);
        break;
    }

    if (this.container) {
      this.container.add(icon);
    }
  }

  private close(): void {
    if (!this.isShowing || !this.container) return;

    // Play close sound
    this.playCloseSound();

    // Pop-out animation
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scale: 0.5,
      duration: 200,
      ease: 'Back.easeIn',
      onComplete: () => {
        if (this.container) {
          this.container.destroy();
          this.container = null;
        }

        // Resume the game
        this.scene.physics.resume();
        this.scene.time.paused = false;

        this.isShowing = false;

        // Call the close callback
        if (this.onCloseCallback) {
          this.onCloseCallback();
        }
      },
    });
  }

  private playPopupSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Attention-grabbing "ding" sound
      const frequencies = [523, 659, 784]; // C5, E5, G5 chord

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + i * 0.05;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    }
  }

  private playCloseSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = 440;

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  }

  isVisible(): boolean {
    return this.isShowing;
  }
}
