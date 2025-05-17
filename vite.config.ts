import { defineConfig } from 'vite';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    visualizer({
      filename: 'bundle-report.html',
      open: true, // Automatically opens the report in your browser
      gzipSize: true,
      brotliSize: true,
    }),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, 'chart/*'),
          dest: 'chart/', // Goes to build/charting_library/
        },
      ],
    }),
  ],
  server: {
    port: 3000,      // optional custom port
    open: true       // opens browser automatically
  },
  build: {
    target: 'es2015',
    outDir: 'build', // This will appear in root (next to src, chart, etc.)
    sourcemap: false,
    rollupOptions: {
      input: './index.html', // Should match your root HTML file
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: '[ext]/[name].[ext]',
      },
    },
  },
});
