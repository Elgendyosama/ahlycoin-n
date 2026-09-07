'use client';

import React from 'react';
import { MatchDTO } from '@sports-social/types';
import { Badge } from '../ui/Badge';
import { MapPin, Trophy } from 'lucide-react';

interface ScoreboardProps {
  match: MatchDTO;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ match }) => {
  return (
    <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-md relative overflow-hidden bg-gradient-to-br from-white via-rose-50/20 to-slate-50">
      {/* Dynamic Background Glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Match Header metadata */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>{match.league}</span>
        </div>
        <Badge variant={match.status === 'LIVE' ? 'live' : 'scheduled'}>
          {match.status === 'LIVE' ? `${match.minute}' LIVE` : match.status}
        </Badge>
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{match.venue}</span>
        </div>
      </div>

      {/* Teams Score Grid */}
      <div className="grid grid-cols-3 items-center text-center">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-full h-full object-contain" />
          </div>
          <h2 className="font-extrabold text-base lg:text-xl text-slate-900">{match.homeTeam.name}</h2>
        </div>

        {/* Live Score Display */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-4 text-4xl lg:text-6xl font-black tracking-widest text-slate-900">
            <span className="text-rose-600">{match.homeScore}</span>
            <span className="text-slate-300 font-light">:</span>
            <span className="text-slate-800">{match.awayScore}</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wider uppercase border border-slate-200">
            {match.minute}&apos; Ticker
          </span>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-full h-full object-contain" />
          </div>
          <h2 className="font-extrabold text-base lg:text-xl text-slate-900">{match.awayTeam.name}</h2>
        </div>
      </div>
    </div>
  );
};
