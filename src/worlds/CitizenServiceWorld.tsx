/**
 * Citizen Service World (World 2)
 * Excellence in citizen service and municipal interaction
 * Building on Q2 game patterns with Q3 multi-world progression
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { multiWorldStateManager } from '../services/multi-world-state-manager';
import { WorldComponentProps } from './WorldFactory';
import './CitizenServiceWorld.css';

export const CitizenServiceWorld: React.FC<WorldComponentProps> = ({
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
        2, // World 2: Citizen Service
        'citizen-service-game'
      );

      if (!worldSession) {
        throw new Error('Failed to start Citizen Service world session');
      }

      setWorldState(worldSession.gameState);
      setLoading(false);
      
      console.log('👥 Citizen Service World initialized');
    } catch (error) {
      console.error('Failed to initialize Citizen Service World:', error);
      setLoading(false);
    }
  };

  const handleReturnToHub = () => {
    navigate(`/hub/${uniqueCode}`);
  };

  if (loading) {
    return (
      <div className="citizen-service-loading">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-content"
        >
          <div className="world-icon">👥</div>
          <h2>Laddar Medborgartjänst...</h2>
          <p>Förbereder din utbildning i medborgarservice</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="citizen-service-world" data-cultural-context={culturalContext}>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="world-header"
      >
        <div className="world-branding">
          <div className="world-icon">👥</div>
          <div className="world-info">
            <h1 className="world-title">Medborgartjänst</h1>
            <p className="world-subtitle">Värld 2 av 5 • Excellence i medborgarservice</p>
          </div>
        </div>
        
        <button onClick={handleReturnToHub} className="return-to-hub-button">
          ← Tillbaka till Hub
        </button>
      </motion.header>

      <main className="world-content">
        <div className="coming-soon">
          <h2>Kommer snart</h2>
          <p>Citizen Service World är under utveckling och kommer att vara tillgänglig snart.</p>
          <div className="world-preview">
            <h3>Vad du kommer att lära dig:</h3>
            <ul>
              <li>Excellent medborgarservice</li>
              <li>Kommunikationstekniker</li>
              <li>Konfliktlösning</li>
              <li>Digital tjänstedesign</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};