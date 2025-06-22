import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { ChakraProvider, extendTheme, ThemeConfig } from '@chakra-ui/react';
import { useCharacterContext } from '../../contexts/CharacterContext';

// European Cultural Theme Definitions
interface CulturalTheme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    gradients: {
      primary: string;
      hero: string;
      card: string;
    };
  };
  typography: {
    fontFamily: string;
    fontWeights: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    letterSpacing: {
      tight: string;
      normal: string;
      wide: string;
    };
  };
  spacing: {
    density: 'compact' | 'comfortable' | 'spacious';
    cardPadding: string;
    sectionSpacing: string;
  };
  cultural: {
    language: string;
    locale: string;
    municipalTerminology: Record<string, string>;
    professionalPhrases: Record<string, string>;
    motivationalLanguage: Record<string, string>;
  };
  animations: {
    duration: string;
    easing: string;
    stagger: number;
  };
}

// Swedish Lagom Theme - Balanced, Democratic, Sustainable
const swedishLagomTheme: CulturalTheme = {
  name: 'swedish',
  displayName: 'Svenska Lagom',
  colors: {
    primary: '#4A90A4', // Natural Swedish Blue
    secondary: '#F8F9FA', // Nordic White
    accent: '#7FB069', // Sustainable Green
    background: '#FAFBFC', // Soft Nordic Background
    surface: '#FFFFFF', // Clean White Surface
    text: {
      primary: '#2D3748', // Dark Professional
      secondary: '#4A5568', // Medium Gray
      muted: '#718096' // Light Gray
    },
    gradients: {
      primary: 'linear-gradient(135deg, #4A90A4 0%, #7FB069 100%)',
      hero: 'linear-gradient(135deg, #4A90A4 0%, #7FB069 50%, #F8F9FA 100%)',
      card: 'linear-gradient(145deg, #FFFFFF 0%, #F8F9FA 100%)'
    }
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    }
  },
  spacing: {
    density: 'comfortable',
    cardPadding: '1.5rem',
    sectionSpacing: '2rem'
  },
  cultural: {
    language: 'sv-SE',
    locale: 'sv-SE',
    municipalTerminology: {
      municipality: 'kommun',
      professional: 'yrkesperson',
      competency: 'kompetens',
      development: 'utveckling',
      excellence: 'excellens',
      collaboration: 'samverkan'
    },
    professionalPhrases: {
      welcome: 'Välkommen tillbaka till din kompetensutveckling',
      progress: 'Kollektiv excellens genom professionell tillväxt',
      achievement: 'Ditt bidrag stärker hela kommunens kapacitet',
      motivation: 'Hållbar utveckling för bättre medborgarservice'
    },
    motivationalLanguage: {
      consensus: 'konsensus',
      collaboration: 'samarbete',
      sustainability: 'hållbarhet',
      democracy: 'demokrati',
      balance: 'balans'
    }
  },
  animations: {
    duration: '0.4s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    stagger: 0.1
  }
};

// German Systematik Theme - Methodical, Thorough, Process-Oriented
const germanSystematikTheme: CulturalTheme = {
  name: 'german',
  displayName: 'Deutsche Systematik',
  colors: {
    primary: '#1E3A8A', // Professional Prussian Blue
    secondary: '#FFFFFF', // Systematic White
    accent: '#6B7280', // Methodical Gray
    background: '#F9FAFB', // Clean Background
    surface: '#FFFFFF', // Pure White Surface
    text: {
      primary: '#1F2937', // Authoritative Dark
      secondary: '#374151', // Strong Gray
      muted: '#6B7280' // Professional Gray
    },
    gradients: {
      primary: 'linear-gradient(135deg, #1E3A8A 0%, #6B7280 100%)',
      hero: 'linear-gradient(135deg, #1E3A8A 0%, #6B7280 50%, #FFFFFF 100%)',
      card: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)'
    }
  },
  typography: {
    fontFamily: '"Source Sans Pro", "Arial", sans-serif',
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    letterSpacing: {
      tight: '-0.015em',
      normal: '0',
      wide: '0.015em'
    }
  },
  spacing: {
    density: 'compact',
    cardPadding: '1.25rem',
    sectionSpacing: '1.75rem'
  },
  cultural: {
    language: 'de-DE',
    locale: 'de-DE',
    municipalTerminology: {
      municipality: 'Verwaltung',
      professional: 'Fachkraft',
      competency: 'Kompetenz',
      development: 'Entwicklung',
      excellence: 'Exzellenz',
      collaboration: 'Zusammenarbeit'
    },
    professionalPhrases: {
      welcome: 'Willkommen zu Ihrer systematischen Kompetenzentwicklung',
      progress: 'Methodische Verbesserung der Verwaltungsexzellenz',
      achievement: 'Ihre gründliche Arbeit verbessert die öffentliche Verwaltung',
      motivation: 'Systematische Entwicklung führt zu nachhaltigem Erfolg'
    },
    motivationalLanguage: {
      systematic: 'systematisch',
      thorough: 'gründlich',
      methodical: 'methodisch',
      process: 'Prozess',
      excellence: 'Exzellenz'
    }
  },
  animations: {
    duration: '0.3s',
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    stagger: 0.08
  }
};

// French Service Public Theme - Refined, Sophisticated, Dignified
const frenchServicePublicTheme: CulturalTheme = {
  name: 'french',
  displayName: 'Service Public Français',
  colors: {
    primary: '#1E40AF', // Elegant République Blue
    secondary: '#FAFAFA', // Sophisticated White
    accent: '#7C3AED', // Cultural Sophistication Purple
    background: '#FCFCFD', // Refined Background
    surface: '#FFFFFF', // Pure Surface
    text: {
      primary: '#374151', // Refined Professional Gray
      secondary: '#4B5563', // Elegant Gray
      muted: '#6B7280' // Subtle Gray
    },
    gradients: {
      primary: 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)',
      hero: 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 50%, #FAFAFA 100%)',
      card: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAFA 100%)'
    }
  },
  typography: {
    fontFamily: '"Marianne", "Segoe UI", sans-serif',
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em'
    }
  },
  spacing: {
    density: 'spacious',
    cardPadding: '2rem',
    sectionSpacing: '2.5rem'
  },
  cultural: {
    language: 'fr-FR',
    locale: 'fr-FR',
    municipalTerminology: {
      municipality: 'service public',
      professional: 'fonctionnaire',
      competency: 'compétence',
      development: 'développement',
      excellence: 'excellence',
      collaboration: 'coopération'
    },
    professionalPhrases: {
      welcome: 'Bienvenue dans votre parcours d\'excellence professionnelle',
      progress: 'Développement raffiné du service public français',
      achievement: 'Votre engagement élève la qualité du service public',
      motivation: 'L\'excellence professionnelle au service de la République'
    },
    motivationalLanguage: {
      excellence: 'excellence',
      sophistication: 'sophistication',
      refinement: 'raffinement',
      dignity: 'dignité',
      republic: 'République'
    }
  },
  animations: {
    duration: '0.5s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    stagger: 0.12
  }
};

// Dutch Efficiency Theme - Direct, Practical, Results-Oriented
const dutchEfficiencyTheme: CulturalTheme = {
  name: 'dutch',
  displayName: 'Nederlandse Efficiëntie',
  colors: {
    primary: '#2563EB', // Direct Professional Blue
    secondary: '#FFFFFF', // Clear White
    accent: '#F97316', // Innovation Orange
    background: '#F8FAFC', // Clean Background
    surface: '#FFFFFF', // Crisp Surface
    text: {
      primary: '#1F2937', // Straightforward Dark
      secondary: '#374151', // Direct Gray
      muted: '#6B7280' // Practical Gray
    },
    gradients: {
      primary: 'linear-gradient(135deg, #2563EB 0%, #F97316 100%)',
      hero: 'linear-gradient(135deg, #2563EB 0%, #F97316 50%, #FFFFFF 100%)',
      card: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)'
    }
  },
  typography: {
    fontFamily: '"Open Sans", "Helvetica", sans-serif',
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    letterSpacing: {
      tight: '-0.01em',
      normal: '0',
      wide: '0.01em'
    }
  },
  spacing: {
    density: 'comfortable',
    cardPadding: '1.5rem',
    sectionSpacing: '2rem'
  },
  cultural: {
    language: 'nl-NL',
    locale: 'nl-NL',
    municipalTerminology: {
      municipality: 'gemeente',
      professional: 'ambtenaar',
      competency: 'competentie',
      development: 'ontwikkeling',
      excellence: 'excellentie',
      collaboration: 'samenwerking'
    },
    professionalPhrases: {
      welcome: 'Welkom bij uw praktische competentieontwikkeling',
      progress: 'Efficiënte verbetering van bestuurlijke excellentie',
      achievement: 'Uw ontwikkeling levert directe resultaten voor burgers',
      motivation: 'Praktische innovatie voor betere publieke dienstverlening'
    },
    motivationalLanguage: {
      efficiency: 'efficiëntie',
      practical: 'praktisch',
      direct: 'direct',
      innovation: 'innovatie',
      results: 'resultaten'
    }
  },
  animations: {
    duration: '0.35s',
    easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    stagger: 0.09
  }
};

// Cultural Theme Registry
const culturalThemes: Record<string, CulturalTheme> = {
  swedish: swedishLagomTheme,
  german: germanSystematikTheme,
  french: frenchServicePublicTheme,
  dutch: dutchEfficiencyTheme
};

// Cultural Theme Context
interface CulturalThemeContextType {
  currentTheme: CulturalTheme;
  switchTheme: (themeName: string) => void;
  availableThemes: string[];
  culturalContext: string;
}


  if (!context) {
    throw new Error('useCulturalTheme must be used within a CulturalThemeProvider');
  }
  return context;
};

// Theme Provider Component
interface CulturalThemeProviderProps {
  children: ReactNode;
}

export const CulturalThemeProvider: React.FC<CulturalThemeProviderProps> = ({ children }) => {
  const { currentPersona, switchPersona } = useCharacterContext();
  
  // Determine cultural context based on current persona
  const culturalContext = { id: 'swedish', displayName: 'Swedish' };
  const currentTheme = { colors: { primary: '#0066CC' } };
  
  const switchTheme = (theme: string) => {
    console.log('Switching to theme:', theme);
  };
  
  return (
    <CulturalThemeContext.Provider value={{ culturalContext, currentTheme, switchTheme }}>
      {children}
    </CulturalThemeContext.Provider>
  );
};
