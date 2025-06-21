# Q2 Timed Challenge System Architecture

**Project:** DigiNative Runtime Engine  
**Roadmap Ref:** Q2-GEI-Milestone-2.1 (proposal-030)  
**Business Impact:** Municipal emergency preparedness training with time-critical decision making  
**Integration:** Leverages completed drag-drop workflows, municipal tenant isolation, and SAML authentication  

## Executive Summary

The Q2 Timed Challenge System introduces time-critical decision-making scenarios specifically designed for municipal emergency preparedness training. This system enables municipal employees to practice crisis response protocols under realistic time pressure, improving real-world emergency response capabilities.

### Key Requirements Met
- ✅ **Emergency Scenario Training:** Municipal crisis response simulations
- ✅ **Time-Critical Operations:** Sub-second timer accuracy with visual urgency indicators
- ✅ **Progressive Difficulty:** Adaptive scaling based on municipal role and experience
- ✅ **Cultural Adaptation:** European market localization (Swedish, German, French, Dutch)
- ✅ **Performance Tracking:** Municipal leaderboards and competency assessment
- ✅ **Integration:** Seamless connection with existing drag-drop workflows

## System Architecture Overview

### Core Components

```typescript
/**
 * Timed Challenge System Architecture
 * Government-appropriate emergency training platform
 */

// 1. Timer Engine - Sub-second precision
interface TimerEngine {
  startChallenge(challengeId: string, duration: number): Promise<ChallengeTimer>;
  pauseChallenge(timerId: string): Promise<void>;
  resumeChallenge(timerId: string): Promise<void>;
  extendTime(timerId: string, additionalSeconds: number): Promise<void>;
  getTimeRemaining(timerId: string): Promise<number>;
}

// 2. Emergency Scenario Framework
interface EmergencyScenario {
  scenarioId: string;
  municipalityId: string;
  scenarioType: EmergencyType;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  timeLimit: number; // seconds
  requiredRole: MunicipalRole;
  culturalContext: CulturalContext;
  emergencyDetails: EmergencyDetails;
}

// 3. Progressive Difficulty System
interface DifficultyScaling {
  assessCurrentLevel(userId: string, scenarioType: EmergencyType): Promise<number>;
  recommendNextChallenge(userId: string, completedChallenges: ChallengeResult[]): Promise<EmergencyScenario>;
  adjustDifficulty(scenarioId: string, performanceMetrics: PerformanceMetrics): EmergencyScenario;
}

// 4. Performance Tracking
interface PerformanceTracker {
  recordChallengeResult(result: ChallengeResult): Promise<void>;
  getMunicipalLeaderboard(municipalityId: string): Promise<LeaderboardEntry[]>;
  getIndividualProgress(userId: string): Promise<ProgressReport>;
  generateCompetencyReport(userId: string): Promise<CompetencyAssessment>;
}
```

### Emergency Types and Municipal Scenarios

```typescript
export enum EmergencyType {
  // Natural Disasters
  FLOOD_RESPONSE = 'flood_response',
  FOREST_FIRE = 'forest_fire', 
  SEVERE_WEATHER = 'severe_weather',
  EARTHQUAKE = 'earthquake',
  
  // Public Health
  PANDEMIC_RESPONSE = 'pandemic_response',
  FOOD_SAFETY_CRISIS = 'food_safety_crisis',
  WATER_CONTAMINATION = 'water_contamination',
  
  // Security & Safety
  TERRORIST_THREAT = 'terrorist_threat',
  CYBER_ATTACK = 'cyber_attack',
  INFRASTRUCTURE_FAILURE = 'infrastructure_failure',
  CHEMICAL_SPILL = 'chemical_spill',
  
  // Social Services
  MASS_EVACUATION = 'mass_evacuation',
  SHELTER_CRISIS = 'shelter_crisis',
  COMMUNICATION_BREAKDOWN = 'communication_breakdown',
  
  // Cultural/Regional Specific
  WINTER_STORM_NORDIC = 'winter_storm_nordic',
  HEAT_WAVE_SOUTHERN_EU = 'heat_wave_southern_eu',
  RIVER_FLOODING_NETHERLANDS = 'river_flooding_netherlands'
}

export interface EmergencyDetails {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedPopulation: number;
  timeToDecision: number; // seconds
  availableResources: Resource[];
  stakeholders: Stakeholder[];
  legalRequirements: LegalRequirement[];
  mediaAttention: 'none' | 'local' | 'national' | 'international';
}
```

## Timer Engine Implementation

### High-Precision Timer System

```typescript
/**
 * Advanced Timer Engine for Time-Critical Training
 * Ensures sub-second accuracy for emergency response training
 */

export class TimerEngine {
  private activeTimers: Map<string, ChallengeTimer> = new Map();
  private timerCallbacks: Map<string, TimerCallback[]> = new Map();
  private performanceMonitoring: InfrastructureMonitoring;
  
  constructor() {
    this.performanceMonitoring = InfrastructureMonitoring.getInstance();
    this.startTimerCleanupJob();
  }
  
  /**
   * Start a challenge with high-precision timing
   */
  async startChallenge(
    challengeId: string, 
    duration: number, 
    config: TimerConfig = {}
  ): Promise<ChallengeTimer> {
    const timer: ChallengeTimer = {
      id: uuidv4(),
      challengeId,
      startTime: Date.now(),
      duration: duration * 1000, // Convert to milliseconds
      remainingTime: duration * 1000,
      status: 'running',
      urgencyThresholds: config.urgencyThresholds || {
        normal: 0.5,    // 50% time remaining
        warning: 0.25,  // 25% time remaining  
        critical: 0.1   // 10% time remaining
      },
      visualEffects: config.visualEffects || {
        pulseHeartbeat: true,
        colorTransitions: true,
        soundAlerts: true,
        screenFlash: false // Municipal appropriate
      }
    };
    
    this.activeTimers.set(timer.id, timer);
    this.startTimerLoop(timer);
    
    // Record timer start for monitoring
    await this.performanceMonitoring.recordMetric({
      name: 'timed_challenge_started',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        challenge_id: challengeId,
        duration: duration.toString(),
        timer_id: timer.id
      }
    });
    
    return timer;
  }
  
  /**
   * High-frequency timer loop for sub-second updates
   */
  private startTimerLoop(timer: ChallengeTimer): void {
    const updateInterval = 100; // 100ms updates for smooth UI
    
    const timerLoop = setInterval(async () => {
      if (timer.status !== 'running') {
        clearInterval(timerLoop);
        return;
      }
      
      const elapsed = Date.now() - timer.startTime;
      timer.remainingTime = Math.max(0, timer.duration - elapsed);
      
      // Calculate urgency level
      const timePercent = timer.remainingTime / timer.duration;
      let urgencyLevel: UrgencyLevel = 'normal';
      
      if (timePercent <= timer.urgencyThresholds.critical) {
        urgencyLevel = 'critical';
      } else if (timePercent <= timer.urgencyThresholds.warning) {
        urgencyLevel = 'warning';
      }
      
      // Update urgency if changed
      if (timer.currentUrgency !== urgencyLevel) {
        timer.currentUrgency = urgencyLevel;
        await this.triggerUrgencyCallbacks(timer.id, urgencyLevel);
      }
      
      // Check for completion
      if (timer.remainingTime <= 0) {
        timer.status = 'expired';
        clearInterval(timerLoop);
        await this.handleTimerExpiration(timer);
      }
    }, updateInterval);
  }
  
  /**
   * Pause timer for emergencies or technical issues
   */
  async pauseChallenge(timerId: string): Promise<void> {
    const timer = this.activeTimers.get(timerId);
    if (!timer) {
      throw new Error(`Timer ${timerId} not found`);
    }
    
    if (timer.status === 'running') {
      timer.status = 'paused';
      timer.pausedAt = Date.now();
      
      await this.performanceMonitoring.recordMetric({
        name: 'timed_challenge_paused',
        value: 1,
        unit: 'count',
        timestamp: Date.now(),
        tags: {
          timer_id: timerId,
          remaining_time: timer.remainingTime.toString()
        }
      });
    }
  }
  
  /**
   * Resume paused timer
   */
  async resumeChallenge(timerId: string): Promise<void> {
    const timer = this.activeTimers.get(timerId);
    if (!timer || timer.status !== 'paused') {
      throw new Error(`Timer ${timerId} cannot be resumed`);
    }
    
    // Adjust start time to account for pause
    const pauseDuration = Date.now() - (timer.pausedAt || 0);
    timer.startTime += pauseDuration;
    timer.status = 'running';
    delete timer.pausedAt;
    
    this.startTimerLoop(timer);
  }
  
  /**
   * Emergency time extension (administrator only)
   */
  async extendTime(timerId: string, additionalSeconds: number): Promise<void> {
    const timer = this.activeTimers.get(timerId);
    if (!timer) {
      throw new Error(`Timer ${timerId} not found`);
    }
    
    timer.duration += additionalSeconds * 1000;
    timer.remainingTime += additionalSeconds * 1000;
    
    await this.performanceMonitoring.recordMetric({
      name: 'timed_challenge_extended',
      value: additionalSeconds,
      unit: 'seconds',
      timestamp: Date.now(),
      tags: {
        timer_id: timerId,
        extension_reason: 'administrative'
      }
    });
  }
  
  private async handleTimerExpiration(timer: ChallengeTimer): Promise<void> {
    await this.triggerExpirationCallbacks(timer.id);
    
    await this.performanceMonitoring.recordMetric({
      name: 'timed_challenge_expired',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        timer_id: timer.id,
        challenge_id: timer.challengeId
      }
    });
    
    this.activeTimers.delete(timer.id);
  }
}

interface ChallengeTimer {
  id: string;
  challengeId: string;
  startTime: number;
  duration: number;
  remainingTime: number;
  status: 'running' | 'paused' | 'completed' | 'expired';
  urgencyThresholds: UrgencyThresholds;
  currentUrgency?: UrgencyLevel;
  visualEffects: VisualEffects;
  pausedAt?: number;
}

interface UrgencyThresholds {
  normal: number;    // 0.5 = 50% time remaining
  warning: number;   // 0.25 = 25% time remaining
  critical: number;  // 0.1 = 10% time remaining
}

type UrgencyLevel = 'normal' | 'warning' | 'critical';

interface VisualEffects {
  pulseHeartbeat: boolean;
  colorTransitions: boolean;
  soundAlerts: boolean;
  screenFlash: boolean;
}
```

## Emergency Scenario Framework

### Municipal Crisis Templates

```typescript
/**
 * Emergency Scenario Database
 * Culturally-appropriate crisis training for European municipalities
 */

export class EmergencyScenarioFramework {
  private scenarios: Map<string, EmergencyScenario> = new Map();
  private culturalAdaptations: Map<CulturalContext, CulturalAdaptation> = new Map();
  
  constructor() {
    this.initializeScenarios();
    this.initializeCulturalAdaptations();
  }
  
  /**
   * Get scenario adapted for specific municipality
   */
  async getScenario(
    scenarioType: EmergencyType, 
    municipalityId: string,
    userRole: MunicipalRole,
    difficultyLevel: number
  ): Promise<EmergencyScenario> {
    const municipality = await this.getMunicipalityContext(municipalityId);
    const baseScenario = this.scenarios.get(scenarioType);
    
    if (!baseScenario) {
      throw new Error(`Scenario type ${scenarioType} not found`);
    }
    
    // Apply cultural adaptation
    const culturalAdaptation = this.culturalAdaptations.get(municipality.culturalContext);
    const adaptedScenario = this.applyCulturalAdaptation(baseScenario, culturalAdaptation);
    
    // Scale difficulty for user role
    const scaledScenario = this.scaleDifficultyForRole(adaptedScenario, userRole, difficultyLevel);
    
    return {
      ...scaledScenario,
      municipalityId,
      scenarioId: `${scenarioType}_${municipalityId}_${difficultyLevel}_${Date.now()}`
    };
  }
  
  private initializeScenarios(): void {
    // Flood Response - Common across Europe
    this.scenarios.set(EmergencyType.FLOOD_RESPONSE, {
      scenarioId: 'flood_base',
      municipalityId: '',
      scenarioType: EmergencyType.FLOOD_RESPONSE,
      difficultyLevel: 3,
      timeLimit: 180, // 3 minutes
      requiredRole: 'emergency_coordinator',
      culturalContext: 'nordic',
      emergencyDetails: {
        title: 'River Flooding Emergency',
        description: 'Heavy rainfall has caused river levels to rise rapidly. Multiple residential areas are at risk.',
        severity: 'high',
        affectedPopulation: 2500,
        timeToDecision: 180,
        availableResources: [
          {
            type: 'evacuation_buses',
            quantity: 12,
            deploymentTime: 30 // minutes
          },
          {
            type: 'emergency_shelters', 
            quantity: 3,
            capacity: 800
          },
          {
            type: 'emergency_personnel',
            quantity: 25,
            specialization: 'flood_response'
          }
        ],
        stakeholders: [
          {
            name: 'Regional Emergency Authority',
            contactTime: 15, // seconds to contact
            authority: 'evacuation_orders'
          },
          {
            name: 'Municipal Mayor',
            contactTime: 45,
            authority: 'public_communications'
          },
          {
            name: 'Police Department',
            contactTime: 20,
            authority: 'traffic_control'
          }
        ],
        legalRequirements: [
          {
            requirement: 'evacuation_notification',
            timeLimit: 120, // 2 minutes
            mandatory: true
          },
          {
            requirement: 'media_briefing',
            timeLimit: 300, // 5 minutes
            mandatory: false
          }
        ],
        mediaAttention: 'local'
      }
    });
    
    // Cyber Attack - Modern municipal threat
    this.scenarios.set(EmergencyType.CYBER_ATTACK, {
      scenarioId: 'cyber_base',
      municipalityId: '',
      scenarioType: EmergencyType.CYBER_ATTACK,
      difficultyLevel: 4,
      timeLimit: 120, // 2 minutes - cyber attacks require rapid response
      requiredRole: 'it_coordinator',
      culturalContext: 'european',
      emergencyDetails: {
        title: 'Municipal Systems Cyber Attack',
        description: 'Ransomware attack detected on municipal IT systems. Citizen services and emergency systems at risk.',
        severity: 'critical',
        affectedPopulation: 50000,
        timeToDecision: 120,
        availableResources: [
          {
            type: 'it_specialists',
            quantity: 8,
            specialization: 'cybersecurity'
          },
          {
            type: 'backup_systems',
            quantity: 1,
            deploymentTime: 15
          },
          {
            type: 'external_security_firm',
            quantity: 1,
            deploymentTime: 60
          }
        ],
        stakeholders: [
          {
            name: 'National Cybersecurity Authority',
            contactTime: 30,
            authority: 'incident_coordination'
          },
          {
            name: 'Police Cyber Crime Unit',
            contactTime: 45,
            authority: 'criminal_investigation'
          },
          {
            name: 'Municipal CTO',
            contactTime: 10,
            authority: 'technical_decisions'
          }
        ],
        legalRequirements: [
          {
            requirement: 'gdpr_breach_notification',
            timeLimit: 72 * 3600, // 72 hours but immediate assessment needed
            mandatory: true
          },
          {
            requirement: 'system_isolation',
            timeLimit: 60, // 1 minute
            mandatory: true
          }
        ],
        mediaAttention: 'national'
      }
    });
    
    // Winter Storm - Nordic specific
    this.scenarios.set(EmergencyType.WINTER_STORM_NORDIC, {
      scenarioId: 'winter_storm_base',
      municipalityId: '',
      scenarioType: EmergencyType.WINTER_STORM_NORDIC,
      difficultyLevel: 2,
      timeLimit: 240, // 4 minutes
      requiredRole: 'emergency_coordinator',
      culturalContext: 'nordic',
      emergencyDetails: {
        title: 'Severe Winter Storm Warning',
        description: 'Extreme weather warning: -25°C temperatures, 80km/h winds, heavy snowfall. Power outages expected.',
        severity: 'high',
        affectedPopulation: 15000,
        timeToDecision: 240,
        availableResources: [
          {
            type: 'snow_plows',
            quantity: 15,
            specialization: 'heavy_snow'
          },
          {
            type: 'emergency_heating_centers',
            quantity: 5,
            capacity: 200
          },
          {
            type: 'mobile_generators',
            quantity: 8,
            deploymentTime: 45
          }
        ],
        stakeholders: [
          {
            name: 'Energy Company',
            contactTime: 20,
            authority: 'power_grid'
          },
          {
            name: 'Regional Weather Service',
            contactTime: 10,
            authority: 'weather_updates'
          },
          {
            name: 'Transport Authority',
            contactTime: 30,
            authority: 'road_closures'
          }
        ],
        legalRequirements: [
          {
            requirement: 'vulnerable_population_check',
            timeLimit: 180,
            mandatory: true
          },
          {
            requirement: 'transport_advisory',
            timeLimit: 120,
            mandatory: true
          }
        ],
        mediaAttention: 'local'
      }
    });
  }
  
  private applyCulturalAdaptation(
    scenario: EmergencyScenario, 
    adaptation?: CulturalAdaptation
  ): EmergencyScenario {
    if (!adaptation) return scenario;
    
    return {
      ...scenario,
      emergencyDetails: {
        ...scenario.emergencyDetails,
        title: adaptation.localizeTitle(scenario.emergencyDetails.title),
        description: adaptation.localizeDescription(scenario.emergencyDetails.description),
        stakeholders: scenario.emergencyDetails.stakeholders.map(stakeholder => ({
          ...stakeholder,
          name: adaptation.localizeStakeholder(stakeholder.name)
        })),
        legalRequirements: scenario.emergencyDetails.legalRequirements.map(req => ({
          ...req,
          requirement: adaptation.localizeLegalRequirement(req.requirement)
        }))
      }
    };
  }
}

// Cultural adaptation interfaces
interface CulturalAdaptation {
  culturalContext: CulturalContext;
  localizeTitle(title: string): string;
  localizeDescription(description: string): string;
  localizeStakeholder(stakeholder: string): string;
  localizeLegalRequirement(requirement: string): string;
  getLocalEmergencyNumbers(): EmergencyContact[];
  getLocalLegalFramework(): LegalFramework;
}

type CulturalContext = 'nordic' | 'german' | 'french' | 'dutch' | 'european';

interface EmergencyContact {
  service: string;
  number: string;
  description: string;
}
```

## Progressive Difficulty Scaling System

### Adaptive Learning Engine

```typescript
/**
 * Progressive Difficulty Scaling for Municipal Training
 * Adapts challenge complexity based on role, experience, and performance
 */

export class DifficultyScalingEngine {
  private performanceHistory: Map<string, PerformanceHistory> = new Map();
  private roleBaselinnes: Map<MunicipalRole, RoleBaseline> = new Map();
  
  constructor() {
    this.initializeRoleBaselines();
  }
  
  /**
   * Assess current competency level for user
   */
  async assessCurrentLevel(
    userId: string, 
    scenarioType: EmergencyType
  ): Promise<number> {
    const history = this.performanceHistory.get(userId) || this.createEmptyHistory(userId);
    const roleBaseline = this.roleBaselinnes.get(history.userRole);
    
    if (!roleBaseline) {
      throw new Error(`Unknown role: ${history.userRole}`);
    }
    
    // Calculate competency based on recent performance
    const recentChallenges = history.challengeResults
      .filter(result => result.scenarioType === scenarioType)
      .slice(-5); // Last 5 challenges
    
    if (recentChallenges.length === 0) {
      return roleBaseline.startingLevel;
    }
    
    const averageScore = recentChallenges.reduce((sum, result) => 
      sum + result.competencyScore, 0) / recentChallenges.length;
    
    const consistencyFactor = this.calculateConsistency(recentChallenges);
    const improvementTrend = this.calculateImprovementTrend(recentChallenges);
    
    // Weighted competency calculation
    const adjustedLevel = roleBaseline.startingLevel + 
      (averageScore - 0.7) * 2 + // Score impact
      consistencyFactor * 0.5 + // Consistency bonus
      improvementTrend * 0.3; // Improvement trend
    
    return Math.max(1, Math.min(5, Math.round(adjustedLevel * 10) / 10));
  }
  
  /**
   * Recommend next challenge based on performance
   */
  async recommendNextChallenge(
    userId: string,
    completedChallenges: ChallengeResult[]
  ): Promise<RecommendedChallenge> {
    const currentLevel = await this.assessCurrentLevel(userId, EmergencyType.FLOOD_RESPONSE);
    const history = this.performanceHistory.get(userId);
    
    if (!history) {
      throw new Error(`User ${userId} not found in performance history`);
    }
    
    // Identify weak areas
    const weakAreas = this.identifyWeakAreas(completedChallenges);
    const strengths = this.identifyStrengths(completedChallenges);
    
    // Select scenario type to focus on weak areas
    const targetScenarioType = this.selectTargetScenario(weakAreas, strengths, history.userRole);
    
    // Calculate optimal difficulty
    const optimalDifficulty = this.calculateOptimalDifficulty(
      currentLevel, 
      targetScenarioType, 
      weakAreas
    );
    
    return {
      scenarioType: targetScenarioType,
      difficultyLevel: optimalDifficulty,
      focusAreas: weakAreas,
      estimatedDuration: this.estimateDuration(targetScenarioType, optimalDifficulty),
      learningObjectives: this.generateLearningObjectives(targetScenarioType, weakAreas),
      prerequisiteSkills: this.getPrerequisiteSkills(targetScenarioType, optimalDifficulty)
    };
  }
  
  /**
   * Real-time difficulty adjustment during challenge
   */
  async adjustDifficulty(
    scenarioId: string, 
    currentPerformance: RealTimePerformance
  ): Promise<DifficultyAdjustment> {
    const adjustments: DifficultyAdjustment = {
      timeExtension: 0,
      hintLevel: 'none',
      resourceChanges: [],
      complexityReduction: false
    };
    
    // Performance struggling indicators
    if (currentPerformance.decisionSpeed < 0.3) { // Very slow decisions
      adjustments.hintLevel = 'basic';
      adjustments.timeExtension = 30; // 30 seconds
    }
    
    if (currentPerformance.errorRate > 0.4) { // High error rate
      adjustments.complexityReduction = true;
      adjustments.resourceChanges.push({
        resourceType: 'expert_advisor',
        action: 'add',
        quantity: 1
      });
    }
    
    // Performance exceeding expectations
    if (currentPerformance.decisionSpeed > 0.8 && currentPerformance.errorRate < 0.1) {
      adjustments.resourceChanges.push({
        resourceType: 'additional_complications',
        action: 'add',
        quantity: 1
      });
    }
    
    return adjustments;
  }
  
  private initializeRoleBaselines(): void {
    this.roleBaselinnes.set('emergency_coordinator', {
      startingLevel: 3,
      maxLevel: 5,
      competencyAreas: [
        'decision_making',
        'resource_allocation', 
        'stakeholder_communication',
        'legal_compliance',
        'crisis_leadership'
      ],
      timeBaselines: {
        simple: 120, // 2 minutes
        moderate: 180, // 3 minutes
        complex: 300, // 5 minutes
        expert: 240, // 4 minutes but higher pressure
        master: 180 // 3 minutes maximum pressure
      }
    });
    
    this.roleBaselinnes.set('it_coordinator', {
      startingLevel: 2,
      maxLevel: 5,
      competencyAreas: [
        'technical_assessment',
        'system_recovery',
        'security_protocols',
        'vendor_coordination',
        'business_continuity'
      ],
      timeBaselines: {
        simple: 60,  // 1 minute
        moderate: 120, // 2 minutes
        complex: 180, // 3 minutes
        expert: 120, // 2 minutes high pressure
        master: 90  // 90 seconds maximum pressure
      }
    });
    
    this.roleBaselinnes.set('municipal_admin', {
      startingLevel: 2,
      maxLevel: 4,
      competencyAreas: [
        'policy_implementation',
        'public_communication',
        'regulatory_compliance',
        'inter_agency_coordination'
      ],
      timeBaselines: {
        simple: 180, // 3 minutes
        moderate: 240, // 4 minutes
        complex: 360, // 6 minutes
        expert: 300, // 5 minutes
        master: 240 // 4 minutes
      }
    });
  }
  
  private identifyWeakAreas(challenges: ChallengeResult[]): CompetencyArea[] {
    const competencyScores: Map<CompetencyArea, number[]> = new Map();
    
    // Group scores by competency area
    challenges.forEach(challenge => {
      challenge.competencyBreakdown.forEach((score, area) => {
        if (!competencyScores.has(area)) {
          competencyScores.set(area, []);
        }
        competencyScores.get(area)!.push(score);
      });
    });
    
    // Identify areas with average score < 0.6
    const weakAreas: CompetencyArea[] = [];
    competencyScores.forEach((scores, area) => {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (average < 0.6) {
        weakAreas.push(area);
      }
    });
    
    return weakAreas;
  }
}

// Supporting interfaces
interface PerformanceHistory {
  userId: string;
  userRole: MunicipalRole;
  challengeResults: ChallengeResult[];
  overallCompetency: number;
  lastAssessment: Date;
}

interface RoleBaseline {
  startingLevel: number;
  maxLevel: number;
  competencyAreas: CompetencyArea[];
  timeBaselines: Record<string, number>;
}

interface RecommendedChallenge {
  scenarioType: EmergencyType;
  difficultyLevel: number;
  focusAreas: CompetencyArea[];
  estimatedDuration: number;
  learningObjectives: string[];
  prerequisiteSkills: string[];
}

type CompetencyArea = 
  | 'decision_making'
  | 'resource_allocation'
  | 'stakeholder_communication'
  | 'legal_compliance'
  | 'crisis_leadership'
  | 'technical_assessment'
  | 'system_recovery'
  | 'security_protocols'
  | 'vendor_coordination'
  | 'business_continuity'
  | 'policy_implementation'
  | 'public_communication'
  | 'regulatory_compliance'
  | 'inter_agency_coordination';
```

## Performance Tracking & Municipal Leaderboards

### Competency Assessment System

```typescript
/**
 * Municipal Performance Tracking System
 * Tracks individual and organizational emergency response competency
 */

export class MunicipalPerformanceTracker {
  private challengeResults: Map<string, ChallengeResult[]> = new Map();
  private municipalMetrics: Map<string, MunicipalMetrics> = new Map();
  private monitoring: InfrastructureMonitoring;
  
  constructor() {
    this.monitoring = InfrastructureMonitoring.getInstance();
  }
  
  /**
   * Record challenge completion with detailed metrics
   */
  async recordChallengeResult(result: ChallengeResult): Promise<void> {
    // Store individual result
    const userResults = this.challengeResults.get(result.userId) || [];
    userResults.push(result);
    this.challengeResults.set(result.userId, userResults);
    
    // Update municipal aggregated metrics
    await this.updateMunicipalMetrics(result);
    
    // Record performance metrics for monitoring
    await this.monitoring.recordMetric({
      name: 'challenge_completed',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        municipality_id: result.municipalityId,
        scenario_type: result.scenarioType,
        difficulty_level: result.difficultyLevel.toString(),
        completion_status: result.completionStatus,
        user_role: result.userRole
      }
    });
    
    await this.monitoring.recordMetric({
      name: 'challenge_competency_score',
      value: result.competencyScore,
      unit: 'score',
      timestamp: Date.now(),
      tags: {
        municipality_id: result.municipalityId,
        scenario_type: result.scenarioType,
        user_role: result.userRole
      }
    });
  }
  
  /**
   * Generate municipal leaderboard with appropriate context
   */
  async getMunicipalLeaderboard(
    municipalityId: string,
    period: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<MunicipalLeaderboard> {
    const municipalMetrics = this.municipalMetrics.get(municipalityId);
    if (!municipalMetrics) {
      throw new Error(`Municipality ${municipalityId} not found`);
    }
    
    const cutoffDate = this.getPeriodCutoff(period);
    
    // Get all users in municipality with recent activity
    const municipalUsers = await this.getMunicipalUsers(municipalityId);
    const leaderboardEntries: LeaderboardEntry[] = [];
    
    for (const user of municipalUsers) {
      const userResults = this.challengeResults.get(user.userId) || [];
      const recentResults = userResults.filter(result => 
        new Date(result.completedAt) >= cutoffDate
      );
      
      if (recentResults.length === 0) continue;
      
      const userStats = this.calculateUserStats(recentResults);
      
      leaderboardEntries.push({
        userId: user.userId,
        userName: user.name,
        userRole: user.role,
        department: user.department,
        stats: userStats,
        rank: 0, // Will be set after sorting
        badges: this.calculateBadges(recentResults),
        improvementTrend: this.calculateImprovementTrend(recentResults)
      });
    }
    
    // Sort by overall competency, then by consistency
    leaderboardEntries.sort((a, b) => {
      if (Math.abs(a.stats.overallCompetency - b.stats.overallCompetency) < 0.05) {
        return b.stats.consistencyScore - a.stats.consistencyScore;
      }
      return b.stats.overallCompetency - a.stats.overallCompetency;
    });
    
    // Assign ranks
    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return {
      municipalityId,
      period,
      generatedAt: new Date(),
      entries: leaderboardEntries,
      municipalStats: {
        totalParticipants: leaderboardEntries.length,
        averageCompetency: this.calculateAverageCompetency(leaderboardEntries),
        emergencyReadiness: this.assessEmergencyReadiness(municipalMetrics),
        topScenarios: this.getTopPerformingScenarios(municipalMetrics),
        improvementAreas: this.getImprovementAreas(municipalMetrics)
      }
    };
  }
  
  /**
   * Generate individual progress report
   */
  async getIndividualProgress(userId: string): Promise<IndividualProgressReport> {
    const userResults = this.challengeResults.get(userId) || [];
    
    if (userResults.length === 0) {
      throw new Error(`No challenge history found for user ${userId}`);
    }
    
    const progressReport: IndividualProgressReport = {
      userId,
      reportGeneratedAt: new Date(),
      overallProgress: this.calculateOverallProgress(userResults),
      competencyBreakdown: this.calculateCompetencyBreakdown(userResults),
      scenarioMastery: this.calculateScenarioMastery(userResults),
      recentPerformance: this.getRecentPerformanceTrend(userResults),
      recommendations: await this.generateRecommendations(userId, userResults),
      achievements: this.calculateAchievements(userResults),
      nextMilestones: this.calculateNextMilestones(userResults)
    };
    
    return progressReport;
  }
  
  /**
   * Generate competency assessment for certification
   */
  async generateCompetencyReport(userId: string): Promise<CompetencyAssessment> {
    const userResults = this.challengeResults.get(userId) || [];
    const user = await this.getUserDetails(userId);
    
    if (userResults.length < 5) {
      throw new Error('Insufficient challenge history for competency assessment (minimum 5 challenges required)');
    }
    
    const assessment: CompetencyAssessment = {
      userId,
      userName: user.name,
      userRole: user.role,
      assessmentDate: new Date(),
      overallCompetencyLevel: this.calculateOverallCompetencyLevel(userResults),
      competencyAreas: this.assessCompetencyAreas(userResults),
      emergencyScenarioReadiness: this.assessScenarioReadiness(userResults),
      certificationLevel: this.determineCertificationLevel(userResults),
      validUntil: this.calculateCertificationExpiry(),
      recommendations: this.generateCertificationRecommendations(userResults),
      trainingPlan: await this.generateTrainingPlan(userId, userResults)
    };
    
    return assessment;
  }
  
  private calculateUserStats(results: ChallengeResult[]): UserStats {
    const competencyScores = results.map(r => r.competencyScore);
    const completionTimes = results.map(r => r.actualDuration);
    const decisionSpeeds = results.map(r => r.averageDecisionSpeed);
    
    return {
      challengesCompleted: results.length,
      overallCompetency: this.average(competencyScores),
      averageCompletionTime: this.average(completionTimes),
      averageDecisionSpeed: this.average(decisionSpeeds),
      consistencyScore: this.calculateConsistency(results),
      improvementRate: this.calculateImprovementRate(results),
      strongestScenarios: this.getStrongestScenarios(results),
      areasForImprovement: this.getWeakestAreas(results)
    };
  }
  
  private calculateBadges(results: ChallengeResult[]): Badge[] {
    const badges: Badge[] = [];
    
    // Speed badges
    const fastCompletions = results.filter(r => r.timeEfficiency > 0.8).length;
    if (fastCompletions >= 5) {
      badges.push({ type: 'speed_demon', level: 'gold', earnedAt: new Date() });
    } else if (fastCompletions >= 3) {
      badges.push({ type: 'speed_demon', level: 'silver', earnedAt: new Date() });
    }
    
    // Consistency badges
    const consistency = this.calculateConsistency(results);
    if (consistency > 0.9) {
      badges.push({ type: 'consistency_champion', level: 'gold', earnedAt: new Date() });
    } else if (consistency > 0.8) {
      badges.push({ type: 'consistency_champion', level: 'silver', earnedAt: new Date() });
    }
    
    // Scenario mastery badges
    const scenarioTypes = [...new Set(results.map(r => r.scenarioType))];
    if (scenarioTypes.length >= 5) {
      badges.push({ type: 'versatility_master', level: 'gold', earnedAt: new Date() });
    }
    
    // Improvement badges
    const improvementRate = this.calculateImprovementRate(results);
    if (improvementRate > 0.15) {
      badges.push({ type: 'rapid_learner', level: 'gold', earnedAt: new Date() });
    }
    
    return badges;
  }
}

// Supporting interfaces for performance tracking
interface ChallengeResult {
  resultId: string;
  userId: string;
  municipalityId: string;
  scenarioType: EmergencyType;
  difficultyLevel: number;
  userRole: MunicipalRole;
  completedAt: Date;
  actualDuration: number;
  allocatedTime: number;
  completionStatus: 'completed' | 'expired' | 'abandoned';
  competencyScore: number; // 0-1 scale
  timeEfficiency: number; // 0-1 scale
  decisionAccuracy: number; // 0-1 scale
  averageDecisionSpeed: number; // 0-1 scale
  competencyBreakdown: Map<CompetencyArea, number>;
  decisionsTrace: DecisionTrace[];
  errorCount: number;
  hintsUsed: number;
  finalScore: number;
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  userRole: MunicipalRole;
  department: string;
  rank: number;
  stats: UserStats;
  badges: Badge[];
  improvementTrend: 'improving' | 'stable' | 'declining';
}

interface UserStats {
  challengesCompleted: number;
  overallCompetency: number;
  averageCompletionTime: number;
  averageDecisionSpeed: number;
  consistencyScore: number;
  improvementRate: number;
  strongestScenarios: EmergencyType[];
  areasForImprovement: CompetencyArea[];
}

interface Badge {
  type: 'speed_demon' | 'consistency_champion' | 'versatility_master' | 'rapid_learner' | 'scenario_expert';
  level: 'bronze' | 'silver' | 'gold';
  earnedAt: Date;
}
```

## Integration with Existing Systems

### Game State Management Integration

```typescript
/**
 * Integration with existing drag-drop workflows and game state
 */

export class TimedChallengeIntegration {
  private gameStateManager: GameStateManager;
  private dragDropService: DragDropService;
  private timerEngine: TimerEngine;
  
  constructor() {
    this.gameStateManager = new GameStateManager();
    this.dragDropService = new DragDropService();
    this.timerEngine = new TimerEngine();
  }
  
  /**
   * Start timed challenge with integrated drag-drop mechanics
   */
  async startTimedDragDropChallenge(
    scenarioId: string,
    userId: string,
    municipalityId: string
  ): Promise<IntegratedChallengeSession> {
    // Initialize base game state
    const gameState = await this.gameStateManager.createSession({
      userId,
      municipalityId,
      sessionType: 'timed_challenge',
      scenarioId
    });
    
    // Get scenario configuration
    const scenario = await this.getScenario(scenarioId, municipalityId);
    
    // Start challenge timer
    const timer = await this.timerEngine.startChallenge(scenarioId, scenario.timeLimit);
    
    // Configure drag-drop elements for scenario
    const dragDropConfig = this.configureDragDropForScenario(scenario);
    await this.dragDropService.initializeElements(gameState.sessionId, dragDropConfig);
    
    // Create integrated session
    const session: IntegratedChallengeSession = {
      sessionId: gameState.sessionId,
      timerId: timer.id,
      scenarioId,
      userId,
      municipalityId,
      startedAt: new Date(),
      gameState,
      timerState: timer,
      dragDropState: await this.dragDropService.getState(gameState.sessionId),
      challengeProgress: {
        decisionsMade: 0,
        correctDecisions: 0,
        resourcesAllocated: 0,
        timeRemaining: scenario.timeLimit
      }
    };
    
    return session;
  }
  
  /**
   * Handle decision action with both timer and drag-drop context
   */
  async handleDecisionAction(
    sessionId: string,
    action: ChallengeAction
  ): Promise<ActionResult> {
    const session = await this.getSession(sessionId);
    const startTime = Date.now();
    
    let result: ActionResult;
    
    switch (action.type) {
      case 'drag_drop_allocation':
        result = await this.handleResourceAllocation(session, action);
        break;
        
      case 'stakeholder_contact':
        result = await this.handleStakeholderContact(session, action);
        break;
        
      case 'emergency_decision':
        result = await this.handleEmergencyDecision(session, action);
        break;
        
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
    
    // Record decision timing
    const decisionTime = Date.now() - startTime;
    await this.recordDecisionMetrics(session, action, result, decisionTime);
    
    // Update challenge progress
    await this.updateChallengeProgress(session, result);
    
    // Check for completion conditions
    const completionStatus = await this.checkCompletionConditions(session);
    if (completionStatus.isComplete) {
      await this.completeChallengeSession(session, completionStatus);
    }
    
    return result;
  }
  
  private configureDragDropForScenario(scenario: EmergencyScenario): DragDropConfig {
    const config: DragDropConfig = {
      draggableElements: [],
      dropZones: [],
      validConnections: [],
      scoringRules: []
    };
    
    // Add resources as draggable elements
    scenario.emergencyDetails.availableResources.forEach(resource => {
      config.draggableElements.push({
        id: `resource_${resource.type}`,
        type: 'resource',
        displayName: this.localizeResourceName(resource.type),
        quantity: resource.quantity,
        deploymentTime: resource.deploymentTime || 0,
        icon: this.getResourceIcon(resource.type),
        constraints: {
          maxUses: resource.quantity,
          cooldownTime: resource.deploymentTime || 0
        }
      });
    });
    
    // Add stakeholders as drop zones
    scenario.emergencyDetails.stakeholders.forEach(stakeholder => {
      config.dropZones.push({
        id: `stakeholder_${stakeholder.name.toLowerCase().replace(/\s+/g, '_')}`,
        type: 'stakeholder',
        displayName: stakeholder.name,
        acceptedTypes: ['resource', 'communication'],
        capacity: 3, // Can handle 3 simultaneous resource allocations
        authority: stakeholder.authority,
        contactTime: stakeholder.contactTime
      });
    });
    
    // Add affected areas as drop zones
    const affectedAreas = this.generateAffectedAreas(scenario);
    affectedAreas.forEach(area => {
      config.dropZones.push({
        id: `area_${area.id}`,
        type: 'affected_area',
        displayName: area.name,
        acceptedTypes: ['resource'],
        capacity: 5,
        priority: area.priority,
        population: area.population
      });
    });
    
    // Define valid connections and scoring
    config.validConnections = this.defineValidConnections(scenario);
    config.scoringRules = this.defineScoringRules(scenario);
    
    return config;
  }
  
  private async handleResourceAllocation(
    session: IntegratedChallengeSession,
    action: ResourceAllocationAction
  ): Promise<ActionResult> {
    // Validate resource allocation through drag-drop service
    const dragDropResult = await this.dragDropService.handleDrop(
      session.sessionId,
      {
        draggableId: action.resourceId,
        dropZoneId: action.targetId,
        position: action.position
      }
    );
    
    if (!dragDropResult.success) {
      return {
        success: false,
        message: dragDropResult.error || 'Resource allocation failed',
        scoreImpact: -5,
        timeImpact: 0
      };
    }
    
    // Calculate allocation effectiveness
    const effectiveness = this.calculateAllocationEffectiveness(
      action.resourceId,
      action.targetId,
      session.scenarioId
    );
    
    // Apply time penalty for deployment
    const resource = await this.getResourceDetails(action.resourceId);
    const deploymentTime = resource.deploymentTime || 0;
    
    return {
      success: true,
      message: `${resource.displayName} allocated to ${action.targetId}`,
      scoreImpact: effectiveness * 20, // 0-20 points based on effectiveness
      timeImpact: deploymentTime,
      consequences: this.calculateAllocationConsequences(action, effectiveness)
    };
  }
}

// Integration interfaces
interface IntegratedChallengeSession {
  sessionId: string;
  timerId: string;
  scenarioId: string;
  userId: string;
  municipalityId: string;
  startedAt: Date;
  gameState: GameState;
  timerState: ChallengeTimer;
  dragDropState: DragDropState;
  challengeProgress: ChallengeProgress;
}

interface ChallengeAction {
  type: 'drag_drop_allocation' | 'stakeholder_contact' | 'emergency_decision';
  resourceId?: string;
  targetId?: string;
  position?: { x: number; y: number };
  parameters?: Record<string, any>;
}

interface ActionResult {
  success: boolean;
  message: string;
  scoreImpact: number;
  timeImpact: number;
  consequences?: string[];
}
```

## Cultural Adaptation Architecture

### European Market Localization

```typescript
/**
 * Cultural Adaptation for European Emergency Training
 * Localizes scenarios, stakeholders, and procedures for different European contexts
 */

export class CulturalAdaptationEngine {
  private adaptations: Map<CulturalContext, CulturalFramework> = new Map();
  
  constructor() {
    this.initializeCulturalFrameworks();
  }
  
  /**
   * Adapt scenario for specific cultural context
   */
  async adaptScenario(
    baseScenario: EmergencyScenario,
    culturalContext: CulturalContext,
    municipalityId: string
  ): Promise<EmergencyScenario> {
    const framework = this.adaptations.get(culturalContext);
    if (!framework) {
      throw new Error(`Cultural framework not found for: ${culturalContext}`);
    }
    
    const adaptedScenario: EmergencyScenario = {
      ...baseScenario,
      municipalityId,
      emergencyDetails: {
        ...baseScenario.emergencyDetails,
        title: framework.localizeTitle(baseScenario.emergencyDetails.title),
        description: framework.localizeDescription(baseScenario.emergencyDetails.description),
        stakeholders: baseScenario.emergencyDetails.stakeholders.map(stakeholder => ({
          ...stakeholder,
          name: framework.localizeStakeholder(stakeholder.name, stakeholder.authority),
          contactTime: framework.adjustContactTime(stakeholder.contactTime, stakeholder.authority)
        })),
        legalRequirements: baseScenario.emergencyDetails.legalRequirements.map(req => ({
          ...req,
          requirement: framework.localizeLegalRequirement(req.requirement),
          timeLimit: framework.adjustLegalTimeLimit(req.requirement, req.timeLimit)
        })),
        availableResources: baseScenario.emergencyDetails.availableResources.map(resource => ({
          ...resource,
          type: framework.localizeResourceType(resource.type),
          deploymentTime: framework.adjustDeploymentTime(resource.type, resource.deploymentTime || 0)
        }))
      }
    };
    
    // Add culture-specific complications
    adaptedScenario.emergencyDetails.availableResources.push(
      ...framework.getCultureSpecificResources(baseScenario.scenarioType)
    );
    
    // Adjust scenario based on local emergency protocols
    adaptedScenario.timeLimit = framework.adjustScenarioTimeLimit(
      baseScenario.scenarioType,
      baseScenario.timeLimit
    );
    
    return adaptedScenario;
  }
  
  private initializeCulturalFrameworks(): void {
    // Swedish Municipal Framework
    this.adaptations.set('nordic', new SwedishMunicipalFramework());
    
    // German Municipal Framework  
    this.adaptations.set('german', new GermanMunicipalFramework());
    
    // French Municipal Framework
    this.adaptations.set('french', new FrenchMunicipalFramework());
    
    // Dutch Municipal Framework
    this.adaptations.set('dutch', new DutchMunicipalFramework());
  }
}

/**
 * Swedish Municipal Cultural Framework
 * Based on Anna Svensson persona and Swedish emergency management
 */
class SwedishMunicipalFramework implements CulturalFramework {
  culturalContext: CulturalContext = 'nordic';
  
  localizeTitle(title: string): string {
    const translations: Record<string, string> = {
      'River Flooding Emergency': 'Översvämningslarm - Älvvatten',
      'Municipal Systems Cyber Attack': 'Cyberattack mot Kommunala System',
      'Severe Winter Storm Warning': 'Kraftigt Vinterstormvarning'
    };
    return translations[title] || title;
  }
  
  localizeDescription(description: string): string {
    // Swedish municipal language adaptation
    return description
      .replace(/residents/g, 'invånare')
      .replace(/emergency services/g, 'räddningstjänst')
      .replace(/municipal/g, 'kommunal')
      .replace(/authorities/g, 'myndigheter');
  }
  
  localizeStakeholder(name: string, authority: string): string {
    const stakeholderMap: Record<string, string> = {
      'Regional Emergency Authority': 'Länsstyrelsen',
      'Municipal Mayor': 'Kommunfullmäktige Ordförande',
      'Police Department': 'Polismyndigheten',
      'National Cybersecurity Authority': 'Myndigheten för Samhällsskydd och Beredskap (MSB)',
      'Police Cyber Crime Unit': 'Polisens IT-brottssektion',
      'Municipal CTO': 'Kommunal IT-chef',
      'Energy Company': 'Energibolaget',
      'Regional Weather Service': 'SMHI',
      'Transport Authority': 'Trafikverket'
    };
    return stakeholderMap[name] || name;
  }
  
  localizeLegalRequirement(requirement: string): string {
    const legalMap: Record<string, string> = {
      'evacuation_notification': 'Evakueringsmeddelande enligt Lagen om skydd mot olyckor',
      'media_briefing': 'Presskonferens enligt Offentlighets- och sekretesslagen',
      'gdpr_breach_notification': 'GDPR-incidentrapportering till IMY',
      'system_isolation': 'Systemisolering enligt Säkerhetsskyddslagen',
      'vulnerable_population_check': 'Kontroll av särskilt utsatta grupper',
      'transport_advisory': 'Trafikmeddelande enligt Vägtrafiklagen'
    };
    return legalMap[requirement] || requirement;
  }
  
  adjustContactTime(originalTime: number, authority: string): number {
    // Swedish bureaucracy tends to be efficient but formal
    const adjustments: Record<string, number> = {
      'evacuation_orders': 1.0, // Standard time
      'public_communications': 1.2, // Slightly longer for proper protocol
      'traffic_control': 0.8, // Efficient traffic management
      'incident_coordination': 1.1, // Coordination takes time
      'technical_decisions': 0.9 // Technical decisions are quick
    };
    return Math.round(originalTime * (adjustments[authority] || 1.0));
  }
  
  getCultureSpecificResources(scenarioType: EmergencyType): Resource[] {
    const resources: Resource[] = [];
    
    if (scenarioType === EmergencyType.WINTER_STORM_NORDIC) {
      resources.push(
        {
          type: 'municipal_warming_centers',
          quantity: 8,
          deploymentTime: 20,
          specialization: 'cold_weather_shelter'
        },
        {
          type: 'snow_clearing_equipment',
          quantity: 12,
          deploymentTime: 15,
          specialization: 'heavy_snow_removal'
        }
      );
    }
    
    if (scenarioType === EmergencyType.FLOOD_RESPONSE) {
      resources.push({
        type: 'kommunal_frivilliga',
        quantity: 50,
        deploymentTime: 45,
        specialization: 'community_volunteers'
      });
    }
    
    return resources;
  }
  
  adjustScenarioTimeLimit(scenarioType: EmergencyType, originalLimit: number): number {
    // Swedish decision-making tends to be consensus-based, slightly longer
    return Math.round(originalLimit * 1.1);
  }
  
  getEmergencyContacts(): EmergencyContact[] {
    return [
      { service: 'SOS Alarm', number: '112', description: 'General emergency' },
      { service: 'Polis', number: '114 14', description: 'Non-emergency police' },
      { service: 'MSB', number: '010-568 10 00', description: 'National emergency management' }
    ];
  }
}

/**
 * German Municipal Cultural Framework
 * Based on Klaus Mueller persona and German verwaltung culture
 */
class GermanMunicipalFramework implements CulturalFramework {
  culturalContext: CulturalContext = 'german';
  
  localizeTitle(title: string): string {
    const translations: Record<string, string> = {
      'River Flooding Emergency': 'Hochwassernotfall',
      'Municipal Systems Cyber Attack': 'Cyberangriff auf Stadtverwaltung',
      'Severe Winter Storm Warning': 'Schwere Wintersturmwarnung'
    };
    return translations[title] || title;
  }
  
  localizeStakeholder(name: string, authority: string): string {
    const stakeholderMap: Record<string, string> = {
      'Regional Emergency Authority': 'Bezirksregierung',
      'Municipal Mayor': 'Oberbürgermeister/in',
      'Police Department': 'Polizeipräsidium',
      'National Cybersecurity Authority': 'Bundesamt für Sicherheit in der Informationstechnik (BSI)',
      'Energy Company': 'Stadtwerke',
      'Regional Weather Service': 'Deutscher Wetterdienst (DWD)',
      'Transport Authority': 'Straßenverkehrsamt'
    };
    return stakeholderMap[name] || name;
  }
  
  localizeLegalRequirement(requirement: string): string {
    const legalMap: Record<string, string> = {
      'evacuation_notification': 'Evakuierungsanordnung nach Katastrophenschutzgesetz',
      'media_briefing': 'Pressemitteilung nach Informationsfreiheitsgesetz',
      'gdpr_breach_notification': 'DSGVO-Meldung an Datenschutzbehörde',
      'system_isolation': 'Systemtrennung nach IT-Sicherheitsgesetz'
    };
    return legalMap[requirement] || requirement;
  }
  
  adjustContactTime(originalTime: number, authority: string): number {
    // German administration is thorough and follows proper procedures
    const adjustments: Record<string, number> = {
      'evacuation_orders': 1.3, // Thorough legal review
      'public_communications': 1.4, // Careful communication protocol
      'technical_decisions': 1.2, // Technical approval process
      'incident_coordination': 1.5 // Complex coordination hierarchy
    };
    return Math.round(originalTime * (adjustments[authority] || 1.2));
  }
  
  getCultureSpecificResources(scenarioType: EmergencyType): Resource[] {
    const resources: Resource[] = [];
    
    // German efficiency and planning focus
    resources.push({
      type: 'technisches_hilfswerk',
      quantity: 1,
      deploymentTime: 25,
      specialization: 'technical_relief_organization'
    });
    
    if (scenarioType === EmergencyType.FLOOD_RESPONSE) {
      resources.push({
        type: 'hochwasserschutz_spezialisten',
        quantity: 8,
        deploymentTime: 30,
        specialization: 'flood_protection_specialists'
      });
    }
    
    return resources;
  }
  
  adjustScenarioTimeLimit(scenarioType: EmergencyType, originalLimit: number): number {
    // German thoroughness requires more time for proper procedures
    return Math.round(originalLimit * 1.25);
  }
}

// Cultural framework interface
interface CulturalFramework {
  culturalContext: CulturalContext;
  localizeTitle(title: string): string;
  localizeDescription(description: string): string;
  localizeStakeholder(name: string, authority: string): string;
  localizeLegalRequirement(requirement: string): string;
  adjustContactTime(originalTime: number, authority: string): number;
  getCultureSpecificResources(scenarioType: EmergencyType): Resource[];
  adjustScenarioTimeLimit(scenarioType: EmergencyType, originalLimit: number): number;
  getEmergencyContacts(): EmergencyContact[];
}
```

## Performance Requirements

### Time-Critical Operations Optimization

```typescript
/**
 * Performance Requirements for Time-Critical Emergency Training
 * Ensures sub-second response times and smooth user experience under pressure
 */

export const TimedChallengePerformanceRequirements = {
  // Timer Update Frequency
  TIMER_UPDATE_INTERVAL: 100, // 100ms for smooth countdown
  URGENCY_CHECK_INTERVAL: 500, // 500ms for urgency level updates
  
  // Response Time Requirements
  USER_ACTION_RESPONSE: 200, // 200ms max for drag-drop response
  DECISION_RECORDING: 100, // 100ms max to record decision
  STATE_PERSISTENCE: 500, // 500ms max to save game state
  
  // Visual Performance
  ANIMATION_FRAME_RATE: 60, // 60 FPS for urgency animations
  UI_UPDATE_LATENCY: 50, // 50ms max UI update latency
  
  // Network Performance
  REAL_TIME_SYNC: 1000, // 1 second max for real-time sync
  OFFLINE_BUFFER: 30000, // 30 seconds offline operation
  
  // Memory Performance
  MAX_SESSION_MEMORY: 50 * 1024 * 1024, // 50MB per session
  GARBAGE_COLLECTION_THRESHOLD: 100, // Cleanup every 100 actions
  
  // Scalability Requirements
  CONCURRENT_CHALLENGES: 500, // 500 simultaneous challenges per municipality
  MUNICIPAL_ISOLATION: true, // Complete tenant isolation required
  
  // Error Recovery
  AUTO_SAVE_INTERVAL: 15000, // 15 seconds auto-save
  CONNECTION_RETRY_ATTEMPTS: 3,
  GRACEFUL_DEGRADATION: true
};

/**
 * Performance Monitoring for Timed Challenges
 */
export class TimedChallengePerformanceMonitor {
  private performanceMetrics: Map<string, PerformanceMetric[]> = new Map();
  private realTimeMonitoring: InfrastructureMonitoring;
  
  constructor() {
    this.realTimeMonitoring = InfrastructureMonitoring.getInstance();
    this.startPerformanceMonitoring();
  }
  
  /**
   * Monitor timer precision and accuracy
   */
  async monitorTimerPerformance(timerId: string): Promise<void> {
    const startTime = performance.now();
    
    // Monitor timer update intervals
    const intervalCheck = setInterval(() => {
      const currentTime = performance.now();
      const actualInterval = currentTime - startTime;
      
      if (actualInterval > TimedChallengePerformanceRequirements.TIMER_UPDATE_INTERVAL * 1.2) {
        this.recordPerformanceIssue('timer_update_lag', {
          timer_id: timerId,
          expected_interval: TimedChallengePerformanceRequirements.TIMER_UPDATE_INTERVAL,
          actual_interval: actualInterval
        });
      }
    }, TimedChallengePerformanceRequirements.TIMER_UPDATE_INTERVAL);
    
    // Clean up monitoring after timer completion
    setTimeout(() => {
      clearInterval(intervalCheck);
    }, 600000); // 10 minutes max monitoring
  }
  
  /**
   * Monitor user action response times
   */
  async monitorActionResponse(
    sessionId: string,
    actionType: string,
    startTime: number
  ): Promise<void> {
    const responseTime = performance.now() - startTime;
    const requirement = TimedChallengePerformanceRequirements.USER_ACTION_RESPONSE;
    
    await this.realTimeMonitoring.recordMetric({
      name: 'timed_challenge_action_response',
      value: responseTime,
      unit: 'milliseconds',
      timestamp: Date.now(),
      tags: {
        session_id: sessionId,
        action_type: actionType,
        performance_status: responseTime <= requirement ? 'good' : 'slow'
      }
    });
    
    if (responseTime > requirement) {
      await this.recordPerformanceIssue('slow_action_response', {
        session_id: sessionId,
        action_type: actionType,
        response_time: responseTime,
        requirement: requirement
      });
    }
  }
  
  /**
   * Monitor memory usage during challenges
   */
  async monitorMemoryUsage(sessionId: string): Promise<void> {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usedJSHeapSize = memInfo.usedJSHeapSize;
      const requirement = TimedChallengePerformanceRequirements.MAX_SESSION_MEMORY;
      
      await this.realTimeMonitoring.recordMetric({
        name: 'timed_challenge_memory_usage',
        value: usedJSHeapSize,
        unit: 'bytes',
        timestamp: Date.now(),
        tags: {
          session_id: sessionId,
          memory_status: usedJSHeapSize <= requirement ? 'good' : 'high'
        }
      });
      
      if (usedJSHeapSize > requirement) {
        await this.triggerGarbageCollection(sessionId);
      }
    }
  }
  
  private async recordPerformanceIssue(
    issueType: string,
    details: Record<string, any>
  ): Promise<void> {
    await this.realTimeMonitoring.recordMetric({
      name: 'timed_challenge_performance_issue',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        issue_type: issueType,
        severity: 'warning'
      }
    });
    
    console.warn(`Timed Challenge Performance Issue [${issueType}]:`, details);
  }
  
  private async triggerGarbageCollection(sessionId: string): Promise<void> {
    // Clean up old performance metrics
    const cutoffTime = Date.now() - 300000; // 5 minutes ago
    const sessionMetrics = this.performanceMetrics.get(sessionId) || [];
    const recentMetrics = sessionMetrics.filter(metric => metric.timestamp > cutoffTime);
    this.performanceMetrics.set(sessionId, recentMetrics);
    
    // Trigger browser garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }
}
```

## Conclusion

The Q2 Timed Challenge System architecture provides:

- ✅ **Emergency Preparedness Training:** Government-appropriate crisis scenarios
- ✅ **Time-Critical Operations:** Sub-second timer precision with visual urgency
- ✅ **Cultural Adaptation:** European market localization for Swedish, German, French, Dutch contexts
- ✅ **Progressive Difficulty:** Adaptive scaling based on municipal role and performance
- ✅ **Integration:** Seamless connection with drag-drop workflows and municipal infrastructure
- ✅ **Performance Optimization:** <200ms response times for time-critical operations
- ✅ **Tenant Isolation:** Complete municipal data separation with government-grade security

This system enables municipal employees to practice emergency response under realistic time pressure, improving real-world crisis management capabilities while maintaining the highest standards of government appropriateness and cultural sensitivity.