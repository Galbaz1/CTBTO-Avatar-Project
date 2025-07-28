import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite Configuration for Rosa Custom Backend
// API Key Handling: We use VITE_TAVUS_API_KEY directly from .env
// No manual mapping needed - Vite automatically exposes VITE_ prefixed variables
export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': './src',
      },
    },
    define: {
      global: 'globalThis',
    },
  }
})

