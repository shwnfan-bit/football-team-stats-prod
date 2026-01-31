'use client';

import { useState, useEffect } from 'react';
import { Plus, UserPlus, Trash2, Shield, Edit2, Camera, User } from 'lucide-react';
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    number: '',
    primaryPosition: 'midfielder' as PlayerPosition,
    secondaryPosition: null as PlayerPosition | null,
    birthday: '',
    height: '',
    weight: '',
    isCaptain: false,
    photo: '' as string,
  });

  useEffect(() => {
    initializeChengduDadieTeam();
    loadPlayers();
  }, []);

  const loadPlayers = () => {
    try {
      const teamId = getChengduDadieTeamId();
      const loadedPlayers = storage.getPlayersByTeam(teamId);
      console.log('加载到的球员数据:', loadedPlayers);
      
      // 过滤掉旧格式的数据（没有 birthday 字段的）
      const validPlayers = loadedPlayers.filter(p => p && p.birthday);
      console.log('有效的球员数据:', validPlayers);
      
      setPlayers(validPlayers);
    } catch (error) {
      console.error('加载球员数据失败:', error);
      setPlayers([]);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPlayer({ ...newPlayer, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPlayer = () => {
    console.log('开始添加球员:', newPlayer);
    
    // 验证必填字段
    if (!newPlayer.name.trim()) {
      alert('请输入球员姓名');
      return;
    }
    if (!newPlayer.number) {
      alert('请输入球衣号码');
      return;
    }
    if (!newPlayer.birthday) {
      alert('请选择生日');
      return;
    }
    if (!newPlayer.primaryPosition) {
      alert('请选择第一位置');
      return;
    }

    try {
      const teamId = getChengduDadieTeamId();
      const player: Player = {
        id: generateId(),
        teamId,
        name: newPlayer.name.trim(),
        number: parseInt(newPlayer.number),
        positions: [newPlayer.primaryPosition, newPlayer.secondaryPosition],
        birthday: newPlayer.birthday,
        height: newPlayer.height ? parseInt(newPlayer.height) : undefined,
        weight: newPlayer.weight ? parseInt(newPlayer.weight) : undefined,
        isCaptain: newPlayer.isCaptain,
        photo: newPlayer.photo || undefined,
        createdAt: Date.now(),
      };

      console.log('创建球员对象:', player);
      storage.addPlayer(player);
      console.log('球员已保存到存储');
      
      // 重新加载球员列表
      loadPlayers();
      
      setIsAddDialogOpen(false);
      resetForm();
      console.log('球员添加完成');
    } catch (error) {
      console.error('添加球员失败:', error);
      alert('添加球员失败: ' + (error as Error).message);
    }
  };

  const handleEditPlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setEditingPlayerId(playerId);
      setNewPlayer({
        name: player.name,
        number: player.number.toString(),
        primaryPosition: player.positions[0],
        secondaryPosition: player.positions[1],
        birthday: player.birthday,
        height: player.height?.toString() || '',
        weight: player.weight?.toString() || '',
        isCaptain: player.isCaptain || false,
        photo: player.photo || '',
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdatePlayer = () => {
    if (!editingPlayerId) return;

    console.log('开始更新球员:', newPlayer);
    
    // 验证必填字段
    if (!newPlayer.name.trim()) {
      alert('请输入球员姓名');
      return;
    }
    if (!newPlayer.number) {
      alert('请输入球衣号码');
      return;
    }
    if (!newPlayer.birthday) {
      alert('请选择生日');
      return;
    }
    if (!newPlayer.primaryPosition) {
      alert('请选择第一位置');
      return;
    }

    try {
      const teamId = getChengduDadieTeamId();
      const updatedPlayer: Player = {
        id: editingPlayerId,
        teamId,
        name: newPlayer.name.trim(),
        number: parseInt(newPlayer.number),
        positions: [newPlayer.primaryPosition, newPlayer.secondaryPosition],
        birthday: newPlayer.birthday,
        height: newPlayer.height ? parseInt(newPlayer.height) : undefined,
        weight: newPlayer.weight ? parseInt(newPlayer.weight) : undefined,
        isCaptain: newPlayer.isCaptain,
        photo: newPlayer.photo || undefined,
        createdAt: Date.now(),
      };

      console.log('更新球员对象:', updatedPlayer);
      storage.updatePlayer(editingPlayerId, updatedPlayer);
      console.log('球员已更新');
      
      // 重新加载球员列表
      loadPlayers();
      
      setIsEditDialogOpen(false);
      setEditingPlayerId(null);
      resetForm();
      console.log('球员更新完成');
    } catch (error) {
      console.error('更新球员失败:', error);
      alert('更新球员失败: ' + (error as Error).message);
    }
  };

  const resetForm = () => {
    setNewPlayer({
      name: '',
      number: '',
      primaryPosition: 'midfielder' as PlayerPosition,
      secondaryPosition: null as PlayerPosition | null,
      birthday: '',
      height: '',
      weight: '',
      isCaptain: false,
      photo: '' as string,
    });
  };

  const handleDeletePlayer = (playerId: string) => {
    if (confirm('确定要删除这个球员吗？')) {
      storage.deletePlayer(playerId);
      setPlayers(players.filter(p => p.id !== playerId));
    }
  };

  const groupedPlayers = players.reduce((acc, player) => {
    try {
      const primaryPos = player.positions && player.positions[0];
      if (!primaryPos) return acc;
      
      if (!acc[primaryPos]) {
        acc[primaryPos] = [];
      }
      acc[primaryPos].push(player);
      return acc;
    } catch (error) {
      console.error('分组球员时出错:', error, player);
      return acc;
    }
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
              <PlayerForm
                formData={newPlayer}
                setFormData={setNewPlayer}
                age={age}
                onSubmit={handleAddPlayer}
                submitLabel="添加球员"
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>编辑球员</DialogTitle>
              </DialogHeader>
              <PlayerForm
                formData={newPlayer}
                setFormData={setNewPlayer}
                age={age}
                onSubmit={handleUpdatePlayer}
                submitLabel="保存修改"
              />
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
                    try {
                      const playerAge = calculateAge(player.birthday || '');
                      const positionLabels = player.positions
                        .filter(p => p !== null)
                        .map(p => POSITION_LABELS[p as PlayerPosition])
                        .join(' / ');
                      
                      return (
                        <Card key={player.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-4 bg-gradient-to-r from-red-500 to-red-600">
                            <div className="flex flex-col items-center text-center">
                              <div className="relative mb-3">
                                {player.photo ? (
                                  <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-lg">
                                    <img
                                      src={player.photo}
                                      alt={player.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white text-red-600 font-bold text-3xl shadow-lg">
                                    {player.number}
                                  </div>
                                )}
                                {player.isCaptain && (
                                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                                    <Shield className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <CardTitle className="text-lg text-white">
                                {player.name}
                              </CardTitle>
                              <p className="text-sm text-red-100 mt-1">
                                {playerAge}岁 · #{player.number}
                              </p>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">位置</span>
                                <span className="font-medium">{positionLabels}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">身高</span>
                                <span className="font-medium">{player.height ? `${player.height}cm` : '-'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">体重</span>
                                <span className="font-medium">{player.weight ? `${player.weight}kg` : '-'}</span>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPlayer(player.id)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
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
                    } catch (error) {
                      console.error('渲染球员卡片时出错:', error, player);
                      return (
                        <Card key={player.id} className="border-red-300">
                          <CardContent className="p-4">
                            <p className="text-red-500">球员数据加载失败</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeletePlayer(player.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    }
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

// 球员表单组件
function PlayerForm({ formData, setFormData, age, onSubmit, submitLabel }: any) {
  return (
    <div className="space-y-4 pt-4">
      {/* 照片上传 */}
      <div className="space-y-2">
        <Label htmlFor="player-photo">球员照片</Label>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {formData.photo ? (
              <img
                src={formData.photo}
                alt="预览"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-slate-400" />
            )}
          </div>
          <div className="flex-1">
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Camera className="h-4 w-4" />
                <span className="text-sm">上传照片</span>
              </div>
            </Label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData({ ...formData, photo: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {formData.photo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 text-xs text-destructive"
                onClick={() => setFormData({ ...formData, photo: '' })}
              >
                删除照片
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="player-name">球员姓名 *</Label>
        <Input
          id="player-name"
          placeholder="例如：梅西"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="player-number">球衣号码 *</Label>
        <Input
          id="player-number"
          type="number"
          placeholder="10"
          value={formData.number}
          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="player-birthday">生日 *</Label>
        <Input
          id="player-birthday"
          type="date"
          value={formData.birthday}
          onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
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
            value={formData.primaryPosition} 
            onValueChange={(value: PlayerPosition) => setFormData({ ...formData, primaryPosition: value })}
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
            value={formData.secondaryPosition || 'none'} 
            onValueChange={(value: PlayerPosition | 'none') => 
              setFormData({ ...formData, secondaryPosition: value === 'none' ? null : value })
            }
          >
            <SelectTrigger id="player-secondary-position">
              <SelectValue placeholder="可选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">无</SelectItem>
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
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="player-weight">体重(kg)</Label>
          <Input
            id="player-weight"
            type="number"
            placeholder="70"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is-captain"
          checked={formData.isCaptain}
          onChange={(e) => setFormData({ ...formData, isCaptain: e.target.checked })}
        />
        <Label htmlFor="is-captain" className="cursor-pointer">队长</Label>
      </div>
      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}
