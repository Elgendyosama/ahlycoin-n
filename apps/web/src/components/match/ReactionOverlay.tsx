'use client';

import React from 'react';
import { ReactionEmoji } from '@sports-social/types';
import { useMatchStore } from '../../stores/useMatchStore';
import { useAuthStore } from '../../stores/useAuthStore';

interface ReactionOverlayProps {
  onEmitReaction: (emoji: ReactionEmoji, userId: string, username: string) => void;
}

export const ReactionOverlay: React.FC<ReactionOverlayProps> = ({ onEmitReaction }) => {
  const { reactions } = useMatchStore();
  const { user } = useAuthStore();

  const emojiList = [
    ReactionEmoji.FIRE,
    ReactionEmoji.GOAL,
    ReactionEmoji.CLAP,
    ReactionEmoji.HEART,
    ReactionEmoji.MIND_BLOWN,
    ReactionEmoji.ANGRY,
  ];

  const handleTap = (emoji: ReactionEmoji) => {
    const userId = user?.id || 'guest-' + Math.floor(Math.random() * 1000);
    const username = user?.username || 'GuestFan';
    onEmitReaction(emoji, userId, username);
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Floating Animated Reaction Particles Stream */}
      <div className="absolute inset-0 pointer-events-none z-30 h-64 overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.x}%` }}
            className="absolute bottom-0 text-3xl animate-float-up opacity-90 drop-shadow-lg flex flex-col items-center gap-1"
          >
            <span>{r.emoji}</span>
            <span className="text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-300 font-bold">
              {r.username}
            </span>
          </div>
        ))}
      </div>

      {/* Floating Reaction Bar Controller */}
      <div className="glass-card rounded-full px-6 py-3 border border-slate-700/60 shadow-xl flex items-center justify-center gap-4 lg:gap-8 mx-auto w-fit">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
          Live Reaction Stream:
        </span>
        <div className="flex items-center gap-3">
          {emojiList.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleTap(emoji)}
              className="text-2xl lg:text-3xl hover:scale-125 active:scale-95 transition-all duration-150 p-2 rounded-2xl hover:bg-slate-800/80"
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
