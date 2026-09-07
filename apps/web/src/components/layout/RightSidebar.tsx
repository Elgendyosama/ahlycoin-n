'use client';

import React from 'react';
import { TrendingUp, ChevronRight, ChevronLeft } from 'lucide-react';
import { OnlineFriendsWidget } from '../chat/OnlineFriendsWidget';
import { useTranslation } from '../../hooks/useTranslation';
import { LiveMatchesWidget } from '../match/LiveMatchesWidget';

export const RightSidebar: React.FC = () => {
  const { t, isArabic } = useTranslation();

  return (
    <aside className="w-80 hidden lg:flex flex-col gap-6 shrink-0 py-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-none pb-12">
      {/* Live Matches Widget from /api/matches */}
      <LiveMatchesWidget />

      {/* Trending Topics */}
      <div className="glass-card rounded-2xl p-4 flex flex-col gap-4 border border-slate-200/80 shadow-sm bg-white">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-rose-600" />
          <h3 className="font-bold text-sm text-slate-900 tracking-wide">{t('matchHub.trendingSportsTags')}</h3>
        </div>

        <div className="flex flex-col gap-2 text-xs">
          {[
            { tag: '#AlAhlyVsZamalek', posts: `42.5K ${t('matchHub.postsCount')}` },
            { tag: '#EgyptianPremierLeague', posts: `18.2K ${t('matchHub.postsCount')}` },
            { tag: '#EmamAshour', posts: `9.8K ${t('matchHub.postsCount')}` },
            { tag: '#CAFChampionsLeague', posts: `5.1K ${t('matchHub.postsCount')}` },
          ].map((item) => (
            <div key={item.tag} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
              <div>
                <p className="font-bold text-slate-800">{item.tag}</p>
                <span className="text-[11px] text-slate-500">{item.posts}</span>
              </div>
              {isArabic ? (
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Online Friends Widget */}
      <OnlineFriendsWidget />
    </aside>
  );
};
