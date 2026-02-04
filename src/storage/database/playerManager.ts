import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  players,
  insertPlayerSchema,
  updatePlayerSchema,
} from "./shared/schema";
import type {
  Player,
  InsertPlayer,
  UpdatePlayer,
} from "./shared/schema";

export class PlayerManager {
  async createPlayer(data: InsertPlayer): Promise<Player> {
    const db = await getDb();
    const validated = insertPlayerSchema.parse(data);
    const [player] = await db.insert(players).values(validated).returning();
    return player;
  }

  async getPlayers(options?: {
    skip?: number;
    limit?: number;
    filters?: {
      teamId?: string;
      position?: string;
    };
  }): Promise<Player[]> {
    const { skip = 0, limit = 100, filters = {} } = options || {};
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.teamId !== undefined) {
      conditions.push(eq(players.teamId, filters.teamId));
    }
    if (filters.position !== undefined) {
      conditions.push(eq(players.position, filters.position));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(players)
        .where(and(...conditions))
        .orderBy(players.number)
        .limit(limit)
        .offset(skip);
    }

    return db.select().from(players).orderBy(players.number).limit(limit).offset(skip);
  }

  async getPlayerById(id: string): Promise<Player | null> {
    const db = await getDb();
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || null;
  }

  async getPlayersByTeam(teamId: string): Promise<Player[]> {
    const db = await getDb();
    return db
      .select()
      .from(players)
      .where(eq(players.teamId, teamId))
      .orderBy(players.number);
  }

  async updatePlayer(id: string, data: UpdatePlayer): Promise<Player | null> {
    const db = await getDb();
    const validated = updatePlayerSchema.parse(data);
    const [player] = await db
      .update(players)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(players.id, id))
      .returning();
    return player || null;
  }

  async deletePlayer(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(players).where(eq(players.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deletePlayersByTeam(teamId: string): Promise<number> {
    const db = await getDb();
    const result = await db.delete(players).where(eq(players.teamId, teamId));
    return result.rowCount ?? 0;
  }
}

export const playerManager = new PlayerManager();
