require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            status: "ok",
            db: "connected",
            redis: "checking",
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({
            status: "error",
            db: e.message,
            redis: "checking",
            timestamp: new Date().toISOString()
        });
    }
});

const tripsRouter = require('./routes/trips');
const driversRouter = require('./routes/drivers');
const suppliersRouter = require('./routes/suppliers');
const kpisRouter = require('./routes/kpis');
const qrRouter = require('./routes/qr');
const epodsRouter = require('./routes/epods');
const telemetryRouter = require('./routes/telemetry');

app.use('/api/v1/trips', tripsRouter);
app.use('/api/v1/drivers', driversRouter);
app.use('/api/v1/suppliers', suppliersRouter);
app.use('/api/v1/kpis', kpisRouter);
app.use('/api/v1/qr', qrRouter);
app.use('/api/v1/epods', epodsRouter);
app.use('/api/v1/telemetry', telemetryRouter);

const PORT = process.env.PORT || 3000;
const http = require('http');
const { initSocket } = require('./socket');
const { startWatchdog } = require('./services/watchdog');
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    startWatchdog();
});
