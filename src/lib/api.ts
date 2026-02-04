// API 客户端 - 封装所有后端 API 调用

const BASE_URL = '/api';

// 通用请求方法
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data.data;
}

// ============ Teams API ============
export const teamsApi = {
  getAll: () => request<Team[]>('/teams'),
  getById: (id: string) => request<Team>(`/teams/${id}`),
  create: (data: InsertTeam) => request<Team>('/teams', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateTeam) => request<Team>(`/teams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => request<{ success: boolean }>(`/teams/${id}`, {
    method: 'DELETE',
  }),
};

// ============ Players API ============
export const playersApi = {
  getAll: (options?: { teamId?: string; position?: string }) => {
    const params = new URLSearchParams();
    if (options?.teamId) params.set('teamId', options.teamId);
    if (options?.position) params.set('position', options.position);
    return request<Player[]>(`/players?${params.toString()}`);
  },
  getById: (id: string) => request<Player>(`/players/${id}`),
  getByTeam: (teamId: string) => request<Player[]>(`/players/by-team/${teamId}`),
  create: (data: InsertPlayer) => request<Player>('/players', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdatePlayer) => request<Player>(`/players/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => request<{ success: boolean }>(`/players/${id}`, {
    method: 'DELETE',
  }),
};

// ============ Matches API ============
export const matchesApi = {
  getAll: (options?: { teamId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (options?.teamId) params.set('teamId', options.teamId);
    if (options?.status) params.set('status', options.status);
    return request<Match[]>(`/matches?${params.toString()}`);
  },
  getById: (id: string) => request<Match>(`/matches/${id}`),
  getByTeam: (teamId: string) => request<Match[]>(`/matches/by-team/${teamId}`),
  create: (data: InsertMatch) => request<Match>('/matches', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateMatch) => request<Match>(`/matches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => request<{ success: boolean }>(`/matches/${id}`, {
    method: 'DELETE',
  }),
};

// ============ Match Stats API ============
export const matchStatsApi = {
  getByMatch: (matchId: string) =>
    request<MatchPlayerStat[]>(`/match-stats/${matchId}`),
  create: (matchId: string, data: Omit<InsertMatchPlayerStat, 'matchId'>) =>
    request<MatchPlayerStat>(`/match-stats/${matchId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteByMatch: (matchId: string) =>
    request<{ success: boolean }>(`/match-stats/${matchId}`, {
      method: 'DELETE',
    }),
};

// ============ Seasons API ============
export const seasonsApi = {
  getAll: (options?: { teamId?: string }) => {
    const params = new URLSearchParams();
    if (options?.teamId) params.set('teamId', options.teamId);
    return request<Season[]>(`/seasons?${params.toString()}`);
  },
  getById: (id: string) => request<Season>(`/seasons/${id}`),
  create: (data: InsertSeason) => request<Season>('/seasons', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateSeason) => request<Season>(`/seasons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => request<{ success: boolean }>(`/seasons/${id}`, {
    method: 'DELETE',
  }),
};

// ============ Migration API ============
export const migrationApi = {
  migrate: (data: {
    teams: any[];
    players: any[];
    matches: any[];
  }) =>
    request<{
      success: boolean;
      results: any;
      summary: any;
    }>('/migrate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
