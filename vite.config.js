import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => {
  const standalone = mode === "standalone";
  return {
    plugins: [
      react(),
      ...(standalone ? [viteSingleFile()] : []),
    ],
    build: {
      // Audio is embedded as base64 — suppress the chunk size warning
      chunkSizeWarningLimit: 4096,
      // Inline ALL assets into the single HTML when standalone
      assetsInlineLimit: standalone ? 100 * 1024 * 1024 : 4096,
      // No chunk splitting in standalone mode
      rollupOptions: standalone
        ? { output: { inlineDynamicImports: true } }
        : {},
      // Output to dist/ normally, dist-standalone/ for single-file
      outDir: standalone ? "dist-standalone" : "dist",
    },
  };
});

