// Character Archetype System - Municipal Professional Standards
// Based on proposal-010 research with 10+ municipal professional archetypes
// Builds on existing Avatar component character types

export type MunicipalArchetypeId = 
  | 'institutional_memory'
  | 'change_agent'
  | 'strategic_leader'
  | 'frontline_professional'
  | 'compliance_guardian'
  | 'budget_specialist'
  | 'sustainability_coordinator'
  | 'emergency_manager'
  | 'community_engagement'
  | 'municipal_it_coordinator'
  | 'policy_analyst'
  | 'citizen_service_lead';

export interface PersonalityTraits {
  wisdom: string;
  patience: string;
  stability: string;
  adaptability: string;
  communication: string;
  innovation: string;
}

export interface EmotionalCapabilities {
  primaryEmotions: string[];
  secondaryEmotions: string[];
  emotionalRange: string;
  stressResponse: string;
}

export interface MunicipalContextData {
  typicalScenarios: string[];
  commonChallenges: string[];
  workplaceRelationships: string[];
  decisionMakingStyle: string;
  stakeholderInteractions: string[];
}

export interface CulturalArchetypeVariant {
  culture: 'swedish' | 'german' | 'french' | 'dutch';
  culturalAdaptation: string;
  communicationStyle: string;
  professionalExpectations: string;
  localizedTitle: string;
  culturalContext: string;
}

export interface MunicipalCharacterArchetype {
  archetypeId: MunicipalArchetypeId;
  displayName: string;
  description: string;
  experience: string;
  expertise: string[];
  personality: PersonalityTraits;
  emotionalCapabilities: EmotionalCapabilities;
  municipalContext: MunicipalContextData;
  culturalAdaptations: CulturalArchetypeVariant[];
  visualCharacteristics: {
    ageRange: string;
    professionalStyle: string;
    typicalAttire: string;
    bodyLanguage: string;
  };
  compatibilityMatrix: {
    worksWellWith: MunicipalArchetypeId[];
    potentialTensions: MunicipalArchetypeId[];
    mentorshipCapability: 'high' | 'medium' | 'low';
    leadershipStyle: string;
  };
}

// Municipal Professional Archetype Definitions
export const municipalArchetypes: Record<MunicipalArchetypeId, MunicipalCharacterArchetype> = {
  institutional_memory: {
    archetypeId: 'institutional_memory',
    displayName: 'Experienced Municipal Clerk',
    description: 'The keeper of institutional knowledge with deep understanding of municipal processes and history',
    experience: '15-25 years municipal service',
    expertise: ['process_knowledge', 'historical_context', 'policy_evolution', 'stakeholder_relationships', 'system_navigation'],
    personality: {
      wisdom: 'Deep institutional knowledge and historical perspective',
      patience: 'High tolerance for complex bureaucratic processes',
      stability: 'Consistent reliable presence in changing environments',
      adaptability: 'Gradual adaptation with preference for proven methods',
      communication: 'Clear, detailed explanations with context',
      innovation: 'Cautious innovation building on established foundations'
    },
    emotionalCapabilities: {
      primaryEmotions: ['supportive', 'analytical', 'satisfied'],
      secondaryEmotions: ['concerned', 'collaborative', 'neutral'],
      emotionalRange: 'Steady with occasional passionate advocacy for citizens',
      stressResponse: 'Relies on established procedures and historical precedents'
    },
    municipalContext: {
      typicalScenarios: [
        'Complex regulatory compliance questions',
        'Historical policy context explanations',
        'Training new employees on procedures',
        'Citizen inquiries requiring deep system knowledge',
        'Inter-departmental coordination challenges'
      ],
      commonChallenges: [
        'Balancing historical knowledge with innovation needs',
        'Training new staff on complex legacy systems',
        'Adapting to new technologies while maintaining continuity',
        'Managing stakeholder expectations with realistic timelines'
      ],
      workplaceRelationships: [
        'Mentor to junior staff',
        'Advisor to management on policy implications',
        'Bridge between departments with historical conflicts',
        'Trusted resource for complex citizen cases'
      ],
      decisionMakingStyle: 'Careful analysis with historical precedent consideration',
      stakeholderInteractions: [
        'Patient education for confused citizens',
        'Detailed briefings for elected officials',
        'Collaborative problem-solving with other departments',
        'Historical context for policy discussions'
      ]
    },
    culturalAdaptations: [
      {
        culture: 'swedish',
        culturalAdaptation: 'Consensus-building institutional knowledge keeper',
        communicationStyle: 'Inclusive, patient explanations with democratic process focus',
        professionalExpectations: 'Lagom approach to sharing knowledge without overwhelming',
        localizedTitle: 'Erfaren Kommunal Handläggare',
        culturalContext: 'Swedish democratic institutional tradition'
      },
      {
        culture: 'german',
        culturalAdaptation: 'Systematic process expert with regulatory precision',
        communicationStyle: 'Detailed, methodical explanations with thorough documentation',
        professionalExpectations: 'Verwaltung excellence with complete procedural knowledge',
        localizedTitle: 'Erfahrener Verwaltungsexperte',
        culturalContext: 'German systematic administrative tradition'
      },
      {
        culture: 'french',
        culturalAdaptation: 'Sophisticated institutional advisor with service public pride',
        communicationStyle: 'Refined, intellectually rich explanations with historical context',
        professionalExpectations: 'Service public excellence with cultural institutional knowledge',
        localizedTitle: 'Expert Administratif Expérimenté',
        culturalContext: 'French service public intellectual tradition'
      },
      {
        culture: 'dutch',
        culturalAdaptation: 'Practical institutional guide with efficient knowledge sharing',
        communicationStyle: 'Direct, efficient explanations with practical focus',
        professionalExpectations: 'Bestuur efficiency with straightforward institutional guidance',
        localizedTitle: 'Ervaren Bestuurlijk Medewerker',
        culturalContext: 'Dutch pragmatic administrative tradition'
      }
    ],
    visualCharacteristics: {
      ageRange: '45-60 years',
      professionalStyle: 'Classic professional with established confidence',
      typicalAttire: 'Traditional business attire with municipal identification',
      bodyLanguage: 'Steady, thoughtful posture with patient gestures'
    },
    compatibilityMatrix: {
      worksWellWith: ['strategic_leader', 'policy_analyst', 'compliance_guardian'],
      potentialTensions: ['change_agent', 'municipal_it_coordinator'],
      mentorshipCapability: 'high',
      leadershipStyle: 'Consultative with historical perspective'
    }
  },

  change_agent: {
    archetypeId: 'change_agent',
    displayName: 'Digital Innovation Officer',
    description: 'Forward-thinking professional driving municipal modernization and digital transformation',
    experience: '5-12 years with blend of private sector and municipal experience',
    expertise: ['digital_transformation', 'process_optimization', 'change_management', 'stakeholder_engagement', 'innovation_strategy'],
    personality: {
      wisdom: 'Strategic understanding of innovation within municipal constraints',
      patience: 'Moderate patience with focus on achievable progress',
      stability: 'Comfortable with change and ambiguity',
      adaptability: 'High adaptability with proactive change initiation',
      communication: 'Persuasive, vision-focused with practical examples',
      innovation: 'High innovation drive with practical implementation focus'
    },
    emotionalCapabilities: {
      primaryEmotions: ['determined', 'collaborative', 'confident'],
      secondaryEmotions: ['analytical', 'concerned', 'questioning'],
      emotionalRange: 'Energetic with occasional frustration at bureaucratic pace',
      stressResponse: 'Channels stress into creative problem-solving and stakeholder engagement'
    },
    municipalContext: {
      typicalScenarios: [
        'Digital service transformation projects',
        'Stakeholder resistance to change management',
        'Cross-departmental collaboration initiatives',
        'Citizen engagement platform implementation',
        'Process optimization consultations'
      ],
      commonChallenges: [
        'Balancing innovation pace with municipal stability requirements',
        'Managing resistance to change from established staff',
        'Securing budget approval for innovative projects',
        'Ensuring accessibility and inclusion in digital initiatives'
      ],
      workplaceRelationships: [
        'Collaborative partner with forward-thinking colleagues',
        'Change catalyst for hesitant departments',
        'Bridge between technical and non-technical staff',
        'Innovation advocate to senior management'
      ],
      decisionMakingStyle: 'Data-driven with user-centered design principles',
      stakeholderInteractions: [
        'Engaging presentations to skeptical stakeholders',
        'Collaborative workshops with diverse municipal staff',
        'Citizen feedback sessions for digital services',
        'Executive briefings on innovation opportunities'
      ]
    },
    culturalAdaptations: [
      {
        culture: 'swedish',
        culturalAdaptation: 'Consensus-building innovation leader with democratic approach',
        communicationStyle: 'Inclusive innovation discussions with collaborative decision-making',
        professionalExpectations: 'Lagom innovation pace with sustainable change management',
        localizedTitle: 'Digital Innovationschef',
        culturalContext: 'Swedish democratic innovation tradition'
      },
      {
        culture: 'german',
        culturalAdaptation: 'Systematic innovation expert with structured transformation',
        communicationStyle: 'Methodical innovation planning with thorough risk assessment',
        professionalExpectations: 'Verwaltung innovation with systematic implementation',
        localizedTitle: 'Digitalisierungsexperte',
        culturalContext: 'German systematic innovation tradition'
      },
      {
        culture: 'french',
        culturalAdaptation: 'Sophisticated innovation strategist with intellectual approach',
        communicationStyle: 'Refined innovation vision with cultural service public adaptation',
        professionalExpectations: 'Service public innovation with elegant implementation',
        localizedTitle: 'Responsable Innovation Numérique',
        culturalContext: 'French intellectual innovation tradition'
      },
      {
        culture: 'dutch',
        culturalAdaptation: 'Practical innovation leader with efficient transformation',
        communicationStyle: 'Direct innovation communication with results-focused approach',
        professionalExpectations: 'Bestuur innovation with straightforward implementation',
        localizedTitle: 'Digitale Innovatie Manager',
        culturalContext: 'Dutch pragmatic innovation tradition'
      }
    ],
    visualCharacteristics: {
      ageRange: '30-45 years',
      professionalStyle: 'Modern professional with tech-savvy appearance',
      typicalAttire: 'Contemporary business casual with digital accessories',
      bodyLanguage: 'Energetic, forward-leaning with enthusiastic gestures'
    },
    compatibilityMatrix: {
      worksWellWith: ['municipal_it_coordinator', 'community_engagement', 'strategic_leader'],
      potentialTensions: ['institutional_memory', 'compliance_guardian'],
      mentorshipCapability: 'medium',
      leadershipStyle: 'Transformational with collaborative vision'
    }
  },

  strategic_leader: {
    archetypeId: 'strategic_leader',
    displayName: 'Department Head',
    description: 'Senior municipal leader responsible for strategic direction and departmental coordination',
    experience: '12-20 years progressive municipal leadership experience',
    expertise: ['strategic_planning', 'budget_management', 'team_leadership', 'stakeholder_management', 'policy_development'],
    personality: {
      wisdom: 'Strategic perspective with long-term municipal planning capability',
      patience: 'High patience with complex decision-making processes',
      stability: 'Strong stability with measured approach to change',
      adaptability: 'Moderate adaptability with strategic change implementation',
      communication: 'Clear, authoritative with diplomatic nuance',
      innovation: 'Selective innovation with strategic implementation focus'
    },
    emotionalCapabilities: {
      primaryEmotions: ['confident', 'analytical', 'collaborative'],
      secondaryEmotions: ['concerned', 'determined', 'supportive'],
      emotionalRange: 'Controlled with occasional passionate advocacy for department',
      stressResponse: 'Systematic stress management with stakeholder communication'
    },
    municipalContext: {
      typicalScenarios: [
        'Strategic planning sessions with senior leadership',
        'Budget negotiation and resource allocation',
        'Interdepartmental coordination and conflict resolution',
        'Policy development and implementation oversight',
        'Public presentation and stakeholder engagement'
      ],
      commonChallenges: [
        'Balancing multiple competing priorities with limited resources',
        'Managing political pressures while maintaining operational excellence',
        'Leading diverse teams with varying skill levels and motivations',
        'Ensuring compliance while driving innovation and efficiency'
      ],
      workplaceRelationships: [
        'Strategic advisor to senior municipal leadership',
        'Mentor and coach to junior and mid-level staff',
        'Collaborative partner with peer department heads',
        'Spokesperson for department to external stakeholders'
      ],
      decisionMakingStyle: 'Strategic analysis with stakeholder consultation and risk assessment',
      stakeholderInteractions: [
        'High-level briefings to elected officials and city management',
        'Diplomatic negotiations with other departments and agencies',
        'Public presentations to community groups and media',
        'Performance reviews and strategic planning with staff'
      ]
    },
    culturalAdaptations: [
      {
        culture: 'swedish',
        culturalAdaptation: 'Consensus-building strategic leader with democratic approach',
        communicationStyle: 'Inclusive strategic discussions with collaborative decision-making',
        professionalExpectations: 'Lagom leadership with sustainable strategic planning',
        localizedTitle: 'Avdelningschef',
        culturalContext: 'Swedish democratic leadership tradition'
      },
      {
        culture: 'german',
        culturalAdaptation: 'Systematic strategic leader with structured approach',
        communicationStyle: 'Methodical strategic planning with thorough analysis',
        professionalExpectations: 'Verwaltung leadership with systematic implementation',
        localizedTitle: 'Abteilungsleiter',
        culturalContext: 'German systematic leadership tradition'
      },
      {
        culture: 'french',
        culturalAdaptation: 'Sophisticated strategic leader with intellectual approach',
        communicationStyle: 'Refined strategic vision with cultural service public adaptation',
        professionalExpectations: 'Service public leadership with elegant implementation',
        localizedTitle: 'Chef de Département',
        culturalContext: 'French intellectual leadership tradition'
      },
      {
        culture: 'dutch',
        culturalAdaptation: 'Practical strategic leader with efficient approach',
        communicationStyle: 'Direct strategic communication with results-focused approach',
        professionalExpectations: 'Bestuur leadership with straightforward implementation',
        localizedTitle: 'Afdelingshoofd',
        culturalContext: 'Dutch pragmatic leadership tradition'
      }
    ],
    visualCharacteristics: {
      ageRange: '40-55 years',
      professionalStyle: 'Executive presence with authoritative confidence',
      typicalAttire: 'Professional business attire with leadership accessories',
      bodyLanguage: 'Confident posture with commanding presence and diplomatic gestures'
    },
    compatibilityMatrix: {
      worksWellWith: ['institutional_memory', 'policy_analyst', 'budget_specialist'],
      potentialTensions: ['change_agent', 'community_engagement'],
      mentorshipCapability: 'high',
      leadershipStyle: 'Strategic with collaborative consultation'
    }
  },

  frontline_professional: {
    archetypeId: 'frontline_professional',
    displayName: 'Citizen Service Representative',
    description: 'Direct service provider with daily citizen interaction and practical problem-solving expertise',
    experience: '3-10 years direct citizen service experience',
    expertise: ['citizen_service', 'problem_solving', 'regulatory_knowledge', 'communication', 'conflict_resolution'],
    personality: {
      wisdom: 'Practical knowledge of citizen needs and service delivery',
      patience: 'High patience with diverse citizen situations',
      stability: 'Steady presence in high-stress service environments',
      adaptability: 'High adaptability to changing citizen needs',
      communication: 'Clear, empathetic with accessibility focus',
      innovation: 'Practical innovation in service delivery methods'
    },
    emotionalCapabilities: {
      primaryEmotions: ['supportive', 'collaborative', 'neutral'],
      secondaryEmotions: ['concerned', 'questioning', 'determined'],
      emotionalRange: 'Steady with empathetic responses to citizen needs',
      stressResponse: 'Professional composure with stress management techniques'
    },
    municipalContext: {
      typicalScenarios: [
        'Complex citizen inquiries requiring multi-department coordination',
        'Difficult citizen situations requiring de-escalation',
        'Service accessibility accommodations for diverse needs',
        'Regulatory compliance explanations to confused citizens',
        'Front-line feedback to management about service gaps'
      ],
      commonChallenges: [
        'Managing high-volume citizen interactions with quality service',
        'Balancing regulatory compliance with citizen satisfaction',
        'Handling emotionally charged situations with professionalism',
        'Staying updated on changing regulations and procedures'
      ],
      workplaceRelationships: [
        'Peer collaboration with other service representatives',
        'Feedback provider to supervisors about service delivery',
        'Liaison between citizens and specialized departments',
        'Mentorship recipient from experienced colleagues'
      ],
      decisionMakingStyle: 'Citizen-focused with regulatory compliance awareness',
      stakeholderInteractions: [
        'Direct service delivery to diverse citizen populations',
        'Collaborative problem-solving with specialized departments',
        'Feedback sessions with supervisors about service improvements',
        'Training participation for skill development and updates'
      ]
    },
    culturalAdaptations: [
      {
        culture: 'swedish',
        culturalAdaptation: 'Service-oriented professional with democratic citizen focus',
        communicationStyle: 'Patient, inclusive citizen service with accessibility emphasis',
        professionalExpectations: 'Lagom service approach with sustainable citizen care',
        localizedTitle: 'Medborgarservice Representant',
        culturalContext: 'Swedish democratic service tradition'
      },
      {
        culture: 'german',
        culturalAdaptation: 'Systematic service professional with regulatory expertise',
        communicationStyle: 'Methodical citizen service with thorough regulation explanation',
        professionalExpectations: 'Verwaltung service with systematic citizen support',
        localizedTitle: 'Bürgerservice Mitarbeiter',
        culturalContext: 'German systematic service tradition'
      },
      {
        culture: 'french',
        culturalAdaptation: 'Sophisticated service professional with public service pride',
        communicationStyle: 'Refined citizen service with cultural service public excellence',
        professionalExpectations: 'Service public excellence with courteous citizen care',
        localizedTitle: 'Agent de Service Public',
        culturalContext: 'French service public excellence tradition'
      },
      {
        culture: 'dutch',
        culturalAdaptation: 'Practical service professional with efficient citizen focus',
        communicationStyle: 'Direct, efficient citizen service with practical solutions',
        professionalExpectations: 'Bestuur service with straightforward citizen support',
        localizedTitle: 'Burgerservice Medewerker',
        culturalContext: 'Dutch pragmatic service tradition'
      }
    ],
    visualCharacteristics: {
      ageRange: '25-40 years',
      professionalStyle: 'Approachable professional with service-oriented presence',
      typicalAttire: 'Professional service attire with accessibility considerations',
      bodyLanguage: 'Open, welcoming posture with attentive listening'
    },
    compatibilityMatrix: {
      worksWellWith: ['community_engagement', 'institutional_memory', 'compliance_guardian'],
      potentialTensions: ['strategic_leader', 'policy_analyst'],
      mentorshipCapability: 'medium',
      leadershipStyle: 'Service-oriented with citizen advocacy'
    }
  },

  compliance_guardian: {
    archetypeId: 'compliance_guardian',
    displayName: 'Municipal Legal Advisor',
    description: 'Legal and regulatory expert ensuring municipal compliance and risk management',
    experience: '8-15 years legal and regulatory experience',
    expertise: ['regulatory_compliance', 'legal_analysis', 'risk_management', 'policy_interpretation', 'audit_preparation'],
    personality: {
      wisdom: 'Deep understanding of legal frameworks and regulatory requirements',
      patience: 'High patience with complex legal processes',
      stability: 'Strong stability with systematic approach to compliance',
      adaptability: 'Moderate adaptability with careful change assessment',
      communication: 'Precise, detailed with legal accuracy',
      innovation: 'Cautious innovation within legal boundaries'
    },
    emotionalCapabilities: {
      primaryEmotions: ['analytical', 'concerned', 'confident'],
      secondaryEmotions: ['questioning', 'determined', 'neutral'],
      emotionalRange: 'Controlled with occasional passionate advocacy for compliance',
      stressResponse: 'Systematic legal analysis with comprehensive documentation'
    },
    municipalContext: {
      typicalScenarios: [
        'Legal compliance reviews for new policies and procedures',
        'Risk assessment for municipal initiatives and programs',
        'Regulatory interpretation for complex citizen situations',
        'Audit preparation and response coordination',
        'Legal training for non-legal municipal staff'
      ],
      commonChallenges: [
        'Balancing legal compliance with practical service delivery',
        'Communicating complex legal requirements to non-legal staff',
        'Managing regulatory changes and their municipal implications',
        'Ensuring accessibility compliance across all municipal services'
      ],
      workplaceRelationships: [
        'Legal advisor to all municipal departments',
        'Compliance consultant for project planning',
        'Risk management partner for senior leadership',
        'Training provider for regulatory updates'
      ],
      decisionMakingStyle: 'Legal analysis with risk assessment and compliance verification',
      stakeholderInteractions: [
        'Legal briefings for elected officials and senior management',
        'Compliance consultations with department heads',
        'Regulatory training for municipal staff',
        'External legal coordination with government agencies'
      ]
    },
    culturalAdaptations: [
      {
        culture: 'swedish',
        culturalAdaptation: 'Collaborative legal advisor with democratic process focus',
        communicationStyle: 'Inclusive legal explanations with consensus-building approach',
        professionalExpectations: 'Lagom legal guidance with sustainable compliance',
        localizedTitle: 'Juridisk Rådgivare',
        culturalContext: 'Swedish democratic legal tradition'
      },
      {
        culture: 'german',
        culturalAdaptation: 'Systematic legal expert with regulatory precision',
        communicationStyle: 'Methodical legal analysis with thorough documentation',
        professionalExpectations: 'Verwaltung legal excellence with systematic compliance',
        localizedTitle: 'Rechtsberater',
        culturalContext: 'German systematic legal tradition'
      },
      {
        culture: 'french',
        culturalAdaptation: 'Sophisticated legal advisor with intellectual rigor',
        communicationStyle: 'Refined legal analysis with cultural service public adaptation',
        professionalExpectations: 'Service public legal excellence with elegant compliance',
        localizedTitle: 'Conseiller Juridique',
        culturalContext: 'French intellectual legal tradition'
      },
      {
        culture: 'dutch',
        culturalAdaptation: 'Practical legal advisor with efficient compliance',
        communicationStyle: 'Direct legal guidance with practical implementation focus',
        professionalExpectations: 'Bestuur legal support with straightforward compliance',
        localizedTitle: 'Juridisch Adviseur',
        culturalContext: 'Dutch pragmatic legal tradition'
      }
    ],
    visualCharacteristics: {
      ageRange: '35-50 years',
      professionalStyle: 'Formal professional with authoritative legal presence',
      typicalAttire: 'Conservative business attire with professional legal accessories',
      bodyLanguage: 'Composed, analytical posture with careful gestures'
    },
    compatibilityMatrix: {
      worksWellWith: ['institutional_memory', 'strategic_leader', 'policy_analyst'],
      potentialTensions: ['change_agent', 'community_engagement'],
      mentorshipCapability: 'medium',
      leadershipStyle: 'Consultative with legal expertise authority'
    }
  },

  budget_specialist: {
    archetypeId: 'budget_specialist',
    displayName: 'Budget & Finance Specialist',
    description: 'Financial expert managing municipal budgets and fiscal planning',
    experience: '6-15 years financial management experience',
    expertise: ['budget_planning', 'financial_analysis', 'fiscal_compliance', 'cost_management', 'financial_reporting'],
    personality: {
      wisdom: 'Strategic understanding of municipal finance and fiscal responsibility',
      patience: 'Moderate patience with detail-oriented financial processes',
      stability: 'High stability with systematic financial management',
      adaptability: 'Moderate adaptability with careful financial change assessment',
      communication: 'Clear, data-driven with financial accuracy',
      innovation: 'Selective innovation in financial processes and systems'
    },
    emotionalCapabilities: {
      primaryEmotions: ['analytical', 'concerned', 'satisfied'],
      secondaryEmotions: ['determined', 'questioning', 'neutral'],
      emotionalRange: 'Steady with occasional stress during budget cycles',
      stressResponse: 'Systematic financial analysis with comprehensive documentation'
    },
    municipalContext: {
      typicalScenarios: [
        'Annual budget planning and resource allocation',
        'Financial impact analysis for new programs and initiatives',
        'Budget variance analysis and corrective action planning',
        'Financial compliance audits and reporting',
        'Cost-benefit analysis for municipal investments'
      ],
      commonChallenges: [
        'Balancing fiscal responsibility with service delivery needs',
        'Managing budget constraints while maintaining service quality',
        'Communicating financial limitations to non-financial stakeholders',
        'Ensuring transparency and accountability in financial management'
      ],
      workplaceRelationships: [
        'Financial advisor to all municipal departments',
        'Budget planning partner with department heads',
        'Financial reporting coordinator with senior leadership',
        'Compliance liaison with external auditors'
      ],
      decisionMakingStyle: 'Data-driven financial analysis with risk assessment',
      stakeholderInteractions: [
        'Budget presentations to elected officials and senior management',
        'Financial consultations with department heads',
        'Public financial reporting and transparency initiatives',
        'External audit coordination and response'
      ]
    },
    culturalAdaptations: [
      {
        culture: 'swedish',
        culturalAdaptation: 'Transparent financial steward with democratic accountability',
        communicationStyle: 'Inclusive financial discussions with consensus-building approach',
        professionalExpectations: 'Lagom financial management with sustainable fiscal planning',
        localizedTitle: 'Budget och Ekonomispecialist',
        culturalContext: 'Swedish democratic financial tradition'
      },
      {
        culture: 'german',
        culturalAdaptation: 'Systematic financial expert with regulatory precision',
        communicationStyle: 'Methodical financial analysis with thorough documentation',
        professionalExpectations: 'Verwaltung financial excellence with systematic management',
        localizedTitle: 'Haushalts- und Finanzexperte',
        culturalContext: 'German systematic financial tradition'
      },
      {
        culture: 'french',
        culturalAdaptation: 'Sophisticated financial advisor with intellectual rigor',
        communicationStyle: 'Refined financial analysis with cultural service public adaptation',
        professionalExpectations: 'Service public financial excellence with elegant management',
        localizedTitle: 'Spécialiste Budget et Finance',
        culturalContext: 'French intellectual financial tradition'
      },
      {
        culture: 'dutch',
        culturalAdaptation: 'Practical financial advisor with efficient management',
        communicationStyle: 'Direct financial guidance with practical implementation focus',
        professionalExpectations: 'Bestuur financial support with straightforward management',
        localizedTitle: 'Budget en Financiën Specialist',
        culturalContext: 'Dutch pragmatic financial tradition'
      }
    ],
    visualCharacteristics: {
      ageRange: '30-45 years',
      professionalStyle: 'Professional appearance with attention to detail',
      typicalAttire: 'Business professional attire with organizational accessories',
      bodyLanguage: 'Focused, analytical posture with precise gestures'
    },
    compatibilityMatrix: {
      worksWellWith: ['strategic_leader', 'compliance_guardian', 'policy_analyst'],
      potentialTensions: ['change_agent', 'community_engagement'],
      mentorshipCapability: 'medium',
      leadershipStyle: 'Analytical with financial expertise authority'
    }
  },

  sustainability_coordinator: {
    archetypeId: 'sustainability_coordinator',
    displayName: 'Environmental Sustainability Coordinator',
    description: 'Environmental expert leading municipal sustainability initiatives and green programs',
    experience: '5-12 years environmental and sustainability experience',
    expertise: ['environmental_planning', 'sustainability_programs', 'stakeholder_engagement', 'project_management', 'green_initiatives'],
    personality: {
      wisdom: 'Long-term environmental thinking with practical implementation skills',
      patience: 'High patience with complex environmental processes',
      stability: 'Moderate stability with passionate environmental advocacy',
      adaptability: 'High adaptability with innovative environmental solutions',
      communication: 'Passionate, educational with scientific accuracy',
      innovation: 'High innovation in environmental solutions and programs'
    },
    emotionalCapabilities: {
      primaryEmotions: ['determined', 'collaborative', 'supportive'],
      secondaryEmotions: ['concerned', 'analytical', 'satisfied'],
      emotionalRange: 'Passionate with occasional frustration at slow environmental progress',
      stressResponse: 'Channels stress into creative environmental problem-solving'
    },
    municipalContext: {
      typicalScenarios: [
        'Environmental impact assessments for municipal projects',
        'Community sustainability program development and implementation',
        'Green infrastructure planning and coordination',
        'Environmental compliance monitoring and reporting',
        'Stakeholder engagement for environmental initiatives'
      ],
      commonChallenges: [
        'Balancing environmental goals with budget constraints',
        'Building consensus for environmental initiatives among diverse stakeholders',
        'Managing long-term environmental projects with political changes',
        'Communicating complex environmental science to non-technical audiences'
      ],
      workplaceRelationships: [
        'Environmental advisor to all municipal departments',
        'Sustainability champion for community engagement',
        'Project coordinator for green infrastructure initiatives',
        'Policy development partner for environmental regulations'
      ],
      decisionMakingStyle: 'Evidence-based environmental analysis with stakeholder engagement',
      stakeholderInteractions: [
        'Community presentations on sustainability initiatives',
        'Policy briefings for elected officials on environmental issues',
        'Collaborative workshops with businesses and community groups',
        'Technical consultations with environmental agencies'
      ]
    },
    culturalAdaptations: [
      {
        culture: 'swedish',
        culturalAdaptation: 'Consensus-building environmental leader with democratic approach',
        communicationStyle: 'Inclusive environmental discussions with collaborative decision-making',
        professionalExpectations: 'Lagom environmental approach with sustainable implementation',
        localizedTitle: 'Miljö- och Hållbarhetskoordinator',
        culturalContext: 'Swedish environmental leadership tradition'
      },
      {
        culture: 'german',
        culturalAdaptation: 'Systematic environmental expert with regulatory precision',
        communicationStyle: 'Methodical environmental planning with thorough analysis',
        professionalExpectations: 'Verwaltung environmental excellence with systematic implementation',
        localizedTitle: 'Umwelt- und Nachhaltigkeitskoordinator',
        culturalContext: 'German systematic environmental tradition'
      },
      {
        culture: 'french',
        culturalAdaptation: 'Sophisticated environmental strategist with intellectual approach',
        communicationStyle: 'Refined environmental vision with cultural service public adaptation',
        professionalExpectations: 'Service public environmental excellence with elegant implementation',
        localizedTitle: 'Coordinateur Environnement et Durabilité',
        culturalContext: 'French intellectual environmental tradition'
      },
      {
        culture: 'dutch',
        culturalAdaptation: 'Practical environmental leader with innovative solutions',
        communicationStyle: 'Direct environmental communication with results-focused approach',
        professionalExpectations: 'Bestuur environmental leadership with straightforward implementation',
        localizedTitle: 'Milieu en Duurzaamheid Coördinator',
        culturalContext: 'Dutch pragmatic environmental tradition'
      }
    ],
    visualCharacteristics: {
      ageRange: '28-42 years',
      professionalStyle: 'Modern professional with environmental consciousness',
      typicalAttire: 'Sustainable business attire with environmental accessories',
      bodyLanguage: 'Energetic, passionate posture with engaging gestures'
    },
    compatibilityMatrix: {
      worksWellWith: ['change_agent', 'community_engagement', 'policy_analyst'],
      potentialTensions: ['budget_specialist', 'compliance_guardian'],
      mentorshipCapability: 'medium',
      leadershipStyle: 'Inspirational with environmental vision'
    }
  },

  emergency_manager: {
    archetypeId: 'emergency_manager',
    displayName: 'Emergency Preparedness Manager',
    description: 'Crisis management expert responsible for municipal emergency planning and response',
    experience: '8-18 years emergency management and public safety experience',
    expertise: ['emergency_planning', 'crisis_management', 'risk_assessment', 'coordination', 'public_safety'],
    personality: {
      wisdom: 'Strategic understanding of risk management and crisis response',
      patience: 'Moderate patience with high-stress decision-making capability',
      stability: 'High stability under pressure with systematic crisis management',
      adaptability: 'High adaptability with rapid response capability',
      communication: 'Clear, decisive with crisis communication expertise',
      innovation: 'Practical innovation in emergency preparedness and response'
    },
    emotionalCapabilities: {
      primaryEmotions: ['determined', 'confident', 'analytical'],
      secondaryEmotions: ['concerned', 'collaborative', 'supportive'],
      emotionalRange: 'Controlled with intensity during crisis situations',
      stressResponse: 'Systematic crisis management with clear command structure'
    },
    municipalContext: {
      typicalScenarios: [
        'Emergency response plan development and testing',
        'Crisis situation coordination and command',
        'Risk assessment for municipal events and infrastructure',
        'Emergency training for municipal staff and community',
        'Inter-agency coordination for emergency preparedness'
      ],
      commonChallenges: [
        'Balancing preparedness investment with competing municipal priorities',
        'Coordinating multiple agencies and stakeholders during crises',
        'Maintaining readiness during long periods without emergencies',
        'Communicating emergency information to diverse community populations'
      ],
      workplaceRelationships: [
        'Emergency coordination leader for all municipal departments',
        'Liaison with external emergency services and agencies',
        'Training coordinator for emergency preparedness',
        'Risk assessment advisor for municipal events and infrastructure'
      ],
      decisionMakingStyle: 'Rapid assessment with systematic emergency protocols',
      stakeholderInteractions: [
        'Emergency briefings for elected officials and senior management',
        'Crisis communication to media and public',
        'Coordination meetings with emergency services and agencies',
        'Community emergency preparedness training and education'
      ]
    },
    culturalAdaptations: [
      {
        culture: 'swedish',
        culturalAdaptation: 'Collaborative emergency leader with democratic crisis management',
        communicationStyle: 'Inclusive emergency planning with consensus-building approach',
        professionalExpectations: 'Lagom emergency preparedness with sustainable crisis management',
        localizedTitle: 'Beredskaps- och Krishanteringsansvarig',
        culturalContext: 'Swedish democratic emergency management tradition'
      },
      {
        culture: 'german',
        culturalAdaptation: 'Systematic emergency expert with regulatory precision',
        communicationStyle: 'Methodical emergency planning with thorough preparation',
        professionalExpectations: 'Verwaltung emergency excellence with systematic crisis management',
        localizedTitle: 'Notfall- und Krisenmanager',
        culturalContext: 'German systematic emergency management tradition'
      },
      {
        culture: 'french',
        culturalAdaptation: 'Sophisticated emergency strategist with intellectual approach',
        communicationStyle: 'Refined emergency planning with cultural service public adaptation',
        professionalExpectations: 'Service public emergency excellence with elegant crisis management',
        localizedTitle: 'Responsable Gestion des Urgences',
        culturalContext: 'French intellectual emergency management tradition'
      },
      {
        culture: 'dutch',
        culturalAdaptation: 'Practical emergency leader with efficient crisis response',
        communicationStyle: 'Direct emergency communication with results-focused approach',
        professionalExpectations: 'Bestuur emergency leadership with straightforward crisis management',
        localizedTitle: 'Noodplanning en Crisismanager',
        culturalContext: 'Dutch pragmatic emergency management tradition'
      }
    ],
    visualCharacteristics: {
      ageRange: '35-50 years',
      professionalStyle: 'Authoritative professional with command presence',
      typicalAttire: 'Professional uniform or business attire with emergency accessories',
      bodyLanguage: 'Alert, confident posture with commanding presence'
    },
    compatibilityMatrix: {
      worksWellWith: ['strategic_leader', 'compliance_guardian', 'municipal_it_coordinator'],
      potentialTensions: ['community_engagement', 'sustainability_coordinator'],
      mentorshipCapability: 'high',
      leadershipStyle: 'Command with collaborative planning'
    }
  },

  community_engagement: {
    archetypeId: 'community_engagement',
    displayName: 'Community Engagement Specialist',
    description: 'Stakeholder engagement expert facilitating community participation in municipal processes',
    experience: '4-10 years community engagement and public participation experience',
    expertise: ['stakeholder_engagement', 'public_participation', 'communication', 'event_coordination', 'community_relations'],
    personality: {
      wisdom: 'Deep understanding of community dynamics and stakeholder needs',
      patience: 'High patience with diverse community perspectives',
      stability: 'Moderate stability with passionate community advocacy',
      adaptability: 'High adaptability to changing community needs',
      communication: 'Excellent interpersonal skills with accessibility focus',
      innovation: 'Creative innovation in engagement methods and community connection'
    },
    emotionalCapabilities: {
      primaryEmotions: ['collaborative', 'supportive', 'determined'],
      secondaryEmotions: ['concerned', 'satisfied', 'questioning'],
      emotionalRange: 'Passionate with empathetic responses to community concerns',
      stressResponse: 'Channels stress into creative community problem-solving'
    },
    municipalContext: {
      typicalScenarios: [
        'Community consultation for municipal policies and programs',
        'Public meeting facilitation and stakeholder engagement',
        'Community feedback collection and analysis',
        'Accessibility accommodation for diverse community participation',
        'Conflict resolution for competing community interests'
      ],
      commonChallenges: [
        'Balancing diverse and competing community interests',
        'Ensuring representative participation from all community groups',
        'Managing community expectations with municipal constraints',
        'Communicating complex municipal processes to diverse audiences'
      ],
      workplaceRelationships: [
        'Community liaison for all municipal departments',
        'Stakeholder engagement coordinator for municipal projects',
        'Public participation facilitator for policy development',
        'Community feedback interpreter for municipal leadership'
      ],
      decisionMakingStyle: 'Community-centered with inclusive participation focus',
      stakeholderInteractions: [
        'Community meetings and public consultations',
        'Stakeholder workshops and engagement sessions',
        'Media relations and public communication',
        'Accessibility accommodation coordination'
      ]
    },
    culturalAdaptations: [
      {
        culture: 'swedish',
        culturalAdaptation: 'Consensus-building community facilitator with democratic engagement',
        communicationStyle: 'Inclusive community discussions with collaborative decision-making',
        professionalExpectations: 'Lagom community approach with sustainable engagement',
        localizedTitle: 'Medborgarengagemang Specialist',
        culturalContext: 'Swedish democratic participation tradition'
      },
      {
        culture: 'german',
        culturalAdaptation: 'Systematic community expert with structured engagement',
        communicationStyle: 'Methodical community consultation with thorough documentation',
        professionalExpectations: 'Verwaltung community excellence with systematic participation',
        localizedTitle: 'Bürgerbeteiligung Spezialist',
        culturalContext: 'German systematic community engagement tradition'
      },
      {
        culture: 'french',
        culturalAdaptation: 'Sophisticated community strategist with intellectual engagement',
        communicationStyle: 'Refined community consultation with cultural service public adaptation',
        professionalExpectations: 'Service public community excellence with elegant participation',
        localizedTitle: 'Spécialiste Engagement Communautaire',
        culturalContext: 'French intellectual community engagement tradition'
      },
      {
        culture: 'dutch',
        culturalAdaptation: 'Practical community leader with efficient engagement',
        communicationStyle: 'Direct community communication with results-focused approach',
        professionalExpectations: 'Bestuur community leadership with straightforward participation',
        localizedTitle: 'Community Engagement Specialist',
        culturalContext: 'Dutch pragmatic community engagement tradition'
      }
    ],
    visualCharacteristics: {
      ageRange: '26-40 years',
      professionalStyle: 'Approachable professional with community-oriented presence',
      typicalAttire: 'Accessible business casual with community-friendly appearance',
      bodyLanguage: 'Open, welcoming posture with engaging, inclusive gestures'
    },
    compatibilityMatrix: {
      worksWellWith: ['frontline_professional', 'sustainability_coordinator', 'change_agent'],
      potentialTensions: ['compliance_guardian', 'strategic_leader'],
      mentorshipCapability: 'medium',
      leadershipStyle: 'Facilitative with community empowerment'
    }
  },

  municipal_it_coordinator: {
    archetypeId: 'municipal_it_coordinator',
    displayName: 'Municipal IT Coordinator',
    description: 'Technology specialist managing municipal IT systems and digital infrastructure',
    experience: '6-12 years IT management and municipal technology experience',
    expertise: ['it_systems', 'digital_infrastructure', 'cybersecurity', 'system_integration', 'technical_support'],
    personality: {
      wisdom: 'Technical expertise with practical municipal technology understanding',
      patience: 'Moderate patience with technical problem-solving persistence',
      stability: 'High stability with systematic technology management',
      adaptability: 'High adaptability to changing technology landscape',
      communication: 'Clear technical communication with accessibility focus',
      innovation: 'High innovation in municipal technology solutions'
    },
    emotionalCapabilities: {
      primaryEmotions: ['analytical', 'determined', 'confident'],
      secondaryEmotions: ['concerned', 'collaborative', 'questioning'],
      emotionalRange: 'Focused with occasional frustration at technical constraints',
      stressResponse: 'Systematic technical problem-solving with methodical approach'
    },
    municipalContext: {
      typicalScenarios: [
        'Municipal IT system maintenance and upgrades',
        'Cybersecurity threat assessment and response',
        'Technology training for non-technical municipal staff',
        'Digital accessibility compliance for municipal systems',
        'Integration of new technologies with legacy municipal systems'
      ],
      commonChallenges: [
        'Balancing technology advancement with budget constraints',
        'Ensuring cybersecurity while maintaining system accessibility',
        'Supporting diverse technical skill levels among municipal staff',
        'Integrating new technologies with established municipal processes'
      ],
      workplaceRelationships: [
        'Technical support provider for all municipal departments',
        'IT security coordinator for municipal infrastructure',
        'Technology training facilitator for municipal staff',
        'System integration specialist for departmental coordination'
      ],
      decisionMakingStyle: 'Technical analysis with security and accessibility assessment',
      stakeholderInteractions: [
        'Technical briefings for non-technical leadership',
        'IT support consultations with municipal staff',
        'Vendor coordination for technology procurement',
        'Cybersecurity training for municipal employees'
      ]
    },
    culturalAdaptations: [
      {
        culture: 'swedish',
        culturalAdaptation: 'Collaborative IT leader with democratic technology approach',
        communicationStyle: 'Inclusive technical discussions with consensus-building approach',
        professionalExpectations: 'Lagom technology approach with sustainable IT management',
        localizedTitle: 'IT-koordinator',
        culturalContext: 'Swedish democratic technology tradition'
      },
      {
        culture: 'german',
        culturalAdaptation: 'Systematic IT expert with regulatory precision',
        communicationStyle: 'Methodical technical planning with thorough documentation',
        professionalExpectations: 'Verwaltung IT excellence with systematic technology management',
        localizedTitle: 'IT-Koordinator',
        culturalContext: 'German systematic technology tradition'
      },
      {
        culture: 'french',
        culturalAdaptation: 'Sophisticated IT strategist with intellectual approach',
        communicationStyle: 'Refined technical planning with cultural service public adaptation',
        professionalExpectations: 'Service public IT excellence with elegant technology management',
        localizedTitle: 'Coordinateur Informatique',
        culturalContext: 'French intellectual technology tradition'
      },
      {
        culture: 'dutch',
        culturalAdaptation: 'Practical IT leader with efficient technology management',
        communicationStyle: 'Direct technical communication with results-focused approach',
        professionalExpectations: 'Bestuur IT leadership with straightforward technology management',
        localizedTitle: 'IT Coördinator',
        culturalContext: 'Dutch pragmatic technology tradition'
      }
    ],
    visualCharacteristics: {
      ageRange: '30-45 years',
      professionalStyle: 'Modern professional with technical competence',
      typicalAttire: 'Business casual with technical accessories',
      bodyLanguage: 'Focused, analytical posture with precise technical gestures'
    },
    compatibilityMatrix: {
      worksWellWith: ['change_agent', 'emergency_manager', 'strategic_leader'],
      potentialTensions: ['institutional_memory', 'compliance_guardian'],
      mentorshipCapability: 'medium',
      leadershipStyle: 'Technical with collaborative problem-solving'
    }
  },

  policy_analyst: {
    archetypeId: 'policy_analyst',
    displayName: 'Policy Analyst',
    description: 'Research and analysis expert supporting municipal policy development and evaluation',
    experience: '5-12 years policy analysis and research experience',
    expertise: ['policy_analysis', 'research_methodology', 'data_analysis', 'stakeholder_consultation', 'policy_development'],
    personality: {
      wisdom: 'Analytical understanding of policy implications and long-term consequences',
      patience: 'High patience with complex policy development processes',
      stability: 'High stability with systematic policy analysis',
      adaptability: 'Moderate adaptability with careful policy change assessment',
      communication: 'Clear, evidence-based with accessibility focus',
      innovation: 'Selective innovation in policy approaches and analysis methods'
    },
    emotionalCapabilities: {
      primaryEmotions: ['analytical', 'questioning', 'collaborative'],
      secondaryEmotions: ['concerned', 'determined', 'neutral'],
      emotionalRange: 'Controlled with occasional passionate advocacy for evidence-based policy',
      stressResponse: 'Systematic research and analysis with comprehensive documentation'
    },
    municipalContext: {
      typicalScenarios: [
        'Policy impact assessment and evaluation',
        'Research and analysis for policy development',
        'Stakeholder consultation for policy initiatives',
        'Best practice analysis for municipal improvement',
        'Policy compliance monitoring and reporting'
      ],
      commonChallenges: [
        'Balancing thorough analysis with policy development timelines',
        'Communicating complex policy analysis to diverse stakeholders',
        'Managing competing policy priorities with limited resources',
        'Ensuring policy accessibility and inclusion for all community members'
      ],
      workplaceRelationships: [
        'Policy research support for all municipal departments',
        'Analysis partner for senior leadership policy development',
        'Research coordinator for evidence-based decision making',
        'Policy evaluation specialist for program assessment'
      ],
      decisionMakingStyle: 'Evidence-based analysis with stakeholder consultation',
      stakeholderInteractions: [
        'Policy briefings for elected officials and senior management',
        'Research presentations to department heads',
        'Stakeholder consultations for policy development',
        'Public policy explanation and education'
      ]
    },
    culturalAdaptations: [
      {
        culture: 'swedish',
        culturalAdaptation: 'Consensus-building policy expert with democratic analysis',
        communicationStyle: 'Inclusive policy discussions with collaborative decision-making',
        professionalExpectations: 'Lagom policy approach with sustainable analysis',
        localizedTitle: 'Policyanalytiker',
        culturalContext: 'Swedish democratic policy tradition'
      },
      {
        culture: 'german',
        culturalAdaptation: 'Systematic policy expert with regulatory precision',
        communicationStyle: 'Methodical policy analysis with thorough documentation',
        professionalExpectations: 'Verwaltung policy excellence with systematic analysis',
        localizedTitle: 'Policy-Analyst',
        culturalContext: 'German systematic policy tradition'
      },
      {
        culture: 'french',
        culturalAdaptation: 'Sophisticated policy strategist with intellectual approach',
        communicationStyle: 'Refined policy analysis with cultural service public adaptation',
        professionalExpectations: 'Service public policy excellence with elegant analysis',
        localizedTitle: 'Analyste de Politiques',
        culturalContext: 'French intellectual policy tradition'
      },
      {
        culture: 'dutch',
        culturalAdaptation: 'Practical policy expert with efficient analysis',
        communicationStyle: 'Direct policy communication with results-focused approach',
        professionalExpectations: 'Bestuur policy leadership with straightforward analysis',
        localizedTitle: 'Beleidsanalist',
        culturalContext: 'Dutch pragmatic policy tradition'
      }
    ],
    visualCharacteristics: {
      ageRange: '28-42 years',
      professionalStyle: 'Analytical professional with intellectual presence',
      typicalAttire: 'Professional business attire with research accessories',
      bodyLanguage: 'Thoughtful, analytical posture with careful gestures'
    },
    compatibilityMatrix: {
      worksWellWith: ['strategic_leader', 'compliance_guardian', 'budget_specialist'],
      potentialTensions: ['community_engagement', 'frontline_professional'],
      mentorshipCapability: 'medium',
      leadershipStyle: 'Consultative with analytical expertise'
    }
  },

  citizen_service_lead: {
    archetypeId: 'citizen_service_lead',
    displayName: 'Citizen Service Lead',
    description: 'Senior service professional leading citizen service excellence and team coordination',
    experience: '8-15 years progressive citizen service and team leadership experience',
    expertise: ['service_excellence', 'team_leadership', 'process_improvement', 'citizen_advocacy', 'quality_management'],
    personality: {
      wisdom: 'Comprehensive understanding of citizen service excellence and team dynamics',
      patience: 'High patience with complex citizen situations and team development',
      stability: 'High stability with consistent service leadership',
      adaptability: 'High adaptability to changing citizen needs and service requirements',
      communication: 'Excellent interpersonal skills with team coaching capability',
      innovation: 'Practical innovation in service delivery and team management'
    },
    emotionalCapabilities: {
      primaryEmotions: ['supportive', 'collaborative', 'confident'],
      secondaryEmotions: ['determined', 'satisfied', 'concerned'],
      emotionalRange: 'Steady leadership with passionate advocacy for citizen service excellence',
      stressResponse: 'Systematic service management with team support and citizen advocacy'
    },
    municipalContext: {
      typicalScenarios: [
        'Citizen service team leadership and development',
        'Complex citizen case escalation and resolution',
        'Service quality improvement initiatives',
        'Team training and professional development coordination',
        'Citizen feedback analysis and service enhancement'
      ],
      commonChallenges: [
        'Balancing team development with citizen service demands',
        'Managing service quality with resource constraints',
        'Leading diverse teams with varying experience levels',
        'Ensuring consistent service excellence across all citizen interactions'
      ],
      workplaceRelationships: [
        'Team leader for citizen service representatives',
        'Service excellence coordinator for municipal departments',
        'Citizen advocacy liaison with senior leadership',
        'Professional development mentor for service staff'
      ],
      decisionMakingStyle: 'Citizen-centered with team consultation and service excellence focus',
      stakeholderInteractions: [
        'Team leadership and professional development',
        'Citizen service excellence initiatives',
        'Service quality reporting to senior leadership',
        'Cross-departmental service coordination'
      ]
    },
    culturalAdaptations: [
      {
        culture: 'swedish',
        culturalAdaptation: 'Consensus-building service leader with democratic team approach',
        communicationStyle: 'Inclusive team leadership with collaborative service excellence',
        professionalExpectations: 'Lagom service leadership with sustainable team development',
        localizedTitle: 'Medborgarservice Chef',
        culturalContext: 'Swedish democratic service leadership tradition'
      },
      {
        culture: 'german',
        culturalAdaptation: 'Systematic service leader with structured team management',
        communicationStyle: 'Methodical service leadership with thorough team development',
        professionalExpectations: 'Verwaltung service excellence with systematic team management',
        localizedTitle: 'Bürgerservice Leiter',
        culturalContext: 'German systematic service leadership tradition'
      },
      {
        culture: 'french',
        culturalAdaptation: 'Sophisticated service leader with refined team approach',
        communicationStyle: 'Refined service leadership with cultural service public excellence',
        professionalExpectations: 'Service public leadership with elegant team development',
        localizedTitle: 'Chef de Service Citoyen',
        culturalContext: 'French service public leadership tradition'
      },
      {
        culture: 'dutch',
        culturalAdaptation: 'Practical service leader with efficient team management',
        communicationStyle: 'Direct service leadership with results-focused team approach',
        professionalExpectations: 'Bestuur service leadership with straightforward team development',
        localizedTitle: 'Burgerservice Teamleider',
        culturalContext: 'Dutch pragmatic service leadership tradition'
      }
    ],
    visualCharacteristics: {
      ageRange: '35-50 years',
      professionalStyle: 'Approachable leadership presence with service excellence focus',
      typicalAttire: 'Professional service attire with leadership accessories',
      bodyLanguage: 'Confident, supportive posture with inclusive leadership gestures'
    },
    compatibilityMatrix: {
      worksWellWith: ['frontline_professional', 'strategic_leader', 'community_engagement'],
      potentialTensions: ['compliance_guardian', 'policy_analyst'],
      mentorshipCapability: 'high',
      leadershipStyle: 'Supportive with service excellence focus'
    }
  }
};

// Archetype utility functions
export const getArchetypeById = (archetypeId: MunicipalArchetypeId): MunicipalCharacterArchetype => {
  return municipalArchetypes[archetypeId];
};

export const getArchetypesByExperience = (minYears: number, maxYears: number): MunicipalCharacterArchetype[] => {
  return Object.values(municipalArchetypes).filter(archetype => {
    const experienceRange = archetype.experience.match(/(\d+)-(\d+)/);
    if (!experienceRange) return false;
    const minExp = parseInt(experienceRange[1]);
    const maxExp = parseInt(experienceRange[2]);
    return minExp >= minYears && maxExp <= maxYears;
  });
};

export const getCompatibleArchetypes = (archetypeId: MunicipalArchetypeId): MunicipalArchetypeId[] => {
  const archetype = municipalArchetypes[archetypeId];
  return archetype.compatibilityMatrix.worksWellWith;
};

export const getArchetypeTensions = (archetypeId: MunicipalArchetypeId): MunicipalArchetypeId[] => {
  const archetype = municipalArchetypes[archetypeId];
  return archetype.compatibilityMatrix.potentialTensions;
};

export const getCulturalArchetypeVariant = (
  archetypeId: MunicipalArchetypeId,
  culture: 'swedish' | 'german' | 'french' | 'dutch'
): CulturalArchetypeVariant | undefined => {
  const archetype = municipalArchetypes[archetypeId];
  return archetype.culturalAdaptations.find(variant => variant.culture === culture);
};

export const getArchetypesByPrimaryEmotion = (emotion: string): MunicipalCharacterArchetype[] => {
  return Object.values(municipalArchetypes).filter(archetype => 
    archetype.emotionalCapabilities.primaryEmotions.includes(emotion)
  );
};

export const getArchetypesByExpertise = (expertise: string): MunicipalCharacterArchetype[] => {
  return Object.values(municipalArchetypes).filter(archetype => 
    archetype.expertise.includes(expertise)
  );
};