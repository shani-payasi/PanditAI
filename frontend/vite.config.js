import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: import.meta.env.VITE_BACKEND_URL,
        changeOrigin: true,
      },
      "/socket.io": {
        target: import.meta.env.VITE_BACKEND_URL,
        ws: true,
      },
    },
  },
});

