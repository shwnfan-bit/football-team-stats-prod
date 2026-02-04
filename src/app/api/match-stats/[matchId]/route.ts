import { NextRequest, NextResponse } from "next/server";
import { matchManager } from "@/storage/database";

// GET /api/match-stats/[matchId] - 获取比赛的球员统计
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

// POST /api/match-stats/[matchId] - 创建比赛球员统计
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

// DELETE /api/match-stats/[matchId] - 删除比赛的所有球员统计
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    await matchManager.deleteMatchPlayerStatsByMatch(matchId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting match stats:", error);
    return NextResponse.json(
      { error: "Failed to delete match stats" },
      { status: 500 }
    );
  }
}
