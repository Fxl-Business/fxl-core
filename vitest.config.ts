import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@tools': resolve(__dirname, 'tools'),
      '@clients': resolve(__dirname, 'clients'),
      '@platform': resolve(__dirname, 'src/platform'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@modules': resolve(__dirname, 'src/modules'),
    },
  },
  test: {
    globals: false,
    environment: 'jsdom',
    include: ['tools/**/*.test.ts', 'src/**/*.test.ts', 'tools/**/*.test.tsx', 'src/**/*.test.tsx'],
    setupFiles: ['./src/test-setup.ts'],
  },
})
