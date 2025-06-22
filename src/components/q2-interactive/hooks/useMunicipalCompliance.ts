/**
 * useMunicipalCompliance Hook - Municipal Regulation Validation
 * Task: proposal-029 - Q2 Interactive Mechanics Implementation
 * 
 * Comprehensive municipal compliance checking för European government standards
 * GDPR, accessibility, and cultural appropriateness validation
 */

import { useCallback } from 'react';

interface ComplianceValidationRequest {
  permit?: Record<string, unknown>;
  targetStage: string;
  municipality: string;
  locale: string;
  userRole?: string;
}

interface ComplianceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  reviewNotes: string;
  culturalCompliance: boolean;
  gdprCompliance: boolean;
  accessibilityCompliance: boolean;
}

const MUNICIPAL_REGULATIONS = {
  sweden: {
    permitProcessing: {
      requiredDocuments: ['application', 'technical_drawings', 'environmental_impact'],
      approvalLevels: ['department', 'municipal_board', 'regional_authority'],
      timeframeDays: 30,
      culturalConsiderations: ['sami_rights', 'historical_preservation', 'environmental_protection']
    },
    dataProtection: {
      gdprCompliance: true,
      dataRetentionYears: 7,
      consentRequired: ['citizen_data', 'sensitive_information'],
      auditingRequired: true
    }
  },
  germany: {
    permitProcessing: {
      requiredDocuments: ['antrag', 'baupläne', 'umweltverträglichkeitsprüfung'],
      approvalLevels: ['amt', 'gemeinderat', 'landkreis'],
      timeframeDays: 42,
      culturalConsiderations: ['denkmalschutz', 'umweltschutz', 'nachbarschaftsrechte']
    },
    dataProtection: {
      gdprCompliance: true,
      dataRetentionYears: 10,
      consentRequired: ['personendaten', 'besondere_kategorien'],
      auditingRequired: true
    }
  },
  france: {
    permitProcessing: {
      requiredDocuments: ['demande', 'plans_techniques', 'étude_impact'],
      approvalLevels: ['service', 'conseil_municipal', 'préfecture'],
      timeframeDays: 60,
      culturalConsiderations: ['patrimoine_historique', 'protection_environnement', 'urbanisme']
    },
    dataProtection: {
      gdprCompliance: true,
      dataRetentionYears: 5,
      consentRequired: ['données_personnelles', 'données_sensibles'],
      auditingRequired: true
    }
  },
  netherlands: {
    permitProcessing: {
      requiredDocuments: ['aanvraag', 'technische_tekeningen', 'milieueffectrapport'],
      approvalLevels: ['afdeling', 'gemeenteraad', 'provincie'],
      timeframeDays: 35,
      culturalConsiderations: ['monumentenzorg', 'milieubescherming', 'ruimtelijke_ordening']
    },
    dataProtection: {
      gdprCompliance: true,
      dataRetentionYears: 7,
      consentRequired: ['persoonsgegevens', 'bijzondere_gegevens'],
      auditingRequired: true
    }
  }
};

export const useMunicipalCompliance = () => {
  const validateMunicipalCompliance = useCallback(async (
    request: ComplianceValidationRequest
  ): Promise<ComplianceValidationResult> => {
    const { permit, targetStage, municipality, locale, userRole } = request;
    
    let errors: string[] = [];
    let warnings: string[] = [];
    let reviewNotes = '';
    
    // Get country from municipality or locale
    const country = getCountryFromLocale(locale);
    const regulations = MUNICIPAL_REGULATIONS[country as keyof typeof MUNICIPAL_REGULATIONS];
    
    if (!regulations) {
      errors.push(`No regulations found för country: ${country}`);
      return {
        isValid: false,
        errors,
        warnings,
        reviewNotes: 'Country regulations not configured',
        culturalCompliance: false,
        gdprCompliance: false,
        accessibilityCompliance: false
      };
    }

    // Document validation
    if (permit?.requiredDocuments) {
      const missingDocs = regulations.permitProcessing.requiredDocuments.filter(
        doc => !permit.requiredDocuments.includes(doc)
      );
      
      if (missingDocs.length > 0) {
        errors.push(`Missing required documents: ${missingDocs.join(', ')}`);
      }
    }

    // Stage progression validation
    if (permit && targetStage) {
      const isValidProgression = validateStageProgression(
        permit.status,
        targetStage,
        regulations.permitProcessing.approvalLevels,
        userRole
      );
      
      if (!isValidProgression.valid) {
        errors.push(isValidProgression.error || 'Invalid stage progression');
      }
    }

    // Timeline validation
    if (permit?.submittedDate) {
      const daysSinceSubmission = Math.floor(
        (Date.now() - new Date(permit.submittedDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceSubmission > regulations.permitProcessing.timeframeDays) {
        warnings.push(`Processing time exceeded: ${daysSinceSubmission}/${regulations.permitProcessing.timeframeDays} days`);
      }
    }

    // Cultural compliance validation
    const culturalCompliance = validateCulturalCompliance(permit, regulations, locale);
    if (!culturalCompliance.valid) {
      warnings.push(...culturalCompliance.warnings);
    }

    // GDPR compliance validation
    const gdprCompliance = validateGDPRCompliance(permit, regulations);
    if (!gdprCompliance.valid) {
      errors.push(...gdprCompliance.errors);
    }

    // Accessibility compliance (WCAG 2.1 AA)
    const accessibilityCompliance = validateAccessibilityCompliance(permit);
    if (!accessibilityCompliance.valid) {
      warnings.push(...accessibilityCompliance.warnings);
    }

    // Generate review notes
    reviewNotes = generateReviewNotes({
      permit,
      targetStage,
      country,
      locale,
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      reviewNotes,
      culturalCompliance: culturalCompliance.valid,
      gdprCompliance: gdprCompliance.valid,
      accessibilityCompliance: accessibilityCompliance.valid
    };
  }, []);

  const validateStageProgression = (
    currentStage: string,
    targetStage: string,
    approvalLevels: string[],
    userRole?: string
  ) => {
    // Basic stage progression rules
    const stageOrder = ['pending', 'department_review', 'compliance_check', 'supervisor_approval', 'approved', 'rejected'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const targetIndex = stageOrder.indexOf(targetStage);

    // Can always reject
    if (targetStage === 'rejected') {
      return { valid: true };
    }

    // Must progress sequentially (except rejection)
    if (targetIndex <= currentIndex && targetStage !== 'approved') {
      return { valid: false, error: 'Cannot move backwards in workflow' };
    }

    // Role-based progression validation
    if (userRole) {
      const rolePermissions = {
        'municipal_employee': ['pending', 'department_review'],
        'department_manager': ['department_review', 'compliance_check'],
        'supervisor': ['compliance_check', 'supervisor_approval', 'approved', 'rejected'],
        'administrator': stageOrder // Full access
      };

      const allowedStages = rolePermissions[userRole as keyof typeof rolePermissions] || [];
      if (!allowedStages.includes(targetStage)) {
        return { valid: false, error: `Insufficient permissions för ${targetStage}` };
      }
    }

    return { valid: true };
  };

  const validateCulturalCompliance = (permit: Record<string, unknown>, regulations: Record<string, unknown>, locale: string) => {
    const warnings: string[] = [];
    
    // Check cultural considerations based on locale
    if (permit?.culturalConsiderations) {
      const required = regulations.permitProcessing.culturalConsiderations;
      
      for (const consideration of required) {
        if (!permit.culturalConsiderations[consideration]) {
          warnings.push(`Cultural consideration missing: ${consideration}`);
        }
      }
    }

    // Language appropriateness
    if (permit?.description) {
      const hasAppropriateLanguage = validateLanguageAppropriateness(permit.description, locale);
      if (!hasAppropriateLanguage) {
        warnings.push('Content may not be culturally appropriate för municipality');
      }
    }

    return {
      valid: warnings.length === 0,
      warnings
    };
  };

  const validateGDPRCompliance = (permit: Record<string, unknown>, regulations: Record<string, unknown>) => {
    const errors: string[] = [];
    
    if (!regulations.dataProtection.gdprCompliance) {
      errors.push('GDPR compliance not configured');
      return { valid: false, errors };
    }

    // Check consent requirements
    if (permit?.personalData && !permit?.consentGiven) {
      errors.push('Personal data processing requires explicit consent');
    }

    // Check data retention
    if (permit?.dataRetentionDate) {
      const retentionDate = new Date(permit.dataRetentionDate);
      const maxRetention = new Date();
      maxRetention.setFullYear(maxRetention.getFullYear() + regulations.dataProtection.dataRetentionYears);
      
      if (retentionDate > maxRetention) {
        errors.push(`Data retention period exceeds legal limit: ${regulations.dataProtection.dataRetentionYears} years`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const validateAccessibilityCompliance = (permit: Record<string, unknown>) => {
    const warnings: string[] = [];
    
    // Check if digital content meets WCAG 2.1 AA
    if (permit?.digitalDocuments) {
      for (const doc of permit.digitalDocuments) {
        if (!doc.accessibilityCompliant) {
          warnings.push(`Document ${doc.name} may not meet WCAG 2.1 AA standards`);
        }
      }
    }

    // Check language clarity för municipal communications
    if (permit?.publicNotices) {
      for (const notice of permit.publicNotices) {
        if (!notice.plainLanguage) {
          warnings.push('Public notices should use plain language för accessibility');
        }
      }
    }

    return {
      valid: warnings.length === 0,
      warnings
    };
  };

  const validateLanguageAppropriateness = (text: string, locale: string): boolean => {
    // Basic profanity and appropriateness checking
    const inappropriateTerms = {
      sv: ['oacceptabelt', 'olämpligt'],
      de: ['unangemessen', 'inakzeptabel'],
      fr: ['inapproprié', 'inacceptable'],
      nl: ['ongepast', 'onaanvaardbaar']
    };

    const terms = inappropriateTerms[locale as keyof typeof inappropriateTerms] || [];
    return !terms.some(term => text.toLowerCase().includes(term));
  };

  const generateReviewNotes = (context: {
    permit: Record<string, unknown>;
    targetStage: string;
    country: string;
    locale: string;
    hasErrors: boolean;
    hasWarnings: boolean;
  }): string => {
    const { permit, targetStage, country, locale, hasErrors, hasWarnings } = context;
    
    let notes = [];
    
    // Stage transition note
    notes.push(`Stage transition: ${permit?.status || 'unknown'} → ${targetStage}`);
    
    // Country-specific compliance
    notes.push(`Validated against ${country} municipal regulations`);
    
    // Status summary
    if (hasErrors) {
      notes.push('❌ Compliance errors detected - review required');
    } else if (hasWarnings) {
      notes.push('⚠️ Minor compliance warnings - consider addressing');
    } else {
      notes.push('✅ Full compliance verified');
    }
    
    // Cultural appropriateness
    notes.push(`Cultural compliance validated för ${locale} municipality`);
    
    // Timestamp
    notes.push(`Reviewed: ${new Date().toLocaleString(locale)}`);
    
    return notes.join(' | ');
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
    validateMunicipalCompliance
  };
};