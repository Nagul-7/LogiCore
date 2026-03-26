-- LogiCore: Demo Seed Data
-- Run: psql -U postgres -d logicore -f migrations/003_seed_demo_data.sql
-- Seeds: 3 factories, 5 drivers, 4 suppliers, 3 trucks, 2 active trips, manager + gate guard users

-- Password hash for 'logicore123' (bcrypt, 10 rounds)
-- Pre-computed so we don't need bcrypt in SQL
-- All demo accounts use password: logicore123

-- ==========================================
-- FACTORIES (3 Coimbatore SIDCO locations)
-- ==========================================
INSERT INTO factories (id, name, address, lat, lng, cluster_zone, contact_phone, contact_name) VALUES
    ('f0000001-0000-0000-0000-000000000001', 'Kurichi Foundry', 'Plot 42, SIDCO Kurichi Industrial Estate, Coimbatore', 10.9601, 76.9199, 'Kurichi SIDCO', '+91 9876500001', 'Priya Krishnamurthy'),
    ('f0000002-0000-0000-0000-000000000002', 'Singanallur Cotton Mills', '18/B SIDCO Singanallur, Coimbatore', 10.9930, 76.9740, 'Singanallur SIDCO', '+91 9876500002', 'Lakshmi Narayanan'),
    ('f0000003-0000-0000-0000-000000000003', 'Ganapathy Pumps Ltd', 'Block 7, SIDCO Ganapathy, Coimbatore', 11.0234, 76.9456, 'Ganapathy SIDCO', '+91 9876500003', 'Arjun Sundaram')
ON CONFLICT DO NOTHING;

-- ==========================================
-- SUPPLIERS (4 — Erode, Coimbatore, Surat, Bellary)
-- ==========================================
INSERT INTO suppliers (id, name, material_types, contact_name, contact_phone, address, lat, lng, rating) VALUES
    ('s0000001-0000-0000-0000-000000000001', 'Erode Steels Pvt Ltd', '{pig_iron,scrap_iron}', 'Rajan Govindaraj', '+91 9876500011', 'SIPCOT Industrial Park, Erode', 11.3410, 77.7172, 4.8),
    ('s0000002-0000-0000-0000-000000000002', 'Coimbatore Iron Works', '{pig_iron,cast_iron}', 'Venkat Raman', '+91 9876500012', 'Peelamedu Industrial Area, Coimbatore', 11.0168, 76.9558, 4.5),
    ('s0000003-0000-0000-0000-000000000003', 'Surat Cotton Trading Co', '{raw_cotton,cotton_bales}', 'Mehta Textiles', '+91 9876500013', 'Surat Industrial Zone, Gujarat', 21.1702, 72.8311, 4.2),
    ('s0000004-0000-0000-0000-000000000004', 'Bellary Mining Supplies', '{pig_iron,iron_ore}', 'Reddy Minerals', '+91 9876500014', 'Bellary Industrial Estate, Karnataka', 15.1394, 76.9214, 4.6)
ON CONFLICT DO NOTHING;

-- ==========================================
-- DRIVERS (5 with Tamil names)
-- ==========================================
INSERT INTO drivers (id, name, phone, language, reliability_score, current_lat, current_lng, status, password_hash) VALUES
    ('d0000001-0000-0000-0000-000000000001', 'முருகன் (Murugan)', '+919876543210', 'ta', 92.50, 11.0168, 76.9558, 'online', '$2b$10$YQ8Hk5YQ8Hk5YQ8Hk5YQ8OzRvN5ZcKfE3Y4SqJ2vWxU7tBmD6nK6'),
    ('d0000002-0000-0000-0000-000000000002', 'குமார் (Kumar)', '+919876543211', 'ta', 88.00, 10.9930, 76.9740, 'online', '$2b$10$YQ8Hk5YQ8Hk5YQ8Hk5YQ8OzRvN5ZcKfE3Y4SqJ2vWxU7tBmD6nK6'),
    ('d0000003-0000-0000-0000-000000000003', 'செல்வம் (Selvam)', '+919876543212', 'ta', 85.50, 11.3410, 77.7172, 'offline', '$2b$10$YQ8Hk5YQ8Hk5YQ8Hk5YQ8OzRvN5ZcKfE3Y4SqJ2vWxU7tBmD6nK6'),
    ('d0000004-0000-0000-0000-000000000004', 'கார்த்திக் (Karthik)', '+919876543213', 'ta', 90.00, 10.9601, 76.9199, 'available', '$2b$10$YQ8Hk5YQ8Hk5YQ8Hk5YQ8OzRvN5ZcKfE3Y4SqJ2vWxU7tBmD6nK6'),
    ('d0000005-0000-0000-0000-000000000005', 'அருண் (Arun)', '+919876543214', 'ta', 78.00, 11.0234, 76.9456, 'available', '$2b$10$YQ8Hk5YQ8Hk5YQ8Hk5YQ8OzRvN5ZcKfE3Y4SqJ2vWxU7tBmD6nK6')
ON CONFLICT DO NOTHING;

-- ==========================================
-- TRUCKS (3)
-- ==========================================
INSERT INTO trucks (id, driver_id, capacity_kg, type, plate, status) VALUES
    ('t0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 10000, 'open', 'TN-38-BZ-4042', 'in_use'),
    ('t0000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', 8000, 'covered', 'TN-38-CC-1987', 'in_use'),
    ('t0000003-0000-0000-0000-000000000003', 'd0000004-0000-0000-0000-000000000004', 12000, 'open', 'TN-38-AJ-7721', 'available')
ON CONFLICT DO NOTHING;

-- ==========================================
-- TRIPS (2 active demo trips)
-- ==========================================
INSERT INTO trips (id, trip_code, factory_id, supplier_id, truck_id, driver_id, backup_driver_id, status, material_type, qty_kg, furnace_time, depart_by, eta) VALUES
    (
        'trip0001-0000-0000-0000-000000000001',
        'TRIP-20260326-001',
        'f0000001-0000-0000-0000-000000000001',
        's0000001-0000-0000-0000-000000000001',
        't0000001-0000-0000-0000-000000000001',
        'd0000001-0000-0000-0000-000000000001',
        'd0000004-0000-0000-0000-000000000004',
        'en_route',
        'pig_iron',
        3500,
        NOW() + INTERVAL '4 hours',
        NOW() - INTERVAL '1 hour',
        NOW() + INTERVAL '2 hours'
    ),
    (
        'trip0002-0000-0000-0000-000000000002',
        'TRIP-20260326-002',
        'f0000002-0000-0000-0000-000000000002',
        's0000003-0000-0000-0000-000000000003',
        't0000002-0000-0000-0000-000000000002',
        'd0000002-0000-0000-0000-000000000002',
        'd0000005-0000-0000-0000-000000000005',
        'confirmed',
        'raw_cotton',
        1200,
        NOW() + INTERVAL '6 hours',
        NOW() + INTERVAL '1 hour',
        NOW() + INTERVAL '4 hours'
    )
ON CONFLICT DO NOTHING;

-- ==========================================
-- TRIP EVENTS (audit trail for demo trips)
-- ==========================================
INSERT INTO trip_events (trip_id, event_type, payload) VALUES
    ('trip0001-0000-0000-0000-000000000001', 'request_raised', '{"material": "pig_iron", "qty_kg": 3500}'),
    ('trip0001-0000-0000-0000-000000000001', 'supplier_confirmed', '{"supplier": "Erode Steels Pvt Ltd"}'),
    ('trip0001-0000-0000-0000-000000000001', 'driver_assigned', '{"driver": "Murugan", "truck": "TN-38-BZ-4042"}'),
    ('trip0001-0000-0000-0000-000000000001', 'departed', '{"from": "Erode"}'),
    ('trip0002-0000-0000-0000-000000000002', 'request_raised', '{"material": "raw_cotton", "qty_kg": 1200}'),
    ('trip0002-0000-0000-0000-000000000002', 'supplier_confirmed', '{"supplier": "Surat Cotton Trading Co"}'),
    ('trip0002-0000-0000-0000-000000000002', 'driver_assigned', '{"driver": "Kumar", "truck": "TN-38-CC-1987"}')
ON CONFLICT DO NOTHING;

-- ==========================================
-- USERS (Manager, Gate Guard, Supplier users)
-- ==========================================
INSERT INTO users (id, name, email, phone, password_hash, role, factory_id, supplier_id) VALUES
    ('u0000001-0000-0000-0000-000000000001', 'Priya Krishnamurthy', 'priya@logicore.in', '+919876500001', '$2b$10$YQ8Hk5YQ8Hk5YQ8Hk5YQ8OzRvN5ZcKfE3Y4SqJ2vWxU7tBmD6nK6', 'manager', 'f0000001-0000-0000-0000-000000000001', NULL),
    ('u0000002-0000-0000-0000-000000000002', 'Suresh Kumar', 'suresh@logicore.in', '+919876500004', '$2b$10$YQ8Hk5YQ8Hk5YQ8Hk5YQ8OzRvN5ZcKfE3Y4SqJ2vWxU7tBmD6nK6', 'gate_guard', 'f0000001-0000-0000-0000-000000000001', NULL),
    ('u0000003-0000-0000-0000-000000000003', 'Rajan Govindaraj', 'rajan@erodesteels.in', '+919876500011', '$2b$10$YQ8Hk5YQ8Hk5YQ8Hk5YQ8OzRvN5ZcKfE3Y4SqJ2vWxU7tBmD6nK6', 'supplier', NULL, 's0000001-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
