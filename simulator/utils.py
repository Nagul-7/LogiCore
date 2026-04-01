import requests
import math
import datetime

BASE_URL = "http://localhost:3000"

def haversine(lat1, lng1, lat2, lng2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def interpolate_points(start_lat, start_lng, end_lat, end_lng, n):
    points = []
    for i in range(n):
        fraction = i / (n - 1)
        lat = start_lat + (end_lat - start_lat) * fraction
        lng = start_lng + (end_lng - start_lng) * fraction
        points.append((lat, lng))
    return points

def post_gps(device_id, trip_id, lat, lng, speed_kmh):
    payload = {
        "device_id": device_id,
        "trip_id": trip_id,
        "lat": round(lat, 6),
        "lng": round(lng, 6),
        "speed_kmh": speed_kmh,
        "ignition": True,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    try:
        r = requests.post(f"{BASE_URL}/api/v1/telemetry/gps", json=payload, timeout=5)
        print(f"GPS posted: lat={round(lat,4)} lng={round(lng,4)} speed={speed_kmh}kmh status={r.status_code}")
    except Exception as e:
        print(f"GPS post failed: {e}")

def post_inventory(sensor_id, factory_id, material_type, fill_percent, weight_kg):
    payload = {
        "sensor_id": sensor_id,
        "factory_id": factory_id,
        "material_type": material_type,
        "fill_percent": fill_percent,
        "weight_kg": weight_kg,
        "threshold_alert": fill_percent < 20,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    try:
        r = requests.post(f"{BASE_URL}/api/v1/telemetry/inventory", json=payload, timeout=5)
        print(f"Inventory posted: {material_type} at {fill_percent}% status={r.status_code}")
    except Exception as e:
        print(f"Inventory post failed: {e}")

def post_gate(reader_id, trip_id, factory_id, event_type, qr_hash):
    payload = {
        "reader_id": reader_id,
        "trip_id": trip_id,
        "factory_id": factory_id,
        "event_type": event_type,
        "qr_code_hash": qr_hash,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    try:
        r = requests.post(f"{BASE_URL}/api/v1/telemetry/gate", json=payload, timeout=5)
        print(f"Gate event posted: {event_type} status={r.status_code}")
    except Exception as e:
        print(f"Gate post failed: {e}")
