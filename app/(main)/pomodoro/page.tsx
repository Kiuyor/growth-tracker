import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PomodoroClient } from "./pomodoro-client";

export default async function PomodoroPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const userId = session.userId;

  const [pomodoros, stats, tasks] = await Promise.all([
    prisma.pomodoro.findMany({
      where: { userId, endedAt: { not: null } },
      orderBy: { startedAt: "desc" },
      take: 20,
      include: { task: true },
    }),
    (async () => {
      const { startOfDay, startOfWeek, endOfWeek } = await import("date-fns");
      const todayStart = startOfDay(new Date());
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

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
          where: { userId, endedAt: { not: null } },
        }),
      ]);

      return {
        todayMinutes: todayResult._sum.duration || 0,
        todayCount: todayResult._count.id || 0,
        weekMinutes: weekResult._sum.duration || 0,
        totalCount: totalResult || 0,
      };
    })(),
    prisma.task.findMany({
      where: {
        userId,
        status: { not: "DONE" },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { subtasks: true },
    }),
  ]);

  const history = pomodoros.map((p) => ({
    id: p.id,
    userId: p.userId,
    duration: p.duration,
    taskId: p.taskId,
    startedAt: p.startedAt.toISOString(),
    endedAt: p.endedAt ? p.endedAt.toISOString() : null,
    taskTitle: p.task?.title || null,
    points:
      p.duration >= 15
        ? p.duration >= 60
          ? 10
          : p.duration >= 45
          ? 8
          : p.duration >= 25
          ? 5
          : 3
        : 0,
  }));

  const initialTasks = tasks.map((t) => ({
    ...t,
    deadline: t.deadline ? t.deadline.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    subtasks: t.subtasks.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    })),
  }));

  return (
    <PomodoroClient
      initialHistory={history}
      initialStats={stats}
      initialTasks={initialTasks}
    />
  );
}
