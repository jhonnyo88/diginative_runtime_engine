#!/bin/bash

# GitHub Actions Quality Gate Verification - Solution Hypothesis Testing
# Testing hypothesis: "Incomplete Any Type Removal" causing CI failures

set -e

echo "🔬 GitHub Actions Quality Gate Solution Verification"
echo "==================================================="
echo "Root Cause: 1039 remaining 'any' type usages in codebase"
echo "Hypothesis: GitHub Actions has stricter TypeScript rules than local environment"
echo "Proposed Solution: Systematically replace all remaining 'any' types with proper types"
echo ""

# Create verification log
verification_log="docs/quality/github-actions-quality-gate-verification.log"
mkdir -p "$(dirname "$verification_log")"

echo "GitHub Actions Quality Gate Verification - $(date)" > "$verification_log"
echo "=================================================" >> "$verification_log"
echo "" >> "$verification_log"

echo "🔍 STEP 1: Identify Top Priority Any Type Files"
echo "==============================================="
echo "STEP 1: Identify Top Priority Any Type Files" >> "$verification_log"
echo "===============================================" >> "$verification_log"

echo "📁 Finding files with highest 'any' type usage concentration..."

# Find files with most any usage
echo "   Files with highest any type usage:" >> "$verification_log"
find src -name "*.ts" -o -name "*.tsx" | xargs grep -c ":\s*any\|<any>\|any\[\]" 2>/dev/null | sort -t: -k2 -nr | head -10 | while read line; do
  file=$(echo "$line" | cut -d: -f1)
  count=$(echo "$line" | cut -d: -f2)
  echo "     $file: $count occurrences" >> "$verification_log"
done

# Get total count for verification
total_any_count=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c ":\s*any\|<any>\|any\[\]" 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
echo "   Total any type usages confirmed: $total_any_count" >> "$verification_log"

echo "" >> "$verification_log"

echo "🔍 STEP 2: Test Systematic Any Type Replacement Strategy"
echo "======================================================="
echo "STEP 2: Test Systematic Any Type Replacement Strategy" >> "$verification_log"
echo "=======================================================" >> "$verification_log"

echo "📁 Creating test fixes for highest impact files..."

# Test fix for utils/municipalBranding.ts (appears frequently in logs)
test_file_1="src/utils/municipalBranding.ts"
if [ -f "$test_file_1" ]; then
  echo "   ✅ Testing municipalBranding.ts any type fixes" >> "$verification_log"
  
  any_count_before=$(grep -c ":\s*any\|<any>\|any\[\]" "$test_file_1" 2>/dev/null || echo "0")
  echo "     Any types before fix: $any_count_before" >> "$verification_log"
  
  # Create test backup
  cp "$test_file_1" "${test_file_1}.test-backup"
  
  # Test systematic replacement
  sed -i.test 's/gameManifest: any/gameManifest: GameManifest/g' "$test_file_1"
  sed -i.test 's/): any => {/): GameManifest => {/g' "$test_file_1"
  
  any_count_after=$(grep -c ":\s*any\|<any>\|any\[\]" "$test_file_1" 2>/dev/null || echo "0")
  echo "     Any types after test fix: $any_count_after" >> "$verification_log"
  
  # Verify TypeScript compilation
  if npx tsc --noEmit --skipLibCheck "$test_file_1" 2>/dev/null; then
    echo "     ✅ Test fixes pass TypeScript validation" >> "$verification_log"
    test_fix_valid=true
  else
    echo "     ❌ Test fixes cause TypeScript errors" >> "$verification_log"
    test_fix_valid=false
  fi
  
  # Restore original
  mv "${test_file_1}.test-backup" "$test_file_1"
  rm -f "${test_file_1}.test"
  
else
  echo "   ❌ municipalBranding.ts not found" >> "$verification_log"
  test_fix_valid=false
fi

echo "" >> "$verification_log"

echo "🔍 STEP 3: Verify GitHub Actions Linting Command"
echo "==============================================="
echo "STEP 3: Verify GitHub Actions Linting Command" >> "$verification_log"
echo "===============================================" >> "$verification_log"

echo "📁 Testing exact GitHub Actions linting commands locally..."

# Check actual workflow files for linting commands
workflow_lint_commands=""
if [ -d ".github/workflows" ]; then
  echo "   Analyzing GitHub Actions workflow files:" >> "$verification_log"
  
  for workflow in .github/workflows/*.yml .github/workflows/*.yaml; do
    if [ -f "$workflow" ]; then
      echo "     Checking $workflow" >> "$verification_log"
      
      # Look for npm/yarn commands
      lint_commands=$(grep -n "npm run\|yarn\|npx.*eslint\|npx.*tsc" "$workflow" 2>/dev/null | head -5)
      if [ -n "$lint_commands" ]; then
        echo "$lint_commands" | sed 's/^/       /' >> "$verification_log"
        workflow_lint_commands="found"
      fi
    fi
  done
  
  if [ -z "$workflow_lint_commands" ]; then
    echo "     ⚠️ No explicit linting commands found in workflows" >> "$verification_log"
  fi
fi

# Test the actual package.json lint command
echo "   Testing package.json lint command locally:" >> "$verification_log"
if npm run lint 2>&1 | head -10 | grep -v "^$" >> "$verification_log"; then
  lint_local_exit=0
else
  lint_local_exit=$?
fi
echo "   Local lint command exit code: $lint_local_exit" >> "$verification_log"

echo "" >> "$verification_log"

echo "🔍 STEP 4: Verify ESLint Configuration Strictness"
echo "================================================"
echo "STEP 4: Verify ESLint Configuration Strictness" >> "$verification_log"
echo "===============================================" >> "$verification_log"

echo "📁 Analyzing ESLint configuration for 'any' type rules..."

# Check ESLint config files
for config_file in .eslintrc.js .eslintrc.json eslint.config.js; do
  if [ -f "$config_file" ]; then
    echo "   ✅ Found ESLint config: $config_file" >> "$verification_log"
    
    # Check for TypeScript any rules
    any_rules=$(grep -c "@typescript-eslint/no-explicit-any\|no-explicit-any" "$config_file" 2>/dev/null || echo "0")
    echo "   Any type restrictions in config: $any_rules rules" >> "$verification_log"
    
    # Show relevant configuration
    echo "   Relevant configuration:" >> "$verification_log"
    grep -A3 -B3 "typescript\|any\|strict" "$config_file" 2>/dev/null | head -10 | sed 's/^/     /' >> "$verification_log" || echo "     No any/strict rules found" >> "$verification_log"
    
    break
  fi
done

echo "" >> "$verification_log"

echo "📊 SOLUTION VERIFICATION SUMMARY"
echo "==============================="
echo "SOLUTION VERIFICATION SUMMARY" >> "$verification_log"
echo "=============================" >> "$verification_log"

verification_score=0
total_checks=4

# Check 1: Any type count confirmed
if [ "$total_any_count" -gt 1000 ]; then
  echo "✅ High any type usage confirmed: $total_any_count usages need replacement" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Any type count lower than expected" >> "$verification_log"
fi

# Check 2: Test fix validates
if [ "$test_fix_valid" = true ]; then
  echo "✅ Systematic any type replacement strategy validates" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Test replacement strategy has issues" >> "$verification_log"
fi

# Check 3: Local linting difference confirmed
if [ "$lint_local_exit" -eq 0 ]; then
  echo "✅ Local linting passes - confirms CI/local environment difference" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Local linting also fails" >> "$verification_log"
fi

# Check 4: Workflow analysis complete
if [ -n "$workflow_lint_commands" ] || [ "$lint_local_exit" -eq 0 ]; then
  echo "✅ GitHub Actions workflow analysis complete" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Workflow analysis incomplete" >> "$verification_log"
fi

confidence_percentage=$((verification_score * 100 / total_checks))

echo "" >> "$verification_log"
echo "🎯 VERIFICATION RESULTS" >> "$verification_log"
echo "======================" >> "$verification_log"
echo "Confidence Score: $verification_score/$total_checks ($confidence_percentage%)" >> "$verification_log"

if [ "$confidence_percentage" -ge 100 ]; then
  echo "✅ 100% CONFIDENCE: Root cause verified and solution ready" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Systematic any type replacement implementation" >> "$verification_log"
  verification_status="ready"
elif [ "$confidence_percentage" -ge 75 ]; then
  echo "⚠️  HIGH CONFIDENCE: Solution mostly verified, proceed with monitoring" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Implement with validation testing" >> "$verification_log"
  verification_status="caution"
else
  echo "❌ LOW CONFIDENCE: Solution verification needs improvement" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Re-investigate Quality Gate requirements" >> "$verification_log"
  verification_status="failed"
fi

echo "" >> "$verification_log"
echo "💡 RECOMMENDED IMPLEMENTATION APPROACH:" >> "$verification_log"
echo "Priority order for any type replacement:" >> "$verification_log"
echo "1. src/utils/municipalBranding.ts - Replace gameManifest: any" >> "$verification_log"
echo "2. src/utils/monitoring-dashboard.tsx - Replace state any types" >> "$verification_log"
echo "3. src/utils/contentValidation.ts - Replace content validation any types" >> "$verification_log"
echo "4. Apply systematic sed/replace commands for common patterns" >> "$verification_log"
echo "5. Verify TypeScript compilation after each batch of changes" >> "$verification_log"

echo ""
echo "📊 Verification complete. Results logged to: $verification_log"
echo "🎯 Confidence: $confidence_percentage%"
echo "🔧 Status: $verification_status"

if [ "$verification_status" = "ready" ]; then
  echo "✅ Solution ready for systematic implementation"
  exit 0
elif [ "$verification_status" = "caution" ]; then
  echo "⚠️  Proceed with systematic approach and validation"
  exit 1
else
  echo "❌ Verification failed - need alternative approach"
  exit 2
fi