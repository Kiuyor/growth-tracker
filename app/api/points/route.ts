import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPointLogs } from "@/lib/points-engine";

// GET /api/points
export async function GET() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await getPointLogs(session.userId, 100);
  return NextResponse.json(logs);
}
