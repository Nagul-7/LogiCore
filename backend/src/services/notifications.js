const { getIo } = require('../socket');

const notifications = {
    notifyManager: (event, data) => {
        try { getIo().to('managers').emit(event, data); } catch (e) { }
    },
    notifyDriver: (driver_id, event, data) => {
        try { getIo().to(`driver:${driver_id}`).emit(event, data); } catch (e) { }
    },
    notifySupplier: (supplier_id, event, data) => {
        try { getIo().to(`supplier:${supplier_id}`).emit(event, data); } catch (e) { }
    },
    notifyGate: (factory_id, event, data) => {
        try { getIo().to(`gate:${factory_id}`).emit(event, data); } catch (e) { }
    },
    notifyTrip: (trip_id, event, data) => {
        try { getIo().to(`trip:${trip_id}`).emit(event, data); } catch (e) { }
    }
};

module.exports = notifications;
