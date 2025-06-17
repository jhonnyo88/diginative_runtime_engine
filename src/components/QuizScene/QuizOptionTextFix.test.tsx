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
  const mockOnComplete = vi.fn();

  const testQuizDataWithOptionText = {
    scene_id: 'test-quiz',
    scene_type: 'QuizScene' as const,
    title: 'Test Quiz',
    description: 'Testing option text rendering',
    questions: [
      {
        question_id: 'q1',
        question_type: 'multiple_choice' as const,
        question_text: 'Test question?',
        options: [
          {
            option_id: 'a',
            option_text: 'Option A with option_text field', // Using option_text format
            is_correct: true
          },
          {
            option_id: 'b', 
            option_text: 'Option B with option_text field',
            is_correct: false
          }
        ],
        explanation: 'Test explanation',
        learning_objective: 'Test objective',
        points: 10
      }
    ],
    passing_score: 70,
    scene_duration: 300,
    feedback_immediate: true
  };

  const testQuizDataWithText = {
    scene_id: 'test-quiz-2',
    scene_type: 'QuizScene' as const,
    title: 'Test Quiz 2',
    description: 'Testing text rendering',
    questions: [
      {
        question_id: 'q2',
        question_type: 'multiple_choice' as const,
        question_text: 'Test question 2?',
        options: [
          {
            option_id: 'a',
            text: 'Option A with text field', // Using standard text format
            is_correct: true
          },
          {
            option_id: 'b',
            text: 'Option B with text field',
            is_correct: false
          }
        ],
        explanation: 'Test explanation',
        learning_objective: 'Test objective',
        points: 10
      }
    ],
    passing_score: 70,
    scene_duration: 300,
    feedback_immediate: true
  };

  const testQuizDataWithMissingText = {
    scene_id: 'test-quiz-empty',
    scene_type: 'QuizScene' as const,
    title: 'Test Quiz Empty',
    description: 'Testing empty text handling',
    questions: [
      {
        question_id: 'q3',
        question_type: 'multiple_choice' as const,
        question_text: 'Test question with empty options?',
        options: [
          {
            option_id: 'a',
            // No text or option_text field
            is_correct: true
          },
          {
            option_id: 'b',
            text: '', // Empty text
            is_correct: false
          }
        ],
        explanation: 'Test explanation',
        learning_objective: 'Test objective', 
        points: 10
      }
    ],
    passing_score: 70,
    scene_duration: 300,
    feedback_immediate: true
  };

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
    const originalError = console.error;
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
    const submitButton = screen.getByText('Svara');
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
    const optionA = screen.getByText('Option A with option_text field');
    fireEvent.click(optionA);

    // Submit button should now be enabled
    const submitButton = screen.getByText('Svara');
    expect(submitButton).not.toBeDisabled();

    // Should be able to submit
    fireEvent.click(submitButton);

    // Should show feedback
    expect(screen.getByText(/Rätt svar|Fel svar/)).toBeInTheDocument();
  });

  test('handles mixed text formats correctly', () => {
    const mixedFormatData = {
      ...testQuizDataWithOptionText,
      questions: [{
        ...testQuizDataWithOptionText.questions[0],
        options: [
          {
            option_id: 'a',
            text: 'Option A with text field',
            is_correct: true
          },
          {
            option_id: 'b',
            option_text: 'Option B with option_text field',
            is_correct: false
          }
        ]
      }]
    };

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
    const submitButton = screen.getByText('Svara');
    expect(submitButton).not.toBeDisabled();

    // Press Enter to submit
    fireEvent.keyDown(window, { key: 'Enter' });

    // Should show feedback
    expect(screen.getByText(/Rätt svar|Fel svar/)).toBeInTheDocument();
  });
});