import { NextRequest, NextResponse } from "next/server";
import { matchManager } from "@/storage/database";

// GET /api/matches/[matchId]/stats - 获取比赛的球员统计
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const stats = await matchManager.getMatchPlayerStats(matchId);
    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error("Error fetching match stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch match stats" },
      { status: 500 }
    );
  }
}

// POST /api/matches/[matchId]/stats - 创建比赛球员统计
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const body = await request.json();
    const stat = await matchManager.createMatchPlayerStat({
      ...body,
      matchId,
    });
    return NextResponse.json({ data: stat }, { status: 201 });
  } catch (error) {
    console.error("Error creating match stat:", error);
    return NextResponse.json(
      { error: "Failed to create match stat" },
      { status: 500 }
    );
  }
}
