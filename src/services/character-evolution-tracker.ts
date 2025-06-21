// Character Evolution Tracker - Integration with Game State Manager
// Tracks character development and evolution through municipal scenarios
// Integrates with existing game-state-manager.tsx for persistence

import { GameState, GameResults } from './game-state-manager';
import { MunicipalArchetypeId, MunicipalCharacterArchetype } from '../types/character-archetypes';
import { MunicipalEmotionType } from '../types/character-emotions';
import { CharacterRelationship, RelationshipMetrics } from './character-relationship-manager';

export interface CharacterGrowthMetrics {
  characterId: string;
  archetype: MunicipalArchetypeId;
  initialCompetenceLevel: number;
  currentCompetenceLevel: number;
  competenceGrowthRate: number;
  skillDevelopmentAreas: Array<{
    skillArea: string;
    initialLevel: number;
    currentLevel: number;
    improvementRate: number;
    municipalRelevance: string;
  }>;
  professionalMilestones: Array<{
    milestoneId: string;
    achievementDate: Date;
    description: string;
    municipalImpact: string;
    skillsGained: string[];
  }>;
}

export interface RelationshipProgressMetrics {
  relationshipId: string;
  initialRelationshipStrength: number;
  currentRelationshipStrength: number;
  relationshipGrowthTrend: 'improving' | 'stable' | 'declining';
  collaborationSuccessRate: number;
  municipalServiceSynergy: number;
  evolutionMilestones: Array<{
    milestoneDate: Date;
    strengthChange: number;
    triggerEvent: string;
    municipalContext: string;
  }>;
}

export interface MunicipalCompetenceGrowth {
  competenceArea: string;
  initialAssessment: number; // 0-100
  currentLevel: number; // 0-100
  growthTrajectory: 'rapid' | 'steady' | 'gradual' | 'stagnant';
  practicalApplications: Array<{
    scenarioType: string;
    applicationDate: Date;
    successLevel: number;
    citizenImpact: string;
    learningOutcome: string;
  }>;
  culturalAdaptation: {
    culture: 'swedish' | 'german' | 'french' | 'dutch';
    culturalCompetenceLevel: number;
    adaptationProgress: string[];
  };
}

export interface ProfessionalAchievements {
  achievementId: string;
  achievementType: 'municipal_expertise' | 'citizen_service_excellence' | 'collaboration_mastery' | 'innovation_leadership';
  unlockDate: Date;
  requirements: string[];
  municipalBenefit: string;
  citizenServiceImpact: string;
  archetype: MunicipalArchetypeId;
  culturalContext: 'swedish' | 'german' | 'french' | 'dutch';
}

export interface CharacterEvolution {
  characterId: string;
  evolutionStartDate: Date;
  lastEvolutionUpdate: Date;
  characterGrowth: CharacterGrowthMetrics;
  relationshipProgress: RelationshipProgressMetrics[];
  municipalCompetenceGrowth: MunicipalCompetenceGrowth[];
  professionalAchievements: ProfessionalAchievements[];
  evolutionTrajectory: {
    projectedGrowthPath: string;
    nextMilestones: string[];
    municipalCareerDevelopment: string;
    estimatedTimeToMastery: string;
  };
}

// Enhanced GameState interface with character evolution
export interface CharacterEnhancedGameState extends GameState {
  characterEvolution: {
    activeCharacters: string[];
    characterEvolutions: CharacterEvolution[];
    relationshipEvolutions: RelationshipProgressMetrics[];
    municipalServiceImpactScore: number;
    culturalAdaptationProgress: Record<string, number>;
  };
}

export class CharacterEvolutionTracker {
  private characterEvolutions: Map<string, CharacterEvolution> = new Map();
  private municipalCompetenceMatrix: Map<string, MunicipalCompetenceGrowth[]> = new Map();
  private achievementUnlockThresholds: Map<string, number> = new Map();

  constructor() {
    this.initializeEvolutionTracker();
  }

  private initializeEvolutionTracker(): void {
    // Initialize achievement thresholds based on municipal professional standards
    this.achievementUnlockThresholds.set('municipal_expertise', 75);
    this.achievementUnlockThresholds.set('citizen_service_excellence', 85);
    this.achievementUnlockThresholds.set('collaboration_mastery', 70);
    this.achievementUnlockThresholds.set('innovation_leadership', 80);
    
    console.log('Character Evolution Tracker initialized with municipal professional standards');
  }

  // Start tracking character evolution
  startCharacterEvolution(
    characterId: string,
    archetype: MunicipalArchetypeId,
    initialCompetenceLevel: number,
    culturalContext: 'swedish' | 'german' | 'french' | 'dutch'
  ): CharacterEvolution {
    const evolution: CharacterEvolution = {
      characterId,
      evolutionStartDate: new Date(),
      lastEvolutionUpdate: new Date(),
      characterGrowth: {
        characterId,
        archetype,
        initialCompetenceLevel,
        currentCompetenceLevel: initialCompetenceLevel,
        competenceGrowthRate: 0,
        skillDevelopmentAreas: this.initializeSkillAreas(archetype),
        professionalMilestones: []
      },
      relationshipProgress: [],
      municipalCompetenceGrowth: this.initializeMunicipalCompetences(culturalContext),
      professionalAchievements: [],
      evolutionTrajectory: {
        projectedGrowthPath: this.calculateProjectedGrowthPath(archetype, initialCompetenceLevel),
        nextMilestones: this.getNextMilestones(archetype, initialCompetenceLevel),
        municipalCareerDevelopment: this.getMunicipalCareerPath(archetype),
        estimatedTimeToMastery: this.estimateTimeToMastery(archetype, initialCompetenceLevel)
      }
    };

    this.characterEvolutions.set(characterId, evolution);
    return evolution;
  }

  // Track character growth through municipal scenarios
  trackCharacterGrowth(
    characterId: string,
    scenarioType: string,
    performanceScore: number, // 0-100
    skillsApplied: string[],
    municipalContext: string,
    citizenImpact: string
  ): CharacterGrowthMetrics {
    const evolution = this.characterEvolutions.get(characterId);
    if (!evolution) {
      throw new Error(`Character evolution not found: ${characterId}`);
    }

    // Update competence level based on performance
    const competenceIncrease = this.calculateCompetenceIncrease(performanceScore, skillsApplied);
    evolution.characterGrowth.currentCompetenceLevel = Math.min(100, 
      evolution.characterGrowth.currentCompetenceLevel + competenceIncrease
    );

    // Update growth rate
    evolution.characterGrowth.competenceGrowthRate = this.calculateGrowthRate(evolution);

    // Update skill development areas
    this.updateSkillDevelopmentAreas(evolution, skillsApplied, performanceScore);

    // Check for professional milestones
    this.checkProfessionalMilestones(evolution, scenarioType, municipalContext);

    // Update municipal competence growth
    this.updateMunicipalCompetenceGrowth(evolution, scenarioType, performanceScore, citizenImpact);

    // Check for achievement unlocks
    this.checkAchievementUnlocks(evolution);

    evolution.lastEvolutionUpdate = new Date();
    this.characterEvolutions.set(characterId, evolution);

    return evolution.characterGrowth;
  }

  // Track relationship evolution impact on character development
  trackRelationshipEvolutionImpact(
    characterId: string,
    relationshipMetrics: RelationshipMetrics,
    municipalServiceAlignment: number
  ): RelationshipProgressMetrics {
    const evolution = this.characterEvolutions.get(characterId);
    if (!evolution) {
      throw new Error(`Character evolution not found: ${characterId}`);
    }

    // Find or create relationship progress entry
    let relationshipProgress = evolution.relationshipProgress.find(
      progress => progress.relationshipId === relationshipMetrics.relationshipId
    );

    if (!relationshipProgress) {
      relationshipProgress = {
        relationshipId: relationshipMetrics.relationshipId,
        initialRelationshipStrength: relationshipMetrics.strength,
        currentRelationshipStrength: relationshipMetrics.strength,
        relationshipGrowthTrend: relationshipMetrics.recentInteractionTrend,
        collaborationSuccessRate: relationshipMetrics.collaborationSuccess,
        municipalServiceSynergy: municipalServiceAlignment,
        evolutionMilestones: []
      };
      evolution.relationshipProgress.push(relationshipProgress);
    } else {
      // Update existing relationship progress
      const strengthChange = relationshipMetrics.strength - relationshipProgress.currentRelationshipStrength;
      relationshipProgress.currentRelationshipStrength = relationshipMetrics.strength;
      relationshipProgress.relationshipGrowthTrend = relationshipMetrics.recentInteractionTrend;
      relationshipProgress.collaborationSuccessRate = relationshipMetrics.collaborationSuccess;
      relationshipProgress.municipalServiceSynergy = municipalServiceAlignment;

      // Add evolution milestone if significant change
      if (Math.abs(strengthChange) >= 10) {
        relationshipProgress.evolutionMilestones.push({
          milestoneDate: new Date(),
          strengthChange,
          triggerEvent: 'relationship_evolution',
          municipalContext: 'ongoing_municipal_collaboration'
        });
      }
    }

    // Impact relationship growth on character competence
    this.applyRelationshipGrowthToCharacterCompetence(evolution, relationshipProgress);

    evolution.lastEvolutionUpdate = new Date();
    this.characterEvolutions.set(characterId, evolution);

    return relationshipProgress;
  }

  // Integrate with existing game state manager
  enhanceGameStateWithCharacterEvolution(gameState: GameState): CharacterEnhancedGameState {
    const characterEvolutionData = {
      activeCharacters: Array.from(this.characterEvolutions.keys()),
      characterEvolutions: Array.from(this.characterEvolutions.values()),
      relationshipEvolutions: this.getAllRelationshipEvolutions(),
      municipalServiceImpactScore: this.calculateMunicipalServiceImpactScore(),
      culturalAdaptationProgress: this.calculateCulturalAdaptationProgress()
    };

    return {
      ...gameState,
      characterEvolution: characterEvolutionData
    };
  }

  // Restore character evolution from saved game state
  restoreCharacterEvolutionFromGameState(enhancedGameState: CharacterEnhancedGameState): void {
    this.characterEvolutions.clear();
    
    enhancedGameState.characterEvolution.characterEvolutions.forEach(evolution => {
      this.characterEvolutions.set(evolution.characterId, evolution);
    });
    
    console.log(`Restored character evolution for ${this.characterEvolutions.size} characters`);
  }

  // Get character evolution summary
  getCharacterEvolutionSummary(characterId: string): CharacterEvolutionSummary {
    const evolution = this.characterEvolutions.get(characterId);
    if (!evolution) {
      throw new Error(`Character evolution not found: ${characterId}`);
    }

    return {
      characterId,
      currentCompetenceLevel: evolution.characterGrowth.currentCompetenceLevel,
      competenceGrowth: evolution.characterGrowth.currentCompetenceLevel - evolution.characterGrowth.initialCompetenceLevel,
      totalAchievements: evolution.professionalAchievements.length,
      relationshipCount: evolution.relationshipProgress.length,
      municipalServiceImpact: this.calculateIndividualMunicipalServiceImpact(evolution),
      nextMilestone: evolution.evolutionTrajectory.nextMilestones[0] || 'Municipal Excellence',
      timeToNextMilestone: this.estimateTimeToNextMilestone(evolution),
      evolutionTrajectory: evolution.evolutionTrajectory.projectedGrowthPath
    };
  }

  // Private helper methods
  private initializeSkillAreas(archetype: MunicipalArchetypeId): Array<any> {
    // Initialize skill areas based on archetype
    const commonSkills = [
      { skillArea: 'citizen_service', initialLevel: 50, currentLevel: 50, improvementRate: 0, municipalRelevance: 'direct_citizen_interaction' },
      { skillArea: 'municipal_processes', initialLevel: 40, currentLevel: 40, improvementRate: 0, municipalRelevance: 'administrative_efficiency' },
      { skillArea: 'collaboration', initialLevel: 45, currentLevel: 45, improvementRate: 0, municipalRelevance: 'team_coordination' }
    ];

    // Add archetype-specific skills
    const archetypeSpecificSkills = this.getArchetypeSpecificSkills(archetype);
    return [...commonSkills, ...archetypeSpecificSkills];
  }

  private getArchetypeSpecificSkills(archetype: MunicipalArchetypeId): Array<any> {
    const archetypeSkills = {
      'frontline_professional': [
        { skillArea: 'conflict_resolution', initialLevel: 60, currentLevel: 60, improvementRate: 0, municipalRelevance: 'citizen_problem_solving' }
      ],
      'strategic_leader': [
        { skillArea: 'strategic_planning', initialLevel: 70, currentLevel: 70, improvementRate: 0, municipalRelevance: 'municipal_leadership' }
      ],
      'compliance_guardian': [
        { skillArea: 'regulatory_knowledge', initialLevel: 80, currentLevel: 80, improvementRate: 0, municipalRelevance: 'legal_compliance' }
      ],
      'change_agent': [
        { skillArea: 'innovation_management', initialLevel: 75, currentLevel: 75, improvementRate: 0, municipalRelevance: 'digital_transformation' }
      ]
    };

    return archetypeSkills[archetype] || [];
  }

  private initializeMunicipalCompetences(culture: 'swedish' | 'german' | 'french' | 'dutch'): MunicipalCompetenceGrowth[] {
    return [
      {
        competenceArea: 'citizen_service_excellence',
        initialAssessment: 50,
        currentLevel: 50,
        growthTrajectory: 'steady',
        practicalApplications: [],
        culturalAdaptation: {
          culture,
          culturalCompetenceLevel: 60,
          adaptationProgress: []
        }
      },
      {
        competenceArea: 'municipal_governance_understanding',
        initialAssessment: 45,
        currentLevel: 45,
        growthTrajectory: 'gradual',
        practicalApplications: [],
        culturalAdaptation: {
          culture,
          culturalCompetenceLevel: 55,
          adaptationProgress: []
        }
      }
    ];
  }

  private calculateProjectedGrowthPath(archetype: MunicipalArchetypeId, initialLevel: number): string {
    if (initialLevel < 30) return 'foundation_building_to_competent_practitioner';
    if (initialLevel < 60) return 'competent_practitioner_to_municipal_expert';
    if (initialLevel < 80) return 'municipal_expert_to_strategic_leader';
    return 'strategic_leader_to_municipal_innovator';
  }

  private getNextMilestones(archetype: MunicipalArchetypeId, currentLevel: number): string[] {
    if (currentLevel < 30) return ['Basic Municipal Competency', 'Citizen Service Proficiency'];
    if (currentLevel < 60) return ['Municipal Process Mastery', 'Collaborative Excellence'];
    if (currentLevel < 80) return ['Strategic Municipal Leadership', 'Innovation Implementation'];
    return ['Municipal Innovation Leadership', 'Cross-Cultural Excellence'];
  }

  private getMunicipalCareerPath(archetype: MunicipalArchetypeId): string {
    const careerPaths = {
      'frontline_professional': 'Citizen Service Representative → Senior Service Coordinator → Department Service Manager',
      'strategic_leader': 'Department Head → Senior Municipal Leader → Municipal Director',
      'compliance_guardian': 'Legal Advisor → Senior Compliance Officer → Municipal Legal Director',
      'change_agent': 'Innovation Specialist → Digital Transformation Lead → Municipal Innovation Director'
    };
    return careerPaths[archetype] || 'Municipal Professional → Senior Municipal Professional → Municipal Leader';
  }

  private estimateTimeToMastery(archetype: MunicipalArchetypeId, currentLevel: number): string {
    const remainingLevels = 100 - currentLevel;
    const estimatedMonths = Math.round(remainingLevels / 2); // Rough estimate: 2 levels per month
    return `${estimatedMonths} months to municipal mastery`;
  }

  private calculateCompetenceIncrease(performanceScore: number, skillsApplied: string[]): number {
    const baseIncrease = performanceScore / 20; // Max 5 points for perfect performance
    const skillBonus = skillsApplied.length * 0.5; // Bonus for applying multiple skills
    return Math.min(10, baseIncrease + skillBonus); // Cap at 10 points per scenario
  }

  private calculateGrowthRate(evolution: CharacterEvolution): number {
    const totalGrowth = evolution.characterGrowth.currentCompetenceLevel - evolution.characterGrowth.initialCompetenceLevel;
    const timeElapsed = new Date().getTime() - evolution.evolutionStartDate.getTime();
    const daysElapsed = timeElapsed / (1000 * 60 * 60 * 24);
    return daysElapsed > 0 ? totalGrowth / daysElapsed : 0;
  }

  private updateSkillDevelopmentAreas(evolution: CharacterEvolution, skillsApplied: string[], performanceScore: number): void {
    skillsApplied.forEach(skill => {
      const skillArea = evolution.characterGrowth.skillDevelopmentAreas.find(area => area.skillArea === skill);
      if (skillArea) {
        const improvement = performanceScore / 20;
        skillArea.currentLevel = Math.min(100, skillArea.currentLevel + improvement);
        skillArea.improvementRate = (skillArea.currentLevel - skillArea.initialLevel) / 
          ((new Date().getTime() - evolution.evolutionStartDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    });
  }

  private checkProfessionalMilestones(evolution: CharacterEvolution, scenarioType: string, municipalContext: string): void {
    const currentLevel = evolution.characterGrowth.currentCompetenceLevel;
    const milestoneThresholds = [25, 50, 75, 90];
    
    milestoneThresholds.forEach(threshold => {
      if (currentLevel >= threshold && 
          !evolution.characterGrowth.professionalMilestones.some(m => m.description.includes(`${threshold}% competency`))) {
        evolution.characterGrowth.professionalMilestones.push({
          milestoneId: `milestone_${threshold}_${Date.now()}`,
          achievementDate: new Date(),
          description: `Achieved ${threshold}% municipal professional competency`,
          municipalImpact: `Enhanced municipal service delivery at ${threshold}% proficiency level`,
          skillsGained: [`advanced_${scenarioType}`, 'municipal_excellence']
        });
      }
    });
  }

  private updateMunicipalCompetenceGrowth(
    evolution: CharacterEvolution, 
    scenarioType: string, 
    performanceScore: number, 
    citizenImpact: string
  ): void {
    evolution.municipalCompetenceGrowth.forEach(competence => {
      const growthAmount = performanceScore / 25; // Max 4 points for perfect performance
      competence.currentLevel = Math.min(100, competence.currentLevel + growthAmount);
      
      // Update growth trajectory
      const growth = competence.currentLevel - competence.initialAssessment;
      if (growth > 30) competence.growthTrajectory = 'rapid';
      else if (growth > 15) competence.growthTrajectory = 'steady';
      else if (growth > 5) competence.growthTrajectory = 'gradual';
      else competence.growthTrajectory = 'stagnant';

      // Add practical application
      competence.practicalApplications.push({
        scenarioType,
        applicationDate: new Date(),
        successLevel: performanceScore,
        citizenImpact,
        learningOutcome: `Applied ${competence.competenceArea} in ${scenarioType} scenario`
      });
    });
  }

  private checkAchievementUnlocks(evolution: CharacterEvolution): void {
    const currentLevel = evolution.characterGrowth.currentCompetenceLevel;
    
    this.achievementUnlockThresholds.forEach((threshold, achievementType) => {
      if (currentLevel >= threshold && 
          !evolution.professionalAchievements.some(a => a.achievementType === achievementType)) {
        const achievement: ProfessionalAchievements = {
          achievementId: `${achievementType}_${Date.now()}`,
          achievementType: achievementType as any,
          unlockDate: new Date(),
          requirements: [`Achieve ${threshold}% municipal competency`, 'Demonstrate consistent performance'],
          municipalBenefit: `Enhanced ${achievementType} capability for municipal service delivery`,
          citizenServiceImpact: `Improved citizen service through ${achievementType} mastery`,
          archetype: evolution.characterGrowth.archetype,
          culturalContext: 'swedish' // Default, should be passed from context
        };
        
        evolution.professionalAchievements.push(achievement);
      }
    });
  }

  private applyRelationshipGrowthToCharacterCompetence(
    evolution: CharacterEvolution, 
    relationshipProgress: RelationshipProgressMetrics
  ): void {
    // Strong relationships boost collaborative competence
    if (relationshipProgress.currentRelationshipStrength > 80) {
      const collaborationSkill = evolution.characterGrowth.skillDevelopmentAreas.find(
        skill => skill.skillArea === 'collaboration'
      );
      if (collaborationSkill) {
        collaborationSkill.currentLevel = Math.min(100, collaborationSkill.currentLevel + 1);
      }
    }
  }

  private getAllRelationshipEvolutions(): RelationshipProgressMetrics[] {
    const allRelationshipEvolutions: RelationshipProgressMetrics[] = [];
    this.characterEvolutions.forEach(evolution => {
      allRelationshipEvolutions.push(...evolution.relationshipProgress);
    });
    return allRelationshipEvolutions;
  }

  private calculateMunicipalServiceImpactScore(): number {
    if (this.characterEvolutions.size === 0) return 75; // Default baseline
    
    let totalImpact = 0;
    let characterCount = 0;
    
    this.characterEvolutions.forEach(evolution => {
      const individualImpact = this.calculateIndividualMunicipalServiceImpact(evolution);
      totalImpact += individualImpact;
      characterCount++;
    });
    
    return characterCount > 0 ? Math.round(totalImpact / characterCount) : 75;
  }

  private calculateIndividualMunicipalServiceImpact(evolution: CharacterEvolution): number {
    const competenceScore = evolution.characterGrowth.currentCompetenceLevel;
    const relationshipScore = evolution.relationshipProgress.reduce((avg, rel) => avg + rel.municipalServiceSynergy, 0) / 
                             Math.max(1, evolution.relationshipProgress.length);
    const achievementBonus = evolution.professionalAchievements.length * 5;
    
    return Math.min(100, competenceScore * 0.6 + relationshipScore * 0.3 + achievementBonus);
  }

  private calculateCulturalAdaptationProgress(): Record<string, number> {
    const culturalProgress: Record<string, number> = {
      'swedish': 0,
      'german': 0,
      'french': 0,
      'dutch': 0
    };
    
    this.characterEvolutions.forEach(evolution => {
      evolution.municipalCompetenceGrowth.forEach(competence => {
        const culture = competence.culturalAdaptation.culture;
        culturalProgress[culture] = Math.max(
          culturalProgress[culture],
          competence.culturalAdaptation.culturalCompetenceLevel
        );
      });
    });
    
    return culturalProgress;
  }

  private estimateTimeToNextMilestone(evolution: CharacterEvolution): string {
    const currentLevel = evolution.characterGrowth.currentCompetenceLevel;
    const growthRate = evolution.characterGrowth.competenceGrowthRate;
    
    if (growthRate <= 0) return 'Continue practicing to establish growth rate';
    
    let nextThreshold = 100;
    const thresholds = [25, 50, 75, 90, 100];
    
    for (const threshold of thresholds) {
      if (currentLevel < threshold) {
        nextThreshold = threshold;
        break;
      }
    }
    
    const remainingLevels = nextThreshold - currentLevel;
    const estimatedDays = Math.round(remainingLevels / growthRate);
    
    return `${estimatedDays} days with current growth rate`;
  }
}

// Type definitions for external use
export interface CharacterEvolutionSummary {
  characterId: string;
  currentCompetenceLevel: number;
  competenceGrowth: number;
  totalAchievements: number;
  relationshipCount: number;
  municipalServiceImpact: number;
  nextMilestone: string;
  timeToNextMilestone: string;
  evolutionTrajectory: string;
}

export default CharacterEvolutionTracker;