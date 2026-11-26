import { htmlResponseWithCacheHeaders } from "@/lib/catalog-cache.server";

// Feature test (render-modes, Manual): a route opts into a "mode" with
// `{ "render": "static" | "isr" }` in its +meta.json; we turn it into CDN Cache-Control.
const RENDER_MODE_CACHE_CONTROL: Record<string, string> = {
  static: "public, s-maxage=31536000",
  isr: "public, s-maxage=60, stale-while-revalidate=86400",
};

export default async (ctx: { meta?: unknown }, next: () => Promise<Response>) => {
  const res = htmlResponseWithCacheHeaders(await next());
  const mode = (ctx.meta as { render?: string } | undefined)?.render;
  const cacheControl = mode && RENDER_MODE_CACHE_CONTROL[mode];
  if (!cacheControl || !res.headers.get("content-type")?.includes("text/html")) return res;
  const headers = new Headers(res.headers);
  headers.set("Cache-Control", cacheControl);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
};
