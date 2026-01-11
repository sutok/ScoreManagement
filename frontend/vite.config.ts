import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core and router
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Material-UI components
          'mui-core': ['@mui/material', '@mui/system'],
          'mui-icons': ['@mui/icons-material'],
          // Firebase SDK
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Date utilities
          'date-utils': ['date-fns', 'date-fns/locale'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
  },
})
