import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/date";
import type { HeatmapData } from "@/types";
import { withAuth } from "@/lib/api/with-auth";

// GET /api/stats/heatmap?year=2026
export const GET = withAuth(async (userId, request) => {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

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
    const key = dayKey(r.date);
    recordMap.set(key, r.streak);
  });

  const data: HeatmapData["data"] = [];
  const current = new Date(start);
  while (current <= end) {
    const key = dayKey(current);
    data.push({
      date: key,
      value: recordMap.has(key) ? 1 : 0,
      streak: recordMap.get(key) || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  const result: HeatmapData = { year, data };
  return NextResponse.json(result);
});
