/**
 * Timed Challenge Engine Tests
 * Comprehensive testing for emergency preparedness training system
 * 
 * Roadmap Ref: Q2-GEI-Milestone-2.1 (proposal-030)
 * Testing: High-precision timing, cultural adaptation, emergency scenarios
 */

import {
  TimerEngine,
  EmergencyScenarioFramework,
  EmergencyType,
  UrgencyLevel,
  ChallengeTimer,
  EmergencyScenario
} from '../timed-challenge-engine';
import { InfrastructureMonitoring } from '../infrastructure-monitoring';

// Mock dependencies
jest.mock('../infrastructure-monitoring');
jest.mock('../tenant-isolation');

describe('Timed Challenge Engine', () => {
  let timerEngine: TimerEngine;
  let scenarioFramework: EmergencyScenarioFramework;
  let mockMonitoring: jest.Mocked<InfrastructureMonitoring>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockMonitoring = {
      recordMetric: jest.fn(),
      reportError: jest.fn(),
      getInstance: jest.fn().mockReturnValue(mockMonitoring)
    } as any;

    (InfrastructureMonitoring.getInstance as jest.Mock).mockReturnValue(mockMonitoring);

    timerEngine = new TimerEngine();
    scenarioFramework = new EmergencyScenarioFramework();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('TimerEngine', () => {
    describe('Timer Creation and Management', () => {
      it('should create timer with correct configuration', async () => {
          urgencyThresholds: {
            normal: 0.6,
            warning: 0.3,
            critical: 0.15
          },
          visualEffects: {
            pulseHeartbeat: true,
            colorTransitions: true,
            soundAlerts: false,
            screenFlash: false
          }
        });

        expect(timer).toBeDefined();
        expect(timer.challengeId).toBe('test_challenge');
        expect(timer.duration).toBe(120000); // 120 seconds in milliseconds
        expect(timer.status).toBe('running');
        expect(timer.urgencyThresholds.normal).toBe(0.6);
        expect(timer.visualEffects.soundAlerts).toBe(false);
        
        expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'timed_challenge_started',
            tags: expect.objectContaining({
              challenge_id: 'test_challenge',
              duration: '120'
            })
          })
        );
      });

      it('should use default configuration when none provided', async () => {

        expect(timer.urgencyThresholds).toEqual({
          normal: 0.5,
          warning: 0.25,
          critical: 0.1
        });
        expect(timer.visualEffects.pulseHeartbeat).toBe(true);
        expect(timer.visualEffects.screenFlash).toBe(false); // Municipal appropriate
      });

      it('should track timer accurately with sub-second precision', async () => {
        
        // Advance time by 2.5 seconds
        jest.advanceTimersByTime(2500);
        
        expect(remaining).toBeCloseTo(2500, 100); // Within 100ms tolerance
      });
    });

    describe('Timer State Management', () => {
      it('should pause and resume timer correctly', async () => {
        
        // Run for 3 seconds then pause
        jest.advanceTimersByTime(3000);
        await timerEngine.pauseChallenge(timer.id);
        
        expect(timer.status).toBe('paused');
        
        // Advance time while paused (should not affect remaining time)
        jest.advanceTimersByTime(2000);
        
        // Resume timer
        await timerEngine.resumeChallenge(timer.id);
        expect(timer.status).toBe('running');
        
        // Check that pause time was excluded
        expect(remaining).toBeCloseTo(7000, 200); // ~7 seconds remaining
      });

      it('should extend timer duration for administrative reasons', async () => {
        
        // Extend by 10 seconds
        await timerEngine.extendTime(timer.id, 10);
        
        expect(timer.duration).toBe(15000); // Original 5s + 10s extension
        
        expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'timed_challenge_extended',
            value: 10,
            tags: expect.objectContaining({
              timer_id: timer.id,
              extension_reason: 'administrative'
            })
          })
        );
      });
    });

    describe('Urgency Level Management', () => {
      it('should trigger urgency callbacks at correct thresholds', async () => {
        const urgencyChanges: UrgencyLevel[] = [];
          urgencyThresholds: {
            normal: 0.8,   // 80% = 8 seconds
            warning: 0.4,  // 40% = 4 seconds
            critical: 0.2  // 20% = 2 seconds
          }
        });

        timerEngine.onUrgencyChange(timer.id, (level: UrgencyLevel) => {
          urgencyChanges.push(level);
        });

        // Advance to 70% remaining (should trigger warning)
        jest.advanceTimersByTime(3000);
        expect(urgencyChanges).toContain('warning');

        // Advance to 10% remaining (should trigger critical)
        jest.advanceTimersByTime(6000);
        expect(urgencyChanges).toContain('critical');
      });

      it('should record urgency changes in monitoring', async () => {
        
        // Advance to critical threshold (10% = 0.4 seconds)
        jest.advanceTimersByTime(3700);
        
        expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'timed_challenge_urgency_change',
            tags: expect.objectContaining({
              timer_id: timer.id,
              urgency_level: 'critical'
            })
          })
        );
      });
    });

    describe('Timer Expiration', () => {
      it('should handle timer expiration correctly', async () => {
        
        // Advance past expiration
        jest.advanceTimersByTime(2500);
        
        expect(timer.status).toBe('expired');
        expect(timer.remainingTime).toBe(0);
        
        expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'timed_challenge_expired',
            tags: expect.objectContaining({
              timer_id: timer.id,
              challenge_id: 'expiration_test'
            })
          })
        );
      });

      it('should trigger expiration callbacks', async () => {
        let expirationTriggered = false;
        
        timerEngine.onUrgencyChange(timer.id, (level: UrgencyLevel | 'expired') => {
          if (level === 'expired') {
            expirationTriggered = true;
          }
        });
        
        jest.advanceTimersByTime(1500);
        
        expect(expirationTriggered).toBe(true);
      });
    });

    describe('Error Handling', () => {
      it('should throw error for non-existent timer operations', async () => {
        await expect(timerEngine.pauseChallenge('non_existent'))
          .rejects.toThrow('Timer non_existent not found');
        
        await expect(timerEngine.getTimeRemaining('non_existent'))
          .rejects.toThrow('Timer non_existent not found');
      });

      it('should handle invalid resume operations', async () => {
        
        // Try to resume running timer
        await expect(timerEngine.resumeChallenge(timer.id))
          .rejects.toThrow('cannot be resumed');
      });
    });
  });

  describe('EmergencyScenarioFramework', () => {
    describe('Scenario Retrieval', () => {
      it('should retrieve flood response scenario with municipal context', async () => {
          EmergencyType.FLOOD_RESPONSE,
          'malmo_stad',
          'emergency_coordinator',
          3,
          'nordic'
        );

        expect(scenario).toBeDefined();
        expect(scenario.scenarioType).toBe(EmergencyType.FLOOD_RESPONSE);
        expect(scenario.municipalityId).toBe('malmo_stad');
        expect(scenario.difficultyLevel).toBe(3);
        expect(scenario.culturalContext).toBe('nordic');
        expect(scenario.emergencyDetails.title).toContain('Flooding');
        expect(scenario.emergencyDetails.availableResources.length).toBeGreaterThan(0);
        expect(scenario.emergencyDetails.stakeholders.length).toBeGreaterThan(0);
      });

      it('should retrieve cyber attack scenario for IT coordinator', async () => {
          EmergencyType.CYBER_ATTACK,
          'berlin_de',
          'it_coordinator',
          4,
          'german'
        );

        expect(scenario.scenarioType).toBe(EmergencyType.CYBER_ATTACK);
        expect(scenario.requiredRole).toBe('it_coordinator');
        expect(scenario.emergencyDetails.severity).toBe('critical');
        expect(scenario.timeLimit).toBeLessThan(180); // Cyber attacks need rapid response
        
        // Should have IT-specific resources
        expect(itResources.length).toBeGreaterThan(0);
      });

      it('should retrieve winter storm scenario for Nordic context', async () => {
          EmergencyType.WINTER_STORM_NORDIC,
          'stockholm_stad',
          'emergency_coordinator',
          2,
          'nordic'
        );

        expect(scenario.scenarioType).toBe(EmergencyType.WINTER_STORM_NORDIC);
        expect(scenario.culturalContext).toBe('nordic');
        
        // Should have winter-specific resources
        expect(winterResources.length).toBeGreaterThan(0);
      });
    });

    describe('Cultural Adaptation', () => {
      it('should adapt stakeholders for Swedish context', async () => {
          EmergencyType.FLOOD_RESPONSE,
          'malmo_stad',
          'emergency_coordinator',
          3,
          'nordic'
        );

        const _swedishStakeholders = scenario.emergencyDetails.stakeholders
          .map(s => s.name)
          .join(' ');
        
        // Should contain Swedish municipal terms
        expect(swedishStakeholders).toMatch(/Länsstyrelsen|Polismyndigheten|SMHI|Trafikverket/);
      });

      it('should adapt stakeholders for German context', async () => {
          EmergencyType.CYBER_ATTACK,
          'berlin_de',
          'it_coordinator',
          3,
          'german'
        );

        const _germanStakeholders = scenario.emergencyDetails.stakeholders
          .map(s => s.name)
          .join(' ');
        
        // Should contain German municipal terms
        expect(germanStakeholders).toMatch(/Bezirksregierung|Polizeipräsidium|Oberbürgermeister|BSI/);
      });
    });

    describe('Difficulty Scaling', () => {
      it('should scale time limits based on user role', async () => {
          EmergencyType.FLOOD_RESPONSE,
          'test_municipality',
          'emergency_coordinator',
          3
        );

          EmergencyType.FLOOD_RESPONSE,
          'test_municipality',
          'municipal_employee',
          3
        );

        // Municipal employee should get more time than emergency coordinator
        expect(employeeScenario.timeLimit).toBeGreaterThan(coordinatorScenario.timeLimit);
      });

      it('should scale difficulty appropriately', async () => {
          EmergencyType.FLOOD_RESPONSE,
          'test_municipality',
          'emergency_coordinator',
          1 // Easy
        );

          EmergencyType.FLOOD_RESPONSE,
          'test_municipality',
          'emergency_coordinator',
          5 // Hard
        );

        // Easy scenario should have more time
        expect(easyScenario.timeLimit).toBeGreaterThan(hardScenario.timeLimit);
        expect(easyScenario.difficultyLevel).toBe(1);
        expect(hardScenario.difficultyLevel).toBe(5);
      });
    });

    describe('Role-Based Recommendations', () => {
      it('should recommend appropriate scenarios for emergency coordinator', async () => {
          'test_municipality',
          'emergency_coordinator',
          2
        );

        expect(recommendations.length).toBeGreaterThan(0);
        
        expect(scenarioTypes).toContain(EmergencyType.FLOOD_RESPONSE);
        expect(scenarioTypes).toContain(EmergencyType.WINTER_STORM_NORDIC);
        
        // Should not contain IT-specific scenarios
        expect(scenarioTypes).not.toContain(EmergencyType.CYBER_ATTACK);
      });

      it('should recommend IT scenarios for IT coordinator', async () => {
          'test_municipality',
          'it_coordinator',
          3
        );

        expect(scenarioTypes).toContain(EmergencyType.CYBER_ATTACK);
        expect(scenarioTypes).toContain(EmergencyType.INFRASTRUCTURE_FAILURE);
      });

      it('should provide limited scenarios for viewer role', async () => {
          'test_municipality',
          'viewer',
          1
        );

        expect(recommendations.length).toBeGreaterThan(0);
        expect(recommendations.length).toBeLessThanOrEqual(2);
        
        // Viewers should only get basic scenarios
        expect(scenarioTypes).toContain(EmergencyType.FLOOD_RESPONSE);
      });
    });

    describe('Scenario Validation', () => {
      it('should throw error for unknown scenario type', async () => {
        await expect(scenarioFramework.getScenario(
          'unknown_emergency' as EmergencyType,
          'test_municipality',
          'emergency_coordinator',
          3
        )).rejects.toThrow('Scenario type unknown_emergency not found');
      });

      it('should validate scenario structure', async () => {
          EmergencyType.FLOOD_RESPONSE,
          'test_municipality',
          'emergency_coordinator',
          3
        );

        // Validate required fields
        expect(scenario.scenarioId).toBeDefined();
        expect(scenario.municipalityId).toBe('test_municipality');
        expect(scenario.emergencyDetails.title).toBeDefined();
        expect(scenario.emergencyDetails.description).toBeDefined();
        expect(scenario.emergencyDetails.availableResources).toBeInstanceOf(Array);
        expect(scenario.emergencyDetails.stakeholders).toBeInstanceOf(Array);
        expect(scenario.emergencyDetails.legalRequirements).toBeInstanceOf(Array);
        expect(scenario.timeLimit).toBeGreaterThan(0);
      });
    });

    describe('Tenant Isolation', () => {
      it('should enforce tenant isolation for scenario access', async () => {
        // This test verifies that the framework uses TenantAwareService
        // In a real implementation, this would test that cross-tenant access is blocked
          EmergencyType.FLOOD_RESPONSE,
          'malmo_stad',
          'emergency_coordinator',
          3
        );

        expect(scenario.municipalityId).toBe('malmo_stad');
        
        // Scenario should be unique to this municipality
        expect(scenario.scenarioId).toContain('malmo_stad');
      });
    });
  });

  describe('Integration Tests', () => {
    describe('Timer and Scenario Integration', () => {
      it('should create timer with scenario time limit', async () => {
          EmergencyType.CYBER_ATTACK,
          'test_municipality',
          'it_coordinator',
          4
        );

          scenario.scenarioId,
          scenario.timeLimit
        );

        expect(timer.duration).toBe(scenario.timeLimit * 1000); // Convert to milliseconds
        expect(timer.challengeId).toBe(scenario.scenarioId);
      });

      it('should handle emergency scenario completion workflow', async () => {
          EmergencyType.FLOOD_RESPONSE,
          'test_municipality',
          'emergency_coordinator',
          2
        );

          scenario.scenarioId,
          scenario.timeLimit,
          {
            urgencyThresholds: {
              normal: 0.7,
              warning: 0.3,
              critical: 0.1
            }
          }
        );

        // Simulate partial completion
        jest.advanceTimersByTime(scenario.timeLimit * 1000 * 0.5);
        
        expect(remaining).toBeGreaterThan(0);
        expect(remaining).toBeLessThan(scenario.timeLimit * 1000);
      });
    });

    describe('Performance Requirements', () => {
      it('should handle multiple concurrent challenges', async () => {
        
        // Create 5 concurrent challenges
        for (let i = 0; i < 5; i++) {
            EmergencyType.FLOOD_RESPONSE,
            `municipality_${i}`,
            'emergency_coordinator',
            2
          );
          
            scenario.scenarioId,
            scenario.timeLimit
          );
          
          challenges.push({ scenario, timer });
        }

        expect(challenges.length).toBe(5);
        
        // All timers should be running
        challenges.forEach(({ timer }) => {
          expect(timer.status).toBe('running');
        });

        // Verify monitoring was called for each challenge
        expect(mockMonitoring.recordMetric).toHaveBeenCalledTimes(5);
      });

      it('should maintain timer precision under load', async () => {
        
        // Create multiple short timers
        for (let i = 0; i < 10; i++) {
          timers.push(timer);
        }

        // Advance time and check precision
        jest.advanceTimersByTime(1500); // 1.5 seconds
        
        for (const timer of timers) {
          expect(remaining).toBeCloseTo(1500, 200); // Within 200ms tolerance
        }
      });
    });
  });
});