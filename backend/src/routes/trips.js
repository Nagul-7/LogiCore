const express = require('express');
const { pool } = require('../config/db');
const aiEngine = require('../services/aiEngine');

const router = express.Router();

// GET /api/v1/trips
router.get('/', async (req, res) => {
    try {
        let query = `
            SELECT t.id, t.trip_code, f.name as factory_name, s.name as supplier_name, d.name as driver_name, d.phone as driver_phone,
            t.material_type, t.quantity_kg, t.status, t.eta, t.depart_by, t.distance_km, t.created_at
            FROM trips t
            LEFT JOIN factories f ON t.factory_id = f.id
            LEFT JOIN suppliers s ON t.supplier_id = s.id
            LEFT JOIN drivers d ON t.driver_id = d.id
            WHERE 1=1
        `;
        let params = [];
        let idx = 1;
        
        if (req.query.status) {
            query += ` AND t.status = $${idx++}`;
            params.push(req.query.status);
        }
        if (req.query.factory_id) {
            query += ` AND t.factory_id = $${idx++}`;
            params.push(req.query.factory_id);
        }
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/v1/trips/:trip_code
router.get('/:trip_code', async (req, res) => {
    try {
        const tripCode = req.params.trip_code;
        const tripRes = await pool.query(`
            SELECT t.id, t.trip_code, f.name as factory_name, s.name as supplier_name, d.name as driver_name, d.phone as driver_phone,
            t.material_type, t.quantity_kg, t.status, t.eta, t.depart_by, t.distance_km, t.created_at
            FROM trips t
            LEFT JOIN factories f ON t.factory_id = f.id
            LEFT JOIN suppliers s ON t.supplier_id = s.id
            LEFT JOIN drivers d ON t.driver_id = d.id
            WHERE t.trip_code = $1
        `, [tripCode]);
        
        if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
        
        const trip = tripRes.rows[0];
        
        const eventsRes = await pool.query(`SELECT event_type, description, created_at FROM trip_events WHERE trip_id = $1 ORDER BY created_at ASC`, [trip.id]);
        trip.events = eventsRes.rows;
        
        const posRes = await pool.query(`SELECT lat, lng, speed_kmh, time as recorded_at FROM telemetry_gps WHERE trip_id = $1 ORDER BY time DESC LIMIT 1`, [trip.id]);
        trip.latest_position = posRes.rows[0] || null;
        
        res.json(trip);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/v1/trips
router.post('/', async (req, res) => {
    try {
        const { factory_id, supplier_id, material_type, quantity_kg, furnace_time } = req.body;
        const year = new Date().getFullYear();
        const rand = String(Math.floor(Math.random() * 900) + 100);
        const tripCode = `TRIP-${year}-${rand}`;
        
        const factRes = await pool.query('SELECT lat, lng FROM factories WHERE id = $1', [factory_id]);
        const suppRes = await pool.query('SELECT lat, lng FROM suppliers WHERE id = $1', [supplier_id]);

        let depart_by = null;
        let eta = null;
        let distance_km = 0;
        
        if (factRes.rows[0] && suppRes.rows[0]) {
            const dest = factRes.rows[0];
            const origin = suppRes.rows[0];
            
            const routeResult = await aiEngine.getOSRMRoute(origin.lat, origin.lng, dest.lat, dest.lng);
            distance_km = routeResult.distance_km;
            
            const times = aiEngine.calculateDepartureWindow(routeResult, furnace_time);
            depart_by = times.depart_by;
            eta = times.eta;
        }
        
        const tripRes = await pool.query(`
            INSERT INTO trips (trip_code, factory_id, supplier_id, material_type, quantity_kg, furnace_time, depart_by, eta, distance_km, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'created')
            RETURNING *
        `, [tripCode, factory_id, supplier_id, material_type, quantity_kg, furnace_time, depart_by, eta, distance_km]);
        
        const trip = tripRes.rows[0];
        
        await pool.query(`INSERT INTO trip_events (trip_id, event_type, description) VALUES ($1, 'created', 'Trip created')`, [trip.id]);
        
        res.status(201).json(trip);
    } catch (e) {
         res.status(500).json({ error: e.message });
    }
});

// PATCH /api/v1/trips/:trip_code
router.patch('/:trip_code', async (req, res) => {
     try {
         const updates = [];
         const params = [];
         let idx = 1;
         
         if (req.body.quantity_kg !== undefined) {
             updates.push(`quantity_kg = $${idx++}`);
             params.push(req.body.quantity_kg);
         }
         if (req.body.furnace_time !== undefined) {
             updates.push(`furnace_time = $${idx++}`);
             params.push(req.body.furnace_time);
         }
         if (req.body.status !== undefined) {
             updates.push(`status = $${idx++}`);
             params.push(req.body.status);
         }
         
         if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
         
         params.push(req.params.trip_code);
         const query = `UPDATE trips SET ${updates.join(', ')} WHERE trip_code = $${idx} RETURNING *`;
         const tripRes = await pool.query(query, params);
         
         if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
         const trip = tripRes.rows[0];
         
         const reason = req.body.change_reason || 'Trip updated';
         await pool.query(`INSERT INTO trip_events (trip_id, event_type, description) VALUES ($1, 'updated', $2)`, [trip.id, reason]);
         
         if (req.body.quantity_kg !== undefined) {
             try {
                 const { getIO } = require('../socket');
                 const io = getIO();
                 io.to(`trip:${req.params.trip_code}`).emit('trip:plan_changed', { trip_code: req.params.trip_code, new_quantity: req.body.quantity_kg, reason: reason });
                 io.to('managers').emit('trip:plan_changed', { trip_code: req.params.trip_code, new_quantity: req.body.quantity_kg });
             } catch (err) {
                 console.error('Socket error emitting plan_changed:', err);
             }
         }
         
         res.json(trip);
     } catch (e) {
         res.status(500).json({ error: e.message });
     }
});

// POST /api/v1/trips/:trip_code/assign
router.post('/:trip_code/assign', async (req, res) => {
    try {
        const { driver_id, truck_id } = req.body;
        const tripRes = await pool.query(`
            UPDATE trips SET driver_id = $1, truck_id = $2, status = 'assigned' WHERE trip_code = $3 RETURNING *
        `, [driver_id, truck_id, req.params.trip_code]);
        if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
        const trip = tripRes.rows[0];
        
        await pool.query(`INSERT INTO trip_events (trip_id, event_type, description) VALUES ($1, 'assigned', 'Driver assigned')`, [trip.id]);
        
        res.json(trip);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/v1/trips/:trip_code/depart
router.post('/:trip_code/depart', async (req, res) => {
    try {
        const tripRes = await pool.query(`
            UPDATE trips SET status = 'en_route' WHERE trip_code = $1 RETURNING *
        `, [req.params.trip_code]);
        if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
        const trip = tripRes.rows[0];
        
        await pool.query(`INSERT INTO trip_events (trip_id, event_type, description) VALUES ($1, 'departed', 'Truck departed')`, [trip.id]);
        
        res.json(trip);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/v1/trips/:trip_code/arrive
router.post('/:trip_code/arrive', async (req, res) => {
    try {
        const tripRes = await pool.query(`
            UPDATE trips SET status = 'arrived', actual_arrival = NOW() WHERE trip_code = $1 RETURNING *
        `, [req.params.trip_code]);
        if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
        const trip = tripRes.rows[0];
        
        await pool.query(`INSERT INTO trip_events (trip_id, event_type, description) VALUES ($1, 'arrived', 'Truck arrived at gate')`, [trip.id]);
        
        res.json(trip);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/v1/trips/:trip_code/sos
router.post('/:trip_code/sos', async (req, res) => {
    try {
        const { reason, lat, lng } = req.body;
        
        const tripRes = await pool.query('SELECT id FROM trips WHERE trip_code = $1', [req.params.trip_code]);
        if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
        const tripId = tripRes.rows[0].id;
        
        const payload = JSON.stringify({ reason, lat, lng });
        const eventRes = await pool.query(`
            INSERT INTO trip_events (trip_id, event_type, description, lat, lng, payload) 
            VALUES ($1, 'sos', 'SOS Triggered', $2, $3, $4) 
            RETURNING *
        `, [tripId, lat, lng, payload]);
        
        res.json(eventRes.rows[0]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/v1/trips/:trip_code/route
router.get('/:trip_code/route', async (req, res) => {
    try {
        const tripCode = req.params.trip_code;
        
        const tripRes = await pool.query(`
            SELECT t.id, f.lat as factory_lat, f.lng as factory_lng,
                   s.lat as supplier_lat, s.lng as supplier_lng
            FROM trips t
            JOIN factories f ON t.factory_id = f.id
            JOIN suppliers s ON t.supplier_id = s.id
            WHERE t.trip_code = $1
        `, [tripCode]);

        if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
        
        const trip = tripRes.rows[0];

        const gpsRes = await pool.query(`
            SELECT lat, lng FROM telemetry_gps 
            WHERE trip_id = $1 
            ORDER BY time DESC LIMIT 1
        `, [trip.id]);

        let originLat = trip.supplier_lat;
        let originLng = trip.supplier_lng;
        
        if (gpsRes.rows.length > 0) {
            originLat = gpsRes.rows[0].lat;
            originLng = gpsRes.rows[0].lng;
        }

        const route = await aiEngine.getOSRMRoute(originLat, originLng, trip.factory_lat, trip.factory_lng);
        res.json(route);
    } catch (e) {
        console.error('GET /route Error', e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
