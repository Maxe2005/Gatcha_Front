import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/monsters-service': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/monsters-service/, ''),
      },
      '/joueur-service': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/joueur-service/, ''),
      },
      '/auth-service': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth-service/, ''),
      },
      '/invocation-service': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/invocation-service/, ''),
      },
      '/admin-service': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        ws: true, // WebSocket de suivi de génération d'images
        rewrite: (path) => path.replace(/^\/admin-service/, ''),
      },
    },
  },
  build: {
    // Optimiser la compression et le splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-animation': ['framer-motion'],
          'vendor-utils': ['axios', 'react-hot-toast'],
          // Feature chunks
          'chunk-auth': [
            './src/services/authService.ts',
            './src/context/AuthContext.tsx',
          ],
          'chunk-player': [
            './src/services/joueurService.ts',
            './src/context/PlayerContext.tsx',
          ],
          'chunk-monster': [
            './src/services/monstersService.ts',
            './src/context/MonsterContext.tsx',
          ],
          'chunk-invocation': [
            './src/services/invocationService.ts',
            './src/pages/Gatcha/Gacha.tsx',
          ],
        },
      },
    },
    // Compression et minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Enlever les console.log en production
        drop_debugger: true,
      },
    },
    // Optimisation des assets
    assetsInlineLimit: 4096, // Inline assets < 4KB
    chunkSizeWarningLimit: 600,
  },
});
