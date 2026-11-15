import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import tailwindcss from "@tailwindcss/vite";

// Vite only exposes VITE_* vars to client code; the server reads POSTGRES_URL / API_DELAY_MS from process.env.
try {
  process.loadEnvFile(".env");
} catch {}

const isCloudflare = Boolean(process.env.CLOUDFLARE || process.env.WORKERS_CI || process.env.CF_PAGES);
const isNetlify = Boolean(process.env.NETLIFY);
const isVercel = Boolean(process.env.VERCEL);

export default defineConfig(async () => {
  // Host chosen at build time; default is the built-in Node adapter.
  const adapter = isCloudflare
    ? (await import("@marko/run-adapter-cloudflare")).default()
    : isNetlify
      ? (await import("@marko/run-adapter-netlify")).default()
      : isVercel
        ? (await import("@marko/run-adapter-vercel")).default()
        : (await import("@marko/run/adapter")).default();

  return {
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    plugins: [tailwindcss(), marko({ adapter })],
  };
});
