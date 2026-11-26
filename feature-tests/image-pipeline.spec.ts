import { expect, test } from "@playwright/test";
import { evidence } from "./helpers";

test("srcset, dimensions, lazy offscreen image, modern formats", async ({ page, request }) => {
  const requested: string[] = [];
  page.on("request", (r) => requested.push(new URL(r.url()).pathname));
  await page.goto("/feature-tests/image-pipeline");
  await page.waitForLoadState("networkidle");

  const hero = page.locator("#hero");
  const srcset = (await hero.getAttribute("srcset"))!;
  const widths = [...srcset.matchAll(/\s(\d+)w/g)].map((m) => Number(m[1]));
  expect(widths.length).toBeGreaterThanOrEqual(2);
  expect(await hero.getAttribute("width")).toBe("800");
  expect(await hero.getAttribute("height")).toBe("500");

  const off = page.locator("#offscreen");
  expect(await off.getAttribute("loading")).toBe("lazy");
  const offUrls = [
    ...(await off.getAttribute("srcset"))!.split(","),
    ...(await page.locator("picture:has(#offscreen) source").getAttribute("srcset"))!.split(","),
  ].map((s) => s.trim().split(" ")[0]);
  expect(requested.filter((u) => offUrls.includes(u)), "offscreen image not fetched before scroll").toEqual([]);
  await off.scrollIntoViewIfNeeded();
  await expect.poll(() => requested.filter((u) => offUrls.includes(u)).length).toBeGreaterThan(0);

  const avifUrl = (await page.locator("picture:has(#hero) source").getAttribute("srcset"))!.split(",")[0].trim().split(" ")[0];
  const webpUrl = srcset.split(",")[0].trim().split(" ")[0];
  const avifRes = await request.get(avifUrl);
  const webpRes = await request.get(webpUrl);
  expect(avifRes.status()).toBe(200);
  expect(webpRes.status()).toBe(200);
  const avif = avifRes.headers()["content-type"];
  const webp = webpRes.headers()["content-type"];
  expect(avif).toBe("image/avif");
  expect(webp).toBe("image/webp");
  evidence(`vite-imagetools srcset widths ${widths.join("/")}w, width/height 800x500, lazy image fetched only after scroll, ${avifUrl}→${avif}, ${webpUrl}→${webp}`);
});
