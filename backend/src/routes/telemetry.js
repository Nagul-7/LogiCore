const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// POST /api/v1/telemetry/gps
router.post('/gps', async (req, res) => {
    try {
        const { device_id, trip_id, lat, lng, speed_kmh, ignition, timestamp } = req.body;

        // "trip_id" in payload is actually the trip_code string e.g "TRIP-2026-001"
        const tripRes = await pool.query('SELECT id, driver_id FROM trips WHERE trip_code = $1', [trip_id]);
        if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
        const realTripId = tripRes.rows[0].id;
        const driverId = tripRes.rows[0].driver_id;

        // Insert into telemetry_gps
        await pool.query(
            `INSERT INTO telemetry_gps (time, device_id, trip_id, lat, lng, speed_kmh, ignition) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [timestamp, device_id, realTripId, lat, lng, speed_kmh, ignition]
        );

        // Update driver's location (find driver from trip_id)
        if (driverId) {
            await pool.query(
                `UPDATE drivers 
                 SET current_lat = $1, current_lng = $2, last_seen = $3
                 WHERE id = $4`,
                [lat, lng, timestamp, driverId]
            );
        }

        try {
            const { getIO } = require('../socket');
            const io = getIO();
            io.to(`trip:${trip_id}`).emit('trip:gps_update', {
                trip_code: trip_id,
                lat: lat,
                lng: lng,
                speed_kmh: speed_kmh,
                timestamp: timestamp || new Date()
            });
            io.to('managers').emit('trip:gps_update', { trip_code: trip_id, lat: lat, lng: lng, speed_kmh: speed_kmh });
        } catch (err) {
            console.error('Socket error in gps update:', err);
        }

        res.status(201).json({ success: true, message: 'GPS data saved' });
    } catch (e) {
        console.error('GPS telemetry error:', e);
        res.status(500).json({ error: e.message });
    }
});

// POST /api/v1/telemetry/inventory
router.post('/inventory', async (req, res) => {
    try {
        const { sensor_id, factory_id, material_type, fill_percent, weight_kg, threshold_alert, timestamp } = req.body;

        await pool.query(
            `INSERT INTO telemetry_inventory (time, sensor_id, factory_id, material_type, fill_percent, weight_kg, threshold_alert) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [timestamp, sensor_id, factory_id, material_type, fill_percent, weight_kg, threshold_alert]
        );

        if (threshold_alert) {
            try {
                const { getIO } = require('../socket');
                const io = getIO();
                io.to('managers').emit('inventory:alert', { 
                    sensor_id: sensor_id, 
                    factory_id: factory_id, 
                    material_type: material_type, 
                    fill_percent: fill_percent 
                });
            } catch (err) {
                console.error('Socket error in inventory alert:', err);
            }
        }

        res.status(201).json({ success: true, message: 'Inventory data saved' });
    } catch (e) {
        console.error('Inventory telemetry error:', e);
        res.status(500).json({ error: e.message });
    }
});

// POST /api/v1/telemetry/gate
router.post('/gate', async (req, res) => {
    try {
        const { reader_id, trip_id, factory_id, event_type, qr_code_hash, timestamp } = req.body;

        // "trip_id" in payload is actually the trip_code string
        const tripRes = await pool.query('SELECT id FROM trips WHERE trip_code = $1', [trip_id]);
        if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
        const realTripId = tripRes.rows[0].id;

        // Insert into trip_events
        await pool.query(
            `INSERT INTO trip_events (trip_id, event_type, description, payload, created_at) 
             VALUES ($1, 'gate_scan', $2, $3, $4)`,
            [realTripId, `Gate scan: ${event_type}`, JSON.stringify({ reader_id, factory_id, qr_code_hash }), timestamp]
        );

        // Update trip status if entry
        if (event_type === 'entry') {
            await pool.query(
                `UPDATE trips SET status = 'at_gate', updated_at = $1 WHERE id = $2`,
                [timestamp, realTripId]
            );
        }

        res.status(201).json({ success: true, message: 'Gate event saved' });
    } catch (e) {
        console.error('Gate telemetry error:', e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
