'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';
import { NormalizedMatch } from './LiveMatchesWidget';

export const MatchesHub: React.FC = () => {
  const [matches, setMatches] = useState<NormalizedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'مباشر' | 'انتهت' | 'مؤجلة' | 'قادمة'>('ALL');

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetchApi<NormalizedMatch[]>('/matches');
        if (Array.isArray(res)) {
          setMatches(res);
        }
      } catch (err) {
        console.error('Failed to load matches for hub:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  const filteredMatches = matches.filter((m) => {
    if (activeFilter === 'ALL') return true;
    return m.status === activeFilter;
  });

  // Group by Tournament / League
  const groupedByTournament = filteredMatches.reduce((acc, match) => {
    const key = match.tournament || 'بطولات متنوعة';
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {} as Record<string, NormalizedMatch[]>);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="h-40 bg-slate-100 rounded-2xl" />
        <div className="h-40 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200/80 bg-gradient-to-r from-rose-500/10 via-white to-slate-50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-rose-600 font-extrabold text-xs uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>مباريات الأهلي المباشرة والجدول الكامل</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            مركز المباريات المباشرة
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            متابعة نتائج المباريات والأهداف المباشرة للنادي الأهلي عبر SportAPI7
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 p-1.5 rounded-xl self-start md:self-auto flex-wrap">
          {[
            { key: 'ALL', label: 'الكل' },
            { key: 'مباشر', label: 'مباشر الآن' },
            { key: 'انتهت', label: 'انتهت' },
            { key: 'مؤجلة', label: 'مؤجلة' },
            { key: 'قادمة', label: 'المقبلة' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                activeFilter === tab.key
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Tournament List */}
      <div className="flex flex-col gap-6">
        {Object.keys(groupedByTournament).length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-slate-200/80 bg-white text-slate-500 shadow-sm">
            لا توجد مباريات مطابقة للفلاتر المحددة.
          </div>
        ) : (
          Object.entries(groupedByTournament).map(([tournamentName, tournamentMatches]) => (
            <div key={tournamentName} className="flex flex-col gap-4">
              {/* Tournament Section Header */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="font-extrabold text-base text-slate-900 tracking-wide">{tournamentName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                  {tournamentMatches.length}
                </span>
              </div>

              {/* Match Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournamentMatches.map((m) => {
                  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (m.status === 'مباشر') {
                    badgeStyle = 'bg-rose-50 text-rose-600 border-rose-200 font-bold animate-pulse';
                  } else if (m.status === 'انتهت') {
                    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  } else if (m.status === 'مؤجلة') {
                    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
                  } else if (m.status === 'قادمة') {
                    badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
                  }

                  return (
                    <Link key={m.id} href={`/matches/${m.id}`}>
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 shadow-xs active:scale-95 transition-all duration-150 cursor-pointer min-h-[44px]">
                        {/* Top Row: Tournament/Stadium & Live Badge */}
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                          <span className="truncate max-w-[160px] font-medium">{m.tournament}</span>
                          <span className={`px-2.5 py-0.5 rounded-full font-medium border ${badgeStyle}`}>
                            {m.status}
                          </span>
                        </div>

                        {/* Main Match Row */}
                        <div className="flex items-center justify-between gap-2">
                          {/* Home Team */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
                              style={{ backgroundColor: m.homeTeam.color }}
                            >
                              {m.homeTeam.code}
                            </div>
                            <span className="text-sm font-semibold text-slate-900 truncate max-w-[100px] sm:max-w-[140px]">{m.homeTeam.name}</span>
                          </div>

                          {/* Score / VS Box */}
                          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-center font-black text-slate-900 tracking-widest shrink-0 shadow-2xs">
                            {m.homeTeam.score} : {m.awayTeam.score}
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                            <span className="text-sm font-semibold text-slate-900 truncate max-w-[100px] sm:max-w-[140px] ltr:text-left rtl:text-right">{m.awayTeam.name}</span>
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
                              style={{ backgroundColor: m.awayTeam.color }}
                            >
                              {m.awayTeam.code}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
