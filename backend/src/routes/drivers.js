const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// GET /api/v1/drivers
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT d.id, d.name, d.phone, d.email, d.language, d.reliability_score,
                   d.is_online, d.last_seen,
                   t.plate_number, t.model as truck_model, t.capacity_kg, t.truck_type,
                   tr.trip_code as active_trip
            FROM drivers d
            LEFT JOIN trucks t ON t.driver_id = d.id
            LEFT JOIN trips tr ON tr.driver_id = d.id AND tr.status = 'en_route'
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/v1/drivers/:id  — full profile for driver app
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const driverRes = await pool.query(`
            SELECT d.id, d.name, d.phone, d.email, d.language, d.reliability_score,
                   d.is_online, d.last_seen, d.created_at,
                   t.plate_number, t.model as truck_model, t.capacity_kg, t.truck_type
            FROM drivers d
            LEFT JOIN trucks t ON t.driver_id = d.id
            WHERE d.id = $1
        `, [id]);

        if (driverRes.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });
        const driver = driverRes.rows[0];

        // Aggregate completed trip count
        const countRes = await pool.query(
            `SELECT COUNT(*) as completed_trips FROM trips WHERE driver_id = $1 AND status = 'completed'`,
            [id]
        );
        driver.completed_trips = parseInt(countRes.rows[0].completed_trips, 10);

        res.json(driver);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/v1/drivers/:id/trips
router.get('/:id/trips', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM trips WHERE driver_id = $1 ORDER BY created_at DESC LIMIT 10
        `, [req.params.id]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// PATCH /api/v1/drivers/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const { is_online } = req.body;
        const result = await pool.query(`
            UPDATE drivers SET is_online = $1, last_seen = NOW() WHERE id = $2 RETURNING *
        `, [is_online, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });
        
        res.json(result.rows[0]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
