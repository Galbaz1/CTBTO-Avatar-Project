import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import path from 'path' // Not needed with fileURLToPath
import { fileURLToPath, URL } from 'node:url'

// Vite Configuration for Rosa Custom Backend
// API Key Handling: We use VITE_TAVUS_API_KEY directly from .env
// No manual mapping needed - Vite automatically exposes VITE_ prefixed variables
export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: {
      global: 'globalThis',
    },
    server: {
      host: true,
      allowedHosts: ['all'],
    },
  }
})

