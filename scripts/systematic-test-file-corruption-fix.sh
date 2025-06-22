#!/bin/bash

# Systematic Test File Corruption Fix
# Root Cause: Escaped newlines (\n\n) instead of actual line breaks
# Solution: Replace \n\n with actual newlines

set -e  # Exit on any error

echo "🔧 Systematic Test File Corruption Fix"
echo "======================================="

# Create backup directory
backup_dir="backups/test-corruption-fix-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

# Log file for fix results
fix_log="docs/quality/test-corruption-fix-results.log"
mkdir -p "$(dirname "$fix_log")"

echo "Test File Corruption Fix Results - $(date)" > "$fix_log"
echo "==========================================" >> "$fix_log"
echo "" >> "$fix_log"

# Verification phase - validate our understanding
echo "📊 VERIFICATION PHASE: Confirming corruption patterns..."
echo "VERIFICATION PHASE:" >> "$fix_log"
echo "-----------------" >> "$fix_log"

test_sample="src/tests/components/accessibility/AchievementAccessibility.test.tsx"
if [ -f "$test_sample" ]; then
  echo "🔍 Analyzing sample file: $test_sample"
  
  # Check for \n\n pattern
  if grep -q '\\n\\n' "$test_sample"; then
    echo "✅ Confirmed: Escaped newline pattern found"
    echo "✅ Pattern confirmed in sample file" >> "$fix_log"
    
    # Show specific corruption
    echo "   Corrupted line:" >> "$fix_log"
    grep -n '\\n\\n' "$test_sample" | head -1 >> "$fix_log"
  else
    echo "❌ ERROR: Expected corruption pattern not found!"
    echo "❌ ERROR: Pattern not found - aborting fix" >> "$fix_log"
    exit 1
  fi
else
  echo "❌ ERROR: Sample file not found!"
  exit 1
fi

echo "" >> "$fix_log"

# Get list of corrupted files from previous analysis
corrupted_files=(
  "src/tests/components/municipal/MunicipalitySelector.test.tsx"
  "src/tests/components/municipal/MunicipalButtonExamples.test.tsx"
  "src/tests/components/accessibility/AchievementAccessibility.test.tsx"
  "src/tests/components/accessibility/SkipLink.test.tsx"
  "src/tests/components/auth/LoginForm.test.tsx"
  "src/tests/components/auth/AdminAuth.test.tsx"
  "src/tests/components/auth/SAMLRedirect.test.tsx"
  "src/tests/components/general/ContentWorkflows.test.tsx"
  "src/tests/components/general/ProtectedRoute.test.tsx"
  "src/tests/components/general/UsernameModal.test.tsx"
  "src/tests/components/general/Avatar.test.tsx"
  "src/tests/components/general/EnhancedErrorBoundary.test.tsx"
  "src/tests/components/general/CelebrationEffects.test.tsx"
  "src/tests/components/general/LoadingStates.test.tsx"
  "src/tests/components/general/ErrorBoundary.test.tsx"
  "src/tests/components/core/SummaryScene.test.tsx"
  "src/tests/components/core/ResourceScene.test.tsx"
  "src/tests/components/core/AssessmentScene.test.tsx"
  "src/tests/components/core/SceneTransition.test.tsx"
  "src/tests/components/core/GameIcons.test.tsx"
  "src/tests/components/admin/AdminApp.test.tsx"
  "src/tests/components/admin/AdminDashboard.test.tsx"
  "src/tests/components/admin/EnterpriseAdminCore.test.tsx"
  "src/tests/components/admin/MonitoringDashboard.test.tsx"
)

echo "🔧 IMPLEMENTATION PHASE: Applying systematic fixes..."
echo "" >> "$fix_log"
echo "IMPLEMENTATION PHASE:" >> "$fix_log"
echo "--------------------" >> "$fix_log"

fixed_count=0
skipped_count=0

for file in "${corrupted_files[@]}"; do
  if [ -f "$file" ]; then
    echo "📁 Processing: $file"
    
    # Create backup
    backup_file="$backup_dir/$(basename "$file").bak"
    cp "$file" "$backup_file"
    
    # Count occurrences before fix
    before_count=$(grep -c '\\n\\n' "$file" || echo "0")
    
    if [ "$before_count" -gt 0 ]; then
      # Apply the fix: replace \n\n with actual newlines
      sed -i 's/\\n\\n/\n\n/g' "$file"
      
      # Verify fix was applied
      after_count=$(grep -c '\\n\\n' "$file" || echo "0")
      
      if [ "$after_count" -eq 0 ]; then
        echo "   ✅ Fixed $before_count occurrences"
        echo "✅ $file: Fixed $before_count escaped newlines" >> "$fix_log"
        ((fixed_count++))
      else
        echo "   ⚠️  Partial fix: $after_count remaining"
        echo "⚠️  $file: Partial fix - $after_count patterns remain" >> "$fix_log"
      fi
    else
      echo "   ℹ️  No corruption found (may have been fixed already)"
      echo "ℹ️  $file: No corruption patterns found" >> "$fix_log"
      ((skipped_count++))
    fi
  else
    echo "   ❌ File not found: $file"
    echo "❌ $file: File not found" >> "$fix_log"
  fi
done

echo ""
echo "📊 VALIDATION PHASE: Verifying fixes..."
echo "" >> "$fix_log"
echo "VALIDATION PHASE:" >> "$fix_log"
echo "----------------" >> "$fix_log"

# Test compilation of a few fixed files
validation_samples=(
  "src/tests/components/accessibility/AchievementAccessibility.test.tsx"
  "src/tests/components/auth/LoginForm.test.tsx"
  "src/tests/components/core/SummaryScene.test.tsx"
)

validation_success=true

for sample in "${validation_samples[@]}"; do
  if [ -f "$sample" ]; then
    echo "🔍 Validating: $sample"
    
    # Check TypeScript syntax (basic validation)
    if npx tsc --noEmit --skipLibCheck "$sample" 2>/dev/null; then
      echo "   ✅ TypeScript validation passed"
      echo "✅ $sample: TypeScript validation successful" >> "$fix_log"
    else
      echo "   ❌ TypeScript validation failed"
      echo "❌ $sample: TypeScript validation failed" >> "$fix_log"
      validation_success=false
    fi
  fi
done

echo "" >> "$fix_log"
echo "SUMMARY:" >> "$fix_log"
echo "--------" >> "$fix_log"
echo "Files processed: ${#corrupted_files[@]}" >> "$fix_log"
echo "Successfully fixed: $fixed_count" >> "$fix_log"
echo "Skipped (no corruption): $skipped_count" >> "$fix_log"
echo "Backup location: $backup_dir" >> "$fix_log"

echo ""
echo "📊 FIX SUMMARY:"
echo "   Files processed: ${#corrupted_files[@]}"
echo "   Successfully fixed: $fixed_count"
echo "   Skipped: $skipped_count"
echo "   Backup location: $backup_dir"

if [ "$validation_success" = true ] && [ "$fixed_count" -gt 0 ]; then
  echo ""
  echo "✅ SYSTEMATIC FIX COMPLETED SUCCESSFULLY"
  echo "✅ Ready for TypeScript compilation validation"
  echo "✅ SYSTEMATIC FIX SUCCESSFUL - Ready for compilation validation" >> "$fix_log"
  exit 0
else
  echo ""
  echo "⚠️  FIX COMPLETED WITH WARNINGS"
  echo "⚠️  Manual review recommended before deployment"
  echo "⚠️  FIX COMPLETED WITH WARNINGS - Manual review needed" >> "$fix_log"
  exit 1
fi