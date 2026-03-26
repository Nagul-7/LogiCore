-- LogiCore: TimescaleDB Telemetry Hypertables
-- Run: psql -U postgres -d logicore -f migrations/002_create_telemetry_hypertables.sql
-- Requires: CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ==========================================
-- GPS TELEMETRY (Hypertable)
-- ==========================================
CREATE TABLE IF NOT EXISTS telemetry_gps (
    time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    device_id VARCHAR(50) NOT NULL,
    trip_id UUID,
    lat DECIMAL(10, 6) NOT NULL,
    lng DECIMAL(10, 6) NOT NULL,
    speed_kmh DECIMAL(6, 2),
    ignition BOOLEAN DEFAULT TRUE,
    heading DECIMAL(5, 2)
);

-- Convert to hypertable (TimescaleDB)
-- This will fail gracefully if TimescaleDB is not installed
DO $$
BEGIN
    PERFORM create_hypertable('telemetry_gps', 'time', if_not_exists => TRUE);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TimescaleDB not available — telemetry_gps remains a regular table';
END $$;

CREATE INDEX IF NOT EXISTS idx_telemetry_gps_trip ON telemetry_gps(trip_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_gps_device ON telemetry_gps(device_id, time DESC);

-- ==========================================
-- INVENTORY TELEMETRY (Hypertable)
-- ==========================================
CREATE TABLE IF NOT EXISTS telemetry_inventory (
    time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    sensor_id VARCHAR(50) NOT NULL,
    factory_id UUID,
    material_type VARCHAR(100),
    fill_percent DECIMAL(5, 2),
    weight_kg DECIMAL(10, 2),
    threshold_alert BOOLEAN DEFAULT FALSE
);

-- Convert to hypertable
DO $$
BEGIN
    PERFORM create_hypertable('telemetry_inventory', 'time', if_not_exists => TRUE);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TimescaleDB not available — telemetry_inventory remains a regular table';
END $$;

CREATE INDEX IF NOT EXISTS idx_telemetry_inventory_factory ON telemetry_inventory(factory_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_inventory_sensor ON telemetry_inventory(sensor_id, time DESC);
