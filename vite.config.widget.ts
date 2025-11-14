import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      tailwindcss(),
      react(),
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env": JSON.stringify({
        NODE_ENV: mode,
        VITE_APP_URL: env.VITE_APP_URL || "http://localhost:3000",
      }),
    },
    build: {
      lib: {
        entry: "./src/chatgpt/widget-entry.tsx",
        name: "ChatGPTWidget",
        fileName: "chatgpt-widget",
        formats: ["es"],
      },
      rollupOptions: {
        external: [],
      },
      outDir: "widget-dist",
    },
  };
});
