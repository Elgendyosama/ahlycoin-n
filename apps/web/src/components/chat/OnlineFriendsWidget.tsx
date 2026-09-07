'use client';

import React, { useEffect, useState } from 'react';
import { Users, Circle, MessageSquare, RefreshCw } from 'lucide-react';
import { useChatStore, Friend } from '../../stores/useChatStore';
import { fetchApi } from '../../lib/api-client';

export const OnlineFriendsWidget: React.FC = () => {
  const { friends, openChatWithFriend, selectedFriend, isOpen, setFriends } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      try {
        const res = await fetchApi<{ success: boolean; data: Friend[] }>('/users');
        if (res && Array.isArray(res)) {
          setFriends(res);
        } else if (res?.data && Array.isArray(res.data)) {
          setFriends(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch real users, using existing friends list:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, [setFriends]);

  const onlineFriends = friends.filter((f) => f.isOnline);

  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-sports-neon" />
          <h3 className="font-bold text-sm text-slate-100 tracking-wide">أعضاء المنصة والأصدقاء</h3>
        </div>
        <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 flex items-center gap-1">
          <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400 animate-pulse" />
          {onlineFriends.length} متصل
        </span>
      </div>

      {/* Friends List */}
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto scrollbar-thin">
        {isLoading && friends.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-slate-500 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            جاري تحميل الأعضاء...
          </div>
        ) : (
          friends.map((friend: Friend) => {
            const isSelected = isOpen && selectedFriend?.id === friend.id;

            return (
              <div
                key={friend.id}
                onClick={() => openChatWithFriend(friend)}
                className={`group flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-primary/20 border border-primary/40 text-slate-100 shadow-md shadow-primary/10'
                    : 'bg-slate-900/60 border border-slate-800/60 hover:bg-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar with Status Dot */}
                  <div className="relative shrink-0">
                    <img
                      src={friend.avatarUrl}
                      alt={friend.name}
                      className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/80 object-cover"
                    />
                    {friend.isOnline ? (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full ring-2 ring-emerald-500/30" />
                    ) : (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-slate-500 border-2 border-slate-900 rounded-full" />
                    )}
                  </div>

                  {/* Friend Info */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-200 truncate group-hover:text-primary transition-colors">
                        {friend.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">@{friend.username}</span>
                  </div>
                </div>

                {/* Team Badge & Action */}
                <div className="flex items-center gap-2 shrink-0">
                  {friend.favoriteTeam && (
                    <div
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[10px] font-bold text-slate-300"
                      title={friend.favoriteTeam.name}
                    >
                      <img
                        src={friend.favoriteTeam.logoUrl}
                        alt={friend.favoriteTeam.code}
                        className="w-3.5 h-3.5 object-contain"
                      />
                      <span>{friend.favoriteTeam.code}</span>
                    </div>
                  )}
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500 group-hover:text-sports-neon transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
