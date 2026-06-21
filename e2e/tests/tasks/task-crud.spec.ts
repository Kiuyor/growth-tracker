import { test, expect } from "../../fixtures/auth";
import { createTask, completeTask, deleteTask } from "../../fixtures/data";

test.describe("任务 CRUD", () => {
  let taskId: string;

  test.afterAll(async ({ request }) => {
    if (taskId) {
      await request.delete(`/api/tasks/${taskId}`);
    }
    taskId = "";
  });

  test("创建任务", async ({ page }) => {
    await page.goto("/tasks");
    await page.waitForLoadState("networkidle");

    // 点击新建任务
    await page.click('a[href="/tasks/new"]');
    await expect(page.locator("h2")).toContainText("新建任务");

    // 填写表单
    await page.fill('input[name="title"]', "E2E 测试任务");
    await page.fill('textarea[name="description"]', "这是一个 Playwright 自动创建的测试任务");
    await page.selectOption('select[name="priority"]', "HIGH");
    await page.fill('input[name="points"]', "10");

    // 提交
    await page.click('button[type="submit"]');

    // 应该跳转回任务列表，新任务出现
    await expect(page).toHaveURL("/tasks");
    await expect(page.getByText("E2E 测试任务")).toBeVisible();

    // 通过 API 获取 id 用于后续清理
    const res = await request.get("/api/tasks?status=TODO");
    const tasks = (await res.json()) as { id: string; title: string }[];
    const created = tasks.find((t) => t.title === "E2E 测试任务");
    if (created) taskId = created.id;
  });

  test("完成和删除任务", async ({ page }) => {
    // 先通过 API 创建一个待完成任务
    const { id } = await createTask(page, {
      title: "E2E 完成测试",
      priority: "MEDIUM",
      points: 5,
    });

    await page.goto("/tasks");
    await page.waitForLoadState("networkidle");

    // 验证任务存在
    await expect(page.getByText("E2E 完成测试")).toBeVisible();

    // 通过 API 完成任务
    await completeTask(page, id);

    // 通过 API 删除任务
    await deleteTask(page, id);

    // 刷新页面，确认任务已删除
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("E2E 完成测试")).toHaveCount(0);
  });
});
