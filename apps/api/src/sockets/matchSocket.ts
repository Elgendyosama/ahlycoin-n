import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS, LiveReactionPayload } from '@sports-social/types';

export function setupMatchSocketHandlers(io: Server, socket: Socket) {
  // Join a specific live match room
  socket.on(SOCKET_EVENTS.JOIN_MATCH, (matchId: string) => {
    socket.join(`match:${matchId}`);
    console.log(`Socket ${socket.id} joined room match:${matchId}`);
  });

  // Leave a specific live match room
  socket.on(SOCKET_EVENTS.LEAVE_MATCH, (matchId: string) => {
    socket.leave(`match:${matchId}`);
    console.log(`Socket ${socket.id} left room match:${matchId}`);
  });

  // Real-Time Floating Reaction Burst broadcasting
  socket.on(SOCKET_EVENTS.EMIT_REACTION, (payload: LiveReactionPayload) => {
    // Broadcast reaction to all connected users in the match room
    io.to(`match:${payload.matchId}`).emit(SOCKET_EVENTS.BROADCAST_REACTION, payload);
  });
}
