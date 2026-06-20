import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { HeatmapData } from "@/types";

// GET /api/stats/heatmap?year=2026
export async function GET(request: Request) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.userId;
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year") || new Date().getFullYear());

  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);

  const records = await prisma.dailyCheck.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
    select: { date: true, streak: true },
    orderBy: { date: "asc" },
  });

  const recordMap = new Map<string, number>();
  records.forEach((r) => {
    const key = r.date.toISOString().split("T")[0];
    recordMap.set(key, r.streak);
  });

  const data: HeatmapData["data"] = [];
  const current = new Date(start);
  while (current <= end) {
    const key = current.toISOString().split("T")[0];
    data.push({
      date: key,
      value: recordMap.has(key) ? 1 : 0,
      streak: recordMap.get(key) || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  const result: HeatmapData = { year, data };
  return NextResponse.json(result);
}
