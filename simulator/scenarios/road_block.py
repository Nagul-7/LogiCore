"""
Road Block Scenario
===================
Sends GPS with speed=0 (stationary) for 3+ minutes.
The backend should detect the stall and trigger a reroute alert.
"""

import requests
import time
import random
import datetime

DEVICE_ID = 'TRK-CBE-0042'
# Stall location: somewhere on NH 544 between Erode and Coimbatore
STALL_LAT = 11.1710
STALL_LNG = 77.3865


def run(base_url, trip_id):
    print('🚛 Starting road block simulation')
    print(f'   Stall location: {STALL_LAT}, {STALL_LNG} (Anthiyur junction)')
    print('   Sending speed=0 GPS for 3+ minutes')
    print()

    # Send 3 minutes of stationary GPS
    for i in range(36):  # 36 × 5s = 180s = 3 minutes
        payload = {
            'device_id': DEVICE_ID,
            'trip_id': trip_id,
            'lat': STALL_LAT + random.uniform(-0.0001, 0.0001),  # tiny jitter
            'lng': STALL_LNG + random.uniform(-0.0001, 0.0001),
            'speed_kmh': 0,
            'ignition': True,
            'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
        }
        try:
            r = requests.post(f'{base_url}/api/v1/telemetry/gps', json=payload, timeout=5)
            elapsed = (i + 1) * 5
            print(f'   🛑 Stationary [{elapsed}s/180s] speed=0 — stall detected by watchdog after 60s')
        except Exception as e:
            print(f'   ❌ Error: {e}')
            return
        time.sleep(5)

    print()
    print('✅ Road block simulation complete — check dashboard for stall alert')
