/**
 * Q2 Timed Challenge Engine
 * Emergency preparedness training with time-critical decision making
 * 
 * Roadmap Ref: Q2-GEI-Milestone-2.1 (proposal-030)
 * Business Impact: Municipal emergency response training under realistic time pressure
 * Integration: Leverages drag-drop workflows, municipal tenant isolation, SAML authentication
 */

import { InfrastructureMonitoring } from './infrastructure-monitoring';
import { TenantAwareService } from './tenant-isolation';
import { GameStateManager } from './game-state-manager';
import { v4 as uuidv4 } from 'uuid';

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

export type MunicipalRole = 
  | 'emergency_coordinator'
  | 'it_coordinator'
  | 'municipal_admin'
  | 'municipal_employee'
  | 'it_staff'
  | 'viewer';

export type CulturalContext = 'nordic' | 'german' | 'french' | 'dutch' | 'european';

export type UrgencyLevel = 'normal' | 'warning' | 'critical';

export interface EmergencyScenario {
  scenarioId: string;
  municipalityId: string;
  scenarioType: EmergencyType;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  timeLimit: number; // seconds
  requiredRole: MunicipalRole;
  culturalContext: CulturalContext;
  emergencyDetails: EmergencyDetails;
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

export interface Resource {
  type: string;
  quantity: number;
  deploymentTime?: number; // minutes
  specialization?: string;
}

export interface Stakeholder {
  name: string;
  contactTime: number; // seconds to contact
  authority: string;
}

export interface LegalRequirement {
  requirement: string;
  timeLimit: number; // seconds
  mandatory: boolean;
}

export interface ChallengeTimer {
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

export interface UrgencyThresholds {
  normal: number;    // 0.5 = 50% time remaining
  warning: number;   // 0.25 = 25% time remaining
  critical: number;  // 0.1 = 10% time remaining
}

export interface VisualEffects {
  pulseHeartbeat: boolean;
  colorTransitions: boolean;
  soundAlerts: boolean;
  screenFlash: boolean;
}

export interface TimerConfig {
  urgencyThresholds?: UrgencyThresholds;
  visualEffects?: VisualEffects;
}

export interface ChallengeResult {
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
  competencyBreakdown: Map<string, number>;
  decisionsTrace: DecisionTrace[];
  errorCount: number;
  hintsUsed: number;
  finalScore: number;
}

export interface DecisionTrace {
  timestamp: number;
  actionType: string;
  actionData: Record<string, unknown>;
  correctness: number; // 0-1 scale
  responseTime: number; // milliseconds
}

/**
 * High-precision timer engine for emergency training
 */
export class TimerEngine extends TenantAwareService {
  private activeTimers: Map<string, ChallengeTimer> = new Map();
  private timerCallbacks: Map<string, Function[]> = new Map();
  private performanceMonitoring: InfrastructureMonitoring;
  
  constructor() {
    super();
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
    await this.monitoring.recordMetric({
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
      
      await this.monitoring.recordMetric({
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
    
    await this.monitoring.recordMetric({
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
  
  /**
   * Get current time remaining
   */
  async getTimeRemaining(timerId: string): Promise<number> {
    const timer = this.activeTimers.get(timerId);
    if (!timer) {
      throw new Error(`Timer ${timerId} not found`);
    }
    
    if (timer.status === 'running') {
      const elapsed = Date.now() - timer.startTime;
      return Math.max(0, timer.duration - elapsed);
    }
    
    return timer.remainingTime;
  }
  
  /**
   * Register callback for urgency level changes
   */
  onUrgencyChange(timerId: string, callback: (level: UrgencyLevel) => void): void {
    if (!this.timerCallbacks.has(timerId)) {
      this.timerCallbacks.set(timerId, []);
    }
    this.timerCallbacks.get(timerId)!.push(callback);
  }
  
  private async triggerUrgencyCallbacks(timerId: string, urgencyLevel: UrgencyLevel): Promise<void> {
    const callbacks = this.timerCallbacks.get(timerId) || [];
    
    for (const callback of callbacks) {
      try {
        callback(urgencyLevel);
      } catch (error) {
        console.error('Error in urgency callback:', error);
      }
    }
    
    // Record urgency change for monitoring
    await this.monitoring.recordMetric({
      name: 'timed_challenge_urgency_change',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        timer_id: timerId,
        urgency_level: urgencyLevel
      }
    });
  }
  
  private async handleTimerExpiration(timer: ChallengeTimer): Promise<void> {
    // Trigger expiration callbacks
    const callbacks = this.timerCallbacks.get(timer.id) || [];
    for (const callback of callbacks) {
      try {
        callback('expired');
      } catch (error) {
        console.error('Error in expiration callback:', error);
      }
    }
    
    await this.monitoring.recordMetric({
      name: 'timed_challenge_expired',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        timer_id: timer.id,
        challenge_id: timer.challengeId
      }
    });
    
    // Clean up
    this.activeTimers.delete(timer.id);
    this.timerCallbacks.delete(timer.id);
  }
  
  private startTimerCleanupJob(): void {
    // Clean up expired timers every 5 minutes
    setInterval(() => {
      const expiredTimers: string[] = [];
      const now = Date.now();
      
      this.activeTimers.forEach((timer, timerId) => {
        const totalElapsed = now - timer.startTime;
        if (totalElapsed > timer.duration + 300000) { // 5 minutes grace period
          expiredTimers.push(timerId);
        }
      });
      
      expiredTimers.forEach(timerId => {
        this.activeTimers.delete(timerId);
        this.timerCallbacks.delete(timerId);
      });
    }, 300000); // 5 minutes
  }
}

/**
 * Emergency scenario framework with cultural adaptation
 */
export class EmergencyScenarioFramework extends TenantAwareService {
  private scenarios: Map<EmergencyType, EmergencyScenario> = new Map();
  private culturalAdaptations: Map<CulturalContext, any> = new Map();
  
  constructor() {
    super();
    this.initializeBaseScenarios();
  }
  
  /**
   * Get scenario adapted for specific municipality and user
   */
  async getScenario(
    scenarioType: EmergencyType,
    municipalityId: string,
    userRole: MunicipalRole,
    difficultyLevel: number,
    culturalContext: CulturalContext = 'european'
  ): Promise<EmergencyScenario> {
    // Validate tenant access
    await this.validateTenantAccess(municipalityId, municipalityId, 'system', 'get_scenario');
    
    const baseScenario = this.scenarios.get(scenarioType);
    if (!baseScenario) {
      throw new Error(`Scenario type ${scenarioType} not found`);
    }
    
    // Apply cultural adaptation
    const adaptedScenario = this.applyCulturalAdaptation(baseScenario, culturalContext);
    
    // Scale difficulty for user role
    const scaledScenario = this.scaleDifficultyForRole(adaptedScenario, userRole, difficultyLevel);
    
    return {
      ...scaledScenario,
      municipalityId,
      scenarioId: `${scenarioType}_${municipalityId}_${difficultyLevel}_${Date.now()}`
    };
  }
  
  /**
   * Get scenarios appropriate for user role and experience
   */
  async getRecommendedScenarios(
    municipalityId: string,
    userRole: MunicipalRole,
    experienceLevel: number = 1
  ): Promise<EmergencyScenario[]> {
    await this.validateTenantAccess(municipalityId, municipalityId, 'system', 'get_recommended_scenarios');
    
    const roleScenarios = this.getScenariosForRole(userRole);
    const recommendations: EmergencyScenario[] = [];
    
    for (const scenarioType of roleScenarios) {
      const scenario = await this.getScenario(
        scenarioType,
        municipalityId,
        userRole,
        Math.min(experienceLevel + 1, 5)
      );
      recommendations.push(scenario);
    }
    
    return recommendations;
  }
  
  private initializeBaseScenarios(): void {
    // Flood Response Scenario
    this.scenarios.set(EmergencyType.FLOOD_RESPONSE, {
      scenarioId: 'flood_base',
      municipalityId: '',
      scenarioType: EmergencyType.FLOOD_RESPONSE,
      difficultyLevel: 3,
      timeLimit: 180, // 3 minutes
      requiredRole: 'emergency_coordinator',
      culturalContext: 'european',
      emergencyDetails: {
        title: 'River Flooding Emergency',
        description: 'Heavy rainfall has caused river levels to rise rapidly. Multiple residential areas are at risk of flooding.',
        severity: 'high',
        affectedPopulation: 2500,
        timeToDecision: 180,
        availableResources: [
          {
            type: 'evacuation_buses',
            quantity: 12,
            deploymentTime: 30
          },
          {
            type: 'emergency_shelters',
            quantity: 3,
            specialization: 'temporary_housing'
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
            contactTime: 15,
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
            timeLimit: 120,
            mandatory: true
          },
          {
            requirement: 'media_briefing',
            timeLimit: 300,
            mandatory: false
          }
        ],
        mediaAttention: 'local'
      }
    });
    
    // Cyber Attack Scenario
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
    
    // Winter Storm Scenario (Nordic specific)
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
            deploymentTime: 20
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
    culturalContext: CulturalContext
  ): EmergencyScenario {
    // Apply basic cultural adaptation
    const adaptedScenario = { ...scenario };
    
    if (culturalContext === 'nordic') {
      // Swedish municipal terminology
      adaptedScenario.emergencyDetails = {
        ...scenario.emergencyDetails,
        stakeholders: scenario.emergencyDetails.stakeholders.map(stakeholder => ({
          ...stakeholder,
          name: this.localizeStakeholderSwedish(stakeholder.name)
        }))
      };
    } else if (culturalContext === 'german') {
      // German municipal terminology
      adaptedScenario.emergencyDetails = {
        ...scenario.emergencyDetails,
        stakeholders: scenario.emergencyDetails.stakeholders.map(stakeholder => ({
          ...stakeholder,
          name: this.localizeStakeholderGerman(stakeholder.name)
        }))
      };
    }
    
    return adaptedScenario;
  }
  
  private localizeStakeholderSwedish(name: string): string {
    const translations: Record<string, string> = {
      'Regional Emergency Authority': 'Länsstyrelsen',
      'Municipal Mayor': 'Kommunfullmäktige Ordförande',
      'Police Department': 'Polismyndigheten',
      'National Cybersecurity Authority': 'Myndigheten för Samhällsskydd och Beredskap (MSB)',
      'Energy Company': 'Energibolaget',
      'Regional Weather Service': 'SMHI',
      'Transport Authority': 'Trafikverket'
    };
    return translations[name] || name;
  }
  
  private localizeStakeholderGerman(name: string): string {
    const translations: Record<string, string> = {
      'Regional Emergency Authority': 'Bezirksregierung',
      'Municipal Mayor': 'Oberbürgermeister/in',
      'Police Department': 'Polizeipräsidium',
      'National Cybersecurity Authority': 'Bundesamt für Sicherheit in der Informationstechnik (BSI)',
      'Energy Company': 'Stadtwerke',
      'Regional Weather Service': 'Deutscher Wetterdienst (DWD)',
      'Transport Authority': 'Straßenverkehrsamt'
    };
    return translations[name] || name;
  }
  
  private scaleDifficultyForRole(
    scenario: EmergencyScenario,
    userRole: MunicipalRole,
    difficultyLevel: number
  ): EmergencyScenario {
    const scaledScenario = { ...scenario };
    
    // Adjust time limits based on role and difficulty
    const roleMultipliers: Record<MunicipalRole, number> = {
      'emergency_coordinator': 1.0,
      'it_coordinator': 0.8,
      'municipal_admin': 1.2,
      'municipal_employee': 1.5,
      'it_staff': 1.0,
      'viewer': 2.0
    };
    
    const difficultyMultipliers = [1.5, 1.3, 1.0, 0.8, 0.6]; // Level 1-5
    
    const roleMultiplier = roleMultipliers[userRole] || 1.0;
    const difficultyMultiplier = difficultyMultipliers[difficultyLevel - 1] || 1.0;
    
    scaledScenario.timeLimit = Math.round(
      scenario.timeLimit * roleMultiplier * difficultyMultiplier
    );
    
    scaledScenario.difficultyLevel = Math.max(1, Math.min(5, difficultyLevel)) as 1 | 2 | 3 | 4 | 5;
    
    return scaledScenario;
  }
  
  private getScenariosForRole(role: MunicipalRole): EmergencyType[] {
    const roleScenarios: Record<MunicipalRole, EmergencyType[]> = {
      'emergency_coordinator': [
        EmergencyType.FLOOD_RESPONSE,
        EmergencyType.WINTER_STORM_NORDIC,
        EmergencyType.MASS_EVACUATION,
        EmergencyType.SEVERE_WEATHER
      ],
      'it_coordinator': [
        EmergencyType.CYBER_ATTACK,
        EmergencyType.INFRASTRUCTURE_FAILURE,
        EmergencyType.COMMUNICATION_BREAKDOWN
      ],
      'municipal_admin': [
        EmergencyType.PANDEMIC_RESPONSE,
        EmergencyType.SHELTER_CRISIS,
        EmergencyType.FOOD_SAFETY_CRISIS
      ],
      'municipal_employee': [
        EmergencyType.FLOOD_RESPONSE,
        EmergencyType.SEVERE_WEATHER,
        EmergencyType.WINTER_STORM_NORDIC
      ],
      'it_staff': [
        EmergencyType.CYBER_ATTACK,
        EmergencyType.INFRASTRUCTURE_FAILURE
      ],
      'viewer': [
        EmergencyType.FLOOD_RESPONSE,
        EmergencyType.SEVERE_WEATHER
      ]
    };
    
    return roleScenarios[role] || [EmergencyType.FLOOD_RESPONSE];
  }
}

// Export singleton instances
export const timerEngine = new TimerEngine();
export const emergencyScenarioFramework = new EmergencyScenarioFramework();