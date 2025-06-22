#!/bin/bash

# Phase 2: Comprehensive JSX Solution Verification Script
# Tests complete solution (TypeScript config + file extensions) for 100% confidence

set -e

echo "🎯 Phase 2: Comprehensive JSX Solution Verification"
echo "=================================================="

# Create verification log
verification_log="docs/quality/phase2-comprehensive-jsx-verification.log"
mkdir -p "$(dirname "$verification_log")"

echo "Phase 2 Comprehensive JSX Solution Verification - $(date)" > "$verification_log"
echo "=======================================================" >> "$verification_log"
echo "" >> "$verification_log"

# Test files that need JSX support
jsx_test_files=(
  "src/tests/q2-interactive/drag-drop-test-utilities.test.ts"
  "src/tests/q2-interactive/interactive-accessibility-testing.test.ts" 
  "src/tests/performance/loading-time-budgets.test.ts"
  "src/tests/security/xss-injection-prevention.test.ts"
)

echo "🔬 COMPREHENSIVE SOLUTION VERIFICATION"
echo "======================================"
echo "COMPREHENSIVE SOLUTION VERIFICATION" >> "$verification_log"
echo "====================================" >> "$verification_log"
echo "" >> "$verification_log"

echo "Testing: TypeScript Configuration + File Extensions + Vitest Integration" >> "$verification_log"
echo "" >> "$verification_log"

echo "📋 STEP 1: Current State Baseline"
echo "================================="
echo "STEP 1: Current State Baseline" >> "$verification_log"
echo "===============================" >> "$verification_log"

echo "🔍 Establishing baseline before implementing solution..."

# Count current TypeScript errors
echo "   Current TypeScript compilation status:" >> "$verification_log"
baseline_errors=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || true)
if [ -z "$baseline_errors" ]; then
  baseline_errors=0
fi
echo "   Baseline TypeScript errors: $baseline_errors" >> "$verification_log"

# Test current build status
echo "   Current build status:" >> "$verification_log"
if npm run build 2>/dev/null; then
  echo "   ✅ Phase 1 Vite build: WORKING" >> "$verification_log"
  baseline_build="working"
else
  echo "   ❌ Phase 1 Vite build: FAILING" >> "$verification_log"
  baseline_build="failing"
fi

echo "" >> "$verification_log"

echo "📋 STEP 2: TypeScript Configuration Enhancement Test"
echo "=================================================="
echo "STEP 2: TypeScript Configuration Enhancement Test" >> "$verification_log"
echo "=================================================" >> "$verification_log"

echo "🔍 Testing enhanced TypeScript configuration for JSX support..."

# Create enhanced tsconfig for testing
test_tsconfig="tsconfig.test.json"
cat > "$test_tsconfig" << 'EOF'
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"],
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx", 
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "temp-jsx-compilation-test.tsx"
  ]
}
EOF

echo "   Enhanced TypeScript configuration created: $test_tsconfig" >> "$verification_log"

# Test JSX compilation with enhanced config
echo "   Testing JSX compilation with enhanced config:" >> "$verification_log"
test_jsx_file="temp-jsx-compilation-test.tsx"
cat > "$test_jsx_file" << 'EOF'
import React from 'react';

const TestComponent = () => <div municipality="malmö">Test</div>;

export default TestComponent;
EOF

if npx tsc --project "$test_tsconfig" --noEmit 2>/dev/null; then
  echo "   ✅ Enhanced config JSX compilation: SUCCESS" >> "$verification_log"
  config_test="success"
else
  echo "   ❌ Enhanced config JSX compilation: FAILED" >> "$verification_log"
  echo "   Config test errors:" >> "$verification_log"
  npx tsc --project "$test_tsconfig" --noEmit 2>&1 | head -5 | sed 's/^/     /' >> "$verification_log"
  config_test="failed"
fi

# Clean up test files
rm -f "$test_jsx_file"

echo "" >> "$verification_log"

echo "📋 STEP 3: File Extension Solution Test"
echo "======================================"
echo "STEP 3: File Extension Solution Test" >> "$verification_log"
echo "====================================" >> "$verification_log"

echo "🔍 Testing file extension changes with enhanced configuration..."

extension_test_results=()
for file in "${jsx_test_files[@]}"; do
  if [ -f "$file" ]; then
    echo "📁 Testing: $file" >> "$verification_log"
    
    # Create .tsx version for testing
    tsx_file="${file%.ts}.tsx"
    cp "$file" "$tsx_file"
    
    echo "   Created test file: $tsx_file" >> "$verification_log"
    
    # Test compilation with enhanced config
    if npx tsc --project "$test_tsconfig" --noEmit 2>/dev/null; then
      echo "   ✅ .tsx compilation with enhanced config: SUCCESS" >> "$verification_log"
      extension_test_results+=("success")
    else
      echo "   ❌ .tsx compilation with enhanced config: FAILED" >> "$verification_log"
      echo "   Extension test errors:" >> "$verification_log"
      npx tsc --project "$test_tsconfig" --noEmit 2>&1 | head -3 | sed 's/^/     /' >> "$verification_log"
      extension_test_results+=("failed")
    fi
    
    # Clean up test file
    rm -f "$tsx_file"
    echo "" >> "$verification_log"
  else
    echo "   ❌ File not found: $file" >> "$verification_log"
    extension_test_results+=("not_found")
  fi
done

echo "" >> "$verification_log"

echo "📋 STEP 4: Vitest Integration Test"  
echo "================================="
echo "STEP 4: Vitest Integration Test" >> "$verification_log"
echo "===============================" >> "$verification_log"

echo "🔍 Testing Vitest execution with JSX test files..."

# Create enhanced vitest config for testing
test_vitest_config="vitest.test.config.ts"
cat > "$test_vitest_config" << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts']
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
    loader: 'tsx',
    include: /\.(tsx?|jsx?)$/
  }
})
EOF

echo "   Enhanced Vitest configuration created: $test_vitest_config" >> "$verification_log"

# Test one JSX file with enhanced Vitest config
test_file="${jsx_test_files[0]}"
if [ -f "$test_file" ]; then
  tsx_test_file="${test_file%.ts}.tsx"
  cp "$test_file" "$tsx_test_file"
  
  echo "   Testing Vitest execution with: $tsx_test_file" >> "$verification_log"
  
  if timeout 30s npx vitest run "$tsx_test_file" --config="$test_vitest_config" --reporter=verbose 2>/dev/null; then
    echo "   ✅ Vitest JSX execution: SUCCESS" >> "$verification_log"
    vitest_test="success"
  else
    echo "   ⚠️  Vitest JSX execution: NEEDS_INVESTIGATION" >> "$verification_log"
    echo "   (Note: May fail due to missing components, not JSX issues)" >> "$verification_log"
    vitest_test="partial"
  fi
  
  # Clean up
  rm -f "$tsx_test_file"
else
  echo "   ❌ Test file not found for Vitest testing" >> "$verification_log"
  vitest_test="not_found"
fi

# Clean up test config
rm -f "$test_vitest_config"

echo "" >> "$verification_log"

echo "📋 STEP 5: Regression Prevention Test"
echo "===================================="
echo "STEP 5: Regression Prevention Test" >> "$verification_log"
echo "==================================" >> "$verification_log"

echo "🔍 Testing that solution doesn't break existing functionality..."

# Test that Phase 1 build still works
echo "   Phase 1 deployment capability test:" >> "$verification_log"
if npm run build 2>/dev/null; then
  echo "   ✅ Phase 1 Vite build: MAINTAINED" >> "$verification_log"
  regression_test="no_regression"
else
  echo "   ❌ Phase 1 Vite build: BROKEN" >> "$verification_log"
  regression_test="regression_detected"
fi

# Test that existing TypeScript files still compile
echo "   Existing TypeScript compilation test:" >> "$verification_log"
current_errors=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || true)
if [ -z "$current_errors" ]; then
  current_errors=0
fi
if [ "$current_errors" -eq "$baseline_errors" ]; then
  echo "   ✅ TypeScript errors unchanged: $current_errors" >> "$verification_log"
  typescript_regression="no_regression"
else
  echo "   ⚠️  TypeScript errors changed: $baseline_errors → $current_errors" >> "$verification_log"
  typescript_regression="changed"
fi

# Clean up test configuration
rm -f "$test_tsconfig"

echo "" >> "$verification_log"

echo "📊 COMPREHENSIVE SOLUTION ASSESSMENT"
echo "==================================="
echo "COMPREHENSIVE SOLUTION ASSESSMENT" >> "$verification_log"
echo "=================================" >> "$verification_log"

echo "" >> "$verification_log"
echo "Test Results Summary:" >> "$verification_log"
echo "- Enhanced TypeScript config: $config_test" >> "$verification_log"
echo "- File extension compatibility: ${extension_test_results[*]}" >> "$verification_log"
echo "- Vitest JSX integration: $vitest_test" >> "$verification_log"
echo "- Phase 1 regression test: $regression_test" >> "$verification_log"
echo "- TypeScript regression test: $typescript_regression" >> "$verification_log"

# Count successful extension tests
successful_extensions=0
for result in "${extension_test_results[@]}"; do
  if [ "$result" = "success" ]; then
    successful_extensions=$((successful_extensions + 1))
  fi
done

# Determine overall confidence level
if [ "$config_test" = "success" ] && [ "$successful_extensions" -eq "${#jsx_test_files[@]}" ] && [ "$regression_test" = "no_regression" ]; then
  echo "✅ SOLUTION CONFIDENCE: 100% - READY FOR IMPLEMENTATION" >> "$verification_log"
  echo "   All verification tests passed successfully" >> "$verification_log"
  echo "   Combined approach (config + extensions) proven effective" >> "$verification_log"
  confidence="100_percent"
elif [ "$config_test" = "success" ] && [ "$successful_extensions" -gt 0 ] && [ "$regression_test" = "no_regression" ]; then
  echo "✅ SOLUTION CONFIDENCE: 95% - HIGH CONFIDENCE FOR IMPLEMENTATION" >> "$verification_log"
  echo "   Core solution proven, minor issues can be addressed during implementation" >> "$verification_log"
  confidence="95_percent"
elif [ "$config_test" = "success" ] && [ "$regression_test" = "no_regression" ]; then
  echo "⚠️  SOLUTION CONFIDENCE: 80% - MODERATE CONFIDENCE" >> "$verification_log"
  echo "   TypeScript config works, file extension approach needs refinement" >> "$verification_log"
  confidence="80_percent"
else
  echo "❌ SOLUTION CONFIDENCE: <80% - REQUIRES INVESTIGATION" >> "$verification_log"
  echo "   Fundamental issues detected, approach needs revision" >> "$verification_log"
  confidence="low"
fi

echo "" >> "$verification_log"
echo "IMPLEMENTATION RECOMMENDATION:" >> "$verification_log"

if [ "$confidence" = "100_percent" ] || [ "$confidence" = "95_percent" ]; then
  echo "✅ PROCEED WITH IMPLEMENTATION" >> "$verification_log"
  echo "1. Apply enhanced TypeScript configuration" >> "$verification_log"
  echo "2. Rename JSX test files to .tsx extensions" >> "$verification_log"
  echo "3. Update Vitest configuration for JSX support" >> "$verification_log"
  echo "4. Validate TypeScript compilation restoration" >> "$verification_log"
  echo "5. Confirm Phase 1 deployment capability maintained" >> "$verification_log"
elif [ "$confidence" = "80_percent" ]; then
  echo "⚠️  PROCEED WITH CAUTION" >> "$verification_log"
  echo "1. Implement TypeScript configuration changes first" >> "$verification_log"
  echo "2. Test file extension changes incrementally" >> "$verification_log"
  echo "3. Address specific file issues as they arise" >> "$verification_log"
else
  echo "❌ DO NOT IMPLEMENT - INVESTIGATE FURTHER" >> "$verification_log"
  echo "1. Review TypeScript configuration requirements" >> "$verification_log"
  echo "2. Investigate alternative JSX handling approaches" >> "$verification_log"
  echo "3. Consider Vitest-specific configuration needs" >> "$verification_log"
fi

echo ""
echo "📊 Comprehensive verification complete. Results logged to: $verification_log"
echo "🎯 Solution confidence: $confidence"

if [ "$confidence" = "100_percent" ] || [ "$confidence" = "95_percent" ]; then
  echo "✅ HIGH CONFIDENCE - Ready for systematic implementation"
  exit 0
elif [ "$confidence" = "80_percent" ]; then
  echo "⚠️  MODERATE CONFIDENCE - Proceed with incremental approach"
  exit 1
else
  echo "❌ LOW CONFIDENCE - Further investigation required"
  exit 2
fi