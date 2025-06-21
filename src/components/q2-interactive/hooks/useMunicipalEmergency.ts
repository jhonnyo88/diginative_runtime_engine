/**
 * useMunicipalEmergency Hook - Emergency Response Validation
 * Task: proposal-030 - Q2 Interactive Mechanics Implementation
 * 
 * Municipal emergency action validation and effectiveness calculation
 * Cultural appropriateness checking för emergency scenarios
 */

import { useCallback } from 'react';

interface EmergencyAction {
  id: string;
  type: 'communication' | 'resource_allocation' | 'evacuation' | 'coordination';
  description: string;
  timeRequirement: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  completed: boolean;
  municipalRole: string[];
}

interface EmergencyScenario {
  id: string;
  type: 'fire' | 'flood' | 'power_outage' | 'evacuation' | 'medical' | 'cyber_attack';
  title: string;
  description: string;
  timeLimit: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  municipality: 'malmö' | 'göteborg' | 'stockholm' | 'berlin';
  requiredActions: EmergencyAction[];
  culturalConsiderations: {
    swedishProtocols?: boolean;
    germanProcedures?: boolean;
    euStandards: boolean;
  };
}

interface EmergencyActionValidationRequest {
  action: EmergencyAction;
  userRole: string;
  scenario: EmergencyScenario;
  timeContext: number;
  locale: string;
}

interface EmergencyActionValidationResult {
  isValid: boolean;
  reason?: string;
  effectiveness: number;
  culturalAppropriateness: number;
  timeEfficiency: number;
}

const EMERGENCY_PROTOCOLS = {
  sweden: {
    fire: {
      criticalActions: ['notify_fire_department', 'evacuate_building', 'secure_area'],
      communicationProtocols: ['112_emergency', 'municipal_alert_system', 'radio_coordination'],
      resourceAllocation: ['fire_trucks', 'ambulance', 'police_backup'],
      culturalConsiderations: ['sami_community_notification', 'multilingual_alerts', 'accessibility_support']
    },
    flood: {
      criticalActions: ['water_level_monitoring', 'evacuation_routes', 'emergency_shelters'],
      communicationProtocols: ['smhi_coordination', 'municipal_warning', 'media_alerts'],
      resourceAllocation: ['sandbags', 'pumping_equipment', 'temporary_housing'],
      culturalConsiderations: ['elderly_care_facilities', 'immigrant_communities', 'rural_areas']
    },
    power_outage: {
      criticalActions: ['grid_assessment', 'backup_power', 'essential_services'],
      communicationProtocols: ['svenska_kraftnät', 'municipal_updates', 'battery_radio'],
      resourceAllocation: ['generators', 'fuel_supply', 'technical_crews'],
      culturalConsiderations: ['medical_equipment_dependency', 'home_care_patients', 'communication_barriers']
    },
    evacuation: {
      criticalActions: ['route_planning', 'assembly_points', 'transport_coordination'],
      communicationProtocols: ['loud_speakers', 'sms_alerts', 'door_to_door'],
      resourceAllocation: ['buses', 'emergency_personnel', 'shelter_facilities'],
      culturalConsiderations: ['special_needs_residents', 'pet_evacuation', 'cultural_centers']
    },
    medical: {
      criticalActions: ['triage_setup', 'hospital_coordination', 'resource_deployment'],
      communicationProtocols: ['sos_alarm', 'regional_coordination', 'family_notification'],
      resourceAllocation: ['ambulances', 'medical_supplies', 'specialist_personnel'],
      culturalConsiderations: ['religious_considerations', 'language_interpreters', 'family_customs']
    },
    cyber_attack: {
      criticalActions: ['system_isolation', 'backup_activation', 'incident_response'],
      communicationProtocols: ['secure_channels', 'manual_systems', 'government_notification'],
      resourceAllocation: ['it_specialists', 'backup_systems', 'security_personnel'],
      culturalConsiderations: ['public_trust_maintenance', 'transparent_communication', 'service_continuity']
    }
  },
  germany: {
    fire: {
      criticalActions: ['feuerwehr_benachrichtigung', 'gebäude_räumung', 'bereich_absichern'],
      communicationProtocols: ['112_notruf', 'gemeinde_warnsystem', 'funk_koordination'],
      resourceAllocation: ['löschfahrzeuge', 'rettungswagen', 'polizei_unterstützung'],
      culturalConsiderations: ['migranten_gemeinschaften', 'mehrsprachige_warnungen', 'barrierefreiheit']
    },
    flood: {
      criticalActions: ['pegel_überwachung', 'evakuierung_routen', 'notunterkünfte'],
      communicationProtocols: ['dwd_koordination', 'gemeinde_warnung', 'medien_alerts'],
      resourceAllocation: ['sandsäcke', 'pumpen_ausrüstung', 'temporäre_unterbringung'],
      culturalConsiderations: ['pflegeheime', 'integrations_gemeinschaften', 'ländliche_gebiete']
    }
  }
};

const ROLE_EFFECTIVENESS = {
  emergency_coordinator: {
    communication: 0.95,
    resource_allocation: 0.90,
    evacuation: 0.85,
    coordination: 0.95
  },
  fire_chief: {
    communication: 0.80,
    resource_allocation: 0.95,
    evacuation: 0.90,
    coordination: 0.85
  },
  police_commander: {
    communication: 0.85,
    resource_allocation: 0.75,
    evacuation: 0.95,
    coordination: 0.90
  },
  medical_director: {
    communication: 0.80,
    resource_allocation: 0.85,
    evacuation: 0.70,
    coordination: 0.80
  },
  municipal_manager: {
    communication: 0.90,
    resource_allocation: 0.80,
    evacuation: 0.75,
    coordination: 0.85
  }
};

export const useMunicipalEmergency = () => {
  const validateEmergencyAction = useCallback(async (
    request: EmergencyActionValidationRequest
  ): Promise<EmergencyActionValidationResult> => {
    const { action, userRole, scenario, timeContext, locale } = request;
    
    // Check if user role can perform this action
    if (!action.municipalRole.includes(userRole)) {
      return {
        isValid: false,
        reason: `Action requires role: ${action.municipalRole.join(' or ')}`,
        effectiveness: 0,
        culturalAppropriateness: 0,
        timeEfficiency: 0
      };
    }

    // Check timing appropriateness
    const timeEfficiency = calculateTimeEfficiency(action, timeContext, scenario.timeLimit);
    if (timeEfficiency < 0.1) {
      return {
        isValid: false,
        reason: 'Action attempted too late in emergency timeline',
        effectiveness: 0,
        culturalAppropriateness: 0,
        timeEfficiency
      };
    }

    // Calculate role effectiveness for this action type
    const roleEffectiveness = ROLE_EFFECTIVENESS[userRole as keyof typeof ROLE_EFFECTIVENESS];
    const actionEffectiveness = roleEffectiveness?.[action.type as keyof typeof roleEffectiveness] || 0.5;

    // Check cultural appropriateness
    const culturalScore = calculateCulturalAppropriateness(action, scenario, locale);

    // Validate against emergency protocols
    const protocolValidation = validateAgainstProtocols(action, scenario, locale);
    if (!protocolValidation.valid) {
      return {
        isValid: false,
        reason: protocolValidation.reason,
        effectiveness: actionEffectiveness * 0.5, // Reduced effectiveness för protocol violations
        culturalAppropriateness: culturalScore,
        timeEfficiency
      };
    }

    return {
      isValid: true,
      effectiveness: actionEffectiveness,
      culturalAppropriateness: culturalScore,
      timeEfficiency
    };
  }, []);

  const calculateMunicipalEffectiveness = useCallback((
    completedActions: Set<string>,
    scenario: EmergencyScenario
  ): number => {
    const totalActions = scenario.requiredActions.length;
    const completedCount = completedActions.size;
    
    if (totalActions === 0) return 0;

    // Base completion rate
    const completionRate = completedCount / totalActions;

    // Priority weighting
    let priorityScore = 0;
    let maxPriorityScore = 0;
    
    scenario.requiredActions.forEach(action => {
      const priorityWeight = action.priority === 'critical' ? 4 : 
                            action.priority === 'high' ? 3 :
                            action.priority === 'medium' ? 2 : 1;
      
      maxPriorityScore += priorityWeight;
      
      if (completedActions.has(action.id)) {
        priorityScore += priorityWeight;
      }
    });

    const weightedScore = maxPriorityScore > 0 ? priorityScore / maxPriorityScore : 0;

    // Scenario difficulty adjustment
    const difficultyMultiplier = Math.max(0.7, (6 - scenario.difficulty) / 5);

    return Math.min(1.0, (completionRate * 0.6 + weightedScore * 0.4) * difficultyMultiplier);
  }, []);

  const checkCulturalAppropriateness = useCallback((
    scenario: EmergencyScenario,
    locale: string
  ): number => {
    const country = getCountryFromLocale(locale);
    const protocols = EMERGENCY_PROTOCOLS[country as keyof typeof EMERGENCY_PROTOCOLS];
    
    if (!protocols) return 0.5; // Default score if protocols not found

    const scenarioProtocols = protocols[scenario.type as keyof typeof protocols];
    if (!scenarioProtocols) return 0.5;

    let culturalScore = 0.8; // Base score

    // Check cultural considerations alignment
    if (scenario.culturalConsiderations.euStandards) {
      culturalScore += 0.1;
    }

    if (locale === 'sv' && scenario.culturalConsiderations.swedishProtocols) {
      culturalScore += 0.1;
    }

    if (locale === 'de' && scenario.culturalConsiderations.germanProcedures) {
      culturalScore += 0.1;
    }

    // Municipality-specific adjustments
    const municipalityScore = getMunicipalityScore(scenario.municipality, locale);
    culturalScore = (culturalScore + municipalityScore) / 2;

    return Math.min(1.0, culturalScore);
  }, []);

  // Helper functions
  const calculateTimeEfficiency = (
    action: EmergencyAction,
    timeRemaining: number,
    totalTime: number
  ): number => {
    const timeElapsed = totalTime - timeRemaining;
    const urgencyFactor = action.priority === 'critical' ? 0.9 :
                         action.priority === 'high' ? 0.7 :
                         action.priority === 'medium' ? 0.5 : 0.3;
    
    // Actions should be completed within their urgency window
    const optimalWindow = totalTime * urgencyFactor;
    
    if (timeElapsed <= optimalWindow) {
      return 1.0; // Perfect timing
    } else {
      // Efficiency decreases as we go past optimal window
      const lateness = (timeElapsed - optimalWindow) / (totalTime - optimalWindow);
      return Math.max(0.1, 1.0 - lateness);
    }
  };

  const calculateCulturalAppropriateness = (
    action: EmergencyAction,
    scenario: EmergencyScenario,
    locale: string
  ): number => {
    let score = 0.8; // Base cultural appropriateness

    // Communication actions need special cultural consideration
    if (action.type === 'communication') {
      score += 0.1;
      
      // Check if multilingual considerations are needed
      if (scenario.municipality === 'malmö' || scenario.municipality === 'berlin') {
        score += 0.1; // These cities have diverse populations
      }
    }

    // Resource allocation should consider local infrastructure
    if (action.type === 'resource_allocation') {
      // Swedish municipalities have different resource availability
      if (locale === 'sv' && (scenario.municipality === 'malmö' || scenario.municipality === 'göteborg')) {
        score += 0.1; // Better resource access in larger cities
      }
    }

    return Math.min(1.0, score);
  };

  const validateAgainstProtocols = (
    action: EmergencyAction,
    scenario: EmergencyScenario,
    locale: string
  ) => {
    const country = getCountryFromLocale(locale);
    const protocols = EMERGENCY_PROTOCOLS[country as keyof typeof EMERGENCY_PROTOCOLS];
    
    if (!protocols) {
      return { valid: true }; // No protocols to validate against
    }

    const scenarioProtocols = protocols[scenario.type as keyof typeof protocols];
    if (!scenarioProtocols) {
      return { valid: true }; // No specific protocols för this scenario
    }

    // Check if action aligns with critical actions
    const actionKeywords = action.description.toLowerCase().split(' ');
    const criticalActions = scenarioProtocols.criticalActions || [];
    
    const hasProtocolAlignment = criticalActions.some(critical => 
      actionKeywords.some(keyword => critical.includes(keyword) || keyword.includes(critical.split('_')[0]))
    );

    if (action.priority === 'critical' && !hasProtocolAlignment) {
      return {
        valid: false,
        reason: 'Critical action does not align with established emergency protocols'
      };
    }

    return { valid: true };
  };

  const getMunicipalityScore = (municipality: string, locale: string): number => {
    // Municipality-specific cultural appropriateness scores
    const municipalityScores = {
      malmö: { sv: 0.95, de: 0.7, fr: 0.6, nl: 0.6 },
      göteborg: { sv: 0.95, de: 0.6, fr: 0.6, nl: 0.7 },
      stockholm: { sv: 0.95, de: 0.75, fr: 0.7, nl: 0.7 },
      berlin: { sv: 0.7, de: 0.95, fr: 0.7, nl: 0.8 }
    };

    return municipalityScores[municipality as keyof typeof municipalityScores]?.[locale as keyof typeof municipalityScores.malmö] || 0.7;
  };

  const getCountryFromLocale = (locale: string): string => {
    const countryMap = {
      'sv': 'sweden',
      'de': 'germany',
      'fr': 'france',
      'nl': 'netherlands'
    };
    
    return countryMap[locale as keyof typeof countryMap] || 'sweden';
  };

  return {
    validateEmergencyAction,
    calculateMunicipalEffectiveness,
    checkCulturalAppropriateness
  };
};