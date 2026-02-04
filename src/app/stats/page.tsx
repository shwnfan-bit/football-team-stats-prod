'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Trophy, Target, TrendingUp, Users, Plus, Calendar, MapPin, Flag, X, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { storage, generateId } from '@/lib/storage';
import { initializeChengduDadieTeam, getChengduDadieTeamId } from '@/lib/team';
import { Match, Player, PlayerSeasonStats, PlayerPosition, POSITION_LABELS } from '@/types';

export default function StatsPage() {
  const [playerStats, setPlayerStats] = useState<PlayerSeasonStats[]>([]);
  const [teamStats, setTeamStats] = useState<any>(null);
  const [isAddMatchDialogOpen, setIsAddMatchDialogOpen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newMatch, setNewMatch] = useState({
    opponent: '',
    date: '',
    location: '',
    matchType: 'home' as 'home' | 'away',
    matchNature: 'friendly' as 'friendly' | 'internal' | 'cup' | 'league',
    scoreHome: 0,
    scoreAway: 0,
    playerStats: {} as Record<string, { isPlaying: boolean; goals: number; assists: number }>,
    videos: [] as string[],
  });

  useEffect(() => {
    (async () => {
      await initializeChengduDadieTeam();
      await calculateStats();
      await loadPlayers();
    })();
  }, []);

  const loadPlayers = async () => {
    const teamId = await getChengduDadieTeamId();
    const loadedPlayers = await storage.getPlayersByTeam(teamId);
    setPlayers(loadedPlayers);
  };

  const calculateStats = async () => {
    const teamId = await getChengduDadieTeamId();
    const matches = await storage.getMatchesByTeam(teamId);
    const allPlayers = await storage.getPlayersByTeam(teamId);
    
    // 使用所有比赛计算统计（不过滤 completed）
    const wins = matches.filter(m => m.scoreHome > m.scoreAway).length;
    const draws = matches.filter(m => m.scoreHome === m.scoreAway).length;
    const losses = matches.filter(m => m.scoreHome < m.scoreAway).length;
    const goalsFor = matches.reduce((sum, m) => sum + m.scoreHome, 0);
    const goalsAgainst = matches.reduce((sum, m) => sum + m.scoreAway, 0);
    const cleanSheets = matches.filter(m => m.scoreAway === 0).length;

    setTeamStats({
      totalMatches: matches.length,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      cleanSheets,
      winRate: matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0,
    });

    // 计算球员统计
    const stats: PlayerSeasonStats[] = allPlayers.map(player => {
      const playerMatches = matches.filter(m => 
        m.playerStats.some(ps => ps.playerId === player.id)
      );
      
      let goals = 0;
      let assists = 0;
      let yellowCards = 0;
      let redCards = 0;
      let minutesPlayed = 0;
      let totalRating = 0;

      playerMatches.forEach(match => {
        const playerStat = match.playerStats.find(ps => ps.playerId === player.id);
        if (playerStat) {
          goals += playerStat.goals;
          assists += playerStat.assists;
        }
      });

      return {
        playerId: player.id,
        playerName: player.name,
        playerNumber: player.number,
        position: player.position,
        matchesPlayed: playerMatches.length,
        goals,
        assists,
        yellowCards,
        redCards,
        avgRating: 0,
        minutesPlayed,
      };
    });

    setPlayerStats(stats);
  };

  const handleAddMatch = async () => {
    if (!newMatch.opponent.trim() || !newMatch.date) {
      alert('请填写完整的比赛信息');
      return;
    }

    try {
      const teamId = await initializeChengduDadieTeam();
      
      // 构建 playerStats 数组
      const matchPlayerStats = Object.entries(newMatch.playerStats)
        .filter(([_, stats]) => stats.isPlaying)
        .map(([playerId, stats]) => {
          const player = players.find(p => p.id === playerId);
          return {
            playerId: playerId,
            playerName: player!.name,
            playerNumber: player!.number,
            playerPosition: player!.position,
            isPlaying: true,
            goals: stats.goals,
            assists: stats.assists,
          };
        });

      // 创建比赛基本信息
      const matchData = {
        teamId,
        opponent: newMatch.opponent.trim(),
        date: newMatch.date,
        location: newMatch.location || undefined,
        matchType: newMatch.matchType,
        matchNature: newMatch.matchNature,
        scoreHome: newMatch.scoreHome,
        scoreAway: newMatch.scoreAway,
        status: 'completed' as const,
        videos: newMatch.videos,
      };

      const createdMatch = await storage.addMatch(matchData);
      
      // 创建球员统计数据
      for (const stat of matchPlayerStats) {
        await storage.addMatchPlayerStat(createdMatch.id, stat);
      }

      // 立即关闭对话框
      setIsAddMatchDialogOpen(false);
      resetMatchForm();
      
      // 后台异步刷新数据
      calculateStats().catch(console.error);
      loadPlayers().catch(console.error);
    } catch (error) {
      console.error('添加比赛失败:', error);
      alert('添加比赛失败: ' + (error as Error).message);
    }
  };

  const resetMatchForm = () => {
    setNewMatch({
      opponent: '',
      date: '',
      location: '',
      matchType: 'home',
      matchNature: 'friendly',
      scoreHome: 0,
      scoreAway: 0,
      playerStats: {},
      videos: [],
    });
  };

  const handlePlayerToggle = (playerId: string) => {
    setNewMatch(prev => ({
      ...prev,
      playerStats: {
        ...prev.playerStats,
        [playerId]: {
          ...prev.playerStats[playerId],
          isPlaying: !prev.playerStats[playerId]?.isPlaying || false,
          goals: prev.playerStats[playerId]?.goals || 0,
          assists: prev.playerStats[playerId]?.assists || 0,
        }
      }
    }));
  };

  const handlePlayerStatChange = (playerId: string, stat: 'goals' | 'assists', value: number) => {
    setNewMatch(prev => ({
      ...prev,
      playerStats: {
        ...prev.playerStats,
        [playerId]: {
          ...prev.playerStats[playerId],
          [stat]: Math.max(0, value),
        }
      }
    }));
  };

  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) return;
    setNewMatch(prev => ({
      ...prev,
      videos: [...prev.videos, newVideoUrl.trim()],
    }));
    setNewVideoUrl('');
  };

  const handleRemoveVideo = (index: number) => {
    setNewMatch(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const topScorers = [...playerStats].sort((a, b) => b.goals - a.goals).slice(0, 5);
  const topAssists = [...playerStats].sort((a, b) => b.assists - a.assists).slice(0, 5);
  const topAttendance = [...playerStats].sort((a, b) => b.matchesPlayed - a.matchesPlayed).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-100 dark:from-red-950/20 dark:to-slate-900 pb-20 md:pb-0 pt-16 md:pt-16">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
              数据统计
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              成都老爹队数据分析
            </p>
          </div>
          <Dialog open={isAddMatchDialogOpen} onOpenChange={setIsAddMatchDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-700 hover:bg-red-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                录入比赛
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>录入比赛</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="match-opponent">对手 *</Label>
                    <Input
                      id="match-opponent"
                      value={newMatch.opponent}
                      onChange={(e) => setNewMatch({ ...newMatch, opponent: e.target.value })}
                      placeholder="请输入对手名称"
                    />
                  </div>
                  <div>
                    <Label htmlFor="match-date">日期 *</Label>
                    <Input
                      id="match-date"
                      type="date"
                      value={newMatch.date}
                      onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="match-location">地点</Label>
                  <Input
                    id="match-location"
                    value={newMatch.location}
                    onChange={(e) => setNewMatch({ ...newMatch, location: e.target.value })}
                    placeholder="请输入比赛地点"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="match-type">类型</Label>
                    <Select
                      value={newMatch.matchType}
                      onValueChange={(value: 'home' | 'away') => setNewMatch({ ...newMatch, matchType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">主场</SelectItem>
                        <SelectItem value="away">客场</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="match-nature">性质</Label>
                    <Select
                      value={newMatch.matchNature}
                      onValueChange={(value: 'friendly' | 'internal' | 'cup' | 'league') => setNewMatch({ ...newMatch, matchNature: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">友谊赛</SelectItem>
                        <SelectItem value="internal">队内赛</SelectItem>
                        <SelectItem value="cup">杯赛</SelectItem>
                        <SelectItem value="league">联赛</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="score-home">我方进球 *</Label>
                    <Input
                      id="score-home"
                      type="number"
                      min="0"
                      value={newMatch.scoreHome}
                      onChange={(e) => setNewMatch({ ...newMatch, scoreHome: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="score-away">对方进球 *</Label>
                    <Input
                      id="score-away"
                      type="number"
                      min="0"
                      value={newMatch.scoreAway}
                      onChange={(e) => setNewMatch({ ...newMatch, scoreAway: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">上场球员及数据</Label>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                    {players.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">暂无球员，请先添加球员</p>
                    ) : (
                      players
                        .sort((a, b) => a.number - b.number)
                        .map((player) => (
                          <div key={player.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                            <input
                              type="checkbox"
                              checked={newMatch.playerStats[player.id]?.isPlaying || false}
                              onChange={() => handlePlayerToggle(player.id)}
                              className="w-4 h-4"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">#{player.number}</span>
                                <span>{player.name}</span>
                                {player.position && (
                                  <span className="text-xs text-slate-500">
                                    {POSITION_LABELS[player.position]}
                                  </span>
                                )}
                              </div>
                            </div>
                            {newMatch.playerStats[player.id]?.isPlaying && (
                              <>
                                <div className="flex items-center gap-1">
                                  <Label htmlFor={`goals-${player.id}`} className="text-xs">进球</Label>
                                  <Input
                                    id={`goals-${player.id}`}
                                    type="number"
                                    min="0"
                                    value={newMatch.playerStats[player.id]?.goals || 0}
                                    onChange={(e) => handlePlayerStatChange(player.id, 'goals', parseInt(e.target.value) || 0)}
                                    className="w-16 h-8"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <Label htmlFor={`assists-${player.id}`} className="text-xs">助攻</Label>
                                  <Input
                                    id={`assists-${player.id}`}
                                    type="number"
                                    min="0"
                                    value={newMatch.playerStats[player.id]?.assists || 0}
                                    onChange={(e) => handlePlayerStatChange(player.id, 'assists', parseInt(e.target.value) || 0)}
                                    className="w-16 h-8"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">比赛录像</Label>
                  <div className="mt-2 space-y-2">
                    {/* 已添加的录像链接 */}
                    {newMatch.videos.length > 0 && (
                      <div className="space-y-2">
                        {newMatch.videos.map((url, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border overflow-hidden min-w-0">
                            <Video className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-sm text-blue-600 dark:text-blue-400 hover:underline truncate min-w-0"
                            >
                              {url}
                            </a>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-slate-500 hover:text-red-600 flex-shrink-0"
                              onClick={() => handleRemoveVideo(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* 添加新录像链接 */}
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        placeholder="输入录像链接（例如：https://...）"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddVideo();
                          }
                        }}
                        className="flex-1 min-w-0"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddVideo}
                        className="flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Button onClick={handleAddMatch} className="w-full bg-red-700 hover:bg-red-800">
                  保存比赛
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                <TabsTrigger value="attendance">出勤榜</TabsTrigger>
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

              <TabsContent value="attendance" className="space-y-4">
                <RankingCard
                  title="出勤榜"
                  players={topAttendance}
                  statKey="matchesPlayed"
                  statLabel="出场次数"
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-slate-500">加载中...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
      <div className="flex items-center gap-2 mb-2 text-slate-600 dark:text-slate-400">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</div>
    </div>
  );
}

function RankingCard({ 
  title, 
  players, 
  statKey, 
  statLabel 
}: { 
  title: string; 
  players: PlayerSeasonStats[]; 
  statKey: keyof PlayerSeasonStats; 
  statLabel: string; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-red-600 dark:text-red-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <p className="text-center text-slate-500 py-4">暂无数据</p>
        ) : (
          <div className="space-y-3">
            {players.map((player, index) => (
              <div
                key={player.playerId}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-slate-300 text-slate-900' :
                    index === 2 ? 'bg-amber-600 text-amber-100' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      #{player.playerNumber} {player.playerName}
                    </div>
                    <div className="text-xs text-slate-500">
                      出场 {player.matchesPlayed} 场
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {player[statKey]}
                  </div>
                  <div className="text-xs text-slate-500">{statLabel}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
