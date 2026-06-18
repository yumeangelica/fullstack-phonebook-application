import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://localhost:5001',
      '/health': 'http://localhost:5001',
      '/ready': 'http://localhost:5001',
      '/live': 'http://localhost:5001',
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
});
