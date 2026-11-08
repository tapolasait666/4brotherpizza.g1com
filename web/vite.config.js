import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const target = process.env.VITE_PROXY_TARGET || 'http://localhost:4000';

const proxy = {
  '/api': { target, changeOrigin: false },
  '/uploads': { target, changeOrigin: false },
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Bind mounts in containers do not always emit inotify events.
    watch: { usePolling: true, interval: 300 },
    proxy,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy,
  },
});
