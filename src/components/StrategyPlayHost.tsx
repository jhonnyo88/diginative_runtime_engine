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
