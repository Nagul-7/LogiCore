#!/usr/bin/env python3
"""
LogiCore Hardware Simulator
===========================
Simulates IoT sensors (GPS tracker, bin sensors, QR gate scanner)
by posting real HTTP requests to the backend API.

Usage:
    python simulator.py --scenario normal_trip
    python simulator.py --scenario driver_noshow
    python simulator.py --scenario plan_change
    python simulator.py --scenario road_block
    python simulator.py --scenario inventory_alert

The BASE_URL must point to the main laptop's IP on the LAN.
Never use 'localhost' — the simulator runs on a separate device.
"""

import argparse
import sys
import os

# Base URL — update this to your main laptop's LAN IP
BASE_URL = os.environ.get('LOGICORE_API_URL', 'http://192.168.1.100:3000')

def main():
    parser = argparse.ArgumentParser(
        description='LogiCore Hardware Simulator — IoT sensor emulation'
    )
    parser.add_argument(
        '--scenario',
        required=True,
        choices=['normal_trip', 'driver_noshow', 'plan_change', 'road_block', 'inventory_alert'],
        help='Demo scenario to run'
    )
    parser.add_argument(
        '--base-url',
        default=BASE_URL,
        help=f'Backend API base URL (default: {BASE_URL})'
    )
    parser.add_argument(
        '--trip-id',
        default='trip0001-0000-0000-0000-000000000001',
        help='Trip ID to simulate for'
    )

    args = parser.parse_args()

    print(f'╔════════════════════════════════════════════════╗')
    print(f'║   🚛 LogiCore Simulator                        ║')
    print(f'║   Scenario: {args.scenario:<33}║')
    print(f'║   Target:   {args.base_url:<33}║')
    print(f'╚════════════════════════════════════════════════╝')
    print()

    # Import and run the selected scenario
    if args.scenario == 'normal_trip':
        from scenarios.normal_trip import run
    elif args.scenario == 'driver_noshow':
        from scenarios.driver_noshow import run
    elif args.scenario == 'plan_change':
        from scenarios.plan_change import run
    elif args.scenario == 'road_block':
        from scenarios.road_block import run
    elif args.scenario == 'inventory_alert':
        from scenarios.inventory_alert import run
    else:
        print(f'❌ Unknown scenario: {args.scenario}')
        sys.exit(1)

    run(args.base_url, args.trip_id)


if __name__ == '__main__':
    main()
