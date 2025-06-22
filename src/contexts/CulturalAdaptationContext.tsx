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

const CulturalAdaptationContext = createContext<CulturalAdaptationContextType | undefined>(undefined);

interface CulturalAdaptationProviderProps {
  children: ReactNode;
  culturalContext: CulturalContext;
}

export const CulturalAdaptationProvider: React.FC<CulturalAdaptationProviderProps> = ({
  children,
  culturalContext
}) => {
  const getLocalizedText = (key: string, fallback?: string): string => {
    const translations = {
      swedish_municipal: {
        welcome: 'Välkommen',
        continue: 'Fortsätt',
        start: 'Börja',
        complete: 'Slutför',
        locked: 'Låst',
        available: 'Tillgänglig',
        in_progress: 'Pågående',
        completed: 'Slutförd',
        score: 'Poäng',
        time: 'Tid',
        achievements: 'Prestationer',
        worlds: 'Världar',
        total_score: 'Total Poäng',
        completion: 'Slutförande',
        certification: 'Certifiering',
        professional_level: 'Professionell Nivå',
        municipal_training: 'Kommunal Utbildning',
        competency_development: 'Kompetensutveckling',
        loading: 'Laddar',
        error: 'Ett fel uppstod',
        retry: 'Försök igen'
      },
      german_municipal: {
        welcome: 'Willkommen',
        continue: 'Fortsetzen',
        start: 'Beginnen',
        complete: 'Abschließen',
        locked: 'Gesperrt',
        available: 'Verfügbar',
        in_progress: 'In Bearbeitung',
        completed: 'Abgeschlossen',
        score: 'Punkte',
        time: 'Zeit',
        achievements: 'Errungenschaften',
        worlds: 'Welten',
        total_score: 'Gesamtpunkte',
        completion: 'Vollendung',
        certification: 'Zertifizierung',
        professional_level: 'Professionelles Niveau',
        municipal_training: 'Kommunale Ausbildung',
        competency_development: 'Kompetenzentwicklung',
        loading: 'Wird geladen',
        error: 'Ein Fehler ist aufgetreten',
        retry: 'Erneut versuchen'
      },
      french_municipal: {
        welcome: 'Bienvenue',
        continue: 'Continuer',
        start: 'Commencer',
        complete: 'Terminer',
        locked: 'Verrouillé',
        available: 'Disponible',
        in_progress: 'En cours',
        completed: 'Terminé',
        score: 'Score',
        time: 'Temps',
        achievements: 'Réalisations',
        worlds: 'Mondes',
        total_score: 'Score Total',
        completion: 'Achèvement',
        certification: 'Certification',
        professional_level: 'Niveau Professionnel',
        municipal_training: 'Formation Municipale',
        competency_development: 'Développement des Compétences',
        loading: 'Chargement',
        error: 'Une erreur s\'est produite',
        retry: 'Réessayer'
      },
      dutch_municipal: {
        welcome: 'Welkom',
        continue: 'Doorgaan',
        start: 'Beginnen',
        complete: 'Voltooien',
        locked: 'Vergrendeld',
        available: 'Beschikbaar',
        in_progress: 'Bezig',
        completed: 'Voltooid',
        score: 'Score',
        time: 'Tijd',
        achievements: 'Prestaties',
        worlds: 'Werelden',
        total_score: 'Totale Score',
        completion: 'Voltooiing',
        certification: 'Certificering',
        professional_level: 'Professioneel Niveau',
        municipal_training: 'Gemeentelijke Training',
        competency_development: 'Competentieontwikkeling',
        loading: 'Laden',
        error: 'Er is een fout opgetreden',
        retry: 'Opnieuw proberen'
      }
    };

    return translations[culturalContext]?.[key as keyof typeof translations['swedish_municipal']] || fallback || key;
  };

  const getLocalizedNumber = (value: number): string => {
    const locales = {
      swedish_municipal: 'sv-SE',
      german_municipal: 'de-DE',
      french_municipal: 'fr-FR',
      dutch_municipal: 'nl-NL'
    };

    return new Intl.NumberFormat(locales[culturalContext]).format(value);
  };

  const getLocalizedDate = (date: Date): string => {
    const locales = {
      swedish_municipal: 'sv-SE',
      german_municipal: 'de-DE',
      french_municipal: 'fr-FR',
      dutch_municipal: 'nl-NL'
    };

    return new Intl.DateTimeFormat(locales[culturalContext], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getLocalizedCurrency = (amount: number): string => {
    const currencyConfig = {
      swedish_municipal: { currency: 'SEK', locale: 'sv-SE' },
      german_municipal: { currency: 'EUR', locale: 'de-DE' },
      french_municipal: { currency: 'EUR', locale: 'fr-FR' },
      dutch_municipal: { currency: 'EUR', locale: 'nl-NL' }
    };

    const config = currencyConfig[culturalContext];
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency
    }).format(amount);
  };

  const getCulturalColor = (type: 'primary' | 'secondary' | 'accent'): string => {
    const colorSchemes = {
      swedish_municipal: {
        primary: '#006AA7',
        secondary: '#FFCD00',
        accent: '#004B87'
      },
      german_municipal: {
        primary: '#000000',
        secondary: '#DD0000',
        accent: '#FFCE00'
      },
      french_municipal: {
        primary: '#0055A4',
        secondary: '#EF4135',
        accent: '#FFFFFF'
      },
      dutch_municipal: {
        primary: '#21468B',
        secondary: '#FF6C00',
        accent: '#FFFFFF'
      }
    };

    return colorSchemes[culturalContext][type];
  };

  const getMunicipalTitle = (role: string): string => {
    const titles = {
      swedish_municipal: {
        mayor: 'Kommunstyrelsens ordförande',
        council_member: 'Kommunfullmäktigeledamot',
        administrator: 'Kommunchef',
        department_head: 'Förvaltningschef',
        employee: 'Kommunanställd',
        citizen: 'Medborgare'
      },
      german_municipal: {
        mayor: 'Bürgermeister',
        council_member: 'Gemeinderat',
        administrator: 'Verwaltungsleiter',
        department_head: 'Abteilungsleiter',
        employee: 'Gemeindeangestellter',
        citizen: 'Bürger'
      },
      french_municipal: {
        mayor: 'Maire',
        council_member: 'Conseiller municipal',
        administrator: 'Directeur général',
        department_head: 'Chef de service',
        employee: 'Agent municipal',
        citizen: 'Citoyen'
      },
      dutch_municipal: {
        mayor: 'Burgemeester',
        council_member: 'Gemeenteraadslid',
        administrator: 'Gemeentesecretaris',
        department_head: 'Afdelingshoofd',
        employee: 'Gemeenteambtenaar',
        citizen: 'Burger'
      }
    };

    return titles[culturalContext]?.[role as keyof typeof titles['swedish_municipal']] || role;
  };

  const getGovernmentLevel = (): string => {
    const governmentLevels = {
      swedish_municipal: 'Sveriges Kommuner och Regioner (SKR)',
      german_municipal: 'Deutscher Städte- und Gemeindebund (DStGB)',
      french_municipal: 'Association des Maires de France (AMF)',
      dutch_municipal: 'Vereniging van Nederlandse Gemeenten (VNG)'
    };

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

export const useCulturalAdaptation = (): CulturalAdaptationContextType => {
  const context = useContext(CulturalAdaptationContext);
  if (context === undefined) {
    throw new Error('useCulturalAdaptation must be used within a CulturalAdaptationProvider');
  }
  return context;
};

export default CulturalAdaptationProvider;