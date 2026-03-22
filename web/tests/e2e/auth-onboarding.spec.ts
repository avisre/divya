import { expect, test, type Page } from "@playwright/test";

async function registerUser(page: Page) {
  const unique = Date.now();

  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E Devotee");
  await page.getByLabel("Email").fill(`e2e+${unique}@example.com`);
  await page.getByLabel("Password").fill("Sacred#2026");
  await page.getByLabel("Country").fill("United States");
  await page.getByLabel("Timezone").fill("America/New_York");
  await page.getByRole("button", { name: "Create account" }).click();
}

test("registration shows the welcome screen and routes into the prayer library", async ({ page }) => {
  await registerUser(page);

  await expect(page).toHaveURL(/\/welcome/);
  await expect(page.getByRole("heading", { name: /Namaste/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Explore prayers/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open prayer library/i })).toBeVisible();
  await page.getByRole("link", { name: /Open prayer library/i }).click();

  await expect(page).toHaveURL(/\/prayers/);
});
