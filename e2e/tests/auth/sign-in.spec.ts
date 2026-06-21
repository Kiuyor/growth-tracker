import { test, expect } from "../../fixtures/auth";

test.describe("认证流程", () => {
  test("登录后跳转到仪表盘", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 验证仪表盘核心元素存在
    await expect(page.locator("h2").filter({ hasText: "仪表盘" })).toBeVisible();
    await expect(page.getByText("总积分")).toBeVisible();
  });

  test("未登录用户访问受保护页面被重定向", async ({ page, context }) => {
    // 清除 Cookies 模拟未登录
    await context.clearCookies();

    await page.goto("/tasks");
    // 应该被重定向到 /sign-in
    await expect(page).not.toHaveURL(/\/tasks/);
  });
});
