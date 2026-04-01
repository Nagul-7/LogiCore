import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
  transports: ['websocket']
});
socket.on('connect', () => {
  console.log('Connected to LogiCore socket:', socket.id);
  socket.emit('join_as_manager');
});
export default socket;
