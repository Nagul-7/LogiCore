import time
import requests
import sys
sys.path.append('..')
from utils import BASE_URL, interpolate_points, post_gps

def run():
    print("=== PLAN CHANGE SCENARIO ===")
    print("Starting normal GPS, then sending a quantity change mid-trip")
    print()

    WAYPOINTS = interpolate_points(11.3410, 77.7172, 11.1500, 77.3000, 6)
    for lat, lng in WAYPOINTS[:3]:
        post_gps("TRK-CBE-0042", "TRIP-2026-001", lat, lng, 48)
        time.sleep(5)

    print()
    print("Sending plan change: increasing quantity from 3500kg to 4500kg...")
    try:
        r = requests.patch(f"{BASE_URL}/api/v1/trips/TRIP-2026-001",
            json={"quantity_kg": 4500, "change_reason": "Factory increased order due to weekend stockup"},
            timeout=5)
        print(f"Plan change sent. Status: {r.status_code}")
        print("Check driver app and supplier portal for the update notification.")
    except Exception as e:
        print(f"Plan change failed: {e}")

    print()
    print("Resuming GPS after plan change...")
    for lat, lng in WAYPOINTS[3:]:
        post_gps("TRK-CBE-0042", "TRIP-2026-001", lat, lng, 52)
        time.sleep(5)
