import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@tools': resolve(__dirname, 'tools'),
      '@clients': resolve(__dirname, 'clients'),
    },
  },
  test: {
    globals: false,
    environment: 'node',
    include: ['tools/**/*.test.ts', 'src/**/*.test.ts', 'tools/**/*.test.tsx', 'src/**/*.test.tsx'],
  },
})
