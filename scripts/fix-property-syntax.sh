#!/bin/bash

# Script to fix TypeScript property syntax errors
# Finds and fixes property names with hyphens or spaces that need quotes

echo "🔍 Finding TypeScript property syntax issues..."

# Find files with property syntax issues
files_to_fix=(
  "src/services/strategic-municipal-partnership-program.ts"
  "src/services/cultural-intelligence/SwedishCulturalIntelligenceTesting.ts"
)

backup_dir="backups/property-syntax-fix-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

for file in "${files_to_fix[@]}"; do
  if [ -f "$file" ]; then
    echo "📁 Processing $file..."
    
    # Create backup
    cp "$file" "$backup_dir/$(basename "$file").bak"
    
    # Fix property names with hyphens (like co-sellingSupport)
    sed -i 's/\([[:space:]]*\)\([a-zA-Z][a-zA-Z0-9]*-[a-zA-Z][a-zA-Z0-9-]*\):/\1"\2":/g' "$file"
    
    # Fix property names with spaces (like feedback mechanisms)
    sed -i 's/\([[:space:]]*\)\([a-zA-Z][a-zA-Z0-9]* [a-zA-Z][a-zA-Z0-9 ]*\):/\1"\2":/g' "$file"
    
    echo "✅ Fixed property syntax in $file"
  else
    echo "❌ File not found: $file"
  fi
done

echo "🔍 Running TypeScript check on fixed files..."
npx tsc --noEmit --skipLibCheck src/services/strategic-municipal-partnership-program.ts
npx tsc --noEmit --skipLibCheck src/services/cultural-intelligence/SwedishCulturalIntelligenceTesting.ts

echo "📊 Property syntax fix completed. Backups stored in: $backup_dir"