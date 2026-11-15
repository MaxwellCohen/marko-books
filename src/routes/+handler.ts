import { loadBooksCount, loadBooksPage } from "@/lib/catalog.server";
import { parseSearchParams } from "@/lib/url-state";

// Kick both queries off without awaiting: the shell streams immediately and the
// page resolves them through <await>/<try> placeholders.
export const GET = Run.GET((ctx, next) => {
  const params = parseSearchParams(ctx.search ?? {});
  return next({
    pageTitle: "Books · Marko Books",
    books: loadBooksPage(params),
    count: loadBooksCount(params),
  });
});
