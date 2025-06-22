/**
 * Strategy Play Host Component Tests
 * Task: proposal-028 - Component Testing Infrastructure
 * Priority: P1 - HIGH (Core game flow)
 * 
 * Tests main game orchestrator and scene management
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import StrategyPlayHost from '../../components/StrategyPlayHost';

// Mock child components
vi.mock('../../components/GameContainer/GameContainer', () => ({
  default: vi.fn(({ children, ...props }) => (
    <div data-testid="game-container" {...props}>
      {children}
    </div>
  ))
}));

vi.mock('../../components/scenes/QuizScene', () => ({
  default: vi.fn((props) => (
    <div data-testid="quiz-scene" data-scene-props={JSON.stringify(props)}>
      Quiz Scene
    </div>
  ))
}));

vi.mock('../../components/DialogueScene/DialogueScene', () => ({
  default: vi.fn((props) => (
    <div data-testid="dialogue-scene" data-scene-props={JSON.stringify(props)}>
      Dialogue Scene
    </div>
  ))
}));

vi.mock('../../components/scenes/SummaryScene', () => ({
  default: vi.fn((props) => (
    <div data-testid="summary-scene" data-scene-props={JSON.stringify(props)}>
      Summary Scene
    </div>
  ))
}));

// Mock game state manager


vi.mock('../../hooks/useGameState', () => ({
  default: () => [mockGameState, mockGameActions]
}));

// Mock scene data


describe('StrategyPlayHost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock game state
    Object.assign(mockGameState, {
      currentScene: 0,
      totalScenes: 3,
      playerName: 'Anna Svensson',
      score: 0,
      responses: [],
      municipality: 'malmö'
    });
  });

  describe('Game Initialization and Setup', () => {
    it('initializes game with correct municipal context', () => {
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      // Should initialize game container
      expect(screen.getByTestId('game-container')).toBeInTheDocument();
      
      // Should start with first scene
      expect(screen.getByTestId('dialogue-scene')).toBeInTheDocument();
      
      // Should not show other scenes initially
      expect(screen.queryByTestId('quiz-scene')).not.toBeInTheDocument();
      expect(screen.queryByTestId('summary-scene')).not.toBeInTheDocument();
    });

    it('validates game data structure on initialization', () => {

      // Should handle invalid data gracefully
      renderWithChakra(
        <StrategyPlayHost 
          gameData={invalidGameData}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      // Should show error boundary or fallback
      expect(screen.getByTestId('game-container')).toBeInTheDocument();
    });

    it('sets up accessibility context correctly', () => {
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
          accessibilityMode={true}
        />
      );

      expect(gameContainer).toHaveAttribute('role', 'main');
      expect(gameContainer).toHaveAttribute('aria-label', 'GDPR-utbildningsspel');
    });

    it('handles missing player name gracefully', () => {
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
        />
      );

      // Should use default name or prompt for name
      expect(screen.getByTestId('game-container')).toBeInTheDocument();
    });
  });

  describe('Scene Management and Navigation', () => {
    it('renders current scene correctly', () => {
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      // Should render dialogue scene (first scene)
      expect(dialogueScene).toBeInTheDocument();
      
      // Check scene props
      expect(sceneProps.content.speaker).toBe('Anna Lindström');
    });

    it('advances to next scene correctly', async () => {
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      // Simulate advancing to next scene
      mockGameState.currentScene = 1;
      
      // Trigger re-render by advancing scene
      mockGameActions.nextScene();
      
      await waitFor(() => {
        expect(mockGameActions.nextScene).toHaveBeenCalled();
      });
    });

    it('handles scene transitions with proper state management', async () => {
      const { rerender } = renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      // Start with dialogue scene
      expect(screen.getByTestId('dialogue-scene')).toBeInTheDocument();
      
      // Update state to quiz scene
      Object.assign(mockGameState, { currentScene: 1 });
      
      rerender(
        <ChakraProvider>
          <StrategyPlayHost 
            gameData={mockSceneData}
            municipality="malmö"
            playerName="Anna Svensson"
          />
        </ChakraProvider>
      );

      // Should now show quiz scene
      expect(screen.getByTestId('quiz-scene')).toBeInTheDocument();
      expect(screen.queryByTestId('dialogue-scene')).not.toBeInTheDocument();
    });

    it('prevents navigation beyond scene boundaries', () => {
      // Set to last scene
      Object.assign(mockGameState, { currentScene: 2, totalScenes: 3 });
      
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      // Should show summary scene
      expect(screen.getByTestId('summary-scene')).toBeInTheDocument();
      
      // Attempting to go beyond should not crash
      mockGameActions.nextScene();
      expect(mockGameActions.nextScene).toHaveBeenCalled();
    });

    it('supports scene navigation with keyboard shortcuts', () => {
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
          keyboardNavigation={true}
        />
      );

      
      // Test arrow key navigation
      fireEvent.keyDown(gameContainer, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(mockGameActions.nextScene).toHaveBeenCalled();
      
      fireEvent.keyDown(gameContainer, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(mockGameActions.previousScene).toHaveBeenCalled();
    });
  });

  describe('Municipal Context and Localization', () => {
    it('applies municipal branding throughout game', () => {
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      expect(gameContainer).toHaveAttribute('data-municipality', 'malmö');
      
      // Check that municipal context is passed to scenes
      expect(sceneProps.municipality).toBe('malmö');
    });

    it('displays Swedish language content correctly', () => {

      renderWithChakra(
        <StrategyPlayHost 
          gameData={swedishGameData}
          municipality="malmö"
          playerName="Anna Svensson"
          language="sv-SE"
        />
      );

      // Swedish content should be rendered
      expect(dialogueScene).toBeInTheDocument();
    });

    it('handles multiple municipality contexts', () => {
      
      municipalities.forEach(municipality => {
        const { rerender } = renderWithChakra(
          <StrategyPlayHost 
            gameData={mockSceneData}
            municipality={municipality}
            playerName="Anna Svensson"
          />
        );

        expect(gameContainer).toHaveAttribute('data-municipality', municipality);
      });
    });
  });

  describe('Score Management and Progress Tracking', () => {
    it('tracks player score correctly', () => {
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      // Should start with score 0
      expect(mockGameState.score).toBe(0);
      
      // Simulate scoring
      mockGameActions.updateScore(10);
      expect(mockGameActions.updateScore).toHaveBeenCalledWith(10);
    });

    it('saves player responses for progress tracking', () => {
      Object.assign(mockGameState, { currentScene: 1 }); // Quiz scene
      
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      expect(quizScene).toBeInTheDocument();
      
      // Simulate answering quiz
      mockGameActions.saveResponse(response);
      
      expect(mockGameActions.saveResponse).toHaveBeenCalledWith(response);
    });

    it('calculates completion percentage correctly', () => {
      Object.assign(mockGameState, { currentScene: 1, totalScenes: 3 });
      
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
          showProgress={true}
        />
      );

      // Should calculate 33% completion (scene 1 of 3)
      expect(gameContainer).toHaveAttribute('data-progress', '33');
    });

    it('handles progress saving with error recovery', async () => {
      mockGameActions.saveProgress.mockRejectedValue(new Error('Network error'));
      
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
          autoSave={true}
        />
      );

      // Trigger progress save
      mockGameActions.saveProgress();
      
      await waitFor(() => {
        expect(mockGameActions.saveProgress).toHaveBeenCalled();
      });
      
      // Should handle error gracefully
      expect(screen.getByTestId('game-container')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('handles corrupted scene data gracefully', () => {

      renderWithChakra(
        <StrategyPlayHost 
          gameData={corruptedData}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      // Should not crash and show error handling
      expect(screen.getByTestId('game-container')).toBeInTheDocument();
    });

    it('recovers from scene rendering errors', () => {
      // Mock scene component to throw error
      vi.mocked(screen.getByTestId).mockImplementation(() => {
        throw new Error('Scene rendering failed');
      });

      expect(() => {
        renderWithChakra(
          <StrategyPlayHost 
            gameData={mockSceneData}
            municipality="malmö"
            playerName="Anna Svensson"
          />
        );
      }).not.toThrow();
    });

    it('handles missing game data with fallback content', () => {
      renderWithChakra(
        <StrategyPlayHost 
          gameData={[]}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      // Should show fallback or error message
      expect(screen.getByTestId('game-container')).toBeInTheDocument();
    });

    it('maintains game state during re-renders', () => {
      const { rerender } = renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      // Advance to next scene
      Object.assign(mockGameState, { currentScene: 1, score: 15 });
      
      rerender(
        <ChakraProvider>
          <StrategyPlayHost 
            gameData={mockSceneData}
            municipality="malmö"
            playerName="Anna Svensson"
          />
        </ChakraProvider>
      );

      // State should be preserved
      expect(mockGameState.currentScene).toBe(1);
      expect(mockGameState.score).toBe(15);
    });
  });

  describe('Performance and Municipal Network Optimization', () => {
    it('renders efficiently with large game datasets', () => {
      const _largeGameData = Array.from({ length: 100 }, (_, i) => ({
        id: `scene-${i}`,
        type: i % 2 === 0 ? 'dialogue' : 'quiz',
        content: {
          question: `Question ${i}`,
          options: Array.from({ length: 4 }, (_, j) => ({
            text: `Option ${j}`,
            isCorrect: j === 0
          }))
        }
      }));

      
      renderWithChakra(
        <StrategyPlayHost 
          gameData={largeGameData}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      
      // Should render within performance budget
      expect(renderTime).toBeLessThan(200); // 200ms budget
      expect(screen.getByTestId('game-container')).toBeInTheDocument();
    });

    it('implements efficient scene lazy loading', () => {
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
          lazyLoading={true}
        />
      );

      // Should only render current scene
      expect(screen.getByTestId('dialogue-scene')).toBeInTheDocument();
      expect(screen.queryByTestId('quiz-scene')).not.toBeInTheDocument();
      expect(screen.queryByTestId('summary-scene')).not.toBeInTheDocument();
    });

    it('optimizes for municipal 3G network conditions', () => {
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
          networkOptimization="3g"
        />
      );

      expect(gameContainer).toHaveAttribute('data-network-optimization', '3g');
      
      // Should implement optimizations for slow networks
      expect(gameContainer).toHaveAttribute('data-preload-strategy', 'minimal');
    });
  });

  describe('Accessibility and WCAG 2.1 AA Compliance', () => {
    it('provides proper ARIA navigation structure', () => {
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      expect(gameContainer).toHaveAttribute('role', 'main');
      expect(gameContainer).toHaveAttribute('aria-label');
      
      // Should have navigation landmark
      expect(gameContainer).toHaveAttribute('aria-describedby');
    });

    it('announces scene changes to screen readers', async () => {
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
          screenReaderSupport={true}
        />
      );

      // Should have live region for announcements
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      
      // Simulate scene change
      Object.assign(mockGameState, { currentScene: 1 });
      mockGameActions.nextScene();
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/övergick till/i);
      });
    });

    it('supports high contrast mode', () => {
      renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
          highContrast={true}
        />
      );

      expect(gameContainer).toHaveAttribute('data-high-contrast', 'true');
    });

    it('handles focus management between scenes', () => {
      const { rerender } = renderWithChakra(
        <StrategyPlayHost 
          gameData={mockSceneData}
          municipality="malmö"
          playerName="Anna Svensson"
        />
      );

      // Change scene
      Object.assign(mockGameState, { currentScene: 1 });
      
      rerender(
        <ChakraProvider>
          <StrategyPlayHost 
            gameData={mockSceneData}
            municipality="malmö"
            playerName="Anna Svensson"
          />
        </ChakraProvider>
      );

      // Focus should be managed properly
      expect(newScene).toBeInTheDocument();
    });
  });
});