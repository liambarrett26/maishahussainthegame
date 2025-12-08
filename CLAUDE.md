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
- **Player:** 3 HP, unlimited lives, checkpoint respawn. Jump stomp combat (no direct attack). Squash/stretch on jump/land.
- **Platforming:** Coyote time (100ms), jump buffer (100ms), variable jump height
- **Save:** LocalStorage with checkpoint auto-save. Tracks level, mayo collected, best times
- **Levels:** Data-driven via `LevelConfig.ts`. Currently 3 levels implemented (Worthing, Brighton, Varndean)

### Project Structure
```
src/
├── main.ts                    # Entry point, Phaser config
├── scenes/
│   ├── BootScene.ts          # Asset loading, animation setup
│   ├── MenuScene.ts          # Animated menu with parallax background
│   ├── GameScene.ts          # Core gameplay, level loading
│   ├── PauseScene.ts         # Pause overlay
│   ├── CreditsScene.ts       # Credits with animated Maisha
│   └── levels/
│       └── LevelConfig.ts    # Level data (platforms, mayo, enemies, checkpoints)
├── objects/
│   ├── Player.ts             # Maisha with animations & state machine
│   ├── collectibles/
│   │   ├── MayoJar.ts        # Collectible with particles & sound
│   │   └── Checkpoint.ts     # Checkpoint flags with save system
│   ├── enemies/
│   │   └── Wasp.ts           # Patrol/chase AI with stomp detection
│   └── npcs/
│       └── NPC.ts            # Dialogue system (placeholder)
├── ui/
│   └── HUD.ts                # Pixel art hearts + mayo counter
└── utils/
    ├── SaveManager.ts        # LocalStorage persistence
    └── Constants.ts          # Game constants

public/assets/sprites/
├── maisha.png + maisha.json  # Player atlas (idle, run, jump, hurt, victory)
├── mayo.png + mayo.json      # Collectible atlas (bobbing animation)
└── wasp.png + wasp.json      # Enemy atlas (flying animation)
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

Uses Web Audio API directly for synthesized sounds:
- Mayo collect: Rising sine wave
- Checkpoint activate: Rising chime sequence
- Wasp death: Descending square wave
