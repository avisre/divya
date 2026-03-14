import { expect, test, type Page } from "@playwright/test";

async function registerAndEnterSessions(page: Page) {
  const unique = Date.now();

  await page.goto("/register");
  await page.getByLabel("Name").fill("Family Session User");
  await page.getByLabel("Email").fill(`session+${unique}@example.com`);
  await page.getByLabel("Password").fill("Sacred#2026");
  await page.getByLabel("Country").fill("United States");
  await page.getByLabel("Timezone").fill("America/New_York");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByRole("button", { name: /Skip for now/i }).click();
  await expect(page).toHaveURL(/\/home/);
  await page.goto("/sessions/create");
  await expect(page).toHaveURL(/\/shared-prayer\/create/);
}

test("authenticated users can create a shared room and get the WhatsApp share CTA", async ({ page }) => {
  await registerAndEnterSessions(page);

  await page.locator(".shared-prayer-create__catalog .selection-card").first().click();
  await page.getByRole("button", { name: /Create prayer room/i }).click();

  await expect(page.locator(".session-code-panel__code")).toBeVisible();
  await expect(page.getByRole("link", { name: /Share via WhatsApp/i })).toHaveAttribute(
    "href",
    /wa\.me/
  );
  await expect(page.getByRole("link", { name: /Open prayer room/i })).toBeVisible();
});
