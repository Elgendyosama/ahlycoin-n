'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { useAuthStore } from '@/stores/useAuthStore';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setAuth, logout } = useAuthStore();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Call auth login endpoint
      const data = await fetchApi<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const { user, token } = data;

      // Validate that user has ADMIN (or MODERATOR) privileges
      if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
        logout();
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setError('عفواً، هذا الحساب لا يمتلك صلاحيات الإدارة.');
        setLoading(false);
        return;
      }

      // Store auth in state & localStorage & cookies for middleware
      setAuth(user, token);
      document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;

      // Redirect directly to admin dashboard
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'فشل في تسجيل الدخول. يرجى التثبت من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans dir-rtl" dir="rtl">
      {/* Background Subtle Gradient Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <img src="/logo.png" alt="Ahly Coin Logo" className="w-20 h-20 object-contain mx-auto drop-shadow-xl" />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">بوابة المشرفين والإدارة - Ahly Coin</h1>
            <p className="text-xs text-rose-400 font-semibold tracking-wider uppercase mt-1">
              Enterprise Admin Authentication
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-3 animate-pulse">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              البريد الإلكتروني أو اسم المستخدم (Admin Email/Username)
            </label>
            <div className="relative">
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="enter email"
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              كلمة السر (Password)
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-950/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            {loading ? 'جاري التحقق والدخول...' : 'تسجيل الدخول إلى لوحة التحكم'}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <a
            href="/feed"
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            العودة لمنصة المشجعين
          </a>
          <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded-full text-slate-400">
            Secure RBAC Portal
          </span>
        </div>
      </div>
    </div>
  );
}
