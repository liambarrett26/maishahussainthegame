# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personalised 2D pixel art platformer built as a birthday gift, using Phaser 3, Vite, and TypeScript. The game chronicles Maisha's journey through 5 levels: Worthing, Brighton, Varndean School, UCL London, and Civil Service.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:5173)
npm run build        # Create production build
npm run preview      # Preview production build locally
```

## Architecture

**Engine:** Phaser 3.60+ with Arcade Physics (gravity: 800)
**Build:** Vite 5.x
**Resolution:** 480x270 native, scaled to viewport

### Scene Flow
```
Boot → Menu → Game → Level Complete → (next level or Credits)
```

### Key Systems
- **Player:** 3 HP, unlimited lives, checkpoint respawn. Jump stomp combat + Mayo Blaster weapon. Squash/stretch on jump/land.
- **Platforming:** Coyote time (100ms), jump buffer (100ms), variable jump height
- **Save:** LocalStorage with checkpoint auto-save. Tracks level, mayo collected, shown popups
- **Levels:** Data-driven via `LevelConfig.ts`. All 5 levels implemented (Worthing, Brighton, Varndean, UCL, Civil Service)
- **Music:** MusicManager singleton handles level-specific tracks (Kevin MacLeod, CC BY 3.0)
- **Info Popups:** First-encounter explanations for enemies/items (tracked in save data)
- **Mayo Mode:** Toggle invincibility (M key), Heal (H key) - uses collected mayo

### Project Structure
```
src/
├── main.ts                    # Entry point, Phaser config
├── scenes/
│   ├── BootScene.ts          # Asset loading, animation setup, music loading
│   ├── MenuScene.ts          # Animated menu with parallax background
│   ├── GameScene.ts          # Core gameplay, level loading, pit death handling
│   ├── PauseScene.ts         # Pause overlay
│   ├── CreditsScene.ts       # Credits with animated Maisha + music credit
│   └── levels/
│       └── LevelConfig.ts    # Level data (platforms, mayo, enemies, checkpoints)
├── objects/
│   ├── Player.ts             # Maisha with animations, state machine, Mayo Blaster
│   ├── collectibles/
│   │   ├── MayoJar.ts        # Collectible with particles & sound
│   │   └── Checkpoint.ts     # Checkpoint flags with save system
│   ├── enemies/
│   │   ├── Wasp.ts           # Patrol/chase AI with stomp detection
│   │   ├── Seagull.ts        # Dive-bomb attack pattern
│   │   ├── DrunkStudent.ts   # Unpredictable stumbling movement
│   │   ├── Bureaucrat.ts     # Slow pursuit with speech bubbles
│   │   └── GiantWasp.ts      # Final boss (2 phases, 20 HP)
│   └── npcs/
│       └── NPC.ts            # Friend NPCs that follow Maisha
├── ui/
│   ├── HUD.ts                # Hearts, mayo counter, mayo mode/heal hints
│   └── InfoPopup.ts          # First-encounter explanation popups
└── utils/
    ├── SaveManager.ts        # LocalStorage persistence + popup tracking
    ├── MusicManager.ts       # Centralized music control (play, stop, fadeOut)
    └── Constants.ts          # Game constants, scene names, level IDs

public/assets/
├── sprites/                   # Character & object sprite atlases
├── music/                     # Kevin MacLeod MP3 tracks (CC BY 3.0)
└── ...
```

## Sprite Assets

All sprites use Phaser atlas format (JSON + PNG). Animations defined in BootScene:
- `maisha-idle` (8fps), `maisha-run` (12fps), `maisha-jump` (10fps), `maisha-hurt` (8fps), `maisha-victory` (8fps)
- `mayo-bob` (6fps)
- `wasp-fly` (12fps)

## Level System

Levels are defined in `src/scenes/levels/LevelConfig.ts`:
- Platforms: static ground, elevated platforms, moving platforms
- Collectibles: mayo jars with unique IDs for save tracking
- Enemies: wasps with patrol/chase behavior
- Checkpoints: flagpoles that save progress
- Decorations: shells, beachballs, rocks, flowers

## Adding a New Level

1. Add level ID to `Constants.ts` LEVELS object
2. Create LevelData object in `LevelConfig.ts` with:
   - Background colors and features (clouds, water)
   - Platform configs (x, y, width, type)
   - Mayo jar positions with unique IDs
   - Wasp spawn points
   - Checkpoint locations
   - Decoration positions
3. Add to LEVEL_DATA record
4. Set as `nextLevel` in previous level

## Sound System

### Synthesized SFX (Web Audio API)
- Mayo collect: Rising sine wave
- Checkpoint activate: Rising chime sequence
- Enemy death: Descending square wave
- Fall death: Descending tone

### Music (Kevin MacLeod, CC BY 3.0)
Managed via `MusicManager.ts` singleton:
- Menu: "Airship Serenity"
- Worthing: "Beach Party"
- Brighton: "Bit Quest"
- Varndean: "Amazing Plan"
- UCL: "Airport Lounge"
- Civil Service: "Americana"
- Boss Battle: "8bit Dungeon Boss"
- Exam Challenge: "8bit Dungeon Level"
- Credits: "And Awaken"
- Victory: "Pixelland"

## Enemy Types

| Enemy | Level | Behavior |
|-------|-------|----------|
| Wasp | 1-5 | Patrol/chase, defeatable by stomp |
| Seagull | 2 | Dive-bomb attacks from above |
| Drunk Student | 4 | Unpredictable stumbling |
| Bureaucrat | 5 | Slow pursuit, speech bubbles |
| Giant Wasp | 5 (Boss) | 2 phases, 20 HP, multiple attack patterns |

## Known Issues

- Back to main menu from HUD can cause frozen screen (workaround: refresh browser)
