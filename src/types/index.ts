// 足球队数据统计应用类型定义

export const POSITION_LABELS: Record<PlayerPosition, string> = {
  goalkeeper: '门将',
  defender: '后卫',
  midfielder: '中场',
  forward: '前锋',
};

export interface Team {
  id: string;
  name: string;
  logo?: string;
  color: string;
  foundedYear: number;
  coach?: string;
  createdAt: number;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  number: number;
  position: PlayerPosition; // 单个位置
  birthday: string; // 生日 YYYY-MM-DD
  height?: number;
  weight?: number;
  isCaptain?: boolean;
  photo?: string;
  createdAt: number;
}

export type PlayerPosition = 'goalkeeper' | 'defender' | 'midfielder' | 'forward';

export interface Match {
  id: string;
  teamId: string;
  opponent: string;
  date: string;
  matchType: 'home' | 'away'; // 主场/客场
  matchNature: 'friendly' | 'internal' | 'cup' | 'league'; // 友谊赛/对内赛/杯赛/联赛
  location?: string;
  score: {
    home: number;
    away: number;
  };
  status?: 'completed' | 'pending';
  playerStats: PlayerMatchStats[];
  createdAt: number;
}

export interface PlayerMatchStats {
  playerId: string;
  playerName: string;
  playerNumber: number;
  playerPosition: PlayerPosition;
  isPlaying: boolean;
  goals: number;
  assists: number;
}

export interface Season {
  id: string;
  teamId: string;
  name: string;
  startDate: string;
  endDate: string;
  matches: Match[];
}

export interface PlayerSeasonStats {
  playerId: string;
  playerName: string;
  playerNumber: number;
  position: PlayerPosition;
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  avgRating: number;
  minutesPlayed: number;
}

export interface TeamSeasonStats {
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}
