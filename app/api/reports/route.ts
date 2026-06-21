import { NextResponse } from "next/server";
import { buildReportStats } from "@/lib/reports";
import { withAuth } from "@/lib/api/with-auth";

// GET /api/reports?type=weekly|monthly&offset=-1|0|1|...
export const GET = withAuth(async (userId, request) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") === "monthly" ? "monthly" : "weekly";
  const rawOffset = searchParams.get("offset");
  let offset = parseInt(rawOffset || "0", 10) || 0;
  offset = Math.max(-52, Math.min(offset, 52));

  const data = await buildReportStats(userId, type, offset);
  return NextResponse.json(data);
});
