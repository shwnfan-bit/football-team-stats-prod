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
  const [formData, setFormData] = useState({
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
      
      // 兼容新旧数据格式
      const validPlayers = loadedPlayers.map(p => {
        if (p && (p as any).positions) {
          // 旧格式：转换 positions[0] 为 position
          const oldPlayer = p as any;
          return {
            ...p,
            position: oldPlayer.positions[0] || 'midfielder',
          } as Player;
        }
        return p;
      }).filter(p => p && p.birthday);
      
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
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
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

  const handleAddPlayer = () => {
    console.log('开始添加球员:', formData);
    
    // 验证必填字段
    if (!formData.name.trim()) {
      alert('请输入球员姓名');
      return;
    }
    if (!formData.number) {
      alert('请输入球衣号码');
      return;
    }
    if (!formData.birthday) {
      alert('请选择生日');
      return;
    }
    if (!formData.position) {
      alert('请选择位置');
      return;
    }

    try {
      const teamId = getChengduDadieTeamId();
      const player: Player = {
        id: generateId(),
        teamId,
        name: formData.name.trim(),
        number: parseInt(formData.number),
        position: formData.position,
        birthday: formData.birthday,
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        isCaptain: formData.isCaptain,
        photo: formData.photo || undefined,
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
      setFormData({
        name: player.name,
        number: player.number.toString(),
        position: player.position,
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

    console.log('开始更新球员:', formData);
    
    // 验证必填字段
    if (!formData.name.trim()) {
      alert('请输入球员姓名');
      return;
    }
    if (!formData.number) {
      alert('请输入球衣号码');
      return;
    }
    if (!formData.birthday) {
      alert('请选择生日');
      return;
    }
    if (!formData.position) {
      alert('请选择位置');
      return;
    }

    try {
      const teamId = getChengduDadieTeamId();
      const updatedPlayer: Player = {
        id: editingPlayerId,
        teamId,
        name: formData.name.trim(),
        number: parseInt(formData.number),
        position: formData.position,
        birthday: formData.birthday,
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        isCaptain: formData.isCaptain,
        photo: formData.photo || undefined,
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
    if (confirm('确定要删除该球员吗？')) {
      try {
        storage.deletePlayer(playerId);
        loadPlayers();
      } catch (error) {
        console.error('删除球员失败:', error);
        alert('删除球员失败');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">球员管理</h1>
            <p className="text-gray-600">管理成都老爹队的球员信息</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                添加球员
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>添加新球员</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* 照片上传 */}
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-40 bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-300">
                    {formData.photo ? (
                      <img src={formData.photo} alt="预览" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <User className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span className="flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          上传照片
                        </span>
                      </Button>
                    </Label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500 mt-2">支持 JPG、PNG 格式</p>
                  </div>
                </div>

                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="player-name">姓名 *</Label>
                    <Input
                      id="player-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="请输入姓名"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="player-number">号码 *</Label>
                    <Input
                      id="player-number"
                      type="number"
                      min="1"
                      max="99"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      placeholder="1-99"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player-position">位置 *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value: PlayerPosition) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger id="player-position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(POSITION_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="player-birthday">生日 *</Label>
                    <Input
                      id="player-birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="player-height">身高 (cm)</Label>
                    <Input
                      id="player-height"
                      type="number"
                      min="150"
                      max="220"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="150-220"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player-weight">体重 (kg)</Label>
                  <Input
                    id="player-weight"
                    type="number"
                    min="40"
                    max="120"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="40-120"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-captain"
                    checked={formData.isCaptain}
                    onChange={(e) => setFormData({ ...formData, isCaptain: e.target.checked })}
                    className="w-4 h-4 border-gray-300 rounded text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="is-captain" className="cursor-pointer flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    设为队长
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  取消
                </Button>
                <Button onClick={handleAddPlayer} className="bg-red-600 hover:bg-red-700">
                  添加球员
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 球员卡片网格 */}
        {players.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无球员</h3>
            <p className="text-gray-500">点击上方按钮添加第一个球员</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {players.map((player) => {
              const age = calculateAge(player.birthday);
              return (
                <Card key={player.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-red-600 aspect-[5/4] relative">
                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <User className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    {player.isCaptain && (
                      <div className="absolute top-2 right-2 bg-yellow-500 p-1.5 rounded-full">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4 bg-white">
                    <div className="text-center mb-3">
                      <p className="font-bold text-lg text-gray-900">#{player.number}</p>
                      <h3 className="font-semibold text-lg text-gray-900 mt-1">{player.name}</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>位置:</span>
                        <span className="font-medium">{POSITION_LABELS[player.position]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>年龄:</span>
                        <span className="font-medium">{age}岁</span>
                      </div>
                      {player.height && player.weight && (
                        <div className="flex justify-between">
                          <span>身高/体重:</span>
                          <span className="font-medium">{player.height}cm / {player.weight}kg</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-gray-700 hover:text-red-600"
                        onClick={() => handleEditPlayer(player.id)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-700 hover:text-red-600"
                        onClick={() => handleDeletePlayer(player.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 编辑球员对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑球员</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* 照片上传 */}
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-40 bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-300">
                {formData.photo ? (
                  <img src={formData.photo} alt="预览" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="edit-photo-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      更换照片
                    </span>
                  </Button>
                </Label>
                <input
                  id="edit-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">支持 JPG、PNG 格式</p>
              </div>
            </div>

            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-player-name">姓名 *</Label>
                <Input
                  id="edit-player-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入姓名"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-player-number">号码 *</Label>
                <Input
                  id="edit-player-number"
                  type="number"
                  min="1"
                  max="99"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="1-99"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-player-position">位置 *</Label>
              <Select
                value={formData.position}
                onValueChange={(value: PlayerPosition) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger id="edit-player-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(POSITION_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-player-birthday">生日 *</Label>
                <Input
                  id="edit-player-birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-player-height">身高 (cm)</Label>
                <Input
                  id="edit-player-height"
                  type="number"
                  min="150"
                  max="220"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="150-220"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-player-weight">体重 (kg)</Label>
              <Input
                id="edit-player-weight"
                type="number"
                min="40"
                max="120"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="40-120"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-is-captain"
                checked={formData.isCaptain}
                onChange={(e) => setFormData({ ...formData, isCaptain: e.target.checked })}
                className="w-4 h-4 border-gray-300 rounded text-red-600 focus:ring-red-500"
              />
              <Label htmlFor="edit-is-captain" className="cursor-pointer flex items-center gap-2">
                <Shield className="w-4 h-4" />
                设为队长
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingPlayerId(null);
                resetForm();
              }}
            >
              取消
            </Button>
            <Button onClick={handleUpdatePlayer} className="bg-red-600 hover:bg-red-700">
              保存修改
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
