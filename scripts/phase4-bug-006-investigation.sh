#!/bin/bash

# Phase 4: Bug #006 Investigation - Analytics API 404 Issues
# Systematic investigation för analyzing analytics API endpoint errors

set -e

echo "🔬 Phase 4: Bug #006 Investigation"
echo "=================================="
echo "Issue: Analytics API 404 issues"
echo "Priority: MEDIUM"
echo "User Report: Analytics API endpoints returning 404 errors"
echo ""

# Create investigation log
investigation_log="docs/quality/phase4-bug-006-investigation.log"
mkdir -p "$(dirname "$investigation_log")"

echo "Bug #006 Investigation - $(date)" > "$investigation_log"
echo "=================================" >> "$investigation_log"
echo "" >> "$investigation_log"

echo "🔍 STEP 1: Analytics Service Implementation Analysis"
echo "=================================================="
echo "STEP 1: Analytics Service Implementation Analysis" >> "$investigation_log"
echo "==================================================" >> "$investigation_log"

echo "📁 Analyzing analytics service implementation and endpoints..."

# Find analytics related files
echo "   Analytics related files:" >> "$investigation_log"
find src -name "*analytics*" -o -name "*metric*" -o -name "*tracking*" | sed 's/^/   - "/' | sed 's/$/"/' >> "$investigation_log"

# Count analytics implementations
analytics_files=$(find src -name "*analytics*" -o -name "*metric*" -o -name "*tracking*" | wc -l)
echo "   Total analytics implementation files: $analytics_files" >> "$investigation_log"

# Check main analytics service
if [ -f "src/services/analytics.ts" ]; then
  echo "   ✅ Main analytics service exists" >> "$investigation_log"
  
  # Check for API endpoint definitions in analytics service
  api_endpoints=$(grep -c "/api.*analytics\|/analytics" src/services/analytics.ts 2>/dev/null || echo "0")
  fetch_calls=$(grep -c "fetch.*analytics\|fetch.*api.*analytics" src/services/analytics.ts 2>/dev/null || echo "0")
  
  echo "   Analytics API endpoint definitions: $api_endpoints" >> "$investigation_log"
  echo "   Analytics fetch calls: $fetch_calls" >> "$investigation_log"
  
else
  echo "   ❌ Main analytics service not found" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 2: Analytics API Route Implementation"
echo "============================================"
echo "STEP 2: Analytics API Route Implementation" >> "$investigation_log"
echo "===========================================" >> "$investigation_log"

echo "📁 Analyzing backend analytics API route implementations..."

# Check for analytics API routes
analytics_routes=$(find src -path "*/api/routes/*" -name "*analytics*" 2>/dev/null | wc -l)
echo "   Analytics API route files: $analytics_routes files" >> "$investigation_log"

if [ "$analytics_routes" -gt 0 ]; then
  echo "   Analytics API route implementations:" >> "$investigation_log"
  find src -path "*/api/routes/*" -name "*analytics*" 2>/dev/null | sed 's/^/     - /' >> "$investigation_log"
else
  echo "   ❌ No analytics API route implementations found" >> "$investigation_log"
fi

# Check for analytics endpoints in existing routes
analytics_in_routes=$(find src -path "*/api/routes/*" -name "*.ts" -exec grep -l "analytics" {} \; 2>/dev/null | wc -l)
echo "   Existing routes with analytics: $analytics_in_routes files" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 3: Frontend Analytics Usage Analysis"
echo "==========================================="
echo "STEP 3: Frontend Analytics Usage Analysis" >> "$investigation_log"
echo "===========================================" >> "$investigation_log"

echo "📁 Analyzing frontend analytics API calls and implementations..."

# Check for analytics API calls in frontend
frontend_analytics=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "analytics.*api\|api.*analytics" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
hook_analytics=$(find src -name "*hook*" | xargs grep -c "analytics" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   Frontend analytics API calls: $frontend_analytics references" >> "$investigation_log"
echo "   Analytics hooks usage: $hook_analytics references" >> "$investigation_log"

# Check specific analytics patterns
tracking_calls=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "track.*event\|send.*analytics\|log.*metric" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
performance_analytics=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "performance.*track\|metric.*record" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   Event tracking calls: $tracking_calls references" >> "$investigation_log"
echo "   Performance analytics: $performance_analytics references" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 4: Third-party Analytics Integration"
echo "==========================================="
echo "STEP 4: Third-party Analytics Integration" >> "$investigation_log"
echo "===========================================" >> "$investigation_log"

echo "📁 Analyzing third-party analytics service integrations..."

# Check for Google Analytics, Sentry, or other analytics
google_analytics=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "gtag\|google.*analytics\|GA_" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
sentry_analytics=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "Sentry\|sentry" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
custom_analytics=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "analytics.*service\|AnalyticsService" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   Google Analytics integration: $google_analytics references" >> "$investigation_log"
echo "   Sentry analytics integration: $sentry_analytics references" >> "$investigation_log"
echo "   Custom analytics service: $custom_analytics references" >> "$investigation_log"

# Check infrastructure monitoring for analytics
if [ -f "src/services/infrastructure-monitoring.ts" ]; then
  monitoring_analytics=$(grep -c "analytics\|metrics.*analytics" src/services/infrastructure-monitoring.ts 2>/dev/null || echo "0")
  echo "   Infrastructure monitoring analytics: $monitoring_analytics references" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 5: Environment Configuration Analysis"
echo "============================================"
echo "STEP 5: Environment Configuration Analysis" >> "$investigation_log"
echo "===========================================" >> "$investigation_log"

echo "📁 Analyzing analytics configuration and environment variables..."

# Check environment variables for analytics
env_analytics=$(find . -name ".env*" -exec grep -c "ANALYTICS\|TRACKING\|GA_\|GOOGLE" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   Environment analytics variables: $env_analytics variables" >> "$investigation_log"

# Check Vite configuration for analytics proxy
if [ -f "vite.config.ts" ]; then
  vite_analytics=$(grep -A20 "proxy\|server" vite.config.ts | grep -c "analytics" | head -1)
  echo "   Vite analytics proxy configuration: $vite_analytics entries" >> "$investigation_log"
  
  if [ "$vite_analytics" -eq 0 ]; then
    echo "   ⚠️  No analytics proxy configuration in Vite" >> "$investigation_log"
    vite_analytics_missing=true
  else
    echo "   ✅ Analytics proxy configuration present" >> "$investigation_log"
    vite_analytics_missing=false
  fi
fi

# Check package.json for analytics dependencies
if [ -f "package.json" ]; then
  analytics_deps=$(grep -c "analytics\|gtag\|google.*analytics" package.json 2>/dev/null || echo "0")
  echo "   Analytics package dependencies: $analytics_deps packages" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "📊 HYPOTHESIS GENERATION"
echo "========================"
echo "HYPOTHESIS GENERATION" >> "$investigation_log"
echo "====================" >> "$investigation_log"

# Generate hypotheses based on findings
hypotheses=()

if [ "$analytics_files" -gt 0 ] && [ "$analytics_routes" -eq 0 ]; then
  echo "🔬 HYPOTHESIS A: Analytics Frontend Without Backend Implementation" >> "$investigation_log"
  echo "   Evidence: $analytics_files analytics files but $analytics_routes backend routes" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypotheses+=("frontend-only")
fi

if [ "$frontend_analytics" -gt 0 ] && [ "$vite_analytics_missing" = true ]; then
  echo "🔬 HYPOTHESIS B: Missing Development Analytics Proxy" >> "$investigation_log"
  echo "   Evidence: $frontend_analytics API calls but no Vite proxy configuration" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("proxy-missing")
fi

if [ "$sentry_analytics" -gt 0 ] && [ "$custom_analytics" -eq 0 ]; then
  echo "🔬 HYPOTHESIS C: Analytics Through Infrastructure Monitoring Only" >> "$investigation_log"
  echo "   Evidence: Sentry integration without custom analytics service" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("infrastructure-only")
fi

if [ "$google_analytics" -eq 0 ] && [ "$custom_analytics" -eq 0 ] && [ "$analytics_files" -gt 0 ]; then
  echo "🔬 HYPOTHESIS D: Analytics Files Without Actual Implementation" >> "$investigation_log"
  echo "   Evidence: Analytics files exist but no actual analytics integration" >> "$investigation_log"
  echo "   Probability: LOW" >> "$investigation_log"
  hypotheses+=("stub-only")
fi

if [ ${#hypotheses[@]} -eq 0 ]; then
  echo "❌ HYPOTHESIS NONE: No analytics API 404 patterns detected" >> "$investigation_log"
  echo "   Evidence: Analytics implementation appears complete or not used" >> "$investigation_log"
  hypotheses+=("none")
fi

echo "" >> "$investigation_log"
echo "🎯 RECOMMENDED NEXT STEPS" >> "$investigation_log"
echo "========================" >> "$investigation_log"

if [[ " ${hypotheses[@]} " =~ " frontend-only " ]]; then
  echo "1. Implement backend analytics API endpoints for data collection" >> "$investigation_log"
  echo "2. Add Vite development proxy for analytics API as interim solution" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " proxy-missing " ]]; then
  echo "3. Add Vite analytics proxy configuration for development environment" >> "$investigation_log"
  echo "4. Configure mock analytics responses for testing" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " infrastructure-only " ]]; then
  echo "5. Verify if Sentry/infrastructure monitoring covers analytics needs" >> "$investigation_log"
  echo "6. Consider consolidating analytics through existing monitoring" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " stub-only " ]]; then
  echo "7. Remove unused analytics files or implement actual functionality" >> "$investigation_log"
  echo "8. Clarify analytics requirements for the application" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " none " ]]; then
  echo "9. Verify if analytics 404 errors are actually occurring" >> "$investigation_log"
  echo "10. Check if issue is resolved by previous health check fixes" >> "$investigation_log"
fi

echo ""
echo "📊 Investigation complete. Results logged to: $investigation_log"
echo "🎯 Primary hypotheses: ${hypotheses[*]}"
echo "🔧 Next step: Create verification testing script for analytics API patterns"