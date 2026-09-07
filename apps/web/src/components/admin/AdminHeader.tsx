'use client';

import React from 'react';
import { ShieldCheck, Bell, User } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs px-3 py-1.5 rounded-full font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          نظام الإدارة نشط
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        <div className="h-6 w-[1px] bg-slate-800"></div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
            <User className="w-5 h-5 text-rose-400" />
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              مدير النظام
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xs text-slate-400">admin@sportssocial.com</div>
          </div>
        </div>
      </div>
    </header>
  );
};
