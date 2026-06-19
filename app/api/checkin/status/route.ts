import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";

// GET /api/checkin/status
export async function GET() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.userId;
  const today = startOfDay(new Date());

  const todayCheck = await prisma.dailyCheck.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  let currentStreak = 0;
  if (todayCheck) {
    currentStreak = todayCheck.streak;
  } else {
    const yesterday = subDays(today, 1);
    const yesterdayCheck = await prisma.dailyCheck.findUnique({
      where: { userId_date: { userId, date: yesterday } },
    });
    currentStreak = yesterdayCheck ? yesterdayCheck.streak : 0;
  }

  return NextResponse.json({
    checkedToday: !!todayCheck,
    currentStreak,
    today: today.toISOString(),
  });
}
