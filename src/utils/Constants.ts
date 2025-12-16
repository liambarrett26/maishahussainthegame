// Game dimensions
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;

// Tile size
export const TILE_SIZE = 32;

// Player constants
export const PLAYER_SPEED = 192; // 6 tiles/second * 32 pixels
export const PLAYER_JUMP_VELOCITY = -350;
export const PLAYER_MAX_HEALTH = 3;
export const COYOTE_TIME = 100; // ms
export const JUMP_BUFFER_TIME = 100; // ms
export const INVINCIBILITY_DURATION = 1500; // ms

// Scene keys
export const SCENES = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
  PAUSE: 'PauseScene',
  CREDITS: 'CreditsScene',
  BOSS_BATTLE: 'BossBattleScene',
  EXAM: 'ExamScene',
} as const;

// Level IDs
export const LEVELS = {
  WORTHING: 'worthing',
  BRIGHTON: 'brighton',
  VARNDEAN: 'varndean',
  UCL: 'ucl',
  CIVIL_SERVICE: 'civil-service',
} as const;

// Save key
export const SAVE_KEY = 'maishas-adventure-save';
