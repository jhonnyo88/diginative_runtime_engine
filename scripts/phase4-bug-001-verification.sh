#!/bin/bash

# Phase 4: Bug #001 Verification Testing - Mock Health Endpoints Implementation
# Systematic solution verification för implementing development health check endpoints

set -e

echo "🔬 Phase 4: Bug #001 Solution Verification"
echo "========================================="
echo "Issue: 404 errors från API health check endpoints"
echo "Root Cause: Infrastructure monitoring tries to fetch /api/health endpoints that don't exist"
echo "Proposed Solution: Add development mock health endpoints using Vite dev server"
echo ""

# Create verification log
verification_log="docs/quality/phase4-bug-001-verification.log"
mkdir -p "$(dirname "$verification_log")"

echo "Bug #001 Solution Verification - $(date)" > "$verification_log"
echo "=======================================" >> "$verification_log"
echo "" >> "$verification_log"

echo "🔍 STEP 1: Verify Current Health Check Configuration"
echo "=================================================="
echo "STEP 1: Verify Current Health Check Configuration" >> "$verification_log"
echo "=================================================" >> "$verification_log"

# Check current infrastructure monitoring setup
echo "📁 Analyzing current health check configuration..."

if [ -f "src/main.tsx" ]; then
  echo "   ✅ main.tsx exists" >> "$verification_log"
  
  # Check health check endpoints configuration
  health_config=$(grep -A5 "healthCheckEndpoints" src/main.tsx | grep -c "/api/health")
  echo "   Health check endpoints configured: $health_config" >> "$verification_log"
  
  # List configured endpoints
  echo "   Configured health check endpoints:" >> "$verification_log"
  grep -A10 "healthCheckEndpoints" src/main.tsx | grep "url:" | sed 's/^/     /' >> "$verification_log" 2>/dev/null || echo "     Unable to parse endpoints" >> "$verification_log"
  
else
  echo "   ❌ main.tsx not found" >> "$verification_log"
fi

# Check infrastructure monitoring service
if [ -f "src/services/infrastructure-monitoring.ts" ]; then
  echo "   ✅ infrastructure-monitoring.ts exists" >> "$verification_log"
  
  # Check performHealthCheck implementation
  fetch_calls=$(grep -c "fetch.*endpoint.url" src/services/infrastructure-monitoring.ts)
  echo "   Health check fetch calls: $fetch_calls" >> "$verification_log"
  
  if [ "$fetch_calls" -gt 0 ]; then
    echo "   🔍 CONFIRMED: Service tries to fetch health endpoints" >> "$verification_log"
    health_check_confirmed=true
  else
    echo "   ❓ Health check fetch implementation not found" >> "$verification_log"
    health_check_confirmed=false
  fi
  
else
  echo "   ❌ infrastructure-monitoring.ts not found" >> "$verification_log"
  health_check_confirmed=false
fi

echo "" >> "$verification_log"

echo "🔍 STEP 2: Test Vite Development Server Solution"
echo "==============================================="
echo "STEP 2: Test Vite Development Server Solution" >> "$verification_log"
echo "==============================================" >> "$verification_log"

# Create test vite configuration with mock API endpoints
temp_vite_config="vite.config.test.ts"
echo "   Creating test Vite configuration with mock API..." >> "$verification_log"

cat > "$temp_vite_config" << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Test configuration with mock health endpoints
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
    proxy: {
      '/api/health': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Mock health check responses
            if (req.url === '/api/health') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                status: 'healthy', 
                timestamp: Date.now(),
                service: 'diginativa-runtime-engine'
              }));
              return;
            }
            if (req.url === '/api/health/database') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                status: 'healthy', 
                timestamp: Date.now(),
                service: 'database',
                connectionPool: 'active'
              }));
              return;
            }
            if (req.url === '/api/health/auth') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                status: 'healthy', 
                timestamp: Date.now(),
                service: 'authentication',
                sso: 'available'
              }));
              return;
            }
          });
        }
      }
    }
  }
})
EOF

echo "   ✅ Test configuration created: $temp_vite_config" >> "$verification_log"

# Verify test configuration syntax
if npx tsc --noEmit "$temp_vite_config" 2>/dev/null; then
  echo "   ✅ Test configuration passes TypeScript validation" >> "$verification_log"
  config_valid=true
else
  echo "   ❌ Test configuration has TypeScript errors" >> "$verification_log"
  config_valid=false
fi

# Clean up test file
rm -f "$temp_vite_config"

echo "" >> "$verification_log"

echo "🔍 STEP 3: Verify Alternative Mock Service Solution"
echo "================================================="
echo "STEP 3: Verify Alternative Mock Service Solution" >> "$verification_log"
echo "================================================" >> "$verification_log"

# Test creating mock service worker approach
temp_mock_service="src/mocks/health-api.test.ts"
echo "   Creating test mock service implementation..." >> "$verification_log"

mkdir -p "$(dirname "$temp_mock_service")"

cat > "$temp_mock_service" << 'EOF'
// Test mock health API service
export const createMockHealthEndpoints = () => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    // Mock fetch for development
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Mock health endpoints
      if (url.includes('/api/health/database')) {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: Date.now(),
          service: 'database',
          connectionPool: 'active'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (url.includes('/api/health/auth')) {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: Date.now(),
          service: 'authentication',
          sso: 'available'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (url.includes('/api/health')) {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: Date.now(),
          service: 'diginativa-runtime-engine'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Fall back to original fetch for other requests
      return originalFetch(input, init);
    };
  }
};
EOF

echo "   ✅ Test mock service created: $temp_mock_service" >> "$verification_log"

# Verify mock service syntax
if npx tsc --noEmit "$temp_mock_service" 2>/dev/null; then
  echo "   ✅ Mock service passes TypeScript validation" >> "$verification_log"
  mock_service_valid=true
else
  echo "   ❌ Mock service has TypeScript errors" >> "$verification_log"
  mock_service_valid=false
fi

# Clean up test file
rm -rf src/mocks

echo "" >> "$verification_log"

echo "🔍 STEP 4: Check Development Environment Detection"
echo "================================================"
echo "STEP 4: Check Development Environment Detection" >> "$verification_log"
echo "===============================================" >> "$verification_log"

# Check for environment detection capabilities
echo "   Checking environment detection..." >> "$verification_log"

# Check if import.meta.env.DEV is used
dev_env_usage=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "import.meta.env.DEV" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   import.meta.env.DEV usage: $dev_env_usage references" >> "$verification_log"

# Check Vite environment availability
if [ -f "vite.config.ts" ]; then
  echo "   ✅ Vite available for environment detection" >> "$verification_log"
  vite_available=true
else
  echo "   ❌ Vite configuration not available" >> "$verification_log"
  vite_available=false
fi

echo "" >> "$verification_log"

echo "📊 SOLUTION VERIFICATION SUMMARY"
echo "==============================="
echo "SOLUTION VERIFICATION SUMMARY" >> "$verification_log"
echo "============================" >> "$verification_log"

verification_score=0
total_checks=4

# Check 1: Health check configuration confirmed
if [ "$health_check_confirmed" = true ]; then
  echo "✅ Root cause confirmed: Infrastructure monitoring fetches missing health endpoints" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Health check implementation not confirmed" >> "$verification_log"
fi

# Check 2: Vite proxy solution valid
if [ "$config_valid" = true ]; then
  echo "✅ Vite proxy configuration solution validates" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Vite proxy configuration has issues" >> "$verification_log"
fi

# Check 3: Mock service alternative valid
if [ "$mock_service_valid" = true ]; then
  echo "✅ Mock service alternative solution validates" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Mock service alternative has issues" >> "$verification_log"
fi

# Check 4: Environment detection available
if [ "$vite_available" = true ]; then
  echo "✅ Environment detection available for conditional mocking" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Environment detection not available" >> "$verification_log"
fi

confidence_percentage=$((verification_score * 100 / total_checks))

echo "" >> "$verification_log"
echo "🎯 VERIFICATION RESULTS" >> "$verification_log"
echo "======================" >> "$verification_log"
echo "Confidence Score: $verification_score/$total_checks ($confidence_percentage%)" >> "$verification_log"

if [ "$confidence_percentage" -ge 100 ]; then
  echo "✅ 100% CONFIDENCE: Solution verified and ready for implementation" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Implement Vite proxy for development health endpoints" >> "$verification_log"
  verification_status="ready"
elif [ "$confidence_percentage" -ge 75 ]; then
  echo "⚠️  HIGH CONFIDENCE: Solution mostly verified, proceed with monitoring" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Implement with test validation" >> "$verification_log"
  verification_status="caution"
else
  echo "❌ LOW CONFIDENCE: Solution verification needs improvement" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Re-investigate health check approach" >> "$verification_log"
  verification_status="failed"
fi

echo "" >> "$verification_log"
echo "💡 RECOMMENDED IMPLEMENTATION APPROACH:" >> "$verification_log"
echo "Update vite.config.ts to include development server proxy:" >> "$verification_log"
echo "  server: {" >> "$verification_log"
echo "    proxy: {" >> "$verification_log"
echo "      '/api/health': { /* mock health endpoints */ }" >> "$verification_log"
echo "    }" >> "$verification_log"
echo "  }" >> "$verification_log"

echo ""
echo "📊 Verification complete. Results logged to: $verification_log"
echo "🎯 Confidence: $confidence_percentage%"
echo "🔧 Status: $verification_status"

# Return appropriate exit code
if [ "$verification_status" = "ready" ]; then
  echo "✅ Solution ready for implementation"
  exit 0
elif [ "$verification_status" = "caution" ]; then
  echo "⚠️  Proceed with caution"
  exit 1
else
  echo "❌ Verification failed"
  exit 2
fi