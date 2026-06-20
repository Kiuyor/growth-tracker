import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMoodStreak, hasMoodEntryToday } from "@/lib/mood-rules";
import { subDays } from "date-fns";

// GET /api/mood/stats
export async function GET() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.userId;
  const now = new Date();
  const weekAgo = subDays(now, 7);

  const [totalEntries, currentStreak, todayRecorded, weekEntries] =
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

  return NextResponse.json({
    totalEntries,
    currentStreak,
    averageMood,
    todayRecorded,
  });
}
