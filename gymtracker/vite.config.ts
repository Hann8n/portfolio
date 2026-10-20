import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

/**
 * One build for the Worker (src/index.ts) and the admin SPA (admin/). The SPA's assets live under
 * /admin/ so the same Cloudflare Access application that guards /admin also guards the bundle.
 */
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  resolve: { alias: { "@": fileURLToPath(new URL("./admin/src", import.meta.url)) } },
  environments: {
    client: {
      build: {
        assetsDir: "admin/assets",
        rollupOptions: { input: { admin: fileURLToPath(new URL("./admin/index.html", import.meta.url)) } },
      },
    },
  },
  server: { port: 8788, strictPort: true },
});
