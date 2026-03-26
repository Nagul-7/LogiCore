"""
Driver No-Show Scenario
=======================
Sends initial GPS, then stops transmitting for 2+ minutes.
The backend watchdog should detect the absence and trigger backup driver assignment.
"""

import requests
import time
import datetime

DEVICE_ID = 'TRK-CBE-0042'
START_LAT = 11.3410
START_LNG = 77.7172


def run(base_url, trip_id):
    print('🚛 Starting driver no-show simulation')
    print('   Phase 1: Send 3 GPS pings (driver appears active)')
    print('   Phase 2: Stop GPS for 2+ minutes (triggers no-show)')
    print()

    # Phase 1: Send a few GPS pings
    for i in range(3):
        payload = {
            'device_id': DEVICE_ID,
            'trip_id': trip_id,
            'lat': START_LAT,
            'lng': START_LNG,
            'speed_kmh': 0,
            'ignition': True,
            'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
        }
        try:
            r = requests.post(f'{base_url}/api/v1/telemetry/gps', json=payload, timeout=5)
            print(f'   ✅ GPS ping {i+1}/3 — driver stationary at pickup')
        except Exception as e:
            print(f'   ❌ Error: {e}')
            return
        time.sleep(5)

    # Phase 2: Stop sending GPS — simulate no-show
    print()
    print('   ⏱️  Stopping GPS transmission for 2 minutes...')
    print('   ⏱️  Watchdog should detect no-show and auto-reassign backup driver')
    
    for remaining in range(120, 0, -10):
        print(f'   ⏱️  {remaining}s remaining...')
        time.sleep(10)

    print()
    print('✅ No-show simulation complete — check dashboard for backup driver assignment')
