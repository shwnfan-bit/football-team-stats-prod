'use server';
import { getDb } from "./db";
import { sql } from "drizzle-orm";

export async function initDatabase() {
  try {
    const db = await getDb();
    console.log("Starting database initialization...");

    // 创建 teams 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        logo_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 创建 players 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS players (
        id VARCHAR(255) PRIMARY KEY,
        team_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        number INT NOT NULL,
        position VARCHAR(50) NOT NULL,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 创建 seasons 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS seasons (
        id VARCHAR(255) PRIMARY KEY,
        team_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME,
        is_active BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 创建 matches 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS matches (
        id VARCHAR(255) PRIMARY KEY,
        team_id VARCHAR(255) NOT NULL,
        opponent VARCHAR(255) NOT NULL,
        date DATETIME NOT NULL,
        location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'scheduled',
        result VARCHAR(50),
        our_score INT DEFAULT 0,
        opponent_score INT DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 创建 match_player_stats 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS match_player_stats (
        id VARCHAR(255) PRIMARY KEY,
        match_id VARCHAR(255) NOT NULL,
        player_id VARCHAR(255) NOT NULL,
        goals INT DEFAULT 0,
        assists INT DEFAULT 0,
        yellow_cards INT DEFAULT 0,
        red_cards INT DEFAULT 0,
        minutes_played INT DEFAULT 0,
        rating FLOAT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("Database tables checked/created successfully.");
    
    // 检查并初始化默认球队：成都老爹队
    const [existingTeam] = await db.execute(sql`SELECT * FROM teams WHERE name = '成都老爹队' LIMIT 1`);
    if (!existingTeam || (Array.isArray(existingTeam) && existingTeam.length === 0)) {
      console.log("Initializing default team: 成都老爹队");
      const teamId = 'default-team-id'; // 或者是生成的 UUID
      await db.execute(sql`
        INSERT INTO teams (id, name, description) 
        VALUES (${teamId}, '成都老爹队', '默认初始化的足球队')
      `);
      console.log("Default team initialized.");
    }

  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}
