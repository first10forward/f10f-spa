import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/app/',
  server: {
    proxy: {
      // Forward /api/* to the Azure Functions local emulator during `vite dev`
      // Run `cd api && func start` separately to start the emulator on port 7071
      '/api': {
        target: 'http://localhost:7071',
        changeOrigin: true,
      },
    },
  },
  publicDir: false, // Don't copy public folder during React build
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
