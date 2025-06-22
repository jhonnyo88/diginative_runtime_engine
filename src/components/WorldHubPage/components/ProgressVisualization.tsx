/**
 * Progress Visualization Component
 * Visual progress tracking for Q3 Multi-World Hub
 * Building on Q2 progress patterns with cross-world progression visualization
 */

import React from 'react';
import { motion } from 'framer-motion';
import { WorldHubState, CompetencyType } from '../../../types/q3-multi-world';
import './ProgressVisualization.css';

interface ProgressVisualizationProps {
  hubState: WorldHubState;
  culturalContext: 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal';
}

export const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  hubState,
  culturalContext
}) => {


  
  // Calculate competency levels (mock data since it's not fully populated in state)
  const competencyLevels: Record<CompetencyType, number> = {
    municipal_administration: 75,
    citizen_service_excellence: 60,
    emergency_management: 40,
    leadership_skills: 55,
    digital_innovation: 70,
    cultural_adaptation: 85,
    compliance_knowledge: 80
  };



  return (
    <div className="progress-visualization" data-cultural-context={culturalContext}>
      {/* Overall Progress Circle */}
      <div className="progress-section">
        <h3>{progressTexts.overallProgress}</h3>
        <div className="overall-progress-container">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="progress-circle-container"
          >
            <svg className="progress-circle" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="progress-circle-bg"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                className="progress-circle-fill"
                strokeDasharray={`${hubState.hubProgressData.overallCompletionPercentage * 2.83} 283`}
                initial={{ strokeDasharray: "0 283" }}
                animate={{ strokeDasharray: `${hubState.hubProgressData.overallCompletionPercentage * 2.83} 283` }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </svg>
            <div className="progress-text">
              <span className="progress-percentage">
                {Math.round(hubState.hubProgressData.overallCompletionPercentage)}%
              </span>
              <span className="progress-label">Slutfört</span>
            </div>
          </motion.div>

          <div className="progress-stats">
            <div className="stat">
              <span className="stat-value">{hubState.worldsCompleted}/5</span>
              <span className="stat-label">Världar</span>
            </div>
            <div className="stat">
              <span className="stat-value">{hubState.totalScore}</span>
              <span className="stat-label">Poäng</span>
            </div>
            <div className="stat">
              <span className="stat-value">{Math.round(hubState.hubProgressData.totalTimeSpent / (1000 * 60))}</span>
              <span className="stat-label">Minuter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Competency Levels */}
      <div className="progress-section">
        <h3>{progressTexts.competencyLevels}</h3>
        <div className="competency-grid">
          {Object.entries(competencyLevels).map(([competency, level], index) => (
            <motion.div
              key={competency}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="competency-item"
            >
              <div className="competency-header">
                <span className="competency-name">
                  {getCompetencyTranslation(competency as CompetencyType)}
                </span>
                <span className="competency-level" style={{ color: getCompetencyColor(level) }}>
                  {level}%
                </span>
              </div>
              <div className="competency-bar">
                <motion.div
                  className="competency-fill"
                  style={{ backgroundColor: getCompetencyColor(level) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${level}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* World Progression Path */}
      <div className="progress-section">
        <h3>{progressTexts.worldProgression}</h3>
        <div className="world-progression-path">
          {worldProgressData.map((world, index) => (
            <motion.div
              key={world.worldIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className={`world-progress-node ${world.status}`}
            >
              <div className="world-node">
                <div className="world-node-inner">
                  <span className="world-number">{world.worldIndex}</span>
                </div>
                <div className="world-progress-bar">
                  <motion.div
                    className="world-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${world.completion}%` }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                  />
                </div>
              </div>
              <div className="world-node-details">
                <div className="world-completion">{Math.round(world.completion)}%</div>
                {world.score > 0 && (
                  <div className="world-score">{world.score}p</div>
                )}
              </div>
              {index < worldProgressData.length - 1 && (
                <div className="world-connector" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievement Progress */}
      {hubState.hubProgressData.unlockedAchievements.length > 0 && (
        <div className="progress-section">
          <h3>{progressTexts.achievements}</h3>
          <div className="achievements-visualization">
            <div className="achievements-count">
              <span className="count-number">{hubState.hubProgressData.unlockedAchievements.length}</span>
              <span className="count-label">Upplåsta</span>
            </div>
            <div className="achievements-list">
              {hubState.hubProgressData.unlockedAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="achievement-badge"
                >
                  🏆 {achievement}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Municipal Certification Progress */}
      {hubState.hubProgressData.municipalCertificationProgress > 0 && (
        <div className="progress-section">
          <h3>{progressTexts.certification}</h3>
          <div className="certification-visualization">
            <div className="certification-progress">
              <div className="certification-bar">
                <motion.div
                  className="certification-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${hubState.hubProgressData.municipalCertificationProgress}%` }}
                  transition={{ delay: 0.5, duration: 1.2 }}
                />
              </div>
              <div className="certification-text">
                {hubState.hubProgressData.municipalCertificationProgress}% till Kommunal Certifiering
              </div>
            </div>
            {hubState.hubProgressData.municipalCertificationProgress >= 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="certification-badge"
              >
                🎓 Kommunal Expert Certifierad
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Progress Insights */}
      <div className="progress-insights">
        <div className="insight-card">
          <div className="insight-icon">📈</div>
          <div className="insight-content">
            <div className="insight-title">Utvecklingstakt</div>
            <div className="insight-text">
              {hubState.worldsCompleted > 0 ? 
                `Genomsnittlig tid per värld: ${Math.round(hubState.hubProgressData.totalTimeSpent / (hubState.worldsCompleted * 1000 * 60))} min` :
                'Börja din första värld för att se statistik'
              }
            </div>
          </div>
        </div>
        
        {hubState.hubProgressData.professionalDevelopmentScore > 0 && (
          <div className="insight-card">
            <div className="insight-icon">💼</div>
            <div className="insight-content">
              <div className="insight-title">Professionell Utveckling</div>
              <div className="insight-text">
                Utvecklingspoäng: {hubState.hubProgressData.professionalDevelopmentScore}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  return <Box><Text>Component</Text></Box>;
};