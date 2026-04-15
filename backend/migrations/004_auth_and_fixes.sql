-- ============================================================
-- Migration 004: Auth support + DB fixes
-- ============================================================

-- 1. Recreate the users table (was dropped in 001, never recreated)
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(200) NOT NULL,
    email         VARCHAR(200) UNIQUE,
    phone         VARCHAR(20)  UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    role          VARCHAR(50)  NOT NULL CHECK (role IN ('manager','supplier','gate_guard')),
    supplier_id   INTEGER REFERENCES suppliers(id),
    factory_id    INTEGER REFERENCES factories(id),
    is_active     BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add password_hash to drivers (so they can log in via phone+PIN)
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(256);

-- 3. Add watchdog_events table for observability
CREATE TABLE IF NOT EXISTS watchdog_events (
    id          SERIAL PRIMARY KEY,
    event_type  VARCHAR(100) NOT NULL,   -- 'noshow' | 'stall' | 'overdue'
    trip_code   VARCHAR(50),
    driver_name VARCHAR(200),
    severity    VARCHAR(20) DEFAULT 'warning',
    resolved    BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add digital signature storage to epods
ALTER TABLE epods ADD COLUMN IF NOT EXISTS signature_b64 TEXT;
ALTER TABLE epods ADD COLUMN IF NOT EXISTS gate_officer_id INTEGER REFERENCES users(id);

-- 5. Seed demo users
-- All passwords are bcrypt hash of "123456"
-- Hash generated with: bcrypt.hashSync('123456', 10)
INSERT INTO users (name, email, phone, password_hash, role, factory_id) VALUES
(
  'Arjun Manager',
  'manager@logicore.demo',
  '9000000001',
  '$2a$10$Nm0taGNeuTVZrsMs9hpYD.db//xRzmo5fTBpSQ0YFzHWJMRdAwOva', -- 123456
  'manager',
  1
),
(
  'Gate Guard Selvam',
  'gate@logicore.demo',
  '9000000003',
  '$2a$10$Nm0taGNeuTVZrsMs9hpYD.db//xRzmo5fTBpSQ0YFzHWJMRdAwOva',
  'gate_guard',
  1
)
ON CONFLICT (email) DO NOTHING;

-- Supplier user linked to supplier_id=1
INSERT INTO users (name, email, phone, password_hash, role, supplier_id) VALUES
(
  'Rajan Supplier',
  'supplier@logicore.demo',
  '9000000002',
  '$2a$10$Nm0taGNeuTVZrsMs9hpYD.db//xRzmo5fTBpSQ0YFzHWJMRdAwOva',
  'supplier',
  1
)
ON CONFLICT (email) DO NOTHING;

-- 6. Seed driver password hashes (same demo password "123456")
UPDATE drivers SET password_hash = '$2a$10$Nm0taGNeuTVZrsMs9hpYD.db//xRzmo5fTBpSQ0YFzHWJMRdAwOva'
WHERE password_hash IS NULL;
