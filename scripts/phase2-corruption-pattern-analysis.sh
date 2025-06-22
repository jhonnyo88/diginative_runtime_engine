#!/bin/bash

# Phase 2: Systematic Corruption Pattern Analysis
# Identify exact corruption patterns in remaining test files

set -e

echo "🔬 Phase 2: Systematic Corruption Pattern Analysis"
echo "================================================="

# Create analysis log
analysis_log="docs/quality/phase2-corruption-analysis.log"
mkdir -p "$(dirname "$analysis_log")"

echo "Phase 2 Corruption Pattern Analysis - $(date)" > "$analysis_log"
echo "=============================================" >> "$analysis_log"
echo "" >> "$analysis_log"

# Known corrupted files from TypeScript compilation errors
corrupted_files=(
  "src/tests/q2-interactive/drag-drop-test-utilities.test.ts"
  "src/tests/q2-interactive/interactive-accessibility-testing.test.ts"
  "src/tests/performance/loading-time-budgets.test.ts"
  "src/tests/security/xss-injection-prevention.test.ts"
)

echo "📋 STEP 1: TypeScript Error Pattern Extraction"
echo "=============================================="
echo "STEP 1: TypeScript Error Pattern Extraction" >> "$analysis_log"
echo "--------------------------------------------" >> "$analysis_log"

echo "🔍 Capturing specific TypeScript errors for each file..."

for file in "${corrupted_files[@]}"; do
  if [ -f "$file" ]; then
    echo "📁 Analyzing: $file" >> "$analysis_log"
    echo "" >> "$analysis_log"
    
    # Capture TypeScript errors for this specific file
    echo "   TypeScript errors:" >> "$analysis_log"
    npx tsc --noEmit --skipLibCheck "$file" 2>&1 | head -10 | sed 's/^/   /' >> "$analysis_log" || true
    echo "" >> "$analysis_log"
  else
    echo "❌ File not found: $file" >> "$analysis_log"
  fi
done

echo "" >> "$analysis_log"

echo "📋 STEP 2: Byte-Level Corruption Analysis"
echo "========================================="
echo "STEP 2: Byte-Level Corruption Analysis" >> "$analysis_log"
echo "---------------------------------------" >> "$analysis_log"

echo "🔍 Examining corruption patterns at byte level..."

for file in "${corrupted_files[@]}"; do
  if [ -f "$file" ]; then
    echo "📁 File: $file" >> "$analysis_log"
    echo "   Byte-level analysis:" >> "$analysis_log"
    
    # Look for specific corruption patterns we've seen before
    
    # Pattern 1: Escaped newlines (\n\n)
    escaped_newlines=$(grep -c '\\n\\n' "$file" 2>/dev/null || echo "0")
    echo "   Escaped newlines (\\n\\n): $escaped_newlines occurrences" >> "$analysis_log"
    
    # Pattern 2: Escaped characters in JSX
    escaped_jsx=$(grep -c '\\<\\|\\>' "$file" 2>/dev/null || echo "0")
    echo "   Escaped JSX brackets: $escaped_jsx occurrences" >> "$analysis_log"
    
    # Pattern 3: Unterminated regular expressions
    unterminated_regex=$(grep -c '/[^/]*$' "$file" 2>/dev/null || echo "0")
    echo "   Potentially unterminated regex: $unterminated_regex lines" >> "$analysis_log"
    
    # Pattern 4: Examine specific error lines mentioned in TypeScript output
    echo "   Sample corrupted lines:" >> "$analysis_log"
    
    # Get line numbers from TypeScript errors and examine them
    error_lines=$(npx tsc --noEmit --skipLibCheck "$file" 2>&1 | grep -o '([0-9]*,' | tr -d '(,' | head -5)
    for line_num in $error_lines; do
      if [ ! -z "$line_num" ]; then
        line_content=$(sed -n "${line_num}p" "$file" 2>/dev/null || echo "Line not found")
        echo "   Line $line_num: $line_content" >> "$analysis_log"
        
        # Hex dump of the problematic line
        echo "   Hex dump of line $line_num:" >> "$analysis_log"
        sed -n "${line_num}p" "$file" 2>/dev/null | hexdump -C | head -3 | sed 's/^/      /' >> "$analysis_log"
      fi
    done
    
    echo "" >> "$analysis_log"
  fi
done

echo "" >> "$analysis_log"

echo "📋 STEP 3: Pattern Comparison with Fixed Files"
echo "=============================================="
echo "STEP 3: Pattern Comparison with Fixed Files" >> "$analysis_log"
echo "---------------------------------------------" >> "$analysis_log"

echo "🔍 Comparing with successfully fixed files..."

# Compare with a successfully fixed file
fixed_file="src/tests/components/accessibility/AchievementAccessibility.test.tsx"
if [ -f "$fixed_file" ]; then
  echo "✅ Reference fixed file: $fixed_file" >> "$analysis_log"
  
  escaped_newlines_fixed=$(grep -c '\\n\\n' "$fixed_file" 2>/dev/null || echo "0")
  echo "   Escaped newlines in fixed file: $escaped_newlines_fixed" >> "$analysis_log"
  
  # Test TypeScript compilation of fixed file
  if npx tsc --noEmit --skipLibCheck "$fixed_file" 2>/dev/null; then
    echo "   ✅ Fixed file compiles successfully" >> "$analysis_log"
  else
    echo "   ❌ Fixed file still has issues" >> "$analysis_log"
  fi
else
  echo "❌ Reference fixed file not found" >> "$analysis_log"
fi

echo "" >> "$analysis_log"

echo "📋 STEP 4: Corruption Pattern Classification"
echo "==========================================="
echo "STEP 4: Corruption Pattern Classification" >> "$analysis_log"
echo "------------------------------------------" >> "$analysis_log"

echo "🔍 Classifying corruption patterns..."

# Analyze patterns across all corrupted files
total_escaped_newlines=0
total_escaped_jsx=0
total_unterminated_regex=0

for file in "${corrupted_files[@]}"; do
  if [ -f "$file" ]; then
    escaped_newlines=$(grep -c '\\n\\n' "$file" 2>/dev/null || echo "0")
    escaped_jsx=$(grep -c '\\<\\|\\>' "$file" 2>/dev/null || echo "0")
    unterminated_regex=$(grep -c '/[^/]*$' "$file" 2>/dev/null || echo "0")
    
    total_escaped_newlines=$((total_escaped_newlines + escaped_newlines))
    total_escaped_jsx=$((total_escaped_jsx + escaped_jsx))
    total_unterminated_regex=$((total_unterminated_regex + unterminated_regex))
  fi
done

echo "CORRUPTION PATTERN SUMMARY:" >> "$analysis_log"
echo "---------------------------" >> "$analysis_log"
echo "Total files analyzed: ${#corrupted_files[@]}" >> "$analysis_log"
echo "Total escaped newlines: $total_escaped_newlines" >> "$analysis_log"
echo "Total escaped JSX: $total_escaped_jsx" >> "$analysis_log"
echo "Total unterminated regex: $total_unterminated_regex" >> "$analysis_log"

echo "" >> "$analysis_log"

echo "📊 ROOT CAUSE HYPOTHESIS GENERATION"
echo "==================================="
echo "ROOT CAUSE HYPOTHESIS GENERATION" >> "$analysis_log"
echo "=================================" >> "$analysis_log"

# Generate hypothesis based on analysis
if [ "$total_escaped_newlines" -gt 0 ]; then
  echo "✅ HYPOTHESIS A: Escaped newline corruption (similar to Phase 1)" >> "$analysis_log"
  echo "   Evidence: $total_escaped_newlines escaped newlines found" >> "$analysis_log"
  hypothesis_a=true
else
  echo "❌ HYPOTHESIS A: No escaped newline corruption detected" >> "$analysis_log"
  hypothesis_a=false
fi

if [ "$total_escaped_jsx" -gt 0 ]; then
  echo "✅ HYPOTHESIS B: JSX syntax corruption" >> "$analysis_log"
  echo "   Evidence: $total_escaped_jsx escaped JSX patterns found" >> "$analysis_log"
  hypothesis_b=true
else
  echo "❌ HYPOTHESIS B: No JSX syntax corruption detected" >> "$analysis_log"
  hypothesis_b=false
fi

if [ "$total_unterminated_regex" -gt 5 ]; then  # Threshold for significance
  echo "✅ HYPOTHESIS C: Regular expression corruption" >> "$analysis_log"
  echo "   Evidence: $total_unterminated_regex potential regex issues found" >> "$analysis_log"
  hypothesis_c=true
else
  echo "❌ HYPOTHESIS C: Low probability regex corruption" >> "$analysis_log"
  hypothesis_c=false
fi

echo "" >> "$analysis_log"

echo "RECOMMENDED VERIFICATION TESTS:" >> "$analysis_log"
echo "-------------------------------" >> "$analysis_log"

if [ "$hypothesis_a" = true ]; then
  echo "1. Test escaped newline fix (proven method from Phase 1)" >> "$analysis_log"
fi

if [ "$hypothesis_b" = true ]; then
  echo "2. Test JSX syntax repair methodology" >> "$analysis_log"
fi

if [ "$hypothesis_c" = true ]; then
  echo "3. Test regular expression pattern fixes" >> "$analysis_log"
fi

echo "4. Validate each fix with isolated TypeScript compilation" >> "$analysis_log"
echo "5. Ensure no regression to Phase 1 deployment capability" >> "$analysis_log"

echo ""
echo "📊 Analysis complete. Results logged to: $analysis_log"

# Determine next steps based on hypotheses
if [ "$hypothesis_a" = true ]; then
  echo "✅ Primary hypothesis: Extend Phase 1 escaped newline fix methodology"
  echo "🎯 Confidence level: HIGH (proven approach)"
  exit 0
elif [ "$hypothesis_b" = true ] || [ "$hypothesis_c" = true ]; then
  echo "⚠️  Secondary hypotheses identified: JSX/Regex corruption"
  echo "🎯 Confidence level: MEDIUM (requires verification testing)"
  exit 1
else
  echo "❌ No clear corruption patterns identified"
  echo "🎯 Requires deeper investigation"
  exit 2
fi