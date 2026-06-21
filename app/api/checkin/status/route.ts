import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";
import { withAuth } from "@/lib/api/with-auth";

// GET /api/checkin/status
export const GET = withAuth(async (userId) => {
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
});
