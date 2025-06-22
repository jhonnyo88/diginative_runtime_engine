/**
 * Q2 European Localization Framework
 * Task: proposal-038 - Q2 Production Readiness
 * 
 * Advanced localization system för Q2 Interactive Mechanics
 * Cultural intelligence and municipal appropriateness across European markets
 */

interface CulturalContext {
  country: 'sweden' | 'germany' | 'france' | 'netherlands';
  locale: 'sv' | 'de' | 'fr' | 'nl';
  governmentStructure: 'municipal' | 'federal' | 'regional';
  decisionMakingStyle: 'consensus' | 'hierarchical' | 'consultative';
  communicationStyle: 'direct' | 'formal' | 'diplomatic';
  timeOrientation: 'punctual' | 'flexible' | 'process_focused';
}

interface MunicipalTerminology {
  [key: string]: {
    sv: string;
    de: string;
    fr: string;
    nl: string;
    culturalNote?: string;
  };
}

interface LocalizedMunicipalScenario {
  baseScenarioId: string;
  localizations: {
    [locale: string]: {
      title: string;
      description: string;
      stakeholders: string[];
      regulations: string[];
      culturalConsiderations: string[];
      decisionFramework: string;
      communicationProtocols: string[];
    };
  };
}

interface CulturalAdaptationRules {
  [locale: string]: {
    achievementNaming: 'formal' | 'casual' | 'professional';
    feedbackStyle: 'direct' | 'constructive' | 'encouraging';
    authorityRecognition: 'hierarchical' | 'egalitarian' | 'expertise_based';
    conflictResolution: 'mediation' | 'authority' | 'consensus';
    timeManagement: 'strict' | 'flexible' | 'process_oriented';
    stakeholderInvolvement: 'broad_consultation' | 'expert_panels' | 'representative_democracy';
  };
}

class Q2EuropeanLocalizationManager {
  private culturalContexts: Map<string, CulturalContext> = new Map();
  private municipalTerminology: MunicipalTerminology;
  private culturalRules: CulturalAdaptationRules;
  private localizationCache: Map<string, any> = new Map();

  constructor() {
    this.initializeCulturalContexts();
    this.initializeMunicipalTerminology();
    this.initializeCulturalRules();
  }

  private initializeCulturalContexts(): void {
    this.culturalContexts.set('sv', {
      country: 'sweden',
      locale: 'sv',
      governmentStructure: 'municipal',
      decisionMakingStyle: 'consensus',
      communicationStyle: 'direct',
      timeOrientation: 'punctual'
    });

    this.culturalContexts.set('de', {
      country: 'germany',
      locale: 'de',
      governmentStructure: 'federal',
      decisionMakingStyle: 'hierarchical',
      communicationStyle: 'formal',
      timeOrientation: 'punctual'
    });

    this.culturalContexts.set('fr', {
      country: 'france',
      locale: 'fr',
      governmentStructure: 'regional',
      decisionMakingStyle: 'hierarchical',
      communicationStyle: 'formal',
      timeOrientation: 'process_focused'
    });

    this.culturalContexts.set('nl', {
      country: 'netherlands',
      locale: 'nl',
      governmentStructure: 'municipal',
      decisionMakingStyle: 'consensus',
      communicationStyle: 'direct',
      timeOrientation: 'flexible'
    });
  }

  private initializeMunicipalTerminology(): void {
    this.municipalTerminology = {
      municipal_manager: {
        sv: 'Kommunstyrelsens ordförande',
        de: 'Bürgermeister',
        fr: 'Maire',
        nl: 'Burgemeester',
        culturalNote: 'Leadership roles vary significantly across European municipal systems'
      },
      city_council: {
        sv: 'Kommunfullmäktige',
        de: 'Gemeinderat',
        fr: 'Conseil municipal',
        nl: 'Gemeenteraad'
      },
      municipal_administration: {
        sv: 'Kommunförvaltning',
        de: 'Gemeindeverwaltung',
        fr: 'Administration municipale',
        nl: 'Gemeentelijke administratie'
      },
      citizen_services: {
        sv: 'Medborgarservice',
        de: 'Bürgerservice',
        fr: 'Services aux citoyens',
        nl: 'Burgerservice'
      },
      public_procurement: {
        sv: 'Offentlig upphandling',
        de: 'Öffentliche Beschaffung',
        fr: 'Marchés publics',
        nl: 'Openbare aanbesteding'
      },
      budget_planning: {
        sv: 'Budgetplanering',
        de: 'Haushaltsplanung',
        fr: 'Planification budgétaire',
        nl: 'Begrotingsplanning'
      },
      emergency_management: {
        sv: 'Krishantering',
        de: 'Katastrophenmanagement',
        fr: 'Gestion de crise',
        nl: 'Crisisbeheersing'
      },
      digital_services: {
        sv: 'Digitala tjänster',
        de: 'Digitale Dienste',
        fr: 'Services numériques',
        nl: 'Digitale diensten'
      },
      environmental_protection: {
        sv: 'Miljöskydd',
        de: 'Umweltschutz',
        fr: 'Protection environnementale',
        nl: 'Milieubescherming'
      },
      urban_planning: {
        sv: 'Stadsplanering',
        de: 'Stadtplanung',
        fr: 'Urbanisme',
        nl: 'Stedelijke planning'
      },
      social_services: {
        sv: 'Socialtjänst',
        de: 'Sozialwesen',
        fr: 'Services sociaux',
        nl: 'Sociale diensten'
      },
      infrastructure_maintenance: {
        sv: 'Infrastrukturunderhåll',
        de: 'Infrastrukturinstandhaltung',
        fr: 'Maintenance des infrastructures',
        nl: 'Infrastructuuronderhoud'
      }
    };
  }

  private initializeCulturalRules(): void {
    this.culturalRules = {
      sv: {
        achievementNaming: 'professional',
        feedbackStyle: 'constructive',
        authorityRecognition: 'egalitarian',
        conflictResolution: 'consensus',
        timeManagement: 'strict',
        stakeholderInvolvement: 'broad_consultation'
      },
      de: {
        achievementNaming: 'formal',
        feedbackStyle: 'direct',
        authorityRecognition: 'hierarchical',
        conflictResolution: 'authority',
        timeManagement: 'strict',
        stakeholderInvolvement: 'expert_panels'
      },
      fr: {
        achievementNaming: 'formal',
        feedbackStyle: 'diplomatic',
        authorityRecognition: 'hierarchical',
        conflictResolution: 'authority',
        timeManagement: 'process_oriented',
        stakeholderInvolvement: 'representative_democracy'
      },
      nl: {
        achievementNaming: 'professional',
        feedbackStyle: 'encouraging',
        authorityRecognition: 'expertise_based',
        conflictResolution: 'consensus',
        timeManagement: 'flexible',
        stakeholderInvolvement: 'broad_consultation'
      }
    };
  }

  public getLocalizedTerm(termKey: string, locale: string): string {
    const term = this.municipalTerminology[termKey];
    if (!term) {
      console.warn(`Missing municipal terminology: ${termKey}`);
      return termKey.replace(/_/g, ' ');
    }

    return term[locale as keyof typeof term] || term.sv || termKey.replace(/_/g, ' ');
  }

  public getCulturalContext(locale: string): CulturalContext | null {
    return this.culturalContexts.get(locale) || null;
  }

  public getCulturalAdaptationRules(locale: string): CulturalAdaptationRules[string] | null {
    return this.culturalRules[locale] || null;
  }

  public adaptAchievementNaming(achievementId: string, baseTitle: string, locale: string): string {
    const rules = this.getCulturalAdaptationRules(locale);
    if (!rules) return baseTitle;

    const cacheKey = `achievement_${achievementId}_${locale}`;
    const cached = this.localizationCache.get(cacheKey);
    if (cached) return cached;

    let adaptedTitle = baseTitle;

    switch (rules.achievementNaming) {
      case 'formal':
        // German/French formal achievement naming
        if (locale === 'de') {
          adaptedTitle = `Auszeichnung: ${baseTitle}`;
        } else if (locale === 'fr') {
          adaptedTitle = `Reconnaissance: ${baseTitle}`;
        }
        break;
      case 'professional':
        // Swedish/Dutch professional achievement naming
        if (locale === 'sv') {
          adaptedTitle = `Kompetens: ${baseTitle}`;
        } else if (locale === 'nl') {
          adaptedTitle = `Bekwaamheid: ${baseTitle}`;
        }
        break;
      case 'casual':
        // More casual, approachable naming
        adaptedTitle = baseTitle;
        break;
    }

    this.localizationCache.set(cacheKey, adaptedTitle);
    return adaptedTitle;
  }

  public adaptFeedbackMessage(message: string, locale: string, context: 'success' | 'improvement' | 'failure'): string {
    const rules = this.getCulturalAdaptationRules(locale);
    if (!rules) return message;

    const cacheKey = `feedback_${message.substring(0, 20)}_${locale}_${context}`;
    const cached = this.localizationCache.get(cacheKey);
    if (cached) return cached;

    let adaptedMessage = message;

    switch (rules.feedbackStyle) {
      case 'direct':
        // German direct feedback style
        if (context === 'improvement') {
          adaptedMessage = `Verbesserungsbedarf: ${message}`;
        }
        break;
      case 'diplomatic':
        // French diplomatic feedback style
        if (context === 'failure') {
          adaptedMessage = `Opportunité d'amélioration: ${message}`;
        }
        break;
      case 'encouraging':
        // Dutch encouraging feedback style
        if (context === 'improvement') {
          adaptedMessage = `Goede voortgang, focus op: ${message}`;
        }
        break;
      case 'constructive':
        // Swedish constructive feedback style
        if (context === 'improvement') {
          adaptedMessage = `Utvecklingsområde: ${message}`;
        }
        break;
    }

    this.localizationCache.set(cacheKey, adaptedMessage);
    return adaptedMessage;
  }

  public adaptDecisionScenario(scenario: Record<string, unknown>, locale: string): Record<string, unknown> {
    const context = this.getCulturalContext(locale);
    const rules = this.getCulturalAdaptationRules(locale);
    
    if (!context || !rules) return scenario;

    const adaptedScenario = { ...scenario };

    // Adapt decision-making approach based on cultural context
    if (context.decisionMakingStyle === 'consensus' && (locale === 'sv' || locale === 'nl')) {
      // Add consensus-building choices
      adaptedScenario.choices = adaptedScenario.choices?.map((choice: Record<string, unknown>) => ({
        ...choice,
        consensus_building: true,
        stakeholder_consultation: 'broad'
      }));
    } else if (context.decisionMakingStyle === 'hierarchical' && (locale === 'de' || locale === 'fr')) {
      // Emphasize authority and proper channels
      adaptedScenario.choices = adaptedScenario.choices?.map((choice: Record<string, unknown>) => ({
        ...choice,
        authority_approval: true,
        formal_procedure: 'required'
      }));
    }

    // Adapt time management expectations
    if (rules.timeManagement === 'strict') {
      adaptedScenario.timeMultiplier = 0.8; // 20% less time for punctual cultures
    } else if (rules.timeManagement === 'flexible') {
      adaptedScenario.timeMultiplier = 1.2; // 20% more time for flexible cultures
    }

    // Adapt stakeholder involvement
    switch (rules.stakeholderInvolvement) {
      case 'broad_consultation':
        adaptedScenario.stakeholder_count = Math.ceil((adaptedScenario.stakeholder_count || 3) * 1.5);
        break;
      case 'expert_panels':
        adaptedScenario.expert_requirement = true;
        break;
      case 'representative_democracy':
        adaptedScenario.democratic_validation = true;
        break;
    }

    return adaptedScenario;
  }

  public getMunicipalRegulationFramework(locale: string): {
    primaryLaws: string[];
    governanceStructure: string;
    complianceRequirements: string[];
    culturalConsiderations: string[];
  } {
    const frameworks = {
      sv: {
        primaryLaws: [
          'Kommunallagen (KL)',
          'Förvaltningslagen (FL)',
          'Lagen om offentlighet och sekretess (OSL)',
          'Plan- och bygglagen (PBL)',
          'Lagen om offentlig upphandling (LOU)'
        ],
        governanceStructure: 'Kommunfullmäktige → Kommunstyrelse → Nämnder → Förvaltningar',
        complianceRequirements: [
          'Transparens och offentlighet',
          'Medborgardeltagande',
          'Miljöhänsyn',
          'Ekonomisk hållbarhet',
          'Tillgänglighet och inkludering'
        ],
        culturalConsiderations: [
          'Jantelagen - ödmjukhet och jämställdhet',
          'Konsensussökande beslutsfattande',
          'Långsiktig hållbarhetstänk',
          'Digital-first mentalitet',
          'Trygghet och säkerhet prioriteras'
        ]
      },
      de: {
        primaryLaws: [
          'Gemeindeordnung (GO)',
          'Verwaltungsverfahrensgesetz (VwVfG)',
          'Vergaberecht (VgV)',
          'Baugesetzbuch (BauGB)',
          'Informationsfreiheitsgesetz (IFG)'
        ],
        governanceStructure: 'Gemeinderat → Bürgermeister → Fachbereiche → Ämter',
        complianceRequirements: [
          'Rechtssicherheit und Verfahrenstreue',
          'Bürgerbeteiligung nach VwVfG',
          'Umweltverträglichkeit',
          'Haushaltskonsolidierung',
          'Barrierefreiheit nach BGG'
        ],
        culturalConsiderations: [
          'Ordnung und systematische Prozesse',
          'Autorität und Hierarchie respekteras',
          'Gründlichkeit vor Geschwindigkeit',
          'Expertenwissen högt värderat',
          'Regelkonformität essentiell'
        ]
      },
      fr: {
        primaryLaws: [
          'Code général des collectivités territoriales (CGCT)',
          'Code des relations entre le public et l\'administration',
          'Code des marchés publics',
          'Code de l\'urbanisme',
          'Loi CADA (accès aux documents)'
        ],
        governanceStructure: 'Conseil municipal → Maire → Directions → Services',
        complianceRequirements: [
          'Service public à la française',
          'Égalité et laïcité',
          'Développement durable',
          'Maîtrise des finances publiques',
          'Accessibilité universelle'
        ],
        culturalConsiderations: [
          'Centralisation et hiérarchie claire',
          'Service public som ideal',
          'Intellektuell rigor i analys',
          'Formell kommunikation prefereras',
          'Republikanska värden centrala'
        ]
      },
      nl: {
        primaryLaws: [
          'Gemeentewet',
          'Algemene wet bestuursrecht (Awb)',
          'Aanbestedingswet',
          'Omgevingswet',
          'Wet openbaarheid van bestuur (Wob)'
        ],
        governanceStructure: 'Gemeenteraad → College B&W → Directies → Afdelingen',
        complianceRequirements: [
          'Participatie en inspraak',
          'Innovatie en efficiency',
          'Duurzaamheid en klimaat',
          'Financiële gezondheid',
          'Toegankelijkheid en inclusie'
        ],
        culturalConsiderations: [
          'Poldermodel - consensus och kompromiss',
          'Pragmatisk problemlösning',
          'Innovation och nytänkande uppskattas',
          'Direkthet i kommunikation',
          'Hållbarhet som ledstjärna'
        ]
      }
    };

    return frameworks[locale as keyof typeof frameworks] || frameworks.sv;
  }

  public validateCulturalAppropriateness(content: Record<string, unknown>, locale: string): {
    score: number;
    recommendations: string[];
    culturalRisks: string[];
  } {
    const context = this.getCulturalContext(locale);
    const rules = this.getCulturalAdaptationRules(locale);
    
    if (!context || !rules) {
      return {
        score: 0.5,
        recommendations: ['Cultural context not available för this locale'],
        culturalRisks: ['Potential cultural misalignment']
      };
    }

    let score = 0.8; // Base score
    const recommendations: string[] = [];
    const culturalRisks: string[] = [];

    // Check decision-making style alignment
    if (content.decisionStyle && content.decisionStyle !== context.decisionMakingStyle) {
      score -= 0.1;
      recommendations.push(`Adapt decision-making style to ${context.decisionMakingStyle} för ${locale} culture`);
    }

    // Check communication style
    if (content.communicationTone && content.communicationTone !== context.communicationStyle) {
      score -= 0.05;
      recommendations.push(`Adjust communication tone to ${context.communicationStyle} för ${locale} culture`);
    }

    // Check time orientation
    if (content.timeExpectations && content.timeExpectations !== context.timeOrientation) {
      score -= 0.05;
      recommendations.push(`Align time expectations with ${context.timeOrientation} orientation`);
    }

    // Cultural risk assessment
    if (score < 0.7) {
      culturalRisks.push('Significant cultural adaptation needed');
    }
    if (score < 0.5) {
      culturalRisks.push('High risk of cultural inappropriateness');
    }

    // Locale-specific risk checks
    switch (locale) {
      case 'de':
        if (content.informalTone) {
          culturalRisks.push('Informal tone may be inappropriate i German governmental context');
        }
        break;
      case 'fr':
        if (content.skipsCentralAuthority) {
          culturalRisks.push('Bypassing central authority conflicts with French administrative culture');
        }
        break;
      case 'sv':
        if (content.authoritarianApproach) {
          culturalRisks.push('Authoritarian approach conflicts with Swedish consensus culture');
        }
        break;
      case 'nl':
        if (content.rigidProcess) {
          culturalRisks.push('Overly rigid process may conflict with Dutch pragmatic approach');
        }
        break;
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      recommendations,
      culturalRisks
    };
  }

  public getLocalizedMunicipalScenarios(): LocalizedMunicipalScenario[] {
    return [
      {
        baseScenarioId: 'budget_crisis_winter_services',
        localizations: {
          sv: {
            title: 'Budgetkris: Vintertjänster',
            description: 'Malmö stad måste hantera en budgetunderskott på 15% och fatta svåra beslut om vintertjänster.',
            stakeholders: ['Kommunfullmäktige', 'Gatukontoret', 'Företagarna', 'Hyresgästföreningen'],
            regulations: ['Kommunallagen', 'Vinterväghållning förordning', 'Miljöbalken'],
            culturalConsiderations: ['Transparens i beslutsfattande', 'Bred samråd med medborgare', 'Miljöhänsyn'],
            decisionFramework: 'Konsensusbaserat med öppen demokratisk process',
            communicationProtocols: ['Öppna medborgarsamråd', 'Transparent information', 'Mediakommunikation']
          },
          de: {
            title: 'Haushaltskrise: Winterdienst',
            description: 'Die Gemeinde muss ein Haushaltsdefizit von 15% bewältigen und schwierige Entscheidungen über Winterdienste treffen.',
            stakeholders: ['Gemeinderat', 'Straßenamt', 'Unternehmerverband', 'Mieterverein'],
            regulations: ['Gemeindeordnung', 'Winterdienstverordnung', 'Umweltrecht'],
            culturalConsiderations: ['Rechtssichere Verfahren', 'Expertengutachten', 'Ordnungsgemäße Beschlussfassung'],
            decisionFramework: 'Hierarchische Entscheidung mit fachlicher Expertise',
            communicationProtocols: ['Förmliche Bekanntmachung', 'Expertenhearings', 'Amtliche Mitteilungen']
          },
          fr: {
            title: 'Crise budgétaire: Services hivernaux',
            description: 'La commune doit gérer un déficit budgétaire de 15% et prendre des décisions difficiles sur les services hivernaux.',
            stakeholders: ['Conseil municipal', 'Service voirie', 'Patronat local', 'Association locataires'],
            regulations: ['Code collectivités territoriales', 'Règlement service hivernal', 'Code environnement'],
            culturalConsiderations: ['Service public d\'excellence', 'Égalité territoriale', 'Concertation démocratique'],
            decisionFramework: 'Décision municipale avec validation démocratique',
            communicationProtocols: ['Consultation publique', 'Communication institutionnelle', 'Information citoyens']
          },
          nl: {
            title: 'Begrotingscrisis: Winterdienst',
            description: 'De gemeente moet een begrotingstekort van 15% aanpakken en moeilijke beslissingen nemen over winterdiensten.',
            stakeholders: ['Gemeenteraad', 'Dienst openbare werken', 'Ondernemersvereniging', 'Huurdersvereniging'],
            regulations: ['Gemeentewet', 'Winterdienstverordening', 'Omgevingswet'],
            culturalConsiderations: ['Breed draagvlak zoeken', 'Innovatieve oplossingen', 'Participatie burgers'],
            decisionFramework: 'Poldermodel met brede consensus',
            communicationProtocols: ['Brede participatie', 'Pragmatische communicatie', 'Interactieve sessies']
          }
        }
      }
    ];
  }

  public clearCache(): void {
    this.localizationCache.clear();
  }

  public getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.localizationCache.size,
      hitRate: 0.85 // Simulated hit rate
    };
  }
}

export { Q2EuropeanLocalizationManager, type CulturalContext, type MunicipalTerminology, type LocalizedMunicipalScenario, type CulturalAdaptationRules };