/**
 * TASK-HD-014: Municipal Achievement Hook
 * Hook for managing Anna Svensson's municipal achievement state during GDPR training
 */

import { useState, useEffect, useCallback } from 'react';
import type { MunicipalAchievement } from '../services/municipal-achievement-engine';

export interface AnnaSvenssonAchievementState {
  currentAchievements: MunicipalAchievement[];
  sessionStartTime: number;
  completedMilestones: string[];
  isEligibleForEfficiencyBadge: boolean;
}

export interface MunicipalToastNotification {
  id: string;
  title: string;
  description: string;
  municipalValue: string;
  nextSteps: string;
}

export const useAnnaSvenssonAchievements = (
  playerContext: {
    name?: string;
    department?: string;
    role?: string;
  } = {}
) => {
  const [achievements, setAchievements] = useState<MunicipalAchievement[]>([]);
  const [sessionStart] = useState<number>(Date.now());
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [currentToast, setCurrentToast] = useState<MunicipalToastNotification | null>(null);
  const [earnedCompetencies, setEarnedCompetencies] = useState<string[]>([]);

  // GDPR Milestone tracking - maps milestone IDs to competencies and thresholds
  const GDPR_MILESTONES = {
    'gdpr_basics': { competence: 'Grundläggande dataskydd', threshold: 25 },
    'data_handling': { competence: 'Säker databehandling', threshold: 50 },
    'incident_response': { competence: 'Juridisk efterlevnad', threshold: 75 },
    'gdpr_expert': { competence: 'GDPR Specialist', threshold: 100 }
  };

  // Check if a milestone is achieved based on game progress
  const isAchievementEarned = useCallback((milestoneId: string): boolean => {
    return completedMilestones.includes(milestoneId);
  }, [completedMilestones]);

  // Evaluate achievements based on game performance
  const evaluateAchievements = useCallback((gameData: {
    totalScore: number;
    maxScore: number;
    timeSpent: number;
    scenesCompleted: string[];
    correctAnswers?: number;
    totalQuestions?: number;
  }) => {
    const newAchievements: MunicipalAchievement[] = [];
    const newCompetencies: string[] = [];
    const newMilestones: string[] = [];

    // Calculate progress percentage
    const progressPercentage = gameData.maxScore > 0 ? (gameData.totalScore / gameData.maxScore) * 100 : 0;
    
    // Check GDPR milestones based on progress
    Object.entries(GDPR_MILESTONES).forEach(([milestoneId, milestone]) => {
      if (progressPercentage >= milestone.threshold && !completedMilestones.includes(milestoneId)) {
        newMilestones.push(milestoneId);
        newCompetencies.push(milestone.competence);
      }
    });

    // Check for efficiency achievement (Anna's 7-minute constraint)
    const sevenMinutes = 7 * 60 * 1000;
    if (gameData.timeSpent < sevenMinutes && progressPercentage >= 85) {
      const efficiencyAchievement: MunicipalAchievement = {
        id: 'efficiency_expert',
        title: 'Effektivitetsexpert',
        description: 'Slutförde GDPR-utbildningen på under 7 minuter',
        municipalValue: 'Perfekt för Annas lunchpausutbildning',
        nextSteps: 'Dela denna effektiva inlärningsmetod med kollegorna'
      };
      newAchievements.push(efficiencyAchievement);
      
      // Show toast notification
      setCurrentToast({
        id: 'efficiency_expert',
        title: 'Effektivitetsexpert',
        description: 'Slutförde GDPR-utbildningen på under 7 minuter',
        municipalValue: 'Perfekt för Annas lunchpausutbildning',
        nextSteps: 'Dela denna effektiva inlärningsmetod med kollegorna'
      });
    }

    // Check for competence achievement
    if (progressPercentage >= 90) {
      const competenceAchievement: MunicipalAchievement = {
        id: 'gdpr_specialist',
        title: 'GDPR-specialist',
        description: 'Uppnådde 90%+ resultat i GDPR-kunskapstest',
        municipalValue: 'Certifierad för kommunal datahantering',
        nextSteps: 'Ansök om roll som GDPR-kontaktperson på din avdelning'
      };
      
      // Avoid duplicates
      if (!achievements.some(a => a.id === competenceAchievement.id)) {
        newAchievements.push(competenceAchievement);
      }
    }

    // Update state
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
    if (newCompetencies.length > 0) {
      setEarnedCompetencies(prev => [...new Set([...prev, ...newCompetencies])]);
    }
    if (newMilestones.length > 0) {
      setCompletedMilestones(prev => [...new Set([...prev, ...newMilestones])]);
    }
  }, [achievements, completedMilestones]);

  // Generate achievement report
  const generateReport = useCallback(() => {
    return {
      playerName: playerContext.name || 'Anna Svensson',
      department: playerContext.department || 'IT-avdelningen',
      role: playerContext.role || 'Kommunal specialist',
      sessionDuration: Date.now() - sessionStart,
      totalAchievements: achievements.length,
      milestones: completedMilestones,
      competencies: earnedCompetencies,
      achievements: achievements.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        municipalValue: a.municipalValue
      }))
    };
  }, [playerContext, sessionStart, achievements, completedMilestones, earnedCompetencies]);

  // Dismiss current toast notification
  const dismissCurrentToast = useCallback(() => {
    setCurrentToast(null);
  }, []);

  const clearAchievements = useCallback(() => {
    setAchievements([]);
    setCompletedMilestones([]);
    setEarnedCompetencies([]);
    setCurrentToast(null);
  }, []);

  return {
    // Achievement data
    achievements,
    earnedAchievements: achievements,
    competencies: earnedCompetencies,
    
    // Milestone tracking
    isAchievementEarned,
    evaluateAchievements,
    
    // Reports and notifications
    generateReport,
    currentToast,
    dismissCurrentToast,
    
    // Session info
    sessionDuration: Date.now() - sessionStart,
    isWithinSevenMinutes: (Date.now() - sessionStart) < (7 * 60 * 1000),
    
    // Utilities
    clearAchievements
  };
};