'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { Trophy, Plus, Calendar, MapPin, Radio, Activity, X, RefreshCw, ChevronLeft } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  shortName: string;
  code: string;
  logoUrl: string;
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  status: 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINISHED' | 'CANCELLED';
  minute: number;
  startTime: string;
  venue: string;
  league: string;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    homeTeamId: '',
    awayTeamId: '',
    startTime: '',
    venue: 'ستاد القاهرة الدولي',
    league: 'الدوري المصري الممتاز',
  });

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchesRes, teamsRes] = await Promise.all([
        fetchApi<Match[]>('/admin/matches'),
        fetchApi<Team[]>('/admin/teams'),
      ]);
      setMatches(matchesRes);
      setTeams(teamsRes);
      if (teamsRes.length >= 2) {
        setFormData((prev) => ({
          ...prev,
          homeTeamId: teamsRes[0].id,
          awayTeamId: teamsRes[1].id,
        }));
      }
    } catch (err: any) {
      showToast(err.message || 'فشل في تحميل بيانات المباريات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.homeTeamId === formData.awayTeamId) {
      showToast('لا يمكن اختيار نفس الفريق للمواجهة', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await fetchApi('/admin/matches', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      showToast('تم إضافة المباراة بنجاح وإعداد الغرفة الحية', 'success');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء إضافة المباراة', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (filter === 'LIVE') return m.status === 'LIVE' || m.status === 'HALFTIME';
    if (filter === 'SCHEDULED') return m.status === 'SCHEDULED';
    if (filter === 'FINISHED') return m.status === 'FINISHED';
    return true;
  });

  const getStatusBadge = (status: Match['status']) => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800/80 flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            مباشر LIVE
          </span>
        );
      case 'HALFTIME':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">
            استراحة الشوطين
          </span>
        );
      case 'FINISHED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
            منتهية
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-950 text-sky-400 border border-sky-800">
            مجدولة
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-rose-500" />
            إدارة المباريات والغرفة المباشرة
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            جدولة المباريات الجديدة والانتقال الفوري لوحدة التحكم المباشر (Live Control Room).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-colors"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-950/50 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة مباراة جديدة
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { key: 'ALL', label: 'جميع المباريات' },
          { key: 'LIVE', label: 'مباشر الآن' },
          { key: 'SCHEDULED', label: 'المجدولة' },
          { key: 'FINISHED', label: 'المنتهية' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === tab.key
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">جاري تحميل المباريات...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">لا يوجد مباريات ضمن هذه الفئة حالياً</p>
          <p className="text-slate-500 text-xs mt-1">قم بإضافة مباراة جديدة للبدء في الإدارة الحية.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl space-y-5 transition-all relative overflow-hidden group"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs font-semibold text-rose-400 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-900/50">
                  {match.league}
                </span>
                {getStatusBadge(match.status)}
              </div>

              {/* Match Teams Score Box */}
              <div className="flex items-center justify-between py-2 px-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                {/* Home Team */}
                <div className="flex flex-col items-center text-center gap-1.5 w-1/3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center p-2">
                    <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-8 h-8 object-contain" />
                  </div>
                  <span className="font-bold text-sm text-slate-100 line-clamp-1">{match.homeTeam.name}</span>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center justify-center w-1/3">
                  <div className="text-2xl font-black text-white tracking-widest bg-slate-900 px-4 py-1.5 rounded-xl border border-slate-700">
                    {match.homeScore} - {match.awayScore}
                  </div>
                  {match.status === 'LIVE' && (
                    <span className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                      <Activity className="w-3 h-3 animate-pulse" />
                      الدقيقة {match.minute}'
                    </span>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center text-center gap-1.5 w-1/3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center p-2">
                    <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-8 h-8 object-contain" />
                  </div>
                  <span className="font-bold text-sm text-slate-100 line-clamp-1">{match.awayTeam.name}</span>
                </div>
              </div>

              {/* Match Details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(match.startTime).toLocaleString('ar-EG')}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="line-clamp-1">{match.venue}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-800">
                <Link
                  href={`/admin/matches/${match.id}/live-control`}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
                >
                  <Radio className="w-4 h-4 text-rose-400 group-hover:text-white" />
                  دخول غرفة التحكم المباشر (Live Control)
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Match Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 dir-rtl text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-rose-500" />
                جدولة مباراة جديدة
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="space-y-4">
              {/* Home Team Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">الفريق المستضيف (Home Team)</label>
                <select
                  value={formData.homeTeamId}
                  onChange={(e) => setFormData({ ...formData, homeTeamId: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                  required
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Away Team Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">الفريق الضيف (Away Team)</label>
                <select
                  value={formData.awayTeamId}
                  onChange={(e) => setFormData({ ...formData, awayTeamId: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                  required
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">تاريخ ووقت المباراة</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Venue */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">الملعب</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                  placeholder="اسم الملعب"
                  required
                />
              </div>

              {/* League */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">البطولة / الدوري</label>
                <input
                  type="text"
                  value={formData.league}
                  onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                  placeholder="اسم البطولة"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-950/50 disabled:opacity-50"
                >
                  {submitting ? 'جاري الإضافة...' : 'حفظ ونشر المباراة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
