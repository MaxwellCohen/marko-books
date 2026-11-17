import { htmlResponseWithCacheHeaders } from "@/lib/catalog-cache.server";

export default async (_ctx: unknown, next: () => Promise<Response>) =>
  htmlResponseWithCacheHeaders(await next());
