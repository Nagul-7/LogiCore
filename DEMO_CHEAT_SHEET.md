# LogiCore Demo Cheat Sheet

## Start Everything
```bash
./demo_startup.sh
```

## Demo Flow (3 minutes)

**Step 1: Open Manager Dashboard** → http://localhost:3001
- Show KPI cards with active trips count
- Show live map of Coimbatore region  
- Show trips table with TRIP-2026-001 En Route

**Step 2: Open Driver App on phone** → http://[IP]:3002
- Show Tamil interface (`முருகன்`)
- Show active trip card with Pig Iron details
- Navigate to QR page — show scannable QR code

**Step 3: Run live GPS tracking**
```bash
python simulator/simulator.py --scenario normal_trip
```
- Watch truck marker move on manager dashboard map (every 15s)

**Step 4: Show exception handling**
```bash
python simulator/simulator.py --scenario driver_noshow
```
- Wait 60 seconds — red CRITICAL alert appears on manager dashboard automatically (no page refresh)

**Step 5: Show plan change**
```bash
python simulator/simulator.py --scenario plan_change
```
- Manager changes order quantity — driver app updates automatically via socket

**Step 6: QR gate flow**
- Driver shows QR on phone (http://[IP]:3002/qr)
- Open Gate App → http://localhost:3004
- Paste QR token into manual input OR scan with camera
- See green "Entry Approved / அனுமதிக்கப்பட்டது" screen
- Click "Accept & Enter" — ePOD generated, trip status → at_gate

**Step 7: Supplier view**
- Open → http://localhost:3003
- Show TRIP-2026-002 pending pickup confirmation
- Click "✓ Confirm Ready" → green toast "Confirmed! Driver will be notified."

---

## Key Points to Tell Judges
- Replaces WhatsApp and phone calls for **535 Coimbatore foundries**
- Real-time GPS tracking via Socket.io (no page refresh needed)
- AI engine uses real **OSRM routing API** for route calculation
- **Tamil language** driver app works on low-end Android phones
- QR gate entry replaces paper gate passes (prevents fraud)
- **Automatic exception detection** via watchdog cron job (no-show, stall, overdue)
- Supplier portal with bilingual (Tamil/English) confirmation workflow

---

## Port Reference
| Service | Port | Primary User |
|---------|------|-------------|
| Backend API | 3000 | All |
| Manager Dashboard | 3001 | Logistics Manager |
| Driver App | 3002 | Truck Driver (mobile) |
| Supplier Portal | 3003 | Factory Supplier |
| Gate Security App | 3004 | Gate Guard (tablet) |

## Simulator Scenarios
```bash
cd ~/Desktop/LogiCore/simulator
python simulator.py --scenario normal_trip      # GPS moves every 15s
python simulator.py --scenario driver_noshow    # Triggers watchdog alert in 60s
python simulator.py --scenario plan_change      # Changes order qty live
python simulator.py --scenario inventory_alert  # Amber stock alert
```

## Log Files
```
/tmp/logicore-backend.log
/tmp/logicore-manager.log
/tmp/logicore-driver.log
/tmp/logicore-supplier.log
/tmp/logicore-gate.log
```
