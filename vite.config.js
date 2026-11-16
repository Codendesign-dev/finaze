import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Deployed at www.finaze.com.au/react-home/. Change base if it moves
// ("./" makes every URL relative, for any folder).
export default defineConfig(({ isSsrBuild }) => ({
  base: "/react-home/",
  plugins: [react()],
  server: { port: 5180 },
  // The SSR build only feeds prerender.mjs, so it needs no public/ copy.
  build: { assetsInlineLimit: 0, copyPublicDir: !isSsrBuild },
  // Bundle gsap into the SSR build: Node would otherwise load its CommonJS
  // build, whose default export differs from the ES module one.
  ssr: { noExternal: ["gsap", "@gsap/react"] },
}));
