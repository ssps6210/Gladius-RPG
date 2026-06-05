import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the repo under /Gladius-RPG/, so assets need that base.
  // Harmless for local `vite dev`/`preview`.
  base: "./",
  build: {
    outDir: "dist",
  },
});
