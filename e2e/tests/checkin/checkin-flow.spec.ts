import { test, expect } from "../../fixtures/auth";

test.describe("每日打卡", () => {
  test("通过 API 打卡成功", async ({ page }) => {
    // 先确认当前状态
    await page.goto("/checkin");
    await page.waitForLoadState("networkidle");

    // 通过 API 执行打卡
    const res = await page.request.post("/api/checkin");
    if (res.status() === 409) {
      // 今日已打卡，跳过测试
      test.skip(true, "今日已打卡");
    }
    expect(res.ok()).toBeTruthy();

    // 刷新页面，验证打卡状态
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("今日已打卡")).toBeVisible();
  });

  test("查看打卡热力图", async ({ page }) => {
    await page.goto("/checkin");
    await page.waitForLoadState("networkidle");

    // 热力图组件应该存在（按年份分组）
    await expect(page.getByText("打卡热力图")).toBeVisible();
  });
});
