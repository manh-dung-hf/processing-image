import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      // framer-motion v12 has a broken ESM entry — point to the UMD bundle
      'framer-motion': path.resolve(__dirname, 'node_modules/framer-motion/dist/framer-motion.js'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    // Proxy API calls to FastAPI — eliminates CORS issues in development
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    },
  },
})
