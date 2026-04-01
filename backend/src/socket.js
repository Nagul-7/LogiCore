const { Server } = require('socket.io');

// Hardcode cors for now, or match server.js cors if corsConfig doesn't exist.
// Based on the user instruction: 
// const corsConfig = require('./config/cors'); 
// But in the user's snippet, it seems to assume there's a corsConfig.
// Let's create a minimal config or just use the user's exact code if there's a config.
// The user explicitly provided:
let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_as_manager', () => {
      socket.join('managers');
      console.log(`${socket.id} joined as manager`);
    });

    socket.on('join_trip', (tripCode) => {
      socket.join(`trip:${tripCode}`);
      console.log(`${socket.id} joined trip room: trip:${tripCode}`);
    });

    socket.on('join_as_gate', (factoryId) => {
      socket.join(`gate:${factoryId}`);
      console.log(`${socket.id} joined gate room: gate:${factoryId}`);
    });

    socket.on('join_as_supplier', (supplierId) => {
      socket.join(`supplier:${supplierId}`);
      console.log(`${socket.id} joined supplier room: supplier:${supplierId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { initSocket, getIO };
