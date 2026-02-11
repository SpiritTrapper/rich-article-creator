import path from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
      "@extensions": path.resolve(__dirname, "src/extensions"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@pm": path.resolve(__dirname, "src/pm"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.tsx"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-hook-form",
        "prosemirror-commands",
        "prosemirror-dropcursor",
        "prosemirror-gapcursor",
        "prosemirror-history",
        "prosemirror-inputrules",
        "prosemirror-keymap",
        "prosemirror-model",
        "prosemirror-schema-list",
        "prosemirror-state",
        "prosemirror-transform",
        "prosemirror-view",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        assetFileNames: "style[extname]",
      },
    },
    cssCodeSplit: false,
    copyPublicDir: false,
  },
});
