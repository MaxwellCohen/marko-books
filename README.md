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
