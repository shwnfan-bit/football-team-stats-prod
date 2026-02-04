'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, Trophy, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { initializeChengduDadieTeam, getChengduDadieTeamId, calculateAge } from '@/lib/team';
import { Match, Player } from '@/types';

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamStats, setTeamStats] = useState<any>(null);
  const [latestMatches, setLatestMatches] = useState<Match[]>([]);

  useEffect(() => {
    (async () => {
      await initializeChengduDadieTeam();
      await loadData();
    })();
  }, []);

  const loadData = async () => {
    const teamId = await getChengduDadieTeamId();
    const allPlayers = await storage.getPlayersByTeam(teamId);
    const allMatches = await storage.getMatchesByTeam(teamId);

    // 计算球队统计
    const wins = allMatches.filter(m => m.scoreHome > m.scoreAway).length;
    const draws = allMatches.filter(m => m.scoreHome === m.scoreAway).length;
    const losses = allMatches.filter(m => m.scoreHome < m.scoreAway).length;
    const goalsFor = allMatches.reduce((sum, m) => sum + m.scoreHome, 0);
    const goalsAgainst = allMatches.reduce((sum, m) => sum + m.scoreAway, 0);

    setPlayers(allPlayers);
    setMatches(allMatches);
    setTeamStats({
      players: allPlayers.length,
      matches: allMatches.length,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      winRate: allMatches.length > 0 ? Math.round((wins / allMatches.length) * 100) : 0,
    });

    // 获取最近的比赛
    const sorted = [...allMatches].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setLatestMatches(sorted.slice(0, 5));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-100 dark:from-red-950/20 dark:to-slate-900 pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 pt-16 md:pt-0">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
              🏆 成都老爹队
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              数据统计与分析
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {teamStats && (
          <>
            {/* 球队统计卡片 */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    球员数量
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {teamStats.players}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    比赛场次
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {teamStats.matches}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    胜率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {teamStats.winRate}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    总进球
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {teamStats.goalsFor}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 战绩详情 */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>战绩概览</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <span className="font-medium">胜场</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{teamStats.wins}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <span className="font-medium">平场</span>
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{teamStats.draws}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <span className="font-medium">负场</span>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">{teamStats.losses}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>最近比赛</CardTitle>
                </CardHeader>
                <CardContent>
                  {latestMatches.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>暂无比赛记录</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {latestMatches.map((match) => (
                        <div key={match.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{match.opponent}</span>
                            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                              {match.scoreHome} - {match.scoreAway}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(match.date).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
