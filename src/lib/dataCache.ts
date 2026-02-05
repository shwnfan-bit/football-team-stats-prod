/**
 * 数据缓存管理器
 * 用于缓存比赛、球员等数据，避免重复加载
 */

import { Match, Player } from '@/types';

export class DataCache<T> {
  private cache: Map<string, { data: T; timestamp: number }>;
  private ttl: number; // 缓存有效期（毫秒）

  constructor(ttl: number = 5 * 60 * 1000) { // 默认5分钟
    this.cache = new Map();
    this.ttl = ttl;
  }

  // 设置缓存
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // 获取缓存
  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // 清除指定缓存
  delete(key: string): void {
    this.cache.delete(key);
  }

  // 清除所有缓存
  clear(): void {
    this.cache.clear();
  }

  // 清除过期缓存
  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// 创建全局缓存实例
export const cacheManager = {
  matches: new DataCache<Match[]>(),
  players: new DataCache<Player[]>(),
  
  // 清除所有缓存
  clearAll(): void {
    this.matches.clear();
    this.players.clear();
  },

  // 清除比赛缓存
  clearMatches(): void {
    this.matches.clear();
  },

  // 清除球员缓存
  clearPlayers(): void {
    this.players.clear();
  },

  // 清除过期缓存
  clearExpired(): void {
    this.matches.clearExpired();
    this.players.clearExpired();
  },
};
