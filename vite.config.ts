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
          // manualChunks como funcion (no objeto) para que el matching de
          // node_modules sea robusto. La forma de objeto fallaba para
          // react/react-dom (chunk vacio porque Rollup no los aislaba).
          //
          // Cada chunk vendor-* se cachea por el navegador independientemente
          // del codigo del app, asi que cambios de UI no invalidan estos
          // chunks pesados.
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined;
            // ORDEN IMPORTA: las librerias que CONTIENEN "react" en su path
            // (@xyflow/react, lucide-react) deben emparejar PRIMERO con su
            // propio nombre. Si no, el regex generico de react las absorbe
            // y crea el ciclo vendor-flow -> vendor-charts -> vendor-react.
            if (id.includes('@xyflow'))              return 'vendor-flow';
            if (id.includes('recharts'))             return 'vendor-charts';
            if (id.includes('lucide-react'))         return 'vendor-icons';
            if (id.includes('@supabase'))            return 'vendor-supabase';
            // motion v12 publica como 'motion/react' — atrapar tambien.
            if (id.includes('/motion/') || id.includes('framer-motion')) return 'vendor-motion';
            // Solo despues de descartar lo anterior emparejamos react/dom.
            if (id.match(/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/)) return 'vendor-react';
            return undefined;
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
