import { loadBook } from "@/lib/catalog.server";
import { parseSearchParams } from "@/lib/url-state";

export const GET = Run.GET(async (ctx, next) => {
  const book = await loadBook(ctx.params.id, parseSearchParams(ctx.search ?? {}));
  // null falls through to the root +404.marko (HTTP 404)
  if (!book) return null;
  return next({ pageTitle: `${book.title} · Marko Books`, book });
});
