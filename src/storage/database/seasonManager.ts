import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  seasons,
  insertSeasonSchema,
  updateSeasonSchema,
} from "./shared/schema";
import type {
  Season,
  InsertSeason,
  UpdateSeason,
} from "./shared/schema";

export class SeasonManager {
  async createSeason(data: InsertSeason): Promise<Season> {
    const db = await getDb();
    const validated = insertSeasonSchema.parse(data);
    const [season] = await db.insert(seasons).values(validated).returning();
    return season;
  }

  async getSeasons(options?: {
    skip?: number;
    limit?: number;
    filters?: {
      teamId?: string;
    };
  }): Promise<Season[]> {
    const { skip = 0, limit = 100, filters = {} } = options || {};
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.teamId !== undefined) {
      conditions.push(eq(seasons.teamId, filters.teamId));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(seasons)
        .where(and(...conditions))
        .orderBy(seasons.startDate)
        .limit(limit)
        .offset(skip);
    }

    return db.select().from(seasons).orderBy(seasons.startDate).limit(limit).offset(skip);
  }

  async getSeasonById(id: string): Promise<Season | null> {
    const db = await getDb();
    const [season] = await db.select().from(seasons).where(eq(seasons.id, id));
    return season || null;
  }

  async getSeasonsByTeam(teamId: string): Promise<Season[]> {
    const db = await getDb();
    return db
      .select()
      .from(seasons)
      .where(eq(seasons.teamId, teamId))
      .orderBy(seasons.startDate);
  }

  async updateSeason(id: string, data: UpdateSeason): Promise<Season | null> {
    const db = await getDb();
    const validated = updateSeasonSchema.parse(data);
    const [season] = await db
      .update(seasons)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(seasons.id, id))
      .returning();
    return season || null;
  }

  async deleteSeason(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(seasons).where(eq(seasons.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteSeasonsByTeam(teamId: string): Promise<number> {
    const db = await getDb();
    const result = await db.delete(seasons).where(eq(seasons.teamId, teamId));
    return result.rowCount ?? 0;
  }
}

export const seasonManager = new SeasonManager();
