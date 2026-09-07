'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { Users, Search, ShieldCheck, Ban, ShieldAlert, CheckCircle2, RefreshCw, UserCheck, Crown } from 'lucide-react';

interface UserItem {
  id: string;
  username: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  isBanned: boolean;
  isVerified: boolean;
  createdAt: string;
  _count?: { posts: number; comments: number };
}

interface UserResponse {
  users: UserItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const { showToast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<UserResponse>(`/admin/users?page=${page}&limit=15&search=${encodeURIComponent(search)}`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err: any) {
      showToast(err.message || 'فشل في تحميل قائمة المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleToggleBan = async (user: UserItem) => {
    try {
      const res = await fetchApi<{ isBanned: boolean }>(`/admin/users/${user.id}/ban`, { method: 'PATCH' });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isBanned: res.isBanned } : u))
      );
      showToast(
        res.isBanned ? `تم حظر المستخدم @${user.username}` : `تم إلغاء حظر @${user.username}`,
        res.isBanned ? 'error' : 'success'
      );
    } catch (err: any) {
      showToast(err.message || 'فشل تغيير حالة الحظر', 'error');
    }
  };

  const handleToggleVerify = async (user: UserItem) => {
    try {
      const res = await fetchApi<{ isVerified: boolean }>(`/admin/users/${user.id}/verify`, { method: 'PATCH' });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isVerified: res.isVerified } : u))
      );
      showToast(
        res.isVerified ? `تم توثيق حساب @${user.username}` : `تم إلغاء توثيق @${user.username}`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'فشل تغيير التوثيق', 'error');
    }
  };

  const handleToggleRole = async (user: UserItem) => {
    try {
      const res = await fetchApi<{ role: 'USER' | 'ADMIN' }>(`/admin/users/${user.id}/role`, { method: 'PATCH' });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: res.role } : u))
      );
      showToast(`تم تغيير رتبة @${user.username} إلى ${res.role}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل تغيير رتبة الحساب', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-rose-500" />
            إدارة الأعضاء والرقابة
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            البحث عن المستخدمين، الإشراف، منح الشارات الزرقاء، وحظر الحسابات المخالفة.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث بالاسم أو اسم المستخدم..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl shadow transition-colors shrink-0"
          >
            بحث
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">المستخدم</th>
                <th className="px-6 py-4">البريد الإلكتروني</th>
                <th className="px-6 py-4">الرتبة</th>
                <th className="px-6 py-4">التوثيق</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">تاريخ الإنضمام</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 text-rose-500 animate-spin mx-auto mb-2" />
                    جاري تحميل المستخدمين...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    لا يوجد أعضاء مطابقين للبحث.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold overflow-hidden shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {user.name}
                            {user.isVerified && <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />}
                          </div>
                          <div className="text-xs text-slate-400">@{user.username}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-slate-300">{user.email}</td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      {user.role === 'ADMIN' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1 w-fit">
                          <Crown className="w-3.5 h-3.5" />
                          ADMIN
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 w-fit inline-block">
                          عضو USER
                        </span>
                      )}
                    </td>

                    {/* Verification Badge */}
                    <td className="px-6 py-4">
                      {user.isVerified ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-950 text-sky-400 border border-sky-800 w-fit inline-block">
                          موثق
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-500 border border-slate-700 w-fit inline-block">
                          غير موثق
                        </span>
                      )}
                    </td>

                    {/* Ban Status */}
                    <td className="px-6 py-4">
                      {user.isBanned ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800 w-fit inline-block">
                          محظور
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 w-fit inline-block">
                          نشط
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Verify Button */}
                        <button
                          onClick={() => handleToggleVerify(user)}
                          className={`p-2 rounded-xl border transition-colors ${
                            user.isVerified
                              ? 'bg-sky-950/60 border-sky-700 text-sky-400 hover:bg-sky-900'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-sky-400'
                          }`}
                          title={user.isVerified ? 'إلغاء التوثيق' : 'توثيق الحساب بالشارة الزرقاء'}
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>

                        {/* Ban Button */}
                        <button
                          onClick={() => handleToggleBan(user)}
                          className={`p-2 rounded-xl border transition-colors ${
                            user.isBanned
                              ? 'bg-rose-950 border-rose-700 text-rose-400 hover:bg-rose-900'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400'
                          }`}
                          title={user.isBanned ? 'إلغاء الحظر' : 'حظر الحساب'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>

                        {/* Role Toggle Button */}
                        <button
                          onClick={() => handleToggleRole(user)}
                          className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-amber-400 transition-colors"
                          title="تغيير رتبة المستخدم (ADMIN / USER)"
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>إجمالي الأعضاء: {pagination.total}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50"
              >
                السابق
              </button>
              <span>
                صفحة {page} من {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
