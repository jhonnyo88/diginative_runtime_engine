/**
 * Hub Score Display Component
 * Displays total score and completion metrics for Q3 Multi-World Hub
 * Building on Q2 achievement patterns with municipal professional styling
 */

import React from 'react';
import { motion } from 'framer-motion';
import { WorldHubState } from '../../../types/q3-multi-world';
import './HubScoreDisplay.css';

interface HubScoreDisplayProps {
  hubState: WorldHubState;
  performanceMetrics: {
    hubLoadTime: number;
    componentsRendered: number;
    lastUpdateTime: number;
  };
}

export const HubScoreDisplay: React.FC<HubScoreDisplayProps> = ({ 
  hubState, 
  performanceMetrics 
}) => {
  

  


  return (
    <div className="hub-score-display" data-cultural-context={hubState.culturalContext}>
      {/* Main Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="score-main-card"
      >
        <div className="score-header">
          <h3>{scoreText.totalScore}</h3>
          <div className="score-badge" style={{ backgroundColor: professionalLevel.color }}>
            {professionalLevel.level}
          </div>
        </div>
        
        <div className="score-value">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="score-number"
          >
            {totalScore}
          </motion.span>
          <span className="score-max">/500</span>
        </div>
        
        <div className="score-subtitle">
          {scoreText.professionalLevel}
        </div>
      </motion.div>

      {/* Progress Metrics */}
      <div className="score-metrics-grid">
        {/* Worlds Completed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="metric-card"
        >
          <div className="metric-icon">🌍</div>
          <div className="metric-content">
            <div className="metric-value">{worldsCompleted}/5</div>
            <div className="metric-label">{scoreText.worldsCompleted}</div>
          </div>
        </motion.div>

        {/* Overall Completion */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="metric-card"
        >
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-value">{Math.round(completionPercentage)}%</div>
            <div className="metric-label">{scoreText.completion}</div>
            <div className="metric-progress">
              <div 
                className="progress-bar"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Time Spent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="metric-card"
        >
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <div className="metric-value">
              {Math.round(hubState.hubProgressData.totalTimeSpent / (1000 * 60))}min
            </div>
            <div className="metric-label">Total Tid</div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="metric-card"
        >
          <div className="metric-icon">🏆</div>
          <div className="metric-content">
            <div className="metric-value">{hubState.hubProgressData.unlockedAchievements.length}</div>
            <div className="metric-label">Prestationer</div>
          </div>
        </motion.div>
      </div>

      {/* Municipal Certification Progress */}
      {hubState.hubProgressData.municipalCertificationProgress > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="certification-progress"
        >
          <h4>Kommunal Certifiering</h4>
          <div className="certification-bar">
            <div 
              className="certification-fill"
              style={{ width: `${hubState.hubProgressData.municipalCertificationProgress}%` }}
            />
            <span className="certification-text">
              {hubState.hubProgressData.municipalCertificationProgress}% Klar
            </span>
          </div>
        </motion.div>
      )}

      {/* Performance Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="score-performance-debug">
          <small>
            Hub Load: {performanceMetrics.hubLoadTime}ms | 
            Komponenter: {performanceMetrics.componentsRendered}
          </small>
        </div>
      )}
    </div>
  );
};