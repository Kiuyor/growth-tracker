import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcPomodoroPoints } from "@/lib/pomodoro-rules";
import type { TimerMode } from "@/types";
import { withAuth } from "@/lib/api/with-auth";

// POST /api/pomodoro - 开始一个番茄钟
export const POST = withAuth(async (userId, request) => {
  const body = await request.json();
  const { duration, taskId, mode } = body as {
    duration?: number;
    taskId?: string;
    mode?: TimerMode;
  };

  if (!duration || duration < 1 || duration > 180) {
    return NextResponse.json(
      { error: "Duration must be between 1 and 180 minutes" },
      { status: 400 }
    );
  }

  try {
    const pomodoro = await prisma.$transaction(async (tx) => {
      if (taskId) {
        const task = await tx.task.findFirst({
          where: { id: taskId, userId },
        });
        if (!task) {
          throw new Error("TASK_NOT_FOUND");
        }
      }

      return tx.pomodoro.create({
        data: {
          userId,
          duration,
          taskId: taskId || null,
          startedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      ...pomodoro,
      mode: mode || "COUNTDOWN",
    }, { status: 201 });
  } catch (err) {
    logger.error("Pomodoro start error:", err);
    const message = err instanceof Error ? err.message : "";
    if (message === "TASK_NOT_FOUND") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
});

// GET /api/pomodoro - 获取历史列表
export const GET = withAuth(async (userId, request) => {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

  const pomodoros = await prisma.pomodoro.findMany({
    where: { userId, endedAt: { not: null } },
    orderBy: { startedAt: "desc" },
    take: limit,
    skip: offset,
    include: { task: true },
  });

  const mapped = pomodoros.map((p) => ({
    id: p.id,
    userId: p.userId,
    duration: p.duration,
    taskId: p.taskId,
    startedAt: p.startedAt.toISOString(),
    endedAt: p.endedAt ? p.endedAt.toISOString() : null,
    taskTitle: p.task?.title || null,
    points: calcPomodoroPoints(p.duration),
  }));

  return NextResponse.json(mapped);
});
