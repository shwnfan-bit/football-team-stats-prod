import { NextRequest, NextResponse } from "next/server";
import { playerManager } from "@/storage/database";

// GET /api/players - 获取所有球员
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = parseInt(searchParams.get("skip") || "0");
    const teamId = searchParams.get("teamId") || undefined;
    const position = searchParams.get("position") || undefined;

    const players = await playerManager.getPlayers({
      limit,
      skip,
      filters: { teamId, position },
    });

    return NextResponse.json({ data: players });
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}

// POST /api/players - 创建球员
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const player = await playerManager.createPlayer(body);
    return NextResponse.json({ data: player }, { status: 201 });
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    );
  }
}
