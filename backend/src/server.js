require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const corsMiddleware = require('./config/cors');
const { pool, testConnection } = require('./config/db');
const { redisClient, testRedisConnection, connectRedis } = require('./config/redis');

const app = express();
const server = http.createServer(app);

// Socket.io with CORS for LAN devices
const io = new Server(server, {
    cors: {
        origin: [
            /^http:\/\/192\.168\./,
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003',
            'http://localhost:3004',
        ],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// ------ Middleware ------
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ------ Health Check Endpoint ------
app.get('/api/health', async (req, res) => {
    const dbConnected = await testConnection();
    const redisConnected = await testRedisConnection();

    res.json({
        status: dbConnected && redisConnected ? 'ok' : 'degraded',
        db: dbConnected ? 'connected' : 'disconnected',
        redis: redisConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ------ API Routes (will be added in Phase 2) ------
app.get('/api', (req, res) => {
    res.json({
        name: 'LogiCore API',
        version: '1.0.0',
        description: 'Smart Inbound Logistics Management System',
    });
});

// ------ Socket.io Connection (will be expanded in Phase 6) ------
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join:trip', (tripId) => {
        socket.join(tripId);
        console.log(`📡 Socket ${socket.id} joined room: ${tripId}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// Make io accessible to routes
app.set('io', io);

// ------ Start Server ------
const PORT = process.env.PORT || 3000;

async function start() {
    try {
        // Connect to Redis
        await connectRedis();
        console.log('✅ Redis ready');

        // Test PostgreSQL
        const dbOk = await testConnection();
        if (dbOk) {
            console.log('✅ PostgreSQL connected');
        } else {
            console.warn('⚠️  PostgreSQL not available — running without DB');
        }

        // Bind to 0.0.0.0 — critical for LAN multi-device access
        server.listen(PORT, '0.0.0.0', () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════╗');
            console.log('║   🚛 LogiCore Backend v1.0                     ║');
            console.log(`║   Running on all interfaces at port ${PORT}        ║`);
            console.log('║   http://0.0.0.0:' + PORT + '                         ║');
            console.log('╚════════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
}

start();

module.exports = { app, server, io };
