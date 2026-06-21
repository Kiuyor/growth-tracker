/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";

/**
 * 扩展 Playwright test fixture，自动处理 Clerk 认证。
 *
 * 用法:
 *   import { test } from "@/e2e/fixtures/auth";
 *   test("已登录状态测试", async ({ page }) => {
 *     await page.goto("/tasks");
 *     await expect(page.locator("h2")).toContainText("任务管理");
 *   });
 */

export const test = base.extend({
  page: async ({ page }, use) => {
    // 设置 Clerk 测试 token，绕过 OAuth 流程
    await setupClerkTestingToken({ page });

    // 导航到首页触发 Clerk 认证
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 将已认证的 page 传递给测试
    await use(page);
  },
});

export { expect };
