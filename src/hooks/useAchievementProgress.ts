// useAchievementProgress Hook - Municipal Professional Achievement Progress Tracking
// Integrates with character evolution system and Q2 mechanics
// Provides real-time achievement progress and competency tracking

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AchievementProgress,
  CompetencyProgress,
  ProfessionalAchievement,
  AchievementMilestone,
  PeerRecognitionSystem,
  MunicipalCompetencyLevel,
  AchievementCategory,
  CulturalContext,
  CompetencyRequirement,
  MunicipalCompetencyFramework
} from '../types/achievement-system';
import CharacterEvolutionTracker, { CharacterEvolutionSummary } from '../services/character-evolution-tracker';
import { useCulturalContext } from '../contexts/CharacterContext';

interface UseAchievementProgressReturn {
  achievementProgress: AchievementProgress | null;
  isLoading: boolean;
  error: string | null;
  updateCompetencyProgress: (
    competencyId: string,
    performanceScore: number,
    scenario: string,
    culturalContext: CulturalContext
  ) => Promise<void>;
  unlockAchievement: (achievementData: Partial<ProfessionalAchievement>) => Promise<ProfessionalAchievement>;
  addPeerRecognition: (recognition: Omit<PeerRecognitionSystem, 'recognitionId'>) => Promise<void>;
  calculateNextMilestone: () => AchievementMilestone | null;
  getMunicipalServiceImpact: () => number;
  getCompetencyTrend: (competencyId: string) => 'improving' | 'stable' | 'declining';
  resetProgress: () => void;
  exportProgressReport: () => MunicipalProgressReport;
}

interface MunicipalProgressReport {
  characterId: string;
  generatedDate: Date;
  overallLevel: MunicipalCompetencyLevel;
  overallProgress: number;
  competencyBreakdown: Record<AchievementCategory, CompetencyProgress[]>;
  achievementsSummary: {
    totalAchievements: number;
    achievementsByLevel: Record<MunicipalCompetencyLevel, number>;
    recentAchievements: ProfessionalAchievement[];
  };
  municipalServiceMetrics: {
    serviceImpactScore: number;
    citizenSatisfactionImprovement: number;
    processEfficiencyGains: number;
    complianceRating: number;
  };
  culturalAdaptation: {
    primaryCulture: CulturalContext;
    adaptationProgress: Record<CulturalContext, number>;
    culturalCompetencies: string[];
  };
  professionalDevelopment: {
    nextMilestones: AchievementMilestone[];
    estimatedTimeToNextLevel: string;
    recommendedTraining: string[];
    careerProgression: string;
  };
}

// Municipal competency frameworks by category
const municipalCompetencyFrameworks: Record<AchievementCategory, MunicipalCompetencyFramework> = {
  drag_drop_workflows: {
    competencyId: 'drag_drop_municipal_workflows',
    displayName: 'Municipal Workflow Management',
    description: 'Efficient management of municipal document workflows through digital interfaces',
    category: 'drag_drop_workflows',
    culturalContext: 'swedish',
    levels: {
      novice: {
        level: 'novice',
        displayName: 'Basic Workflow User',
        description: 'Can complete simple document routing tasks',
        requirements: [
          {
            requirementType: 'scenario_completion',
            description: 'Complete 5 basic permit processing workflows',
            targetValue: 5,
            currentValue: 0,
            measurementUnit: 'workflows',
            validationMethod: 'automatic_tracking'
          }
        ],
        capabilities: ['Basic document drag-drop', 'Simple workflow navigation'],
        municipalResponsibilities: ['Handle routine permit applications'],
        culturalAdaptations: {
          swedish: { culture: 'swedish', localizedTitle: 'Grundläggande Arbetsflödesanvändare', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          german: { culture: 'german', localizedTitle: 'Grundlegender Workflow-Benutzer', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          french: { culture: 'french', localizedTitle: 'Utilisateur de Flux de Travail de Base', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          dutch: { culture: 'dutch', localizedTitle: 'Basis Workflow Gebruiker', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] }
        },
        timeToAchieve: '1-2 weeks',
        prerequisites: []
      },
      competent: {
        level: 'competent',
        displayName: 'Competent Workflow Manager',
        description: 'Can handle multiple workflow types with good efficiency',
        requirements: [
          {
            requirementType: 'performance_threshold',
            description: 'Achieve 80% accuracy in workflow processing',
            targetValue: 80,
            currentValue: 0,
            measurementUnit: 'percentage',
            validationMethod: 'performance_analytics'
          }
        ],
        capabilities: ['Multi-step workflow management', 'Error detection and correction'],
        municipalResponsibilities: ['Process complex permit applications', 'Handle citizen inquiries'],
        culturalAdaptations: {
          swedish: { culture: 'swedish', localizedTitle: 'Kompetent Arbetsflödeshanterare', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          german: { culture: 'german', localizedTitle: 'Kompetenter Workflow-Manager', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          french: { culture: 'french', localizedTitle: 'Gestionnaire de Flux Compétent', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          dutch: { culture: 'dutch', localizedTitle: 'Competente Workflow Manager', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] }
        },
        timeToAchieve: '1-2 months',
        prerequisites: ['novice']
      },
      proficient: {
        level: 'proficient',
        displayName: 'Proficient Workflow Expert',
        description: 'Can optimize workflows and train others',
        requirements: [
          {
            requirementType: 'peer_recognition',
            description: 'Receive positive feedback from 3 colleagues',
            targetValue: 3,
            currentValue: 0,
            measurementUnit: 'recognitions',
            validationMethod: 'peer_validation'
          }
        ],
        capabilities: ['Workflow optimization', 'Training and mentoring', 'Process improvement'],
        municipalResponsibilities: ['Lead workflow improvement initiatives', 'Mentor junior staff'],
        culturalAdaptations: {
          swedish: { culture: 'swedish', localizedTitle: 'Skicklig Arbetsflödesexpert', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          german: { culture: 'german', localizedTitle: 'Qualifizierter Workflow-Experte', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          french: { culture: 'french', localizedTitle: 'Expert en Flux de Travail Qualifié', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          dutch: { culture: 'dutch', localizedTitle: 'Bekwame Workflow Expert', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] }
        },
        timeToAchieve: '3-6 months',
        prerequisites: ['competent']
      },
      expert: {
        level: 'expert',
        displayName: 'Expert Workflow Architect',
        description: 'Can design and implement new workflow systems',
        requirements: [
          {
            requirementType: 'assessment_score',
            description: 'Score 90% on workflow design assessment',
            targetValue: 90,
            currentValue: 0,
            measurementUnit: 'percentage',
            validationMethod: 'formal_assessment'
          }
        ],
        capabilities: ['System design', 'Strategic planning', 'Innovation leadership'],
        municipalResponsibilities: ['Design new municipal processes', 'Lead digital transformation'],
        culturalAdaptations: {
          swedish: { culture: 'swedish', localizedTitle: 'Expert Arbetsflödesarkitekt', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          german: { culture: 'german', localizedTitle: 'Experte Workflow-Architekt', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          french: { culture: 'french', localizedTitle: 'Expert Architecte de Flux', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          dutch: { culture: 'dutch', localizedTitle: 'Expert Workflow Architect', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] }
        },
        timeToAchieve: '6-12 months',
        prerequisites: ['proficient']
      },
      master: {
        level: 'master',
        displayName: 'Master Municipal Innovator',
        description: 'Leads municipal innovation and sets industry standards',
        requirements: [
          {
            requirementType: 'time_based',
            description: 'Demonstrate consistent expert performance for 1 year',
            targetValue: 365,
            currentValue: 0,
            measurementUnit: 'days',
            validationMethod: 'time_tracking'
          }
        ],
        capabilities: ['Industry leadership', 'Innovation strategy', 'Municipal excellence'],
        municipalResponsibilities: ['Set municipal standards', 'Lead industry innovation'],
        culturalAdaptations: {
          swedish: { culture: 'swedish', localizedTitle: 'Mästare i Kommunal Innovation', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          german: { culture: 'german', localizedTitle: 'Meister der Kommunalen Innovation', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          french: { culture: 'french', localizedTitle: 'Maître de l\'Innovation Municipale', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          dutch: { culture: 'dutch', localizedTitle: 'Meester Gemeentelijke Innovatie', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] }
        },
        timeToAchieve: '12+ months',
        prerequisites: ['expert']
      }
    },
    assessmentCriteria: [
      {
        criteriaId: 'workflow_efficiency',
        criteriaName: 'Workflow Processing Efficiency',
        weight: 40,
        measurementMethod: 'time_efficiency',
        passingThreshold: 70,
        excellenceThreshold: 90,
        municipalStandards: ['ISO_9001', 'Municipal_Service_Standards']
      },
      {
        criteriaId: 'accuracy_rate',
        criteriaName: 'Processing Accuracy',
        weight: 30,
        measurementMethod: 'quality_assessment',
        passingThreshold: 85,
        excellenceThreshold: 95,
        municipalStandards: ['Quality_Assurance_Standards']
      },
      {
        criteriaId: 'citizen_satisfaction',
        criteriaName: 'Citizen Service Quality',
        weight: 30,
        measurementMethod: 'peer_evaluation',
        passingThreshold: 80,
        excellenceThreshold: 90,
        municipalStandards: ['Citizen_Service_Charter']
      }
    ],
    municipalRelevance: {
      realWorldApplication: 'Municipal permit processing, document management, citizen service workflows',
      citizenServiceImpact: 'Faster processing times, reduced errors, improved citizen satisfaction',
      governmentStandards: ['ISO_9001', 'Municipal_Service_Standards', 'Digital_Government_Standards'],
      professionalCertificationAlignment: 'Municipal Administration Certification'
    }
  },
  
  timed_challenges: {
    competencyId: 'emergency_response_management',
    displayName: 'Emergency Response Management',
    description: 'Effective decision-making and resource management under time pressure',
    category: 'timed_challenges',
    culturalContext: 'swedish',
    levels: {
      novice: {
        level: 'novice',
        displayName: 'Emergency Response Trainee',
        description: 'Can handle basic emergency protocols',
        requirements: [
          {
            requirementType: 'scenario_completion',
            description: 'Complete 3 basic emergency scenarios within time limits',
            targetValue: 3,
            currentValue: 0,
            measurementUnit: 'scenarios',
            validationMethod: 'automatic_tracking'
          }
        ],
        capabilities: ['Basic emergency protocols', 'Time-sensitive decision making'],
        municipalResponsibilities: ['Follow emergency procedures', 'Assist in crisis response'],
        culturalAdaptations: {
          swedish: { culture: 'swedish', localizedTitle: 'Trainee Krishantering', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          german: { culture: 'german', localizedTitle: 'Notfall-Trainee', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          french: { culture: 'french', localizedTitle: 'Stagiaire Gestion d\'Urgence', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          dutch: { culture: 'dutch', localizedTitle: 'Noodrespons Trainee', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] }
        },
        timeToAchieve: '2-4 weeks',
        prerequisites: []
      },
      competent: {
        level: 'competent',
        displayName: 'Emergency Response Coordinator',
        description: 'Can coordinate multiple response activities under pressure',
        requirements: [
          {
            requirementType: 'performance_threshold',
            description: 'Achieve 75% success rate in emergency scenarios',
            targetValue: 75,
            currentValue: 0,
            measurementUnit: 'percentage',
            validationMethod: 'performance_analytics'
          }
        ],
        capabilities: ['Multi-task coordination', 'Resource allocation', 'Stress management'],
        municipalResponsibilities: ['Coordinate emergency response', 'Manage resource allocation'],
        culturalAdaptations: {
          swedish: { culture: 'swedish', localizedTitle: 'Krishanteringskoordinator', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          german: { culture: 'german', localizedTitle: 'Notfall-Koordinator', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          french: { culture: 'french', localizedTitle: 'Coordinateur d\'Urgence', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          dutch: { culture: 'dutch', localizedTitle: 'Noodrespons Coördinator', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] }
        },
        timeToAchieve: '2-3 months',
        prerequisites: ['novice']
      },
      proficient: {
        level: 'proficient',
        displayName: 'Emergency Response Leader',
        description: 'Can lead emergency response teams and make strategic decisions',
        requirements: [
          {
            requirementType: 'peer_recognition',
            description: 'Receive leadership recognition from emergency team',
            targetValue: 1,
            currentValue: 0,
            measurementUnit: 'recognitions',
            validationMethod: 'peer_validation'
          }
        ],
        capabilities: ['Team leadership', 'Strategic decision making', 'Crisis communication'],
        municipalResponsibilities: ['Lead emergency response', 'Communicate with media and public'],
        culturalAdaptations: {
          swedish: { culture: 'swedish', localizedTitle: 'Krishanteringsledare', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          german: { culture: 'german', localizedTitle: 'Notfall-Leiter', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          french: { culture: 'french', localizedTitle: 'Chef d\'Urgence', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          dutch: { culture: 'dutch', localizedTitle: 'Noodrespons Leider', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] }
        },
        timeToAchieve: '4-6 months',
        prerequisites: ['competent']
      },
      expert: {
        level: 'expert',
        displayName: 'Emergency Management Expert',
        description: 'Can design emergency response systems and protocols',
        requirements: [
          {
            requirementType: 'assessment_score',
            description: 'Score 90% on emergency management assessment',
            targetValue: 90,
            currentValue: 0,
            measurementUnit: 'percentage',
            validationMethod: 'formal_assessment'
          }
        ],
        capabilities: ['System design', 'Protocol development', 'Training program creation'],
        municipalResponsibilities: ['Design emergency protocols', 'Train emergency personnel'],
        culturalAdaptations: {
          swedish: { culture: 'swedish', localizedTitle: 'Expert Krishantering', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          german: { culture: 'german', localizedTitle: 'Notfall-Experte', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          french: { culture: 'french', localizedTitle: 'Expert Gestion d\'Urgence', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          dutch: { culture: 'dutch', localizedTitle: 'Noodrespons Expert', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] }
        },
        timeToAchieve: '8-12 months',
        prerequisites: ['proficient']
      },
      master: {
        level: 'master',
        displayName: 'Emergency Management Master',
        description: 'Leads regional emergency management and sets standards',
        requirements: [
          {
            requirementType: 'time_based',
            description: 'Lead successful regional emergency responses',
            targetValue: 2,
            currentValue: 0,
            measurementUnit: 'incidents',
            validationMethod: 'outcome_tracking'
          }
        ],
        capabilities: ['Regional leadership', 'Policy development', 'International coordination'],
        municipalResponsibilities: ['Regional emergency coordination', 'Policy and standard setting'],
        culturalAdaptations: {
          swedish: { culture: 'swedish', localizedTitle: 'Mästare Krishantering', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          german: { culture: 'german', localizedTitle: 'Notfall-Meister', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          french: { culture: 'french', localizedTitle: 'Maître Gestion d\'Urgence', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] },
          dutch: { culture: 'dutch', localizedTitle: 'Meester Noodrespons', culturalRequirements: [], governmentStandards: [], professionalTerminology: Record<string, unknown>, assessmentAdaptations: [] }
        },
        timeToAchieve: '18+ months',
        prerequisites: ['expert']
      }
    },
    assessmentCriteria: [
      {
        criteriaId: 'response_time',
        criteriaName: 'Emergency Response Time',
        weight: 40,
        measurementMethod: 'time_efficiency',
        passingThreshold: 80,
        excellenceThreshold: 95,
        municipalStandards: ['Emergency_Response_Standards']
      },
      {
        criteriaId: 'decision_quality',
        criteriaName: 'Decision Quality Under Pressure',
        weight: 35,
        measurementMethod: 'quality_assessment',
        passingThreshold: 75,
        excellenceThreshold: 90,
        municipalStandards: ['Crisis_Management_Standards']
      },
      {
        criteriaId: 'resource_efficiency',
        criteriaName: 'Resource Allocation Efficiency',
        weight: 25,
        measurementMethod: 'performance_score',
        passingThreshold: 70,
        excellenceThreshold: 85,
        municipalStandards: ['Resource_Management_Standards']
      }
    ],
    municipalRelevance: {
      realWorldApplication: 'Emergency response, crisis management, disaster coordination',
      citizenServiceImpact: 'Faster emergency response, better crisis management, improved public safety',
      governmentStandards: ['Emergency_Management_Standards', 'Crisis_Response_Protocols', 'Public_Safety_Standards'],
      professionalCertificationAlignment: 'Emergency Management Certification'
    }
  },

  // Simplified implementations for other categories
  branching_narratives: Record<string, unknown> as MunicipalCompetencyFramework,
  character_relationships: Record<string, unknown> as MunicipalCompetencyFramework,
  municipal_compliance: Record<string, unknown> as MunicipalCompetencyFramework,
  citizen_service: Record<string, unknown> as MunicipalCompetencyFramework,
  cultural_adaptation: Record<string, unknown> as MunicipalCompetencyFramework,
  leadership_development: Record<string, unknown> as MunicipalCompetencyFramework,
  innovation_implementation: Record<string, unknown> as MunicipalCompetencyFramework,
  emergency_response: Record<string, unknown> as MunicipalCompetencyFramework
};

  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { culturalContext } = useCulturalContext();

  // Initialize achievement progress
  useEffect(() => {
    const _initializeProgress = async () => {
      try {
        setIsLoading(true);
        
        // Initialize with default competency progress
        const initialProgress: AchievementProgress = {
          characterId,
          currentLevel: 'novice',
          overallProgress: 0,
          competencyProgress: initializeCompetencyProgress(),
          achievementsEarned: [],
          certificationProgress: [],
          peerRecognitions: [],
          nextMilestones: generateInitialMilestones(),
          estimatedTimeToNextLevel: '2-4 weeks with consistent practice',
          municipalServiceImpactScore: 50
        };

        setAchievementProgress(initialProgress);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize achievement progress');
      } finally {
        setIsLoading(false);
      }
    };

    initializeProgress();
  }, [characterId]);

  // Initialize competency progress for all categories
  const _initializeCompetencyProgress = (): Record<string, CompetencyProgress> => {
    const competencyProgress: Record<string, CompetencyProgress> = {};
    
    Object.keys(municipalCompetencyFrameworks).forEach(category => {
      competencyProgress[competencyId] = {
        competencyId,
        currentLevel: 'novice',
        progress: 0,
        completedRequirements: [],
        pendingRequirements: [],
        lastActivity: new Date(),
        trendDirection: 'stable',
        culturalAdaptationProgress: {
          swedish: 0,
          german: 0,
          french: 0,
          dutch: 0
        }
      };
    });
    
    return competencyProgress;
  };

  // Generate initial milestones
  const _generateInitialMilestones = (): AchievementMilestone[] => {
    return [
      {
        milestoneId: 'first_workflow_mastery',
        milestoneName: 'First Workflow Mastery',
        category: 'drag_drop_workflows',
        targetLevel: 'competent',
        requiredActions: [
          'Complete 5 permit processing workflows',
          'Achieve 80% accuracy rate',
          'Process workflows within time limits'
        ],
        estimatedDifficulty: 'easy',
        municipalRelevance: 'Foundation skill for municipal document management',
        culturalConsiderations: {
          swedish: 'Focus on collaborative workflow approaches',
          german: 'Emphasis on systematic and thorough processing',
          french: 'Elegant and refined workflow management',
          dutch: 'Direct and efficient workflow handling'
        },
        rewardValue: {
          competencyPoints: 25,
          certificationCredits: 5,
          peerRecognitionWeight: 10,
          municipalServiceImpact: 15
        }
      },
      {
        milestoneId: 'emergency_response_readiness',
        milestoneName: 'Emergency Response Readiness',
        category: 'timed_challenges',
        targetLevel: 'competent',
        requiredActions: [
          'Complete 3 emergency scenarios',
          'Demonstrate calm under pressure',
          'Make effective decisions within time constraints'
        ],
        estimatedDifficulty: 'moderate',
        municipalRelevance: 'Essential for municipal emergency preparedness',
        culturalConsiderations: {
          swedish: 'Consensus-building even under time pressure',
          german: 'Systematic emergency response protocols',
          french: 'Refined crisis communication',
          dutch: 'Direct and practical emergency actions'
        },
        rewardValue: {
          competencyPoints: 30,
          certificationCredits: 8,
          peerRecognitionWeight: 15,
          municipalServiceImpact: 20
        }
      }
    ];
  };

  // Update competency progress based on performance
