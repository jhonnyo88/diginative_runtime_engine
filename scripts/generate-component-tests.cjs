#!/usr/bin/env node

/**
 * Component Test Generator Script
 * Task: proposal-028 - Component Testing Infrastructure
 * 
 * Automatically generates test templates for untested components
 * Analyzes component structure and creates appropriate test scaffolding
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComponentTestGenerator {
  constructor() {
    this.srcDir = path.join(process.cwd(), 'src');
    this.testsDir = path.join(this.srcDir, 'tests', 'components');
    this.componentsDir = path.join(this.srcDir, 'components');
    
    this.componentPatterns = {
      municipal: /Municipal|Municipality/i,
      auth: /Auth|Login|SAML/i,
      admin: /Admin|Dashboard|Enterprise/i,
      game: /Game|Quiz|Scene|Dialogue/i,
      accessibility: /Accessibility|SkipLink|WCAG/i,
      monitoring: /Monitor|Performance|Analytics/i
    };
  }

  async analyzeComponents() {
    console.log('📊 Analyzing component structure...');
    
    const allComponents = this.findAllComponents();
    const existingTests = this.findExistingTests();
    const untestedComponents = this.identifyUntestedComponents(allComponents, existingTests);
    
    return {
      total: allComponents.length,
      tested: existingTests.length,
      untested: untestedComponents,
      coverage: Math.round((existingTests.length / allComponents.length) * 100)
    };
  }

  findAllComponents() {
    const components = [];
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.tsx') && !item.endsWith('.test.tsx')) {
          const relativePath = path.relative(this.srcDir, fullPath);
          const componentName = path.basename(item, '.tsx');
          
          components.push({
            name: componentName,
            path: relativePath,
            fullPath: fullPath,
            category: this.categorizeComponent(componentName)
          });
        }
      });
    };
    
    scanDirectory(this.componentsDir);
    return components;
  }

  findExistingTests() {
    const tests = [];
    
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.test.tsx')) {
          const componentName = path.basename(item, '.test.tsx');
          tests.push({
            name: componentName,
            path: path.relative(this.srcDir, fullPath)
          });
        }
      });
    };
    
    // Scan both components directory and tests directory
    scanDirectory(this.componentsDir);
    scanDirectory(this.testsDir);
    
    return tests;
  }

  identifyUntestedComponents(allComponents, existingTests) {
    const testedNames = new Set(existingTests.map(test => test.name));
    
    return allComponents.filter(component => !testedNames.has(component.name));
  }

  categorizeComponent(componentName) {
    for (const [category, pattern] of Object.entries(this.componentPatterns)) {
      if (pattern.test(componentName)) {
        return category;
      }
    }
    return 'general';
  }

  getPriorityLevel(component) {
    const priorityMapping = {
      municipal: 'P0',
      auth: 'P0', 
      game: 'P1',
      accessibility: 'P2',
      admin: 'P3',
      monitoring: 'P3',
      general: 'P2'
    };
    
    return priorityMapping[component.category] || 'P2';
  }

  generateTestTemplate(component) {
    const priority = this.getPriorityLevel(component);
    const testName = `${component.name}.test.tsx`;
    
    const template = `/**
 * ${component.name} Component Tests
 * Task: proposal-028 - Component Testing Infrastructure
 * Priority: ${priority} - ${this.getPriorityDescription(priority)}
 * Category: ${component.category}
 * 
 * ${this.getTestDescription(component)}
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import ${component.name} from '${this.getImportPath(component)}';

// Mock dependencies if needed
${this.generateMocks(component)}

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('${component.name}', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

${this.generateTestSuites(component)}
});`;

    return template;
  }

  getPriorityDescription(priority) {
    const descriptions = {
      'P0': 'CRITICAL (Municipal-facing)',
      'P1': 'HIGH (Core functionality)', 
      'P2': 'MEDIUM (Enhancement)',
      'P3': 'LOW (Admin/Internal)'
    };
    return descriptions[priority] || 'MEDIUM';
  }

  getTestDescription(component) {
    const descriptions = {
      municipal: 'Tests municipal branding, accessibility, and Swedish context',
      auth: 'Tests authentication flows, security, and SAML integration',
      game: 'Tests game mechanics, state management, and user interactions',
      accessibility: 'Tests WCAG 2.1 AA compliance and assistive technology support',
      admin: 'Tests admin functionality, permissions, and enterprise features',
      monitoring: 'Tests performance monitoring, analytics, and dashboard features',
      general: 'Tests component functionality, props, and user interactions'
    };
    return descriptions[component.category] || 'Tests component functionality and behavior';
  }

  generateMocks(component) {
    const mocks = [];
    
    // Common mocks
    if (component.category === 'game') {
      mocks.push(`
// Mock framer-motion for stable testing
vi.mock('framer-motion', () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  },
  AnimatePresence: vi.fn(({ children }) => children),
}));`);
    }
    
    if (component.category === 'auth') {
      mocks.push(`
// Mock authentication services
vi.mock('../../services/enterprise-saml-provider', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    getUser: vi.fn()
  }
}));`);
    }
    
    if (component.category === 'municipal') {
      mocks.push(`
// Mock municipal services
vi.mock('../../services/municipal-integration-apis', () => ({
  getMunicipalityConfig: vi.fn(),
  validateMunicipalAccess: vi.fn()
}));`);
    }
    
    return mocks.join('\\n');
  }

  generateTestSuites(component) {
    const suites = [];
    
    // Basic functionality tests (all components)
    suites.push(`  describe('Basic Functionality', () => {
    it('renders without crashing', () => {
      renderWithChakra(<${component.name} />);
      
      const component = screen.getByTestId('${this.kebabCase(component.name)}');
      expect(component).toBeInTheDocument();
    });

    it('handles props correctly', () => {
      const testProps = {
        // Add relevant props based on component analysis
      };
      
      renderWithChakra(<${component.name} {...testProps} />);
      
      // Add assertions based on props
    });

    it('handles edge cases gracefully', () => {
      // Test with empty/invalid props
      renderWithChakra(<${component.name} />);
      
      expect(screen.getByTestId('${this.kebabCase(component.name)}')).toBeInTheDocument();
    });
  });`);

    // Category-specific test suites
    if (component.category === 'municipal') {
      suites.push(`
  describe('Municipal Branding Compliance', () => {
    it('displays municipal styling correctly', () => {
      renderWithChakra(
        <${component.name} 
          municipality="malmö"
        />
      );

      const element = screen.getByTestId('${this.kebabCase(component.name)}');
      expect(element).toHaveAttribute('data-municipality', 'malmö');
    });

    it('supports Swedish language content', () => {
      renderWithChakra(
        <${component.name} 
          language="sv-SE"
        />
      );

      // Verify Swedish text rendering
      expect(screen.getByTestId('${this.kebabCase(component.name)}')).toBeInTheDocument();
    });

    it('handles multiple municipality contexts', () => {
      const municipalities = ['malmö', 'stockholm', 'göteborg'];
      
      municipalities.forEach(municipality => {
        const { rerender } = renderWithChakra(
          <${component.name} municipality={municipality} />
        );

        const element = screen.getByTestId('${this.kebabCase(component.name)}');
        expect(element).toHaveAttribute('data-municipality', municipality);
      });
    });
  });`);
    }

    // Accessibility tests (all components)
    suites.push(`
  describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
    it('provides proper ARIA attributes', () => {
      renderWithChakra(<${component.name} />);
      
      const element = screen.getByTestId('${this.kebabCase(component.name)}');
      
      // Check for appropriate ARIA attributes
      expect(element).toHaveAttribute('role');
    });

    it('supports keyboard navigation', () => {
      renderWithChakra(<${component.name} />);
      
      const element = screen.getByTestId('${this.kebabCase(component.name)}');
      
      // Test tab navigation
      element.focus();
      expect(element).toHaveFocus();
    });

    it('maintains sufficient color contrast', () => {
      renderWithChakra(<${component.name} />);
      
      // Basic contrast check
      const element = screen.getByTestId('${this.kebabCase(component.name)}');
      expect(element).toBeInTheDocument();
    });
  });`);

    // Performance tests for complex components
    if (['game', 'admin', 'monitoring'].includes(component.category)) {
      suites.push(`
  describe('Performance and Municipal Network Optimization', () => {
    it('renders efficiently', () => {
      const startTime = performance.now();
      
      renderWithChakra(<${component.name} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within performance budget
      expect(renderTime).toBeLessThan(100); // 100ms budget
    });

    it('handles frequent updates efficiently', () => {
      const { rerender } = renderWithChakra(<${component.name} />);
      
      const startTime = performance.now();
      
      // Simulate multiple re-renders
      for (let i = 0; i < 10; i++) {
        rerender(
          <ChakraProvider>
            <${component.name} key={i} />
          </ChakraProvider>
        );
      }
      
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      // Should handle updates efficiently
      expect(updateTime).toBeLessThan(200); // 200ms for 10 updates
    });
  });`);
    }

    return suites.join('\\n\\n');
  }

  getImportPath(component) {
    // Convert absolute path to relative import path
    const relativePath = path.relative(
      path.join(this.testsDir, this.getTestDirectory(component)),
      component.fullPath
    );
    
    // Remove .tsx extension and ensure proper format
    return relativePath.replace(/\\.tsx$/, '').replace(/\\\\/g, '/');
  }

  getTestDirectory(component) {
    // Map categories to test directories
    const directoryMapping = {
      municipal: 'municipal',
      auth: 'auth', 
      game: 'core',
      accessibility: 'accessibility',
      admin: 'admin',
      monitoring: 'monitoring',
      general: 'general'
    };
    
    return directoryMapping[component.category] || 'general';
  }

  kebabCase(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  async generateAllTests(untestedComponents) {
    console.log(`📝 Generating tests for ${untestedComponents.length} components...`);
    
    const results = {
      generated: 0,
      skipped: 0,
      errors: []
    };
    
    for (const component of untestedComponents) {
      try {
        const testTemplate = this.generateTestTemplate(component);
        const testDir = path.join(this.testsDir, this.getTestDirectory(component));
        const testFile = path.join(testDir, `${component.name}.test.tsx`);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(testDir)) {
          fs.mkdirSync(testDir, { recursive: true });
        }
        
        // Skip if test file already exists
        if (fs.existsSync(testFile)) {
          console.log(`⏭️  Skipping ${component.name} (test already exists)`);
          results.skipped++;
          continue;
        }
        
        // Write test file
        fs.writeFileSync(testFile, testTemplate);
        console.log(`✅ Generated test for ${component.name} (${this.getPriorityLevel(component)})`);
        results.generated++;
        
      } catch (error) {
        console.error(`❌ Error generating test for ${component.name}:`, error.message);
        results.errors.push({
          component: component.name,
          error: error.message
        });
      }
    }
    
    return results;
  }

  generateTestReport(analysis, results) {
    const report = `# Component Testing Infrastructure Report

## Coverage Analysis
- **Total Components:** ${analysis.total}
- **Tested Components:** ${analysis.tested}
- **Untested Components:** ${analysis.untested.length}
- **Coverage:** ${analysis.coverage}%

## Priority Breakdown
${this.generatePriorityBreakdown(analysis.untested)}

## Test Generation Results
- **Generated:** ${results.generated}
- **Skipped:** ${results.skipped}
- **Errors:** ${results.errors.length}

## Next Steps
1. Review generated test templates
2. Add component-specific assertions
3. Run tests and fix any issues
4. Integrate with CI/CD pipeline

## Files Generated
${results.generated > 0 ? '```' : ''}
${analysis.untested.slice(0, results.generated).map(c => 
  `src/tests/components/${this.getTestDirectory(c)}/${c.name}.test.tsx`
).join('\\n')}
${results.generated > 0 ? '```' : 'No files generated'}

## Coverage Target
- **Current:** ${analysis.coverage}%
- **Target:** 90%
- **Remaining:** ${90 - analysis.coverage}% (${Math.ceil((90 - analysis.coverage) * analysis.total / 100)} components)
`;

    return report;
  }

  generatePriorityBreakdown(untestedComponents) {
    const priorityGroups = untestedComponents.reduce((groups, component) => {
      const priority = this.getPriorityLevel(component);
      if (!groups[priority]) groups[priority] = [];
      groups[priority].push(component);
      return groups;
    }, {});

    return Object.entries(priorityGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([priority, components]) => 
        `- **${priority}:** ${components.length} components (${components.map(c => c.name).join(', ')})`
      ).join('\\n');
  }

  async run() {
    console.log('🚀 Component Testing Infrastructure Generator');
    console.log('============================================');
    
    try {
      // Analyze current state
      const analysis = await this.analyzeComponents();
      
      console.log(`\\n📊 Analysis Results:`);
      console.log(`   Total Components: ${analysis.total}`);
      console.log(`   Tested: ${analysis.tested} (${analysis.coverage}%)`);
      console.log(`   Untested: ${analysis.untested.length}`);
      
      if (analysis.untested.length === 0) {
        console.log('\\n🎉 All components already have tests!');
        return;
      }
      
      // Generate tests
      const results = await this.generateAllTests(analysis.untested);
      
      // Generate report
      const report = this.generateTestReport(analysis, results);
      const reportPath = path.join(this.srcDir, 'tests', 'component-testing-report.md');
      fs.writeFileSync(reportPath, report);
      
      console.log(`\\n📋 Summary:`);
      console.log(`   Generated: ${results.generated} test files`);
      console.log(`   Skipped: ${results.skipped} existing files`);
      console.log(`   Errors: ${results.errors.length}`);
      console.log(`   Report: ${reportPath}`);
      
      if (results.errors.length > 0) {
        console.log(`\\n❌ Errors:`);
        results.errors.forEach(({ component, error }) => {
          console.log(`   ${component}: ${error}`);
        });
      }
      
      console.log(`\\n🎯 Next Steps:`);
      console.log(`   1. Review generated tests in src/tests/components/`);
      console.log(`   2. Add component-specific test cases`);
      console.log(`   3. Run: npm run test to verify tests pass`);
      console.log(`   4. Achieve 90% component test coverage target`);
      
    } catch (error) {
      console.error('❌ Failed to generate component tests:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new ComponentTestGenerator();
  generator.run().catch(console.error);
}

module.exports = ComponentTestGenerator;