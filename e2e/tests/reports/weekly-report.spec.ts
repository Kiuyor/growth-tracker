import { test, expect } from "../../fixtures/auth";

test.describe("周报", () => {
  test("加载周报页面", async ({ page }) => {
    await page.goto("/reports/weekly");
    await page.waitForLoadState("networkidle");

    // 周报页面核心内容
    await expect(page.getByText("周报")).toBeVisible();
  });

  test("周报包含统计卡片", async ({ page }) => {
    await page.goto("/reports/weekly");
    await page.waitForLoadState("networkidle");

    // 应该有专注时长统计
    await expect(page.getByText("专注时长")).toBeVisible();
  });

  test("/reports 重定向到周报", async ({ page }) => {
    await page.goto("/reports");
    await page.waitForLoadState("networkidle");

    // 应该自动跳转到 /reports/weekly
    await expect(page).toHaveURL(/\/reports\/weekly/);
  });
});
