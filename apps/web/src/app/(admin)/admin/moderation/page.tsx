'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { ShieldAlert, Trash2, AlertTriangle, RefreshCw, MessageSquare, User } from 'lucide-react';

interface Reporter {
  id: string;
  username: string;
  name: string;
}

interface ReportItem {
  id: string;
  reason: string;
  reporter: Reporter;
  createdAt: string;
}

interface ReportedPost {
  id: string;
  content: string;
  mediaUrls: string[];
  createdAt: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string;
  };
  reports?: ReportItem[];
  _count?: { reports: number; likes: number; comments: number };
}

export default function AdminModerationPage() {
  const [posts, setPosts] = useState<ReportedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<ReportedPost[]>('/admin/reports');
      setPosts(data);
    } catch (err: any) {
      showToast(err.message || 'فشل في تحميل البلاغات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDeletePost = async (postId: string) => {
    if (!confirm('هل أنت تأكد من رغبتك في حذف هذا المنشور المخالف نهائياً؟')) {
      return;
    }

    setDeletingId(postId);
    try {
      await fetchApi(`/admin/posts/${postId}`, { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast('تم حذف المنشور المخالف بنجاح من المنصة', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل في حذف المنشور', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            مركز بلاغات المحتوى والرقابة
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            مراجعة منشورات المستخدمين المُبلغ عنها وإتخاذ إجراء الحذف الفوري بنقرة واحدة (1-Click Delete).
          </p>
        </div>

        <button
          onClick={loadReports}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-colors shrink-0 flex items-center gap-2 text-sm font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث البلاغات
        </button>
      </div>

      {/* Moderation List */}
      {loading ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400">جاري تحميل المنشورات المبلغ عنها...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <ShieldAlert className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
          <h3 className="text-lg font-bold text-white">المنصة نظيفة تماماً!</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            لا توجد أية منشورات مبلّغ عنها حالياً من قِبل الأعضاء.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl space-y-5 transition-all"
            >
              {/* Author & Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 overflow-hidden">
                    {post.author.avatarUrl ? (
                      <img src={post.author.avatarUrl} alt={post.author.username} className="w-full h-full object-cover" />
                    ) : (
                      post.author.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{post.author.name}</h4>
                    <p className="text-xs text-slate-400">@{post.author.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-950 text-amber-400 border border-amber-800/80 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {post.reports?.length || post._count?.reports || 1} بلاغ عن هذا المنشور
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-line">{post.content}</p>

                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {post.mediaUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="محتوى المنشور"
                        className="rounded-xl border border-slate-800 object-cover w-full h-32"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Report Reasons List */}
              {post.reports && post.reports.length > 0 && (
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 space-y-2">
                  <h5 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    أسباب البلاغات المُسجلة:
                  </h5>
                  <div className="space-y-1.5">
                    {post.reports.map((rep) => (
                      <div key={rep.id} className="text-xs text-slate-400 flex items-center justify-between">
                        <span className="text-slate-300 font-medium">"{rep.reason}"</span>
                        <span className="text-[10px] text-slate-500">بواسطة @{rep.reporter.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-500">
                  تاريخ النشر: {new Date(post.createdAt).toLocaleString('ar-EG')}
                </span>

                <button
                  onClick={() => handleDeletePost(post.id)}
                  disabled={deletingId === post.id}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950/50 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingId === post.id ? 'جاري الحذف...' : 'حذف المنشور المخالف فوراً (1-Click Delete)'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
