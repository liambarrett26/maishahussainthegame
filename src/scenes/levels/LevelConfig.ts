import { LEVELS } from '../../utils/Constants';

export interface PlatformConfig {
  x: number;
  y: number;
  width: number;
  type?: 'ground' | 'platform' | 'moving';
  moveDistance?: number;
  moveSpeed?: number;
}

export interface MayoConfig {
  x: number;
  y: number;
  id: string;
}

export interface WaspConfig {
  x: number;
  y: number;
  patrolDistance?: number;
}

export interface SeagullConfig {
  x: number;
  y: number;
  circleRadius?: number;
  detectRange?: number;
}

export interface CheckpointConfig {
  x: number;
  y: number;
  id: string;
}

export interface DecorationConfig {
  x: number;
  y: number;
  type: 'flower' | 'grass' | 'rock' | 'shell' | 'beachball';
}

export interface BatConfig {
  x: number;
  y: number;
  id: string;
}

export interface NPCFriendConfig {
  x: number;
  y: number;
  id: string; // 'liam', 'beth_twine', 'eliza', 'beth_levy'
}

export interface LevelData {
  id: string;
  name: string;
  width: number;
  height: number;
  playerStart: { x: number; y: number };
  background: {
    skyTop: number;
    skyBottom: number;
    hasWater?: boolean;
    hasClouds?: boolean;
  };
  groundColor: number;
  platforms: PlatformConfig[];
  mayoJars: MayoConfig[];
  wasps: WaspConfig[];
  seagulls: SeagullConfig[];
  checkpoints: CheckpointConfig[];
  decorations: DecorationConfig[];
  bats: BatConfig[];
  friends: NPCFriendConfig[];
  endX: number;
  nextLevel?: string;
}

// Worthing Level - Seaside childhood
export const WORTHING_LEVEL: LevelData = {
  id: LEVELS.WORTHING,
  name: 'Worthing',
  width: 2400,
  height: 270,
  playerStart: { x: 50, y: 180 },
  background: {
    skyTop: 0xffd89b,
    skyBottom: 0xff6b6b,
    hasWater: true,
    hasClouds: true,
  },
  groundColor: 0xf4d03f,
  platforms: [
    // Main ground
    { x: 0, y: 238, width: 400, type: 'ground' },
    { x: 450, y: 238, width: 200, type: 'ground' },
    { x: 700, y: 238, width: 300, type: 'ground' },
    { x: 1050, y: 238, width: 250, type: 'ground' },
    { x: 1350, y: 238, width: 400, type: 'ground' },
    { x: 1800, y: 238, width: 600, type: 'ground' },

    // Elevated platforms
    { x: 150, y: 180, width: 60, type: 'platform' },
    { x: 280, y: 150, width: 50, type: 'platform' },
    { x: 500, y: 170, width: 70, type: 'platform' },
    { x: 620, y: 130, width: 50, type: 'platform' },
    { x: 750, y: 160, width: 80, type: 'platform' },
    { x: 900, y: 120, width: 60, type: 'platform' },
    { x: 1100, y: 170, width: 70, type: 'platform' },
    { x: 1250, y: 140, width: 50, type: 'platform' },
    { x: 1450, y: 180, width: 80, type: 'platform' },
    { x: 1600, y: 150, width: 60, type: 'platform' },
    { x: 1750, y: 120, width: 50, type: 'platform' },
    { x: 1900, y: 160, width: 70, type: 'platform' },
    { x: 2050, y: 130, width: 60, type: 'platform' },
    { x: 2200, y: 100, width: 80, type: 'platform' },

    // Moving platforms
    { x: 400, y: 180, width: 50, type: 'moving', moveDistance: 40, moveSpeed: 1500 },
    { x: 1000, y: 160, width: 50, type: 'moving', moveDistance: 50, moveSpeed: 2000 },
    { x: 1700, y: 140, width: 50, type: 'moving', moveDistance: 60, moveSpeed: 1800 },
  ],
  mayoJars: [
    { x: 150, y: 150, id: 'mayo_1' },
    { x: 280, y: 120, id: 'mayo_2' },
    { x: 500, y: 140, id: 'mayo_3' },
    { x: 750, y: 130, id: 'mayo_4' },
    { x: 900, y: 90, id: 'mayo_5' },
    { x: 1100, y: 140, id: 'mayo_6' },
    { x: 1250, y: 110, id: 'mayo_7' },
    { x: 1450, y: 150, id: 'mayo_8' },
    { x: 1600, y: 120, id: 'mayo_9' },
    { x: 1900, y: 130, id: 'mayo_10' },
    { x: 2050, y: 100, id: 'mayo_11' },
    { x: 2200, y: 70, id: 'mayo_12' },
    // Hidden mayo jars
    { x: 620, y: 100, id: 'mayo_h1' },
    { x: 1750, y: 90, id: 'mayo_h2' },
    { x: 2300, y: 200, id: 'mayo_h3' },
  ],
  wasps: [
    // Early section
    { x: 350, y: 160, patrolDistance: 60 },
    // Mid section
    { x: 780, y: 170, patrolDistance: 50 },
    { x: 1050, y: 160, patrolDistance: 55 },
    // Late section
    { x: 1550, y: 130, patrolDistance: 50 },
    { x: 1850, y: 140, patrolDistance: 60 },
    { x: 2100, y: 110, patrolDistance: 50 },
  ],
  seagulls: [
    { x: 600, y: 60, circleRadius: 70, detectRange: 130 },
    { x: 1300, y: 50, circleRadius: 60, detectRange: 120 },
    { x: 2000, y: 55, circleRadius: 65, detectRange: 125 },
  ],
  checkpoints: [
    // Moved away from nearby wasp at x=780
    { x: 850, y: 238, id: 'cp_1' },
    { x: 1500, y: 238, id: 'cp_2' },
  ],
  decorations: [
    { x: 80, y: 238, type: 'shell' },
    { x: 200, y: 238, type: 'beachball' },
    { x: 350, y: 238, type: 'shell' },
    { x: 550, y: 238, type: 'rock' },
    { x: 800, y: 238, type: 'beachball' },
    { x: 1000, y: 238, type: 'shell' },
    { x: 1200, y: 238, type: 'rock' },
    { x: 1500, y: 238, type: 'beachball' },
    { x: 1700, y: 238, type: 'shell' },
    { x: 2000, y: 238, type: 'rock' },
  ],
  bats: [], // No bat in Worthing - first appears in Brighton
  friends: [], // No friends in Worthing
  endX: 2350,
  nextLevel: LEVELS.BRIGHTON,
};

// Brighton Level - Urban seaside chaos
export const BRIGHTON_LEVEL: LevelData = {
  id: LEVELS.BRIGHTON,
  name: 'Brighton',
  width: 2800,
  height: 270,
  playerStart: { x: 50, y: 180 },
  background: {
    skyTop: 0x87ceeb,
    skyBottom: 0x4a90d9,
    hasWater: true,
    hasClouds: true,
  },
  groundColor: 0x808080, // Concrete/pier color
  platforms: [
    // Main ground sections (pier style)
    { x: 0, y: 238, width: 300, type: 'ground' },
    { x: 350, y: 238, width: 250, type: 'ground' },
    { x: 650, y: 238, width: 200, type: 'ground' },
    { x: 900, y: 238, width: 300, type: 'ground' },
    { x: 1250, y: 238, width: 200, type: 'ground' },
    { x: 1500, y: 238, width: 350, type: 'ground' },
    { x: 1900, y: 238, width: 250, type: 'ground' },
    { x: 2200, y: 238, width: 600, type: 'ground' },

    // Vertical climbing section (The Lanes)
    { x: 100, y: 190, width: 50, type: 'platform' },
    { x: 180, y: 150, width: 50, type: 'platform' },
    { x: 260, y: 110, width: 50, type: 'platform' },

    // Pier platforms
    { x: 400, y: 180, width: 60, type: 'platform' },
    { x: 500, y: 140, width: 60, type: 'platform' },
    { x: 580, y: 100, width: 50, type: 'platform' },

    // Rooftop section
    { x: 700, y: 160, width: 80, type: 'platform' },
    { x: 850, y: 120, width: 70, type: 'platform' },
    { x: 1000, y: 80, width: 60, type: 'platform' },

    // Mid section platforms
    { x: 1100, y: 170, width: 70, type: 'platform' },
    { x: 1200, y: 130, width: 60, type: 'platform' },
    { x: 1350, y: 160, width: 80, type: 'platform' },
    { x: 1500, y: 120, width: 70, type: 'platform' },
    { x: 1650, y: 80, width: 60, type: 'platform' },

    // Carousel section (moving platforms)
    { x: 1800, y: 180, width: 50, type: 'moving', moveDistance: 50, moveSpeed: 1500 },
    { x: 1900, y: 140, width: 50, type: 'moving', moveDistance: 60, moveSpeed: 1800 },
    { x: 2000, y: 100, width: 50, type: 'moving', moveDistance: 40, moveSpeed: 1200 },

    // Final stretch
    { x: 2100, y: 160, width: 60, type: 'platform' },
    { x: 2300, y: 180, width: 80, type: 'platform' },
    { x: 2500, y: 150, width: 70, type: 'platform' },
    { x: 2650, y: 120, width: 80, type: 'platform' },
  ],
  mayoJars: [
    { x: 100, y: 160, id: 'b_mayo_1' },
    { x: 180, y: 120, id: 'b_mayo_2' },
    { x: 260, y: 80, id: 'b_mayo_3' },
    { x: 500, y: 110, id: 'b_mayo_4' },
    { x: 700, y: 130, id: 'b_mayo_5' },
    { x: 850, y: 90, id: 'b_mayo_6' },
    { x: 1000, y: 50, id: 'b_mayo_7' },
    { x: 1200, y: 100, id: 'b_mayo_8' },
    { x: 1500, y: 90, id: 'b_mayo_9' },
    { x: 1650, y: 50, id: 'b_mayo_10' },
    { x: 1900, y: 110, id: 'b_mayo_11' },
    { x: 2100, y: 130, id: 'b_mayo_12' },
    { x: 2300, y: 150, id: 'b_mayo_13' },
    { x: 2500, y: 120, id: 'b_mayo_14' },
    { x: 2650, y: 90, id: 'b_mayo_15' },
    // Hidden mayo
    { x: 580, y: 70, id: 'b_mayo_h1' },
    { x: 1350, y: 130, id: 'b_mayo_h2' },
    { x: 2750, y: 200, id: 'b_mayo_h3' },
  ],
  wasps: [
    // The Lanes section
    { x: 300, y: 150, patrolDistance: 50 },
    // Pier section
    { x: 550, y: 120, patrolDistance: 60 },
    // Rooftop section
    { x: 920, y: 130, patrolDistance: 55 },
    // Mid section
    { x: 1300, y: 140, patrolDistance: 50 },
    { x: 1550, y: 150, patrolDistance: 55 },
    // Carousel section
    { x: 1880, y: 160, patrolDistance: 45 },
    // Final stretch
    { x: 2200, y: 170, patrolDistance: 50 },
    { x: 2580, y: 150, patrolDistance: 55 },
  ],
  seagulls: [
    { x: 450, y: 50, circleRadius: 80, detectRange: 140 },
    { x: 1100, y: 45, circleRadius: 70, detectRange: 130 },
    { x: 1900, y: 55, circleRadius: 75, detectRange: 135 },
    { x: 2550, y: 50, circleRadius: 65, detectRange: 125 },
  ],
  checkpoints: [
    // Moved away from wasp at x=920, and cp_2 moved from gap edge at 1850
    { x: 1000, y: 238, id: 'b_cp_1' },
    { x: 1700, y: 238, id: 'b_cp_2' },
  ],
  decorations: [
    { x: 120, y: 238, type: 'rock' },
    { x: 250, y: 238, type: 'flower' },
    { x: 450, y: 238, type: 'rock' },
    { x: 700, y: 238, type: 'flower' },
    { x: 950, y: 238, type: 'rock' },
    { x: 1150, y: 238, type: 'flower' },
    { x: 1400, y: 238, type: 'rock' },
    { x: 1600, y: 238, type: 'flower' },
    { x: 1950, y: 238, type: 'rock' },
    { x: 2300, y: 238, type: 'flower' },
    { x: 2550, y: 238, type: 'rock' },
  ],
  bats: [
    // Bat on rooftop section
    { x: 850, y: 90, id: 'b_bat_1' },
  ],
  friends: [], // No friends in Brighton
  endX: 2750,
  nextLevel: LEVELS.VARNDEAN,
};

// Varndean School Level - Academic challenge with boss
export const VARNDEAN_LEVEL: LevelData = {
  id: LEVELS.VARNDEAN,
  name: 'Varndean School',
  width: 2400,
  height: 270,
  playerStart: { x: 80, y: 180 },
  background: {
    skyTop: 0xd4c4a8, // Indoor beige/cream wall color
    skyBottom: 0xc4b498,
    hasWater: false,
    hasClouds: false, // No clouds indoors
  },
  groundColor: 0x556b2f, // Grass/playing field green
  platforms: [
    // === SCHOOL ENTRANCE & CORRIDOR (0-500) ===
    { x: 0, y: 238, width: 500, type: 'ground' },
    // Entrance steps
    { x: 120, y: 210, width: 40, type: 'platform' },
    // Lockers (stepped)
    { x: 200, y: 180, width: 50, type: 'platform' },
    { x: 280, y: 150, width: 50, type: 'platform' },
    { x: 360, y: 120, width: 50, type: 'platform' },
    // Trophy cabinet
    { x: 440, y: 170, width: 40, type: 'platform' },

    // === CLASSROOM SECTION (550-950) ===
    { x: 550, y: 238, width: 400, type: 'ground' },
    // Student desks (rows)
    { x: 580, y: 200, width: 60, type: 'platform' },
    { x: 680, y: 200, width: 60, type: 'platform' },
    { x: 780, y: 200, width: 60, type: 'platform' },
    // Teacher's desk (raised)
    { x: 620, y: 140, width: 80, type: 'platform' },
    // Bookshelf climbing
    { x: 850, y: 160, width: 50, type: 'platform' },
    { x: 880, y: 110, width: 50, type: 'platform' },

    // === LIBRARY (1000-1400) ===
    { x: 1000, y: 238, width: 400, type: 'ground' },
    // Bookshelves (stacked)
    { x: 1020, y: 180, width: 70, type: 'platform' },
    { x: 1020, y: 130, width: 70, type: 'platform' },
    { x: 1120, y: 160, width: 60, type: 'platform' },
    { x: 1200, y: 140, width: 70, type: 'platform' },
    { x: 1200, y: 90, width: 70, type: 'platform' },
    // Reading nook
    { x: 1300, y: 170, width: 80, type: 'platform' },
    // Moving ladder
    { x: 1150, y: 100, width: 40, type: 'moving', moveDistance: 50, moveSpeed: 2000 },

    // === PLAYING FIELD (1450-1900) ===
    { x: 1450, y: 238, width: 450, type: 'ground' },
    // Bleachers (stepped seating)
    { x: 1480, y: 200, width: 80, type: 'platform' },
    { x: 1480, y: 160, width: 70, type: 'platform' },
    { x: 1480, y: 120, width: 60, type: 'platform' },
    // Goal post crossbar
    { x: 1650, y: 140, width: 100, type: 'platform' },
    // Equipment shed
    { x: 1800, y: 180, width: 70, type: 'platform' },
    { x: 1800, y: 130, width: 70, type: 'platform' },

    // === SCHOOL EXIT (1950-2400) ===
    { x: 1950, y: 238, width: 450, type: 'ground' },
    // Final corridor platforms
    { x: 2000, y: 180, width: 60, type: 'platform' },
    { x: 2100, y: 150, width: 60, type: 'platform' },
    { x: 2200, y: 120, width: 80, type: 'platform' },
    // Exit stairs
    { x: 2300, y: 200, width: 50, type: 'platform' },
  ],
  mayoJars: [
    // Corridor section
    { x: 200, y: 150, id: 'v_mayo_1' },
    { x: 280, y: 120, id: 'v_mayo_2' },
    { x: 360, y: 90, id: 'v_mayo_3' },
    // Classroom
    { x: 620, y: 110, id: 'v_mayo_4' },
    { x: 880, y: 80, id: 'v_mayo_5' },
    // Library
    { x: 1020, y: 100, id: 'v_mayo_6' },
    { x: 1200, y: 60, id: 'v_mayo_7' },
    { x: 1300, y: 140, id: 'v_mayo_8' },
    // Playing field
    { x: 1480, y: 90, id: 'v_mayo_9' },
    { x: 1700, y: 110, id: 'v_mayo_10' },
    { x: 1800, y: 100, id: 'v_mayo_11' },
    // Exit corridor
    { x: 2100, y: 120, id: 'v_mayo_12' },
    { x: 2200, y: 90, id: 'v_mayo_13' },
    // Hidden
    { x: 440, y: 140, id: 'v_mayo_h1' },
    { x: 1150, y: 70, id: 'v_mayo_h2' },
    { x: 2350, y: 200, id: 'v_mayo_h3' },
  ],
  wasps: [
    // Corridor
    { x: 300, y: 140, patrolDistance: 50 },
    // Classroom
    { x: 720, y: 160, patrolDistance: 60 },
    // Library
    { x: 1100, y: 120, patrolDistance: 50 },
    { x: 1250, y: 110, patrolDistance: 55 },
    // Playing field
    { x: 1600, y: 120, patrolDistance: 70 },
    // Exit
    { x: 2150, y: 130, patrolDistance: 50 },
  ],
  seagulls: [
    // One seagull over the playing field (outdoor area)
    { x: 1700, y: 50, circleRadius: 60, detectRange: 120 },
  ],
  checkpoints: [
    // Moved away from gap edges and enemies
    { x: 400, y: 238, id: 'v_cp_1' },    // Corridor - away from gap at 500
    { x: 750, y: 238, id: 'v_cp_2' },    // Classroom - mid-section
    { x: 1250, y: 238, id: 'v_cp_3' },   // Library - away from gap at 1400
    { x: 1700, y: 238, id: 'v_cp_4' },   // Playing field - center
  ],
  decorations: [
    // These will be supplemented by school structures in GameScene
    { x: 80, y: 238, type: 'flower' },
    { x: 500, y: 238, type: 'flower' },
    { x: 1000, y: 238, type: 'flower' },
    { x: 1450, y: 238, type: 'flower' },
    { x: 1950, y: 238, type: 'flower' },
  ],
  bats: [
    // Bat in the library - between the bookshelves
    { x: 1150, y: 80, id: 'v_bat_1' },
    // Bat in equipment shed
    { x: 1830, y: 100, id: 'v_bat_2' },
  ],
  friends: [
    // Liam - in the corridor by the lockers
    { x: 350, y: 210, id: 'liam' },
    // Beth Twine - in the classroom, on the teacher's desk platform
    { x: 650, y: 130, id: 'beth_twine' },
    // Eliza - in the library, by the bookshelves
    { x: 1250, y: 130, id: 'eliza' },
    // Sean - near exit, gives chemistry advice before boss battle
    { x: 2200, y: 210, id: 'sean' },
  ],
  endX: 2350,
  nextLevel: undefined, // End of game for now
};

export const LEVEL_DATA: Record<string, LevelData> = {
  [LEVELS.WORTHING]: WORTHING_LEVEL,
  [LEVELS.BRIGHTON]: BRIGHTON_LEVEL,
  [LEVELS.VARNDEAN]: VARNDEAN_LEVEL,
};
