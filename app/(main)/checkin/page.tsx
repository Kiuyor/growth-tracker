import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckInCard } from "@/components/checkin/check-in-card";
import { CheckInHeatmap } from "@/components/checkin/check-in-heatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfDay, subDays } from "date-fns";

export default async function CheckInPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const userId = session.userId;
  const today = startOfDay(new Date());

  const [todayCheck, yesterdayCheck] = await Promise.all([
    prisma.dailyCheck.findUnique({
      where: { userId_date: { userId, date: today } },
    }),
    prisma.dailyCheck.findUnique({
      where: { userId_date: { userId, date: subDays(today, 1) } },
    }),
  ]);

  const currentStreak = todayCheck
    ? todayCheck.streak
    : yesterdayCheck
    ? yesterdayCheck.streak
    : 0;

  // 最近 6 个月历史
  const sixMonthsAgo = subDays(today, 180);
  const history = await prisma.dailyCheck.findMany({
    where: {
      userId,
      date: { gte: sixMonthsAgo },
    },
    orderBy: { date: "asc" },
  });

  const totalCheckIns = await prisma.dailyCheck.count({
    where: { userId },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">每日打卡</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              当前连续
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {currentStreak} 天
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              累计打卡
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCheckIns} 天</div>
          </CardContent>
        </Card>
      </div>

      <CheckInCard
        checkedToday={!!todayCheck}
        currentStreak={currentStreak}
      />

      <Card className="p-6">
        <CheckInHeatmap history={history as unknown as import("@/types").DailyCheck[]} />
      </Card>
    </div>
  );
}
