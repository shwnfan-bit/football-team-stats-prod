import { NextRequest, NextResponse } from "next/server";
import { matchManager } from "@/storage/database";

// GET /api/matches/by-team/[teamId] - 获取指定球队的所有比赛
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const matches = await matchManager.getMatchesByTeam(teamId);
    return NextResponse.json({ data: matches });
  } catch (error) {
    console.error("Error fetching matches by team:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches by team" },
      { status: 500 }
    );
  }
}
