import { expect, test } from "@playwright/test";
import { evidence, text } from "./helpers";

const ts = (html: string) => Number(text(html).match(/<span id="?ts"?>(\d+)/)![1]);

test("SSR per request, static (+meta → CDN headers), client-only", async ({ page, request }) => {
  const s1 = await request.get("/feature-tests/render-modes");
  await new Promise((r) => setTimeout(r, 20));
  const s2 = await request.get("/feature-tests/render-modes");
  expect(ts(await s2.text())).toBeGreaterThan(ts(await s1.text()));
  expect(s1.headers()["cache-control"]).toContain("no-store");

  const st = await request.get("/feature-tests/render-modes/static");
  expect(st.headers()["cache-control"]).toBe("public, s-maxage=31536000");

  const clientHtml = await (await request.get("/feature-tests/render-modes/client")).text();
  expect(clientHtml).not.toContain("client-rendered at");
  await page.goto("/feature-tests/render-modes/client");
  await expect(page.locator("#client-out")).toContainText("client-rendered at");
  evidence(`SSR timestamp changes per request (no-store); static route gets "${st.headers()["cache-control"]}" via +meta.json+middleware (still SSR at origin, no prerendered file); client-only text absent from HTML, rendered after mount`);
});
