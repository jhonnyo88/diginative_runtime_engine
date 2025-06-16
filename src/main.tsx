import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { errorMonitoring } from './services/error-monitoring'
import { performanceAnalytics } from './services/performance-analytics'

// Initialize monitoring services
console.info('DigiNativa Runtime Engine - Initializing monitoring services');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider mockMode={import.meta.env.DEV}>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
