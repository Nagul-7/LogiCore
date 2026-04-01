# LogiCore — Smart Inbound Logistics System

LogiCore is an end-to-end inbound logistics coordination platform built for the 2026 Hackathon. It streamlines communication between Managers, Suppliers, Drivers, and Gate Guards.

## 🚀 Architecture Overview
The system is divided into 5 discrete services, all running locally for demo purposes, securely bound to `0.0.0.0` for LAN mobile device access.

- **Backend (Port 3000):** Node.js / Express, PostgreSQL + TimescaleDB, Socket.io
- **Manager Dashboard (Port 3001):** React, Vite, Recharts, Leaflet Live Map
- **Driver Mobile App (Port 3002):** React, Vite, Noto Sans Tamil, Dark Theme, HTML5 WakeLock
- **Supplier Portal (Port 3003):** React, Vite, Zustand
- **Gate Security App (Port 3004):** React, Vite, HTML5-QRCode Scanner

## 🛠 Features Developed
1. **AI Route Engine & Watchdog:** Predicts ETAs using backward scheduling and detects stalls/driver no-shows.
2. **Real-Time GPS & Notifications:** Socket.io pushes map updates across devices instantly.
3. **Secure Gate Pass Validation:** Dynamic SHA-256 hashed QR tokens, non-replayable.
4. **Hardware Simulator:** Python logic simulating stalls, inventory depletion, and live GPS movements.

## 🏁 How to Run the Demo
We've included a `demo_startup.sh` script to effortlessly orchestrate the monorepo logic!

```bash
# Make it executable if it isn't already
chmod +x demo_startup.sh

# Start the cluster
./demo_startup.sh
```

## 🚗 Running Scenarios
To demonstrate hardware alerts using the python simulator, open a new terminal:
```bash
cd simulator
pip install -r requirements.txt

# Run a live route simulation that moves the truck on the manager's live map
python simulator.py --scenario normal_trip --trip-id 1

# Fire an inventory alert (Low Stock Incident)
python simulator.py --scenario inventory_alert --sensor-id PRT_700A
```

*Built with ❤️ for the Coimbatore Hackathon.*
