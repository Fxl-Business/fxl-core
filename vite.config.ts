import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@tools': path.resolve(__dirname, 'tools'),
      '@clients': path.resolve(__dirname, 'clients'),
      '@platform': path.resolve(__dirname, 'src/platform'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@modules': path.resolve(__dirname, 'src/modules'),
    },
  },
})
