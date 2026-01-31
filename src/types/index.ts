// 足球队数据统计应用类型定义

export const POSITION_LABELS: Record<PlayerPosition, string> = {
  goalkeeper: '门将',
  'center-back': '中后卫',
  'full-back': '边后卫',
  midfielder: '中场',
  'wing-midfielder': '边前卫',
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
  positions: [PlayerPosition, PlayerPosition | null]; // 第一位置、第二位置
  birthday: string; // 生日 YYYY-MM-DD
  height?: number;
  weight?: number;
  isCaptain?: boolean;
  photo?: string;
  createdAt: number;
}

export type PlayerPosition =
  | 'goalkeeper'
  | 'center-back'
  | 'full-back'
  | 'midfielder'
  | 'wing-midfielder'
  | 'forward';

export interface Match {
  id: string;
  teamId: string;
  opponent: string;
  date: string;
  isHome: boolean;
  score: {
    home: number;
    away: number;
  };
  location?: string;
  status: MatchStatus;
  playerStats: PlayerMatchStats[];
  createdAt: number;
}

export type MatchStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface PlayerMatchStats {
  player: Player;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passAccuracy: number;
  tackles: number;
  interceptions: number;
  minutesPlayed: number;
  rating?: number;
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
  positions: [PlayerPosition, PlayerPosition | null];
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
  cleanSheets: number;
}
