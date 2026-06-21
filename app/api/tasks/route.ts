import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/with-auth";

const VALID_PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;
type ValidPriority = (typeof VALID_PRIORITIES)[number];

// GET /api/tasks?status=&priority=&category=
export const GET = withAuth(async (userId, request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const category = searchParams.get("category");

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(category ? { category } : {}),
    },
    include: { subtasks: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
});

// POST /api/tasks
export const POST = withAuth(async (userId, request) => {
  try {
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

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json(
        { error: "Priority must be HIGH, MEDIUM, or LOW" },
        { status: 400 }
      );
    }

    if (subtasks && !Array.isArray(subtasks)) {
      return NextResponse.json(
        { error: "subtasks must be an array" },
        { status: 400 }
      );
    }

    if (subtasks && subtasks.length > 0) {
      for (const s of subtasks) {
        if (!s?.title?.trim() || typeof s.title !== "string") {
          return NextResponse.json(
            { error: "Each subtask must have a non-empty string title" },
            { status: 400 }
          );
        }
      }
    }

    const task = await prisma.task.create({
      data: {
        userId,
        title: title.trim(),
        description: description?.trim() || null,
        priority: (priority as ValidPriority) || "MEDIUM",
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
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建任务失败" },
      { status: 500 }
    );
  }
});
