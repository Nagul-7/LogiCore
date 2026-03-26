"""
Normal Trip Scenario
====================
Simulates a full delivery from Erode to Coimbatore Kurichi SIDCO.
GPS updates every 5 seconds along 10 waypoints on NH 544 corridor.
Ends with a QR gate scan event.
"""

import requests
import time
import random
import datetime

# Real waypoints: Erode (11.3410, 77.7172) → Kurichi SIDCO (10.9601, 76.9199)
# Interpolated along NH 544 corridor
WAYPOINTS = [
    (11.3410, 77.7172),  # Start: Erode supplier
    (11.2986, 77.6345),  # Bhavani road
    (11.2560, 77.5520),  # Sathyamangalam approach
    (11.2135, 77.4690),  # Gobichettipalayam bypass
    (11.1710, 77.3865),  # Anthiyur junction
    (11.1280, 77.3040),  # Mettupalayam approach
    (11.0855, 77.2210),  # Annur crossing
    (11.0430, 77.1385),  # Coimbatore outskirts
    (11.0010, 77.0560),  # Singanallur approach
    (10.9601, 76.9199),  # End: Kurichi SIDCO Gate
]

DEVICE_ID = 'TRK-CBE-0042'


def run(base_url, trip_id):
    print(f'🚛 Starting normal trip simulation')
    print(f'   Route: Erode → Kurichi SIDCO ({len(WAYPOINTS)} waypoints)')
    print(f'   GPS interval: 5 seconds')
    print()

    for i, (lat, lng) in enumerate(WAYPOINTS):
        speed = random.randint(35, 65)
        timestamp = datetime.datetime.utcnow().isoformat() + 'Z'

        payload = {
            'device_id': DEVICE_ID,
            'trip_id': trip_id,
            'lat': lat,
            'lng': lng,
            'speed_kmh': speed,
            'ignition': True,
            'timestamp': timestamp,
        }

        try:
            r = requests.post(f'{base_url}/api/v1/telemetry/gps', json=payload, timeout=5)
            status = '✅' if r.status_code < 300 else '⚠️'
            print(f'   {status} GPS [{i+1}/{len(WAYPOINTS)}] lat={lat:.4f} lng={lng:.4f} speed={speed}km/h')
        except requests.exceptions.ConnectionError:
            print(f'   ❌ Connection failed — is backend running at {base_url}?')
            return
        except Exception as e:
            print(f'   ❌ Error: {e}')

        if i < len(WAYPOINTS) - 1:
            time.sleep(5)

    # Simulate QR gate scan at arrival
    print()
    print('📸 Simulating QR gate scan...')
    gate_payload = {
        'reader_id': 'GATE-KURICHI-03',
        'trip_id': trip_id,
        'factory_id': 'f0000001-0000-0000-0000-000000000001',
        'event_type': 'qr_scan',
        'qr_code_hash': f'DEMO-QR-{trip_id}',
        'otp_verified': True,
        'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
    }

    try:
        r = requests.post(f'{base_url}/api/v1/telemetry/gate', json=gate_payload, timeout=5)
        if r.status_code < 300:
            print('   ✅ Gate scan confirmed — ePOD generated')
        else:
            print(f'   ⚠️ Gate scan response: {r.status_code}')
    except Exception as e:
        print(f'   ❌ Gate scan failed: {e}')

    print()
    print('✅ Normal trip simulation complete!')
