import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TaskList } from "@/components/task/task-list";
import type { Task } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "任务管理 | 成长追踪",
  description: "创建和管理你的待办任务，设定优先级和截止日期",
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; category?: string }>;
}) {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const { status, priority, category } = await searchParams;

  const rawTasks = await prisma.task.findMany({
    where: {
      userId: session.userId,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(category ? { category } : {}),
    },
    include: { subtasks: true },
    orderBy: { createdAt: "desc" },
  });

  const tasks: Task[] = rawTasks.map((t) => ({
    ...t,
    priority: t.priority as Task["priority"],
    status: t.status as Task["status"],
    deadline: t.deadline ? t.deadline.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    subtasks: t.subtasks.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">任务管理</h2>
      <TaskList
        tasks={tasks}
        status={status || ""}
        priority={priority || ""}
        category={category || ""}
      />
    </div>
  );
}
