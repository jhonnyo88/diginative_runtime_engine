import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { ChakraThemeProvider } from './theme/ChakraThemeProvider'
import { InfrastructureMonitoring } from './services/infrastructure-monitoring'

// Initialize monitoring services
console.info('DigiNativa Runtime Engine - Initializing monitoring services');

// Initialize infrastructure monitoring
const infrastructureMonitoring = InfrastructureMonitoring.getInstance();
infrastructureMonitoring.initialize({
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE as 'development' | 'staging' | 'production',
  enablePerformanceMonitoring: true,
  enableHealthChecks: true,
  healthCheckEndpoints: [
    { name: 'api', url: '/api/health', interval: 60000 },
    { name: 'database', url: '/api/health/database', interval: 120000 },
    { name: 'auth', url: '/api/health/auth', interval: 180000 }
  ]
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ChakraThemeProvider>
        <AuthProvider mockMode={import.meta.env.DEV}>
          <App />
        </AuthProvider>
      </ChakraThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
