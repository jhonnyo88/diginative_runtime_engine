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

const SCENARIO_TEMPLATES = {
  budget_crisis: {
    sv: {
      stakeholders: ['Kommunfullmäktige', 'Stadsråd', 'Verksamhetschefer', 'Fackförbund'],
      regulations: ['Kommunallagen', 'LOU', 'Plan- och bygglagen'],
      culturalConsiderations: ['Transparens', 'Demokratisk process', 'Välfärd']
    },
    de: {
      stakeholders: ['Gemeinderat', 'Bürgermeister', 'Fachbereichsleiter', 'Gewerkschaften'],
      regulations: ['Gemeindeordnung', 'Vergaberecht', 'Baugesetzbuch'],
      culturalConsiderations: ['Effizienz', 'Rechtssicherheit', 'Bürgernähe']
    },
    fr: {
      stakeholders: ['Conseil municipal', 'Maire', 'Directeurs', 'Syndicats'],
      regulations: ['Code général des collectivités', 'Code des marchés publics', 'Code urbanisme'],
      culturalConsiderations: ['Service public', 'Égalité', 'Laïcité']
    },
    nl: {
      stakeholders: ['Gemeenteraad', 'Burgemeester', 'Afdelingshoofden', 'Vakbonden'],
      regulations: ['Gemeentewet', 'Aanbestedingswet', 'Omgevingswet'],
      culturalConsiderations: ['Consensus', 'Participatie', 'Innovatie']
    }
  }
};

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
    characterRelationships: {},
    visitedNodes: new Set()
  });

  const [isProcessingChoice, setIsProcessingChoice] = useState(false);
  const [scenarioStartTime] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentNode = scenario.nodes.find(node => node.id === gameState.currentNodeId);
  const culturalContext = scenario.culturalContext[locale];

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

  const handleChoiceSelection = useCallback(async (choice: NarrativeChoice) => {
    if (isProcessingChoice) return;

    setIsProcessingChoice(true);

    // Validate choice appropriateness
    const complianceResult = await validateMunicipalCompliance({
      targetStage: 'choice_validation',
      municipality: scenario.municipality,
      locale,
      userRole
    });

    // Apply choice consequences
    let budgetChange = choice.municipalImpact.budgetChange || 0;
    let reputationChange = choice.municipalImpact.reputationChange || 0;

    // Cultural adaptation
    const culturalVariation = choice.culturalVariations?.[locale];
    if (culturalVariation) {
      // Apply cultural modifications
      if (locale === 'sv' && choice.municipalImpact.complianceRisk === 'low') {
        reputationChange += 5; // Swedish transparency bonus
      }
      if (locale === 'de' && choice.consequence.includes('efficiency')) {
        budgetChange += 10; // German efficiency bonus
      }
    }

    // Update character relationships
    Object.entries(choice.characterImpact).forEach(([characterId, impact]) => {
      updateCharacterRelationship(characterId, impact.relationshipChange);
      if (impact.emotionChange !== 0) {
        updateCharacterEmotion(characterId, impact.emotionChange > 0 ? 'pleased' : 'concerned');
      }
    });

    // Update game state
    setGameState(prev => ({
      ...prev,
      budget: Math.max(0, prev.budget + budgetChange),
      reputation: Math.max(0, Math.min(100, prev.reputation + reputationChange)),
      choiceHistory: [...prev.choiceHistory, choice.id],
      visitedNodes: new Set([...prev.visitedNodes, currentNode?.id || ''])
    }));

    // Progress to next node
    const nextNodeId = findNextNode(choice, gameState);
    if (nextNodeId) {
      setGameState(prev => ({
        ...prev,
        currentNodeId: nextNodeId
      }));
    } else {
      handleScenarioComplete();
    }

    setIsProcessingChoice(false);
  }, [currentNode, gameState, isProcessingChoice, locale, scenario, userRole, validateMunicipalCompliance, updateCharacterRelationship, updateCharacterEmotion]);

  const findNextNode = (choice: NarrativeChoice, state: GameState): string | null => {
    // Complex branching logic based on choice consequences
    const currentNodeIndex = scenario.nodes.findIndex(node => node.id === state.currentNodeId);
    
    // Check för conditional branching
    for (let i = currentNodeIndex + 1; i < scenario.nodes.length; i++) {
      const node = scenario.nodes[i];
      
      if (node.conditions) {
        // Check budget/reputation thresholds
        if (node.conditions.municipalStatus) {
          const { budget, reputation } = node.conditions.municipalStatus;
          if (state.budget >= budget && state.reputation >= reputation) {
            return node.id;
          }
        }
        
        // Check character relationship requirements
        if (node.conditions.characterRelationships) {
          const meetsRelationshipRequirements = Object.entries(node.conditions.characterRelationships)
            .every(([charId, minRelationship]) => 
              (state.characterRelationships[charId] || 0) >= minRelationship
            );
          
          if (meetsRelationshipRequirements) {
            return node.id;
          }
        }
      } else {
        // Default progression
        return node.id;
      }
    }

    return null; // End of scenario
  };

  const handleScenarioTimeout = useCallback(() => {
    const result: ScenarioResult = {
      success: false,
      finalBudget: gameState.budget,
      finalReputation: gameState.reputation,
      choicesMade: gameState.choiceHistory,
      characterRelationships: gameState.characterRelationships,
      learningAchievements: calculateLearningAchievements(gameState, scenario, false),
      culturalAppropriatenessScore: calculateCulturalScore(gameState, scenario, locale),
      timeEfficiency: 0,
      municipalImpactScore: calculateMunicipalImpact(gameState, scenario)
    };

    onScenarioComplete(result);
  }, [gameState, scenario, locale, onScenarioComplete]);

  const handleScenarioComplete = useCallback(() => {
    const timeElapsed = (Date.now() - scenarioStartTime) / 1000 / 60; // minutes
    const timeEfficiency = Math.max(0, (scenario.estimatedTime - timeElapsed) / scenario.estimatedTime);

    const result: ScenarioResult = {
      success: gameState.budget > 0 && gameState.reputation > 30,
      finalBudget: gameState.budget,
      finalReputation: gameState.reputation,
      choicesMade: gameState.choiceHistory,
      characterRelationships: gameState.characterRelationships,
      learningAchievements: calculateLearningAchievements(gameState, scenario, true),
      culturalAppropriatenessScore: calculateCulturalScore(gameState, scenario, locale),
      timeEfficiency,
      municipalImpactScore: calculateMunicipalImpact(gameState, scenario)
    };

    onScenarioComplete(result);
  }, [gameState, scenario, scenarioStartTime, locale, onScenarioComplete]);

  // Helper functions
  const calculateLearningAchievements = (state: GameState, scenario: MunicipalScenario, completed: boolean): string[] => {
    const achievements: string[] = [];
    
    if (completed) achievements.push('scenario_completion');
    if (state.budget >= scenario.startingConditions.budget) achievements.push('budget_management');
    if (state.reputation >= scenario.startingConditions.reputation) achievements.push('stakeholder_relations');
    if (state.choiceHistory.length >= 5) achievements.push('comprehensive_decision_making');
    
    return achievements;
  };

  const calculateCulturalScore = (state: GameState, scenario: MunicipalScenario, locale: string): number => {
    let score = 0.7; // Base score
    
    // Bonus för appropriate cultural choices
    const culturalChoices = state.choiceHistory.filter(choiceId => {
      const choice = scenario.nodes
        .flatMap(node => node.choices || [])
        .find(c => c.id === choiceId);
      return choice?.culturalVariations?.[locale] !== undefined;
    });
    
    score += (culturalChoices.length / state.choiceHistory.length) * 0.3;
    
    return Math.min(1.0, score);
  };

  const calculateMunicipalImpact = (state: GameState, scenario: MunicipalScenario): number => {
    const budgetScore = state.budget / scenario.startingConditions.budget;
    const reputationScore = state.reputation / scenario.startingConditions.reputation;
    
    return (budgetScore * 0.4 + reputationScore * 0.6);
  };

  const formatTime = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const getStatusColor = (value: number, max: number): string => {
    const percentage = (value / max) * 100;
    if (percentage >= 70) return '#16a34a'; // green
    if (percentage >= 40) return '#ca8a04'; // yellow
    return '#dc2626'; // red
  };

  if (!currentNode) {
    return <div>Scenario loading...</div>;
  }

  return (
    <div className="branching-narrative-engine max-w-4xl mx-auto p-6">
      {/* Scenario Header */}
      <div className="scenario-header bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-blue-900">
              {culturalContext?.title || scenario.title}
            </h2>
            <p className="text-blue-700 text-sm">
              {culturalContext?.description || scenario.description}
            </p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">
                {scenario.category}
              </span>
              <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">
                {locale === 'sv' && `Svårighetsgrad: ${scenario.difficulty}/5`}
                {locale === 'de' && `Schwierigkeit: ${scenario.difficulty}/5`}
                {locale === 'fr' && `Difficulté: ${scenario.difficulty}/5`}
                {locale === 'nl' && `Moeilijkheid: ${scenario.difficulty}/5`}
              </span>
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            <div 
              className="text-2xl font-mono font-bold"
              style={{ color: getStatusColor(gameState.timeRemaining, scenario.startingConditions.timeRemaining) }}
            >
              {formatTime(gameState.timeRemaining)}
            </div>
            <div className="text-xs text-gray-600">
              {locale === 'sv' && 'Tid kvar'}
              {locale === 'de' && 'Verbleibend'}
              {locale === 'fr' && 'Temps restant'}
              {locale === 'nl' && 'Tijd over'}
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Budget</span>
              <span>{gameState.budget.toLocaleString()} SEK</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (gameState.budget / scenario.startingConditions.budget) * 100)}%`,
                  backgroundColor: getStatusColor(gameState.budget, scenario.startingConditions.budget)
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Rykte</span>
              <span>{gameState.reputation}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${gameState.reputation}%`,
                  backgroundColor: getStatusColor(gameState.reputation, 100)
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current Narrative Node */}
      <div className="narrative-content bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">
          {currentNode.culturalAdaptations?.[locale]?.title || currentNode.title}
        </h3>
        
        {currentNode.speaker && (
          <div className="speaker-indicator mb-3 text-sm font-medium text-gray-600">
            🗣️ {currentNode.culturalAdaptations?.[locale]?.speaker || currentNode.speaker}
          </div>
        )}

        <div className="narrative-text mb-6 text-gray-800 leading-relaxed">
          {currentNode.culturalAdaptations?.[locale]?.description || currentNode.description}
        </div>

        {/* Character Emotions */}
        {currentNode.characterEmotions && (
          <div className="character-emotions mb-6 p-4 bg-gray-50 rounded">
            <h4 className="text-sm font-medium mb-2">Karaktärsreaktioner:</h4>
            <div className="flex gap-4">
              {Object.entries(currentNode.characterEmotions).map(([charId, emotion]) => (
                <div key={charId} className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{charId}:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {emotion}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Choices */}
        {currentNode.choices && currentNode.choices.length > 0 && (
          <div className="choices-container">
            <h4 className="text-md font-semibold mb-4">Vad gör du?</h4>
            <div className="space-y-3">
              {currentNode.choices.map((choice, index) => {
                const culturalChoice = choice.culturalVariations?.[locale];
                const isDisabled = isProcessingChoice || 
                  (choice.prerequisites?.municipalRole && 
                   !choice.prerequisites.municipalRole.includes(userRole));

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleChoiceSelection(choice)}
                    disabled={isDisabled}
                    className={`choice-button w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isDisabled
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                    }`}
                  >
                    <div className="choice-text font-medium mb-2">
                      {index + 1}. {culturalChoice?.text || choice.text}
                    </div>
                    <div className="choice-consequence text-sm text-gray-600">
                      <strong>Konsekvens:</strong> {culturalChoice?.consequence || choice.consequence}
                    </div>
                    
                    {/* Impact Preview */}
                    <div className="impact-preview mt-2 flex gap-4 text-xs">
                      {choice.municipalImpact.budgetChange && (
                        <span className={`${choice.municipalImpact.budgetChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Budget: {choice.municipalImpact.budgetChange > 0 ? '+' : ''}{choice.municipalImpact.budgetChange}
                        </span>
                      )}
                      {choice.municipalImpact.reputationChange && (
                        <span className={`${choice.municipalImpact.reputationChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Rykte: {choice.municipalImpact.reputationChange > 0 ? '+' : ''}{choice.municipalImpact.reputationChange}
                        </span>
                      )}
                      {choice.municipalImpact.complianceRisk && (
                        <span className={`${
                          choice.municipalImpact.complianceRisk === 'low' ? 'text-green-600' : 
                          choice.municipalImpact.complianceRisk === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          Risk: {choice.municipalImpact.complianceRisk}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Auto-progression för story nodes */}
        {currentNode.type === 'story' && currentNode.nextNode && (
          <div className="auto-progress mt-6 text-center">
            <button
              onClick={() => setGameState(prev => ({ ...prev, currentNodeId: currentNode.nextNode! }))}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fortsätt →
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="control-buttons flex gap-3">
        <button
          onClick={onScenarioAbort}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {locale === 'sv' && '❌ Avbryt scenario'}
          {locale === 'de' && '❌ Szenario abbrechen'}
          {locale === 'fr' && '❌ Annuler scénario'}
          {locale === 'nl' && '❌ Scenario annuleren'}
        </button>
      </div>
    </div>
  );
};

export default BranchingNarrativeEngine;