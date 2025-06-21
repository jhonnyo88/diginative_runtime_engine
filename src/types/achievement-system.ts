// Municipal Professional Achievement System Types
// Based on proposal-034 and integrated with completed Q2 mechanics
// Builds on character evolution system for municipal competency validation

import { MunicipalArchetypeId } from './character-archetypes';
import { MunicipalEmotionType } from './character-emotions';

export type MunicipalCompetencyLevel = 'novice' | 'competent' | 'proficient' | 'expert' | 'master';

export type AchievementCategory = 
  | 'drag_drop_workflows'
  | 'timed_challenges' 
  | 'branching_narratives'
  | 'character_relationships'
  | 'municipal_compliance'
  | 'citizen_service'
  | 'cultural_adaptation'
  | 'leadership_development'
  | 'innovation_implementation'
  | 'emergency_response';

export type CulturalContext = 'swedish' | 'german' | 'french' | 'dutch';

export interface MunicipalCompetencyFramework {
  competencyId: string;
  displayName: string;
  description: string;
  category: AchievementCategory;
  culturalContext: CulturalContext;
  levels: Record<MunicipalCompetencyLevel, CompetencyLevelDefinition>;
  assessmentCriteria: AssessmentCriteria[];
  municipalRelevance: {
    realWorldApplication: string;
    citizenServiceImpact: string;
    governmentStandards: string[];
    professionalCertificationAlignment: string;
  };
}

export interface CompetencyLevelDefinition {
  level: MunicipalCompetencyLevel;
  displayName: string;
  description: string;
  requirements: CompetencyRequirement[];
  capabilities: string[];
  municipalResponsibilities: string[];
  culturalAdaptations: Record<CulturalContext, CulturalLevelAdaptation>;
  certificationEquivalent?: string;
  timeToAchieve: string;
  prerequisites: MunicipalCompetencyLevel[];
}

export interface CompetencyRequirement {
  requirementType: 'scenario_completion' | 'performance_threshold' | 'peer_recognition' | 'time_based' | 'assessment_score';
  description: string;
  targetValue: number;
  currentValue: number;
  measurementUnit: string;
  validationMethod: string;
}

export interface CulturalLevelAdaptation {
  culture: CulturalContext;
  localizedTitle: string;
  culturalRequirements: string[];
  governmentStandards: string[];
  professionalTerminology: Record<string, string>;
  assessmentAdaptations: string[];
}

export interface AssessmentCriteria {
  criteriaId: string;
  criteriaName: string;
  weight: number; // 0-100
  measurementMethod: 'performance_score' | 'completion_rate' | 'quality_assessment' | 'peer_evaluation' | 'time_efficiency';
  passingThreshold: number;
  excellenceThreshold: number;
  municipalStandards: string[];
}

export interface ProfessionalAchievement {
  achievementId: string;
  achievementType: AchievementCategory;
  title: string;
  description: string;
  competencyLevel: MunicipalCompetencyLevel;
  culturalContext: CulturalContext;
  unlockedDate: Date;
  validatedBy: PeerValidation[];
  municipalCredentials: {
    certificationEquivalent?: string;
    governmentRecognition: boolean;
    transferableCredits: number;
    validityPeriod: string;
    renewalRequirements: string[];
  };
  achievementEvidence: AchievementEvidence[];
  impactMetrics: {
    citizenServiceImprovement: number;
    processEfficiencyGain: number;
    complianceScore: number;
    peerRating: number;
  };
}

export interface AchievementEvidence {
  evidenceType: 'scenario_completion' | 'performance_data' | 'peer_assessment' | 'supervisor_validation' | 'citizen_feedback';
  evidenceData: any;
  timestamp: Date;
  validatedBy: string;
  reliability: number; // 0-100
  municipalContext: string;
}

export interface PeerValidation {
  validatorId: string;
  validatorName: string;
  validatorArchetype: MunicipalArchetypeId;
  validationDate: Date;
  validationType: 'peer_review' | 'supervisor_approval' | 'mentor_confirmation' | 'colleague_recognition';
  validationScore: number; // 0-100
  validationComments: string;
  municipalCredibility: number; // 0-100
}

export interface ProfessionalCertificationPathway {
  pathwayId: string;
  pathwayName: string;
  description: string;
  culturalContext: CulturalContext;
  targetArchetype: MunicipalArchetypeId;
  certificationLevels: CertificationLevel[];
  totalDuration: string;
  governmentRecognition: {
    recognizedBy: string[];
    transferableCredits: number;
    careerAdvancementValue: string;
    salaryImpact: string;
  };
  prerequisites: {
    educationLevel: string;
    workExperience: string;
    municipalExperience: string;
    language: string[];
  };
}

export interface CertificationLevel {
  level: MunicipalCompetencyLevel;
  certificationName: string;
  requiredAchievements: string[];
  requiredCompetencies: string[];
  assessmentMethods: string[];
  practicalRequirements: string[];
  culturalRequirements: Record<CulturalContext, string[]>;
  maintenanceRequirements: {
    continuingEducation: string;
    practicalApplication: string;
    peerReview: string;
    recertificationPeriod: string;
  };
}

export interface PeerRecognitionSystem {
  recognitionId: string;
  recognitionType: 'peer_nomination' | 'mentor_endorsement' | 'citizen_commendation' | 'supervisor_recommendation';
  nominator: {
    nominatorId: string;
    nominatorName: string;
    nominatorArchetype: MunicipalArchetypeId;
    relationshipToNominee: string;
    municipalCredibility: number;
  };
  nominee: {
    nomineeId: string;
    nomineeName: string;
    nomineeArchetype: MunicipalArchetypeId;
  };
  recognitionCategory: AchievementCategory;
  recognitionReason: string;
  evidenceProvided: string[];
  municipalImpact: string;
  culturalAppropriateness: {
    culture: CulturalContext;
    culturalValidation: boolean;
    culturalAdaptations: string[];
  };
  validationStatus: 'pending' | 'approved' | 'rejected' | 'under_review';
  validationDate?: Date;
  impactScore: number; // 0-100
}

export interface AchievementProgress {
  characterId: string;
  currentLevel: MunicipalCompetencyLevel;
  overallProgress: number; // 0-100
  competencyProgress: Record<string, CompetencyProgress>;
  achievementsEarned: ProfessionalAchievement[];
  certificationProgress: CertificationProgress[];
  peerRecognitions: PeerRecognitionSystem[];
  nextMilestones: AchievementMilestone[];
  estimatedTimeToNextLevel: string;
  municipalServiceImpactScore: number;
}

export interface CompetencyProgress {
  competencyId: string;
  currentLevel: MunicipalCompetencyLevel;
  progress: number; // 0-100 within current level
  completedRequirements: CompetencyRequirement[];
  pendingRequirements: CompetencyRequirement[];
  lastActivity: Date;
  trendDirection: 'improving' | 'stable' | 'declining';
  culturalAdaptationProgress: Record<CulturalContext, number>;
}

export interface CertificationProgress {
  pathwayId: string;
  currentLevel: MunicipalCompetencyLevel;
  completedLevels: MunicipalCompetencyLevel[];
  pendingRequirements: string[];
  estimatedCompletionDate: Date;
  governmentRecognitionStatus: string;
  transferableCredits: number;
}

export interface AchievementMilestone {
  milestoneId: string;
  milestoneName: string;
  category: AchievementCategory;
  targetLevel: MunicipalCompetencyLevel;
  requiredActions: string[];
  estimatedDifficulty: 'easy' | 'moderate' | 'challenging' | 'expert' | 'master';
  municipalRelevance: string;
  culturalConsiderations: Record<CulturalContext, string>;
  rewardValue: {
    competencyPoints: number;
    certificationCredits: number;
    peerRecognitionWeight: number;
    municipalServiceImpact: number;
  };
}

// Cultural Achievement Variations based on European municipal systems
export interface CulturalAchievementVariations {
  swedish: {
    tjänstemannakultur: {
      consensus_building_mastery: CompetencyLevelDefinition;
      lagom_leadership: CompetencyLevelDefinition;
      democratic_participation: CompetencyLevelDefinition;
      work_life_balance_excellence: CompetencyLevelDefinition;
    };
    municipal_values: string[];
    assessment_style: string;
    recognition_patterns: string[];
  };
  german: {
    beamtentum: {
      systematic_excellence: CompetencyLevelDefinition;
      regulatory_mastery: CompetencyLevelDefinition;
      process_optimization: CompetencyLevelDefinition;
      thorough_documentation: CompetencyLevelDefinition;
    };
    municipal_values: string[];
    assessment_style: string;
    recognition_patterns: string[];
  };
  french: {
    service_public: {
      administrative_elegance: CompetencyLevelDefinition;
      citizen_service_excellence: CompetencyLevelDefinition;
      intellectual_rigor: CompetencyLevelDefinition;
      cultural_refinement: CompetencyLevelDefinition;
    };
    municipal_values: string[];
    assessment_style: string;
    recognition_patterns: string[];
  };
  dutch: {
    bestuur: {
      innovation_leadership: CompetencyLevelDefinition;
      pragmatic_efficiency: CompetencyLevelDefinition;
      direct_communication: CompetencyLevelDefinition;
      democratic_innovation: CompetencyLevelDefinition;
    };
    municipal_values: string[];
    assessment_style: string;
    recognition_patterns: string[];
  };
}

// Integration with Q2 mechanics
export interface Q2MechanicsIntegration {
  dragDropWorkflows: {
    competencyMapping: Record<string, AchievementCategory>;
    performanceThresholds: Record<MunicipalCompetencyLevel, number>;
    culturalAdaptations: Record<CulturalContext, any>;
  };
  timedChallenges: {
    emergencyResponseCompetency: MunicipalCompetencyFramework;
    timeEfficiencyThresholds: Record<MunicipalCompetencyLevel, number>;
    stressManagementAssessment: AssessmentCriteria[];
  };
  branchingNarratives: {
    decisionMakingCompetency: MunicipalCompetencyFramework;
    stakeholderManagementSkills: AssessmentCriteria[];
    ethicalDecisionMaking: AssessmentCriteria[];
  };
  characterRelationships: {
    collaborationCompetency: MunicipalCompetencyFramework;
    leadershipDevelopment: AssessmentCriteria[];
    culturalIntelligence: AssessmentCriteria[];
  };
}

export default MunicipalCompetencyFramework;