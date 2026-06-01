import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ttj/phase-1-foundation": path.resolve(
        __dirname,
        "../phase-1-foundation/src/index.ts"
      ),
      "@ttj/phase-2-judgment-engines": path.resolve(
        __dirname,
        "../phase-2-judgment-engines/src/index.ts"
      ),
      "@ttj/phase-3-pipeline": path.resolve(
        __dirname,
        "../phase-3-pipeline/src/index.ts"
      ),
      "@ttj/phase-5-feedback": path.resolve(
        __dirname,
        "../phase-5-feedback/src/index.ts"
      ),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/feedback": { target: "http://localhost:8787" },
      "/turns": { target: "http://localhost:8787" },
      "/api/chat": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
