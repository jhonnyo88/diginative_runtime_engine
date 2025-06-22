import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StrategyPlayHost } from '../../components/StrategyPlayHost';
import { ChakraThemeProvider } from '../../theme/ChakraThemeProvider';
import type { GameManifest } from '../../types/game-manifest';

// Mock analytics

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraThemeProvider>
    {children}
  </ChakraThemeProvider>
);

// Sample game manifest for testing
const sampleGameManifest: GameManifest = {
  schemaVersion: '0.1.0',
  gameId: 'test-game',
  metadata: {
    title: 'Test GDPR Training',
    description: 'A test game for GDPR compliance training',
    version: '1.0.0',
    author: 'DigiNativa Test',
    language: 'sv',
    estimatedDuration: 15,
    difficulty: 'beginner',
    tags: ['gdpr', 'privacy', 'compliance']
  },
  theme: {
    name: 'municipality',
    primaryColor: '#2B5AA0',
    secondaryColor: '#4A90C2',
    backgroundColor: '#F8F9FA',
    fontFamily: 'Open Sans'
  },
  scenes: [
    {
      id: 'intro-scene',
      type: 'dialogue',
      title: 'GDPR Introduction',
      description: 'Learn about GDPR basics',
      content: {
        character: {
          name: 'Anna',
          avatar: '/avatars/anna.png',
          role: 'Data Protection Officer'
        },
        messages: [
          {
            id: 'msg-1',
            speaker: 'Anna',
            text: 'Welcome to GDPR training! Let\'s learn about data protection.',
            timestamp: 0
          },
          {
            id: 'msg-2', 
            speaker: 'Anna',
            text: 'GDPR stands for General Data Protection Regulation.',
            timestamp: 3000
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
    },
    {
      id: 'quiz-scene',
      type: 'quiz',
      title: 'GDPR Knowledge Check',
      description: 'Test your understanding',
      content: {
        question: 'What does GDPR stand for?',
        explanation: 'GDPR is the General Data Protection Regulation.',
        options: [
          {
            id: 'option-1',
            text: 'General Data Protection Regulation',
            correct: true,
            feedback: 'Correct! GDPR is indeed the General Data Protection Regulation.'
          },
          {
            id: 'option-2',
            text: 'Global Data Privacy Rules',
            correct: false,
            feedback: 'Not quite. Try again!'
          },
          {
            id: 'option-3',
            text: 'Government Data Protection Registry',
            correct: false,
            feedback: 'Not correct. GDPR is about general data protection.'
          }
        ],
        timeLimit: 30,
        allowMultipleAttempts: true
      }
    },
    {
      id: 'summary-scene',
      type: 'summary',
      title: 'Training Complete',
      description: 'You have completed the GDPR training',
      content: {
        message: 'Congratulations! You have successfully completed the GDPR training.',
        achievements: [
          {
            id: 'gdpr-basics',
            title: 'GDPR Basics',
            description: 'Learned fundamental GDPR concepts',
            icon: '🏆'
          }
        ],
        nextSteps: [
          'Apply GDPR principles in your daily work',
          'Review the GDPR policy document',
          'Complete advanced GDPR training'
        ],
        certificateEligible: true
      }
    }
  ]
};


describe('StrategyPlayHost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  it('renders game host with initial scene', () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Test GDPR Training')).toBeInTheDocument();
    expect(screen.getByText('GDPR Introduction')).toBeInTheDocument();
    expect(screen.getByText('Welcome to GDPR training!')).toBeInTheDocument();
  });

  it('shows progress indicator', () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Should show progress (scene 1 of 3)
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    
    // Progress bar should be at 33.33%
    expect(progressBar).toHaveAttribute('aria-valuenow', '33.33');
  });

  it('navigates between scenes', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Start with dialogue scene
    expect(screen.getByText('GDPR Introduction')).toBeInTheDocument();

    // Click continue to go to quiz
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('GDPR Knowledge Check')).toBeInTheDocument();
      expect(screen.getByText('What does GDPR stand for?')).toBeInTheDocument();
    });

    // Progress should update to 2/3
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('handles quiz completion correctly', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Navigate to quiz scene
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('What does GDPR stand for?')).toBeInTheDocument();
    });

    // Select correct answer
    fireEvent.click(correctOption);

    // Submit answer
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Correct!')).toBeInTheDocument();
    });

    // Continue to next scene
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Training Complete')).toBeInTheDocument();
    });
  });

  it('completes full game flow', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Complete dialogue scene
    fireEvent.click(screen.getByText('Continue'));

    // Complete quiz scene
    await waitFor(() => {
      fireEvent.click(screen.getByText('General Data Protection Regulation'));
    });
    
    fireEvent.click(screen.getByText('Submit Answer'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Next Scene'));
    });

    // Reach summary scene
    await waitFor(() => {
      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
    });

    // Complete game
    fireEvent.click(completeButton);

    expect(mockOnGameComplete).toHaveBeenCalledWith({
      gameId: 'test-game',
      userId: 'test-user-123',
      completedAt: expect.any(Date),
      score: expect.any(Number),
      timeSpent: expect.any(Number),
      sceneResults: expect.any(Array)
    });
  });

  it('tracks analytics events', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Game start should be tracked
    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('game_started', {
      gameId: 'test-game',
      userId: 'test-user-123',
      tenantId: 'test-tenant'
    });

    // Scene transitions should be tracked
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('scene_completed', {
        sceneId: 'intro-scene',
        sceneType: 'dialogue',
        timeSpent: expect.any(Number)
      });
    });
  });

  it('handles game exit correctly', () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(exitButton);

    expect(mockOnGameExit).toHaveBeenCalledWith({
      gameId: 'test-game',
      userId: 'test-user-123',
      exitedAt: expect.any(Date),
      currentScene: 'intro-scene',
      progress: 33.33
    });
  });

  it('shows error state for invalid game manifest', () => {

    render(
      <TestWrapper>
        <StrategyPlayHost 
          {...defaultProps}
          gameManifest={invalidManifest}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Game Error')).toBeInTheDocument();
    expect(screen.getByText('This game cannot be loaded.')).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    
    // Focus should be on the continue button
    continueButton.focus();
    expect(document.activeElement).toBe(continueButton);

    // Enter key should trigger continue
    fireEvent.keyDown(continueButton, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('GDPR Knowledge Check')).toBeInTheDocument();
    });
  });

  it('maintains focus management for accessibility', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Navigate to quiz scene
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      // Focus should move to the quiz question
      expect(document.activeElement?.textContent).toContain('What does GDPR stand for?');
    });
  });

  it('saves progress automatically', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Complete first scene
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      // Progress save should be triggered
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('progress_saved', {
        gameId: 'test-game',
        currentScene: 'quiz-scene',
        progress: 66.67
      });
    });
  });

  it('handles scene timeout correctly', async () => {

    render(
      <TestWrapper>
        <StrategyPlayHost 
          {...defaultProps}
          gameManifest={timedGameManifest}
        />
      </TestWrapper>
    );

    // Wait for timeout
    await waitFor(() => {
      expect(screen.getByText('Time\'s up!')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('scene_timeout', {
      sceneId: 'quiz-scene',
      timeLimit: 1
    });
  });
});

// Performance test
describe('StrategyPlayHost Performance', () => {
  it('renders large game manifests efficiently', () => {
    const largeGameManifest: GameManifest = {
      ...sampleGameManifest,
      scenes: Array.from({ length: 50 }, (_, i) => ({
        ...sampleGameManifest.scenes[0],
        id: `scene-${i}`,
        title: `Scene ${i + 1}`
      }))
    };

    
    render(
      <TestWrapper>
        <StrategyPlayHost 
          gameManifest={largeGameManifest}
          onGameComplete={mockOnGameComplete}
          onGameExit={mockOnGameExit}
          analytics={mockAnalytics}
          userId="test-user"
          tenantId="test-tenant"
        />
      </TestWrapper>
    );


    // Should render in less than 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('handles rapid scene transitions without memory leaks', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Rapidly navigate through scenes
    for (let i = 0; i < 10; i++) {
      if (continueButton) {
        fireEvent.click(continueButton);
        await waitFor(() => {}, { timeout: 100 });
      }
    }

    // Should not throw errors or cause memory issues
    expect(screen.getByTestId('strategy-play-host')).toBeInTheDocument();
  });
});