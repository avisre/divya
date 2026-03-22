import { expect, test } from "@playwright/test";

test("public users can open Learn and see Bhakt gating on deeper entries", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("nav-learn").click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByTestId("learn-index")).toBeVisible();

  await page.goto("/learn/murugan");
  await expect(page.getByTestId("learn-entry-preview")).toBeVisible();
  await expect(page.getByTestId("learn-paywall-cta")).toHaveAttribute("href", "/plans?highlight=bhakt");
});
