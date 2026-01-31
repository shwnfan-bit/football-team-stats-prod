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
  return CHENGDU_DADIE_TEAM_ID;
};

// 获取成都老爹队 ID
export const getChengduDadieTeamId = () => CHENGDU_DADIE_TEAM_ID;

// 计算年龄
export const calculateAge = (birthday: string): number => {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};
