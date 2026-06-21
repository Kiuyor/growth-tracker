import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addPoints } from "@/lib/points-engine";
import { withAuth } from "@/lib/api/with-auth";

// PATCH /api/tasks/[id]/complete
export const PATCH = withAuth(async (userId, _request, { params }) => {
  const { id } = await params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const currentTask = await tx.task.findFirst({
        where: { id, userId },
      });

      if (!currentTask) {
        throw new Error("TASK_NOT_FOUND");
      }

      if (currentTask.status === "DONE") {
        return { task: currentTask, pointResult: null };
      }

      const updated = await tx.task.update({
        where: { id },
        data: { status: "DONE" },
      });

      let pointResult = null;
      if (currentTask.points > 0) {
        pointResult = await addPoints({
          userId,
          amount: currentTask.points,
          source: "TASK_COMPLETE",
          sourceId: currentTask.id,
          description: `完成任务：${currentTask.title}`,
          tx,
        });
      }

      return { task: updated, pointResult };
    });

    return NextResponse.json({ task: result.task, points: result.pointResult });
  } catch (err) {
    logger.error("Complete task error:", err);
    const message = err instanceof Error ? err.message : "";
    if (message === "TASK_NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
});
