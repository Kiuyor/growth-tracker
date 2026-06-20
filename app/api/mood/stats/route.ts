import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMoodStreak, hasMoodEntryToday } from "@/lib/mood-rules";
import { subDays, startOfDay, format } from "date-fns";

// GET /api/mood/stats
export async function GET() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.userId;
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekAgo = subDays(now, 7);
  const sevenDaysAgo = subDays(todayStart, 6);

  const [totalEntries, currentStreak, todayRecorded, weekEntries, last7Days] =
    await Promise.all([
      prisma.moodEntry.count({ where: { userId } }),
      getMoodStreak(userId),
      hasMoodEntryToday(userId),
      prisma.moodEntry.findMany({
        where: {
          userId,
          createdAt: { gte: weekAgo },
        },
        select: { moodScore: true },
      }),
      prisma.moodEntry.findMany({
        where: {
          userId,
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true, moodScore: true },
      }),
    ]);

  const averageMood =
    weekEntries.length > 0
      ? Number(
          (
            weekEntries.reduce((sum, e) => sum + e.moodScore, 0) /
            weekEntries.length
          ).toFixed(1)
        )
      : 0;

  const dailyMap = new Map<string, { total: number; count: number }>();
  for (let i = 0; i < 7; i++) {
    const d = subDays(todayStart, 6 - i);
    dailyMap.set(format(d, "yyyy-MM-dd"), { total: 0, count: 0 });
  }

  last7Days.forEach((e) => {
    const key = format(e.createdAt, "yyyy-MM-dd");
    const existing = dailyMap.get(key);
    if (existing) {
      existing.total += e.moodScore;
      existing.count += 1;
    }
  });

  const dailyLast7Days = Array.from(dailyMap.entries()).map(([date, val]) => ({
    date,
    averageScore: val.count > 0 ? Number((val.total / val.count).toFixed(1)) : 0,
    count: val.count,
  }));

  return NextResponse.json({
    totalEntries,
    currentStreak,
    averageMood,
    todayRecorded,
    dailyLast7Days,
  });
}
