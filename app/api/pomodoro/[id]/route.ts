import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addPoints } from "@/lib/points-engine";
import { calcPomodoroPoints } from "@/lib/pomodoro-rules";

// PATCH /api/pomodoro/[id] - 结束或放弃番茄钟
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action, actualMinutes, completeTask } = body as {
    action?: "COMPLETE" | "ABORT";
    actualMinutes?: number;
    completeTask?: boolean;
  };

  if (!action || !["COMPLETE", "ABORT"].includes(action)) {
    return NextResponse.json(
      { error: "Action must be COMPLETE or ABORT" },
      { status: 400 }
    );
  }

  if (action === "COMPLETE" && (actualMinutes === undefined || actualMinutes < 0)) {
    return NextResponse.json(
      { error: "actualMinutes is required and must be >= 0" },
      { status: 400 }
    );
  }

  const pomodoro = await prisma.pomodoro.findFirst({
    where: { id, userId: session.userId },
    include: { task: true },
  });

  if (!pomodoro) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (pomodoro.endedAt) {
    return NextResponse.json(
      { error: "Pomodoro already ended" },
      { status: 409 }
    );
  }

  const finalMinutes = action === "COMPLETE" ? Math.max(0, Math.floor(actualMinutes!)) : 0;
  const endedAt = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.pomodoro.update({
      where: { id },
      data: {
        duration: finalMinutes,
        endedAt,
      },
      include: { task: true },
    });

    let pointsResult = null;
    let taskCompleted = false;

    if (action === "COMPLETE") {
      const points = calcPomodoroPoints(finalMinutes);
      if (points > 0) {
        pointsResult = await addPoints({
          userId: session.userId,
          amount: points,
          source: "POMODORO",
          sourceId: id,
          description: `番茄钟专注 ${finalMinutes} 分钟`,
        });
      }

      if (completeTask && updated.taskId && updated.task && updated.task.status !== "DONE") {
        await tx.task.update({
          where: { id: updated.taskId },
          data: { status: "DONE" },
        });

        if (updated.task.points > 0) {
          await addPoints({
            userId: session.userId,
            amount: updated.task.points,
            source: "TASK_COMPLETE",
            sourceId: updated.taskId,
            description: `完成任务：${updated.task.title}`,
          });
        }

        taskCompleted = true;
      }
    }

    return { updated, pointsResult, taskCompleted };
  });

  return NextResponse.json({
    pomodoro: {
      ...result.updated,
      startedAt: result.updated.startedAt.toISOString(),
      endedAt: result.updated.endedAt ? result.updated.endedAt.toISOString() : null,
    },
    points: result.pointsResult,
    taskCompleted: result.taskCompleted,
  });
}
