import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { defineConfig } from "vite";
import webExtension from "@samrum/vite-plugin-web-extension";
import manifestV3 from "./manifest-v3.json";
import { WebExtensionManifest } from "@samrum/rollup-plugin-web-extension";

const root = resolve(__dirname, "src");
const pagesDir = resolve(root, "pages");
const assetsDir = resolve(root, "assets");
const publicDir = resolve(__dirname, "public");

const isDev = process.env.__DEV__ === "true";

const getOutDir = (version: string) => resolve(__dirname, `dist/${version}`);

const baseConfig = {
  resolve: {
    alias: {
      "@src": root,
      "@assets": assetsDir,
      "@pages": pagesDir,
    },
  },
  publicDir,
  build: {
    sourcemap: isDev,
    emptyOutDir: !isDev,
    rollupOptions: {
      input: {
        contentScript: resolve(pagesDir, "content/index.tsx"),
      },
      output: {
        entryFileNames: "dist/[name].js",
        chunkFileNames: "dist/[name].[hash].js",
        assetFileNames: "dist/[name].[hash][extname]",
      },
    },
  },
};

const v3Config = defineConfig({
  ...baseConfig,
  plugins: [
    react(),
    webExtension({
      manifest: manifestV3 as WebExtensionManifest,
    }),
  ],
  build: {
    ...baseConfig.build,
    outDir: getOutDir("v3"),
  },
});

export default v3Config;
