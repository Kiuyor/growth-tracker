import type { Priority } from "@/types";

/**
 * 从 Prisma groupBy 聚合结果构建任务状态统计。
 * 统一 stats 页面和 stats API 中的任务统计逻辑。
 */

export type GroupByRow = {
  [key: string]: unknown;
  _count: { [key: string]: number };
};

export interface TaskStatusCounts {
  TODO: number;
  IN_PROGRESS: number;
  DONE: number;
  total: number;
}

export interface TaskPriorityCount {
  priority: Priority;
  count: number;
}

export interface TaskCategoryCount {
  category: string;
  count: number;
}

export function buildTaskStatusCounts(
  statusGroups: { status: string; _count: { status: number } }[]
): TaskStatusCounts {
  const counts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  statusGroups.forEach((g) => {
    if (g.status === "TODO" || g.status === "IN_PROGRESS" || g.status === "DONE") {
      counts[g.status] = g._count.status;
    }
  });
  return { ...counts, total: counts.TODO + counts.IN_PROGRESS + counts.DONE };
}

export function buildTaskPriorityCounts(
  priorityGroups: { priority: string; _count: { priority: number } }[]
): TaskPriorityCount[] {
  return priorityGroups.map((g) => ({
    priority: g.priority as Priority,
    count: g._count.priority,
  }));
}

export function buildTaskCategoryCounts(
  categoryGroups: { category: string | null; _count: { category: number } }[]
): TaskCategoryCount[] {
  return categoryGroups
    .filter((g) => g.category !== null)
    .map((g) => ({
      category: g.category!,
      count: g._count.category,
    }));
}
