'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Tv2, MessageCircle, User } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useChatStore } from '../../stores/useChatStore';
import { useTranslation } from '../../hooks/useTranslation';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { toggleChat, unreadCount } = useChatStore();
  const { t } = useTranslation();

  const profileHref = user ? `/profile/${user.username}` : '/login';

  const navTabs = [
    {
      id: 'feed',
      label: t('nav.feedTimeline', 'الرئيسية'),
      href: '/feed',
      icon: Home,
      isActive: pathname === '/feed' || pathname === '/',
    },
    {
      id: 'matches',
      label: t('matchHub.liveMatchday', 'المباريات'),
      href: '/matches',
      icon: Tv2,
      isActive: pathname.startsWith('/matches'),
      badge: 'LIVE',
    },
    {
      id: 'chat',
      label: t('nav.messages', 'الرسائل'),
      href: '#',
      icon: MessageCircle,
      isActive: false,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        toggleChat();
      },
      hasUnread: unreadCount > 0,
      unreadCount,
    },
    {
      id: 'profile',
      label: t('nav.myProfile', 'حسابي'),
      href: profileHref,
      icon: User,
      isActive: pathname.startsWith('/profile'),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const content = (
            <div
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-2 rounded-2xl transition-all duration-200 active:scale-95 relative ${
                tab.isActive
                  ? 'bg-rose-50 text-rose-600 font-bold border border-rose-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${tab.isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {tab.hasUnread && (
                  <span className="absolute -top-1 -right-1.5 min-w-[8px] h-2 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {tab.unreadCount && tab.unreadCount > 0 ? (tab.unreadCount > 9 ? '9+' : tab.unreadCount) : ''}
                  </span>
                )}
                {tab.badge === 'LIVE' && !tab.isActive && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-rose-600 text-white text-[8px] font-black rounded-full uppercase animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight leading-none truncate max-w-[68px]">
                {tab.label}
              </span>
            </div>
          );

          if (tab.onClick) {
            return (
              <button key={tab.id} onClick={tab.onClick} className="focus:outline-none">
                {content}
              </button>
            );
          }

          return (
            <Link key={tab.id} href={tab.href} className="focus:outline-none">
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
