import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addPoints } from "@/lib/points-engine";
import { calcPomodoroPoints } from "@/lib/pomodoro-rules";
import type { TimerMode } from "@/types";

// POST /api/pomodoro - 开始一个番茄钟
export async function POST(request: Request) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  if (taskId) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: session.userId },
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
  }

  const pomodoro = await prisma.pomodoro.create({
    data: {
      userId: session.userId,
      duration,
      taskId: taskId || null,
      startedAt: new Date(),
    },
  });

  return NextResponse.json({
    ...pomodoro,
    mode: mode || "COUNTDOWN",
  }, { status: 201 });
}

// GET /api/pomodoro - 获取历史列表
export async function GET(request: Request) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

  const pomodoros = await prisma.pomodoro.findMany({
    where: { userId: session.userId, endedAt: { not: null } },
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
}
