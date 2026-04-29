# 🚀 CampusCare — LAN Deployment Guide (PM2 on Windows)

This guide sets up CampusCare on a **single Windows PC (the host)** so all participants — attackers and defenders — can connect over the school LAN / Wi-Fi.

---

## 🖥️ Network Layout

```
        [ HOST PC ]  ←── runs the app on port 3000
             │
     ─────────────────
     │               │
[ ATTACKER PC 1 ]  [ ATTACKER PC 2 ]
[ DEFENDER PC 1 ]  [ DEFENDER PC 2 ]

All devices on the SAME Wi-Fi / LAN switch
```

Everyone connects to: **`http://<HOST-IP>:3000`**

---

## 📋 Step 1 — Prerequisites (on the Host PC)

Make sure these are installed on the host machine:

| Tool | Check | Install |
|------|-------|---------|
| Node.js ≥ 18 | `node -v` | https://nodejs.org |
| npm | `npm -v` | Bundled with Node |
| PM2 | `pm2 -v` | `npm install -g pm2` |

Install PM2 globally if not already:
```powershell
npm install -g pm2
```

---

## 📦 Step 2 — Install Dependencies

In the project folder (`d:\Coding-Projects\breach\campuscare`):

```powershell
npm install
```

---

## 🔨 Step 3 — Build the Production App

```powershell
npm run build
```

> This creates an optimized `.next` production bundle. Takes ~1–2 minutes.  
> ⚠️ You must rebuild whenever you change source files.

---

## ▶️ Step 4 — Start with PM2

```powershell
# Create logs folder (first time only)
mkdir logs

# Start the app
pm2 start ecosystem.config.js

# Check it's running
pm2 status
```

You should see:
```
┌─────┬──────────────┬─────────┬──────────┐
│ id  │ name         │ status  │ cpu/mem  │
├─────┼──────────────┼─────────┼──────────┤
│ 0   │ campuscare   │ online  │ 0% / ... │
└─────┴──────────────┴─────────┴──────────┘
```

---

## 🌐 Step 5 — Find the Host PC's IP Address

In PowerShell on the host PC:
```powershell
ipconfig
```

Look for the **IPv4 Address** under your active adapter (Wi-Fi or Ethernet):
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . : 192.168.1.105   ← THIS IS YOUR IP
   Subnet Mask . . . . . : 255.255.255.0
```

Share this IP with all participants.

---

## 🔥 Step 6 — Open Windows Firewall for Port 3000

The firewall blocks incoming connections by default. Run this in PowerShell **as Administrator**:

```powershell
New-NetFirewallRule -DisplayName "CampusCare CTF" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

> Or: Control Panel → Windows Defender Firewall → Advanced Settings → Inbound Rules → New Rule → Port → TCP → 3000 → Allow

---

## 📱 Step 7 — Participant Access

Tell each participant to open their browser and go to:

```
http://192.168.1.105:3000          ← replace with actual host IP
http://192.168.1.105:3000/defense  ← Blue Team dashboard
```

**Default credentials to hand out:**

| Role | Username | Password |
|------|----------|----------|
| Admin (Red Team use) | `admin` | *(find via SQLi!)* |
| Student 1 | `student1` | `pass1234` |
| Student 2 | `student2` | `mypassword` |
| Student 3 | `student3` | `qwertyuiop` |

> 💡 Do **not** give Red Team the admin password — they must discover it.

---

## 🛑 PM2 Useful Commands

```powershell
pm2 status              # View running apps
pm2 logs campuscare     # Tail live logs
pm2 restart campuscare  # Restart the app
pm2 stop campuscare     # Stop the app
pm2 delete campuscare   # Remove from PM2

# Save PM2 list so it survives reboots
pm2 save
pm2 startup             # (may not work on Windows — use Task Scheduler instead)
```

---

## 🔁 Resetting Between Rounds

The defense dashboard state is stored in **browser localStorage** — not the server.  
To reset a team's score and patches:

1. Go to: `http://<HOST-IP>:3000/admin/reset`
2. Password: `breach@trix2025`
3. Click **Full Reset**

To reset the **database** (wipe all injected XSS notices etc.):
```powershell
pm2 stop campuscare
del campus.db
del campus.db-shm
del campus.db-wal
pm2 start ecosystem.config.js
```
> The app re-seeds the database automatically on next start.

---

## ⚡ Quick Start Cheatsheet

```powershell
# ONE-TIME SETUP
npm install -g pm2
npm install
npm run build
mkdir logs
New-NetFirewallRule -DisplayName "CampusCare CTF" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow

# EVERY SESSION
pm2 start ecosystem.config.js
pm2 status
ipconfig   # ← share this IP with teams
```

---

## 🩺 Troubleshooting

| Problem | Fix |
|---------|-----|
| `pm2: command not found` | Restart PowerShell after `npm install -g pm2` |
| App starts but can't connect from other PC | Check firewall rule; ensure same Wi-Fi network |
| `EADDRINUSE: port 3000` | Something else is on 3000: `pm2 delete campuscare` then restart |
| Build fails | Run `npm install` first; check for TypeScript errors with `npx tsc --noEmit` |
| DB errors on startup | Delete `campus.db*` files and restart — it auto-recreates |
| Slow on first load | Normal — Next.js warms up route caches on first request |

---

*CampusCare CTF — Breach@trix Finals · Good luck to all teams! 🎓*
