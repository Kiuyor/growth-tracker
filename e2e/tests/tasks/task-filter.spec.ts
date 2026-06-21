import { test, expect } from "../../fixtures/auth";

test.describe("任务筛选", () => {
  test("按状态筛选任务", async ({ page }) => {
    await page.goto("/tasks");
    await page.waitForLoadState("networkidle");

    // 筛选器应该存在
    await expect(page.locator("select")).toBeVisible();
  });

  test("空状态提示", async ({ page }) => {
    // 访问一个不可能有任务的筛选条件
    await page.goto("/tasks?status=DONE&priority=HIGH&category=不存在");
    await page.waitForLoadState("networkidle");

    // 应该有提示或空状态
    const emptyState = page.getByText("暂无任务");
    await expect(emptyState).toBeVisible();
  });
});
