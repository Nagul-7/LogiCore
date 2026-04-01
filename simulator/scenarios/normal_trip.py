import time
import random
import sys
sys.path.append('..')
from utils import interpolate_points, post_gps, post_gate

def run():
    print("=== NORMAL TRIP SCENARIO ===")
    print("Truck: TRK-CBE-0042, Trip: TRIP-2026-001")
    print("Route: Erode Steel Distributors to Kurichi SIDCO Coimbatore")
    print("Distance: ~87km via NH 544")
    print()

    WAYPOINTS = interpolate_points(11.3410, 77.7172, 10.9601, 76.9199, 20)

    for i, (lat, lng) in enumerate(WAYPOINTS):
        speed = random.randint(38, 62)
        print(f"Waypoint {i+1}/20:", end=" ")
        post_gps("TRK-CBE-0042", "TRIP-2026-001", lat, lng, speed)
        if i < len(WAYPOINTS) - 1:
            time.sleep(15)

    print()
    print("Truck arrived at factory gate. Posting gate scan event...")
    post_gate("GATE-KURICHI-NORTH-01", "TRIP-2026-001", 1, "entry", "demo-qr-hash-001")
    print("Trip complete.")
