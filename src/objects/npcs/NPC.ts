import Phaser from 'phaser';

export interface NPCConfig {
  name: string;
  dialogue: string[];
}

export class NPC extends Phaser.Physics.Arcade.Sprite {
  public npcName: string;
  private dialogue: string[];
  private dialogueIndex: number = 0;
  private speechBubble: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, config: NPCConfig) {
    super(scene, x, y, texture);

    this.npcName = config.name;
    this.dialogue = config.dialogue;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);
  }

  interact(): string | null {
    if (this.dialogue.length === 0) return null;

    const text = this.dialogue[this.dialogueIndex];
    this.dialogueIndex = (this.dialogueIndex + 1) % this.dialogue.length;
    return text;
  }

  showDialogue(text: string): void {
    this.hideDialogue();

    const bubble = this.scene.add.graphics();
    bubble.fillStyle(0xffffff, 0.9);
    bubble.fillRoundedRect(-60, -50, 120, 40, 8);

    const dialogueText = this.scene.add.text(0, -30, text, {
      fontSize: '10px',
      color: '#000000',
      wordWrap: { width: 110 },
      align: 'center',
    }).setOrigin(0.5);

    this.speechBubble = this.scene.add.container(this.x, this.y, [bubble, dialogueText]);

    // Auto-hide after 3 seconds
    this.scene.time.delayedCall(3000, () => this.hideDialogue());
  }

  hideDialogue(): void {
    if (this.speechBubble) {
      this.speechBubble.destroy();
      this.speechBubble = null;
    }
  }
}
