import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chakra-vendor': ['@chakra-ui/react', '@chakra-ui/theme']
        }
      }
    }
  },
  server: {
    // Mock health endpoints for development to prevent 404 errors
    proxy: {
      '^/api/health$': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              status: 'healthy', 
              timestamp: Date.now(),
              service: 'diginativa-runtime-engine',
              environment: 'development'
            }));
          });
        }
      },
      '^/api/health/database$': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              status: 'healthy', 
              timestamp: Date.now(),
              service: 'database',
              connectionPool: 'mock-active',
              environment: 'development'
            }));
          });
        }
      },
      '^/api/health/auth$': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              status: 'healthy', 
              timestamp: Date.now(),
              service: 'authentication',
              sso: 'mock-available',
              environment: 'development'
            }));
          });
        }
      }
    }
  }
})
