import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  teams,
  insertTeamSchema,
  updateTeamSchema,
} from "./shared/schema";
import type {
  Team,
  InsertTeam,
  UpdateTeam,
} from "./shared/schema";

export class TeamManager {
  async createTeam(data: InsertTeam): Promise<Team> {
    const db = await getDb();
    const validated = insertTeamSchema.parse(data);
    const [team] = await db.insert(teams).values(validated).returning();
    return team;
  }

  async getTeams(options?: {
    skip?: number;
    limit?: number;
  }): Promise<Team[]> {
    const { skip = 0, limit = 100 } = options || {};
    const db = await getDb();
    return db.select().from(teams).limit(limit).offset(skip);
  }

  async getTeamById(id: string): Promise<Team | null> {
    const db = await getDb();
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || null;
  }

  async getTeamByName(name: string): Promise<Team | null> {
    const db = await getDb();
    const [team] = await db.select().from(teams).where(eq(teams.name, name));
    return team || null;
  }

  async updateTeam(id: string, data: UpdateTeam): Promise<Team | null> {
    const db = await getDb();
    const validated = updateTeamSchema.parse(data);
    const [team] = await db
      .update(teams)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return team || null;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(teams).where(eq(teams.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const teamManager = new TeamManager();
