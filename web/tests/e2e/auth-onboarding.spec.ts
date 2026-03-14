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

test("registration shows onboarding and routes into the first prayer flow", async ({ page }) => {
  await registerUser(page);

  await expect(page).toHaveURL(/\/onboarding/);
  await expect(page.getByRole("heading", { name: /Where is your family based/i })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: /Choose the deities you want to keep closest/i })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: /Begin with one prayer today/i })).toBeVisible();
  await page.getByRole("button", { name: /Open prayer now/i }).click();

  await expect(page).toHaveURL(/\/prayers\//);
  await expect(page.getByRole("link", { name: /Start a shared session/i })).toBeVisible();
});
