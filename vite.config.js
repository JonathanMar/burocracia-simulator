import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => {
  const standalone = mode === "standalone";
  return {
    plugins: [
      react(),
      ...(standalone ? [viteSingleFile({ removeViteModuleLoader: true })] : []),
    ],
    build: {
      // Audio embedded as base64 — suppress chunk size warning
      chunkSizeWarningLimit: 4096,
      // Inline all small assets (standalone: everything)
      assetsInlineLimit: standalone ? 100 * 1024 * 1024 : 4096,
      // Vite 5: rollupOptions for single-file
      rollupOptions: standalone
        ? {
            output: {
              // No code-splitting in standalone mode
              manualChunks: undefined,
            },
          }
        : {},
      // Output dir
      outDir: standalone ? "dist-standalone" : "dist",
    },
  };
});
