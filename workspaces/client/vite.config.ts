import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/public',
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: 'chunk-[hash].js',
      },
    },
    target: ['chrome130'],
  },
  define: {
    'process.env': {
      API_BASE_URL: '/api',
      NODE_ENV: 'production',
    },
  },
  plugins: [react(), UnoCSS(), visualizer()],
});
