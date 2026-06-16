import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development, /api and /uploads are proxied to the backend so the
// frontend can use relative URLs without CORS headaches.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
