const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { redisClient } = require('../config/redis');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

// 2.4 POST /api/auth/login
router.post('/login', validate(schemas.login), async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        let user = null;
        let role = null;

        // Check if phone or email
        if (email) {
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (result.rows.length) {
                user = result.rows[0];
                role = user.role; // manager, supplier, gate_guard
            }
        }

        if (!user && phone) {
            const driverResult = await pool.query('SELECT * FROM drivers WHERE phone = $1', [phone]);
            if (driverResult.rows.length) {
                user = driverResult.rows[0];
                role = 'driver';
            } else {
                const userResult = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
                if (userResult.rows.length) {
                    user = userResult.rows[0];
                    role = userResult.rows[0].role;
                }
            }
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // We use bcrypt.compare on password_hash in DB
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        // We include {id, email, role, name}
        const token = jwt.sign(
            { id: user.id, email: user.email || null, role: role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Usually good for demo
        );

        res.json({ token, user: { id: user.id, role, name: user.name, email: user.email } });

    } catch (err) {
        console.error('Login error', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2.5 POST /api/auth/logout
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.decode(token);

        if (decoded && decoded.exp) {
            const remainingExp = decoded.exp - Math.floor(Date.now() / 1000);
            if (remainingExp > 0 && redisClient.isOpen) {
                await redisClient.setEx(`bl_${token}`, remainingExp, 'true');
            }
        }
        res.json({ message: 'Successfully logged out' });
    } catch (err) {
        console.error('Logout error', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
