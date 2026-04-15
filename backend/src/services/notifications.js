const { getIO } = require('../socket');

const notifications = {
    notifyManager: (event, data) => {
        try { getIO().to('managers').emit(event, data); } catch (e) { console.error('[notifications] manager emit failed:', e.message); }
    },
    notifyDriver: (driver_id, event, data) => {
        try { getIO().to(`driver:${driver_id}`).emit(event, data); } catch (e) { console.error('[notifications] driver emit failed:', e.message); }
    },
    notifySupplier: (supplier_id, event, data) => {
        try { getIO().to(`supplier:${supplier_id}`).emit(event, data); } catch (e) { console.error('[notifications] supplier emit failed:', e.message); }
    },
    notifyGate: (factory_id, event, data) => {
        try { getIO().to(`gate:${factory_id}`).emit(event, data); } catch (e) { console.error('[notifications] gate emit failed:', e.message); }
    },
    notifyTrip: (trip_code, event, data) => {
        try { getIO().to(`trip:${trip_code}`).emit(event, data); } catch (e) { console.error('[notifications] trip emit failed:', e.message); }
    }
};

module.exports = notifications;
