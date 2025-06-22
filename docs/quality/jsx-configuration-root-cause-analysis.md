# JSX Configuration Root Cause Analysis

## Problem Statement
After resolving test file syntax corruption, TypeScript compilation now fails with JSX-specific errors:
- `error TS6142: Module '...' was resolved to '...', but '--jsx' is not set`
- `error TS17004: Cannot use JSX unless the '--jsx' flag is provided`

## Root Cause Investigation

### Observed Symptoms
1. **Test Files with JSX**: All `.test.tsx` files fail compilation
2. **Missing JSX Flag**: TypeScript compiler indicates `--jsx` flag is not set
3. **Selective Impact**: Only affects test files, not main application files

### Hypothesis Formation

**Primary Hypothesis**: TypeScript configuration mismatch between production and test compilation contexts.

**Supporting Evidence**:
1. Main application builds successfully (JSX works in src/ files)
2. Test files specifically fail with JSX configuration errors
3. Vitest has separate JSX handling from main TypeScript compilation

### Configuration Analysis Required

1. **Current tsconfig.app.json**: Check JSX settings for production
2. **Vitest Configuration**: Verify JSX handling in test environment  
3. **TypeScript Project References**: Analyze how test files are compiled

## Verification Test Plan

### Test 1: TypeScript Configuration Validation
**Objective**: Confirm JSX settings in current configurations
**Method**: Examine tsconfig files for JSX configuration
**Expected Result**: Identify missing or incorrect JSX configuration for test files

### Test 2: Direct TypeScript Compilation Test
**Objective**: Isolate TypeScript JSX compilation behavior
**Method**: Compile single test file with explicit JSX flags
**Expected Result**: Determine exact flags needed for test file compilation

### Test 3: Vitest vs TypeScript Configuration Alignment
**Objective**: Verify Vitest JSX handling matches TypeScript expectations
**Method**: Compare Vitest config JSX settings with TypeScript requirements
**Expected Result**: Identify configuration misalignment

## Potential Solutions to Test

### Solution A: TypeScript Configuration Update
- Add explicit JSX configuration to test file compilation
- Update tsconfig to include proper JSX settings for test files

### Solution B: Vitest Configuration Alignment  
- Ensure Vitest ESBuild JSX settings match TypeScript expectations
- Align test compilation with production JSX configuration

### Solution C: TypeScript Project Structure Fix
- Create dedicated tsconfig for test files with proper JSX settings
- Establish proper project references for test compilation

## Success Criteria

1. All test files compile without JSX-related errors
2. No regression in main application compilation
3. Vitest test execution works correctly
4. Production build remains functional

## Next Steps

1. Execute verification tests to confirm root cause
2. Validate chosen solution with isolated testing
3. Implement fix with full regression testing
4. Document solution for future reference

---
*Analysis Date: 2025-01-22*
*Status: Root Cause Investigation - Ready for Verification Testing*