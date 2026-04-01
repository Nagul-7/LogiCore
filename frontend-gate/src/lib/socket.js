import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', { transports: ['websocket'] });
socket.on('connect', () => {
  socket.emit('join_as_gate', 1);
  console.log('Gate socket connected');
});
export default socket;
