#!/bin/bash

# GitHub Actions Quality Gate Investigation - Systematic Root Cause Analysis
# Applying proven 100% confidence methodology för identifying CI/CD failures

set -e

echo "🔬 GitHub Actions Quality Gate Investigation"
echo "==========================================="
echo "Issue: Workflow continues failing with 10 errors + 10 warnings"
echo "Previous Fix Attempt: TypeScript and React Hook dependency fixes"
echo "Current Status: Still failing Quality Gate checks"
echo ""

# Create investigation log
investigation_log="docs/quality/github-actions-quality-gate-investigation.log"
mkdir -p "$(dirname "$investigation_log")"

echo "GitHub Actions Quality Gate Investigation - $(date)" > "$investigation_log"
echo "=================================================" >> "$investigation_log"
echo "" >> "$investigation_log"

echo "🔍 STEP 1: Verify Current Linting Configuration"
echo "==============================================="
echo "STEP 1: Verify Current Linting Configuration" >> "$investigation_log"
echo "===============================================" >> "$investigation_log"

echo "📁 Analyzing ESLint and TypeScript configuration..."

# Check ESLint configuration
if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ]; then
  echo "   ✅ ESLint configuration exists" >> "$investigation_log"
  
  # Check for any type rules
  any_rules=$(find . -name ".eslintrc*" -o -name "eslint.config.*" -exec grep -c "@typescript-eslint/no-explicit-any\|no-explicit-any" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
  echo "   ESLint any type rules: $any_rules configurations" >> "$investigation_log"
  
else
  echo "   ❌ ESLint configuration not found" >> "$investigation_log"
fi

# Check TypeScript configuration
if [ -f "tsconfig.json" ]; then
  echo "   ✅ TypeScript configuration exists" >> "$investigation_log"
  
  # Check strict mode and any related settings
  strict_mode=$(grep -c "\"strict\".*true\|\"noImplicitAny\".*true" tsconfig.json 2>/dev/null || echo "0")
  echo "   TypeScript strict mode settings: $strict_mode configurations" >> "$investigation_log"
  
else
  echo "   ❌ TypeScript configuration not found" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 2: Run Local Linting to Identify Exact Errors"
echo "===================================================="
echo "STEP 2: Run Local Linting to Identify Exact Errors" >> "$investigation_log"
echo "====================================================" >> "$investigation_log"

echo "📁 Running local linting commands to reproduce GitHub Actions errors..."

# Run ESLint if available
if command -v npx >/dev/null 2>&1; then
  echo "   ✅ npm/npx available for linting" >> "$investigation_log"
  
  # Try to run ESLint
  echo "   Running ESLint analysis..." >> "$investigation_log"
  if npx eslint . --ext .ts,.tsx --format compact 2>&1 | head -20 >> "$investigation_log"; then
    eslint_exit_code=0
  else
    eslint_exit_code=$?
  fi
  echo "   ESLint exit code: $eslint_exit_code" >> "$investigation_log"
  
  # Try to run TypeScript check
  echo "   Running TypeScript check..." >> "$investigation_log"
  if npx tsc --noEmit --skipLibCheck 2>&1 | head -10 >> "$investigation_log"; then
    tsc_exit_code=0
  else
    tsc_exit_code=$?
  fi
  echo "   TypeScript check exit code: $tsc_exit_code" >> "$investigation_log"
  
else
  echo "   ❌ npm/npx not available" >> "$investigation_log"
  eslint_exit_code=1
  tsc_exit_code=1
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 3: Analyze Specific File Patterns"
echo "========================================="
echo "STEP 3: Analyze Specific File Patterns" >> "$investigation_log"
echo "=======================================" >> "$investigation_log"

echo "📁 Searching for remaining 'any' type usage patterns..."

# Search for remaining any types
any_usage=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -n ":\s*any\|<any>\|any\[\]" 2>/dev/null | wc -l)
echo "   Remaining 'any' type usage: $any_usage occurrences" >> "$investigation_log"

if [ "$any_usage" -gt 0 ]; then
  echo "   Specific any type locations:" >> "$investigation_log"
  find src -name "*.ts" -o -name "*.tsx" | xargs grep -n ":\s*any\|<any>\|any\[\]" 2>/dev/null | head -10 | sed 's/^/     /' >> "$investigation_log"
fi

# Search for unused imports/variables
unused_imports=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "import.*{.*}" 2>/dev/null | wc -l)
echo "   Files with import statements: $unused_imports files" >> "$investigation_log"

# Search for React Hook issues
hook_issues=$(find src -name "*.tsx" | xargs grep -l "useEffect\|useCallback\|useMemo" 2>/dev/null | wc -l)
echo "   Files with React Hooks: $hook_issues files" >> "$investigation_log"

echo "" >> "$investigation_log"

echo "🔍 STEP 4: Check GitHub Actions Workflow Configuration"
echo "====================================================="
echo "STEP 4: Check GitHub Actions Workflow Configuration" >> "$investigation_log"
echo "=====================================================" >> "$investigation_log"

echo "📁 Analyzing GitHub Actions workflow quality gate setup..."

# Check workflow files
workflow_files=$(find .github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null | wc -l)
echo "   GitHub Actions workflow files: $workflow_files files" >> "$investigation_log"

if [ "$workflow_files" -gt 0 ]; then
  echo "   Workflow files found:" >> "$investigation_log"
  find .github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null | sed 's/^/     - /' >> "$investigation_log"
  
  # Check for linting steps in workflows
  linting_steps=$(find .github/workflows -name "*.yml" -o -name "*.yaml" -exec grep -c "eslint\|lint\|tsc\|typecheck" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
  echo "   Linting/TypeScript steps in workflows: $linting_steps steps" >> "$investigation_log"
  
else
  echo "   ❌ No GitHub Actions workflow files found" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "🔍 STEP 5: Compare Local vs CI Environment"
echo "=========================================="
echo "STEP 5: Compare Local vs CI Environment" >> "$investigation_log"
echo "==========================================" >> "$investigation_log"

echo "📁 Analyzing potential differences between local and CI environments..."

# Check package.json for linting scripts
if [ -f "package.json" ]; then
  echo "   ✅ package.json exists" >> "$investigation_log"
  
  lint_scripts=$(grep -c "\"lint\"\|\"typecheck\"\|\"eslint\"" package.json 2>/dev/null || echo "0")
  echo "   Linting scripts in package.json: $lint_scripts scripts" >> "$investigation_log"
  
  # Show actual linting scripts
  echo "   Configured linting commands:" >> "$investigation_log"
  grep -A1 -B1 "\"lint\"\|\"typecheck\"" package.json 2>/dev/null | sed 's/^/     /' >> "$investigation_log" || echo "     No linting scripts found" >> "$investigation_log"
  
else
  echo "   ❌ package.json not found" >> "$investigation_log"
fi

# Check for different Node/npm versions
if command -v node >/dev/null 2>&1; then
  node_version=$(node --version)
  npm_version=$(npm --version)
  echo "   Local Node version: $node_version" >> "$investigation_log"
  echo "   Local npm version: $npm_version" >> "$investigation_log"
else
  echo "   ❌ Node.js not available locally" >> "$investigation_log"
fi

echo "" >> "$investigation_log"

echo "📊 HYPOTHESIS GENERATION"
echo "========================"
echo "HYPOTHESIS GENERATION" >> "$investigation_log"
echo "====================" >> "$investigation_log"

# Generate hypotheses based on findings
hypotheses=()

if [ "$any_usage" -gt 0 ]; then
  echo "🔬 HYPOTHESIS A: Incomplete Any Type Removal" >> "$investigation_log"
  echo "   Evidence: $any_usage remaining any type usages detected in codebase" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypotheses+=("incomplete-any-removal")
fi

if [ "$eslint_exit_code" -ne 0 ]; then
  echo "🔬 HYPOTHESIS B: Local ESLint Configuration Mismatch with CI" >> "$investigation_log"
  echo "   Evidence: Local ESLint run failed with exit code $eslint_exit_code" >> "$investigation_log"
  echo "   Probability: HIGH" >> "$investigation_log"
  hypotheses+=("eslint-config-mismatch")
fi

if [ "$tsc_exit_code" -ne 0 ]; then
  echo "🔬 HYPOTHESIS C: TypeScript Compilation Issues Not Caught Locally" >> "$investigation_log"
  echo "   Evidence: Local TypeScript check failed with exit code $tsc_exit_code" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("typescript-issues")
fi

if [ "$linting_steps" -gt 0 ] && [ "$lint_scripts" -eq 0 ]; then
  echo "🔬 HYPOTHESIS D: Missing Package.json Linting Scripts" >> "$investigation_log"
  echo "   Evidence: GitHub Actions expects linting but package.json lacks scripts" >> "$investigation_log"
  echo "   Probability: MEDIUM" >> "$investigation_log"
  hypotheses+=("missing-scripts")
fi

if [ ${#hypotheses[@]} -eq 0 ]; then
  echo "❌ HYPOTHESIS NONE: No clear quality gate failure patterns detected" >> "$investigation_log"
  echo "   Evidence: Local environment appears configured correctly" >> "$investigation_log"
  hypotheses+=("none")
fi

echo "" >> "$investigation_log"
echo "🎯 RECOMMENDED NEXT STEPS" >> "$investigation_log"
echo "========================" >> "$investigation_log"

if [[ " ${hypotheses[@]} " =~ " incomplete-any-removal " ]]; then
  echo "1. Systematically identify and fix all remaining 'any' type usages" >> "$investigation_log"
  echo "2. Run comprehensive search for any patterns: ': any', '<any>', 'any[]'" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " eslint-config-mismatch " ]]; then
  echo "3. Compare local ESLint configuration with GitHub Actions environment" >> "$investigation_log"
  echo "4. Ensure consistent linting rules between local and CI environments" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " typescript-issues " ]]; then
  echo "5. Run comprehensive TypeScript check with same flags as CI" >> "$investigation_log"
  echo "6. Fix any TypeScript compilation errors not caught locally" >> "$investigation_log"
fi

if [[ " ${hypotheses[@]} " =~ " missing-scripts " ]]; then
  echo "7. Add proper linting scripts to package.json matching CI expectations" >> "$investigation_log"
  echo "8. Ensure GitHub Actions uses correct npm script commands" >> "$investigation_log"
fi

echo ""
echo "📊 Investigation complete. Results logged to: $investigation_log"
echo "🎯 Primary hypotheses: ${hypotheses[*]}"
echo "🔧 Next step: Create verification testing script to validate hypotheses"