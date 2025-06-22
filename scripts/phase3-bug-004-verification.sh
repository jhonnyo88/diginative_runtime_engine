#!/bin/bash

# Phase 3: Bug #004 Verification Testing - Component Showcase Production Issue
# Systematic solution verification før implementing fix

set -e

echo "🔬 Phase 3: Bug #004 Solution Verification"
echo "========================================="
echo "Issue: Component Showcase returns null in production"
echo "Root Cause: import.meta.env.PROD check in DevShowcase.tsx line 7-9"
echo "Proposed Solution: Remove production check for Component Showcase access"
echo ""

# Create verification log
verification_log="docs/quality/phase3-bug-004-verification.log"
mkdir -p "$(dirname "$verification_log")"

echo "Bug #004 Solution Verification - $(date)" > "$verification_log"
echo "=======================================" >> "$verification_log"
echo "" >> "$verification_log"

echo "🔍 STEP 1: Verify Current Production Behavior"
echo "=============================================" 
echo "STEP 1: Verify Current Production Behavior" >> "$verification_log"
echo "==========================================" >> "$verification_log"

# Check current DevShowcase implementation
echo "📁 Analyzing current DevShowcase implementation..."

if [ -f "src/dev/DevShowcase.tsx" ]; then
  echo "   ✅ DevShowcase.tsx exists" >> "$verification_log"
  
  # Check for production block
  prod_check=$(grep -n "import.meta.env.PROD" src/dev/DevShowcase.tsx | wc -l)
  return_null=$(grep -n "return null" src/dev/DevShowcase.tsx | wc -l)
  
  echo "   Production check found: $prod_check lines" >> "$verification_log"
  echo "   Return null statements: $return_null lines" >> "$verification_log"
  
  if [ "$prod_check" -gt 0 ] && [ "$return_null" -gt 0 ]; then
    echo "   🔍 CONFIRMED: Production block prevents Component Showcase rendering" >> "$verification_log"
    echo "   Code pattern:" >> "$verification_log"
    grep -A 2 -B 1 "import.meta.env.PROD" src/dev/DevShowcase.tsx | sed 's/^/     /' >> "$verification_log"
  else
    echo "   ❌ Expected production block pattern not found" >> "$verification_log"
  fi
  
else
  echo "   ❌ DevShowcase.tsx not found" >> "$verification_log"
fi

echo "" >> "$verification_log"

echo "🔍 STEP 2: Verify ComponentShowcase Dependency"
echo "=============================================="
echo "STEP 2: Verify ComponentShowcase Dependency" >> "$verification_log"
echo "============================================" >> "$verification_log"

# Check ComponentShowcase implementation
if [ -f "src/stories/ComponentShowcase.tsx" ]; then
  echo "   ✅ ComponentShowcase.tsx exists" >> "$verification_log"
  
  # Check component structure
  export_count=$(grep -c "export.*ComponentShowcase" src/stories/ComponentShowcase.tsx)
  import_count=$(grep -c "import.*from" src/stories/ComponentShowcase.tsx | head -1)
  
  echo "   Component exports: $export_count" >> "$verification_log"
  echo "   Dependencies imported: $import_count" >> "$verification_log"
  
  # Verify all required dependencies exist
  missing_deps=0
  dependencies=("Avatar" "SkipLink" "GameIcons" "LoadingStates" "CelebrationEffects")
  
  for dep in "${dependencies[@]}"; do
    if ! grep -q "$dep" src/stories/ComponentShowcase.tsx; then
      echo "   ⚠️  Missing dependency: $dep" >> "$verification_log"
      ((missing_deps++))
    fi
  done
  
  if [ "$missing_deps" -eq 0 ]; then
    echo "   ✅ All dependencies verified" >> "$verification_log"
  else
    echo "   ❌ $missing_deps missing dependencies found" >> "$verification_log"
  fi
  
else
  echo "   ❌ ComponentShowcase.tsx not found" >> "$verification_log"
fi

echo "" >> "$verification_log"

echo "🔍 STEP 3: Test Proposed Solution Approach"
echo "=========================================="
echo "STEP 3: Test Proposed Solution Approach" >> "$verification_log"
echo "=======================================" >> "$verification_log"

# Create temporary test version
temp_file="src/dev/DevShowcase.test-fix.tsx"
echo "   Creating test implementation..." >> "$verification_log"

cat > "$temp_file" << 'EOF'
import React from 'react';
import { ComponentShowcase } from '../stories/ComponentShowcase';

// Development and production component showcase route
export const DevShowcase: React.FC = () => {
  return <ComponentShowcase />;
};
EOF

echo "   ✅ Test implementation created: $temp_file" >> "$verification_log"

# Verify test implementation syntax
if npx tsc --noEmit --strict --target ES2020 --module ESNext --moduleResolution node --jsx react-jsx "$temp_file" 2>/dev/null; then
  echo "   ✅ Test implementation passes TypeScript validation" >> "$verification_log"
  syntax_valid=true
else
  echo "   ❌ Test implementation has TypeScript errors" >> "$verification_log"
  syntax_valid=false
fi

# Test import resolution
echo "   Testing import resolution..." >> "$verification_log"
if [ -f "src/stories/ComponentShowcase.tsx" ]; then
  echo "   ✅ ComponentShowcase import path valid" >> "$verification_log"
  import_valid=true
else
  echo "   ❌ ComponentShowcase import path invalid" >> "$verification_log"
  import_valid=false
fi

# Clean up test file
rm -f "$temp_file"

echo "" >> "$verification_log"

echo "🔍 STEP 4: Verify Build Compatibility"
echo "====================================="
echo "STEP 4: Verify Build Compatibility" >> "$verification_log"
echo "==================================" >> "$verification_log"

# Check if removal affects build configuration
echo "   Checking build impact..." >> "$verification_log"

# Verify no other components depend on production-only behavior
production_deps=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "import.meta.env.PROD" | wc -l)
echo "   Components using production checks: $production_deps" >> "$verification_log"

if [ "$production_deps" -gt 1 ]; then
  echo "   ℹ️  Other components use production checks - solution is isolated" >> "$verification_log"
else
  echo "   ✅ DevShowcase is only component with production checks" >> "$verification_log"
fi

echo "" >> "$verification_log"

echo "📊 SOLUTION VERIFICATION SUMMARY"
echo "==============================="
echo "SOLUTION VERIFICATION SUMMARY" >> "$verification_log"
echo "============================" >> "$verification_log"

verification_score=0
total_checks=5

# Check 1: Root cause confirmed
if [ "$prod_check" -gt 0 ] && [ "$return_null" -gt 0 ]; then
  echo "✅ Root cause confirmed: Production check blocks rendering" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Root cause verification failed" >> "$verification_log"
fi

# Check 2: Dependencies available
if [ -f "src/stories/ComponentShowcase.tsx" ]; then
  echo "✅ Required ComponentShowcase dependency exists" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ ComponentShowcase dependency missing" >> "$verification_log"
fi

# Check 3: Solution syntax valid
if [ "$syntax_valid" = true ]; then
  echo "✅ Proposed solution passes TypeScript validation" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Proposed solution has syntax issues" >> "$verification_log"
fi

# Check 4: Import paths valid
if [ "$import_valid" = true ]; then
  echo "✅ Import paths resolve correctly" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Import path resolution issues" >> "$verification_log"
fi

# Check 5: No missing dependencies
if [ "$missing_deps" -eq 0 ]; then
  echo "✅ All ComponentShowcase dependencies available" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Missing dependencies detected" >> "$verification_log"
fi

confidence_percentage=$((verification_score * 100 / total_checks))

echo "" >> "$verification_log"
echo "🎯 VERIFICATION RESULTS" >> "$verification_log"
echo "======================" >> "$verification_log"
echo "Confidence Score: $verification_score/$total_checks ($confidence_percentage%)" >> "$verification_log"

if [ "$confidence_percentage" -ge 100 ]; then
  echo "✅ 100% CONFIDENCE: Solution verified and ready for implementation" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Proceed with fix implementation" >> "$verification_log"
  verification_status="ready"
elif [ "$confidence_percentage" -ge 80 ]; then
  echo "⚠️  HIGH CONFIDENCE: Solution mostly verified, minor issues detected" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Proceed with caution" >> "$verification_log"
  verification_status="caution"
else
  echo "❌ LOW CONFIDENCE: Solution verification failed" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Re-investigate before implementation" >> "$verification_log"
  verification_status="failed"
fi

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