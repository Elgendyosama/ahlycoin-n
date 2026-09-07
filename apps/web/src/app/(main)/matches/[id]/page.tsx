'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '../../../../components/layout/Sidebar';
import { RightSidebar } from '../../../../components/layout/RightSidebar';
import { Scoreboard } from '../../../../components/match/Scoreboard';
import { LiveTimeline } from '../../../../components/match/LiveTimeline';
import { ReactionOverlay } from '../../../../components/match/ReactionOverlay';
import { MatchLiveChat } from '../../../../components/match/MatchLiveChat';
import { useMatchStore } from '../../../../stores/useMatchStore';
import { useMatchLive } from '../../../../hooks/useMatchLive';
import { fetchApi } from '../../../../lib/api-client';
import { MatchDTO } from '@sports-social/types';

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = (params?.id as string) || 'match-1';
  const { currentMatch, setMatch, events } = useMatchStore();
  const { isConnected, emitReaction } = useMatchLive(matchId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMatch() {
      try {
        const data = await fetchApi<MatchDTO>(`/matches/${matchId}`);
        setMatch(data);
      } catch (error) {
        // Fallback default match state for robust demo
        setMatch({
          id: matchId,
          homeTeam: {
            id: 't1',
            name: 'Al Ahly SC',
            shortName: 'Al Ahly',
            code: 'AHL',
            logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop',
            primaryColor: '#e11d48',
            secondaryColor: '#ffffff',
          },
          awayTeam: {
            id: 't2',
            name: 'Real Madrid CF',
            shortName: 'Real Madrid',
            code: 'RMA',
            logoUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=120&auto=format&fit=crop',
            primaryColor: '#1e3a8a',
            secondaryColor: '#f59e0b',
          },
          homeScore: 2,
          awayScore: 1,
          status: 'LIVE' as any,
          minute: 78,
          startTime: new Date().toISOString(),
          venue: 'Cairo International Stadium',
          league: 'Club World Super Cup',
          events: [],
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadMatch();
  }, [matchId, setMatch]);

  return (
    <div className="flex gap-8 items-start py-6">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col gap-6">
        {isLoading || !currentMatch ? (
          <div className="glass-card rounded-3xl p-12 h-64 animate-pulse bg-slate-800/40" />
        ) : (
          <>
            {/* Live Scoreboard */}
            <Scoreboard match={currentMatch} />

            {/* Floating Live Reaction Stream */}
            <ReactionOverlay onEmitReaction={emitReaction} />

            {/* Main Center Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiveTimeline events={events} />
              <MatchLiveChat
                matchId={matchId}
                matchTitle={`${currentMatch.homeTeam.shortName} vs ${currentMatch.awayTeam.shortName}`}
              />
            </div>
          </>
        )}
      </main>

      <RightSidebar />
    </div>
  );
}
