/**
 * Comprehensive Test Suite for Municipal Achievement Engine Service
 * Task: task-emergency-002 - Critical Service Test Implementation
 * Service: municipal-achievement-engine.ts
 * Roadmap Ref: Q1-Foundation-Autonomi-Milestone-1.1
 * 
 * Test Coverage:
 * - Unit Tests: All achievement evaluation methods and criteria
 * - Integration Tests: Event system and state management
 * - Health Checks: Service availability and configuration validation
 * - Achievement Tests: All achievement types and scoring thresholds
 * - Municipal Tests: Cultural context adaptation and reporting
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { 
  MunicipalAchievementEngine,
  createMunicipalAchievementEngine,
  MunicipalAchievementEngineConfig,
  MunicipalAchievement,
  MunicipalAchievementState
} from '../../services/municipal-achievement-engine';

describe('MunicipalAchievementEngine Unit Tests', () => {
  let engine: MunicipalAchievementEngine;
  let defaultConfig: MunicipalAchievementEngineConfig;

  beforeEach(() => {
    defaultConfig = {
      municipalEntity: 'malmö',
      culturalContext: 'swedish',
      userProfile: {
        name: 'Anna Svensson',
        department: 'IT-avdelningen',
        role: 'Systemspecialist',
        experienceLevel: 'intermediate'
      },
      recognitionSettings: {
        enableToastNotifications: true,
        enableSubtleIndicators: true,
        enablePortfolio: true,
        toastTimeout: 4000
      },
      accessibilitySettings: {
        reducedMotion: false,
        screenReaderFriendly: true,
        keyboardNavigation: true,
        highContrast: false
      }
    };

    engine = new MunicipalAchievementEngine(defaultConfig);
  });

  afterEach(() => {
    engine.cleanup();
  });

  describe('Engine Initialization', () => {
    it('should initialize with correct default state', () => {

      expect(state.achievements.earned).toHaveLength(0);
      expect(state.achievements.available).toHaveLength(0);
      expect(state.achievements.inProgress).toEqual({});
      
      expect(state.competencies.developed).toHaveLength(0);
      expect(state.competencies.certifications).toHaveLength(0);
      expect(state.competencies.municipalQualifications).toHaveLength(0);
      
      expect(state.milestones.reached).toHaveLength(0);
      expect(state.milestones.upcoming).toContain('gdpr_basics');
      expect(state.milestones.upcoming).toContain('gdpr_expert');
      
      expect(state.session.startTime).toBeInstanceOf(Date);
      expect(state.session.toastQueue).toHaveLength(0);
      expect(state.session.contextualRecognition).toBe(true);
    });

    it('should initialize with correct criteria definitions', () => {
      // Test that all expected criteria are present

      // This should evaluate all achievements
      
      // Should have criteria for all achievement types
      expect(achievements.length).toBeGreaterThan(0);
    });
  });

  describe('Achievement Evaluation', () => {
    it('should award GDPR Specialist for competence-based criteria', () => {


      expect(gdprSpecialist).toBeDefined();
      expect(gdprSpecialist?.title).toContain('gdpr_specialist');
      expect(gdprSpecialist?.municipalValue).toBeDefined();
      expect(gdprSpecialist?.nextSteps).toContain('GDPR-kunskaper');
    });

    it('should award Compliance Champion for perfect performance', () => {


      expect(complianceChampion).toBeDefined();
      expect(complianceChampion?.nextSteps).toContain('Dela din kunskap');
    });

    it('should award Efficiency Expert for time-based achievement', () => {


      expect(efficiencyExpert).toBeDefined();
      expect(efficiencyExpert?.municipalValue).toContain('effektivt använda arbetstid');
    });

    it('should award Municipal Certified for compliance-based achievement', () => {


      expect(municipalCertified).toBeDefined();
      expect(municipalCertified?.nextSteps).toContain('certifikat');
    });

    it('should not award achievements below thresholds', () => {


      expect(achievements).toHaveLength(0);
    });

    it('should not award same achievement twice', () => {

      // First evaluation
      expect(firstAchievements.length).toBeGreaterThan(0);

      // Second evaluation with same data
      expect(secondAchievements).toHaveLength(0); // Should not re-award
    });

    it('should handle edge case score calculations', () => {

      // Should not throw errors and should not award achievements
      expect(achievements).toHaveLength(0);
    });
  });

  describe('Event System', () => {
    it('should register and emit achievement events', () => {
      engine.addEventListener('achievementEarned', eventCallback);


      engine.evaluateAchievements(sessionData);

      expect(eventCallback).toHaveBeenCalled();
      
      expect(eventData).toHaveProperty('achievement');
      expect(eventData).toHaveProperty('criteria');
      expect(eventData).toHaveProperty('timestamp');
      expect(eventData).toHaveProperty('userProfile');
      expect(eventData).toHaveProperty('municipalContext');
      
      expect(eventData.userProfile.name).toBe('Anna Svensson');
      expect(eventData.municipalContext.entity).toBe('malmö');
      expect(eventData.municipalContext.culturalContext).toBe('swedish');
    });

    it('should remove event listeners correctly', () => {
      engine.addEventListener('achievementEarned', eventCallback);
      engine.removeEventListener('achievementEarned', eventCallback);


      engine.evaluateAchievements(sessionData);

      expect(eventCallback).not.toHaveBeenCalled();
    });

    it('should emit progress update events', () => {
      engine.addEventListener('achievementProgress', progressCallback);

      engine.updateAchievementProgress('gdpr_specialist', 75);

      expect(progressCallback).toHaveBeenCalledWith({
        achievementId: 'gdpr_specialist',
        progress: 75,
        timestamp: expect.any(Date)
      });
    });

    it('should emit reset events', () => {
      engine.addEventListener('engineReset', resetCallback);

      engine.reset();

      expect(resetCallback).toHaveBeenCalledWith({
        timestamp: expect.any(Date)
      });
    });
  });

  describe('Toast Notification System', () => {
    it('should queue toast notifications for critical achievements', () => {

      engine.evaluateAchievements(sessionData);

      expect(engine.hasQueuedToasts()).toBe(true);
      
      expect(firstToast).toBeDefined();
      expect(firstToast?.id).toBeDefined();
    });

    it('should respect toast notification settings', () => {



      engineWithoutToasts.evaluateAchievements(sessionData);

      expect(engineWithoutToasts.hasQueuedToasts()).toBe(false);
      
      engineWithoutToasts.cleanup();
    });

    it('should properly manage toast queue', () => {

      engine.evaluateAchievements(sessionData);

      let toastCount = 0;
      while (engine.hasQueuedToasts()) {
        expect(toast).toBeDefined();
        toastCount++;
        
        // Prevent infinite loop
        if (toastCount > 10) break;
      }

      expect(toastCount).toBeGreaterThan(0);
      expect(engine.hasQueuedToasts()).toBe(false);
      expect(engine.getNextToastNotification()).toBeNull();
    });
  });

  describe('State Management', () => {
    it('should track achievement progress correctly', () => {
      engine.updateAchievementProgress('gdpr_specialist', 50);
      engine.updateAchievementProgress('compliance_champion', 75);

      expect(engine.getAchievementProgress('gdpr_specialist')).toBe(50);
      expect(engine.getAchievementProgress('compliance_champion')).toBe(75);
      expect(engine.getAchievementProgress('non_existent')).toBe(0);
    });

    it('should clamp progress values to valid range', () => {
      engine.updateAchievementProgress('test_achievement', 150); // Above 100
      expect(engine.getAchievementProgress('test_achievement')).toBe(100);

      engine.updateAchievementProgress('test_achievement', -50); // Below 0
      expect(engine.getAchievementProgress('test_achievement')).toBe(0);
    });

    it('should track earned achievements', () => {

      engine.evaluateAchievements(sessionData);

      expect(earnedAchievements.length).toBeGreaterThan(0);

      // Check specific achievements
      expect(engine.isAchievementEarned('gdpr_specialist')).toBe(true);
      expect(engine.isAchievementEarned('municipal_certified')).toBe(true);
    });

    it('should track developed competencies', () => {

      engine.evaluateAchievements(sessionData);

      expect(competencies.length).toBeGreaterThan(0);
      expect(competencies.some(c => c.includes('GDPR'))).toBe(true);
    });

    it('should reset state correctly', () => {
      // Award some achievements first

      engine.evaluateAchievements(sessionData);
      engine.updateAchievementProgress('test', 50);

      expect(engine.getEarnedAchievements().length).toBeGreaterThan(0);

      // Reset
      engine.reset();

      expect(state.achievements.earned).toHaveLength(0);
      expect(state.achievements.inProgress).toEqual({});
      expect(state.competencies.developed).toHaveLength(0);
      expect(state.session.toastQueue).toHaveLength(0);
    });
  });

  describe('Municipal Reporting', () => {
    it('should generate comprehensive municipal report', () => {
      // Award multiple achievements

      engine.evaluateAchievements(sessionData);


      // Participant information
      expect(report.participantInfo.name).toBe('Anna Svensson');
      expect(report.participantInfo.department).toBe('IT-avdelningen');
      expect(report.participantInfo.role).toBe('Systemspecialist');
      expect(report.participantInfo.municipality).toBe('malmö');

      // Achievement summary
      expect(report.achievementSummary.totalEarned).toBeGreaterThan(0);
      expect(report.achievementSummary.criticalAchievements).toBeDefined();
      expect(report.achievementSummary.competencyMilestones).toBeDefined();

      // Competency development
      expect(report.competencyDevelopment.developed).toBeDefined();
      expect(report.competencyDevelopment.workplaceApplications).toBeDefined();

      // Municipal value
      expect(report.municipalValue.institutionalBenefits).toBeDefined();
      expect(report.municipalValue.careerAdvancement).toBeDefined();

      // Export metadata
      expect(report.exportTimestamp).toBeInstanceOf(Date);
    });

    it('should identify critical achievements in report', () => {

      engine.evaluateAchievements(sessionData);


      // Should include municipal_certified and compliance_champion if earned
      expect(criticalIds).toContain('municipal_certified');
      expect(criticalIds).toContain('compliance_champion');
    });

    it('should generate report with no achievements', () => {

      expect(report.achievementSummary.totalEarned).toBe(0);
      expect(report.achievementSummary.criticalAchievements).toHaveLength(0);
      expect(report.competencyDevelopment.developed).toHaveLength(0);
      expect(report.municipalValue.institutionalBenefits).toHaveLength(0);
    });
  });

  describe('Cultural Context and Configuration', () => {
    it('should handle different municipal entities', () => {


      expect(report.participantInfo.municipality).toBe('berlin');
      expect(report.participantInfo.name).toBe('Hans Müller');

      berlinEngine.cleanup();
    });

    it('should handle different experience levels', () => {


      expect(report.participantInfo).toBeDefined();

      beginnerEngine.cleanup();
    });

    it('should respect accessibility settings', () => {

      
      // Engine should initialize without errors
      expect(state).toBeDefined();

      accessibleEngine.cleanup();
    });
  });

  describe('Factory Function', () => {
    it('should create engine with default configuration', () => {

      expect(state).toBeDefined();
      
      expect(report.participantInfo.municipality).toBe('malmö');
      expect(report.participantInfo.name).toBe('Municipal Employee');

      engine.cleanup();
    });

    it('should merge partial configuration with defaults', () => {
      const _engine = createMunicipalAchievementEngine({
        municipalEntity: 'stockholm',
        userProfile: {
          name: 'Custom User',
          department: 'Custom Department',
          role: 'Custom Role',
          experienceLevel: 'expert'
        }
      });

      expect(report.participantInfo.municipality).toBe('stockholm');
      expect(report.participantInfo.name).toBe('Custom User');
      expect(report.participantInfo.department).toBe('Custom Department');

      engine.cleanup();
    });

    it('should preserve accessibility settings in factory', () => {
      const _engine = createMunicipalAchievementEngine({
        accessibilitySettings: {
          reducedMotion: true,
          screenReaderFriendly: false,
          keyboardNavigation: false,
          highContrast: true
        }
      });

      // Should initialize correctly with custom accessibility settings
      expect(state).toBeDefined();

      engine.cleanup();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid consecutive evaluations', () => {

      // Rapid evaluations
      for (let i = 0; i < 10; i++) {
        engine.evaluateAchievements(sessionData);
      }

      // Should not crash and should not duplicate achievements
      expect(uniqueIds.size).toBe(earnedAchievements.length);
    });

    it('should handle invalid session data gracefully', () => {

      // Should not throw errors
      expect(() => {
        engine.evaluateAchievements(invalidData);
      }).not.toThrow();

      expect(achievements).toHaveLength(0);
    });

    it('should handle cleanup properly', () => {
      engine.addEventListener('achievementEarned', eventCallback);
      
      engine.cleanup();

      // Should clear event listeners

      engine.evaluateAchievements(sessionData);
      expect(eventCallback).not.toHaveBeenCalled();
    });

    it('should maintain state consistency after multiple operations', () => {
      // Complex sequence of operations
      engine.updateAchievementProgress('gdpr_specialist', 25);
      
      engine.evaluateAchievements(sessionData1);

      engine.updateAchievementProgress('gdpr_specialist', 75);
      
      engine.evaluateAchievements(sessionData2);

      // State should be consistent
      expect(state.achievements.earned.length).toBeGreaterThan(0);
      expect(engine.getAchievementProgress('gdpr_specialist')).toBe(75);
      
      // Should be able to generate report without errors
      expect(report.exportTimestamp).toBeInstanceOf(Date);
    });
  });

  describe('Next Steps and Municipal Integration', () => {
    it('should provide appropriate next steps for each achievement', () => {


      achievements.forEach(achievement => {
        expect(achievement.nextSteps).toBeDefined();
        expect(achievement.nextSteps?.length).toBeGreaterThan(0);
        
        // Should contain Swedish municipal context
        if (achievement.id === 'gdpr_specialist') {
          expect(achievement.nextSteps).toContain('GDPR-kunskaper');
        }
        if (achievement.id === 'compliance_champion') {
          expect(achievement.nextSteps).toContain('Dela din kunskap');
        }
        if (achievement.id === 'efficiency_expert') {
          expect(achievement.nextSteps).toContain('chef');
        }
        if (achievement.id === 'municipal_certified') {
          expect(achievement.nextSteps).toContain('certifikat');
        }
      });
    });

    it('should handle unknown achievement IDs gracefully', () => {
      // Test with invalid achievement ID
      expect(engine.isAchievementEarned('unknown_achievement')).toBe(false);
      expect(engine.getAchievementProgress('unknown_achievement')).toBe(0);
      
      engine.updateAchievementProgress('unknown_achievement', 50);
      expect(engine.getAchievementProgress('unknown_achievement')).toBe(50);
    });
  });
});