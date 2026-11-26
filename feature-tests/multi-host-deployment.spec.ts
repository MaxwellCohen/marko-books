import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { ROOT, evidence, run } from "./helpers";

const p = (...s: string[]) => join(ROOT, ...s);
const build = (target: string, env: Record<string, string>) => {
  rmSync(p(".ft-out", target), { recursive: true, force: true });
  run(`npx marko-run build -o .ft-out/${target}`, env);
};

test("node, netlify, vercel and cloudflare adapters all build", async () => {
  rmSync(p(".vercel"), { recursive: true, force: true });
  build("node", {});
  expect(readFileSync(p(".ft-out/node/index.mjs"), "utf8")).toContain("createServer");
  expect(existsSync(p(".ft-out/node/public/assets"))).toBe(true);

  build("netlify", { NETLIFY: "1" });
  expect(existsSync(p(".ft-out/netlify/index.mjs"))).toBe(true);
  expect(readFileSync(p(".ft-out/netlify/index.mjs"), "utf8")).not.toContain("createServer");
  expect(existsSync(p(".ft-out/netlify/public/assets"))).toBe(true);

  build("vercel", { VERCEL: "1" });
  expect(existsSync(p(".vercel/output/config.json"))).toBe(true);
  expect(existsSync(p(".vercel/output/functions/index.func"))).toBe(true);
  expect(existsSync(p(".vercel/output/static/assets"))).toBe(true);

  build("cloudflare", { CLOUDFLARE: "1" });
  const wrangler = JSON.parse(readFileSync(p(".ft-out/cloudflare/ssr/wrangler.json"), "utf8"));
  expect(wrangler.main).toBe("index.mjs");
  expect(existsSync(p(".ft-out/cloudflare/client/assets"))).toBe(true);
  evidence("built 4 targets: node (.ft-out/node/index.mjs http server), netlify (function index.mjs + public), vercel (.vercel/output/{config.json,functions/index.func,static}), cloudflare (ssr/wrangler.json + client/)");
});
