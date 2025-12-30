import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'https://18.60.156.89:5443',
        changeOrigin: true,
        secure: false,  // Bypass self-signed SSL
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
