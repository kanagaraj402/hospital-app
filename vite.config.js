import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-date-pickers',
      '@mui/system',
      '@emotion/react',
      '@emotion/styled'
    ]
  }
})