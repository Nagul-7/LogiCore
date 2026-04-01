import time
import sys
sys.path.append('..')
from utils import post_inventory

def run():
    print("=== INVENTORY ALERT SCENARIO ===")
    print("Simulating bin level dropping at Kurichi factory")
    print("Alert fires when fill_percent goes below 20")
    print()

    levels = [35, 28, 22, 17, 12]
    weights = [4500, 3600, 2800, 2200, 1540]

    for fill, weight in zip(levels, weights):
        post_inventory("INV-KURICHI-BIN-03", 1, "pig_iron", fill, weight)
        if fill < 20:
            print(f"  THRESHOLD BREACHED: {fill}% - alert should appear on manager dashboard")
        time.sleep(10)
