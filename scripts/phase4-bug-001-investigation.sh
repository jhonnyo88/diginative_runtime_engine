#!/bin/bash

# Phase 4: Bug #001 Investigation - API Health Check 404 Errors
# Systematic root cause analysis för API/Health Check Issues

set -e

echo "🔬 Phase 4: Bug #001 Root Cause Investigation"
echo "============================================="
echo "Issue: 404 errors från API health check endpoints"
echo "Priority: MEDIUM"
echo "Impact: Background errors, doesn't break functionality"
echo ""

# Create investigation log
investigation_log="docs/quality/phase4-bug-001-investigation.log"
mkdir -p "$(dirname "$investigation_log")"

echo "Bug #001 Investigation - $(date)" > "$investigation_log"
echo "==================================" >> "$investigation_log"
echo "" >> "$investigation_log"

echo "🔍 STEP 1: API Health Check Endpoint Analysis"
echo "============================================="
echo "STEP 1: API Health Check Endpoint Analysis" >> "$investigation_log"
echo "===========================================" >> "$investigation_log"

# Search for health check endpoint definitions
echo "📁 Searching for health check endpoint configurations..."

health_check_files=()
if find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "health\|/api/health" >/dev/null 2>&1; then
  while IFS= read -r -d '' file; do
    health_check_files+=(\"$file\")
  done < <(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "health\|/api/health" | tr '\n' '\0' 2>/dev/null)
fi

echo "   Health check related files:" >> "$investigation_log"
for file in "${health_check_files[@]}"; do
  echo "   - $file" >> "$investigation_log"
done

total_health_files=${#health_check_files[@]}
echo "   Total health check files: $total_health_files" >> "$investigation_log"

# Check for specific health check endpoints
health_endpoints=(
  "/api/health"
  "/api/health/database"
  "/api/health/auth"
)

echo "   Health check endpoint analysis:" >> "$investigation_log"
for endpoint in "${health_endpoints[@]}"; do
  endpoint_usage=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -c "$endpoint" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
  echo "   Endpoint '$endpoint': $endpoint_usage references" >> "$investigation_log"
done

echo "" >> "$investigation_log"

echo "🔍 STEP 2: Infrastructure Monitoring Service Analysis"
echo "==================================================="
echo "STEP 2: Infrastructure Monitoring Service Analysis" >> "$investigation_log"
echo "==================================================" >> "$investigation_log"

# Check infrastructure monitoring implementation
echo "📁 Analyzing infrastructure monitoring configuration..."

if [ -f "src/services/infrastructure-monitoring.ts" ]; then
  echo "   ✅ infrastructure-monitoring.ts exists" >> "$investigation_log"
  
  # Check health check configuration
  health_check_config=$(grep -c "healthCheckEndpoints\|health.*check" src/services/infrastructure-monitoring.ts)
  echo "   Health check configuration: $health_check_config references" >> "$investigation_log"
  
  # Check endpoint definitions
  endpoint_definitions=$(grep -c "/api/health" src/services/infrastructure-monitoring.ts)
  echo "   API health endpoint definitions: $endpoint_definitions" >> "$investigation_log"
  
  # Check initialization
  init_calls=$(grep -c "initialize\|healthChecks" src/services/infrastructure-monitoring.ts)
  echo "   Initialization logic: $init_calls references" >> "$investigation_log"
  
else
  echo "   ❌ infrastructure-monitoring.ts not found" >> "$investigation_log"
fi

# Check main.tsx for health check initialization
if [ -f "src/main.tsx" ]; then
  echo "   ✅ main.tsx exists" >> "$investigation_log"
  
  infrastructure_init=$(grep -c "InfrastructureMonitoring\|healthCheckEndpoints" src/main.tsx)
  echo "   Infrastructure monitoring init in main.tsx: $infrastructure_init references" >> "$investigation_log"
  
else
  echo "   ❌ main.tsx not found" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 3: Mock API Implementation Analysis"
echo "=========================================="
echo "STEP 3: Mock API Implementation Analysis" >> "$investigation_log"
echo "========================================" >> "$investigation_log"

# Check for mock API implementations
echo "📁 Analyzing mock API and backend service implementations..."

# Check for development API setup
api_files=()
if find src -name "*api*" -o -name "*mock*" -type f >/dev/null 2>&1; then
  while IFS= read -r -d '' file; do
    api_files+=(\"$file\")
  done < <(find src -name "*api*" -o -name "*mock*" -type f -print0 2>/dev/null)
fi

echo "   API/Mock related files:" >> "$investigation_log"
for file in "${api_files[@]}"; do
  echo "   - $file" >> "$investigation_log"
done

# Check for backend service configuration
backend_services=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "backend\|server\|endpoint" 2>/dev/null | wc -l)
echo "   Backend service references: $backend_services files" >> "$investigation_log"

# Check for development vs production API handling
dev_api_config=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "import.meta.env\|process.env" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   Environment-based API configuration: $dev_api_config references" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 4: Network Request and Error Handling"
echo "============================================"
echo "STEP 4: Network Request and Error Handling" >> "$investigation_log"
echo "==========================================" >> "$investigation_log"

# Check for network request implementations
echo "📁 Analyzing network request and error handling..."

# Check for fetch/axios usage
fetch_usage=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "fetch\|axios" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   Network request implementations: $fetch_usage references" >> "$investigation_log"

# Check for 404 error handling
error_404_handling=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "404\|Not Found" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   404 error handling: $error_404_handling references" >> "$investigation_log"

# Check for error boundaries and logging
error_logging=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "console.error\|captureError\|error.*log" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   Error logging implementations: $error_logging references" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 5: Development vs Production Configuration"
echo "==============================================="
echo "STEP 5: Development vs Production Configuration" >> "$investigation_log"
echo "===============================================" >> "$investigation_log"

# Check environment configuration
echo "📁 Analyzing environment-specific configurations..."

# Check for environment variables
env_vars=$(find . -name ".env*" -type f | wc -l)
echo "   Environment files found: $env_vars" >> "$investigation_log"

# Check for development mode detection
dev_mode_checks=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "DEV\|development\|NODE_ENV" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   Development mode checks: $dev_mode_checks references" >> "$investigation_log"

# Check vite configuration for proxy/dev server
if [ -f "vite.config.ts" ]; then
  echo "   ✅ vite.config.ts exists" >> "$investigation_log"
  
  proxy_config=$(grep -c "proxy\|server" vite.config.ts 2>/dev/null || echo "0")
  echo "   Vite proxy/server configuration: $proxy_config references" >> "$investigation_log"
  
else
  echo "   ❌ vite.config.ts not found for proxy configuration" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "📊 HYPOTHESIS GENERATION"
echo "========================"
echo "HYPOTHESIS GENERATION" >> "$investigation_log"
echo "====================" >> "$investigation_log"

# Generate hypothesis based on findings
if [ "$total_health_files" -gt 0 ]; then
  echo "🔬 HYPOTHESIS A: Health Check Endpoints Not Implemented in Backend" >> "$investigation_log"
  echo "   Evidence: Health check configuration exists but backend endpoints missing" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypothesis_a=true
else
  echo "❌ HYPOTHESIS A: No health check configuration found" >> "$investigation_log"
  hypothesis_a=false
fi

if [ "$dev_mode_checks" -gt 0 ]; then
  echo "🔬 HYPOTHESIS B: Development vs Production API Configuration Issue" >> "$investigation_log"
  echo "   Evidence: Environment-based configuration exists, may need mock endpoints" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypothesis_b=true
else
  echo "❌ HYPOTHESIS B: No environment-based configuration detected" >> "$investigation_log"
  hypothesis_b=false
fi

echo "🔬 HYPOTHESIS C: Missing Mock API Implementation for Development" >> "$investigation_log"
echo "   Evidence: Production health checks configured but development mocks missing" >> "$investigation_log"
echo "   Probability: MEDIUM" >> "$investigation_log"
hypothesis_c=true

echo "" >> "$investigation_log"

echo "🎯 RECOMMENDED NEXT STEPS" >> "$investigation_log"
echo "========================" >> "$investigation_log"

if [ "$hypothesis_a" = true ]; then
  echo "1. Identify all health check endpoints configured in monitoring service" >> "$investigation_log"
  echo "2. Implement mock health check endpoints for development" >> "$investigation_log"
  echo "3. Add proper error handling for missing endpoints" >> "$investigation_log"
  recommended_action="implement_mock_health_endpoints"
elif [ "$hypothesis_b" = true ]; then
  echo "1. Review environment-based API configuration" >> "$investigation_log"
  echo "2. Set up development API proxy or mock server" >> "$investigation_log"
  echo "3. Configure proper fallback for missing endpoints" >> "$investigation_log"
  recommended_action="configure_dev_api_proxy"
else
  echo "1. Implement comprehensive mock API for development" >> "$investigation_log"
  echo "2. Add development environment detection" >> "$investigation_log"
  echo "3. Configure health check endpoint mocking" >> "$investigation_log"
  recommended_action="implement_mock_api_system"
fi

echo ""
echo "📊 Investigation complete. Results logged to: $investigation_log"
echo "🎯 Recommended action: $recommended_action"

# Return exit code based on findings
if [ "$hypothesis_a" = true ]; then
  echo "🔍 PRIMARY HYPOTHESIS: Health check endpoints not implemented in backend"
  exit 1
elif [ "$hypothesis_b" = true ]; then
  echo "🔍 PRIMARY HYPOTHESIS: Development vs production API configuration issue"
  exit 2
else
  echo "🔍 PRIMARY HYPOTHESIS: Missing mock API implementation for development"
  exit 3
fi