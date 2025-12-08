import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, LEVELS } from '../utils/Constants';
import { SaveManager } from '../utils/SaveManager';
import { Player } from '../objects/Player';
import { HUD } from '../ui/HUD';
import { MayoJar } from '../objects/collectibles/MayoJar';
import { Checkpoint } from '../objects/collectibles/Checkpoint';
import { Bat } from '../objects/collectibles/Bat';
import { Wasp } from '../objects/enemies/Wasp';
import { Seagull } from '../objects/enemies/Seagull';
import { NPCFriend, NPC_FRIENDS } from '../objects/npcs/NPCFriend';
import { LevelData, LEVEL_DATA, PlatformConfig } from './levels/LevelConfig';

interface MovingPlatformData {
  platform: Phaser.GameObjects.Rectangle;
  highlight: Phaser.GameObjects.Rectangle;
  startY: number;
  endY: number;
  speed: number;
  direction: number;
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private hud!: HUD;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatformData: MovingPlatformData[] = [];
  private mayoJars: MayoJar[] = [];
  private bats: Bat[] = [];
  private wasps: Wasp[] = [];
  private seagulls: Seagull[] = [];
  private checkpoints: Checkpoint[] = [];
  private friends: NPCFriend[] = [];
  private followingFriends: NPCFriend[] = [];

  private currentLevel!: LevelData;
  private levelComplete: boolean = false;
  private levelStartTime: number = 0;
  private introPlaying: boolean = false;

  constructor() {
    super({ key: SCENES.GAME });
  }

  init(): void {
    this.levelComplete = false;
    this.introPlaying = false;
    this.mayoJars = [];
    this.bats = [];
    this.wasps = [];
    this.seagulls = [];
    this.checkpoints = [];
    this.friends = [];
    this.followingFriends = [];
    this.movingPlatformData = [];
  }

  create(): void {
    // Load current level from save or default to Worthing
    const saveData = SaveManager.load();
    const levelId = saveData.currentLevel || LEVELS.WORTHING;
    this.currentLevel = LEVEL_DATA[levelId] || LEVEL_DATA[LEVELS.WORTHING];

    // Set up world bounds
    this.physics.world.setBounds(0, 0, this.currentLevel.width, this.currentLevel.height);

    // Create background
    this.createBackground();

    // Create level elements
    this.createPlatforms();
    this.createDecorations();

    // Create level-specific structures
    if (this.currentLevel.id === LEVELS.WORTHING) {
      this.createStartHouse();
      this.createTrainStation();
    } else if (this.currentLevel.id === LEVELS.BRIGHTON) {
      this.createBrightonStation();
      this.createBusStop();
      this.createBrightonPier();
    } else if (this.currentLevel.id === LEVELS.VARNDEAN) {
      this.createSchoolEntrance();
      this.createClassroom();
      this.createLibrary();
      this.createPlayingField();
      this.createSchoolExit();
    }

    this.createMayoJars();
    this.createBats();
    this.createFriends();
    this.createCheckpoints();
    this.createWasps();
    this.createSeagulls();

    // Create player
    const spawnPoint = this.getSpawnPoint();
    this.player = new Player(this, spawnPoint.x, spawnPoint.y);

    // Set player max health based on collected friends
    this.player.setMaxHealth(SaveManager.getMaxHealth());

    // Equip bat if player already has it from previous levels
    if (SaveManager.hasBat()) {
      this.player.equipBat();
    }

    // Set follow target for previously collected friends
    this.followingFriends.forEach((friend, index) => {
      friend.setFollowTarget(this.player, index);
    });

    // Play level-specific intro
    if (!saveData.checkpointId) {
      if (this.currentLevel.id === LEVELS.WORTHING) {
        this.playHouseIntro();
      } else if (this.currentLevel.id === LEVELS.BRIGHTON) {
        this.playTrainArrival();
      } else {
        this.cameras.main.fadeIn(500, 0, 0, 0);
      }
    } else {
      this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    // Set up camera
    this.cameras.main.setBounds(0, 0, this.currentLevel.width, this.currentLevel.height);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(40, 20);

    // Create HUD
    this.hud = new HUD(this, this.player.maxHealth);

    // Set up collisions
    this.setupCollisions();

    // Set up input
    this.setupInput();

    // Create level name display
    this.showLevelName();

    // Track level start time
    this.levelStartTime = this.time.now;
  }

  private getSpawnPoint(): Phaser.Math.Vector2 {
    const saveData = SaveManager.load();

    // Check for checkpoint
    if (saveData.checkpointId) {
      const checkpoint = this.checkpoints.find((cp) => cp.checkpointId === saveData.checkpointId);
      if (checkpoint) {
        return checkpoint.getSpawnPoint();
      }
    }

    return new Phaser.Math.Vector2(
      this.currentLevel.playerStart.x,
      this.currentLevel.playerStart.y
    );
  }

  private createStartHouse(): void {
    const houseX = 20;
    const houseY = 238;

    const house = this.add.graphics();

    // House body
    house.fillStyle(0xc0392b, 1);
    house.fillRect(houseX, houseY - 60, 50, 60);

    // Roof
    house.fillStyle(0x7f1d1d, 1);
    house.beginPath();
    house.moveTo(houseX - 5, houseY - 60);
    house.lineTo(houseX + 25, houseY - 85);
    house.lineTo(houseX + 55, houseY - 60);
    house.closePath();
    house.fillPath();

    // Door
    house.fillStyle(0x8b4513, 1);
    house.fillRect(houseX + 18, houseY - 35, 14, 35);

    // Door handle
    house.fillStyle(0xffd700, 1);
    house.fillCircle(houseX + 28, houseY - 18, 2);

    // Window
    house.fillStyle(0x87ceeb, 1);
    house.fillRect(houseX + 8, houseY - 50, 12, 10);
    house.fillRect(houseX + 30, houseY - 50, 12, 10);

    // Window frames
    house.lineStyle(1, 0x333333);
    house.strokeRect(houseX + 8, houseY - 50, 12, 10);
    house.strokeRect(houseX + 30, houseY - 50, 12, 10);

    house.setDepth(1);
  }

  private createTrainStation(): void {
    const stationX = this.currentLevel.endX - 100;
    const stationY = 238;

    const station = this.add.graphics();

    // Platform
    station.fillStyle(0x555555, 1);
    station.fillRect(stationX - 20, stationY - 5, 140, 8);

    // Station building
    station.fillStyle(0xd4a574, 1);
    station.fillRect(stationX, stationY - 70, 80, 65);

    // Roof
    station.fillStyle(0x704214, 1);
    station.fillRect(stationX - 5, stationY - 75, 90, 8);

    // Sign
    station.fillStyle(0x1a5f7a, 1);
    station.fillRect(stationX + 10, stationY - 65, 60, 15);

    // Windows
    station.fillStyle(0x87ceeb, 1);
    station.fillRect(stationX + 10, stationY - 45, 15, 20);
    station.fillRect(stationX + 55, stationY - 45, 15, 20);

    // Door
    station.fillStyle(0x333333, 1);
    station.fillRect(stationX + 32, stationY - 40, 16, 35);

    station.setDepth(1);

    // Sign text
    const signText = this.add.text(stationX + 40, stationY - 58, 'WORTHING', {
      fontSize: '6px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    signText.setOrigin(0.5);
    signText.setDepth(2);
  }

  private playHouseIntro(): void {
    this.introPlaying = true;

    // Fade in immediately so screen isn't black
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Hide player initially
    this.player.setAlpha(0);
    this.player.setPosition(45, this.currentLevel.playerStart.y);

    // Camera focuses on house
    this.cameras.main.stopFollow();
    this.cameras.main.pan(60, GAME_HEIGHT / 2, 500);

    this.time.delayedCall(800, () => {
      // Player appears from door
      this.player.setAlpha(1);

      this.tweens.add({
        targets: this.player,
        x: this.currentLevel.playerStart.x,
        duration: 600,
        ease: 'Quad.easeOut',
        onStart: () => {
          this.player.play('maisha-run');
          this.player.setFlipX(false);
        },
        onComplete: () => {
          this.player.play('maisha-idle');
          this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
          this.introPlaying = false;
        },
      });
    });
  }

  // Brighton level structures
  private createBrightonStation(): void {
    const stationX = 10;
    const stationY = 238;

    const station = this.add.graphics();

    // Platform
    station.fillStyle(0x555555, 1);
    station.fillRect(stationX - 10, stationY - 5, 120, 8);

    // Station building (Victorian style)
    station.fillStyle(0xd4a574, 1);
    station.fillRect(stationX, stationY - 80, 100, 75);

    // Arched roof
    station.fillStyle(0x704214, 1);
    station.fillRect(stationX - 5, stationY - 85, 110, 8);

    // Clock tower
    station.fillStyle(0xd4a574, 1);
    station.fillRect(stationX + 40, stationY - 110, 20, 30);
    station.fillStyle(0x704214, 1);
    station.beginPath();
    station.moveTo(stationX + 40, stationY - 110);
    station.lineTo(stationX + 50, stationY - 125);
    station.lineTo(stationX + 60, stationY - 110);
    station.closePath();
    station.fillPath();

    // Clock face
    station.fillStyle(0xffffff, 1);
    station.fillCircle(stationX + 50, stationY - 100, 6);
    station.fillStyle(0x000000, 1);
    station.fillCircle(stationX + 50, stationY - 100, 1);

    // Sign
    station.fillStyle(0x1a5f7a, 1);
    station.fillRect(stationX + 15, stationY - 75, 70, 15);

    // Arched windows
    station.fillStyle(0x87ceeb, 1);
    station.fillRect(stationX + 10, stationY - 55, 20, 25);
    station.fillRect(stationX + 70, stationY - 55, 20, 25);

    // Main entrance
    station.fillStyle(0x333333, 1);
    station.fillRect(stationX + 38, stationY - 50, 24, 45);

    station.setDepth(1);

    // Sign text
    const signText = this.add.text(stationX + 50, stationY - 68, 'BRIGHTON', {
      fontSize: '7px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    signText.setOrigin(0.5);
    signText.setDepth(2);
  }

  private createBusStop(): void {
    const busStopX = this.currentLevel.endX - 80;
    const busStopY = 238;

    const busStop = this.add.graphics();

    // Bus shelter
    busStop.fillStyle(0x2c3e50, 1);
    busStop.fillRect(busStopX, busStopY - 50, 60, 50);

    // Shelter roof
    busStop.fillStyle(0x1a252f, 1);
    busStop.fillRect(busStopX - 5, busStopY - 55, 70, 8);

    // Glass panels
    busStop.fillStyle(0x87ceeb, 0.5);
    busStop.fillRect(busStopX + 5, busStopY - 45, 20, 35);
    busStop.fillRect(busStopX + 35, busStopY - 45, 20, 35);

    // Bus sign pole
    busStop.fillStyle(0x7f8c8d, 1);
    busStop.fillRect(busStopX + 65, busStopY - 60, 4, 60);

    // Bus sign
    busStop.fillStyle(0xe74c3c, 1);
    busStop.fillRoundedRect(busStopX + 58, busStopY - 70, 18, 15, 2);

    busStop.setDepth(1);

    // Bus number
    const busNumber = this.add.text(busStopX + 67, busStopY - 63, '25', {
      fontSize: '8px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    busNumber.setOrigin(0.5);
    busNumber.setDepth(2);

    // Destination sign
    const destText = this.add.text(busStopX + 30, busStopY - 52, 'To Varndean', {
      fontSize: '5px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    destText.setOrigin(0.5);
    destText.setDepth(2);
  }

  private createBrightonPier(): void {
    // Add Brighton Pier in background (around middle of level)
    const pierX = 1400;
    const pierY = 238;

    const pier = this.add.graphics();

    // Pier structure (in water)
    pier.fillStyle(0x8b4513, 0.8);
    pier.fillRect(pierX, pierY + 10, 200, 8);

    // Pier supports
    for (let i = 0; i < 5; i++) {
      pier.fillRect(pierX + 20 + i * 40, pierY + 8, 6, 30);
    }

    // Pier building
    pier.fillStyle(0xf5f5dc, 0.9);
    pier.fillRect(pierX + 60, pierY - 20, 80, 30);

    // Dome roof
    pier.fillStyle(0x4a90d9, 0.9);
    pier.beginPath();
    pier.arc(pierX + 100, pierY - 20, 30, Math.PI, 0);
    pier.fillPath();

    // Flag
    pier.fillStyle(0x7f8c8d, 1);
    pier.fillRect(pierX + 98, pierY - 55, 2, 20);
    pier.fillStyle(0xe74c3c, 1);
    pier.fillTriangle(pierX + 100, pierY - 55, pierX + 115, pierY - 48, pierX + 100, pierY - 41);

    pier.setDepth(-1);
    pier.setScrollFactor(0.5, 1); // Parallax effect
  }

  // Varndean School structures
  private createSchoolEntrance(): void {
    const baseX = 10;
    const baseY = 238;

    const building = this.add.graphics();

    // Main school building (brick red)
    building.fillStyle(0x8b4513, 1);
    building.fillRect(baseX, baseY - 90, 150, 90);

    // Roof
    building.fillStyle(0x4a4a4a, 1);
    building.fillRect(baseX - 5, baseY - 95, 160, 8);

    // Windows (3 across, 2 rows)
    building.fillStyle(0x87ceeb, 1);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        building.fillRect(baseX + 15 + col * 45, baseY - 80 + row * 30, 25, 20);
        // Window cross
        building.lineStyle(2, 0x333333);
        building.strokeRect(baseX + 15 + col * 45, baseY - 80 + row * 30, 25, 20);
      }
    }

    // Main entrance door
    building.fillStyle(0x2c3e50, 1);
    building.fillRect(baseX + 55, baseY - 45, 40, 45);

    // Door arch
    building.fillStyle(0x8b4513, 1);
    building.beginPath();
    building.arc(baseX + 75, baseY - 45, 20, Math.PI, 0);
    building.fillPath();

    // School sign
    building.fillStyle(0x1a5f7a, 1);
    building.fillRect(baseX + 30, baseY - 88, 90, 12);

    building.setDepth(1);

    // Sign text
    const signText = this.add.text(baseX + 75, baseY - 82, 'VARNDEAN', {
      fontSize: '7px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    signText.setOrigin(0.5);
    signText.setDepth(2);

    // Lockers in corridor
    const lockers = this.add.graphics();
    lockers.fillStyle(0x3498db, 1);
    for (let i = 0; i < 4; i++) {
      lockers.fillRect(200 + i * 55, baseY - 60, 45, 60);
      // Locker vents
      lockers.lineStyle(1, 0x2980b9);
      for (let v = 0; v < 3; v++) {
        lockers.strokeRect(205 + i * 55, baseY - 55 + v * 8, 35, 4);
      }
    }
    lockers.setDepth(0);
  }

  private createClassroom(): void {
    const baseX = 550;
    const baseY = 238;

    const classroom = this.add.graphics();

    // Blackboard on back wall
    classroom.fillStyle(0x2c3e50, 1);
    classroom.fillRect(baseX + 50, baseY - 100, 120, 60);
    // Blackboard frame
    classroom.lineStyle(3, 0x8b4513);
    classroom.strokeRect(baseX + 50, baseY - 100, 120, 60);

    // Chalk writing (squiggles)
    classroom.lineStyle(2, 0xffffff);
    classroom.beginPath();
    classroom.moveTo(baseX + 70, baseY - 80);
    classroom.lineTo(baseX + 150, baseY - 80);
    classroom.strokePath();
    classroom.beginPath();
    classroom.moveTo(baseX + 70, baseY - 65);
    classroom.lineTo(baseX + 130, baseY - 65);
    classroom.strokePath();

    // Teacher's desk (front)
    classroom.fillStyle(0x8b4513, 1);
    classroom.fillRect(baseX + 620 - baseX, baseY - 25, 80, 20);
    classroom.fillStyle(0xa0522d, 1);
    classroom.fillRect(baseX + 620 - baseX, baseY - 30, 80, 8);

    // Apple on desk
    classroom.fillStyle(0xe74c3c, 1);
    classroom.fillCircle(baseX + 650 - baseX + 15, baseY - 35, 5);
    classroom.fillStyle(0x27ae60, 1);
    classroom.fillRect(baseX + 650 - baseX + 14, baseY - 42, 2, 4);

    // Clock on wall
    classroom.fillStyle(0xffffff, 1);
    classroom.fillCircle(baseX + 200, baseY - 85, 10);
    classroom.lineStyle(1, 0x000000);
    classroom.strokeCircle(baseX + 200, baseY - 85, 10);
    // Clock hands
    classroom.beginPath();
    classroom.moveTo(baseX + 200, baseY - 85);
    classroom.lineTo(baseX + 200, baseY - 92);
    classroom.strokePath();
    classroom.beginPath();
    classroom.moveTo(baseX + 200, baseY - 85);
    classroom.lineTo(baseX + 206, baseY - 85);
    classroom.strokePath();

    classroom.setDepth(0);
  }

  private createLibrary(): void {
    const baseX = 1000;
    const baseY = 238;

    const library = this.add.graphics();

    // Bookshelf backdrop (tall shelves)
    library.fillStyle(0x8b4513, 1);
    library.fillRect(baseX + 10, baseY - 120, 80, 120);
    library.fillRect(baseX + 190, baseY - 120, 80, 120);

    // Books on shelves (colorful spines)
    const bookColors = [0xe74c3c, 0x3498db, 0x27ae60, 0xf39c12, 0x9b59b6];
    for (let shelf = 0; shelf < 4; shelf++) {
      for (let book = 0; book < 8; book++) {
        library.fillStyle(bookColors[(shelf + book) % bookColors.length], 1);
        library.fillRect(baseX + 15 + book * 9, baseY - 115 + shelf * 28, 7, 22);
      }
      for (let book = 0; book < 8; book++) {
        library.fillStyle(bookColors[(shelf + book + 2) % bookColors.length], 1);
        library.fillRect(baseX + 195 + book * 9, baseY - 115 + shelf * 28, 7, 22);
      }
    }

    // Reading lamp
    library.fillStyle(0xf1c40f, 1);
    library.fillCircle(baseX + 320, baseY - 50, 8);
    library.fillStyle(0x7f8c8d, 1);
    library.fillRect(baseX + 318, baseY - 42, 4, 30);

    // "QUIET PLEASE" sign
    library.fillStyle(0xecf0f1, 1);
    library.fillRect(baseX + 130, baseY - 95, 60, 20);
    library.setDepth(0);

    const quietText = this.add.text(baseX + 160, baseY - 85, 'QUIET', {
      fontSize: '8px',
      color: '#c0392b',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    quietText.setOrigin(0.5);
    quietText.setDepth(1);
  }

  private createPlayingField(): void {
    const baseX = 1450;
    const baseY = 238;

    const field = this.add.graphics();

    // Field lines (white)
    field.lineStyle(2, 0xffffff, 0.8);
    // Center line
    field.beginPath();
    field.moveTo(baseX + 225, baseY - 5);
    field.lineTo(baseX + 225, baseY - 30);
    field.strokePath();
    // Center circle
    field.strokeCircle(baseX + 225, baseY - 5, 25);

    // Goal posts
    field.fillStyle(0xffffff, 1);
    // Left post
    field.fillRect(baseX + 100, baseY - 60, 4, 60);
    // Right post
    field.fillRect(baseX + 196, baseY - 60, 4, 60);
    // Net (simple lines)
    field.lineStyle(1, 0xcccccc, 0.5);
    for (let i = 0; i < 8; i++) {
      field.beginPath();
      field.moveTo(baseX + 104, baseY - 55 + i * 7);
      field.lineTo(baseX + 196, baseY - 55 + i * 7);
      field.strokePath();
    }

    // Bleachers structure (metal frame)
    field.fillStyle(0x7f8c8d, 1);
    field.fillRect(baseX + 25, baseY - 80, 4, 80);
    field.fillRect(baseX + 85, baseY - 80, 4, 80);

    // Equipment shed
    field.fillStyle(0x8b4513, 1);
    field.fillRect(baseX + 340, baseY - 70, 80, 70);
    field.fillStyle(0x654321, 1);
    field.fillRect(baseX + 335, baseY - 75, 90, 8);
    // Shed door
    field.fillStyle(0x5d4037, 1);
    field.fillRect(baseX + 365, baseY - 40, 25, 40);

    // Sports equipment visible
    field.fillStyle(0xff6b35, 1); // Basketball
    field.fillCircle(baseX + 355, baseY - 15, 8);
    field.fillStyle(0xffffff, 1); // Football
    field.fillEllipse(baseX + 400, baseY - 12, 10, 6);

    field.setDepth(0);
  }

  private createSchoolExit(): void {
    const baseX = 2300;
    const baseY = 238;

    const exit = this.add.graphics();

    // School gate
    exit.fillStyle(0x2c3e50, 1);
    // Gate posts
    exit.fillRect(baseX - 10, baseY - 70, 8, 70);
    exit.fillRect(baseX + 60, baseY - 70, 8, 70);
    // Post tops
    exit.fillStyle(0x34495e, 1);
    exit.fillCircle(baseX - 6, baseY - 75, 8);
    exit.fillCircle(baseX + 64, baseY - 75, 8);

    // Gate bars
    exit.lineStyle(3, 0x2c3e50);
    for (let i = 0; i < 6; i++) {
      exit.beginPath();
      exit.moveTo(baseX + i * 10, baseY - 65);
      exit.lineTo(baseX + i * 10, baseY - 5);
      exit.strokePath();
    }
    // Horizontal bars
    exit.beginPath();
    exit.moveTo(baseX - 2, baseY - 50);
    exit.lineTo(baseX + 52, baseY - 50);
    exit.strokePath();
    exit.beginPath();
    exit.moveTo(baseX - 2, baseY - 20);
    exit.lineTo(baseX + 52, baseY - 20);
    exit.strokePath();

    exit.setDepth(1);

    // Exit sign
    const exitSign = this.add.text(baseX + 25, baseY - 85, 'EXIT', {
      fontSize: '10px',
      color: '#27ae60',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    exitSign.setOrigin(0.5);
    exitSign.setDepth(2);
  }

  private playTrainArrival(): void {
    this.introPlaying = true;

    // Fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Hide player initially
    this.player.setAlpha(0);

    // Camera focuses on station
    this.cameras.main.stopFollow();
    this.cameras.main.pan(60, GAME_HEIGHT / 2, 300);

    // Create arriving train
    const trainY = 228;
    const train = this.add.graphics();
    train.setDepth(10);

    // Train body
    train.fillStyle(0x2c3e50, 1);
    train.fillRect(0, 0, 100, 30);

    // Windows
    train.fillStyle(0x87ceeb, 1);
    for (let i = 0; i < 4; i++) {
      train.fillRect(10 + i * 22, 5, 15, 12);
    }

    // Wheels
    train.fillStyle(0x1a1a1a, 1);
    train.fillCircle(15, 30, 8);
    train.fillCircle(45, 30, 8);
    train.fillCircle(75, 30, 8);

    train.setPosition(-120, trainY - 30);

    // Train arrives
    this.tweens.add({
      targets: train,
      x: 20,
      duration: 1500,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Player exits train
        this.time.delayedCall(400, () => {
          this.player.setPosition(70, this.currentLevel.playerStart.y);
          this.player.setAlpha(1);

          this.tweens.add({
            targets: this.player,
            x: this.currentLevel.playerStart.x + 50,
            duration: 600,
            ease: 'Quad.easeOut',
            onStart: () => {
              this.player.play('maisha-run');
              this.player.setFlipX(false);
            },
            onComplete: () => {
              this.player.play('maisha-idle');

              // Train departs
              this.tweens.add({
                targets: train,
                x: -150,
                duration: 1500,
                ease: 'Quad.easeIn',
                onComplete: () => {
                  train.destroy();
                  this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
                  this.introPlaying = false;
                },
              });
            },
          });
        });
      },
    });
  }

  private playBusDeparture(timeElapsed: number): void {
    // Stop player
    this.player.setVelocity(0, 0);
    (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    const busX = this.currentLevel.endX - 50;
    const busY = 218;

    // Create bus
    const bus = this.add.graphics();
    bus.setDepth(10);

    // Bus body
    bus.fillStyle(0xe74c3c, 1);
    bus.fillRect(0, 0, 80, 40);

    // Windows
    bus.fillStyle(0x87ceeb, 1);
    bus.fillRect(5, 5, 15, 15);
    bus.fillRect(25, 5, 15, 15);
    bus.fillRect(45, 5, 15, 15);
    bus.fillRect(65, 5, 10, 15);

    // Wheels
    bus.fillStyle(0x1a1a1a, 1);
    bus.fillCircle(15, 42, 8);
    bus.fillCircle(65, 42, 8);

    // Route number
    bus.fillStyle(0xffffff, 1);
    bus.fillRect(5, 25, 20, 12);

    bus.setPosition(busX + 100, busY - 40);

    // Bus arrives
    this.tweens.add({
      targets: bus,
      x: busX,
      duration: 1200,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Player walks to bus
        this.tweens.add({
          targets: this.player,
          x: busX + 40,
          duration: 600,
          onStart: () => {
            this.player.play('maisha-run');
          },
          onComplete: () => {
            // Player boards bus
            this.tweens.add({
              targets: this.player,
              alpha: 0,
              duration: 300,
              onComplete: () => {
                // Bus departs
                this.tweens.add({
                  targets: bus,
                  x: busX - 200,
                  duration: 1500,
                  ease: 'Quad.easeIn',
                  onComplete: () => {
                    this.showLevelComplete(timeElapsed);
                  },
                });
              },
            });
          },
        });
      },
    });
  }

  private createBackground(): void {
    const level = this.currentLevel;

    // Special background for Varndean (sectioned indoor/outdoor)
    if (level.id === LEVELS.VARNDEAN) {
      this.createVarndeanBackground();
      return;
    }

    const bg = this.add.graphics();

    // Sky gradient
    const gradientSteps = 15;
    const topColor = Phaser.Display.Color.ValueToColor(level.background.skyTop);
    const bottomColor = Phaser.Display.Color.ValueToColor(level.background.skyBottom);

    for (let i = 0; i < gradientSteps; i++) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        topColor,
        bottomColor,
        gradientSteps,
        i
      );
      const hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
      bg.fillStyle(hexColor, 1);
      bg.fillRect(0, (GAME_HEIGHT * i) / gradientSteps, level.width, GAME_HEIGHT / gradientSteps + 1);
    }
    bg.setScrollFactor(0.1, 0);

    // Clouds
    if (level.background.hasClouds) {
      this.createClouds();
    }

    // Water/sea at bottom
    if (level.background.hasWater) {
      const water = this.add.graphics();
      water.fillStyle(0x4a90d9, 0.6);
      water.fillRect(0, GAME_HEIGHT - 50, level.width, 50);
      water.setScrollFactor(0.3, 1);

      // Wave animation
      this.tweens.add({
        targets: water,
        y: -3,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private createVarndeanBackground(): void {
    const level = this.currentLevel;

    // Indoor wall base (beige)
    const indoorBg = this.add.graphics();
    indoorBg.fillStyle(0xd4c4a8, 1);
    indoorBg.fillRect(0, 0, level.width, GAME_HEIGHT);
    indoorBg.setDepth(-10);

    // Playing field outdoor section (1450-1900) - sky visible
    const outdoorBg = this.add.graphics();
    // Sky gradient for outdoor section
    const gradientSteps = 10;
    for (let i = 0; i < gradientSteps; i++) {
      const t = i / gradientSteps;
      const r = Math.floor(135 + t * (176 - 135));
      const g = Math.floor(206 + t * (196 - 206));
      const b = Math.floor(235 + t * (222 - 235));
      outdoorBg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      outdoorBg.fillRect(1450, (GAME_HEIGHT * i) / gradientSteps, 500, GAME_HEIGHT / gradientSteps + 1);
    }
    outdoorBg.setDepth(-9);

    // Indoor wall details - corridor section (0-500)
    const corridorWall = this.add.graphics();
    corridorWall.fillStyle(0xe8dcc8, 1); // Lighter wall panel
    corridorWall.fillRect(0, 30, 500, 100);
    // Wainscoting (lower wall)
    corridorWall.fillStyle(0x8b7355, 1);
    corridorWall.fillRect(0, 130, 500, GAME_HEIGHT - 130);
    // Trim line
    corridorWall.fillStyle(0x654321, 1);
    corridorWall.fillRect(0, 125, 500, 8);
    corridorWall.setDepth(-8);

    // Classroom section (550-950)
    const classroomWall = this.add.graphics();
    classroomWall.fillStyle(0xf5f5dc, 1); // Cream wall
    classroomWall.fillRect(550, 0, 400, GAME_HEIGHT);
    classroomWall.setDepth(-8);

    // Library section (1000-1400)
    const libraryWall = this.add.graphics();
    libraryWall.fillStyle(0xdeb887, 1); // Warm library color
    libraryWall.fillRect(1000, 0, 450, GAME_HEIGHT);
    libraryWall.setDepth(-8);

    // Exit corridor (1950-2400)
    const exitWall = this.add.graphics();
    exitWall.fillStyle(0xe8dcc8, 1);
    exitWall.fillRect(1950, 30, 450, 100);
    exitWall.fillStyle(0x8b7355, 1);
    exitWall.fillRect(1950, 130, 450, GAME_HEIGHT - 130);
    exitWall.fillStyle(0x654321, 1);
    exitWall.fillRect(1950, 125, 450, 8);
    exitWall.setDepth(-8);

    // Add some clouds over the playing field
    for (let i = 0; i < 3; i++) {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.7);
      const baseSize = 12 + Math.random() * 10;
      cloud.fillCircle(0, 0, baseSize);
      cloud.fillCircle(baseSize * 0.7, -baseSize * 0.2, baseSize * 0.6);
      cloud.fillCircle(-baseSize * 0.6, -baseSize * 0.15, baseSize * 0.5);
      cloud.setPosition(1500 + i * 120 + Math.random() * 50, 30 + Math.random() * 30);
      cloud.setDepth(-7);
    }

    // Ceiling lights in indoor sections
    const lights = this.add.graphics();
    lights.fillStyle(0xfffacd, 0.8);
    // Corridor lights
    for (let x = 50; x < 500; x += 100) {
      lights.fillRect(x, 20, 40, 10);
    }
    // Classroom lights
    for (let x = 600; x < 950; x += 100) {
      lights.fillRect(x, 20, 40, 10);
    }
    // Library lights
    for (let x = 1050; x < 1400; x += 120) {
      lights.fillRect(x, 20, 50, 10);
    }
    // Exit corridor lights
    for (let x = 2000; x < 2350; x += 100) {
      lights.fillRect(x, 20, 40, 10);
    }
    lights.setDepth(-6);
  }

  private createClouds(): void {
    const cloudCount = Math.floor(this.currentLevel.width / 200);

    for (let i = 0; i < cloudCount; i++) {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.7);

      const baseSize = 15 + Math.random() * 15;
      cloud.fillCircle(0, 0, baseSize);
      cloud.fillCircle(baseSize * 0.7, -baseSize * 0.2, baseSize * 0.6);
      cloud.fillCircle(-baseSize * 0.6, -baseSize * 0.15, baseSize * 0.5);

      cloud.setPosition(i * 200 + Math.random() * 100, 30 + Math.random() * 40);
      cloud.setScrollFactor(0.2, 0);
    }
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();

    this.currentLevel.platforms.forEach((config) => {
      if (config.type === 'moving') {
        this.createMovingPlatform(config);
      } else {
        this.createStaticPlatform(config);
      }
    });
  }

  private createStaticPlatform(config: PlatformConfig): void {
    const isGround = config.type === 'ground';
    const height = isGround ? 32 : 12;
    const color = isGround ? this.currentLevel.groundColor : 0x8b4513;

    // Platform body
    const platform = this.add.rectangle(
      config.x + config.width / 2,
      config.y + height / 2,
      config.width,
      height,
      color
    );
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);

    // Platform top highlight
    const highlightColor = isGround ? 0xf7dc6f : 0xa0522d;
    this.add.rectangle(
      config.x + config.width / 2,
      config.y + 3,
      config.width - 4,
      4,
      highlightColor
    );

    // Add grass/sand texture on ground
    if (isGround) {
      const grass = this.add.graphics();
      grass.fillStyle(0x82e0aa, 1);
      for (let x = config.x; x < config.x + config.width; x += 6) {
        const grassHeight = 3 + Math.random() * 4;
        grass.fillRect(x, config.y - grassHeight, 2, grassHeight);
      }
    }
  }

  private createMovingPlatform(config: PlatformConfig): void {
    const width = config.width || 50;
    const startY = config.y;
    const endY = config.y - (config.moveDistance || 40);
    const speed = (config.moveSpeed || 2000) / 1000; // Convert to pixels per second

    const platform = this.add.rectangle(config.x, startY, width, 12, 0x9b59b6);
    this.physics.add.existing(platform, false);

    const body = platform.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;

    // Highlight (visual only)
    const highlight = this.add.rectangle(config.x, startY - 4, width - 4, 4, 0xaf7ac5);

    // Store for manual update
    this.movingPlatformData.push({
      platform,
      highlight,
      startY,
      endY,
      speed: Math.abs(endY - startY) / speed,
      direction: -1,
    });
  }

  private updateMovingPlatforms(delta: number): void {
    this.movingPlatformData.forEach((data) => {
      const body = data.platform.body as Phaser.Physics.Arcade.Body;

      // Calculate velocity based on direction
      const pixelsPerFrame = (Math.abs(data.endY - data.startY) / data.speed) * (delta / 1000);
      const velocity = data.direction * pixelsPerFrame * 60;

      body.setVelocityY(velocity);

      // Update highlight position
      data.highlight.y = data.platform.y - 4;

      // Check bounds and reverse direction
      if (data.direction < 0 && data.platform.y <= data.endY) {
        data.direction = 1;
        data.platform.y = data.endY;
      } else if (data.direction > 0 && data.platform.y >= data.startY) {
        data.direction = -1;
        data.platform.y = data.startY;
      }
    });
  }

  private createDecorations(): void {
    this.currentLevel.decorations.forEach((dec) => {
      const graphics = this.add.graphics();

      switch (dec.type) {
        case 'shell':
          graphics.fillStyle(0xffc0cb, 1);
          graphics.fillCircle(dec.x, dec.y - 5, 5);
          graphics.fillStyle(0xffb6c1, 1);
          graphics.fillCircle(dec.x - 2, dec.y - 6, 2);
          break;
        case 'beachball':
          graphics.fillStyle(0xff6b6b, 1);
          graphics.fillCircle(dec.x, dec.y - 8, 8);
          graphics.fillStyle(0xffffff, 1);
          graphics.slice(dec.x, dec.y - 8, 8, 0, Math.PI, true);
          graphics.fillPath();
          this.tweens.add({
            targets: graphics,
            y: -2,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Bounce.easeOut',
          });
          break;
        case 'rock':
          graphics.fillStyle(0x7f8c8d, 1);
          graphics.fillEllipse(dec.x, dec.y - 4, 12, 8);
          graphics.fillStyle(0x95a5a6, 1);
          graphics.fillCircle(dec.x - 2, dec.y - 5, 2);
          break;
        case 'flower':
          graphics.fillStyle(0x27ae60, 1);
          graphics.fillRect(dec.x - 1, dec.y - 8, 2, 8);
          graphics.fillStyle(0xf39c12, 1);
          graphics.fillCircle(dec.x, dec.y - 10, 4);
          break;
        case 'grass':
          graphics.fillStyle(0x27ae60, 1);
          graphics.fillRect(dec.x - 1, dec.y - 6, 2, 6);
          graphics.fillRect(dec.x + 2, dec.y - 8, 2, 8);
          graphics.fillRect(dec.x - 3, dec.y - 5, 2, 5);
          break;
      }
    });
  }

  private createMayoJars(): void {
    const saveData = SaveManager.load();
    const collectedInLevel = saveData.mayoCollected[this.currentLevel.id] || [];

    this.currentLevel.mayoJars.forEach((config) => {
      if (collectedInLevel.includes(config.id)) return;
      const mayo = new MayoJar(this, config.x, config.y, config.id);
      this.mayoJars.push(mayo);
    });
  }

  private createBats(): void {
    // If player already has bat, don't spawn any
    if (SaveManager.hasBat()) {
      return;
    }

    // Otherwise spawn bats from level config
    this.currentLevel.bats.forEach((config) => {
      const bat = new Bat(this, config.x, config.y, config.id);
      this.bats.push(bat);
    });
  }

  private createCheckpoints(): void {
    this.currentLevel.checkpoints.forEach((config) => {
      const checkpoint = new Checkpoint(
        this,
        config.x,
        config.y,
        config.id,
        this.currentLevel.id
      );
      this.checkpoints.push(checkpoint);
    });
  }

  private createWasps(): void {
    this.currentLevel.wasps.forEach((config) => {
      const wasp = new Wasp(this, config.x, config.y, {
        patrolDistance: config.patrolDistance,
      });
      this.wasps.push(wasp);
    });
  }

  private createSeagulls(): void {
    this.currentLevel.seagulls.forEach((config) => {
      const seagull = new Seagull(this, config.x, config.y, {
        circleRadius: config.circleRadius,
        detectRange: config.detectRange,
      });
      this.seagulls.push(seagull);
    });
  }

  private createFriends(): void {
    const collectedFriends = SaveManager.getCollectedFriends();

    // First, spawn friends from level config (if not already collected)
    this.currentLevel.friends.forEach((config) => {
      if (!collectedFriends.includes(config.id)) {
        const friendData = NPC_FRIENDS[config.id];
        if (friendData) {
          const friend = new NPCFriend(this, config.x, config.y, {
            id: config.id,
            name: friendData.name,
            spriteKey: friendData.spriteKey,
          });
          this.friends.push(friend);
        }
      }
    });

    // Then, spawn previously collected friends near player spawn (already following)
    const spawnPoint = this.currentLevel.playerStart;
    collectedFriends.forEach((friendId, index) => {
      const friendData = NPC_FRIENDS[friendId];
      if (friendData) {
        // Spawn behind player spawn position
        const friend = new NPCFriend(this, spawnPoint.x - 30 - index * 20, spawnPoint.y, {
          id: friendId,
          name: friendData.name,
          spriteKey: friendData.spriteKey,
        });
        // Mark as already collected so they start following immediately
        friend.collect();
        this.followingFriends.push(friend);
      }
    });
  }

  private setupCollisions(): void {
    // Player vs static platforms
    this.physics.add.collider(this.player, this.platforms);

    // Player vs moving platforms
    this.movingPlatformData.forEach((data) => {
      this.physics.add.collider(this.player, data.platform);
    });

    // Player vs mayo jars
    this.mayoJars.forEach((mayo) => {
      this.physics.add.overlap(this.player, mayo, () => {
        if (!mayo.isCollected()) {
          mayo.collect(() => {
            this.player.collectMayo();
            SaveManager.collectMayo(this.currentLevel.id, mayo.mayoId);
          });
        }
      });
    });

    // Player vs bats (collectible)
    this.bats.forEach((bat) => {
      this.physics.add.overlap(this.player, bat, () => {
        if (!bat.isCollected()) {
          bat.collect(() => {
            this.player.equipBat();
            SaveManager.collectBat(); // Persist bat ownership
          });
        }
      });
    });

    // Player's bat attack vs enemies
    this.setupBatAttackCollisions();

    // Player vs checkpoints
    this.checkpoints.forEach((checkpoint) => {
      this.physics.add.overlap(this.player, checkpoint.getHitArea(), () => {
        if (!checkpoint.isActivated()) {
          checkpoint.activate();
        }
      });
    });

    // Player vs wasps
    this.wasps.forEach((wasp) => {
      wasp.setTarget(this.player);

      this.physics.add.overlap(this.player, wasp, () => {
        this.handlePlayerWaspCollision(wasp);
      });
    });

    // Player vs seagulls
    this.seagulls.forEach((seagull) => {
      seagull.setTarget(this.player);

      this.physics.add.overlap(this.player, seagull, () => {
        this.handlePlayerSeagullCollision(seagull);
      });
    });

    // Player vs NPC friends (collectible)
    this.friends.forEach((friend) => {
      this.physics.add.overlap(this.player, friend, () => {
        if (!friend.isCollected()) {
          friend.collect(() => {
            // Save friend collection
            SaveManager.collectFriend(friend.friendId);

            // Update player max health
            this.player.setMaxHealth(SaveManager.getMaxHealth());

            // Start following
            const followOffset = this.followingFriends.length;
            friend.setFollowTarget(this.player, followOffset);
            this.followingFriends.push(friend);
          });
        }
      });
    });
  }

  private handlePlayerWaspCollision(wasp: Wasp): void {
    if (!wasp.isAlive()) return;

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // Mayo Maisha mode - any contact damages enemy
    if (this.player.isMayoMaisha()) {
      wasp.stomp();
      // Small bounce
      if (playerBody.velocity.y > 0) {
        this.player.setVelocityY(-200);
      }
      return;
    }

    // Normal mode - check if player is stomping
    if (playerBody.velocity.y > 0 && this.player.y < wasp.y - 10) {
      wasp.stomp();
      this.player.setVelocityY(-250);
    } else {
      this.player.takeDamage(wasp.getDamage());
    }
  }

  private handlePlayerSeagullCollision(seagull: Seagull): void {
    if (!seagull.isAlive()) return;

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // Mayo Maisha mode - any contact damages enemy
    if (this.player.isMayoMaisha()) {
      seagull.stomp();
      // Small bounce
      if (playerBody.velocity.y > 0) {
        this.player.setVelocityY(-200);
      }
      return;
    }

    // Normal mode - check if player is stomping (from above)
    if (playerBody.velocity.y > 0 && this.player.y < seagull.y - 10) {
      seagull.stomp();
      this.player.setVelocityY(-280); // Higher bounce for seagull
    } else {
      this.player.takeDamage(seagull.getDamage());
    }
  }

  private setupBatAttackCollisions(): void {
    const hitbox = this.player.getAttackHitbox();

    // Bat attack vs wasps
    this.wasps.forEach((wasp) => {
      this.physics.add.overlap(hitbox, wasp, () => {
        if (this.player.isCurrentlyAttacking() && wasp.isAlive()) {
          wasp.stomp();
          this.player.playBatHitSound();
          this.createBatHitEffect(wasp.x, wasp.y);
        }
      });
    });

    // Bat attack vs seagulls
    this.seagulls.forEach((seagull) => {
      this.physics.add.overlap(hitbox, seagull, () => {
        if (this.player.isCurrentlyAttacking() && seagull.isAlive()) {
          seagull.stomp();
          this.player.playBatHitSound();
          this.createBatHitEffect(seagull.x, seagull.y);
        }
      });
    });
  }

  private createBatHitEffect(x: number, y: number): void {
    // Create impact star texture if not exists
    if (!this.textures.exists('impact-star')) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffff00, 1);
      graphics.fillCircle(4, 4, 4);
      graphics.generateTexture('impact-star', 8, 8);
      graphics.destroy();
    }

    // Impact particles
    const particles = this.add.particles(x, y, 'impact-star', {
      speed: { min: 80, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 300,
      quantity: 8,
      emitting: false,
    });

    particles.explode();
    this.time.delayedCall(400, () => particles.destroy());

    // Brief camera shake
    this.cameras.main.shake(50, 0.005);
  }

  private setupInput(): void {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();

      this.input.keyboard.on('keydown-ESC', () => {
        this.scene.pause();
        this.scene.launch(SCENES.PAUSE);
      });
    }
  }

  private showLevelName(): void {
    const levelText = this.add.text(GAME_WIDTH / 2, 50, this.currentLevel.name.toUpperCase(), {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    levelText.setOrigin(0.5);
    levelText.setScrollFactor(0);
    levelText.setDepth(50);
    levelText.setAlpha(0);

    this.tweens.add({
      targets: levelText,
      alpha: 1,
      duration: 500,
      hold: 1500,
      yoyo: true,
      onComplete: () => levelText.destroy(),
    });
  }

  update(_time: number, delta: number): void {
    if (this.levelComplete || this.introPlaying) return;

    this.player.update(this.cursors);
    this.hud.update(
      this.player.health,
      this.player.mayoCount,
      this.player.isMayoMaisha(),
      this.player.getMayoMaishaTimeRemaining(),
      this.player.getMayoMaishaDuration(),
      this.player.maxHealth
    );

    // Update moving platforms
    this.updateMovingPlatforms(delta);

    // Update wasps (with flee behavior for Mayo Maisha)
    this.wasps.forEach((wasp) => {
      wasp.setFleeMode(this.player.isMayoMaisha());
      wasp.update();
    });

    // Update seagulls (with flee behavior for Mayo Maisha)
    this.seagulls.forEach((seagull) => {
      seagull.setFleeMode(this.player.isMayoMaisha());
      seagull.update();
    });

    // Update following friends
    this.followingFriends.forEach((friend) => {
      friend.update();
    });

    // Check for level completion
    if (this.player.x >= this.currentLevel.endX) {
      this.completeLevel();
    }

    // Check for death (falling into pit/gap - instantly fatal)
    if (this.player.y > GAME_HEIGHT + 20) {
      this.handlePitDeath();
    }
  }

  private completeLevel(): void {
    this.levelComplete = true;

    const timeElapsed = this.time.now - this.levelStartTime;
    SaveManager.updateBestTime(this.currentLevel.id, timeElapsed);

    // Level-specific completion animations
    if (this.currentLevel.id === LEVELS.WORTHING) {
      this.playTrainDeparture(timeElapsed);
    } else if (this.currentLevel.id === LEVELS.BRIGHTON) {
      this.playBusDeparture(timeElapsed);
    } else if (this.currentLevel.id === LEVELS.VARNDEAN) {
      // Varndean ends with boss battle!
      this.player.setVelocity(0, 0);
      (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      this.playBossBattleIntro();
    } else {
      this.player.playVictory();
      this.player.setVelocity(0, 0);
      (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      this.showLevelComplete(timeElapsed);
    }
  }

  private playBossBattleIntro(): void {
    // Dramatic build-up to boss battle
    this.player.play('maisha-idle');

    // Show warning text
    const warningText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '⚠️ BOSS APPROACHING ⚠️', {
      fontSize: '14px',
      color: '#e74c3c',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    warningText.setOrigin(0.5);
    warningText.setScrollFactor(0);
    warningText.setDepth(100);

    // Flashing effect
    this.tweens.add({
      targets: warningText,
      alpha: 0.3,
      duration: 300,
      yoyo: true,
      repeat: 5,
    });

    // Camera shake
    this.cameras.main.shake(1500, 0.01);

    // Play ominous sound
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const notes = [110, 103, 98, 82];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + i * 0.4;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    }

    // Transition to boss battle
    this.time.delayedCall(2500, () => {
      warningText.destroy();

      const bossText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'NICKI THE CHEMISTRY TEACHER', {
        fontSize: '12px',
        color: '#9b59b6',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      });
      bossText.setOrigin(0.5);
      bossText.setScrollFactor(0);
      bossText.setDepth(100);

      this.time.delayedCall(2000, () => {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.BOSS_BATTLE);
        });
      });
    });
  }

  private playTrainDeparture(timeElapsed: number): void {
    // Stop player
    this.player.setVelocity(0, 0);
    (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    const trainX = this.currentLevel.endX - 60;
    const trainY = 233;

    // Create train
    const train = this.add.graphics();
    train.setDepth(10);

    // Train body
    train.fillStyle(0x2c3e50, 1);
    train.fillRect(0, 0, 100, 30);

    // Windows
    train.fillStyle(0x87ceeb, 1);
    for (let i = 0; i < 4; i++) {
      train.fillRect(10 + i * 22, 5, 15, 12);
    }

    // Wheels
    train.fillStyle(0x1a1a1a, 1);
    train.fillCircle(15, 30, 8);
    train.fillCircle(45, 30, 8);
    train.fillCircle(75, 30, 8);

    train.setPosition(trainX + 150, trainY - 30);

    // Train arrives
    this.tweens.add({
      targets: train,
      x: trainX,
      duration: 1500,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Player walks to train
        this.tweens.add({
          targets: this.player,
          x: trainX + 50,
          duration: 800,
          onStart: () => {
            this.player.play('maisha-run');
          },
          onComplete: () => {
            // Player disappears into train
            this.tweens.add({
              targets: this.player,
              alpha: 0,
              duration: 300,
              onComplete: () => {
                // Train departs
                this.tweens.add({
                  targets: train,
                  x: trainX - 200,
                  duration: 2000,
                  ease: 'Quad.easeIn',
                  onComplete: () => {
                    this.showLevelComplete(timeElapsed);
                  },
                });
              },
            });
          },
        });
      },
    });
  }

  private handlePitDeath(): void {
    // Instant death from falling - don't play normal death animation
    if ((this.player as unknown as { isDead: boolean }).isDead) return;

    // Mark as dead to prevent multiple triggers
    (this.player as unknown as { isDead: boolean }).isDead = true;

    // Quick fade to black
    this.cameras.main.fadeOut(200, 0, 0, 0);

    // Play falling sound
    this.playFallSound();

    // Show game over after fade
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.showGameOver();
    });
  }

  private playFallSound(): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    }
  }

  respawnPlayer(): void {
    const spawnPoint = this.getSpawnPoint();

    // Reset player position and state
    this.player.setPosition(spawnPoint.x, spawnPoint.y);
    this.player.setVelocity(0, 0);
    this.player.respawnReset();

    // Camera focus on player
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  showGameOver(): void {
    // Full black overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 1);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setScrollFactor(0);
    overlay.setDepth(200);

    // Play dramatic sound
    this.playGameOverSound();

    // Game Over title - starts big and slams down
    const title = this.add.text(GAME_WIDTH / 2, -50, 'GAME OVER', {
      fontSize: '28px',
      color: '#e94560',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5,
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(201);

    // Slam down animation with bounce
    this.tweens.add({
      targets: title,
      y: GAME_HEIGHT / 2 - 50,
      duration: 600,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        // Shake effect after landing
        this.tweens.add({
          targets: title,
          x: { from: GAME_WIDTH / 2 - 3, to: GAME_WIDTH / 2 + 3 },
          duration: 50,
          yoyo: true,
          repeat: 3,
        });
      },
    });

    // Sad Maisha face
    const sadFace = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, '😢', {
      fontSize: '32px',
    });
    sadFace.setOrigin(0.5);
    sadFace.setScrollFactor(0);
    sadFace.setDepth(201);
    sadFace.setAlpha(0);
    sadFace.setScale(0);

    // Pop in the sad face
    this.tweens.add({
      targets: sadFace,
      alpha: 1,
      scale: 1,
      duration: 400,
      delay: 500,
      ease: 'Back.easeOut',
    });

    // Wobble animation for sad face
    this.time.delayedCall(900, () => {
      this.tweens.add({
        targets: sadFace,
        angle: { from: -10, to: 10 },
        duration: 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // Continue button - starts at final position but invisible
    const continueBtn = this.add.graphics();
    continueBtn.fillStyle(0x27ae60, 1);
    continueBtn.fillRoundedRect(GAME_WIDTH / 2 - 70, GAME_HEIGHT / 2 + 35, 140, 32, 6);
    continueBtn.setScrollFactor(0);
    continueBtn.setDepth(201);
    continueBtn.setAlpha(0);
    continueBtn.setScale(0.5);

    const continueText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 51, 'Try Again', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    continueText.setOrigin(0.5);
    continueText.setScrollFactor(0);
    continueText.setDepth(202);
    continueText.setAlpha(0);
    continueText.setScale(0.5);

    // Menu button - starts at final position but invisible
    const menuBtn = this.add.graphics();
    menuBtn.fillStyle(0x7f8c8d, 1);
    menuBtn.fillRoundedRect(GAME_WIDTH / 2 - 70, GAME_HEIGHT / 2 + 75, 140, 32, 6);
    menuBtn.setScrollFactor(0);
    menuBtn.setDepth(201);
    menuBtn.setAlpha(0);
    menuBtn.setScale(0.5);

    const menuText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 91, 'Main Menu', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    menuText.setOrigin(0.5);
    menuText.setScrollFactor(0);
    menuText.setDepth(202);
    menuText.setAlpha(0);
    menuText.setScale(0.5);

    // Pop-in animation for Continue button
    this.tweens.add({
      targets: [continueBtn, continueText],
      alpha: 1,
      scale: 1,
      duration: 300,
      delay: 700,
      ease: 'Back.easeOut',
    });

    // Pop-in animation for Menu button
    this.tweens.add({
      targets: [menuBtn, menuText],
      alpha: 1,
      scale: 1,
      duration: 300,
      delay: 850,
      ease: 'Back.easeOut',
    });

    // Create interactive zones after animations complete
    let continueZone: Phaser.GameObjects.Zone;
    let menuZone: Phaser.GameObjects.Zone;

    this.time.delayedCall(1200, () => {
      // Continue button interactive zone
      continueZone = this.add.zone(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 51, 140, 32);
      continueZone.setScrollFactor(0);
      continueZone.setDepth(203);
      continueZone.setInteractive({ useHandCursor: true });

      continueZone.on('pointerover', () => {
        continueText.setColor('#ffd93d');
        continueBtn.clear();
        continueBtn.fillStyle(0x2ecc71, 1);
        continueBtn.fillRoundedRect(GAME_WIDTH / 2 - 70, GAME_HEIGHT / 2 + 35, 140, 32, 6);
      });

      continueZone.on('pointerout', () => {
        continueText.setColor('#ffffff');
        continueBtn.clear();
        continueBtn.fillStyle(0x27ae60, 1);
        continueBtn.fillRoundedRect(GAME_WIDTH / 2 - 70, GAME_HEIGHT / 2 + 35, 140, 32, 6);
      });

      continueZone.on('pointerdown', () => {
        // Clean up game over UI
        overlay.destroy();
        title.destroy();
        sadFace.destroy();
        continueBtn.destroy();
        continueText.destroy();
        menuBtn.destroy();
        menuText.destroy();
        if (continueZone) continueZone.destroy();
        if (menuZone) menuZone.destroy();

        // Respawn player at checkpoint
        this.respawnPlayer();

        // Fade back in
        this.cameras.main.fadeIn(500, 0, 0, 0);
      });

      // Menu button interactive zone
      menuZone = this.add.zone(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 91, 140, 32);
      menuZone.setScrollFactor(0);
      menuZone.setDepth(203);
      menuZone.setInteractive({ useHandCursor: true });

      menuZone.on('pointerover', () => {
        menuText.setColor('#ffd93d');
        menuBtn.clear();
        menuBtn.fillStyle(0x95a5a6, 1);
        menuBtn.fillRoundedRect(GAME_WIDTH / 2 - 70, GAME_HEIGHT / 2 + 75, 140, 32, 6);
      });

      menuZone.on('pointerout', () => {
        menuText.setColor('#ffffff');
        menuBtn.clear();
        menuBtn.fillStyle(0x7f8c8d, 1);
        menuBtn.fillRoundedRect(GAME_WIDTH / 2 - 70, GAME_HEIGHT / 2 + 75, 140, 32, 6);
      });

      menuZone.on('pointerdown', () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.MENU);
        });
      });
    });
  }

  private playGameOverSound(): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;

      // Dramatic descending notes
      const notes = [440, 392, 349, 294, 220];
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'triangle';
        oscillator.frequency.value = freq;

        const startTime = ctx.currentTime + i * 0.15;
        gainNode.gain.setValueAtTime(0.25, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.4);
      });
    }
  }

  private showLevelComplete(timeMs: number): void {
    // Fade to black first
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Create black overlay
      const overlay = this.add.graphics();
      overlay.fillStyle(0x000000, 1);
      overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      overlay.setScrollFactor(0);
      overlay.setDepth(100);

      // Fade back in to show stats
      this.cameras.main.fadeIn(300, 0, 0, 0);

      // Title
      const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 70, 'LEVEL COMPLETE!', {
        fontSize: '22px',
        color: '#ffd93d',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      });
      title.setOrigin(0.5);
      title.setScrollFactor(0);
      title.setDepth(101);

      // Time
      const seconds = Math.floor(timeMs / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const timeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, `Time: ${mins}:${secs.toString().padStart(2, '0')}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace',
      });
      timeText.setOrigin(0.5);
      timeText.setScrollFactor(0);
      timeText.setDepth(101);

      // Mayo count
      const mayoText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 5, `Mayo: ${this.player.mayoCount}/${this.currentLevel.mayoJars.length}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace',
      });
      mayoText.setOrigin(0.5);
      mayoText.setScrollFactor(0);
      mayoText.setDepth(101);

      // Continue button (created directly, not in container)
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0xe94560, 1);
      btnBg.fillRoundedRect(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 30, 120, 28, 6);
      btnBg.setScrollFactor(0);
      btnBg.setDepth(101);

      const btnLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 44, 'Continue', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      });
      btnLabel.setOrigin(0.5);
      btnLabel.setScrollFactor(0);
      btnLabel.setDepth(102);

      // Create interactive zone for button
      const btnZone = this.add.zone(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 44, 120, 28);
      btnZone.setScrollFactor(0);
      btnZone.setDepth(103);
      btnZone.setInteractive({ useHandCursor: true });

      btnZone.on('pointerover', () => {
        btnLabel.setColor('#ffd93d');
        btnBg.clear();
        btnBg.fillStyle(0xc73e54, 1);
        btnBg.fillRoundedRect(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 30, 120, 28, 6);
      });

      btnZone.on('pointerout', () => {
        btnLabel.setColor('#ffffff');
        btnBg.clear();
        btnBg.fillStyle(0xe94560, 1);
        btnBg.fillRoundedRect(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 30, 120, 28, 6);
      });

      btnZone.on('pointerdown', () => {
        if (this.currentLevel.nextLevel) {
          SaveManager.save({ currentLevel: this.currentLevel.nextLevel, checkpointId: null });
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.restart();
          });
        } else {
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENES.CREDITS);
          });
        }
      });

      // Animate elements in
      title.setAlpha(0);
      timeText.setAlpha(0);
      mayoText.setAlpha(0);
      btnBg.setAlpha(0);
      btnLabel.setAlpha(0);

      this.tweens.add({
        targets: [title, timeText, mayoText, btnBg, btnLabel],
        alpha: 1,
        duration: 400,
        delay: 200,
      });
    });
  }
}
