# ⚙️ PM2 Deployment Guide — CampusCare CTF

> Everything you need to start, manage, and stop CampusCare on a school LAN using PM2.

---

## 📋 Prerequisites

Run these checks on the **host PC** before starting:

```powershell
node -v      # Must be ≥ 18
npm -v       # Should be ≥ 9
pm2 -v       # Install if missing ↓
```

**Install PM2 globally (one-time):**
```powershell
npm install -g pm2
```

---

## 🚀 Quick Start (Every Session)

```powershell
# 1. Build the app (only needed if code changed)
npm run build

# 2. Start with PM2
pm2 start ecosystem.config.js

# 3. Check it's running
pm2 status

# 4. Find your LAN IP to share with teams
ipconfig
```

Share this URL with everyone:
```
http://<YOUR-IP>:3000
```

---

## 🔥 Windows Firewall (One-Time Setup)

Run in **PowerShell as Administrator** to allow other PCs to connect:

```powershell
New-NetFirewallRule `
  -DisplayName "CampusCare CTF" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 3000 `
  -Action Allow
```

To remove the rule after the event:
```powershell
Remove-NetFirewallRule -DisplayName "CampusCare CTF"
```

---

## 🛠️ PM2 Command Reference

| Command | What it does |
|---------|-------------|
| `pm2 start ecosystem.config.js` | Start the app |
| `pm2 status` | Show running apps + memory |
| `pm2 logs campuscare` | Live logs (Ctrl+C to exit) |
| `pm2 logs campuscare --lines 50` | Last 50 log lines |
| `pm2 restart campuscare` | Restart (apply code changes) |
| `pm2 reload campuscare` | Zero-downtime reload |
| `pm2 stop campuscare` | Stop the app |
| `pm2 delete campuscare` | Remove from PM2 list |
| `pm2 monit` | Interactive CPU/memory monitor |

---

## 📁 Log Files

Logs are written to `./logs/` in the project directory:

| File | Contents |
|------|----------|
| `logs/out.log` | Standard output (page loads, API calls) |
| `logs/error.log` | Errors and crashes |

**Tail logs live:**
```powershell
pm2 logs campuscare
```

**Clear logs (if they get large):**
```powershell
pm2 flush campuscare
```

---

## 🔁 Rebuild After Code Changes

If you edit any source files, you must rebuild before the changes take effect:

```powershell
pm2 stop campuscare
npm run build
pm2 start ecosystem.config.js
```

> ⚠️ `pm2 restart` alone will NOT pick up code changes — you must rebuild first.

---

## 🩺 Troubleshooting

### App shows `stopped` with many restarts

```powershell
pm2 logs campuscare --lines 30
```

Common causes:
| Error | Fix |
|-------|-----|
| `SyntaxError: missing ) after argument list` | Using bash `.bin/next` on Windows — the `ecosystem.config.js` already uses `node_modules/next/dist/bin/next` to avoid this |
| `EADDRINUSE: port 3000` | Another process is on 3000. Run `pm2 delete campuscare` then `pm2 start ecosystem.config.js` |
| `Cannot find module` | Run `npm install` first |
| Build errors | Run `npm run build` and fix any TypeScript errors |
| DB errors | Delete `campus.db*` files — the app recreates them on next start |

### Other PCs can't connect

1. Check the firewall rule exists: `Get-NetFirewallRule -DisplayName "CampusCare CTF"`
2. Confirm all PCs are on the **same Wi-Fi/LAN switch**
3. Try pinging the host from another PC: `ping 192.168.1.x`
4. Confirm the app is running: `pm2 status` (should show `online`)

### app crashes immediately

```powershell
# Check if the build exists
ls .next

# If missing, build first
npm run build
pm2 start ecosystem.config.js
```

---

## 🔄 Between Rounds Reset

To give teams a clean slate between rounds:

1. Open `http://<HOST-IP>:3000/admin/reset`
2. Password: `breach@trix2025`
3. Click **Reset All ⚡**

This clears:
- ✅ All server-side patches (SQLite `patches` table)
- ✅ All server-side attack logs (SQLite `attacks` table)
- ✅ Browser localStorage on the admin PC
- ⚡ All other PCs resync automatically within **3 seconds** — no refresh needed

To also wipe the entire database (clear all XSS notices, flags, users back to seed):
```powershell
pm2 stop campuscare
del campus.db
del campus.db-shm
del campus.db-wal
pm2 start ecosystem.config.js
```

---

## 🌐 Network Architecture

```
        ┌─────────────────────────┐
        │   HOST PC (this machine) │
        │   pm2 → next start       │
        │   http://0.0.0.0:3000    │
        └────────────┬────────────┘
                     │  LAN / Wi-Fi
          ┌──────────┼──────────┐
          │          │          │
   [ATK PC 1]  [ATK PC 2]  [DEF PC 1]  [DEF PC 2]
   browser       browser     browser     browser
   :3000          :3000       :3000/defense :3000/defense
```

**Shared server state (all PCs see the same data):**
- Patch status → `patches` table in `campus.db`
- Real attack events → `attacks` table in `campus.db`
- User sessions / flags / notices → other tables in `campus.db`

---

## ⚡ One-Time Setup Cheatsheet

```powershell
# Run once on the host PC before the event
npm install -g pm2
npm install
npm run build
mkdir logs

# Open firewall (as Administrator)
New-NetFirewallRule -DisplayName "CampusCare CTF" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow

# Start
pm2 start ecosystem.config.js
pm2 status
ipconfig   ← share this IP with all teams
```

---

*CampusCare CTF · Breach@trix Finals · Good luck! 🎓*
