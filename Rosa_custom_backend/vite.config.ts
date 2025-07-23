import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file relative to <root>
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': './src',
      },
    },
    define: {
      global: 'globalThis',
      // Make TAVUS_API_KEY available as VITE_TAVUS_API_KEY for compatibility
      'import.meta.env.VITE_TAVUS_API_KEY': JSON.stringify(env.TAVUS_API_KEY),
    },
  }
})

