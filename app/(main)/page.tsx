import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Flame,
  ListTodo,
  Trophy,
  Timer,
  Smile,
} from "lucide-react";
import Link from "next/link";
import { startOfDay, subDays, startOfWeek, endOfWeek } from "date-fns";

export default async function DashboardPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const userId = session.userId;
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const [
    profile,
    totalTasks,
    pendingTasks,
    completedTasks,
    todayCheck,
    yesterdayCheck,
    totalCheckIns,
    todayPomodoroCount,
    todayPomodoroMinutes,
    todayMood,
  ] = await Promise.all([
    prisma.userProfile.findUnique({ where: { clerkId: userId } }),
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: { not: "DONE" } } }),
    prisma.task.count({ where: { userId, status: "DONE" } }),
    prisma.dailyCheck.findUnique({
      where: { userId_date: { userId, date: today } },
    }),
    prisma.dailyCheck.findUnique({
      where: { userId_date: { userId, date: subDays(today, 1) } },
    }),
    prisma.dailyCheck.count({ where: { userId } }),
    prisma.pomodoro.count({
      where: {
        userId,
        startedAt: { gte: today },
        endedAt: { not: null },
      },
    }),
    prisma.pomodoro.aggregate({
      where: {
        userId,
        startedAt: { gte: today },
        endedAt: { not: null },
      },
      _sum: { duration: true },
    }),
    prisma.moodEntry.findFirst({
      where: { userId, createdAt: { gte: today } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const streak = todayCheck
    ? todayCheck.streak
    : yesterdayCheck
    ? yesterdayCheck.streak
    : 0;

  const recentTasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { subtasks: true },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">仪表盘</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总积分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
              <Trophy className="h-5 w-5" />
              {profile?.totalPoints || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              连续打卡
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-2xl font-bold text-orange-600 dark:text-orange-400">
              <Flame className="h-5 w-5" />
              {streak} 天
            </div>
            <Link href="/checkin">
              <Button variant="link" size="sm" className="h-auto px-0 py-0">
                {todayCheck ? "查看详情" : "去打卡"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <ListTodo className="h-5 w-5" />
              {totalTasks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已完成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              {completedTasks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今日专注
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
              <Timer className="h-5 w-5" />
              {todayPomodoroCount} 次 / {todayPomodoroMinutes._sum.duration || 0} 分钟
            </div>
            <Link href="/pomodoro">
              <Button variant="link" size="sm" className="h-auto px-0 py-0">
                去专注
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今日心情
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-2xl font-bold text-pink-600 dark:text-pink-400">
              <Smile className="h-5 w-5" />
              {todayMood ? `${todayMood.moodScore}/5` : "未记录"}
            </div>
            <Link href="/mood">
              <Button variant="link" size="sm" className="h-auto px-0 py-0">
                {todayMood ? "查看详情" : "去记录"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>最近任务</CardTitle>
            <Link href="/tasks">
              <Button variant="outline" size="sm">查看全部</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <p className="text-muted-foreground">还没有任务，去创建一个吧！</p>
          ) : (
            <ul className="space-y-3">
              {recentTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        task.status === "DONE" ? "bg-green-500" : "bg-amber-500"
                      }`}
                    />
                    <span className={task.status === "DONE" ? "line-through" : ""}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {task.status === "DONE" ? "已完成" : "待完成"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
