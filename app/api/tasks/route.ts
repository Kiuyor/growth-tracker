import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tasks?status=&priority=&category=
export async function GET(request: Request) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const category = searchParams.get("category");

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.userId,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(category ? { category } : {}),
    },
    include: { subtasks: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

// POST /api/tasks
export async function POST(request: Request) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    title,
    description,
    priority,
    deadline,
    category,
    points,
    subtasks,
  } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      userId: session.userId,
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || "MEDIUM",
      status: "TODO",
      deadline: deadline ? new Date(deadline) : null,
      category: category?.trim() || null,
      points: Number(points) || 0,
      subtasks: {
        create:
          subtasks?.map((s: { title: string }) => ({
            title: s.title.trim(),
          })) || [],
      },
    },
    include: { subtasks: true },
  });

  return NextResponse.json(task, { status: 201 });
}
