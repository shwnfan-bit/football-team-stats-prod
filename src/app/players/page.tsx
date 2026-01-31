'use client';

import { useState, useEffect } from 'react';
import { Plus, UserPlus, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { storage, generateId } from '@/lib/storage';
import { initializeChengduDadieTeam, getChengduDadieTeamId, calculateAge } from '@/lib/team';
import { Player, PlayerPosition, POSITION_LABELS } from '@/types';

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    number: '',
    primaryPosition: 'midfielder' as PlayerPosition,
    secondaryPosition: null as PlayerPosition | null,
    birthday: '',
    height: '',
    weight: '',
    isCaptain: false,
  });

  useEffect(() => {
    initializeChengduDadieTeam();
    loadPlayers();
  }, []);

  const loadPlayers = () => {
    const teamId = getChengduDadieTeamId();
    const loadedPlayers = storage.getPlayersByTeam(teamId);
    setPlayers(loadedPlayers);
  };

  const handleAddPlayer = () => {
    if (!newPlayer.name.trim() || !newPlayer.number || !newPlayer.birthday) return;

    const teamId = getChengduDadieTeamId();
    const player: Player = {
      id: generateId(),
      teamId,
      name: newPlayer.name,
      number: parseInt(newPlayer.number),
      positions: [newPlayer.primaryPosition, newPlayer.secondaryPosition],
      birthday: newPlayer.birthday,
      height: newPlayer.height ? parseInt(newPlayer.height) : undefined,
      weight: newPlayer.weight ? parseInt(newPlayer.weight) : undefined,
      isCaptain: newPlayer.isCaptain,
      createdAt: Date.now(),
    };

    storage.addPlayer(player);
    setPlayers([...players, player]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewPlayer({
      name: '',
      number: '',
      primaryPosition: 'midfielder',
      secondaryPosition: null,
      birthday: '',
      height: '',
      weight: '',
      isCaptain: false,
    });
  };

  const handleDeletePlayer = (playerId: string) => {
    if (confirm('确定要删除这个球员吗？')) {
      storage.deletePlayer(playerId);
      setPlayers(players.filter(p => p.id !== playerId));
    }
  };

  const groupedPlayers = players.reduce((acc, player) => {
    const primaryPos = player.positions[0];
    if (!acc[primaryPos]) {
      acc[primaryPos] = [];
    }
    acc[primaryPos].push(player);
    return acc;
  }, {} as Record<PlayerPosition, Player[]>);

  const age = newPlayer.birthday ? calculateAge(newPlayer.birthday) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-100 dark:from-red-950/20 dark:to-slate-900 pb-20 md:pb-0 pt-16 md:pt-16">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
            👥 球员管理
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            管理成都老爹队球员信息
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                添加球员
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>添加新球员</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="player-name">球员姓名 *</Label>
                  <Input
                    id="player-name"
                    placeholder="例如：梅西"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="player-number">球衣号码 *</Label>
                  <Input
                    id="player-number"
                    type="number"
                    placeholder="10"
                    value={newPlayer.number}
                    onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="player-birthday">生日 *</Label>
                  <Input
                    id="player-birthday"
                    type="date"
                    value={newPlayer.birthday}
                    onChange={(e) => setNewPlayer({ ...newPlayer, birthday: e.target.value })}
                  />
                  {age > 0 && (
                    <p className="text-xs text-muted-foreground">
                      年龄：{age} 岁
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="player-primary-position">第一位置 *</Label>
                    <Select 
                      value={newPlayer.primaryPosition} 
                      onValueChange={(value: PlayerPosition) => setNewPlayer({ ...newPlayer, primaryPosition: value })}
                    >
                      <SelectTrigger id="player-primary-position">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(POSITION_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="player-secondary-position">第二位置</Label>
                    <Select 
                      value={newPlayer.secondaryPosition || ''} 
                      onValueChange={(value: PlayerPosition | '') => 
                        setNewPlayer({ ...newPlayer, secondaryPosition: value || null })
                      }
                    >
                      <SelectTrigger id="player-secondary-position">
                        <SelectValue placeholder="可选" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">无</SelectItem>
                        {Object.entries(POSITION_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="player-height">身高(cm)</Label>
                    <Input
                      id="player-height"
                      type="number"
                      placeholder="175"
                      value={newPlayer.height}
                      onChange={(e) => setNewPlayer({ ...newPlayer, height: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="player-weight">体重(kg)</Label>
                    <Input
                      id="player-weight"
                      type="number"
                      placeholder="70"
                      value={newPlayer.weight}
                      onChange={(e) => setNewPlayer({ ...newPlayer, weight: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-captain"
                    checked={newPlayer.isCaptain}
                    onChange={(e) => setNewPlayer({ ...newPlayer, isCaptain: e.target.checked })}
                  />
                  <Label htmlFor="is-captain" className="cursor-pointer">队长</Label>
                </div>
                <Button onClick={handleAddPlayer} className="w-full">
                  添加球员
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Players List */}
        {players.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserPlus className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                暂无球员
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md mb-4">
                点击添加按钮创建第一个球员
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPlayers).map(([position, positionPlayers]) => (
              <div key={position}>
                <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300">
                  {POSITION_LABELS[position as PlayerPosition]} ({positionPlayers.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {positionPlayers.map((player) => {
                    const playerAge = calculateAge(player.birthday);
                    const positionLabels = player.positions
                      .filter(p => p !== null)
                      .map(p => POSITION_LABELS[p])
                      .join(' / ');
                    
                    return (
                      <Card key={player.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3 bg-gradient-to-r from-red-500 to-red-600">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white text-red-600 font-bold text-xl shadow-lg">
                                {player.number}
                              </div>
                              <div className="text-white">
                                <CardTitle className="text-base flex items-center gap-2">
                                  {player.name}
                                  {player.isCaptain && (
                                    <Shield className="h-4 w-4 text-yellow-300" />
                                  )}
                                </CardTitle>
                                <p className="text-xs text-red-100 mt-1">
                                  {playerAge}岁
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">位置</span>
                              <span className="font-medium">{positionLabels}</span>
                            </div>
                            {player.height && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">身高</span>
                                <span className="font-medium">{player.height}cm</span>
                              </div>
                            )}
                            {player.weight && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">体重</span>
                                <span className="font-medium">{player.weight}kg</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">生日</span>
                              <span className="font-medium">{new Date(player.birthday).toLocaleDateString('zh-CN')}</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeletePlayer(player.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
