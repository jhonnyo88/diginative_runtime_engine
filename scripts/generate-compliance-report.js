#!/usr/bin/env node

/**
 * European Accessibility Compliance Report Generator
 * Creates HTML reports for government standard compliance
 * Roadmap-Ref: Q1-MER-Milestone-1.3
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
};

const standard = getArg('standard') || 'ALL';
const inputFile = getArg('input') || `compliance-${standard}.json`;
const outputFile = getArg('output') || `report-${standard}.html`;

// Standard metadata
const STANDARD_INFO = {
  'BITV': {
    fullName: 'Barrierefreie-Informationstechnik-Verordnung 2.0',
    country: 'Germany',
    flag: '🇩🇪',
    color: '#000000',
    requirements: [
      'All functionality available from keyboard',
      'Contrast ratio of at least 4.5:1',
      'Focus indicator clearly visible',
      'German language support'
    ]
  },
  'RGAA': {
    fullName: 'Référentiel Général d\'Amélioration de l\'Accessibilité 4.1',
    country: 'France',
    flag: '🇫🇷',
    color: '#000091',
    requirements: [
      'Images have appropriate text alternatives',
      'Valid code according to specifications',
      'No information by color alone',
      'French government typography (Marianne font)'
    ]
  },
  'EN301549': {
    fullName: 'European Standard EN 301 549 V3.2.1',
    country: 'Netherlands/EU',
    flag: '🇳🇱',
    color: '#FF6900',
    requirements: [
      'Well-formed markup',
      'Content reflows without horizontal scrolling',
      'WCAG 2.1 AA compliance',
      'Efficient interaction patterns'
    ]
  },
  'DOS': {
    fullName: 'Dos lagen om tillgänglighet 2018:1937',
    country: 'Sweden',
    flag: '🇸🇪',
    color: '#005A9F',
    requirements: [
      'Info and relationships programmatically determined',
      'Labels or instructions for user input',
      'Mobile accessibility (48px touch targets)',
      'Swedish language support'
    ]
  }
};

// Load compliance data
function loadComplianceData(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load compliance data: ${error.message}`);
    return null;
  }
}

// Generate HTML report
function generateHTMLReport(standard, data) {
  const info = STANDARD_INFO[standard] || {};
  const timestamp = new Date().toLocaleString();
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${standard} Compliance Report - DigiNativa</title>
    <style>
        :root {
            --primary-color: ${info.color || '#0066CC'};
            --success-color: #28a745;
            --danger-color: #dc3545;
            --warning-color: #ffc107;
            --light-bg: #f8f9fa;
            --border-color: #dee2e6;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: var(--light-bg);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        header {
            background: white;
            border-bottom: 4px solid var(--primary-color);
            padding: 2rem 0;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: var(--primary-color);
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .subtitle {
            color: #666;
            font-size: 1.2rem;
        }
        
        .summary-card {
            background: white;
            border-radius: 8px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .score-display {
            font-size: 4rem;
            font-weight: bold;
            text-align: center;
            margin: 2rem 0;
        }
        
        .score-100 { color: var(--success-color); }
        .score-partial { color: var(--warning-color); }
        .score-fail { color: var(--danger-color); }
        
        .requirements {
            background: white;
            border-radius: 8px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .requirement-item {
            padding: 1rem;
            border-left: 4px solid var(--primary-color);
            margin-bottom: 1rem;
            background: var(--light-bg);
        }
        
        .test-results {
            background: white;
            border-radius: 8px;
            padding: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        
        th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        
        th {
            background: var(--light-bg);
            font-weight: 600;
        }
        
        .status-pass {
            color: var(--success-color);
            font-weight: 600;
        }
        
        .status-fail {
            color: var(--danger-color);
            font-weight: 600;
        }
        
        .failure-details {
            background: #fee;
            border: 1px solid #fcc;
            border-radius: 4px;
            padding: 1rem;
            margin-top: 0.5rem;
            font-size: 0.9rem;
        }
        
        .metadata {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding: 1rem;
            background: var(--light-bg);
            border-radius: 4px;
        }
        
        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        .badge-success {
            background: var(--success-color);
            color: white;
        }
        
        .badge-danger {
            background: var(--danger-color);
            color: white;
        }
        
        footer {
            text-align: center;
            padding: 2rem;
            color: #666;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            .score-display {
                font-size: 3rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>${info.flag} ${standard} Compliance Report</h1>
            <p class="subtitle">${info.fullName}</p>
            <div class="metadata">
                <span>Country: <strong>${info.country}</strong></span>
                <span>Generated: <strong>${timestamp}</strong></span>
                <span class="badge ${data.passed ? 'badge-success' : 'badge-danger'}">
                    ${data.passed ? 'COMPLIANT' : 'NON-COMPLIANT'}
                </span>
            </div>
        </div>
    </header>
    
    <div class="container">
        <div class="summary-card">
            <h2>Compliance Score</h2>
            <div class="score-display ${data.score === 100 ? 'score-100' : data.score >= 80 ? 'score-partial' : 'score-fail'}">
                ${data.score}%
            </div>
            <p style="text-align: center; color: #666;">
                Required threshold: ${data.threshold}%
            </p>
        </div>
        
        <div class="requirements">
            <h2>Standard Requirements</h2>
            ${info.requirements ? info.requirements.map(req => `
                <div class="requirement-item">
                    ✓ ${req}
                </div>
            `).join('') : '<p>No specific requirements listed</p>'}
        </div>
        
        <div class="test-results">
            <h2>Test Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Tests</th>
                        <th>Passed</th>
                        <th>Failed</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Total</td>
                        <td>${data.details.totalTests}</td>
                        <td>${data.details.passedTests}</td>
                        <td>${data.details.failedTests}</td>
                        <td class="${data.passed ? 'status-pass' : 'status-fail'}">
                            ${data.passed ? 'PASS' : 'FAIL'}
                        </td>
                    </tr>
                </tbody>
            </table>
            
            ${data.details.failures && data.details.failures.length > 0 ? `
                <h3 style="margin-top: 2rem;">Failed Requirements</h3>
                ${data.details.failures.map(failure => `
                    <div class="failure-details">
                        <strong>${failure.requirement}</strong><br>
                        ${failure.title}<br>
                        <small>${failure.message}</small>
                    </div>
                `).join('')}
            ` : ''}
        </div>
    </div>
    
    <footer>
        <p>DigiNativa Runtime Engine - European Accessibility Compliance</p>
        <p>This report validates compliance with ${info.fullName}</p>
    </footer>
</body>
</html>
  `;
  
  return html;
}

// Generate aggregate report
function generateAggregateReport(data) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>European Compliance Dashboard - DigiNativa</title>
    <style>
        /* Reuse styles from individual reports */
        ${getCommonStyles()}
        
        .standards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .standard-card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.2s;
        }
        
        .standard-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .flag {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .standard-score {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 1rem 0;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>🇪🇺 European Accessibility Compliance Dashboard</h1>
            <p class="subtitle">Unified compliance report for all government standards</p>
        </div>
    </header>
    
    <div class="container">
        <div class="summary-card">
            <h2>Overall Compliance</h2>
            <div class="score-display ${data.overallCompliance === 100 ? 'score-100' : 'score-fail'}">
                ${data.overallCompliance}%
            </div>
            <p style="text-align: center;">
                ${data.passed ? '✅ All European standards met!' : '❌ Compliance issues detected'}
            </p>
        </div>
        
        <div class="standards-grid">
            ${Object.entries(STANDARD_INFO).map(([code, info]) => `
                <div class="standard-card">
                    <div class="flag">${info.flag}</div>
                    <h3>${code}</h3>
                    <p>${info.country}</p>
                    <div class="standard-score ${data.standards[code] === 100 ? 'score-100' : 'score-fail'}">
                        ${data.standards[code] || 0}%
                    </div>
                    <span class="badge ${data.standards[code] === 100 ? 'badge-success' : 'badge-danger'}">
                        ${data.standards[code] === 100 ? 'Compliant' : 'Non-Compliant'}
                    </span>
                </div>
            `).join('')}
        </div>
    </div>
    
    <footer>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>DigiNativa Runtime Engine - Meeting all European accessibility standards</p>
    </footer>
</body>
</html>
  `;
  
  return html;
}

function getCommonStyles() {
  return `
    :root {
        --primary-color: #0066CC;
        --success-color: #28a745;
        --danger-color: #dc3545;
        --warning-color: #ffc107;
        --light-bg: #f8f9fa;
        --border-color: #dee2e6;
    }
    
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        background: var(--light-bg);
    }
    
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }
    
    header {
        background: white;
        border-bottom: 4px solid var(--primary-color);
        padding: 2rem 0;
        margin-bottom: 2rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    h1 {
        color: var(--primary-color);
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
    }
    
    .subtitle {
        color: #666;
        font-size: 1.2rem;
    }
    
    .summary-card {
        background: white;
        border-radius: 8px;
        padding: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .score-display {
        font-size: 4rem;
        font-weight: bold;
        text-align: center;
        margin: 2rem 0;
    }
    
    .score-100 { color: var(--success-color); }
    .score-partial { color: var(--warning-color); }
    .score-fail { color: var(--danger-color); }
    
    .badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 600;
    }
    
    .badge-success {
        background: var(--success-color);
        color: white;
    }
    
    .badge-danger {
        background: var(--danger-color);
        color: white;
    }
    
    footer {
        text-align: center;
        padding: 2rem;
        color: #666;
        font-size: 0.9rem;
    }
  `;
}

// Main execution
function main() {
  // Load compliance data
  const data = loadComplianceData(inputFile);
  if (!data) {
    console.error('Failed to generate report: No data available');
    process.exit(1);
  }
  
  // Generate appropriate report
  let html;
  if (standard === 'ALL') {
    html = generateAggregateReport(data);
  } else {
    html = generateHTMLReport(standard, data);
  }
  
  // Write report
  try {
    fs.writeFileSync(outputFile, html);
    console.log(`✅ Report generated: ${outputFile}`);
  } catch (error) {
    console.error(`❌ Failed to write report: ${error.message}`);
    process.exit(1);
  }
}

// Run report generator
main();