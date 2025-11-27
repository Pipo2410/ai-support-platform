import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  // Widget build (IIFE)
  if (mode === 'widget') {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'embed.ts'),
          name: 'AiSupportPlatformWidget',
          fileName: 'widget',
          formats: ['iife'],
        },
        rollupOptions: {
          output: {
            extend: true,
          },
        },
      },
    }
  }

  // Demo page build (default)
  return {
    build: {
      rollupOptions: {
        input: {
          demo: resolve(__dirname, 'demo.html'),
        },
      },
    },
    server: {
      port: 3002,
      open: '/demo.html',
    },
  }
})
