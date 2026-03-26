-- LogiCore: Core Tables Migration
-- Run: psql -U postgres -d logicore -f migrations/001_create_core_tables.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- FACTORIES
-- ==========================================
CREATE TABLE IF NOT EXISTS factories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    lat DECIMAL(10, 6) NOT NULL,
    lng DECIMAL(10, 6) NOT NULL,
    cluster_zone VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SUPPLIERS
-- ==========================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    material_types TEXT[] NOT NULL DEFAULT '{}',
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    lat DECIMAL(10, 6),
    lng DECIMAL(10, 6),
    rating DECIMAL(3, 1) DEFAULT 4.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- DRIVERS
-- ==========================================
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    language VARCHAR(10) DEFAULT 'ta',
    reliability_score DECIMAL(5, 2) DEFAULT 85.00,
    current_lat DECIMAL(10, 6),
    current_lng DECIMAL(10, 6),
    status VARCHAR(20) DEFAULT 'offline',
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TRUCKS
-- ==========================================
CREATE TABLE IF NOT EXISTS trucks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id),
    capacity_kg INTEGER NOT NULL,
    type VARCHAR(50) DEFAULT 'open',
    plate VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TRIPS
-- ==========================================
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_code VARCHAR(50) NOT NULL UNIQUE,
    factory_id UUID REFERENCES factories(id),
    supplier_id UUID REFERENCES suppliers(id),
    truck_id UUID REFERENCES trucks(id),
    driver_id UUID REFERENCES drivers(id),
    backup_driver_id UUID REFERENCES drivers(id),
    status VARCHAR(30) DEFAULT 'planning',
    material_type VARCHAR(100) NOT NULL,
    qty_kg INTEGER NOT NULL,
    furnace_time TIMESTAMP WITH TIME ZONE,
    depart_by TIMESTAMP WITH TIME ZONE,
    eta TIMESTAMP WITH TIME ZONE,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    route_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Status values: planning, assigned, confirmed, en_route, arrived, completed, cancelled

-- ==========================================
-- TRIP EVENTS (Audit Trail)
-- ==========================================
CREATE TABLE IF NOT EXISTS trip_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    lat DECIMAL(10, 6),
    lng DECIMAL(10, 6),
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event types: request_raised, supplier_confirmed, driver_assigned, departed,
--              deviation, exception, sos, arrived, epod_confirmed, plan_changed,
--              driver_noshow, stall_detected

-- ==========================================
-- QR TOKENS
-- ==========================================
CREATE TABLE IF NOT EXISTS qr_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ELECTRONIC PROOF OF DELIVERY (ePOD)
-- ==========================================
CREATE TABLE IF NOT EXISTS epods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    received_qty INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    photo_url TEXT,
    discrepancy_notes TEXT,
    discrepancy_type VARCHAR(50),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    confirmed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Status values: pending, accepted, discrepancy

-- ==========================================
-- USERS (for JWT auth — managers, gate guards)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    factory_id UUID REFERENCES factories(id),
    supplier_id UUID REFERENCES suppliers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role values: manager, driver, supplier, gate_guard

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_factory ON trips(factory_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_supplier ON trips(supplier_id);
CREATE INDEX IF NOT EXISTS idx_trip_events_trip ON trip_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_events_type ON trip_events(event_type);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_trip ON qr_tokens(trip_id);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_hash ON qr_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
