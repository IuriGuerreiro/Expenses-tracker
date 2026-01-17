import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow access from local network
    proxy: {
      '/api': {
        target: 'http://192.168.3.21:3000', // Use your IP for proxy
        changeOrigin: true,
      },
    },
  },
});
