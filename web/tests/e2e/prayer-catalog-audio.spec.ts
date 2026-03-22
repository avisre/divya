import { expect, test } from "@playwright/test";
import generatedPrayerCatalog from "../../lib/generated-prayer-catalog.json";

test("every prayer page is either playable for free users or correctly gated", async ({ page }) => {
  for (const entry of generatedPrayerCatalog) {
    await test.step(entry.slug, async () => {
      const isFreePrayer = Number(entry.order || 0) > 0 && Number(entry.order || 0) <= 10;
      const slug = entry.slug;
      await page.goto(`/prayers/${slug}`);

      if (!isFreePrayer) {
        await expect(page.getByTestId("prayer-paywall")).toBeVisible();
        await expect(page.getByRole("button", { name: "Play audio" })).toHaveCount(0);
        return;
      }

      await expect(page.getByRole("button", { name: "Play audio" })).toBeVisible();
      await page.getByRole("button", { name: "Play audio" }).click();

      await expect
        .poll(async () => {
          return page.locator("audio").evaluate((node) => {
            const audio = node as HTMLAudioElement;
            return {
              paused: audio.paused,
              currentTime: audio.currentTime,
              error: audio.error?.code || null
            };
          });
        })
        .toMatchObject({
          paused: false,
          error: null
        });

      await expect
        .poll(async () => {
          return page
            .locator("audio")
            .evaluate((node) => (node as HTMLAudioElement).currentTime)
            .catch(() => 0);
        }, {
          timeout: 5000
        })
        .toBeGreaterThan(0);

      await expect(page.getByRole("button", { name: "Follow along" })).toHaveClass(
        /chip-toggle--active/
      );
      await expect(page.locator(".reading-panel__translation").first()).toBeVisible();
    });
  }
});
