import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Your backend server URL and port
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,                     // Enable Vitest global functions (describe, it, expect)
    environment: 'jsdom',              // Use a browser-like environment for React testing
    setupFiles: './src/setupTests.js',   // Loads your test setup file
    // Optionally include coverage settings:
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
    },
  },
});
