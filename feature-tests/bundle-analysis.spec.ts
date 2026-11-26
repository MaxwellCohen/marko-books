import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { ROOT, evidence, run } from "./helpers";

test("ANALYZE=1 build writes a rollup-plugin-visualizer report", async () => {
  const out = join(ROOT, ".ft-out/analyze");
  rmSync(out, { recursive: true, force: true });
  run("npx marko-run build -o .ft-out/analyze", { ANALYZE: "1" });
  const reports = [join(out, "public/stats.html"), join(out, "stats.html")].filter(existsSync);
  expect(reports.length).toBeGreaterThan(0);
  for (const r of reports) expect(readFileSync(r, "utf8")).toMatch(/<html/i);
  evidence(`rollup-plugin-visualizer wrote ${reports.map((r) => r.slice(ROOT.length)).join(", ")}`);
});
