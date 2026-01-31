'use client';

import { Team, Player, Match, Season } from '@/types';

export type { Team, Player, Match, Season };

const STORAGE_KEYS = {
  TEAMS: 'football_teams',
  PLAYERS: 'football_players',
  MATCHES: 'football_matches',
  SEASONS: 'football_seasons',
} as const;

// 球队相关存储
export const storage = {
  // Teams
  getTeams: (): Team[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return data ? JSON.parse(data) : [];
  },

  setTeams: (teams: Team[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  },

  addTeam: (team: Team) => {
    const teams = storage.getTeams();
    teams.push(team);
    storage.setTeams(teams);
  },

  updateTeam: (teamId: string, updatedTeam: Partial<Team>) => {
    const teams = storage.getTeams();
    const index = teams.findIndex(t => t.id === teamId);
    if (index !== -1) {
      teams[index] = { ...teams[index], ...updatedTeam };
      storage.setTeams(teams);
    }
  },

  deleteTeam: (teamId: string) => {
    const teams = storage.getTeams().filter(t => t.id !== teamId);
    storage.setTeams(teams);
    // 同时删除该球队的球员和比赛
    storage.deletePlayersByTeam(teamId);
    storage.deleteMatchesByTeam(teamId);
  },

  // Players
  getPlayers: (): Player[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return data ? JSON.parse(data) : [];
  },

  getPlayersByTeam: (teamId: string): Player[] => {
    return storage.getPlayers().filter(p => p.teamId === teamId);
  },

  setPlayers: (players: Player[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  },

  addPlayer: (player: Player) => {
    const players = storage.getPlayers();
    players.push(player);
    storage.setPlayers(players);
  },

  updatePlayer: (playerId: string, updatedPlayer: Partial<Player>) => {
    const players = storage.getPlayers();
    const index = players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      players[index] = { ...players[index], ...updatedPlayer };
      storage.setPlayers(players);
    }
  },

  deletePlayer: (playerId: string) => {
    const players = storage.getPlayers().filter(p => p.id !== playerId);
    storage.setPlayers(players);
  },

  deletePlayersByTeam: (teamId: string) => {
    const players = storage.getPlayers().filter(p => p.teamId !== teamId);
    storage.setPlayers(players);
  },

  // Matches
  getMatches: (): Match[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return data ? JSON.parse(data) : [];
  },

  getMatchesByTeam: (teamId: string): Match[] => {
    return storage.getMatches().filter(m => m.teamId === teamId);
  },

  setMatches: (matches: Match[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  },

  addMatch: (match: Match) => {
    const matches = storage.getMatches();
    matches.push(match);
    storage.setMatches(matches);
  },

  updateMatch: (matchId: string, updatedMatch: Partial<Match>) => {
    const matches = storage.getMatches();
    const index = matches.findIndex(m => m.id === matchId);
    if (index !== -1) {
      matches[index] = { ...matches[index], ...updatedMatch };
      storage.setMatches(matches);
    }
  },

  deleteMatch: (matchId: string) => {
    const matches = storage.getMatches().filter(m => m.id !== matchId);
    storage.setMatches(matches);
  },

  deleteMatchesByTeam: (teamId: string) => {
    const matches = storage.getMatches().filter(m => m.teamId !== teamId);
    storage.setMatches(matches);
  },

  // Seasons
  getSeasons: (): Season[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.SEASONS);
    return data ? JSON.parse(data) : [];
  },

  getSeasonsByTeam: (teamId: string): Season[] => {
    return storage.getSeasons().filter(s => s.teamId === teamId);
  },

  setSeasons: (seasons: Season[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SEASONS, JSON.stringify(seasons));
  },

  addSeason: (season: Season) => {
    const seasons = storage.getSeasons();
    seasons.push(season);
    storage.setSeasons(seasons);
  },

  updateSeason: (seasonId: string, updatedSeason: Partial<Season>) => {
    const seasons = storage.getSeasons();
    const index = seasons.findIndex(s => s.id === seasonId);
    if (index !== -1) {
      seasons[index] = { ...seasons[index], ...updatedSeason };
      storage.setSeasons(seasons);
    }
  },

  deleteSeason: (seasonId: string) => {
    const seasons = storage.getSeasons().filter(s => s.id !== seasonId);
    storage.setSeasons(seasons);
  },
};

// 生成唯一ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
