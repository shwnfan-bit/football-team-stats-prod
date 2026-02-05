'use client';

import {
  teamsApi,
  playersApi,
  matchesApi,
  matchStatsApi,
  seasonsApi,
} from './api';
import type {
  Team,
  Player,
  DatabaseMatch,
  Season,
  MatchPlayerStat,
  InsertTeam,
  UpdateTeam,
  InsertPlayer,
  UpdatePlayer,
  InsertMatch,
  UpdateMatch,
  InsertSeason,
  UpdateSeason,
} from '@/storage/database';

import type { Match } from '@/types';

export type {
  Team,
  Player,
  Match,
  Season,
  MatchPlayerStat,
  InsertTeam,
  UpdateTeam,
  InsertPlayer,
  UpdatePlayer,
  InsertMatch,
  UpdateMatch,
  InsertSeason,
  UpdateSeason,
};

// 数据存储层 - 使用 API 调用
export const storage = {
  // ==================== Teams ====================
  getTeams: (): Promise<Team[]> => {
    return teamsApi.getAll();
  },

  setTeams: async (teams: Team[]): Promise<void> => {
    // API 模式下不支持批量设置，这个方法保留但不实现
    console.warn('setTeams is not supported in API mode');
  },

  addTeam: (team: InsertTeam): Promise<Team> => {
    return teamsApi.create(team);
  },

  updateTeam: (teamId: string, updatedTeam: UpdateTeam): Promise<void> => {
    return teamsApi.update(teamId, updatedTeam).then(() => {});
  },

  deleteTeam: (teamId: string): Promise<void> => {
    return teamsApi.delete(teamId).then(() => {});
  },

  // ==================== Players ====================
  getPlayers: (): Promise<Player[]> => {
    return playersApi.getAll();
  },

  getPlayersByTeam: (teamId: string): Promise<Player[]> => {
    return playersApi.getByTeam(teamId);
  },

  setPlayers: async (players: Player[]): Promise<void> => {
    // API 模式下不支持批量设置，这个方法保留但不实现
    console.warn('setPlayers is not supported in API mode');
  },

  addPlayer: (player: InsertPlayer): Promise<Player> => {
    return playersApi.create(player);
  },

  updatePlayer: (playerId: string, updatedPlayer: UpdatePlayer): Promise<void> => {
    return playersApi.update(playerId, updatedPlayer).then(() => {});
  },

  deletePlayer: (playerId: string): Promise<void> => {
    return playersApi.delete(playerId).then(() => {});
  },

  deletePlayersByTeam: (teamId: string): Promise<void> => {
    // API 模式下需要逐个删除
    return playersApi.getByTeam(teamId).then((players) => {
      return Promise.all(players.map((p) => playersApi.delete(p.id))).then(() => {});
    });
  },

  // ==================== Matches ====================
  getMatches: (): Promise<DatabaseMatch[]> => {
    return matchesApi.getAll();
  },

  getMatchesByTeam: async (teamId: string): Promise<Match[]> => {
    const matches = await matchesApi.getByTeam(teamId);

    if (matches.length === 0) {
      return [];
    }

    // 使用批量 API 一次性获取所有比赛的球员统计（减少 API 请求）
    const matchIds = matches.map((m) => m.id).join(",");
    const response = await fetch(`/api/match-stats?matchIds=${matchIds}`);
    const result = await response.json();

    // 将统计数据关联到每场比赛
    return matches.map((match) => ({
      ...match,
      playerStats: result.data[match.id] || [],
    }));
  },

  setMatches: async (matches: Match[]): Promise<void> => {
    // API 模式下不支持批量设置，这个方法保留但不实现
    console.warn('setMatches is not supported in API mode');
  },

  addMatch: (match: InsertMatch): Promise<Match> => {
    return matchesApi.create(match);
  },

  updateMatch: (matchId: string, updatedMatch: UpdateMatch): Promise<void> => {
    return matchesApi.update(matchId, updatedMatch).then(() => {});
  },

  deleteMatch: (matchId: string): Promise<void> => {
    return matchesApi.delete(matchId).then(() => {});
  },

  deleteMatchesByTeam: (teamId: string): Promise<void> => {
    // API 模式下需要逐个删除
    return matchesApi.getByTeam(teamId).then((matches) => {
      return Promise.all(matches.map((m) => matchesApi.delete(m.id))).then(() => {});
    });
  },

  // ==================== Match Stats ====================
  getMatchPlayerStats: (matchId: string): Promise<MatchPlayerStat[]> => {
    return matchStatsApi.getByMatch(matchId);
  },

  setMatchPlayerStats: async (stats: MatchPlayerStat[]): Promise<void> => {
    // API 模式下不支持批量设置，这个方法保留但不实现
    console.warn('setMatchPlayerStats is not supported in API mode');
  },

  addMatchPlayerStat: (
    matchId: string,
    stat: Omit<InsertMatchPlayerStat, 'matchId'>
  ): Promise<MatchPlayerStat> => {
    return matchStatsApi.create(matchId, stat);
  },

  deleteMatchPlayerStats: (matchId: string): Promise<{ success: boolean }> => {
    return matchStatsApi.deleteByMatch(matchId);
  },

  updateMatchPlayerStat: async (
    statId: string,
    updatedStat: any
  ): Promise<void> => {
    // API 模式下暂不支持更新单个统计
    console.warn('updateMatchPlayerStat is not supported yet');
  },

  deleteMatchPlayerStat: (statId: string): Promise<void> => {
    // API 模式下暂不支持删除单个统计
    console.warn('deleteMatchPlayerStat is not supported yet');
  },

  // ==================== Seasons ====================
  getSeasons: (): Promise<Season[]> => {
    return seasonsApi.getAll();
  },

  getSeasonsByTeam: (teamId: string): Promise<Season[]> => {
    return seasonsApi.getAll({ teamId });
  },

  setSeasons: async (seasons: Season[]): Promise<void> => {
    // API 模式下不支持批量设置，这个方法保留但不实现
    console.warn('setSeasons is not supported in API mode');
  },

  addSeason: (season: InsertSeason): Promise<Season> => {
    return seasonsApi.create(season);
  },

  updateSeason: (seasonId: string, updatedSeason: UpdateSeason): Promise<void> => {
    return seasonsApi.update(seasonId, updatedSeason).then(() => {});
  },

  deleteSeason: (seasonId: string): Promise<void> => {
    return seasonsApi.delete(seasonId).then(() => {});
  },

  deleteSeasonsByTeam: (teamId: string): Promise<void> => {
    // API 模式下需要逐个删除
    return seasonsApi.getAll({ teamId }).then((seasons) => {
      return Promise.all(seasons.map((s) => seasonsApi.delete(s.id))).then(() => {});
    });
  },
};

// 生成唯一ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
