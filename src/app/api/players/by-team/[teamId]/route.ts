import { NextRequest, NextResponse } from "next/server";
import { playerManager } from "@/storage/database";

// GET /api/players/by-team/[teamId] - 获取指定球队的所有球员
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const players = await playerManager.getPlayersByTeam(teamId);
    return NextResponse.json({ data: players });
  } catch (error) {
    console.error("Error fetching players by team:", error);
    return NextResponse.json(
      { error: "Failed to fetch players by team" },
      { status: 500 }
    );
  }
}
