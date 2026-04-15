const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { pool }        = require('../config/db');
const { redisClient } = require('../config/redis');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

// ──────────────────────────────────────────────────────────────
// POST /api/auth/login
// Accepts: { email, password }  for manager / supplier / gate
//          { phone, password }  for driver (PIN = password)
// ──────────────────────────────────────────────────────────────
router.post('/login', validate(schemas.login), async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        let user = null;
        let role = null;
        let extraClaims = {};

        // 1. Try drivers table (phone login)
        if (phone) {
            const r = await pool.query('SELECT * FROM drivers WHERE phone = $1', [phone]);
            if (r.rows.length) {
                user = r.rows[0];
                role = 'driver';
                extraClaims = { driverId: user.id };
            }
        }

        // 2. Try users table (email or phone login)
        if (!user) {
            let r;
            if (email) {
                r = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
            } else if (phone) {
                r = await pool.query('SELECT * FROM users WHERE phone = $1 AND is_active = true', [phone]);
            }
            if (r && r.rows.length) {
                user = r.rows[0];
                role = user.role;
                if (user.supplier_id) extraClaims.supplierId = user.supplier_id;
                if (user.factory_id)  extraClaims.factoryId  = user.factory_id;
            }
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 3. Verify password
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 4. Sign JWT
        const expiresIn = `${process.env.TOKEN_EXPIRY_HOURS || 24}h`;
        const token = jwt.sign(
            { id: user.id, name: user.name, role, ...extraClaims },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, role, ...extraClaims }
        });
    } catch (err) {
        console.error('[Auth] Login error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ──────────────────────────────────────────────────────────────
// GET /api/auth/me  (requires valid Bearer token)
// ──────────────────────────────────────────────────────────────
router.get('/me', require('../middleware/auth').requireAuth, (req, res) => {
    // req.user is the decoded JWT payload
    res.json({ user: req.user });
});

// ──────────────────────────────────────────────────────────────
// POST /api/auth/logout  — blacklist token in Redis
// ──────────────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = require('jsonwebtoken').decode(token);
            if (decoded && decoded.exp) {
                const remaining = decoded.exp - Math.floor(Date.now() / 1000);
                if (remaining > 0 && redisClient.isOpen) {
                    await redisClient.setEx(`bl_${token}`, remaining, 'true');
                }
            }
        }
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
