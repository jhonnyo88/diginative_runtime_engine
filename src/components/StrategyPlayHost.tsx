import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Progress, VStack, Alert } from '@chakra-ui/react';
import type { GameManifest } from '../types/game-manifest';
import { InfoIcon } from './icons/GameIcons';
import { SkipLinks, SkipLink } from './common/SkipLink';
import { useFocusManagement } from '../hooks/useFocusManagement';
import { usePerformanceTracker } from '../hooks/usePerformanceTracker';
import { SceneTransition } from './animations/SceneTransition';
// TASK-HD-014: Replaced intrusive celebrations with municipal achievement system
import { MunicipalToastNotification } from './notifications/MunicipalToastNotification';
import { MunicipalProgressIndicator, DefaultGDPRMilestones, getLocalizedMilestones } from './progress/MunicipalProgressIndicator';
import { useAnnaSvenssonAchievements } from '../hooks/useMunicipalAchievements';
import { ChakraThemeProvider } from '../theme/ChakraThemeProvider';
import { detectAndAdaptCultural, type CulturalContext } from '../middleware/CulturalAdaptation';
import { DialogueScene } from './DialogueScene/DialogueScene';
import { QuizScene } from './QuizScene/QuizScene';
import { AssessmentScene } from './scenes/AssessmentScene';
import { ResourceScene } from './scenes/ResourceScene';
import { SummaryScene } from './scenes/SummaryScene';
import { GameErrorBoundary } from './ErrorBoundary';
import { performanceAnalytics } from '../services/performance-analytics';

export interface GameResults {
  gameId: string;
  completed: boolean;
  score?: number;
  totalScore?: number;
  timeSpent: number; // milliseconds
  scenesCompleted: string[];
  answers?: Record<string, string[]>;
  // TASK-HD-014: Municipal achievement system results
  municipalAchievements?: {
    earned: Record<string, unknown>[];
    competencies: string[];
    report: Record<string, unknown>;
  };
}

interface StrategyPlayHostProps {
  gameManifest: GameManifest;
  onComplete: (results: GameResults) => void;
  onSceneChange?: (sceneId: string) => void;
  analytics?: {
    trackEvent: (eventType: string, data: Record<string, unknown>) => void;
  };
  culturalContext?: CulturalContext;
  playerName?: string;
}

export const StrategyPlayHost: React.FC<StrategyPlayHostProps> = ({
  gameManifest,
  onComplete,
  onSceneChange,
  analytics,
  culturalContext = 'swedish_mobile',
  playerName,
}) => {
  // Expert recommendation: Cultural adaptation of game manifest
  const adaptedGameManifest = useMemo(() => {
    return detectAndAdaptCultural(gameManifest, culturalContext);
  }, [gameManifest, culturalContext]);

  const [currentSceneId, setCurrentSceneId] = useState(adaptedGameManifest.scenes[0]?.id || 'intro-dialogue');
  
  // Performance tracking for municipal optimization
  const { trackGameInteraction, trackSessionProgress } = usePerformanceTracker({
    componentName: 'StrategyPlayHost',
    trackComponentMount: true,
    trackRenderTime: true,
    trackUserInteractions: true
  });
  
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
    answers: Record<string, unknown> as Record<string, any>,
    correctAnswers: 0,
    totalQuestions: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // TASK-HD-014: Municipal Achievement System Integration
  const municipalAchievements = useAnnaSvenssonAchievements({
    name: playerName || 'Anna Svensson',
    department: 'IT-avdelningen',
    role: 'Kommunal specialist'
  });

  // Initialize game session analytics
  useEffect(() => {
    performanceAnalytics.startGameSession(adaptedGameManifest.gameId);
    
    return () => {
      // End session when component unmounts
      const completed = gameState.scenesCompleted.length === adaptedGameManifest.scenes.length;
      performanceAnalytics.endGameSession(adaptedGameManifest.gameId, completed, gameState.score);
    };
  }, [adaptedGameManifest.gameId, adaptedGameManifest.scenes.length, gameState.scenesCompleted.length, gameState.score]);

  // Find current scene
  const currentScene = useMemo(() => {
    return adaptedGameManifest.scenes.find(scene => scene.id === currentSceneId);
  }, [adaptedGameManifest.scenes, currentSceneId]);

  // Calculate progress
  const progress = useMemo(() => {
    const completedCount = gameState.scenesCompleted.length;
    const totalScenes = gameManifest.scenes.length;
    return (completedCount / totalScenes) * 100;
  }, [gameState.scenesCompleted.length, gameManifest.scenes.length]);

  // Handle scene completion
  const handleSceneComplete = useCallback((results: Record<string, unknown>) => {
    const endTracking = trackGameInteraction(gameManifest.gameId, currentSceneId, 'scene_complete');
    
    // Track analytics
    analytics?.trackEvent('scene_complete', {
      gameId: gameManifest.gameId,
      sceneId: currentSceneId,
      results,
    });

    // Track performance analytics
    const responseTime = endTracking('success', { sceneResults: results }) || 0;
    performanceAnalytics.trackGameInteraction(
      gameManifest.gameId, 
      currentSceneId, 
      'scene_complete', 
      responseTime
    );

    // Update game state
    setGameState(prev => {
      const newState = {
        ...prev,
        scenesCompleted: [...prev.scenesCompleted, currentSceneId],
        score: prev.score + (results.score || 0),
        totalScore: prev.totalScore + (results.maxScore || 0),
        correctAnswers: prev.correctAnswers + (results.isCorrect ? 1 : 0),
        totalQuestions: prev.totalQuestions + 1,
        answers: {
          ...prev.answers,
          [currentSceneId]: results.answers,
        },
      };
      
      // Track session progress for Anna Svensson's 7-minute sessions
      const progressPercent = (newState.scenesCompleted.length / gameManifest.scenes.length) * 100;
      trackSessionProgress(progressPercent);
      
      // TASK-HD-014: Evaluate municipal achievements
      const timeSpent = Date.now() - newState.startTime;
      municipalAchievements.evaluateAchievements({
        totalScore: newState.score,
        maxScore: newState.totalScore,
        timeSpent,
        correctAnswers: newState.correctAnswers,
        totalQuestions: newState.totalQuestions,
        sectionsCompleted: newState.scenesCompleted.length,
        totalSections: gameManifest.scenes.length
      });
      
      return newState;
    });

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
        // TASK-HD-014: Include municipal achievement data
        municipalAchievements: {
          earned: municipalAchievements.earnedAchievements,
          competencies: municipalAchievements.competencies,
          report: municipalAchievements.generateReport()
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
      onComplete: handleSceneComplete,
      analytics,
    };

    switch (currentScene.type) {
      case 'dialogue':
        return (
          <DialogueScene 
            sceneData={currentScene as any}
            onComplete={() => handleSceneComplete({ nextScene: currentScene?.navigation?.next })}
            municipalBranding={{
              primaryColor: gameManifest.theme?.colors?.primary || '#005AA0',
              logoUrl: gameManifest.theme?.brand?.logo?.url || '',
              municipality: gameManifest.theme?.brand?.name || 'Svenska Kommuner'
            }}
            culturalContext={'swedish' as const}
            playerName={playerName}
          />
        );
      case 'quiz':
        return (
          <QuizScene 
            sceneData={currentScene as any}
            onComplete={(results) => handleSceneComplete({ score: results.score })}
            municipalBranding={{
              primaryColor: gameManifest.theme?.colors?.primary || '#005AA0',
              logoUrl: gameManifest.theme?.brand?.logo?.url || '',
              municipality: gameManifest.theme?.brand?.name || 'Svenska Kommuner'
            }}
            culturalContext={'swedish' as const}
            playerName={playerName}
          />
        );
      case 'assessment':
        return <AssessmentScene scene={currentScene as any} {...baseProps} />;
      case 'resource':
        return <ResourceScene scene={currentScene as any} {...baseProps} />;
      case 'summary':
        return <SummaryScene scene={currentScene as any} {...baseProps} />;
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
      <GameErrorBoundary gameId={gameManifest.gameId}>
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
        {/* TASK-HD-014: Municipal Progress Indicator with Achievement Milestones */}
        {gameManifest.settings?.showProgress !== false && (
          <Box w="100%" bg="white" py={4} px={6} borderBottom="1px solid" borderBottomColor="gray.200">
            <MunicipalProgressIndicator
              progress={{
                currentStep: gameState.scenesCompleted.length,
                totalSteps: gameManifest.scenes.length,
                completedSections: gameState.scenesCompleted,
                achievementMilestones: getLocalizedMilestones('swedish').map(milestone => ({
                  ...milestone,
                  achieved: municipalAchievements.isAchievementEarned(milestone.id)
                })),
                competenciesEarned: municipalAchievements.competencies
              }}
              visualDesign={{
                baseColor: '#E2E8F0',
                progressColor: gameManifest.theme?.colors?.primary || '#0066CC',
                milestoneColor: '#004C99',
                textColor: '#333333'
              }}
              achievementIntegration={{
                milestoneMarkers: true,
                hoverDetails: true,
                clickableMarkers: false, // Keep simple for Anna's workflow
                professionalLabels: true
              }}
              accessibility={{
                ariaLabel: 'GDPR-utbildning framsteg med kompetensmål',
                ariaValueText: `${gameState.scenesCompleted.length} av ${gameManifest.scenes.length} sektioner slutförda, ${municipalAchievements.competencies.length} kompetenser utvecklade`,
                keyboardNavigation: true
              }}
              culturalContext="swedish"
              municipalEntity={gameManifest.theme?.brand?.name || 'Malmö Stad'}
            />
          </Box>
        )}
        
        {/* Main content area - Game Designer spec: Focus management */}
        <Box 
          ref={mainContentRef as any}
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
        
        {/* TASK-HD-014: Municipal Achievement Toast Notifications */}
        {municipalAchievements.currentToast && (
          <MunicipalToastNotification
            achievement={municipalAchievements.currentToast}
            design={{
              variant: 'municipal-achievement',
              culturalContext: 'swedish',
              municipalEntity: 'malmö',
              professionalLevel: 'intermediate'
            }}
            accessibility={{
              dismissible: true,
              autoTimeout: 4000,
              reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
              screenReaderFriendly: true
            }}
            integration={{
              onDismiss: municipalAchievements.dismissCurrentToast,
              analytics: (event, data) => {
                analytics?.trackEvent(event, {
                  ...data,
                  gameId: gameManifest.gameId,
                  sceneId: currentSceneId,
                  playerName
                });
              }
            }}
          />
        )}
      </VStack>
      </GameErrorBoundary>
    </ChakraThemeProvider>
  );
};