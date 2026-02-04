import { NextRequest, NextResponse } from "next/server";
import { matchManager } from "@/storage/database";

// GET /api/matches - 获取所有比赛
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = parseInt(searchParams.get("skip") || "0");
    const teamId = searchParams.get("teamId") || undefined;
    const status = searchParams.get("status") || undefined;

    const matches = await matchManager.getMatches({
      limit,
      skip,
      filters: { teamId, status },
    });

    return NextResponse.json({ data: matches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

// POST /api/matches - 创建比赛
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const match = await matchManager.createMatch(body);
    return NextResponse.json({ data: match }, { status: 201 });
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 }
    );
  }
}
