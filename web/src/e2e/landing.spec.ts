import { test, expect } from "@playwright/test";

test("landing page renders primary value proposition", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /keep bhadra bhagavathi close/i })).toBeVisible();
});

test("home page loads daily sections from the live backend", async ({ page }) => {
  await page.goto("/home");
  await expect(page.getByRole("heading", { name: /keep one sacred rhythm today/i })).toBeVisible();
  await expect(page.getByText(/temple and bookings/i)).toBeVisible();
});

test("prayer library and temple pages render", async ({ page }) => {
  await page.goto("/prayers");
  await expect(page.getByRole("heading", { name: /read, listen, repeat, and return daily/i })).toBeVisible();
  await page.goto("/temple");
  await expect(page.getByText(/loading temple/i)).toBeVisible();
  await expect(page.getByText(/why this temple matters/i)).toBeVisible({ timeout: 20000 });
});

test("legal and support pages render from footer links", async ({ page }) => {
  await page.goto("/home");
  const footer = page.locator("footer.legal-footer");
  await footer.getByRole("link", { name: /^Sitemap$/i }).click();
  await expect(page.getByRole("heading", { name: /website sitemap/i })).toBeVisible();
  await footer.getByRole("link", { name: /^Privacy$/i }).click();
  await expect(page.getByRole("heading", { name: /privacy policy/i })).toBeVisible();
  await footer.getByRole("link", { name: /^Terms$/i }).click();
  await expect(page.getByRole("heading", { name: /terms of use/i })).toBeVisible();
  await footer.getByRole("link", { name: /^Contact us$/i }).click();
  await expect(page.getByRole("heading", { name: /contact divya support/i })).toBeVisible();
});

test("calendar and puja catalog pages render", async ({ page }) => {
  await page.goto("/calendar");
  await expect(page.getByRole("heading", { name: /festival preparation and daily auspiciousness/i })).toBeVisible();
  await page.goto("/pujas");
  await expect(page.getByRole("heading", { name: /join sacred waitlists for temple rituals/i })).toBeVisible();
  await expect(page.getByText(/puja catalog/i)).toBeVisible();
});

test("prayer detail core sections render", async ({ page }) => {
  await page.goto("/prayers");
  await page.getByRole("link", { name: /open prayer/i }).first().click();
  await expect(page.getByText(/loading prayer/i)).toBeVisible();
  await expect(page.getByText(/read along/i)).toBeVisible({ timeout: 20000 });
  await expect(page.getByText(/chant and count/i)).toBeVisible();
});

test("web player persists across routes after prayer playback starts", async ({ page }) => {
  await page.goto("/prayers/mahishasura-mardini");
  await page.getByRole("button", { name: /play audio/i }).click();
  await expect(page.locator("aside.mini-player")).toBeVisible({ timeout: 15000 });
  await expect(page.locator("aside.mini-player")).toContainText(/mahishasura mardini stotram/i);
  await page.getByRole("link", { name: /^Temple$/i }).first().click();
  await expect(page.locator("aside.mini-player")).toBeVisible({ timeout: 15000 });
  await expect(page.locator("aside.mini-player")).toContainText(/mahishasura mardini stotram/i);
});

test("protected profile route redirects to login", async ({ page }) => {
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /log in to your spiritual journey/i })).toBeVisible();
});
