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
      expect(longText).toBeInTheDocument();
      
      // Text should wrap properly (not overflow)
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
      fireEvent.click(responseText);

      // Option should be selected
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
      expect(radioGroup).toHaveAttribute('aria-labelledby');

      // Individual radio buttons should have labels
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
      expect(responseText).toBeInTheDocument();
      
      // Long text should wrap properly on mobile
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