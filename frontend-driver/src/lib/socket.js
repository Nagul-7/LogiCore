import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
  transports: ['websocket']
});
socket.on('connect', () => {
  console.log('Driver socket connected:', socket.id);
  socket.emit('join_trip', 'TRIP-2026-001');
});
export default socket;
