import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// ==================== Teams 表 ====================
export const teams = pgTable(
  "teams",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    logo: text("logo"),
    color: varchar("color", { length: 7 }).notNull().default("#FF0000"),
    foundedYear: integer("founded_year").notNull().default(2024),
    coach: varchar("coach", { length: 128 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    nameIdx: index("teams_name_idx").on(table.name),
  })
);

// ==================== Players 表 ====================
export const players = pgTable(
  "players",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    teamId: varchar("team_id", { length: 36 })
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 128 }).notNull(),
    number: integer("number").notNull(),
    position: varchar("position", { length: 32 }).notNull(), // goalkeeper, defender, midfielder, forward
    birthday: timestamp("birthday", { withTimezone: true }).notNull(),
    height: integer("height"),
    weight: integer("weight"),
    isCaptain: boolean("is_captain").default(false).notNull(),
    photo: text("photo"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    teamIdIdx: index("players_team_id_idx").on(table.teamId),
    numberIdx: index("players_number_idx").on(table.number),
  })
);

// ==================== Matches 表 ====================
export const matches = pgTable(
  "matches",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    teamId: varchar("team_id", { length: 36 })
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    opponent: varchar("opponent", { length: 128 }).notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    matchType: varchar("match_type", { length: 16 }).notNull(), // home, away
    matchNature: varchar("match_nature", { length: 32 }).notNull(), // friendly, internal, cup, league
    location: varchar("location", { length: 128 }),
    scoreHome: integer("score_home").notNull().default(0),
    scoreAway: integer("score_away").notNull().default(0),
    status: varchar("status", { length: 32 }).notNull().default("completed"), // completed, pending
    videos: jsonb("videos").$type<string[]>(), // 录像链接数组
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    teamIdIdx: index("matches_team_id_idx").on(table.teamId),
    dateIdx: index("matches_date_idx").on(table.date),
  })
);

// ==================== Match Player Stats 表 ====================
export const matchPlayerStats = pgTable(
  "match_player_stats",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    matchId: varchar("match_id", { length: 36 })
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    playerId: varchar("player_id", { length: 36 })
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    playerName: varchar("player_name", { length: 128 }).notNull(),
    playerNumber: integer("player_number").notNull(),
    playerPosition: varchar("player_position", { length: 32 }).notNull(),
    isPlaying: boolean("is_playing").notNull().default(true),
    goals: integer("goals").notNull().default(0),
    assists: integer("assists").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    matchIdIdx: index("match_player_stats_match_id_idx").on(table.matchId),
    playerIdIdx: index("match_player_stats_player_id_idx").on(table.playerId),
  })
);

// ==================== Seasons 表 ====================
export const seasons = pgTable(
  "seasons",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    teamId: varchar("team_id", { length: 36 })
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 128 }).notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    teamIdIdx: index("seasons_team_id_idx").on(table.teamId),
  })
);

// ==================== Zod Schemas ====================

// 使用 createSchemaFactory 配置 date coercion（处理前端 string → Date 转换）
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// Teams Schemas
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

// Players Schemas
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

// Matches Schemas
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

// Match Player Stats Schemas
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

// Seasons Schemas
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
