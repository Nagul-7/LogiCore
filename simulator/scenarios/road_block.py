import time
import sys
sys.path.append('..')
from utils import interpolate_points, post_gps

def run():
    print("=== ROAD BLOCK SCENARIO ===")
    print("Truck moves normally then stops for 4 minutes simulating a road block")
    print("Watch for stall detection alert on manager dashboard")
    print()

    post_gps("TRK-CBE-0042", "TRIP-2026-001", 11.2500, 77.3500, 50)
    time.sleep(5)
    post_gps("TRK-CBE-0042", "TRIP-2026-001", 11.2100, 77.2800, 45)
    time.sleep(5)

    print("Truck has stopped. Speed is 0. Road block detected...")
    for i in range(8):
        post_gps("TRK-CBE-0042", "TRIP-2026-001", 11.2100, 77.2800, 0)
        print(f"  Stationary for {(i+1)*30} seconds...")
        time.sleep(30)

    print("Road cleared. Truck resuming on alternate route...")
    post_gps("TRK-CBE-0042", "TRIP-2026-001", 11.1800, 77.2200, 40)
