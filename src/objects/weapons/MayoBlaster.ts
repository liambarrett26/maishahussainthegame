import Phaser from 'phaser';

export class MayoProjectile extends Phaser.GameObjects.Sprite {
  private speed: number = 300;
  private direction: number = 1;
  private alive: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number, direction: number) {
    super(scene, x, y, 'mayo_projectile', 'splat_0');

    this.direction = direction;

    scene.add.existing(this);

    // Play animation
    this.play('mayo-projectile-fly');

    // Set depth
    this.setDepth(10);

    // Flip based on direction
    this.setFlipX(direction < 0);

    // Auto-destroy after 2 seconds
    scene.time.delayedCall(2000, () => {
      this.destroy();
    });
  }

  update(): void {
    if (!this.alive) return;

    // Move in direction
    this.x += this.speed * this.direction * (1 / 60); // Assuming 60fps

    // Rotate slightly for effect
    this.rotation += 0.1 * this.direction;
  }

  hit(): void {
    if (!this.alive) return;
    this.alive = false;

    // Play splat animation
    this.play('mayo-projectile-splat');

    // Create splat effect
    this.createSplatEffect();

    // Destroy after animation
    this.scene.time.delayedCall(200, () => {
      this.destroy();
    });
  }

  private createSplatEffect(): void {
    // Create mayo splatter particles
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.graphics();
      particle.setPosition(this.x, this.y);
      particle.fillStyle(0xfff8dc, 1); // Cream/mayo color
      particle.fillCircle(0, 0, Phaser.Math.Between(2, 5));
      particle.setDepth(9);

      const angle = (i / 8) * Math.PI * 2;
      const speed = Phaser.Math.Between(20, 50);

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * speed,
        y: this.y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.5,
        duration: 300,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  isAlive(): boolean {
    return this.alive;
  }
}

export class MayoBlasterPickup extends Phaser.GameObjects.Container {
  private collected: boolean = false;
  private bottleSprite: Phaser.GameObjects.Graphics;
  private glowEffect: Phaser.GameObjects.Graphics;
  private floatOffset: number = 0;
  private baseY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.baseY = y;

    scene.add.existing(this);

    // Create glow effect
    this.glowEffect = scene.add.graphics();
    this.glowEffect.fillStyle(0xffff00, 0.3);
    this.glowEffect.fillCircle(0, 0, 25);
    this.add(this.glowEffect);

    // Create the mayo bottle sprite
    this.bottleSprite = scene.add.graphics();
    this.drawMayoBottle();
    this.add(this.bottleSprite);

    // Add "!" indicator
    const indicator = scene.add.text(0, -35, '!', {
      fontSize: '14px',
      color: '#ffff00',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    indicator.setOrigin(0.5);
    this.add(indicator);

    // Animate indicator
    scene.tweens.add({
      targets: indicator,
      y: -40,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Glow pulse animation
    scene.tweens.add({
      targets: this.glowEffect,
      alpha: { from: 0.2, to: 0.5 },
      scale: { from: 0.9, to: 1.1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.setDepth(5);
  }

  private drawMayoBottle(): void {
    // Draw a mayo squeeze bottle
    const g = this.bottleSprite;

    // Bottle body (cream/white)
    g.fillStyle(0xfff8dc, 1);
    g.fillRoundedRect(-8, -12, 16, 24, 4);

    // Bottle cap/nozzle (red)
    g.fillStyle(0xcc0000, 1);
    g.fillRect(-4, -18, 8, 8);
    g.fillTriangle(-2, -18, 2, -18, 0, -22);

    // Label
    g.fillStyle(0xffcc00, 1);
    g.fillRect(-6, -4, 12, 10);

    // "M" on label
    g.fillStyle(0xcc0000, 1);
    g.fillRect(-4, -2, 2, 6);
    g.fillRect(2, -2, 2, 6);
    g.fillRect(-2, -2, 4, 2);

    // Highlight
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(-6, -10, 3, 8);

    // Outline
    g.lineStyle(1, 0x000000, 0.5);
    g.strokeRoundedRect(-8, -12, 16, 24, 4);
  }

  update(): void {
    if (this.collected) return;

    // Float animation
    this.floatOffset += 0.05;
    this.y = this.baseY + Math.sin(this.floatOffset) * 5;
  }

  collect(onComplete?: () => void): void {
    if (this.collected) return;
    this.collected = true;

    // Play collection effect
    this.playCollectEffect();

    // Play sound
    this.playCollectSound();

    // Animate and destroy
    this.scene.tweens.add({
      targets: this,
      y: this.y - 30,
      alpha: 0,
      scale: 1.5,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => {
        onComplete?.();
        this.destroy();
      },
    });
  }

  private playCollectEffect(): void {
    // Sparkle effect
    for (let i = 0; i < 12; i++) {
      const sparkle = this.scene.add.graphics();
      sparkle.setPosition(this.x, this.y);
      sparkle.fillStyle(0xffff00, 1);
      // Draw a simple diamond/star shape
      sparkle.fillTriangle(-4, 0, 0, -6, 4, 0);
      sparkle.fillTriangle(-4, 0, 0, 6, 4, 0);
      sparkle.setDepth(100);

      const angle = (i / 12) * Math.PI * 2;
      const distance = Phaser.Math.Between(30, 60);

      this.scene.tweens.add({
        targets: sparkle,
        x: this.x + Math.cos(angle) * distance,
        y: this.y + Math.sin(angle) * distance,
        alpha: 0,
        rotation: Math.PI,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => sparkle.destroy(),
      });
    }

    // Flash
    this.scene.cameras.main.flash(200, 255, 255, 200);
  }

  private playCollectSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Power-up sound - ascending triumphant notes
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + i * 0.08;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    }
  }

  isCollected(): boolean {
    return this.collected;
  }

  getBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x - 15, this.y - 20, 30, 40);
  }
}

export class MayoBlaster {
  private scene: Phaser.Scene;
  private owner: Phaser.GameObjects.Sprite;
  private projectiles: MayoProjectile[] = [];
  private cooldown: number = 0;
  private cooldownTime: number = 400; // ms between shots
  private ammo: number = 50; // Limited ammo
  private equipped: boolean = false;

  // Visual representation on player
  private weaponSprite: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, owner: Phaser.GameObjects.Sprite) {
    this.scene = scene;
    this.owner = owner;
  }

  equip(): void {
    this.equipped = true;

    // Create weapon sprite attached to player
    this.weaponSprite = this.scene.add.graphics();
    this.updateWeaponPosition();

    // Show equip message
    this.showEquipMessage();
  }

  private showEquipMessage(): void {
    const message = this.scene.add.text(
      this.owner.x,
      this.owner.y - 50,
      '🥫 MAYO BLASTER EQUIPPED! 🥫\nPress SPACE to fire!',
      {
        fontSize: '10px',
        color: '#ffff00',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
      }
    );
    message.setOrigin(0.5);
    message.setDepth(200);

    this.scene.tweens.add({
      targets: message,
      y: message.y - 30,
      alpha: 0,
      duration: 2500,
      ease: 'Quad.easeOut',
      onComplete: () => message.destroy(),
    });
  }

  update(delta: number): void {
    if (!this.equipped) return;

    // Update cooldown
    if (this.cooldown > 0) {
      this.cooldown -= delta;
    }

    // Update weapon position
    this.updateWeaponPosition();

    // Update projectiles
    this.projectiles.forEach((proj) => proj.update());

    // Clean up destroyed projectiles
    this.projectiles = this.projectiles.filter((proj) => proj.active);
  }

  private updateWeaponPosition(): void {
    if (!this.weaponSprite) return;

    this.weaponSprite.clear();

    // Determine direction player is facing
    const direction = this.owner.flipX ? -1 : 1;
    const offsetX = direction * 12;

    this.weaponSprite.setPosition(this.owner.x + offsetX, this.owner.y - 2);

    // Draw mini mayo bottle
    const g = this.weaponSprite;

    // Bottle body
    g.fillStyle(0xfff8dc, 1);
    g.fillRoundedRect(-4, -6, 8, 12, 2);

    // Cap
    g.fillStyle(0xcc0000, 1);
    g.fillRect(-2 + (direction > 0 ? 4 : -4), -3, 4, 4);

    // Nozzle pointing forward
    g.fillTriangle(
      direction > 0 ? 6 : -6,
      -1,
      direction > 0 ? 10 : -10,
      -1,
      direction > 0 ? 6 : -6,
      1
    );

    this.weaponSprite.setDepth(this.owner.depth + 1);
  }

  fire(): MayoProjectile | null {
    if (!this.equipped || this.cooldown > 0 || this.ammo <= 0) return null;

    this.cooldown = this.cooldownTime;
    this.ammo--;

    // Determine direction
    const direction = this.owner.flipX ? -1 : 1;

    // Create projectile
    const projectile = new MayoProjectile(
      this.scene,
      this.owner.x + direction * 20,
      this.owner.y - 5,
      direction
    );

    this.projectiles.push(projectile);

    // Play fire sound
    this.playFireSound();

    // Recoil effect on weapon sprite
    if (this.weaponSprite) {
      this.scene.tweens.add({
        targets: this.weaponSprite,
        x: this.weaponSprite.x - direction * 5,
        duration: 50,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }

    return projectile;
  }

  private playFireSound(): void {
    const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Squelchy mayo squirt sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);

      // Add a "splurt" noise component
      const noise = ctx.createOscillator();
      const noiseGain = ctx.createGain();
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.type = 'square';
      noise.frequency.setValueAtTime(100, ctx.currentTime);
      noise.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.08);

      noiseGain.gain.setValueAtTime(0.1, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + 0.08);
    }
  }

  getProjectiles(): MayoProjectile[] {
    return this.projectiles;
  }

  getAmmo(): number {
    return this.ammo;
  }

  isEquipped(): boolean {
    return this.equipped;
  }

  destroy(): void {
    this.weaponSprite?.destroy();
    this.projectiles.forEach((proj) => proj.destroy());
    this.projectiles = [];
  }
}
