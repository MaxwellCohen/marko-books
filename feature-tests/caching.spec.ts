import { expect, test } from "@playwright/test";
import { evidence } from "./helpers";

test("Cache-Control from a Marko Run handler is honoured and expires", async ({ page }) => {
  await page.goto("/feature-tests/caching");
  const get = () =>
    page.evaluate(async () => {
      const r = await fetch("/feature-tests/caching/data");
      return { cc: r.headers.get("cache-control"), ...(await r.json()) } as { cc: string; value: number; hits: number };
    });
  const a = await get();
  const b = await get();
  expect(a.cc).toBe("public, max-age=3, s-maxage=3");
  expect(b.value).toBe(a.value);
  expect(b.hits).toBe(a.hits); // the server was not hit again
  await page.waitForTimeout(3500);
  const c = await get();
  expect(c.value).not.toBe(a.value);
  expect(c.hits).toBe(a.hits + 1);
  evidence(`"${a.cc}": 2nd fetch reused value ${a.value} (server hits ${a.hits}); after 3.5s fresh value, hits ${c.hits}. Headers hand-set in Run.GET; no Marko data cache API`);
});
