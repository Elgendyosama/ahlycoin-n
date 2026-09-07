'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Users,
  Circle,
  Search,
  ArrowRight,
  ChevronLeft,
  UserCheck,
} from 'lucide-react';
import { useChatStore, DirectMessage, Friend } from '../../stores/useChatStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { getSocket } from '../../lib/socket-client';
import { useTranslation } from '../../hooks/useTranslation';
import { fetchApi } from '../../lib/api-client';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';

export const FloatingChatWindow: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const {
    isOpen,
    isMinimized,
    selectedFriend,
    unreadCount,
    friends,
    directMessages,
    toggleChat,
    closeChat,
    setMinimized,
    setSelectedFriend,
    addDirectMessage,
    setFriends,
  } = useChatStore();

  const [activeDirectoryTab, setActiveDirectoryTab] = useState<'following' | 'all'>('following');
  const [searchQuery, setSearchQuery] = useState('');
  const [directoryUsers, setDirectoryUsers] = useState<Friend[]>([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = user?.id || 'current-user';

  // Scroll to bottom when messages change in active conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [directMessages, selectedFriend, isOpen, isMinimized]);

  // Fetch Directory Users based on active tab
  useEffect(() => {
    async function loadDirectory() {
      setIsLoadingDirectory(true);
      try {
        const endpoint = activeDirectoryTab === 'following' ? '/users/following' : '/users';
        const res = await fetchApi<{ success: boolean; data: Friend[] }>(endpoint);
        if (res && Array.isArray(res)) {
          setDirectoryUsers(res);
          if (activeDirectoryTab === 'all') setFriends(res);
        } else if (res?.data && Array.isArray(res.data)) {
          setDirectoryUsers(res.data);
          if (activeDirectoryTab === 'all') setFriends(res.data);
        } else {
          setDirectoryUsers(friends);
        }
      } catch (err) {
        console.warn('Could not fetch directory users, using fallback store friends:', err);
        setDirectoryUsers(friends);
      } finally {
        setIsLoadingDirectory(false);
      }
    }

    if (isOpen && !selectedFriend) {
      loadDirectory();
    }
  }, [isOpen, selectedFriend, activeDirectoryTab, setFriends, friends]);

  // Socket DM Room Join/Leave management
  useEffect(() => {
    if (!selectedFriend) return;
    const socket = getSocket();
    const roomId = [currentUserId, selectedFriend.id].sort().join('_');

    socket.emit('join_dm_room', { roomId });

    return () => {
      socket.emit('leave_dm_room', { roomId });
    };
  }, [selectedFriend, currentUserId]);

  // Socket listener for direct messages with cleanup and duplicate checking
  useEffect(() => {
    const socket = getSocket();

    const handleNewDirectMessage = (msg: DirectMessage & { content?: string; receiverId?: string }) => {
      const contentText = msg.message || msg.content || '';
      const formattedMsg: DirectMessage = {
        ...msg,
        message: contentText,
        recipientId: msg.recipientId || msg.receiverId || '',
      };

      addDirectMessage(formattedMsg, currentUserId);
    };

    socket.on('new_dm_message', handleNewDirectMessage);

    return () => {
      socket.off('new_dm_message', handleNewDirectMessage);
    };
  }, [addDirectMessage, currentUserId]);

  const handleSendMessage = (
    text: string,
    mediaType?: 'image' | 'audio',
    mediaUrl?: string,
    audioDuration?: number
  ) => {
    if (!selectedFriend) return;

    const socket = getSocket();
    const currentUsername = user?.name || user?.username || 'مشجع';
    const roomId = [currentUserId, selectedFriend.id].sort().join('_');

    const newDm: DirectMessage = {
      id: `dm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      senderId: currentUserId,
      senderName: currentUsername,
      recipientId: selectedFriend.id,
      message: text,
      mediaType,
      mediaUrl,
      audioDuration,
      timestamp: Date.now(),
    };

    const socketPayload = {
      ...newDm,
      roomId,
      receiverId: selectedFriend.id,
      content: text,
    };

    // Emit via Socket.io to DM room
    socket.emit('send_dm_message', socketPayload);

    // Local optimistic update
    addDirectMessage(newDm, currentUserId);
  };

  // Filter directory users by search query & exclude logged in user
  const filteredUsers = (directoryUsers.length > 0 ? directoryUsers : friends).filter((u) => {
    if (u.id === currentUserId || (user?.username && u.username === user.username)) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  const currentFriendMessages = selectedFriend ? directMessages[selectedFriend.id] || [] : [];

  // ==========================================
  // Trigger Button (Collapsed Floating Button)
  // ==========================================
  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white rounded-full shadow-2xl shadow-blue-500/40 border border-blue-400/30 transition-all duration-300 hover:scale-105 group"
        title="فتح الدردشة"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white animate-bounce shadow-md">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="font-extrabold text-sm tracking-wide">
          {t('chat.title', 'دردشة')}
        </span>
      </button>
    );
  }

  // ==========================================
  // Floating Chat Window Container
  // ==========================================
  return (
    <div
      className={`fixed bottom-0 right-4 sm:right-8 z-50 w-full sm:w-96 glass-card border border-slate-700/80 shadow-2xl rounded-t-2xl overflow-hidden flex flex-col transition-all duration-300 backdrop-blur-xl ${
        isMinimized ? 'h-14' : 'h-[520px]'
      }`}
    >
      {/* ---------------------------------------------------- */}
      {/* STEP 1: Directory Header Bar (When no friend is selected) */}
      {/* ---------------------------------------------------- */}
      {!selectedFriend ? (
        <div className="bg-slate-900/95 border-b border-slate-800 p-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setMinimized(!isMinimized)}>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-100">دردشة</span>
                {unreadCount > 0 && isMinimized && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400">اختر صديقاً لبدء المحادثة</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => setMinimized(!isMinimized)}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title={isMinimized ? 'توسيع' : 'تصغير'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={closeChat}
              className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ---------------------------------------------------- */
        /* STEP 2: Conversation Header Bar (Active User Selected) */
        /* ---------------------------------------------------- */
        <div className="bg-slate-900/95 border-b border-slate-800 p-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Back Button ← Returns to Step 1 Directory */}
            <button
              type="button"
              onClick={() => setSelectedFriend(null)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors shrink-0"
              title="العودة لقائمة الدردشة"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Selected User Avatar with Online Dot */}
            <div className="relative shrink-0">
              <img
                src={selectedFriend.avatarUrl}
                alt={selectedFriend.name}
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 object-cover"
              />
              {selectedFriend.isOnline ? (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 ring-1 ring-emerald-400" />
              ) : (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-slate-500 rounded-full border-2 border-slate-900" />
              )}
            </div>

            {/* User Full Name & @username + Status */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-sm text-slate-100 truncate">{selectedFriend.name}</span>
                <span className="text-[10px] text-slate-400 font-normal truncate">@{selectedFriend.username}</span>
              </div>
              <span className="text-[10px]">
                {selectedFriend.isOnline ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" /> متصل الآن
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal flex items-center gap-1">
                    <Circle className="w-1.5 h-1.5 fill-slate-500 text-slate-500" /> غير متصل
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            <button
              onClick={() => setMinimized(!isMinimized)}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title={isMinimized ? 'توسيع' : 'تصغير'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={closeChat}
              className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Expanded Content Area */}
      {!isMinimized && (
        <>
          {/* ==================================================== */}
          {/* STEP 1 BODY: Users Directory View                    */}
          {/* ==================================================== */}
          {!selectedFriend ? (
            <div className="flex-1 flex flex-col bg-slate-950/90 overflow-hidden">
              {/* Search Bar */}
              <div className="p-3 border-b border-slate-800/80 bg-slate-900/40">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن صديق بالاسم أو اسم المستخدم..."
                    className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 top-2 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="flex border-b border-slate-800 bg-slate-900/60 p-1 gap-1 text-xs font-bold">
                <button
                  onClick={() => setActiveDirectoryTab('following')}
                  className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeDirectoryTab === 'following'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>الأصدقاء والمتابعين</span>
                </button>
                <button
                  onClick={() => setActiveDirectoryTab('all')}
                  className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeDirectoryTab === 'all'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>أعضاء المنصة</span>
                </button>
              </div>

              {/* Directory Users List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
                {isLoadingDirectory ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-10">
                    <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    جاري تحميل المستخدمين...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-10">
                    <Users className="w-8 h-8 mb-2 stroke-1 opacity-50 text-primary" />
                    <p>لا يوجد مستخدمون مطابقون للبحث</p>
                  </div>
                ) : (
                  filteredUsers.map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => setSelectedFriend(friend)}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60 hover:bg-slate-800/80 hover:border-slate-700/80 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <img
                            src={friend.avatarUrl}
                            alt={friend.name}
                            className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 object-cover"
                          />
                          {friend.isOnline ? (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full ring-1 ring-emerald-400" />
                          ) : (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-slate-500 border-2 border-slate-900 rounded-full" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs text-slate-200 truncate group-hover:text-primary transition-colors">
                            {friend.name}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">@{friend.username}</span>
                        </div>
                      </div>

                      {/* Start Chat CTA */}
                      <button
                        type="button"
                        className="px-2.5 py-1 bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0"
                      >
                        <span>محادثة</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* ==================================================== */
            /* STEP 2 BODY: Direct Conversation Thread             */
            /* ==================================================== */
            <>
              {/* Messages Stream Area */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-950/80 scrollbar-thin">
                {currentFriendMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
                    <img
                      src={selectedFriend.avatarUrl}
                      alt={selectedFriend.name}
                      className="w-12 h-12 rounded-full mb-2 opacity-70 border border-slate-700"
                    />
                    <p className="font-semibold text-slate-400">ابدأ المحادثة مع {selectedFriend.name}</p>
                    <span className="text-[10px] text-slate-500 mt-1">أرسل رسالة نصية، صورة أو تسجيل صوتي!</span>
                  </div>
                ) : (
                  currentFriendMessages.map((msg) => (
                    <MessageItem
                      key={msg.id}
                      message={msg}
                      isMe={msg.senderId === currentUserId}
                      showAvatar={msg.senderId !== currentUserId}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Component */}
              <ChatInput
                onSendMessage={handleSendMessage}
                placeholder={`أكتب رسالة إلى ${selectedFriend.name}...`}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};
