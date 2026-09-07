'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bell, Flame, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { LanguageToggle } from './LanguageToggle';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <Link href="/feed" className="flex items-center gap-2.5 group shrink-0">
          <img
            src="/logo.png"
            alt="Ahly Coin Logo"
            className="w-9 h-9 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
          />
          <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900">
            AHLY<span className="text-rose-600 font-black ml-1">COIN</span>
          </span>
        </Link>

        {/* Global Search Bar - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-all shadow-xs"
          />
        </div>

        {/* User Actions & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-xs font-semibold text-rose-600">
            <Flame className="w-4 h-4 fill-rose-600 text-rose-600 animate-bounce-subtle" />
            <span>{t('matchHub.liveMatchday')}</span>
          </div>

          <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors relative" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600" />
          </button>

          {/* Language Toggle Component */}
          <LanguageToggle />

          {user ? (
            <div className="flex items-center gap-2.5 ltr:pl-2 rtl:pr-2 ltr:border-l rtl:border-r border-slate-200">
              <Link href={`/profile/${user.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                <span className="hidden sm:inline font-semibold text-sm text-slate-800">{user.name}</span>
              </Link>
              <button
                onClick={logout}
                title={t('nav.logout')}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">{t('common.logIn')}</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">{t('common.signUp')}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
