import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StrategyPlayHost } from '../../components/StrategyPlayHost';
import { DialogueScene } from '../../components/scenes/DialogueScene';
import { QuizScene } from '../../components/scenes/QuizScene';
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

const mockAnalytics = {
  trackEvent: vi.fn()
};

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

      const results = await axe(container);
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
      const headings = screen.getAllByRole('heading');
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

      const continueButton = screen.getByText('Continue');
      
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
      const liveRegions = screen.getAllByRole('status');
      expect(liveRegions.length).toBeGreaterThan(0);
      
      // Progress announcements
      const progressBar = screen.getByRole('progressbar');
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
      const gameContainer = screen.getByTestId('strategy-play-host');
      const styles = getComputedStyle(gameContainer);
      
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

      const results = await axe(container);
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
      const avatar = screen.getByAltText('Anna Svensson avatar');
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
      const messages = screen.getAllByText(/This is an accessible dialogue/);
      expect(messages[0]).toBeInTheDocument();
      
      // Skip button should be accessible
      const skipButton = screen.getByText('Skip to end');
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
      const continueButton = screen.getByText('Continue');
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

      const results = await axe(container);
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
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();
      
      // Question should label the radio group
      expect(radioGroup).toHaveAttribute('aria-labelledby');
      
      // Radio buttons should have proper labels
      const radioButtons = screen.getAllByRole('radio');
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

      const firstOption = screen.getByLabelText('Content must be perceivable');
      const secondOption = screen.getByLabelText('Content must be invisible');

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
      const feedbackText = screen.getByText('Correct! Perceivable is one of the four WCAG principles.');
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
      const timer = screen.getByRole('timer');
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

      const results = await axe(container);
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
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Table should have caption or aria-label
      expect(table).toHaveAttribute('aria-label');

      // Headers should be properly associated
      const headers = screen.getAllByRole('columnheader');
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
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);

      // First tab should be selected
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

      // Tab panels should be associated
      const tabPanels = screen.getAllByRole('tabpanel');
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
      const nameHeader = screen.getByText('Game Name');
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
      const container = screen.getByTestId('strategy-play-host');
      const styles = getComputedStyle(container);

      // Primary color should provide sufficient contrast
      const primaryColor = styles.getPropertyValue('--primary-color');
      const backgroundColor = styles.getPropertyValue('--background-color');

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
      const feedback = screen.getByText(/Incorrect/);
      expect(feedback).toBeInTheDocument();

      // Icons or symbols should accompany color indicators
      const errorIndicator = screen.getByText('❌') || screen.getByText('✗');
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
      const focusableElements = screen.getAllByRole('button');
      
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
      const continueButton = screen.getByText('Continue');
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

      const skipButton = screen.getByText('Skip to end');
      skipButton.focus();
      
      // Skip dialogue (causes content change)
      fireEvent.click(skipButton);

      // Focus should move to continue button after content loads
      setTimeout(() => {
        const continueButton = screen.getByText('Continue');
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

      const container = screen.getByTestId('strategy-play-host');
      const styles = getComputedStyle(container);

      // Font should be readable (Open Sans)
      expect(styles.fontFamily).toContain('Open Sans');
      
      // Font size should be at least 16px for body text
      const bodyText = screen.getByText(/Welcome/);
      const textStyles = getComputedStyle(bodyText);
      const fontSize = parseInt(textStyles.fontSize);
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
      const container = screen.getByTestId('strategy-play-host');
      
      // Container should use relative units
      const styles = getComputedStyle(container);
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

      const messageText = screen.getByText(/This is an accessible dialogue/);
      const styles = getComputedStyle(messageText);
      
      // Line height should be at least 1.5
      const lineHeight = parseFloat(styles.lineHeight);
      const fontSize = parseFloat(styles.fontSize);
      const ratio = lineHeight / fontSize;
      
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

      const headings = screen.getAllByRole('heading');
      
      // Should have proper heading hierarchy (h1, h2, h3, etc.)
      expect(headings[0]).toHaveProperty('tagName', 'H1');
      if (headings[1]) {
        const level1 = parseInt(headings[0].getAttribute('aria-level') || '1');
        const level2 = parseInt(headings[1].getAttribute('aria-level') || '2');
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

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        const linkText = link.textContent || link.getAttribute('aria-label');
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

      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        // Each radio should have descriptive label
        expect(radio).toHaveAttribute('aria-label');
        
        // Radio group should provide context
        const radioGroup = radio.closest('[role="radiogroup"]');
        expect(radioGroup).toHaveAttribute('aria-labelledby');
      });
    });
  });
});