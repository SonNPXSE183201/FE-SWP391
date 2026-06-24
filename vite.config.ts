import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // MinIO public bucket — same-origin cho canvas / ảnh bìa
      '/manga-publishing': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      // Local fallback khi StorageSettings:Provider = Local
      '/uploads': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
    },
  },
})
