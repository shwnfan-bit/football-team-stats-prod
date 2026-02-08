import { NextRequest, NextResponse } from "next/server";
import { teamManager, playerManager, matchManager } from "@/storage/database";

// POST /api/migrate - 数据迁移
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teams, players, matches } = body;

    const results = {
      teams: { success: 0, failed: 0, errors: [] as string[] },
      players: { success: 0, failed: 0, errors: [] as string[] },
      matches: { success: 0, failed: 0, errors: [] as string[] },
      matchStats: { success: 0, failed: 0, errors: [] as string[] },
    };

    // 1. 迁移球队数据
    if (teams && Array.isArray(teams)) {
      for (const team of teams) {
        try {
          await teamManager.createTeam({
            name: team.name,
            logo: team.logo,
            color: team.color,
            foundedYear: team.foundedYear,
            coach: team.coach,
          });
          results.teams.success++;
        } catch (error) {
          results.teams.failed++;
          results.teams.errors.push(
            `Team ${team.name}: ${(error as Error).message}`
          );
        }
      }
    }

    // 2. 迁移球员数据
    if (players && Array.isArray(players)) {
      for (const player of players) {
        try {
          await playerManager.createPlayer({
            teamId: player.teamId,
            name: player.name,
            number: player.number,
            position: player.position,
            birthday: new Date(player.birthday),
            height: player.height,
            weight: player.weight,
            isCaptain: player.isCaptain,
            photo: player.photo,
          });
          results.players.success++;
        } catch (error) {
          results.players.failed++;
          results.players.errors.push(
            `Player ${player.name}: ${(error as Error).message}`
          );
        }
      }
    }

    // 3. 迁移比赛数据
    if (matches && Array.isArray(matches)) {
      for (const match of matches) {
        try {
          const createdMatch = await matchManager.createMatch({
            teamId: match.teamId,
            opponent: match.opponent,
            date: new Date(match.date),
            matchType: match.matchType,
            matchNature: match.matchNature,
            location: match.location,
            scoreHome: match.score.home,
            scoreAway: match.score.away,
            status: match.status,
            videos: match.videos,
          });
          results.matches.success++;

          // 4. 迁移比赛球员统计
          if (match.playerStats && Array.isArray(match.playerStats)) {
            for (const stat of match.playerStats) {
              try {
                await matchManager.createMatchPlayerStat({
                  matchId: createdMatch.id, // 使用数据库生成的 ID
                  playerId: stat.playerId,
                  playerName: stat.playerName,
                  playerNumber: stat.playerNumber,
                  playerPosition: stat.playerPosition,
                  isPlaying: stat.isPlaying,
                  goals: stat.goals,
                  assists: stat.assists,
                });
                results.matchStats.success++;
              } catch (error) {
                results.matchStats.failed++;
                results.matchStats.errors.push(
                  `Match ${match.opponent} Stat: ${(error as Error).message}`
                );
              }
            }
          }
        } catch (error) {
          results.matches.failed++;
          results.matches.errors.push(
            `Match ${match.opponent}: ${(error as Error).message}`
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        totalSuccess:
          results.teams.success +
          results.players.success +
          results.matches.success +
          results.matchStats.success,
        totalFailed:
          results.teams.failed +
          results.players.failed +
          results.matches.failed +
          results.matchStats.failed,
      },
    });
  } catch (error) {
    console.error("Error during migration:", error);
    return NextResponse.json(
      { error: "Migration failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
