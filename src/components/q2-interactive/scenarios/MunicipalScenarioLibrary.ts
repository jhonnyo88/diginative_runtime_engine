/**
 * Municipal Scenario Library - Comprehensive Decision-Making Scenarios
 * Task: proposal-033 - Q2 Interactive Mechanics Implementation
 * 
 * Pre-built municipal scenarios för branching narratives
 * Cultural adaptation and educational objectives
 */

interface NarrativeChoice {
  id: string;
  text: string;
  consequence: string;
  characterImpact: {
    [characterId: string]: {
      emotionChange: number;
      relationshipChange: number;
      competenceGain?: string[];
    };
  };
  municipalImpact: {
    budgetChange?: number;
    reputationChange?: number;
    complianceRisk?: 'low' | 'medium' | 'high';
    stakeholderReaction?: string[];
  };
  culturalVariations?: {
    [locale: string]: {
      text: string;
      consequence: string;
      stakeholderReaction?: string[];
    };
  };
}

interface NarrativeNode {
  id: string;
  type: 'story' | 'decision' | 'consequence' | 'ending';
  title: string;
  description: string;
  speaker?: string;
  characterEmotions?: {
    [characterId: string]: string;
  };
  choices?: NarrativeChoice[];
  nextNode?: string;
  conditions?: {
    characterRelationships?: { [characterId: string]: number };
    municipalStatus?: { budget: number; reputation: number };
    timeLimit?: number;
  };
  culturalAdaptations?: {
    [locale: string]: {
      title: string;
      description: string;
      speaker?: string;
    };
  };
}

interface MunicipalScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  municipality: 'malmö' | 'göteborg' | 'stockholm' | 'berlin' | 'paris' | 'amsterdam';
  category: 'budget_crisis' | 'service_delivery' | 'emergency_response' | 'regulatory_compliance' | 'stakeholder_conflict';
  estimatedTime: number;
  nodes: NarrativeNode[];
  startingConditions: {
    budget: number;
    reputation: number;
    timeRemaining: number;
  };
  learningObjectives: string[];
  culturalContext: {
    [locale: string]: {
      title: string;
      description: string;
      stakeholders: string[];
      regulations: string[];
    };
  };
}

export const MUNICIPAL_SCENARIOS: MunicipalScenario[] = [
  {
    id: 'budget_crisis_malmoe_2024',
    title: 'Budget Crisis: Winter Service Cuts',
    description: 'Malmö faces a 15% budget shortfall. Difficult decisions must be made about winter services.',
    difficulty: 4,
    municipality: 'malmö',
    category: 'budget_crisis',
    estimatedTime: 25,
    startingConditions: {
      budget: 45, // Out of 100
      reputation: 65,
      timeRemaining: 120 // 2 hours
    },
    learningObjectives: [
      'Financial crisis management',
      'Stakeholder communication',
      'Service prioritization',
      'Political negotiation'
    ],
    culturalContext: {
      sv: {
        title: 'Budgetkris: Nedskärningar i Vintertjänster',
        description: 'Malmö stad står inför en budgetunderskott på 15%. Svåra beslut måste tas om vintertjänster.',
        stakeholders: ['Kommunfullmäktige', 'Gatukontoret', 'Företagarna', 'Hyresgästföreningen'],
        regulations: ['Kommunallagen', 'Vinterväghållning förordning', 'Trafikförordningen']
      },
      de: {
        title: 'Haushaltskrise: Kürzungen bei Winterdiensten',
        description: 'Malmö steht vor einem Haushaltsdefizit von 15%. Schwierige Entscheidungen über Winterdienste müssen getroffen werden.',
        stakeholders: ['Gemeinderat', 'Straßenamt', 'Unternehmerverband', 'Mieterverein'],
        regulations: ['Gemeindeordnung', 'Winterdienstverordnung', 'Straßenverkehrsordnung']
      },
      fr: {
        title: 'Crise budgétaire: Réductions des services hivernaux',
        description: 'Malmö fait face à un déficit budgétaire de 15%. Des décisions difficiles doivent être prises concernant les services hivernaux.',
        stakeholders: ['Conseil municipal', 'Service de voirie', 'Patronat', 'Association locataires'],
        regulations: ['Code collectivités territoriales', 'Règlement service hivernal', 'Code de la route']
      },
      nl: {
        title: 'Begrotingscrisis: Bezuinigingen op winterdienst',
        description: 'Malmö staat voor een begrotingstekort van 15%. Moeilijke beslissingen over winterdiensten moeten worden genomen.',
        stakeholders: ['Gemeenteraad', 'Dienst openbare werken', 'Ondernemersvereniging', 'Huurdersvereniging'],
        regulations: ['Gemeentewet', 'Winterdienstverordening', 'Wegenverkeersreglement']
      }
    },
    nodes: [
      {
        id: 'opening_crisis',
        type: 'story',
        title: 'Emergency Budget Meeting',
        description: 'You enter the municipal meeting room. Department heads look concerned as the Finance Director presents alarming budget projections on the screen.',
        speaker: 'Finance Director Eva Lindqvist',
        characterEmotions: {
          'eva_lindqvist': 'concerned',
          'street_department_head': 'worried',
          'citizen_representative': 'neutral'
        },
        nextNode: 'first_decision_point',
        culturalAdaptations: {
          sv: {
            title: 'Krismöte om Budget',
            description: 'Du kommer in i kommunens mötesrum. Förvaltningscheferna ser bekymrade ut när ekonomidirektören presenterar alarmerande budgetprognoser på skärmen.',
            speaker: 'Ekonomidirektör Eva Lindqvist'
          },
          de: {
            title: 'Notfall-Haushaltssitzung',
            description: 'Sie betreten den Sitzungsraum der Gemeinde. Die Abteilungsleiter sehen besorgt aus, während der Finanzdirektor alarmierende Haushaltsprognosen präsentiert.',
            speaker: 'Finanzdirektor Eva Lindqvist'
          }
        }
      },
      {
        id: 'first_decision_point',
        type: 'decision',
        title: 'Initial Response Strategy',
        description: 'Eva explains: "We need to cut 12 million SEK from winter services. The question is how to approach this crisis."',
        speaker: 'Finance Director Eva Lindqvist',
        characterEmotions: {
          'eva_lindqvist': 'analytical',
          'street_department_head': 'defensive',
          'citizen_representative': 'concerned'
        },
        choices: [
          {
            id: 'transparent_approach',
            text: 'Be completely transparent with citizens about the crisis',
            consequence: 'Citizens appreciate honesty but panic about service cuts spreads',
            characterImpact: {
              'citizen_representative': { emotionChange: 10, relationshipChange: 15 },
              'eva_lindqvist': { emotionChange: 5, relationshipChange: 10 },
              'street_department_head': { emotionChange: -5, relationshipChange: -5 }
            },
            municipalImpact: {
              budgetChange: 0,
              reputationChange: 10,
              complianceRisk: 'low',
              stakeholderReaction: ['citizens_appreciate_honesty', 'media_coverage_increases']
            },
            culturalVariations: {
              sv: {
                text: 'Var helt transparent med medborgarna om krisen',
                consequence: 'Medborgarna uppskattar ärligheten men panik om nedskärningar sprider sig',
                stakeholderReaction: ['medborgare_uppskattar_ärlighet', 'mediebevakning_ökar']
              },
              de: {
                text: 'Seien Sie völlig transparent mit den Bürgern über die Krise',
                consequence: 'Bürger schätzen Ehrlichkeit, aber Panik über Kürzungen verbreitet sich',
                stakeholderReaction: ['bürger_schätzen_ehrlichkeit', 'medienberichterstattung_steigt']
              }
            }
          },
          {
            id: 'gradual_disclosure',
            text: 'Reveal information gradually to avoid panic',
            consequence: 'Maintains calm but risks being seen as secretive when full extent emerges',
            characterImpact: {
              'eva_lindqvist': { emotionChange: 0, relationshipChange: 5 },
              'street_department_head': { emotionChange: 5, relationshipChange: 5 },
              'citizen_representative': { emotionChange: -10, relationshipChange: -10 }
            },
            municipalImpact: {
              budgetChange: 0,
              reputationChange: -5,
              complianceRisk: 'medium',
              stakeholderReaction: ['temporary_calm', 'future_trust_issues']
            },
            culturalVariations: {
              sv: {
                text: 'Avslöja information gradvis för att undvika panik',
                consequence: 'Bibehåller lugn men riskerar att ses som hemlighetsfull när hela omfattningen framkommer'
              }
            }
          },
          {
            id: 'blame_external',
            text: 'Focus blame on state government funding cuts',
            consequence: 'Deflects local criticism but creates conflict with regional authorities',
            characterImpact: {
              'citizen_representative': { emotionChange: 5, relationshipChange: 0 },
              'eva_lindqvist': { emotionChange: -5, relationshipChange: -10 },
              'regional_liaison': { emotionChange: -15, relationshipChange: -20 }
            },
            municipalImpact: {
              budgetChange: 0,
              reputationChange: 5,
              complianceRisk: 'high',
              stakeholderReaction: ['deflects_local_blame', 'state_government_conflict']
            }
          }
        ],
        culturalAdaptations: {
          sv: {
            title: 'Initial Responsestrategies',
            description: 'Eva förklarar: "Vi måste skära ner 12 miljoner kronor från vintertjänsterna. Frågan är hur vi ska hantera denna kris."',
            speaker: 'Ekonomidirektör Eva Lindqvist'
          }
        }
      },
      {
        id: 'service_prioritization',
        type: 'decision',
        title: 'Service Prioritization Decision',
        description: 'With the communication strategy decided, you must now choose which winter services to cut or reduce.',
        speaker: 'Street Department Head Lars Andersson',
        characterEmotions: {
          'lars_andersson': 'stressed',
          'eva_lindqvist': 'calculating',
          'citizen_representative': 'worried'
        },
        choices: [
          {
            id: 'cut_secondary_roads',
            text: 'Reduce snow plowing on secondary roads and bike paths',
            consequence: 'Main roads remain clear, but suburban areas and cyclists suffer',
            characterImpact: {
              'lars_andersson': { emotionChange: -5, relationshipChange: 0 },
              'cyclist_representative': { emotionChange: -15, relationshipChange: -20 },
              'suburban_representative': { emotionChange: -10, relationshipChange: -15 }
            },
            municipalImpact: {
              budgetChange: 8,
              reputationChange: -10,
              complianceRisk: 'medium',
              stakeholderReaction: ['main_roads_prioritized', 'cyclist_complaints', 'suburban_dissatisfaction']
            },
            culturalVariations: {
              sv: {
                text: 'Minska snöröjning på sekundära vägar och cykelbanor',
                consequence: 'Huvudvägarna förblir rena, men förorter och cyklister drabbas'
              }
            }
          },
          {
            id: 'reduce_salt_usage',
            text: 'Use less salt and sand, accept more icy conditions',
            consequence: 'Budget savings achieved but accident risk increases significantly',
            characterImpact: {
              'lars_andersson': { emotionChange: -10, relationshipChange: -5 },
              'safety_officer': { emotionChange: -15, relationshipChange: -20 },
              'eva_lindqvist': { emotionChange: 5, relationshipChange: 5 }
            },
            municipalImpact: {
              budgetChange: 12,
              reputationChange: -20,
              complianceRisk: 'high',
              stakeholderReaction: ['budget_savings', 'safety_concerns', 'liability_risks']
            }
          },
          {
            id: 'outsource_services',
            text: 'Outsource snow removal to private contractors',
            consequence: 'Potentially cheaper but quality and response time concerns',
            characterImpact: {
              'lars_andersson': { emotionChange: -15, relationshipChange: -15 },
              'union_representative': { emotionChange: -20, relationshipChange: -25 },
              'eva_lindqvist': { emotionChange: 10, relationshipChange: 10 }
            },
            municipalImpact: {
              budgetChange: 10,
              reputationChange: -5,
              complianceRisk: 'medium',
              stakeholderReaction: ['cost_savings', 'job_losses', 'service_quality_concerns']
            }
          }
        ],
        conditions: {
          municipalStatus: { budget: 30, reputation: 40 }
        }
      },
      {
        id: 'stakeholder_reaction',
        type: 'consequence',
        title: 'Community Response',
        description: 'The decisions have been announced. Citizens, media, and regional authorities are reacting.',
        speaker: 'Communications Director',
        characterEmotions: {
          'communications_director': 'stressed',
          'citizen_representative': 'reactive',
          'media_representative': 'investigative'
        },
        nextNode: 'final_evaluation',
        culturalAdaptations: {
          sv: {
            title: 'Samhällets Reaktion',
            description: 'Besluten har kungjorts. Medborgare, media och regionala myndigheter reagerar.',
            speaker: 'Kommunikationsdirektör'
          }
        }
      },
      {
        id: 'final_evaluation',
        type: 'ending',
        title: 'Crisis Resolution Outcome',
        description: 'Three months later, the winter crisis has passed. The long-term consequences of your decisions are becoming clear.',
        culturalAdaptations: {
          sv: {
            title: 'Krisens Slutresultat',
            description: 'Tre månader senare har vinterkrisen passerat. De långsiktiga konsekvenserna av dina beslut blir tydliga.'
          }
        }
      }
    ]
  },
  {
    id: 'service_delivery_stockholm_digitalisation',
    title: 'Digital Service Transformation',
    description: 'Stockholm must digitalize citizen services while ensuring no one is left behind.',
    difficulty: 3,
    municipality: 'stockholm',
    category: 'service_delivery',
    estimatedTime: 30,
    startingConditions: {
      budget: 70,
      reputation: 75,
      timeRemaining: 180
    },
    learningObjectives: [
      'Digital inclusion strategies',
      'Change management',
      'Accessibility compliance',
      'Multi-generational service design'
    ],
    culturalContext: {
      sv: {
        title: 'Digital Servicetransformation',
        description: 'Stockholm ska digitalisera medborgarservice samtidigt som ingen lämnas utanför.',
        stakeholders: ['IT-avdelningen', 'Medborgarservice', 'Pensionärsorganisationer', 'Digitala tjänster'],
        regulations: ['Digitaliseringslagen', 'GDPR', 'Tillgänglighetslagen', 'OSL']
      }
    },
    nodes: [
      {
        id: 'digital_initiative_start',
        type: 'story',
        title: 'Digital Transformation Kickoff',
        description: 'The IT Director presents an ambitious plan to move 80% of citizen services online within 18 months.',
        speaker: 'IT Director Anna Karlsson',
        nextNode: 'inclusion_strategy_decision'
      },
      {
        id: 'inclusion_strategy_decision',
        type: 'decision',
        title: 'Digital Inclusion Strategy',
        description: 'How will you ensure elderly and vulnerable populations can access digital services?',
        choices: [
          {
            id: 'maintain_physical_offices',
            text: 'Keep physical service offices open alongside digital services',
            consequence: 'Higher costs but ensures accessibility för all citizens',
            characterImpact: {
              'elderly_representative': { emotionChange: 15, relationshipChange: 20 },
              'it_director': { emotionChange: -5, relationshipChange: -5 }
            },
            municipalImpact: {
              budgetChange: -15,
              reputationChange: 15,
              complianceRisk: 'low'
            }
          },
          {
            id: 'digital_literacy_program',
            text: 'Invest in comprehensive digital literacy training',
            consequence: 'Medium-term solution that empowers citizens long-term',
            characterImpact: {
              'elderly_representative': { emotionChange: 5, relationshipChange: 10 },
              'education_coordinator': { emotionChange: 15, relationshipChange: 15 }
            },
            municipalImpact: {
              budgetChange: -8,
              reputationChange: 10,
              complianceRisk: 'low'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'emergency_response_göteborg_flood',
    title: 'Göteborg Flood Emergency Response',
    description: 'Heavy rains cause flooding in central Göteborg. Coordinate emergency response and recovery.',
    difficulty: 5,
    municipality: 'göteborg',
    category: 'emergency_response',
    estimatedTime: 45,
    startingConditions: {
      budget: 60,
      reputation: 70,
      timeRemaining: 240
    },
    learningObjectives: [
      'Crisis communication',
      'Multi-agency coordination',
      'Resource allocation under pressure',
      'Recovery planning'
    ],
    culturalContext: {
      sv: {
        title: 'Göteborg Översvämning Krishantering',
        description: 'Kraftiga regn orsakar översvämningar i centrala Göteborg. Koordinera krishantering och återhämtning.',
        stakeholders: ['Räddningstjänsten', 'Polisen', 'Trafikkontoret', 'Fastighetskontoret'],
        regulations: ['Lagen om skydd mot olyckor', 'Plan- och bygglagen', 'Miljöbalken']
      }
    },
    nodes: [
      {
        id: 'flood_emergency_start',
        type: 'story',
        title: 'Emergency Alert',
        description: 'At 06:30, emergency services report severe flooding in Göteborg city center. You are called to lead the crisis response.',
        speaker: 'Emergency Services Coordinator',
        characterEmotions: {
          'emergency_coordinator': 'urgent',
          'fire_chief': 'focused',
          'police_commander': 'alert'
        },
        nextNode: 'immediate_response_decision'
      },
      {
        id: 'immediate_response_decision',
        type: 'decision',
        title: 'Immediate Response Priorities',
        description: 'Multiple areas need attention. What is your first priority?',
        choices: [
          {
            id: 'evacuate_residential',
            text: 'Focus on evacuating residential areas first',
            consequence: 'Lives protected but business district suffers more damage',
            characterImpact: {
              'citizen_representative': { emotionChange: 15, relationshipChange: 20 },
              'business_representative': { emotionChange: -10, relationshipChange: -15 }
            },
            municipalImpact: {
              budgetChange: -20,
              reputationChange: 10,
              complianceRisk: 'low'
            }
          },
          {
            id: 'protect_infrastructure',
            text: 'Secure critical infrastructure (power, water, transport)',
            consequence: 'Systems remain functional but some areas remain at risk',
            characterImpact: {
              'infrastructure_manager': { emotionChange: 15, relationshipChange: 15 },
              'emergency_coordinator': { emotionChange: 10, relationshipChange: 10 }
            },
            municipalImpact: {
              budgetChange: -10,
              reputationChange: 5,
              complianceRisk: 'medium'
            }
          }
        ]
      }
    ]
  }
];

  return MUNICIPAL_SCENARIOS.filter(scenario => scenario.difficulty === difficulty);
};

  return MUNICIPAL_SCENARIOS.filter(scenario => scenario.category === category);
};

  return MUNICIPAL_SCENARIOS.filter(scenario => scenario.municipality === municipality);
};

  return MUNICIPAL_SCENARIOS[randomIndex];
};