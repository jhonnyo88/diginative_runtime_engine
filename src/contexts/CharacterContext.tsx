// Character Context Provider - Municipal Character System State Management
// Integrates with existing AuthContext and game-state-manager
// Supports Anna/Klaus/Marie/Pieter cultural personas

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MunicipalArchetypeId, MunicipalCharacterArchetype } from '../types/character-archetypes';
import { MunicipalEmotionType } from '../types/character-emotions';
import CharacterRelationshipManager, { 
  CharacterRelationship, 
  InteractionRecord, 
  RelationshipType,
  InteractionType 
} from '../services/character-relationship-manager';

// Cultural persona definitions based on proposal-010 research
export interface CulturalPersona {
  personaId: 'anna_svensson' | 'klaus_mueller' | 'marie_dubois' | 'pieter_van_berg';
  culture: 'swedish' | 'german' | 'french' | 'dutch';
  name: string;
  municipality: string;
  role: string;
  archetype: MunicipalArchetypeId;
  culturalCharacteristics: {
    communicationStyle: string;
    workStyle: string;
    decisionMakingApproach: string;
    conflictResolutionStyle: string;
    municipalValues: string[];
  };
  deviceOptimization: {
    primaryDevice: string;
    accessibilityPreferences: string[];
    interfacePreferences: string[];
  };
}

export interface MunicipalCharacter {
  characterId: string;
  name: string;
  archetype: MunicipalArchetypeId;
  currentEmotion: MunicipalEmotionType;
  emotionIntensity: 'subtle' | 'moderate' | 'clear';
  culturalPersona: CulturalPersona;
  department: string;
  experienceLevel: string;
  professionalTraits: string[];
  relationshipConnections: string[];
}

export interface ConversationMemory {
  conversationId: string;
  participants: string[];
  timestamp: Date;
  context: string;
  municipalScenario: string;
  emotionalStates: Record<string, MunicipalEmotionType>;
  outcomes: string[];
}

export interface CharacterEmotionState {
  characterId: string;
  currentEmotion: MunicipalEmotionType;
  emotionHistory: Array<{
    emotion: MunicipalEmotionType;
    timestamp: Date;
    context: string;
    trigger: string;
  }>;
  emotionStability: number; // 0-100
  emotionalTriggers: string[];
}

export interface CharacterArchetypeData {
  archetypeId: MunicipalArchetypeId;
  archetypeDetails: MunicipalCharacterArchetype;
  personalizedTraits: string[];
  municipalExpertise: string[];
  culturalAdaptations: Record<string, any>;
}

export interface CulturalCharacterContext {
  currentCulture: 'swedish' | 'german' | 'french' | 'dutch';
  activPersona: CulturalPersona;
  culturalAdaptations: {
    language: string;
    municipalTerminology: Record<string, string>;
    communicationPatterns: Record<string, string>;
    professionalNorms: string[];
  };
  accessibilityAdaptations: {
    languageSupport: string[];
    culturalAccessibility: string[];
    municipalSpecificNeeds: string[];
  };
}

export interface CharacterContextType {
  // Core character state
  activeCharacters: MunicipalCharacter[];
  characterRelationships: CharacterRelationship[];
  conversationHistory: ConversationMemory[];
  emotionState: CharacterEmotionState[];
  
  // Character system management
  relationshipManager: CharacterRelationshipManager;
  
  // Cultural context management
  culturalContext: CulturalCharacterContext;
  
  // Character system actions
  addCharacter: (character: MunicipalCharacter) => void;
  updateCharacterEmotion: (characterId: string, emotion: MunicipalEmotionType, context: string) => void;
  trackCharacterInteraction: (
    character1Id: string, 
    character2Id: string, 
    interactionType: InteractionType, 
    outcome: 'positive' | 'neutral' | 'negative',
    context: string
  ) => void;
  
  // Cultural persona management
  switchCulturalPersona: (personaId: 'anna_svensson' | 'klaus_mueller' | 'marie_dubois' | 'pieter_van_berg') => void;
  getCulturalAdaptations: (culture: 'swedish' | 'german' | 'french' | 'dutch') => CulturalCharacterContext;
  
  // Character analytics
  getCharacterRelationshipMetrics: (character1Id: string, character2Id: string) => any;
  getCharacterEmotionTrends: (characterId: string) => any;
  getMunicipalServiceImpact: () => number;
}

// Cultural personas based on research
export const culturalPersonas: Record<string, CulturalPersona> = {
  anna_svensson: {
    personaId: 'anna_svensson',
    culture: 'swedish',
    name: 'Anna Svensson',
    municipality: 'Malmö Stad',
    role: 'Kommunal Administratör',
    archetype: 'frontline_professional',
    culturalCharacteristics: {
      communicationStyle: 'consensus_building_inclusive_democratic',
      workStyle: 'collaborative_lagom_balanced',
      decisionMakingApproach: 'democratic_consultation_with_consensus',
      conflictResolutionStyle: 'calm_mediation_with_mutual_respect',
      municipalValues: ['democratic_participation', 'social_equality', 'consensus_building', 'work_life_balance', 'environmental_sustainability']
    },
    deviceOptimization: {
      primaryDevice: 'iPhone_12',
      accessibilityPreferences: ['voice_control', 'high_contrast', 'large_text'],
      interfacePreferences: ['clean_minimal', 'intuitive_navigation', 'mobile_first']
    }
  },
  
  klaus_mueller: {
    personaId: 'klaus_mueller',
    culture: 'german',
    name: 'Klaus Mueller',
    municipality: 'Stadt München',
    role: 'Verwaltungsexperte',
    archetype: 'compliance_guardian',
    culturalCharacteristics: {
      communicationStyle: 'formal_systematic_precise',
      workStyle: 'methodical_thorough_process_oriented',
      decisionMakingApproach: 'analytical_evidence_based_systematic',
      conflictResolutionStyle: 'structured_process_with_clear_procedures',
      municipalValues: ['regulatory_compliance', 'systematic_excellence', 'thoroughness', 'process_integrity', 'legal_precision']
    },
    deviceOptimization: {
      primaryDevice: 'ThinkPad_Desktop',
      accessibilityPreferences: ['keyboard_navigation', 'detailed_documentation', 'systematic_organization'],
      interfacePreferences: ['detailed_information', 'structured_layout', 'comprehensive_features']
    }
  },
  
  marie_dubois: {
    personaId: 'marie_dubois',
    culture: 'french',
    name: 'Marie Dubois',
    municipality: 'Ville de Lyon',
    role: 'Agent de Service Public',
    archetype: 'strategic_leader',
    culturalCharacteristics: {
      communicationStyle: 'sophisticated_courteous_intellectually_refined',
      workStyle: 'elegant_collaborative_service_excellence',
      decisionMakingApproach: 'intellectual_analysis_with_cultural_consideration',
      conflictResolutionStyle: 'diplomatic_discussion_with_refined_resolution',
      municipalValues: ['service_public_excellence', 'cultural_refinement', 'intellectual_rigor', 'citizen_service_pride', 'administrative_elegance']
    },
    deviceOptimization: {
      primaryDevice: 'MacBook_Air',
      accessibilityPreferences: ['elegant_typography', 'cultural_appropriate_design', 'refined_interactions'],
      interfacePreferences: ['sophisticated_design', 'cultural_sensitivity', 'elegant_functionality']
    }
  },
  
  pieter_van_berg: {
    personaId: 'pieter_van_berg',
    culture: 'dutch',
    name: 'Pieter van Berg',
    municipality: 'Gemeente Amsterdam',
    role: 'Bestuurlijk Innovator',
    archetype: 'change_agent',
    culturalCharacteristics: {
      communicationStyle: 'direct_pragmatic_efficient',
      workStyle: 'innovative_results_oriented_practical',
      decisionMakingApproach: 'pragmatic_efficient_with_innovation_focus',
      conflictResolutionStyle: 'straightforward_discussion_with_practical_solutions',
      municipalValues: ['innovation_efficiency', 'direct_communication', 'practical_solutions', 'democratic_participation', 'progressive_governance']
    },
    deviceOptimization: {
      primaryDevice: 'Surface_Pro',
      accessibilityPreferences: ['efficient_navigation', 'practical_features', 'streamlined_interface'],
      interfacePreferences: ['functional_design', 'efficient_workflows', 'innovation_focused']
    }
  }
};


  if (context === undefined) {
    throw new Error('useCharacterContext must be used within a CharacterProvider');
  }
  return context;
};

export const CharacterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Character system state
  const [activeCharacters, setActiveCharacters] = useState<MunicipalCharacter[]>([]);
  const [characterRelationships, setCharacterRelationships] = useState<CharacterRelationship[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMemory[]>([]);
  const [emotionState, setEmotionState] = useState<CharacterEmotionState[]>([]);
  
  // Cultural context state
  const [culturalContext, setCulturalContext] = useState<CulturalCharacterContext>({
    currentCulture: 'swedish',
    activPersona: culturalPersonas.anna_svensson,
    culturalAdaptations: {
      language: 'svenska',
      municipalTerminology: {
        'municipality': 'kommun',
        'citizen': 'medborgare',
        'service': 'tjänst',
        'department': 'avdelning'
      },
      communicationPatterns: {
        'greeting': 'Hej',
        'politeness': 'Tack så mycket',
        'agreement': 'Absolut'
      },
      professionalNorms: ['lagom_approach', 'consensus_building', 'work_life_balance']
    },
    accessibilityAdaptations: {
      languageSupport: ['svenska', 'english'],
      culturalAccessibility: ['high_contrast', 'clear_language', 'inclusive_design'],
      municipalSpecificNeeds: ['citizen_service_focus', 'government_accessibility']
    }
  });
  
  // Relationship manager
  const [relationshipManager] = useState(() => new CharacterRelationshipManager());

  // Character system actions
    
    setEmotionState(prev => [...prev, emotionState]);
  };

      }
      return state;
    }));
  };

  const _trackCharacterInteraction = (
    character1Id: string,
    character2Id: string,
    interactionType: InteractionType,
    outcome: 'positive' | 'neutral' | 'negative',
    context: string
  ) => {
    // Get current emotions for both characters
    
    // Track relationship evolution
    relationshipManager.trackRelationshipEvolution(
      character1Id,
      character2Id,
      interactionType,
      outcome,
      char1Emotion,
      char2Emotion,
      context,
      culturalContext.activPersona.municipality
    );
    
    // Add to conversation history
    const conversationMemory: ConversationMemory = {
      conversationId: `conv_${Date.now()}`,
      participants: [character1Id, character2Id],
      timestamp: new Date(),
      context,
      municipalScenario: culturalContext.activPersona.municipality,
      emotionalStates: {
        [character1Id]: char1Emotion,
        [character2Id]: char2Emotion
      },
      outcomes: [outcome]
    };
    
    setConversationHistory(prev => [...prev, conversationMemory]);
  };


  const _getCulturalAdaptations = (culture: 'swedish' | 'german' | 'french' | 'dutch'): CulturalCharacterContext => {
    return {
      currentCulture: culture,
      activPersona: persona,
      culturalAdaptations: getCulturalAdaptationsForCulture(culture),
      accessibilityAdaptations: {
        languageSupport: getCulturalLanguageSupport(culture),
        culturalAccessibility: getCulturalAccessibilityFeatures(culture),
        municipalSpecificNeeds: getMunicipalAccessibilityNeeds(culture)
      }
    };
  };

  // Helper functions for cultural adaptations

  const _getCulturalLanguageSupport = (culture: 'swedish' | 'german' | 'french' | 'dutch'): string[] => {
    return languageSupport[culture];
  };

  const _getCulturalAccessibilityFeatures = (culture: 'swedish' | 'german' | 'french' | 'dutch'): string[] => {
    return ['high_contrast', 'clear_language', 'inclusive_design', 'cultural_appropriate_design'];
  };

  const _getMunicipalAccessibilityNeeds = (culture: 'swedish' | 'german' | 'french' | 'dutch'): string[] => {
    return ['citizen_service_focus', 'government_accessibility', 'municipal_compliance'];
  };

  // Analytics functions

  };

  const _getMunicipalServiceImpact = (): number => {
    // Calculate overall municipal service impact based on character relationships and emotions
  };

  const _analyzeEmotionTrend = (emotionHistory: Record<string, unknown>[]): 'improving' | 'stable' | 'declining' => {
    if (emotionHistory.length < 3) return 'stable';
    
    
};

export default CharacterContext;