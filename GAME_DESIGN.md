# 🎮 Maisha's Adventure - Game Design Document

**Version:** 1.0
**Last Updated:** December 2024
**Project Type:** Birthday Gift / Personal Project

---

## 📖 Table of Contents

1. [Game Overview](#game-overview)
2. [Player Character](#player-character)
3. [Core Mechanics](#core-mechanics)
4. [Levels](#levels)
5. [Enemies](#enemies)
6. [NPCs & Helpers](#npcs--helpers)
7. [Collectibles & Items](#collectibles--items)
8. [UI/UX](#uiux)
9. [Audio](#audio)
10. [Technical Specifications](#technical-specifications)
11. [Asset Pipeline](#asset-pipeline)
12. [Milestones](#milestones)

---

## 🎯 Game Overview

### High Concept
A heartfelt 2D pixel art platformer chronicling Maisha Hussain's life journey from childhood in Worthing to her career in the Civil Service. Players guide Maisha through five themed levels, collecting mayo jars, defeating thematic enemies, and meeting familiar faces along the way.

### Target Experience
- **Tone:** Warm, nostalgic, celebratory, with tongue-in-cheek humour
- **Difficulty:** Casual-friendly, forgiving but engaging
- **Playtime:** ~30 minutes (5-6 minutes per level)
- **Replayability:** Hidden mayo jars, speedrun potential, secret areas

### Visual Style
- **Aesthetic:** 16-bit SNES era / Stardew Valley inspired
- **Tile Size:** 32x32 pixels
- **Colour Palette:** Warm, vibrant, high-contrast pixel art
- **Resolution:** 480x270 native, scaled to fit viewport

---

## 👤 Player Character

### Maisha Hussain

**Visual Description:**
- Height: Short/compact sprite (32x48 pixels including red jumper)
- Skin tone: Warm brown
- Hair: Long black hair to elbows, slight bounce when moving
- Outfit: Signature red jumper, dark trousers
- Face: Round, warm wide brown eyes, friendly expression

**Animations Required:**
| Animation | Frames | Notes |
|-----------|--------|-------|
| Idle | 4 | Subtle breathing, occasional blink |
| Run | 8 | Hair bounces, arms pump |
| Jump | 3 | Anticipation, airborne, landing |
| Fall | 2 | Distinct from jump apex |
| Hurt | 2 | Knockback pose |
| Death | 4 | Comedic, respawn quickly |
| Victory | 6 | Celebration pose, level complete |
| Collect | 2 | Happy grab animation |

**Stats:**
- Health: 3 hits (represented by mayo jars or hearts)
- Lives: Unlimited (checkpoint system)
- Jump Height: 3.5 tiles
- Run Speed: 6 tiles/second

---

## ⚙️ Core Mechanics

### Movement
- **Horizontal:** Smooth acceleration/deceleration (not instant)
- **Jump:** Variable height based on button hold duration
- **Coyote Time:** 100ms grace period after leaving platform
- **Jump Buffer:** 100ms input buffer before landing

### Health System
- 3 HP per life
- Invincibility frames after damage (1.5 seconds)
- Visual flash during i-frames
- Health restored at checkpoints

### Checkpoint System
- Flagpole/signpost checkpoints mid-level
- Auto-save triggers at each checkpoint
- Respawn at last checkpoint on death

### Combat
- **Primary Attack:** Jump on enemies (Mario-style stomp)
- **Bounce:** Successful stomp gives small bounce for chaining
- **No direct attack:** Emphasises platforming over combat

---

## 🗺️ Levels

### Level 1: Worthing
**Theme:** Seaside childhood, sunny beaches, cosy beginnings

**Setting:**
- Beach promenade, pier, residential streets
- Warm sunset palette (oranges, pinks, sandy yellows)
- Background: Sea, beach huts, distant pier

**Layout:**
- Tutorial section teaching basic movement
- Beach platforming with gentle slopes
- Pier section with moving platforms
- Duration: ~5 minutes

**Enemies:**
- Wasps (general enemy, introduced here)
- Crabs (slow, predictable patrol)

**NPCs/Helpers:**
- Family members giving encouragement
- Beach shop keeper (hint giver)

**Unique Elements:**
- Sand that slightly slows movement
- Beach ball bouncy platforms
- Ice cream van checkpoint

**Mayo Jars:** 15 (5 hidden)

---

### Level 2: Brighton
**Theme:** Vibrant chaos, seagulls, urban seaside

**Setting:**
- The Lanes (narrow shopping streets)
- Brighton Pier
- Seafront with groynes
- Quirky shops and street art backgrounds

**Layout:**
- Vertical sections climbing buildings
- Narrow alley platforming
- Pier section with carnival elements
- Duration: ~5 minutes

**Enemies:**
- **Seagulls** (NEW) - Dive-bomb attack pattern, steal mayo if they hit you
- Wasps
- Pigeons (ground-based nuisance)

**NPCs/Helpers:**
- Brighton friends
- Busker who gives tips
- Chip shop owner (health restore)

**Unique Elements:**
- Seagull swooping in foreground (visual gag)
- Moving carousel platforms on pier
- Fish & chips collectible power-up (temporary invincibility)

**Mayo Jars:** 18 (6 hidden)

---

### Level 3: Varndean School (IB Years)
**Theme:** Academic challenge, school life, boss battle

**Setting:**
- School corridors and classrooms
- Library
- Chemistry lab (boss arena)
- School grounds

**Layout:**
- Locker maze section
- Library with book-stack platforming
- Science wing leading to boss
- Duration: ~6 minutes (includes boss)

**Enemies:**
- **Exam Papers** (NEW) - Float and swoop, paper airplane attack
- **Flying Textbooks** - Heavy, slow, deals more damage
- Wasps (in outdoor sections)

**NPCs/Helpers:**
- Classmates cheering from background
- Friendly teacher giving hints before boss

**Boss Battle: Nicki (Chemistry Teacher)**

*Phase 1:*
- Nicki throws beakers that shatter into hazard puddles
- Pattern: Throw-throw-pause, jump to avoid splash
- 3 hits to advance

*Boss Arena:*
- Chemistry lab with elevated platforms
- Bunsen burner hazards (timed flames)
- Periodic table decoration in background

**Victory:** Sean congratulate Maisha, IB diploma appears

**Mayo Jars:** 20 (7 hidden)

---

### Level 4: UCL London
**Theme:** University life, big city exploration

**Setting:**
- UCL campus (main quad inspired)
- London streets
- Student union / social spaces
- Library

**Layout:**
- Campus exploration (semi-open)
- London rooftop platforming section
- Underground/tube inspired section
- Duration: ~5 minutes

**Enemies:**
- **Dissertation Deadlines** (NEW) - Clock-faced enemies that speed up near you
- Wasps
- Pigeons (London variant, more aggressive)

**NPCs/Helpers:**
- University friends
- Librarian (save point)
- Street food vendor (power-up)

**Unique Elements:**
- Red bus moving platforms
- Tube train timing puzzle
- UCL portico in background
- Rain effects (visual only)

**Mayo Jars:** 20 (7 hidden)

---

### Level 5: Civil Service
**Theme:** Bureaucratic surrealism, office adventure

**Setting:**
- Government office building
- Endless corridors of paperwork
- Meeting rooms
- Rooftop finale

**Layout:**
- Cubicle maze
- Filing cabinet platforming (drawers slide in/out)
- Meeting room gauntlet
- Rooftop celebration area
- Duration: ~5 minutes

**Enemies:**
- **Bureaucracy Monsters** (NEW) - Stamp-wielding, slow but persistent
- **Rogue Emails** - Fast, erratic movement
- **Red Tape** - Static hazard, blocks paths until removed
- Wasps (even here, they find a way)

**NPCs/Helpers:**
- Work colleagues
- Friendly manager (checkpoint)
- IT support (gives power-up)

**Unique Elements:**
- Printer that shoots paper (hazard/platform hybrid)
- Coffee cup collectible (speed boost)
- Swivel chair transport sections
- Water cooler checkpoints

**Final Section:**
- Rooftop celebration
- Fireworks in background
- All collected friends appear
- Transition to credits

**Mayo Jars:** 22 (8 hidden)

---

## 👾 Enemies

### Universal Enemy: Wasps
**Behaviour:** Present in ALL levels as a persistent nuisance
- Patrol pattern: Figure-8 or horizontal sweep
- Speed: Medium
- Damage: 1 HP
- Defeat: Single stomp

**Visual:** Classic black and yellow pixel wasp, angry expression, visible stinger

### Enemy Summary Table

| Enemy | Level | Behaviour | HP | Damage | Points |
|-------|-------|-----------|-----|--------|--------|
| Wasp | All | Patrol/chase | 1 | 1 | 100 |
| Crab | 1 | Ground patrol | 1 | 1 | 50 |
| Seagull | 2 | Dive-bomb | 1 | 1 | 150 |
| Pigeon | 2, 4 | Ground waddle | 1 | 1 | 50 |
| Exam Paper | 3 | Float/swoop | 1 | 1 | 100 |
| Textbook | 3 | Heavy float | 2 | 2 | 200 |
| Deadline | 4 | Speed chase | 1 | 1 | 150 |
| Bureaucracy Monster | 5 | Slow chase | 2 | 1 | 200 |
| Rogue Email | 5 | Erratic | 1 | 1 | 100 |

### Boss: Nicki
- **Nicki HP:** 6 (3 Phase 1, 3 Phase 2)
- **Damage:** 1 per hit
- **Defeat:** Stomp on head when vulnerable (after attack)

---

## 🤝 NPCs & Helpers

NPCs provide:
- Dialogue (speech bubbles, 2-3 lines max)
- Hints about upcoming challenges
- Lore/jokes about Maisha's life
- Occasional power-ups

**NPC Types:**
1. **Stationary:** Stand in place, interact to talk
2. **Wandering:** Move in small area, ambient life
3. **Checkpoint:** Mark save locations

*Note: Provide details on specific friends/family to include, and I can flesh out their appearances and dialogue.*

---

## 🫙 Collectibles & Items

### Mayo Jars (Primary Collectible)
- **Total in game:** 95 (33 hidden)
- **Purpose:** Score, completion percentage, unlock credits content
- **Visual:** Classic mayo jar with label, slight glow/sparkle
- **Collection:** Touch to collect, satisfying pop sound

### Bonus Thresholds
| Mayo Collected | Reward |
|----------------|--------|
| 50% | Bonus art in credits |
| 75% | Photo slideshow unlock |
| 100% | Secret birthday message |

### Power-Ups

| Item | Effect | Duration | Levels |
|------|--------|----------|--------|
| Fish & Chips | Invincibility | 8 seconds | 1, 2 |
| Coffee | Speed boost | 10 seconds | 4, 5 |
| Textbook Shield | Block 1 hit | Until hit | 3 |
| Birthday Cake | Full heal | Instant | Hidden |

---

## 🖥️ UI/UX

### Main Menu
```
┌─────────────────────────────────┐
│                                 │
│    [Pixel Art Logo]             │
│    MAISHA'S ADVENTURE           │
│                                 │
│    ► New Game                   │
│      Continue                   │
│      Credits                    │
│                                 │
│    [Maisha idle animation]      │
│                                 │
└─────────────────────────────────┘
```

### HUD (In-Game)
```
┌─────────────────────────────────────────┐
│ [♥][♥][♥]              [🫙] x 42        │
│                                         │
│                                         │
│             GAME AREA                   │
│                                         │
│                                         │
│                        WORTHING  1-1    │
└─────────────────────────────────────────┘
```

- Health: Top-left (hearts or mini mayo jars)
- Mayo Count: Top-right
- Level Name: Bottom-right (fades after 3 seconds)

### Pause Menu
- Resume
- Restart Level
- Settings (SFX/Music volume)
- Quit to Menu

### Level Complete Screen
```
┌─────────────────────────────────┐
│                                 │
│     ★ LEVEL COMPLETE ★          │
│                                 │
│     Mayo Collected: 15/20       │
│     Time: 4:32                  │
│     New Best!                   │
│                                 │
│     ► Next Level                │
│       Replay                    │
│       Menu                      │
│                                 │
└─────────────────────────────────┘
```

### Credits Scene
- Scrolling credits with pixel art vignettes
- Names of contributors
- Special birthday message
- Photo montage (if 75%+ mayo collected)
- Secret message (if 100% mayo)

---

## 🎵 Audio

### Music Style
- Chiptune / lo-fi pixel game soundtrack
- Each level has unique theme
- 30-60 second loops

### Track List
| Track | Use | Mood |
|-------|-----|------|
| Main Theme | Menu | Upbeat, welcoming |
| Worthing | Level 1 | Nostalgic, warm |
| Brighton | Level 2 | Energetic, chaotic |
| School Days | Level 3 | Quirky, determined |
| Boss Battle | Level 3 Boss | Intense, fun |
| London Calling | Level 4 | Urban, exciting |
| 9 to 5 | Level 5 | Satirical, upbeat |
| Victory | Level Complete | Triumphant, short |
| Credits | Credits | Emotional, celebratory |

### Sound Effects
- Jump, land, stomp
- Collect mayo (satisfying pop)
- Enemy defeat (boing)
- Damage taken (oof)
- Checkpoint reached (chime)
- Menu select/confirm
- Boss damage/defeat

### Sources
- [Freesound.org](https://freesound.org) - CC sound effects
- [OpenGameArt.org](https://opengameart.org) - Chiptune music
- Generate custom with [BeepBox](https://www.beepbox.co/) or [Bosca Ceoil](https://boscaceoil.net/)

---

## 🔧 Technical Specifications

### Engine & Framework
- **Game Engine:** Phaser 3.60+
- **Build Tool:** Vite 5.x
- **Language:** TypeScript 5.x
- **State Management:** Phaser's built-in scene system

### Target Performance
- 60 FPS on modern browsers
- 30 FPS minimum on older devices
- Target file size: <50MB total

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Save Data Structure
```typescript
interface SaveData {
  version: string;
  currentLevel: number;
  checkpointId: string | null;
  mayoCollected: {
    [levelId: string]: string[]; // array of collected mayo IDs
  };
  totalMayo: number;
  bestTimes: {
    [levelId: string]: number; // milliseconds
  };
  settings: {
    musicVolume: number;
    sfxVolume: number;
  };
}
```

### Key Systems

**Scene Flow:**
```
Boot → Preloader → Menu ─┬→ Game → Level Complete → (next level)
                         │                ↓
                         │           Credits (after final level)
                         │                ↓
                         └← Quit ←── Menu
```

**Physics:**
- Phaser Arcade Physics
- Gravity: 800
- Tile collision via tilemap layer
- One-way platforms supported

---

## 🎨 Asset Pipeline

### Sprite Creation Workflow

1. Sketch character/object concept
2. Create in Aseprite/Piskel at 32x32
3. Animate with 2-8 frames
4. Export as spritesheet PNG
5. Define in Phaser atlas JSON

### Tilemap Workflow

1. Create tileset image (32x32 per tile)
2. Import into Tiled Map Editor
3. Design level with multiple layers:
   - Background (parallax)
   - Midground (decorative)
   - Platforms (collision)
   - Foreground (overlay)
   - Objects (spawn points, collectibles)
4. Export as JSON
5. Load in Phaser

### Recommended Kenney Assets

- [Pixel Platformer](https://kenney.nl/assets/pixel-platformer) - Base tiles
- [Pixel Platformer Characters](https://kenney.nl/assets/pixel-platformer-characters) - Reference for Maisha
- [Game Icons](https://kenney.nl/assets/game-icons) - UI elements
- [Input Prompts Pixel](https://kenney.nl/assets/input-prompts-pixel-16) - Control hints

### Custom Assets Needed

- [ ] Maisha sprite (all animations)
- [ ] Level-specific enemies
- [ ] Boss sprites (Nicki & Sean)
- [ ] Mayo jar collectible
- [ ] NPC sprites (friends/family)
- [ ] Level-specific tilesets (at least accent pieces)

---

## 📅 Milestones

### Phase 1: Foundation (Week 1)
- [ ] Project setup (Vite + Phaser + TypeScript)
- [ ] Basic scene structure
- [ ] Player movement and physics
- [ ] Placeholder sprites
- [ ] Single test level playable

### Phase 2: Core Loop (Week 2)
- [ ] Enemy base class and wasp implementation
- [ ] Mayo collection system
- [ ] Health and damage
- [ ] Checkpoint system
- [ ] Save/Load functionality
- [ ] Basic HUD

### Phase 3: Content - Levels 1-2 (Week 3)
- [ ] Worthing level design and tilemap
- [ ] Brighton level design and tilemap
- [ ] Seagull enemy
- [ ] Level-specific assets

### Phase 4: Content - Level 3 + Boss (Week 4)
- [ ] Varndean level design
- [ ] Exam paper / textbook enemies
- [ ] Nicki boss battle
- [ ] Boss UI and phases

### Phase 5: Content - Levels 4-5 (Week 5)
- [ ] UCL level design
- [ ] Civil Service level design
- [ ] Remaining enemy types
- [ ] All NPCs implemented

### Phase 6: Polish (Week 6)
- [ ] Maisha sprite finalised
- [ ] All custom art complete
- [ ] Audio implementation
- [ ] Menu polish
- [ ] Credits scene
- [ ] Playtesting and balance

### Phase 7: Ship It! 🚀
- [ ] Production build
- [ ] Deploy to Digital Ocean
- [ ] Domain setup and SSL
- [ ] Final testing
- [ ] Birthday delivery!

---

## 📝 Notes for Claude Code Sessions

When working with Claude Code, break tasks into focused sessions:

1. **Session: Setup** - "Set up the project scaffold with Phaser 3, Vite, TypeScript"
2. **Session: Player** - "Create the Player class with movement and animation"
3. **Session: Level** - "Build the tilemap loader and create Worthing level"
4. **Session: Enemies** - "Implement enemy base class and Wasp enemy"
5. **Session: Boss** - "Create the Nicki & Sean boss battle for Level 3"
6. **Session: Save System** - "Implement localStorage save/load with checkpoints"
7. **Session: UI** - "Build the HUD, menus, and level complete screen"
8. **Session: Audio** - "Add music and sound effect systems"
9. **Session: Polish** - "Add screen shake, particles, and juice"

---

*This document is a living reference. Update as the game evolves!*

---

**Happy Building! 🎮🎂**