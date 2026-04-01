const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// POST /api/v1/epods
router.post('/', async (req, res) => {
    try {
        const { trip_code, received_qty_kg, status } = req.body;
        
        const tripRes = await pool.query('SELECT id FROM trips WHERE trip_code = $1', [trip_code]);
        if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
        
        const tripId = tripRes.rows[0].id;
        
        const epodRes = await pool.query(`
            INSERT INTO epods (trip_id, received_qty_kg, status, confirmed_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING *
        `, [tripId, received_qty_kg, status]);
        
        await pool.query('UPDATE trips SET status = \'completed\' WHERE id = $1', [tripId]);
        
        await pool.query(`
            INSERT INTO trip_events (trip_id, event_type, description)
            VALUES ($1, 'epod_created', 'ePOD submitted and trip completed')
        `, [tripId]);
        
        res.json(epodRes.rows[0]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/v1/epods/:id/discrepancy
router.post('/:id/discrepancy', async (req, res) => {
    try {
        const { discrepancy_type, discrepancy_notes, actual_qty_kg } = req.body;
        
        const epodRes = await pool.query(`
            UPDATE epods 
            SET discrepancy_type = $1, discrepancy_notes = $2, received_qty_kg = $3, status = 'discrepancy'
            WHERE id = $4
            RETURNING *
        `, [discrepancy_type, discrepancy_notes, actual_qty_kg, req.params.id]);
        
        if (epodRes.rows.length === 0) return res.status(404).json({ error: 'ePOD not found' });
        const epod = epodRes.rows[0];
        
        await pool.query(`
            INSERT INTO trip_events (trip_id, event_type, description)
            VALUES ($1, 'epod_discrepancy', 'Discrepancy reported on ePOD')
        `, [epod.trip_id]);
        
        res.json(epod);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
