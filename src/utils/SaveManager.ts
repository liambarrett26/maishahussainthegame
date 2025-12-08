import { SAVE_KEY, LEVELS } from './Constants';

// Persistent player state - survives across levels
export interface PlayerState {
  hasBat: boolean;
  collectedFriends: string[]; // ['liam', 'beth_twine', 'eliza', 'beth_levy']
  baseMaxHealth: number; // Starts at 3, increases with friends
}

export interface SaveData {
  version: string;
  currentLevel: string;
  checkpointId: string | null;
  mayoCollected: Record<string, string[]>;
  totalMayo: number;
  bestTimes: Record<string, number>;
  playerState: PlayerState;
  settings: {
    musicVolume: number;
    sfxVolume: number;
  };
}

export const DEFAULT_PLAYER_STATE: PlayerState = {
  hasBat: false,
  collectedFriends: [],
  baseMaxHealth: 3,
};

const DEFAULT_SAVE: SaveData = {
  version: '1.0.0',
  currentLevel: LEVELS.WORTHING,
  checkpointId: null,
  mayoCollected: {},
  totalMayo: 0,
  bestTimes: {},
  playerState: { ...DEFAULT_PLAYER_STATE },
  settings: {
    musicVolume: 0.7,
    sfxVolume: 1.0,
  },
};

export class SaveManager {
  static save(data: Partial<SaveData>): void {
    const current = this.load();
    const merged = { ...current, ...data };
    localStorage.setItem(SAVE_KEY, JSON.stringify(merged));
  }

  static load(): SaveData {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return { ...DEFAULT_SAVE };
    }
    try {
      return { ...DEFAULT_SAVE, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SAVE };
    }
  }

  static hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  static clear(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  static collectMayo(levelId: string, mayoId: string): void {
    const data = this.load();
    if (!data.mayoCollected[levelId]) {
      data.mayoCollected[levelId] = [];
    }
    if (!data.mayoCollected[levelId].includes(mayoId)) {
      data.mayoCollected[levelId].push(mayoId);
      data.totalMayo += 1;
    }
    this.save(data);
  }

  static setCheckpoint(levelId: string, checkpointId: string): void {
    this.save({ currentLevel: levelId, checkpointId });
  }

  static updateBestTime(levelId: string, timeMs: number): void {
    const data = this.load();
    if (!data.bestTimes[levelId] || timeMs < data.bestTimes[levelId]) {
      data.bestTimes[levelId] = timeMs;
      this.save(data);
    }
  }

  // Player state methods
  static getPlayerState(): PlayerState {
    const data = this.load();
    return data.playerState || { ...DEFAULT_PLAYER_STATE };
  }

  static hasBat(): boolean {
    return this.getPlayerState().hasBat;
  }

  static collectBat(): void {
    const data = this.load();
    if (!data.playerState) {
      data.playerState = { ...DEFAULT_PLAYER_STATE };
    }
    data.playerState.hasBat = true;
    this.save(data);
  }

  static collectFriend(friendId: string): void {
    const data = this.load();
    if (!data.playerState) {
      data.playerState = { ...DEFAULT_PLAYER_STATE };
    }
    if (!data.playerState.collectedFriends.includes(friendId)) {
      data.playerState.collectedFriends.push(friendId);
      data.playerState.baseMaxHealth += 1; // +1 HP per friend
      this.save(data);
    }
  }

  static getCollectedFriends(): string[] {
    return this.getPlayerState().collectedFriends;
  }

  static hasFriend(friendId: string): boolean {
    return this.getCollectedFriends().includes(friendId);
  }

  static getMaxHealth(): number {
    return this.getPlayerState().baseMaxHealth;
  }
}
