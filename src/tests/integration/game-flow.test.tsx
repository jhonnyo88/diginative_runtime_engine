import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StrategyPlayHost } from '../../components/StrategyPlayHost';
import { ChakraThemeProvider } from '../../theme/ChakraThemeProvider';
import type { GameManifest } from '../../types/game-manifest';

// Integration tests for complete game flows
// Tests the interaction between StrategyPlayHost and all scene types

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraThemeProvider>
    {children}
  </ChakraThemeProvider>
);

const mockAnalytics = {
  trackEvent: vi.fn(),
  identify: vi.fn(),
  page: vi.fn()
};

// Complete GDPR training game manifest
const completeGDPRGame: GameManifest = {
  schemaVersion: '0.1.0',
  gameId: 'gdpr-complete-training',
  metadata: {
    title: 'Complete GDPR Training - Malmö Municipality',
    description: 'Comprehensive GDPR training for municipal employees',
    version: '1.2.0',
    author: 'DigiNativa & Malmö Stad',
    language: 'sv',
    estimatedDuration: 25,
    difficulty: 'intermediate',
    tags: ['gdpr', 'privacy', 'compliance', 'municipal']
  },
  theme: {
    name: 'malmo-municipality',
    primaryColor: '#2B5AA0',
    secondaryColor: '#4A90C2',
    backgroundColor: '#F8F9FA',
    fontFamily: 'Open Sans'
  },
  scenes: [
    {
      id: 'welcome-dialogue',
      type: 'dialogue',
      title: 'Welcome to GDPR Training',
      description: 'Meet your instructor Anna Svensson',
      content: {
        character: {
          name: 'Anna Svensson',
          avatar: '/avatars/anna-svensson.png',
          role: 'Data Protection Officer, Malmö Stad'
        },
        messages: [
          {
            id: 'welcome-1',
            speaker: 'Anna Svensson',
            text: 'Hej! Välkommen till GDPR-utbildningen för Malmö Stad.',
            timestamp: 0
          },
          {
            id: 'welcome-2',
            speaker: 'Anna Svensson',
            text: 'Som anställd hanterar du personuppgifter dagligen. Det är viktigt att du känner till GDPR-reglerna.',
            timestamp: 3000
          },
          {
            id: 'welcome-3',
            speaker: 'User',
            text: 'Jag är redo att lära mig!',
            timestamp: 6000
          }
        ],
        actions: [
          {
            id: 'start-training',
            text: 'Starta utbildningen',
            type: 'continue'
          }
        ]
      }
    },
    {
      id: 'gdpr-basics-quiz',
      type: 'quiz',
      title: 'GDPR Grundkunskaper',
      description: 'Testa dina grundläggande GDPR-kunskaper',
      content: {
        question: 'Vad står GDPR för?',
        explanation: 'GDPR står för General Data Protection Regulation (Allmän dataskyddsförordning). Det är EU:s dataskyddslagstiftning som trädde i kraft 2018.',
        options: [
          {
            id: 'gdpr-option-1',
            text: 'General Data Protection Regulation',
            correct: true,
            feedback: 'Rätt! GDPR är General Data Protection Regulation.'
          },
          {
            id: 'gdpr-option-2',
            text: 'Global Data Privacy Rules',
            correct: false,
            feedback: 'Fel. GDPR är inte globala regler utan EU-lagstiftning.'
          },
          {
            id: 'gdpr-option-3',
            text: 'Government Data Protection Registry',
            correct: false,
            feedback: 'Fel. GDPR är en förordning, inte ett register.'
          }
        ],
        timeLimit: 30,
        allowMultipleAttempts: true,
        showExplanation: true
      }
    },
    {
      id: 'data-handling-assessment',
      type: 'assessment',
      title: 'Datahantering i praktiken',
      description: 'Bedöm olika scenarier för datahantering',
      content: {
        questions: [
          {
            id: 'scenario-1',
            text: 'En medborgare ringer och frågar om sin ansökan. Du kan inte hitta den i systemet. Vad gör du?',
            type: 'multiple-choice',
            options: [
              {
                id: 'scenario-1-option-1',
                text: 'Be personen ringa tillbaka senare',
                correct: false,
                points: 0,
                feedback: 'Detta är inte bra service. Du bör hjälpa personen direkt.'
              },
              {
                id: 'scenario-1-option-2',
                text: 'Verifiera personens identitet och sök sedan i andra system',
                correct: true,
                points: 2,
                feedback: 'Rätt! Identitetsverifiering är första steget.'
              },
              {
                id: 'scenario-1-option-3',
                text: 'Fråga en kollega om de känner till personen',
                correct: false,
                points: 0,
                feedback: 'Detta bryter mot GDPR - du får inte diskutera personuppgifter med obehöriga.'
              }
            ]
          },
          {
            id: 'scenario-2',
            text: 'Du märker att en kollega har lämnat sin dator olåst med personuppgifter på skärmen. Vad gör du?',
            type: 'multiple-choice',
            options: [
              {
                id: 'scenario-2-option-1',
                text: 'Ignorera det - det är inte mitt ansvar',
                correct: false,
                points: 0,
                feedback: 'Fel. Datasäkerhet är allas ansvar på kommunen.'
              },
              {
                id: 'scenario-2-option-2',
                text: 'Låsa datorn och informera kollegan',
                correct: true,
                points: 2,
                feedback: 'Rätt! Du agerar för att skydda personuppgifterna.'
              },
              {
                id: 'scenario-2-option-3',
                text: 'Ta en skärmdump och rapportera till chefen',
                correct: false,
                points: 0,
                feedback: 'Fel. Att ta skärmdump skapar ytterligare dataskyddsrisker.'
              }
            ]
          }
        ],
        passingScore: 3,
        timeLimit: 300,
        showFeedback: true
      }
    },
    {
      id: 'training-summary',
      type: 'summary',
      title: 'Utbildning genomförd!',
      description: 'Sammanfattning av din GDPR-utbildning',
      content: {
        message: 'Grattis! Du har genomfört GDPR-utbildningen för Malmö Stad.',
        achievements: [
          {
            id: 'gdpr-certified',
            title: 'GDPR-certifierad',
            description: 'Genomfört grundläggande GDPR-utbildning',
            icon: '🏆'
          },
          {
            id: 'scenario-master',
            title: 'Scenarioexpert',
            description: 'Löst praktiska datahanteringsscenarier',
            icon: '🎯'
          }
        ],
        nextSteps: [
          'Tillämpa GDPR-principerna i ditt dagliga arbete',
          'Läs kommunens dataskyddspolicy',
          'Delta i fördjupningsutbildningar vid behov',
          'Kontakta dataskyddsombudet vid frågor'
        ],
        certificateEligible: true,
        resources: [
          {
            title: 'GDPR-guide för anställda',
            url: '/resources/gdpr-guide-employees.pdf',
            type: 'pdf'
          },
          {
            title: 'Kontakta dataskyddsombudet',
            url: 'mailto:dataskydd@malmo.se',
            type: 'email'
          }
        ]
      }
    }
  ]
};

const mockOnGameComplete = vi.fn();
const mockOnGameExit = vi.fn();

describe('Complete Game Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const defaultProps = {
    gameManifest: completeGDPRGame,
    onGameComplete: mockOnGameComplete,
    onGameExit: mockOnGameExit,
    analytics: mockAnalytics,
    userId: 'anna.svensson@malmo.se',
    tenantId: 'malmo-stad'
  };

  it('completes full GDPR training flow successfully', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // 1. Start with dialogue scene
    expect(screen.getByText('Complete GDPR Training - Malmö Municipality')).toBeInTheDocument();
    expect(screen.getByText('Welcome to GDPR Training')).toBeInTheDocument();
    expect(screen.getByText('Hej! Välkommen till GDPR-utbildningen')).toBeInTheDocument();

    // Progress should show 1/4
    expect(screen.getByText('1 / 4')).toBeInTheDocument();

    // Complete dialogue
    fireEvent.click(screen.getByText('Starta utbildningen'));

    // 2. Move to quiz scene
    await waitFor(() => {
      expect(screen.getByText('GDPR Grundkunskaper')).toBeInTheDocument();
      expect(screen.getByText('Vad står GDPR för?')).toBeInTheDocument();
    });

    // Progress should show 2/4
    expect(screen.getByText('2 / 4')).toBeInTheDocument();

    // Answer quiz correctly
    fireEvent.click(screen.getByLabelText('General Data Protection Regulation'));
    fireEvent.click(screen.getByText('Submit Answer'));

    await waitFor(() => {
      expect(screen.getByText('Rätt! GDPR är General Data Protection Regulation.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Continue'));

    // 3. Move to assessment scene
    await waitFor(() => {
      expect(screen.getByText('Datahantering i praktiken')).toBeInTheDocument();
      expect(screen.getByText('En medborgare ringer och frågar')).toBeInTheDocument();
    });

    // Progress should show 3/4
    expect(screen.getByText('3 / 4')).toBeInTheDocument();

    // Answer first assessment question
    fireEvent.click(screen.getByLabelText('Verifiera personens identitet och sök sedan i andra system'));
    fireEvent.click(screen.getByText('Next Question'));

    // Answer second assessment question
    await waitFor(() => {
      expect(screen.getByText('Du märker att en kollega har lämnat')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Låsa datorn och informera kollegan'));
    fireEvent.click(screen.getByText('Complete Assessment'));

    // 4. Move to summary scene
    await waitFor(() => {
      expect(screen.getByText('Utbildning genomförd!')).toBeInTheDocument();
      expect(screen.getByText('Grattis! Du har genomfört GDPR-utbildningen')).toBeInTheDocument();
    });

    // Progress should show 4/4
    expect(screen.getByText('4 / 4')).toBeInTheDocument();

    // Check achievements
    expect(screen.getByText('GDPR-certifierad')).toBeInTheDocument();
    expect(screen.getByText('Scenarioexpert')).toBeInTheDocument();

    // Complete training
    fireEvent.click(screen.getByText('Complete Training'));

    expect(mockOnGameComplete).toHaveBeenCalledWith({
      gameId: 'gdpr-complete-training',
      userId: 'anna.svensson@malmo.se',
      completedAt: expect.any(Date),
      score: expect.any(Number),
      timeSpent: expect.any(Number),
      sceneResults: expect.arrayContaining([
        expect.objectContaining({ sceneId: 'welcome-dialogue' }),
        expect.objectContaining({ sceneId: 'gdpr-basics-quiz' }),
        expect.objectContaining({ sceneId: 'data-handling-assessment' }),
        expect.objectContaining({ sceneId: 'training-summary' })
      ])
    });
  });

  it('tracks comprehensive analytics throughout game flow', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Game start analytics
    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('game_started', {
      gameId: 'gdpr-complete-training',
      userId: 'anna.svensson@malmo.se',
      tenantId: 'malmo-stad'
    });

    // Complete dialogue scene
    fireEvent.click(screen.getByText('Starta utbildningen'));

    await waitFor(() => {
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('scene_completed', {
        sceneId: 'welcome-dialogue',
        sceneType: 'dialogue',
        timeSpent: expect.any(Number)
      });
    });

    // Quiz analytics
    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('quiz_started', {
      sceneId: 'gdpr-basics-quiz',
      questionCount: 1,
      timeLimit: 30
    });

    // Complete quiz
    fireEvent.click(screen.getByLabelText('General Data Protection Regulation'));
    fireEvent.click(screen.getByText('Submit Answer'));

    await waitFor(() => {
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('quiz_answer_submitted', {
        sceneId: 'gdpr-basics-quiz',
        selectedOption: 'gdpr-option-1',
        isCorrect: true,
        attemptNumber: 1,
        timeSpent: expect.any(Number)
      });
    });

    fireEvent.click(screen.getByText('Continue'));

    // Assessment analytics
    await waitFor(() => {
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('assessment_started', {
        sceneId: 'data-handling-assessment',
        questionCount: 2,
        timeLimit: 300
      });
    });
  });

  it('handles scene failures and recovery', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Complete dialogue
    fireEvent.click(screen.getByText('Starta utbildningen'));

    // Fail quiz initially
    await waitFor(() => {
      fireEvent.click(screen.getByLabelText('Global Data Privacy Rules'));
      fireEvent.click(screen.getByText('Submit Answer'));
    });

    await waitFor(() => {
      expect(screen.getByText('Fel. GDPR är inte globala regler')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    // Retry and succeed
    fireEvent.click(screen.getByText('Try Again'));
    fireEvent.click(screen.getByLabelText('General Data Protection Regulation'));
    fireEvent.click(screen.getByText('Submit Answer'));

    await waitFor(() => {
      expect(screen.getByText('Rätt! GDPR är General Data Protection Regulation.')).toBeInTheDocument();
    });

    // Should still be able to continue
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Datahantering i praktiken')).toBeInTheDocument();
    });
  });

  it('saves progress at each scene transition', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Complete dialogue
    fireEvent.click(screen.getByText('Starta utbildningen'));

    await waitFor(() => {
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('progress_saved', {
        gameId: 'gdpr-complete-training',
        currentScene: 'gdpr-basics-quiz',
        progress: 50
      });
    });

    // Complete quiz
    fireEvent.click(screen.getByLabelText('General Data Protection Regulation'));
    fireEvent.click(screen.getByText('Submit Answer'));
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('progress_saved', {
        gameId: 'gdpr-complete-training',
        currentScene: 'data-handling-assessment',
        progress: 75
      });
    });
  });

  it('handles game exit at any point', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Exit from dialogue scene
    const exitButton = screen.getByLabelText('Exit game');
    fireEvent.click(exitButton);

    expect(mockOnGameExit).toHaveBeenCalledWith({
      gameId: 'gdpr-complete-training',
      userId: 'anna.svensson@malmo.se',
      exitedAt: expect.any(Date),
      currentScene: 'welcome-dialogue',
      progress: 25
    });
  });

  it('supports resume from middle of game', async () => {
    const resumeProps = {
      ...defaultProps,
      resumeFromScene: 'gdpr-basics-quiz',
      previousProgress: {
        completedScenes: ['welcome-dialogue'],
        currentScene: 'gdpr-basics-quiz',
        progress: 50
      }
    };

    render(
      <TestWrapper>
        <StrategyPlayHost {...resumeProps} />
      </TestWrapper>
    );

    // Should start from quiz scene
    expect(screen.getByText('GDPR Grundkunskaper')).toBeInTheDocument();
    expect(screen.getByText('2 / 4')).toBeInTheDocument();

    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('game_resumed', {
      gameId: 'gdpr-complete-training',
      resumeScene: 'gdpr-basics-quiz',
      previousProgress: 50
    });
  });

  it('calculates final score correctly', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Complete all scenes with perfect scores
    fireEvent.click(screen.getByText('Starta utbildningen'));

    await waitFor(() => {
      fireEvent.click(screen.getByLabelText('General Data Protection Regulation'));
      fireEvent.click(screen.getByText('Submit Answer'));
      fireEvent.click(screen.getByText('Continue'));
    });

    // Perfect assessment answers
    await waitFor(() => {
      fireEvent.click(screen.getByLabelText('Verifiera personens identitet och sök sedan i andra system'));
      fireEvent.click(screen.getByText('Next Question'));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByLabelText('Låsa datorn och informera kollegan'));
      fireEvent.click(screen.getByText('Complete Assessment'));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Complete Training'));
    });

    expect(mockOnGameComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 100 // Perfect score
      })
    );
  });

  it('handles multi-language content correctly', () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Swedish content should be displayed
    expect(screen.getByText('Hej! Välkommen till GDPR-utbildningen')).toBeInTheDocument();
    expect(screen.getByText('Starta utbildningen')).toBeInTheDocument();

    // Language should be tracked
    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('game_started', 
      expect.objectContaining({
        language: 'sv'
      })
    );
  });

  it('applies custom theme throughout game', () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Theme should be applied to components
    const gameContainer = screen.getByTestId('strategy-play-host');
    expect(gameContainer).toHaveStyle({
      '--primary-color': '#2B5AA0',
      '--secondary-color': '#4A90C2',
      '--background-color': '#F8F9FA'
    });
  });

  it('meets accessibility standards throughout flow', async () => {
    render(
      <TestWrapper>
        <StrategyPlayHost {...defaultProps} />
      </TestWrapper>
    );

    // Check ARIA landmarks
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Focus management on scene transitions
    fireEvent.click(screen.getByText('Starta utbildningen'));

    await waitFor(() => {
      // Focus should move to quiz question
      const questionElement = screen.getByText('Vad står GDPR för?');
      expect(document.activeElement?.textContent).toContain('Vad står GDPR för?');
    });

    // Keyboard navigation
    const option = screen.getByLabelText('General Data Protection Regulation');
    option.focus();
    fireEvent.keyDown(option, { key: ' ' });
    expect(option).toBeChecked();
  });
});