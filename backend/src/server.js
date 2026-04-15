require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const http       = require('http');

const { pool }        = require('./config/db');
const { initSocket }  = require('./socket');
const { startWatchdog } = require('./services/watchdog');
const { requireAuth } = require('./middleware/auth');
const logger          = require('./utils/logger');

const app = express();

// ── Security ──────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    ...(process.env.EXTRA_ORIGINS ? process.env.EXTRA_ORIGINS.split(',') : [])
];
app.use(cors({
    origin: (origin, cb) => {
        // Allow requests with no origin (mobile apps, curl, simulator)
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true
}));

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));

// ── HTTP request logging ──────────────────────────────────────
app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) }
}));

// ── Rate limiting ─────────────────────────────────────────────
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again in 15 minutes.' }
});

app.use('/api/', generalLimiter);

// ── Health check (public) ─────────────────────────────────────
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ status: 'error', db: e.message, timestamp: new Date().toISOString() });
    }
});

// ── Auth routes (public, rate-limited login) ──────────────────
const authRouter = require('./routes/auth');
app.use('/api/auth/login', authLimiter);
app.use('/api/auth', authRouter);

// ── Protected API routes ──────────────────────────────────────
app.use('/api/v1', requireAuth);

app.use('/api/v1/trips',     require('./routes/trips'));
app.use('/api/v1/drivers',   require('./routes/drivers'));
app.use('/api/v1/suppliers', require('./routes/suppliers'));
app.use('/api/v1/kpis',      require('./routes/kpis'));
app.use('/api/v1/qr',        require('./routes/qr'));
app.use('/api/v1/epods',     require('./routes/epods'));
app.use('/api/v1/telemetry', require('./routes/telemetry'));

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    logger.error(`[Error] ${err.message}`, { stack: err.stack, path: req.path });
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        error: err.message || 'Internal server error',
        code: err.code || 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// ── Start server ──────────────────────────────────────────────
const PORT   = process.env.PORT || 3000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, '0.0.0.0', () => {
    logger.info(`[LogiCore] Backend running → http://0.0.0.0:${PORT}`);
    startWatchdog();
});
