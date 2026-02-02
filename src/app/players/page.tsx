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
    position: 'midfielder' as PlayerPosition,
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
      
      // 过滤掉旧格式的数据（没有 birthday 字段或使用了旧位置格式）
      const validPlayers = loadedPlayers.filter(p => {
        if (!p.birthday) return false;
        // 检查是否有 position 字段（新格式）
        return p.position !== undefined;
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
    if (!newPlayer.position) {
      alert('请选择位置');
      return;
    }

    try {
      const teamId = getChengduDadieTeamId();
      const player: Player = {
        id: generateId(),
        teamId,
        name: newPlayer.name.trim(),
        number: parseInt(newPlayer.number),
        position: newPlayer.position,
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
    if (!newPlayer.position) {
      alert('请选择位置');
      return;
    }

    try {
      const teamId = getChengduDadieTeamId();
      const updatedPlayer: Player = {
        id: editingPlayerId,
        teamId,
        name: newPlayer.name.trim(),
        number: parseInt(newPlayer.number),
        position: newPlayer.position,
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

  const handleDeletePlayer = (playerId: string) => {
    if (confirm('确定要删除这个球员吗？')) {
      try {
        storage.deletePlayer(playerId);
        loadPlayers();
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
        {/* 添加球员按钮 */}
        <div className="mb-8">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-700 hover:bg-red-800 text-white w-full md:w-auto">
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

                  <CardContent className="p-4">
                    {/* 球员号码 - 放大显示 */}
                    <div className="text-4xl font-bold text-red-700 dark:text-red-400 mb-1">
                      #{player.number}
                    </div>
                    
                    {/* 球员姓名 - 放大显示 */}
                    <div className="text-3xl font-bold mb-1">
                      {player.name}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditPlayer(player.id)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => handleDeletePlayer(player.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        删除
                      </Button>
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
