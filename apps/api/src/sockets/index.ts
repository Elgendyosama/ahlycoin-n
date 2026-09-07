import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { setupMatchSocketHandlers } from './matchSocket';
import { setupChatSocketHandlers } from './chatSocket';

let io: Server;

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

    setupMatchSocketHandlers(io, socket);
    setupChatSocketHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io server not initialized');
  }
  return io;
}
