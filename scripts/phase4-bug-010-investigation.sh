#!/bin/bash

# Phase 4: Bug #010 Investigation - Health Check Error Accumulation During Navigation
# Systematic investigation för analyzing health check error buildup during app navigation

set -e

echo "🔬 Phase 4: Bug #010 Investigation"
echo "=================================="
echo "Issue: Health check error accumulation during navigation"
echo "Priority: MEDIUM"
echo "User Report: Health check errors accumulate during application navigation"
echo ""

# Create investigation log
investigation_log="docs/quality/phase4-bug-010-investigation.log"
mkdir -p "$(dirname "$investigation_log")"

echo "Bug #010 Investigation - $(date)" > "$investigation_log"
echo "=================================" >> "$investigation_log"
echo "" >> "$investigation_log"

echo "🔍 STEP 1: Health Check Service Behavior Analysis"
echo "================================================"
echo "STEP 1: Health Check Service Behavior Analysis" >> "$investigation_log"
echo "===============================================" >> "$investigation_log"

echo "📁 Analyzing health check service lifecycle and cleanup..."

if [ -f "src/services/infrastructure-monitoring.ts" ]; then
  echo "   ✅ Infrastructure monitoring service exists" >> "$investigation_log"
  
  # Check health check interval management
  interval_creation=$(grep -c "setInterval" src/services/infrastructure-monitoring.ts)
  interval_cleanup=$(grep -c "clearInterval" src/services/infrastructure-monitoring.ts)
  
  echo "   Health check interval creation: $interval_creation references" >> "$investigation_log"
  echo "   Health check interval cleanup: $interval_cleanup references" >> "$investigation_log"
  
  # Check initialization patterns
  initialization_calls=$(grep -c "startHealthChecks\|initialize.*health" src/services/infrastructure-monitoring.ts)
  singleton_pattern=$(grep -c "getInstance\|static.*instance" src/services/infrastructure-monitoring.ts)
  
  echo "   Health check initialization calls: $initialization_calls references" >> "$investigation_log"
  echo "   Singleton pattern usage: $singleton_pattern references" >> "$investigation_log"
  
  if [ "$interval_creation" -gt "$interval_cleanup" ]; then
    echo "   🔍 POTENTIAL ISSUE: More interval creation than cleanup" >> "$investigation_log"
    interval_leak_potential=true
  else
    echo "   ✅ Interval creation/cleanup appears balanced" >> "$investigation_log"
    interval_leak_potential=false
  fi
  
else
  echo "   ❌ Infrastructure monitoring service not found" >> "$investigation_log"
  interval_leak_potential=false
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 2: Navigation Event Integration Analysis"
echo "==============================================="
echo "STEP 2: Navigation Event Integration Analysis" >> "$investigation_log"
echo "===============================================" >> "$investigation_log"

echo "📁 Analyzing health check integration with navigation events..."

# Check for navigation-triggered health checks
nav_health_integration=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "navigation.*health\|route.*health\|health.*navigation" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
useeffect_health=$(find src -name "*.tsx" | xargs grep -c "useEffect.*health\|health.*useEffect" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   Navigation-health integration: $nav_health_integration references" >> "$investigation_log"
echo "   Health checks in useEffect: $useeffect_health references" >> "$investigation_log"

# Check for React Router or navigation cleanup patterns
react_cleanup=$(find src -name "*.tsx" | xargs grep -c "useEffect.*return\|cleanup.*navigation" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
navigation_files=$(find src -name "*navigation*" -o -name "*router*" | wc -l)

echo "   React navigation cleanup patterns: $react_cleanup references" >> "$investigation_log"
echo "   Navigation-related files: $navigation_files files" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 3: Error Accumulation Pattern Analysis" 
echo "=============================================="
echo "STEP 3: Error Accumulation Pattern Analysis" >> "$investigation_log"
echo "=============================================" >> "$investigation_log"

echo "📁 Analyzing error handling and accumulation patterns..."

# Check for error array or collection patterns
error_arrays=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "errors\[\]\|error.*array\|push.*error" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
error_state=$(find src -name "*.tsx" | xargs grep -c "useState.*error\|error.*state" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   Error array/collection patterns: $error_arrays references" >> "$investigation_log"
echo "   Error state management: $error_state references" >> "$investigation_log"

# Check for error clearing/reset mechanisms
error_clearing=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "clear.*error\|reset.*error\|error.*clear" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
error_timeout=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "setTimeout.*error\|error.*timeout" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   Error clearing mechanisms: $error_clearing references" >> "$investigation_log"
echo "   Error timeout handling: $error_timeout references" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 4: Health Check Configuration Analysis"
echo "=============================================="
echo "STEP 4: Health Check Configuration Analysis" >> "$investigation_log"
echo "==============================================" >> "$investigation_log"

echo "📁 Analyzing health check configuration and frequency..."

if [ -f "src/main.tsx" ]; then
  echo "   ✅ Main application file exists" >> "$investigation_log"
  
  # Check health check endpoint configuration
  health_endpoints=$(grep -A10 "healthCheckEndpoints" src/main.tsx | grep -c "interval:" | head -1)
  health_intervals=$(grep -A10 "healthCheckEndpoints" src/main.tsx | grep "interval:" | sed 's/.*interval: *\([0-9]*\).*/\1/' | head -3)
  
  echo "   Configured health check endpoints: $health_endpoints endpoints" >> "$investigation_log"
  echo "   Health check intervals configured:" >> "$investigation_log"
  echo "$health_intervals" | while read interval; do
    if [ -n "$interval" ]; then
      echo "     - ${interval}ms" >> "$investigation_log"
    fi
  done
  
  # Check if intervals are too frequent
  min_interval=$(echo "$health_intervals" | sort -n | head -1)
  if [ -n "$min_interval" ] && [ "$min_interval" -lt 30000 ]; then
    echo "   ⚠️  Potentially frequent health checks detected (min: ${min_interval}ms)" >> "$investigation_log"
    frequent_checks=true
  else
    echo "   ✅ Health check intervals appear reasonable" >> "$investigation_log"
    frequent_checks=false
  fi
  
else
  echo "   ❌ Main application file not found" >> "$investigation_log"
  frequent_checks=false
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 5: Memory Leak and Resource Management"
echo "=============================================="
echo "STEP 5: Memory Leak and Resource Management" >> "$investigation_log"
echo "==============================================" >> "$investigation_log"

echo "📁 Analyzing memory management and resource cleanup..."

# Check for memory leak prevention patterns
memory_cleanup=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "cleanup\|unmount\|destroy\|dispose" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
service_cleanup=$(find src -name "*service*" | xargs grep -c "cleanup\|destroy\|dispose" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   Memory cleanup patterns: $memory_cleanup references" >> "$investigation_log"
echo "   Service cleanup patterns: $service_cleanup references" >> "$investigation_log"

# Check if infrastructure monitoring has proper cleanup
if [ -f "src/services/infrastructure-monitoring.ts" ]; then
  monitoring_cleanup=$(grep -A20 "cleanup" src/services/infrastructure-monitoring.ts | wc -l)
  echo "   Infrastructure monitoring cleanup implementation: $monitoring_cleanup lines" >> "$investigation_log"
  
  if [ "$monitoring_cleanup" -gt 5 ]; then
    echo "   ✅ Infrastructure monitoring has cleanup implementation" >> "$investigation_log"
    proper_cleanup=true
  else
    echo "   ⚠️  Infrastructure monitoring cleanup may be incomplete" >> "$investigation_log"
    proper_cleanup=false
  fi
fi

echo "" >> "$investigation_log"

echo "📊 HYPOTHESIS GENERATION"
echo "========================"
echo "HYPOTHESIS GENERATION" >> "$investigation_log"
echo "====================" >> "$investigation_log"

# Generate hypotheses based on findings
hypotheses=()

if [ "$interval_leak_potential" = true ]; then
  echo "🔬 HYPOTHESIS A: Health Check Interval Memory Leaks" >> "$investigation_log"
  echo "   Evidence: More interval creation than cleanup in infrastructure monitoring" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypotheses+=("interval-leaks")
fi

if [ "$frequent_checks" = true ]; then
  echo "🔬 HYPOTHESIS B: Overly Frequent Health Check Intervals" >> "$investigation_log"
  echo "   Evidence: Health check intervals shorter than 30 seconds detected" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("frequent-checks")
fi

if [ "$error_clearing" -eq 0 ] && [ "$error_arrays" -gt 0 ]; then
  echo "🔬 HYPOTHESIS C: Error Accumulation Without Clearing Mechanism" >> "$investigation_log"
  echo "   Evidence: Error collection patterns without clearing mechanisms" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("error-accumulation")
fi

if [ "$react_cleanup" -eq 0 ] && [ "$useeffect_health" -gt 0 ]; then
  echo "🔬 HYPOTHESIS D: Missing React Navigation Cleanup" >> "$investigation_log"
  echo "   Evidence: Health checks in useEffect without proper cleanup" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("react-cleanup-missing")
fi

if [ "$proper_cleanup" = false ]; then
  echo "🔬 HYPOTHESIS E: Incomplete Service Cleanup Implementation" >> "$investigation_log"
  echo "   Evidence: Infrastructure monitoring service lacks proper cleanup" >> "$investigation_log"
  echo "   Probability: LOW" >> "$investigation_log"
  hypotheses+=("incomplete-cleanup")
fi

if [ ${#hypotheses[@]} -eq 0 ]; then
  echo "❌ HYPOTHESIS NONE: No health check error accumulation patterns detected" >> "$investigation_log"
  echo "   Evidence: Health check management appears properly implemented" >> "$investigation_log"
  hypotheses+=("none")
fi

echo "" >> "$investigation_log"
echo "🎯 RECOMMENDED NEXT STEPS" >> "$investigation_log"
echo "========================" >> "$investigation_log"

if [[ " ${hypotheses[@]} " =~ " interval-leaks " ]]; then
  echo "1. Ensure all health check intervals are properly cleared on cleanup" >> "$investigation_log"
  echo "2. Add singleton cleanup mechanism for infrastructure monitoring" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " frequent-checks " ]]; then
  echo "3. Increase health check intervals to reduce server load" >> "$investigation_log"
  echo "4. Consider adaptive health check frequency based on error rate" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " error-accumulation " ]]; then
  echo "5. Implement error clearing mechanism after navigation" >> "$investigation_log"
  echo "6. Add error timeout or maximum error count limits" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " react-cleanup-missing " ]]; then
  echo "7. Add cleanup functions to React useEffect hooks with health checks" >> "$investigation_log"
  echo "8. Implement navigation-aware health check management" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " incomplete-cleanup " ]]; then
  echo "9. Complete infrastructure monitoring service cleanup implementation" >> "$investigation_log"
  echo "10. Add proper resource disposal for all monitoring components" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " none " ]]; then
  echo "11. Verify if health check error accumulation issue still exists" >> "$investigation_log"
  echo "12. Check if previous health check fixes resolved accumulation problem" >> "$investigation_log"
fi

echo ""
echo "📊 Investigation complete. Results logged to: $investigation_log"
echo "🎯 Primary hypotheses: ${hypotheses[*]}"
echo "🔧 Next step: Create verification testing script for health check error patterns"