import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
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
    },
  },
});
