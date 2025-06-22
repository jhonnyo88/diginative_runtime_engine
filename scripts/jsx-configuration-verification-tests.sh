#!/bin/bash

# JSX Configuration Verification Tests
# Systematic testing to identify root cause and validate solution with 100% confidence

set -e

echo "🔬 JSX Configuration Root Cause Verification Tests"
echo "=================================================="

# Create verification log
verification_log="docs/quality/jsx-verification-results.log"
mkdir -p "$(dirname "$verification_log")"

echo "JSX Configuration Verification Results - $(date)" > "$verification_log"
echo "===============================================" >> "$verification_log"
echo "" >> "$verification_log"

# Test sample files
test_file_tsx="src/tests/components/accessibility/AchievementAccessibility.test.tsx"
app_file_tsx="src/App.tsx"

echo "📋 TEST 1: TypeScript Configuration Analysis"
echo "============================================="
echo "TEST 1: TypeScript Configuration Analysis" >> "$verification_log"
echo "-------------------------------------------" >> "$verification_log"

echo "🔍 Analyzing tsconfig.app.json JSX settings..."

if [ -f "tsconfig.app.json" ]; then
  echo "✅ tsconfig.app.json found" >> "$verification_log"
  
  # Check for JSX configuration
  jsx_setting=$(grep -o '"jsx":[^,]*' tsconfig.app.json || echo "NOT_FOUND")
  echo "   JSX setting: $jsx_setting" >> "$verification_log"
  
  if [ "$jsx_setting" != "NOT_FOUND" ]; then
    echo "✅ JSX configuration present in tsconfig.app.json: $jsx_setting"
    echo "✅ JSX configured: $jsx_setting" >> "$verification_log"
  else
    echo "❌ JSX configuration missing in tsconfig.app.json"
    echo "❌ JSX configuration: MISSING" >> "$verification_log"
  fi
else
  echo "❌ tsconfig.app.json not found"
  echo "❌ tsconfig.app.json: NOT_FOUND" >> "$verification_log"
fi

echo "" >> "$verification_log"

echo "📋 TEST 2: Direct TypeScript Compilation Test"
echo "=============================================="
echo "TEST 2: Direct TypeScript Compilation Test" >> "$verification_log"
echo "-------------------------------------------" >> "$verification_log"

echo "🔍 Testing direct compilation of sample test file..."

if [ -f "$test_file_tsx" ]; then
  echo "✅ Test file found: $test_file_tsx" >> "$verification_log"
  
  # Test 2A: Compile without explicit JSX flag
  echo "   Test 2A: Compilation without explicit JSX..." >> "$verification_log"
  if npx tsc --noEmit --skipLibCheck "$test_file_tsx" 2>/dev/null; then
    echo "✅ Compiles without explicit JSX flag"
    echo "✅ Compilation without JSX flag: SUCCESS" >> "$verification_log"
  else
    echo "❌ Fails without explicit JSX flag"
    echo "❌ Compilation without JSX flag: FAILED" >> "$verification_log"
    
    # Capture specific error
    error_output=$(npx tsc --noEmit --skipLibCheck "$test_file_tsx" 2>&1 | head -3)
    echo "   Error details:" >> "$verification_log"
    echo "$error_output" | sed 's/^/   /' >> "$verification_log"
  fi
  
  # Test 2B: Compile with explicit JSX flag
  echo "   Test 2B: Compilation with explicit JSX flag..." >> "$verification_log"
  if npx tsc --noEmit --skipLibCheck --jsx react-jsx "$test_file_tsx" 2>/dev/null; then
    echo "✅ Compiles with --jsx react-jsx flag"
    echo "✅ Compilation with --jsx react-jsx: SUCCESS" >> "$verification_log"
  else
    echo "❌ Still fails with --jsx react-jsx flag"
    echo "❌ Compilation with --jsx react-jsx: FAILED" >> "$verification_log"
  fi
  
  # Test 2C: Test different JSX options
  jsx_options=("react" "react-jsx" "react-jsxdev")
  for jsx_option in "${jsx_options[@]}"; do
    echo "   Testing --jsx $jsx_option..." >> "$verification_log"
    if npx tsc --noEmit --skipLibCheck --jsx "$jsx_option" "$test_file_tsx" 2>/dev/null; then
      echo "✅ Works with --jsx $jsx_option"
      echo "✅ --jsx $jsx_option: SUCCESS" >> "$verification_log"
    else
      echo "❌ Fails with --jsx $jsx_option" 
      echo "❌ --jsx $jsx_option: FAILED" >> "$verification_log"
    fi
  done
  
else
  echo "❌ Test file not found: $test_file_tsx"
  echo "❌ Test file: NOT_FOUND" >> "$verification_log"
fi

echo "" >> "$verification_log"

echo "📋 TEST 3: App File vs Test File Comparison"
echo "==========================================="
echo "TEST 3: App File vs Test File Comparison" >> "$verification_log"
echo "------------------------------------------" >> "$verification_log"

echo "🔍 Comparing app file vs test file compilation..."

if [ -f "$app_file_tsx" ]; then
  echo "✅ App file found: $app_file_tsx" >> "$verification_log"
  
  # Test app file compilation
  if npx tsc --noEmit --skipLibCheck "$app_file_tsx" 2>/dev/null; then
    echo "✅ App file compiles successfully"
    echo "✅ App file compilation: SUCCESS" >> "$verification_log"
  else
    echo "❌ App file compilation fails"
    echo "❌ App file compilation: FAILED" >> "$verification_log"
  fi
else
  echo "❌ App file not found: $app_file_tsx"
  echo "❌ App file: NOT_FOUND" >> "$verification_log"
fi

echo "" >> "$verification_log"

echo "📋 TEST 4: Vitest Configuration Analysis"
echo "========================================"
echo "TEST 4: Vitest Configuration Analysis" >> "$verification_log"
echo "--------------------------------------" >> "$verification_log"

echo "🔍 Analyzing Vitest JSX configuration..."

if [ -f "vitest.config.ts" ]; then
  echo "✅ vitest.config.ts found" >> "$verification_log"
  
  # Check ESBuild JSX configuration
  esbuild_jsx=$(grep -A 5 -B 5 "esbuild.*jsx" vitest.config.ts || echo "NOT_FOUND")
  if [ "$esbuild_jsx" != "NOT_FOUND" ]; then
    echo "✅ ESBuild JSX configuration found"
    echo "✅ ESBuild JSX config found:" >> "$verification_log"
    echo "$esbuild_jsx" | sed 's/^/   /' >> "$verification_log"
  else
    echo "❌ ESBuild JSX configuration missing"
    echo "❌ ESBuild JSX config: MISSING" >> "$verification_log"
  fi
else
  echo "❌ vitest.config.ts not found"
  echo "❌ vitest.config.ts: NOT_FOUND" >> "$verification_log"
fi

echo "" >> "$verification_log"

echo "📋 TEST 5: Project Structure Validation"
echo "======================================="
echo "TEST 5: Project Structure Validation" >> "$verification_log"
echo "-------------------------------------" >> "$verification_log"

echo "🔍 Validating TypeScript project structure..."

# Check main tsconfig.json
if [ -f "tsconfig.json" ]; then
  echo "✅ Main tsconfig.json found" >> "$verification_log"
  
  # Check for references
  references=$(grep -A 10 '"references"' tsconfig.json || echo "NOT_FOUND")
  if [ "$references" != "NOT_FOUND" ]; then
    echo "✅ Project references found"
    echo "✅ Project references:" >> "$verification_log"
    echo "$references" | sed 's/^/   /' >> "$verification_log"
  else
    echo "❌ Project references missing"
    echo "❌ Project references: MISSING" >> "$verification_log"
  fi
else
  echo "❌ Main tsconfig.json not found"
  echo "❌ Main tsconfig.json: NOT_FOUND" >> "$verification_log"
fi

echo "" >> "$verification_log"

echo "📊 ROOT CAUSE ANALYSIS SUMMARY"
echo "=============================="
echo "ROOT CAUSE ANALYSIS SUMMARY" >> "$verification_log"
echo "============================" >> "$verification_log"

# Determine root cause based on test results
echo "Based on verification tests:" >> "$verification_log"

# Check if JSX is configured in tsconfig.app.json
jsx_in_tsconfig=$(grep -q '"jsx"' tsconfig.app.json && echo "YES" || echo "NO")

# Check if test files fail compilation
test_compilation_fails=$(npx tsc --noEmit --skipLibCheck "$test_file_tsx" 2>/dev/null && echo "NO" || echo "YES")

# Check if explicit JSX flag fixes the issue
jsx_flag_fixes=$(npx tsc --noEmit --skipLibCheck --jsx react-jsx "$test_file_tsx" 2>/dev/null && echo "YES" || echo "NO")

echo "" >> "$verification_log"
echo "Key Findings:" >> "$verification_log"
echo "- JSX in tsconfig.app.json: $jsx_in_tsconfig" >> "$verification_log"
echo "- Test files fail compilation: $test_compilation_fails" >> "$verification_log"
echo "- Explicit --jsx flag fixes issue: $jsx_flag_fixes" >> "$verification_log"

echo ""
echo "📈 HYPOTHESIS VALIDATION:"

if [ "$jsx_in_tsconfig" = "YES" ] && [ "$test_compilation_fails" = "YES" ] && [ "$jsx_flag_fixes" = "YES" ]; then
  echo "✅ HYPOTHESIS CONFIRMED: TypeScript configuration mismatch"
  echo "✅ HYPOTHESIS: CONFIRMED - Configuration mismatch" >> "$verification_log"
  echo "   Root Cause: Test files not using same JSX config as app files" >> "$verification_log"
  echo "   Solution: Align test compilation with app JSX configuration" >> "$verification_log"
  
  hypothesis_confirmed=true
elif [ "$jsx_in_tsconfig" = "NO" ]; then
  echo "⚠️  HYPOTHESIS PARTIAL: JSX configuration missing entirely"
  echo "⚠️  HYPOTHESIS: PARTIAL - Missing JSX config" >> "$verification_log"
  echo "   Root Cause: JSX not configured in TypeScript" >> "$verification_log"
  echo "   Solution: Add JSX configuration to TypeScript config" >> "$verification_log"
  
  hypothesis_confirmed=partial
else
  echo "❌ HYPOTHESIS REJECTED: Different root cause"
  echo "❌ HYPOTHESIS: REJECTED - Unknown root cause" >> "$verification_log"
  echo "   Further investigation required" >> "$verification_log"
  
  hypothesis_confirmed=false
fi

echo "" >> "$verification_log"
echo "RECOMMENDED SOLUTION:" >> "$verification_log"

if [ "$hypothesis_confirmed" = "true" ]; then
  echo "1. Create dedicated tsconfig for test files with proper JSX settings" >> "$verification_log"
  echo "2. Update TypeScript compilation to use correct config for test files" >> "$verification_log"
  echo "3. Ensure Vitest uses aligned JSX configuration" >> "$verification_log"
elif [ "$hypothesis_confirmed" = "partial" ]; then
  echo "1. Add JSX configuration to tsconfig.app.json" >> "$verification_log"
  echo "2. Ensure test compilation inherits JSX settings" >> "$verification_log"
  echo "3. Verify Vitest JSX alignment" >> "$verification_log"
else
  echo "1. Conduct deeper investigation into TypeScript compilation setup" >> "$verification_log"
  echo "2. Review project structure and build process" >> "$verification_log"
fi

echo ""
echo "📊 Verification complete. Results logged to: $verification_log"

if [ "$hypothesis_confirmed" = "true" ]; then
  echo "✅ Ready to implement verified solution"
  exit 0
elif [ "$hypothesis_confirmed" = "partial" ]; then
  echo "⚠️  Ready to implement partial solution with monitoring"
  exit 1
else
  echo "❌ Further investigation required before fix implementation"
  exit 2
fi