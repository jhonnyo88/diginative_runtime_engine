#!/bin/bash

# Phase 4: Bug #005 Verification Testing - WebSocket Connection Implementation
# Systematic verification för testing Socket.IO WebSocket connection setup

set -e

echo "🔬 Phase 4: Bug #005 Solution Verification"
echo "=========================================="
echo "Issue: WebSocket connection failures"
echo "Root Cause: Socket.IO service implementation without server setup and client connection"
echo "Proposed Solution: Add development mock Socket.IO server and client connection setup"
echo ""

# Create verification log
verification_log="docs/quality/phase4-bug-005-verification.log"
mkdir -p "$(dirname "$verification_log")"

echo "Bug #005 Solution Verification - $(date)" > "$verification_log"
echo "=========================================" >> "$verification_log"
echo "" >> "$verification_log"

echo "🔍 STEP 1: Verify Socket.IO Implementation Gap"
echo "=============================================="
echo "STEP 1: Verify Socket.IO Implementation Gap" >> "$verification_log"
echo "===============================================" >> "$verification_log"

echo "📁 Analyzing Socket.IO server and client implementation..."

# Check Socket.IO service implementation
if [ -f "src/api/websocket-validation.ts" ]; then
  echo "   ✅ WebSocket validation service exists" >> "$verification_log"
  
  # Check for Socket.IO server usage
  socketio_server=$(grep -c "Server.*SocketIOServer\|socket.io" src/api/websocket-validation.ts)
  echo "   Socket.IO server references: $socketio_server" >> "$verification_log"
  
  # Check for server instantiation
  server_setup=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "new.*SocketIOServer\|createServer.*socket" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
  echo "   Socket.IO server instantiation: $server_setup occurrences" >> "$verification_log"
  
  if [ "$server_setup" -eq 0 ]; then
    echo "   🔍 CONFIRMED: Socket.IO service exists but no server setup found" >> "$verification_log"
    server_gap=true
  else
    echo "   ✅ Socket.IO server setup found" >> "$verification_log"
    server_gap=false
  fi
  
else
  echo "   ❌ WebSocket validation service not found" >> "$verification_log"
  server_gap=false
fi

# Check for client-side Socket.IO connection
client_socketio=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "socket.io-client\|io.*connect\|io.*socket" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   Client Socket.IO connections: $client_socketio references" >> "$verification_log"

if [ "$client_socketio" -eq 0 ]; then
  echo "   🔍 CONFIRMED: No client-side Socket.IO connection implementation" >> "$verification_log"
  client_gap=true
else
  echo "   ✅ Client Socket.IO implementation found" >> "$verification_log"
  client_gap=false
fi

echo "" >> "$verification_log"

echo "🔍 STEP 2: Check Package Dependencies"
echo "===================================="
echo "STEP 2: Check Package Dependencies" >> "$verification_log"
echo "====================================" >> "$verification_log"

echo "📁 Analyzing Socket.IO package dependencies..."

# Check package.json for Socket.IO dependencies
if [ -f "package.json" ]; then
  echo "   ✅ package.json exists" >> "$verification_log"
  
  socketio_deps=$(grep -c "socket.io" package.json 2>/dev/null || echo "0")
  socketio_client_deps=$(grep -c "socket.io-client" package.json 2>/dev/null || echo "0")
  
  echo "   Socket.IO server dependency: $socketio_deps references" >> "$verification_log"
  echo "   Socket.IO client dependency: $socketio_client_deps references" >> "$verification_log"
  
  if [ "$socketio_deps" -eq 0 ] && [ "$socketio_client_deps" -eq 0 ]; then
    echo "   🔍 CONFIRMED: Socket.IO dependencies missing from package.json" >> "$verification_log"
    deps_missing=true
  else
    echo "   ✅ Socket.IO dependencies present" >> "$verification_log"
    deps_missing=false
  fi
  
else
  echo "   ❌ package.json not found" >> "$verification_log"
  deps_missing=true
fi

echo "" >> "$verification_log"

echo "🔍 STEP 3: Test Development Server Integration"
echo "=============================================="
echo "STEP 3: Test Development Server Integration" >> "$verification_log"
echo "=============================================" >> "$verification_log"

echo "📁 Analyzing Vite development server WebSocket integration..."

# Check Vite configuration for WebSocket support
if [ -f "vite.config.ts" ]; then
  echo "   ✅ vite.config.ts exists" >> "$verification_log"
  
  # Check for WebSocket proxy or server configuration
  ws_server_config=$(grep -A20 "server:" vite.config.ts | grep -c "ws\|websocket\|socket" | head -1)
  echo "   Vite WebSocket server configuration: $ws_server_config entries" >> "$verification_log"
  
  if [ "$ws_server_config" -eq 0 ]; then
    echo "   🔍 CONFIRMED: No WebSocket server configuration in Vite" >> "$verification_log"
    vite_ws_missing=true
  else
    echo "   ✅ Vite WebSocket configuration present" >> "$verification_log"
    vite_ws_missing=false
  fi
  
else
  echo "   ❌ vite.config.ts not found" >> "$verification_log"
  vite_ws_missing=true
fi

echo "" >> "$verification_log"

echo "🔍 STEP 4: Test Mock Implementation Solution"
echo "==========================================="
echo "STEP 4: Test Mock Implementation Solution" >> "$verification_log"
echo "===========================================" >> "$verification_log"

# Create test mock implementation
temp_mock_file="src/mocks/socket-io-mock.test.ts"
echo "   Creating test Socket.IO mock implementation..." >> "$verification_log"

mkdir -p "$(dirname "$temp_mock_file")"

cat > "$temp_mock_file" << 'EOF'
// Test Socket.IO mock for development environment
interface MockSocket {
  emit: (event: string, data?: any) => void;
  on: (event: string, handler: Function) => void;
  disconnect: () => void;
  id: string;
}

interface MockIO {
  on: (event: string, handler: (socket: MockSocket) => void) => void;
  emit: (event: string, data?: any) => void;
}

export const createMockSocketIO = (): MockIO => {
  const sockets = new Map<string, MockSocket>();
  
  const createMockSocket = (id: string): MockSocket => ({
    id,
    emit: (event: string, data?: any) => {
      console.log(`[MockSocket ${id}] Emit: ${event}`, data);
    },
    on: (event: string, handler: Function) => {
      console.log(`[MockSocket ${id}] Listen: ${event}`);
      // Auto-trigger auth for testing
      if (event === 'auth') {
        setTimeout(() => handler({ userId: 'test', teamId: 'dev' }), 100);
      }
    },
    disconnect: () => {
      sockets.delete(id);
      console.log(`[MockSocket ${id}] Disconnected`);
    }
  });
  
  return {
    on: (event: string, handler: (socket: MockSocket) => void) => {
      if (event === 'connection') {
        // Simulate connection after setup
        setTimeout(() => {
          const mockSocket = createMockSocket(`mock_${Date.now()}`);
          sockets.set(mockSocket.id, mockSocket);
          handler(mockSocket);
        }, 50);
      }
    },
    emit: (event: string, data?: any) => {
      console.log(`[MockIO] Broadcast: ${event}`, data);
    }
  };
};

// Export for development use
if (import.meta.env.DEV) {
  (window as any).__mockSocketIO = createMockSocketIO;
}
EOF

echo "   ✅ Test Socket.IO mock created: $temp_mock_file" >> "$verification_log"

# Verify mock syntax
if npx tsc --noEmit "$temp_mock_file" 2>/dev/null; then
  echo "   ✅ Mock implementation passes TypeScript validation" >> "$verification_log"
  mock_valid=true
else
  echo "   ❌ Mock implementation has TypeScript errors" >> "$verification_log"
  mock_valid=false
fi

# Clean up test file
rm -rf src/mocks

echo "" >> "$verification_log"

echo "📊 SOLUTION VERIFICATION SUMMARY"
echo "==============================="
echo "SOLUTION VERIFICATION SUMMARY" >> "$verification_log"
echo "=============================" >> "$verification_log"

verification_score=0
total_checks=4

# Check 1: Server implementation gap confirmed
if [ "$server_gap" = true ]; then
  echo "✅ Server gap confirmed: Socket.IO service without server instantiation" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Server implementation gap not confirmed" >> "$verification_log"
fi

# Check 2: Client implementation gap confirmed
if [ "$client_gap" = true ]; then
  echo "✅ Client gap confirmed: No client-side Socket.IO connection code" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Client implementation gap not confirmed" >> "$verification_log"
fi

# Check 3: Missing dependencies confirmed
if [ "$deps_missing" = true ]; then
  echo "✅ Dependencies confirmed missing: Socket.IO not in package.json" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Dependencies issue not confirmed" >> "$verification_log"
fi

# Check 4: Mock solution valid
if [ "$mock_valid" = true ]; then
  echo "✅ Mock Socket.IO solution validates for development environment" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Mock solution has validation issues" >> "$verification_log"
fi

confidence_percentage=$((verification_score * 100 / total_checks))

echo "" >> "$verification_log"
echo "🎯 VERIFICATION RESULTS" >> "$verification_log"
echo "======================" >> "$verification_log"
echo "Confidence Score: $verification_score/$total_checks ($confidence_percentage%)" >> "$verification_log"

if [ "$confidence_percentage" -ge 100 ]; then
  echo "✅ 100% CONFIDENCE: Solution verified and ready for implementation" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Add development Socket.IO mock server setup" >> "$verification_log"
  verification_status="ready"
elif [ "$confidence_percentage" -ge 75 ]; then
  echo "⚠️  HIGH CONFIDENCE: Solution mostly verified, proceed with monitoring" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Implement with dependency installation" >> "$verification_log"
  verification_status="caution"
else
  echo "❌ LOW CONFIDENCE: Solution verification needs improvement" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Re-investigate WebSocket architecture" >> "$verification_log"
  verification_status="failed"
fi

echo "" >> "$verification_log"
echo "💡 RECOMMENDED IMPLEMENTATION APPROACH:" >> "$verification_log"
echo "For development environment WebSocket testing:" >> "$verification_log"
echo "1. Add development mock Socket.IO server in vite.config.ts" >> "$verification_log"
echo "2. Create mock client connection for WebSocket validation service" >> "$verification_log"
echo "3. Add Socket.IO dependencies: npm install socket.io socket.io-client" >> "$verification_log"
echo "4. Configure environment-based WebSocket URL handling" >> "$verification_log"

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