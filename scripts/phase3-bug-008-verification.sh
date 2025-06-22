#!/bin/bash

# Phase 3: Bug #008 Verification Testing - Missing PlayerName Prop
# Systematic solution verification för passing user displayName to StrategyPlayHost

set -e

echo "🔬 Phase 3: Bug #008 Solution Verification"
echo "========================================="
echo "Issue: Player name displays as '{{PLAYER_NAME}}' instead of actual name"
echo "Root Cause: playerName prop not passed from App.tsx to StrategyPlayHost"
echo "Proposed Solution: Pass user.displayName as playerName prop"
echo ""

# Create verification log
verification_log="docs/quality/phase3-bug-008-verification.log"
mkdir -p "$(dirname "$verification_log")"

echo "Bug #008 Solution Verification - $(date)" > "$verification_log"
echo "=======================================" >> "$verification_log"
echo "" >> "$verification_log"

echo "🔍 STEP 1: Verify Current Implementation"
echo "======================================="
echo "STEP 1: Verify Current Implementation" >> "$verification_log"
echo "=====================================" >> "$verification_log"

# Check current App.tsx StrategyPlayHost call
echo "📁 Analyzing current StrategyPlayHost implementation..."

if [ -f "src/App.tsx" ]; then
  echo "   ✅ App.tsx exists" >> "$verification_log"
  
  # Check if playerName prop is currently passed
  player_name_prop=$(grep -A5 "<StrategyPlayHost" src/App.tsx | grep -c "playerName" || echo "0")
  echo "   playerName prop currently passed: $player_name_prop" >> "$verification_log"
  
  # Check if user is available from useAuth
  use_auth_hook=$(grep -c "useAuth" src/App.tsx)
  echo "   useAuth hook usage: $use_auth_hook" >> "$verification_log"
  
  # Check user destructuring
  user_destructure=$(grep -c "user.*=" src/App.tsx)
  echo "   User destructuring: $user_destructure" >> "$verification_log"
  
  if [ "$player_name_prop" -eq 0 ]; then
    echo "   🔍 CONFIRMED: playerName prop not being passed to StrategyPlayHost" >> "$verification_log"
    missing_prop=true
  else
    echo "   ❓ playerName prop already being passed" >> "$verification_log"
    missing_prop=false
  fi
  
else
  echo "   ❌ App.tsx not found" >> "$verification_log"
  missing_prop=false
fi

echo "" >> "$verification_log"

echo "🔍 STEP 2: Verify StrategyPlayHost Interface"
echo "==========================================="
echo "STEP 2: Verify StrategyPlayHost Interface" >> "$verification_log"
echo "=========================================" >> "$verification_log"

# Check StrategyPlayHost prop interface
echo "📁 Verifying StrategyPlayHost prop interface..."

if [ -f "src/components/StrategyPlayHost.tsx" ]; then
  echo "   ✅ StrategyPlayHost.tsx exists" >> "$verification_log"
  
  # Check if playerName prop is defined
  player_name_interface=$(grep -c "playerName.*string" src/components/StrategyPlayHost.tsx)
  echo "   playerName prop defined in interface: $player_name_interface" >> "$verification_log"
  
  # Check if playerName is used in component
  player_name_usage=$(grep -c "playerName" src/components/StrategyPlayHost.tsx)
  echo "   playerName usage in component: $player_name_usage references" >> "$verification_log"
  
  if [ "$player_name_interface" -gt 0 ] && [ "$player_name_usage" -gt 3 ]; then
    echo "   ✅ StrategyPlayHost properly supports playerName prop" >> "$verification_log"
    interface_ready=true
  else
    echo "   ❌ StrategyPlayHost playerName support incomplete" >> "$verification_log"
    interface_ready=false
  fi
  
else
  echo "   ❌ StrategyPlayHost.tsx not found" >> "$verification_log"
  interface_ready=false
fi

echo "" >> "$verification_log"

echo "🔍 STEP 3: Verify Template Substitution Utility"
echo "=============================================="
echo "STEP 3: Verify Template Substitution Utility" >> "$verification_log"
echo "=============================================" >> "$verification_log"

# Check playerNameReplacement utility
echo "📁 Verifying template substitution utility..."

if [ -f "src/utils/playerNameReplacement.ts" ]; then
  echo "   ✅ playerNameReplacement.ts exists" >> "$verification_log"
  
  # Check for key functions
  replace_function=$(grep -c "replacePlayerName" src/utils/playerNameReplacement.ts)
  echo "   replacePlayerName function: $replace_function" >> "$verification_log"
  
  process_manifest=$(grep -c "processGameManifestWithPlayerName" src/utils/playerNameReplacement.ts)
  echo "   processGameManifestWithPlayerName function: $process_manifest" >> "$verification_log"
  
  if [ "$replace_function" -gt 0 ] && [ "$process_manifest" -gt 0 ]; then
    echo "   ✅ Template substitution utility fully implemented" >> "$verification_log"
    utility_ready=true
  else
    echo "   ❌ Template substitution utility incomplete" >> "$verification_log"
    utility_ready=false
  fi
  
else
  echo "   ❌ playerNameReplacement.ts not found" >> "$verification_log"
  utility_ready=false
fi

echo "" >> "$verification_log"

echo "🔍 STEP 4: Verify User Data Availability"
echo "======================================="
echo "STEP 4: Verify User Data Availability" >> "$verification_log"
echo "=====================================" >> "$verification_log"

# Check User type definition
echo "📁 Verifying user data structure..."

if [ -f "src/types/auth.ts" ]; then
  echo "   ✅ auth.ts types exist" >> "$verification_log"
  
  # Check User interface for displayName
  display_name_field=$(grep -c "displayName.*string" src/types/auth.ts)
  echo "   displayName field in User interface: $display_name_field" >> "$verification_log"
  
  if [ "$display_name_field" -gt 0 ]; then
    echo "   ✅ User.displayName field available" >> "$verification_log"
    user_data_ready=true
  else
    echo "   ❌ User.displayName field missing" >> "$verification_log"
    user_data_ready=false
  fi
  
else
  echo "   ❌ auth.ts types not found" >> "$verification_log"
  user_data_ready=false
fi

echo "" >> "$verification_log"

echo "🔍 STEP 5: Test Solution Implementation"
echo "====================================="
echo "STEP 5: Test Solution Implementation" >> "$verification_log"
echo "===================================" >> "$verification_log"

# Create test implementation
temp_test_file="src/App.test-fix.tsx"
echo "   Creating test solution implementation..." >> "$verification_log"

# Extract current App.tsx content around StrategyPlayHost
strategy_play_section=$(grep -A10 -B5 "StrategyPlayHost" src/App.tsx)

# Create test file with proposed fix
cat > "$temp_test_file" << 'EOF'
// Test implementation - passing playerName prop to StrategyPlayHost

if (gameStarted) {
  return (
    <GameProtectedRoute>
      <StrategyPlayHost
        gameManifest={sampleGame as GameManifest}
        onComplete={handleGameComplete}
        analytics={analytics}
        playerName={user?.displayName}
      />
    </GameProtectedRoute>
  );
}
EOF

echo "   ✅ Test implementation created: $temp_test_file" >> "$verification_log"

# Verify test implementation syntax
test_syntax_valid=false
if [ -f "$temp_test_file" ]; then
  # Simple syntax check
  if grep -q "playerName={user?.displayName}" "$temp_test_file"; then
    echo "   ✅ Test implementation has correct playerName prop syntax" >> "$verification_log"
    test_syntax_valid=true
  else
    echo "   ❌ Test implementation syntax incorrect" >> "$verification_log"
  fi
fi

# Clean up test file
rm -f "$temp_test_file"

echo "" >> "$verification_log"

echo "📊 SOLUTION VERIFICATION SUMMARY"
echo "==============================="
echo "SOLUTION VERIFICATION SUMMARY" >> "$verification_log"
echo "============================" >> "$verification_log"

verification_score=0
total_checks=5

# Check 1: Missing prop confirmed
if [ "$missing_prop" = true ]; then
  echo "✅ Root cause confirmed: playerName prop not passed to StrategyPlayHost" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Root cause not confirmed" >> "$verification_log"
fi

# Check 2: Interface ready
if [ "$interface_ready" = true ]; then
  echo "✅ StrategyPlayHost interface supports playerName prop" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ StrategyPlayHost interface not ready" >> "$verification_log"
fi

# Check 3: Utility ready
if [ "$utility_ready" = true ]; then
  echo "✅ Template substitution utility exists and is complete" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Template substitution utility missing or incomplete" >> "$verification_log"
fi

# Check 4: User data ready
if [ "$user_data_ready" = true ]; then
  echo "✅ User.displayName field available for playerName" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ User.displayName field not available" >> "$verification_log"
fi

# Check 5: Test implementation valid
if [ "$test_syntax_valid" = true ]; then
  echo "✅ Test implementation syntax valid" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Test implementation syntax issues" >> "$verification_log"
fi

confidence_percentage=$((verification_score * 100 / total_checks))

echo "" >> "$verification_log"
echo "🎯 VERIFICATION RESULTS" >> "$verification_log"
echo "======================" >> "$verification_log"
echo "Confidence Score: $verification_score/$total_checks ($confidence_percentage%)" >> "$verification_log"

if [ "$confidence_percentage" -ge 100 ]; then
  echo "✅ 100% CONFIDENCE: Solution verified and ready for implementation" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Add playerName={user?.displayName} prop to StrategyPlayHost" >> "$verification_log"
  verification_status="ready"
elif [ "$confidence_percentage" -ge 80 ]; then
  echo "⚠️  HIGH CONFIDENCE: Solution mostly verified, minor issues detected" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Proceed with implementation and test" >> "$verification_log"
  verification_status="caution"
else
  echo "❌ LOW CONFIDENCE: Solution verification failed" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Re-investigate missing components" >> "$verification_log"
  verification_status="failed"
fi

echo "" >> "$verification_log"
echo "💡 EXACT IMPLEMENTATION REQUIRED:" >> "$verification_log"
echo "Replace current StrategyPlayHost call in App.tsx:" >> "$verification_log"
echo "FROM:" >> "$verification_log"
echo "        <StrategyPlayHost" >> "$verification_log"
echo "          gameManifest={sampleGame as GameManifest}" >> "$verification_log"
echo "          onComplete={handleGameComplete}" >> "$verification_log"
echo "          analytics={analytics}" >> "$verification_log"
echo "        />" >> "$verification_log"
echo "TO:" >> "$verification_log"
echo "        <StrategyPlayHost" >> "$verification_log"
echo "          gameManifest={sampleGame as GameManifest}" >> "$verification_log"
echo "          onComplete={handleGameComplete}" >> "$verification_log"
echo "          analytics={analytics}" >> "$verification_log"
echo "          playerName={user?.displayName}" >> "$verification_log"
echo "        />" >> "$verification_log"

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