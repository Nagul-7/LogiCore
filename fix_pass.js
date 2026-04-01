const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: 'backend/.env' });

async function fix() {
    const pool = new Pool({ connectionString: process.env.DB_URL });
    const realHash = await bcrypt.hash('logicore123', 10);
    await pool.query('UPDATE users SET password_hash = $1', [realHash]);
    await pool.query('UPDATE drivers SET password_hash = $1', [realHash]);
    console.log('Fixed passwords!');
    process.exit(0);
}
fix();
