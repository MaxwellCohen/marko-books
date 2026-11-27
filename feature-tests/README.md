# Feature tests (marko)

Validates each Framework Compare label for Marko / Marko Run against a production build.

```sh
pnpm test:features        # or: node feature-tests/run.mjs   (FT_PORT=4127 by default)
```

`run.mjs` runs the build-time specs (they write to `.ft-out/` and `.vercel/`, never `dist/`),
then `marko-run build`, serves `dist/index.mjs` on `FT_PORT`, runs the browser specs with
Playwright (system Chrome at `/home/maxc/.local/bin/google-chrome`, override with `CHROME_PATH`),
stops the server and writes `feature-tests/results.json`.

Routes live under `src/routes/feature-tests/` (index at `/feature-tests`). The root layout gives
`/feature-tests/*` a bare shell and reads `+meta.json` flags (`speculation`,
`thirdParty`) for head extras; book pages are unchanged.

| Feature | Label | What the spec proves |
| --- | --- | --- |
| css-inlining | Manual | `?inline` CSS is in an inline `<style>`; no stylesheet link contains it; style applied |
| font-optimization | Third-party | Fontsource self-hosted (no Google requests), `@font-face` has `font-display: swap`, `<link rel=preload as=font>` points at that face's file |
| image-pipeline | Third-party | vite-imagetools srcset (3 widths), width/height, lazy image fetched only after scroll, AVIF/WebP content types |
| caching | 1st-party (claimed) | `Cache-Control: max-age=3` from a `Run.GET` handler: 2nd fetch reuses value without hitting the server, fresh after expiry |
| route-prefetching | Manual | Speculation Rules prefetch the target document on hover, before the click |
| islands | 1st-party | counter island works; static tag's marker string is in no loaded script nor any client chunk |
| render-modes | Manual | SSR timestamp changes per request; `+meta.json` static → `s-maxage` header; client-only content absent from HTML, rendered after mount |
| reactivity | 1st-party | 3 clicks: mount effect 1x, dependent `<const>` 3x, unrelated `<const>` 0x; DOM mutations only in bound text |
| bundle-analysis | Third-party | `ANALYZE=1` build with rollup-plugin-visualizer writes `stats.html` |
| third-party-scripts | Manual | `<script async>` in head + idle-injected script, both delayed 2s: DOMContentLoaded first, globals set later |
| multi-host-deployment | 1st-party | node, netlify, vercel and cloudflare adapter builds produce their expected outputs |
