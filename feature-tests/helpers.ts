import { test } from "@playwright/test";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const ROOT = fileURLToPath(new URL("..", import.meta.url));

/** One-line evidence collected into results.json by run.mjs. */
export function evidence(text: string) {
  test.info().annotations.push({ type: "evidence", description: text });
}

export function run(cmd: string, env: Record<string, string> = {}) {
  return execSync(cmd, { cwd: ROOT, env: { ...process.env, ...env }, stdio: "pipe", encoding: "utf8" });
}

/** Strip Marko's resume comments so assertions see plain text. */
export const text = (s: string) => s.replace(/<!--[\s\S]*?-->/g, "");
