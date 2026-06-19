import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addPoints } from "@/lib/points-engine";

// PATCH /api/tasks/[id]/complete
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const task = await prisma.task.findFirst({
    where: { id, userId: session.userId },
  });

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { status: "DONE" },
  });

  let pointResult = null;
  if (task.points > 0 && task.status !== "DONE") {
    pointResult = await addPoints({
      userId: session.userId,
      amount: task.points,
      source: "TASK_COMPLETE",
      sourceId: task.id,
      description: `完成任务：${task.title}`,
    });
  }

  return NextResponse.json({ task: updated, points: pointResult });
}
