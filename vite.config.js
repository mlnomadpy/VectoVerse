import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: {
          vendor: ['katex', 'd3'],
          math: ['katex']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': new URL('./modules', import.meta.url).pathname
    }
  },
  optimizeDeps: {
    include: ['katex', 'd3']
  }
});
