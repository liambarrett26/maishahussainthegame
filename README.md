# 🎮 Maisha's Adventure

A personalised 2D pixel art platformer birthday gift for Maisha Hussain, taking her through the stages of her life from Worthing to the Civil Service.

**🌐 Play Online:** [getmashed.games](https://getmashed.games)

## 🎂 About

This game was built with love as a birthday present. Join Maisha as she platform-jumps through her life story, collecting mayo jars, avoiding wasps, and facing down memorable bosses along the way.

**Genre:** 2D Pixel Art Platformer
**Engine:** Phaser 3
**Estimated Playtime:** ~30 minutes
**Status:** Complete and deployed!

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/liambarrett26/maishahussainthegame.git
cd maishahussainthegame

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

### Build for Production

```bash
# Create optimised production build
npm run build

# Preview production build locally
npm run preview
```

## 🎯 Game Controls

| Action | Keyboard |
|--------|----------|
| Move Left | `A` or `←` |
| Move Right | `D` or `→` |
| Jump | `Space` or `W` or `↑` |
| Fire Mayo Blaster | `Space` (when equipped) |
| Mayo Mode | `M` (toggle, uses collected mayo) |
| Heal | `H` (uses collected mayo) |
| Pause | `Escape` |

## 🗺️ Levels

1. **Worthing** - Where it all began, seaside vibes
2. **Brighton** - Dodge the seagulls, embrace the chaos
3. **Varndean School** - IB days, exam papers flying, boss battle with Nicki & Sean
4. **UCL London** - University life in the big city
5. **Civil Service** - Bureaucracy monsters and red tape

## 🫙 Collectibles

- **Mayo Jars** - Maisha's favourite condiment, collect them all!
- Hidden mayo jars unlock bonus content in the credits

## 💾 Save System

The game automatically saves your progress to your browser's local storage:
- Current level
- Mayo jars collected
- Checkpoint position

Select "Continue" from the main menu to resume your adventure.

## 🛠️ Development

### Project Structure

```
maishahussainthegame/
├── src/
│   ├── main.ts              # Entry point, Phaser config
│   ├── scenes/
│   │   ├── BootScene.ts     # Asset preloading
│   │   ├── MenuScene.ts     # Main menu (New/Continue)
│   │   ├── GameScene.ts     # Core gameplay logic
│   │   ├── PauseScene.ts    # Pause overlay
│   │   ├── CreditsScene.ts  # Credits & birthday message
│   │   └── levels/          # Level-specific configurations
│   ├── objects/
│   │   ├── Player.ts        # Maisha player class
│   │   ├── enemies/         # Enemy classes
│   │   └── npcs/            # Helper NPCs
│   ├── ui/
│   │   └── HUD.ts           # Mayo counter, health, etc.
│   └── utils/
│       ├── SaveManager.ts   # LocalStorage save/load
│       └── Constants.ts     # Game constants
├── public/
│   └── assets/
│       ├── sprites/         # Character & object sprites
│       ├── tilesets/        # Tilemap assets
│       ├── tilemaps/        # Tiled JSON maps
│       ├── audio/           # Music & SFX
│       └── fonts/           # Pixel fonts
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── GAME_DESIGN.md           # Detailed design document
```

### Creating Tilemaps

We use [Tiled Map Editor](https://www.mapeditor.org/) for level design:

1. Create maps at 32x32 tile size
2. Export as JSON format
3. Place in `public/assets/tilemaps/`

### Adding New Sprites

Sprites should be:
- 32x32 pixels for characters/objects
- 16x16 or 32x32 for tiles
- PNG format with transparency
- Placed in `public/assets/sprites/`

### Asset Sources

- [Kenney.nl](https://kenney.nl/) - Free platformer asset packs
- [OpenGameArt.org](https://opengameart.org/) - CC-licensed sprites
- Custom sprites created in [Aseprite](https://www.aseprite.org/) or [Piskel](https://www.piskelapp.com/)

## 🌐 Deployment (Digital Ocean)

### Setting Up the Droplet

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Install Nginx
apt update && apt install nginx -y

# Install Node.js (for building)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y
```

### Deploy Script

```bash
# On your local machine
npm run build

# Copy dist folder to droplet
scp -r dist/* root@your-droplet-ip:/var/www/maishas-adventure/
```

### Nginx Configuration

Create `/etc/nginx/sites-available/maishas-adventure`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/maishas-adventure;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/maishas-adventure /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🐛 Troubleshooting

**Game won't load assets:**
- Check browser console for 404 errors
- Ensure assets are in `public/assets/` not `src/assets/`

**Save not working:**
- Check localStorage isn't disabled/full
- Try clearing site data and refreshing

**Performance issues:**
- Reduce sprite sheet sizes
- Check for memory leaks in scene transitions

## 📝 License

This is a personal gift project. Assets from Kenney.nl are CC0.
Custom assets and code are shared with love.

## 🎉 Credits

- **For:** Maisha Hussain
- **From:** Liam
- **Made With:** Phaser 3, Vite, TypeScript, and many cups of tea

### Music Credits

All music composed by **Kevin MacLeod** ([incompetech.com](https://incompetech.com))
Licensed under [Creative Commons: By Attribution 3.0](http://creativecommons.org/licenses/by/3.0/)

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

---

*Happy Birthday, Maisha! 🎂*
