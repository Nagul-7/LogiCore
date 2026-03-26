/**
 * Socket.io room management for LogiCore.
 * Each trip gets its own room (room name = trip ID).
 * - Manager joins all rooms
 * - Driver joins only their trip's room
 * - Supplier joins rooms for their pickups
 * - Gate joins the room for the trip they just scanned
 */

function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Join a specific trip room
        socket.on('join:trip', (tripId) => {
            socket.join(tripId);
            console.log(`📡 ${socket.id} → room: ${tripId}`);
        });

        // Leave a trip room
        socket.on('leave:trip', (tripId) => {
            socket.leave(tripId);
            console.log(`📡 ${socket.id} left room: ${tripId}`);
        });

        // Manager joins all active trip rooms
        socket.on('join:all', async () => {
            socket.join('manager');
            console.log(`📡 ${socket.id} → manager (all trips)`);
        });

        // Join role-based room
        socket.on('join:role', (role) => {
            socket.join(`role:${role}`);
            console.log(`📡 ${socket.id} → role:${role}`);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Disconnected: ${socket.id}`);
        });
    });
}

/**
 * Emit event to a specific trip room + manager room.
 */
function emitTripEvent(io, tripId, eventName, data) {
    io.to(tripId).to('manager').emit(eventName, { tripId, ...data });
}

/**
 * Emit event to all clients in a role.
 */
function emitRoleEvent(io, role, eventName, data) {
    io.to(`role:${role}`).emit(eventName, data);
}

module.exports = { setupSocketHandlers, emitTripEvent, emitRoleEvent };
