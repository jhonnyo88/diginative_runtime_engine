#!/bin/bash

# Phase 4: Bug #005 Investigation - WebSocket Connection Failures
# Systematic investigation för analyzing WebSocket connectivity issues

set -e

echo "🔬 Phase 4: Bug #005 Investigation"
echo "=================================="
echo "Issue: WebSocket connection failures"
echo "Priority: MEDIUM"
echo "User Report: WebSocket connections failing during application runtime"
echo ""

# Create investigation log
investigation_log="docs/quality/phase4-bug-005-investigation.log"
mkdir -p "$(dirname "$investigation_log")"

echo "Bug #005 Investigation - $(date)" > "$investigation_log"
echo "=================================" >> "$investigation_log"
echo "" >> "$investigation_log"

echo "🔍 STEP 1: WebSocket Implementation Analysis"
echo "==========================================="
echo "STEP 1: WebSocket Implementation Analysis" >> "$investigation_log"
echo "===========================================" >> "$investigation_log"

echo "📁 Analyzing WebSocket implementation and configuration..."

# Find WebSocket related files
echo "   WebSocket related files:" >> "$investigation_log"
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "WebSocket\|websocket\|ws:/\|wss:/\|socket.io" 2>/dev/null | sed 's/^/   - "/' | sed 's/$/"/' >> "$investigation_log" 2>/dev/null

# Count WebSocket implementations
websocket_files=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "WebSocket\|websocket\|ws:/\|wss:/\|socket.io" 2>/dev/null | wc -l)
echo "   Total WebSocket implementation files: $websocket_files" >> "$investigation_log"

# Analyze WebSocket patterns
echo "   WebSocket usage patterns:" >> "$investigation_log"
websocket_new=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "new WebSocket\|new socket" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
websocket_connect=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "\.connect\|\.open" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
websocket_close=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "\.close\|\.disconnect" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
websocket_error=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "\.onerror\|\.on.*error" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   WebSocket instantiation: $websocket_new references" >> "$investigation_log"
echo "   Connection attempts: $websocket_connect references" >> "$investigation_log"
echo "   Close/disconnect calls: $websocket_close references" >> "$investigation_log"
echo "   Error handling: $websocket_error handlers" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 2: WebSocket Service Configuration Analysis"
echo "=================================================="
echo "STEP 2: WebSocket Service Configuration Analysis" >> "$investigation_log"
echo "=================================================" >> "$investigation_log"

echo "📁 Analyzing WebSocket service configuration and endpoints..."

# Check for WebSocket service files
websocket_services=$(find src -name "*websocket*" -o -name "*socket*" | grep -v test | wc -l)
echo "   WebSocket service files: $websocket_services files" >> "$investigation_log"

if [ "$websocket_services" -gt 0 ]; then
  echo "   WebSocket service implementations:" >> "$investigation_log"
  find src -name "*websocket*" -o -name "*socket*" | grep -v test | sed 's/^/     - /' >> "$investigation_log"
else
  echo "   ❌ No dedicated WebSocket service files found" >> "$investigation_log"
fi

# Check for WebSocket URLs/endpoints
echo "   WebSocket endpoint analysis:" >> "$investigation_log"
ws_urls=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "ws://\|wss://" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
localhost_ws=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "ws://localhost\|wss://localhost" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
env_ws=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "import.meta.env.*WS\|process.env.*WS" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   WebSocket URL definitions: $ws_urls references" >> "$investigation_log"
echo "   Localhost WebSocket URLs: $localhost_ws references" >> "$investigation_log"
echo "   Environment-based WebSocket config: $env_ws references" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 3: Real-time Features Analysis"
echo "======================================"
echo "STEP 3: Real-time Features Analysis" >> "$investigation_log"
echo "====================================" >> "$investigation_log"

echo "📁 Analyzing real-time feature implementations requiring WebSocket..."

# Check for real-time functionality
realtime_files=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "realtime\|real-time\|live.*update\|push.*notification" 2>/dev/null | wc -l)
echo "   Real-time feature files: $realtime_files files" >> "$investigation_log"

# Analyze specific real-time patterns
live_updates=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "live.*update\|real.*time.*update" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
push_notifications=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "push.*notification\|notification.*push" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
chat_features=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "chat\|message.*send\|message.*receive" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   Live update features: $live_updates references" >> "$investigation_log"
echo "   Push notification features: $push_notifications references" >> "$investigation_log"
echo "   Chat/messaging features: $chat_features references" >> "$investigation_log"

# Check monitoring and analytics real-time features
monitoring_realtime=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "realtime.*monitor\|live.*metric\|dashboard.*update" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   Real-time monitoring features: $monitoring_realtime references" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 4: WebSocket Error Handling Analysis"
echo "============================================"
echo "STEP 4: WebSocket Error Handling Analysis" >> "$investigation_log"
echo "==========================================" >> "$investigation_log"

echo "📁 Analyzing WebSocket error handling and reconnection logic..."

# Check error handling patterns
connection_retry=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "retry\|reconnect\|connection.*failed" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
websocket_timeout=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "timeout\|ping.*pong\|heartbeat" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
fallback_logic=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "fallback\|alternative\|backup.*connection" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   Connection retry logic: $connection_retry implementations" >> "$investigation_log"
echo "   Timeout/heartbeat handling: $websocket_timeout implementations" >> "$investigation_log"
echo "   Fallback mechanisms: $fallback_logic implementations" >> "$investigation_log"

# Check if WebSocket errors are logged
websocket_logging=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "console.*error.*socket\|logger.*socket.*error" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   WebSocket error logging: $websocket_logging implementations" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 5: Environment and Proxy Configuration"
echo "=============================================="
echo "STEP 5: Environment and Proxy Configuration" >> "$investigation_log"
echo "=============================================" >> "$investigation_log"

echo "📁 Analyzing development environment WebSocket proxy configuration..."

# Check Vite WebSocket proxy configuration
if [ -f "vite.config.ts" ]; then
  echo "   ✅ vite.config.ts exists" >> "$investigation_log"
  
  # Check for WebSocket proxy configuration
  ws_proxy=$(grep -A10 "proxy\|server" vite.config.ts | grep -c "ws\|websocket" | head -1)
  echo "   Vite WebSocket proxy configuration: $ws_proxy entries" >> "$investigation_log"
  
  if [ "$ws_proxy" -eq 0 ]; then
    echo "   ⚠️  No WebSocket proxy configuration found in Vite" >> "$investigation_log"
    vite_ws_support="missing"
  else
    echo "   ✅ WebSocket proxy configuration present" >> "$investigation_log"
    vite_ws_support="present"
  fi
  
else
  echo "   ❌ vite.config.ts not found" >> "$investigation_log"
  vite_ws_support="missing"
fi

# Check environment variables for WebSocket configuration
env_ws_vars=$(find . -name ".env*" -exec grep -c "WS\|WEBSOCKET\|SOCKET" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   Environment WebSocket variables: $env_ws_vars variables" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "📊 HYPOTHESIS GENERATION"
echo "========================"
echo "HYPOTHESIS GENERATION" >> "$investigation_log"
echo "====================" >> "$investigation_log"

# Generate hypotheses based on findings
hypotheses=()

if [ "$websocket_files" -eq 0 ]; then
  echo "🔬 HYPOTHESIS A: No WebSocket Implementation Found" >> "$investigation_log"
  echo "   Evidence: No WebSocket-related files detected in codebase" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypotheses+=("no-implementation")
elif [ "$websocket_new" -gt 0 ] && [ "$websocket_error" -eq 0 ]; then
  echo "🔬 HYPOTHESIS B: WebSocket Implementation Without Error Handling" >> "$investigation_log"
  echo "   Evidence: $websocket_new WebSocket instantiations but $websocket_error error handlers" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypotheses+=("no-error-handling")
fi

if [ "$vite_ws_support" = "missing" ] && [ "$websocket_files" -gt 0 ]; then
  echo "🔬 HYPOTHESIS C: Missing Development WebSocket Proxy Configuration" >> "$investigation_log"
  echo "   Evidence: WebSocket code exists but no Vite proxy configuration for development" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("proxy-missing")
fi

if [ "$connection_retry" -eq 0 ] && [ "$websocket_files" -gt 0 ]; then
  echo "🔬 HYPOTHESIS D: No WebSocket Reconnection Logic" >> "$investigation_log"
  echo "   Evidence: WebSocket implementation without retry/reconnection mechanisms" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("no-retry")
fi

if [ "$localhost_ws" -gt 0 ] && [ "$env_ws_vars" -eq 0 ]; then
  echo "🔬 HYPOTHESIS E: Hardcoded WebSocket URLs" >> "$investigation_log"
  echo "   Evidence: Localhost WebSocket URLs without environment configuration" >> "$investigation_log"
  echo "   Probability: LOW" >> "$investigation_log"
  hypotheses+=("hardcoded-urls")
fi

if [ ${#hypotheses[@]} -eq 0 ]; then
  echo "❌ HYPOTHESIS NONE: No WebSocket connectivity issues detected" >> "$investigation_log"
  echo "   Evidence: WebSocket implementation appears properly configured or not used" >> "$investigation_log"
  hypotheses+=("none")
fi

echo "" >> "$investigation_log"
echo "🎯 RECOMMENDED NEXT STEPS" >> "$investigation_log"
echo "========================" >> "$investigation_log"

if [[ " ${hypotheses[@]} " =~ " no-implementation " ]]; then
  echo "1. Verify if WebSocket functionality is actually needed for application features" >> "$investigation_log"
  echo "2. Consider if bug report refers to different type of connection (HTTP, EventSource)" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " no-error-handling " ]]; then
  echo "3. Add comprehensive WebSocket error handling and logging" >> "$investigation_log"
  echo "4. Implement connection state management and user feedback" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " proxy-missing " ]]; then
  echo "5. Add Vite WebSocket proxy configuration for development environment" >> "$investigation_log"
  echo "6. Configure WebSocket URL routing for different environments" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " no-retry " ]]; then
  echo "7. Implement WebSocket reconnection logic with exponential backoff" >> "$investigation_log"
  echo "8. Add connection health monitoring and automatic recovery" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " hardcoded-urls " ]]; then
  echo "9. Move WebSocket URLs to environment configuration" >> "$investigation_log"
  echo "10. Add development/production WebSocket endpoint management" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " none " ]]; then
  echo "11. Verify if bug report actually refers to WebSocket or other connection types" >> "$investigation_log"
  echo "12. Check browser developer tools for actual WebSocket connection attempts" >> "$investigation_log"
fi

echo ""
echo "📊 Investigation complete. Results logged to: $investigation_log"
echo "🎯 Primary hypotheses: ${hypotheses[*]}"
echo "🔧 Next step: Create verification testing script for WebSocket connectivity patterns"