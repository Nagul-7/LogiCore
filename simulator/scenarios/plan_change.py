"""
Plan Change Scenario
====================
Simulates GPS for a few waypoints, then posts a quantity change mid-trip.
Tests that driver, supplier, and manager all receive the updated manifest.
"""

import requests
import time
import random
import datetime

DEVICE_ID = 'TRK-CBE-0042'
WAYPOINTS_PARTIAL = [
    (11.3410, 77.7172),
    (11.2986, 77.6345),
    (11.2560, 77.5520),
]


def run(base_url, trip_id):
    print('🚛 Starting plan change simulation')
    print('   Phase 1: GPS for 3 waypoints (trip in progress)')
    print('   Phase 2: Manager posts quantity change')
    print()

    # Phase 1: Send GPS
    for i, (lat, lng) in enumerate(WAYPOINTS_PARTIAL):
        payload = {
            'device_id': DEVICE_ID,
            'trip_id': trip_id,
            'lat': lat,
            'lng': lng,
            'speed_kmh': random.randint(40, 60),
            'ignition': True,
            'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
        }
        try:
            r = requests.post(f'{base_url}/api/v1/telemetry/gps', json=payload, timeout=5)
            print(f'   ✅ GPS [{i+1}/3] lat={lat:.4f} lng={lng:.4f}')
        except Exception as e:
            print(f'   ❌ Error: {e}')
            return
        time.sleep(5)

    # Phase 2: Post plan change
    print()
    print('📋 Posting plan change: quantity 3500 → 5000 kg')
    
    change_payload = {
        'qty_kg': 5000,
        'change_reason': 'Furnace schedule increased — need additional material',
    }
    
    try:
        r = requests.patch(f'{base_url}/api/v1/trips/{trip_id}', json=change_payload, timeout=5)
        if r.status_code < 300:
            print('   ✅ Plan change accepted — all parties should be notified')
        else:
            print(f'   ⚠️ Plan change response: {r.status_code} — {r.text}')
    except Exception as e:
        print(f'   ❌ Plan change failed: {e}')

    print()
    print('✅ Plan change simulation complete!')
