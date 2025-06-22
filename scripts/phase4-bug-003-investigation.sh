#!/bin/bash

# Phase 4: Bug #003 Investigation - Additional API 404 Error Patterns
# Systematic investigation för analyzing other API endpoint 404 errors beyond health checks

set -e

echo "🔬 Phase 4: Bug #003 Investigation"
echo "=================================="
echo "Issue: Additional API 404 error patterns"
echo "Priority: MEDIUM"
echo "User Report: Various API endpoints returning 404 errors beyond health check endpoints"
echo ""

# Create investigation log
investigation_log="docs/quality/phase4-bug-003-investigation.log"
mkdir -p "$(dirname "$investigation_log")"

echo "Bug #003 Investigation - $(date)" > "$investigation_log"
echo "=================================" >> "$investigation_log"
echo "" >> "$investigation_log"

echo "🔍 STEP 1: API Endpoint Mapping Analysis"
echo "========================================"
echo "STEP 1: API Endpoint Mapping Analysis" >> "$investigation_log"
echo "======================================" >> "$investigation_log"

echo "📁 Analyzing all API endpoint definitions and usage..."

# Find API route files
echo "   API route files:" >> "$investigation_log"
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "/api/" 2>/dev/null | sed 's/^/   - "/' | sed 's/$/"/' >> "$investigation_log" 2>/dev/null

# Count API endpoint references
api_files=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "/api/" 2>/dev/null | wc -l)
echo "   Total files with API endpoints: $api_files" >> "$investigation_log"

# Analyze specific API patterns
echo "   API endpoint patterns:" >> "$investigation_log"
api_routes_count=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "'/api/" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
fetch_api_count=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "fetch.*'/api/" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
axios_api_count=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "axios.*'/api/" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   API route definitions: $api_routes_count references" >> "$investigation_log"
echo "   Fetch API calls: $fetch_api_count references" >> "$investigation_log"
echo "   Axios API calls: $axios_api_count references" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 2: API Route Implementation Analysis"
echo "==========================================="
echo "STEP 2: API Route Implementation Analysis" >> "$investigation_log"
echo "===========================================" >> "$investigation_log"

echo "📁 Analyzing backend API route implementations..."

# Check for API route implementations
api_route_files=$(find src -path "*/api/routes/*" -name "*.ts" 2>/dev/null | wc -l)
echo "   API route implementation files: $api_route_files files" >> "$investigation_log"

if [ "$api_route_files" -gt 0 ]; then
  echo "   Implemented API routes:" >> "$investigation_log"
  find src -path "*/api/routes/*" -name "*.ts" 2>/dev/null | sed 's/^/     - /' >> "$investigation_log"
  
  # Check route patterns in each file
  for route_file in $(find src -path "*/api/routes/*" -name "*.ts" 2>/dev/null); do
    route_patterns=$(grep -c "app\.\|router\.\|express\." "$route_file" 2>/dev/null || echo "0")
    echo "     $route_file: $route_patterns route handlers" >> "$investigation_log"
  done
else
  echo "   ❌ No API route implementation files found" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 3: Frontend API Call Analysis"
echo "====================================="
echo "STEP 3: Frontend API Call Analysis" >> "$investigation_log"
echo "===================================" >> "$investigation_log"

echo "📁 Analyzing frontend API service implementations..."

# Check for API service files
api_service_files=$(find src -name "*api*" -o -name "*service*" | grep -v test | wc -l)
echo "   API/Service files: $api_service_files files" >> "$investigation_log"

# Analyze specific API endpoints being called
echo "   Common API endpoints called:" >> "$investigation_log"

# Search for common API patterns
analytics_api=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "/api/analytics\|/api/v1/analytics" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
auth_api=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "/api/auth\|/api/v1/auth" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
devteam_api=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "/api/devteam\|/api/v1/devteam" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
content_api=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "/api/content\|/api/v1/content" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
validation_api=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "/api/validation\|/api/v1/validation" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   /api/analytics calls: $analytics_api references" >> "$investigation_log"
echo "   /api/auth calls: $auth_api references" >> "$investigation_log"
echo "   /api/devteam calls: $devteam_api references" >> "$investigation_log"
echo "   /api/content calls: $content_api references" >> "$investigation_log"
echo "   /api/validation calls: $validation_api references" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 4: Missing API Implementation Detection"
echo "==============================================="
echo "STEP 4: Missing API Implementation Detection" >> "$investigation_log"
echo "=============================================" >> "$investigation_log"

echo "📁 Analyzing gap between frontend calls and backend implementations..."

# Check for specific missing endpoints
missing_endpoints=()

if [ "$analytics_api" -gt 0 ]; then
  analytics_impl=$(find src -path "*/api/routes/*" -name "*analytics*" 2>/dev/null | wc -l)
  if [ "$analytics_impl" -eq 0 ]; then
    echo "   ❌ Analytics API called but no implementation found" >> "$investigation_log"
    missing_endpoints+=("analytics")
  else
    echo "   ✅ Analytics API implementation exists" >> "$investigation_log"
  fi
fi

if [ "$auth_api" -gt 0 ]; then
  auth_impl=$(find src -path "*/api/routes/*" -name "*auth*" 2>/dev/null | wc -l)
  if [ "$auth_impl" -eq 0 ]; then
    echo "   ❌ Auth API called but no implementation found" >> "$investigation_log"
    missing_endpoints+=("auth")
  else
    echo "   ✅ Auth API implementation exists" >> "$investigation_log"
  fi
fi

if [ "$devteam_api" -gt 0 ]; then
  devteam_impl=$(find src -path "*/api/routes/*" -name "*devteam*" 2>/dev/null | wc -l)
  if [ "$devteam_impl" -eq 0 ]; then
    echo "   ❌ DevTeam API called but no implementation found" >> "$investigation_log"
    missing_endpoints+=("devteam")
  else
    echo "   ✅ DevTeam API implementation exists" >> "$investigation_log"
  fi
fi

if [ "$content_api" -gt 0 ]; then
  content_impl=$(find src -path "*/api/routes/*" -name "*content*" 2>/dev/null | wc -l)
  if [ "$content_impl" -eq 0 ]; then
    echo "   ❌ Content API called but no implementation found" >> "$investigation_log"
    missing_endpoints+=("content")
  else
    echo "   ✅ Content API implementation exists" >> "$investigation_log"
  fi
fi

if [ "$validation_api" -gt 0 ]; then
  validation_impl=$(find src -path "*/api/routes/*" -name "*validation*" 2>/dev/null | wc -l)
  if [ "$validation_impl" -eq 0 ]; then
    echo "   ❌ Validation API called but no implementation found" >> "$investigation_log"
    missing_endpoints+=("validation")
  else
    echo "   ✅ Validation API implementation exists" >> "$investigation_log"
  fi
fi

echo "   Missing endpoint implementations: ${#missing_endpoints[@]}" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 5: Development vs Production API Configuration"
echo "====================================================="
echo "STEP 5: Development vs Production API Configuration" >> "$investigation_log"
echo "====================================================" >> "$investigation_log"

echo "📁 Analyzing environment-specific API configuration..."

# Check environment configuration
env_files=$(find . -name ".env*" 2>/dev/null | wc -l)
echo "   Environment files: $env_files files" >> "$investigation_log"

# Check vite configuration for API proxy
if [ -f "vite.config.ts" ]; then
  echo "   ✅ vite.config.ts exists" >> "$investigation_log"
  
  proxy_config=$(grep -A20 "proxy:" vite.config.ts | grep -c "/api/" | head -1)
  echo "   Vite proxy API configurations: $proxy_config endpoints" >> "$investigation_log"
  
  # Check if all missing endpoints are covered by proxy
  if [ ${#missing_endpoints[@]} -gt 0 ] && [ "$proxy_config" -eq 0 ]; then
    echo "   ⚠️  Missing endpoints not covered by development proxy" >> "$investigation_log"
    proxy_coverage="incomplete"
  else
    echo "   ✅ Development proxy configuration present" >> "$investigation_log"
    proxy_coverage="complete"
  fi
  
else
  echo "   ❌ vite.config.ts not found" >> "$investigation_log"
  proxy_coverage="missing"
fi

echo "" >> "$investigation_log"

echo "📊 HYPOTHESIS GENERATION"
echo "========================"
echo "HYPOTHESIS GENERATION" >> "$investigation_log"
echo "====================" >> "$investigation_log"

# Generate hypotheses based on findings
hypotheses=()

if [ ${#missing_endpoints[@]} -gt 0 ]; then
  echo "🔬 HYPOTHESIS A: Missing Backend API Implementations" >> "$investigation_log"
  echo "   Evidence: Frontend calls ${missing_endpoints[*]} APIs but no backend implementations found" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypotheses+=("missing-backend")
fi

if [ "$proxy_coverage" = "incomplete" ] || [ "$proxy_coverage" = "missing" ]; then
  echo "🔬 HYPOTHESIS B: Incomplete Development Mock API Coverage" >> "$investigation_log"
  echo "   Evidence: Missing/incomplete Vite proxy configuration for API endpoints" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("proxy-coverage")
fi

if [ "$api_routes_count" -gt 0 ] && [ "$api_route_files" -eq 0 ]; then
  echo "🔬 HYPOTHESIS C: Frontend-Only API Definitions Without Backend" >> "$investigation_log"
  echo "   Evidence: API routes defined in frontend but no backend route handlers" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("frontend-only")
fi

if [ ${#hypotheses[@]} -eq 0 ]; then
  echo "❌ HYPOTHESIS NONE: No clear API 404 patterns detected beyond health checks" >> "$investigation_log"
  echo "   Evidence: API implementations seem properly configured" >> "$investigation_log"
  hypotheses+=("none")
fi

echo "" >> "$investigation_log"
echo "🎯 RECOMMENDED NEXT STEPS" >> "$investigation_log"
echo "========================" >> "$investigation_log"

if [[ " ${hypotheses[@]} " =~ " missing-backend " ]]; then
  echo "1. Implement missing backend API endpoints: ${missing_endpoints[*]}" >> "$investigation_log"
  echo "2. Add Vite development proxy for missing APIs as interim solution" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " proxy-coverage " ]]; then
  echo "3. Extend Vite proxy configuration to cover all frontend API calls" >> "$investigation_log"
  echo "4. Add mock implementations for development environment" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " frontend-only " ]]; then
  echo "5. Create backend route handlers for frontend API definitions" >> "$investigation_log"
  echo "6. Establish API contract between frontend and backend" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " none " ]]; then
  echo "7. Verify actual 404 error patterns in browser console" >> "$investigation_log"
  echo "8. Consider if health check fix resolved most API 404 issues" >> "$investigation_log"
fi

echo ""
echo "📊 Investigation complete. Results logged to: $investigation_log"
echo "🎯 Primary hypotheses: ${hypotheses[*]}"
echo "🔧 Next step: Create verification testing script for identified API patterns"