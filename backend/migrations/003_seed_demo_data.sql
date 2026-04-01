-- Insert 3 factories
INSERT INTO factories (name, address, lat, lng, cluster_zone) VALUES
('Kurichi Precision Castings', 'Kurichi Industrial Estate Coimbatore 641021', 10.9601, 76.9199, 'Kurichi SIDCO'),
('Ganapathy Engineering Works', 'Ganapathy Industrial Estate Coimbatore 641006', 11.0437, 76.9966, 'Ganapathy SIDCO'),
('Singanallur Foundry Ltd', 'Singanallur Coimbatore 641005', 11.0168, 77.0168, 'Singanallur');

-- Insert 4 suppliers
INSERT INTO suppliers (name, contact_phone, lat, lng, material_types, rating) VALUES
('Erode Steel Distributors', '9842100001', 11.3410, 77.7172, ARRAY['pig_iron', 'scrap_metal'], 4.8),
('CBE Raw Materials Pvt Ltd', '9842100002', 11.0200, 76.9800, ARRAY['coke', 'pig_iron'], 4.5),
('Salem Scrap Traders', '9842100003', 11.6643, 78.1460, ARRAY['scrap_metal'], 4.3),
('Surat Cotton Exports', '9842100004', 21.1702, 72.8311, ARRAY['cotton'], 4.7);

-- Insert 5 drivers
INSERT INTO drivers (name, phone, email, language, reliability_score, is_online) VALUES
('முருகன் (Murugan)', '9876543201', 'driver1@logicore.demo', 'ta', 92, true),
('குமார் (Kumar)', '9876543202', 'driver2@logicore.demo', 'ta', 87, true),
('ராஜேந்திரன் (Rajendran)', '9876543203', 'driver3@logicore.demo', 'ta', 95, false),
('வேலு (Velu)', '9876543204', 'driver4@logicore.demo', 'ta', 78, false),
('கார்த்திக் (Karthik)', '9876543205', 'driver5@logicore.demo', 'ta', 89, true);

-- Insert 3 trucks
INSERT INTO trucks (plate_number, model, capacity_kg, truck_type, driver_id) VALUES
('TN33AK1234', 'Ashok Leyland 2518', 25000, 'open_flatbed', 1),
('TN33BK5678', 'Tata LPT 2518', 20000, 'closed_container', 2),
('TN33CK9012', 'Eicher Pro 6031', 15000, 'open_flatbed', 3);

-- Insert 2 demo trips
INSERT INTO trips (trip_code, factory_id, supplier_id, driver_id, truck_id, material_type, quantity_kg, furnace_time, depart_by, eta, status, distance_km) VALUES
('TRIP-2026-001', 1, 1, 1, 1, 'pig_iron', 3500, NOW() + INTERVAL '1 day 8 hours', NOW() + INTERVAL '1 day 5 hours', NOW() + INTERVAL '1 day 7 hours', 'en_route', 87.3),
('TRIP-2026-002', 2, 2, 2, 2, 'coke', 800, NOW() + INTERVAL '1 day 14 hours', NOW() + INTERVAL '1 day 11 hours', NOW() + INTERVAL '1 day 13 hours', 'planning', 12.4);
