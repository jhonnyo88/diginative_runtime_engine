/**
 * Q3 Multi-World Type Definitions
 * Building on Q2 GameState foundation for multi-world experiences
 */

import { GameState, GameResults } from '../services/game-state-manager';

// Central World Hub Types
export interface WorldHubState {
  hubSessionId: string;
  uniqueCode: string;
  userId: string;
  tenantId: string;
  totalScore: number;
  worldsCompleted: number;
  currentWorldIndex?: number;
  hubProgressData: HubProgressData;
  worldCompletionStatus: WorldCompletionStatus[];
  culturalContext: 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal';
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
}

export interface HubProgressData {
  overallCompletionPercentage: number;
  totalTimeSpent: number; // milliseconds across all worlds
  competencyLevels: Record<CompetencyType, number>;
  unlockedAchievements: string[];
  municipalCertificationProgress: number;
  professionalDevelopmentScore: number;
}

// World Definition Types
export interface WorldDefinition {
  worldId: string;
  worldIndex: number; // 1-5
  title: {
    swedish: string;
    german: string;
    french: string;
    dutch: string;
  };
  description: {
    swedish: string;
    german: string;
    french: string;
    dutch: string;
  };
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedDuration: number; // minutes
  prerequisiteWorlds: number[]; // World indices that must be completed
  municipalContext: MunicipalContext;
  primaryMechanics: MechanicType[];
  secondaryMechanics: MechanicType[];
  learningObjectives: LearningObjective[];
  competencyFocus: CompetencyType[];
  theme: WorldTheme;
}

export type WorldTheme = 
  | 'municipal_foundations'
  | 'citizen_service'
  | 'emergency_response'
  | 'leadership_development'
  | 'innovation_implementation';

export type MechanicType = 
  | 'drag_drop_workflows'
  | 'timed_challenges'
  | 'branching_narratives'
  | 'character_relationships'
  | 'achievement_system';

export type CompetencyType =
  | 'municipal_administration'
  | 'citizen_service_excellence'
  | 'emergency_management'
  | 'leadership_skills'
  | 'digital_innovation'
  | 'cultural_adaptation'
  | 'compliance_knowledge';

// World Completion Tracking
export interface WorldCompletionStatus {
  worldIndex: number;
  worldId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  score: number;
  completionPercentage: number;
  timeSpent: number; // milliseconds
  startedAt?: Date;
  completedAt?: Date;
  achievementsUnlocked: string[];
  competencyGains: Record<CompetencyType, number>;
}

// Multi-World Progress Tracking
export interface MultiWorldProgress {
  hubSessionId: string;
  worldProgresses: Map<number, WorldProgress>;
  crossWorldAchievements: CrossWorldAchievement[];
  characterEvolution: CrossWorldCharacterEvolution;
  totalMetrics: MultiWorldMetrics;
}

export interface WorldProgress {
  worldIndex: number;
  gameState: GameState; // Extends existing Q2 GameState
  worldSpecificData: WorldSpecificData;
  municipalScenarioProgress: MunicipalScenarioProgress;
}

export interface WorldSpecificData {
  worldTheme: WorldTheme;
  scenarioContext: MunicipalScenarioContext;
  culturalAdaptations: CulturalAdaptationState;
  professionalFeedback: ProfessionalFeedbackData;
}

// Cross-World Achievement System
export interface CrossWorldAchievement {
  achievementId: string;
  title: {
    swedish: string;
    german: string;
    french: string;
    dutch: string;
  };
  description: {
    swedish: string;
    german: string;
    french: string;
    dutch: string;
  };
  requiredWorlds: number[];
  requiredCompetencies: CompetencyRequirement[];
  municipalRecognition: boolean;
  certificationValue: number;
  unlockedAt?: Date;
}

export interface CompetencyRequirement {
  competencyType: CompetencyType;
  minimumLevel: number;
  contextSpecific: boolean;
}

// Character Evolution Across Worlds
export interface CrossWorldCharacterEvolution {
  characterId: string;
  basePersonality: CharacterPersonality;
  worldSpecificDevelopment: Map<number, CharacterDevelopment>;
  relationshipEvolution: CrossWorldRelationshipEvolution;
  professionalGrowthTrajectory: ProfessionalGrowthTrajectory;
}

export interface CharacterDevelopment {
  worldIndex: number;
  personalityShifts: PersonalityShift[];
  skillAcquisitions: SkillAcquisition[];
  relationshipChanges: RelationshipChange[];
  municipalContextAdaptation: MunicipalContextAdaptation;
}

// Municipal Context Integration
export interface MunicipalContext {
  municipalityType: 'kommun' | 'stad' | 'region';
  populationSize: 'small' | 'medium' | 'large' | 'metropolitan';
  specializations: MunicipalSpecialization[];
  culturalRegion: 'nordic' | 'germanic' | 'romance' | 'benelux';
  governanceStyle: 'consensus' | 'hierarchical' | 'federal' | 'pragmatic';
}

export interface MunicipalSpecialization {
  area: 'healthcare' | 'education' | 'infrastructure' | 'environment' | 'digitalization';
  expertiseLevel: number; // 1-5
  innovationFocus: boolean;
}

// Performance Tracking Types
export interface MultiWorldMetrics {
  totalScore: number;
  averageCompletionTime: number;
  competencyProgression: CompetencyProgression;
  culturalAdaptationScore: number;
  municipalProfessionalismScore: number;
  innovationImplementationScore: number;
}

export interface CompetencyProgression {
  baselineScores: Record<CompetencyType, number>;
  currentScores: Record<CompetencyType, number>;
  improvementTrajectory: Record<CompetencyType, number[]>;
  certificationReadiness: Record<CompetencyType, boolean>;
}

// Hub Navigation Types
export interface WorldNavigationConfig {
  worldUnlockStrategy: 'linear' | 'prerequisite_based' | 'competency_gated';
  difficultyProgression: DifficultyProgression;
  culturalAdaptationLevel: 'basic' | 'intermediate' | 'advanced';
  municipalContextCustomization: boolean;
}

export interface DifficultyProgression {
  world1: 1 | 2;
  world2: 2 | 3;
  world3: 3 | 4;
  world4: 4 | 5;
  world5: 4 | 5;
}

// DevTeam AI Integration Types
export interface MultiWorldGenerationRequest {
  hubSessionId: string;
  municipalContext: MunicipalContext;
  culturalAdaptation: 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal';
  worldThemes: WorldTheme[];
  difficultyProgression: DifficultyProgression;
  professionalFocus: CompetencyType[];
  timeConstraints: WorldTimeConstraints;
}

export interface WorldTimeConstraints {
  totalSessionTime: number; // minutes
  worldTimeDistribution: number[]; // minutes per world
  breakIntervals: number[]; // Anna Svensson friendly break points
}

// Authentication Types
export interface UniqueCodeAuthentication {
  uniqueCode: string;
  hubSessionId: string;
  isValid: boolean;
  expiresAt: Date;
  municipalTenant: string;
  culturalContext: 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal';
}

// GDPR Compliance Types
export interface GDPRCompliantHubSession {
  sessionId: string;
  dataMinimization: boolean;
  consentGiven: boolean;
  retentionPeriod: number; // days
  dataPortabilityEnabled: boolean;
  erasureCapability: boolean;
  municipalDataSovereignty: boolean;
}

// Legacy Q2 Integration Types
export interface Q2CompatibilityLayer {
  q2GameState: GameState;
  q3HubContext: WorldHubState;
  migrationStrategy: 'preserve' | 'enhance' | 'extend';
  backwardsCompatibility: boolean;
}

// Common Supporting Types
export interface LearningObjective {
  objectiveId: string;
  title: {
    swedish: string;
    german: string;
    french: string;
    dutch: string;
  };
  competencyType: CompetencyType;
  measurementCriteria: string[];
  municipalRelevance: number; // 1-5
}

export interface MunicipalScenarioContext {
  scenarioType: 'budget_crisis' | 'citizen_complaint' | 'emergency_response' | 'innovation_project' | 'compliance_audit';
  stakeholders: MunicipalStakeholder[];
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  realWorldBasis: boolean;
}

export interface MunicipalStakeholder {
  role: 'citizen' | 'employee' | 'councilor' | 'manager' | 'external_partner';
  influence: number; // 1-5
  culturalContext: 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal';
}

export interface CulturalAdaptationState {
  culturalIntelligence: number; // 1-100
  adaptationPreferences: CulturalPreference[];
  crossCulturalCompetency: number; // 1-100
  municipalCulturalFit: number; // 1-100
}

export interface CulturalPreference {
  dimension: 'communication_style' | 'decision_making' | 'hierarchy' | 'time_orientation' | 'conflict_resolution';
  preference: string;
  adaptationLevel: number; // 1-5
}

export interface ProfessionalFeedbackData {
  competencyAssessment: Record<CompetencyType, number>;
  improvementRecommendations: string[];
  certificationProgress: CertificationProgress;
  careerDevelopmentSuggestions: string[];
}

export interface CertificationProgress {
  targetCertification: string;
  currentProgress: number; // 0-100%
  requiredCompetencies: CompetencyRequirement[];
  estimatedCompletionTime: number; // hours
}

// Type Guards
export function isValidWorldIndex(index: number): index is 1 | 2 | 3 | 4 | 5 {
  return index >= 1 && index <= 5;
}

export function isWorldCompleted(status: WorldCompletionStatus): boolean {
  return status.status === 'completed' && status.completionPercentage === 100;
}

export function canUnlockWorld(worldIndex: number, hubState: WorldHubState): boolean {
  const worldDef = getWorldDefinition(worldIndex);
  if (!worldDef) return false;
  
  return worldDef.prerequisiteWorlds.every(prereqIndex => {
    const prereqStatus = hubState.worldCompletionStatus.find(w => w.worldIndex === prereqIndex);
    return prereqStatus && isWorldCompleted(prereqStatus);
  });
}

// Utility Functions
export function calculateTotalScore(hubState: WorldHubState): number {
  return hubState.worldCompletionStatus.reduce((total, world) => total + world.score, 0);
}

export function calculateOverallProgress(hubState: WorldHubState): number {
  const totalProgress = hubState.worldCompletionStatus.reduce(
    (total, world) => total + world.completionPercentage, 0
  );
  return totalProgress / 5; // Average across 5 worlds
}

export function getWorldDefinition(worldIndex: number): WorldDefinition | null {
  // This will be populated with actual world definitions
  const worldDefinitions: Record<number, WorldDefinition> = {
    1: {
      worldId: 'municipal-foundations',
      worldIndex: 1,
      title: {
        swedish: 'Kommunala Grunder',
        german: 'Kommunale Grundlagen',
        french: 'Fondements Municipaux',
        dutch: 'Gemeentelijke Grondslagen'
      },
      description: {
        swedish: 'Grundläggande kommunal administration och processer',
        german: 'Grundlegende kommunale Verwaltung und Prozesse',
        french: 'Administration municipale de base et processus',
        dutch: 'Basis gemeentelijke administratie en processen'
      },
      difficulty: 1,
      estimatedDuration: 45,
      prerequisiteWorlds: [],
      municipalContext: {
        municipalityType: 'kommun',
        populationSize: 'medium',
        specializations: [],
        culturalRegion: 'nordic',
        governanceStyle: 'consensus'
      },
      primaryMechanics: ['drag_drop_workflows'],
      secondaryMechanics: ['branching_narratives'],
      learningObjectives: [],
      competencyFocus: ['municipal_administration'],
      theme: 'municipal_foundations'
    }
    // Additional world definitions will be added
  };
  
  return worldDefinitions[worldIndex] || null;
}