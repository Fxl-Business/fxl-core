import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@skills': path.resolve(__dirname, 'skills'),
      '@clients': path.resolve(__dirname, 'clients'),
    },
  },
})
