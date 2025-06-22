#!/bin/bash

# Phase 2: Systematic JSX Test File Extension Fix
# Rename all test files containing JSX from .test.ts to .test.tsx

set -e

echo "🎯 Phase 2: JSX Test File Extension Fix"
echo "======================================="

# Create execution log
fix_log="docs/quality/phase2-jsx-extension-fix.log"
mkdir -p "$(dirname "$fix_log")"

echo "Phase 2 JSX Extension Fix - $(date)" > "$fix_log"
echo "===================================" >> "$fix_log"
echo "" >> "$fix_log"

echo "🔍 Finding all test files containing JSX patterns..."

# Find all .test.ts files that contain JSX patterns
jsx_test_files=()
while IFS= read -r -d '' file; do
  # Check if file contains JSX patterns
  if grep -q '<[A-Z][^>]*>' "$file" 2>/dev/null || \
     grep -q 'municipality=' "$file" 2>/dev/null || \
     grep -q 'locale=' "$file" 2>/dev/null || \
     grep -q 'gameType=' "$file" 2>/dev/null; then
    jsx_test_files+=("$file")
  fi
done < <(find src/tests -name "*.test.ts" -print0)

echo "📋 FOUND JSX TEST FILES:" >> "$fix_log"
echo "========================" >> "$fix_log"
for file in "${jsx_test_files[@]}"; do
  echo "   $file" >> "$fix_log"
done
echo "Total files to rename: ${#jsx_test_files[@]}" >> "$fix_log"
echo "" >> "$fix_log"

echo "Found ${#jsx_test_files[@]} test files containing JSX patterns"

if [ ${#jsx_test_files[@]} -eq 0 ]; then
  echo "✅ No JSX test files found to rename"
  echo "✅ No JSX test files found to rename" >> "$fix_log"
  exit 0
fi

echo "" >> "$fix_log"
echo "📋 RENAMING PROCESS:" >> "$fix_log"
echo "===================" >> "$fix_log"

# Rename each file from .test.ts to .test.tsx
renamed_count=0
failed_count=0

for file in "${jsx_test_files[@]}"; do
  if [ -f "$file" ]; then
    # Generate new filename
    new_file="${file%.ts}.tsx"
    
    echo "📁 Processing: $file" >> "$fix_log"
    echo "   Target: $new_file" >> "$fix_log"
    
    # Check if target already exists
    if [ -f "$new_file" ]; then
      echo "   ⚠️  Target file already exists, skipping" >> "$fix_log"
      echo "⚠️  Skipping $file (target exists)"
      continue
    fi
    
    # Create backup
    backup_file="${file}.backup"
    if cp "$file" "$backup_file" 2>/dev/null; then
      echo "   ✅ Backup created: $backup_file" >> "$fix_log"
    else
      echo "   ❌ Failed to create backup" >> "$fix_log"
      echo "❌ Failed to backup $file"
      failed_count=$((failed_count + 1))
      continue
    fi
    
    # Rename file
    if mv "$file" "$new_file" 2>/dev/null; then
      echo "   ✅ Renamed successfully" >> "$fix_log"
      echo "✅ Renamed: $(basename "$file") → $(basename "$new_file")"
      renamed_count=$((renamed_count + 1))
    else
      echo "   ❌ Failed to rename" >> "$fix_log"
      echo "❌ Failed to rename $file"
      # Restore backup
      mv "$backup_file" "$file" 2>/dev/null || true
      failed_count=$((failed_count + 1))
    fi
    
    echo "" >> "$fix_log"
  else
    echo "   ❌ File not found: $file" >> "$fix_log"
    failed_count=$((failed_count + 1))
  fi
done

echo "" >> "$fix_log"
echo "📊 SUMMARY:" >> "$fix_log"
echo "===========" >> "$fix_log"
echo "Files processed: ${#jsx_test_files[@]}" >> "$fix_log"
echo "Successfully renamed: $renamed_count" >> "$fix_log"
echo "Failed: $failed_count" >> "$fix_log"

echo ""
echo "📊 Renaming complete:"
echo "   Successfully renamed: $renamed_count files"
echo "   Failed: $failed_count files"

if [ $failed_count -gt 0 ]; then
  echo "⚠️  Some files failed to rename. Check log for details."
  echo "📄 Results logged to: $fix_log"
  exit 1
else
  echo "✅ All JSX test files successfully renamed to .tsx extension"
  echo "📄 Results logged to: $fix_log"
  exit 0
fi