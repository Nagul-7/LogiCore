<p align="center">
  <h1 align="center">🚛 LogiCore</h1>
  <p align="center"><strong>Smart Inbound Logistics Management System</strong></p>
  <p align="center">AI-powered raw material delivery coordination for Coimbatore and Tamil Nadu industrial clusters</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Socket.io-4.6-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

---

## 📋 What is LogiCore?

LogiCore replaces the **WhatsApp groups and phone calls** that 25,000+ MSMEs in Coimbatore currently rely on to coordinate raw material deliveries. It provides a real-time digital platform that orchestrates every delivery from supplier to factory gate — without a single phone call.

### The Problem

India's logistics costs stand at **13–14% of GDP** — nearly double the global benchmark. For Coimbatore's **535 foundries** and hundreds of **cotton mills**, every uncoordinated delivery, every driver no-show, and every last-minute plan change translates directly into furnace downtime and lost production.

### The Solution

| Metric | Before LogiCore | With LogiCore |
|---|---|---|
| Inbound logistics cost | 13–14% of GDP | Target 8–9% (saving 5%) |
| Driver no-show response | 45–90 minutes | Under 5 minutes (auto-reassign) |
| Plan change coordination | Phone calls, 30–60 min | 2-minute digital flow |
| Delivery confirmation | Paper gate pass | QR scan, instant ePOD |
| **Per foundry savings** | **Baseline** | **₹18–27 lakhs/year** |

---

## 🏗️ System Architecture

LogiCore runs across **3 devices** on a local Wi-Fi network for the hackathon demo:

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL WI-FI NETWORK                          │
│                  (Phone Hotspot / LAN)                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              MAIN LAPTOP (192.168.x.10)                 │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │   Backend    │  │   Manager    │  │   Driver     │ │   │
│  │  │   API :3000  │  │   Dashboard  │  │   App :3002  │ │   │
│  │  │  (Express +  │  │   :3001      │  │  (Tamil UI)  │ │   │
│  │  │  Socket.io)  │  │  (Leaflet)   │  │              │ │   │
│  │  └──────┬───────┘  └──────────────┘  └──────────────┘ │   │
│  │         │                                               │   │
│  │  ┌──────┴───────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │  PostgreSQL  │  │   Supplier   │  │   Gate App   │ │   │
│  │  │  + Redis     │  │   Portal     │  │   :3004      │ │   │
│  │  │              │  │   :3003      │  │  (QR Scanner) │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│       ┌───────────────────┼───────────────────┐                │
│       │                   │                   │                │
│  ┌────▼─────┐    ┌───────▼────────┐   ┌─────▼──────────┐    │
│  │  Phone   │    │  Simulator     │   │  Tablet        │    │
│  │  Driver  │    │  Laptop        │   │  Gate Guard    │    │
│  │  App     │    │  Python posts  │   │  QR Scanner    │    │
│  │  :3002   │    │  to :3000 API  │   │  :3004         │    │
│  └──────────┘    └────────────────┘   └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Backend** | Node.js + Express | v20 LTS + v4.18 | API server, business logic |
| **Frontend** | React + Vite | v18.2 + v4.4 | 4 portal apps with HMR |
| **Database** | PostgreSQL + TimescaleDB | v16 + v2.x | Trips, users, GPS telemetry |
| **Cache** | Redis | v7.2 | Live state, sessions, pub-sub |
| **Real-time** | Socket.io | v4.6 | GPS updates, alerts, notifications |
| **Maps** | Leaflet + OpenStreetMap | v1.9.4 | Live truck tracking (no API key) |
| **Charts** | Recharts | v2.8 | KPI dashboard visualizations |
| **QR Codes** | qrcode + html5-qrcode | v1.5 + v2.3 | Gate confirmation system |
| **Auth** | JWT + bcrypt | v9.0 + v2.4 | Role-based stateless auth |
| **Simulator** | Python 3 + requests | v3.11 | IoT sensor emulation |
| **State** | Zustand | v4.4 | Lightweight React state |

---

## 📁 Project Structure

```
LogiCore/
├── backend/                        # Node.js + Express API
│   ├── src/
│   │   ├── server.js               # Entry point — 0.0.0.0:3000
│   │   ├── config/
│   │   │   ├── cors.js             # LAN subnet CORS regex
│   │   │   ├── db.js               # PostgreSQL pool
│   │   │   └── redis.js            # Redis client
│   │   ├── routes/                 # API route handlers
│   │   ├── services/               # AI engine, watchdog, QR
│   │   ├── middleware/             # JWT auth, Joi validation
│   │   └── socket.js              # Socket.io room management
│   └── migrations/
│       ├── 001_create_core_tables.sql
│       ├── 002_create_telemetry_hypertables.sql
│       └── 003_seed_demo_data.sql
│
├── frontend-manager/               # Manager Dashboard — :3001
├── frontend-driver/                # Driver App (Tamil) — :3002
├── frontend-supplier/              # Supplier Portal — :3003
├── frontend-gate/                  # Gate App (QR Scanner) — :3004
│
└── simulator/                      # Python IoT simulator
    ├── simulator.py                # CLI entry — --scenario flag
    └── scenarios/
        ├── normal_trip.py          # Full Erode → Kurichi delivery
        ├── driver_noshow.py        # GPS stops → backup assigned
        ├── plan_change.py          # Qty change mid-trip
        ├── road_block.py           # Stationary GPS → stall alert
        └── inventory_alert.py      # Bin fill < 20% → auto-reorder
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20 LTS — [nodejs.org](https://nodejs.org)
- **PostgreSQL** v16 — [postgresql.org](https://postgresql.org/download)
- **TimescaleDB** v2.x — `apt install timescaledb-2-postgresql-16`
- **Redis** v7.2 — `apt install redis-server`
- **Python** v3.11 — [python.org](https://python.org)

### 1. Clone the Repository

```bash
git clone https://github.com/Nagul-7/LogiCore.git
cd LogiCore
```

### 2. Set Up the Database

```bash
psql -U postgres -c "CREATE DATABASE logicore;"
psql -U postgres -d logicore -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
psql -U postgres -d logicore -f backend/migrations/001_create_core_tables.sql
psql -U postgres -d logicore -f backend/migrations/002_create_telemetry_hypertables.sql
psql -U postgres -d logicore -f backend/migrations/003_seed_demo_data.sql
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` in each project and update `YOUR_LAPTOP_IP` with your actual LAN IP:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontends — update VITE_API_BASE with your laptop IP
cp frontend-manager/.env.example frontend-manager/.env
cp frontend-driver/.env.example frontend-driver/.env
cp frontend-supplier/.env.example frontend-supplier/.env
cp frontend-gate/.env.example frontend-gate/.env
```

### 4. Install Dependencies

```bash
# Backend
cd backend && npm install && cd ..

# Frontends
cd frontend-manager && npm install && cd ..
cd frontend-driver && npm install && cd ..
cd frontend-supplier && npm install && cd ..
cd frontend-gate && npm install && cd ..

# Simulator
cd simulator && pip install -r requirements.txt && cd ..
```

### 5. Start All Services (7 Terminals)

```bash
# Terminal 1 — Redis
redis-server

# Terminal 2 — PostgreSQL (if not running as service)
pg_ctl start -D /var/lib/postgresql/16/main

# Terminal 3 — Backend API
cd backend && npm run dev

# Terminal 4 — Manager Dashboard
cd frontend-manager && npm run dev

# Terminal 5 — Driver App
cd frontend-driver && npm run dev

# Terminal 6 — Supplier Portal
cd frontend-supplier && npm run dev

# Terminal 7 — Gate App
cd frontend-gate && npm run dev
```

---

## 🌐 Networking Setup

LogiCore runs across multiple devices on a local Wi-Fi network. Three settings are **critical**:

### 1. Backend Binds to All Interfaces

```javascript
// server.js — accepts connections from phone + simulator laptop
app.listen(3000, '0.0.0.0');
```

### 2. Use Phone Hotspot — NOT Venue Wi-Fi

Venue Wi-Fi often has **AP isolation** enabled, which prevents devices from communicating. Use your team's phone hotspot as the network and assign a **static IP** to the main laptop.

### 3. Update All .env Files

Every frontend `.env` file must use the laptop's **LAN IP** — never `localhost`:

```env
VITE_API_BASE=http://192.168.43.100:3000
VITE_WS_URL=ws://192.168.43.100:3000
```

### 4. Firewall Rules (Windows)

```powershell
netsh advfirewall firewall add rule name="LogiCore-3000" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="LogiCore-3001" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="LogiCore-3002" dir=in action=allow protocol=TCP localport=3002
netsh advfirewall firewall add rule name="LogiCore-3003" dir=in action=allow protocol=TCP localport=3003
netsh advfirewall firewall add rule name="LogiCore-3004" dir=in action=allow protocol=TCP localport=3004
```

---

## 🤖 Hardware Simulator

The simulator replaces real IoT hardware (GPS trackers, bin sensors, QR scanners) with a Python script that posts realistic JSON telemetry to the backend API over HTTP.

### Run a Scenario

```bash
cd simulator

# Full delivery: Erode → Kurichi SIDCO (10 GPS waypoints, QR gate scan)
python simulator.py --scenario normal_trip

# Driver no-show: GPS stops → watchdog auto-assigns backup driver
python simulator.py --scenario driver_noshow

# Plan change: quantity update mid-trip → all portals notified
python simulator.py --scenario plan_change

# Road block: GPS stationary for 3+ min → stall alert triggered
python simulator.py --scenario road_block

# Low inventory: bin fill drops below 20% → auto-reorder request
python simulator.py --scenario inventory_alert
```

All scenarios post to the **real backend** at `http://[laptop-ip]:3000` — nothing is mocked.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — DB, Redis, uptime |
| `POST` | `/api/auth/login` | Authenticate user, returns JWT |
| `POST` | `/api/auth/logout` | Invalidate JWT token |
| `GET` | `/api/v1/trips` | List trips (filterable by status, factory, driver) |
| `POST` | `/api/v1/trips` | Create new material request → trip |
| `GET` | `/api/v1/trips/:id` | Trip details with full event timeline |
| `PATCH` | `/api/v1/trips/:id` | Update trip (plan change mid-trip) |
| `POST` | `/api/v1/trips/:id/assign` | Assign truck & driver to trip |
| `POST` | `/api/v1/trips/:id/sos` | Driver SOS emergency alert |
| `POST` | `/api/v1/telemetry/gps` | GPS position update from simulator |
| `POST` | `/api/v1/telemetry/inventory` | Bin fill level from sensor |
| `POST` | `/api/v1/telemetry/gate` | QR gate scan event |
| `POST` | `/api/v1/qr/generate` | Generate QR token for trip |
| `POST` | `/api/v1/qr/validate` | Validate QR at gate (server-side) |
| `GET` | `/api/v1/drivers` | List drivers with status & location |
| `GET` | `/api/v1/suppliers` | List registered suppliers |
| `POST` | `/api/v1/suppliers/:id/confirm` | Supplier confirms material ready |
| `POST` | `/api/v1/suppliers/:id/delay` | Supplier reports delay |
| `POST` | `/api/v1/epods` | Create ePOD on gate acceptance |
| `POST` | `/api/v1/epods/:id/discrepancy` | Raise delivery discrepancy |

---

## 🖥️ The Four Portals

### Manager Dashboard — `:3001`
> **ERP-style command center** with real-time Leaflet map

- Live GPS tracking of all trucks on an interactive map
- KPI cards: active trips, on-time rate, delayed count, low stock alerts
- Trip management with sortable tables and color-coded status rows
- Exception alerts panel with one-click auto-resolution
- 3-step material request wizard (Material → Supplier → Confirm)
- Recharts-powered analytics — on-time rate, cost per km, exception frequency

### Driver App — `:3002`
> **Dark theme, Tamil-first, offline-capable** — designed for the field

- **Noto Sans Tamil** font for all text — readable on any phone
- Dark card-based UI (#111827 background) with green action buttons
- Trip assignment with countdown timer — accept or auto-decline
- Leaflet dark map with animated truck icon and route line
- Full-screen QR code display for gate entry (240×240px, prevents screen sleep)
- SOS emergency button — always red, always visible
- Service worker for offline operation (cached route, manifest, QR)

### Supplier Portal — `:3003`
> **Clean web portal** for pickup confirmations and delay reporting

- Bilingual toggle (Tamil / English)
- Upcoming pickups table with status badges
- One-click material ready confirmation
- Delay reporting form with duration selector and reason
- Real-time notifications via Socket.io for plan changes and ETA updates

### Gate App — `:3004`
> **Tablet-optimised QR scanner** for factory gate security

- Large 56px+ touch targets for one-handed use
- html5-qrcode camera scanner with animated scan zone
- Server-side QR validation: trip match, time window ±2h, single-use check
- Accept / Reject with clear reason display on invalid scans
- Auto-generated ePOD on acceptance
- Discrepancy report form with photo upload

---

## 🎬 Demo Walkthrough

A complete demo takes **under 3 minutes**:

1. **Manager raises material request** — selects pig iron, 3500 kg, Kurichi factory, furnace at 2 PM
2. **AI assigns truck** — system selects best-fit truck (Murugan, TRK-0042) based on capacity, location, and reliability score
3. **Simulator runs** — `python simulator.py --scenario normal_trip` — truck moves along 10 GPS waypoints from Erode to Kurichi SIDCO on the manager's live map
4. **Manager changes order mid-trip** — quantity 3500 → 5000 kg — driver app shows full-screen update, supplier sees revised pickup quantity
5. **Driver arrives at gate** — taps "I've arrived" — QR code appears on phone screen
6. **Gate guard scans QR** — tablet camera scans driver's phone — system validates trip, confirms entry, ePOD auto-generated
7. **Exception demo** — `python simulator.py --scenario driver_noshow` — GPS stops for 2 min → system auto-assigns backup driver within 30 seconds

---

## 🗺️ Roadmap

- 🔌 Real OBD GPS hardware integration (OBD dongles for trucks)
- 📡 Real ultrasonic bin sensors for inventory monitoring
- 🔒 HTTPS / SSL certificates for production deployment
- 🏢 Multi-tenancy — support multiple industrial clusters
- 🛣️ FASTag toll integration for automated toll tracking
- 📱 React Native mobile app for drivers (replace PWA)
- 📲 Twilio SMS gateway for real SMS notifications
- 🌧️ Monsoon risk overlay — June–October flood-prone road avoidance
- 🤝 Multi-MSME load pooling — 10–12 factories sharing one truck

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. Commit with conventional prefixes:
   ```bash
   git commit -m "feat: add real-time ETA prediction"
   git commit -m "fix: correct QR validation time window"
   ```
4. Push and open a Pull Request:
   ```bash
   git push origin feat/your-feature-name
   ```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <strong>Nagul</strong> (<a href="https://github.com/Nagul-7">@Nagul-7</a>) for Coimbatore, Tamil Nadu, India 🇮🇳
</p>
