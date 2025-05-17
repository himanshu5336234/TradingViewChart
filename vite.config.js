import { defineConfig } from 'vite';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, 'chart/charting_library.standalone.js'),
          dest: './js/charting_library',
        },
      ],
    }),
  ],
  build: {
    target: 'es2015',
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      input: './src/index.ts',
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: '[ext]/[name].[ext]',
      },
    },
  },
});
