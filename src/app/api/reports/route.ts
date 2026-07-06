import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Report from "@/models/Report";

// GET /api/reports — list all saved reports (most recent first)
export async function GET() {
  try {
    await dbConnect();
    const reports = await Report.find({})
      .sort({ createdAt: -1 })
      .select("company ticker verdict confidence createdAt")
      .limit(50)
      .lean();
    return NextResponse.json({ reports });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

// DELETE /api/reports?id=xxx — delete a single report
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  try {
    await dbConnect();
    await Report.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
