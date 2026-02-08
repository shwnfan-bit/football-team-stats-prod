import { NextRequest, NextResponse } from "next/server";
import { matchManager } from "@/storage/database";

// GET /api/match-stats - 批量获取所有比赛的球员统计
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchIds = searchParams.get("matchIds");

    if (!matchIds) {
      return NextResponse.json(
        { error: "matchIds parameter is required" },
        { status: 400 }
      );
    }

    const ids = matchIds.split(",");
    // 获取所有比赛的统计数据
    const allStats = await Promise.all(
      ids.map((id) => matchManager.getMatchPlayerStats(id.trim()))
    );

    // 将结果按 matchId 分组
    const groupedStats: Record<string, any[]> = {};
    ids.forEach((id, index) => {
      groupedStats[id.trim()] = allStats[index];
    });

    return NextResponse.json({ data: groupedStats });
  } catch (error) {
    console.error("Error fetching batch match stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch match stats" },
      { status: 500 }
    );
  }
}
