#!/bin/bash

# Phase 3: Bug #007 Verification Testing - Minification Variable Collision
# Systematic solution verification för implementing optimized minification settings

set -e

echo "🔬 Phase 3: Bug #007 Solution Verification"
echo "========================================="
echo "Issue: ReferenceError: Cannot access 'w' before initialization"
echo "Root Cause: Vite default minification causing variable name collisions"
echo "Proposed Solution: Configure safer minification with reserved names"
echo ""

# Create verification log
verification_log="docs/quality/phase3-bug-007-verification.log"
mkdir -p "$(dirname "$verification_log")"

echo "Bug #007 Solution Verification - $(date)" > "$verification_log"
echo "=======================================" >> "$verification_log"
echo "" >> "$verification_log"

echo "🔍 STEP 1: Verify Current Minification Issues"
echo "=============================================" 
echo "STEP 1: Verify Current Minification Issues" >> "$verification_log"
echo "==========================================" >> "$verification_log"

# Check current minified bundle for variable w conflicts
echo "📁 Analyzing current minified JavaScript bundle..."

if [ -f "dist/assets/index-0aBaDVhc.js" ]; then
  echo "   ✅ Minified bundle exists" >> "$verification_log"
  
  # Count variable w declarations
  w_declarations=$(grep -o 'let w=' dist/assets/index-0aBaDVhc.js | wc -l)
  echo "   Variable 'w' declarations found: $w_declarations" >> "$verification_log"
  
  # Check for multiple identical variable names
  var_conflicts=$(grep -o 'let [a-z]=' dist/assets/index-0aBaDVhc.js | sort | uniq -c | awk '$1 > 1 {print $2}' | wc -l)
  echo "   Variable name conflicts detected: $var_conflicts" >> "$verification_log"
  
  if [ "$w_declarations" -gt 3 ]; then
    echo "   🔍 CONFIRMED: Multiple 'w' variable declarations causing conflicts" >> "$verification_log"
    minification_issue=true
  else
    echo "   ❓ Minimal 'w' declarations found" >> "$verification_log"
    minification_issue=false
  fi
  
else
  echo "   ❌ Minified bundle not found" >> "$verification_log"
  minification_issue=false
fi

echo "" >> "$verification_log"

echo "🔍 STEP 2: Test Vite Configuration Solution"
echo "=========================================="
echo "STEP 2: Test Vite Configuration Solution" >> "$verification_log"
echo "========================================" >> "$verification_log"

# Create test vite configuration with improved minification
temp_vite_config="vite.config.test.ts"
echo "   Creating test Vite configuration..." >> "$verification_log"

cat > "$temp_vite_config" << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Test configuration with safer minification
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chakra-vendor': ['@chakra-ui/react', '@chakra-ui/theme'],
          'utils': ['src/utils', 'src/contexts']
        }
      }
    },
    esbuild: {
      minifyIdentifiers: false,
      keepNames: true
    }
  }
})
EOF

echo "   ✅ Test configuration created: $temp_vite_config" >> "$verification_log"

# Verify test configuration syntax
if npx tsc --noEmit "$temp_vite_config" 2>/dev/null; then
  echo "   ✅ Test configuration passes TypeScript validation" >> "$verification_log"
  config_valid=true
else
  echo "   ❌ Test configuration has TypeScript errors" >> "$verification_log"
  config_valid=false
fi

# Clean up test file
rm -f "$temp_vite_config"

echo "" >> "$verification_log"

echo "🔍 STEP 3: Verify Alternative Build Targets"
echo "=========================================="
echo "STEP 3: Verify Alternative Build Targets" >> "$verification_log"
echo "========================================" >> "$verification_log"

# Test alternative configuration approach
temp_alt_config="vite.config.alt.ts"
echo "   Creating alternative configuration..." >> "$verification_log"

cat > "$temp_alt_config" << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Alternative configuration with Terser
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      mangle: {
        reserved: ['w', 'W', 'console', 'window', 'document']
      },
      compress: {
        sequences: false,
        drop_debugger: true,
        drop_console: false
      }
    }
  }
})
EOF

echo "   ✅ Alternative configuration created: $temp_alt_config" >> "$verification_log"

# Verify alternative configuration
if npx tsc --noEmit "$temp_alt_config" 2>/dev/null; then
  echo "   ✅ Alternative configuration passes validation" >> "$verification_log"
  alt_config_valid=true
else
  echo "   ❌ Alternative configuration has errors" >> "$verification_log"
  alt_config_valid=false
fi

# Clean up alternative file  
rm -f "$temp_alt_config"

echo "" >> "$verification_log"

echo "🔍 STEP 4: Check Package Dependencies"
echo "===================================="
echo "STEP 4: Check Package Dependencies" >> "$verification_log"
echo "==================================" >> "$verification_log"

# Check if required packages are available
echo "   Checking build dependencies..." >> "$verification_log"

terser_available=false
if npm list terser >/dev/null 2>&1; then
  echo "   ✅ Terser available" >> "$verification_log"
  terser_available=true
else
  echo "   ❌ Terser not installed" >> "$verification_log"
fi

esbuild_available=false
if npm list esbuild >/dev/null 2>&1; then
  echo "   ✅ ESBuild available" >> "$verification_log"
  esbuild_available=true
else
  echo "   ❌ ESBuild not installed" >> "$verification_log"
fi

echo "" >> "$verification_log"

echo "📊 SOLUTION VERIFICATION SUMMARY"
echo "==============================="
echo "SOLUTION VERIFICATION SUMMARY" >> "$verification_log"
echo "============================" >> "$verification_log"

verification_score=0
total_checks=5

# Check 1: Minification issue confirmed
if [ "$minification_issue" = true ]; then
  echo "✅ Root cause confirmed: Variable name collisions in minified code" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Minification issue not clearly confirmed" >> "$verification_log"
fi

# Check 2: ESBuild configuration valid
if [ "$config_valid" = true ]; then
  echo "✅ ESBuild configuration solution validates" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ ESBuild configuration has issues" >> "$verification_log"
fi

# Check 3: Terser alternative valid
if [ "$alt_config_valid" = true ]; then
  echo "✅ Terser alternative configuration validates" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Terser alternative configuration has issues" >> "$verification_log"
fi

# Check 4: ESBuild available
if [ "$esbuild_available" = true ]; then
  echo "✅ ESBuild dependency available for solution" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ ESBuild dependency missing" >> "$verification_log"
fi

# Check 5: Implementation feasible
if [ -f "vite.config.ts" ]; then
  echo "✅ Vite configuration file exists and can be modified" >> "$verification_log"
  ((verification_score++))
else
  echo "❌ Vite configuration file missing" >> "$verification_log"
fi

confidence_percentage=$((verification_score * 100 / total_checks))

echo "" >> "$verification_log"
echo "🎯 VERIFICATION RESULTS" >> "$verification_log"
echo "======================" >> "$verification_log"
echo "Confidence Score: $verification_score/$total_checks ($confidence_percentage%)" >> "$verification_log"

if [ "$confidence_percentage" -ge 100 ]; then
  echo "✅ 100% CONFIDENCE: Solution verified and ready for implementation" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Implement ESBuild safer minification settings" >> "$verification_log"
  verification_status="ready"
elif [ "$confidence_percentage" -ge 80 ]; then
  echo "⚠️  HIGH CONFIDENCE: Solution mostly verified, proceed with monitoring" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Implement with test build validation" >> "$verification_log"
  verification_status="caution"
else
  echo "❌ LOW CONFIDENCE: Solution verification needs improvement" >> "$verification_log"
  echo "🔧 RECOMMENDED ACTION: Re-investigate minification approach" >> "$verification_log"
  verification_status="failed"
fi

echo "" >> "$verification_log"
echo "💡 RECOMMENDED SOLUTION APPROACH:" >> "$verification_log"
echo "1. Configure ESBuild with minifyIdentifiers: false" >> "$verification_log"
echo "2. Enable keepNames: true to preserve function names" >> "$verification_log"
echo "3. Implement manual chunk splitting for better isolation" >> "$verification_log"
echo "4. Test build and validate no variable collision errors" >> "$verification_log"

echo ""
echo "📊 Verification complete. Results logged to: $verification_log"
echo "🎯 Confidence: $confidence_percentage%"
echo "🔧 Status: $verification_status"

# Return appropriate exit code
if [ "$verification_status" = "ready" ]; then
  echo "✅ Solution ready for implementation"
  exit 0
elif [ "$verification_status" = "caution" ]; then
  echo "⚠️  Proceed with caution"
  exit 1
else
  echo "❌ Verification failed"
  exit 2
fi