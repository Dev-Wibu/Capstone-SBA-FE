import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        //http://localhost:8080
        target: 'https://66b7b94833d1.ngrok-free.app',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': '69420',
        },
      },
    },
  },
});
