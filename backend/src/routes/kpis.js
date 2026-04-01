const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// GET /api/v1/kpis
router.get('/', async (req, res) => {
    try {
        const result = {
            active_trips: 0,
            on_time_rate: 0,
            delayed_trips: 0,
            low_stock_alerts: 0,
            total_trips_today: 0,
            completed_today: 0
        };

        const activeRes = await pool.query(`SELECT COUNT(*) as count FROM trips WHERE status IN ('assigned', 'en_route', 'arrived', 'at_gate')`);
        result.active_trips = parseInt(activeRes.rows[0].count, 10);

        const onTimeRes = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN actual_arrival <= eta THEN 1 ELSE 0 END) as on_time
            FROM trips 
            WHERE status = 'completed' AND actual_arrival >= NOW() - INTERVAL '30 days'
        `);
        const totalCompleted = parseInt(onTimeRes.rows[0].total, 10);
        const onTimeCompleted = parseInt(onTimeRes.rows[0].on_time || 0, 10);
        result.on_time_rate = totalCompleted > 0 ? Math.round((onTimeCompleted / totalCompleted) * 100) : 100;

        const delayedRes = await pool.query(`
            SELECT COUNT(*) as count 
            FROM trips 
            WHERE status = 'delayed' OR (status = 'en_route' AND eta < NOW())
        `);
        result.delayed_trips = parseInt(delayedRes.rows[0].count, 10);

        const stockRes = await pool.query(`
            SELECT COUNT(DISTINCT factory_id) as count 
            FROM telemetry_inventory 
            WHERE fill_percent < 20 AND time > NOW() - INTERVAL '1 hour'
        `);
        result.low_stock_alerts = parseInt(stockRes.rows[0].count, 10);

        const todayRes = await pool.query(`
            SELECT COUNT(*) as count 
            FROM trips 
            WHERE created_at::DATE = CURRENT_DATE
        `);
        result.total_trips_today = parseInt(todayRes.rows[0].count, 10);

        const compTodayRes = await pool.query(`
            SELECT COUNT(*) as count 
            FROM trips 
            WHERE status = 'completed' AND updated_at::DATE = CURRENT_DATE
        `);
        result.completed_today = parseInt(compTodayRes.rows[0].count, 10);

        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/v1/inventory/weekly
router.get('/inventory/weekly', async (req, res) => {
    try {
        const demoData = [
          { day: "Mon", incoming: 3200, outgoing: 2100 },
          { day: "Tue", incoming: 4800, outgoing: 3600 },
          { day: "Wed", incoming: 2600, outgoing: 1800 },
          { day: "Thu", incoming: 3900, outgoing: 2900 },
          { day: "Fri", incoming: 2200, outgoing: 1600 },
          { day: "Sat", incoming: 1800, outgoing: 900 },
          { day: "Sun", incoming: 4200, outgoing: 3100 }
        ];
        res.json(demoData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/v1/inventory/latest
router.get('/inventory/latest', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT ON (sensor_id) sensor_id, factory_id, material_type, fill_percent, weight_kg, time
            FROM telemetry_inventory
            ORDER BY sensor_id, time DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
