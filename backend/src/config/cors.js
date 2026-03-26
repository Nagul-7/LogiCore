const cors = require('cors');

/**
 * CORS Configuration for LogiCore multi-device LAN demo.
 * Allows all 192.168.x.x origins + localhost dev servers.
 */
const corsOptions = {
    origin: [
        /^http:\/\/192\.168\./,     // Allow all LAN devices
        'http://localhost:3000',
        'http://localhost:3001',     // Manager Dashboard
        'http://localhost:3002',     // Driver App
        'http://localhost:3003',     // Supplier Portal
        'http://localhost:3004',     // Gate App
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);
