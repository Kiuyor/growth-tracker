import { NextResponse } from "next/server";
import { getPointLogs } from "@/lib/points-engine";
import { withAuth } from "@/lib/api/with-auth";

// GET /api/points
export const GET = withAuth(async (userId) => {
  const logs = await getPointLogs(userId, 100);
  return NextResponse.json(logs);
});
