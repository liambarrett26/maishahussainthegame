import Phaser from 'phaser';
import { SaveManager } from './SaveManager';
import { LEVELS } from './Constants';

// Music track keys mapped to level IDs
const LEVEL_MUSIC: Record<string, string> = {
  [LEVELS.WORTHING]: 'music-worthing',
  [LEVELS.BRIGHTON]: 'music-brighton',
  [LEVELS.VARNDEAN]: 'music-varndean',
  [LEVELS.UCL]: 'music-ucl',
  [LEVELS.CIVIL_SERVICE]: 'music-civil-service',
};

export class MusicManager {
  private static currentMusic: Phaser.Sound.BaseSound | null = null;
  private static currentKey: string = '';

  /**
   * Play music for a specific track key
   * @param scene The current scene
   * @param key The music key (e.g., 'music-menu', 'music-boss')
   * @param config Optional sound config
   */
  static play(scene: Phaser.Scene, key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    // Don't restart if already playing the same track
    if (this.currentKey === key && this.currentMusic?.isPlaying) {
      return;
    }

    // Stop current music
    this.stop();

    // Check if muted
    const isMuted = SaveManager.isMuted();

    // Default config for background music
    const defaultConfig: Phaser.Types.Sound.SoundConfig = {
      loop: true,
      volume: isMuted ? 0 : 0.4,
      ...config,
    };

    // Play new music
    this.currentMusic = scene.sound.add(key, defaultConfig);
    this.currentMusic.play();
    this.currentKey = key;
  }

  /**
   * Play music for a specific level
   * @param scene The current scene
   * @param levelId The level ID from Constants.LEVELS
   */
  static playForLevel(scene: Phaser.Scene, levelId: string): void {
    const musicKey = LEVEL_MUSIC[levelId];
    if (musicKey) {
      this.play(scene, musicKey);
    }
  }

  /**
   * Play menu music
   */
  static playMenu(scene: Phaser.Scene): void {
    this.play(scene, 'music-menu');
  }

  /**
   * Play credits music
   */
  static playCredits(scene: Phaser.Scene): void {
    this.play(scene, 'music-credits');
  }

  /**
   * Play boss battle music
   */
  static playBoss(scene: Phaser.Scene): void {
    this.play(scene, 'music-boss', { volume: 0.5 });
  }

  /**
   * Play exam music
   */
  static playExam(scene: Phaser.Scene): void {
    this.play(scene, 'music-exam');
  }

  /**
   * Stop current music
   */
  static stop(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
      this.currentKey = '';
    }
  }

  /**
   * Fade out current music
   * @param scene The current scene
   * @param duration Fade duration in ms
   */
  static fadeOut(scene: Phaser.Scene, duration: number = 500): void {
    if (this.currentMusic && 'volume' in this.currentMusic) {
      scene.tweens.add({
        targets: this.currentMusic,
        volume: 0,
        duration,
        onComplete: () => {
          this.stop();
        },
      });
    } else {
      this.stop();
    }
  }

  /**
   * Set music volume (respects mute state)
   * @param volume Volume level (0-1)
   */
  static setVolume(volume: number): void {
    if (this.currentMusic && 'setVolume' in this.currentMusic) {
      const isMuted = SaveManager.isMuted();
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(isMuted ? 0 : volume);
    }
  }

  /**
   * Update mute state for current music
   */
  static updateMuteState(): void {
    const isMuted = SaveManager.isMuted();
    if (this.currentMusic && 'setVolume' in this.currentMusic) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(isMuted ? 0 : 0.4);
    }
  }

  /**
   * Check if music is currently playing
   */
  static isPlaying(): boolean {
    return this.currentMusic?.isPlaying ?? false;
  }

  /**
   * Get the current music key
   */
  static getCurrentKey(): string {
    return this.currentKey;
  }
}
