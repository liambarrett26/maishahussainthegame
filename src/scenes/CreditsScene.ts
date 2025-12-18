import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';
import { MusicManager } from '../utils/MusicManager';

export class CreditsScene extends Phaser.Scene {
  private maisha!: Phaser.GameObjects.Sprite;
  private isTransitioning: boolean = false;

  constructor() {
    super({ key: SCENES.CREDITS });
  }

  create(): void {
    // Reset state
    this.isTransitioning = false;
    this.input.enabled = true;

    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Play credits music
    MusicManager.playCredits(this);

    // Create beautiful background
    this.createBackground();

    // Create content
    this.createCreditsContent();

    // Create Maisha doing victory dance
    this.createMaisha();

    // Back button
    this.createBackButton();

    // Escape key to go back
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => this.goBack());
    }
  }

  private createBackground(): void {
    const graphics = this.add.graphics();

    // Night sky gradient
    const gradientSteps = 20;
    const topColor = Phaser.Display.Color.ValueToColor(0x0f0c29);
    const bottomColor = Phaser.Display.Color.ValueToColor(0x302b63);

    for (let i = 0; i < gradientSteps; i++) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        topColor,
        bottomColor,
        gradientSteps,
        i
      );
      const hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
      graphics.fillStyle(hexColor, 1);
      graphics.fillRect(0, (GAME_HEIGHT * i) / gradientSteps, GAME_WIDTH, GAME_HEIGHT / gradientSteps + 1);
    }

    // Add stars
    graphics.fillStyle(0xffffff, 1);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = Math.random() * (GAME_HEIGHT - 60);
      const size = Math.random() * 1.5 + 0.5;
      graphics.fillCircle(x, y, size);
    }

    // Ground
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);
  }

  private createCreditsContent(): void {
    // Title
    const title = this.add.text(GAME_WIDTH / 2, 30, 'CREDITS', {
      fontSize: '24px',
      color: '#ffd93d',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#e94560',
      strokeThickness: 2,
    });
    title.setOrigin(0.5);

    // Credits content
    const credits = [
      { label: 'Made with love for', value: 'Maisha Hussain' },
      { label: '', value: '' },
      { label: 'Happy Birthday!', value: '' },
      { label: '', value: '' },
      { label: 'From', value: 'Liam and Beth' },
      { label: '', value: '' },
      { label: 'Music by', value: 'Kevin MacLeod' },
      { label: '', value: '(incompetech.com)' },
    ];

    let yPos = 70;
    credits.forEach((credit) => {
      if (credit.label) {
        const labelText = this.add.text(GAME_WIDTH / 2, yPos, credit.label, {
          fontSize: '10px',
          color: '#888888',
          fontFamily: 'monospace',
        });
        labelText.setOrigin(0.5);
        yPos += 14;
      }

      if (credit.value) {
        const valueText = this.add.text(GAME_WIDTH / 2, yPos, credit.value, {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontStyle: 'bold',
        });
        valueText.setOrigin(0.5);
        yPos += 20;
      } else if (!credit.label) {
        yPos += 10;
      }
    });

    // Special birthday message with heart (positioned to not overlap music credit)
    const heartText = this.add.text(GAME_WIDTH - 120, GAME_HEIGHT - 80, '♥', {
      fontSize: '24px',
      color: '#e94560',
      fontFamily: 'monospace',
    });
    heartText.setOrigin(0.5);

    // Pulse animation for heart
    this.tweens.add({
      targets: heartText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createMaisha(): void {
    this.maisha = this.add.sprite(GAME_WIDTH - 50, GAME_HEIGHT - 56, 'maisha', 'victory_0');
    this.maisha.setScale(2);
    this.maisha.play('maisha-victory');
  }

  private createBackButton(): void {
    const btnX = 70;
    const btnY = GAME_HEIGHT - 25;

    const bg = this.add.graphics();
    bg.fillStyle(0xe94560, 1);
    bg.fillRoundedRect(btnX - 50, btnY - 12, 100, 24, 6);

    const text = this.add.text(btnX, btnY, 'Back to Menu', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);

    // Use zone for reliable interaction
    const zone = this.add.zone(btnX, btnY, 100, 24);
    zone.setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      text.setColor('#ffd93d');
      bg.clear();
      bg.fillStyle(0xc0392b, 1);
      bg.lineStyle(2, 0xffd93d);
      bg.fillRoundedRect(btnX - 50, btnY - 12, 100, 24, 6);
      bg.strokeRoundedRect(btnX - 50, btnY - 12, 100, 24, 6);
    });

    zone.on('pointerout', () => {
      text.setColor('#ffffff');
      bg.clear();
      bg.fillStyle(0xe94560, 1);
      bg.fillRoundedRect(btnX - 50, btnY - 12, 100, 24, 6);
    });

    zone.on('pointerdown', () => {
      this.goBack();
    });
  }

  private goBack(): void {
    // Prevent double-calls during transition
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Clean up keyboard listeners
    this.input.keyboard?.removeAllListeners();

    // Fade out then start menu
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.MENU);
    });
  }
}
