import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, LEVELS } from '../utils/Constants';
import { SaveManager } from '../utils/SaveManager';

interface MenuButton {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
  enabled: boolean;
}

export class MenuScene extends Phaser.Scene {
  private clouds: Phaser.GameObjects.Graphics[] = [];
  private maisha!: Phaser.GameObjects.Sprite;
  private buttons: MenuButton[] = [];
  private selectedIndex: number = 0;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private levelSelectMode: boolean = false;
  private levelSelectContainer?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENES.MENU });
  }

  create(): void {
    // Fade in from black
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Create layered background
    this.createBackground();

    // Create floating particles (sparkles)
    this.createParticles();

    // Create parallax clouds
    this.createClouds();

    // Create ground with grass
    this.createGround();

    // Create title
    this.createTitle();

    // Create Maisha character
    this.createMaisha();

    // Create menu buttons
    this.createButtons();

    // Set up keyboard navigation
    this.setupKeyboardNav();
  }

  update(): void {
    // Animate clouds (parallax scrolling)
    this.clouds.forEach((cloud, index) => {
      const speed = 0.2 + index * 0.1;
      cloud.x -= speed;
      if (cloud.x < -80) {
        cloud.x = GAME_WIDTH + 80;
      }
    });
  }

  private createBackground(): void {
    const graphics = this.add.graphics();

    // Sky gradient (warm sunset colors)
    const gradientSteps = 20;
    const topColor = Phaser.Display.Color.ValueToColor(0xffd89b); // Warm orange
    const bottomColor = Phaser.Display.Color.ValueToColor(0x19547b); // Deep blue

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

    // Add some distant hills/mountains silhouette
    graphics.fillStyle(0x2d3561, 0.6);
    graphics.beginPath();
    graphics.moveTo(0, GAME_HEIGHT - 60);
    graphics.lineTo(60, GAME_HEIGHT - 90);
    graphics.lineTo(120, GAME_HEIGHT - 75);
    graphics.lineTo(180, GAME_HEIGHT - 100);
    graphics.lineTo(240, GAME_HEIGHT - 80);
    graphics.lineTo(300, GAME_HEIGHT - 95);
    graphics.lineTo(360, GAME_HEIGHT - 70);
    graphics.lineTo(420, GAME_HEIGHT - 85);
    graphics.lineTo(GAME_WIDTH, GAME_HEIGHT - 65);
    graphics.lineTo(GAME_WIDTH, GAME_HEIGHT);
    graphics.lineTo(0, GAME_HEIGHT);
    graphics.closePath();
    graphics.fillPath();
  }

  private createClouds(): void {
    const cloudPositions = [
      { x: 50, y: 40, scale: 1 },
      { x: 180, y: 60, scale: 0.7 },
      { x: 320, y: 35, scale: 0.9 },
      { x: 420, y: 55, scale: 0.6 },
    ];

    cloudPositions.forEach((pos) => {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.8);

      // Draw fluffy cloud shape
      const baseSize = 20 * pos.scale;
      cloud.fillCircle(0, 0, baseSize);
      cloud.fillCircle(baseSize * 0.8, -baseSize * 0.3, baseSize * 0.7);
      cloud.fillCircle(-baseSize * 0.7, -baseSize * 0.2, baseSize * 0.6);
      cloud.fillCircle(baseSize * 0.4, baseSize * 0.2, baseSize * 0.5);
      cloud.fillCircle(-baseSize * 0.4, baseSize * 0.15, baseSize * 0.55);

      cloud.setPosition(pos.x, pos.y);
      cloud.setDepth(1);
      this.clouds.push(cloud);
    });
  }

  private createGround(): void {
    const graphics = this.add.graphics();

    // Main ground
    graphics.fillStyle(0x4a7c59, 1);
    graphics.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);

    // Grass highlights
    graphics.fillStyle(0x6b9b5e, 1);
    for (let x = 0; x < GAME_WIDTH; x += 8) {
      const height = 3 + Math.random() * 4;
      graphics.fillRect(x, GAME_HEIGHT - 50 - height, 2, height);
    }

    // Darker earth below
    graphics.fillStyle(0x3d5c45, 1);
    graphics.fillRect(0, GAME_HEIGHT - 20, GAME_WIDTH, 20);

    // Add some small flowers
    const flowerColors = [0xff6b6b, 0xffd93d, 0xff8fab, 0xffffff];
    for (let i = 0; i < 12; i++) {
      const x = 20 + Math.random() * (GAME_WIDTH - 40);
      const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      graphics.fillStyle(color, 1);
      graphics.fillCircle(x, GAME_HEIGHT - 52 - Math.random() * 3, 2);
    }

    graphics.setDepth(5);
  }

  private createParticles(): void {
    // Create sparkle texture
    const sparkleGraphics = this.add.graphics();
    sparkleGraphics.fillStyle(0xffffff, 1);
    sparkleGraphics.fillCircle(2, 2, 2);
    sparkleGraphics.generateTexture('sparkle', 4, 4);
    sparkleGraphics.destroy();

    // Create particle emitter for ambient sparkles
    this.particles = this.add.particles(0, 0, 'sparkle', {
      x: { min: 0, max: GAME_WIDTH },
      y: { min: 0, max: GAME_HEIGHT - 60 },
      lifespan: 3000,
      speed: { min: 5, max: 15 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.6, end: 0 },
      frequency: 500,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.particles.setDepth(2);
  }

  private createTitle(): void {
    // Title shadow
    const shadowText = this.add.text(GAME_WIDTH / 2 + 2, 52, "MAISHA'S", {
      fontSize: '28px',
      color: '#2d3561',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    shadowText.setOrigin(0.5);
    shadowText.setDepth(10);

    // Main title
    const titleText = this.add.text(GAME_WIDTH / 2, 50, "MAISHA'S", {
      fontSize: '28px',
      color: '#ffd93d',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#e94560',
      strokeThickness: 3,
    });
    titleText.setOrigin(0.5);
    titleText.setDepth(11);

    // Subtitle shadow
    const subShadow = this.add.text(GAME_WIDTH / 2 + 2, 82, 'ADVENTURE', {
      fontSize: '20px',
      color: '#2d3561',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    subShadow.setOrigin(0.5);
    subShadow.setDepth(10);

    // Subtitle
    const subtitleText = this.add.text(GAME_WIDTH / 2, 80, 'ADVENTURE', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#e94560',
      strokeThickness: 2,
    });
    subtitleText.setOrigin(0.5);
    subtitleText.setDepth(11);

    // Gentle floating animation for title
    this.tweens.add({
      targets: [titleText, shadowText],
      y: '+=3',
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: [subtitleText, subShadow],
      y: '+=3',
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 200,
    });
  }

  private createMaisha(): void {
    // Create Maisha sprite on the right side
    this.maisha = this.add.sprite(GAME_WIDTH - 70, GAME_HEIGHT - 66, 'maisha', 'idle_0');
    this.maisha.setScale(2);
    this.maisha.play('maisha-idle');
    this.maisha.setDepth(10);

    // Add subtle bounce
    this.tweens.add({
      targets: this.maisha,
      y: this.maisha.y - 2,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createButtons(): void {
    const hasSave = SaveManager.hasSave();
    const buttonData = [
      { text: 'New Game', enabled: true, action: () => this.startNewGame() },
      { text: 'Continue', enabled: hasSave, action: () => this.continueGame() },
      { text: 'Level Select', enabled: true, action: () => this.showLevelSelect() },
      { text: 'Credits', enabled: true, action: () => this.showCredits() },
    ];

    const startY = 120;
    const spacing = 32;

    buttonData.forEach((data, index) => {
      const button = this.createButton(
        80,
        startY + index * spacing,
        data.text,
        data.enabled,
        data.action
      );
      this.buttons.push(button);
    });

    // Highlight first enabled button
    this.selectedIndex = 0;
    this.updateButtonSelection();
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    enabled: boolean,
    action: () => void
  ): MenuButton {
    const container = this.add.container(x, y);
    container.setDepth(20);

    // Button background
    const bg = this.add.graphics();
    this.drawButtonBackground(bg, enabled, false);

    // Button text
    const buttonText = this.add.text(70, 0, text, {
      fontSize: '14px',
      color: enabled ? '#ffffff' : '#666666',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    buttonText.setOrigin(0.5);

    container.add([bg, buttonText]);

    // Make interactive if enabled
    if (enabled) {
      const hitArea = new Phaser.Geom.Rectangle(-60, -12, 140, 24);
      container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

      container.on('pointerover', () => {
        this.selectedIndex = this.buttons.findIndex((b) => b.container === container);
        this.updateButtonSelection();
      });

      container.on('pointerdown', () => {
        this.drawButtonBackground(bg, true, true);
        this.time.delayedCall(100, () => {
          action();
        });
      });

      container.on('pointerup', () => {
        this.drawButtonBackground(bg, true, false);
      });
    }

    return { container, background: bg, text: buttonText, enabled };
  }

  private drawButtonBackground(
    graphics: Phaser.GameObjects.Graphics,
    enabled: boolean,
    pressed: boolean
  ): void {
    graphics.clear();

    const width = 140;
    const height = 24;
    const x = -width / 2 + 70;
    const y = -height / 2;

    if (enabled) {
      // Shadow
      graphics.fillStyle(0x2d3561, 0.5);
      graphics.fillRoundedRect(x + 2, y + 2, width, height, 4);

      // Main button
      const bgColor = pressed ? 0xc73e5c : 0xe94560;
      graphics.fillStyle(bgColor, 1);
      graphics.fillRoundedRect(x, y + (pressed ? 2 : 0), width, height, 4);

      // Highlight
      if (!pressed) {
        graphics.fillStyle(0xffffff, 0.2);
        graphics.fillRoundedRect(x + 2, y + 2, width - 4, 8, 3);
      }
    } else {
      // Disabled button
      graphics.fillStyle(0x333333, 0.5);
      graphics.fillRoundedRect(x, y, width, height, 4);
    }
  }

  private updateButtonSelection(): void {
    this.buttons.forEach((button, index) => {
      const isSelected = index === this.selectedIndex && button.enabled;
      const bg = button.background;
      const text = button.text;

      this.drawButtonBackground(bg, button.enabled, false);

      if (isSelected) {
        // Add glow effect for selected button
        text.setColor('#ffd93d');
        text.setScale(1.05);

        // Add selection indicator
        const indicator = this.add.text(
          button.container.x - 55,
          button.container.y,
          '>',
          {
            fontSize: '14px',
            color: '#ffd93d',
            fontFamily: 'monospace',
            fontStyle: 'bold',
          }
        );
        indicator.setOrigin(0.5);
        indicator.setDepth(20);
        indicator.setName('indicator');

        // Pulse animation
        this.tweens.add({
          targets: indicator,
          x: indicator.x + 3,
          duration: 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // Clean up old indicators
        this.children.list
          .filter((child) => child.name === 'indicator' && child !== indicator)
          .forEach((child) => child.destroy());
      } else if (button.enabled) {
        text.setColor('#ffffff');
        text.setScale(1);
      }
    });
  }

  private setupKeyboardNav(): void {
    if (!this.input.keyboard) return;

    this.input.keyboard.on('keydown-UP', () => this.navigateMenu(-1));
    this.input.keyboard.on('keydown-W', () => this.navigateMenu(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.navigateMenu(1));
    this.input.keyboard.on('keydown-S', () => this.navigateMenu(1));
    this.input.keyboard.on('keydown-ENTER', () => this.selectButton());
    this.input.keyboard.on('keydown-SPACE', () => this.selectButton());
  }

  private navigateMenu(direction: number): void {
    let newIndex = this.selectedIndex + direction;

    // Skip disabled buttons
    while (newIndex >= 0 && newIndex < this.buttons.length && !this.buttons[newIndex].enabled) {
      newIndex += direction;
    }

    if (newIndex >= 0 && newIndex < this.buttons.length) {
      this.selectedIndex = newIndex;
      this.updateButtonSelection();
    }
  }

  private selectButton(): void {
    const button = this.buttons[this.selectedIndex];
    if (button && button.enabled) {
      this.drawButtonBackground(button.background, true, true);
      button.text.setScale(0.95);

      this.time.delayedCall(100, () => {
        button.container.emit('pointerdown');
      });
    }
  }

  private startNewGame(): void {
    SaveManager.clear();
    this.transitionToScene(SCENES.GAME);
  }

  private continueGame(): void {
    this.transitionToScene(SCENES.GAME);
  }

  private showCredits(): void {
    this.transitionToScene(SCENES.CREDITS);
  }

  private showLevelSelect(): void {
    if (this.levelSelectMode) return;
    this.levelSelectMode = true;

    // Create overlay
    this.levelSelectContainer = this.add.container(0, 0);
    this.levelSelectContainer.setDepth(100);

    // Semi-transparent background
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.levelSelectContainer.add(overlay);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 30, 'LEVEL SELECT', {
      fontSize: '18px',
      color: '#ffd93d',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    this.levelSelectContainer.add(title);

    // Dev mode label
    const devLabel = this.add.text(GAME_WIDTH / 2, 50, '(Dev Mode)', {
      fontSize: '10px',
      color: '#888888',
      fontFamily: 'monospace',
    });
    devLabel.setOrigin(0.5);
    this.levelSelectContainer.add(devLabel);

    // Level buttons
    const levels = [
      { id: LEVELS.WORTHING, name: 'Worthing Beach', color: 0x3498db },
      { id: LEVELS.BRIGHTON, name: 'Brighton', color: 0x9b59b6 },
      { id: LEVELS.VARNDEAN, name: 'Varndean College', color: 0x27ae60 },
      { id: LEVELS.UCL, name: 'UCL University', color: 0x500778 },
      { id: LEVELS.CIVIL_SERVICE, name: 'Civil Service', color: 0x708090 },
      { id: 'exam', name: 'IB Exams', color: 0x1a1a8c },
    ];

    levels.forEach((level, index) => {
      const y = 80 + index * 40;

      // Button background
      const btn = this.add.graphics();
      btn.fillStyle(level.color, 1);
      btn.fillRoundedRect(GAME_WIDTH / 2 - 90, y, 180, 30, 6);
      this.levelSelectContainer!.add(btn);

      // Button text
      const text = this.add.text(GAME_WIDTH / 2, y + 15, level.name, {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      });
      text.setOrigin(0.5);
      this.levelSelectContainer!.add(text);

      // Interactive zone
      const zone = this.add.zone(GAME_WIDTH / 2, y + 15, 180, 30);
      zone.setInteractive({ useHandCursor: true });
      this.levelSelectContainer!.add(zone);

      zone.on('pointerover', () => {
        text.setColor('#ffd93d');
        btn.clear();
        btn.fillStyle(level.color, 1);
        btn.lineStyle(2, 0xffd93d);
        btn.fillRoundedRect(GAME_WIDTH / 2 - 90, y, 180, 30, 6);
        btn.strokeRoundedRect(GAME_WIDTH / 2 - 90, y, 180, 30, 6);
      });

      zone.on('pointerout', () => {
        text.setColor('#ffffff');
        btn.clear();
        btn.fillStyle(level.color, 1);
        btn.fillRoundedRect(GAME_WIDTH / 2 - 90, y, 180, 30, 6);
      });

      zone.on('pointerdown', () => {
        if (level.id === 'exam') {
          // Go directly to IB exams
          this.cameras.main.fadeOut(300, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENES.EXAM);
          });
        } else {
          // Save level and start game
          SaveManager.save({ currentLevel: level.id, checkpointId: null });
          this.cameras.main.fadeOut(300, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENES.GAME);
          });
        }
      });
    });

    // Back button
    const backBtn = this.add.graphics();
    backBtn.fillStyle(0x7f8c8d, 1);
    backBtn.fillRoundedRect(GAME_WIDTH / 2 - 50, GAME_HEIGHT - 40, 100, 28, 6);
    this.levelSelectContainer.add(backBtn);

    const backText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 26, 'Back', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    backText.setOrigin(0.5);
    this.levelSelectContainer.add(backText);

    const backZone = this.add.zone(GAME_WIDTH / 2, GAME_HEIGHT - 26, 100, 28);
    backZone.setInteractive({ useHandCursor: true });
    this.levelSelectContainer.add(backZone);

    backZone.on('pointerover', () => {
      backText.setColor('#ffd93d');
    });

    backZone.on('pointerout', () => {
      backText.setColor('#ffffff');
    });

    backZone.on('pointerdown', () => {
      this.closeLevelSelect();
    });

    // ESC to close
    this.input.keyboard?.once('keydown-ESC', () => {
      this.closeLevelSelect();
    });
  }

  private closeLevelSelect(): void {
    if (this.levelSelectContainer) {
      this.levelSelectContainer.destroy();
      this.levelSelectContainer = undefined;
    }
    this.levelSelectMode = false;
  }

  private transitionToScene(sceneKey: string): void {
    // Maisha does a little wave/celebration
    this.maisha.play('maisha-victory');

    // Fade out
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(sceneKey);
    });
  }
}
