import { NextRequest, NextResponse } from "next/server";
import { seasonManager } from "@/storage/database";

// GET /api/seasons - 获取所有赛季
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = parseInt(searchParams.get("skip") || "0");
    const teamId = searchParams.get("teamId") || undefined;

    const seasons = await seasonManager.getSeasons({
      limit,
      skip,
      filters: { teamId },
    });

    return NextResponse.json({ data: seasons });
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return NextResponse.json(
      { error: "Failed to fetch seasons" },
      { status: 500 }
    );
  }
}

// POST /api/seasons - 创建赛季
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const season = await seasonManager.createSeason(body);
    return NextResponse.json({ data: season }, { status: 201 });
  } catch (error) {
    console.error("Error creating season:", error);
    return NextResponse.json(
      { error: "Failed to create season" },
      { status: 500 }
    );
  }
}
