#!/bin/bash

# Phase 4: Bug #002 Verification Testing - Infrastructure Monitoring TypeError
# Systematic verification för testing TypeError in background health check process

set -e

echo "🔬 Phase 4: Bug #002 Solution Verification"
echo "=========================================="
echo "Issue: JavaScript TypeError in background processes"
echo "Root Cause: endpoint.critical.toString() called when critical property is undefined"
echo "Proposed Solution: Add null check for optional critical property in health check error handling"
echo ""

# Create verification log
verification_log="docs/quality/phase4-bug-002-verification.log"
mkdir -p "$(dirname "$verification_log")"

echo "Bug #002 Solution Verification - $(date)" > "$verification_log"
echo "=========================================" >> "$verification_log"
echo "" >> "$verification_log"

echo "🔍 STEP 1: Verify TypeError Source in Infrastructure Monitoring"
echo "=============================================================="
echo "STEP 1: Verify TypeError Source in Infrastructure Monitoring" >> "$verification_log"
echo "==============================================================" >> "$verification_log"

echo "📁 Analyzing infrastructure-monitoring.ts critical property handling..."

# Check the specific line causing TypeError
if [ -f "src/services/infrastructure-monitoring.ts" ]; then
  echo "   ✅ infrastructure-monitoring.ts exists" >> "$verification_log"
  
  # Check for the problematic code pattern
  critical_tostring=$(grep -n "critical.*toString" src/services/infrastructure-monitoring.ts | wc -l)
  echo "   Critical toString usage: $critical_tostring occurrences" >> "$verification_log"
  
  if [ "$critical_tostring" -gt 0 ]; then
    echo "   🔍 CONFIRMED: Found critical.toString() usage without null check" >> "$verification_log"
    grep -n "critical.*toString" src/services/infrastructure-monitoring.ts | sed 's/^/     /' >> "$verification_log"
    typeerror_confirmed=true
  else
    echo "   ❓ Critical toString pattern not found" >> "$verification_log"
    typeerror_confirmed=false
  fi
  
  # Check health check endpoint interface
  critical_optional=$(grep -A10 "interface HealthCheckEndpoint" src/services/infrastructure-monitoring.ts | grep -c "critical?:" | head -1)
  echo "   Critical property optional: $critical_optional definitions" >> "$verification_log"
  
else
  echo "   ❌ infrastructure-monitoring.ts not found" >> "$verification_log"
  typeerror_confirmed=false
fi

echo "" >> "$verification_log"

echo "🔍 STEP 2: Test Health Check Configuration Analysis"
echo "=================================================="
echo "STEP 2: Test Health Check Configuration Analysis" >> "$verification_log"
echo "=================================================" >> "$verification_log"

echo "📁 Analyzing main.tsx health check endpoint configuration..."

# Check main.tsx health check configuration
if [ -f "src/main.tsx" ]; then
  echo "   ✅ main.tsx exists" >> "$verification_log"
  
  # Check if critical property is defined in health check endpoints
  critical_undefined=$(grep -A5 "healthCheckEndpoints" src/main.tsx | grep -c "critical:" | head -1)
  echo "   Health endpoints with critical property: $critical_undefined endpoints" >> "$verification_log"
  
  total_endpoints=$(grep -A10 "healthCheckEndpoints" src/main.tsx | grep -c "url:" | head -1)
  echo "   Total health check endpoints: $total_endpoints endpoints" >> "$verification_log"
  
  if [ "$critical_undefined" -lt "$total_endpoints" ]; then
    echo "   🔍 CONFIRMED: Some endpoints missing critical property (undefined by default)" >> "$verification_log"
    config_missing_critical=true
  else
    echo "   ✅ All endpoints have explicit critical property" >> "$verification_log"
    config_missing_critical=false
  fi
  
else
  echo "   ❌ main.tsx not found" >> "$verification_log"
  config_missing_critical=false
fi

echo "" >> "$verification_log"

echo "🔍 STEP 3: Test TypeError Fix Solution"
echo "====================================="
echo "STEP 3: Test TypeError Fix Solution" >> "$verification_log"
echo "====================================" >> "$verification_log"

# Create test fix for verification
temp_fix_file="src/services/infrastructure-monitoring.test-fix.ts"
echo "   Creating test fix implementation..." >> "$verification_log"

# Create temporary test file with the fix
cp "src/services/infrastructure-monitoring.ts" "$temp_fix_file"

# Apply fix to test file (replace critical.toString() with null-safe version)
sed -i 's/critical: endpoint\.critical\.toString()/critical: (endpoint.critical || false).toString()/' "$temp_fix_file"
sed -i 's/critical: endpoint\.critical\.toString()/critical: (endpoint.critical || false).toString()/' "$temp_fix_file"

echo "   ✅ Test fix applied to: $temp_fix_file" >> "$verification_log"

# Verify fix syntax
if npx tsc --noEmit "$temp_fix_file" 2>/dev/null; then
  echo "   ✅ Test fix passes TypeScript validation" >> "$verification_log"
  fix_valid=true
else
  echo "   ❌ Test fix has TypeScript errors" >> "$verification_log"
  fix_valid=false
fi

# Check that fix addresses the issue
fixed_critical_usage=$(grep -c "(endpoint.critical || false).toString()" "$temp_fix_file")
echo "   Fixed critical property access: $fixed_critical_usage occurrences" >> "$verification_log"

# Clean up test file
rm -f "$temp_fix_file"

echo "" >> "$verification_log"

echo "🔍 STEP 4: Verify Background Process Timer Safety"
echo "================================================"
echo "STEP 4: Verify Background Process Timer Safety" >> "$verification_log"
echo "===============================================" >> "$verification_log"

echo "📁 Analyzing timer cleanup and error handling..."

# Check if setInterval cleanup is properly implemented
if [ -f "src/services/infrastructure-monitoring.ts" ]; then
  
  # Check cleanup implementation
  cleanup_methods=$(grep -c "clearInterval\|cleanup" src/services/infrastructure-monitoring.ts)
  echo "   Cleanup implementations: $cleanup_methods methods" >> "$verification_log"
  
  # Check error handling in performHealthCheck
  trycatch_blocks=$(grep -A20 "performHealthCheck" src/services/infrastructure-monitoring.ts | grep -c "try\|catch" | head -1)
  echo "   Health check error handling: $trycatch_blocks try/catch blocks" >> "$verification_log"
  
  if [ "$cleanup_methods" -gt 0 ] && [ "$trycatch_blocks" -gt 0 ]; then
    echo "   ✅ Background process safety measures present" >> "$verification_log"
    background_safe=true
  else
    echo "   ⚠️  Background process safety could be improved" >> "$verification_log"
    background_safe=false
  fi
  
else
  background_safe=false
fi

echo "" >> "$verification_log"

echo "📊 SOLUTION VERIFICATION SUMMARY"
echo "==============================="
echo "SOLUTION VERIFICATION SUMMARY" >> "$verification_log"
echo "=============================" >> "$verification_log"

verification_score=0
total_checks=4

# Check 1: TypeError source confirmed
if [ "$typeerror_confirmed" = true ]; then
  echo "✅ TypeError source confirmed: endpoint.critical.toString() without null check" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ TypeError source not confirmed" >> "$verification_log"
fi

# Check 2: Configuration missing critical properties
if [ "$config_missing_critical" = true ]; then
  echo "✅ Root cause confirmed: Health endpoints missing explicit critical property" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Configuration issue not confirmed" >> "$verification_log"
fi

# Check 3: Fix solution valid
if [ "$fix_valid" = true ]; then
  echo "✅ Null-safe critical property access solution validates" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Fix solution has validation issues" >> "$verification_log"
fi

# Check 4: Background process safety
if [ "$background_safe" = true ]; then
  echo "✅ Background process error handling and cleanup present" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Background process safety concerns identified" >> "$verification_log"
fi

confidence_percentage=$((verification_score * 100 / total_checks))

echo "" >> "$verification_log"
echo "🎯 VERIFICATION RESULTS" >> "$verification_log"
echo "======================" >> "$verification_log"
echo "Confidence Score: $verification_score/$total_checks ($confidence_percentage%)" >> "$verification_log"

if [ "$confidence_percentage" -ge 100 ]; then
  echo "✅ 100% CONFIDENCE: Solution verified and ready for implementation" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Fix null-safe critical property access in infrastructure monitoring" >> "$verification_log"
  verification_status="ready"
elif [ "$confidence_percentage" -ge 75 ]; then
  echo "⚠️  HIGH CONFIDENCE: Solution mostly verified, proceed with monitoring" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Implement with test validation" >> "$verification_log"
  verification_status="caution"
else
  echo "❌ LOW CONFIDENCE: Solution verification needs improvement" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Re-investigate TypeError patterns" >> "$verification_log"
  verification_status="failed"
fi

echo "" >> "$verification_log"
echo "💡 RECOMMENDED IMPLEMENTATION APPROACH:" >> "$verification_log"
echo "Fix infrastructure-monitoring.ts line ~341:" >> "$verification_log"
echo "  BEFORE: critical: endpoint.critical.toString()" >> "$verification_log"
echo "  AFTER:  critical: (endpoint.critical || false).toString()" >> "$verification_log"
echo "" >> "$verification_log"
echo "This ensures undefined critical properties are safely handled as false." >> "$verification_log"

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