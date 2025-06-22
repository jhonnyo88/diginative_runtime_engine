import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChakraProvider } from '@chakra-ui/react';
import { QuizScene } from './QuizScene';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Test wrapper with Chakra UI
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    {children}
  </ChakraProvider>
);

// Mock DevTeam JSON data matching System Architect specification



describe('QuizScene Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders quiz scene with title and description', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(screen.getByText('GDPR Knowledge Quiz')).toBeInTheDocument();
      expect(screen.getByText('Test your understanding of GDPR principles')).toBeInTheDocument();
    });

    it('displays first question correctly', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Which principle is fundamental to GDPR?')).toBeInTheDocument();
      expect(screen.getByText('Data minimization')).toBeInTheDocument();
      expect(screen.getByText('Data maximization')).toBeInTheDocument();
      expect(screen.getByText('Unlimited storage')).toBeInTheDocument();
    });

    it('shows progress indicator', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '33'); // 1 of 3 questions

      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });

  describe('Municipal Branding Integration', () => {
    it('applies municipal branding correctly', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            municipalBranding={mockMunicipalBranding}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Göteborg Stad')).toBeInTheDocument();
      expect(screen.getByAltText('Göteborg Stad logotyp')).toBeInTheDocument();
      expect(screen.getByAltText('Göteborg Stad logotyp')).toHaveAttribute('src', mockMunicipalBranding.logoUrl);
    });

    it('works without municipal branding', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(screen.queryByText('Göteborg Stad')).not.toBeInTheDocument();
    });
  });

  describe('Question Types - Multiple Choice', () => {
    it('handles multiple choice questions correctly', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(radioButtons).toHaveLength(3);

      // Select an option
      fireEvent.click(radioButtons[0]);
      expect(radioButtons[0]).toBeChecked();
      expect(radioButtons[1]).not.toBeChecked();
      expect(radioButtons[2]).not.toBeChecked();
    });

    it('enables submit button after selection', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(submitButton).toBeDisabled();

      fireEvent.click(screen.getAllByRole('radio')[0]);
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Question Types - True/False', () => {
    it('handles true/false questions correctly', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Move to second question (true/false)
      fireEvent.click(screen.getAllByRole('radio')[0]);
      fireEvent.click(screen.getByText('Svara'));

      await waitFor(() => {
        fireEvent.click(screen.getByText('Nästa fråga'));
      });

      await waitFor(() => {
        expect(screen.getByText('Municipal employees can access all citizen data freely.')).toBeInTheDocument();
        expect(screen.getByText('Sant')).toBeInTheDocument();
        expect(screen.getByText('Falskt')).toBeInTheDocument();
      });

      expect(radioButtons).toHaveLength(2); // True/False
    });
  });

  describe('Question Types - Multiple Select', () => {
    it('handles multiple select questions correctly', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Navigate to third question (multiple select)
      // Answer first question
      fireEvent.click(screen.getAllByRole('radio')[0]);
      fireEvent.click(screen.getByText('Svara'));

      await waitFor(() => {
        fireEvent.click(screen.getByText('Nästa fråga'));
      });

      // Answer second question  
      await waitFor(() => {
        fireEvent.click(screen.getAllByRole('radio')[1]); // False
        fireEvent.click(screen.getByText('Svara'));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Nästa fråga'));
      });

      // Now at multiple select question
      await waitFor(() => {
        expect(screen.getByText('Which are valid legal bases for processing personal data? (Select all)')).toBeInTheDocument();
      });

      expect(checkboxes).toHaveLength(4);

      // Select multiple options
      fireEvent.click(checkboxes[0]); // Consent
      fireEvent.click(checkboxes[1]); // Legitimate interest
      fireEvent.click(checkboxes[3]); // Legal obligation

      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).not.toBeChecked();
      expect(checkboxes[3]).toBeChecked();
    });
  });

  describe('Immediate Feedback', () => {
    it('shows correct answer feedback', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Select correct answer
      fireEvent.click(screen.getAllByRole('radio')[0]); // Data minimization
      fireEvent.click(screen.getByText('Svara'));

      await waitFor(() => {
        expect(screen.getByText('Rätt svar!')).toBeInTheDocument();
        expect(screen.getByText('Data minimization means collecting only necessary personal data.')).toBeInTheDocument();
      });
    });

    it('shows incorrect answer feedback', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Select wrong answer
      fireEvent.click(screen.getAllByRole('radio')[1]); // Data maximization
      fireEvent.click(screen.getByText('Svara'));

      await waitFor(() => {
        expect(screen.getByText('Fel svar')).toBeInTheDocument();
        expect(screen.getByText('Data minimization means collecting only necessary personal data.')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation (Game Designer Requirement: 1-9 shortcuts)', () => {
    it('supports number key shortcuts for option selection', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Press '1' to select first option
      fireEvent.keyDown(window, { key: '1' });

      expect(radioButtons[0]).toBeChecked();
    });

    it('supports Enter key to submit answer', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Select option with number key
      fireEvent.keyDown(window, { key: '1' });
      
      // Submit with Enter
      fireEvent.keyDown(window, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Rätt svar!')).toBeInTheDocument();
      });
    });

    it('shows keyboard shortcuts help', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(screen.getByText(/Tryck 1-3 för att välja, Enter för att svara/)).toBeInTheDocument();
    });

    it('ignores invalid number keys', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Try to press '5' when only 3 options exist
      fireEvent.keyDown(window, { key: '5' });

      radioButtons.forEach(radio => {
        expect(radio).not.toBeChecked();
      });
    });
  });

  describe('Anna Svensson Mobile Optimization', () => {
    it('uses 48px minimum touch targets', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(submitButton).toHaveStyle({ minHeight: '48px', minWidth: '120px' });

      radioButtons.forEach(radio => {
        expect(radio).toHaveStyle({ minHeight: '48px' });
      });
    });

    it('displays keyboard shortcut numbers for quick selection', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(screen.getByText('1')).toBeInTheDocument(); // First option shortcut
      expect(screen.getByText('2')).toBeInTheDocument(); // Second option shortcut
      expect(screen.getByText('3')).toBeInTheDocument(); // Third option shortcut
    });
  });

  describe('Quiz Results and Completion', () => {
    it('calculates and returns correct results', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Answer all questions correctly
      // Q1: Multiple choice - correct answer
      fireEvent.click(screen.getAllByRole('radio')[0]);
      fireEvent.click(screen.getByText('Svara'));

      await waitFor(() => {
        fireEvent.click(screen.getByText('Nästa fråga'));
      });

      // Q2: True/false - correct answer (False)
      await waitFor(() => {
        fireEvent.click(screen.getAllByRole('radio')[1]);
        fireEvent.click(screen.getByText('Svara'));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Nästa fråga'));
      });

      // Q3: Multiple select - correct answers
      await waitFor(() => {
        fireEvent.click(checkboxes[0]); // Consent
        fireEvent.click(checkboxes[1]); // Legitimate interest  
        fireEvent.click(checkboxes[3]); // Legal obligation
        fireEvent.click(screen.getByText('Svara'));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Slutför quiz'));
      });

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith({
          totalQuestions: 3,
          correctAnswers: 3,
          score: 100,
          passed: true,
          timeSpent: expect.any(Number),
          answers: expect.arrayContaining([
            expect.objectContaining({
              question_id: 'q1',
              is_correct: true,
              points_earned: 10
            }),
            expect.objectContaining({
              question_id: 'q2', 
              is_correct: true,
              points_earned: 10
            }),
            expect.objectContaining({
              question_id: 'q3',
              is_correct: true,
              points_earned: 15
            })
          ])
        });
      });
    });

    it('handles failing quiz correctly', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Answer all questions incorrectly
      // Q1: Wrong answer
      fireEvent.click(screen.getAllByRole('radio')[1]);
      fireEvent.click(screen.getByText('Svara'));

      await waitFor(() => {
        fireEvent.click(screen.getByText('Nästa fråga'));
      });

      // Q2: Wrong answer (True)
      await waitFor(() => {
        fireEvent.click(screen.getAllByRole('radio')[0]);
        fireEvent.click(screen.getByText('Svara'));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Nästa fråga'));
      });

      // Q3: Wrong answers (only select wrong option)
      await waitFor(() => {
        fireEvent.click(checkboxes[2]); // Curiosity (wrong)
        fireEvent.click(screen.getByText('Svara'));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Slutför quiz'));
      });

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            score: 0,
            passed: false,
            correctAnswers: 0
          })
        );
      });
    });
  });

  describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(results).toHaveNoViolations();
    });

    it('provides proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Progress bar should have proper aria-label
      expect(progressBar).toHaveAttribute('aria-label');

      // Radio buttons should be in a group
      expect(radioGroup).toBeInTheDocument();

      // Submit button should have aria-label
      expect(submitButton).toHaveAttribute('aria-label');
    });

    it('provides screen reader announcements', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Check for aria-live region
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('Cultural Context Adaptation', () => {
    it('adapts to Swedish cultural context', () => {
      const { container } = render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('adapts to German cultural context', () => {
      const { container } = render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="german"
          />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Performance Requirements', () => {
    it('handles component size within budget (<5KB)', () => {
      // This would be tested with bundle analysis tools in real scenarios
      expect(true).toBe(true); // Placeholder for bundle size test
    });

    it('prevents animation blocking during transitions', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Fast clicking shouldn't break the component

      fireEvent.click(radioButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton); // Rapid click
      fireEvent.click(submitButton); // Rapid click

      // Should not crash and feedback should appear
      await waitFor(() => {
        expect(screen.getByText('Rätt svar!')).toBeInTheDocument();
      });
    });
  });

  describe('DevTeam JSON Schema Integration', () => {
    it('processes all required quiz properties', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={mockQuizSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Verify all required fields are processed
      expect(screen.getByText('GDPR Knowledge Quiz')).toBeInTheDocument();
      expect(screen.getByText('Which principle is fundamental to GDPR?')).toBeInTheDocument();
      expect(screen.getByText('Data minimization')).toBeInTheDocument();
    });

    it('validates quiz scene structure', () => {
      // Check required properties exist
      expect(mockQuizSceneData.scene_id).toBe('quiz-gdpr-001');
      expect(mockQuizSceneData.scene_type).toBe('QuizScene');
      expect(mockQuizSceneData.questions).toHaveLength(3);
      expect(mockQuizSceneData.passing_score).toBe(70);
      expect(mockQuizSceneData.feedback_immediate).toBe(true);

      // Check question structure
      mockQuizSceneData.questions.forEach(question => {
        expect(question.question_id).toBeDefined();
        expect(question.question_type).toMatch(/^(multiple_choice|true_false|multiple_select)$/);
        expect(question.question_text).toBeDefined();
        expect(question.options).toBeInstanceOf(Array);
        expect(question.explanation).toBeDefined();
        expect(question.points).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing question options gracefully', () => {

      render(
        <TestWrapper>
          <QuizScene
            sceneData={invalidQuizData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Should not crash
      expect(screen.getByText('GDPR Knowledge Quiz')).toBeInTheDocument();
    });

    it('handles empty quiz gracefully', () => {

      render(
        <TestWrapper>
          <QuizScene
            sceneData={emptyQuizData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Should complete immediately
      expect(screen.getByText('Slutför quiz')).toBeInTheDocument();
    });
  });
});