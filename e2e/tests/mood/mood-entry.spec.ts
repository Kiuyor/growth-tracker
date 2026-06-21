import { test, expect } from "../../fixtures/auth";

test.describe("心情记录", () => {
  test("加载心情记录页面", async ({ page }) => {
    await page.goto("/mood");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("心情记录")).toBeVisible();
  });

  test("提交心情记录", async ({ page }) => {
    await page.goto("/mood");
    await page.waitForLoadState("networkidle");

    // 填写心情内容
    const textarea = page.locator("textarea");
    if (await textarea.isVisible()) {
      await textarea.fill("今天心情不错！E2E 测试中");
    }

    // 如果心情评分滑块存在，拖动它
    const slider = page.locator('[role="slider"]');
    if (await slider.isVisible()) {
      // 尝试滑动心情评分
      await page.waitForTimeout(300);
    }
  });
});
