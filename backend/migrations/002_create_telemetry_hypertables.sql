CREATE TABLE IF NOT EXISTS telemetry_gps (
  time timestamptz NOT NULL,
  device_id varchar(100),
  trip_id integer,
  lat decimal(10,7),
  lng decimal(10,7),
  speed_kmh decimal(5,2),
  ignition boolean,
  PRIMARY KEY (time, device_id)
);

CREATE TABLE IF NOT EXISTS telemetry_inventory (
  time timestamptz NOT NULL,
  sensor_id varchar(100),
  factory_id integer,
  material_type varchar(100),
  fill_percent integer,
  weight_kg decimal(10,2),
  threshold_alert boolean,
  PRIMARY KEY (time, sensor_id)
);

-- Try to create hypertables (might fail if TimescaleDB not available, which is okay)
DO $$
BEGIN
    PERFORM create_hypertable('telemetry_gps', 'time', if_not_exists => TRUE);
EXCEPTION
    WHEN undefined_function THEN
        RAISE NOTICE 'TimescaleDB not installed, keeping regular tables.';
END $$;

DO $$
BEGIN
    PERFORM create_hypertable('telemetry_inventory', 'time', if_not_exists => TRUE);
EXCEPTION
    WHEN undefined_function THEN
        RAISE NOTICE 'TimescaleDB not installed, keeping regular tables.';
END $$;
