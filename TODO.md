# Maisha's Adventure - Project TODO

## Overview
A personalised 2D pixel art platformer birthday gift for Maisha Hussain.
**Target:** ~30 minute playthrough, 5 levels, polished pixel art aesthetic.

---

## CURRENT STATUS: Complete! 🎉

### Completed Features:
- **5 Levels**: Worthing, Brighton, Varndean, UCL London, Civil Service
- **Enemies**: Wasps, Seagulls, Drunk Students, Bureaucrats (with speech bubbles)
- **Final Boss**: Giant Wasp at 10 Downing Street (2 phases, 20 HP, multiple attack patterns)
- **Weapons**: Mayo Blaster (fires mayo projectiles)
- **NPCs**: Friend characters that follow Maisha through levels
- **Collectibles**: Mayo jars, checkpoints, bats
- **Polish**: Squash/stretch animations, particle effects, screen shake
- **Supreme Ruler Victory**: Epic finale with fireworks and fanfare
- **Music System**: Level-specific background music (Kevin MacLeod, CC BY 3.0)
- **Info Popups**: First-encounter explanations for enemies and items
- **Mayo Mode**: Toggle invincibility using collected mayo (M key)
- **Heal System**: Use collected mayo to heal (H key)

---

## REMAINING TASKS

### A. First-Time Encounter Info Popups ✅ COMPLETE

Implemented `InfoPopup` class in `src/ui/InfoPopup.ts`:
- [x] **Wasp** (Level 1) - "WASP! Jump on its head to defeat it. Avoid touching from the sides!"
- [x] **Seagull** (Level 2) - "SEAGULL! These dive-bomb from above. Time your jumps carefully!"
- [x] **Drunk Student** (Level 4) - "DRUNK STUDENT! They stumble unpredictably. Keep your distance!"
- [x] **Bureaucrat** (Level 5) - "BUREAUCRAT! Slow but persistent. Watch out for red tape!"
- [x] ~~Giant Wasp~~ (NO popup - boss encounter remains dramatic)
- [x] **Mayo Blaster Pickup** - "MAYO BLASTER! Press SPACE to fire."
- [x] **Checkpoint** (first encounter) - "CHECKPOINT! Your progress has been saved."

Features:
- Pauses game during display
- Semi-transparent overlay with enemy/item sprite
- "Press ENTER to continue" prompt
- Tracked in SaveManager (shownPopups array) - only shows once per playthrough

---

### B. Digital Ocean Deployment (Priority: HIGH)

Deploy the game to the wide world web!

#### Pre-Deployment Checklist:
- [ ] Run `npm run build` and verify no errors
- [ ] Test production build locally with `npm run preview`
- [ ] Ensure all assets load correctly
- [ ] Test save/load functionality
- [ ] Cross-browser test (Chrome, Firefox, Safari)

#### Digital Ocean Droplet Setup:
- [ ] Create Ubuntu droplet (Basic, $6/mo should suffice)
- [ ] SSH into droplet and secure it:
  - [ ] Create non-root user
  - [ ] Set up SSH key authentication
  - [ ] Configure firewall (UFW)
- [ ] Install Node.js (for building, if needed)
- [ ] Install Nginx

#### Nginx Configuration:
- [ ] Create site config in `/etc/nginx/sites-available/`
- [ ] Set up static file serving from `/var/www/maisha-game/`
- [ ] Enable gzip compression
- [ ] Set proper cache headers for assets
- [ ] Symlink to sites-enabled
- [ ] Test Nginx config: `nginx -t`

#### Domain & SSL:
- [ ] Point domain/subdomain to droplet IP
- [ ] Install Certbot
- [ ] Obtain SSL certificate: `certbot --nginx -d yourdomain.com`
- [ ] Verify HTTPS works
- [ ] Set up auto-renewal: `certbot renew --dry-run`

#### Deployment Script:
- [ ] Create deployment script or document process:
  ```bash
  # Local: Build the project
  npm run build

  # Local: Upload to server
  scp -r dist/* user@server:/var/www/maisha-game/

  # Or use rsync for incremental updates
  rsync -avz --delete dist/ user@server:/var/www/maisha-game/
  ```

#### Final Testing:
- [ ] Access game via domain
- [ ] Test on mobile browsers
- [ ] Verify SSL certificate (green padlock)
- [ ] Test complete playthrough
- [ ] Share URL with Maisha!

---

## Nice-to-Have (Future Enhancements)

### Polish
- [x] Background music for each level ✅ (Kevin MacLeod tracks integrated via MusicManager)
- [ ] More sound effects variety
- [ ] Mobile touch controls
- [ ] Gamepad support

### Content
- [ ] 100% mayo completion secret ending
- [ ] Time trial mode
- [ ] Photo slideshow in credits

---

## Quick Reference: What's Done

### Sprites Completed
- [x] Maisha (idle, run, jump, hurt, victory)
- [x] Mayo jar (animated)
- [x] Wasp (flying animation)
- [x] Seagull (flying, diving)
- [x] Drunk Student (stumbling states)
- [x] Bureaucrat (walking, speech bubbles)
- [x] Giant Wasp Boss (crowned, 2 phases)
- [x] Mayo Blaster weapon + projectiles
- [x] Checkpoint flags
- [x] NPC Friends

### Levels Completed
- [x] Level 1: Worthing (beach, train station)
- [x] Level 2: Brighton (pier, bus stop)
- [x] Level 3: Varndean (school, library, graduation)
- [x] Level 4: UCL London (university, drunk students)
- [x] Level 5: Civil Service (office, 10 Downing Street, boss battle)

### Systems Completed
- [x] Player movement with coyote time & jump buffer
- [x] Combat (stomp enemies)
- [x] Health system (3 HP)
- [x] Checkpoint saving
- [x] Mayo collection tracking
- [x] Boss battle system
- [x] Weapon system (Mayo Blaster)
- [x] Enemy AI (patrol, chase, attack patterns)
- [x] Victory sequence ("Supreme Ruler of the Universe")

---

## Definition of Done

The game is complete when:
1. [x] All 5 levels are playable start to finish
2. [x] Boss battle is functional and fun
3. [x] Save/load works correctly
4. [x] Menu, pause, and credits scenes work
5. [x] **Info popups explain new mechanics**
6. [x] **Game is deployed and accessible via URL** → [getmashed.games](https://getmashed.games)
7. It makes Maisha smile!

---

*Last updated: December 2024*
