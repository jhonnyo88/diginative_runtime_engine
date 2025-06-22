#!/bin/bash

# Script to fix incorrectly quoted variable declarations and property names

echo "🔍 Fixing incorrectly quoted variable declarations..."

files_to_fix=(
  "src/services/strategic-municipal-partnership-program.ts"
  "src/services/cultural-intelligence/SwedishCulturalIntelligenceTesting.ts"
)

backup_dir="backups/variable-fix-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

for file in "${files_to_fix[@]}"; do
  if [ -f "$file" ]; then
    echo "📁 Processing $file..."
    
    # Create backup
    cp "$file" "$backup_dir/$(basename "$file").bak"
    
    # Fix incorrectly quoted const declarations
    sed -i 's/"const \([^"]*\)": /const \1: /g' "$file"
    
    # Fix incorrectly quoted let declarations  
    sed -i 's/"let \([^"]*\)": /let \1: /g' "$file"
    
    # Fix incorrectly quoted var declarations
    sed -i 's/"var \([^"]*\)": /var \1: /g' "$file"
    
    # Fix incorrectly quoted private fields
    sed -i 's/"private \([^"]*\)": /private \1: /g' "$file"
    
    # Fix incorrectly quoted public fields
    sed -i 's/"public \([^"]*\)": /public \1: /g' "$file"
    
    # Fix incorrectly quoted protected fields
    sed -i 's/"protected \([^"]*\)": /protected \1: /g' "$file"
    
    echo "✅ Fixed variable declarations in $file"
  else
    echo "❌ File not found: $file"
  fi
done

echo "🔍 Running TypeScript check on fixed files..."
npx tsc --noEmit --skipLibCheck src/services/strategic-municipal-partnership-program.ts
npx tsc --noEmit --skipLibCheck src/services/cultural-intelligence/SwedishCulturalIntelligenceTesting.ts

echo "📊 Variable declaration fix completed. Backups stored in: $backup_dir"