import { expect, test } from "@playwright/test";

test("new user can move from welcome into the guided introduction and complete it", async ({ page }) => {
  const unique = Date.now();

  await page.goto("/register");
  await page.getByLabel("Name").fill("Guided Flow User");
  await page.getByLabel("Email").fill(`guided-flow+${unique}@example.com`);
  await page.getByLabel("Password").fill("Sacred#2026");
  await page.getByLabel("Country").fill("United States");
  await page.getByLabel("Timezone").fill("America/New_York");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/welcome/);
  await expect(page.getByTestId("welcome-screen")).toBeVisible();

  await page.getByTestId("welcome-dismiss").click();

  await expect(page.getByTestId("guided-overlay")).toBeVisible();
  await expect(page.getByTestId("guided-step-indicator")).toContainText("Step 1 of 5");

  await page.getByTestId("guided-continue").click();
  await expect(page).toHaveURL(/\/prayers/);
  await expect(page.locator('[data-guided-target="starter-prayer-card"]')).toBeVisible();

  await page.getByTestId("guided-continue").click();
  await expect(page).toHaveURL(/\/prayers\/.+/);

  await page.getByTestId("guided-continue").click();
  await expect(page).toHaveURL(/\/pujas/);
  await expect(page.locator('[data-guided-target="starter-puja-card"]')).toBeVisible();

  await page.getByTestId("guided-continue").click();
  await expect(page).toHaveURL(/\/pujas\/.+/);

  await page.getByTestId("guided-continue").click();
  await expect(page).toHaveURL(/\/profile/);

  await page.getByTestId("guided-family-name-input").fill("Flow Family");
  await page.getByTestId("guided-save-continue").click();
  await expect(page).toHaveURL(/\/home/);

  await page.getByTestId("guided-flow-complete-cta").click();
  await expect(page).toHaveURL(/\/prayers/);
  await expect(page.getByTestId("guided-overlay")).toHaveCount(0);
});

test("plans highlight query styles the requested card", async ({ page }) => {
  await page.goto("/plans?highlight=seva");

  const sevaCard = page.getByTestId("plan-card-seva");
  await expect(sevaCard).toBeVisible();
  await expect(sevaCard).toHaveClass(/highlight/);
});
