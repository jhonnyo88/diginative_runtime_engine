/**
 * TASK-HD-014: Municipal Achievement Engine
 * Enhanced achievement state management based on Game Designer's task-gd-009 specifications
 * Replaces intrusive popups with meaningful municipal milestone recognition
 */

// Simple types to avoid circular imports
export interface MunicipalAchievement {
  id: string;
  title: string;
  description: string;
  municipalValue: string;
  nextSteps?: string;
}

export interface MunicipalAchievementCriteria {
  id: string;
  type: 'competence_based' | 'performance_based' | 'time_based' | 'compliance_based';
  threshold: {
    scorePercentage?: number; // e.g., 90% for Excellence
    timeEfficiency?: number; // e.g., under 7 minutes for Efficiency Expert
    correctAnswers?: number; // e.g., 100% correct for Compliance Champion
    completionRate?: number; // e.g., 100% sections completed
  };
  municipalValue: {
    workplaceRelevance: string; // How this achievement applies to municipal work
    competenceDevelopment: string; // What competence this represents
    institutionalBenefit: string; // Value for municipal organization
    careerAdvancement: string; // Career development support
  };
  triggerConditions: {
    contextualEvaluation: boolean; // Evaluate at natural break points
    batchProcessing: boolean; // Process with other achievements at completion
    userControlled: boolean; // Achievement recognition triggered by user readiness
    professionalTiming: boolean; // Recognition timing appropriate for municipal workflow
  };
}

export interface MunicipalAchievementState {
  achievements: {
    earned: MunicipalAchievement[];
    available: MunicipalAchievement[];
    inProgress: { [achievementId: string]: number }; // Progress percentage
  };
  competencies: {
    developed: string[];
    certifications: string[];
    municipalQualifications: string[];
  };
  milestones: {
    reached: string[];
    upcoming: string[];
    professionalGoals: string[];
  };
  session: {
    startTime: Date;
    lastAchievement?: Date;
    toastQueue: MunicipalAchievement[];
    contextualRecognition: boolean;
  };
}

export interface MunicipalAchievementEngineConfig {
  municipalEntity: 'malmö' | 'stockholm' | 'göteborg' | 'berlin' | 'paris' | 'amsterdam';
  culturalContext: 'swedish' | 'german' | 'french' | 'dutch';
  userProfile: {
    name: string;
    department: string;
    role: string;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };
  recognitionSettings: {
    enableToastNotifications: boolean;
    enableSubtleIndicators: boolean;
    enablePortfolio: boolean;
    toastTimeout: number; // milliseconds
  };
  accessibilitySettings: {
    reducedMotion: boolean;
    screenReaderFriendly: boolean;
    keyboardNavigation: boolean;
    highContrast: boolean;
  };
}

export class MunicipalAchievementEngine {
  private state: MunicipalAchievementState;
  private config: MunicipalAchievementEngineConfig;
  private criteria: { [achievementId: string]: MunicipalAchievementCriteria };
  private listeners: { [event: string]: Function[] } = {};

  constructor(config: MunicipalAchievementEngineConfig) {
    this.config = config;
    this.state = this.initializeState();
    this.criteria = this.initializeCriteria();
  }

  private initializeState(): MunicipalAchievementState {
    return {
      achievements: {
        earned: [],
        available: [],  // Will be populated by achievement engine
        inProgress: {}
      },
      competencies: {
        developed: [],
        certifications: [],
        municipalQualifications: []
      },
      milestones: {
        reached: [],
        upcoming: ['gdpr_basics', 'data_handling', 'incident_response', 'gdpr_expert'],
        professionalGoals: []
      },
      session: {
        startTime: new Date(),
        toastQueue: [],
        contextualRecognition: true
      }
    };
  }

  private initializeCriteria(): { [achievementId: string]: MunicipalAchievementCriteria } {
    return {
      gdpr_specialist: {
        id: 'gdpr_specialist',
        type: 'competence_based',
        threshold: {
          scorePercentage: 85,
          correctAnswers: 90
        },
        municipalValue: {
          workplaceRelevance: 'Kan hantera personuppgifter enligt GDPR i dagligt kommunalt arbete',
          competenceDevelopment: 'Utvecklad förståelse för dataskydd och personuppgiftshantering',
          institutionalBenefit: 'Bidrar till kommunens GDPR-efterlevnad och juridiska säkerhet',
          careerAdvancement: 'Kvalificerar för roller med dataansvar och mentorskap av kollegor'
        },
        triggerConditions: {
          contextualEvaluation: true,
          batchProcessing: true,
          userControlled: false,
          professionalTiming: true
        }
      },
      compliance_champion: {
        id: 'compliance_champion',
        type: 'performance_based',
        threshold: {
          correctAnswers: 100,
          scorePercentage: 95
        },
        municipalValue: {
          workplaceRelevance: 'Kan leda GDPR-efterlevnadsinitiativ på avdelningen',
          competenceDevelopment: 'Expertkunskap inom regelefterlevnad och juridisk säkerhet',
          institutionalBenefit: 'Minskar juridiska risker och stärker kommunens trovärdighet',
          careerAdvancement: 'Positionerar för ledande roller inom compliance och kvalitet'
        },
        triggerConditions: {
          contextualEvaluation: true,
          batchProcessing: false, // Important achievement - immediate recognition
          userControlled: false,
          professionalTiming: true
        }
      },
      efficiency_expert: {
        id: 'efficiency_expert',
        type: 'time_based',
        threshold: {
          timeEfficiency: 420000, // 7 minutes in milliseconds
          completionRate: 100
        },
        municipalValue: {
          workplaceRelevance: 'Demonstrerar förmåga att effektivt använda arbetstid för kompetensutveckling',
          competenceDevelopment: 'Utvecklad förmåga för snabb inlärning och tillämpning',
          institutionalBenefit: 'Bidrar till effektiv användning av utbildningsresurser',
          careerAdvancement: 'Visar engagemang för kontinuerlig professionell utveckling'
        },
        triggerConditions: {
          contextualEvaluation: true,
          batchProcessing: true,
          userControlled: false,
          professionalTiming: true
        }
      },
      municipal_certified: {
        id: 'municipal_certified',
        type: 'compliance_based',
        threshold: {
          completionRate: 100,
          scorePercentage: 80
        },
        municipalValue: {
          workplaceRelevance: 'Officiell kommunal certifiering för GDPR-kompetens',
          competenceDevelopment: 'Fullständig behärskning av kommunal GDPR-tillämpning',
          institutionalBenefit: 'Stärker kommunens digitala transformation och medborgarförtroende',
          careerAdvancement: 'Erkänd kompetens som öppnar möjligheter för specialistroller'
        },
        triggerConditions: {
          contextualEvaluation: false, // Always show this important certification
          batchProcessing: false,
          userControlled: false,
          professionalTiming: false // Show immediately when earned
        }
      }
    };
  }

  // Event system for achievement recognition
  public addEventListener(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public removeEventListener(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data: Record<string, unknown>): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Contextual achievement evaluation
  public evaluateAchievements(sessionData: {
    totalScore: number;
    maxScore: number;
    timeSpent: number; // milliseconds
    correctAnswers: number;
    totalQuestions: number;
    sectionsCompleted: number;
    totalSections: number;
  }): MunicipalAchievement[] {
    const newAchievements: MunicipalAchievement[] = [];
    const scorePercentage = (sessionData.totalScore / sessionData.maxScore) * 100;
    const correctPercentage = (sessionData.correctAnswers / sessionData.totalQuestions) * 100;
    const completionRate = (sessionData.sectionsCompleted / sessionData.totalSections) * 100;

    // Evaluate each achievement criteria
    Object.values(this.criteria).forEach(criteria => {
      if (this.isAchievementEarned(criteria.id)) return; // Already earned

      let achieved = false;

      switch (criteria.type) {
        case 'competence_based':
          achieved = scorePercentage >= (criteria.threshold.scorePercentage || 0) &&
                    correctPercentage >= (criteria.threshold.correctAnswers || 0);
          break;

        case 'performance_based':
          achieved = correctPercentage >= (criteria.threshold.correctAnswers || 0) &&
                    scorePercentage >= (criteria.threshold.scorePercentage || 0);
          break;

        case 'time_based':
          achieved = sessionData.timeSpent <= (criteria.threshold.timeEfficiency || Infinity) &&
                    completionRate >= (criteria.threshold.completionRate || 0);
          break;

        case 'compliance_based':
          achieved = completionRate >= (criteria.threshold.completionRate || 0) &&
                    scorePercentage >= (criteria.threshold.scorePercentage || 0);
          break;
      }

      if (achieved) {
        const achievement = this.createMunicipalAchievement(criteria.id);
        if (achievement) {
          newAchievements.push(achievement);
          this.awardAchievement(achievement);
        }
      }
    });

    return newAchievements;
  }

  private createMunicipalAchievement(achievementId: string): MunicipalAchievement | null {
    // Map achievement IDs to the correct keys
    const achievementKeyMap = {
      'gdpr_specialist': 'GDPR_SPECIALIST',
      'compliance_champion': 'COMPLIANCE_CHAMPION', 
      'efficiency_expert': 'EFFICIENCY_EXPERT',
      'municipal_certified': 'MUNICIPAL_CERTIFIED'
    };

    const achievementKey = achievementKeyMap[achievementId as keyof typeof achievementKeyMap];
    if (!achievementKey) return null;

    // Create achievement from criteria
    const baseAchievement = {
      id: achievementId,
      title: `Achievement: ${achievementId}`,
      description: 'Municipal achievement earned',
      municipalValue: 'Workplace competence developed'
    };
    if (!baseAchievement) return null;

    const criteria = this.criteria[achievementId];
    if (!criteria) return null;

    // Create culturally adapted achievement
    return {
      ...baseAchievement,
      municipalValue: criteria.municipalValue.institutionalBenefit,
      nextSteps: this.getNextStepsForAchievement(achievementId)
    };
  }

  private getNextStepsForAchievement(achievementId: string): string {
    const nextSteps = {
      gdpr_specialist: 'Tillämpa GDPR-kunskaper i dina dagliga arbetsuppgifter',
      compliance_champion: 'Dela din kunskap med kollegor och stöd teamets utveckling',
      efficiency_expert: 'Kontakta din chef för att diskutera tillämpning på arbetsplatsen',
      municipal_certified: 'Ladda ner ditt certifikat och uppdatera din kompetensprofil'
    };

    return nextSteps[achievementId as keyof typeof nextSteps] || 'Diskutera tillämpning med din närmaste chef';
  }

  private awardAchievement(achievement: MunicipalAchievement): void {
    // Add to earned achievements
    this.state.achievements.earned.push(achievement);
    
    // Remove from available
    this.state.achievements.available = this.state.achievements.available.filter(
      a => a.id !== achievement.id
    );

    // Add competency
    const criteria = this.criteria[achievement.id];
    if (criteria) {
      this.state.competencies.developed.push(criteria.municipalValue.competenceDevelopment);
    }

    // Queue for toast notification if enabled
    if (this.config.recognitionSettings.enableToastNotifications) {
      const shouldShowToast = this.shouldShowToastForAchievement(achievement.id);
      if (shouldShowToast) {
        this.state.session.toastQueue.push(achievement);
      }
    }

    // Update session
    this.state.session.lastAchievement = new Date();

    // Emit achievement event
    this.emit('achievementEarned', {
      achievement,
      criteria,
      timestamp: new Date(),
      userProfile: this.config.userProfile,
      municipalContext: {
        entity: this.config.municipalEntity,
        culturalContext: this.config.culturalContext
      }
    });
  }

  private shouldShowToastForAchievement(achievementId: string): boolean {
    const criteria = this.criteria[achievementId];
    if (!criteria) return false;

    // Critical achievements always show toast
    const criticalAchievements = ['municipal_certified', 'compliance_champion'];
    if (criticalAchievements.includes(achievementId)) {
      return true;
    }

    // Check trigger conditions
    if (!criteria.triggerConditions.contextualEvaluation) {
      return true; // Show immediately
    }

    // Context-appropriate timing
    return criteria.triggerConditions.professionalTiming;
  }

  // Toast queue management
  public getNextToastNotification(): MunicipalAchievement | null {
    return this.state.session.toastQueue.shift() || null;
  }

  public hasQueuedToasts(): boolean {
    return this.state.session.toastQueue.length > 0;
  }

  // Progress tracking
  public updateAchievementProgress(achievementId: string, progress: number): void {
    this.state.achievements.inProgress[achievementId] = Math.min(100, Math.max(0, progress));
    
    this.emit('achievementProgress', {
      achievementId,
      progress,
      timestamp: new Date()
    });
  }

  // State queries
  public isAchievementEarned(achievementId: string): boolean {
    return this.state.achievements.earned.some(a => a.id === achievementId);
  }

  public getEarnedAchievements(): MunicipalAchievement[] {
    return [...this.state.achievements.earned];
  }

  public getDevelopedCompetencies(): string[] {
    return [...this.state.competencies.developed];
  }

  public getAchievementProgress(achievementId: string): number {
    return this.state.achievements.inProgress[achievementId] || 0;
  }

  public getState(): MunicipalAchievementState {
    return { ...this.state };
  }

  // Municipal reporting and export
  public generateMunicipalReport(): {
    participantInfo: Record<string, unknown>;
    achievementSummary: Record<string, unknown>;
    competencyDevelopment: Record<string, unknown>;
    municipalValue: Record<string, unknown>;
    exportTimestamp: Date;
  } {
    return {
      participantInfo: {
        name: this.config.userProfile.name,
        department: this.config.userProfile.department,
        role: this.config.userProfile.role,
        municipality: this.config.municipalEntity
      },
      achievementSummary: {
        totalEarned: this.state.achievements.earned.length,
        criticalAchievements: this.state.achievements.earned.filter(a => 
          ['municipal_certified', 'compliance_champion'].includes(a.id)
        ),
        competencyMilestones: this.state.achievements.earned.map(a => ({
          achievement: a.title,
          competency: this.criteria[a.id]?.municipalValue.competenceDevelopment
        }))
      },
      competencyDevelopment: {
        developed: this.state.competencies.developed,
        certifications: this.state.competencies.certifications,
        workplaceApplications: this.state.achievements.earned.map(a => 
          this.criteria[a.id]?.municipalValue.workplaceRelevance
        ).filter(Boolean)
      },
      municipalValue: {
        institutionalBenefits: this.state.achievements.earned.map(a =>
          this.criteria[a.id]?.municipalValue.institutionalBenefit
        ).filter(Boolean),
        careerAdvancement: this.state.achievements.earned.map(a =>
          this.criteria[a.id]?.municipalValue.careerAdvancement
        ).filter(Boolean)
      },
      exportTimestamp: new Date()
    };
  }

  // Reset and cleanup
  public reset(): void {
    this.state = this.initializeState();
    this.emit('engineReset', { timestamp: new Date() });
  }

  public cleanup(): void {
    this.listeners = {};
  }
}

// Factory function for creating municipal achievement engines
export const createMunicipalAchievementEngine = (
  config: Partial<MunicipalAchievementEngineConfig>
): MunicipalAchievementEngine => {
  const defaultConfig: MunicipalAchievementEngineConfig = {
    municipalEntity: 'malmö',
    culturalContext: 'swedish',
    userProfile: {
      name: 'Municipal Employee',
      department: 'IT',
      role: 'Specialist',
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

  const mergedConfig = { ...defaultConfig, ...config };
  return new MunicipalAchievementEngine(mergedConfig);
};