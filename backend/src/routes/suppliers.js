const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// GET /api/v1/suppliers
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT s.id, s.name, s.contact_phone, s.material_types, s.rating,
                   COUNT(t.id)::int as pending_pickups
            FROM suppliers s
            LEFT JOIN trips t ON t.supplier_id = s.id AND t.status IN ('created', 'assigned', 'en_route')
            GROUP BY s.id
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/v1/suppliers/:id/confirm
router.post('/:id/confirm', async (req, res) => {
    try {
        const { trip_code } = req.body;
        const tripRes = await pool.query('SELECT id FROM trips WHERE trip_code = $1 AND supplier_id = $2', [trip_code, req.params.id]);
        
        if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found or does not belong to this supplier' });
        
        const trip = tripRes.rows[0];
        
        // Update status and get full trip
        const updatedTripRes = await pool.query('UPDATE trips SET status = $1 WHERE id = $2 RETURNING *', ['ready', trip.id]);
        const updatedTrip = updatedTripRes.rows[0];

        await pool.query(`INSERT INTO trip_events (trip_id, event_type, description) VALUES ($1, 'supplier_confirmed', 'Supplier confirmed pickup')`, [trip.id]);
        
        try {
            const { getIO } = require('../socket');
            getIO().to(`trip:${trip_code}`).emit('trip:plan_changed', updatedTrip);
            getIO().to('managers').emit('trip:plan_changed', updatedTrip);
        } catch (err) { console.error('Socket error emitting plan_changed:', err); }

        res.json({ success: true, trip: updatedTrip });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/v1/suppliers/:id/delay
router.post('/:id/delay', async (req, res) => {
    try {
        const { trip_code, delay_minutes, reason } = req.body;
        const tripRes = await pool.query(`
            UPDATE trips 
            SET eta = eta + ($1 || ' minutes')::interval 
            WHERE trip_code = $2 AND supplier_id = $3
            RETURNING eta, id
        `, [delay_minutes, trip_code, req.params.id]);
        
        if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found or does not belong to this supplier' });
        
        const trip = tripRes.rows[0];
        
        await pool.query(`INSERT INTO trip_events (trip_id, event_type, description) VALUES ($1, 'supplier_delay', $2)`, [trip.id, `Supplier delayed by ${delay_minutes} mins: ${reason}`]);
        
        try {
            const { getIO } = require('../socket');
            // send the updated trip to clients so delay applies real-time
            getIO().to(`trip:${trip_code}`).emit('trip:plan_changed', trip);
            getIO().to('managers').emit('trip:plan_changed', trip);
        } catch (err) { console.error('Socket error emitting plan_changed:', err); }

        res.json({ eta: trip.eta });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
