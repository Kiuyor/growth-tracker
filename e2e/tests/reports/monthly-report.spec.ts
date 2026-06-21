import { test, expect } from "../../fixtures/auth";

test.describe("月报", () => {
  test("加载月报页面", async ({ page }) => {
    await page.goto("/reports/monthly");
    await page.waitForLoadState("networkidle");

    // 月报页面核心内容
    await expect(page.getByText("月报")).toBeVisible();
  });

  test("月报包含统计卡片", async ({ page }) => {
    await page.goto("/reports/monthly");
    await page.waitForLoadState("networkidle");

    // 应该有专注时长统计
    await expect(page.getByText("专注时长")).toBeVisible();
  });
});
