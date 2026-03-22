import { expect, test } from "@playwright/test";

test("public prayer playback stays on-page and navigation still works while audio is active", async ({
  page
}) => {
  await page.goto("/prayers/kerala-bhagavathi-stuti");

  await expect(page.getByRole("heading", { name: "Kerala Bhagavathi Stuti" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play audio" })).toBeVisible();

  await page.getByRole("button", { name: "Play audio" }).click();

  await expect(page.getByRole("button", { name: "Pause audio" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Follow along" })).toHaveClass(/chip-toggle--active/);
  await expect(
    page.getByText("Roman letters stay on top for pronunciation.", { exact: false })
  ).toBeVisible();

  await page.locator("header a.brand").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /A devotional home for NRI families/i })).toBeVisible();
});
