import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS, MatchChatMessage } from '@sports-social/types';
import { db } from '../config/database';

export function setupChatSocketHandlers(io: Server, socket: Socket) {
  socket.on(SOCKET_EVENTS.SEND_CHAT, async (payload: {
    matchId: string;
    userId: string;
    username: string;
    message: string;
    mediaType?: 'image' | 'audio';
    mediaUrl?: string;
    audioDuration?: number;
    badge?: string;
  }) => {
    try {
      const chatMsg: MatchChatMessage = {
        id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        matchId: payload.matchId,
        userId: payload.userId,
        username: payload.username,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${payload.username}`,
        message: payload.message,
        mediaType: payload.mediaType,
        mediaUrl: payload.mediaUrl,
        audioDuration: payload.audioDuration,
        badge: payload.badge || 'مشجع أهلاوي',
        timestamp: Date.now(),
      };

      // Broadcast to room
      io.to(`match:${payload.matchId}`).emit(SOCKET_EVENTS.NEW_CHAT, chatMsg);

      // Persist asynchronously in DB if possible
      db.matchChat.create({
        data: {
          matchId: payload.matchId,
          userId: payload.userId,
          message: payload.message || (payload.mediaType === 'image' ? '[صورة]' : '[تسجيل صوتي]'),
        },
      }).catch(err => console.error('Failed to persist chat message:', err.message));
    } catch (error) {
      console.error('Error handling send_chat event:', error);
    }
  });

  // DM Room Management Handlers
  socket.on('join_dm_room', (data: { roomId: string }) => {
    if (data?.roomId) {
      socket.join(data.roomId);
      console.log(`Socket ${socket.id} joined DM room: ${data.roomId}`);
    }
  });

  socket.on('leave_dm_room', (data: { roomId: string }) => {
    if (data?.roomId) {
      socket.leave(data.roomId);
      console.log(`Socket ${socket.id} left DM room: ${data.roomId}`);
    }
  });

  // Handler for Direct 1-on-1 Messages & Room Broadcasting
  const handleDirectMessage = (payload: {
    roomId?: string;
    senderId: string;
    senderName?: string;
    recipientId: string;
    receiverId?: string;
    content?: string;
    message?: string;
    mediaType?: 'image' | 'audio';
    mediaUrl?: string;
    audioDuration?: number;
    timestamp?: number;
  }) => {
    try {
      const recipientId = payload.recipientId || payload.receiverId || '';
      const textMessage = payload.message || payload.content || '';
      const roomId = payload.roomId || [payload.senderId, recipientId].sort().join('_');

      const dmMsg = {
        id: `dm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        senderId: payload.senderId,
        senderName: payload.senderName || 'Fan',
        recipientId,
        receiverId: recipientId,
        message: textMessage,
        content: textMessage,
        mediaType: payload.mediaType,
        mediaUrl: payload.mediaUrl,
        audioDuration: payload.audioDuration,
        timestamp: payload.timestamp || Date.now(),
      };

      // Broadcast to other participants in room (prevents double posting back to sender)
      if (roomId) {
        socket.to(roomId).emit('new_dm_message', dmMsg);
      } else {
        socket.broadcast.emit('new_dm_message', dmMsg);
      }
    } catch (error) {
      console.error('Error handling direct message event:', error);
    }
  };

  socket.on('send_direct_message', handleDirectMessage);
  socket.on('send_dm_message', handleDirectMessage);
}

