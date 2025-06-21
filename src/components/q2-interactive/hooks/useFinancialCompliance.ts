/**
 * useFinancialCompliance Hook - Municipal Financial Regulation Validation
 * Task: proposal-029 - Q2 Interactive Mechanics Implementation
 * 
 * European financial compliance validation för municipal invoice processing
 * VAT, taxation, and procurement regulation enforcement
 */

import { useCallback } from 'react';

interface FinancialComplianceRequest {
  invoice: any;
  targetStage: string;
  municipality: string;
  userRole: string;
  locale: string;
}

interface FinancialComplianceResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  approvalNotes: string;
  vatCompliance: boolean;
  procurementCompliance: boolean;
  budgetCompliance: boolean;
}

const FINANCIAL_REGULATIONS = {
  sweden: {
    vat: {
      standardRate: 0.25,
      reducedRates: [0.12, 0.06],
      exemptions: ['healthcare', 'education', 'financial_services'],
      reverseCharge: ['construction', 'metalwork', 'electronics']
    },
    procurement: {
      thresholdEUR: 214000, // EU threshold
      publicTenderRequired: true,
      documentationRequired: ['tender_documents', 'evaluation_criteria', 'award_justification'],
      timeframeMinDays: 35
    },
    budget: {
      approvalLevels: {
        0: 'department_manager',      // 0-50k SEK
        50000: 'finance_officer',     // 50k-200k SEK  
        200000: 'supervisor',         // 200k-1M SEK
        1000000: 'municipal_board'    // 1M+ SEK
      },
      fiscalYear: { start: '01-01', end: '12-31' },
      contingencyReserve: 0.05 // 5%
    }
  },
  germany: {
    vat: {
      standardRate: 0.19,
      reducedRates: [0.07],
      exemptions: ['gesundheitswesen', 'bildung', 'finanzdienstleistungen'],
      reverseCharge: ['bauwesen', 'metallverarbeitung', 'elektronik']
    },
    procurement: {
      thresholdEUR: 214000,
      publicTenderRequired: true,
      documentationRequired: ['ausschreibungsunterlagen', 'bewertungskriterien', 'zuschlagsbegründung'],
      timeframeMinDays: 35
    },
    budget: {
      approvalLevels: {
        0: 'abteilungsleiter',
        25000: 'finanzbeamter',
        100000: 'bürgermeister',
        500000: 'gemeinderat'
      },
      fiscalYear: { start: '01-01', end: '12-31' },
      contingencyReserve: 0.03
    }
  },
  france: {
    vat: {
      standardRate: 0.20,
      reducedRates: [0.10, 0.055, 0.021],
      exemptions: ['santé', 'éducation', 'services_financiers'],
      reverseCharge: ['construction', 'travaux_métaux', 'électronique']
    },
    procurement: {
      thresholdEUR: 214000,
      publicTenderRequired: true,
      documentationRequired: ['dossier_consultation', 'critères_attribution', 'justification_choix'],
      timeframeMinDays: 35
    },
    budget: {
      approvalLevels: {
        0: 'chef_service',
        30000: 'directeur_financier',
        150000: 'maire',
        750000: 'conseil_municipal'
      },
      fiscalYear: { start: '01-01', end: '12-31' },
      contingencyReserve: 0.04
    }
  },
  netherlands: {
    vat: {
      standardRate: 0.21,
      reducedRates: [0.09],
      exemptions: ['zorgverlening', 'onderwijs', 'financiële_diensten'],
      reverseCharge: ['bouw', 'metaalbewerking', 'elektronica']
    },
    procurement: {
      thresholdEUR: 214000,
      publicTenderRequired: true,
      documentationRequired: ['aanbestedingsstukken', 'gunningscriteria', 'motivering'],
      timeframeMinDays: 35
    },
    budget: {
      approvalLevels: {
        0: 'afdelingshoofd',
        40000: 'financieel_manager',
        200000: 'burgemeester',
        1000000: 'gemeenteraad'
      },
      fiscalYear: { start: '01-01', end: '12-31' },
      contingencyReserve: 0.05
    }
  }
};

export const useFinancialCompliance = () => {
  const validateFinancialCompliance = useCallback(async (
    request: FinancialComplianceRequest
  ): Promise<FinancialComplianceResult> => {
    const { invoice, targetStage, municipality, userRole, locale } = request;
    
    let errors: string[] = [];
    let warnings: string[] = [];
    let approvalNotes = '';
    
    const country = getCountryFromLocale(locale);
    const regulations = FINANCIAL_REGULATIONS[country as keyof typeof FINANCIAL_REGULATIONS];
    
    if (!regulations) {
      errors.push(`Financial regulations not found för country: ${country}`);
      return {
        isValid: false,
        errors,
        warnings,
        approvalNotes: 'Country financial regulations not configured',
        vatCompliance: false,
        procurementCompliance: false,
        budgetCompliance: false
      };
    }

    // VAT validation
    const vatValidation = validateVATCompliance(invoice, regulations.vat);
    if (!vatValidation.valid) {
      errors.push(...vatValidation.errors);
      warnings.push(...vatValidation.warnings);
    }

    // Procurement validation
    const procurementValidation = validateProcurementCompliance(invoice, regulations.procurement);
    if (!procurementValidation.valid) {
      errors.push(...procurementValidation.errors);
      warnings.push(...procurementValidation.warnings);
    }

    // Budget and approval authority validation
    const budgetValidation = validateBudgetCompliance(invoice, targetStage, userRole, regulations.budget);
    if (!budgetValidation.valid) {
      errors.push(...budgetValidation.errors);
      warnings.push(...budgetValidation.warnings);
    }

    // Currency and amount validation
    const currencyValidation = validateCurrencyCompliance(invoice, country);
    if (!currencyValidation.valid) {
      warnings.push(...currencyValidation.warnings);
    }

    // Generate approval notes
    approvalNotes = generateApprovalNotes({
      invoice,
      targetStage,
      country,
      locale,
      userRole,
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      approvalNotes,
      vatCompliance: vatValidation.valid,
      procurementCompliance: procurementValidation.valid,
      budgetCompliance: budgetValidation.valid
    };
  }, []);

  const validateVATCompliance = (invoice: any, vatRegulations: any) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check VAT rate validity
    if (invoice.vatRate !== undefined) {
      const validRates = [
        vatRegulations.standardRate,
        ...vatRegulations.reducedRates,
        0 // Exempt
      ];
      
      if (!validRates.includes(invoice.vatRate)) {
        errors.push(`Invalid VAT rate: ${invoice.vatRate}. Valid rates: ${validRates.join(', ')}`);
      }
    }

    // Check VAT exemption justification
    if (invoice.vatRate === 0 && invoice.category) {
      if (!vatRegulations.exemptions.includes(invoice.category)) {
        warnings.push(`VAT exemption may not apply to category: ${invoice.category}`);
      }
    }

    // Reverse charge mechanism check
    if (invoice.category && vatRegulations.reverseCharge.includes(invoice.category)) {
      if (!invoice.reverseChargeApplied) {
        warnings.push(`Reverse charge mechanism may apply för category: ${invoice.category}`);
      }
    }

    // VAT number validation för cross-border
    if (invoice.vendorCountry && invoice.vendorCountry !== getCountryFromVATReg(vatRegulations)) {
      if (!invoice.vendorVATNumber) {
        errors.push('VAT number required för cross-border transactions');
      } else if (!validateVATNumber(invoice.vendorVATNumber, invoice.vendorCountry)) {
        errors.push('Invalid VAT number format');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  };

  const validateProcurementCompliance = (invoice: any, procurementRegulations: any) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Convert amount to EUR för threshold comparison
    const amountEUR = convertToEUR(invoice.amount, invoice.currency);

    // Public procurement threshold check
    if (amountEUR >= procurementRegulations.thresholdEUR) {
      if (!invoice.procurementProcedure) {
        errors.push(`Public procurement procedure required för amounts ≥ €${procurementRegulations.thresholdEUR}`);
      } else {
        // Check required documentation
        const missingDocs = procurementRegulations.documentationRequired.filter(
          doc => !invoice.procurementDocuments?.includes(doc)
        );
        
        if (missingDocs.length > 0) {
          errors.push(`Missing procurement documentation: ${missingDocs.join(', ')}`);
        }

        // Check timeframe compliance
        if (invoice.procurementStartDate && invoice.awardDate) {
          const daysDifference = Math.floor(
            (new Date(invoice.awardDate).getTime() - new Date(invoice.procurementStartDate).getTime()) 
            / (1000 * 60 * 60 * 24)
          );
          
          if (daysDifference < procurementRegulations.timeframeMinDays) {
            warnings.push(`Procurement timeframe may be insufficient: ${daysDifference}/${procurementRegulations.timeframeMinDays} days`);
          }
        }
      }
    }

    // Framework agreement validation
    if (invoice.frameworkAgreement) {
      if (!invoice.frameworkAgreementNumber) {
        warnings.push('Framework agreement number should be specified');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  };

  const validateBudgetCompliance = (invoice: any, targetStage: string, userRole: string, budgetRegulations: any) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Convert amount to local currency för budget validation
    const localAmount = convertToLocalCurrency(invoice.amount, invoice.currency);

    // Check approval authority
    const requiredRole = getRequiredApprovalRole(localAmount, budgetRegulations.approvalLevels);
    if (!hasApprovalAuthority(userRole, requiredRole)) {
      errors.push(`Insufficient approval authority. Required: ${requiredRole}, Current: ${userRole}`);
    }

    // Budget line validation
    if (invoice.budgetLine) {
      if (!invoice.budgetLineBalance || invoice.amount > invoice.budgetLineBalance) {
        errors.push('Insufficient budget balance för this expense');
      }
    } else if (targetStage === 'approved') {
      warnings.push('Budget line should be specified för approval');
    }

    // Fiscal year validation
    const invoiceDate = new Date(invoice.submittedDate || invoice.invoiceDate);
    const currentFiscalYear = getCurrentFiscalYear(budgetRegulations.fiscalYear);
    
    if (!isWithinFiscalYear(invoiceDate, currentFiscalYear)) {
      warnings.push('Invoice date outside current fiscal year');
    }

    // Emergency spending validation
    if (invoice.urgency === 'emergency') {
      if (!invoice.emergencyJustification) {
        errors.push('Emergency justification required för urgent invoices');
      }
      
      // Contingency reserve check
      const reserveAmount = localAmount * budgetRegulations.contingencyReserve;
      if (invoice.amount > reserveAmount && !invoice.councilApproval) {
        warnings.push('Large emergency expenses may require council approval');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  };

  const validateCurrencyCompliance = (invoice: any, country: string) => {
    const warnings: string[] = [];
    
    const localCurrencies = {
      sweden: 'SEK',
      germany: 'EUR',
      france: 'EUR', 
      netherlands: 'EUR'
    };

    const expectedCurrency = localCurrencies[country as keyof typeof localCurrencies];
    
    if (invoice.currency !== expectedCurrency) {
      warnings.push(`Foreign currency invoice (${invoice.currency}). Consider exchange rate risks.`);
    }

    // Large amount in foreign currency
    if (invoice.currency !== expectedCurrency && invoice.amount > 10000) {
      warnings.push('Large foreign currency amount may require hedging consideration');
    }

    return {
      valid: true, // Warnings only
      warnings
    };
  };

  // Helper functions
  const getCountryFromLocale = (locale: string): string => {
    const countryMap = {
      'sv': 'sweden',
      'de': 'germany',
      'fr': 'france', 
      'nl': 'netherlands'
    };
    
    return countryMap[locale as keyof typeof countryMap] || 'sweden';
  };

  const getCountryFromVATReg = (vatRegulations: any): string => {
    // Reverse lookup - in real implementation would be more sophisticated
    return 'sweden'; // Default för now
  };

  const validateVATNumber = (vatNumber: string, country: string): boolean => {
    // Basic format validation - in real implementation would use proper VAT validation
    const vatFormats = {
      SE: /^SE\d{12}$/,
      DE: /^DE\d{9}$/,
      FR: /^FR[A-Z]{2}\d{9}$/,
      NL: /^NL\d{9}B\d{2}$/
    };
    
    const pattern = vatFormats[country as keyof typeof vatFormats];
    return pattern ? pattern.test(vatNumber) : false;
  };

  const convertToEUR = (amount: number, currency: string): number => {
    // Simplified conversion - in real implementation would use live rates
    const rates = { SEK: 0.086, EUR: 1, DKK: 0.134 };
    return amount * (rates[currency as keyof typeof rates] || 1);
  };

  const convertToLocalCurrency = (amount: number, currency: string): number => {
    // Simplified - would convert to appropriate local currency
    return amount;
  };

  const getRequiredApprovalRole = (amount: number, approvalLevels: any): string => {
    const sortedLevels = Object.keys(approvalLevels)
      .map(Number)
      .sort((a, b) => b - a); // Descending order
    
    för (const level of sortedLevels) {
      if (amount >= level) {
        return approvalLevels[level];
      }
    }
    
    return approvalLevels[0]; // Default lowest level
  };

  const hasApprovalAuthority = (userRole: string, requiredRole: string): boolean => {
    const roleHierarchy = [
      'department_manager',
      'finance_officer', 
      'supervisor',
      'municipal_board',
      'mayor'
    ];
    
    const userLevel = roleHierarchy.indexOf(userRole);
    const requiredLevel = roleHierarchy.indexOf(requiredRole);
    
    return userLevel >= requiredLevel;
  };

  const getCurrentFiscalYear = (fiscalYear: any) => {
    const currentYear = new Date().getFullYear();
    return {
      start: new Date(`${currentYear}-${fiscalYear.start}`),
      end: new Date(`${currentYear}-${fiscalYear.end}`)
    };
  };

  const isWithinFiscalYear = (date: Date, fiscalYear: any): boolean => {
    return date >= fiscalYear.start && date <= fiscalYear.end;
  };

  const generateApprovalNotes = (context: {
    invoice: any;
    targetStage: string;
    country: string;
    locale: string;
    userRole: string;
    hasErrors: boolean;
    hasWarnings: boolean;
  }): string => {
    const { invoice, targetStage, country, locale, userRole, hasErrors, hasWarnings } = context;
    
    let notes = [];
    
    // Basic approval info
    notes.push(`Financial approval: ${invoice.vendor} - ${formatCurrency(invoice.amount, invoice.currency, locale)}`);
    notes.push(`Stage: ${targetStage} | Approver: ${userRole}`);
    
    // Compliance status
    if (hasErrors) {
      notes.push('❌ Financial compliance errors - approval blocked');
    } else if (hasWarnings) {
      notes.push('⚠️ Financial compliance warnings - review recommended');
    } else {
      notes.push('✅ Full financial compliance verified');
    }
    
    // Country regulations
    notes.push(`Validated against ${country} financial regulations`);
    
    // Timestamp
    notes.push(`Processed: ${new Date().toLocaleString(locale)}`);
    
    return notes.join(' | ');
  };

  const formatCurrency = (amount: number, currency: string, locale: string): string => {
    return new Intl.NumberFormat(locale === 'sv' ? 'sv-SE' : locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : 'nl-NL', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return {
    validateFinancialCompliance
  };
};