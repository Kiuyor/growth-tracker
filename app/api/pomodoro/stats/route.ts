import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, startOfWeek, endOfWeek } from "date-fns";

// GET /api/pomodoro/stats
export async function GET() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.userId;
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const [todayResult, weekResult, totalResult] = await Promise.all([
    prisma.pomodoro.aggregate({
      where: {
        userId,
        startedAt: { gte: todayStart },
        endedAt: { not: null },
      },
      _count: { id: true },
      _sum: { duration: true },
    }),
    prisma.pomodoro.aggregate({
      where: {
        userId,
        startedAt: { gte: weekStart, lte: weekEnd },
        endedAt: { not: null },
      },
      _sum: { duration: true },
    }),
    prisma.pomodoro.count({
      where: {
        userId,
        endedAt: { not: null },
      },
    }),
  ]);

  return NextResponse.json({
    todayMinutes: todayResult._sum.duration || 0,
    todayCount: todayResult._count.id || 0,
    weekMinutes: weekResult._sum.duration || 0,
    totalCount: totalResult || 0,
  });
}
