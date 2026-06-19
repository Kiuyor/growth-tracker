import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TaskList } from "@/components/task/task-list";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; category?: string }>;
}) {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const { status, priority, category } = await searchParams;

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">任务管理</h2>
      <TaskList
        tasks={tasks as unknown as import("@/types").Task[]}
        status={status || ""}
        priority={priority || ""}
        category={category || ""}
      />
    </div>
  );
}
