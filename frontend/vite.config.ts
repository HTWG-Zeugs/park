import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
 base: "/",
 plugins: [react()],
 preview: {
  port: 3000,
  strictPort: true,
 },
 build: { sourcemap: true },
 server: {
  port: 3000,
  strictPort: true,
  host: true,
  origin: "http://0.0.0.0:3000",
 },
 resolve: {
    alias: {
      src: "/src",
      shared: path.resolve(__dirname, "../shared"),
    },
  },
});