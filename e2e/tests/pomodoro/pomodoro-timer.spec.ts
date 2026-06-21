import { test, expect } from "../../fixtures/auth";

test.describe("番茄钟", () => {
  test("加载番茄钟页面", async ({ page }) => {
    await page.goto("/pomodoro");
    await page.waitForLoadState("networkidle");

    // 番茄钟页面核心元素
    await expect(page.getByText("番茄钟")).toBeVisible();
  });

  test("番茄钟模式切换 (倒计时 / 正计时)", async ({ page }) => {
    await page.goto("/pomodoro");
    await page.waitForLoadState("networkidle");

    // 切换计时模式
    const modeButtons = page.locator('[role="radio"]');
    const count = await modeButtons.count();
    if (count >= 2) {
      await modeButtons.nth(1).click();
      await page.waitForTimeout(500);
    }
  });
});
