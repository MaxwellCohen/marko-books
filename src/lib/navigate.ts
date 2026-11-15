import { buildHref, stringifySearchParams, withFilters, type SearchParams } from "@/lib/url-state";

/**
 * Full-document navigation with `patch` applied to the current query (page resets).
 * On `/` it stays on the catalog; on a book page it keeps the path and only updates the query.
 */
export function updateParams(current: SearchParams, patch: Partial<SearchParams>) {
  const next = withFilters(current, patch);
  if ("delay" in patch) {
    if (patch.delay) next.delay = patch.delay;
    else delete next.delay;
  }
  let href: string;
  if (location.pathname === "/") {
    href = buildHref(next);
  } else {
    const query = stringifySearchParams(next);
    href = query ? `${location.pathname}?${query}` : location.pathname;
  }
  location.replace(href);
}
