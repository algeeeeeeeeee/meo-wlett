import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: ['es2020', 'safari15'],
    cssTarget: 'safari15',
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          lucide: ['lucide-react'],
        }
      }
    }
  },
  esbuild: {
    target: 'esnext',
    jsx: 'automatic',
  },
  server: {
    port: 5173,
    open: true,
  }
})
