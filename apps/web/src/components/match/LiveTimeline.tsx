'use client';

import React from 'react';
import { MatchEventDTO } from '@sports-social/types';
import { Activity, ShieldAlert, Award } from 'lucide-react';

interface LiveTimelineProps {
  events: MatchEventDTO[];
}

export const LiveTimeline: React.FC<LiveTimelineProps> = ({ events }) => {
  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <Activity className="w-5 h-5 text-sports-neon" />
        <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
          Live Match Events Feed
        </h3>
      </div>

      <div className="flex flex-col gap-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {events.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Waiting for match commentary events...</p>
        ) : (
          events.map((evt) => (
            <div key={evt.id} className="flex items-start gap-4 relative z-10 pl-1">
              <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0 shadow-md">
                {evt.minute}&apos;
              </div>

              <div className="flex-1 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {evt.type === 'GOAL' ? (
                      <span className="text-lg">⚽</span>
                    ) : evt.type === 'YELLOW_CARD' ? (
                      <span className="w-3 h-4 bg-amber-400 rounded-sm inline-block" />
                    ) : evt.type === 'RED_CARD' ? (
                      <span className="w-3 h-4 bg-sports-red rounded-sm inline-block" />
                    ) : (
                      <Award className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="font-bold text-sm text-slate-100">{evt.player}</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {evt.type}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{evt.description}</p>
                {evt.assistPlayer && (
                  <span className="text-[11px] text-slate-400">Assist: {evt.assistPlayer}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
