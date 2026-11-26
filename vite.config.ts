import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import marko from "@marko/run/vite";
import tailwindcss from "@tailwindcss/vite";
import { imagetools } from "vite-imagetools";

// Vite only exposes VITE_* vars to client code; the server reads POSTGRES_URL / API_DELAY_MS from process.env.
try {
  process.loadEnvFile(".env");
} catch {}

const isCloudflare = Boolean(process.env.CLOUDFLARE || process.env.WORKERS_CI || process.env.CF_PAGES);
const isNetlify = Boolean(process.env.NETLIFY);
const isVercel = Boolean(process.env.VERCEL);

// Marko templates are server-only, so their imports never reach the client build. @marko/vite
// re-imports SSR modules flagged `vite:asset` into the client build so the files get emitted;
// vite-imagetools outputs lack that flag, so this glue adds it (feature test: image-pipeline).
const imagetoolsSsrAssets: Plugin = {
  name: "imagetools-ssr-assets",
  enforce: "post",
  moduleParsed(info) {
    if (/\.(?:jpe?g|png|webp|avif)\?(?:.*&)?(?:w|format|as)=/.test(info.id)) {
      (info.meta as Record<string, unknown>)["vite:asset"] = true;
    }
  },
};

export default defineConfig(async () => {
  // Host chosen at build time; default is the built-in Node adapter.
  const adapter = isCloudflare
    ? (await import("@marko/run-adapter-cloudflare")).default()
    : isNetlify
      ? (await import("@marko/run-adapter-netlify")).default()
      : isVercel
        ? (await import("@marko/run-adapter-vercel")).default()
        : (await import("@marko/run/adapter")).default();

  // Feature test (bundle-analysis): ANALYZE=1 adds the third-party rollup-plugin-visualizer,
  // which emits stats.html next to each (client + server) bundle.
  const analyze = process.env.ANALYZE
    ? [(await import("rollup-plugin-visualizer")).visualizer({ emitFile: true, filename: "stats.html", template: "treemap" })]
    : [];

  return {
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    // imagetools only acts on imports with query directives (feature test: image-pipeline).
    plugins: [tailwindcss(), imagetools(), imagetoolsSsrAssets, marko({ adapter }), ...analyze],
  };
});
