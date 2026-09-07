import { create } from 'zustand';
import { MatchDTO, MatchEventDTO, LiveReactionPayload, MatchChatMessage } from '@sports-social/types';

interface FloatingReaction extends LiveReactionPayload {
  id: string;
  x: number;
}

interface MatchState {
  currentMatch: MatchDTO | null;
  events: MatchEventDTO[];
  reactions: FloatingReaction[];
  chatMessages: MatchChatMessage[];
  setMatch: (match: MatchDTO) => void;
  updateMatchScore: (minute: number, homeScore: number, awayScore: number) => void;
  addMatchEvent: (event: MatchEventDTO) => void;
  addReaction: (reaction: LiveReactionPayload) => void;
  addChatMessage: (msg: MatchChatMessage) => void;
  setChatMessages: (msgs: MatchChatMessage[]) => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  currentMatch: null,
  events: [],
  reactions: [],
  chatMessages: [],

  setMatch: (match) =>
    set({
      currentMatch: match,
      events: match.events || [],
    }),

  updateMatchScore: (minute, homeScore, awayScore) =>
    set((state) => ({
      currentMatch: state.currentMatch
        ? { ...state.currentMatch, minute, homeScore, awayScore }
        : null,
    })),

  addMatchEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),

  addReaction: (reaction) => {
    const floating: FloatingReaction = {
      ...reaction,
      id: `${reaction.userId}-${Date.now()}-${Math.random()}`,
      x: Math.floor(Math.random() * 70) + 15, // random percentage position
    };
    set((state) => ({
      reactions: [...state.reactions.slice(-25), floating], // limit active reactions buffer
    }));
  },

  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, msg],
    })),

  setChatMessages: (msgs) => set({ chatMessages: msgs }),
}));
