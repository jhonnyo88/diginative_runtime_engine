/**
 * Cultural Adaptation Context
 * Provides cultural adaptation capabilities for Q3 Multi-World system
 * Building on Q2 cultural context patterns with enhanced European localization
 */

import React, { createContext, useContext, ReactNode } from 'react';

type CulturalContext = 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal';

interface CulturalAdaptationContextType {
  culturalContext: CulturalContext;
  getLocalizedText: (key: string, fallback?: string) => string;
  getLocalizedNumber: (value: number) => string;
  getLocalizedDate: (date: Date) => string;
  getLocalizedCurrency: (amount: number) => string;
  getCulturalColor: (type: 'primary' | 'secondary' | 'accent') => string;
  getMunicipalTitle: (role: string) => string;
  getGovernmentLevel: () => string;
}


interface CulturalAdaptationProviderProps {
  children: ReactNode;
  culturalContext: CulturalContext;
}

export const CulturalAdaptationProvider: React.FC<CulturalAdaptationProviderProps> = ({
  children,
  culturalContext
}) => {
  const _getLocalizedText = (key: string, fallback?: string): string => {

    return translations[culturalContext]?.[key as keyof typeof translations['swedish_municipal']] || fallback || key;
  };

  const _getLocalizedNumber = (value: number): string => {

    return new Intl.NumberFormat(locales[culturalContext]).format(value);
  };

  const _getLocalizedDate = (date: Date): string => {

    return new Intl.DateTimeFormat(locales[culturalContext], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const _getLocalizedCurrency = (amount: number): string => {

    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency
    }).format(amount);
  };

  const _getCulturalColor = (type: 'primary' | 'secondary' | 'accent'): string => {

    return colorSchemes[culturalContext][type];
  };

  const _getMunicipalTitle = (role: string): string => {

    return titles[culturalContext]?.[role as keyof typeof titles['swedish_municipal']] || role;
  };

  const _getGovernmentLevel = (): string => {

    return governmentLevels[culturalContext];
  };

  const contextValue: CulturalAdaptationContextType = {
    culturalContext,
    getLocalizedText,
    getLocalizedNumber,
    getLocalizedDate,
    getLocalizedCurrency,
    getCulturalColor,
    getMunicipalTitle,
    getGovernmentLevel
  };

  return (
    <CulturalAdaptationContext.Provider value={contextValue}>
      {children}
    </CulturalAdaptationContext.Provider>
  );
};

  if (context === undefined) {
    throw new Error('useCulturalAdaptation must be used within a CulturalAdaptationProvider');
  }
  return context;
};

export default CulturalAdaptationProvider;