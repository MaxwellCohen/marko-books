import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, evidence } from "./helpers";

const STATIC_MARKER = "FT_STATIC_ONLY_MARKER_93ad";

test("interactive island works; static component code is not shipped", async ({ page }) => {
  const scripts: string[] = [];
  page.on("response", async (r) => {
    if (r.request().resourceType() === "script") scripts.push(await r.text().catch(() => ""));
  });
  await page.goto("/feature-tests/islands");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#static-panel")).toContainText(STATIC_MARKER);
  await expect(async () => {
    await page.click("#island");
    await expect(page.locator("#island")).toContainText(/clicks: [1-9]/, { timeout: 500 });
  }).toPass();
  expect(scripts.length).toBeGreaterThan(0);
  expect(scripts.filter((s) => s.includes(STATIC_MARKER))).toEqual([]);

  const assetsDir = join(ROOT, "dist/public/assets");
  const js = readdirSync(assetsDir).filter((f) => f.endsWith(".js"));
  const leaking = js.filter((f) => readFileSync(join(assetsDir, f), "utf8").includes(STATIC_MARKER));
  expect(leaking).toEqual([]);
  evidence(`island counter updates after resume; ${STATIC_MARKER} absent from ${scripts.length} loaded scripts and all ${js.length} client chunks in dist/public/assets`);
});
