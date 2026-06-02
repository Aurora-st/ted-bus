import { Server } from 'socket.io';
import { setIO } from './io.js';
import { env } from '../config/env.js';

export function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.frontendUrl,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Client should emit: { userId } after auth to join personal room
    socket.on('auth:join', ({ userId }) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
    });
  });

  setIO(io);
  return io;
}

