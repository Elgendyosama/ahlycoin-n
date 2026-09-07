// Shared Types & DTOs for Sports Social Monorepo

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  HALFTIME = 'HALFTIME',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED'
}

export enum MatchEventType {
  GOAL = 'GOAL',
  YELLOW_CARD = 'YELLOW_CARD',
  RED_CARD = 'RED_CARD',
  SUBSTITUTION = 'SUBSTITUTION',
  VAR = 'VAR',
  PERIOD_START = 'PERIOD_START',
  PERIOD_END = 'PERIOD_END'
}

export enum ReactionEmoji {
  FIRE = '🔥',
  GOAL = '⚽',
  CLAP = '👏',
  HEART = '❤️',
  MIND_BLOWN = '🤯',
  ANGRY = '😡'
}

export enum Role {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN'
}

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: Role | 'USER' | 'MODERATOR' | 'ADMIN';
  isBanned?: boolean;
  isVerified?: boolean;
  favoriteTeamId?: string | null;
  favoriteTeam?: TeamDTO | null;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

export interface TeamDTO {
  id: string;
  name: string;
  shortName: string;
  code: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface MatchEventDTO {
  id: string;
  matchId: string;
  type: MatchEventType;
  minute: number;
  teamId: string;
  player: string;
  assistPlayer?: string | null;
  description: string;
  createdAt: string;
}

export interface MatchDTO {
  id: string;
  homeTeam: TeamDTO;
  awayTeam: TeamDTO;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute: number;
  startTime: string;
  venue: string;
  league: string;
  events?: MatchEventDTO[];
}

export interface PostDTO {
  id: string;
  author: UserDTO;
  content: string;
  mediaUrls: string[];
  matchId?: string | null;
  match?: MatchDTO | null;
  likesCount: number;
  commentsCount: number;
  isLikedByMe?: boolean;
  createdAt: string;
}

export interface CommentDTO {
  id: string;
  postId: string;
  author: UserDTO;
  content: string;
  createdAt: string;
}

export interface LiveReactionPayload {
  matchId: string;
  emoji: ReactionEmoji;
  userId: string;
  username: string;
  timestamp: number;
}

export interface MatchChatMessage {
  id: string;
  matchId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  message: string;
  mediaType?: 'image' | 'audio';
  mediaUrl?: string;
  audioDuration?: number;
  badge?: string;
  timestamp: number;
}

// Socket Events Constants
export const SOCKET_EVENTS = {
  JOIN_MATCH: 'match:join',
  LEAVE_MATCH: 'match:leave',
  MATCH_UPDATE: 'match:update',
  MATCH_EVENT: 'match:event',
  EMIT_REACTION: 'reaction:emit',
  BROADCAST_REACTION: 'reaction:broadcast',
  SEND_CHAT: 'chat:send',
  NEW_CHAT: 'chat:new'
} as const;

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
