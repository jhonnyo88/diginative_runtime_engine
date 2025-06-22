/**
 * Innovation Implementation World (World 5)
 * Digital innovation and transformation in municipal context
 * Building on Q2 game patterns with Q3 multi-world progression
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { multiWorldStateManager } from '../services/multi-world-state-manager';
import { WorldComponentProps } from './WorldFactory';

export const InnovationImplementationWorld: React.FC<WorldComponentProps> = ({
  hubSessionId,
  uniqueCode,
  culturalContext,
  worldDefinition
}) => {
  const [loading, setLoading] = useState(true);
  const [worldState, setWorldState] = useState<Record<string, unknown>>(null);

  useEffect(() => {
    initializeWorld();
  }, []);

  const _initializeWorld = async () => {
    try {
      setLoading(true);
      
        hubSessionId,
        5, // World 5: Innovation Implementation
        'innovation-implementation-game'
      );

      if (!worldSession) {
        throw new Error('Failed to start Innovation Implementation world session');
      }

      setWorldState(worldSession.gameState);
      setLoading(false);
      
      console.log('💡 Innovation Implementation World initialized');
    } catch (error) {
      console.error('Failed to initialize Innovation Implementation World:', error);
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="innovation-implementation-loading">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-content"
        >
          <div className="world-icon">💡</div>
          <h2>Laddar Innovation...</h2>
          <p>Förbereder din utbildning i digital innovation</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="innovation-implementation-world" data-cultural-context={culturalContext}>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="world-header"
      >
        <div className="world-branding">
          <div className="world-icon">💡</div>
          <div className="world-info">
            <h1 className="world-title">Innovation</h1>
            <p className="world-subtitle">Värld 5 av 5 • Digital innovation och transformation</p>
          </div>
        </div>
        
        <button onClick={handleReturnToHub} className="return-to-hub-button">
          ← Tillbaka till Hub
        </button>
      </motion.header>

      <main className="world-content">
        <div className="coming-soon">
          <h2>Kommer snart</h2>
          <p>Innovation Implementation World är under utveckling och kommer att vara tillgänglig snart.</p>
          <div className="world-preview">
            <h3>Vad du kommer att lära dig:</h3>
            <ul>
              <li>Digital transformation</li>
              <li>Innovationsprocesser</li>
              <li>Teknikimplementering</li>
              <li>Framtidstänkande</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};