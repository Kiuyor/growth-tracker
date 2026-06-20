import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildReportStats } from "@/lib/reports";

// GET /api/reports?type=weekly|monthly&offset=-1|0|1|...
export async function GET(request: Request) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") === "monthly" ? "monthly" : "weekly";
  const offset = parseInt(searchParams.get("offset") || "0", 10) || 0;

  const data = await buildReportStats(session.userId, type, offset);
  return NextResponse.json(data);
}
