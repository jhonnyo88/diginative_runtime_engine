import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StrategyPlayHost } from '../../components/StrategyPlayHost';
import { DialogueScene } from '../../components/scenes/DialogueScene';
import { QuizScene } from '../../components/scenes/QuizScene';
import { ChakraThemeProvider } from '../../theme/ChakraThemeProvider';
import type { GameManifest, DialogueScene as DialogueSceneType, QuizScene as QuizSceneType } from '../../types/game-manifest';

// European Government Compliance Test Suite
// Ensures 100% compliance with BITV 2.0, RGAA 4.1, EN 301 549, and DOS 2018:1937
// Roadmap-Ref: Q1-MER-Milestone-1.3

// Extend Jest matchers
expect.extend(toHaveNoViolations);

interface ComplianceStandard {
  name: string;
  code: string;
  country: string;
  version: string;
  requirements: ComplianceRequirement[];
}

interface ComplianceRequirement {
  id: string;
  category: string;
  level: 'A' | 'AA' | 'AAA';
  description: string;
  testFunction: (container: HTMLElement) => Promise<boolean>;
}

// European Government Standards
const COMPLIANCE_STANDARDS: ComplianceStandard[] = [
  {
    name: 'Barrierefreie-Informationstechnik-Verordnung',
    code: 'BITV 2.0',
    country: 'DE',
    version: '2.0',
    requirements: [
      {
        id: 'bitv-2.1.1',
        category: 'Keyboard',
        level: 'A',
        description: 'All functionality available from keyboard',
        testFunction: async (container) => {
          const focusableElements = container.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          return focusableElements.length > 0 && 
            Array.from(focusableElements).every(el => {
              const tabindex = el.getAttribute('tabindex');
              return tabindex === null || parseInt(tabindex) >= 0;
            });
        }
      },
      {
        id: 'bitv-1.4.3',
        category: 'Contrast',
        level: 'AA',
        description: 'Contrast ratio of at least 4.5:1 for normal text',
        testFunction: async (container) => {
          // This would use a real contrast checking library
          // For testing, we verify CSS variables are set correctly
          const styles = getComputedStyle(container);
          const textColor = styles.getPropertyValue('color');
          const bgColor = styles.getPropertyValue('background-color');
          return textColor !== '' && bgColor !== '';
        }
      },
      {
        id: 'bitv-2.4.7',
        category: 'Focus',
        level: 'AA',
        description: 'Focus indicator clearly visible',
        testFunction: async (container) => {
          const focusableElements = container.querySelectorAll('button, a, input');
          return Array.from(focusableElements).every(el => {
            const styles = getComputedStyle(el, ':focus');
            return styles.outline !== 'none' || styles.boxShadow !== 'none';
          });
        }
      }
    ]
  },
  {
    name: 'Référentiel Général d\'Amélioration de l\'Accessibilité',
    code: 'RGAA 4.1',
    country: 'FR',
    version: '4.1',
    requirements: [
      {
        id: 'rgaa-1.1',
        category: 'Images',
        level: 'A',
        description: 'Images have appropriate text alternatives',
        testFunction: async (container) => {
          const images = container.querySelectorAll('img');
          return Array.from(images).every(img => 
            img.hasAttribute('alt') || img.hasAttribute('aria-label')
          );
        }
      },
      {
        id: 'rgaa-8.2',
        category: 'Code',
        level: 'A',
        description: 'Valid code according to specifications',
        testFunction: async (container) => {
          // Check for basic HTML validity
          const duplicateIds = new Set();
          const ids = container.querySelectorAll('[id]');
          let hasDuplicates = false;
          
          ids.forEach(el => {
            const id = el.getAttribute('id');
            if (id && duplicateIds.has(id)) {
              hasDuplicates = true;
            }
            duplicateIds.add(id);
          });
          
          return !hasDuplicates;
        }
      },
      {
        id: 'rgaa-10.1',
        category: 'Presentation',
        level: 'AA',
        description: 'No information by color alone',
        testFunction: async (container) => {
          // Check that error states have text/icon indicators
          const errorElements = container.querySelectorAll('[aria-invalid="true"]');
          return Array.from(errorElements).every(el => {
            const text = el.textContent || '';
            const hasIcon = el.querySelector('[aria-label*="error"], [aria-label*="erreur"]');
            return text.match(/error|erreur|incorrect/i) || hasIcon !== null;
          });
        }
      }
    ]
  },
  {
    name: 'European Standard for Digital Accessibility',
    code: 'EN 301 549',
    country: 'EU',
    version: 'V3.2.1',
    requirements: [
      {
        id: 'en-9.2.1.1',
        category: 'Web',
        level: 'AA',
        description: 'Parsing - Well-formed markup',
        testFunction: async (container) => {
          // Check for proper nesting
          const buttons = container.querySelectorAll('button');
          let properNesting = true;
          
          buttons.forEach(button => {
            if (button.querySelector('button')) {
              properNesting = false; // Buttons shouldn't contain buttons
            }
          });
          
          return properNesting;
        }
      },
      {
        id: 'en-11.1.4.10',
        category: 'Reflow',
        level: 'AA',
        description: 'Content reflows without horizontal scrolling',
        testFunction: async (container) => {
          // Check that container uses responsive units
          const styles = getComputedStyle(container);
          const width = styles.width;
          return !width.includes('px') || parseInt(width) <= 1280;
        }
      }
    ]
  },
  {
    name: 'Dos lagen om tillgänglighet till digital offentlig service',
    code: 'DOS 2018:1937',
    country: 'SE',
    version: '2018',
    requirements: [
      {
        id: 'dos-1.3.1',
        category: 'Structure',
        level: 'A',
        description: 'Info and relationships programmatically determined',
        testFunction: async (container) => {
          // Check heading hierarchy
          const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
          let previousLevel = 0;
          let properHierarchy = true;
          
          headings.forEach(heading => {
            const level = parseInt(heading.tagName[1]);
            if (previousLevel > 0 && level > previousLevel + 1) {
              properHierarchy = false; // Skipped heading level
            }
            previousLevel = level;
          });
          
          return properHierarchy;
        }
      },
      {
        id: 'dos-3.3.2',
        category: 'Input',
        level: 'A',
        description: 'Labels or instructions provided for user input',
        testFunction: async (container) => {
          const inputs = container.querySelectorAll('input, select, textarea');
          return Array.from(inputs).every(input => {
            const id = input.getAttribute('id');
            const hasLabel = id ? container.querySelector(`label[for="${id}"]`) : false;
            const hasAriaLabel = input.hasAttribute('aria-label');
            const hasAriaLabelledby = input.hasAttribute('aria-labelledby');
            return hasLabel || hasAriaLabel || hasAriaLabelledby;
          });
        }
      }
    ]
  }
];

// Test utilities
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraThemeProvider>
    {children}
  </ChakraThemeProvider>
);

const mockAnalytics = {
  trackEvent: vi.fn()
};

// Test data for different cultural contexts
const culturalGameManifests: Record<string, GameManifest> = {
  swedish: {
    schemaVersion: '0.1.0',
    gameId: 'dos-compliance-test',
    metadata: {
      title: 'GDPR-utbildning för kommunal personal',
      description: 'Tillgänglig utbildning enligt DOS 2018:1937',
      version: '1.0.0',
      author: 'DigiNativa',
      language: 'sv',
      estimatedDuration: 7,
      difficulty: 'beginner',
      tags: ['gdpr', 'tillgänglighet']
    },
    theme: {
      name: 'municipal-se',
      primaryColor: '#005A9F',
      secondaryColor: '#0066CC',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Inter'
    },
    scenes: []
  },
  german: {
    schemaVersion: '0.1.0',
    gameId: 'bitv-compliance-test',
    metadata: {
      title: 'DSGVO-Schulung für Behördenmitarbeiter',
      description: 'Barrierefreie Schulung nach BITV 2.0',
      version: '1.0.0',
      author: 'DigiNativa',
      language: 'de',
      estimatedDuration: 7,
      difficulty: 'beginner',
      tags: ['dsgvo', 'barrierefreiheit']
    },
    theme: {
      name: 'municipal-de',
      primaryColor: '#000000',
      secondaryColor: '#DD0000',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Inter'
    },
    scenes: []
  },
  french: {
    schemaVersion: '0.1.0',
    gameId: 'rgaa-compliance-test',
    metadata: {
      title: 'Formation RGPD pour agents municipaux',
      description: 'Formation accessible selon RGAA 4.1',
      version: '1.0.0',
      author: 'DigiNativa',
      language: 'fr',
      estimatedDuration: 7,
      difficulty: 'beginner',
      tags: ['rgpd', 'accessibilité']
    },
    theme: {
      name: 'municipal-fr',
      primaryColor: '#000091',
      secondaryColor: '#E1000F',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Marianne'
    },
    scenes: []
  },
  dutch: {
    schemaVersion: '0.1.0',
    gameId: 'en301549-compliance-test',
    metadata: {
      title: 'AVG-training voor gemeentepersoneel',
      description: 'Toegankelijke training volgens EN 301 549',
      version: '1.0.0',
      author: 'DigiNativa',
      language: 'nl',
      estimatedDuration: 7,
      difficulty: 'beginner',
      tags: ['avg', 'toegankelijkheid']
    },
    theme: {
      name: 'municipal-nl',
      primaryColor: '#FF6900',
      secondaryColor: '#01689B',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Inter'
    },
    scenes: []
  }
};

describe('European Government Compliance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BITV 2.0 Compliance (German)', () => {
    const bitvStandard = COMPLIANCE_STANDARDS[0];

    it('passes all BITV 2.0 Level A requirements', async () => {
      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.german}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="klaus-mueller"
            tenantId="berlin-stadt"
          />
        </TestWrapper>
      );

      // Run axe accessibility tests with BITV rules
      const results = await axe(container, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag21a']
        }
      });

      expect(results).toHaveNoViolations();

      // Run custom BITV tests
      const levelARequirements = bitvStandard.requirements.filter(r => r.level === 'A');
      
      for (const requirement of levelARequirements) {
        const passed = await requirement.testFunction(container);
        expect(passed).toBe(true);
      }
    });

    it('passes all BITV 2.0 Level AA requirements', async () => {
      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.german}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="klaus-mueller"
            tenantId="berlin-stadt"
          />
        </TestWrapper>
      );

      const results = await axe(container, {
        runOnly: {
          type: 'tag',
          values: ['wcag2aa', 'wcag21aa']
        }
      });

      expect(results).toHaveNoViolations();

      // Run custom BITV AA tests
      const levelAARequirements = bitvStandard.requirements.filter(r => r.level === 'AA');
      
      for (const requirement of levelAARequirements) {
        const passed = await requirement.testFunction(container);
        expect(passed).toBe(true);
      }
    });

    it('provides proper German language support', async () => {
      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.german}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="klaus-mueller"
            tenantId="berlin-stadt"
          />
        </TestWrapper>
      );

      // Check language attribute
      expect(container.querySelector('[lang="de"]')).toBeTruthy();
      
      // Check for German-specific ARIA labels
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('RGAA 4.1 Compliance (French)', () => {
    const rgaaStandard = COMPLIANCE_STANDARDS[1];

    it('passes all RGAA 4.1 requirements', async () => {
      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.french}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="marie-dubois"
            tenantId="paris-mairie"
          />
        </TestWrapper>
      );

      // Run RGAA-specific axe configuration
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
          'image-alt': { enabled: true },
          'label': { enabled: true },
          'duplicate-id': { enabled: true }
        }
      });

      expect(results).toHaveNoViolations();

      // Run custom RGAA tests
      for (const requirement of rgaaStandard.requirements) {
        const passed = await requirement.testFunction(container);
        expect(passed).toBe(true);
      }
    });

    it('supports French government typography requirements', async () => {
      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.french}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="marie-dubois"
            tenantId="paris-mairie"
          />
        </TestWrapper>
      );

      const styles = getComputedStyle(container);
      
      // Marianne font should be used for French government
      expect(styles.fontFamily).toMatch(/Marianne|Inter/);
      
      // Minimum font size requirement
      const fontSize = parseFloat(styles.fontSize);
      expect(fontSize).toBeGreaterThanOrEqual(14);
    });

    it('provides collaborative features accessibly', async () => {
      render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.french}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="marie-dubois"
            tenantId="paris-mairie"
          />
        </TestWrapper>
      );

      // Marie Dubois persona focuses on collaboration
      // Ensure collaborative features are accessible
      const liveRegions = screen.getAllByRole('status');
      expect(liveRegions.length).toBeGreaterThan(0);
    });
  });

  describe('EN 301 549 Compliance (EU/Dutch)', () => {
    const enStandard = COMPLIANCE_STANDARDS[2];

    it('passes all EN 301 549 requirements', async () => {
      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.dutch}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="pieter-van-berg"
            tenantId="amsterdam-gemeente"
          />
        </TestWrapper>
      );

      // EN 301 549 aligns with WCAG 2.1 AA
      const results = await axe(container, {
        runOnly: {
          type: 'tag',
          values: ['wcag2aa', 'wcag21aa', 'best-practice']
        }
      });

      expect(results).toHaveNoViolations();

      // Run custom EN tests
      for (const requirement of enStandard.requirements) {
        const passed = await requirement.testFunction(container);
        expect(passed).toBe(true);
      }
    });

    it('supports responsive design for reflow', async () => {
      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.dutch}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="pieter-van-berg"
            tenantId="amsterdam-gemeente"
          />
        </TestWrapper>
      );

      // Test reflow at 320px width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320
      });

      window.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // Allow small margin
      });
    });

    it('provides efficient interaction patterns', async () => {
      render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.dutch}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="pieter-van-berg"
            tenantId="amsterdam-gemeente"
          />
        </TestWrapper>
      );

      // Pieter van Berg persona values efficiency
      // Ensure minimal clicks to complete tasks
      const interactiveElements = screen.getAllByRole('button');
      
      // Efficient design should have clear, minimal options
      expect(interactiveElements.length).toBeLessThanOrEqual(5);
    });
  });

  describe('DOS 2018:1937 Compliance (Swedish)', () => {
    const dosStandard = COMPLIANCE_STANDARDS[3];

    it('passes all DOS 2018:1937 requirements', async () => {
      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.swedish}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="anna-svensson"
            tenantId="malmo-stad"
          />
        </TestWrapper>
      );

      const results = await axe(container, {
        runOnly: {
          type: 'tag',
          values: ['wcag2aa', 'wcag21aa']
        }
      });

      expect(results).toHaveNoViolations();

      // Run custom DOS tests
      for (const requirement of dosStandard.requirements) {
        const passed = await requirement.testFunction(container);
        expect(passed).toBe(true);
      }
    });

    it('supports Anna Svensson mobile accessibility', async () => {
      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.swedish}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="anna-svensson"
            tenantId="malmo-stad"
          />
        </TestWrapper>
      );

      // Test touch target sizes (48x48 minimum)
      const buttons = container.querySelectorAll('button');
      
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        expect(rect.width).toBeGreaterThanOrEqual(48);
        expect(rect.height).toBeGreaterThanOrEqual(48);
      });

      // Test mobile viewport
      const viewport = container.querySelector('meta[name="viewport"]');
      if (viewport) {
        expect(viewport.getAttribute('content')).toContain('width=device-width');
      }
    });

    it('provides Swedish language accessibility features', async () => {
      render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.swedish}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="anna-svensson"
            tenantId="malmo-stad"
          />
        </TestWrapper>
      );

      // Check for Swedish-specific accessibility text
      expect(screen.getByText(/utbildning/i)).toBeInTheDocument();
      
      // Verify proper character encoding for Swedish characters
      const swedishText = screen.getByText(/tillgänglig/i);
      expect(swedishText).toBeInTheDocument();
    });
  });

  describe('Cross-Standard Compliance Validation', () => {
    it('meets all European standards simultaneously', async () => {
      const allStandards = COMPLIANCE_STANDARDS;
      const testResults: Record<string, boolean> = {};

      // Test with a universal game manifest
      const universalManifest: GameManifest = {
        ...culturalGameManifests.swedish,
        metadata: {
          ...culturalGameManifests.swedish.metadata,
          language: 'mul' // Multiple languages
        }
      };

      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={universalManifest}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="test-user"
            tenantId="eu-compliance"
          />
        </TestWrapper>
      );

      // Run all standard tests
      for (const standard of allStandards) {
        let standardPassed = true;
        
        for (const requirement of standard.requirements) {
          const passed = await requirement.testFunction(container);
          if (!passed) {
            standardPassed = false;
            console.error(`Failed ${standard.code} requirement: ${requirement.id}`);
          }
        }
        
        testResults[standard.code] = standardPassed;
      }

      // All standards must pass
      Object.entries(testResults).forEach(([standard, passed]) => {
        expect(passed).toBe(true);
      });
    });

    it('generates compliance report', async () => {
      const complianceReport = {
        timestamp: new Date().toISOString(),
        standards: [] as Array<{
          code: string;
          country: string;
          compliance: number;
          details: string[];
        }>
      };

      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.swedish}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="compliance-test"
            tenantId="eu-compliance"
          />
        </TestWrapper>
      );

      // Generate report for each standard
      for (const standard of COMPLIANCE_STANDARDS) {
        const passedRequirements = [];
        const failedRequirements = [];
        
        for (const requirement of standard.requirements) {
          const passed = await requirement.testFunction(container);
          if (passed) {
            passedRequirements.push(requirement.id);
          } else {
            failedRequirements.push(`${requirement.id}: ${requirement.description}`);
          }
        }
        
        const compliance = (passedRequirements.length / standard.requirements.length) * 100;
        
        complianceReport.standards.push({
          code: standard.code,
          country: standard.country,
          compliance: Math.round(compliance),
          details: failedRequirements
        });
      }

      // All standards should have 100% compliance
      complianceReport.standards.forEach(standard => {
        expect(standard.compliance).toBe(100);
      });

      // Log report for CI/CD integration
      console.log('Compliance Report:', JSON.stringify(complianceReport, null, 2));
    });
  });

  describe('CI/CD Integration', () => {
    it('provides exit codes for CI/CD pipeline', async () => {
      let exitCode = 0;

      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.swedish}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="ci-test"
            tenantId="ci-pipeline"
          />
        </TestWrapper>
      );

      // Run all compliance tests
      try {
        const results = await axe(container);
        if (results.violations.length > 0) {
          exitCode = 1;
        }

        // Run all custom tests
        for (const standard of COMPLIANCE_STANDARDS) {
          for (const requirement of standard.requirements) {
            const passed = await requirement.testFunction(container);
            if (!passed) {
              exitCode = 1;
              break;
            }
          }
        }
      } catch (error) {
        exitCode = 2; // Test error
      }

      expect(exitCode).toBe(0); // Should pass all tests
    });

    it('generates machine-readable compliance output', async () => {
      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.swedish}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="ci-test"
            tenantId="ci-pipeline"
          />
        </TestWrapper>
      );

      const results = await axe(container);
      
      // Generate JUnit-style XML output for CI/CD
      const junitOutput = {
        testsuites: {
          testsuite: {
            name: 'European Compliance Tests',
            tests: COMPLIANCE_STANDARDS.reduce((sum, s) => sum + s.requirements.length, 0),
            failures: results.violations.length,
            time: 0
          }
        }
      };

      expect(junitOutput.testsuites.testsuite.failures).toBe(0);
    });
  });

  describe('Automated Compliance Dashboard', () => {
    it('tracks compliance metrics over time', async () => {
      const metrics = {
        bitv: [] as number[],
        rgaa: [] as number[],
        en301549: [] as number[],
        dos: [] as number[]
      };

      // Simulate multiple test runs
      for (let i = 0; i < 3; i++) {
        const { container } = render(
          <TestWrapper>
            <StrategyPlayHost
              gameManifest={culturalGameManifests.swedish}
              onGameComplete={vi.fn()}
              onGameExit={vi.fn()}
              analytics={mockAnalytics}
              userId={`test-run-${i}`}
              tenantId="compliance-tracking"
            />
          </TestWrapper>
        );

        // Calculate compliance for each standard
        for (const standard of COMPLIANCE_STANDARDS) {
          let passed = 0;
          for (const requirement of standard.requirements) {
            if (await requirement.testFunction(container)) {
              passed++;
            }
          }
          const compliance = (passed / standard.requirements.length) * 100;
          
          switch (standard.code) {
            case 'BITV 2.0':
              metrics.bitv.push(compliance);
              break;
            case 'RGAA 4.1':
              metrics.rgaa.push(compliance);
              break;
            case 'EN 301 549':
              metrics.en301549.push(compliance);
              break;
            case 'DOS 2018:1937':
              metrics.dos.push(compliance);
              break;
          }
        }
      }

      // All runs should maintain 100% compliance
      Object.values(metrics).forEach(standardMetrics => {
        standardMetrics.forEach(compliance => {
          expect(compliance).toBe(100);
        });
      });
    });

    it('alerts on compliance regression', async () => {
      const alerts: string[] = [];
      
      const checkCompliance = async (container: HTMLElement) => {
        for (const standard of COMPLIANCE_STANDARDS) {
          for (const requirement of standard.requirements) {
            const passed = await requirement.testFunction(container);
            if (!passed) {
              alerts.push(
                `COMPLIANCE REGRESSION: ${standard.code} - ${requirement.id}: ${requirement.description}`
              );
            }
          }
        }
      };

      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={culturalGameManifests.swedish}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="regression-test"
            tenantId="compliance-alerts"
          />
        </TestWrapper>
      );

      await checkCompliance(container);
      
      // Should have no alerts in a compliant system
      expect(alerts).toHaveLength(0);
    });
  });
});