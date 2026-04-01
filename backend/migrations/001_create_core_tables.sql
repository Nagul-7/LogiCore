-- drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS epods CASCADE;
DROP TABLE IF EXISTS qr_tokens CASCADE;
DROP TABLE IF EXISTS trip_events CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS trucks CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS factories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS telemetry_gps CASCADE;
DROP TABLE IF EXISTS telemetry_inventory CASCADE;

CREATE TABLE factories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    cluster_zone VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(200),
    address TEXT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    material_types TEXT[],
    rating DECIMAL(3,2) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(200),
    language VARCHAR(10) DEFAULT 'ta',
    reliability_score INTEGER DEFAULT 100,
    current_lat DECIMAL(10,7),
    current_lng DECIMAL(10,7),
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trucks (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id),
    plate_number VARCHAR(20),
    model VARCHAR(100),
    capacity_kg INTEGER,
    truck_type VARCHAR(50),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    trip_code VARCHAR(50) UNIQUE NOT NULL,
    factory_id INTEGER REFERENCES factories(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    driver_id INTEGER REFERENCES drivers(id),
    truck_id INTEGER REFERENCES trucks(id),
    material_type VARCHAR(100),
    quantity_kg DECIMAL(10,2),
    furnace_time TIMESTAMPTZ,
    depart_by TIMESTAMPTZ,
    eta TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'planning',
    route_description TEXT,
    distance_km DECIMAL(8,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trip_events (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id),
    event_type VARCHAR(100),
    description TEXT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE qr_tokens (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id),
    token_hash VARCHAR(256) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE epods (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) UNIQUE,
    received_qty_kg DECIMAL(10,2),
    status VARCHAR(50),
    discrepancy_type VARCHAR(100),
    discrepancy_notes TEXT,
    photo_urls TEXT[],
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
