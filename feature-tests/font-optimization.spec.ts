import { expect, test } from "@playwright/test";
import { evidence } from "./helpers";

test("self-hosted Fontsource font with font-display and preload", async ({ page, request }) => {
  const urls: string[] = [];
  page.on("request", (r) => urls.push(r.url()));
  await page.goto("/feature-tests/font-optimization");
  await page.evaluate(() => document.fonts.ready);
  expect(urls.filter((u) => /fonts\.(googleapis|gstatic)\.com/.test(u))).toEqual([]);

  const preload = page.locator('head link[rel="preload"][as="font"]');
  await expect(preload).toHaveCount(1);
  const href = (await preload.getAttribute("href"))!;
  expect(href.startsWith("/")).toBe(true);
  const font = await request.get(href);
  expect(font.ok()).toBe(true);
  expect(font.headers()["content-type"]).toContain("font/woff2");

  const css = (
    await Promise.all(
      (await page.locator('link[rel="stylesheet"]').evaluateAll((ls) => ls.map((l) => (l as HTMLLinkElement).href))).map(
        async (u) => (await request.get(u)).text(),
      ),
    )
  ).join("\n");
  const faces = css.match(/@font-face\s*{[^}]*}/g) ?? [];
  const geist = faces.find((f) => f.includes(href.split("/").pop()!));
  expect(geist, "preloaded file is used by an @font-face").toBeTruthy();
  expect(geist).toMatch(/font-display:\s*swap/);
  expect(await page.evaluate(() => document.fonts.check('16px "Geist Variable"'))).toBe(true);
  expect(urls.some((u) => u.endsWith(href))).toBe(true);
  evidence(`no Google Fonts requests; preload ${href} (font/woff2, same origin) matches an @font-face with font-display: swap; Geist Variable loaded`);
});
