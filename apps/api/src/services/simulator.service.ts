import { Server } from 'socket.io';
import { SOCKET_EVENTS, MatchEventType, ReactionEmoji } from '@sports-social/types';

export class MatchSimulatorService {
  private io: Server;
  private intervalId: NodeJS.Timeout | null = null;
  private matchState = {
    id: 'match-1',
    minute: 78,
    homeScore: 2,
    awayScore: 1,
  };

  constructor(io: Server) {
    this.io = io;
  }

  startSimulation() {
    console.log('⚡ Live Match Simulator Service Started for match-1');

    this.intervalId = setInterval(() => {
      // Advance match minute
      this.matchState.minute = (this.matchState.minute + 1) % 95;
      if (this.matchState.minute === 0) this.matchState.minute = 1;

      // Broadcast minute ticker
      this.io.to(`match:${this.matchState.id}`).emit(SOCKET_EVENTS.MATCH_UPDATE, {
        matchId: this.matchState.id,
        minute: this.matchState.minute,
        homeScore: this.matchState.homeScore,
        awayScore: this.matchState.awayScore,
      });

      // Random synthetic reaction burst simulation
      const emojis = [
        ReactionEmoji.FIRE,
        ReactionEmoji.GOAL,
        ReactionEmoji.CLAP,
        ReactionEmoji.HEART,
      ];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

      this.io.to(`match:${this.matchState.id}`).emit(SOCKET_EVENTS.BROADCAST_REACTION, {
        matchId: this.matchState.id,
        emoji: randomEmoji,
        userId: 'sim-bot',
        username: 'LiveFan_' + Math.floor(Math.random() * 900 + 100),
        timestamp: Date.now(),
      });

      // Occasional match event (e.g. goal or yellow card)
      const chance = Math.random();
      if (chance > 0.95) {
        const isGoal = Math.random() > 0.6;
        if (isGoal) {
          const homeGoal = Math.random() > 0.5;
          if (homeGoal) this.matchState.homeScore++;
          else this.matchState.awayScore++;

          this.io.to(`match:${this.matchState.id}`).emit(SOCKET_EVENTS.MATCH_EVENT, {
            id: `evt-${Date.now()}`,
            matchId: this.matchState.id,
            type: MatchEventType.GOAL,
            minute: this.matchState.minute,
            teamId: homeGoal ? 'AHL' : 'RMA',
            player: homeGoal ? 'Wessam Abou Ali' : 'Kylian Mbappé',
            description: 'GOAL! Unstoppable volley into the top corner!',
            createdAt: new Date().toISOString(),
          });
        }
      }
    }, 4000); // Trigger tick every 4 seconds
  }

  stopSimulation() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
