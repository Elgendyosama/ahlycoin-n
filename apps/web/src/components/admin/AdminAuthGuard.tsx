'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { ShieldAlert, Lock, LogIn, ExternalLink, RefreshCw, Activity } from 'lucide-react';

export const AdminAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 dir-rtl text-center text-slate-100 font-sans" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 shadow-xl">
          <Activity className="w-8 h-8 text-rose-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">منظومة حماية لوحة التحكم</h2>
        <p className="text-sm text-slate-400 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
          جاري التحقق من هوية الحساب وصلاحيات الإدارة (RBAC)...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State (Not logged in)
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 dir-rtl text-slate-100 font-sans" dir="rtl">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="w-20 h-20 rounded-3xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center mx-auto text-rose-400 shadow-inner">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-rose-400 bg-rose-950 px-3 py-1 rounded-full border border-rose-900">
              401 Unauthenticated
            </span>
            <h1 className="text-2xl font-black text-white">تسجيل الدخول مطلوب</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              هذه المنطقة محمية بالكامل. يرجى تسجيل الدخول بحساب مسؤول أو مشرف للوصول للوحة التحكم.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950/60 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              تسجيل الدخول للمنصة
            </Link>

            <Link
              href="/feed"
              className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthorized State (Logged in, but role is USER)
  const isAuthorized = user.role === 'ADMIN' || user.role === 'MODERATOR';

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 dir-rtl text-slate-100 font-sans" dir="rtl">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="w-20 h-20 rounded-3xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 bg-amber-950 px-3 py-1 rounded-full border border-amber-900">
              403 Access Denied
            </span>
            <h1 className="text-2xl font-black text-white">غير مصرح لك بدخول لوحة التحكم</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              عفواً <strong className="text-white">@{user.username}</strong>، حسابك حالياً برتبة (<span className="text-amber-400 font-bold">{user.role || 'USER'}</span>) ولا يمتلك الصلاحيات الإدارية المعتمدة لزيارة هذه الصفحة.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 text-right space-y-1">
            <div className="font-semibold text-slate-300 mb-1">تفاصيل الجلسة:</div>
            <div>• اسم المستخدم: @{user.username}</div>
            <div>• البريد: {user.email}</div>
            <div>• الرتبة الحالية: {user.role || 'USER'}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/feed"
              className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              العودة لمنصة المشجعين
            </Link>

            <Link
              href="/login"
              className="flex-1 py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950/60 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              تسجيل بدخول مسؤول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized State (ADMIN or MODERATOR)
  return <>{children}</>;
};
