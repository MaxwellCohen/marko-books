import { expect, test } from "@playwright/test";
import { evidence } from "./helpers";

test("state change updates only bound text; nothing re-runs", async ({ page }) => {
  await page.goto("/feature-tests/reactivity");
  await page.waitForFunction(() => (window as any).__ftProbe?.mounts === 1);
  await page.evaluate(() => {
    const w = window as any;
    w.__ftMutations = [];
    new MutationObserver((ms) =>
      ms.forEach((m) => {
        const el = m.target.nodeType === 1 ? (m.target as Element) : m.target.parentElement;
        w.__ftMutations.push(el?.id || el?.tagName);
      }),
    ).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true });
  });
  for (let i = 0; i < 3; i++) await page.click("#inc");
  await expect(page.locator("#count")).toHaveText("3");
  await expect(page.locator("#doubled")).toHaveText("6");
  const probe = await page.evaluate(() => (window as any).__ftProbe);
  const touched = [...new Set(await page.evaluate(() => (window as any).__ftMutations as string[]))].sort();
  expect(probe).toEqual({ mounts: 1, boundEvals: 3, staticEvals: 0 });
  expect(touched).toEqual(["count", "doubled"]);
  evidence(`3 clicks: mount effect ran 1x, dependent <const> evaluated 3x, unrelated <const> 0x on client; DOM mutations only in #count/#doubled`);
});
