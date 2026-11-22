/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base relativa: o mesmo build serve no GitHub Pages (/distrelmap/) e no app Android
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1500 },
  test: { environment: "node" },
});
