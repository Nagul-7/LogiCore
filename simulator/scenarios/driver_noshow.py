import time
import sys
sys.path.append('..')
from utils import interpolate_points, post_gps

def run():
    print("=== DRIVER NO-SHOW SCENARIO ===")
    print("Posting 3 GPS points then stopping for 3 minutes...")
    print("Watch for watchdog alert on manager dashboard after 60-90 seconds of no GPS")
    print()

    WAYPOINTS = [(11.3410, 77.7172), (11.3200, 77.6000), (11.2800, 77.4500)]
    for lat, lng in WAYPOINTS:
        post_gps("TRK-CBE-0042", "TRIP-2026-001", lat, lng, 45)
        time.sleep(5)

    print()
    print("GPS stopped. Driver is not responding. Watchdog should detect this...")
    print("Waiting 3 minutes before resuming...")
    for remaining in range(180, 0, -30):
        print(f"  {remaining} seconds remaining before driver resumes...")
        time.sleep(30)

    print("Driver resumed. Posting GPS again...")
    post_gps("TRK-CBE-0042", "TRIP-2026-001", 11.2800, 77.4500, 50)
