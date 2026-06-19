import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TaskForm } from "@/components/task/task-form";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const { id } = await params;
  const task = await prisma.task.findFirst({
    where: { id, userId: session.userId },
    include: { subtasks: true },
  });

  if (!task) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">编辑任务</h2>
      <TaskForm
        initialData={{
          ...task,
          deadline: task.deadline ? task.deadline.toISOString() : null,
        }}
      />
    </div>
  );
}
