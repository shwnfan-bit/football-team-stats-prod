'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Trophy, Target, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { storage } from '@/lib/storage';
import { initializeChengduDadieTeam, getChengduDadieTeamId } from '@/lib/team';
import { Match, Player, PlayerSeasonStats, POSITION_LABELS } from '@/types';

export default function StatsPage() {
  const [playerStats, setPlayerStats] = useState<PlayerSeasonStats[]>([]);
  const [teamStats, setTeamStats] = useState<any>(null);

  useEffect(() => {
    initializeChengduDadieTeam();
    calculateStats();
  }, []);

  const calculateStats = () => {
    const teamId = getChengduDadieTeamId();
    const matches = storage.getMatchesByTeam(teamId);
    const players = storage.getPlayersByTeam(teamId);
    const completedMatches = matches.filter(m => m.status === 'completed');

    // 计算球队统计
    const wins = completedMatches.filter(m => m.score.home > m.score.away).length;
    const draws = completedMatches.filter(m => m.score.home === m.score.away).length;
    const losses = completedMatches.filter(m => m.score.home < m.score.away).length;
    const goalsFor = completedMatches.reduce((sum, m) => sum + m.score.home, 0);
    const goalsAgainst = completedMatches.reduce((sum, m) => sum + m.score.away, 0);
    const cleanSheets = completedMatches.filter(m => m.score.away === 0).length;

    setTeamStats({
      totalMatches: completedMatches.length,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      cleanSheets,
      winRate: completedMatches.length > 0 ? Math.round((wins / completedMatches.length) * 100) : 0,
    });

    // 计算球员统计（简化版，基于比赛数据）
    const stats: PlayerSeasonStats[] = players.map(player => {
      const playerMatches = completedMatches.filter(m => 
        m.playerStats.some(ps => ps.player.id === player.id)
      );
      
      let goals = 0;
      let assists = 0;
      let yellowCards = 0;
      let redCards = 0;
      let minutesPlayed = 0;
      let totalRating = 0;

      playerMatches.forEach(match => {
        const playerStat = match.playerStats.find(ps => ps.player.id === player.id);
        if (playerStat) {
          goals += playerStat.goals;
          assists += playerStat.assists;
          yellowCards += playerStat.yellowCards;
          redCards += playerStat.redCards;
          minutesPlayed += playerStat.minutesPlayed;
          if (playerStat.rating) {
            totalRating += playerStat.rating;
          }
        }
      });

      return {
        playerId: player.id,
        playerName: player.name,
        playerNumber: player.number,
        positions: player.positions,
        matchesPlayed: playerMatches.length,
        goals,
        assists,
        yellowCards,
        redCards,
        avgRating: playerMatches.length > 0 ? Math.round((totalRating / playerMatches.length) * 10) / 10 : 0,
        minutesPlayed,
      };
    });

    setPlayerStats(stats);
  };

  const topScorers = [...playerStats].sort((a, b) => b.goals - a.goals).slice(0, 5);
  const topAssists = [...playerStats].sort((a, b) => b.assists - a.assists).slice(0, 5);
  const topRated = [...playerStats].filter(p => p.avgRating > 0).sort((a, b) => b.avgRating - a.avgRating).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-100 dark:from-red-950/20 dark:to-slate-900 pb-20 md:pb-0 pt-16 md:pt-16">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
            📈 数据统计
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            成都老爹队数据分析
          </p>
        </div>

        {/* Team Stats */}
        {teamStats ? (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  球队统计 - 成都老爹队
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    title="比赛场次"
                    value={teamStats.totalMatches}
                    icon={<Target className="h-4 w-4" />}
                  />
                  <StatCard
                    title="胜率"
                    value={`${teamStats.winRate}%`}
                    icon={<TrendingUp className="h-4 w-4" />}
                  />
                  <StatCard
                    title="总进球"
                    value={teamStats.goalsFor}
                    icon={<Target className="h-4 w-4" />}
                  />
                  <StatCard
                    title="零封场次"
                    value={teamStats.cleanSheets}
                    icon={<Users className="h-4 w-4" />}
                  />
                </div>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">胜 {teamStats.wins}</span>
                      <span className="text-sm text-muted-foreground">{teamStats.wins}场</span>
                    </div>
                    <Progress value={teamStats.totalMatches > 0 ? (teamStats.wins / teamStats.totalMatches) * 100 : 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">平 {teamStats.draws}</span>
                      <span className="text-sm text-muted-foreground">{teamStats.draws}场</span>
                    </div>
                    <Progress value={teamStats.totalMatches > 0 ? (teamStats.draws / teamStats.totalMatches) * 100 : 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">负 {teamStats.losses}</span>
                      <span className="text-sm text-muted-foreground">{teamStats.losses}场</span>
                    </div>
                    <Progress value={teamStats.totalMatches > 0 ? (teamStats.losses / teamStats.totalMatches) * 100 : 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Player Stats */}
            <Tabs defaultValue="scorers" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="scorers">射手榜</TabsTrigger>
                <TabsTrigger value="assists">助攻榜</TabsTrigger>
                <TabsTrigger value="rating">评分榜</TabsTrigger>
              </TabsList>

              <TabsContent value="scorers" className="space-y-4">
                <RankingCard
                  title="射手榜"
                  players={topScorers}
                  statKey="goals"
                  statLabel="进球"
                />
              </TabsContent>

              <TabsContent value="assists" className="space-y-4">
                <RankingCard
                  title="助攻榜"
                  players={topAssists}
                  statKey="assists"
                  statLabel="助攻"
                />
              </TabsContent>

              <TabsContent value="rating" className="space-y-4">
                <RankingCard
                  title="评分榜"
                  players={topRated}
                  statKey="avgRating"
                  statLabel="平均评分"
                />
              </TabsContent>
            </Tabs>

            {/* All Players Stats */}
            {playerStats.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>全部球员数据</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {playerStats.map((player, index) => {
                      const positionLabels = player.positions
                        .filter(p => p !== null)
                        .map(p => POSITION_LABELS[p])
                        .join(' / ');
                      
                      return (
                        <div key={player.playerId} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold">{player.playerName}</div>
                              <div className="text-xs text-muted-foreground">
                                #{player.playerNumber} · {positionLabels}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-center text-sm">
                            <div>
                              <div className="font-bold">{player.matchesPlayed}</div>
                              <div className="text-xs text-muted-foreground">场次</div>
                            </div>
                            <div>
                              <div className="font-bold">{player.goals}</div>
                              <div className="text-xs text-muted-foreground">进球</div>
                            </div>
                            <div>
                              <div className="font-bold">{player.assists}</div>
                              <div className="text-xs text-muted-foreground">助攻</div>
                            </div>
                            <div>
                              <div className="font-bold">{player.avgRating}</div>
                              <div className="text-xs text-muted-foreground">评分</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                暂无数据
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md">
                请先添加球员和比赛记录
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="p-4 rounded-lg border bg-background">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-muted-foreground">{icon}</div>
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
        {value}
      </div>
    </div>
  );
}

function RankingCard({ title, players, statKey, statLabel }: any) {
  if (players.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">暂无数据</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players.map((player: PlayerSeasonStats, index: number) => {
            const positionLabels = player.positions
              .filter(p => p !== null)
              .map(p => POSITION_LABELS[p])
              .join(' / ');
            
            return (
              <div key={player.playerId} className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-900/50 font-bold text-lg text-red-600 dark:text-red-400">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-base">{player.playerName}</div>
                    <div className="text-xs text-muted-foreground">
                      #{player.playerNumber} · {positionLabels} · {player.matchesPlayed}场比赛
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {player[statKey as keyof PlayerSeasonStats] as number}
                  </div>
                  <div className="text-xs text-muted-foreground">{statLabel}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
