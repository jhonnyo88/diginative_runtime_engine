/**
 * Branching Narrative Engine - Municipal Decision-Making Scenarios
 * Task: proposal-033 - Q2 Interactive Mechanics Implementation
 * 
 * Complex decision trees för municipal scenarios with character-driven outcomes
 * Integration with character system and cultural localization
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCharacterContext } from './CharacterContext';
import { useMunicipalCompliance } from './hooks/useMunicipalCompliance';

interface NarrativeChoice {
  id: string;
  text: string;
  consequence: string;
  characterImpact: {
    [characterId: string]: {
      emotionChange: number;
      relationshipChange: number;
      competenceGain?: string[];
    };
  };
  municipalImpact: {
    budgetChange?: number;
    reputationChange?: number;
    complianceRisk?: 'low' | 'medium' | 'high';
    stakeholderReaction?: string[];
  };
  prerequisites?: {
    characterLevel?: number;
    municipalRole?: string[];
    previousChoices?: string[];
  };
  culturalVariations?: {
    [locale: string]: {
      text: string;
      consequence: string;
      stakeholderReaction?: string[];
    };
  };
}

interface NarrativeNode {
  id: string;
  type: 'story' | 'decision' | 'consequence' | 'ending';
  title: string;
  description: string;
  speaker?: string;
  characterEmotions?: {
    [characterId: string]: string;
  };
  choices?: NarrativeChoice[];
  nextNode?: string;
  conditions?: {
    characterRelationships?: { [characterId: string]: number };
    municipalStatus?: { budget: number; reputation: number };
    timeLimit?: number;
  };
  culturalAdaptations?: {
    [locale: string]: {
      title: string;
      description: string;
      speaker?: string;
    };
  };
}

interface MunicipalScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  municipality: 'malmö' | 'göteborg' | 'stockholm' | 'berlin' | 'paris' | 'amsterdam';
  category: 'budget_crisis' | 'service_delivery' | 'emergency_response' | 'regulatory_compliance' | 'stakeholder_conflict';
  estimatedTime: number; // minutes
  nodes: NarrativeNode[];
  startingConditions: {
    budget: number;
    reputation: number;
    timeRemaining: number;
  };
  learningObjectives: string[];
  culturalContext: {
    [locale: string]: {
      title: string;
      description: string;
      stakeholders: string[];
      regulations: string[];
    };
  };
}

interface BranchingNarrativeEngineProps {
  scenario: MunicipalScenario;
  userRole: 'municipal_manager' | 'department_head' | 'service_coordinator' | 'policy_advisor';
  onScenarioComplete: (result: ScenarioResult) => void;
  onScenarioAbort: () => void;
  locale: 'sv' | 'de' | 'fr' | 'nl';
}

interface ScenarioResult {
  success: boolean;
  finalBudget: number;
  finalReputation: number;
  choicesMade: string[];
  characterRelationships: { [characterId: string]: number };
  learningAchievements: string[];
  culturalAppropriatenessScore: number;
  timeEfficiency: number;
  municipalImpactScore: number;
}

interface GameState {
  currentNodeId: string;
  budget: number;
  reputation: number;
  timeRemaining: number;
  choiceHistory: string[];
  characterRelationships: { [characterId: string]: number };
  visitedNodes: Set<string>;
}


export const BranchingNarrativeEngine: React.FC<BranchingNarrativeEngineProps> = ({
  scenario,
  userRole,
  onScenarioComplete,
  onScenarioAbort,
  locale
}) => {
  const { characters, updateCharacterRelationship, updateCharacterEmotion } = useCharacterContext();
  const { validateMunicipalCompliance } = useMunicipalCompliance();
  
  const [gameState, setGameState] = useState<GameState>({
    currentNodeId: scenario.nodes[0]?.id || '',
    budget: scenario.startingConditions.budget,
    reputation: scenario.startingConditions.reputation,
    timeRemaining: scenario.startingConditions.timeRemaining,
    choiceHistory: [],
    characterRelationships: Record<string, unknown>,
    visitedNodes: new Set()
  });

  const [isProcessingChoice, setIsProcessingChoice] = useState(false);
  const [scenarioStartTime] = useState(Date.now());


  // Timer countdown
  useEffect(() => {
    if (gameState.timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1)
        }));
      }, 60000); // 1 minute intervals
    } else {
      handleScenarioTimeout();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameState.timeRemaining]);

