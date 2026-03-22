import { expect, test } from "@playwright/test";

test("a registered user can sign in from a fresh browser session", async ({ browser }) => {
  const email = `login+${Date.now()}@example.com`;
  const password = "Sacred#2026";

  {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/register");
    await page.getByLabel("Name").fill("Login Audit User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByLabel("Country").fill("United States");
    await page.getByLabel("Timezone").fill("America/New_York");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/welcome/);

    await context.close();
  }

  {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByText(/Welcome back, Login Audit User/i)).toBeVisible();

    await context.close();
  }
});
