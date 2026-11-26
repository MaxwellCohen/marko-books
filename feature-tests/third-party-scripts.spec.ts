import { expect, test } from "@playwright/test";
import { evidence } from "./helpers";

test("async + idle-injected scripts don't block first render and still run", async ({ page, request }) => {
  const html = await (await request.get("/feature-tests/third-party-scripts")).text();
  const head = html.slice(0, html.indexOf("</head>"));
  const tag = head.match(/<script[^>]*third-party-async\.js[^>]*>/)?.[0];
  expect(tag, "async script is in <head>").toBeTruthy();
  expect(tag).toMatch(/\basync\b/);
  expect(html).not.toContain("third-party-idle.js"); // injected later, not in the HTML

  // Hold both stand-in scripts for 2s: the page must render and finish DOM parsing first.
  const DELAY = 2000;
  let releasedAt = 0;
  await page.route(/third-party-(async|idle)\.js$/, async (route) => {
    await new Promise((r) => setTimeout(r, DELAY));
    releasedAt ||= Date.now();
    await route.continue();
  });
  const start = Date.now();
  await page.goto("/feature-tests/third-party-scripts", { waitUntil: "domcontentloaded" });
  const dclAt = Date.now();
  await expect(page.locator("#first-render")).toBeVisible();
  expect(dclAt - start).toBeLessThan(DELAY);
  expect(await page.evaluate(() => (window as any).__ftThirdPartyAsync)).toBeUndefined();

  await page.waitForFunction(() => (window as any).__ftThirdPartyAsync && (window as any).__ftThirdPartyIdle, null, { timeout: 15000 });
  const g = await page.evaluate(() => ({ a: (window as any).__ftThirdPartyAsync, i: (window as any).__ftThirdPartyIdle }));
  expect(releasedAt).toBeGreaterThan(dclAt);
  evidence(`<script async> in head + idle-injected script, both held ${DELAY}ms: DOMContentLoaded/first render at ${dclAt - start}ms; globals set later (async readyState=${g.a.readyState}, idle readyState=${g.i.readyState})`);
});
