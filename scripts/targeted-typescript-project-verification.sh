#!/bin/bash

# Targeted TypeScript Project Structure Verification
# Testing revised hypothesis about TypeScript compilation context mismatch

set -e

echo "🎯 Targeted TypeScript Project Structure Verification"
echo "===================================================="

# Create verification log
verification_log="docs/quality/targeted-typescript-verification.log"
mkdir -p "$(dirname "$verification_log")"

echo "Targeted TypeScript Project Structure Verification - $(date)" > "$verification_log"
echo "==========================================================" >> "$verification_log"
echo "" >> "$verification_log"

echo "🔬 REVISED HYPOTHESIS TESTING"
echo "============================="
echo "Hypothesis: TypeScript compilation context mismatch causes JSX errors" >> "$verification_log"
echo "- Project build should work correctly" >> "$verification_log"
echo "- Individual file compilation fails due to missing context" >> "$verification_log"
echo "- Vitest needs separate ESBuild JSX configuration" >> "$verification_log"
echo "" >> "$verification_log"

echo "📋 TEST A: Project Build Verification"
echo "====================================="
echo "TEST A: Project Build Verification" >> "$verification_log"
echo "-----------------------------------" >> "$verification_log"

echo "🔍 Testing npm run build (project build process)..."

# Test the actual build process
echo "   Executing: npm run build..." >> "$verification_log"

if timeout 300 npm run build 2>/dev/null; then
    echo "✅ npm run build SUCCEEDS - Hypothesis partially confirmed!"
    echo "✅ npm run build: SUCCESS" >> "$verification_log"
    echo "   This confirms TypeScript project configuration is correct" >> "$verification_log"
    project_build_works=true
else
    echo "❌ npm run build FAILS - Need to investigate project build issues"
    echo "❌ npm run build: FAILED" >> "$verification_log"
    
    # Capture build errors for analysis
    echo "   Build error details:" >> "$verification_log"
    timeout 60 npm run build 2>&1 | head -20 | sed 's/^/   /' >> "$verification_log"
    project_build_works=false
fi

echo "" >> "$verification_log"

echo "📋 TEST B: TypeScript Project vs Individual Compilation"  
echo "======================================================="
echo "TEST B: TypeScript Project vs Individual Compilation" >> "$verification_log"
echo "-----------------------------------------------------" >> "$verification_log"

echo "🔍 Comparing tsc -b vs npx tsc individual file..."

# Test B1: Project build compilation
echo "   Test B1: Project build compilation (tsc -b)..." >> "$verification_log"
if timeout 120 npx tsc -b 2>/dev/null; then
    echo "✅ tsc -b (project build) SUCCEEDS"
    echo "✅ tsc -b: SUCCESS" >> "$verification_log"
    project_tsc_works=true
else
    echo "❌ tsc -b (project build) FAILS"
    echo "❌ tsc -b: FAILED" >> "$verification_log"
    
    # Capture specific errors
    echo "   tsc -b error details:" >> "$verification_log"
    timeout 60 npx tsc -b 2>&1 | head -10 | sed 's/^/   /' >> "$verification_log"
    project_tsc_works=false
fi

# Test B2: Individual file compilation (already tested, but confirm)
test_file="src/tests/components/accessibility/AchievementAccessibility.test.tsx"
echo "   Test B2: Individual file compilation..." >> "$verification_log"

if npx tsc --noEmit --project tsconfig.app.json "$test_file" 2>/dev/null; then
    echo "✅ Individual file compilation with --project SUCCEEDS"
    echo "✅ Individual file with --project: SUCCESS" >> "$verification_log"
    individual_with_project_works=true
else
    echo "❌ Individual file compilation with --project FAILS"
    echo "❌ Individual file with --project: FAILED" >> "$verification_log"
    individual_with_project_works=false
fi

echo "" >> "$verification_log"

echo "📋 TEST C: Vitest ESBuild Configuration Test"
echo "==========================================="
echo "TEST C: Vitest ESBuild Configuration Test" >> "$verification_log"
echo "------------------------------------------" >> "$verification_log"

echo "🔍 Testing Vitest with enhanced ESBuild JSX configuration..."

# Create temporary vitest config with ESBuild JSX settings
temp_vitest_config="vitest.config.temp.ts"
cat > "$temp_vitest_config" << 'EOF'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
  esbuild: {
    jsx: 'automatic',
    loader: 'tsx',
  },
})
EOF

echo "   Created temporary Vitest config with ESBuild JSX settings" >> "$verification_log"
echo "   Testing single test file with enhanced config..." >> "$verification_log"

# Test with enhanced vitest configuration
if timeout 120 npx vitest run src/tests/components/accessibility/AchievementAccessibility.test.tsx --config="$temp_vitest_config" 2>/dev/null; then
    echo "✅ Vitest with ESBuild JSX config SUCCEEDS"
    echo "✅ Vitest with ESBuild JSX: SUCCESS" >> "$verification_log"
    vitest_esbuild_works=true
else
    echo "❌ Vitest with ESBuild JSX config FAILS"
    echo "❌ Vitest with ESBuild JSX: FAILED" >> "$verification_log"
    
    # Capture vitest errors
    echo "   Vitest error details:" >> "$verification_log"
    timeout 60 npx vitest run src/tests/components/accessibility/AchievementAccessibility.test.tsx --config="$temp_vitest_config" 2>&1 | head -10 | sed 's/^/   /' >> "$verification_log"
    vitest_esbuild_works=false
fi

# Clean up temporary config
rm -f "$temp_vitest_config"

echo "" >> "$verification_log"

echo "📋 TEST D: Vite Build Configuration Verification"
echo "=============================================="
echo "TEST D: Vite Build Configuration Verification" >> "$verification_log"
echo "----------------------------------------------" >> "$verification_log"

echo "🔍 Testing isolated Vite build (without TypeScript compilation)..."

# Test Vite build only (skip TypeScript)
echo "   Testing: vite build --mode production..." >> "$verification_log"

if timeout 120 npx vite build --mode production 2>/dev/null; then
    echo "✅ Vite build (without tsc) SUCCEEDS"
    echo "✅ Vite build only: SUCCESS" >> "$verification_log"
    vite_build_works=true
else
    echo "❌ Vite build (without tsc) FAILS"
    echo "❌ Vite build only: FAILED" >> "$verification_log"
    
    # Capture vite build errors
    echo "   Vite build error details:" >> "$verification_log"
    timeout 60 npx vite build --mode production 2>&1 | head -10 | sed 's/^/   /' >> "$verification_log"
    vite_build_works=false
fi

echo "" >> "$verification_log"

echo "📊 COMPREHENSIVE ANALYSIS"
echo "========================="
echo "COMPREHENSIVE ANALYSIS" >> "$verification_log"
echo "======================" >> "$verification_log"

echo "" >> "$verification_log"
echo "Test Results Summary:" >> "$verification_log"
echo "- npm run build: $([ "$project_build_works" = true ] && echo "✅ SUCCESS" || echo "❌ FAILED")" >> "$verification_log"
echo "- tsc -b (project): $([ "$project_tsc_works" = true ] && echo "✅ SUCCESS" || echo "❌ FAILED")" >> "$verification_log"
echo "- Individual with --project: $([ "$individual_with_project_works" = true ] && echo "✅ SUCCESS" || echo "❌ FAILED")" >> "$verification_log"
echo "- Vitest with ESBuild JSX: $([ "$vitest_esbuild_works" = true ] && echo "✅ SUCCESS" || echo "❌ FAILED")" >> "$verification_log"
echo "- Vite build only: $([ "$vite_build_works" = true ] && echo "✅ SUCCESS" || echo "❌ FAILED")" >> "$verification_log"

echo ""
echo "🎯 HYPOTHESIS VALIDATION:"

# Analyze results to confirm/reject revised hypothesis
if [ "$project_build_works" = true ] && [ "$project_tsc_works" = true ]; then
    echo "✅ REVISED HYPOTHESIS CONFIRMED: Project configuration is correct"
    echo "✅ REVISED HYPOTHESIS: CONFIRMED" >> "$verification_log"
    echo "   Root Cause: Individual file compilation vs project build mismatch" >> "$verification_log"
    hypothesis_status="confirmed"
    
    if [ "$vitest_esbuild_works" = true ]; then
        echo "✅ VITEST SOLUTION VALIDATED: ESBuild JSX configuration fixes test execution"
        echo "✅ VITEST SOLUTION: VALIDATED" >> "$verification_log"
        vitest_solution_works=true
    else
        echo "⚠️  VITEST SOLUTION NEEDS REFINEMENT"
        echo "⚠️  VITEST SOLUTION: NEEDS_REFINEMENT" >> "$verification_log"
        vitest_solution_works=false
    fi
    
elif [ "$vite_build_works" = true ]; then
    echo "⚠️  PARTIAL HYPOTHESIS CONFIRMATION: Vite works, TypeScript needs fixes"
    echo "⚠️  HYPOTHESIS: PARTIAL" >> "$verification_log"
    echo "   Root Cause: TypeScript configuration issues, but Vite build process is functional" >> "$verification_log"
    hypothesis_status="partial"
else
    echo "❌ REVISED HYPOTHESIS REJECTED: Deeper build process issues"
    echo "❌ HYPOTHESIS: REJECTED" >> "$verification_log"
    echo "   Further investigation required" >> "$verification_log"
    hypothesis_status="rejected"
fi

echo "" >> "$verification_log"
echo "RECOMMENDED SOLUTION STRATEGY:" >> "$verification_log"

if [ "$hypothesis_status" = "confirmed" ]; then
    echo "1. Update Vitest configuration with proper ESBuild JSX settings" >> "$verification_log"
    echo "2. Ensure production build process continues working correctly" >> "$verification_log"
    echo "3. Fix individual file compilation context for development tools" >> "$verification_log"
    solution_confidence="high"
elif [ "$hypothesis_status" = "partial" ]; then
    echo "1. Focus on Vite build process optimization" >> "$verification_log"
    echo "2. Resolve TypeScript compilation issues separately" >> "$verification_log"
    echo "3. Consider split build strategy (Vite for production, TypeScript for validation)" >> "$verification_log"
    solution_confidence="medium"
else
    echo "1. Conduct comprehensive build process analysis" >> "$verification_log"
    echo "2. Review project structure and configuration alignment" >> "$verification_log"
    echo "3. Consider alternative build strategies" >> "$verification_log"
    solution_confidence="low"
fi

echo ""
echo "📊 Verification complete. Results logged to: $verification_log"
echo "🎯 Solution confidence: $solution_confidence"

if [ "$solution_confidence" = "high" ]; then
    echo "✅ Ready to implement validated solution with 100% confidence"
    exit 0
elif [ "$solution_confidence" = "medium" ]; then
    echo "⚠️  Ready to implement partial solution with monitoring"
    exit 1
else
    echo "❌ Additional investigation required before implementation"
    exit 2
fi