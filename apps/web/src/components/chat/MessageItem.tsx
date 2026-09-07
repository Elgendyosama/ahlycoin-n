'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize2, X, ShieldCheck, Sparkles } from 'lucide-react';

export interface MessageItemData {
  id: string;
  senderId?: string;
  userId?: string;
  senderName?: string;
  username?: string;
  avatarUrl?: string;
  message?: string;
  mediaType?: 'image' | 'audio';
  mediaUrl?: string;
  audioDuration?: number;
  badge?: string;
  timestamp: number;
}

interface MessageItemProps {
  message: MessageItemData;
  isMe: boolean;
  showAvatar?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isMe, showAvatar = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(message.audioDuration || 0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const displayName = message.senderName || message.username || 'مشجع';
  const displayAvatar = message.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${displayName}`;

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.error('Playback error:', err);
        setIsPlaying(false);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = Math.floor(secs % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const formattedTimestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex items-start gap-2.5 w-full ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {showAvatar && (
        <img
          src={displayAvatar}
          alt={displayName}
          className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700/80 object-cover shrink-0 mt-0.5"
        />
      )}

      <div className={`flex flex-col max-w-[82%] ${isMe ? 'items-end' : 'items-start'}`}>
        {/* Header Name & Badge */}
        <div className="flex items-center gap-1.5 mb-1 px-1">
          <span className="text-[11px] font-bold text-slate-300">{displayName}</span>
          {message.badge && (
            <span className="px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-rose-400" />
              {message.badge}
            </span>
          )}
        </div>

        {/* Message Content Bubble */}
        <div
          className={`relative p-3 rounded-2xl text-xs leading-relaxed transition-all shadow-md ${
            isMe
              ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-tr-none shadow-blue-900/20'
              : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
          }`}
        >
          {/* 1. Image Media */}
          {message.mediaType === 'image' && message.mediaUrl && (
            <div className="relative group mb-1.5 overflow-hidden rounded-xl bg-slate-950 border border-slate-800/80">
              {!imageLoaded && (
                <div className="w-48 h-36 bg-slate-800/60 animate-pulse flex items-center justify-center text-slate-500 text-[10px]">
                  جاري تحميل الصورة...
                </div>
              )}
              <img
                src={message.mediaUrl}
                alt="Attachment"
                onLoad={() => setImageLoaded(true)}
                className={`max-w-xs max-h-60 object-cover rounded-xl transition-all duration-300 cursor-pointer ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute inset-0'
                } group-hover:brightness-90`}
                onClick={() => setShowLightbox(true)}
              />
              <button
                onClick={() => setShowLightbox(true)}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="تكبير الصورة"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 2. Audio Voice Note Media */}
          {message.mediaType === 'audio' && message.mediaUrl && (
            <div className="py-1">
              <audio
                controls
                src={message.mediaUrl}
                preload="metadata"
                className="w-60 h-10 rounded-lg accent-primary"
              />
            </div>
          )}

          {/* 3. Text Message Content */}
          {message.message && <p className="whitespace-pre-wrap break-words">{message.message}</p>}
        </div>

        {/* Timestamp */}
        <span className="text-[9px] text-slate-500 mt-1 px-1 font-medium">{formattedTimestamp}</span>
      </div>

      {/* Image Lightbox Modal */}
      {showLightbox && message.mediaUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute -top-10 right-0 p-2 text-slate-300 hover:text-white bg-slate-800/80 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={message.mediaUrl}
              alt="Zoomed Attachment"
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain border border-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  );
};
