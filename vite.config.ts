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
      },
      // Mock analytics endpoints for development to prevent 404 errors
      '^/api/analytics/activity$': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: true, 
              message: 'Activity tracked (development mock)',
              timestamp: Date.now(),
              environment: 'development'
            }));
          });
        }
      },
      '^/api/analytics/tenant/.*/metrics$': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const tenantId = req.url?.split('/')[4] || 'default';
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              tenantId,
              tenantName: `Municipality ${tenantId}`,
              totalUsers: 150,
              activeGames: 23,
              completionRate: 78.5,
              avgSessionTime: '12m 34s',
              recentActivity: [],
              environment: 'development'
            }));
          });
        }
      },
      '^/api/analytics/system/metrics$': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              totalUsers: 1250,
              activeGames: 89,
              completionRate: 82.3,
              avgSessionTime: '14m 12s',
              recentActivity: [],
              environment: 'development'
            }));
          });
        }
      }
    },
    // WebSocket support for Socket.IO development
    hmr: {
      port: 5174
    }
  }
})
