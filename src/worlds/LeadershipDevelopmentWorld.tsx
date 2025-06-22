/**
 * Leadership Development World (World 4)
 * Municipal leadership and management skills
 * Building on Q2 game patterns with Q3 multi-world progression
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { multiWorldStateManager } from '../services/multi-world-state-manager';
import { WorldComponentProps } from './WorldFactory';

export const LeadershipDevelopmentWorld: React.FC<WorldComponentProps> = ({
  hubSessionId,
  uniqueCode,
  culturalContext,
  worldDefinition
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [worldState, setWorldState] = useState<any>(null);

  useEffect(() => {
    initializeWorld();
  }, []);

  const initializeWorld = async () => {
    try {
      setLoading(true);
      
      const worldSession = await multiWorldStateManager.startWorldSession(
        hubSessionId,
        4, // World 4: Leadership Development
        'leadership-development-game'
      );

      if (!worldSession) {
        throw new Error('Failed to start Leadership Development world session');
      }

      setWorldState(worldSession.gameState);
      setLoading(false);
      
      console.log('👔 Leadership Development World initialized');
    } catch (error) {
      console.error('Failed to initialize Leadership Development World:', error);
      setLoading(false);
    }
  };

  const handleReturnToHub = () => {
    navigate(`/hub/${uniqueCode}`);
  };

  if (loading) {
    return (
      <div className="leadership-development-loading">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-content"
        >
          <div className="world-icon">👔</div>
          <h2>Laddar Ledarutveckling...</h2>
          <p>Förbereder din utbildning i kommunalt ledarskap</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="leadership-development-world" data-cultural-context={culturalContext}>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="world-header"
      >
        <div className="world-branding">
          <div className="world-icon">👔</div>
          <div className="world-info">
            <h1 className="world-title">Ledarutveckling</h1>
            <p className="world-subtitle">Värld 4 av 5 • Kommunalt ledarskap</p>
          </div>
        </div>
        
        <button onClick={handleReturnToHub} className="return-to-hub-button">
          ← Tillbaka till Hub
        </button>
      </motion.header>

      <main className="world-content">
        <div className="coming-soon">
          <h2>Kommer snart</h2>
          <p>Leadership Development World är under utveckling och kommer att vara tillgänglig snart.</p>
          <div className="world-preview">
            <h3>Vad du kommer att lära dig:</h3>
            <ul>
              <li>Kommunalt ledarskap</li>
              <li>Teambyggnad och motivation</li>
              <li>Strategisk planering</li>
              <li>Förändringsledning</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};