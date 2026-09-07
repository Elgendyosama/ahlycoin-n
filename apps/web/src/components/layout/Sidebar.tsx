'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Tv2, Users, Bookmark, Settings, Activity, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useChatStore } from '../../stores/useChatStore';
import { useTranslation } from '../../hooks/useTranslation';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { toggleChat, unreadCount } = useChatStore();
  const { t } = useTranslation();

  const navItems = [
    { label: t('nav.feedTimeline', 'Feed Timeline'), href: '/feed', icon: Home },
    { label: t('nav.liveMatchCenter', 'Live Match Center'), href: '/matches/match-1', icon: Tv2, badge: 'LIVE' },
    {
      label: t('nav.messages', 'Messages'),
      href: '#',
      icon: MessageCircle,
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        toggleChat();
      },
    },
    { label: t('nav.myProfile', 'My Profile'), href: user ? `/profile/${user.username}` : '/login', icon: Users },
    { label: t('nav.savedHighlights', 'Saved Highlights'), href: '#', icon: Bookmark },
    { label: t('nav.platformStats', 'Platform Stats'), href: '#', icon: Activity },
    { label: t('nav.settings', 'Settings'), href: '#', icon: Settings },
  ];

  return (
    <aside className="w-64 hidden lg:flex flex-col gap-6 shrink-0 py-6 sticky top-16 h-[calc(100vh-4rem)]">
      <div className="glass-card rounded-2xl p-3 flex flex-col gap-1.5 shadow-sm border border-slate-200/80 bg-white">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href !== '#' && pathname === item.href;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              onClick={item.onClick}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                    item.badge === 'LIVE'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Featured Supported Team Card */}
      {user?.favoriteTeam && (
        <div className="glass-card rounded-2xl p-4 border border-rose-200 bg-rose-50/60 flex flex-col gap-3">
          <span className="text-xs uppercase font-extrabold tracking-wider text-rose-700">My Supported Club</span>
          <div className="flex items-center gap-3">
            <img src={user.favoriteTeam.logoUrl} alt={user.favoriteTeam.name} className="w-10 h-10 object-contain rounded-lg shadow-xs" />
            <div>
              <h4 className="font-bold text-sm text-slate-900">{user.favoriteTeam.name}</h4>
              <span className="text-xs text-slate-500">{user.favoriteTeam.code} | Fan Club Member</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
