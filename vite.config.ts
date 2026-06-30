// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Cloudflare Pages needs cloudflare_pages; Vercel needs vercel (Build Output API).
const nitroPreset =
  process.env.VERCEL || process.env.VERCEL_ENV
    ? "vercel"
    : process.env.CF_PAGES || process.env.CF_PAGES_URL
      ? "cloudflare_pages"
      : "cloudflare_pages";

export default defineConfig({
  nitro: {
    preset: nitroPreset,
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
