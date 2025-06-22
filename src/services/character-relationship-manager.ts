// Character Relationship Manager - Municipal Workplace Dynamics
// Based on proposal-010 research for municipal professional relationship patterns
// Implements relationship tracking, evolution, and workplace hierarchy dynamics

import { MunicipalArchetypeId } from '../types/character-archetypes';
import { MunicipalEmotionType } from '../types/character-emotions';

export type RelationshipType = 
  | 'supervisory'
  | 'peer_same_department'
  | 'peer_cross_department'
  | 'mentorship'
  | 'professional_collaboration'
  | 'service_coordination'
  | 'citizen_interaction';

export type RelationshipStatus = 'developing' | 'established' | 'strong' | 'strained' | 'conflict';

export type InteractionType = 
  | 'daily_coordination'
  | 'project_collaboration'
  | 'training_session'
  | 'policy_discussion'
  | 'problem_solving'
  | 'citizen_service_support'
  | 'emergency_response'
  | 'performance_review'
  | 'mentoring_session'
  | 'conflict_resolution';

export type InteractionOutcome = 'positive' | 'neutral' | 'negative' | 'mixed';

export interface CharacterRelationship {
  relationshipId: string;
  character1Id: string;
  character2Id: string;
  relationshipType: RelationshipType;
  status: RelationshipStatus;
  strength: number; // 0-100
  trustLevel: number; // 0-100
  communicationStyle: string;
  workplaceDynamics: WorkplaceDynamicsPattern;
  culturalContext: 'swedish' | 'german' | 'french' | 'dutch';
  lastInteraction: Date;
  interactionHistory: InteractionRecord[];
  relationshipEvolution: RelationshipEvolutionRecord[];
}

export interface WorkplaceDynamicsPattern {
  hierarchyLevel: 'same_level' | 'supervisor_subordinate' | 'senior_junior' | 'cross_hierarchy';
  communicationPattern: string;
  decisionMakingStyle: string;
  conflictResolutionApproach: string;
  collaborationStyle: string;
  feedbackPattern: string;
}

export interface InteractionRecord {
  interactionId: string;
  timestamp: Date;
  interactionType: InteractionType;
  outcome: InteractionOutcome;
  emotionStates: {
    character1Emotion: MunicipalEmotionType;
    character2Emotion: MunicipalEmotionType;
  };
  context: string;
  municipalScenario: string;
  impactOnRelationship: number; // -10 to +10
  notes?: string;
}

export interface RelationshipEvolutionRecord {
  timestamp: Date;
  previousStatus: RelationshipStatus;
  newStatus: RelationshipStatus;
  trigger: string;
  strengthChange: number;
  trustChange: number;
  reasonForChange: string;
}

export interface RelationshipInfluence {
  relationshipId: string;
  influenceType: 'positive_support' | 'neutral_cooperation' | 'negative_resistance' | 'conflict_escalation';
  influenceStrength: number; // 0-100
  influenceContext: string;
  municipalImpact: string;
}

// Municipal workplace relationship patterns
export const municipalWorkplaceDynamics: Record<RelationshipType, WorkplaceDynamicsPattern> = {
  supervisory: {
    hierarchyLevel: 'supervisor_subordinate',
    communicationPattern: 'formal_structured_with_regular_feedback',
    decisionMakingStyle: 'consultative_with_final_authority',
    conflictResolutionApproach: 'mediated_discussion_with_clear_resolution',
    collaborationStyle: 'guided_collaboration_with_accountability',
    feedbackPattern: 'regular_performance_discussions_with_development_focus'
  },
  peer_same_department: {
    hierarchyLevel: 'same_level',
    communicationPattern: 'informal_frequent_collaborative',
    decisionMakingStyle: 'consensus_building_with_shared_responsibility',
    conflictResolutionApproach: 'peer_discussion_with_supervisor_escalation',
    collaborationStyle: 'mutual_support_with_resource_sharing',
    feedbackPattern: 'informal_peer_feedback_with_constructive_suggestions'
  },
  peer_cross_department: {
    hierarchyLevel: 'cross_hierarchy',
    communicationPattern: 'formal_structured_coordination',
    decisionMakingStyle: 'departmental_consultation_with_process_coordination',
    conflictResolutionApproach: 'departmental_liaison_with_management_involvement',
    collaborationStyle: 'project_based_with_clear_deliverables',
    feedbackPattern: 'formal_project_feedback_with_process_improvement'
  },
  mentorship: {
    hierarchyLevel: 'senior_junior',
    communicationPattern: 'supportive_educational_with_regular_guidance',
    decisionMakingStyle: 'guided_learning_with_increasing_autonomy',
    conflictResolutionApproach: 'patient_discussion_with_learning_focus',
    collaborationStyle: 'developmental_collaboration_with_skill_building',
    feedbackPattern: 'continuous_developmental_feedback_with_encouragement'
  },
  professional_collaboration: {
    hierarchyLevel: 'same_level',
    communicationPattern: 'project_focused_with_expertise_sharing',
    decisionMakingStyle: 'expertise_based_with_collaborative_planning',
    conflictResolutionApproach: 'professional_discussion_with_objective_focus',
    collaborationStyle: 'skill_complementary_with_shared_objectives',
    feedbackPattern: 'project_specific_feedback_with_professional_respect'
  },
  service_coordination: {
    hierarchyLevel: 'cross_hierarchy',
    communicationPattern: 'service_focused_with_citizen_priority',
    decisionMakingStyle: 'citizen_centered_with_service_optimization',
    conflictResolutionApproach: 'service_quality_focus_with_process_improvement',
    collaborationStyle: 'citizen_service_excellence_with_team_coordination',
    feedbackPattern: 'service_quality_feedback_with_continuous_improvement'
  },
  citizen_interaction: {
    hierarchyLevel: 'same_level',
    communicationPattern: 'citizen_centered_with_professional_support',
    decisionMakingStyle: 'citizen_advocacy_with_regulatory_compliance',
    conflictResolutionApproach: 'citizen_focused_resolution_with_team_support',
    collaborationStyle: 'citizen_service_teamwork_with_shared_responsibility',
    feedbackPattern: 'citizen_outcome_feedback_with_service_reflection'
  }
};

// Cultural relationship adaptation patterns
  swedish: {
    communicationStyle: 'consensus_building_with_inclusive_discussion',
    conflictResolution: 'calm_mediation_with_democratic_resolution',
    hierarchyApproach: 'flat_hierarchy_with_collaborative_leadership',
    feedbackCulture: 'constructive_lagom_feedback_with_mutual_respect'
  },
  german: {
    communicationStyle: 'formal_systematic_with_structured_discussion',
    conflictResolution: 'methodical_analysis_with_process_based_resolution',
    hierarchyApproach: 'clear_hierarchy_with_systematic_authority',
    feedbackCulture: 'thorough_detailed_feedback_with_improvement_focus'
  },
  french: {
    communicationStyle: 'sophisticated_courteous_with_intellectual_exchange',
    conflictResolution: 'diplomatic_discussion_with_elegant_resolution',
    hierarchyApproach: 'respectful_hierarchy_with_collaborative_consultation',
    feedbackCulture: 'refined_professional_feedback_with_cultural_sensitivity'
  },
  dutch: {
    communicationStyle: 'direct_efficient_with_practical_focus',
    conflictResolution: 'straightforward_discussion_with_results_oriented_resolution',
    hierarchyApproach: 'flat_democratic_with_pragmatic_leadership',
    feedbackCulture: 'direct_honest_feedback_with_efficiency_focus'
  }
};

export class CharacterRelationshipManager {
  private relationships: Map<string, CharacterRelationship> = new Map();
  private interactionHistory: Map<string, InteractionRecord[]> = new Map();

  constructor() {
    this.initializeRelationshipManager();
  }

  private initializeRelationshipManager(): void {
    // Initialize relationship tracking system
    console.log('Character Relationship Manager initialized');
  }

  // Create new relationship between characters
  createRelationship(
    character1Id: string,
    character2Id: string,
    character1Archetype: MunicipalArchetypeId,
    character2Archetype: MunicipalArchetypeId,
    culturalContext: 'swedish' | 'german' | 'french' | 'dutch' = 'swedish'
  ): CharacterRelationship {
    
    // Determine relationship type based on archetypes
    
    // Get workplace dynamics pattern
    
    // Calculate initial relationship parameters
    
    const relationship: CharacterRelationship = {
      relationshipId,
      character1Id,
      character2Id,
      relationshipType,
      status: 'developing',
      strength: initialStrength,
      trustLevel: initialTrust,
      communicationStyle: this.determineCommunicationStyle(character1Archetype, character2Archetype, culturalContext),
      workplaceDynamics,
      culturalContext,
      lastInteraction: new Date(),
      interactionHistory: [],
      relationshipEvolution: []
    };

    this.relationships.set(relationshipId, relationship);
    return relationship;
  }

  // Track relationship evolution through interactions
  trackRelationshipEvolution(
    character1Id: string,
    character2Id: string,
    interactionType: InteractionType,
    outcome: InteractionOutcome,
    character1Emotion: MunicipalEmotionType,
    character2Emotion: MunicipalEmotionType,
    context: string,
    municipalScenario: string
  ): RelationshipChange {
    
    if (!relationship) {
      throw new Error(`Relationship not found: ${relationshipId}`);
    }

    // Create interaction record
    const interactionRecord: InteractionRecord = {
      interactionId: this.generateInteractionId(),
      timestamp: new Date(),
      interactionType,
      outcome,
      emotionStates: {
        character1Emotion,
        character2Emotion
      },
      context,
      municipalScenario,
      impactOnRelationship: this.calculateInteractionImpact(interactionType, outcome, character1Emotion, character2Emotion),
      notes: `Municipal scenario: ${municipalScenario} - Context: ${context}`
    };

    // Update relationship based on interaction
    
    // Add to interaction history
    relationship.interactionHistory.push(interactionRecord);
    relationship.lastInteraction = new Date();

    // Update relationship in storage
    this.relationships.set(relationshipId, relationship);

    return relationshipChange;
  }

  // Get municipal workplace dynamics for relationship
  getMunicipalWorkplaceDynamics(
    character1Id: string,
    character2Id: string,
    department: string,
    hierarchy: string
  ): WorkplaceDynamics {
    
    if (!relationship) {
      throw new Error(`Relationship not found: ${relationshipId}`);
    }

    
    return {
      relationshipType: relationship.relationshipType,
      workplaceDynamics: relationship.workplaceDynamics,
      culturalPattern,
      department,
      hierarchy,
      communicationEffectiveness: this.calculateCommunicationEffectiveness(relationship),
      collaborationPotential: this.calculateCollaborationPotential(relationship),
      conflictRisk: this.calculateConflictRisk(relationship),
      municipalServiceImpact: this.calculateMunicipalServiceImpact(relationship)
    };
  }

  // Calculate relationship influence on decisions
  calculateRelationshipInfluence(
    relationship: CharacterRelationship,
    decision: CharacterDecision
  ): InfluenceResult {
      relationship.strength * relationship.trustLevel / 100,
      100
    );

    let influenceType: 'positive_support' | 'neutral_cooperation' | 'negative_resistance' | 'conflict_escalation';
    
    if (relationship.status === 'strong' && relationship.strength > 80) {
      influenceType = 'positive_support';
    } else if (relationship.status === 'strained' || relationship.strength < 30) {
      influenceType = 'negative_resistance';
    } else if (relationship.status === 'conflict') {
      influenceType = 'conflict_escalation';
    } else {
      influenceType = 'neutral_cooperation';
    }

    return {
      influenceType,
      influenceStrength,
      relationshipFactors: {
        trust: relationship.trustLevel,
        strength: relationship.strength,
        recentInteractions: relationship.interactionHistory.slice(-5),
        workplaceDynamics: relationship.workplaceDynamics
      },
      municipalImpact: this.calculateDecisionMunicipalImpact(relationship, decision),
      recommendedApproach: this.recommendDecisionApproach(relationship, decision)
    };
  }

  // Get relationship status and metrics
  getRelationshipMetrics(character1Id: string, character2Id: string): RelationshipMetrics {
    
    if (!relationship) {
      throw new Error(`Relationship not found: ${relationshipId}`);
    }

    return {
      relationshipId,
      status: relationship.status,
      strength: relationship.strength,
      trustLevel: relationship.trustLevel,
      totalInteractions: relationship.interactionHistory.length,
      recentInteractionTrend: this.calculateInteractionTrend(relationship),
      communicationEffectiveness: this.calculateCommunicationEffectiveness(relationship),
      collaborationSuccess: this.calculateCollaborationSuccess(relationship),
      municipalServiceAlignment: this.calculateMunicipalServiceAlignment(relationship),
      culturalCompatibility: this.calculateCulturalCompatibility(relationship),
      improvementRecommendations: this.generateImprovementRecommendations(relationship)
    };
  }

  // Private helper methods
  private generateRelationshipId(character1Id: string, character2Id: string): string {
    return `rel_${sorted[0]}_${sorted[1]}`;
  }

  private generateInteractionId(): string {
    return `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineRelationshipType(
    archetype1: MunicipalArchetypeId,
    archetype2: MunicipalArchetypeId
  ): RelationshipType {
    // Simple logic - could be enhanced with more sophisticated mapping
    const supervisoryArchetypes: MunicipalArchetypeId[] = ['strategic_leader', 'citizen_service_lead'];
    const juniorArchetypes: MunicipalArchetypeId[] = ['frontline_professional', 'change_agent'];
    
    if (supervisoryArchetypes.includes(archetype1) && juniorArchetypes.includes(archetype2)) {
      return 'supervisory';
    }
    if (supervisoryArchetypes.includes(archetype2) && juniorArchetypes.includes(archetype1)) {
      return 'supervisory';
    }
    if (archetype1 === 'institutional_memory' || archetype2 === 'institutional_memory') {
      return 'mentorship';
    }
    
    return 'peer_same_department';
  }

  private calculateInitialRelationshipStrength(
    archetype1: MunicipalArchetypeId,
    archetype2: MunicipalArchetypeId
  ): number {
    // Base strength calculation based on archetype compatibility
    // This would use the compatibilityMatrix from character archetypes
    return 50; // Starting neutral strength
  }

  private calculateInitialTrustLevel(
    archetype1: MunicipalArchetypeId,
    archetype2: MunicipalArchetypeId
  ): number {
    // Base trust calculation
    return 60; // Starting moderate trust
  }

  private determineCommunicationStyle(
    archetype1: MunicipalArchetypeId,
    archetype2: MunicipalArchetypeId,
    culture: 'swedish' | 'german' | 'french' | 'dutch'
  ): string {
    return `${culturalStyle}_between_${archetype1}_and_${archetype2}`;
  }

  private calculateInteractionImpact(
    interactionType: InteractionType,
    outcome: InteractionOutcome,
    emotion1: MunicipalEmotionType,
    emotion2: MunicipalEmotionType
  ): number {
    let impact = 0;
    
    // Base impact from outcome
    switch (outcome) {
      case 'positive': impact += 3; break;
      case 'neutral': impact += 0; break;
      case 'negative': impact -= 3; break;
      case 'mixed': impact += 1; break;
    }
    
    // Emotion modifiers
    const positiveEmotions: MunicipalEmotionType[] = ['supportive', 'collaborative', 'satisfied'];
    const negativeEmotions: MunicipalEmotionType[] = ['concerned', 'determined'];
    
    if (positiveEmotions.includes(emotion1) || positiveEmotions.includes(emotion2)) {
      impact += 1;
    }
    if (negativeEmotions.includes(emotion1) || negativeEmotions.includes(emotion2)) {
      impact -= 1;
    }
    
    return Math.max(-10, Math.min(10, impact));
  }

  private updateRelationshipFromInteraction(
    relationship: CharacterRelationship,
    interaction: InteractionRecord
  ): RelationshipChange {
    
    // Update strength and trust
    relationship.strength = Math.max(0, Math.min(100, relationship.strength + strengthChange));
    relationship.trustLevel = Math.max(0, Math.min(100, relationship.trustLevel + trustChange));
    
    // Update status based on new strength
    
    if (newStatus !== previousStatus) {
      const evolutionRecord: RelationshipEvolutionRecord = {
        timestamp: new Date(),
        previousStatus,
        newStatus,
        trigger: `${interaction.interactionType}_${interaction.outcome}`,
        strengthChange,
        trustChange,
        reasonForChange: `Interaction outcome: ${interaction.outcome} in context: ${interaction.context}`
      };
      
      relationship.relationshipEvolution.push(evolutionRecord);
      relationship.status = newStatus;
    }
    
    return {
      relationshipId: relationship.relationshipId,
      strengthChange,
      trustChange,
      statusChange: newStatus !== previousStatus ? { from: previousStatus, to: newStatus } : null,
      interactionImpact: interaction.impactOnRelationship
    };
  }

  private calculateRelationshipStatus(strength: number, trust: number): RelationshipStatus {
    
    if (average >= 80) return 'strong';
    if (average >= 60) return 'established';
    if (average >= 40) return 'developing';
    if (average >= 20) return 'strained';
    return 'conflict';
  }

  private calculateCommunicationEffectiveness(relationship: CharacterRelationship): number {
    return Math.min(100, (relationship.strength + relationship.trustLevel) / 2);
  }

  private calculateCollaborationPotential(relationship: CharacterRelationship): number {
    return Math.min(100, relationship.strength * 0.6 + relationship.trustLevel * 0.4);
  }

  private calculateConflictRisk(relationship: CharacterRelationship): number {
    return Math.max(0, 100 - relationship.strength);
  }

  private calculateMunicipalServiceImpact(relationship: CharacterRelationship): number {
    // Higher relationship quality = better municipal service delivery
    return Math.min(100, (relationship.strength + relationship.trustLevel) / 2);
  }

  private calculateInteractionTrend(relationship: CharacterRelationship): 'improving' | 'stable' | 'declining' {
    if (recentInteractions.length < 3) return 'stable';
    
    
    if (avgImpact > 1) return 'improving';
    if (avgImpact < -1) return 'declining';
    return 'stable';
  }

  private calculateCollaborationSuccess(relationship: CharacterRelationship): number {
    
    if (collaborativeInteractions.length === 0) return 50; // No data
    
  }

  private calculateMunicipalServiceAlignment(relationship: CharacterRelationship): number {
    // Calculate how well the relationship supports municipal service delivery
    return Math.min(100, (relationship.strength + relationship.trustLevel + this.calculateCollaborationSuccess(relationship)) / 3);
  }

  private calculateCulturalCompatibility(relationship: CharacterRelationship): number {
    // For now, assume high cultural compatibility within same culture
    return 85;
  }

  private generateImprovementRecommendations(relationship: CharacterRelationship): string[] {
    const recommendations: string[] = [];
    
    if (relationship.strength < 50) {
      recommendations.push('Increase positive collaborative interactions');
    }
    if (relationship.trustLevel < 50) {
      recommendations.push('Focus on reliability and consistent communication');
    }
    if (relationship.status === 'strained') {
      recommendations.push('Consider facilitated discussion to address concerns');
    }
    
    return recommendations;
  }

  private calculateDecisionMunicipalImpact(relationship: CharacterRelationship, decision: CharacterDecision): string {
    return `Municipal service delivery impact based on ${relationship.relationshipType} relationship`;
  }

  private recommendDecisionApproach(relationship: CharacterRelationship, decision: CharacterDecision): string {
    if (relationship.status === 'strong') {
      return 'Collaborative approach with shared decision-making';
    } else if (relationship.status === 'strained') {
      return 'Careful consultation with clear communication of rationale';
    } else {
      return 'Standard professional consultation process';
    }
  }
}

// Type definitions for return values
export interface RelationshipChange {
  relationshipId: string;
  strengthChange: number;
  trustChange: number;
  statusChange: { from: RelationshipStatus; to: RelationshipStatus } | null;
  interactionImpact: number;
}

export interface WorkplaceDynamics {
  relationshipType: RelationshipType;
  workplaceDynamics: WorkplaceDynamicsPattern;
  culturalPattern: Record<string, unknown>;
  department: string;
  hierarchy: string;
  communicationEffectiveness: number;
  collaborationPotential: number;
  conflictRisk: number;
  municipalServiceImpact: number;
}

export interface InfluenceResult {
  influenceType: 'positive_support' | 'neutral_cooperation' | 'negative_resistance' | 'conflict_escalation';
  influenceStrength: number;
  relationshipFactors: {
    trust: number;
    strength: number;
    recentInteractions: InteractionRecord[];
    workplaceDynamics: WorkplaceDynamicsPattern;
  };
  municipalImpact: string;
  recommendedApproach: string;
}

export interface RelationshipMetrics {
  relationshipId: string;
  status: RelationshipStatus;
  strength: number;
  trustLevel: number;
  totalInteractions: number;
  recentInteractionTrend: 'improving' | 'stable' | 'declining';
  communicationEffectiveness: number;
  collaborationSuccess: number;
  municipalServiceAlignment: number;
  culturalCompatibility: number;
  improvementRecommendations: string[];
}

export interface CharacterDecision {
  decisionType: string;
  context: string;
  stakeholders: string[];
  municipalImpact: string;
}

export default CharacterRelationshipManager;