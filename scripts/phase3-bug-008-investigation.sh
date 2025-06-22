#!/bin/bash

# Phase 3: Bug #008 Investigation - Player Name Template Substitution
# Systematic root cause analysis för {{PLAYER_NAME}} template substitution failure

set -e

echo "🔬 Phase 3: Bug #008 Root Cause Investigation"
echo "============================================="
echo "Issue: Player name displays as '{{PLAYER_NAME}}' instead of actual name"
echo "Priority: HIGH"
echo "Impact: Broken user experience i demo"
echo ""

# Create investigation log
investigation_log="docs/quality/phase3-bug-008-investigation.log"
mkdir -p "$(dirname "$investigation_log")"

echo "Bug #008 Investigation - $(date)" > "$investigation_log"
echo "==================================" >> "$investigation_log"
echo "" >> "$investigation_log"

echo "🔍 STEP 1: Template Substitution Pattern Analysis"
echo "================================================"
echo "STEP 1: Template Substitution Pattern Analysis" >> "$investigation_log"
echo "===============================================" >> "$investigation_log"

# Search for template patterns in codebase
echo "📁 Searching for template substitution patterns..."

template_patterns=(
  "PLAYER_NAME"
  "{{.*}}"
  "player.*name"
  "userName"
  "displayName"
)

echo "   Template pattern analysis:" >> "$investigation_log"
for pattern in "${template_patterns[@]}"; do
  matches=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "$pattern" 2>/dev/null | wc -l)
  echo "   Pattern '$pattern': $matches files" >> "$investigation_log"
done

# Find specific PLAYER_NAME usage
player_name_files=()
if find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "PLAYER_NAME" >/dev/null 2>&1; then
  while IFS= read -r -d '' file; do
    player_name_files+=(\"$file\")
  done < <(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "PLAYER_NAME" | tr '\n' '\0' 2>/dev/null)
fi

echo "" >> "$investigation_log"
echo "   Files containing PLAYER_NAME:" >> "$investigation_log"
for file in "${player_name_files[@]}"; do
  echo "   - $file" >> "$investigation_log"
done

total_player_files=${#player_name_files[@]}
echo "Total files with PLAYER_NAME: $total_player_files" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 2: Authentication Context Analysis"
echo "=========================================="
echo "STEP 2: Authentication Context Analysis" >> "$investigation_log"
echo "=======================================" >> "$investigation_log"

# Check authentication context for user name storage
echo "📁 Analyzing user authentication and name storage..."

if [ -f "src/contexts/AuthContext.tsx" ]; then
  echo "   ✅ AuthContext.tsx exists" >> "$investigation_log"
  
  # Check for user name properties
  display_name_props=$(grep -c "displayName\|username\|name" src/contexts/AuthContext.tsx 2>/dev/null || echo "0")
  echo "   User name properties found: $display_name_props" >> "$investigation_log"
  
  # Check for template substitution logic
  template_logic=$(grep -c "replace\|substitute\|{{.*}}" src/contexts/AuthContext.tsx 2>/dev/null || echo "0")
  echo "   Template substitution logic: $template_logic references" >> "$investigation_log"
  
else
  echo "   ❌ AuthContext.tsx not found" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 3: Game Content Template Processing"
echo "=========================================="
echo "STEP 3: Game Content Template Processing" >> "$investigation_log"
echo "========================================" >> "$investigation_log"

# Check game content files for template processing
echo "📁 Analyzing game content template processing..."

# Look for game manifest and content files
game_files=()
if [ -d "src/examples" ]; then
  while IFS= read -r -d '' file; do
    game_files+=(\"$file\")
  done < <(find src/examples -name "*.json" -type f -print0 2>/dev/null)
fi

echo "   Game content files found:" >> "$investigation_log"
for file in "${game_files[@]}"; do
  echo "   - $file" >> "$investigation_log"
done

# Check for template processing in StrategyPlayHost
if [ -f "src/components/StrategyPlayHost.tsx" ]; then
  echo "   ✅ StrategyPlayHost.tsx exists" >> "$investigation_log"
  
  # Check for template substitution
  template_processing=$(grep -c "replace\|substitute\|PLAYER_NAME" src/components/StrategyPlayHost.tsx 2>/dev/null || echo "0")
  echo "   Template processing logic: $template_processing references" >> "$investigation_log"
  
  # Check for props passing
  props_passing=$(grep -c "props\|analytics\|user" src/components/StrategyPlayHost.tsx 2>/dev/null || echo "0")
  echo "   Props and user data passing: $props_passing references" >> "$investigation_log"
  
else
  echo "   ❌ StrategyPlayHost.tsx not found" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 4: Sample Game Content Analysis"
echo "======================================"
echo "STEP 4: Sample Game Content Analysis" >> "$investigation_log"
echo "====================================" >> "$investigation_log"

# Check sample game for PLAYER_NAME templates
echo "📁 Analyzing sample game content..."

if [ -f "src/examples/sample-game.json" ]; then
  echo "   ✅ sample-game.json exists" >> "$investigation_log"
  
  # Count PLAYER_NAME occurrences in game content
  player_name_count=$(grep -o "PLAYER_NAME" src/examples/sample-game.json | wc -l)
  echo "   PLAYER_NAME occurrences in game: $player_name_count" >> "$investigation_log"
  
  # Check for template syntax variations
  template_syntax=$(grep -o "{{.*}}" src/examples/sample-game.json | head -5)
  echo "   Template syntax patterns found:" >> "$investigation_log"
  echo "$template_syntax" | sed 's/^/     /' >> "$investigation_log"
  
  # Check for context where PLAYER_NAME appears
  echo "   Sample PLAYER_NAME usage contexts:" >> "$investigation_log"
  grep -n "PLAYER_NAME" src/examples/sample-game.json | head -3 | sed 's/^/     /' >> "$investigation_log"
  
else
  echo "   ❌ sample-game.json not found" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 5: Template Engine Investigation"
echo "======================================="
echo "STEP 5: Template Engine Investigation" >> "$investigation_log"
echo "=====================================" >> "$investigation_log"

# Look for template engine or substitution utilities
echo "📁 Searching for template processing utilities..."

template_utils=()
if find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "template\|Template" >/dev/null 2>&1; then
  while IFS= read -r -d '' file; do
    template_utils+=(\"$file\")
  done < <(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "template\|Template" | tr '\n' '\0' 2>/dev/null)
fi

echo "   Template utility files:" >> "$investigation_log"
for file in "${template_utils[@]}"; do
  echo "   - $file" >> "$investigation_log"
done

# Check utils directory for template processing
if [ -d "src/utils" ]; then
  echo "   ✅ Utils directory exists" >> "$investigation_log"
  
  utils_count=$(find src/utils -name "*.ts" -o -name "*.tsx" | wc -l)
  echo "   Utility files in utils directory: $utils_count" >> "$investigation_log"
  
  # Check for string processing utilities
  string_utils=$(find src/utils -name "*.ts" -o -name "*.tsx" | xargs grep -l "replace\|substitute\|format" 2>/dev/null | wc -l)
  echo "   String processing utilities: $string_utils files" >> "$investigation_log"
  
else
  echo "   ❌ Utils directory not found" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "📊 HYPOTHESIS GENERATION"
echo "========================"
echo "HYPOTHESIS GENERATION" >> "$investigation_log"
echo "====================" >> "$investigation_log"

# Generate hypothesis based on findings
if [ "$total_player_files" -gt 0 ]; then
  echo "🔬 HYPOTHESIS A: Missing Template Substitution Logic" >> "$investigation_log"
  echo "   Evidence: PLAYER_NAME templates exist but substitution logic missing" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypothesis_a=true
else
  echo "❌ HYPOTHESIS A: No PLAYER_NAME templates found" >> "$investigation_log"
  hypothesis_a=false
fi

if [ -f "src/contexts/AuthContext.tsx" ]; then
  echo "🔬 HYPOTHESIS B: User Data Not Passed to Game Content" >> "$investigation_log"
  echo "   Evidence: AuthContext exists but user data may not reach game templates" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypothesis_b=true
else
  echo "❌ HYPOTHESIS B: No authentication context found" >> "$investigation_log"
  hypothesis_b=false
fi

if [ -f "src/examples/sample-game.json" ]; then
  echo "🔬 HYPOTHESIS C: Game Content Template Format Issue" >> "$investigation_log"
  echo "   Evidence: Sample game exists, template format may be incorrect" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypothesis_c=true
else
  echo "❌ HYPOTHESIS C: No sample game content found" >> "$investigation_log"
  hypothesis_c=false
fi

echo "" >> "$investigation_log"

echo "🎯 RECOMMENDED NEXT STEPS" >> "$investigation_log"
echo "========================" >> "$investigation_log"

if [ "$hypothesis_a" = true ]; then
  echo "1. Locate template substitution implementation" >> "$investigation_log"
  echo "2. Check if StrategyPlayHost processes templates correctly" >> "$investigation_log"
  echo "3. Verify user data flow from AuthContext to game content" >> "$investigation_log"
  recommended_action="investigate_template_substitution"
elif [ "$hypothesis_b" = true ]; then
  echo "1. Trace user data flow from AuthContext to game components" >> "$investigation_log"
  echo "2. Check props passing in StrategyPlayHost" >> "$investigation_log"
  echo "3. Verify user name accessibility in game content" >> "$investigation_log"
  recommended_action="investigate_user_data_flow"
else
  echo "1. Examine game content template format requirements" >> "$investigation_log"
  echo "2. Check for template processing libraries" >> "$investigation_log"
  echo "3. Implement missing template substitution logic" >> "$investigation_log"
  recommended_action="investigate_template_format"
fi

echo ""
echo "📊 Investigation complete. Results logged to: $investigation_log"
echo "🎯 Recommended action: $recommended_action"

# Return exit code based on findings
if [ "$hypothesis_a" = true ]; then
  echo "🔍 PRIMARY HYPOTHESIS: Missing template substitution logic"
  exit 1
elif [ "$hypothesis_b" = true ]; then
  echo "🔍 PRIMARY HYPOTHESIS: User data not passed to game content"
  exit 2
else
  echo "🔍 PRIMARY HYPOTHESIS: Game content template format issue"
  exit 3
fi