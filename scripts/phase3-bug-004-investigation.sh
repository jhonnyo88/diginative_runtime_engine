#!/bin/bash

# Phase 3: Bug #004 Investigation - Component Showcase White Page
# Systematic root cause analysis för Component Showcase rendering issue

set -e

echo "🔬 Phase 3: Bug #004 Root Cause Investigation"
echo "==========================================="
echo "Issue: Component Showcase renders as white page"
echo "Priority: HIGH"
echo ""

# Create investigation log
investigation_log="docs/quality/phase3-bug-004-investigation.log"
mkdir -p "$(dirname "$investigation_log")"

echo "Bug #004 Investigation - $(date)" > "$investigation_log"
echo "=================================" >> "$investigation_log"
echo "" >> "$investigation_log"

echo "🔍 STEP 1: Component Showcase File Analysis"
echo "===========================================" 
echo "STEP 1: Component Showcase File Analysis" >> "$investigation_log"
echo "=========================================" >> "$investigation_log"

# Look for component showcase related files
echo "📁 Searching for component showcase files..."

showcase_files=()
while IFS= read -r -d '' file; do
  showcase_files+=("$file")
done < <(find src -name "*showcase*" -o -name "*component*" -o -name "*demo*" -type f -print0 2>/dev/null)

echo "   Found component/showcase files:" >> "$investigation_log"
for file in "${showcase_files[@]}"; do
  echo "   - $file" >> "$investigation_log"
done

echo "Total files found: ${#showcase_files[@]}" >> "$investigation_log"
echo "" >> "$investigation_log"

echo "🔍 STEP 2: React Router Configuration Analysis"
echo "============================================="
echo "STEP 2: React Router Configuration Analysis" >> "$investigation_log"
echo "============================================" >> "$investigation_log"

# Look for routing configuration
echo "📁 Searching for routing configuration..."

router_files=()
while IFS= read -r -d '' file; do
  router_files+=("$file")
done < <(find src -name "*router*" -o -name "*route*" -o -name "App.tsx" -o -name "main.tsx" -type f -print0 2>/dev/null)

echo "   Found routing files:" >> "$investigation_log"
for file in "${router_files[@]}"; do
  echo "   - $file" >> "$investigation_log"
  
  # Check if file contains showcase routes
  if [ -f "$file" ]; then
    showcase_mentions=$(grep -i "showcase\|component" "$file" | wc -l)
    if [ "$showcase_mentions" -gt 0 ]; then
      echo "     Contains showcase references: $showcase_mentions lines" >> "$investigation_log"
      echo "     Sample references:" >> "$investigation_log"
      grep -i "showcase\|component" "$file" | head -3 | sed 's/^/       /' >> "$investigation_log"
    fi
  fi
done

echo "" >> "$investigation_log"

echo "🔍 STEP 3: Component Import/Export Analysis"
echo "=========================================="
echo "STEP 3: Component Import/Export Analysis" >> "$investigation_log"
echo "=========================================" >> "$investigation_log"

# Check for component imports and exports
echo "📁 Analyzing component imports/exports..."

components_dir="src/components"
if [ -d "$components_dir" ]; then
  echo "   Components directory exists: $components_dir" >> "$investigation_log"
  
  # Count components
  component_count=$(find "$components_dir" -name "*.tsx" -o -name "*.ts" | wc -l)
  echo "   Total component files: $component_count" >> "$investigation_log"
  
  # Look for index files
  index_files=$(find "$components_dir" -name "index.ts" -o -name "index.tsx" | wc -l)
  echo "   Index files found: $index_files" >> "$investigation_log"
  
  # Check for export issues
  echo "   Checking for export patterns..." >> "$investigation_log"
  export_patterns=$(find "$components_dir" -name "*.tsx" -exec grep -l "export.*default\|export {" {} \; | wc -l)
  echo "   Files with exports: $export_patterns" >> "$investigation_log"
  
else
  echo "   ❌ Components directory not found: $components_dir" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 4: Build Configuration Analysis"
echo "======================================"
echo "STEP 4: Build Configuration Analysis" >> "$investigation_log"
echo "====================================" >> "$investigation_log"

# Check build configuration
echo "📁 Analyzing build configuration..."

build_configs=("vite.config.ts" "package.json" "tsconfig.json")
for config in "${build_configs[@]}"; do
  if [ -f "$config" ]; then
    echo "   ✅ $config exists" >> "$investigation_log"
    
    # Check for dynamic imports or code splitting
    if [ "$config" = "vite.config.ts" ]; then
      dynamic_imports=$(grep -c "dynamic\|lazy\|import(" "$config" 2>/dev/null || echo "0")
      echo "     Dynamic imports referenced: $dynamic_imports" >> "$investigation_log"
    fi
    
  else
    echo "   ❌ $config missing" >> "$investigation_log"
  fi
done

echo "" >> "$investigation_log"

echo "🔍 STEP 5: Error Pattern Analysis"
echo "================================"
echo "STEP 5: Error Pattern Analysis" >> "$investigation_log"
echo "==============================" >> "$investigation_log"

# Check for common error patterns in the codebase
echo "📁 Searching for potential error patterns..."

error_patterns=(
  "Cannot read properties"
  "undefined is not a function"
  "Failed to fetch"
  "Module not found"
  "TypeError"
  "ReferenceError"
)

for pattern in "${error_patterns[@]}"; do
  matches=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "$pattern" 2>/dev/null | wc -l)
  echo "   Pattern '$pattern': $matches files" >> "$investigation_log"
done

echo "" >> "$investigation_log"

echo "📊 HYPOTHESIS GENERATION"
echo "========================"
echo "HYPOTHESIS GENERATION" >> "$investigation_log"
echo "====================" >> "$investigation_log"

# Generate hypothesis based on findings
total_showcase_files=${#showcase_files[@]}
total_router_files=${#router_files[@]}

if [ "$total_showcase_files" -eq 0 ]; then
  echo "🔬 HYPOTHESIS A: Missing Component Showcase Implementation" >> "$investigation_log"
  echo "   Evidence: No showcase-related files found" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypothesis_a=true
else
  echo "❌ HYPOTHESIS A: Files exist ($total_showcase_files found)" >> "$investigation_log"
  hypothesis_a=false
fi

if [ "$total_router_files" -gt 0 ]; then
  echo "🔬 HYPOTHESIS B: Routing Configuration Issue" >> "$investigation_log"
  echo "   Evidence: Router files exist but may have incorrect configuration" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypothesis_b=true
else
  echo "❌ HYPOTHESIS B: No routing files found" >> "$investigation_log"
  hypothesis_b=false
fi

echo "🔬 HYPOTHESIS C: Component Import/Export Issue" >> "$investigation_log"
echo "   Evidence: Build system may not resolve component imports correctly" >> "$investigation_log"
echo "   Probability: MEDIUM" >> "$investigation_log"
hypothesis_c=true

echo "" >> "$investigation_log"

echo "🎯 RECOMMENDED NEXT STEPS" >> "$investigation_log"
echo "========================" >> "$investigation_log"

if [ "$hypothesis_a" = true ]; then
  echo "1. Verify component showcase implementation status" >> "$investigation_log"
  echo "2. Check if component showcase route is defined" >> "$investigation_log"
  echo "3. Investigate if components are properly exported" >> "$investigation_log"
  recommended_action="investigate_missing_implementation"
elif [ "$hypothesis_b" = true ]; then
  echo "1. Review routing configuration in detail" >> "$investigation_log"
  echo "2. Test route resolution manually" >> "$investigation_log"
  echo "3. Check for route parameter issues" >> "$investigation_log"
  recommended_action="investigate_routing"
else
  echo "1. Deep dive into component import/export chain" >> "$investigation_log"
  echo "2. Test component loading in isolation" >> "$investigation_log"
  echo "3. Check for circular dependencies" >> "$investigation_log"
  recommended_action="investigate_imports"
fi

echo ""
echo "📊 Investigation complete. Results logged to: $investigation_log"
echo "🎯 Recommended action: $recommended_action"

# Return exit code based on findings
if [ "$hypothesis_a" = true ]; then
  echo "🔍 PRIMARY HYPOTHESIS: Missing implementation"
  exit 1
elif [ "$hypothesis_b" = true ]; then
  echo "🔍 PRIMARY HYPOTHESIS: Routing configuration"
  exit 2
else
  echo "🔍 PRIMARY HYPOTHESIS: Import/export issues"
  exit 3
fi