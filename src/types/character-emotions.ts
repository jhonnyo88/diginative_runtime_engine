// Character Emotion System - Municipal Professional Standards
// Based on proposal-010 research and character-system-implementation-guide
// Extends existing DialogueScene 4-emotion system to 6+ professional emotions

export type MunicipalEmotionType = 
  | 'supportive' 
  | 'analytical' 
  | 'concerned' 
  | 'satisfied' 
  | 'determined' 
  | 'collaborative'
  | 'neutral'     // Legacy compatibility
  | 'confident'   // Legacy compatibility  
  | 'questioning'; // Legacy compatibility

export interface MunicipalEmotionState {
  emotionId: MunicipalEmotionType;
  displayName: string;
  professionalContext: string;
  visualIndicators: EmotionVisualization;
  accessibilityLabel: string;
  culturalVariations: CulturalEmotionVariant[];
  intensity: 'subtle' | 'moderate' | 'clear';
}

export interface EmotionVisualization {
  colorScheme: string;
  iconType: string;
  bodyLanguageDescription: string;
  voiceToneDescription: string;
  facialExpressionDescription: string;
}

export interface CulturalEmotionVariant {
  culture: 'swedish' | 'german' | 'french' | 'dutch';
  adaptedExpression: string;
  culturalAppropriatenessNotes: string;
  localizedDescription: string;
}

// Municipal Professional Emotion Definitions
export const municipalEmotions: Record<MunicipalEmotionType, MunicipalEmotionState> = {
  supportive: {
    emotionId: 'supportive',
    displayName: 'Supportive',
    professionalContext: 'Mentoring colleagues, helping citizens, collaborative problem-solving',
    visualIndicators: {
      colorScheme: 'green',
      iconType: 'helping-hand',
      bodyLanguageDescription: 'Open posture, leaning slightly forward, encouraging gestures',
      voiceToneDescription: 'Warm, encouraging, patient',
      facialExpressionDescription: 'Gentle smile, attentive eyes, nodding'
    },
    accessibilityLabel: 'Supportive and encouraging professional demeanor',
    intensity: 'moderate',
    culturalVariations: [
      {
        culture: 'swedish',
        adaptedExpression: 'Calm, inclusive encouragement with lagom warmth',
        culturalAppropriatenessNotes: 'Swedish consensus-building supportive style',
        localizedDescription: 'Stödjande och inkluderande på svenska sättet'
      },
      {
        culture: 'german',
        adaptedExpression: 'Systematic, competent guidance with clear structure',
        culturalAppropriatenessNotes: 'German thorough mentorship approach',
        localizedDescription: 'Unterstützend mit deutscher Gründlichkeit'
      },
      {
        culture: 'french',
        adaptedExpression: 'Elegant encouragement with intellectual refinement',
        culturalAppropriatenessNotes: 'French service public excellence tradition',
        localizedDescription: 'Soutien avec élégance professionnelle française'
      },
      {
        culture: 'dutch',
        adaptedExpression: 'Direct, practical support with innovative solutions',
        culturalAppropriatenessNotes: 'Dutch straightforward helpfulness',
        localizedDescription: 'Ondersteunend met Nederlandse directheid'
      }
    ]
  },

  analytical: {
    emotionId: 'analytical',
    displayName: 'Analytical',
    professionalContext: 'Policy review, data analysis, systematic problem-solving',
    visualIndicators: {
      colorScheme: 'blue',
      iconType: 'magnifying-glass',
      bodyLanguageDescription: 'Focused posture, thoughtful gestures, examining details',
      voiceToneDescription: 'Measured, methodical, precise',
      facialExpressionDescription: 'Concentrated expression, slightly furrowed brow, thoughtful'
    },
    accessibilityLabel: 'Focused analytical thinking and problem-solving mode',
    intensity: 'clear',
    culturalVariations: [
      {
        culture: 'swedish',
        adaptedExpression: 'Thoughtful analysis with democratic consideration',
        culturalAppropriatenessNotes: 'Swedish collaborative analytical approach',
        localizedDescription: 'Analytisk med svensk reflektion'
      },
      {
        culture: 'german',
        adaptedExpression: 'Systematic, thorough examination with precision',
        culturalAppropriatenessNotes: 'German verwaltung analytical rigor',
        localizedDescription: 'Analytisch mit deutscher Systematik'
      },
      {
        culture: 'french',
        adaptedExpression: 'Intellectual analysis with sophisticated reasoning',
        culturalAppropriatenessNotes: 'French intellectual analytical tradition',
        localizedDescription: 'Analytique avec raffinement intellectuel français'
      },
      {
        culture: 'dutch',
        adaptedExpression: 'Practical analysis focused on efficient solutions',
        culturalAppropriatenessNotes: 'Dutch pragmatic analytical approach',
        localizedDescription: 'Analytisch met Nederlandse praktische focus'
      }
    ]
  },

  concerned: {
    emotionId: 'concerned',
    displayName: 'Concerned',
    professionalContext: 'Compliance issues, resource constraints, citizen welfare',
    visualIndicators: {
      colorScheme: 'orange',
      iconType: 'alert-triangle',
      bodyLanguageDescription: 'Alert posture, serious expression, protective gestures',
      voiceToneDescription: 'Serious, responsible, careful',
      facialExpressionDescription: 'Worried expression, attentive eyes, slight frown'
    },
    accessibilityLabel: 'Professional concern and responsible worry',
    intensity: 'moderate',
    culturalVariations: [
      {
        culture: 'swedish',
        adaptedExpression: 'Responsible concern with calm authority',
        culturalAppropriatenessNotes: 'Swedish measured professional worry',
        localizedDescription: 'Oroad med svenskt ansvar'
      },
      {
        culture: 'german',
        adaptedExpression: 'Systematic concern with regulatory awareness',
        culturalAppropriatenessNotes: 'German compliance-focused concern',
        localizedDescription: 'Besorgt mit deutscher Sorgfalt'
      },
      {
        culture: 'french',
        adaptedExpression: 'Refined concern with service public responsibility',
        culturalAppropriatenessNotes: 'French public service concern tradition',
        localizedDescription: 'Préoccupé avec responsabilité française'
      },
      {
        culture: 'dutch',
        adaptedExpression: 'Direct concern with practical problem-solving focus',
        culturalAppropriatenessNotes: 'Dutch straightforward professional worry',
        localizedDescription: 'Bezorgd met Nederlandse directheid'
      }
    ]
  },

  satisfied: {
    emotionId: 'satisfied',
    displayName: 'Satisfied',
    professionalContext: 'Successful service delivery, completed projects, citizen help',
    visualIndicators: {
      colorScheme: 'purple',
      iconType: 'check-circle',
      bodyLanguageDescription: 'Relaxed confidence, subtle proud posture, accomplishment',
      voiceToneDescription: 'Quietly pleased, professional pride, warm',
      facialExpressionDescription: 'Subtle smile, bright eyes, content expression'
    },
    accessibilityLabel: 'Quiet professional satisfaction and accomplishment',
    intensity: 'subtle',
    culturalVariations: [
      {
        culture: 'swedish',
        adaptedExpression: 'Lagom satisfaction without boasting',
        culturalAppropriatenessNotes: 'Swedish understated professional pride',
        localizedDescription: 'Nöjd med svensk måttfullhet'
      },
      {
        culture: 'german',
        adaptedExpression: 'Competent satisfaction with systematic achievement',
        culturalAppropriatenessNotes: 'German thorough completion satisfaction',
        localizedDescription: 'Zufrieden mit deutscher Kompetenz'
      },
      {
        culture: 'french',
        adaptedExpression: 'Elegant satisfaction with refined accomplishment',
        culturalAppropriatenessNotes: 'French sophisticated professional pride',
        localizedDescription: 'Satisfait avec élégance professionnelle française'
      },
      {
        culture: 'dutch',
        adaptedExpression: 'Practical satisfaction with efficient results',
        culturalAppropriatenessNotes: 'Dutch results-oriented satisfaction',
        localizedDescription: 'Tevreden met Nederlandse efficiëntie'
      }
    ]
  },

  determined: {
    emotionId: 'determined',
    displayName: 'Determined',
    professionalContext: 'Challenging projects, citizen advocacy, problem resolution',
    visualIndicators: {
      colorScheme: 'red',
      iconType: 'target',
      bodyLanguageDescription: 'Focused energy, resolute posture, purposeful movement',
      voiceToneDescription: 'Firm, decisive, committed',
      facialExpressionDescription: 'Determined expression, steady gaze, firm jawline'
    },
    accessibilityLabel: 'Focused professional determination and resolve',
    intensity: 'clear',
    culturalVariations: [
      {
        culture: 'swedish',
        adaptedExpression: 'Calm determination with democratic persistence',
        culturalAppropriatenessNotes: 'Swedish persistent but non-aggressive resolve',
        localizedDescription: 'Bestämd med svensk envishet'
      },
      {
        culture: 'german',
        adaptedExpression: 'Systematic determination with process focus',
        culturalAppropriatenessNotes: 'German methodical professional resolve',
        localizedDescription: 'Entschlossen mit deutscher Beharrlichkeit'
      },
      {
        culture: 'french',
        adaptedExpression: 'Refined determination with intellectual conviction',
        culturalAppropriatenessNotes: 'French sophisticated professional resolve',
        localizedDescription: 'Déterminé avec conviction française'
      },
      {
        culture: 'dutch',
        adaptedExpression: 'Direct determination with innovative persistence',
        culturalAppropriatenessNotes: 'Dutch straightforward professional resolve',
        localizedDescription: 'Vastberaden met Nederlandse doelgerichtheid'
      }
    ]
  },

  collaborative: {
    emotionId: 'collaborative',
    displayName: 'Collaborative',
    professionalContext: 'Cross-department cooperation, team projects, stakeholder engagement',
    visualIndicators: {
      colorScheme: 'teal',
      iconType: 'users',
      bodyLanguageDescription: 'Open, inclusive gestures, attentive listening, engaging',
      voiceToneDescription: 'Engaging, inclusive, cooperative',
      facialExpressionDescription: 'Interested expression, active listening, warm engagement'
    },
    accessibilityLabel: 'Engaged collaborative professional interaction',
    intensity: 'moderate',
    culturalVariations: [
      {
        culture: 'swedish',
        adaptedExpression: 'Consensus-building collaboration with inclusive approach',
        culturalAppropriatenessNotes: 'Swedish democratic collaborative tradition',
        localizedDescription: 'Samarbetsinriktad med svensk konsensus'
      },
      {
        culture: 'german',
        adaptedExpression: 'Structured collaboration with systematic coordination',
        culturalAppropriatenessNotes: 'German organized teamwork approach',
        localizedDescription: 'Kollaborativ mit deutscher Organisation'
      },
      {
        culture: 'french',
        adaptedExpression: 'Sophisticated collaboration with intellectual exchange',
        culturalAppropriatenessNotes: 'French refined collaborative discourse',
        localizedDescription: 'Collaboratif avec échange intellectuel français'
      },
      {
        culture: 'dutch',
        adaptedExpression: 'Direct collaboration with practical coordination',
        culturalAppropriatenessNotes: 'Dutch efficient teamwork approach',
        localizedDescription: 'Samenwerkend met Nederlandse efficiëntie'
      }
    ]
  },

  // Legacy emotions for backward compatibility
  neutral: {
    emotionId: 'neutral',
    displayName: 'Neutral',
    professionalContext: 'Standard professional interaction, information delivery',
    visualIndicators: {
      colorScheme: 'gray',
      iconType: 'user',
      bodyLanguageDescription: 'Professional standard posture, neutral expression',
      voiceToneDescription: 'Professional, clear, informative',
      facialExpressionDescription: 'Neutral professional expression, attentive'
    },
    accessibilityLabel: 'Standard professional neutral demeanor',
    intensity: 'subtle',
    culturalVariations: [
      {
        culture: 'swedish',
        adaptedExpression: 'Calm professional neutrality',
        culturalAppropriatenessNotes: 'Swedish measured professional standard',
        localizedDescription: 'Neutral professionell'
      },
      {
        culture: 'german',
        adaptedExpression: 'Formal professional neutrality',
        culturalAppropriatenessNotes: 'German formal professional standard',
        localizedDescription: 'Professional neutral'
      },
      {
        culture: 'french',
        adaptedExpression: 'Courteous professional neutrality',
        culturalAppropriatenessNotes: 'French polite professional standard',
        localizedDescription: 'Neutre professionnel'
      },
      {
        culture: 'dutch',
        adaptedExpression: 'Direct professional neutrality',
        culturalAppropriatenessNotes: 'Dutch straightforward professional standard',
        localizedDescription: 'Professioneel neutraal'
      }
    ]
  },

  confident: {
    emotionId: 'confident',
    displayName: 'Confident',
    professionalContext: 'Expert knowledge sharing, leadership, guidance',
    visualIndicators: {
      colorScheme: 'blue',
      iconType: 'shield-check',
      bodyLanguageDescription: 'Assured posture, steady presence, competent authority',
      voiceToneDescription: 'Clear, assured, knowledgeable',
      facialExpressionDescription: 'Confident expression, steady eye contact, composed'
    },
    accessibilityLabel: 'Professional confidence and competent authority',
    intensity: 'clear',
    culturalVariations: [
      {
        culture: 'swedish',
        adaptedExpression: 'Quiet confidence without arrogance',
        culturalAppropriatenessNotes: 'Swedish humble competence',
        localizedDescription: 'Självsäker med svensk ödmjukhet'
      },
      {
        culture: 'german',
        adaptedExpression: 'Systematic confidence with competent authority',
        culturalAppropriatenessNotes: 'German professional expertise confidence',
        localizedDescription: 'Selbstbewusst mit deutscher Kompetenz'
      },
      {
        culture: 'french',
        adaptedExpression: 'Refined confidence with intellectual authority',
        culturalAppropriatenessNotes: 'French sophisticated professional confidence',
        localizedDescription: 'Confiant avec autorité intellectuelle française'
      },
      {
        culture: 'dutch',
        adaptedExpression: 'Direct confidence with practical competence',
        culturalAppropriatenessNotes: 'Dutch straightforward professional confidence',
        localizedDescription: 'Zelfverzekerd met Nederlandse competentie'
      }
    ]
  },

  questioning: {
    emotionId: 'questioning',
    displayName: 'Questioning',
    professionalContext: 'Information gathering, clarification, learning',
    visualIndicators: {
      colorScheme: 'yellow',
      iconType: 'help-circle',
      bodyLanguageDescription: 'Inquisitive posture, active listening, engaged curiosity',
      voiceToneDescription: 'Curious, thoughtful, seeking understanding',
      facialExpressionDescription: 'Questioning expression, raised eyebrows, attentive'
    },
    accessibilityLabel: 'Professional curiosity and information-seeking behavior',
    intensity: 'moderate',
    culturalVariations: [
      {
        culture: 'swedish',
        adaptedExpression: 'Thoughtful questioning with respectful curiosity',
        culturalAppropriatenessNotes: 'Swedish careful inquiry approach',
        localizedDescription: 'Frågande med svensk reflektion'
      },
      {
        culture: 'german',
        adaptedExpression: 'Systematic questioning with thorough investigation',
        culturalAppropriatenessNotes: 'German methodical inquiry approach',
        localizedDescription: 'Fragend mit deutscher Gründlichkeit'  
      },
      {
        culture: 'french',
        adaptedExpression: 'Intellectual questioning with sophisticated inquiry',
        culturalAppropriatenessNotes: 'French refined questioning tradition',
        localizedDescription: 'Questionnant avec curiosité intellectuelle française'
      },
      {
        culture: 'dutch',
        adaptedExpression: 'Direct questioning with practical focus',
        culturalAppropriatenessNotes: 'Dutch straightforward inquiry approach',
        localizedDescription: 'Vragend met Nederlandse directheid'
      }
    ]
  }
};

// Emotion utility functions
  emotionType: MunicipalEmotionType,
  culture: 'swedish' | 'german' | 'french' | 'dutch' = 'swedish'
): MunicipalEmotionState => {
  return emotion;
};

  emotionType: MunicipalEmotionType,
  context?: string
): string => {
  return context 
    ? `${emotion.accessibilityLabel} in context: ${context}`
    : emotion.accessibilityLabel;
};

  emotionType: MunicipalEmotionType,
  culture: 'swedish' | 'german' | 'french' | 'dutch'
): CulturalEmotionVariant | undefined => {
  return emotion.culturalVariations.find(variant => variant.culture === culture);
};

// Backward compatibility with existing DialogueScene
export const legacyEmotionMapping: Record<string, MunicipalEmotionType> = {
  'neutral': 'neutral',
  'concerned': 'concerned',
  'confident': 'confident',
  'questioning': 'questioning'
};

  return legacyEmotionMapping[legacyEmotion] || 'neutral';
};