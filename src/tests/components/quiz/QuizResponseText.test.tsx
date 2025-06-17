import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChakraProvider } from '@chakra-ui/react';
import { QuizScene } from '../../../components/QuizScene/QuizScene';

// Extend Jest matchers for accessibility
expect.extend(toHaveNoViolations);

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    {children}
  </ChakraProvider>
);

// Test data for quiz response text functionality
const quizResponseTestData = {
  scene_id: 'quiz-response-text-test',
  scene_type: 'QuizScene' as const,
  title: 'Quiz Response Text Functionality Test',
  description: 'Testing quiz response text visibility and interaction',
  questions: [
    {
      question_id: 'response-text-q1',
      question_type: 'multiple_choice' as const,
      question_text: 'Which response shows proper text visibility?',
      options: [
        {
          option_id: 'option-visible',
          text: 'This response text should be clearly visible',
          is_correct: true
        },
        {
          option_id: 'option-long',
          text: 'This is a much longer response text that should wrap properly and maintain readability across different screen sizes including Anna Svensson iPhone 12',
          is_correct: false
        },
        {
          option_id: 'option-special',
          text: 'Special characters: åäö ÅÄÖ €£$',
          is_correct: false
        }
      ],
      explanation: 'Response text should be clearly visible and accessible.',
      learning_objective: 'Understand quiz response text functionality',
      points: 10
    },
    {
      question_id: 'response-text-q2',
      question_type: 'true_false' as const,
      question_text: 'True or False: Quiz response text should be accessible?',
      options: [
        {
          option_id: 'true',
          text: 'Sant - Quiz response text must be accessible',
          is_correct: true
        },
        {
          option_id: 'false',
          text: 'Falskt - Accessibility is not important',
          is_correct: false
        }
      ],
      explanation: 'Accessibility is crucial for quiz response text.',
      learning_objective: 'Understand accessibility requirements',
      points: 5
    },
    {
      question_id: 'response-text-q3',
      question_type: 'multiple_select' as const,
      question_text: 'Select all that apply to proper quiz response text:',
      options: [
        {
          option_id: 'readable',
          text: 'Must be readable',
          is_correct: true
        },
        {
          option_id: 'accessible',
          text: 'Must be accessible',
          is_correct: true
        },
        {
          option_id: 'invisible',
          text: 'Should be invisible',
          is_correct: false
        },
        {
          option_id: 'interactive',
          text: 'Must be interactive',
          is_correct: true
        }
      ],
      explanation: 'Quiz response text must be readable, accessible, and interactive.',
      learning_objective: 'Understand quiz response requirements',
      points: 15
    }
  ],
  passing_score: 70,
  scene_duration: 300,
  feedback_immediate: true
};

const mockMunicipalBranding = {
  primaryColor: '#1e40af',
  logoUrl: 'https://example.se/quiz-logo.svg',
  municipality: 'Quiz Test Municipality'
};

const mockOnComplete = vi.fn();

describe('Quiz Response Text Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Response Text Visibility', () => {
    it('displays all quiz response options with proper text visibility', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // All response options should be visible
      expect(screen.getByText('This response text should be clearly visible')).toBeInTheDocument();
      expect(screen.getByText(/This is a much longer response text/)).toBeInTheDocument();
      expect(screen.getByText('Special characters: åäö ÅÄÖ €£$')).toBeInTheDocument();
    });

    it('handles long response text with proper wrapping', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Long text should be visible and properly wrapped
      const longText = screen.getByText(/This is a much longer response text/);
      expect(longText).toBeInTheDocument();
      
      // Text should wrap properly (not overflow)
      const radioButton = longText.closest('[role="radio"]');
      expect(radioButton).toBeInTheDocument();
    });

    it('displays special characters correctly in response text', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Special characters should be displayed correctly
      expect(screen.getByText('Special characters: åäö ÅÄÖ €£$')).toBeInTheDocument();
    });

    it('maintains text visibility after answer selection', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Select an answer
      const firstOption = screen.getByLabelText(/This response text should be clearly visible/);
      fireEvent.click(firstOption);

      // Text should still be visible after selection
      expect(screen.getByText('This response text should be clearly visible')).toBeInTheDocument();
      expect(firstOption).toBeChecked();
    });
  });

  describe('Response Text Interaction', () => {
    it('allows clicking on response text to select option', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Click on the text itself (not just the radio button)
      const responseText = screen.getByText('This response text should be clearly visible');
      fireEvent.click(responseText);

      // Option should be selected
      const radioButton = screen.getByLabelText(/This response text should be clearly visible/);
      expect(radioButton).toBeChecked();
    });

    it('provides keyboard navigation for response text', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Test keyboard shortcuts (1-3 for options)
      fireEvent.keyDown(window, { key: '1' });
      
      const firstOption = screen.getByLabelText(/This response text should be clearly visible/);
      expect(firstOption).toBeChecked();
    });

    it('shows response text keyboard shortcuts (1-9)', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Keyboard shortcut indicators should be visible
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      
      // Help text for keyboard shortcuts
      expect(screen.getByText(/Tryck 1-3 för att välja/)).toBeInTheDocument();
    });
  });

  describe('True/False Response Text', () => {
    it('displays true/false response text correctly', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Navigate to true/false question
      const submitButton = screen.getByText('Svara');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Sant - Quiz response text must be accessible')).toBeInTheDocument();
        expect(screen.getByText('Falskt - Accessibility is not important')).toBeInTheDocument();
      }, { timeout: 15000 });
    });

    it('allows selection of true/false response text', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Navigate to true/false question
      fireEvent.click(screen.getByText('Svara'));

      await waitFor(() => {
        const trueOption = screen.getByLabelText(/Sant - Quiz response text must be accessible/);
        fireEvent.click(trueOption);
        expect(trueOption).toBeChecked();
      }, { timeout: 15000 });
    });
  });

  describe('Multiple Select Response Text', () => {
    it('displays multiple select response text correctly', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Navigate to multiple select question (question 3)
      fireEvent.click(screen.getByText('Svara')); // Q1 -> Q2
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Svara')); // Q2 -> Q3
      }, { timeout: 15000 });

      await waitFor(() => {
        expect(screen.getByText('Must be readable')).toBeInTheDocument();
        expect(screen.getByText('Must be accessible')).toBeInTheDocument();
        expect(screen.getByText('Should be invisible')).toBeInTheDocument();
        expect(screen.getByText('Must be interactive')).toBeInTheDocument();
      }, { timeout: 15000 });
    });

    it('allows multiple selection of response text', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Navigate to multiple select question
      fireEvent.click(screen.getByText('Svara'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Svara'));
      }, { timeout: 15000 });

      await waitFor(() => {
        // Select multiple options
        const readableOption = screen.getByLabelText(/Must be readable/);
        const accessibleOption = screen.getByLabelText(/Must be accessible/);
        
        fireEvent.click(readableOption);
        fireEvent.click(accessibleOption);
        
        expect(readableOption).toBeChecked();
        expect(accessibleOption).toBeChecked();
      }, { timeout: 15000 });
    });
  });

  describe('Response Text Accessibility', () => {
    it('has no accessibility violations in quiz response text', async () => {
      const { container } = render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper ARIA labels for response text', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Radio group should have proper labeling
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('aria-labelledby');

      // Individual radio buttons should have labels
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).toHaveAttribute('aria-label');
      });
    });

    it('announces response text selection to screen readers', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Select an option
      const firstOption = screen.getByLabelText(/This response text should be clearly visible/);
      fireEvent.click(firstOption);

      // Should provide feedback for screen readers
      expect(firstOption).toBeChecked();
      expect(firstOption).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Response Text with Municipal Branding', () => {
    it('maintains response text visibility with municipal branding', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            municipalBranding={mockMunicipalBranding}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Municipal branding should not interfere with text visibility
      expect(screen.getByText('Quiz Test Municipality')).toBeInTheDocument();
      expect(screen.getByText('This response text should be clearly visible')).toBeInTheDocument();
    });

    it('applies municipal colors to response text selection', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            municipalBranding={mockMunicipalBranding}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Select an option to test color application
      const firstOption = screen.getByLabelText(/This response text should be clearly visible/);
      fireEvent.click(firstOption);
      
      expect(firstOption).toBeChecked();
      // Municipal branding should be visible
      expect(screen.getByText('Quiz Test Municipality')).toBeInTheDocument();
    });
  });

  describe('Response Text Mobile Optimization', () => {
    it('optimizes response text for Anna Svensson iPhone 12', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Response options should have proper touch targets
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        // 48px minimum touch target for Anna Svensson
        expect(radio).toHaveStyle({ minHeight: '48px' });
      });
    });

    it('maintains text readability on mobile devices', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Text should be readable with appropriate sizing
      const responseText = screen.getByText('This response text should be clearly visible');
      expect(responseText).toBeInTheDocument();
      
      // Long text should wrap properly on mobile
      const longText = screen.getByText(/This is a much longer response text/);
      expect(longText).toBeInTheDocument();
    });
  });

  describe('Response Text Feedback', () => {
    it('shows feedback text after response submission', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Select correct answer
      const correctOption = screen.getByLabelText(/This response text should be clearly visible/);
      fireEvent.click(correctOption);
      
      // Submit answer
      fireEvent.click(screen.getByText('Svara'));

      await waitFor(() => {
        // Feedback should be displayed
        expect(screen.getByText(/Rätt svar!/)).toBeInTheDocument();
        expect(screen.getByText('Response text should be clearly visible and accessible.')).toBeInTheDocument();
      }, { timeout: 15000 });
    });

    it('displays incorrect feedback with proper text visibility', async () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Select incorrect answer
      const incorrectOption = screen.getByLabelText(/Special characters/);
      fireEvent.click(incorrectOption);
      
      // Submit answer
      fireEvent.click(screen.getByText('Svara'));

      await waitFor(() => {
        // Incorrect feedback should be displayed
        expect(screen.getByText(/Fel svar/)).toBeInTheDocument();
        expect(screen.getByText('Response text should be clearly visible and accessible.')).toBeInTheDocument();
      }, { timeout: 15000 });
    });
  });

  describe('Response Text Performance', () => {
    it('renders response text quickly without performance issues', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly
      expect(renderTime).toBeLessThan(100);
      
      // All response text should be visible
      expect(screen.getByText('This response text should be clearly visible')).toBeInTheDocument();
    });

    it('handles complex response text without lag', () => {
      render(
        <TestWrapper>
          <QuizScene
            sceneData={quizResponseTestData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Complex text with special characters should render without issues
      expect(screen.getByText('Special characters: åäö ÅÄÖ €£$')).toBeInTheDocument();
      expect(screen.getByText(/This is a much longer response text/)).toBeInTheDocument();
    });
  });
});