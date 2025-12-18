import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../utils/Constants';

export class HUD {
  private scene: Phaser.Scene;
  private hearts: Phaser.GameObjects.Graphics[] = [];
  private mayoIcon!: Phaser.GameObjects.Sprite;
  private mayoText!: Phaser.GameObjects.Text;
  private container!: Phaser.GameObjects.Container;
  private mayoMaishaIndicator!: Phaser.GameObjects.Container;
  private mayoMaishaBar!: Phaser.GameObjects.Graphics;
  private mayoMaishaText!: Phaser.GameObjects.Text;
  private mayoHintText!: Phaser.GameObjects.Text;
  private currentMaxHealth: number = 3;

  // Menu button and overlay
  private menuButton!: Phaser.GameObjects.Container;
  private menuOverlay: Phaser.GameObjects.Container | null = null;
  private isMenuOpen: boolean = false;

  constructor(scene: Phaser.Scene, initialMaxHealth: number = 3) {
    this.scene = scene;
    this.currentMaxHealth = initialMaxHealth;
    this.createHUD();
  }

  private createHUD(): void {
    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(100);

    // Create hearts for health
    this.createHearts(this.currentMaxHealth);

    // Create mayo counter
    this.createMayoCounter();

    // Create Mayo Maisha indicator (initially hidden)
    this.createMayoMaishaIndicator();

    // Create menu button
    this.createMenuButton();
  }

  private createHearts(maxHealth: number): void {
    // Clear existing hearts
    this.hearts.forEach(heart => heart.destroy());
    this.hearts = [];

    for (let i = 0; i < maxHealth; i++) {
      const heart = this.scene.add.graphics();
      this.drawHeart(heart, true);
      heart.setPosition(14 + i * 20, 14);
      this.hearts.push(heart);
      this.container.add(heart);
    }
  }

  updateMaxHealth(newMaxHealth: number): void {
    if (newMaxHealth !== this.currentMaxHealth) {
      this.currentMaxHealth = newMaxHealth;
      this.createHearts(newMaxHealth);
    }
  }

  private drawHeart(graphics: Phaser.GameObjects.Graphics, filled: boolean): void {
    graphics.clear();

    // Draw heart outline first (dark border)
    graphics.fillStyle(0x1a1a2e, 1);
    const outlinePixels = [
      // Top row outline
      [1, 0], [2, 0], [4, 0], [5, 0],
      // Second row outline
      [0, 1], [3, 1], [6, 1],
      // Third row outline
      [0, 2], [6, 2],
      // Fourth row outline
      [0, 3], [6, 3],
      // Fifth row outline
      [1, 4], [5, 4],
      // Sixth row outline
      [2, 5], [4, 5],
      // Bottom outline
      [3, 6],
    ];
    outlinePixels.forEach(([x, y]) => {
      graphics.fillRect(x * 2 - 7, y * 2 - 6, 2, 2);
    });

    if (filled) {
      // Filled heart - vibrant red
      graphics.fillStyle(0xe94560, 1);
    } else {
      // Empty heart - dark gray
      graphics.fillStyle(0x444444, 0.6);
    }

    // Draw pixelated heart shape (proper heart)
    const heartPixels = [
      // Top bumps (two rounded parts)
      [1, 1], [2, 1], [4, 1], [5, 1],
      // Second row (full width)
      [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
      // Third row (full width)
      [1, 3], [2, 3], [3, 3], [4, 3], [5, 3],
      // Narrowing
      [2, 4], [3, 4], [4, 4],
      // Point
      [3, 5],
    ];

    heartPixels.forEach(([x, y]) => {
      graphics.fillRect(x * 2 - 7, y * 2 - 6, 2, 2);
    });

    // Add highlight/shine to filled hearts
    if (filled) {
      graphics.fillStyle(0xff8fab, 1);
      graphics.fillRect(1 * 2 - 7, 1 * 2 - 6, 2, 2); // Top left shine
      graphics.fillStyle(0xffb3c6, 0.8);
      graphics.fillRect(2 * 2 - 7, 2 * 2 - 6, 2, 2); // Secondary shine
    }
  }

  private createMayoCounter(): void {
    // Mayo jar icon (using sprite) - positioned top left, below hearts
    this.mayoIcon = this.scene.add.sprite(14, 34, 'mayo', 'mayo_0');
    this.mayoIcon.setScale(0.6);
    this.mayoIcon.play('mayo-bob');
    this.container.add(this.mayoIcon);

    // Mayo count text
    this.mayoText = this.scene.add.text(28, 34, 'x0', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.mayoText.setOrigin(0, 0.5);
    this.container.add(this.mayoText);

    // Mayo usage hints (shown when 10+ mayo)
    this.mayoHintText = this.scene.add.text(10, 52, 'M = Mayo Mode\nH = Heal', {
      fontSize: '9px',
      color: '#ffd700',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
      lineSpacing: 2,
    });
    this.mayoHintText.setVisible(false);
    this.container.add(this.mayoHintText);
  }

  private createMayoMaishaIndicator(): void {
    this.mayoMaishaIndicator = this.scene.add.container(GAME_WIDTH / 2, 30);
    this.mayoMaishaIndicator.setScrollFactor(0);
    this.mayoMaishaIndicator.setDepth(100);
    this.mayoMaishaIndicator.setVisible(false);

    // Background bar
    const barBg = this.scene.add.graphics();
    barBg.fillStyle(0x333333, 0.8);
    barBg.fillRoundedRect(-50, -8, 100, 16, 4);
    this.mayoMaishaIndicator.add(barBg);

    // Progress bar
    this.mayoMaishaBar = this.scene.add.graphics();
    this.mayoMaishaIndicator.add(this.mayoMaishaBar);

    // Text label
    this.mayoMaishaText = this.scene.add.text(0, -20, 'MAYO MAISHA!', {
      fontSize: '10px',
      color: '#ffd700',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.mayoMaishaText.setOrigin(0.5);
    this.mayoMaishaIndicator.add(this.mayoMaishaText);
  }

  update(health: number, mayoCount: number, mayoMaishaActive: boolean = false, timeRemaining: number = 0, duration: number = 5000, maxHealth?: number): void {
    // Update max health if changed
    if (maxHealth !== undefined && maxHealth !== this.currentMaxHealth) {
      this.updateMaxHealth(maxHealth);
    }

    // Update hearts
    this.hearts.forEach((heart, index) => {
      const isFilled = index < health;
      this.drawHeart(heart, isFilled);
    });

    // Update mayo count with animation on change
    const currentCount = parseInt(this.mayoText.text.slice(1)) || 0;
    if (mayoCount !== currentCount) {
      this.mayoText.setText(`x${mayoCount}`);

      // Pop animation
      this.scene.tweens.add({
        targets: [this.mayoText, this.mayoIcon],
        scale: 1.3,
        duration: 100,
        yoyo: true,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.mayoIcon.setScale(0.6);
        },
      });
    }

    // Show mayo hint when 10+ mayo available
    const showHint = mayoCount >= 10 && !mayoMaishaActive;
    this.mayoHintText.setVisible(showHint);

    // Update Mayo Maisha indicator
    this.updateMayoMaishaIndicator(mayoMaishaActive, timeRemaining, duration);
  }

  private updateMayoMaishaIndicator(active: boolean, timeRemaining: number, duration: number): void {
    this.mayoMaishaIndicator.setVisible(active);

    if (active) {
      // Update progress bar
      this.mayoMaishaBar.clear();

      const progress = Math.max(0, timeRemaining / duration);
      const barWidth = 96 * progress;

      // Gradient color from gold to red as time runs out
      let color = 0xffd700;
      if (progress < 0.3) {
        color = 0xff4444;
      } else if (progress < 0.5) {
        color = 0xffa500;
      }

      this.mayoMaishaBar.fillStyle(color, 1);
      this.mayoMaishaBar.fillRoundedRect(-48, -6, barWidth, 12, 3);

      // Pulse text when time is low
      if (progress < 0.3) {
        const pulse = Math.sin(this.scene.time.now * 0.01) > 0;
        this.mayoMaishaText.setAlpha(pulse ? 1 : 0.5);
      } else {
        this.mayoMaishaText.setAlpha(1);
      }
    }
  }

  // Animate health loss
  animateHealthLoss(): void {
    const lastFilledIndex = this.hearts.findIndex((_, i) => {
      const nextHeart = this.hearts[i + 1];
      return nextHeart && !this.isHeartFilled(i + 1);
    });

    if (lastFilledIndex >= 0) {
      const heart = this.hearts[lastFilledIndex];
      this.scene.tweens.add({
        targets: heart,
        scale: 1.5,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          heart.setScale(1);
          heart.setAlpha(1);
        },
      });
    }
  }

  private isHeartFilled(_index: number): boolean {
    // This is a helper - actual state is managed externally
    return true;
  }

  private createMenuButton(): void {
    this.menuButton = this.scene.add.container(GAME_WIDTH - 20, 14);
    this.menuButton.setScrollFactor(0);
    this.menuButton.setDepth(100);

    // Menu button background
    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(0x2c3e50, 0.9);
    btnBg.fillRoundedRect(-14, -10, 28, 20, 4);
    this.menuButton.add(btnBg);

    // Hamburger icon (three lines)
    const icon = this.scene.add.graphics();
    icon.fillStyle(0xffffff, 1);
    icon.fillRect(-8, -6, 16, 2);
    icon.fillRect(-8, -1, 16, 2);
    icon.fillRect(-8, 4, 16, 2);
    this.menuButton.add(icon);

    // Interactive zone
    const zone = this.scene.add.zone(GAME_WIDTH - 20, 14, 28, 20);
    zone.setScrollFactor(0);
    zone.setDepth(101);
    zone.setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0x34495e, 1);
      btnBg.fillRoundedRect(-14, -10, 28, 20, 4);
    });

    zone.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0x2c3e50, 0.9);
      btnBg.fillRoundedRect(-14, -10, 28, 20, 4);
    });

    zone.on('pointerdown', () => {
      this.toggleMenu();
    });
  }

  private toggleMenu(): void {
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  private openMenu(): void {
    if (this.isMenuOpen) return;
    this.isMenuOpen = true;

    // Pause the game
    this.scene.physics.pause();

    // Create menu overlay
    this.menuOverlay = this.scene.add.container(0, 0);
    this.menuOverlay.setScrollFactor(0);
    this.menuOverlay.setDepth(150);

    // Dimmed background
    const dimBg = this.scene.add.graphics();
    dimBg.fillStyle(0x000000, 0.7);
    dimBg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.menuOverlay.add(dimBg);

    // Menu panel
    const panelWidth = 180;
    const panelHeight = 200;
    const panelX = GAME_WIDTH / 2 - panelWidth / 2;
    const panelY = GAME_HEIGHT / 2 - panelHeight / 2;

    const panel = this.scene.add.graphics();
    panel.fillStyle(0x1a1a2e, 1);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
    panel.lineStyle(2, 0xe94560);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
    this.menuOverlay.add(panel);

    // Menu title
    const title = this.scene.add.text(GAME_WIDTH / 2, panelY + 20, 'PAUSED', {
      fontSize: '16px',
      color: '#e94560',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    this.menuOverlay.add(title);

    // Menu buttons
    const buttonData = [
      { text: 'Resume', action: () => this.closeMenu() },
      { text: 'Controls', action: () => this.showControls() },
      { text: 'Help', action: () => this.showHelp() },
      { text: 'Quit to Menu', action: () => this.quitToMenu() },
    ];

    buttonData.forEach((btn, index) => {
      const btnY = panelY + 55 + index * 35;
      this.createMenuButton2(btn.text, GAME_WIDTH / 2, btnY, btn.action);
    });
  }

  private createMenuButton2(text: string, x: number, y: number, onClick: () => void): void {
    if (!this.menuOverlay) return;

    const btnWidth = 140;
    const btnHeight = 28;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 5);
    this.menuOverlay.add(bg);

    const label = this.scene.add.text(x, y, text, {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    label.setOrigin(0.5);
    this.menuOverlay.add(label);

    const zone = this.scene.add.zone(x, y, btnWidth, btnHeight);
    zone.setScrollFactor(0);
    zone.setDepth(151);
    zone.setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0xe94560, 1);
      bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 5);
    });

    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2c3e50, 1);
      bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 5);
    });

    zone.on('pointerdown', onClick);

    this.menuOverlay.add(zone);
  }

  private closeMenu(): void {
    if (!this.isMenuOpen) return;
    this.isMenuOpen = false;

    // Resume the game
    this.scene.physics.resume();

    // Destroy menu overlay
    if (this.menuOverlay) {
      this.menuOverlay.destroy();
      this.menuOverlay = null;
    }
  }

  private showControls(): void {
    // Close current menu
    if (this.menuOverlay) {
      this.menuOverlay.destroy();
      this.menuOverlay = null;
    }

    // Create controls overlay
    this.menuOverlay = this.scene.add.container(0, 0);
    this.menuOverlay.setScrollFactor(0);
    this.menuOverlay.setDepth(150);

    // Dimmed background
    const dimBg = this.scene.add.graphics();
    dimBg.fillStyle(0x000000, 0.7);
    dimBg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.menuOverlay.add(dimBg);

    // Panel
    const panelWidth = 220;
    const panelHeight = 220;
    const panelX = GAME_WIDTH / 2 - panelWidth / 2;
    const panelY = GAME_HEIGHT / 2 - panelHeight / 2;

    const panel = this.scene.add.graphics();
    panel.fillStyle(0x1a1a2e, 1);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
    panel.lineStyle(2, 0x3498db);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
    this.menuOverlay.add(panel);

    // Title
    const title = this.scene.add.text(GAME_WIDTH / 2, panelY + 20, 'CONTROLS', {
      fontSize: '14px',
      color: '#3498db',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    this.menuOverlay.add(title);

    // Controls list
    const controls = [
      'Arrow Keys / WASD - Move',
      'Space / W / Up - Jump',
      'X - Bat Attack',
      'M - Mayo Maisha (10 mayo)',
      'H - Heal (10 mayo)',
      'ESC - Pause',
    ];

    controls.forEach((ctrl, i) => {
      const text = this.scene.add.text(GAME_WIDTH / 2, panelY + 50 + i * 22, ctrl, {
        fontSize: '9px',
        color: '#ffffff',
        fontFamily: 'monospace',
      });
      text.setOrigin(0.5);
      this.menuOverlay!.add(text);
    });

    // Back button
    this.createMenuButton2('Back', GAME_WIDTH / 2, panelY + panelHeight - 25, () => {
      this.menuOverlay?.destroy();
      this.menuOverlay = null;
      this.openMenu();
    });
  }

  private showHelp(): void {
    // Close current menu
    if (this.menuOverlay) {
      this.menuOverlay.destroy();
      this.menuOverlay = null;
    }

    // Create help overlay
    this.menuOverlay = this.scene.add.container(0, 0);
    this.menuOverlay.setScrollFactor(0);
    this.menuOverlay.setDepth(150);

    // Dimmed background
    const dimBg = this.scene.add.graphics();
    dimBg.fillStyle(0x000000, 0.7);
    dimBg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.menuOverlay.add(dimBg);

    // Panel
    const panelWidth = 240;
    const panelHeight = 200;
    const panelX = GAME_WIDTH / 2 - panelWidth / 2;
    const panelY = GAME_HEIGHT / 2 - panelHeight / 2;

    const panel = this.scene.add.graphics();
    panel.fillStyle(0x1a1a2e, 1);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
    panel.lineStyle(2, 0x27ae60);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
    this.menuOverlay.add(panel);

    // Title
    const title = this.scene.add.text(GAME_WIDTH / 2, panelY + 20, 'HELP', {
      fontSize: '14px',
      color: '#27ae60',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    this.menuOverlay.add(title);

    // Help text
    const helpLines = [
      'Collect mayo jars to power up!',
      'Jump on enemies to defeat them.',
      'Find friends for extra hearts.',
      'Reach the end to complete level.',
      'Checkpoints save your progress.',
    ];

    helpLines.forEach((line, i) => {
      const text = this.scene.add.text(GAME_WIDTH / 2, panelY + 50 + i * 22, line, {
        fontSize: '9px',
        color: '#ffffff',
        fontFamily: 'monospace',
      });
      text.setOrigin(0.5);
      this.menuOverlay!.add(text);
    });

    // Back button
    this.createMenuButton2('Back', GAME_WIDTH / 2, panelY + panelHeight - 25, () => {
      this.menuOverlay?.destroy();
      this.menuOverlay = null;
      this.openMenu();
    });
  }

  private quitToMenu(): void {
    // Don't call closeMenu - we're leaving the scene entirely
    // Destroy menu overlay
    if (this.menuOverlay) {
      this.menuOverlay.destroy();
      this.menuOverlay = null;
    }

    // Fade out then transition to menu
    this.scene.cameras.main.fadeOut(300, 0, 0, 0);
    this.scene.cameras.main.once('camerafadeoutcomplete', () => {
      // Use game.scene for safer access
      this.scene.game.scene.stop(SCENES.GAME);
      this.scene.game.scene.start(SCENES.MENU);
    });
  }
}
