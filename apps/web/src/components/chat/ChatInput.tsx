'use client';

import React, { useState, useRef } from 'react';
import { Send, Paperclip, Mic, Trash2, Smile, X, Image as ImageIcon } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { fetchApi } from '../../lib/api-client';

interface ChatInputProps {
  onSendMessage: (
    text: string,
    mediaType?: 'image' | 'audio',
    mediaUrl?: string,
    audioDuration?: number
  ) => void;
  placeholder?: string;
  disabled?: boolean;
}

const COMMON_EMOJIS = ['⚽', '🔥', '🦅', '❤️', '👏', '🏆', '😍', '💪', '👑', '🎉', '😡', '🤯'];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  placeholder = 'أكتب رسالة...',
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
  } = useAudioRecorder();

  // Format seconds to mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  const clearSelectedImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Helper to convert blob/file to Base64
  const fileToBase64 = (fileOrBlob: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBlob);
    });
  };

  // Upload handler calling POST /api/upload or POST /api/upload/voice with FormData
  const uploadFile = async (fileOrBlob: File | Blob, fileType: 'image' | 'audio'): Promise<string> => {
    try {
      const endpoint = fileType === 'audio' ? '/api/upload/voice' : '/api/upload';
      const formData = new FormData();
      const fileName = fileOrBlob instanceof File ? fileOrBlob.name : `voice-note-${Date.now()}.${fileType === 'audio' ? 'webm' : 'jpg'}`;
      formData.append('file', fileOrBlob, fileName);

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.url) return data.url;
      }

      // Base64 fallback if FormData endpoint is unavailable
      const base64Data = await fileToBase64(fileOrBlob);
      const resJson = await fetchApi<{ success: boolean; url: string }>('/upload', {
        method: 'POST',
        body: JSON.stringify({
          fileData: base64Data,
          fileType,
          fileName,
        }),
      });

      if (resJson?.url) {
        return resJson.url;
      }
      return base64Data;
    } catch (err) {
      console.warn('Upload error, using base64 fallback:', err);
      return await fileToBase64(fileOrBlob);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isUploading) return;

    // Handle voice note sending
    if (isRecording) {
      setIsUploading(true);
      const currentRecordingTime = recordingTime || 1;
      try {
        const recordedBlob = await stopRecording();
        const targetBlob = recordedBlob || audioBlob;

        if (targetBlob) {
          const uploadedAudioUrl = await uploadFile(targetBlob, 'audio');
          onSendMessage('', 'audio', uploadedAudioUrl, currentRecordingTime);
        }
      } catch (err) {
        console.error('Failed to upload audio note:', err);
      } finally {
        resetRecording();
        setIsUploading(false);
      }
      return;
    }

    // Handle image + text sending
    if (!text.trim() && !selectedImage) return;

    let mediaUrl: string | undefined;
    let mediaType: 'image' | undefined;

    if (selectedImage) {
      setIsUploading(true);
      try {
        mediaUrl = await uploadFile(selectedImage, 'image');
        mediaType = 'image';
      } catch (err) {
        console.error('Failed to upload image:', err);
      } finally {
        setIsUploading(false);
      }
    }

    onSendMessage(text.trim(), mediaType, mediaUrl);
    setText('');
    clearSelectedImage();
  };

  return (
    <div className="relative flex flex-col bg-slate-900 border-t border-slate-800/80 p-2.5 gap-2">
      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-full right-2 mb-2 p-2 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-30 flex items-center gap-1.5 flex-wrap max-w-[260px] animate-in fade-in slide-in-from-bottom-2">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className="w-8 h-8 flex items-center justify-center text-base hover:bg-slate-800 rounded-xl transition-transform active:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Selected Image Thumbnail Preview */}
      {imagePreviewUrl && !isRecording && (
        <div className="relative inline-block w-20 h-20 rounded-xl border border-slate-700 bg-slate-950 overflow-hidden group">
          <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={clearSelectedImage}
            className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Recording Mode UI */}
      {isRecording ? (
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-rose-950/40 border border-rose-500/30 rounded-xl animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-bold text-rose-300">تسجيل {formatTimer(recordingTime)}</span>
          </div>

          {/* Waveform graphic animation */}
          <div className="flex items-center gap-1 h-4">
            <span className="w-1 h-3 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1 h-2 bg-rose-400 rounded-full animate-bounce" />
            <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.2s]" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
              title="إلغاء التسجيل"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-md shadow-rose-900/40"
              title="إرسال التسجيل"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Regular Input Form */
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* File input (Hidden) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Action buttons */}
          <div className="flex items-center gap-1 text-slate-400">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="إرفاق صورة"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-xl hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="إيموجي"
            >
              <Smile className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={startRecording}
              className="p-2 rounded-xl hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
              title="تسجيل صوتي"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800/80 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!text.trim() && !selectedImage) || disabled || isUploading}
            className="p-2.5 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-blue-900/30 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
