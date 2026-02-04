import { NextRequest, NextResponse } from "next/server";
import { seasonManager } from "@/storage/database";

// GET /api/seasons/[id] - 获取单个赛季
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const season = await seasonManager.getSeasonById(id);

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 });
    }

    return NextResponse.json({ data: season });
  } catch (error) {
    console.error("Error fetching season:", error);
    return NextResponse.json(
      { error: "Failed to fetch season" },
      { status: 500 }
    );
  }
}

// PUT /api/seasons/[id] - 更新赛季
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const season = await seasonManager.updateSeason(id, body);

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 });
    }

    return NextResponse.json({ data: season });
  } catch (error) {
    console.error("Error updating season:", error);
    return NextResponse.json(
      { error: "Failed to update season" },
      { status: 500 }
    );
  }
}

// DELETE /api/seasons/[id] - 删除赛季
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await seasonManager.deleteSeason(id);

    if (!deleted) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting season:", error);
    return NextResponse.json(
      { error: "Failed to delete season" },
      { status: 500 }
    );
  }
}
