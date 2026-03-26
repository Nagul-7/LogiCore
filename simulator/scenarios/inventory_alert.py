"""
Inventory Alert Scenario
========================
Posts bin fill level below 20% threshold.
Should trigger auto-reorder request on the manager dashboard.
"""

import requests
import time
import random
import datetime


def run(base_url, trip_id):
    print('📦 Starting inventory alert simulation')
    print('   Posting bin fill levels dropping below 20% threshold')
    print()

    bins = [
        {
            'sensor_id': 'INV-KURICHI-BIN-01',
            'factory_id': 'f0000001-0000-0000-0000-000000000001',
            'material_type': 'pig_iron',
        },
        {
            'sensor_id': 'INV-KURICHI-BIN-02',
            'factory_id': 'f0000001-0000-0000-0000-000000000001',
            'material_type': 'scrap_iron',
        },
        {
            'sensor_id': 'INV-SINGANALLUR-BIN-01',
            'factory_id': 'f0000002-0000-0000-0000-000000000002',
            'material_type': 'raw_cotton',
        },
    ]

    # Simulate declining fill levels
    for fill in [45, 30, 18, 12, 8]:
        for bin_info in bins:
            payload = {
                'sensor_id': bin_info['sensor_id'],
                'factory_id': bin_info['factory_id'],
                'material_type': bin_info['material_type'],
                'fill_percent': fill + random.randint(-3, 3),
                'weight_kg': fill * 50,  # rough estimate
                'threshold_alert': fill < 20,
                'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
            }
            try:
                r = requests.post(f'{base_url}/api/v1/telemetry/inventory', json=payload, timeout=5)
                alert = '🔴 ALERT' if fill < 20 else '🟢 OK'
                print(f'   {alert} {bin_info["sensor_id"]}: {fill}% fill ({bin_info["material_type"]})')
            except Exception as e:
                print(f'   ❌ Error: {e}')
                return

        print()
        time.sleep(5)

    print('✅ Inventory alert simulation complete — check dashboard for low-stock alerts')
