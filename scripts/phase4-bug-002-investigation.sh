#!/bin/bash

# Phase 4: Bug #002 Investigation - JavaScript TypeError in Background Processes
# Systematic investigation för analyzing JavaScript errors during runtime

set -e

echo "🔬 Phase 4: Bug #002 Investigation"
echo "=================================="
echo "Issue: JavaScript TypeError in background processes"
echo "Priority: MEDIUM"
echo "User Report: JavaScript errors occurring in background during application runtime"
echo ""

# Create investigation log
investigation_log="docs/quality/phase4-bug-002-investigation.log"
mkdir -p "$(dirname "$investigation_log")"

echo "Bug #002 Investigation - $(date)" > "$investigation_log"
echo "=================================" >> "$investigation_log"
echo "" >> "$investigation_log"

echo "🔍 STEP 1: Background Process Analysis"
echo "====================================="
echo "STEP 1: Background Process Analysis" >> "$investigation_log"
echo "===================================" >> "$investigation_log"

echo "📁 Analyzing background service implementations..."

# Find background service files
echo "   Background service files:" >> "$investigation_log"
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "setInterval\|setTimeout\|requestAnimationFrame\|Worker\|background" 2>/dev/null | sed 's/^/   - "/' | sed 's/$/"/' >> "$investigation_log" 2>/dev/null

# Count background process implementations
background_files=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "setInterval\|setTimeout\|requestAnimationFrame\|Worker\|background" 2>/dev/null | wc -l)
echo "   Total background process files: $background_files" >> "$investigation_log"

# Analyze specific background patterns
echo "   Background process patterns:" >> "$investigation_log"
setinterval_count=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "setInterval" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
settimeout_count=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "setTimeout" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
worker_count=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "Worker" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
raf_count=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "requestAnimationFrame" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   setInterval usage: $setinterval_count references" >> "$investigation_log"
echo "   setTimeout usage: $settimeout_count references" >> "$investigation_log"
echo "   Worker usage: $worker_count references" >> "$investigation_log"
echo "   requestAnimationFrame usage: $raf_count references" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 2: TypeError Pattern Analysis"
echo "===================================="
echo "STEP 2: TypeError Pattern Analysis" >> "$investigation_log"
echo "===================================" >> "$investigation_log"

echo "📁 Analyzing common TypeError patterns..."

# Check for common TypeError sources
echo "   TypeError risk patterns:" >> "$investigation_log"
undefined_access=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "\..*\.\|undefined\.\|null\." 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
destructuring_count=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "{.*}" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
property_access=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "\[.*\]" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   Property chain access: $undefined_access references" >> "$investigation_log"
echo "   Destructuring patterns: $destructuring_count references" >> "$investigation_log"
echo "   Dynamic property access: $property_access references" >> "$investigation_log"

# Check async/await error handling
async_count=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "async\|await" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
trycatch_count=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "try.*catch\|catch.*error" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   Async/await usage: $async_count references" >> "$investigation_log"
echo "   Try/catch blocks: $trycatch_count references" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 3: Service Worker and Background Analysis"
echo "================================================"
echo "STEP 3: Service Worker and Background Analysis" >> "$investigation_log"
echo "===============================================" >> "$investigation_log"

echo "📁 Analyzing service worker and monitoring services..."

# Check monitoring services specifically
if [ -f "src/services/infrastructure-monitoring.ts" ]; then
  echo "   ✅ infrastructure-monitoring.ts exists" >> "$investigation_log"
  
  # Check for error handling in monitoring
  monitoring_errors=$(grep -c "catch\|error\|Error" src/services/infrastructure-monitoring.ts 2>/dev/null || echo "0")
  echo "   Monitoring error handling: $monitoring_errors implementations" >> "$investigation_log"
  
  # Check for background operations
  monitoring_intervals=$(grep -c "setInterval\|setTimeout" src/services/infrastructure-monitoring.ts 2>/dev/null || echo "0")
  echo "   Monitoring background operations: $monitoring_intervals timers" >> "$investigation_log"
  
else
  echo "   ❌ infrastructure-monitoring.ts not found" >> "$investigation_log"
fi

# Check for service worker registration
sw_files=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "serviceWorker\|navigator.serviceWorker" 2>/dev/null | wc -l)
echo "   Service worker related files: $sw_files" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 4: State Management Error Analysis"
echo "=========================================="
echo "STEP 4: State Management Error Analysis" >> "$investigation_log"
echo "========================================" >> "$investigation_log"

echo "📁 Analyzing state management error patterns..."

# Check React state and context usage
usestate_count=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "useState\|useEffect\|useContext" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
context_files=$(find src -name "*Context*.ts*" | wc -l)

echo "   React hooks usage: $usestate_count references" >> "$investigation_log"
echo "   Context files: $context_files files" >> "$investigation_log"

# Check for cleanup patterns
cleanup_count=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "useEffect.*return\|cleanup\|clear.*Interval\|clear.*Timeout" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   Cleanup implementations: $cleanup_count patterns" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 5: Console Error Analysis"
echo "================================"
echo "STEP 5: Console Error Analysis" >> "$investigation_log"
echo "===============================" >> "$investigation_log"

echo "📁 Analyzing console and error logging..."

# Check error logging patterns
console_errors=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "console\.error\|console\.warn" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
error_boundaries=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "ErrorBoundary\|componentDidCatch" 2>/dev/null | wc -l)

echo "   Console error/warn usage: $console_errors references" >> "$investigation_log"
echo "   Error boundary implementations: $error_boundaries files" >> "$investigation_log"

# Check for Sentry or monitoring integration
sentry_usage=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "Sentry\|captureException" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   Error monitoring integration: $sentry_usage references" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "📊 HYPOTHESIS GENERATION"
echo "========================"
echo "HYPOTHESIS GENERATION" >> "$investigation_log"
echo "====================" >> "$investigation_log"

# Generate hypotheses based on findings
hypotheses=()

if [ "$monitoring_intervals" -gt 0 ]; then
  echo "🔬 HYPOTHESIS A: Infrastructure Monitoring Background Errors" >> "$investigation_log"
  echo "   Evidence: Infrastructure monitoring has $monitoring_intervals background timers" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypotheses+=("monitoring")
fi

if [ "$async_count" -gt "$trycatch_count" ]; then
  echo "🔬 HYPOTHESIS B: Unhandled Async/Await Errors" >> "$investigation_log"
  echo "   Evidence: $async_count async operations vs $trycatch_count error handlers" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("async")
fi

if [ "$cleanup_count" -lt "$setinterval_count" ]; then
  echo "🔬 HYPOTHESIS C: Timer Cleanup Issues" >> "$investigation_log"
  echo "   Evidence: $setinterval_count timers vs $cleanup_count cleanup patterns" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("cleanup")
fi

if [ "$undefined_access" -gt 100 ]; then
  echo "🔬 HYPOTHESIS D: Property Access on Undefined Objects" >> "$investigation_log"
  echo "   Evidence: High property chain access ($undefined_access) without proper checks" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("undefined")
fi

if [ ${#hypotheses[@]} -eq 0 ]; then
  echo "❌ HYPOTHESIS NONE: No clear TypeError patterns detected" >> "$investigation_log"
  echo "   Evidence: Low background process activity, good error handling coverage" >> "$investigation_log"
  hypotheses+=("none")
fi

echo "" >> "$investigation_log"
echo "🎯 RECOMMENDED NEXT STEPS" >> "$investigation_log"
echo "========================" >> "$investigation_log"

if [[ " ${hypotheses[@]} " =~ " monitoring " ]]; then
  echo "1. Deep analyze infrastructure monitoring background processes" >> "$investigation_log"
  echo "2. Check health check error handling and timeout management" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " async " ]]; then
  echo "3. Review async/await error handling in background services" >> "$investigation_log"
  echo "4. Add comprehensive try/catch blocks for background operations" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " cleanup " ]]; then
  echo "5. Audit timer cleanup in React components and services" >> "$investigation_log"
  echo "6. Implement proper useEffect cleanup functions" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " undefined " ]]; then
  echo "7. Add null/undefined checks for property access chains" >> "$investigation_log"
  echo "8. Implement optional chaining (?.) where appropriate" >> "$investigation_log"
fi

echo ""
echo "📊 Investigation complete. Results logged to: $investigation_log"
echo "🎯 Primary hypotheses: ${hypotheses[*]}"
echo "🔧 Next step: Create verification testing script for identified hypotheses"