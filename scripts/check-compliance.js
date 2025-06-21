#!/usr/bin/env node

/**
 * European Accessibility Compliance Checker
 * Validates test results against government standards
 * Roadmap-Ref: Q1-MER-Milestone-1.3
 */

const fs = require('fs');
const path = require('path');

// Compliance thresholds per standard
const COMPLIANCE_THRESHOLDS = {
  'BITV': 100,      // Germany requires 100% compliance
  'RGAA': 100,      // France requires 100% compliance
  'EN301549': 100,  // EU standard requires 100% compliance
  'DOS': 100        // Sweden requires 100% compliance
};

// Parse command line arguments
const args = process.argv.slice(2);
const standardArg = args.find(arg => arg.startsWith('--standard='));
const standard = standardArg ? standardArg.split('=')[1] : 'ALL';

// Load test results
function loadTestResults(standard) {
  const resultFile = path.join(process.cwd(), `compliance-${standard}.json`);
  
  if (!fs.existsSync(resultFile)) {
    console.error(`❌ No test results found for ${standard}`);
    return null;
  }
  
  try {
    const content = fs.readFileSync(resultFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Failed to parse test results: ${error.message}`);
    return null;
  }
}

// Calculate compliance score
function calculateCompliance(testResults) {
  if (!testResults || !testResults.testResults) {
    return 0;
  }
  
  const tests = testResults.testResults[0]?.assertionResults || [];
  const totalTests = tests.length;
  const passedTests = tests.filter(test => test.status === 'passed').length;
  
  if (totalTests === 0) {
    return 0;
  }
  
  return Math.round((passedTests / totalTests) * 100);
}

// Generate detailed report
function generateReport(standard, score, testResults) {
  const threshold = COMPLIANCE_THRESHOLDS[standard] || 100;
  const passed = score >= threshold;
  
  const report = {
    standard,
    score,
    threshold,
    passed,
    timestamp: new Date().toISOString(),
    details: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      failures: []
    }
  };
  
  if (testResults && testResults.testResults) {
    const tests = testResults.testResults[0]?.assertionResults || [];
    report.details.totalTests = tests.length;
    report.details.passedTests = tests.filter(t => t.status === 'passed').length;
    report.details.failedTests = tests.filter(t => t.status === 'failed').length;
    
    // Collect failure details
    tests.filter(t => t.status === 'failed').forEach(test => {
      report.details.failures.push({
        title: test.title,
        requirement: test.ancestorTitles.join(' > '),
        message: test.failureMessages.join('\n')
      });
    });
  }
  
  return report;
}

// Check compliance for specific standard
function checkStandardCompliance(standard) {
  console.log(`\n🔍 Checking ${standard} compliance...`);
  
  const testResults = loadTestResults(standard);
  if (!testResults) {
    return 0;
  }
  
  const score = calculateCompliance(testResults);
  const report = generateReport(standard, score, testResults);
  
  // Save detailed report
  const reportFile = path.join(process.cwd(), `compliance-report-${standard}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  // Log results
  if (report.passed) {
    console.log(`✅ ${standard}: ${score}% compliance (threshold: ${report.threshold}%)`);
  } else {
    console.log(`❌ ${standard}: ${score}% compliance (threshold: ${report.threshold}%)`);
    
    if (report.details.failures.length > 0) {
      console.log('\nFailed requirements:');
      report.details.failures.forEach(failure => {
        console.log(`  - ${failure.requirement}: ${failure.title}`);
      });
    }
  }
  
  return score;
}

// Check all standards
function checkAllStandards() {
  const standards = Object.keys(COMPLIANCE_THRESHOLDS);
  const results = {};
  let overallScore = 100;
  
  standards.forEach(std => {
    const score = checkStandardCompliance(std);
    results[std] = score;
    if (score < overallScore) {
      overallScore = score;
    }
  });
  
  // Generate aggregate report
  const aggregateReport = {
    timestamp: new Date().toISOString(),
    overallCompliance: overallScore,
    standards: results,
    passed: overallScore === 100
  };
  
  const reportFile = path.join(process.cwd(), 'compliance-report-aggregate.json');
  fs.writeFileSync(reportFile, JSON.stringify(aggregateReport, null, 2));
  
  return overallScore;
}

// Main execution
function main() {
  let score;
  
  if (standard === 'ALL') {
    score = checkAllStandards();
  } else {
    score = checkStandardCompliance(standard);
  }
  
  // Output score for CI/CD
  console.log(score);
  
  // Exit with appropriate code
  process.exit(score === 100 ? 0 : 1);
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error(`❌ Unexpected error: ${error.message}`);
  process.exit(1);
});

// Run compliance check
main();