import { useEffect } from 'react';
import { useSocket } from './useSocket';
import { useMatchStore } from '../stores/useMatchStore';
import { SOCKET_EVENTS, LiveReactionPayload, MatchChatMessage } from '@sports-social/types';

export function useMatchLive(matchId: string) {
  const { socket, isConnected } = useSocket();
  const { updateMatchScore, addMatchEvent, addReaction, addChatMessage } = useMatchStore();

  useEffect(() => {
    if (!socket || !matchId) return;

    socket.emit(SOCKET_EVENTS.JOIN_MATCH, matchId);

    const handleMatchUpdate = (data: { minute: number; homeScore: number; awayScore: number }) => {
      updateMatchScore(data.minute, data.homeScore, data.awayScore);
    };

    const handleMatchEvent = (event: any) => {
      addMatchEvent(event);
    };

    const handleBroadcastReaction = (reaction: LiveReactionPayload) => {
      addReaction(reaction);
    };

    const handleNewChat = (chat: MatchChatMessage) => {
      addChatMessage(chat);
    };

    socket.on(SOCKET_EVENTS.MATCH_UPDATE, handleMatchUpdate);
    socket.on(SOCKET_EVENTS.MATCH_EVENT, handleMatchEvent);
    socket.on(SOCKET_EVENTS.BROADCAST_REACTION, handleBroadcastReaction);
    socket.on(SOCKET_EVENTS.NEW_CHAT, handleNewChat);

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_MATCH, matchId);
      socket.off(SOCKET_EVENTS.MATCH_UPDATE, handleMatchUpdate);
      socket.off(SOCKET_EVENTS.MATCH_EVENT, handleMatchEvent);
      socket.off(SOCKET_EVENTS.BROADCAST_REACTION, handleBroadcastReaction);
      socket.off(SOCKET_EVENTS.NEW_CHAT, handleNewChat);
    };
  }, [socket, matchId, updateMatchScore, addMatchEvent, addReaction, addChatMessage]);

  const emitReaction = (emoji: any, userId: string, username: string) => {
    if (socket) {
      socket.emit(SOCKET_EVENTS.EMIT_REACTION, {
        matchId,
        emoji,
        userId,
        username,
        timestamp: Date.now(),
      });
    }
  };

  const sendChatMessage = (userId: string, username: string, message: string) => {
    if (socket && message.trim()) {
      socket.emit(SOCKET_EVENTS.SEND_CHAT, {
        matchId,
        userId,
        username,
        message,
      });
    }
  };

  return { isConnected, emitReaction, sendChatMessage };
}
