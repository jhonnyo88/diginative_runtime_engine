#!/bin/bash

# Phase 4: Bug #009 Investigation - Emotion State Debug Information Visibility
# Systematic investigation för analyzing emotion state debug output in production

set -e

echo "🔬 Phase 4: Bug #009 Investigation"
echo "=================================="
echo "Issue: Emotion state debug information visibility"
echo "Priority: MEDIUM"  
echo "User Report: Emotion state debug information visible in production environment"
echo ""

# Create investigation log
investigation_log="docs/quality/phase4-bug-009-investigation.log"
mkdir -p "$(dirname "$investigation_log")"

echo "Bug #009 Investigation - $(date)" > "$investigation_log"
echo "=================================" >> "$investigation_log"
echo "" >> "$investigation_log"

echo "🔍 STEP 1: Emotion State Implementation Analysis"
echo "==============================================="
echo "STEP 1: Emotion State Implementation Analysis" >> "$investigation_log"
echo "===============================================" >> "$investigation_log"

echo "📁 Analyzing emotion state system implementation..."

# Find emotion state related files
echo "   Emotion state related files:" >> "$investigation_log"
find src -name "*emotion*" -o -name "*feeling*" -o -name "*mood*" -o -name "*sentiment*" | sed 's/^/   - "/' | sed 's/$/"/' >> "$investigation_log"

# Count emotion implementations
emotion_files=$(find src -name "*emotion*" -o -name "*feeling*" -o -name "*mood*" -o -name "*sentiment*" | wc -l)
echo "   Total emotion system files: $emotion_files" >> "$investigation_log"

# Check for emotion state in components
emotion_components=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "emotion.*state\|emotional.*state\|feeling.*state" 2>/dev/null | wc -l)
echo "   Components with emotion state: $emotion_components files" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 2: Debug Output Analysis"
echo "================================"
echo "STEP 2: Debug Output Analysis" >> "$investigation_log"
echo "===============================" >> "$investigation_log"

echo "📁 Analyzing debug output patterns in emotion system..."

# Check for console.log statements with emotion/debug
emotion_console=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "console\.log.*emotion\|console\.debug.*emotion\|console\.warn.*emotion" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
emotion_debug=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "debug.*emotion\|emotion.*debug" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   Emotion console output statements: $emotion_console references" >> "$investigation_log"
echo "   Emotion debug statements: $emotion_debug references" >> "$investigation_log"

# Check for development-only debug patterns
dev_only_debug=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "if.*dev.*console\|import\.meta\.env\.DEV.*console" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   Development-only debug patterns: $dev_only_debug implementations" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 3: Production Environment Detection"
echo "=========================================="
echo "STEP 3: Production Environment Detection" >> "$investigation_log"
echo "==========================================" >> "$investigation_log"

echo "📁 Analyzing production environment detection and debug disabling..."

# Check for environment-based debug disabling
env_debug_checks=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "NODE_ENV.*production\|import\.meta\.env\.PROD\|process\.env\.NODE_ENV" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   Environment debug checks: $env_debug_checks references" >> "$investigation_log"

# Check for debug flag configurations
debug_flags=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "debugMode\|debug.*flag\|enable.*debug" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   Debug flag configurations: $debug_flags references" >> "$investigation_log"

# Check vite configuration for debug handling
if [ -f "vite.config.ts" ]; then
  echo "   ✅ vite.config.ts exists" >> "$investigation_log"
  
  vite_debug_config=$(grep -c "debug\|console" vite.config.ts 2>/dev/null || echo "0")
  echo "   Vite debug configuration: $vite_debug_config entries" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 4: Component State Visibility Analysis"
echo "=============================================="
echo "STEP 4: Component State Visibility Analysis" >> "$investigation_log"
echo "=============================================" >> "$investigation_log"

echo "📁 Analyzing component state and emotion display logic..."

# Check for emotion state display in UI components
emotion_display=$(find src -name "*.tsx" | xargs grep -c "emotion.*display\|show.*emotion\|emotion.*visible" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
emotion_ui_debug=$(find src -name "*.tsx" | xargs grep -c "<.*debug\|debug.*component\|DebugPanel" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   Emotion display in UI: $emotion_display references" >> "$investigation_log"
echo "   UI debug components: $emotion_ui_debug references" >> "$investigation_log"

# Check for conditional rendering based on environment
conditional_debug=$(find src -name "*.tsx" | xargs grep -c "import\.meta\.env\.DEV.*&&\|NODE_ENV.*development.*&&" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   Conditional debug rendering: $conditional_debug patterns" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 5: Game State and Emotion Integration"
echo "============================================"
echo "STEP 5: Game State and Emotion Integration" >> "$investigation_log"
echo "===========================================" >> "$investigation_log"

echo "📁 Analyzing game state emotion system integration..."

# Check for emotion in game state management
game_emotion=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "gameState.*emotion\|emotion.*game\|player.*emotion" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
state_logging=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "console.*state\|log.*state\|state.*debug" 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

echo "   Game-emotion integration: $game_emotion references" >> "$investigation_log"
echo "   State logging patterns: $state_logging references" >> "$investigation_log"

# Check if there are emotion state managers or services
emotion_services=$(find src -name "*service*" -o -name "*manager*" | xargs grep -l "emotion" 2>/dev/null | wc -l)
echo "   Emotion services/managers: $emotion_services files" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "📊 HYPOTHESIS GENERATION"
echo "========================"
echo "HYPOTHESIS GENERATION" >> "$investigation_log"
echo "====================" >> "$investigation_log"

# Generate hypotheses based on findings
hypotheses=()

if [ "$emotion_console" -gt 0 ] && [ "$dev_only_debug" -eq 0 ]; then
  echo "🔬 HYPOTHESIS A: Emotion Console Logging Without Environment Guards" >> "$investigation_log"
  echo "   Evidence: $emotion_console console statements without development-only guards" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypotheses+=("unguarded-logging")
fi

if [ "$emotion_ui_debug" -gt 0 ] && [ "$conditional_debug" -eq 0 ]; then
  echo "🔬 HYPOTHESIS B: Debug UI Components Visible in Production" >> "$investigation_log"
  echo "   Evidence: $emotion_ui_debug debug UI components without conditional rendering" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypotheses+=("debug-ui-visible")
fi

if [ "$emotion_display" -gt 0 ] && [ "$env_debug_checks" -eq 0 ]; then
  echo "🔬 HYPOTHESIS C: Emotion State Display Without Production Control" >> "$investigation_log"
  echo "   Evidence: Emotion display logic without environment-based control" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("no-prod-control")
fi

if [ "$state_logging" -gt 5 ] && [ "$debug_flags" -eq 0 ]; then
  echo "🔬 HYPOTHESIS D: Excessive State Logging Without Debug Configuration" >> "$investigation_log"
  echo "   Evidence: $state_logging state logging patterns without debug flag management" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("excessive-logging")
fi

if [ "$emotion_files" -eq 0 ]; then
  echo "🔬 HYPOTHESIS E: No Emotion System Implementation Found" >> "$investigation_log"
  echo "   Evidence: No emotion-related files detected in codebase" >> "$investigation_log"
  echo "   Probability: LOW" >> "$investigation_log"
  hypotheses+=("no-emotion-system")
fi

if [ ${#hypotheses[@]} -eq 0 ]; then
  echo "❌ HYPOTHESIS NONE: No emotion debug visibility issues detected" >> "$investigation_log"
  echo "   Evidence: Emotion debug appears properly controlled or not implemented" >> "$investigation_log"
  hypotheses+=("none")
fi

echo "" >> "$investigation_log"
echo "🎯 RECOMMENDED NEXT STEPS" >> "$investigation_log"
echo "========================" >> "$investigation_log"

if [[ " ${hypotheses[@]} " =~ " unguarded-logging " ]]; then
  echo "1. Add environment guards to emotion console logging statements" >> "$investigation_log"
  echo "2. Implement development-only emotion debug logging pattern" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " debug-ui-visible " ]]; then
  echo "3. Add conditional rendering for emotion debug UI components" >> "$investigation_log"
  echo "4. Hide debug panels and emotion state displays in production" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " no-prod-control " ]]; then
  echo "5. Implement production environment detection for emotion displays" >> "$investigation_log"
  echo "6. Add emotion debug visibility toggle based on environment" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " excessive-logging " ]]; then
  echo "7. Implement debug flag configuration for state logging" >> "$investigation_log"
  echo "8. Reduce or eliminate state logging in production builds" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " no-emotion-system " ]]; then
  echo "9. Verify if emotion system is actually implemented in the application" >> "$investigation_log"
  echo "10. Check if bug report refers to different debug information" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " none " ]]; then
  echo "11. Verify if emotion debug visibility issue still exists" >> "$investigation_log"
  echo "12. Check browser developer tools for actual debug output" >> "$investigation_log"
fi

echo ""
echo "📊 Investigation complete. Results logged to: $investigation_log"
echo "🎯 Primary hypotheses: ${hypotheses[*]}"
echo "🔧 Next step: Create verification testing script for emotion debug patterns"