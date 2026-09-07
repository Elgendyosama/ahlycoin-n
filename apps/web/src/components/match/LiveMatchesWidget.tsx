'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Trophy } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export interface NormalizedTeam {
  name: string;
  code: string;
  color: string;
  score: string | number;
}

export interface NormalizedMatch {
  id: string | number;
  tournament: string;
  status: 'انتهت' | 'مؤجلة' | 'مباشر' | string;
  homeTeam: NormalizedTeam;
  awayTeam: NormalizedTeam;
  startTimestamp?: number;
}

export const LiveMatchesWidget: React.FC = () => {
  const [matches, setMatches] = useState<NormalizedMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetchApi<NormalizedMatch[]>('/matches');
        if (Array.isArray(res)) {
          setMatches(res);
        }
      } catch (err) {
        console.error('Failed to load matches:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-4 animate-pulse flex flex-col gap-3 border border-slate-200/80 bg-white shadow-sm">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="h-16 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-4 border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-600 fill-rose-600" />
          <h3 className="font-bold text-sm text-slate-900 tracking-wide">مباريات مباشرة</h3>
        </div>
        <Link href="/matches" className="text-xs text-rose-600 font-bold hover:underline">
          عرض الكل
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {matches.slice(0, 4).map((m) => {
          let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
          if (m.status === 'مباشر') {
            badgeColor = 'bg-rose-50 text-rose-600 border-rose-200 font-bold animate-pulse';
          } else if (m.status === 'انتهت') {
            badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          } else if (m.status === 'مؤجلة') {
            badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
          } else if (m.status === 'قادمة') {
            badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
          }

          return (
            <Link key={m.id} href={`/matches/${m.id}`}>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between hover:border-slate-300 hover:bg-slate-100/60 active:scale-95 transition-all duration-150 cursor-pointer min-h-[44px]">
                {/* Top Row: Tournament & Live Badge */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="truncate max-w-[150px] flex items-center gap-1 font-medium">
                    <Trophy className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="truncate">{m.tournament}</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${badgeColor}`}>
                    {m.status}
                  </span>
                </div>

                {/* Main Match Row */}
                <div className="flex items-center justify-between gap-2">
                  {/* Home Team */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: m.homeTeam.color }}
                    >
                      {m.homeTeam.code}
                    </div>
                    <span className="text-xs font-semibold text-slate-900 truncate">{m.homeTeam.name}</span>
                  </div>

                  {/* Score / VS Box */}
                  <div className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-center font-black text-slate-900 text-xs tracking-widest shrink-0 shadow-2xs">
                    {m.homeTeam.score} : {m.awayTeam.score}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-900 truncate ltr:text-left rtl:text-right">{m.awayTeam.name}</span>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-xs"
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
  );
};
