import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, startOfWeek, endOfWeek, subDays, format } from "date-fns";

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
  const sevenDaysAgo = subDays(todayStart, 6);

  const [todayResult, weekResult, totalResult, last7Days] = await Promise.all([
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
    prisma.pomodoro.findMany({
      where: {
        userId,
        startedAt: { gte: sevenDaysAgo },
        endedAt: { not: null },
      },
      select: { startedAt: true, duration: true },
    }),
  ]);

  const dailyMap = new Map<string, { minutes: number; count: number }>();
  for (let i = 0; i < 7; i++) {
    const d = subDays(todayStart, 6 - i);
    dailyMap.set(format(d, "yyyy-MM-dd"), { minutes: 0, count: 0 });
  }

  last7Days.forEach((p) => {
    const key = format(p.startedAt, "yyyy-MM-dd");
    const existing = dailyMap.get(key);
    if (existing) {
      existing.minutes += p.duration;
      existing.count += 1;
    }
  });

  const dailyLast7Days = Array.from(dailyMap.entries()).map(([date, val]) => ({
    date,
    minutes: val.minutes,
    count: val.count,
  }));

  return NextResponse.json({
    todayMinutes: todayResult._sum.duration || 0,
    todayCount: todayResult._count.id || 0,
    weekMinutes: weekResult._sum.duration || 0,
    totalCount: totalResult || 0,
    dailyLast7Days,
  });
}
