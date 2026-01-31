import { Team, storage, generateId } from './storage';

const CHENGDU_DADIE_TEAM_ID = 'chengdu-dadie-team';

// 成都老爹队固定数据
export const CHENGDU_DADIE_TEAM: Team = {
  id: CHENGDU_DADIE_TEAM_ID,
  name: '成都老爹队',
  logo: undefined,
  color: '#e53935', // 红色
  foundedYear: 2024,
  coach: '',
  createdAt: Date.now(),
};

// 初始化成都老爹队
export const initializeChengduDadieTeam = () => {
  const teams = storage.getTeams();
  if (!teams.find(t => t.id === CHENGDU_DADIE_TEAM_ID)) {
    storage.addTeam(CHENGDU_DADIE_TEAM);
  }
  
  // 清理旧格式的球员数据（没有 birthday 字段的）
  try {
    const players = storage.getPlayersByTeam(CHENGDU_DADIE_TEAM_ID);
    const invalidPlayers = players.filter((p: any) => !p.birthday || !p.positions);
    if (invalidPlayers.length > 0) {
      console.log('清理旧格式球员数据:', invalidPlayers.length, '个');
      // 删除旧数据
      invalidPlayers.forEach((p: any) => storage.deletePlayer(p.id));
    }
  } catch (error) {
    console.error('清理旧数据时出错:', error);
  }
  
  return CHENGDU_DADIE_TEAM_ID;
};

// 获取成都老爹队 ID
export const getChengduDadieTeamId = () => CHENGDU_DADIE_TEAM_ID;

// 计算年龄
export const calculateAge = (birthday: string): number => {
  if (!birthday) return 0;
  
  try {
    const today = new Date();
    const birthDate = new Date(birthday);
    
    if (isNaN(birthDate.getTime())) {
      console.error('无效的生日格式:', birthday);
      return 0;
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('计算年龄时出错:', error);
    return 0;
  }
};
