import { NextRequest, NextResponse } from "next/server";
import { matchManager } from "@/storage/database";

// GET /api/matches/[id] - 获取单个比赛
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match = await matchManager.getMatchById(id);

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ data: match });
  } catch (error) {
    console.error("Error fetching match:", error);
    return NextResponse.json(
      { error: "Failed to fetch match" },
      { status: 500 }
    );
  }
}

// PUT /api/matches/[id] - 更新比赛
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const match = await matchManager.updateMatch(id, body);

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ data: match });
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}

// DELETE /api/matches/[id] - 删除比赛
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await matchManager.deleteMatch(id);

    if (!deleted) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json(
      { error: "Failed to delete match" },
      { status: 500 }
    );
  }
}
