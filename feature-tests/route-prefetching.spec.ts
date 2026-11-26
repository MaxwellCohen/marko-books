import { expect, test } from "@playwright/test";
import { evidence } from "./helpers";

test("hovering a link prefetches the target document before click", async ({ page }) => {
  const TARGET = "/feature-tests/route-prefetching/target";
  const seen: { at: number; purpose?: string }[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname === TARGET) seen.push({ at: Date.now(), purpose: r.headers()["sec-purpose"] });
  });
  await page.goto("/feature-tests/route-prefetching");
  await page.waitForLoadState("networkidle");
  expect(seen).toEqual([]);
  await page.hover("#target-link");
  await expect.poll(() => seen.length, { timeout: 5000 }).toBeGreaterThan(0);
  const clickAt = Date.now();
  expect(seen[0].at).toBeLessThan(clickAt);
  await page.click("#target-link");
  await expect(page).toHaveURL(new RegExp(`${TARGET}$`));
  evidence(`Speculation Rules (moderate) fetched ${TARGET} on hover, ${clickAt - seen[0].at}ms before click (Sec-Purpose: ${seen[0].purpose ?? "n/a"})`);
});
