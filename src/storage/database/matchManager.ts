import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "./shared/db";
import {
  matches,
  insertMatchSchema,
  updateMatchSchema,
  matchPlayerStats,
  insertMatchPlayerStatSchema,
  updateMatchPlayerStatSchema,
} from "./shared/schema";
import type {
  Match,
  InsertMatch,
  UpdateMatch,
  MatchPlayerStat,
  InsertMatchPlayerStat,
  UpdateMatchPlayerStat,
} from "./shared/schema";

export class MatchManager {
  // ==================== Match Operations ====================
  async createMatch(data: InsertMatch): Promise<Match> {
    const db = await getDb();
    const validated = insertMatchSchema.parse(data);
    await db.insert(matches).values(validated);
    const [match] = await db.select().from(matches).where(eq(matches.id, data.id as any));
    return match;
  }

  async getMatches(options?: {
    skip?: number;
    limit?: number;
    filters?: {
      teamId?: string;
      status?: string;
    };
  }): Promise<Match[]> {
    const { skip = 0, limit = 100, filters = {} } = options || {};
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.teamId !== undefined) {
      conditions.push(eq(matches.teamId, filters.teamId));
    }
    if (filters.status !== undefined) {
      conditions.push(eq(matches.status, filters.status));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(matches)
        .where(and(...conditions))
        .orderBy(matches.date)
        .limit(limit)
        .offset(skip);
    }

    return db.select().from(matches).orderBy(matches.date).limit(limit).offset(skip);
  }

  async getMatchById(id: string): Promise<Match | null> {
    const db = await getDb();
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || null;
  }

  async getMatchesByTeam(teamId: string): Promise<Match[]> {
    const db = await getDb();
    return db
      .select()
      .from(matches)
      .where(eq(matches.teamId, teamId))
      .orderBy(matches.date);
  }

  async updateMatch(id: string, data: UpdateMatch): Promise<Match | null> {
    const db = await getDb();
    const validated = updateMatchSchema.parse(data);
    await db
      .update(matches)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(matches.id, id));
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || null;
  }

  async deleteMatch(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(matches).where(eq(matches.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteMatchesByTeam(teamId: string): Promise<number> {
    const db = await getDb();
    const result = await db.delete(matches).where(eq(matches.teamId, teamId));
    return result.rowCount ?? 0;
  }

  // ==================== Match Player Stats Operations ====================
  async createMatchPlayerStat(data: InsertMatchPlayerStat): Promise<MatchPlayerStat> {
    const db = await getDb();
    const validated = insertMatchPlayerStatSchema.parse(data);
    await db.insert(matchPlayerStats).values(validated);
    const [stat] = await db.select().from(matchPlayerStats).where(eq(matchPlayerStats.id, data.id as any));
    return stat;
  }

  async getMatchPlayerStats(matchId: string): Promise<MatchPlayerStat[]> {
    const db = await getDb();
    return db.select().from(matchPlayerStats).where(eq(matchPlayerStats.matchId, matchId));
  }

  async getMatchPlayerStatById(id: string): Promise<MatchPlayerStat | null> {
    const db = await getDb();
    const [stat] = await db.select().from(matchPlayerStats).where(eq(matchPlayerStats.id, id));
    return stat || null;
  }

  async updateMatchPlayerStat(id: string, data: UpdateMatchPlayerStat): Promise<MatchPlayerStat | null> {
    const db = await getDb();
    const validated = updateMatchPlayerStatSchema.parse(data);
    await db
      .update(matchPlayerStats)
      .set(validated)
      .where(eq(matchPlayerStats.id, id));
    const [stat] = await db.select().from(matchPlayerStats).where(eq(matchPlayerStats.id, id));
    return stat || null;
  }

  async deleteMatchPlayerStat(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(matchPlayerStats).where(eq(matchPlayerStats.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteMatchPlayerStatsByMatch(matchId: string): Promise<number> {
    const db = await getDb();
    const result = await db.delete(matchPlayerStats).where(eq(matchPlayerStats.matchId, matchId));
    return result.rowCount ?? 0;
  }
}

export const matchManager = new MatchManager();
