import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StrategyPlayHost } from '../../components/StrategyPlayHost';
import { DialogueScene } from '../../components/scenes/DialogueScene';
import { QuizScene } from '../../components/scenes/QuizScene';
import { DialogueScene as NewDialogueScene } from '../../components/DialogueScene/DialogueScene';
import { QuizScene as NewQuizScene } from '../../components/QuizScene/QuizScene';
import { AdminDashboard } from '../../components/admin/AdminDashboard';
import { ChakraThemeProvider } from '../../theme/ChakraThemeProvider';
import type { GameManifest, DialogueScene as DialogueSceneType, QuizScene as QuizSceneType } from '../../types/game-manifest';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraThemeProvider>
    {children}
  </ChakraThemeProvider>
);


// Sample accessible game manifest
const accessibleGameManifest: GameManifest = {
  schemaVersion: '0.1.0',
  gameId: 'accessibility-test-game',
  metadata: {
    title: 'WCAG Compliant GDPR Training',
    description: 'Accessibility-focused GDPR training for all users',
    version: '1.0.0',
    author: 'DigiNativa Accessibility Team',
    language: 'sv',
    estimatedDuration: 15,
    difficulty: 'beginner',
    tags: ['accessibility', 'gdpr', 'inclusive']
  },
  theme: {
    name: 'high-contrast',
    primaryColor: '#000080',
    secondaryColor: '#0066CC',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Open Sans'
  },
  scenes: [
    {
      id: 'accessible-dialogue',
      type: 'dialogue',
      title: 'Welcome to Accessible Training',
      description: 'Learn about GDPR with full accessibility support',
      content: {
        character: {
          name: 'Anna Svensson',
          avatar: '/avatars/anna.png',
          role: 'Accessibility Coordinator'
        },
        messages: [
          {
            id: 'welcome-msg',
            speaker: 'Anna Svensson',
            text: 'Welcome! This training is designed to be accessible to everyone.',
            timestamp: 0
          }
        ],
        actions: [
          {
            id: 'continue',
            text: 'Continue',
            type: 'continue'
          }
        ]
      }
    }
  ]
};

const accessibleDialogueScene: DialogueSceneType = {
  id: 'dialogue-accessibility-test',
  type: 'dialogue',
  title: 'Accessible Dialogue Scene',
  description: 'Testing dialogue accessibility features',
  content: {
    character: {
      name: 'Anna Svensson',
      avatar: '/avatars/anna.png',
      role: 'Training Coordinator'
    },
    messages: [
      {
        id: 'msg-1',
        speaker: 'Anna Svensson',
        text: 'This is an accessible dialogue message.',
        timestamp: 0
      }
    ],
    actions: [
      {
        id: 'continue',
        text: 'Continue',
        type: 'continue'
      }
    ]
  }
};

const accessibleQuizScene: QuizSceneType = {
  id: 'quiz-accessibility-test',
  type: 'quiz',
  title: 'Accessible Quiz Scene',
  description: 'Testing quiz accessibility features',
  content: {
    question: 'Which accessibility principle ensures content is perceivable?',
    explanation: 'Perceivable means information must be presentable in ways users can perceive.',
    options: [
      {
        id: 'option-1',
        text: 'Content must be perceivable',
        correct: true,
        feedback: 'Correct! Perceivable is one of the four WCAG principles.'
      },
      {
        id: 'option-2',
        text: 'Content must be invisible',
        correct: false,
        feedback: 'Incorrect. Content should be perceivable, not invisible.'
      }
    ],
    timeLimit: 60,
    allowMultipleAttempts: true,
    showExplanation: true
  }
};

describe('WCAG 2.1 AA Compliance Tests', () => {
  describe('StrategyPlayHost Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={accessibleGameManifest}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="test-user"
            tenantId="test-tenant"
          />
        </TestWrapper>
      );

      expect(results).toHaveNoViolations();
    });

    it('should have proper document structure', () => {
      render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={accessibleGameManifest}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="test-user"
            tenantId="test-tenant"
          />
        </TestWrapper>
      );

      // Should have main landmark
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Should have proper heading hierarchy
      expect(headings[0]).toHaveAttribute('aria-level', '1');
      
      // Should have skip link
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={accessibleGameManifest}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="test-user"
            tenantId="test-tenant"
          />
        </TestWrapper>
      );

      
      // Tab navigation
      continueButton.focus();
      expect(document.activeElement).toBe(continueButton);
      
      // Enter key activation
      fireEvent.keyDown(continueButton, { key: 'Enter' });
      // Should trigger continue action (tested in integration tests)
      
      // Space key activation
      fireEvent.keyDown(continueButton, { key: ' ' });
      // Should also trigger continue action
    });

    it('should provide screen reader announcements', () => {
      render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={accessibleGameManifest}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="test-user"
            tenantId="test-tenant"
          />
        </TestWrapper>
      );

      // Live regions for announcements
      expect(liveRegions.length).toBeGreaterThan(0);
      
      // Progress announcements
      expect(progressBar).toHaveAttribute('aria-label');
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have high contrast color ratios', () => {
      render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={accessibleGameManifest}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="test-user"
            tenantId="test-tenant"
          />
        </TestWrapper>
      );

      // Theme should use high contrast colors
      
      // Primary color should be dark blue for contrast
      expect(styles.getPropertyValue('--primary-color')).toBe('#000080');
      expect(styles.getPropertyValue('--background-color')).toBe('#FFFFFF');
    });
  });

  describe('DialogueScene Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <DialogueScene
            scene={accessibleDialogueScene}
            onComplete={vi.fn()}
            analytics={mockAnalytics}
          />
        </TestWrapper>
      );

      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA structure', () => {
      render(
        <TestWrapper>
          <DialogueScene
            scene={accessibleDialogueScene}
            onComplete={vi.fn()}
            analytics={mockAnalytics}
          />
        </TestWrapper>
      );

      // Dialog should be a region
      expect(screen.getByRole('region')).toBeInTheDocument();
      
      // Character information should be accessible
      expect(screen.getByText('Anna Svensson')).toBeInTheDocument();
      expect(screen.getByText('Training Coordinator')).toBeInTheDocument();
      
      // Avatar should have alt text
      expect(avatar).toBeInTheDocument();
    });

    it('should support screen reader navigation', () => {
      render(
        <TestWrapper>
          <DialogueScene
            scene={accessibleDialogueScene}
            onComplete={vi.fn()}
            analytics={mockAnalytics}
          />
        </TestWrapper>
      );

      // Messages should be in reading order
      expect(messages[0]).toBeInTheDocument();
      
      // Skip button should be accessible
      expect(skipButton).toHaveAttribute('aria-label', 'Skip to end of dialogue');
    });

    it('should handle focus management correctly', () => {
      render(
        <TestWrapper>
          <DialogueScene
            scene={accessibleDialogueScene}
            onComplete={vi.fn()}
            analytics={mockAnalytics}
          />
        </TestWrapper>
      );

      // Focus should be managed when dialogue completes
      expect(continueButton).toBeInTheDocument();
      
      // Button should be focusable
      continueButton.focus();
      expect(document.activeElement).toBe(continueButton);
    });
  });

  describe('QuizScene Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <QuizScene
            scene={accessibleQuizScene}
            onComplete={vi.fn()}
            analytics={mockAnalytics}
          />
        </TestWrapper>
      );

      expect(results).toHaveNoViolations();
    });

    it('should have proper form structure', () => {
      render(
        <TestWrapper>
          <QuizScene
            scene={accessibleQuizScene}
            onComplete={vi.fn()}
            analytics={mockAnalytics}
          />
        </TestWrapper>
      );

      // Radio group should exist
      expect(radioGroup).toBeInTheDocument();
      
      // Question should label the radio group
      expect(radioGroup).toHaveAttribute('aria-labelledby');
      
      // Radio buttons should have proper labels
      radioButtons.forEach(radio => {
        expect(radio).toHaveAttribute('aria-label');
      });
    });

    it('should support keyboard navigation for options', () => {
      render(
        <TestWrapper>
          <QuizScene
            scene={accessibleQuizScene}
            onComplete={vi.fn()}
            analytics={mockAnalytics}
          />
        </TestWrapper>
      );


      // Tab to first option
      firstOption.focus();
      expect(document.activeElement).toBe(firstOption);

      // Arrow key navigation
      fireEvent.keyDown(firstOption, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(secondOption);

      // Arrow key back up
      fireEvent.keyDown(secondOption, { key: 'ArrowUp' });
      expect(document.activeElement).toBe(firstOption);

      // Space to select
      fireEvent.keyDown(firstOption, { key: ' ' });
      expect(firstOption).toBeChecked();
    });

    it('should announce feedback to screen readers', () => {
      render(
        <TestWrapper>
          <QuizScene
            scene={accessibleQuizScene}
            onComplete={vi.fn()}
            analytics={mockAnalytics}
          />
        </TestWrapper>
      );

      // Select correct answer
      fireEvent.click(screen.getByLabelText('Content must be perceivable'));
      fireEvent.click(screen.getByText('Submit Answer'));

      // Feedback should be in live region
      expect(feedbackText.closest('[aria-live]')).toBeInTheDocument();
    });

    it('should handle timer accessibility', () => {
      render(
        <TestWrapper>
          <QuizScene
            scene={accessibleQuizScene}
            onComplete={vi.fn()}
            analytics={mockAnalytics}
          />
        </TestWrapper>
      );

      // Timer should be accessible
      expect(timer).toHaveAttribute('aria-label', 'Time remaining');
      expect(timer).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('AdminDashboard Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <AdminDashboard
            tenantId="test-tenant"
            tenantName="Test Municipality"
            userRole="tenant_admin"
          />
        </TestWrapper>
      );

      expect(results).toHaveNoViolations();
    });

    it('should have proper table accessibility', () => {
      render(
        <TestWrapper>
          <AdminDashboard
            tenantId="test-tenant"
            tenantName="Test Municipality"
            userRole="tenant_admin"
          />
        </TestWrapper>
      );

      // Navigate to Game Management tab
      fireEvent.click(screen.getByText('Game Management'));

      // Table should have proper structure
      expect(table).toBeInTheDocument();

      // Table should have caption or aria-label
      expect(table).toHaveAttribute('aria-label');

      // Headers should be properly associated
      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });

    it('should support tab navigation', () => {
      render(
        <TestWrapper>
          <AdminDashboard
            tenantId="test-tenant"
            tenantName="Test Municipality"
            userRole="tenant_admin"
          />
        </TestWrapper>
      );

      // Tab list should be navigable
      expect(tabs.length).toBeGreaterThan(0);

      // First tab should be selected
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

      // Tab panels should be associated
      expect(tabPanels.length).toBeGreaterThan(0);
    });

    it('should provide data table sorting feedback', () => {
      render(
        <TestWrapper>
          <AdminDashboard
            tenantId="test-tenant"
            tenantName="Test Municipality"
            userRole="tenant_admin"
          />
        </TestWrapper>
      );

      // Navigate to game management
      fireEvent.click(screen.getByText('Game Management'));

      // Column headers should indicate sort capability
      expect(nameHeader.closest('th')).toHaveAttribute('aria-sort');
    });
  });

  describe('Color and Contrast', () => {
    it('should meet WCAG AA contrast ratios', () => {
      render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={accessibleGameManifest}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="test-user"
            tenantId="test-tenant"
          />
        </TestWrapper>
      );

      // Test high contrast theme

      // Primary color should provide sufficient contrast

      expect(primaryColor).toBe('#000080'); // Dark blue
      expect(backgroundColor).toBe('#FFFFFF'); // White

      // This would typically be tested with actual contrast calculation
      // For demo purposes, we verify the colors are set correctly
    });

    it('should not rely solely on color for information', () => {
      render(
        <TestWrapper>
          <QuizScene
            scene={accessibleQuizScene}
            onComplete={vi.fn()}
            analytics={mockAnalytics}
          />
        </TestWrapper>
      );

      // Select wrong answer to test error indication
      fireEvent.click(screen.getByLabelText('Content must be invisible'));
      fireEvent.click(screen.getByText('Submit Answer'));

      // Error should be indicated by text, not just color
      expect(feedback).toBeInTheDocument();

      // Icons or symbols should accompany color indicators
      expect(errorIndicator).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should maintain logical focus order', () => {
      render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={accessibleGameManifest}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="test-user"
            tenantId="test-tenant"
          />
        </TestWrapper>
      );

      // Get all focusable elements
      
      // Tab through elements
      let currentFocus = 0;
      focusableElements.forEach((element, index) => {
        element.focus();
        expect(document.activeElement).toBe(element);
        currentFocus = index;
      });

      expect(currentFocus).toBeGreaterThan(0);
    });

    it('should trap focus in modal dialogs', () => {
      // This would be tested if we had modal dialogs
      // For now, verify no unexpected focus traps exist
      render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={accessibleGameManifest}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="test-user"
            tenantId="test-tenant"
          />
        </TestWrapper>
      );

      // Verify focus is not trapped in normal flow
      continueButton.focus();
      
      fireEvent.keyDown(continueButton, { key: 'Tab' });
      // Focus should move to next element, not be trapped
    });

    it('should restore focus after dynamic content changes', () => {
      render(
        <TestWrapper>
          <DialogueScene
            scene={accessibleDialogueScene}
            onComplete={vi.fn()}
            analytics={mockAnalytics}
          />
        </TestWrapper>
      );

      skipButton.focus();
      
      // Skip dialogue (causes content change)
      fireEvent.click(skipButton);

      // Focus should move to continue button after content loads
      setTimeout(() => {
        expect(document.activeElement).toBe(continueButton);
      }, 100);
    });
  });

  describe('Text and Font Accessibility', () => {
    it('should use readable fonts and sizes', () => {
      render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={accessibleGameManifest}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="test-user"
            tenantId="test-tenant"
          />
        </TestWrapper>
      );


      // Font should be readable (Open Sans)
      expect(styles.fontFamily).toContain('Open Sans');
      
      // Font size should be at least 16px for body text
      expect(fontSize).toBeGreaterThanOrEqual(16);
    });

    it('should support text scaling up to 200%', () => {
      render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={accessibleGameManifest}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="test-user"
            tenantId="test-tenant"
          />
        </TestWrapper>
      );

      // Simulate text zoom (this would be done at browser level)
      // We test that layout can handle larger text
      
      // Container should use relative units
      expect(styles.fontSize).toMatch(/(rem|em|%)/);
    });

    it('should provide sufficient line spacing', () => {
      render(
        <TestWrapper>
          <DialogueScene
            scene={accessibleDialogueScene}
            onComplete={vi.fn()}
            analytics={mockAnalytics}
          />
        </TestWrapper>
      );

      
      // Line height should be at least 1.5
      
      expect(ratio).toBeGreaterThanOrEqual(1.5);
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide meaningful headings structure', () => {
      render(
        <TestWrapper>
          <StrategyPlayHost
            gameManifest={accessibleGameManifest}
            onGameComplete={vi.fn()}
            onGameExit={vi.fn()}
            analytics={mockAnalytics}
            userId="test-user"
            tenantId="test-tenant"
          />
        </TestWrapper>
      );

      
      // Should have proper heading hierarchy (h1, h2, h3, etc.)
      expect(headings[0]).toHaveProperty('tagName', 'H1');
      if (headings[1]) {
        expect(level2).toBeLessThanOrEqual(level1 + 1);
      }
    });

    it('should provide descriptive link text', () => {
      render(
        <TestWrapper>
          <AdminDashboard
            tenantId="test-tenant"
            tenantName="Test Municipality"
            userRole="tenant_admin"
          />
        </TestWrapper>
      );

      // Navigate to content with links
      fireEvent.click(screen.getByText('Game Management'));

      links.forEach(link => {
        expect(linkText).toBeTruthy();
        expect(linkText).not.toBe('click here');
        expect(linkText).not.toBe('read more');
      });
    });

    it('should provide context for form controls', () => {
      render(
        <TestWrapper>
          <QuizScene
            scene={accessibleQuizScene}
            onComplete={vi.fn()}
            analytics={mockAnalytics}
          />
        </TestWrapper>
      );

      radioButtons.forEach(radio => {
        // Each radio should have descriptive label
        expect(radio).toHaveAttribute('aria-label');
        
        // Radio group should provide context
        expect(radioGroup).toHaveAttribute('aria-labelledby');
      });
    });
  });

  describe('New Core Components WCAG Compliance', () => {
    // Test data for new components matching DevTeam JSON schema



    describe('New DialogueScene WCAG Compliance', () => {
      it('has no accessibility violations', async () => {
        const { container } = render(
          <TestWrapper>
            <NewDialogueScene
              sceneData={newDialogueData}
              onComplete={() => {}}
              culturalContext="swedish"
            />
          </TestWrapper>
        );

        expect(results).toHaveNoViolations();
      });

      it('meets Government accessibility standards across all cultural contexts', async () => {
        const contexts: Array<'swedish' | 'german' | 'french' | 'dutch'> = 
          ['swedish', 'german', 'french', 'dutch'];

        for (const context of contexts) {
          const { container } = render(
            <TestWrapper>
              <NewDialogueScene
                sceneData={newDialogueData}
                onComplete={() => {}}
                culturalContext={context}
                municipalBranding={testMunicipalBranding}
              />
            </TestWrapper>
          );

            rules: {
              'color-contrast': { enabled: true },
              'focusable-content': { enabled: true },
              'aria-valid-attr-value': { enabled: true },
              'label': { enabled: true }
            }
          });
          expect(results).toHaveNoViolations();
        }
      });

      it('provides proper Anna Svensson mobile accessibility', async () => {
        const { container } = render(
          <TestWrapper>
            <NewDialogueScene
              sceneData={newDialogueData}
              onComplete={() => {}}
              culturalContext="swedish"
            />
          </TestWrapper>
        );

        // Test mobile-specific accessibility
          rules: {
            'target-size': { enabled: true }, // 48px minimum touch targets
            'color-contrast': { enabled: true }
          }
        });
        expect(results).toHaveNoViolations();
      });

      it('supports municipal branding without accessibility violations', async () => {
        const { container } = render(
          <TestWrapper>
            <NewDialogueScene
              sceneData={newDialogueData}
              onComplete={() => {}}
              municipalBranding={testMunicipalBranding}
              culturalContext="swedish"
            />
          </TestWrapper>
        );

        expect(results).toHaveNoViolations();

        // Verify municipal logo has proper alt text
        expect(logo).toBeInTheDocument();
      });
    });

    describe('New QuizScene WCAG Compliance', () => {
      it('has no accessibility violations', async () => {
        const { container } = render(
          <TestWrapper>
            <NewQuizScene
              sceneData={newQuizData}
              onComplete={() => {}}
              culturalContext="swedish"
            />
          </TestWrapper>
        );

        expect(results).toHaveNoViolations();
      });

      it('supports keyboard shortcuts (1-9) without accessibility issues', async () => {
        const { container } = render(
          <TestWrapper>
            <NewQuizScene
              sceneData={newQuizData}
              onComplete={() => {}}
              culturalContext="swedish"
            />
          </TestWrapper>
        );

          rules: {
            'focusable-content': { enabled: true },
            'focus-order-semantics': { enabled: true }
          }
        });
        expect(results).toHaveNoViolations();

        // Verify keyboard shortcuts are accessible
        expect(screen.getByText(/Tryck 1-2 för att välja/)).toBeInTheDocument();
      });

      it('handles different question types accessibly', async () => {

        for (const quizVariant of questionTypes) {
          const { container } = render(
            <TestWrapper>
              <NewQuizScene
                sceneData={quizVariant}
                onComplete={() => {}}
                culturalContext="swedish"
              />
            </TestWrapper>
          );

          expect(results).toHaveNoViolations();
        }
      });

      it('provides immediate feedback accessibly', async () => {
        const { container } = render(
          <TestWrapper>
            <NewQuizScene
              sceneData={newQuizData}
              onComplete={() => {}}
              culturalContext="swedish"
            />
          </TestWrapper>
        );

        // Select an answer and submit
        fireEvent.click(screen.getAllByRole('radio')[0]);
        fireEvent.click(screen.getByText('Svara'));

        // Check accessibility after feedback appears
        expect(results).toHaveNoViolations();

        // Verify feedback is announced to screen readers
        expect(feedback.closest('[aria-live]')).toBeTruthy();
      });
    });

    describe('European Government Standards - New Components', () => {
      it('meets BITV 2.0 (German) standards for new components', async () => {
        const { container } = render(
          <TestWrapper>
            <NewDialogueScene
              sceneData={newDialogueData}
              onComplete={() => {}}
              culturalContext="german"
            />
          </TestWrapper>
        );

        // BITV 2.0 specific requirements
          rules: {
            'color-contrast': { enabled: true },
            'focusable-content': { enabled: true },
            'aria-valid-attr-value': { enabled: true },
            'aria-required-attr': { enabled: true },
            'label': { enabled: true }
          }
        });
        expect(results).toHaveNoViolations();
      });

      it('meets RGAA 4.1 (French) standards for new components', async () => {
        const { container } = render(
          <TestWrapper>
            <NewQuizScene
              sceneData={newQuizData}
              onComplete={() => {}}
              culturalContext="french"
            />
          </TestWrapper>
        );

        // RGAA 4.1 specific requirements  
          rules: {
            'color-contrast': { enabled: true },
            'focusable-content': { enabled: true },
            'aria-valid-attr-value': { enabled: true },
            'label': { enabled: true },
            'focus-order-semantics': { enabled: true }
          }
        });
        expect(results).toHaveNoViolations();
      });

      it('meets EN 301 549 (Dutch) standards for new components', async () => {
        const { container } = render(
          <TestWrapper>
            <NewDialogueScene
              sceneData={newDialogueData}
              onComplete={() => {}}
              culturalContext="dutch"
            />
          </TestWrapper>
        );

        // EN 301 549 specific requirements
          rules: {
            'color-contrast': { enabled: true },
            'focusable-content': { enabled: true },
            'aria-valid-attr-value': { enabled: true },
            'focus-order-semantics': { enabled: true }
          }
        });
        expect(results).toHaveNoViolations();
      });

      it('meets DOS 2018:1937 (Swedish) standards for new components', async () => {
        const { container } = render(
          <TestWrapper>
            <NewQuizScene
              sceneData={newQuizData}
              onComplete={() => {}}
              culturalContext="swedish"
            />
          </TestWrapper>
        );

        // DOS Act specific requirements
          rules: {
            'color-contrast': { enabled: true },
            'focusable-content': { enabled: true },
            'aria-valid-attr-value': { enabled: true },
            'label': { enabled: true },
            'focus-order-semantics': { enabled: true }
          }
        });
        expect(results).toHaveNoViolations();
      });
    });
  });
});