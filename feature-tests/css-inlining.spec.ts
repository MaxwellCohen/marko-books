import { expect, test } from "@playwright/test";
import { evidence } from "./helpers";

const MARKER = "ft-inline-marker-7c1f";

test("route CSS is an inline <style>, not a stylesheet link", async ({ page, request }) => {
  const html = await (await request.get("/feature-tests/css-inlining")).text();
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  expect(styles.some((s) => s.includes(`.${MARKER}`))).toBe(true);

  const links = [...html.matchAll(/<link[^>]*rel="?stylesheet"?[^>]*>/g)].map((m) => m[0].match(/href="?([^"\s>]+)/)![1]);
  for (const href of links) {
    expect(await (await request.get(href)).text()).not.toContain(MARKER);
  }

  await page.goto("/feature-tests/css-inlining");
  await expect(page.locator(`.${MARKER}`)).toHaveCSS("color", "rgb(1, 2, 3)");
  evidence(`inline <style> holds .${MARKER} (applied: color rgb(1,2,3)); ${links.length} stylesheet link(s) (${links.join(", ")}) don't contain it`);
});
