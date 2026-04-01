const express = require('express');
const { pool } = require('../config/db');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// POST /api/v1/qr/generate
router.post('/generate', async (req, res) => {
    try {
        const { trip_code } = req.body;
        
        const tripRes = await pool.query('SELECT id FROM trips WHERE trip_code = $1', [trip_code]);
        if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
        const tripId = tripRes.rows[0].id;
        
        const token = uuidv4();
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        
        await pool.query(`
            INSERT INTO qr_tokens (trip_id, token_hash, expires_at)
            VALUES ($1, $2, NOW() + INTERVAL '2 hours')
        `, [tripId, tokenHash]);
        
        res.json({ token });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/v1/qr/validate
router.post('/validate', async (req, res) => {
    try {
        const { token, factory_id } = req.body;
        
        if (!token) return res.status(400).json({ error: 'Token is required' });
        
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        
        const qrRes = await pool.query('SELECT * FROM qr_tokens WHERE token_hash = $1', [tokenHash]);
        
        if (qrRes.rows.length === 0) {
            return res.json({ valid: false, reason: 'QR code not recognized' });
        }
        
        const qr = qrRes.rows[0];
        
        if (qr.used_at !== null) {
            return res.json({ valid: false, reason: 'QR code already used' });
        }
        
        if (new Date(qr.expires_at) < new Date()) {
            return res.json({ valid: false, reason: 'QR code has expired' });
        }
        
        const tripRes = await pool.query(`
            SELECT t.id, t.trip_code, t.factory_id, t.material_type, t.quantity_kg, 
                   d.name as driver_name, tr.plate_number as truck, s.name as supplier
            FROM trips t
            LEFT JOIN drivers d ON t.driver_id = d.id
            LEFT JOIN trucks tr ON t.truck_id = tr.id
            LEFT JOIN suppliers s ON t.supplier_id = s.id
            WHERE t.id = $1
        `, [qr.trip_id]);
        
        if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
        
        const trip = tripRes.rows[0];
        
        if (trip.factory_id !== factory_id) {
            return res.json({ valid: false, reason: 'This QR is for a different factory' });
        }
        
        await pool.query('UPDATE qr_tokens SET used_at = NOW() WHERE id = $1', [qr.id]);
        
        res.json({
            valid: true,
            trip: {
                driver_name: trip.driver_name,
                truck: trip.truck,
                material: trip.material_type,
                quantity: trip.quantity_kg,
                supplier: trip.supplier
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
