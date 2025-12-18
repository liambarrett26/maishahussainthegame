import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

interface PauseButton {
  container: Phaser.GameObjects.Container;
  text: Phaser.GameObjects.Text;
}

export class PauseScene extends Phaser.Scene {
  private buttons: PauseButton[] = [];
  private selectedIndex: number = 0;

  constructor() {
    super({ key: SCENES.PAUSE });
  }

  create(): void {
    // Semi-transparent dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Pause panel background
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 80, 50, 160, 170, 8);
    panel.lineStyle(2, 0xe94560, 1);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 80, 50, 160, 170, 8);

    // Pause title
    const title = this.add.text(GAME_WIDTH / 2, 75, 'PAUSED', {
      fontSize: '20px',
      color: '#ffd93d',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // Decorative line under title
    const line = this.add.graphics();
    line.lineStyle(2, 0xe94560, 0.5);
    line.lineBetween(GAME_WIDTH / 2 - 50, 95, GAME_WIDTH / 2 + 50, 95);

    // Menu options
    const buttonData = [
      { text: 'Resume', action: () => this.resumeGame() },
      { text: 'Restart', action: () => this.restartLevel() },
      { text: 'Quit', action: () => this.quitToMenu() },
    ];

    const startY = 115;
    const spacing = 35;

    buttonData.forEach((data, index) => {
      const button = this.createButton(GAME_WIDTH / 2, startY + index * spacing, data.text, data.action);
      this.buttons.push(button);
    });

    this.updateSelection();

    // Keyboard navigation
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-UP', () => this.navigate(-1));
      this.input.keyboard.on('keydown-W', () => this.navigate(-1));
      this.input.keyboard.on('keydown-DOWN', () => this.navigate(1));
      this.input.keyboard.on('keydown-S', () => this.navigate(1));
      this.input.keyboard.on('keydown-ENTER', () => this.selectButton());
      this.input.keyboard.on('keydown-SPACE', () => this.selectButton());
      this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
    }
  }

  private createButton(x: number, y: number, text: string, action: () => void): PauseButton {
    const container = this.add.container(x, y);

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0xe94560, 1);
    bg.fillRoundedRect(-60, -12, 120, 24, 4);

    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    buttonText.setOrigin(0.5);

    container.add([bg, buttonText]);
    container.setInteractive(new Phaser.Geom.Rectangle(-60, -12, 120, 24), Phaser.Geom.Rectangle.Contains);

    container.on('pointerover', () => {
      this.selectedIndex = this.buttons.findIndex((b) => b.container === container);
      this.updateSelection();
    });

    container.on('pointerdown', action);

    return { container, text: buttonText };
  }

  private navigate(direction: number): void {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + direction, 0, this.buttons.length);
    this.updateSelection();
  }

  private updateSelection(): void {
    this.buttons.forEach((button, index) => {
      const isSelected = index === this.selectedIndex;
      button.text.setColor(isSelected ? '#ffd93d' : '#ffffff');
      button.text.setScale(isSelected ? 1.1 : 1);
    });
  }

  private selectButton(): void {
    const button = this.buttons[this.selectedIndex];
    if (button) {
      button.container.emit('pointerdown');
    }
  }

  private resumeGame(): void {
    this.scene.resume(SCENES.GAME);
    this.scene.stop();
  }

  private restartLevel(): void {
    // Use game.scene to ensure proper scene management from overlay
    this.game.scene.stop(SCENES.PAUSE);
    this.game.scene.stop(SCENES.GAME);
    this.game.scene.start(SCENES.GAME);
  }

  private quitToMenu(): void {
    // Use game.scene to ensure proper scene management from overlay
    this.game.scene.stop(SCENES.PAUSE);
    this.game.scene.stop(SCENES.GAME);
    this.game.scene.start(SCENES.MENU);
  }
}
