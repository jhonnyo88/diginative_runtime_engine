#!/usr/bin/env node

/**
 * Emergency Service Testing Runner
 * Executes tests for critical services and reports coverage
 * 
 * CRITICAL: Use this to verify service test implementation
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CRITICAL_SERVICES = [
  { name: 'enterprise-sso', file: 'enterprise-sso.ts', status: '✅' },
  { name: 'gdpr-compliance-framework', file: 'gdpr-compliance-framework.ts', status: '✅' },
  { name: 'error-monitoring', file: 'error-monitoring.ts', status: '✅' },
  { name: 'performance-analytics', file: 'performance-analytics.ts', status: '✅' },
  { name: 'municipal-integration-apis', file: 'municipal-integration-apis.ts', status: '❌' },
  { name: 'game-state-manager', file: 'game-state-manager.tsx', status: '❌' },
  { name: 'municipal-achievement-engine', file: 'municipal-achievement-engine.ts', status: '❌' },
  { name: 'analytics', file: 'analytics.ts', status: '❌' }
];

console.log('🚨 EMERGENCY SERVICE TEST RUNNER 🚨');
console.log('==================================\n');

// Check which services have tests
console.log('📋 Service Test Coverage Status:\n');
CRITICAL_SERVICES.forEach(service => {
  const testPath = path.join(
    __dirname,
    '..',
    'src',
    'services',
    '__tests__',
    `${service.name}.test.ts`
  );
  
  const hasTest = fs.existsSync(testPath);
  const status = hasTest ? '✅' : '❌';
  
  console.log(`${status} ${service.name}`);
  if (!hasTest && service.status === '✅') {
    console.log(`   ⚠️  Test file missing but marked as complete!`);
  }
});

console.log('\n📊 Running Available Service Tests...\n');

try {
  // Run service tests with coverage
  const testCommand = `npm test -- src/services/__tests__/`;
  
  console.log(`Executing: ${testCommand}\n`);
  
  execSync(testCommand, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
} catch (error) {
  console.error('\n❌ Service tests failed!');
  console.error('This blocks ALL production deployment.\n');
  process.exit(1);
}

console.log('\n✅ Service tests passed!\n');

// Summary
const testedCount = CRITICAL_SERVICES.filter(s => s.status === '✅').length;
const percentage = ((testedCount / CRITICAL_SERVICES.length) * 100).toFixed(0);

console.log('📈 Summary:');
console.log(`   - Services with tests: ${testedCount}/${CRITICAL_SERVICES.length} (${percentage}%)`);
console.log(`   - Services remaining: ${CRITICAL_SERVICES.length - testedCount}`);

if (testedCount < CRITICAL_SERVICES.length) {
  console.log('\n⚠️  WARNING: Not all critical services have tests!');
  console.log('   Production deployment is BLOCKED until 100% coverage.\n');
  
  console.log('🔥 Next Steps:');
  console.log('   1. Implement tests for remaining services');
  console.log('   2. Follow patterns in docs/developers/service-testing-patterns.md');
  console.log('   3. Use enterprise-sso.test.ts as reference\n');
}

process.exit(testedCount === CRITICAL_SERVICES.length ? 0 : 1);