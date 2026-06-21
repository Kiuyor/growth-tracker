/**
 * 测试数据工厂 — 通过 API 创建/清理测试数据。
 *
 * 每个测试在独立的用户上下文中运行（Clerk 测试 session 自动提供 userId）。
 * 使用 API 端点来准备和清理数据，无需直接操作 Prisma。
 */

export interface TestTask {
  title: string;
  description?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  category?: string;
  points?: number;
}

/**
 * 通过 POST /api/tasks 创建测试任务
 */
export async function createTask(
  page: { request: { post: (url: string, options?: { data?: unknown }) => Promise<{ status: () => number; json: () => Promise<unknown> }> } },
  task: TestTask
): Promise<{ id: string }> {
  const res = await page.request.post("/api/tasks", {
    data: {
      title: task.title,
      description: task.description ?? "",
      priority: task.priority ?? "MEDIUM",
      category: task.category ?? null,
      points: task.points ?? 0,
    },
  });
  const data = (await res.json()) as { id: string };
  return { id: data.id };
}

/**
 * 通过 PATCH /api/tasks/[id]/complete 完成任务
 */
export async function completeTask(
  page: { request: { patch: (url: string) => Promise<{ status: () => number }> } },
  id: string
): Promise<void> {
  await page.request.patch(`/api/tasks/${id}/complete`);
}

/**
 * 通过 DELETE /api/tasks/[id] 删除任务
 */
export async function deleteTask(
  page: { request: { delete: (url: string) => Promise<{ status: () => number }> } },
  id: string
): Promise<void> {
  await page.request.delete(`/api/tasks/${id}`);
}

/**
 * 通过 POST /api/checkin 执行打卡
 */
export async function doCheckIn(
  page: { request: { post: (url: string) => Promise<{ status: () => number }> } }
): Promise<void> {
  await page.request.post("/api/checkin");
}
