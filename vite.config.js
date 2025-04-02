import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import {copy} from 'vite-plugin-copy';

export default defineConfig({
  plugins: [
    copy({
      targets: [{ src: '_headers', dest: 'dist' }],
    }),
    visualizer({
      open: true,
      filename: 'bundle-report.html'
    })
  ],
  build: {
      target: 'es2020',
      minify: 'terser', 
    rollupOptions: {
      treeshake: true,  
      // external: ['axios', 'charting_library'], // Externalize these
      output: {
        chunkFileNames: '[name]-[hash].js',
        manualChunks: {
          // react: ['react', 'react-dom'],
          vendor: ['axios']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // KB
  },
  server: {
    port: 3000,
    open: '/', // Opens TradingView chart directly
    cors: true
  },
  // optimizeDeps: {
  //   // include: ['react', 'react-dom']
  // }
});