import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tasks/[id]
export async function GET(
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
    include: { subtasks: true },
  });

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

// PUT /api/tasks/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.task.findFirst({
    where: { id, userId: session.userId },
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
  } = body;

  // 先删除旧子任务，再创建新的
  await prisma.subtask.deleteMany({ where: { taskId: id } });

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: title?.trim() || existing.title,
      description: description?.trim() || null,
      priority: priority || existing.priority,
      status: status || existing.status,
      deadline: deadline ? new Date(deadline) : null,
      category: category?.trim() || null,
      points: Number(points) ?? existing.points,
      subtasks: {
        create:
          subtasks?.map((s: { title: string; completed?: boolean }) => ({
            title: s.title.trim(),
            completed: s.completed || false,
          })) || [],
      },
    },
    include: { subtasks: true },
  });

  return NextResponse.json(task);
}

// DELETE /api/tasks/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.task.findFirst({
    where: { id, userId: session.userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
