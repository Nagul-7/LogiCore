const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DB_URL || 'postgres://postgres:postgres@localhost:5432/logicore'
});

pool.connect()
    .then(() => console.log('PostgreSQL connected'))
    .catch(e => console.error('PostgreSQL Connection Error:', e.message));

module.exports = { pool };
