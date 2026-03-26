const { Pool } = require('pg');

/**
 * PostgreSQL connection pool for LogiCore.
 * Uses DB_URL from environment for connection string.
 */
const pool = new Pool({
    connectionString: process.env.DB_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err);
});

/**
 * Test database connectivity.
 * @returns {Promise<boolean>}
 */
async function testConnection() {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        return true;
    } catch (err) {
        console.error('Database connection failed:', err.message);
        return false;
    }
}

module.exports = { pool, testConnection };
