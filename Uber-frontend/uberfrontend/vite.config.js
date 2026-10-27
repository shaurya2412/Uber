import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('/react/') ||
            id.includes('zustand')
          ) {
            return 'vendor-react';
          }

          if (id.includes('framer-motion') || id.includes('lucide-react')) {
            return 'vendor-motion';
          }

          if (id.includes('leaflet') || id.includes('react-leaflet')) {
            return 'vendor-map';
          }

          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-charts';
          }

          if (
            id.includes('@solana') ||
            id.includes('@walletconnect') ||
            id.includes('@reown') ||
            id.includes('@toruslabs') ||
            id.includes('bn.js') ||
            id.includes('elliptic')
          ) {
            return 'vendor-web3';
          }

          if (id.includes('socket.io-client') || id.includes('axios')) {
            return 'vendor-network';
          }
        },
      },
    },
  },
});
