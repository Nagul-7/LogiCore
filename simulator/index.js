require('dotenv').config({ path: '../backend/.env' });
const { Pool } = require('pg');
const axios = require('axios');

const API_BASE = 'http://127.0.0.1:3000/api/v1';

const pool = new Pool({
    connectionString: process.env.DB_URL
});

// A local tracker to keep driver indexes for smooth animation
const activeTrackers = {};

async function stepTrips() {
    try {
        const res = await pool.query(`
            SELECT t.id, t.driver_id, d.current_lat, d.current_lng 
            FROM trips t
            JOIN drivers d ON t.driver_id = d.id
            WHERE t.status = 'en_route'
        `);

        for (let trip of res.rows) {
            // First time tracking this trip locally
            if (!activeTrackers[trip.id]) {
                try {
                    // Requires token for driver ideally, but telemetry GPS doesn't require auth in my route setup unless specified. 
                    // Let's check my telemetry route. It uses `validate(gpsSchema)`, no `authenticate`!
                    // Wait, let's get the route from the backend to traverse it

                    // Generate a system token just for /route GET since it's protected
                    const jwt = require('jsonwebtoken');
                    const token = jwt.sign({ id: 'system', role: 'manager' }, process.env.JWT_SECRET);

                    const routeRes = await axios.get(`${API_BASE}/trips/${trip.id}/route`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (routeRes.data && routeRes.data.coordinates && routeRes.data.coordinates.length > 0) {
                        activeTrackers[trip.id] = {
                            route: routeRes.data.coordinates,
                            index: 0
                        };
                    }
                } catch (e) {
                    // console.error('Could not fetch route for simulator', e.message);
                }
            }

            if (activeTrackers[trip.id]) {
                const tracker = activeTrackers[trip.id];
                if (tracker.index < tracker.route.length - 1) {
                    tracker.index += 1; // Move by 1 point every tick
                    const coord = tracker.route[tracker.index];

                    // Telemetry payload
                    await axios.post(`${API_BASE}/telemetry/gps`, {
                        trip_id: trip.id,
                        driver_id: trip.driver_id,
                        lng: coord[0],
                        lat: coord[1],
                        speed_kmh: 45 + Math.random() * 10
                    });
                    console.log(`[Simulator] Pushed GPS for Trip ${trip.id.substring(0, 8)} | [${coord[1]}, ${coord[0]}]`);
                } else {
                    console.log(`[Simulator] Trip ${trip.id} reached destination in simulation.`);
                    // Let the driver hit Arrive manually in the app, or auto hit arrive:
                    // Using internal DB to update status just perfectly
                    await pool.query(`UPDATE trips SET status = 'arrived' WHERE id = $1`, [trip.id]);
                    delete activeTrackers[trip.id];
                }
            }
        }
    } catch (e) {
        console.error('Simulator step error:', e.message);
    }
}

async function simulateInventory() {
    try {
        const factories = await pool.query('SELECT id FROM factories');
        for (let row of factories.rows) {
            const drop = Math.floor(Math.random() * 5); // 0-5% drop every hour

            // Just simulate a telemetry ping with 18% so it triggers alerts
            await axios.post(`${API_BASE}/telemetry/inventory`, {
                factory_id: row.id,
                sensor_id: 'SENS_A1',
                material_type: 'Raw Steel',
                fill_percent: Math.floor(Math.random() * 15) + 5 // Always under 20% to trigger notifications
            });
            console.log(`[Simulator] Fired inventory drop for Factory ${row.id.substring(0, 8)}`);
        }
    } catch (e) { }
}

console.log('--- LogiCore Vehicle Simulator Started ---');
setInterval(stepTrips, 5000); // Progress trucks every 5 seconds
setInterval(simulateInventory, 600000); // 10 minutes inventory
