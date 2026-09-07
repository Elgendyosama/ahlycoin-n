'use client';

import React, { useEffect, useRef } from 'react';
import { Flame, MessageSquare, Shield, Users, Radio } from 'lucide-react';
import { useChatStore } from '../../stores/useChatStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { getSocket } from '../../lib/socket-client';
import { SOCKET_EVENTS, MatchChatMessage } from '@sports-social/types';
import { MessageItem } from '../chat/MessageItem';
import { ChatInput } from '../chat/ChatInput';

interface MatchLiveChatProps {
  matchId: string;
  matchTitle?: string;
}

export const MatchLiveChat: React.FC<MatchLiveChatProps> = ({
  matchId,
  matchTitle = 'Al Ahly vs Real Madrid',
}) => {
  const { user } = useAuthStore();
  const { matchMessages, addMatchMessage, setActiveMatchId } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = user?.id || 'guest-' + Math.floor(Math.random() * 1000);
  const currentUsername = user?.name || user?.username || 'مشجع أهلاوي';

  // Join match socket room & set active match ID
  useEffect(() => {
    setActiveMatchId(matchId);
    const socket = getSocket();

    // Join room match_{matchId} / match:{matchId}
    socket.emit(SOCKET_EVENTS.JOIN_MATCH, matchId);

    const handleNewMatchMessage = (msg: MatchChatMessage) => {
      addMatchMessage(msg);
    };

    socket.on(SOCKET_EVENTS.NEW_CHAT, handleNewMatchMessage);

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_MATCH, matchId);
      socket.off(SOCKET_EVENTS.NEW_CHAT, handleNewMatchMessage);
      setActiveMatchId(null);
    };
  }, [matchId, addMatchMessage, setActiveMatchId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [matchMessages]);

  const handleSendMessage = (
    text: string,
    mediaType?: 'image' | 'audio',
    mediaUrl?: string,
    audioDuration?: number
  ) => {
    const socket = getSocket();

    const payload = {
      matchId,
      userId: currentUserId,
      username: currentUsername,
      message: text,
      mediaType,
      mediaUrl,
      audioDuration,
      badge: user?.role === 'ADMIN' ? 'VIP الأهلي' : 'مشجع أهلاوي',
    };

    // Emit live chat message to room
    socket.emit(SOCKET_EVENTS.SEND_CHAT, payload);

    // Local optimistic update if socket doesn't echo back
    addMatchMessage({
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      matchId,
      userId: currentUserId,
      username: currentUsername,
      avatarUrl: user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUsername}`,
      badge: payload.badge,
      message: text,
      mediaType,
      mediaUrl,
      audioDuration,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 flex flex-col h-[520px] shadow-2xl overflow-hidden bg-slate-900/60 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-500 border border-rose-500/30">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wide">
                شات المباراة المباشر
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-ping fill-emerald-400" />
                مباشر
              </span>
            </div>
            <span className="text-[10px] text-slate-400">{matchTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] font-bold text-slate-300">
          <Users className="w-3.5 h-3.5 text-rose-400" />
          <span>غرفة المشجعين</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/80 scrollbar-thin">
        {matchMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-10">
            <MessageSquare className="w-10 h-10 mb-2 stroke-1 opacity-40 text-rose-500 animate-bounce" />
            <p className="font-bold text-slate-400">كن أول مشجع يكتب في شات الملعب!</p>
            <span className="text-[10px] text-slate-500 mt-1">شاركتك للتوقعات، التفاعلات، والصوتيات!</span>
          </div>
        ) : (
          matchMessages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              isMe={msg.userId === currentUserId}
              showAvatar={true}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Component */}
      <ChatInput
        onSendMessage={handleSendMessage}
        placeholder="أكتب تعليقك في شات المباراة المباشر..."
      />
    </div>
  );
};
