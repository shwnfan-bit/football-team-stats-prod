import { sql } from "drizzle-orm";
import {
  mysqlTable,
  text,
  varchar,
  timestamp,
  boolean,
  int,
  json,
} from "drizzle-orm/mysql-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// ==================== Teams 表 ====================
export const teams = mysqlTable(
  "teams",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    logo: text("logo"),
    color: varchar("color", { length: 7 }).notNull().default("#FF0000"),
    foundedYear: int("founded_year").notNull().default(2024),
    coach: varchar("coach", { length: 128 }),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
  }
);

// ==================== Players 表 ====================
export const players = mysqlTable(
  "players",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    teamId: varchar("team_id", { length: 36 })
      .notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    number: int("number").notNull(),
    position: varchar("position", { length: 32 }).notNull(), // goalkeeper, defender, midfielder, forward
    birthday: timestamp("birthday").notNull(),
    height: int("height"),
    weight: int("weight"),
    isCaptain: boolean("is_captain").default(false).notNull(),
    photo: text("photo"),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
  }
);

// ==================== Matches 表 ====================
export const matches = mysqlTable(
  "matches",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    teamId: varchar("team_id", { length: 36 }).notNull(),
    opponent: varchar("opponent", { length: 128 }).notNull(),
    date: timestamp("date").notNull(),
    matchType: varchar("match_type", { length: 16 }).notNull(), // home, away
    matchNature: varchar("match_nature", { length: 32 }).notNull(), // friendly, internal, cup, league
    location: varchar("location", { length: 128 }),
    scoreHome: int("score_home").notNull().default(0),
    scoreAway: int("score_away").notNull().default(0),
    status: varchar("status", { length: 32 }).notNull().default("completed"), // completed, pending
    videos: json("videos").$type<string[]>(), // 录像链接数组
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
  }
);

// ==================== Match Player Stats 表 ====================
export const matchPlayerStats = mysqlTable(
  "match_player_stats",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    matchId: varchar("match_id", { length: 36 }).notNull(),
    playerId: varchar("player_id", { length: 36 }).notNull(),
    playerName: varchar("player_name", { length: 128 }).notNull(),
    playerNumber: int("player_number").notNull(),
    playerPosition: varchar("player_position", { length: 32 }).notNull(),
    isPlaying: boolean("is_playing").notNull().default(true),
    goals: int("goals").notNull().default(0),
    assists: int("assists").notNull().default(0),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  }
);

// ==================== Seasons 表 ====================
export const seasons = mysqlTable(
  "seasons",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    teamId: varchar("team_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
  }
);

// ==================== Zod Schemas ====================
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

export const insertTeamSchema = createCoercedInsertSchema(teams).pick({
  name: true,
  logo: true,
  color: true,
  foundedYear: true,
  coach: true,
});

export const updateTeamSchema = createCoercedInsertSchema(teams)
  .pick({
    name: true,
    logo: true,
    color: true,
    foundedYear: true,
    coach: true,
  })
  .partial();

export const insertPlayerSchema = createCoercedInsertSchema(players).pick({
  teamId: true,
  name: true,
  number: true,
  position: true,
  birthday: true,
  height: true,
  weight: true,
  isCaptain: true,
  photo: true,
});

export const updatePlayerSchema = createCoercedInsertSchema(players)
  .pick({
    teamId: true,
    name: true,
    number: true,
    position: true,
    birthday: true,
    height: true,
    weight: true,
    isCaptain: true,
    photo: true,
  })
  .partial();

export const insertMatchSchema = createCoercedInsertSchema(matches).pick({
  teamId: true,
  opponent: true,
  date: true,
  matchType: true,
  matchNature: true,
  location: true,
  scoreHome: true,
  scoreAway: true,
  status: true,
  videos: true,
});

export const updateMatchSchema = createCoercedInsertSchema(matches)
  .pick({
    teamId: true,
    opponent: true,
    date: true,
    matchType: true,
    matchNature: true,
    location: true,
    scoreHome: true,
    scoreAway: true,
    status: true,
    videos: true,
  })
  .partial();

export const insertMatchPlayerStatSchema = createCoercedInsertSchema(
  matchPlayerStats
).pick({
  matchId: true,
  playerId: true,
  playerName: true,
  playerNumber: true,
  playerPosition: true,
  isPlaying: true,
  goals: true,
  assists: true,
});

export const updateMatchPlayerStatSchema = createCoercedInsertSchema(
  matchPlayerStats
)
  .pick({
    matchId: true,
    playerId: true,
    playerName: true,
    playerNumber: true,
    playerPosition: true,
    isPlaying: true,
    goals: true,
    assists: true,
  })
  .partial();

export const insertSeasonSchema = createCoercedInsertSchema(seasons).pick({
  teamId: true,
  name: true,
  startDate: true,
  endDate: true,
});

export const updateSeasonSchema = createCoercedInsertSchema(seasons)
  .pick({
    teamId: true,
    name: true,
    startDate: true,
    endDate: true,
  })
  .partial();

// ==================== TypeScript Types ====================
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type UpdateTeam = z.infer<typeof updateTeamSchema>;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type UpdatePlayer = z.infer<typeof updatePlayerSchema>;

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type UpdateMatch = z.infer<typeof updateMatchSchema>;

export type MatchPlayerStat = typeof matchPlayerStats.$inferSelect;
export type InsertMatchPlayerStat = z.infer<typeof insertMatchPlayerStatSchema>;
export type UpdateMatchPlayerStat = z.infer<typeof updateMatchPlayerStatSchema>;

export type Season = typeof seasons.$inferSelect;
export type InsertSeason = z.infer<typeof insertSeasonSchema>;
export type UpdateSeason = z.infer<typeof updateSeasonSchema>;
