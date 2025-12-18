# Instructions for Claude Code on the Droplet

This file provides instructions for Claude Code when working on the Digital Ocean droplet serving Maisha's Adventure at getmashed.games.

## Server Overview

- **Domain:** getmashed.games
- **Server:** Digital Ocean Droplet (Ubuntu)
- **Web Server:** Nginx
- **SSL:** Let's Encrypt (Certbot)
- **Game Type:** Static Phaser 3 web game (no backend required)

## File Locations

```
/var/www/getmashed.games/     # Production game files (dist output)
/etc/nginx/sites-available/   # Nginx site configurations
/etc/nginx/sites-enabled/     # Enabled site symlinks
/etc/letsencrypt/             # SSL certificates
```

## Common Tasks

### Deploying a New Version

After pulling the latest code from GitHub:

```bash
# Navigate to the project directory
cd /path/to/maishahussainthegame

# Pull latest changes
git pull origin main

# Install dependencies (if package.json changed)
npm install

# Build for production
npm run build

# Copy built files to web root
cp -r dist/* /var/www/getmashed.games/

# Verify deployment
curl -I https://getmashed.games
```

### Checking Nginx Status

```bash
# Check Nginx is running
systemctl status nginx

# Test Nginx configuration
nginx -t

# Reload Nginx (after config changes)
systemctl reload nginx

# View Nginx error logs
tail -f /var/log/nginx/error.log

# View Nginx access logs
tail -f /var/log/nginx/access.log
```

### SSL Certificate Management

```bash
# Check certificate expiry
certbot certificates

# Renew certificates (usually automatic)
certbot renew

# Force renewal
certbot renew --force-renewal
```

### Nginx Configuration

The site config should be at `/etc/nginx/sites-available/getmashed.games`:

```nginx
server {
    listen 80;
    server_name getmashed.games www.getmashed.games;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name getmashed.games www.getmashed.games;

    ssl_certificate /etc/letsencrypt/live/getmashed.games/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/getmashed.games/privkey.pem;

    root /var/www/getmashed.games;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|mp3)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

## Troubleshooting

### Game Not Loading

1. Check if files exist: `ls -la /var/www/getmashed.games/`
2. Check file permissions: `chmod -R 755 /var/www/getmashed.games/`
3. Check Nginx error log: `tail -50 /var/log/nginx/error.log`
4. Verify Nginx is running: `systemctl status nginx`

### 404 Errors for Assets

1. Ensure all assets were copied: `ls -la /var/www/getmashed.games/assets/`
2. Check Nginx config uses correct root path
3. Music files are large - verify they copied: `du -sh /var/www/getmashed.games/assets/music/`

### SSL Issues

1. Check certificate status: `certbot certificates`
2. Verify SSL config in Nginx
3. Force renewal if expired: `certbot renew --force-renewal`
4. Restart Nginx after renewal: `systemctl restart nginx`

### Browser Cache Issues

If changes aren't appearing after deployment:
1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. Clear browser cache
3. Open in incognito/private window
4. Check cache headers: `curl -I https://getmashed.games/assets/index-xxx.js`

## Game-Specific Notes

### Music Files

The game uses MP3 music files (Kevin MacLeod, CC BY 3.0). These are loaded in BootScene and managed by MusicManager. Total music size is ~50MB:

```
assets/music/
├── 8bit_Dungeon_Boss.mp3
├── 8bit_Dungeon_Level.mp3
├── Airship_Serenity.mp3
├── Amazing_Plan.mp3
├── Americana.mp3
├── And_Awaken.mp3
├── Airport_Lounge.mp3
├── Beach_Party.mp3
├── Bit_Quest.mp3
└── Pixelland.mp3
```

### Save Data

Player progress is saved in browser localStorage under `maisha-adventure-save`. This is client-side only - no server involvement.

### Known Issues

- **Back to menu freeze:** Returning to main menu from HUD can occasionally cause a frozen screen. Workaround: refresh browser. This is a Phaser scene transition issue that may need debugging.

## Quick Reference

| Task | Command |
|------|---------|
| Deploy | `npm run build && cp -r dist/* /var/www/getmashed.games/` |
| Check Nginx | `systemctl status nginx` |
| Nginx logs | `tail -f /var/log/nginx/error.log` |
| SSL status | `certbot certificates` |
| Renew SSL | `certbot renew` |
