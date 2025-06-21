/**
 * Timed Challenge System - Municipal Emergency Training
 * Task: proposal-030 - Q2 Interactive Mechanics Implementation
 * 
 * Time-pressure mechanics för emergency preparedness with municipal scenarios
 * Optimized för Anna Svensson iPhone 12 + cultural sensitivity
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTimerChallenge } from './hooks/useTimerChallenge';
import { useMunicipalEmergency } from './hooks/useMunicipalEmergency';

interface EmergencyScenario {
  id: string;
  type: 'fire' | 'flood' | 'power_outage' | 'evacuation' | 'medical' | 'cyber_attack';
  title: string;
  description: string;
  timeLimit: number; // seconds
  difficulty: 1 | 2 | 3 | 4 | 5;
  municipality: 'malmö' | 'göteborg' | 'stockholm' | 'berlin';
  requiredActions: EmergencyAction[];
  culturalConsiderations: {
    swedishProtocols?: boolean;
    germanProcedures?: boolean;
    euStandards: boolean;
  };
  accessibilityFeatures: {
    visualAlerts: boolean;
    audioAlerts: boolean;
    hapticFeedback: boolean;
    keyboardNavigation: boolean;
  };
}

interface EmergencyAction {
  id: string;
  type: 'communication' | 'resource_allocation' | 'evacuation' | 'coordination';
  description: string;
  timeRequirement: number; // seconds
  priority: 'critical' | 'high' | 'medium' | 'low';
  completed: boolean;
  municipalRole: string[];
}

interface TimedChallengeSystemProps {
  scenario: EmergencyScenario;
  userRole: 'emergency_coordinator' | 'fire_chief' | 'police_commander' | 'medical_director' | 'municipal_manager';
  onChallengeComplete: (result: ChallengeResult) => void;
  onChallengeAbort: () => void;
  locale: 'sv' | 'de' | 'fr' | 'nl';
}

interface ChallengeResult {
  success: boolean;
  timeRemaining: number;
  actionsCompleted: number;
  totalActions: number;
  score: number;
  municipalEffectiveness: number;
  culturalAppropriatenesScore: number;
  accessibilityCompliance: boolean;
}

const URGENCY_THRESHOLDS = {
  critical: 0.2,  // 20% time remaining - red
  urgent: 0.4,    // 40% time remaining - orange  
  moderate: 0.7,  // 70% time remaining - yellow
  normal: 1.0     // 100% time remaining - green
};

const SCENARIO_TITLES = {
  sv: {
    fire: 'Brandlarm - Kommunhus',
    flood: 'Översvämning - Centrala staden', 
    power_outage: 'Strömavbrott - Kritisk infrastruktur',
    evacuation: 'Utrymning - Offentlig byggnad',
    medical: 'Medicinsk kris - Vårdcentral',
    cyber_attack: 'Cyberattack - IT-system'
  },
  de: {
    fire: 'Feueralarm - Rathaus',
    flood: 'Überschwemmung - Stadtzentrum',
    power_outage: 'Stromausfall - Kritische Infrastruktur', 
    evacuation: 'Evakuierung - Öffentliches Gebäude',
    medical: 'Medizinische Krise - Gesundheitszentrum',
    cyber_attack: 'Cyberangriff - IT-System'
  },
  fr: {
    fire: 'Alarme incendie - Mairie',
    flood: 'Inondation - Centre-ville',
    power_outage: 'Panne électrique - Infrastructure critique',
    evacuation: 'Évacuation - Bâtiment public', 
    medical: 'Crise médicale - Centre de santé',
    cyber_attack: 'Cyberattaque - Système informatique'
  },
  nl: {
    fire: 'Brandalarm - Gemeentehuis',
    flood: 'Overstroming - Stadscentrum',
    power_outage: 'Stroomuitval - Kritieke infrastructuur',
    evacuation: 'Evacuatie - Openbaar gebouw',
    medical: 'Medische crisis - Gezondheidscentrum', 
    cyber_attack: 'Cyberaanval - IT-systeem'
  }
};

export const TimedChallengeSystem: React.FC<TimedChallengeSystemProps> = ({
  scenario,
  userRole,
  onChallengeComplete,
  onChallengeAbort,
  locale
}) => {
  const [gameState, setGameState] = useState<'ready' | 'active' | 'paused' | 'completed' | 'failed'>('ready');
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [currentScore, setCurrentScore] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  const {
    timeRemaining,
    isActive,
    urgencyLevel,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer
  } = useTimerChallenge({
    duration: scenario.timeLimit,
    onTimeUp: handleTimeUp,
    onUrgencyChange: handleUrgencyChange
  });

  const {
    validateEmergencyAction,
    calculateMunicipalEffectiveness,
    checkCulturalAppropriateness
  } = useMunicipalEmergency();

  const handleTimeUp = useCallback(() => {
    setGameState('failed');
    
    const result: ChallengeResult = {
      success: false,
      timeRemaining: 0,
      actionsCompleted: completedActions.size,
      totalActions: scenario.requiredActions.length,
      score: currentScore,
      municipalEffectiveness: calculateMunicipalEffectiveness(completedActions, scenario),
      culturalAppropriatenesScore: checkCulturalAppropriateness(scenario, locale),
      accessibilityCompliance: validateAccessibilityCompliance()
    };
    
    onChallengeComplete(result);
  }, [completedActions, currentScore, scenario, locale, onChallengeComplete, calculateMunicipalEffectiveness, checkCulturalAppropriateness]);

  const handleUrgencyChange = useCallback((urgency: string) => {
    // Visual feedback för urgency changes
    if (progressBarRef.current) {
      progressBarRef.current.classList.add(`urgency-${urgency}`);
      
      // Remove old urgency classes
      Object.keys(URGENCY_THRESHOLDS).forEach(level => {
        if (level !== urgency) {
          progressBarRef.current?.classList.remove(`urgency-${level}`);
        }
      });
    }

    // Haptic feedback för mobile (Anna Svensson iPhone 12)
    if ('vibrate' in navigator && urgency === 'critical') {
      navigator.vibrate([100, 50, 100]); // SOS pattern
    }
  }, []);

  const handleActionComplete = useCallback(async (actionId: string) => {
    const action = scenario.requiredActions.find(a => a.id === actionId);
    if (!action || completedActions.has(actionId)) return;

    // Validate action appropriateness
    const isValidAction = await validateEmergencyAction({
      action,
      userRole,
      scenario,
      timeContext: timeRemaining,
      locale
    });

    if (!isValidAction.isValid) {
      console.warn('Invalid emergency action:', isValidAction.reason);
      return;
    }

    // Mark action as completed
    setCompletedActions(prev => new Set([...prev, actionId]));
    
    // Calculate score based on timing and priority
    const timingMultiplier = timeRemaining / scenario.timeLimit;
    const priorityMultiplier = action.priority === 'critical' ? 3 : 
                              action.priority === 'high' ? 2 :
                              action.priority === 'medium' ? 1.5 : 1;
    
    const actionScore = Math.round(100 * timingMultiplier * priorityMultiplier);
    setCurrentScore(prev => prev + actionScore);

    // Check för completion
    const newCompletedCount = completedActions.size + 1;
    if (newCompletedCount >= scenario.requiredActions.length) {
      handleChallengeSuccess();
    }
  }, [scenario, completedActions, timeRemaining, userRole, locale, validateEmergencyAction]);

  const handleChallengeSuccess = useCallback(() => {
    setGameState('completed');
    pauseTimer();
    
    const result: ChallengeResult = {
      success: true,
      timeRemaining,
      actionsCompleted: completedActions.size,
      totalActions: scenario.requiredActions.length,
      score: currentScore,
      municipalEffectiveness: calculateMunicipalEffectiveness(completedActions, scenario),
      culturalAppropriatenesScore: checkCulturalAppropriateness(scenario, locale),
      accessibilityCompliance: validateAccessibilityCompliance()
    };
    
    onChallengeComplete(result);
  }, [timeRemaining, completedActions, currentScore, scenario, locale, pauseTimer, onChallengeComplete, calculateMunicipalEffectiveness, checkCulturalAppropriateness]);

  const validateAccessibilityCompliance = useCallback((): boolean => {
    return scenario.accessibilityFeatures.visualAlerts &&
           scenario.accessibilityFeatures.audioAlerts &&
           scenario.accessibilityFeatures.keyboardNavigation;
  }, [scenario.accessibilityFeatures]);

  const startChallenge = useCallback(() => {
    setGameState('active');
    startTimer();
  }, [startTimer]);

  const pauseChallenge = useCallback(() => {
    setGameState('paused');
    pauseTimer();
  }, [pauseTimer]);

  const resumeChallenge = useCallback(() => {
    setGameState('active');
    resumeTimer();
  }, [resumeTimer]);

  const getUrgencyColor = (): string => {
    switch (urgencyLevel) {
      case 'critical': return '#dc2626'; // red-600
      case 'urgent': return '#ea580c';   // orange-600
      case 'moderate': return '#ca8a04';  // yellow-600
      case 'normal': return '#16a34a';    // green-600
      default: return '#6b7280';          // gray-500
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getActionPriorityIcon = (priority: string): string => {
    switch (priority) {
      case 'critical': return '🚨';
      case 'high': return '⚡';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  };

  const scenarioTitles = SCENARIO_TITLES[locale];

  return (
    <div 
      className="timed-challenge-system"
      role="main"
      aria-label={`Emergency training: ${scenarioTitles[scenario.type]}`}
    >
      {/* Challenge Header */}
      <div className="challenge-header bg-red-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-red-900 mb-1">
              {scenarioTitles[scenario.type]}
            </h2>
            <p className="text-red-700 text-sm">
              {scenario.description}
            </p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="px-2 py-1 bg-red-200 text-red-800 rounded">
                {locale === 'sv' && `Svårighetsgrad: ${scenario.difficulty}/5`}
                {locale === 'de' && `Schwierigkeit: ${scenario.difficulty}/5`}
                {locale === 'fr' && `Difficulté: ${scenario.difficulty}/5`}
                {locale === 'nl' && `Moeilijkheid: ${scenario.difficulty}/5`}
              </span>
              <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">
                {scenario.municipality}
              </span>
            </div>
          </div>
          
          {/* Timer Display */}
          <div className="text-center">
            <div 
              className="text-3xl font-mono font-bold mb-1"
              style={{ color: getUrgencyColor() }}
              aria-live="polite"
              aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
            >
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-gray-600">
              {locale === 'sv' && 'Tid kvar'}
              {locale === 'de' && 'Verbleibend'}
              {locale === 'fr' && 'Temps restant'}
              {locale === 'nl' && 'Tijd over'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div 
            ref={progressBarRef}
            className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"
          >
            <div 
              className="h-full transition-all duration-500 ease-out"
              style={{ 
                width: `${(timeRemaining / scenario.timeLimit) * 100}%`,
                backgroundColor: getUrgencyColor()
              }}
              aria-label={`Progress: ${Math.round((timeRemaining / scenario.timeLimit) * 100)}%`}
            />
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="game-controls mb-6 flex gap-3">
        {gameState === 'ready' && (
          <button
            onClick={startChallenge}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            aria-label={locale === 'sv' ? 'Starta övning' : locale === 'de' ? 'Übung starten' : locale === 'fr' ? 'Commencer exercice' : 'Start oefening'}
          >
            {locale === 'sv' && '🚀 Starta Övning'}
            {locale === 'de' && '🚀 Übung Starten'}
            {locale === 'fr' && '🚀 Commencer Exercice'}
            {locale === 'nl' && '🚀 Start Oefening'}
          </button>
        )}
        
        {gameState === 'active' && (
          <button
            onClick={pauseChallenge}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            {locale === 'sv' && '⏸️ Pausa'}
            {locale === 'de' && '⏸️ Pausieren'}
            {locale === 'fr' && '⏸️ Pause'}
            {locale === 'nl' && '⏸️ Pauzeren'}
          </button>
        )}
        
        {gameState === 'paused' && (
          <button
            onClick={resumeChallenge}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {locale === 'sv' && '▶️ Fortsätt'}
            {locale === 'de' && '▶️ Fortsetzen'}
            {locale === 'fr' && '▶️ Continuer'}
            {locale === 'nl' && '▶️ Hervatten'}
          </button>
        )}
        
        <button
          onClick={onChallengeAbort}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {locale === 'sv' && '❌ Avbryt'}
          {locale === 'de' && '❌ Abbrechen'}
          {locale === 'fr' && '❌ Annuler'}
          {locale === 'nl' && '❌ Annuleren'}
        </button>
      </div>

      {/* Emergency Actions */}
      <div className="emergency-actions">
        <h3 className="text-lg font-semibold mb-4">
          {locale === 'sv' && 'Nödåtgärder'}
          {locale === 'de' && 'Notfallmaßnahmen'}
          {locale === 'fr' && "Actions d'urgence"}
          {locale === 'nl' && 'Noodmaatregelen'}
        </h3>
        
        <div className="actions-grid grid gap-3">
          {scenario.requiredActions
            .sort((a, b) => {
              const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .map(action => {
              const isCompleted = completedActions.has(action.id);
              const canPerformAction = action.municipalRole.includes(userRole);
              
              return (
                <div
                  key={action.id}
                  className={`action-card p-4 rounded-lg border-2 transition-all ${
                    isCompleted 
                      ? 'bg-green-50 border-green-300'
                      : canPerformAction
                      ? 'bg-white border-gray-300 hover:border-blue-400 cursor-pointer'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                  onClick={canPerformAction && !isCompleted && gameState === 'active' 
                    ? () => handleActionComplete(action.id) 
                    : undefined}
                  role={canPerformAction && !isCompleted ? 'button' : undefined}
                  tabIndex={canPerformAction && !isCompleted ? 0 : -1}
                  aria-label={`${action.description} - ${action.priority} priority`}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && canPerformAction && !isCompleted && gameState === 'active') {
                      handleActionComplete(action.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-lg">{getActionPriorityIcon(action.priority)}</span>
                    <div className="flex gap-1">
                      {isCompleted && <span className="text-green-600">✅</span>}
                      {!canPerformAction && (
                        <span className="text-gray-400 text-xs">
                          {locale === 'sv' && 'Ej din roll'}
                          {locale === 'de' && 'Nicht Ihre Rolle'}
                          {locale === 'fr' && 'Pas votre rôle'}
                          {locale === 'nl' && 'Niet uw rol'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-sm mb-1">{action.description}</h4>
                  
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>{action.priority}</span>
                    <span>~{action.timeRequirement}s</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Score Display */}
      <div className="score-display mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-900">{currentScore}</div>
            <div className="text-blue-700 text-sm">
              {locale === 'sv' && 'Poäng'}
              {locale === 'de' && 'Punkte'}
              {locale === 'fr' && 'Points'}
              {locale === 'nl' && 'Punten'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-900">
              {completedActions.size}/{scenario.requiredActions.length}
            </div>
            <div className="text-blue-700 text-sm">
              {locale === 'sv' && 'Åtgärder'}
              {locale === 'de' && 'Maßnahmen'}
              {locale === 'fr' && 'Actions'}
              {locale === 'nl' && 'Acties'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-900">
              {Math.round((completedActions.size / scenario.requiredActions.length) * 100)}%
            </div>
            <div className="text-blue-700 text-sm">
              {locale === 'sv' && 'Framsteg'}
              {locale === 'de' && 'Fortschritt'}
              {locale === 'fr' && 'Progrès'}
              {locale === 'nl' && 'Voortgang'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimedChallengeSystem;