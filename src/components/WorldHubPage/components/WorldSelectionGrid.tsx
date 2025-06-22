/**
 * World Selection Grid Component
 * 5-world navigation grid for Q3 Multi-World Hub
 * Building on Q2 navigation patterns with progressive unlock system
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorldHubState, getWorldDefinition, isValidWorldIndex } from '../../../types/q3-multi-world';
import './WorldSelectionGrid.css';

interface WorldSelectionGridProps {
  hubState: WorldHubState;
  onWorldSelect: (worldIndex: number) => void;
  selectedWorld: number | null;
  culturalContext: 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal';
}

export const WorldSelectionGrid: React.FC<WorldSelectionGridProps> = ({
  hubState,
  onWorldSelect,
  selectedWorld,
  culturalContext
}) => {
  const getWorldStatus = (worldIndex: number) => {
    const worldStatus = hubState.worldCompletionStatus.find(w => w.worldIndex === worldIndex);
    return worldStatus || {
      worldIndex,
      worldId: `world-${worldIndex}`,
      status: 'locked' as const,
      score: 0,
      completionPercentage: 0,
      timeSpent: 0,
      achievementsUnlocked: [],
      competencyGains: Record<string, unknown>
    };
  };

  const getWorldIcon = (worldIndex: number, status: string) => {
    const icons = {
      1: { available: '🏛️', completed: '✅', locked: '🔒', in_progress: '⏳' },
      2: { available: '👥', completed: '✅', locked: '🔒', in_progress: '⏳' },
      3: { available: '🚨', completed: '✅', locked: '🔒', in_progress: '⏳' },
      4: { available: '👔', completed: '✅', locked: '🔒', in_progress: '⏳' },
      5: { available: '💡', completed: '✅', locked: '🔒', in_progress: '⏳' }
    };
    return icons[worldIndex as keyof typeof icons]?.[status as keyof typeof icons[1]] || '🔒';
  };

  const getCulturalWorldTitle = (worldIndex: number) => {
    const worldDef = getWorldDefinition(worldIndex);
    if (!worldDef) return `Värld ${worldIndex}`;
    
    const titleMap = {
      swedish_municipal: worldDef.title.swedish,
      german_municipal: worldDef.title.german,
      french_municipal: worldDef.title.french,
      dutch_municipal: worldDef.title.dutch
    };
    
    return titleMap[culturalContext] || worldDef.title.swedish;
  };

  const getCulturalWorldDescription = (worldIndex: number) => {
    const worldDef = getWorldDefinition(worldIndex);
    if (!worldDef) return `Beskrivning för värld ${worldIndex}`;
    
    const descMap = {
      swedish_municipal: worldDef.description.swedish,
      german_municipal: worldDef.description.german,
      french_municipal: worldDef.description.french,
      dutch_municipal: worldDef.description.dutch
    };
    
    return descMap[culturalContext] || worldDef.description.swedish;
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      swedish_municipal: {
        locked: 'Låst',
        available: 'Tillgänglig',
        in_progress: 'Pågående',
        completed: 'Slutförd'
      },
      german_municipal: {
        locked: 'Gesperrt',
        available: 'Verfügbar',
        in_progress: 'In Bearbeitung',
        completed: 'Abgeschlossen'
      },
      french_municipal: {
        locked: 'Verrouillé',
        available: 'Disponible',
        in_progress: 'En cours',
        completed: 'Terminé'
      },
      dutch_municipal: {
        locked: 'Vergrendeld',
        available: 'Beschikbaar',
        in_progress: 'Bezig',
        completed: 'Voltooid'
      }
    };
    return statusTexts[culturalContext]?.[status as keyof typeof statusTexts['swedish_municipal']] || status;
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  const worlds = [1, 2, 3, 4, 5].filter(isValidWorldIndex);

  return (
    <div className="world-selection-grid" data-cultural-context={culturalContext}>
      <div className="worlds-grid">
        {worlds.map((worldIndex, index) => {
          const worldStatus = getWorldStatus(worldIndex);
          const worldDef = getWorldDefinition(worldIndex);
          const isClickable = worldStatus.status !== 'locked';
          const isSelected = selectedWorld === worldIndex;

          return (
            <motion.div
              key={worldIndex}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={`world-card ${worldStatus.status} ${isSelected ? 'selected' : ''}`}
              onClick={() => isClickable && onWorldSelect(worldIndex)}
              whileHover={isClickable ? { scale: 1.02 } : Record<string, unknown>}
              whileTap={isClickable ? { scale: 0.98 } : Record<string, unknown>}
            >
              {/* World Header */}
              <div className="world-header">
                <div className="world-icon">
                  {getWorldIcon(worldIndex, worldStatus.status)}
                </div>
                <div className="world-number">Värld {worldIndex}</div>
                <div className={`world-status status-${worldStatus.status}`}>
                  {getStatusText(worldStatus.status)}
                </div>
              </div>

              {/* World Content */}
              <div className="world-content">
                <h3 className="world-title">
                  {getCulturalWorldTitle(worldIndex)}
                </h3>
                
                <p className="world-description">
                  {getCulturalWorldDescription(worldIndex)}
                </p>

                {/* World Metadata */}
                <div className="world-metadata">
                  {worldDef && (
                    <>
                      <div className="difficulty">
                        <span className="label">Svårighet:</span>
                        <span className="stars">{getDifficultyStars(worldDef.difficulty)}</span>
                      </div>
                      <div className="duration">
                        <span className="label">Tid:</span>
                        <span className="value">{worldDef.estimatedDuration}min</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Progress for unlocked worlds */}
                {worldStatus.status !== 'locked' && (
                  <div className="world-progress">
                    <div className="progress-stats">
                      <div className="stat">
                        <span className="stat-value">{worldStatus.score}</span>
                        <span className="stat-label">Poäng</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{Math.round(worldStatus.completionPercentage)}%</span>
                        <span className="stat-label">Klart</span>
                      </div>
                      {worldStatus.timeSpent > 0 && (
                        <div className="stat">
                          <span className="stat-value">{Math.round(worldStatus.timeSpent / (1000 * 60))}min</span>
                          <span className="stat-label">Tid</span>
                        </div>
                      )}
                    </div>
                    
                    {worldStatus.completionPercentage > 0 && (
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar"
                          style={{ width: `${worldStatus.completionPercentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Achievements for completed worlds */}
                {worldStatus.achievementsUnlocked.length > 0 && (
                  <div className="world-achievements">
                    <div className="achievements-label">Prestationer:</div>
                    <div className="achievements-list">
                      {worldStatus.achievementsUnlocked.slice(0, 3).map((achievement, idx) => (
                        <span key={idx} className="achievement-badge">
                          🏆 {achievement}
                        </span>
                      ))}
                      {worldStatus.achievementsUnlocked.length > 3 && (
                        <span className="achievement-more">
                          +{worldStatus.achievementsUnlocked.length - 3} till
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Prerequisites for locked worlds */}
                {worldStatus.status === 'locked' && worldDef?.prerequisiteWorlds.length > 0 && (
                  <div className="world-prerequisites">
                    <div className="prereq-label">Kräver slutförande av:</div>
                    <div className="prereq-list">
                      {worldDef.prerequisiteWorlds.map(prereqIndex => (
                        <span key={prereqIndex} className="prereq-world">
                          Värld {prereqIndex}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="world-action">
                {worldStatus.status === 'locked' && (
                  <button className="world-button locked" disabled>
                    <span className="button-icon">🔒</span>
                    Låst
                  </button>
                )}
                {worldStatus.status === 'available' && (
                  <button className="world-button available">
                    <span className="button-icon">▶️</span>
                    Börja
                  </button>
                )}
                {worldStatus.status === 'in_progress' && (
                  <button className="world-button in-progress">
                    <span className="button-icon">↩️</span>
                    Fortsätt
                  </button>
                )}
                {worldStatus.status === 'completed' && (
                  <button className="world-button completed">
                    <span className="button-icon">🔄</span>
                    Spela igen
                  </button>
                )}
              </div>

              {/* Loading indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="world-loading"
                  >
                    <div className="loading-spinner" />
                    <span>Startar värld...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Grid Legend */}
      <div className="grid-legend">
        <div className="legend-item">
          <span className="legend-icon">🔒</span>
          <span className="legend-text">Låst - Slutför föregående världar</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">▶️</span>
          <span className="legend-text">Tillgänglig - Redo att börja</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">⏳</span>
          <span className="legend-text">Pågående - Fortsätt där du slutade</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">✅</span>
          <span className="legend-text">Slutförd - Spela igen för att förbättra</span>
        </div>
      </div>
    </div>
  );
};