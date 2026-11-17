import { getBookById, getBooksCount, getBooksPage } from "@/features/book/book-queries.server";
import { toBookFilters, toBookQuery } from "@/features/book/book-utils";
import type { BookDetails, BookSummary } from "@/features/book/book-types";
import { withTtlCache } from "@/lib/catalog-cache.server";
import { waitForApiDelay } from "@/lib/api-delay";
import { getApiDelayMs, type SearchParams } from "@/lib/url-state";

// Marks a promise as handled so a render that never awaits it (client disconnect) can't crash the process,
// while still handing the original promise to <await>.
function guard<T>(promise: Promise<T>): Promise<T> {
  promise.catch(() => {});
  return promise;
}

const cachedBooksPage = withTtlCache("booksPage", getBooksPage);
const cachedBooksCount = withTtlCache("booksCount", getBooksCount);
const cachedBookById = withTtlCache("bookById", getBookById);

async function withDelay<T>(params: SearchParams, work: () => Promise<T>): Promise<T> {
  await waitForApiDelay(getApiDelayMs(params));
  return work();
}

export function loadBooksPage(params: SearchParams): Promise<BookSummary[]> {
  return guard(withDelay(params, () => cachedBooksPage(toBookQuery(params))));
}

export function loadBooksCount(params: SearchParams): Promise<number> {
  return guard(withDelay(params, () => cachedBooksCount(toBookFilters(toBookQuery(params)))));
}

export function loadBook(id: string, params: SearchParams): Promise<BookDetails | null> {
  return withDelay(params, () => cachedBookById(id));
}
