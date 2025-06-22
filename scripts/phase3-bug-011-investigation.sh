#!/bin/bash

# Phase 3: Bug #011 Investigation - Missing Q3 Game Scenes and Content
# Systematic root cause analysis för missing Q3 game scenes causing early termination

set -e

echo "🔬 Phase 3: Bug #011 Root Cause Investigation"
echo "============================================="
echo "Issue: Game ends after first dialogue, missing Q3 scenes/content"
echo "Priority: HIGH"
echo "Impact: Major feature missing från Q3 utveckling"
echo ""

# Create investigation log
investigation_log="docs/quality/phase3-bug-011-investigation.log"
mkdir -p "$(dirname "$investigation_log")"

echo "Bug #011 Investigation - $(date)" > "$investigation_log"
echo "==================================" >> "$investigation_log"
echo "" >> "$investigation_log"

echo "🔍 STEP 1: Game Manifest Content Analysis"
echo "========================================"
echo "STEP 1: Game Manifest Content Analysis" >> "$investigation_log"
echo "======================================" >> "$investigation_log"

# Analyze sample game manifest structure
echo "📁 Analyzing game manifest structure..."

if [ -f "src/examples/sample-game.json" ]; then
  echo "   ✅ sample-game.json exists" >> "$investigation_log"
  
  # Count scenes in manifest
  total_scenes=$(jq '.scenes | length' src/examples/sample-game.json 2>/dev/null || echo "0")
  echo "   Total scenes in manifest: $total_scenes" >> "$investigation_log"
  
  # List scene types
  echo "   Scene analysis:" >> "$investigation_log"
  if command -v jq >/dev/null 2>&1; then
    jq -r '.scenes[] | "     Scene ID: \(.id), Type: \(.type)"' src/examples/sample-game.json >> "$investigation_log" 2>/dev/null || echo "     Unable to parse scene details" >> "$investigation_log"
  else
    echo "     jq not available for detailed analysis" >> "$investigation_log"
  fi
  
  # Check for Q3 specific content
  q3_references=$(grep -i "q3\|quarter.*3\|phase.*3" src/examples/sample-game.json | wc -l)
  echo "   Q3 references in manifest: $q3_references" >> "$investigation_log"
  
else
  echo "   ❌ sample-game.json not found" >> "$investigation_log"
  total_scenes=0
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 2: Scene Navigation Logic Analysis"
echo "========================================="
echo "STEP 2: Scene Navigation Logic Analysis" >> "$investigation_log"
echo "=======================================" >> "$investigation_log"

# Check game flow navigation logic
echo "📁 Analyzing scene navigation implementation..."

if [ -f "src/components/StrategyPlayHost.tsx" ]; then
  echo "   ✅ StrategyPlayHost.tsx exists" >> "$investigation_log"
  
  # Check scene navigation logic
  scene_navigation=$(grep -c "nextScene\|currentScene\|sceneId" src/components/StrategyPlayHost.tsx)
  echo "   Scene navigation logic references: $scene_navigation" >> "$investigation_log"
  
  # Check for scene completion logic
  scene_completion=$(grep -c "handleSceneComplete\|onSceneComplete\|completeScene" src/components/StrategyPlayHost.tsx)
  echo "   Scene completion handlers: $scene_completion" >> "$investigation_log"
  
  # Check for game termination logic
  game_termination=$(grep -c "onComplete\|gameComplete\|endGame" src/components/StrategyPlayHost.tsx)
  echo "   Game termination logic: $game_termination references" >> "$investigation_log"
  
else
  echo "   ❌ StrategyPlayHost.tsx not found" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 3: Scene Component Implementation Status"
echo "==============================================="
echo "STEP 3: Scene Component Implementation Status" >> "$investigation_log"
echo "==============================================" >> "$investigation_log"

# Check scene component implementations
echo "📁 Analyzing scene component implementations..."

scene_components=(
  "DialogueScene"
  "QuizScene" 
  "AssessmentScene"
  "ResourceScene"
  "SummaryScene"
)

echo "   Scene component analysis:" >> "$investigation_log"
implemented_scenes=0
for component in "${scene_components[@]}"; do
  if find src -name "*${component}*" -type f | head -1 >/dev/null 2>&1; then
    echo "   ✅ $component implemented" >> "$investigation_log"
    ((implemented_scenes++))
  else
    echo "   ❌ $component missing" >> "$investigation_log"
  fi
done

echo "   Total implemented scene components: $implemented_scenes/${#scene_components[@]}" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 4: Q3 Development Content Investigation"
echo "=============================================="
echo "STEP 4: Q3 Development Content Investigation" >> "$investigation_log"
echo "=============================================" >> "$investigation_log"

# Search for Q3 specific development files
echo "📁 Searching for Q3 development content..."

q3_files=()
if find src -name "*q3*" -o -name "*Q3*" -type f >/dev/null 2>&1; then
  while IFS= read -r -d '' file; do
    q3_files+=(\"$file\")
  done < <(find src -name "*q3*" -o -name "*Q3*" -type f -print0 2>/dev/null)
fi

echo "   Q3 development files found:" >> "$investigation_log"
for file in "${q3_files[@]}"; do
  echo "   - $file" >> "$investigation_log"
done

total_q3_files=${#q3_files[@]}
echo "   Total Q3 development files: $total_q3_files" >> "$investigation_log"

# Check for Q3 demo components
if [ -d "src/demo" ]; then
  echo "   ✅ Demo directory exists" >> "$investigation_log"
  demo_files=$(find src/demo -name "*.tsx" -o -name "*.ts" | wc -l)
  echo "   Demo component files: $demo_files" >> "$investigation_log"
else
  echo "   ❌ Demo directory not found" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 5: Game State Management Analysis"
echo "========================================"
echo "STEP 5: Game State Management Analysis" >> "$investigation_log"
echo "======================================" >> "$investigation_log"

# Check game state management
echo "📁 Analyzing game state management..."

# Check for state management in StrategyPlayHost
if [ -f "src/components/StrategyPlayHost.tsx" ]; then
  # Check useState hooks
  use_state_hooks=$(grep -c "useState" src/components/StrategyPlayHost.tsx)
  echo "   useState hooks in StrategyPlayHost: $use_state_hooks" >> "$investigation_log"
  
  # Check for scene state management
  scene_state=$(grep -c "currentSceneIndex\|sceneState\|gameState" src/components/StrategyPlayHost.tsx)
  echo "   Scene state management: $scene_state references" >> "$investigation_log"
  
  # Check for progress tracking
  progress_tracking=$(grep -c "progress\|completed\|scenesCompleted" src/components/StrategyPlayHost.tsx)
  echo "   Progress tracking logic: $progress_tracking references" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 6: Scene Loading and Error Handling"
echo "=========================================="
echo "STEP 6: Scene Loading and Error Handling" >> "$investigation_log"
echo "========================================" >> "$investigation_log"

# Check for scene loading and error handling
echo "📁 Analyzing scene loading mechanisms..."

# Check for loading states
loading_states=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "loading\|Loading" | wc -l)
echo "   Files with loading states: $loading_states" >> "$investigation_log"

# Check for error boundaries
error_boundaries=$(find src -name "*Error*" -o -name "*error*" | wc -l)
echo "   Error handling files: $error_boundaries" >> "$investigation_log"

# Check for scene not found handling
scene_errors=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "scene.*not.*found\|unknown.*scene" 2>/dev/null | wc -l)
echo "   Scene error handling: $scene_errors files" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "📊 HYPOTHESIS GENERATION"
echo "========================"
echo "HYPOTHESIS GENERATION" >> "$investigation_log"
echo "====================" >> "$investigation_log"

# Generate hypothesis based on findings
if [ "$total_scenes" -lt 3 ]; then
  echo "🔬 HYPOTHESIS A: Insufficient Scene Content in Manifest" >> "$investigation_log"
  echo "   Evidence: sample-game.json has only $total_scenes scenes" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypothesis_a=true
else
  echo "❌ HYPOTHESIS A: Adequate scene content exists ($total_scenes scenes)" >> "$investigation_log"
  hypothesis_a=false
fi

if [ "$implemented_scenes" -lt 5 ]; then
  echo "🔬 HYPOTHESIS B: Missing Scene Component Implementations" >> "$investigation_log"
  echo "   Evidence: Only $implemented_scenes/${#scene_components[@]} scene components implemented" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypothesis_b=true
else
  echo "❌ HYPOTHESIS B: All scene components implemented" >> "$investigation_log"
  hypothesis_b=false
fi

if [ "$total_q3_files" -eq 0 ]; then
  echo "🔬 HYPOTHESIS C: Q3 Development Content Not Integrated" >> "$investigation_log"
  echo "   Evidence: No Q3 specific development files found" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypothesis_c=true
else
  echo "❌ HYPOTHESIS C: Q3 content exists ($total_q3_files files)" >> "$investigation_log"
  hypothesis_c=false
fi

echo "" >> "$investigation_log"

echo "🎯 RECOMMENDED NEXT STEPS" >> "$investigation_log"
echo "========================" >> "$investigation_log"

if [ "$hypothesis_a" = true ]; then
  echo "1. Examine sample-game.json scene structure in detail" >> "$investigation_log"
  echo "2. Add missing Q3 scenes to game manifest" >> "$investigation_log"
  echo "3. Verify scene flow and navigation logic" >> "$investigation_log"
  recommended_action="investigate_game_manifest"
elif [ "$hypothesis_c" = true ]; then
  echo "1. Locate Q3 development content files" >> "$investigation_log"
  echo "2. Integrate Q3 scenes into main game flow" >> "$investigation_log"
  echo "3. Update game manifest with Q3 content" >> "$investigation_log"
  recommended_action="investigate_q3_integration"
else
  echo "1. Debug scene navigation and completion logic" >> "$investigation_log"
  echo "2. Check for premature game termination conditions" >> "$investigation_log"
  echo "3. Verify scene component error handling" >> "$investigation_log"
  recommended_action="investigate_scene_logic"
fi

echo ""
echo "📊 Investigation complete. Results logged to: $investigation_log"
echo "🎯 Recommended action: $recommended_action"

# Return exit code based on findings
if [ "$hypothesis_a" = true ]; then
  echo "🔍 PRIMARY HYPOTHESIS: Insufficient scene content in manifest"
  exit 1
elif [ "$hypothesis_c" = true ]; then
  echo "🔍 PRIMARY HYPOTHESIS: Q3 development content not integrated"
  exit 2
else
  echo "🔍 PRIMARY HYPOTHESIS: Scene navigation logic issues"
  exit 3
fi