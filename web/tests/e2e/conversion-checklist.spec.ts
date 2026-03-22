import { expect, test, type Page } from "@playwright/test";

async function registerAndContinueToHome(page: Page) {
  const unique = Date.now();

  await page.goto("/register");
  await page.getByLabel("Name").fill("Conversion Audit User");
  await page.getByLabel("Email").fill(`conversion+${unique}@example.com`);
  await page.getByLabel("Password").fill("Sacred#2026");
  await page.getByLabel("Country").fill("United States");
  await page.getByLabel("Timezone").fill("America/New_York");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/welcome/);
  await page.getByRole("link", { name: /See today's timing/i }).click();
  await expect(page).toHaveURL(/\/home/);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
}

test("public landing and plans pages keep the conversion changes intact on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto("/");

  await expect(page.getByRole("link", { name: "Start free - no card needed" })).toBeVisible();
  await expect(page.locator(".hero__actions .button")).toHaveCount(1);
  await expect(page.getByRole("main").getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(page.getByText("Free to begin. Upgrade only when your family is ready.")).toBeVisible();
  await expect(page.getByText("Serving NRI families across the UK, US, Canada, UAE, and Australia")).toBeVisible();
  await expect(page.getByRole("heading", { name: "How Prarthana works" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What brings your family here today?" })).toBeVisible();
  await expect(page.getByText("Compare plans")).toHaveCount(0);
  await expect(page.getByText(/families have booked/i)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Sessions" })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);

  await expect(page.getByRole("link", { name: "Upcoming festival Open ->" })).toHaveAttribute(
    "href",
    "/pujas?occasion=festival"
  );
  await page.goto("/pujas?occasion=festival");
  await expect(page).toHaveURL(/\/pujas(\?occasion=festival)?/);
  await expectNoHorizontalOverflow(page);

  await page.goto("/plans");
  await page.getByRole("button", { name: "Annual" }).click();
  await expect(page.getByText(/Save\s+£\d+/)).toHaveCount(2);
  await expectNoHorizontalOverflow(page);
});

test("authenticated devotees can open the gift puja flow from a puja detail page", async ({ page }) => {
  await registerAndContinueToHome(page);

  await page.goto("/pujas");
  await Promise.all([
    page.waitForURL(/\/pujas\/.+/),
    page.getByRole("link", { name: "View puja" }).first().click()
  ]);

  await expect(page.getByRole("button", { name: /Book this as a gift/i })).toBeVisible();
  await page.getByRole("button", { name: /Book this as a gift/i }).click();

  await expect(page.getByLabel("Recipient's name")).toBeVisible();
  await expect(page.getByLabel("Send gift confirmation to")).toBeVisible();
  await expect(page.getByLabel("Your message")).toBeVisible();
});
