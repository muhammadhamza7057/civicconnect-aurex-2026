import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-router-dom')) return 'router';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('react-hot-toast')) return 'toast';
          if (id.includes('lottie')) return 'lottie';
          if (id.includes('react-countup')) return 'countup';
          if (id.includes('socket.io-client')) return 'socket';
          if (id.includes('@tanstack/react-query')) return 'query';
          return 'vendor';
        }
      }
    }
  }
});
