#!/bin/bash

# Phase 2: JSX Compilation Context Verification Tests
# Testing the real root cause: TypeScript JSX compilation context issue

set -e

echo "🎯 Phase 2: JSX Compilation Context Verification"
echo "==============================================="

# Create verification log
verification_log="docs/quality/phase2-jsx-context-verification.log"
mkdir -p "$(dirname "$verification_log")"

echo "Phase 2 JSX Context Verification - $(date)" > "$verification_log"
echo "==========================================" >> "$verification_log"
echo "" >> "$verification_log"

echo "🔬 HYPOTHESIS: TypeScript JSX compilation context issue" >> "$verification_log"
echo "Root Cause: .test.ts files contain JSX but TypeScript expects JSX only in .tsx files" >> "$verification_log"
echo "" >> "$verification_log"

# Test files with JSX content but .ts extension
jsx_test_files=(
  "src/tests/q2-interactive/drag-drop-test-utilities.test.ts"
  "src/tests/q2-interactive/interactive-accessibility-testing.test.ts" 
  "src/tests/performance/loading-time-budgets.test.ts"
  "src/tests/security/xss-injection-prevention.test.ts"
)

echo "📋 TEST A: File Extension Solution Verification"
echo "=============================================="
echo "TEST A: File Extension Solution Verification" >> "$verification_log"
echo "---------------------------------------------" >> "$verification_log"

echo "🔍 Testing file extension solution with single file..."

# Test with one file first
test_file="${jsx_test_files[0]}"
if [ -f "$test_file" ]; then
  echo "✅ Test file found: $test_file" >> "$verification_log"
  
  # Create backup
  backup_file="${test_file}.backup"
  cp "$test_file" "$backup_file"
  echo "   Created backup: $backup_file" >> "$verification_log"
  
  # Create .tsx version
  tsx_file="${test_file%.ts}.tsx"
  cp "$test_file" "$tsx_file"
  echo "   Created .tsx version: $tsx_file" >> "$verification_log"
  
  # Test A1: Compile original .ts file (should fail)
  echo "   Test A1: Original .ts file compilation..." >> "$verification_log"
  if npx tsc --noEmit --skipLibCheck "$test_file" 2>/dev/null; then
    echo "❌ Unexpected: .ts file compiles (hypothesis wrong)"
    echo "❌ A1: .ts file compiles unexpectedly" >> "$verification_log"
    ts_compilation_result="unexpected_success"
  else
    echo "✅ Expected: .ts file fails compilation"
    echo "✅ A1: .ts file fails as expected" >> "$verification_log"
    ts_compilation_result="expected_failure"
  fi
  
  # Test A2: Compile .tsx file (should succeed)
  echo "   Test A2: .tsx file compilation..." >> "$verification_log"
  if npx tsc --noEmit --skipLibCheck "$tsx_file" 2>/dev/null; then
    echo "✅ SUCCESS: .tsx file compiles correctly!"
    echo "✅ A2: .tsx file compiles successfully" >> "$verification_log"
    tsx_compilation_result="success"
  else
    echo "⚠️  .tsx file still fails - may need additional fixes"
    echo "⚠️  A2: .tsx file compilation failed" >> "$verification_log"
    
    # Capture specific errors for .tsx file
    echo "   .tsx compilation errors:" >> "$verification_log"
    npx tsc --noEmit --skipLibCheck "$tsx_file" 2>&1 | head -5 | sed 's/^/   /' >> "$verification_log"
    tsx_compilation_result="failed"
  fi
  
  # Clean up test files
  rm -f "$tsx_file"
  
else
  echo "❌ Test file not found: $test_file"
  echo "❌ Test file not found: $test_file" >> "$verification_log"
  ts_compilation_result="file_not_found"
  tsx_compilation_result="file_not_found"
fi

echo "" >> "$verification_log"

echo "📋 TEST B: JSX Content Analysis"
echo "==============================="
echo "TEST B: JSX Content Analysis" >> "$verification_log"
echo "-----------------------------" >> "$verification_log"

echo "🔍 Analyzing JSX content patterns in test files..."

jsx_content_count=0
for file in "${jsx_test_files[@]}"; do
  if [ -f "$file" ]; then
    echo "📁 Analyzing: $file" >> "$verification_log"
    
    # Count JSX patterns
    jsx_elements=$(grep -c '<[A-Z][^>]*>' "$file" 2>/dev/null || echo "0")
    jsx_props=$(grep -c '[a-zA-Z]="[^"]*"' "$file" 2>/dev/null || echo "0")
    jsx_closing=$(grep -c '/>' "$file" 2>/dev/null || echo "0")
    
    echo "   JSX elements: $jsx_elements" >> "$verification_log"
    echo "   JSX properties: $jsx_props" >> "$verification_log"
    echo "   JSX self-closing: $jsx_closing" >> "$verification_log"
    
    total_jsx=$((jsx_elements + jsx_props + jsx_closing))
    if [ "$total_jsx" -gt 0 ]; then
      echo "✅ Contains JSX content ($total_jsx patterns)"
      echo "✅ Contains JSX content: $total_jsx patterns" >> "$verification_log"
      jsx_content_count=$((jsx_content_count + 1))
    else
      echo "❌ No JSX content detected"
      echo "❌ No JSX content detected" >> "$verification_log"
    fi
    echo "" >> "$verification_log"
  fi
done

echo "JSX Content Summary: $jsx_content_count of ${#jsx_test_files[@]} files contain JSX" >> "$verification_log"
echo "" >> "$verification_log"

echo "📋 TEST C: TypeScript Configuration Analysis"
echo "==========================================="
echo "TEST C: TypeScript Configuration Analysis" >> "$verification_log"
echo "------------------------------------------" >> "$verification_log"

echo "🔍 Analyzing current TypeScript configuration for JSX handling..."

# Check tsconfig.app.json JSX settings
if [ -f "tsconfig.app.json" ]; then
  echo "✅ tsconfig.app.json found" >> "$verification_log"
  
  jsx_setting=$(grep -o '"jsx":[^,}]*' tsconfig.app.json | head -1)
  if [ ! -z "$jsx_setting" ]; then
    echo "✅ JSX configuration: $jsx_setting"
    echo "✅ JSX configuration found: $jsx_setting" >> "$verification_log"
  else
    echo "❌ No JSX configuration found"
    echo "❌ No JSX configuration found" >> "$verification_log"
  fi
  
  # Check file inclusion patterns
  include_pattern=$(grep -A 5 '"include"' tsconfig.app.json)
  echo "   Include patterns:" >> "$verification_log"
  echo "$include_pattern" | sed 's/^/   /' >> "$verification_log"
  
else
  echo "❌ tsconfig.app.json not found"
  echo "❌ tsconfig.app.json not found" >> "$verification_log"
fi

echo "" >> "$verification_log"

echo "📊 HYPOTHESIS VALIDATION SUMMARY"
echo "================================"
echo "HYPOTHESIS VALIDATION SUMMARY" >> "$verification_log"
echo "=============================" >> "$verification_log"

echo "" >> "$verification_log"
echo "Test Results:" >> "$verification_log"
echo "- .ts file compilation: $ts_compilation_result" >> "$verification_log"
echo "- .tsx file compilation: $tsx_compilation_result" >> "$verification_log"
echo "- Files with JSX content: $jsx_content_count / ${#jsx_test_files[@]}" >> "$verification_log"

# Determine hypothesis validation
if [ "$ts_compilation_result" = "expected_failure" ] && [ "$tsx_compilation_result" = "success" ] && [ "$jsx_content_count" -gt 0 ]; then
  echo "✅ HYPOTHESIS CONFIRMED: File extension solution works"
  echo "✅ HYPOTHESIS: CONFIRMED - File extension solution" >> "$verification_log"
  echo "   Root Cause: .test.ts files with JSX content need .tsx extension" >> "$verification_log"
  echo "   Solution: Rename JSX test files from .ts to .tsx" >> "$verification_log"
  hypothesis_status="confirmed"
elif [ "$tsx_compilation_result" = "failed" ]; then
  echo "⚠️  HYPOTHESIS PARTIAL: File extension helps but additional issues remain"
  echo "⚠️  HYPOTHESIS: PARTIAL - Additional fixes needed" >> "$verification_log"
  echo "   Root Cause: File extension issue + additional TypeScript configuration" >> "$verification_log"
  echo "   Solution: File extension change + configuration updates" >> "$verification_log"
  hypothesis_status="partial"
else
  echo "❌ HYPOTHESIS REJECTED: File extension solution insufficient"
  echo "❌ HYPOTHESIS: REJECTED - Different approach needed" >> "$verification_log"
  hypothesis_status="rejected"
fi

echo "" >> "$verification_log"
echo "RECOMMENDED SOLUTION:" >> "$verification_log"

if [ "$hypothesis_status" = "confirmed" ]; then
  echo "1. Systematically rename JSX test files from .test.ts to .test.tsx" >> "$verification_log"
  echo "2. Update any import references to use new file extensions" >> "$verification_log"
  echo "3. Validate TypeScript compilation and test execution" >> "$verification_log"
  solution_confidence="high"
elif [ "$hypothesis_status" = "partial" ]; then
  echo "1. Rename JSX test files from .test.ts to .test.tsx" >> "$verification_log"
  echo "2. Update TypeScript configuration for enhanced JSX support" >> "$verification_log"
  echo "3. Address any additional compilation issues discovered" >> "$verification_log"
  solution_confidence="medium"
else
  echo "1. Investigate alternative TypeScript JSX configuration approaches" >> "$verification_log"
  echo "2. Consider Vitest-specific JSX handling configuration" >> "$verification_log"
  echo "3. Review complete TypeScript project structure" >> "$verification_log"
  solution_confidence="low"
fi

echo ""
echo "📊 Verification complete. Results logged to: $verification_log"
echo "🎯 Solution confidence: $solution_confidence"

if [ "$solution_confidence" = "high" ]; then
  echo "✅ Ready to implement verified file extension solution"
  exit 0
elif [ "$solution_confidence" = "medium" ]; then
  echo "⚠️  Ready to implement partial solution with additional configuration"
  exit 1
else
  echo "❌ Additional investigation required"
  exit 2
fi