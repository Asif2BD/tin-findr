// Build target: Node server (for self-hosted VPS deployments).
// We disable the bundled Cloudflare plugin and tell TanStack Start to emit
// a Node server bundle instead of a Cloudflare Worker module.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    target: "node-server",
  },
});
