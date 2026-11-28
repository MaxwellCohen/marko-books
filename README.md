# Marko Books

Goodreads catalog demo ported to **Marko 6 (Tags API) + Marko Run**, SSR with the Node adapter. All state lives in URL query params (`search, page, year, rating, pages, language, list, delay`); navigation is full-document (MPA). The books page and count queries stream through `<try>`/`<await>` placeholders; only the theme toggle, mobile sidebar, sliders/filters and search box ship JS.

## Env

Copy `.env.example` to `.env`:

- `POSTGRES_URL` – Neon Postgres URL. When empty, the built-in preview catalog is served.
- `API_DELAY_MS` – optional artificial server latency.

## Commands

- `pnpm dev` – dev server
- `pnpm build` – production build to `dist/`
- `pnpm start` – run the built server (`PORT`, default 3000; loads `.env`)
- `pnpm preview` – build and serve via `marko-run preview`
- `pnpm typecheck` – `tsc --noEmit` + `mtc` (Marko type check)

## Deployment

| Host | URL | Build flag |
| --- | --- | --- |
| Vercel | https://marko-books.vercel.app | `VERCEL=1` (set by Vercel) |
| Netlify | https://marko-books.netlify.app | `NETLIFY=1` |
| Cloudflare Workers | https://marko-books.to-email-max.workers.dev | `CLOUDFLARE=1` (or `WORKERS_CI`, set by Workers Builds) |

- Vercel and Netlify are connected to this repo: a push to `main` builds and deploys to both. Cloudflare is deployed with `pnpm deploy:cloudflare`.
- The build picks the host adapter from the flag above; with no flag it targets Node.
- `POSTGRES_URL` is set on every host (Vercel and Netlify environment variable, Cloudflare secret). Without it the app serves the preview catalog.
- Manual deploys: `pnpm deploy:vercel`, `pnpm deploy:netlify`, `pnpm deploy:cloudflare`.

### `optimized` branch

| Host | URL |
| --- | --- |
| Vercel | https://marko-books-optimized.vercel.app |
| Netlify | https://marko-books-max-optimized.netlify.app |
| Cloudflare Workers | https://marko-books-optimized.to-email-max.workers.dev |

- Self-hosted Geist and Geist Mono (`@fontsource-variable/*`) replace Google Fonts, so font files ship from the app's own origin.
- Catalog queries are cached for 1 hour with in-flight de-dup (in-memory plus Vercel cache, Netlify Blobs or the Cloudflare Cache API `caches.default`, failing soft), and HTML/asset `Cache-Control` headers follow the main port's per-host policy.
