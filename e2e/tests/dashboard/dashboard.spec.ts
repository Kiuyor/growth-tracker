import { test, expect } from "../../fixtures/auth";

test.describe("仪表盘", () => {
  test("加载仪表盘核心组件", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 统计卡片
    await expect(page.getByText("总积分")).toBeVisible();
    await expect(page.getByText("连续打卡")).toBeVisible();
    await expect(page.getByText("总任务")).toBeVisible();

    // 周趋势图表区域
    await expect(page.getByText("本周趋势")).toBeVisible();

    // 导航到统计页面链接
    await expect(page.getByText("查看完整统计")).toBeVisible();
  });

  test("点击查看统计跳转到 /stats", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.click('a[href="/stats"]');
    await expect(page).toHaveURL("/stats");
    await expect(page.locator("h2")).toContainText("统计");
  });
});
