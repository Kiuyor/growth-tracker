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
import { WeeklyTrendChart } from "@/components/charts/weekly-trend-chart";
import { TaskStatusPie } from "@/components/charts/task-status-pie";

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
    weeklyPomodoros,
    weeklyMoods,
    allTasks,
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
    prisma.pomodoro.findMany({
      where: {
        userId,
        startedAt: { gte: subDays(today, 6) },
        endedAt: { not: null },
      },
      select: { startedAt: true, duration: true },
    }),
    prisma.moodEntry.findMany({
      where: { userId, createdAt: { gte: subDays(today, 6) } },
      select: { createdAt: true, moodScore: true },
    }),
    prisma.task.findMany({
      where: { userId },
      select: { status: true },
    }),
  ]);

  const streak = todayCheck
    ? todayCheck.streak
    : yesterdayCheck
    ? yesterdayCheck.streak
    : 0;

  // 构建近 7 天每日数据
  const dailyMap = new Map<
    string,
    {
      checkIn: boolean;
      pomodoroCount: number;
      pomodoroMinutes: number;
      moodScores: number[];
      tasksCompleted: number;
      pointsEarned: number;
    }
  >();

  for (let i = 0; i < 7; i++) {
    const d = subDays(today, 6 - i);
    dailyMap.set(d.toISOString().split("T")[0], {
      checkIn: false,
      pomodoroCount: 0,
      pomodoroMinutes: 0,
      moodScores: [],
      tasksCompleted: 0,
      pointsEarned: 0,
    });
  }

  weeklyPomodoros.forEach((p) => {
    const key = p.startedAt.toISOString().split("T")[0];
    const day = dailyMap.get(key);
    if (day) {
      day.pomodoroCount += 1;
      day.pomodoroMinutes += p.duration;
    }
  });

  weeklyMoods.forEach((e) => {
    const key = e.createdAt.toISOString().split("T")[0];
    const day = dailyMap.get(key);
    if (day) day.moodScores.push(e.moodScore);
  });

  const weeklyDaily = Array.from(dailyMap.entries()).map(([date, val]) => ({
    date,
    checkIn: val.checkIn,
    pomodoroCount: val.pomodoroCount,
    pomodoroMinutes: val.pomodoroMinutes,
    moodScore:
      val.moodScores.length > 0
        ? Number(
            (val.moodScores.reduce((a, b) => a + b, 0) / val.moodScores.length).toFixed(1)
          )
        : null,
    tasksCompleted: val.tasksCompleted,
    pointsEarned: val.pointsEarned,
  }));

  const taskStatusCounts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  allTasks.forEach((t) => {
    if (t.status === "TODO" || t.status === "IN_PROGRESS" || t.status === "DONE") {
      taskStatusCounts[t.status] += 1;
    }
  });

  const recentTasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { subtasks: true },
  });

  return (
    <div className="flex h-full flex-col gap-3 md:gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold md:text-2xl">仪表盘</h2>
        <Link href="/stats">
          <Button variant="outline" size="sm">查看完整统计</Button>
        </Link>
      </div>

      <div className="grid shrink-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="h-[72px]">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              总积分
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center gap-2 text-lg font-bold text-amber-600 dark:text-amber-400">
              <Trophy className="h-4 w-4" />
              {profile?.totalPoints || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="h-[72px]">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              连续打卡
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between p-3 pt-0">
            <div className="flex items-center gap-2 text-lg font-bold text-orange-600 dark:text-orange-400">
              <Flame className="h-4 w-4" />
              {streak} 天
            </div>
            <Link href="/checkin">
              <Button variant="link" size="sm" className="h-auto px-0 py-0 text-xs">
                {todayCheck ? "查看" : "打卡"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="h-[72px]">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              总任务
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center gap-2 text-lg font-bold">
              <ListTodo className="h-4 w-4" />
              {totalTasks}
            </div>
          </CardContent>
        </Card>

        <Card className="h-[72px]">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              已完成
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center gap-2 text-lg font-bold text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              {completedTasks}
            </div>
          </CardContent>
        </Card>

        <Card className="h-[72px]">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              今日专注
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between p-3 pt-0">
            <div className="flex items-center gap-2 text-lg font-bold text-blue-600 dark:text-blue-400">
              <Timer className="h-4 w-4" />
              {todayPomodoroCount} / {todayPomodoroMinutes._sum.duration || 0}m
            </div>
            <Link href="/pomodoro">
              <Button variant="link" size="sm" className="h-auto px-0 py-0 text-xs">
                专注
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="h-[72px]">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              今日心情
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between p-3 pt-0">
            <div className="flex items-center gap-2 text-lg font-bold text-pink-600 dark:text-pink-400">
              <Smile className="h-4 w-4" />
              {todayMood ? `${todayMood.moodScore}/5` : "未记录"}
            </div>
            <Link href="/mood">
              <Button variant="link" size="sm" className="h-auto px-0 py-0 text-xs">
                {todayMood ? "查看" : "记录"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-3">
        <div className="min-h-0 lg:col-span-2">
          <WeeklyTrendChart data={weeklyDaily} />
        </div>
        <div className="min-h-0">
          <TaskStatusPie
            todo={taskStatusCounts.TODO}
            inProgress={taskStatusCounts.IN_PROGRESS}
            completed={taskStatusCounts.DONE}
          />
        </div>
      </div>

      <Card className="flex shrink-0 flex-col overflow-hidden md:h-[200px]">
        <CardHeader className="shrink-0 p-3 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm md:text-base">最近任务</CardTitle>
            <Link href="/tasks">
              <Button variant="outline" size="sm" className="h-7 text-xs">查看全部</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto p-3 pt-0 scrollbar-thin">
          {recentTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">还没有任务，去创建一个吧！</p>
          ) : (
            <ul className="space-y-2">
              {recentTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-2 md:p-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        task.status === "DONE" ? "bg-green-500" : "bg-amber-500"
                      }`}
                    />
                    <span className={`text-sm ${task.status === "DONE" ? "line-through" : ""}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground md:text-sm">
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
