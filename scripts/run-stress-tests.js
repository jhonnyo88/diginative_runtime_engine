#!/usr/bin/env node

/**
 * DevTeam Pipeline Stress Testing Runner
 * CRITICAL: Validates <30s processing promise for Q1 completion
 * 
 * Roadmap Ref: Q1-AO-Milestone-1.2 (COMPLETION BLOCKER)
 * Business Impact: Final validation before declaring Q1 complete
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting DevTeam Pipeline Stress Testing Suite');
console.log('📋 CRITICAL: Q1 Completion Validation');
console.log('⏱️  Target: <30s processing under 1000+ concurrent submissions\n');

const stressTestResults = {
  startTime: new Date().toISOString(),
  tests: [],
  summary: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    performanceBaseline: {},
    q1CompletionStatus: 'PENDING'
  }
};

function runStressTest(testName, testFile, timeout = 300000) {
  console.log(`\n🔥 Running Stress Test: ${testName}`);
  console.log(`📁 File: ${testFile}`);
  console.log(`⏰ Timeout: ${timeout / 1000}s`);
  
  const startTime = Date.now();
  
  try {
    const output = execSync(`npm test -- ${testFile} --verbose --testTimeout=${timeout}`, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: timeout + 10000 // Add buffer to npm timeout
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const testResult = {
      name: testName,
      file: testFile,
      status: 'PASSED',
      duration,
      output: output.substring(0, 1000), // Truncate for storage
      timestamp: new Date().toISOString()
    };
    
    stressTestResults.tests.push(testResult);
    stressTestResults.summary.passedTests++;
    
    console.log(`✅ ${testName} PASSED in ${duration}ms`);
    
    // Extract performance metrics from output
    extractPerformanceMetrics(testName, output);
    
    return true;
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const testResult = {
      name: testName,
      file: testFile,
      status: 'FAILED',
      duration,
      error: error.message.substring(0, 500),
      timestamp: new Date().toISOString()
    };
    
    stressTestResults.tests.push(testResult);
    stressTestResults.summary.failedTests++;
    
    console.log(`❌ ${testName} FAILED in ${duration}ms`);
    console.log(`💥 Error: ${error.message.substring(0, 200)}...`);
    
    return false;
  }
}

function extractPerformanceMetrics(testName, output) {
  try {
    // Extract baseline metrics from test output
    const baselineMatch = output.match(/Q2 Performance Baseline Established: ({.*?})/);
    if (baselineMatch) {
      const baseline = JSON.parse(baselineMatch[1]);
      stressTestResults.summary.performanceBaseline[testName] = baseline;
      
      console.log(`📊 Performance Baseline for ${testName}:`);
      console.log(`   📈 Success Rate: ${(baseline.successRate * 100).toFixed(2)}%`);
      console.log(`   ⚡ Average Processing: ${baseline.averageProcessingTime?.toFixed(2)}ms`);
      console.log(`   🎯 95th Percentile: ${baseline.p95ProcessingTime?.toFixed(2)}ms`);
      console.log(`   🚀 Throughput: ${baseline.throughput?.toFixed(2)} req/s`);
    }
    
    // Extract sustained load metrics
    const sustainedMatch = output.match(/Sustained Load Test: (\d+) submissions over (\d+)ms/);
    if (sustainedMatch) {
      const submissions = parseInt(sustainedMatch[1]);
      const duration = parseInt(sustainedMatch[2]);
      
      console.log(`🔄 Sustained Load: ${submissions} submissions over ${duration}ms`);
    }
    
    // Extract rate limiting metrics
    const rateLimitMatch = output.match(/Rate Limiting Stress: (\d+) requests in (\d+)ms/);
    if (rateLimitMatch) {
      const requests = parseInt(rateLimitMatch[1]);
      const duration = parseInt(rateLimitMatch[2]);
      
      console.log(`🛡️  Rate Limiting: ${requests} requests processed in ${duration}ms`);
    }
    
  } catch (error) {
    console.log(`⚠️  Could not extract performance metrics: ${error.message}`);
  }
}

function validateQ1Completion() {
  console.log('\n🏁 Q1 Completion Validation');
  
  const criticalRequirements = [
    {
      name: 'DevTeam Pipeline <30s Processing',
      check: () => {
        const pipelineBaseline = stressTestResults.summary.performanceBaseline['DevTeam Pipeline Core Performance'];
        return pipelineBaseline && pipelineBaseline.averageProcessingTime < 30000;
      }
    },
    {
      name: '>95% Success Rate Under Load',
      check: () => {
        const pipelineBaseline = stressTestResults.summary.performanceBaseline['DevTeam Pipeline Core Performance'];
        return pipelineBaseline && pipelineBaseline.successRate > 0.95;
      }
    },
    {
      name: 'Rate Limiting Functional Under Stress',
      check: () => {
        return stressTestResults.tests.some(test => 
          test.name.includes('Rate Limiting') && test.status === 'PASSED'
        );
      }
    },
    {
      name: 'Redis Cluster Stable Under Load',
      check: () => {
        return stressTestResults.tests.some(test => 
          test.name.includes('Redis') && test.status === 'PASSED'
        );
      }
    },
    {
      name: 'Infrastructure Monitoring Active',
      check: () => {
        return stressTestResults.tests.some(test => 
          test.name.includes('Infrastructure') && test.status === 'PASSED'
        );
      }
    }
  ];
  
  const passedRequirements = criticalRequirements.filter(req => {
    const passed = req.check();
    console.log(`${passed ? '✅' : '❌'} ${req.name}`);
    return passed;
  });
  
  const allRequirementsMet = passedRequirements.length === criticalRequirements.length;
  
  if (allRequirementsMet) {
    stressTestResults.summary.q1CompletionStatus = 'COMPLETE';
    console.log('\n🎉 Q1-AO-MILESTONE-1.2 COMPLETION VALIDATED');
    console.log('📋 All critical performance requirements met');
    console.log('🚀 Ready for Q2 transition');
  } else {
    stressTestResults.summary.q1CompletionStatus = 'INCOMPLETE';
    console.log('\n⚠️  Q1 COMPLETION BLOCKED');
    console.log(`📊 ${passedRequirements.length}/${criticalRequirements.length} requirements met`);
    console.log('🔧 Additional work required before Q2 transition');
  }
  
  return allRequirementsMet;
}

function saveResults() {
  stressTestResults.endTime = new Date().toISOString();
  stressTestResults.summary.totalTests = stressTestResults.tests.length;
  
  const resultsPath = path.join(__dirname, '..', 'stress-test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(stressTestResults, null, 2));
  
  console.log(`\n📄 Results saved to: ${resultsPath}`);
}

function generateReport() {
  console.log('\n📊 STRESS TESTING SUMMARY REPORT');
  console.log('=' .repeat(50));
  console.log(`🕐 Started: ${stressTestResults.startTime}`);
  console.log(`🕐 Ended: ${stressTestResults.endTime}`);
  console.log(`📊 Total Tests: ${stressTestResults.summary.totalTests}`);
  console.log(`✅ Passed: ${stressTestResults.summary.passedTests}`);
  console.log(`❌ Failed: ${stressTestResults.summary.failedTests}`);
  console.log(`🎯 Q1 Status: ${stressTestResults.summary.q1CompletionStatus}`);
  
  if (Object.keys(stressTestResults.summary.performanceBaseline).length > 0) {
    console.log('\n📈 Performance Baselines Established:');
    Object.entries(stressTestResults.summary.performanceBaseline).forEach(([test, baseline]) => {
      console.log(`   🔥 ${test}:`);
      if (baseline.averageProcessingTime) {
        console.log(`      ⚡ Avg Processing: ${baseline.averageProcessingTime.toFixed(2)}ms`);
      }
      if (baseline.successRate) {
        console.log(`      📈 Success Rate: ${(baseline.successRate * 100).toFixed(2)}%`);
      }
      if (baseline.throughput) {
        console.log(`      🚀 Throughput: ${baseline.throughput.toFixed(2)} req/s`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(50));
}

// Main execution
async function main() {
  console.log('🔍 Checking test environment...');
  
  // Verify test files exist
  const stressTestDir = path.join(__dirname, '..', 'src', 'tests', 'stress');
  if (!fs.existsSync(stressTestDir)) {
    console.log(`❌ Stress test directory not found: ${stressTestDir}`);
    process.exit(1);
  }
  
  // Run stress tests in sequence to avoid resource conflicts
  const stressTests = [
    {
      name: 'DevTeam Pipeline Core Performance',
      file: 'src/tests/stress/devteam-pipeline-stress.test.ts',
      timeout: 180000 // 3 minutes
    },
    {
      name: 'Rate Limiting Under Load',
      file: 'src/tests/stress/rate-limiting-stress.test.ts',
      timeout: 120000 // 2 minutes
    }
  ];
  
  console.log(`🎯 Running ${stressTests.length} critical stress tests...\n`);
  
  let allTestsPassed = true;
  
  for (const test of stressTests) {
    const testFilePath = path.join(__dirname, '..', test.file);
    if (!fs.existsSync(testFilePath)) {
      console.log(`⚠️  Test file not found: ${testFilePath}`);
      continue;
    }
    
    const passed = runStressTest(test.name, test.file, test.timeout);
    if (!passed) {
      allTestsPassed = false;
    }
    
    // Brief pause between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Validate Q1 completion requirements
  const q1Complete = validateQ1Completion();
  
  // Save results and generate report
  saveResults();
  generateReport();
  
  // Exit with appropriate code
  if (allTestsPassed && q1Complete) {
    console.log('\n🏆 ALL STRESS TESTS PASSED - Q1 COMPLETION VALIDATED');
    process.exit(0);
  } else {
    console.log('\n💥 STRESS TESTING FAILED - Q1 COMPLETION BLOCKED');
    process.exit(1);
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Run main function
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Main execution failed:', error);
    process.exit(1);
  });
}

module.exports = { main, runStressTest, validateQ1Completion };