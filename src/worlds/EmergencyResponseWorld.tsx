/**
 * Emergency Response World (World 3)
 * Crisis management and emergency preparedness
 * Building on Q2 game patterns with Q3 multi-world progression
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { multiWorldStateManager } from '../services/multi-world-state-manager';
import { WorldComponentProps } from './WorldFactory';

export const EmergencyResponseWorld: React.FC<WorldComponentProps> = ({
  hubSessionId,
  uniqueCode,
  culturalContext,
  worldDefinition
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [worldState, setWorldState] = useState<Record<string, unknown>>(null);

  useEffect(() => {
    initializeWorld();
  }, []);

  const initializeWorld = async () => {
    try {
      setLoading(true);
      
      const worldSession = await multiWorldStateManager.startWorldSession(
        hubSessionId,
        3, // World 3: Emergency Response
        'emergency-response-game'
      );

      if (!worldSession) {
        throw new Error('Failed to start Emergency Response world session');
      }

      setWorldState(worldSession.gameState);
      setLoading(false);
      
      console.log('🚨 Emergency Response World initialized');
    } catch (error) {
      console.error('Failed to initialize Emergency Response World:', error);
      setLoading(false);
    }
  };

  const handleReturnToHub = () => {
    navigate(`/hub/${uniqueCode}`);
  };

  if (loading) {
    return (
      <div className="emergency-response-loading">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-content"
        >
          <div className="world-icon">🚨</div>
          <h2>Laddar Krishantering...</h2>
          <p>Förbereder din utbildning i krishantering</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="emergency-response-world" data-cultural-context={culturalContext}>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="world-header"
      >
        <div className="world-branding">
          <div className="world-icon">🚨</div>
          <div className="world-info">
            <h1 className="world-title">Krishantering</h1>
            <p className="world-subtitle">Värld 3 av 5 • Krishantering och beredskap</p>
          </div>
        </div>
        
        <button onClick={handleReturnToHub} className="return-to-hub-button">
          ← Tillbaka till Hub
        </button>
      </motion.header>

      <main className="world-content">
        <div className="coming-soon">
          <h2>Kommer snart</h2>
          <p>Emergency Response World är under utveckling och kommer att vara tillgänglig snart.</p>
          <div className="world-preview">
            <h3>Vad du kommer att lära dig:</h3>
            <ul>
              <li>Krishantering och beredskap</li>
              <li>Kommunikation under kris</li>
              <li>Resurskoordinering</li>
              <li>Återhämtningsplanering</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};