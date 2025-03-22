import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/public',
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: 'chunk-[hash].js',
        entryFileNames: 'main.js',
      },
    },
  },
  define: {
    'process.env': {
      API_BASE_URL: '/api',
      NODE_ENV: 'production',
    },
  },
  plugins: [react()],
});
