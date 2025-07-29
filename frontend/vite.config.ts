import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import path from 'path' // Not needed with fileURLToPath
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'

// Vite Configuration for Rosa Custom Backend
// API Key Handling: We use VITE_TAVUS_API_KEY directly from .env
// No manual mapping needed - Vite automatically exposes VITE_ prefixed variables
export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'framer-motion': path.resolve(__dirname, 'src/lib/framerMotionStub.tsx'),
      },
    },
    define: {
      global: 'globalThis',
    },
    server: {
      host: true,
      allowedHosts: ['all'],
    },
    build: {
      target: 'es2020',
      sourcemap: false,
      minify: 'esbuild' as const,
      chunkSizeWarningLimit: 450, // warn if chunk >450 KB
      rollupOptions: {
        output: {
          manualChunks(id) {
            // React core
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react'
            }
            // AI SDK related
            if (id.includes('@ai-sdk') || id.includes('ai/') || id.includes('zod')) {
              return 'ai-sdk'
            }
            // Daily.co video calling
            if (id.includes('@daily-co')) {
              return 'daily'
            }
            // UI utility libraries
            if (id.includes('jotai') || id.includes('clsx') || id.includes('tailwind-merge') || 
                id.includes('class-variance-authority') || id.includes('lucide-react')) {
              return 'ui-libs'
            }
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'radix-ui'
            }
            // Voice-first components (separate chunk for easier lazy loading)
            if (id.includes('voice-first') || id.includes('VoiceFirst')) {
              return 'voice-components'
            }
            // Card components (separate chunk)
            if (id.includes('/cards/') || id.includes('Card.tsx')) {
              return 'card-components'
            }
            // CVI components (separate chunk)
            if (id.includes('/cvi/') || id.includes('CVI')) {
              return 'cvi-components'
            }
            // Handlers (separate chunk)
            if (id.includes('/handlers/') || id.includes('Handler.tsx')) {
              return 'handlers'
            }
            // Split large node modules into smaller chunks
            if (id.includes('node_modules')) {
              // Polyfills and core JS utilities
              if (id.includes('tslib') || id.includes('immer') || id.includes('dotenv')) {
                return 'polyfills'
              }
              // Stagewise-specific
              if (id.includes('@stagewise')) {
                return 'stagewise'
              }
              // Other vendor libraries
              return 'vendor'
            }
          },
        },
      },
    },
  }
})

