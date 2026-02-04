'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Home, Plane, Trophy, Target, Award, ChevronDown, ChevronUp, Edit2, User, Video, X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { storage } from '@/lib/storage';
import { initializeChengduDadieTeam, getChengduDadieTeamId } from '@/lib/team';
import { Match, Player, PlayerPosition, POSITION_LABELS } from '@/types';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [editNewVideoUrl, setEditNewVideoUrl] = useState('');
  const [editMatch, setEditMatch] = useState({
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
      await loadMatches();
      await loadPlayers();
    })();
  }, []);

  const loadMatches = async () => {
    try {
      const teamId = getChengduDadieTeamId();
      const loadedMatches = await storage.getMatchesByTeam(teamId);
      // 按日期降序排列（最新的在前）
      const sortedMatches = loadedMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMatches(sortedMatches);
    } catch (error) {
      console.error('加载比赛数据失败:', error);
      setMatches([]);
    }
  };

  const loadPlayers = async () => {
    try {
      const teamId = getChengduDadieTeamId();
      const loadedPlayers = await storage.getPlayersByTeam(teamId);
      setPlayers(loadedPlayers);
    } catch (error) {
      console.error('加载球员数据失败:', error);
      setPlayers([]);
    }
  };

  const getMatchTypeLabel = (matchType: 'home' | 'away') => {
    return matchType === 'home' ? '主场' : '客场';
  };

  const getMatchTypeColor = (matchType: 'home' | 'away') => {
    return matchType === 'home' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const getMatchNatureLabel = (nature: 'friendly' | 'internal' | 'cup' | 'league') => {
    const labels = {
      friendly: '友谊赛',
      internal: '队内赛',
      cup: '杯赛',
      league: '联赛',
    };
    return labels[nature];
  };

  const getMatchNatureColor = (nature: 'friendly' | 'internal' | 'cup' | 'league') => {
    const colors = {
      friendly: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
      internal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      cup: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      league: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[nature];
  };

  const getMatchResult = (match: Match) => {
    if (match.scoreHome > match.scoreAway) {
      return { text: '胜', color: 'bg-green-600' };
    } else if (match.scoreHome < match.scoreAway) {
      return { text: '负', color: 'bg-red-600' };
    } else {
      return { text: '平', color: 'bg-yellow-600' };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleEditMatch = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    setEditingMatchId(matchId);
    
    // 转换 playerStats 为表单格式
    const playerStatsMap: Record<string, { isPlaying: boolean; goals: number; assists: number }> = {};
    match.playerStats.forEach(ps => {
      playerStatsMap[ps.playerId] = {
        isPlaying: ps.isPlaying,
        goals: ps.goals,
        assists: ps.assists,
      };
    });

    setEditMatch({
      opponent: match.opponent,
      date: match.date,
      location: match.location || '',
      matchType: match.matchType,
      matchNature: match.matchNature,
      scoreHome: match.score.home,
      scoreAway: match.score.away,
      playerStats: playerStatsMap,
      videos: match.videos || [],
    });
    
    setIsEditDialogOpen(true);
  };

  const handlePlayerToggle = (playerId: string) => {
    setEditMatch(prev => ({
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
    setEditMatch(prev => ({
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

  const handleEditAddVideo = () => {
    if (!editNewVideoUrl.trim()) return;
    setEditMatch(prev => ({
      ...prev,
      videos: [...prev.videos, editNewVideoUrl.trim()],
    }));
    setEditNewVideoUrl('');
  };

  const handleEditRemoveVideo = (index: number) => {
    setEditMatch(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateMatch = async () => {
    if (!editingMatchId) return;

    if (!editMatch.opponent.trim() || !editMatch.date) {
      alert('请填写完整的比赛信息');
      return;
    }

    try {
      // 更新比赛基本信息
      const updatedMatchData = {
        opponent: editMatch.opponent.trim(),
        date: editMatch.date,
        location: editMatch.location || undefined,
        matchType: editMatch.matchType,
        matchNature: editMatch.matchNature,
        scoreHome: editMatch.scoreHome,
        scoreAway: editMatch.scoreAway,
        status: 'completed' as const,
        videos: editMatch.videos,
      };

      await storage.updateMatch(editingMatchId, updatedMatchData);

      // 删除旧的球员统计，然后添加新的
      const teamId = getChengduDadieTeamId();
      
      // 构建新的球员统计数据
      const matchPlayerStats = Object.entries(editMatch.playerStats)
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

      // 删除旧的球员统计
      await storage.deleteMatchPlayerStats(editingMatchId);
      
      // 添加新的球员统计
      for (const stat of matchPlayerStats) {
        await storage.addMatchPlayerStat(editingMatchId, stat);
      }
      
      await loadMatches();
      setIsEditDialogOpen(false);
      setEditingMatchId(null);
    } catch (error) {
      console.error('更新比赛失败:', error);
      alert('更新比赛失败: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-20 md:pb-0 pt-16 md:pt-16">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
            比赛记录
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            成都老爹队 - 比赛历史数据
          </p>
        </div>

        {/* 比赛列表 */}
        {matches.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">还没有比赛记录</p>
              <p className="text-slate-500 dark:text-slate-500">
                请在"统计"页面录入比赛数据
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const result = getMatchResult(match);
              const isExpanded = expandedMatchId === match.id;

              return (
                <Card key={match.id} className="overflow-hidden">
                  {/* 比赛基本信息 */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                  >
                    <div className="flex items-center justify-between">
                      {/* 左侧：比分和结果 */}
                      <div className="flex items-center gap-3">
                        {/* 结果徽章 */}
                        <div className={`${result.color} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                          {result.text}
                        </div>
                        
                        {/* 比分 */}
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-red-700 dark:text-red-400">
                            {match.scoreHome}
                          </span>
                          <span className="text-slate-400">:</span>
                          <span className="text-2xl font-bold">
                            {match.scoreAway}
                          </span>
                        </div>
                      </div>

                      {/* 中间：对手信息 */}
                      <div className="flex-1 text-center">
                        <div className="text-lg font-bold">{match.opponent}</div>
                        <div className="text-sm text-slate-500">{formatDate(match.date)}</div>
                      </div>

                      {/* 右侧：比赛类型 */}
                      <div className="flex items-center gap-2">
                        <Badge className={getMatchTypeColor(match.matchType)}>
                          {match.matchType === 'home' ? (
                            <Home className="w-3 h-3 mr-1" />
                          ) : (
                            <Plane className="w-3 h-3 mr-1" />
                          )}
                          {getMatchTypeLabel(match.matchType)}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* 第二行：比赛性质和地点 */}
                    <div className="mt-3 flex items-center justify-center gap-4 text-sm">
                      <Badge className={getMatchNatureColor(match.matchNature)}>
                        <Trophy className="w-3 h-3 mr-1" />
                        {getMatchNatureLabel(match.matchNature)}
                      </Badge>
                      {match.location && (
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4" />
                          {match.location}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMatch(match.id);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 展开的详细信息 */}
                  {isExpanded && (
                    <div className="border-t p-4 bg-slate-50 dark:bg-slate-800/50">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-red-600 dark:text-red-400" />
                        球员数据
                      </h3>
                      
                      {match.playerStats.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">暂无球员数据</p>
                      ) : (
                        <div className="grid gap-2">
                          {match.playerStats
                            .filter(ps => ps.isPlaying && (ps.goals > 0 || ps.assists > 0))
                            .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
                            .map((ps) => (
                              <div
                                key={ps.playerId}
                                className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg border"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">#{ps.playerNumber}</span>
                                  <span>{ps.playerName}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {ps.goals > 0 && (
                                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                      <Target className="w-4 h-4" />
                                      <span className="font-bold">{ps.goals}</span>
                                    </div>
                                  )}
                                  {ps.assists > 0 && (
                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                      <Award className="w-4 h-4" />
                                      <span className="font-bold">{ps.assists}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          
                          {match.playerStats.filter(ps => ps.isPlaying).length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">
                              没有球员上场
                            </p>
                          )}
                        </div>
                      )}

                      {/* 比赛录像 */}
                      {match.videos && match.videos.length > 0 && (
                        <div className="mt-4">
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Video className="w-5 h-5 text-red-600 dark:text-red-400" />
                            比赛录像
                          </h3>
                          <div className="space-y-2">
                            {match.videos.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors overflow-hidden min-w-0"
                              >
                                <Video className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                <span className="flex-1 text-sm text-blue-600 dark:text-blue-400 truncate min-w-0">
                                  录像 {index + 1}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 编辑比赛对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑比赛</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-opponent">对手 *</Label>
                <Input
                  id="edit-opponent"
                  value={editMatch.opponent}
                  onChange={(e) => setEditMatch({ ...editMatch, opponent: e.target.value })}
                  placeholder="请输入对手名称"
                />
              </div>
              <div>
                <Label htmlFor="edit-date">日期 *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editMatch.date}
                  onChange={(e) => setEditMatch({ ...editMatch, date: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-location">地点</Label>
              <Input
                id="edit-location"
                value={editMatch.location}
                onChange={(e) => setEditMatch({ ...editMatch, location: e.target.value })}
                placeholder="请输入比赛地点"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">类型</Label>
                <Select
                  value={editMatch.matchType}
                  onValueChange={(value: 'home' | 'away') => setEditMatch({ ...editMatch, matchType: value })}
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
                <Label htmlFor="edit-nature">性质</Label>
                <Select
                  value={editMatch.matchNature}
                  onValueChange={(value: 'friendly' | 'internal' | 'cup' | 'league') => setEditMatch({ ...editMatch, matchNature: value })}
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
                <Label htmlFor="edit-score-home">我方进球 *</Label>
                <Input
                  id="edit-score-home"
                  type="number"
                  min="0"
                  value={editMatch.scoreHome}
                  onChange={(e) => setEditMatch({ ...editMatch, scoreHome: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-score-away">对方进球 *</Label>
                <Input
                  id="edit-score-away"
                  type="number"
                  min="0"
                  value={editMatch.scoreAway}
                  onChange={(e) => setEditMatch({ ...editMatch, scoreAway: parseInt(e.target.value) || 0 })}
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
                          checked={editMatch.playerStats[player.id]?.isPlaying || false}
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
                        {editMatch.playerStats[player.id]?.isPlaying && (
                          <>
                            <div className="flex items-center gap-1">
                              <Label htmlFor={`edit-goals-${player.id}`} className="text-xs">进球</Label>
                              <Input
                                id={`edit-goals-${player.id}`}
                                type="number"
                                min="0"
                                value={editMatch.playerStats[player.id]?.goals || 0}
                                onChange={(e) => handlePlayerStatChange(player.id, 'goals', parseInt(e.target.value) || 0)}
                                className="w-16 h-8"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Label htmlFor={`edit-assists-${player.id}`} className="text-xs">助攻</Label>
                              <Input
                                id={`edit-assists-${player.id}`}
                                type="number"
                                min="0"
                                value={editMatch.playerStats[player.id]?.assists || 0}
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
                {editMatch.videos.length > 0 && (
                  <div className="space-y-2">
                    {editMatch.videos.map((url, index) => (
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
                          onClick={() => handleEditRemoveVideo(index)}
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
                    value={editNewVideoUrl}
                    onChange={(e) => setEditNewVideoUrl(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleEditAddVideo();
                      }
                    }}
                    className="flex-1 min-w-0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEditAddVideo}
                    className="flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Button onClick={handleUpdateMatch} className="w-full bg-red-700 hover:bg-red-800">
              保存修改
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
