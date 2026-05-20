import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      include: ['recharts', 'motion', 'lucide-react'],
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        external: ['express', 'cors', 'dotenv', 'stripe', 'googleapis', '@google/genai'],
        output: {
          // manualChunks separa las librerias mas pesadas en su propio chunk
          // para que (a) no inflen el bundle principal y (b) el navegador
          // pueda cachearlas independientemente de los cambios de codigo del
          // app. Las paginas que no usan recharts/xyflow no las descargan.
          manualChunks: {
            'vendor-react':    ['react', 'react-dom'],
            'vendor-charts':   ['recharts'],
            'vendor-flow':     ['@xyflow/react'],
            'vendor-motion':   ['motion'],
            'vendor-icons':    ['lucide-react'],
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
    },
    server: {
      host: '127.0.0.1',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: false,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3006',
          changeOrigin: true
        }
      }
    },
  };
});
