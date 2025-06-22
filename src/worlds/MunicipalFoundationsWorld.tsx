/**
 * Municipal Foundations World (World 1)
 * Introduction to municipal administration and processes
 * Building on Q2 game patterns with Q3 multi-world progression
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gameStateManager } from '../services/game-state-manager';
import { multiWorldStateManager } from '../services/multi-world-state-manager';
import { WorldHubState } from '../types/q3-multi-world';
import { DialogueScene } from '../components/DialogueScene/DialogueScene';
import './MunicipalFoundationsWorld.css';

interface MunicipalFoundationsWorldProps {
  hubSessionId: string;
  uniqueCode: string;
  culturalContext: 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal';
}

export const MunicipalFoundationsWorld: React.FC<MunicipalFoundationsWorldProps> = ({
  hubSessionId,
  uniqueCode,
  culturalContext
}) => {
  const [loading, setLoading] = useState(true);
  const [worldState, setWorldState] = useState<Record<string, unknown>>(null);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [startTime] = useState(Date.now());

  // Municipal Foundations scenarios

  function getCulturalText(key: string): string {
    return texts[culturalContext]?.[key as keyof typeof texts['swedish_municipal']] || key;
  }

  useEffect(() => {
    initializeWorld();
  }, []);

  const _initializeWorld = async () => {
    try {
      setLoading(true);
      
      // Start world session through multi-world state manager
        hubSessionId,
        1, // World 1: Municipal Foundations
        'municipal-foundations-game'
      );

      if (!worldSession) {
        throw new Error('Failed to start Municipal Foundations world session');
      }

      setWorldState(worldSession.gameState);
      setLoading(false);
      
      console.log('🏛️ Municipal Foundations World initialized');
    } catch (error) {
      console.error('Failed to initialize Municipal Foundations World:', error);
      setLoading(false);
    }
  };

  const _handleScenarioCompletion = async (scenarioResults: Record<string, unknown>) => {
    try {
      
      // Update game state with scenario completion
      await gameStateManager.updateGameState(worldState.sessionId, {
        currentSceneId: scenario.id,
        sceneIndex: currentScenario,
        sceneResult: scenarioResults,
        timeSpent: Date.now() - startTime
      });

      // Check if this is the last scenario
      if (currentScenario >= scenarios.length - 1) {
        // Complete the world
        await completeWorld(scenarioResults);
      } else {
        // Move to next scenario
        setCurrentScenario(currentScenario + 1);
      }
    } catch (error) {
      console.error('Error handling scenario completion:', error);
    }
  };

  const _completeWorld = async (finalResults: Record<string, unknown>) => {
    try {
      // Complete the game session
      
      if (gameResults) {
        // Update multi-world state
        await multiWorldStateManager.completeWorld(hubSessionId, 1, gameResults);
        
        // Navigate back to hub with completion notification
        navigate(`/hub/${uniqueCode}`, {
          state: {
            worldCompleted: 1,
            results: gameResults,
            message: 'Grattis! Du har slutfört Kommunala Grunder.'
          }
        });
      }
    } catch (error) {
      console.error('Error completing Municipal Foundations World:', error);
    }
  };


  if (loading) {
    return (
      <div className="municipal-foundations-loading">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-content"
        >
          <div className="world-icon">🏛️</div>
          <h2>Laddar Kommunala Grunder...</h2>
          <p>Förbereder din introduktion till kommunal administration</p>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="municipal-foundations-world" data-cultural-context={culturalContext}>
      {/* World Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="world-header"
      >
        <div className="world-branding">
          <div className="world-icon">🏛️</div>
          <div className="world-info">
            <h1 className="world-title">Kommunala Grunder</h1>
            <p className="world-subtitle">Värld 1 av 5 • Grundläggande kompetenser</p>
          </div>
        </div>
        
        <div className="world-progress">
          <div className="scenario-progress">
            <span className="progress-text">
              Scenario {currentScenario + 1} av {scenarios.length}
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentScenario + 1) / scenarios.length) * 100}%` }}
              />
            </div>
          </div>
          
          <button onClick={handleReturnToHub} className="return-to-hub-button">
            ← Tillbaka till Hub
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="world-content">
        <motion.div
          key={currentScenario}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="scenario-container"
        >
          {/* Scenario Introduction */}
          <div className="scenario-intro">
            <h2 className="scenario-title">{currentScenarioData.title}</h2>
            <p className="scenario-description">{currentScenarioData.description}</p>
            
            <div className="scenario-metadata">
              <div className="scenario-meta-item">
                <span className="meta-label">Typ:</span>
                <span className="meta-value">{currentScenarioData.type}</span>
              </div>
              <div className="scenario-meta-item">
                <span className="meta-label">Tid:</span>
                <span className="meta-value">{currentScenarioData.estimatedTime} min</span>
              </div>
              <div className="scenario-meta-item">
                <span className="meta-label">Fokus:</span>
                <span className="meta-value">
                  {currentScenarioData.competencyFocus.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Scenario Content */}
          <div className="scenario-content">
            <DialogueScene
              gameId="municipal-foundations-game"
              sceneId={currentScenarioData.id}
              culturalContext={culturalContext}
              onSceneComplete={handleScenarioCompletion}
              mechanics={currentScenarioData.mechanics}
              competencyFocus={currentScenarioData.competencyFocus}
            />
          </div>
        </motion.div>
      </main>

      {/* World Footer */}
      <footer className="world-footer">
        <div className="competency-indicators">
          {currentScenarioData.competencyFocus.map((competency, index) => (
            <div key={competency} className="competency-indicator">
              <span className="competency-icon">📊</span>
              <span className="competency-name">{competency}</span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};