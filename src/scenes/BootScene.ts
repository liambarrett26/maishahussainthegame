import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload(): void {
    // Create stylized loading screen
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height);

    // Progress bar background
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x0f3460, 1);
    progressBox.fillRoundedRect(width / 2 - 120, height / 2 - 12, 240, 24, 12);

    // Progress bar fill
    const progressBar = this.add.graphics();

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 40, 'Loading...', {
      fontSize: '14px',
      color: '#e94560',
      fontFamily: 'monospace',
    });
    loadingText.setOrigin(0.5, 0.5);

    // Percentage text
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xe94560, 1);
      progressBar.fillRoundedRect(
        width / 2 - 116,
        height / 2 - 8,
        232 * value,
        16,
        8
      );
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      bg.destroy();
    });

    // Load sprite atlases
    this.load.atlas('maisha', 'assets/sprites/maisha.png', 'assets/sprites/maisha.json');
    this.load.atlas('mayo', 'assets/sprites/mayo.png', 'assets/sprites/mayo.json');
    this.load.atlas('wasp', 'assets/sprites/wasp.png', 'assets/sprites/wasp.json');
    // Note: seagull sprite will be created programmatically

    // Enemy sprites
    this.load.atlas('drunk_student_grey', 'assets/sprites/enemies/drunk_student_grey.png', 'assets/sprites/enemies/drunk_student_grey.json');
    this.load.atlas('drunk_student_navy', 'assets/sprites/enemies/drunk_student_navy.png', 'assets/sprites/enemies/drunk_student_navy.json');
    this.load.atlas('vomit_projectile', 'assets/sprites/enemies/vomit_projectile.png', 'assets/sprites/enemies/vomit_projectile.json');
    this.load.atlas('vomit_puddle', 'assets/sprites/enemies/vomit_puddle.png', 'assets/sprites/enemies/vomit_puddle.json');

    // Boss sprites
    this.load.atlas('giant_wasp', 'assets/sprites/enemies/giant_wasp.png', 'assets/sprites/enemies/giant_wasp.json');
    this.load.atlas('stinger_missile', 'assets/sprites/enemies/stinger_missile.png', 'assets/sprites/enemies/stinger_missile.json');
    this.load.atlas('swarm_wasp', 'assets/sprites/enemies/swarm_wasp.png', 'assets/sprites/enemies/swarm_wasp.json');
    this.load.image('number_10_door', 'assets/sprites/enemies/number_10_door.png');

    // NPC friend sprites
    this.load.atlas('liam', 'assets/sprites/npcs/liam.png', 'assets/sprites/npcs/liam.json');
    this.load.atlas('beth_twine', 'assets/sprites/npcs/beth_twine.png', 'assets/sprites/npcs/beth_twine.json');
    this.load.atlas('eliza', 'assets/sprites/npcs/eliza.png', 'assets/sprites/npcs/eliza.json');
    this.load.atlas('beth_levy', 'assets/sprites/npcs/beth_levy.png', 'assets/sprites/npcs/beth_levy.json');
    this.load.atlas('sean', 'assets/sprites/npcs/sean.png', 'assets/sprites/npcs/sean.json');
    this.load.atlas('nicki', 'assets/sprites/npcs/nicki.png', 'assets/sprites/npcs/nicki.json');
    this.load.atlas('beaker', 'assets/sprites/npcs/beaker.png', 'assets/sprites/npcs/beaker.json');
    this.load.atlas('puddle', 'assets/sprites/npcs/puddle.png', 'assets/sprites/npcs/puddle.json');
  }

  create(): void {
    // Create programmatic sprites for missing assets
    this.createSeagullSprite();
    this.createBatSprite();
    this.createMaishaFightingSprite();
    this.createMayoProjectileSprite();

    // Only create programmatic Sean/Nicki if loading failed
    if (!this.textures.exists('sean')) {
      this.createSeanSprite();
    }
    if (!this.textures.exists('nicki')) {
      this.createNickiSprite();
    }

    // Create all animations
    this.createAnimations();

    // Fade out and start menu
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.MENU);
    });
  }

  private createSeagullSprite(): void {
    // Create a 128x64 texture with seagull frames
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Draw 4 fly frames (top row) and 2 dive frames (bottom row)
    for (let i = 0; i < 4; i++) {
      this.drawSeagullFrame(ctx, i * 32, 0, i, 'fly');
    }
    for (let i = 0; i < 2; i++) {
      this.drawSeagullFrame(ctx, i * 32, 32, i, 'dive');
    }

    // Create texture from canvas
    this.textures.addCanvas('seagull', canvas);

    // Add frames to the texture
    const texture = this.textures.get('seagull');
    for (let i = 0; i < 4; i++) {
      texture.add(`fly_${i}`, 0, i * 32, 0, 32, 32);
    }
    for (let i = 0; i < 2; i++) {
      texture.add(`dive_${i}`, 0, i * 32, 32, 32, 32);
    }
  }

  private drawSeagullFrame(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, type: string): void {
    const centerX = x + 16;
    const centerY = y + 16;

    // Body (white/gray)
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX + 8, centerY - 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Beak (orange/yellow)
    ctx.fillStyle = '#ffa500';
    ctx.beginPath();
    ctx.moveTo(centerX + 13, centerY - 2);
    ctx.lineTo(centerX + 18, centerY);
    ctx.lineTo(centerX + 13, centerY + 1);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX + 10, centerY - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Wings (animated based on frame)
    ctx.fillStyle = '#d0d0d0';
    const wingOffset = type === 'dive' ? -5 : Math.sin(frame * Math.PI / 2) * 6;

    // Left wing
    ctx.beginPath();
    ctx.moveTo(centerX - 5, centerY);
    ctx.lineTo(centerX - 15, centerY - 8 + wingOffset);
    ctx.lineTo(centerX - 12, centerY + 2);
    ctx.closePath();
    ctx.fill();

    // Right wing
    ctx.beginPath();
    ctx.moveTo(centerX + 5, centerY);
    ctx.lineTo(centerX + 2, centerY - 10 + wingOffset);
    ctx.lineTo(centerX + 8, centerY + 2);
    ctx.closePath();
    ctx.fill();

    // Tail
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX - 16, centerY - 2);
    ctx.lineTo(centerX - 16, centerY + 2);
    ctx.closePath();
    ctx.fill();
  }

  private createBatSprite(): void {
    // Create bat collectible texture (32x32 frames)
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Frame 0: bat upright
    this.drawBatFrame(ctx, 0, 0, 0);
    // Frame 1: bat slightly tilted
    this.drawBatFrame(ctx, 32, 0, 10);

    // Create texture from canvas
    this.textures.addCanvas('bat', canvas);

    // Add frames to the texture
    const texture = this.textures.get('bat');
    texture.add('bat_0', 0, 0, 0, 32, 32);
    texture.add('bat_1', 0, 32, 0, 32, 32);

    // Create bat swing texture (for attack animation)
    const swingCanvas = document.createElement('canvas');
    swingCanvas.width = 128;
    swingCanvas.height = 32;
    const swingCtx = swingCanvas.getContext('2d')!;

    // 4 swing frames at different angles
    this.drawBatSwingFrame(swingCtx, 0, 0, -60);   // wind up
    this.drawBatSwingFrame(swingCtx, 32, 0, -20);  // mid swing
    this.drawBatSwingFrame(swingCtx, 64, 0, 30);   // contact
    this.drawBatSwingFrame(swingCtx, 96, 0, 60);   // follow through

    this.textures.addCanvas('bat-swing', swingCanvas);

    const swingTexture = this.textures.get('bat-swing');
    swingTexture.add('swing_0', 0, 0, 0, 32, 32);
    swingTexture.add('swing_1', 0, 32, 0, 32, 32);
    swingTexture.add('swing_2', 0, 64, 0, 32, 32);
    swingTexture.add('swing_3', 0, 96, 0, 32, 32);
  }

  private drawBatFrame(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number): void {
    const centerX = x + 16;
    const centerY = y + 16;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((angle * Math.PI) / 180);

    // Bat handle (brown)
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(-2, 0, 4, 12);

    // Handle grip (darker)
    ctx.fillStyle = '#654321';
    ctx.fillRect(-2, 8, 4, 4);

    // Bat barrel (lighter wood)
    ctx.fillStyle = '#d2691e';
    ctx.beginPath();
    ctx.ellipse(0, -6, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Barrel highlight
    ctx.fillStyle = '#deb887';
    ctx.beginPath();
    ctx.ellipse(-1, -7, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawBatSwingFrame(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number): void {
    const centerX = x + 16;
    const centerY = y + 20;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((angle * Math.PI) / 180);

    // Bat handle (brown)
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(-2, -4, 4, 10);

    // Bat barrel (lighter wood)
    ctx.fillStyle = '#d2691e';
    ctx.beginPath();
    ctx.ellipse(0, -12, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Barrel highlight
    ctx.fillStyle = '#deb887';
    ctx.beginPath();
    ctx.ellipse(-1, -13, 1.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Motion blur effect on swing frames
    if (angle > 0) {
      ctx.fillStyle = 'rgba(210, 105, 30, 0.3)';
      ctx.beginPath();
      ctx.ellipse(-3, -10, 3, 6, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private createAnimations(): void {
    // Maisha animations
    this.anims.create({
      key: 'maisha-idle',
      frames: this.anims.generateFrameNames('maisha', {
        prefix: 'idle_',
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'maisha-run',
      frames: this.anims.generateFrameNames('maisha', {
        prefix: 'run_',
        start: 0,
        end: 5,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: 'maisha-jump',
      frames: this.anims.generateFrameNames('maisha', {
        prefix: 'jump_',
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.anims.create({
      key: 'maisha-hurt',
      frames: this.anims.generateFrameNames('maisha', {
        prefix: 'hurt_',
        start: 0,
        end: 1,
      }),
      frameRate: 8,
      repeat: 0,
    });

    this.anims.create({
      key: 'maisha-victory',
      frames: this.anims.generateFrameNames('maisha', {
        prefix: 'victory_',
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });

    // Mayo animation
    this.anims.create({
      key: 'mayo-bob',
      frames: this.anims.generateFrameNames('mayo', {
        prefix: 'mayo_',
        start: 0,
        end: 3,
      }),
      frameRate: 6,
      repeat: -1,
    });

    // Wasp animation
    this.anims.create({
      key: 'wasp-fly',
      frames: this.anims.generateFrameNames('wasp', {
        prefix: 'wasp_',
        start: 0,
        end: 1,
      }),
      frameRate: 12,
      repeat: -1,
    });

    // Seagull animations (using explicit frames for programmatic texture)
    this.anims.create({
      key: 'seagull-fly',
      frames: [
        { key: 'seagull', frame: 'fly_0' },
        { key: 'seagull', frame: 'fly_1' },
        { key: 'seagull', frame: 'fly_2' },
        { key: 'seagull', frame: 'fly_3' },
      ],
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'seagull-dive',
      frames: [
        { key: 'seagull', frame: 'dive_0' },
        { key: 'seagull', frame: 'dive_1' },
      ],
      frameRate: 8,
      repeat: -1,
    });

    // Bat animations
    this.anims.create({
      key: 'bat-idle',
      frames: [
        { key: 'bat', frame: 'bat_0' },
        { key: 'bat', frame: 'bat_1' },
      ],
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: 'bat-swing',
      frames: [
        { key: 'bat-swing', frame: 'swing_0' },
        { key: 'bat-swing', frame: 'swing_1' },
        { key: 'bat-swing', frame: 'swing_2' },
        { key: 'bat-swing', frame: 'swing_3' },
      ],
      frameRate: 16,
      repeat: 0,
    });

    // Drunk student animations (grey hoodie variant)
    this.anims.create({
      key: 'drunk-grey-stumble',
      frames: this.anims.generateFrameNames('drunk_student_grey', {
        prefix: 'stumble_',
        start: 0,
        end: 3,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'drunk-grey-bash',
      frames: this.anims.generateFrameNames('drunk_student_grey', {
        prefix: 'bash_',
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'drunk-grey-vomit',
      frames: this.anims.generateFrameNames('drunk_student_grey', {
        prefix: 'vomit_',
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: 0,
    });

    this.anims.create({
      key: 'drunk-grey-hit',
      frames: this.anims.generateFrameNames('drunk_student_grey', {
        prefix: 'hit_',
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: 0,
    });

    // Drunk student animations (navy hoodie variant)
    this.anims.create({
      key: 'drunk-navy-stumble',
      frames: this.anims.generateFrameNames('drunk_student_navy', {
        prefix: 'stumble_',
        start: 0,
        end: 3,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'drunk-navy-bash',
      frames: this.anims.generateFrameNames('drunk_student_navy', {
        prefix: 'bash_',
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'drunk-navy-vomit',
      frames: this.anims.generateFrameNames('drunk_student_navy', {
        prefix: 'vomit_',
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: 0,
    });

    this.anims.create({
      key: 'drunk-navy-hit',
      frames: this.anims.generateFrameNames('drunk_student_navy', {
        prefix: 'hit_',
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: 0,
    });

    // Vomit projectile animation
    this.anims.create({
      key: 'vomit-arc',
      frames: this.anims.generateFrameNames('vomit_projectile', {
        prefix: 'arc_',
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Giant Wasp Boss animations
    this.anims.create({
      key: 'giant-wasp-idle',
      frames: this.anims.generateFrameNames('giant_wasp', {
        prefix: 'idle_',
        start: 0,
        end: 7,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: 'giant-wasp-attack',
      frames: this.anims.generateFrameNames('giant_wasp', {
        prefix: 'attack_',
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.anims.create({
      key: 'giant-wasp-hurt',
      frames: this.anims.generateFrameNames('giant_wasp', {
        prefix: 'hurt_',
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.anims.create({
      key: 'giant-wasp-rage',
      frames: this.anims.generateFrameNames('giant_wasp', {
        prefix: 'rage_',
        start: 0,
        end: 3,
      }),
      frameRate: 14, // Faster in rage mode
      repeat: -1,
    });

    this.anims.create({
      key: 'giant-wasp-defeat',
      frames: this.anims.generateFrameNames('giant_wasp', {
        prefix: 'defeat_',
        start: 0,
        end: 3,
      }),
      frameRate: 6,
      repeat: 0,
    });

    // Stinger missile animation
    this.anims.create({
      key: 'stinger-fly',
      frames: this.anims.generateFrameNames('stinger_missile', {
        prefix: 'fly_',
        start: 0,
        end: 3,
      }),
      frameRate: 12,
      repeat: -1,
    });

    // Swarm wasp animation
    this.anims.create({
      key: 'swarm-wasp-fly',
      frames: this.anims.generateFrameNames('swarm_wasp', {
        prefix: 'fly_',
        start: 0,
        end: 3,
      }),
      frameRate: 16, // Fast flapping
      repeat: -1,
    });

    // Mayo projectile animations
    this.anims.create({
      key: 'mayo-projectile-fly',
      frames: this.anims.generateFrameNames('mayo_projectile', {
        prefix: 'fly_',
        start: 0,
        end: 3,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: 'mayo-projectile-splat',
      frames: this.anims.generateFrameNames('mayo_projectile', {
        prefix: 'splat_',
        start: 0,
        end: 3,
      }),
      frameRate: 16,
      repeat: 0,
    });

    // NPC friend animations
    this.createNPCAnimations();
  }

  private createSeanSprite(): void {
    // Create Sean sprite - friendly chemistry teacher assistant (placeholder)
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // 4 idle frames (top row) + 4 wave frames (bottom row)
    for (let i = 0; i < 4; i++) {
      this.drawSeanFrame(ctx, i * 32, 0, i, 'idle');
    }
    for (let i = 0; i < 4; i++) {
      this.drawSeanFrame(ctx, i * 32, 32, i, 'wave');
    }

    this.textures.addCanvas('sean', canvas);

    const texture = this.textures.get('sean');
    for (let i = 0; i < 4; i++) {
      texture.add(`idle_${i}`, 0, i * 32, 0, 32, 32);
      texture.add(`wave_${i}`, 0, i * 32, 32, 32, 32);
    }
  }

  private drawSeanFrame(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, type: string): void {
    const centerX = x + 16;
    const baseY = y + 28;

    // Body - lab coat (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 6, baseY - 18, 12, 16);

    // Lab coat collar
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(centerX - 7, baseY - 18, 3, 6);
    ctx.fillRect(centerX + 4, baseY - 18, 3, 6);

    // Shirt underneath (blue)
    ctx.fillStyle = '#3498db';
    ctx.fillRect(centerX - 3, baseY - 16, 6, 4);

    // Head
    ctx.fillStyle = '#f5deb3';
    ctx.beginPath();
    ctx.arc(centerX, baseY - 22, 6, 0, Math.PI * 2);
    ctx.fill();

    // Hair (dark brown, short)
    ctx.fillStyle = '#4a3728';
    ctx.beginPath();
    ctx.arc(centerX, baseY - 25, 5, Math.PI, 0);
    ctx.fill();

    // Glasses
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(centerX - 5, baseY - 23, 4, 3);
    ctx.strokeRect(centerX + 1, baseY - 23, 4, 3);
    ctx.beginPath();
    ctx.moveTo(centerX - 1, baseY - 22);
    ctx.lineTo(centerX + 1, baseY - 22);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(centerX - 4, baseY - 22, 2, 2);
    ctx.fillRect(centerX + 2, baseY - 22, 2, 2);

    // Smile
    ctx.beginPath();
    ctx.arc(centerX, baseY - 18, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Arms
    ctx.fillStyle = '#ffffff';
    const armWave = type === 'wave' ? Math.sin(frame * Math.PI / 2) * 4 : 0;
    ctx.fillRect(centerX - 10, baseY - 14 - armWave, 4, 10);
    ctx.fillRect(centerX + 6, baseY - 14, 4, 10);

    // Hands
    ctx.fillStyle = '#f5deb3';
    ctx.fillRect(centerX - 10, baseY - 6 - armWave, 4, 4);
    ctx.fillRect(centerX + 6, baseY - 6, 4, 4);

    // Legs
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(centerX - 4, baseY - 2, 3, 4);
    ctx.fillRect(centerX + 1, baseY - 2, 3, 4);

    // Breathing animation
    const breathe = Math.sin(frame * Math.PI / 2) * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 5, baseY - 17 + breathe, 10, 1);
  }

  private createNickiSprite(): void {
    // Create Nicki sprite - chemistry teacher boss (placeholder)
    // Larger sprite for fighting game (64x64)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // 4 idle frames, 4 attack frames (top row)
    // 4 hurt frames, 4 throw frames (bottom row)
    for (let i = 0; i < 4; i++) {
      this.drawNickiFrame(ctx, i * 64, 0, i, 'idle');
      this.drawNickiFrame(ctx, (i + 4) * 64, 0, i, 'attack');
    }
    for (let i = 0; i < 4; i++) {
      this.drawNickiFrame(ctx, i * 64, 64, i, 'hurt');
      this.drawNickiFrame(ctx, (i + 4) * 64, 64, i, 'throw');
    }

    this.textures.addCanvas('nicki', canvas);

    const texture = this.textures.get('nicki');
    for (let i = 0; i < 4; i++) {
      texture.add(`idle_${i}`, 0, i * 64, 0, 64, 64);
      texture.add(`attack_${i}`, 0, (i + 4) * 64, 0, 64, 64);
      texture.add(`hurt_${i}`, 0, i * 64, 64, 64, 64);
      texture.add(`throw_${i}`, 0, (i + 4) * 64, 64, 64, 64);
    }
  }

  private drawNickiFrame(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, type: string): void {
    const centerX = x + 32;
    const baseY = y + 58;

    // Lab coat (longer, dramatic)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 12, baseY - 36, 24, 32);

    // Lab coat flare
    ctx.beginPath();
    ctx.moveTo(centerX - 12, baseY - 4);
    ctx.lineTo(centerX - 16, baseY + 2);
    ctx.lineTo(centerX + 16, baseY + 2);
    ctx.lineTo(centerX + 12, baseY - 4);
    ctx.fill();

    // Purple accents (chemistry teacher flair)
    ctx.fillStyle = '#9b59b6';
    ctx.fillRect(centerX - 13, baseY - 36, 4, 28);
    ctx.fillRect(centerX + 9, baseY - 36, 4, 28);

    // Head
    ctx.fillStyle = '#f5deb3';
    ctx.beginPath();
    ctx.arc(centerX, baseY - 44, 10, 0, Math.PI * 2);
    ctx.fill();

    // Hair (dark, styled up)
    ctx.fillStyle = '#2c2c2c';
    ctx.beginPath();
    ctx.arc(centerX, baseY - 48, 9, Math.PI, 0);
    ctx.fill();
    // Hair spike
    ctx.beginPath();
    ctx.moveTo(centerX - 4, baseY - 55);
    ctx.lineTo(centerX, baseY - 60);
    ctx.lineTo(centerX + 4, baseY - 55);
    ctx.closePath();
    ctx.fill();

    // Safety goggles on forehead
    ctx.fillStyle = '#3498db';
    ctx.fillRect(centerX - 8, baseY - 52, 16, 4);
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 1;
    ctx.strokeRect(centerX - 8, baseY - 52, 16, 4);

    // Eyes (menacing when attacking)
    ctx.fillStyle = type === 'attack' || type === 'throw' ? '#e74c3c' : '#2c3e50';
    ctx.fillRect(centerX - 5, baseY - 44, 3, 3);
    ctx.fillRect(centerX + 2, baseY - 44, 3, 3);

    // Evil grin
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (type === 'hurt') {
      ctx.arc(centerX, baseY - 36, 4, Math.PI + 0.3, -0.3);
    } else {
      ctx.arc(centerX, baseY - 40, 4, 0.3, Math.PI - 0.3);
    }
    ctx.stroke();

    // Arms based on animation type
    ctx.fillStyle = '#ffffff';
    if (type === 'attack') {
      // Punching motion
      const punchExtend = frame * 6;
      ctx.fillRect(centerX + 12, baseY - 32, 8 + punchExtend, 6);
      ctx.fillRect(centerX - 20, baseY - 28, 8, 6);
    } else if (type === 'throw') {
      // Throwing beaker
      const throwAngle = (frame / 4) * Math.PI / 2;
      ctx.save();
      ctx.translate(centerX + 16, baseY - 30);
      ctx.rotate(-throwAngle);
      ctx.fillRect(0, -3, 16, 6);
      // Beaker in hand
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(14, -6, 8, 12);
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(15, -4, 6, 8);
      ctx.restore();
      ctx.fillRect(centerX - 20, baseY - 28, 8, 6);
    } else if (type === 'hurt') {
      // Recoiling
      ctx.fillRect(centerX - 24, baseY - 26, 8, 6);
      ctx.fillRect(centerX + 16, baseY - 26, 8, 6);
    } else {
      // Idle stance
      const armMove = Math.sin(frame * Math.PI / 2) * 2;
      ctx.fillRect(centerX - 20, baseY - 28 + armMove, 8, 6);
      ctx.fillRect(centerX + 12, baseY - 28 - armMove, 8, 6);
    }

    // Hands
    ctx.fillStyle = '#f5deb3';
    if (type === 'attack') {
      const punchExtend = frame * 6;
      ctx.beginPath();
      ctx.arc(centerX + 22 + punchExtend, baseY - 29, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legs
    ctx.fillStyle = '#2c3e50';
    const legSpread = type === 'attack' ? 4 : 2;
    ctx.fillRect(centerX - 6 - legSpread, baseY, 5, 6);
    ctx.fillRect(centerX + 1 + legSpread, baseY, 5, 6);

    // Shoes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(centerX - 8 - legSpread, baseY + 4, 7, 4);
    ctx.fillRect(centerX + 1 + legSpread, baseY + 4, 7, 4);
  }

  private createMaishaFightingSprite(): void {
    // Create larger Maisha sprite for fighting game (64x64 frames)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 192;
    const ctx = canvas.getContext('2d')!;

    // Row 1: idle (4), walk (4)
    for (let i = 0; i < 4; i++) {
      this.drawMaishaFightFrame(ctx, i * 64, 0, i, 'idle');
      this.drawMaishaFightFrame(ctx, (i + 4) * 64, 0, i, 'walk');
    }
    // Row 2: punch (4), kick (4)
    for (let i = 0; i < 4; i++) {
      this.drawMaishaFightFrame(ctx, i * 64, 64, i, 'punch');
      this.drawMaishaFightFrame(ctx, (i + 4) * 64, 64, i, 'kick');
    }
    // Row 3: block (2), hurt (2), victory (4)
    for (let i = 0; i < 2; i++) {
      this.drawMaishaFightFrame(ctx, i * 64, 128, i, 'block');
      this.drawMaishaFightFrame(ctx, (i + 2) * 64, 128, i, 'hurt');
    }
    for (let i = 0; i < 4; i++) {
      this.drawMaishaFightFrame(ctx, (i + 4) * 64, 128, i, 'victory');
    }

    this.textures.addCanvas('maisha-fight', canvas);

    const texture = this.textures.get('maisha-fight');
    for (let i = 0; i < 4; i++) {
      texture.add(`idle_${i}`, 0, i * 64, 0, 64, 64);
      texture.add(`walk_${i}`, 0, (i + 4) * 64, 0, 64, 64);
      texture.add(`punch_${i}`, 0, i * 64, 64, 64, 64);
      texture.add(`kick_${i}`, 0, (i + 4) * 64, 64, 64, 64);
    }
    for (let i = 0; i < 2; i++) {
      texture.add(`block_${i}`, 0, i * 64, 128, 64, 64);
      texture.add(`hurt_${i}`, 0, (i + 2) * 64, 128, 64, 64);
    }
    for (let i = 0; i < 4; i++) {
      texture.add(`victory_${i}`, 0, (i + 4) * 64, 128, 64, 64);
    }
  }

  private createMayoProjectileSprite(): void {
    // Create mayo projectile texture (16x16 frames)
    const canvas = document.createElement('canvas');
    canvas.width = 128; // 8 frames
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    // Frames 0-3: flying mayo glob
    for (let i = 0; i < 4; i++) {
      this.drawMayoGlobFrame(ctx, i * 16, 0, i, 'fly');
    }

    // Frames 4-7: splat animation
    for (let i = 0; i < 4; i++) {
      this.drawMayoGlobFrame(ctx, (i + 4) * 16, 0, i, 'splat');
    }

    this.textures.addCanvas('mayo_projectile', canvas);

    const texture = this.textures.get('mayo_projectile');
    for (let i = 0; i < 4; i++) {
      texture.add(`fly_${i}`, 0, i * 16, 0, 16, 16);
      texture.add(`splat_${i}`, 0, (i + 4) * 16, 0, 16, 16);
    }
  }

  private drawMayoGlobFrame(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, type: string): void {
    const centerX = x + 8;
    const centerY = y + 8;

    if (type === 'fly') {
      // Spinning mayo glob
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((frame * Math.PI) / 4);

      // Main mayo blob (cream/white)
      ctx.fillStyle = '#fff8dc';
      ctx.beginPath();
      ctx.ellipse(0, 0, 6 + frame % 2, 5 - frame % 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Darker outline
      ctx.strokeStyle = '#f5deb3';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-2, -2, 2, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Small droplets trailing
      ctx.fillStyle = '#fff8dc';
      ctx.beginPath();
      ctx.arc(-6, 2 + frame, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else {
      // Splat animation
      const splatSize = 3 + frame * 2;
      const alpha = 1 - frame * 0.2;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Central splat
      ctx.fillStyle = '#fff8dc';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, splatSize, splatSize * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Splatter droplets
      for (let d = 0; d < 6; d++) {
        const angle = (d / 6) * Math.PI * 2;
        const dist = splatSize + frame * 2;
        const dropX = centerX + Math.cos(angle) * dist;
        const dropY = centerY + Math.sin(angle) * dist * 0.6;

        ctx.beginPath();
        ctx.arc(dropX, dropY, 2 - frame * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Highlight on splat
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = alpha * 0.7;
      ctx.beginPath();
      ctx.ellipse(centerX - 2, centerY - 1, splatSize * 0.4, splatSize * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private drawMaishaFightFrame(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, type: string): void {
    const centerX = x + 32;
    const baseY = y + 58;

    // Colors - Maisha: 29yo British-Bangladeshi, brown skin, black hair to elbows, red jumper
    const skinColor = '#c68642'; // Warm brown skin
    const hairColor = '#1a1a1a'; // Black hair
    const shirtColor = '#c0392b'; // Red jumper
    const pantsColor = '#2c3e50'; // Dark blue jeans
    const shoeColor = '#1a1a1a';

    // Breathing/idle animation
    const breathe = type === 'idle' ? Math.sin(frame * Math.PI / 2) * 1 : 0;

    // === LEGS ===
    ctx.fillStyle = pantsColor;

    if (type === 'kick') {
      // Kicking leg animation
      if (frame === 0) {
        // Wind up - legs together
        ctx.fillRect(centerX - 5, baseY - 4, 4, 12);
        ctx.fillRect(centerX + 1, baseY - 4, 4, 12);
      } else if (frame === 1) {
        // Knee raise
        ctx.fillRect(centerX - 5, baseY - 4, 4, 12);
        // Raised leg
        ctx.fillRect(centerX + 1, baseY - 10, 4, 8);
        ctx.fillRect(centerX + 5, baseY - 8, 8, 4);
      } else if (frame === 2) {
        // Full extension kick!
        ctx.fillRect(centerX - 5, baseY - 4, 4, 12);
        // Extended leg
        ctx.fillRect(centerX + 1, baseY - 6, 4, 4);
        ctx.fillRect(centerX + 5, baseY - 6, 14, 4);
        // Foot
        ctx.fillStyle = shoeColor;
        ctx.fillRect(centerX + 17, baseY - 8, 6, 6);
      } else {
        // Recovery
        ctx.fillRect(centerX - 5, baseY - 4, 4, 10);
        ctx.fillRect(centerX + 1, baseY - 2, 4, 8);
      }
    } else if (type === 'walk') {
      // Walking animation
      const legOffset = Math.sin(frame * Math.PI / 2) * 4;
      ctx.fillRect(centerX - 5, baseY - 4 - legOffset, 4, 12 + legOffset);
      ctx.fillRect(centerX + 1, baseY - 4 + legOffset, 4, 12 - legOffset);
    } else if (type === 'hurt') {
      // Knocked back legs
      ctx.fillRect(centerX - 8, baseY - 2, 4, 10);
      ctx.fillRect(centerX - 2, baseY, 4, 8);
    } else if (type === 'victory') {
      // Jumping celebration
      const jumpOffset = Math.abs(Math.sin(frame * Math.PI / 2)) * 6;
      ctx.fillRect(centerX - 6, baseY - 4 - jumpOffset, 4, 10);
      ctx.fillRect(centerX + 2, baseY - 4 - jumpOffset, 4, 10);
    } else {
      // Normal standing
      ctx.fillRect(centerX - 5, baseY - 4, 4, 12);
      ctx.fillRect(centerX + 1, baseY - 4, 4, 12);
    }

    // === SHOES ===
    ctx.fillStyle = shoeColor;
    if (type === 'kick' && frame >= 2) {
      // Shoe on standing leg only
      ctx.fillRect(centerX - 7, baseY + 6, 6, 4);
    } else if (type === 'hurt') {
      ctx.fillRect(centerX - 10, baseY + 6, 6, 4);
      ctx.fillRect(centerX - 4, baseY + 6, 6, 4);
    } else if (type === 'victory') {
      const jumpOffset = Math.abs(Math.sin(frame * Math.PI / 2)) * 6;
      ctx.fillRect(centerX - 8, baseY + 4 - jumpOffset, 6, 4);
      ctx.fillRect(centerX + 2, baseY + 4 - jumpOffset, 6, 4);
    } else {
      ctx.fillRect(centerX - 7, baseY + 6, 6, 4);
      ctx.fillRect(centerX - 1, baseY + 6, 6, 4);
    }

    // === BODY/TORSO ===
    ctx.fillStyle = shirtColor;
    if (type === 'hurt') {
      // Leaning back
      ctx.fillRect(centerX - 10, baseY - 20, 12, 18);
    } else if (type === 'punch' && frame >= 2) {
      // Torso twist for punch
      ctx.fillRect(centerX - 8, baseY - 22 + breathe, 14, 20);
    } else {
      ctx.fillRect(centerX - 6, baseY - 22 + breathe, 12, 20);
    }

    // === ARMS ===
    ctx.fillStyle = skinColor;

    if (type === 'punch') {
      // Punching arm animation
      if (frame === 0) {
        // Wind up - arm back
        ctx.fillRect(centerX - 14, baseY - 18, 8, 5);
        ctx.fillRect(centerX + 6, baseY - 16, 6, 5);
      } else if (frame === 1) {
        // Arm coming forward
        ctx.fillRect(centerX - 10, baseY - 18, 6, 5);
        ctx.fillRect(centerX + 6, baseY - 18, 10, 5);
      } else if (frame === 2) {
        // Full punch extension!
        ctx.fillRect(centerX - 8, baseY - 16, 6, 5);
        ctx.fillRect(centerX + 6, baseY - 18, 18, 5);
        // Fist
        ctx.fillRect(centerX + 22, baseY - 20, 7, 8);
      } else {
        // Recovery
        ctx.fillRect(centerX - 10, baseY - 16, 6, 5);
        ctx.fillRect(centerX + 6, baseY - 16, 8, 5);
      }
    } else if (type === 'kick') {
      // Arms for balance during kick
      if (frame >= 1 && frame <= 2) {
        ctx.fillRect(centerX - 16, baseY - 20, 10, 5);
        ctx.fillRect(centerX + 6, baseY - 14, 8, 5);
      } else {
        ctx.fillRect(centerX - 12, baseY - 16, 6, 5);
        ctx.fillRect(centerX + 6, baseY - 16, 6, 5);
      }
    } else if (type === 'block') {
      // Arms raised in block position
      ctx.fillRect(centerX - 10, baseY - 26, 6, 12);
      ctx.fillRect(centerX + 4, baseY - 26, 6, 12);
      // Fists up
      ctx.fillRect(centerX - 12, baseY - 30, 8, 6);
      ctx.fillRect(centerX + 4, baseY - 30, 8, 6);
    } else if (type === 'hurt') {
      // Arms flailing
      ctx.fillRect(centerX - 18, baseY - 14, 8, 5);
      ctx.fillRect(centerX + 2, baseY - 10, 8, 5);
    } else if (type === 'victory') {
      // Arms up celebration
      const armWave = Math.sin(frame * Math.PI) * 4;
      ctx.fillRect(centerX - 14, baseY - 28 - armWave, 6, 12);
      ctx.fillRect(centerX + 8, baseY - 28 + armWave, 6, 12);
      // Hands
      ctx.fillRect(centerX - 16, baseY - 32 - armWave, 8, 6);
      ctx.fillRect(centerX + 8, baseY - 32 + armWave, 8, 6);
    } else {
      // Idle arms with slight movement
      const armMove = Math.sin(frame * Math.PI / 2) * 2;
      ctx.fillRect(centerX - 12, baseY - 16 + armMove, 6, 10);
      ctx.fillRect(centerX + 6, baseY - 16 - armMove, 6, 10);
    }

    // === HEAD ===
    ctx.fillStyle = skinColor;
    if (type === 'hurt') {
      ctx.beginPath();
      ctx.arc(centerX - 4, baseY - 30, 10, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(centerX, baseY - 32 + breathe, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // === HAIR === (Long black hair to elbows)
    ctx.fillStyle = hairColor;
    if (type === 'hurt') {
      ctx.beginPath();
      ctx.arc(centerX - 4, baseY - 34, 10, Math.PI, 0);
      ctx.fill();
      // Long hair flowing when hurt
      ctx.fillRect(centerX - 12, baseY - 36, 5, 28);
      ctx.fillRect(centerX + 3, baseY - 36, 5, 26);
      // Hair strands flying
      ctx.fillRect(centerX - 8, baseY - 42, 3, 6);
      ctx.fillRect(centerX + 5, baseY - 40, 3, 5);
    } else {
      ctx.beginPath();
      ctx.arc(centerX, baseY - 36 + breathe, 10, Math.PI, 0);
      ctx.fill();
      // Long hair going down to elbows on both sides
      ctx.fillRect(centerX - 12, baseY - 38 + breathe, 5, 32); // Left side - to elbow
      ctx.fillRect(centerX + 7, baseY - 38 + breathe, 5, 32);  // Right side - to elbow
      // Back of hair
      ctx.fillRect(centerX - 6, baseY - 44 + breathe, 12, 6);
      // Hair shine highlight
      ctx.fillStyle = '#333333';
      ctx.fillRect(centerX - 3, baseY - 42 + breathe, 2, 4);
      ctx.fillStyle = hairColor;
    }

    // === FACE === (Round face, warm wide brown eyes)
    const headX = type === 'hurt' ? centerX - 4 : centerX;
    const headY = type === 'hurt' ? baseY - 30 : baseY - 32 + breathe;

    // Eyes - warm brown, wide
    const eyeColor = '#5d4037'; // Warm brown
    if (type === 'hurt') {
      // X eyes when hurt
      ctx.strokeStyle = eyeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headX - 6, headY - 4);
      ctx.lineTo(headX - 1, headY + 1);
      ctx.moveTo(headX - 6, headY + 1);
      ctx.lineTo(headX - 1, headY - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(headX + 1, headY - 4);
      ctx.lineTo(headX + 6, headY + 1);
      ctx.moveTo(headX + 1, headY + 1);
      ctx.lineTo(headX + 6, headY - 4);
      ctx.stroke();
    } else if (type === 'punch' && frame >= 2) {
      // Determined eyes - wide
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.ellipse(headX - 4, headY - 1, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(headX + 4, headY - 1, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eye shine
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX - 5, headY - 2, 2, 2);
      ctx.fillRect(headX + 3, headY - 2, 2, 2);
    } else if (type === 'victory') {
      // Happy closed eyes - curved
      ctx.strokeStyle = eyeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(headX - 4, headY, 3, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(headX + 4, headY, 3, 0, Math.PI);
      ctx.stroke();
    } else {
      // Normal wide eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(headX - 4, headY - 1, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(headX + 4, headY - 1, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Iris - warm brown
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(headX - 4, headY - 1, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(headX + 4, headY - 1, 2, 0, Math.PI * 2);
      ctx.fill();
      // Pupil
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(headX - 5, headY - 2, 2, 2);
      ctx.fillRect(headX + 3, headY - 2, 2, 2);
      // Eye shine
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX - 3, headY - 2, 1, 1);
      ctx.fillRect(headX + 5, headY - 2, 1, 1);
    }

    // Mouth
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (type === 'hurt') {
      // Open mouth (ouch!)
      ctx.arc(headX, headY + 5, 3, 0, Math.PI);
    } else if (type === 'punch' && frame >= 2) {
      // Battle cry
      ctx.arc(headX, headY + 4, 4, 0, Math.PI);
    } else if (type === 'victory') {
      // Big smile
      ctx.arc(headX, headY + 3, 4, 0.2, Math.PI - 0.2);
    } else if (type === 'block') {
      // Gritting teeth
      ctx.moveTo(headX - 3, headY + 4);
      ctx.lineTo(headX + 3, headY + 4);
    } else {
      // Normal smile
      ctx.arc(headX, headY + 3, 3, 0.2, Math.PI - 0.2);
    }
    ctx.stroke();

    // === SPECIAL EFFECTS ===
    if (type === 'punch' && frame === 2) {
      // Impact lines
      ctx.strokeStyle = '#ffd93d';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX + 28, baseY - 22 + i * 6);
        ctx.lineTo(centerX + 36, baseY - 24 + i * 6);
        ctx.stroke();
      }
    }

    if (type === 'kick' && frame === 2) {
      // Kick impact effect
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX + 22, baseY - 6, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private createNPCAnimations(): void {
    const npcNames = ['liam', 'beth_twine', 'eliza', 'beth_levy', 'sean'];

    npcNames.forEach((npc) => {
      // Idle animation
      this.anims.create({
        key: `${npc}-idle`,
        frames: this.anims.generateFrameNames(npc, {
          prefix: 'idle_',
          start: 0,
          end: 3,
        }),
        frameRate: 8,
        repeat: -1,
      });

      // Wave animation
      this.anims.create({
        key: `${npc}-wave`,
        frames: this.anims.generateFrameNames(npc, {
          prefix: 'wave_',
          start: 0,
          end: 3,
        }),
        frameRate: 8,
        repeat: 2, // Wave 3 times then stop
      });
    });

    // Maisha fighting animations
    this.anims.create({
      key: 'maisha-fight-idle',
      frames: [
        { key: 'maisha-fight', frame: 'idle_0' },
        { key: 'maisha-fight', frame: 'idle_1' },
        { key: 'maisha-fight', frame: 'idle_2' },
        { key: 'maisha-fight', frame: 'idle_3' },
      ],
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'maisha-fight-walk',
      frames: [
        { key: 'maisha-fight', frame: 'walk_0' },
        { key: 'maisha-fight', frame: 'walk_1' },
        { key: 'maisha-fight', frame: 'walk_2' },
        { key: 'maisha-fight', frame: 'walk_3' },
      ],
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'maisha-fight-punch',
      frames: [
        { key: 'maisha-fight', frame: 'punch_0' },
        { key: 'maisha-fight', frame: 'punch_1' },
        { key: 'maisha-fight', frame: 'punch_2' },
        { key: 'maisha-fight', frame: 'punch_3' },
      ],
      frameRate: 16,
      repeat: 0,
    });

    this.anims.create({
      key: 'maisha-fight-kick',
      frames: [
        { key: 'maisha-fight', frame: 'kick_0' },
        { key: 'maisha-fight', frame: 'kick_1' },
        { key: 'maisha-fight', frame: 'kick_2' },
        { key: 'maisha-fight', frame: 'kick_3' },
      ],
      frameRate: 14,
      repeat: 0,
    });

    this.anims.create({
      key: 'maisha-fight-block',
      frames: [
        { key: 'maisha-fight', frame: 'block_0' },
        { key: 'maisha-fight', frame: 'block_1' },
      ],
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'maisha-fight-hurt',
      frames: [
        { key: 'maisha-fight', frame: 'hurt_0' },
        { key: 'maisha-fight', frame: 'hurt_1' },
      ],
      frameRate: 8,
      repeat: 0,
    });

    this.anims.create({
      key: 'maisha-fight-victory',
      frames: [
        { key: 'maisha-fight', frame: 'victory_0' },
        { key: 'maisha-fight', frame: 'victory_1' },
        { key: 'maisha-fight', frame: 'victory_2' },
        { key: 'maisha-fight', frame: 'victory_3' },
      ],
      frameRate: 8,
      repeat: -1,
    });

    // Nicki boss animations
    this.anims.create({
      key: 'nicki-idle',
      frames: [
        { key: 'nicki', frame: 'idle_0' },
        { key: 'nicki', frame: 'idle_1' },
        { key: 'nicki', frame: 'idle_2' },
        { key: 'nicki', frame: 'idle_3' },
      ],
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'nicki-attack',
      frames: [
        { key: 'nicki', frame: 'attack_0' },
        { key: 'nicki', frame: 'attack_1' },
        { key: 'nicki', frame: 'attack_2' },
        { key: 'nicki', frame: 'attack_3' },
      ],
      frameRate: 12,
      repeat: 0,
    });

    this.anims.create({
      key: 'nicki-hurt',
      frames: [
        { key: 'nicki', frame: 'hurt_0' },
        { key: 'nicki', frame: 'hurt_1' },
      ],
      frameRate: 8,
      repeat: 0,
    });

    this.anims.create({
      key: 'nicki-throw',
      frames: [
        { key: 'nicki', frame: 'throw_0' },
        { key: 'nicki', frame: 'throw_1' },
        { key: 'nicki', frame: 'throw_2' },
        { key: 'nicki', frame: 'throw_3' },
      ],
      frameRate: 10,
      repeat: 0,
    });
  }
}
