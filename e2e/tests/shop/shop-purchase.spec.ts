import { test, expect } from "../../fixtures/auth";

test.describe("积分商城", () => {
  test("加载积分商城页面", async ({ page }) => {
    await page.goto("/shop");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("积分商城")).toBeVisible();
  });

  test("导航到背包", async ({ page }) => {
    await page.goto("/shop");
    await page.waitForLoadState("networkidle");

    // 点击背包链接
    const backpackLink = page.locator('a[href="/shop/inventory"]');
    if (await backpackLink.isVisible()) {
      await backpackLink.click();
      await expect(page).toHaveURL(/\/shop\/inventory/);
    }
  });
});

test.describe("背包管理", () => {
  test("加载背包页面", async ({ page }) => {
    await page.goto("/shop/inventory");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("我的背包")).toBeVisible();
  });
});
