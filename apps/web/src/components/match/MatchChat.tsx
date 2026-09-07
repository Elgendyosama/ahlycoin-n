'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useMatchStore } from '../../stores/useMatchStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { Avatar } from '../ui/Avatar';

interface MatchChatProps {
  onSendChat: (userId: string, username: string, message: string) => void;
}

export const MatchChat: React.FC<MatchChatProps> = ({ onSendChat }) => {
  const { chatMessages } = useMatchStore();
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const userId = user?.id || 'guest-' + Math.floor(Math.random() * 1000);
    const username = user?.username || 'GuestFan';
    onSendChat(userId, username, text.trim());
    setText('');
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col h-[480px]">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
          Live Stadium Chat Room
        </h3>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3 pr-1">
        {chatMessages.length === 0 ? (
          <p className="text-xs text-slate-500 text-center my-auto">Be the first fan to post in the match chat!</p>
        ) : (
          chatMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2.5">
              <Avatar src={msg.avatarUrl} name={msg.username} size="sm" />
              <div className="flex flex-col bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs max-w-[85%]">
                <span className="font-bold text-slate-200">{msg.username}</span>
                <p className="text-slate-300 mt-0.5">{msg.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input controls */}
      <form onSubmit={handleSubmit} className="pt-2 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message in stadium chat..."
          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
