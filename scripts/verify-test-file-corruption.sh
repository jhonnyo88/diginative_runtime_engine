#!/bin/bash

# Verification script to identify test files with escaped newline corruption
# Root cause: \n\n sequences instead of actual line breaks

echo "🔍 Analyzing test file corruption patterns..."

corruption_log="docs/quality/test-file-corruption-analysis.log"
mkdir -p "$(dirname "$corruption_log")"

echo "Test File Corruption Analysis - $(date)" > "$corruption_log"
echo "=========================================" >> "$corruption_log"
echo "" >> "$corruption_log"

# Find files with \n\n sequences (escaped newlines)
echo "Files with escaped newline sequences (\\n\\n):" >> "$corruption_log"
echo "------------------------------------------------" >> "$corruption_log"

find src/tests -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" | while read file; do
  if grep -l '\\n\\n' "$file" >/dev/null 2>&1; then
    count=$(grep -c '\\n\\n' "$file")
    echo "❌ $file ($count occurrences)" | tee -a "$corruption_log"
    
    # Show specific lines with corruption
    echo "   Corrupted lines:" >> "$corruption_log"
    grep -n '\\n\\n' "$file" | head -3 >> "$corruption_log"
    echo "" >> "$corruption_log"
  fi
done

echo "" >> "$corruption_log"

# Check for other syntax corruption patterns
echo "Files with JSX syntax corruption:" >> "$corruption_log"
echo "-----------------------------------" >> "$corruption_log"

find src/tests -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" | while read file; do
  # Look for unterminated JSX expressions
  if grep -l 'JSX.*{[^}]*$' "$file" >/dev/null 2>&1; then
    echo "🔧 $file (unterminated JSX expressions)" | tee -a "$corruption_log"
  fi
  
  # Look for malformed test syntax
  if grep -l 'it(.*{$' "$file" >/dev/null 2>&1; then
    if ! grep -l 'it(.*{$.*}' "$file" >/dev/null 2>&1; then
      echo "⚠️  $file (malformed test syntax)" | tee -a "$corruption_log"
    fi
  fi
done

echo "" >> "$corruption_log"

# Summary statistics
total_test_files=$(find src/tests -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" | wc -l)
corrupted_files=$(grep -c "❌" "$corruption_log" || echo "0")

echo "SUMMARY:" >> "$corruption_log"
echo "--------" >> "$corruption_log"
echo "Total test files: $total_test_files" >> "$corruption_log"
echo "Files with escaped newlines: $corrupted_files" >> "$corruption_log"
echo "Corruption rate: $(( (corrupted_files * 100) / total_test_files ))%" >> "$corruption_log"

echo ""
echo "📊 Analysis complete. Results saved to: $corruption_log"
echo "🔍 Total test files analyzed: $total_test_files"
echo "❌ Files with corruption: $corrupted_files"

if [ "$corrupted_files" -gt 0 ]; then
  echo ""
  echo "🛠️  Ready to create systematic fix script based on verified patterns."
  exit 1
else
  echo "✅ No file corruption detected."
  exit 0
fi