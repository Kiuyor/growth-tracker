import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/with-auth";

// GET /api/tasks/[id]
export const GET = withAuth(async (userId, _request, { params }) => {
  const { id } = await params;
  const task = await prisma.task.findFirst({
    where: { id, userId },
    include: { subtasks: true },
  });

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(task);
});

// PUT /api/tasks/[id]
export const PUT = withAuth(async (userId, request, { params }) => {
  const { id } = await params;
  const existing = await prisma.task.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const {
    title,
    description,
    priority,
    status,
    deadline,
    category,
    points,
    subtasks,
  } = body as {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    deadline?: string;
    category?: string;
    points?: number | string;
    subtasks?: { id?: string; title: string; completed?: boolean }[];
  };

  // Diff-merge subtasks：保留已存在项的 completed 状态，新增没有的，删除不再传的
  const task = await prisma.$transaction(async (tx) => {
    const existingSubtasks = await tx.subtask.findMany({
      where: { taskId: id },
    });

    const incoming = subtasks || [];
    const incomingIds = new Set(
      incoming.map((s) => s.id).filter(Boolean) as string[]
    );

    const toDelete = existingSubtasks.filter((s) => !incomingIds.has(s.id));
    const toUpdate = incoming.filter((s) =>
      existingSubtasks.some((es) => es.id === s.id)
    );
    const toCreate = incoming.filter((s) => !s.id);

    await Promise.all([
      ...toDelete.map((s) => tx.subtask.delete({ where: { id: s.id } })),
      ...toUpdate.map((s) =>
        tx.subtask.update({
          where: { id: s.id },
          data: {
            title: s.title.trim(),
            completed: s.completed ?? false,
          },
        })
      ),
    ]);

    return tx.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() || existing.title : existing.title,
        description:
          description !== undefined
            ? description.trim() || null
            : existing.description,
        priority: priority !== undefined ? priority : existing.priority,
        status: status !== undefined ? status : existing.status,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : existing.deadline,
        category:
          category !== undefined
            ? category.trim() || null
            : existing.category,
        points: points !== undefined ? Number(points) : existing.points,
        subtasks: {
          create: toCreate.map((s) => ({
            title: s.title.trim(),
            completed: s.completed ?? false,
          })),
        },
      },
      include: { subtasks: true },
    });
  });

  return NextResponse.json(task);
});

// DELETE /api/tasks/[id]
export const DELETE = withAuth(async (userId, _request, { params }) => {
  const { id } = await params;
  const existing = await prisma.task.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
