const cron = require('node-cron');
const { pool } = require('../config/db');
const { getIO } = require('../socket');

function startWatchdog() {
  cron.schedule('* * * * *', async () => {
    try {
      const io = getIO();

      // Check 1: Driver no-show detection
      const noshowResult = await pool.query(`
        SELECT t.trip_code, t.driver_id, d.name as driver_name
        FROM trips t
        JOIN drivers d ON d.id = t.driver_id
        WHERE t.status = 'assigned'
        AND t.depart_by < NOW() + INTERVAL '30 minutes'
        AND t.depart_by > NOW() - INTERVAL '60 minutes'
        AND NOT EXISTS (
          SELECT 1 FROM telemetry_gps g
          WHERE g.trip_id = t.trip_code
          AND g.time > NOW() - INTERVAL '15 minutes'
        )
      `);

      for (const trip of noshowResult.rows) {
        console.log(`[Watchdog] No-show detected: ${trip.trip_code} driver ${trip.driver_name}`);
        io.to('managers').emit('trip:exception', {
          type: 'noshow',
          trip_code: trip.trip_code,
          message: `Driver no-show detected — ${trip.driver_name} has not departed for ${trip.trip_code}`,
          severity: 'critical'
        });
        try {
          await pool.query(
            `INSERT INTO trip_events (trip_id, event_type, description) VALUES ($1, 'noshow_detected', 'Watchdog detected driver has not departed')`,
            [trip.trip_code]
          );
        } catch (_) { /* trip_events may use id, skip silently */ }
      }

      // Check 2: Stall detection
      const stallResult = await pool.query(`
        SELECT DISTINCT t.trip_code, d.name as driver_name
        FROM trips t
        JOIN drivers d ON d.id = t.driver_id
        WHERE t.status = 'en_route'
        AND EXISTS (
          SELECT 1 FROM telemetry_gps g WHERE g.trip_id = t.trip_code
        )
        AND NOT EXISTS (
          SELECT 1 FROM telemetry_gps g
          WHERE g.trip_id = t.trip_code
          AND g.time > NOW() - INTERVAL '10 minutes'
        )
      `);

      for (const trip of stallResult.rows) {
        console.log(`[Watchdog] Stall detected: ${trip.trip_code}`);
        io.to('managers').emit('trip:exception', {
          type: 'stall',
          trip_code: trip.trip_code,
          message: `GPS signal lost — ${trip.trip_code} may be stalled`,
          severity: 'warning'
        });
      }

      // Check 3: Overdue deliveries
      const overdueResult = await pool.query(`
        SELECT t.trip_code, t.eta, d.name as driver_name
        FROM trips t
        JOIN drivers d ON d.id = t.driver_id
        WHERE t.status = 'en_route'
        AND t.eta < NOW() - INTERVAL '30 minutes'
      `);

      for (const trip of overdueResult.rows) {
        io.to('managers').emit('trip:exception', {
          type: 'overdue',
          trip_code: trip.trip_code,
          message: `Delivery overdue — ${trip.trip_code} was due at ${new Date(trip.eta).toLocaleTimeString('en-IN')}`,
          severity: 'warning'
        });
      }

    } catch (err) {
      console.error('[Watchdog] Error:', err.message);
    }
  });

  console.log('[Watchdog] Started — checking every 60 seconds');
}

module.exports = { startWatchdog };
