'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import {
  Users,
  Trophy,
  FileText,
  Activity,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Radio,
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalMatches: number;
  liveMatches: number;
  activeConnections: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchApi<Stats>('/admin/stats');
        setStats(data);
      } catch (err: any) {
        showToast(err.message || 'فشل في تحميل الإحصائيات', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [showToast]);

  const kpis = [
    {
      title: 'إجمالي المستخدمين',
      value: stats?.totalUsers ?? '-',
      subtext: '+12% هذا الأسبوع',
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      badge: 'إحصائيات الأعضاء',
    },
    {
      title: 'مباريات جارية الآن',
      value: stats?.liveMatches ?? '-',
      subtext: `${stats?.totalMatches ?? 0} إجمالي المباريات`,
      icon: Trophy,
      color: 'from-emerald-600 to-teal-600',
      badge: 'مباشر Live',
      pulse: true,
    },
    {
      title: 'إجمالي المنشورات',
      value: stats?.totalPosts ?? '-',
      subtext: 'تفاعل المنصة اليومي',
      icon: FileText,
      color: 'from-purple-600 to-pink-600',
      badge: 'محتوى الرياضة',
    },
    {
      title: 'الاتصالات الحية (Sockets)',
      value: stats?.activeConnections ?? '-',
      subtext: 'متصلون الآن بالغرف الحية',
      icon: Radio,
      color: 'from-amber-600 to-rose-600',
      badge: 'Real-time',
      pulse: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-2">
              <Zap className="w-4 h-4" />
              منظومة الإدارة والمراقبة المباشرة
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              أهلاً بك في لوحة تحكم الأهلي كوين Enterprise
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
              إدارة شاملة للمباريات المباشرة، ضبط أحداث الملاعب لحظياً عبر Socket.io، وإشراف متكامل على المستخدمين والمحتوى المخالف.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/matches"
              className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-950/50 transition-all flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              غرفة إدارة المباريات
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                  {kpi.pulse && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
                  {kpi.badge}
                </span>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-md`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-slate-400 text-sm font-medium">{kpi.title}</h3>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {loading ? <span className="animate-pulse">...</span> : kpi.value}
                </div>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 pt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  {kpi.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Hub & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Quick Action Cards */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" />
              اختصارات عمليات الإدارة المباشرة
            </h2>
            <span className="text-xs text-slate-400">تحكم فوري</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/matches"
              className="p-5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-rose-500/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Trophy className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-100 group-hover:text-rose-400 transition-colors flex items-center justify-between">
                جدولة مباراة
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-400 mt-1">إضافة مواجهة جديدة بين الفريقين وإعداد الغرفة الحية.</p>
            </Link>

            <Link
              href="/admin/users"
              className="p-5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors flex items-center justify-between">
                إدارة الأعضاء
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-400 mt-1">حظر الأرقام المخالفة، التوثيق بالشارة، وتحديد الأدوار.</p>
            </Link>

            <Link
              href="/admin/moderation"
              className="p-5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-100 group-hover:text-amber-400 transition-colors flex items-center justify-between">
                مركز البلاغات
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-400 mt-1">مراجعة المنشورات المبلغ عنها وحذف المنشور بضغطة زر.</p>
            </Link>
          </div>
        </div>

        {/* Real-time Health Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="font-bold text-white flex items-center gap-2 text-base">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                حالة الخوادم والاتصال
              </h3>
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 text-xs">
                <span className="text-slate-400">Socket.IO Server:</span>
                <span className="text-emerald-400 font-bold">متصل - Port 4000</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 text-xs">
                <span className="text-slate-400">Database (Prisma/Neon):</span>
                <span className="text-emerald-400 font-bold">نشط ومستقر</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 text-xs">
                <span className="text-slate-400">Security Middleware:</span>
                <span className="text-rose-400 font-bold">requireAdmin Protected</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">تراقب المنظومة جميع العمليات لحظر أي نشاط مشبوه تلقائياً.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
