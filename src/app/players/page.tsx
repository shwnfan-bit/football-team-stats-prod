'use client';

import { useState, useEffect } from 'react';
import { Plus, UserPlus, Trash2, Shield, Edit2, Camera, User, Settings, Database, Download } from 'lucide-react';
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
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [isStorageManageDialogOpen, setIsStorageManageDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    number: '',
    position: 'midfielder' as PlayerPosition,
    birthday: '',
    height: '',
    weight: '',
    isCaptain: false,
    photo: '' as string,
  });

  useEffect(() => {
    (async () => {
      await initializeChengduDadieTeam();
      await loadPlayers();
    })();
  }, []);

  const loadPlayers = () => {
    try {
      const teamId = getChengduDadieTeamId();
      const loadedPlayers = storage.getPlayersByTeam(teamId);
      console.log('加载到的球员数据:', loadedPlayers);
      
      // 过滤掉旧格式的数据（没有 birthday 字段或没有 position 字段的）
      const validPlayers = loadedPlayers.filter(p => {
        if (!p.birthday) return false;
        // 检查是否有 position 字段（新格式）
        // 使用类型断言来检查可能存在的字段
        const playerAny = p as any;
        return playerAny.position !== undefined || playerAny.positions !== undefined;
      });
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

  const handleAddPlayer = async () => {
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
    if (!newPlayer.position) {
      alert('请选择位置');
      return;
    }

    try {
      const teamId = getChengduDadieTeamId();
      const playerData = {
        teamId,
        name: newPlayer.name.trim(),
        number: parseInt(newPlayer.number),
        position: newPlayer.position,
        birthday: newPlayer.birthday,
        height: newPlayer.height ? parseInt(newPlayer.height) : undefined,
        weight: newPlayer.weight ? parseInt(newPlayer.weight) : undefined,
        isCaptain: newPlayer.isCaptain,
        photo: newPlayer.photo || undefined,
      };

      console.log('创建球员对象:', playerData);
      await storage.addPlayer(playerData);
      console.log('球员已保存到存储');
      
      // 重新加载球员列表
      await loadPlayers();
      
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
        position: player.position || 'midfielder',
        birthday: player.birthday,
        height: player.height?.toString() || '',
        weight: player.weight?.toString() || '',
        isCaptain: player.isCaptain || false,
        photo: player.photo || '',
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdatePlayer = async () => {
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
    if (!newPlayer.position) {
      alert('请选择位置');
      return;
    }

    try {
      const teamId = getChengduDadieTeamId();
      const updatedPlayerData = {
        teamId,
        name: newPlayer.name.trim(),
        number: parseInt(newPlayer.number),
        position: newPlayer.position,
        birthday: newPlayer.birthday,
        height: newPlayer.height ? parseInt(newPlayer.height) : undefined,
        weight: newPlayer.weight ? parseInt(newPlayer.weight) : undefined,
        isCaptain: newPlayer.isCaptain,
        photo: newPlayer.photo || undefined,
      };

      console.log('更新球员对象:', updatedPlayerData);
      await storage.updatePlayer(editingPlayerId, updatedPlayerData);
      console.log('球员已更新');
      
      // 重新加载球员列表
      await loadPlayers();
      
      setIsEditDialogOpen(false);
      setEditingPlayerId(null);
      resetForm();
      console.log('球员更新完成');
    } catch (error) {
      console.error('更新球员失败:', error);
      alert('更新球员失败: ' + (error as Error).message);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (confirm('确定要删除这个球员吗？')) {
      try {
        await storage.deletePlayer(playerId);
        await loadPlayers();
      } catch (error) {
        console.error('删除球员失败:', error);
        alert('删除球员失败: ' + (error as Error).message);
      }
    }
  };

  const resetForm = () => {
    setNewPlayer({
      name: '',
      number: '',
      position: 'midfielder' as PlayerPosition,
      birthday: '',
      height: '',
      weight: '',
      isCaptain: false,
      photo: '',
    });
  };

  // 数据管理功能
  const getStorageInfo = () => {
    if (typeof window === 'undefined') return null;

    const info = {
      players: {
        count: storage.getPlayers().length,
        size: new Blob([localStorage.getItem('football_players') || '']).size,
      },
      matches: {
        count: storage.getMatches().length,
        size: new Blob([localStorage.getItem('football_matches') || '']).size,
      },
      teams: {
        count: storage.getTeams().length,
        size: new Blob([localStorage.getItem('football_teams') || '']).size,
      },
      seasons: {
        count: storage.getSeasons().length,
        size: new Blob([localStorage.getItem('football_seasons') || '']).size,
      },
    };

    const totalSize = Object.values(info).reduce((sum, item) => sum + item.size, 0);
    return { ...info, totalSize };
  };

  const handleExportData = () => {
    try {
      const data = {
        players: storage.getPlayers(),
        matches: storage.getMatches(),
        teams: storage.getTeams(),
        seasons: storage.getSeasons(),
        exportTime: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `football-data-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      alert('数据导出成功！');
    } catch (error) {
      console.error('导出数据失败:', error);
      alert('导出数据失败: ' + (error as Error).message);
    }
  };

  const handleClearAllData = async () => {
    if (confirm('确定要清理所有数据吗？此操作不可恢复！\n\n建议先导出数据备份。')) {
      try {
        localStorage.clear();
        alert('所有数据已清理！');
        // 重新初始化
        await initializeChengduDadieTeam();
        await loadPlayers();
        setIsStorageManageDialogOpen(false);
      } catch (error) {
        console.error('清理数据失败:', error);
        alert('清理数据失败: ' + (error as Error).message);
      }
    }
  };

  const handleClearOldMatches = async () => {
    const teamId = getChengduDadieTeamId();
    const matches = await storage.getMatchesByTeam(teamId);
    if (matches.length === 0) {
      alert('没有比赛记录可以清理');
      return;
    }

    if (confirm(`确定要删除所有 ${matches.length} 场比赛记录吗？此操作不可恢复！`)) {
      try {
        await Promise.all(matches.map(match => storage.deleteMatch(match.id)));
        alert('比赛记录已清理！');
        await loadPlayers();
        setIsStorageManageDialogOpen(false);
      } catch (error) {
        console.error('清理比赛记录失败:', error);
        alert('清理比赛记录失败: ' + (error as Error).message);
      }
    }
  };

  // 按照号码排序球员
  const sortedPlayers = [...players].sort((a, b) => a.number - b.number);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-red-700 dark:bg-red-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
            <UserPlus className="w-10 h-10 md:w-12 md:h-12" />
            球员管理
          </h1>
          <p className="text-lg md:text-xl opacity-90">成都老爹队 - 球员阵容</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 添加球员和管理球员按钮 */}
        <div className="mb-8 flex gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-700 hover:bg-red-800 text-white flex-1 md:flex-none">
                <Plus className="w-5 h-5 mr-2" />
                添加球员
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>添加新球员</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="add-name">姓名 *</Label>
                  <Input
                    id="add-name"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    placeholder="请输入球员姓名"
                  />
                </div>
                <div>
                  <Label htmlFor="add-number">球衣号码 *</Label>
                  <Input
                    id="add-number"
                    type="number"
                    value={newPlayer.number}
                    onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                    placeholder="请输入球衣号码"
                  />
                </div>
                <div>
                  <Label htmlFor="add-position">位置 *</Label>
                  <Select
                    value={newPlayer.position}
                    onValueChange={(value: PlayerPosition) => setNewPlayer({ ...newPlayer, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择位置" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goalkeeper">门将</SelectItem>
                      <SelectItem value="defender">后卫</SelectItem>
                      <SelectItem value="midfielder">中场</SelectItem>
                      <SelectItem value="forward">前锋</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="add-birthday">生日 *</Label>
                  <Input
                    id="add-birthday"
                    type="date"
                    value={newPlayer.birthday}
                    onChange={(e) => setNewPlayer({ ...newPlayer, birthday: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-height">身高 (cm)</Label>
                    <Input
                      id="add-height"
                      type="number"
                      value={newPlayer.height}
                      onChange={(e) => setNewPlayer({ ...newPlayer, height: e.target.value })}
                      placeholder="可选"
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-weight">体重 (kg)</Label>
                    <Input
                      id="add-weight"
                      type="number"
                      value={newPlayer.weight}
                      onChange={(e) => setNewPlayer({ ...newPlayer, weight: e.target.value })}
                      placeholder="可选"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="add-photo">照片</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="add-photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="flex-1"
                    />
                    {newPlayer.photo && (
                      <div className="w-16 h-16 rounded overflow-hidden border">
                        <img src={newPlayer.photo} alt="预览" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="add-captain"
                    checked={newPlayer.isCaptain}
                    onChange={(e) => setNewPlayer({ ...newPlayer, isCaptain: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="add-captain" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    设为队长
                  </Label>
                </div>
                <Button onClick={handleAddPlayer} className="w-full bg-red-700 hover:bg-red-800">
                  添加球员
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* 管理球员按钮 */}
          <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-none">
                <Settings className="w-5 h-5 mr-2" />
                管理球员
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>管理球员</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                {sortedPlayers.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">暂无球员</p>
                ) : (
                  sortedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        {player.photo ? (
                          <img
                            src={player.photo}
                            alt={player.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                            <User className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            #{player.number} {player.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {POSITION_LABELS[player.position]} {player.isCaptain && '(队长)'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsManageDialogOpen(false);
                            handleEditPlayer(player.id);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={async () => {
                            if (confirm(`确定要删除 ${player.name} 吗？`)) {
                              await storage.deletePlayer(player.id);
                              await loadPlayers();
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* 数据管理按钮 */}
          <Dialog open={isStorageManageDialogOpen} onOpenChange={setIsStorageManageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-none">
                <Database className="w-5 h-5 mr-2" />
                数据管理
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>数据管理</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* 存储使用情况 */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-sm mb-3">存储使用情况</h3>
                  {(() => {
                    const storageInfo = getStorageInfo();
                    if (!storageInfo) return null;
                    const formatSize = (bytes: number) => {
                      if (bytes < 1024) return bytes + ' B';
                      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
                      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
                    };
                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">球员数据：</span>
                          <span className="font-medium">{storageInfo.players.count} 个 ({formatSize(storageInfo.players.size)})</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">比赛记录：</span>
                          <span className="font-medium">{storageInfo.matches.count} 场 ({formatSize(storageInfo.matches.size)})</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">球队信息：</span>
                          <span className="font-medium">{storageInfo.teams.count} 个 ({formatSize(storageInfo.teams.size)})</span>
                        </div>
                        <div className="flex justify-between text-sm border-t pt-2 mt-2">
                          <span className="font-semibold">总计：</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">{formatSize(storageInfo.totalSize)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* 提示信息 */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    ⚠️ 浏览器的存储空间有限（通常 5-10MB）。如果存储已满，请清理旧数据或导出备份后清理全部数据。
                  </p>
                </div>

                {/* 操作按钮 */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleExportData}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    导出数据备份
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                    onClick={handleClearOldMatches}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    清理所有比赛记录
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={handleClearAllData}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    清理全部数据
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 球员列表 */}
        {sortedPlayers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <User className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">还没有球员</p>
              <p className="text-slate-500 dark:text-slate-500">点击上方"添加球员"按钮开始添加</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedPlayers.map((player) => {
              const age = calculateAge(player.birthday);
              return (
                <Card key={player.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* 球员照片 - 5:4 比例，无圆角，占满红色区域 */}
                  <div
                    className="relative w-full pt-[80%] bg-red-700 dark:bg-red-800"
                    style={{ aspectRatio: '5/4' }}
                  >
                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt={player.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-700 dark:bg-red-800">
                        <User className="w-24 h-24 text-red-600/50 dark:text-red-900/50" />
                      </div>
                    )}
                    {/* 队长标识 */}
                    {player.isCaptain && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1.5 rounded-full">
                        <Shield className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-3">
                    {/* 姓名和号码在一排显示 */}
                    <div className="flex justify-between items-center">
                      {/* 球员姓名 - 靠左 */}
                      <div className="text-2xl font-bold">
                        {player.name}
                      </div>
                      {/* 球员号码 - 靠右，去除"#"号 */}
                      <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                        {player.number}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 编辑球员对话框 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>编辑球员</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">姓名 *</Label>
                <Input
                  id="edit-name"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  placeholder="请输入球员姓名"
                />
              </div>
              <div>
                <Label htmlFor="edit-number">球衣号码 *</Label>
                <Input
                  id="edit-number"
                  type="number"
                  value={newPlayer.number}
                  onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                  placeholder="请输入球衣号码"
                />
              </div>
              <div>
                <Label htmlFor="edit-position">位置 *</Label>
                <Select
                  value={newPlayer.position}
                  onValueChange={(value: PlayerPosition) => setNewPlayer({ ...newPlayer, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择位置" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goalkeeper">门将</SelectItem>
                    <SelectItem value="defender">后卫</SelectItem>
                    <SelectItem value="midfielder">中场</SelectItem>
                    <SelectItem value="forward">前锋</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-birthday">生日 *</Label>
                <Input
                  id="edit-birthday"
                  type="date"
                  value={newPlayer.birthday}
                  onChange={(e) => setNewPlayer({ ...newPlayer, birthday: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-height">身高 (cm)</Label>
                  <Input
                    id="edit-height"
                    type="number"
                    value={newPlayer.height}
                    onChange={(e) => setNewPlayer({ ...newPlayer, height: e.target.value })}
                    placeholder="可选"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-weight">体重 (kg)</Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    value={newPlayer.weight}
                    onChange={(e) => setNewPlayer({ ...newPlayer, weight: e.target.value })}
                    placeholder="可选"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-photo">照片</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="flex-1"
                  />
                  {newPlayer.photo && (
                    <div className="w-16 h-16 rounded overflow-hidden border">
                      <img src={newPlayer.photo} alt="预览" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-captain"
                  checked={newPlayer.isCaptain}
                  onChange={(e) => setNewPlayer({ ...newPlayer, isCaptain: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="edit-captain" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  设为队长
                </Label>
              </div>
              <Button onClick={handleUpdatePlayer} className="w-full bg-red-700 hover:bg-red-800">
                更新球员
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
