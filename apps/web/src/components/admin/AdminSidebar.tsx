'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Trophy, Users, ShieldAlert, ExternalLink, Activity } from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'نظرة عامة', href: '/admin', icon: LayoutDashboard },
    { name: 'إدارة المباريات', href: '/admin/matches', icon: Trophy },
    { name: 'إدارة المستخدمين', href: '/admin/users', icon: Users },
    { name: 'الإشراف والرقابة', href: '/admin/moderation', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col h-screen sticky top-0 text-slate-100 font-sans z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Ahly Coin Logo" className="w-10 h-10 object-contain drop-shadow" />
          <div>
            <h1 className="font-extrabold text-lg leading-none text-white tracking-wide">Ahly Coin</h1>
            <span className="text-xs text-rose-400 font-semibold tracking-wider uppercase">Enterprise Admin</span>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">القائمة الرئيسية</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Return to App */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <Link
          href="/feed"
          className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-sm font-medium border border-slate-700/60"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-slate-400" />
            العودة للمنصة
          </span>
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">Feed</span>
        </Link>
      </div>
    </aside>
  );
};
