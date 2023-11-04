/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
  },
  plugins: [
    solid({
      ssr: true,
      solid: {
        hydratable: true,
      },
    }),
  ],

  build: {
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
});
