import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scenarios import normal_trip, driver_noshow, plan_change, road_block, inventory_alert

SCENARIOS = {
    "normal_trip": normal_trip,
    "driver_noshow": driver_noshow,
    "plan_change": plan_change,
    "road_block": road_block,
    "inventory_alert": inventory_alert,
}

def main():
    parser = argparse.ArgumentParser(description="LogiCore Hardware Simulator")
    parser.add_argument("--scenario", required=True, choices=SCENARIOS.keys(),
                        help="Scenario to run")
    parser.add_argument("--base-url", default="http://localhost:3000",
                        help="Backend API base URL")
    args = parser.parse_args()

    import utils
    utils.BASE_URL = args.base_url

    print(f"Starting scenario: {args.scenario}")
    print(f"Backend URL: {args.base_url}")
    print("-" * 40)

    SCENARIOS[args.scenario].run()

if __name__ == "__main__":
    main()
