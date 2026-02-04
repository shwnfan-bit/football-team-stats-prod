import { NextRequest, NextResponse } from "next/server";
import { teamManager } from "@/storage/database";

// GET /api/teams - 获取所有球队
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = parseInt(searchParams.get("skip") || "0");

    const teams = await teamManager.getTeams({ limit, skip });
    return NextResponse.json({ data: teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// POST /api/teams - 创建球队
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const team = await teamManager.createTeam(body);
    return NextResponse.json({ data: team }, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
