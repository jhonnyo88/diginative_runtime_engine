#!/bin/bash

# Phase 3: Bug #007 Investigation - React ReferenceError Variable Access
# Systematic root cause analysis för ReferenceError: Cannot access 'w' before initialization

set -e

echo "🔬 Phase 3: Bug #007 Root Cause Investigation"
echo "============================================="
echo "Issue: ReferenceError: Cannot access 'w' before initialization"
echo "Priority: HIGH"
echo "Impact: Application crash på Enterprise Admin Portal"
echo ""

# Create investigation log
investigation_log="docs/quality/phase3-bug-007-investigation.log"
mkdir -p "$(dirname "$investigation_log")"

echo "Bug #007 Investigation - $(date)" > "$investigation_log"
echo "==================================" >> "$investigation_log"
echo "" >> "$investigation_log"

echo "🔍 STEP 1: JavaScript Bundle Analysis"
echo "====================================="
echo "STEP 1: JavaScript Bundle Analysis" >> "$investigation_log"
echo "===================================" >> "$investigation_log"

# Look for minified JavaScript files
echo "📁 Searching for JavaScript bundles..."

js_bundles=()
if [ -d "dist" ]; then
  while IFS= read -r -d '' file; do
    js_bundles+=(\"$file\")
  done < <(find dist -name "*.js" -type f -print0 2>/dev/null)
fi

echo "   Found JavaScript bundles:" >> "$investigation_log"
for bundle in "${js_bundles[@]}"; do
  echo "   - $bundle" >> "$investigation_log"
done

total_bundles=${#js_bundles[@]}
echo "Total bundles found: $total_bundles" >> "$investigation_log"
echo "" >> "$investigation_log"

echo "🔍 STEP 2: Variable Hoisting Pattern Analysis"
echo "============================================"
echo "STEP 2: Variable Hoisting Pattern Analysis" >> "$investigation_log"
echo "===========================================" >> "$investigation_log"

# Search for variable hoisting issues in source code
echo "📁 Searching for variable hoisting patterns..."

hoisting_patterns=(
  "let.*=.*let"
  "const.*=.*const"
  "var.*=.*var"
  "Cannot access.*before initialization"
  "ReferenceError"
)

for pattern in "${hoisting_patterns[@]}"; do
  matches=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "$pattern" 2>/dev/null | wc -l)
  echo "   Pattern '$pattern': $matches files" >> "$investigation_log"
done

echo "" >> "$investigation_log"

echo "🔍 STEP 3: ES6 Module Import Analysis"
echo "====================================="
echo "STEP 3: ES6 Module Import Analysis" >> "$investigation_log"
echo "==================================" >> "$investigation_log"

# Check for problematic import patterns
echo "📁 Analyzing ES6 module imports..."

import_issues=0

# Check for circular dependencies
echo "   Checking for circular dependencies..." >> "$investigation_log"
circular_deps=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "import.*from.*\.\." 2>/dev/null | wc -l)
echo "   Files with relative imports: $circular_deps" >> "$investigation_log"

# Check for dynamic imports
dynamic_imports=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "import(" 2>/dev/null | wc -l)
echo "   Files with dynamic imports: $dynamic_imports" >> "$investigation_log"

# Check for export/import conflicts
export_imports=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "export.*import" 2>/dev/null | wc -l)
echo "   Files with export/import on same line: $export_imports" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 4: AdminApp Component Analysis"
echo "====================================="
echo "STEP 4: AdminApp Component Analysis" >> "$investigation_log"
echo "===================================" >> "$investigation_log"

# Focus on AdminApp since error occurs on Enterprise Admin Portal
echo "📁 Analyzing AdminApp component..."

if [ -f "src/components/admin/AdminApp.tsx" ]; then
  echo "   ✅ AdminApp.tsx exists" >> "$investigation_log"
  
  # Check AdminApp for variable initialization issues
  var_declarations=$(grep -n "let\|const\|var" src/components/admin/AdminApp.tsx | wc -l)
  echo "   Variable declarations: $var_declarations" >> "$investigation_log"
  
  # Check for immediate assignments
  immediate_assigns=$(grep -n "=.*=" src/components/admin/AdminApp.tsx | wc -l)
  echo "   Immediate assignments: $immediate_assigns" >> "$investigation_log"
  
  # Check for destructuring
  destructuring=$(grep -n "const.*{.*}" src/components/admin/AdminApp.tsx | wc -l)
  echo "   Destructuring patterns: $destructuring" >> "$investigation_log"
  
  # Check imports
  import_count=$(grep -c "^import" src/components/admin/AdminApp.tsx)
  echo "   Import statements: $import_count" >> "$investigation_log"
  
else
  echo "   ❌ AdminApp.tsx not found" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 5: Vite Build Configuration Analysis"
echo "==========================================="
echo "STEP 5: Vite Build Configuration Analysis" >> "$investigation_log"
echo "=========================================" >> "$investigation_log"

# Check Vite configuration for minification/optimization issues
echo "📁 Analyzing build configuration..."

if [ -f "vite.config.ts" ]; then
  echo "   ✅ vite.config.ts exists" >> "$investigation_log"
  
  # Check for build optimizations
  minify_config=$(grep -c "minify\|terser\|esbuild" vite.config.ts 2>/dev/null || echo "0")
  echo "   Minification settings: $minify_config references" >> "$investigation_log"
  
  # Check for rollup options
  rollup_config=$(grep -c "rollupOptions\|manualChunks" vite.config.ts 2>/dev/null || echo "0")
  echo "   Rollup configurations: $rollup_config references" >> "$investigation_log"
  
  # Check for build target
  target_config=$(grep -c "target.*es" vite.config.ts 2>/dev/null || echo "0")
  echo "   ES target configurations: $target_config references" >> "$investigation_log"
  
else
  echo "   ❌ vite.config.ts not found" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "📊 HYPOTHESIS GENERATION"
echo "========================"
echo "HYPOTHESIS GENERATION" >> "$investigation_log"
echo "====================" >> "$investigation_log"

# Generate hypothesis based on findings
if [ "$total_bundles" -gt 0 ]; then
  echo "🔬 HYPOTHESIS A: Minified JavaScript Variable Collision" >> "$investigation_log"
  echo "   Evidence: JavaScript bundles exist, minification may cause variable conflicts" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypothesis_a=true
else
  echo "❌ HYPOTHESIS A: No JavaScript bundles found for analysis" >> "$investigation_log"
  hypothesis_a=false
fi

if [ -f "src/components/admin/AdminApp.tsx" ]; then
  echo "🔬 HYPOTHESIS B: Variable Hoisting Issue in AdminApp" >> "$investigation_log"
  echo "   Evidence: AdminApp component exists, may have variable initialization problems" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypothesis_b=true
else
  echo "❌ HYPOTHESIS B: AdminApp component not found" >> "$investigation_log"
  hypothesis_b=false
fi

echo "🔬 HYPOTHESIS C: Build Configuration Issue" >> "$investigation_log"
echo "   Evidence: Vite/Rollup build process may generate problematic variable scoping" >> "$investigation_log"
echo "   Probability: MEDIUM" >> "$investigation_log"
hypothesis_c=true

echo "" >> "$investigation_log"

echo "🎯 RECOMMENDED NEXT STEPS" >> "$investigation_log"
echo "========================" >> "$investigation_log"

if [ "$hypothesis_a" = true ]; then
  echo "1. Analyze minified JavaScript bundle for variable 'w' conflicts" >> "$investigation_log"
  echo "2. Check Vite minification settings and rollup configuration" >> "$investigation_log"
  echo "3. Test with development build to isolate minification issues" >> "$investigation_log"
  recommended_action="investigate_minification"
elif [ "$hypothesis_b" = true ]; then
  echo "1. Review AdminApp component for variable initialization order" >> "$investigation_log"
  echo "2. Check for temporal dead zone violations" >> "$investigation_log"
  echo "3. Analyze component dependency chain" >> "$investigation_log"
  recommended_action="investigate_admin_component"
else
  echo "1. Deep dive into build configuration" >> "$investigation_log"
  echo "2. Check ES6 module compilation settings" >> "$investigation_log"
  echo "3. Test different build targets" >> "$investigation_log"
  recommended_action="investigate_build_config"
fi

echo ""
echo "📊 Investigation complete. Results logged to: $investigation_log"
echo "🎯 Recommended action: $recommended_action"

# Return exit code based on findings
if [ "$hypothesis_a" = true ]; then
  echo "🔍 PRIMARY HYPOTHESIS: Minified JavaScript variable collision"
  exit 1
elif [ "$hypothesis_b" = true ]; then
  echo "🔍 PRIMARY HYPOTHESIS: AdminApp variable hoisting"
  exit 2
else
  echo "🔍 PRIMARY HYPOTHESIS: Build configuration issue"
  exit 3
fi