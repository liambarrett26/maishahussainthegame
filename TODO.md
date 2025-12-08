# Maisha's Adventure - Project TODO

## Overview
A personalised 2D pixel art platformer birthday gift for Maisha Hussain.  
**Target:** ~30 minute playthrough, 5 levels, polished pixel art aesthetic.

---

## 🎯 Phase 1: Core Integration & Polish (Priority: HIGH)

### 1.1 Integrate New Sprite Assets
- [ ] Add sprite files to `public/assets/sprites/`:
  - `maisha.png` + `maisha.json` (player - 19 frames)
  - `mayo.png` + `mayo.json` (collectible - 4 frames)
  - `wasp.png` + `wasp.json` (enemy - 2 frames)
- [ ] Update `BootScene.ts` to load atlas files with `this.load.atlas()`
- [ ] Update `Player.ts` to use Maisha sprite with animations:
  - `idle`: frames idle_0 to idle_3, 8fps, loop
  - `run`: frames run_0 to run_5, 12fps, loop
  - `jump`: frames jump_0 to jump_2, 10fps, no loop
  - `hurt`: frames hurt_0 to hurt_1, 8fps, no loop
  - `victory`: frames victory_0 to victory_3, 8fps, loop
- [ ] Update `Wasp.ts` to use wasp sprite with wing flap animation
- [ ] Create `MayoJar.ts` collectible class with bobbing animation

### 1.2 Visual Polish - Menu System
- [ ] Design pixel art title logo "MAISHA'S ADVENTURE"
- [ ] Create animated menu background (parallax clouds/scenery)
- [ ] Style menu buttons with pixel art aesthetic:
  - Hover states with color shift/glow
  - Press states with slight offset
  - Pixel font (e.g., Press Start 2P, Pixelify Sans)
- [ ] Add Maisha idle animation on menu screen
- [ ] Menu transitions (fade in/out, slide effects)
- [ ] Add subtle background music loop

### 1.3 Visual Polish - HUD
- [ ] Design pixel art health hearts (3 states: full, half, empty)
- [ ] Design mayo jar counter icon
- [ ] Style HUD with semi-transparent backing
- [ ] Add pickup animation (mayo count bounces on collect)
- [ ] Level name intro text with typewriter effect
- [ ] Screen flash on damage

### 1.4 Visual Polish - Game Feel ("Juice")
- [ ] Screen shake on:
  - Player damage
  - Enemy stomp
  - Boss hits
- [ ] Particle effects:
  - Dust clouds on land/run
  - Sparkles on mayo collect
  - Impact stars on enemy defeat
- [ ] Squash & stretch on player jump/land
- [ ] Smooth camera follow with slight lag
- [ ] Parallax backgrounds (3 layers minimum)

---

## 🗺️ Phase 2: Level Design & Content

### 2.1 Tileset Creation/Acquisition
- [ ] Source or create tilesets for each level theme:
  - **Worthing**: Beach, pier, promenade, residential
  - **Brighton**: Urban, The Lanes, pier carnival, seafront
  - **Varndean**: School corridors, classrooms, chemistry lab
  - **UCL**: University campus, London streets, library
  - **Civil Service**: Office, cubicles, meeting rooms
- [ ] Ensure consistent 32x32 tile size
- [ ] Create tileset collision maps

### 2.2 Level 1: Worthing (Tutorial)
- [ ] Design tilemap in Tiled (~3 minutes playtime)
- [ ] Implement tutorial prompts (movement, jump, collect)
- [ ] Place mayo jars (15 total, 5 hidden)
- [ ] Place wasps and crabs (easy patterns)
- [ ] Create crab enemy sprite + class
- [ ] Design beach hut checkpoint sprite
- [ ] Background: Sea, sunset, distant pier
- [ ] Music: Nostalgic, warm chiptune

### 2.3 Level 2: Brighton
- [ ] Design tilemap in Tiled (~5 minutes playtime)
- [ ] Place mayo jars (18 total, 6 hidden)
- [ ] Create seagull enemy:
  - Sprite (dive-bomb animation)
  - AI: Swoop pattern, can steal mayo
- [ ] Moving platforms (carousel, pier rides)
- [ ] Vertical sections (climbing buildings)
- [ ] Background: Colourful shopfronts, pier
- [ ] Music: Energetic, chaotic chiptune

### 2.4 Level 3: Varndean School
- [ ] Design tilemap in Tiled (~6 minutes including boss)
- [ ] Place mayo jars (20 total, 7 hidden)
- [ ] Create exam paper enemy:
  - Sprite (floating paper, paper airplane attack)
  - AI: Float and swoop
- [ ] Create flying textbook enemy:
  - Sprite (heavy book)
  - Takes 2 hits, deals 2 damage
- [ ] **Boss Arena: Chemistry Lab**
- [ ] Background: School hallways, lockers, windows
- [ ] Music: Quirky, determined chiptune
- [ ] Boss music: Intense, fun

### 2.5 Boss Battle: Nicki & Sean
- [ ] Create Nicki sprite (chemistry teacher):
  - Idle, throw beaker, hurt, defeat animations
- [ ] Create Sean sprite (English lit teacher):
  - Idle, throw book, hurt, defeat animations
- [ ] Create beaker projectile sprite + hazard puddle
- [ ] Create book projectile sprite (arc trajectory)
- [ ] Implement boss state machine:
  - **Phase 1**: Nicki alone, throws beakers (3 hits)
  - **Phase 2**: Sean joins, overlapping attacks (4 hits)
- [ ] Boss health bar UI
- [ ] Victory cutscene (diploma appears)
- [ ] Bunsen burner hazards (timed flames)

### 2.6 Level 4: UCL London
- [ ] Design tilemap in Tiled (~5 minutes playtime)
- [ ] Place mayo jars (20 total, 7 hidden)
- [ ] Create dissertation deadline enemy:
  - Sprite (clock-faced creature)
  - AI: Speeds up when near player
- [ ] London pigeon enemy variant
- [ ] Red bus moving platforms
- [ ] Tube train timing puzzle section
- [ ] Background: UCL portico, London skyline
- [ ] Rain particle effect (visual only)
- [ ] Music: Urban, exciting chiptune

### 2.7 Level 5: Civil Service
- [ ] Design tilemap in Tiled (~5 minutes playtime)
- [ ] Place mayo jars (22 total, 8 hidden)
- [ ] Create bureaucracy monster enemy:
  - Sprite (stamp-wielding creature)
  - AI: Slow but persistent
- [ ] Create rogue email enemy:
  - Sprite (angry envelope)
  - AI: Fast, erratic movement
- [ ] Red tape hazards (static obstacles)
- [ ] Filing cabinet platforms (drawers slide)
- [ ] Swivel chair transport sections
- [ ] Printer hazard (shoots paper)
- [ ] Background: Office, windows, motivational posters
- [ ] Music: Satirical, upbeat chiptune

### 2.8 Final Celebration
- [ ] Rooftop finale area after Level 5
- [ ] Fireworks particle effects
- [ ] All NPC friends appear
- [ ] Transition to credits

---

## 👥 Phase 3: NPCs & Dialogue

### 3.1 NPC System Enhancement
- [ ] Design speech bubble UI (pixel art)
- [ ] Implement typewriter text effect
- [ ] Add interaction prompt ("Press E to talk")
- [ ] Portrait system for close-up during dialogue

### 3.2 NPC Sprites (placeholder list - get names from user)
- [ ] Family members (Worthing)
- [ ] Brighton friends
- [ ] School classmates (Varndean)
- [ ] University friends (UCL)
- [ ] Work colleagues (Civil Service)

### 3.3 Dialogue Content
- [ ] Write dialogue for each NPC (2-3 lines each)
- [ ] Include inside jokes and personal references
- [ ] Hint system for hidden mayo jars

---

## 🎵 Phase 4: Audio

### 4.1 Music
- [ ] Menu theme (welcoming, upbeat)
- [ ] Worthing theme (nostalgic, warm)
- [ ] Brighton theme (energetic, chaotic)
- [ ] Varndean theme (quirky, determined)
- [ ] Boss battle theme (intense, fun)
- [ ] UCL theme (urban, exciting)
- [ ] Civil Service theme (satirical, upbeat)
- [ ] Victory jingle (short, triumphant)
- [ ] Credits theme (emotional, celebratory)

### 4.2 Sound Effects
- [ ] Player: jump, land, footsteps, hurt, death
- [ ] Mayo: collect (satisfying pop)
- [ ] Enemies: hit, defeat
- [ ] Boss: damage, phase change, defeat
- [ ] UI: menu select, confirm, cancel
- [ ] Checkpoint: activation chime
- [ ] Level complete: fanfare

### 4.3 Audio System
- [ ] Implement music manager (crossfade between tracks)
- [ ] Settings: music volume slider
- [ ] Settings: SFX volume slider
- [ ] Persist audio settings in SaveManager

---

## 💾 Phase 5: Save System & Progression

### 5.1 Save Data Enhancement
- [ ] Track per-level mayo collection (which specific jars)
- [ ] Best time per level
- [ ] Total play time
- [ ] Boss defeated flags

### 5.2 Level Select (Optional)
- [ ] Unlock levels progressively
- [ ] Show mayo collection per level
- [ ] Show best time per level
- [ ] Replay completed levels

### 5.3 New Game+
- [ ] Option to restart with stats visible
- [ ] Speedrun timer mode

---

## 🎉 Phase 6: Credits & Birthday Message

### 6.1 Credits Scene
- [ ] Scrolling credits with pixel art vignettes
- [ ] Thank you messages
- [ ] "Made with love by [Your Name]"
- [ ] Return to menu option

### 6.2 Birthday Surprises
- [ ] **50% mayo**: Unlock bonus art in credits
- [ ] **75% mayo**: Photo slideshow unlock
- [ ] **100% mayo**: Secret birthday message with custom art
- [ ] Birthday cake collectible (hidden, full heal)

### 6.3 Personal Touches
- [ ] Include real photos (pixelated filter?)
- [ ] Personal messages from friends/family
- [ ] "Happy Birthday Maisha!" finale screen

---

## 🚀 Phase 7: Polish & Deployment

### 7.1 Performance
- [ ] Optimise sprite atlases
- [ ] Lazy load level assets
- [ ] Test on lower-end devices
- [ ] Target 60fps consistently

### 7.2 Testing
- [ ] Playtest each level for timing (~5 mins each)
- [ ] Balance enemy difficulty
- [ ] Check all mayo jars are reachable
- [ ] Test save/load across browser refresh
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

### 7.3 Accessibility
- [ ] Keyboard-only fully playable
- [ ] Gamepad support (nice to have)
- [ ] Readable text sizes
- [ ] Colourblind-friendly UI

### 7.4 Deployment
- [ ] Production build (`npm run build`)
- [ ] Set up Digital Ocean droplet
- [ ] Configure Nginx
- [ ] Set up domain
- [ ] SSL with Let's Encrypt
- [ ] Final testing on live site

---

## 📋 Quick Reference: Asset Checklist

### Sprites Completed ✅
- [x] Maisha (idle, run, jump, hurt, victory)
- [x] Mayo jar (4-frame animation)
- [x] Wasp (2-frame wing flap)

### Sprites Needed
- [ ] Crab (Level 1)
- [ ] Seagull (Level 2)
- [ ] Exam paper (Level 3)
- [ ] Textbook (Level 3)
- [ ] Nicki boss (Level 3)
- [ ] Sean boss assistant (Level 3)
- [ ] Beaker projectile
- [ ] Deadline clock (Level 4)
- [ ] Pigeon (Levels 2, 4)
- [ ] Bureaucracy monster (Level 5)
- [ ] Rogue email (Level 5)
- [ ] Health hearts (HUD)
- [ ] Checkpoint flag/signpost
- [ ] NPCs (various)

### Tilesets Needed
- [ ] Worthing beach/town
- [ ] Brighton urban/pier
- [ ] School interior
- [ ] UCL/London
- [ ] Office interior

---

## 🏁 Definition of Done

The game is complete when:
1. All 5 levels are playable start to finish
2. Boss battle is functional and fun
3. All 95 mayo jars are placed and collectible
4. Save/load works correctly
5. Menu, pause, and credits scenes are polished
6. Music and SFX are implemented
7. Birthday message and unlockables work
8. Game is deployed and accessible via URL
9. Playtime is approximately 30 minutes
10. It makes Maisha smile 🎂

---

*Last updated: December 2024*
