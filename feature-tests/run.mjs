// Builds, serves the production build on FT_PORT (default 4127), runs every spec,
// and writes feature-tests/results.json.
import { execSync, spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = process.env.FT_PORT ?? "4127";
const REPORTS = `${ROOT}feature-tests/.reports`;
mkdirSync(REPORTS, { recursive: true });

const FEATURES = {
  "css-inlining": { claimedLabel: "manual", method: "Vite `?inline` CSS import written with <html-style>$!{css}</html-style> in the page" },
  "font-optimization": { claimedLabel: "third-party", method: "@fontsource-variable/geist @font-face (font-display: swap) + hand-added <link rel=preload as=font> via ?url import in the layout" },
  "image-pipeline": { claimedLabel: "third-party", method: "vite-imagetools (?w=…&format=avif|webp&as=srcset) in <picture>, loading=lazy offscreen; needs a 10-line glue plugin flagging its modules `vite:asset` so @marko/vite emits them into the client build" },
  caching: {
    claimedLabel: "first-party",
    method: "Run.GET handler returning Response with hand-set Cache-Control (max-age=3); browser HTTP cache reuse",
    suggestedLabel: "manual",
  },
  "route-prefetching": { claimedLabel: "manual", method: "<html-script type=speculationrules> prefetch, eagerness moderate (hover)" },
  islands: { claimedLabel: "first-party", method: "Marko 6 compiler: static tag + <let> counter tag, no config" },
  "render-modes": { claimedLabel: "manual", method: "+meta.json {render} → +middleware Cache-Control; SSR default; client-only via mount <script>" },
  reactivity: { claimedLabel: "first-party", method: "Marko 6 <let>/<const> compiled reactivity" },
  "bundle-analysis": { claimedLabel: "third-party", method: "rollup-plugin-visualizer added to vite.config.ts when ANALYZE=1" },
  "third-party-scripts": { claimedLabel: "manual", method: "<html-script async src> in <head> + mount <script> injecting a script at requestIdleCallback" },
  "multi-host-deployment": { claimedLabel: "first-party", method: "@marko/run adapter (node) + @marko/run-adapter-netlify/-vercel/-cloudflare chosen by env flag" },
};
const BUILD_TIME = ["bundle-analysis", "multi-host-deployment"];
const RUNTIME = Object.keys(FEATURES).filter((f) => !BUILD_TIME.includes(f));

const sh = (cmd, env = {}) => execSync(cmd, { cwd: ROOT, stdio: "inherit", env: { ...process.env, ...env } });

function playwright(features, name) {
  const files = features.map((f) => `feature-tests/${f}.spec.ts`).join(" ");
  try {
    sh(`npx playwright test -c feature-tests/playwright.config.ts --reporter=list,json ${files}`, {
      FT_PORT: PORT,
      PLAYWRIGHT_JSON_OUTPUT_NAME: `${REPORTS}/${name}.json`,
    });
  } catch {
    // failures are recorded in the report
  }
  return JSON.parse(readFileSync(`${REPORTS}/${name}.json`, "utf8"));
}

function collect(report, out) {
  const walk = (suite) => {
    for (const spec of suite.specs ?? []) {
      const feature = spec.file.replace(/^.*\//, "").replace(".spec.ts", "");
      for (const t of spec.tests) {
        const last = t.results.at(-1) ?? {};
        const notes = [...(t.annotations ?? []), ...(last.annotations ?? [])];
        const ev = [...new Set(notes.filter((a) => a.type === "evidence").map((a) => a.description))];
        const ok = t.status === "expected";
        const err = (last.error?.message ?? last.errors?.[0]?.message ?? "").replace(/\x1b\[[0-9;]*m/g, "").split("\n").filter(Boolean).slice(0, 3).join(" ");
        out[feature] = { status: ok ? "pass" : "fail", evidence: ok ? ev.join("; ") : `FAILED: ${err}`.slice(0, 400) };
      }
    }
    for (const s of suite.suites ?? []) walk(s);
  };
  for (const s of report.suites) walk(s);
}

const observed = {};
// 1. Build-time specs first (they write to .ft-out/, never dist/).
collect(playwright(BUILD_TIME, "build-time"), observed);

// 2. Production build + server.
sh("npx marko-run build");
const server = spawn("node", ["./dist/index.mjs"], { cwd: ROOT, env: { ...process.env, PORT }, stdio: "inherit" });
try {
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(`http://localhost:${PORT}/feature-tests`)).ok) break;
    } catch {}
    if (i > 100) throw new Error("server did not start");
    await new Promise((r) => setTimeout(r, 200));
  }
  collect(playwright(RUNTIME, "runtime"), observed);
} finally {
  server.kill();
}

const results = {};
for (const [id, meta] of Object.entries(FEATURES)) {
  const o = observed[id] ?? { status: "fail", evidence: "spec did not run" };
  results[id] = {
    claimedLabel: meta.claimedLabel,
    status: o.status,
    method: meta.method,
    evidence: o.evidence,
    ...(meta.suggestedLabel ? { suggestedLabel: meta.suggestedLabel } : {}),
    test: `feature-tests/${id}.spec.ts`,
  };
}
const commit = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
writeFileSync(
  `${ROOT}feature-tests/results.json`,
  JSON.stringify({ framework: "marko", repo: "marko-books", commit, ranAt: new Date().toISOString(), results }, null, 2) + "\n",
);
console.table(Object.fromEntries(Object.entries(results).map(([k, v]) => [k, v.status])));
