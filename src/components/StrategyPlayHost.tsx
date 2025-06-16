import React, { useState, useCallback, useMemo } from 'react';
import { Box, Progress, VStack, Alert } from '@chakra-ui/react';
import type { GameManifest, Scene } from '../types/game-manifest';
import { InfoIcon, ProgressIcon } from './icons/GameIcons';
import { SkipLinks, SkipLink } from './common/SkipLink';
import { useFocusManagement } from '../hooks/useFocusManagement';
import { SceneTransition } from './animations/SceneTransition';
import { ProgressCelebration } from './animations/CelebrationEffects';
import { ChakraThemeProvider } from '../theme/ChakraThemeProvider';
import { DialogueScene } from './scenes/DialogueScene';
import { QuizScene } from './scenes/QuizScene';
import { AssessmentScene } from './scenes/AssessmentScene';
import { ResourceScene } from './scenes/ResourceScene';
import { SummaryScene } from './scenes/SummaryScene';

export interface GameResults {
  gameId: string;
  completed: boolean;
  score?: number;
  totalScore?: number;
  timeSpent: number; // milliseconds
  scenesCompleted: string[];
  answers?: Record<string, any>;
}

interface StrategyPlayHostProps {
  gameManifest: GameManifest;
  onComplete: (results: GameResults) => void;
  onSceneChange?: (sceneId: string) => void;
  analytics?: {
    trackEvent: (eventType: string, data: any) => void;
  };
}

export const StrategyPlayHost: React.FC<StrategyPlayHostProps> = ({
  gameManifest,
  onComplete,
  onSceneChange,
  analytics,
}) => {
  const [currentSceneId, setCurrentSceneId] = useState(gameManifest.startScene);
  
  // Game Designer spec: Focus management for accessibility
  const { mainContentRef } = useFocusManagement(currentSceneId, {
    skipToMainContent: true,
    announcePageChange: true
  });
  const [gameState, setGameState] = useState({
    startTime: Date.now(),
    scenesCompleted: [] as string[],
    score: 0,
    totalScore: 0,
    answers: {} as Record<string, any>,
  });
  const [error, setError] = useState<string | null>(null);

  // Find current scene
  const currentScene = useMemo(() => {
    return gameManifest.scenes.find(scene => scene.id === currentSceneId);
  }, [gameManifest.scenes, currentSceneId]);

  // Calculate progress
  const progress = useMemo(() => {
    const completedCount = gameState.scenesCompleted.length;
    const totalScenes = gameManifest.scenes.length;
    return (completedCount / totalScenes) * 100;
  }, [gameState.scenesCompleted.length, gameManifest.scenes.length]);

  // Handle scene completion
  const handleSceneComplete = useCallback((results: any) => {
    // Track analytics
    analytics?.trackEvent('scene_complete', {
      gameId: gameManifest.gameId,
      sceneId: currentSceneId,
      results,
    });

    // Update game state
    setGameState(prev => ({
      ...prev,
      scenesCompleted: [...prev.scenesCompleted, currentSceneId],
      score: prev.score + (results.score || 0),
      totalScore: prev.totalScore + (results.maxScore || 0),
      answers: {
        ...prev.answers,
        [currentSceneId]: results.answers,
      },
    }));

    // Determine next scene
    const nextScene = results.nextScene || currentScene?.navigation?.next;
    
    if (nextScene === 'end' || !nextScene) {
      // Game completed
      const finalResults: GameResults = {
        gameId: gameManifest.gameId,
        completed: true,
        score: gameState.score + (results.score || 0),
        totalScore: gameState.totalScore + (results.maxScore || 0),
        timeSpent: Date.now() - gameState.startTime,
        scenesCompleted: [...gameState.scenesCompleted, currentSceneId],
        answers: {
          ...gameState.answers,
          [currentSceneId]: results.answers,
        },
      };
      
      analytics?.trackEvent('game_complete', finalResults);
      onComplete(finalResults);
    } else {
      // Move to next scene
      setCurrentSceneId(nextScene);
      onSceneChange?.(nextScene);
    }
  }, [
    currentSceneId,
    currentScene,
    gameManifest.gameId,
    gameState,
    analytics,
    onComplete,
    onSceneChange,
  ]);

  // Render scene component based on type
  const renderScene = () => {
    if (!currentScene) {
      setError(`Scene "${currentSceneId}" not found`);
      return null;
    }

    const baseProps = {
      scene: currentScene,
      onComplete: handleSceneComplete,
      analytics,
    };

    switch (currentScene.type) {
      case 'dialogue':
        return <DialogueScene {...baseProps} />;
      case 'quiz':
        return <QuizScene {...baseProps} />;
      case 'assessment':
        return <AssessmentScene {...baseProps} />;
      case 'resource':
        return <ResourceScene {...baseProps} />;
      case 'summary':
        return <SummaryScene {...baseProps} />;
      default:
        setError(`Unknown scene type: ${(currentScene as any).type}`);
        return null;
    }
  };

  if (error) {
    return (
      <ChakraThemeProvider gameTheme={gameManifest.theme}>
        <Box p={4} maxW="600px" mx="auto">
          <Alert status="error">
            <InfoIcon color="red.500" />
            <Box ml={3}>
              {error}
            </Box>
          </Alert>
        </Box>
      </ChakraThemeProvider>
    );
  }

  return (
    <ChakraThemeProvider gameTheme={gameManifest.theme}>
      {/* Skip Links - Game Designer spec: WCAG 2.1 AA compliance */}
      <SkipLinks>
        <SkipLink href="#main-content">
          Hoppa till huvudinnehåll
        </SkipLink>
        <SkipLink href="#scene-actions">
          Hoppa till åtgärder
        </SkipLink>
      </SkipLinks>
      
      <VStack gap={0} minH="100vh" bg="gray.50">
        {/* Progress bar */}
        {gameManifest.settings?.showProgress !== false && (
          <Progress 
            value={progress} 
            w="100%" 
            h="4px" 
            colorScheme="brand"
            bg="gray.200"
            role="progressbar"
            aria-label={`Spelframsteg: ${Math.round(progress)}% av spelet slutfört`}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        )}
        
        {/* Main content area - Game Designer spec: Focus management */}
        <Box 
          ref={mainContentRef}
          id="main-content"
          flex="1" 
          w="100%" 
          maxW="600px" 
          mx="auto"
          position="relative"
          tabIndex={-1}
          outline="none"
          _focus={{
            outline: "3px solid",
            outlineColor: "blue.300",
            outlineOffset: "2px"
          }}
          role="main"
          aria-label={`Aktuell scen: ${currentScene?.title || currentSceneId}`}
        >
          <SceneTransition sceneId={currentSceneId}>
            {renderScene()}
          </SceneTransition>
        </Box>
        
        {/* Progress celebration effects - Game Designer spec */}
        <ProgressCelebration 
          progress={Math.round(progress)}
          milestone={25}
          show={true}
        />
      </VStack>
    </ChakraThemeProvider>
  );
};