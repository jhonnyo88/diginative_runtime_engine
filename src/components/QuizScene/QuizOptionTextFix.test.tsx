/**
 * QuizScene Option Text Fix Tests
 * Testing fix for missing quiz answer text bug
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QuizScene } from './QuizScene';
import { vi } from 'vitest';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    {children}
  </ChakraProvider>
);

describe('QuizScene Option Text Fix', () => {




  test('renders option text from option_text field correctly', () => {
    render(
      <TestWrapper>
        <QuizScene
          sceneData={testQuizDataWithOptionText}
          onComplete={mockOnComplete}
          culturalContext="swedish"
        />
      </TestWrapper>
    );

    // Should show option text from option_text field
    expect(screen.getByText('Option A with option_text field')).toBeInTheDocument();
    expect(screen.getByText('Option B with option_text field')).toBeInTheDocument();
  });

  test('renders option text from text field correctly', () => {
    render(
      <TestWrapper>
        <QuizScene
          sceneData={testQuizDataWithText}
          onComplete={mockOnComplete}
          culturalContext="swedish"
        />
      </TestWrapper>
    );

    // Should show option text from standard text field
    expect(screen.getByText('Option A with text field')).toBeInTheDocument();
    expect(screen.getByText('Option B with text field')).toBeInTheDocument();
  });

  test('handles missing option text gracefully', () => {
    // Suppress console.error for this test
    console.error = vi.fn();

    render(
      <TestWrapper>
        <QuizScene
          sceneData={testQuizDataWithMissingText}
          onComplete={mockOnComplete}
          culturalContext="swedish"
        />
      </TestWrapper>
    );

    // Should show error message for missing option text
    expect(screen.getByText('Fel i frågans svarsalternativ')).toBeInTheDocument();
    expect(screen.getByText(/Ett eller flera svarsalternativ saknar text/)).toBeInTheDocument();

    // Should log error
    expect(console.error).toHaveBeenCalledWith(
      'QuizScene: Missing option text in question',
      'q3'
    );

    console.error = originalError;
  });

  test('disables submit button when options have no text', () => {
    render(
      <TestWrapper>
        <QuizScene
          sceneData={testQuizDataWithMissingText}
          onComplete={mockOnComplete}
          culturalContext="swedish"
        />
      </TestWrapper>
    );

    // Submit button should be disabled
    expect(submitButton).toBeDisabled();
  });

  test('allows selection and submission with valid option text', () => {
    render(
      <TestWrapper>
        <QuizScene
          sceneData={testQuizDataWithOptionText}
          onComplete={mockOnComplete}
          culturalContext="swedish"
        />
      </TestWrapper>
    );

    // Should be able to select an option
    fireEvent.click(optionA);

    // Submit button should now be enabled
    expect(submitButton).not.toBeDisabled();

    // Should be able to submit
    fireEvent.click(submitButton);

    // Should show feedback
    expect(screen.getByText(/Rätt svar|Fel svar/)).toBeInTheDocument();
  });

  test('handles mixed text formats correctly', () => {

    render(
      <TestWrapper>
        <QuizScene
          sceneData={mixedFormatData}
          onComplete={mockOnComplete}
          culturalContext="swedish"
        />
      </TestWrapper>
    );

    // Should handle both formats correctly
    expect(screen.getByText('Option A with text field')).toBeInTheDocument();
    expect(screen.getByText('Option B with option_text field')).toBeInTheDocument();
  });

  test('keyboard shortcuts work with fixed option text', () => {
    render(
      <TestWrapper>
        <QuizScene
          sceneData={testQuizDataWithOptionText}
          onComplete={mockOnComplete}
          culturalContext="swedish"
        />
      </TestWrapper>
    );

    // Press "1" to select first option
    fireEvent.keyDown(window, { key: '1' });

    // Submit button should be enabled
    expect(submitButton).not.toBeDisabled();

    // Press Enter to submit
    fireEvent.keyDown(window, { key: 'Enter' });

    // Should show feedback
    expect(screen.getByText(/Rätt svar|Fel svar/)).toBeInTheDocument();
  });
});