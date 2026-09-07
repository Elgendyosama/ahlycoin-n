'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { getSocket } from '@/lib/socket-client';
import { useToast } from '@/components/ui/Toast';
import {
  Trophy,
  Radio,
  Play,
  Pause,
  CheckCircle,
  Clock,
  ArrowRight,
  Shield,
  Send,
  AlertTriangle,
  Plus,
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  shortName: string;
  code: string;
  logoUrl: string;
}

interface MatchEvent {
  id: string;
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'VAR';
  minute: number;
  teamId: string;
  team?: Team;
  player: string;
  assistPlayer?: string;
  description: string;
  createdAt: string;
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
  events?: MatchEvent[];
}

export default function LiveMatchControlRoomPage() {
  const params = useParams();
  const matchId = params.id as string;
  const router = useRouter();
  const { showToast } = useToast();

  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Event Form State
  const [eventType, setEventType] = useState<'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'VAR'>('GOAL');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [minute, setMinute] = useState<number>(45);
  const [player, setPlayer] = useState<string>('');
  const [assistPlayer, setAssistPlayer] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const loadMatchDetails = async () => {
    try {
      const data = await fetchApi<Match>(`/matches/${matchId}`);
      setMatch(data);
      setEvents(data.events || []);
      setMinute(data.minute || 1);
      if (data.homeTeam) {
        setSelectedTeamId(data.homeTeam.id);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل في تحميل تفاصيل المباراة', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatchDetails();

    // Socket.io Real-time connection
    const socket = getSocket();
    socket.emit('join_match', matchId);

    const handleEventUpdate = (data: { event: MatchEvent; match: Match }) => {
      setMatch(data.match);
      setEvents((prev) => [data.event, ...prev]);
      showToast(`تحديث مباشر: ${data.event.description}`, 'info');
    };

    const handleStatusUpdate = (updatedMatch: Match) => {
      setMatch(updatedMatch);
      showToast(`تم تغيير حالة المباراة إلى: ${updatedMatch.status}`, 'info');
    };

    socket.on('match_event_update', handleEventUpdate);
    socket.on('match_status_update', handleStatusUpdate);

    return () => {
      socket.emit('leave_match', matchId);
      socket.off('match_event_update', handleEventUpdate);
      socket.off('match_status_update', handleStatusUpdate);
    };
  }, [matchId]);

  const handleStatusChange = async (newStatus: Match['status']) => {
    try {
      const updated = await fetchApi<Match>(`/admin/matches/${matchId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setMatch(updated);
      showToast(`تم تحديث حالة المباراة إلى (${newStatus})`, 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل في تغيير حالة المباراة', 'error');
    }
  };

  const handleSendEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player.trim()) {
      showToast('يرجى إدخال اسم اللاعب', 'error');
      return;
    }

    setSubmittingEvent(true);
    try {
      const desc = description.trim() || `${eventType} - ${player} (${minute}')`;
      await fetchApi(`/admin/matches/${matchId}/events`, {
        method: 'POST',
        body: JSON.stringify({
          type: eventType,
          minute,
          teamId: selectedTeamId,
          player,
          assistPlayer: assistPlayer || undefined,
          description: desc,
        }),
      });

      showToast('تم بث الحدث المباشر بنجاح عبر Socket.io', 'success');
      setPlayer('');
      setAssistPlayer('');
      setDescription('');
    } catch (err: any) {
      showToast(err.message || 'فشل في تسجيل الحدث المباشر', 'error');
    } finally {
      setSubmittingEvent(false);
    }
  };

  if (loading || !match) {
    return (
      <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl">
        <Radio className="w-10 h-10 text-rose-500 animate-pulse mx-auto mb-3" />
        <p className="text-slate-400">جاري الاتصال بفرغرفة التحكم المباشر...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/matches')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لقائمة المباريات
        </button>

        <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-800 text-rose-400 px-4 py-1.5 rounded-full text-xs font-bold animate-pulse">
          <Radio className="w-4 h-4" />
          غرفة البث المباشر المباشرة (Socket.io Connected)
        </div>
      </div>

      {/* Main Match Header Scoreboard */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <span className="text-xs font-bold text-rose-400 bg-rose-950 px-3 py-1 rounded-full border border-rose-800">
            {match.league} - {match.venue}
          </span>

          {/* Match Status Switcher Controls */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => handleStatusChange('SCHEDULED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                match.status === 'SCHEDULED' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              مجدولة
            </button>
            <button
              onClick={() => handleStatusChange('LIVE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                match.status === 'LIVE' ? 'bg-rose-600 text-white shadow animate-pulse' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3 h-3" />
              مباشر (LIVE)
            </button>
            <button
              onClick={() => handleStatusChange('HALFTIME')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                match.status === 'HALFTIME' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pause className="w-3 h-3" />
              استراحة
            </button>
            <button
              onClick={() => handleStatusChange('FINISHED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                match.status === 'FINISHED' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              إنهاء المباراة
            </button>
          </div>
        </div>

        {/* Live Score Display */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-2 w-1/3">
            <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-slate-700 p-3 flex items-center justify-center shadow-lg">
              <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-14 h-14 object-contain" />
            </div>
            <h2 className="text-lg font-extrabold text-white text-center">{match.homeTeam.name}</h2>
          </div>

          {/* Live Score */}
          <div className="flex flex-col items-center justify-center w-1/3 space-y-2">
            <div className="text-5xl font-black text-white tracking-widest bg-slate-950 px-8 py-3 rounded-3xl border border-slate-800 shadow-inner">
              {match.homeScore} - {match.awayScore}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
              <Clock className="w-3.5 h-3.5" />
              الدقيقة المباشرة: {match.minute}'
            </div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-2 w-1/3">
            <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-slate-700 p-3 flex items-center justify-center shadow-lg">
              <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-14 h-14 object-contain" />
            </div>
            <h2 className="text-lg font-extrabold text-white text-center">{match.awayTeam.name}</h2>
          </div>
        </div>
      </div>

      {/* Control Room Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Quick Event Trigger Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-rose-500" />
              لوحة إضافة أحداث المباراة الحية
            </h3>
            <span className="text-xs text-rose-400 bg-rose-950 px-2.5 py-1 rounded-full">Socket Broadcast</span>
          </div>

          <form onSubmit={handleSendEvent} className="space-y-4">
            {/* Event Type Quick Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">نوع الحدث الرياضي</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'GOAL', label: '⚽ هدف', color: 'bg-emerald-600' },
                  { key: 'YELLOW_CARD', label: '🟨 كارت أصفر', color: 'bg-amber-600' },
                  { key: 'RED_CARD', label: '🟥 كارت أحمر', color: 'bg-rose-600' },
                  { key: 'VAR', label: '🖥️ VAR', color: 'bg-purple-600' },
                ].map((typeItem) => (
                  <button
                    key={typeItem.key}
                    type="button"
                    onClick={() => setEventType(typeItem.key as any)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                      eventType === typeItem.key
                        ? `${typeItem.color} text-white border-white shadow-lg`
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {typeItem.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">الفريق صاحب الحدث</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
              >
                <option value={match.homeTeam.id}>{match.homeTeam.name} (المستضيف)</option>
                <option value={match.awayTeam.id}>{match.awayTeam.name} (الضيف)</option>
              </select>
            </div>

            {/* Minute & Player */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">الدقيقة</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={minute}
                  onChange={(e) => setMinute(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">اسم اللاعب الرئيسي</label>
                <input
                  type="text"
                  value={player}
                  onChange={(e) => setPlayer(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                  placeholder="مثال: إمام عاشور"
                  required
                />
              </div>
            </div>

            {/* Assist Player (Optional for GOAL) */}
            {eventType === 'GOAL' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">صانع الهدف (اختياري)</label>
                <input
                  type="text"
                  value={assistPlayer}
                  onChange={(e) => setAssistPlayer(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                  placeholder="مثال: حسين الشحات"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">وصف الحدث (اختياري)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                placeholder="تفاصيل إضافية عن اللقطة..."
              />
            </div>

            <button
              type="submit"
              disabled={submittingEvent}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-950/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submittingEvent ? 'جاري البث التلقائي...' : 'إرسال وبث الحدث للمتابعين (Socket.io)'}
            </button>
          </form>
        </div>

        {/* Right Column: Live Event Stream Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                شريط الأحداث المباشرة (Live Stream Timeline)
              </h3>
              <span className="text-xs text-slate-400">{events.length} حدث مسجل</span>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                لم يتم تسجيل أي أحداث حتى الآن بهذه المباراة.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 text-rose-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {ev.minute}'
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {ev.type === 'GOAL' && '⚽ هدف'}
                          {ev.type === 'YELLOW_CARD' && '🟨 بطاقة صفراء'}
                          {ev.type === 'RED_CARD' && '🟥 بطاقة حمراء'}
                          {ev.type === 'VAR' && '🖥️ قرار تقنية الفار VAR'}
                          {ev.team?.name ? ` - ${ev.team.name}` : ''}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(ev.createdAt).toLocaleTimeString('ar-EG')}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-200">{ev.player}</p>
                      {ev.assistPlayer && (
                        <p className="text-xs text-slate-400">صناعة: {ev.assistPlayer}</p>
                      )}
                      {ev.description && (
                        <p className="text-xs text-slate-400 mt-1">{ev.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>تحديثات الشاشة تلقائية بدون الحاجة لإعادة التحميل.</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
