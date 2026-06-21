import type { Prisma } from "@prisma/client";
import type { Task, Subtask } from "@/types";

/**
 * 将 Prisma 返回的 Date 类型序列化为前端使用的 string 类型。
 * 消除页面中的 `as unknown as` 类型强转。
 */

export function mapTask(
  t: Prisma.TaskGetPayload<{ include: { subtasks: true } }>
): Task {
  return {
    id: t.id,
    userId: t.userId,
    title: t.title,
    description: t.description,
    priority: t.priority as Task["priority"],
    status: t.status as Task["status"],
    deadline: t.deadline?.toISOString() ?? null,
    category: t.category,
    points: t.points,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    subtasks: t.subtasks.map(mapSubtask),
  };
}

export function mapSubtask(
  s: Prisma.SubtaskGetPayload<Record<string, never>>
): Subtask {
  return {
    id: s.id,
    taskId: s.taskId,
    title: s.title,
    completed: s.completed,
    createdAt: s.createdAt.toISOString(),
  };
}
