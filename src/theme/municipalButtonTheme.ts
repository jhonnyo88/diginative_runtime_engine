import { defineStyleConfig } from '@chakra-ui/react';

/**
 * Municipal Button Theme Configuration
 * Based on Game Designer task-gd-007 professional button design specification
 */
  // Base styles for all municipal buttons
  baseStyle: {
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'all 150ms ease-out',
    _focus: {
      boxShadow: '0 0 0 3px rgba(0, 102, 204, 0.3)',
      outline: 'none',
    },
    _disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      _hover: {
        transform: 'none',
        boxShadow: 'none',
      },
    },
  },

  // Municipal button variants
  variants: {
    // Primary Municipal Action Button
    'municipal-primary': {
      bg: 'linear-gradient(135deg, #0066CC 0%, #004C99 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 2px 4px rgba(0, 102, 204, 0.15)',
      _hover: {
        bg: 'linear-gradient(135deg, #004C99 0%, #003D73 100%)',
        boxShadow: '0 4px 8px rgba(0, 102, 204, 0.25)',
        _disabled: {
          bg: 'gray.400',
        },
      },
      _active: {
        bg: 'linear-gradient(135deg, #003D73 0%, #002E59 100%)',
        boxShadow: '0 1px 2px rgba(0, 102, 204, 0.2)',
      },
    },

    // Secondary Municipal Support Button
    'municipal-secondary': {
      bg: '#F5F5F5',
      color: '#333333',
      border: '1px solid',
      borderColor: '#CCCCCC',
      boxShadow: 'none',
      _hover: {
        bg: '#E5E5E5',
        borderColor: '#999999',
        _disabled: {
          bg: 'gray.100',
        },
      },
      _active: {
        bg: '#D5D5D5',
        borderColor: '#666666',
      },
    },

    // Outline Municipal Accent Button
    'municipal-outline': {
      bg: 'transparent',
      color: '#0066CC',
      border: '2px solid',
      borderColor: '#0066CC',
      boxShadow: 'none',
      _hover: {
        bg: '#E6F3FF',
        color: '#004C99',
        borderColor: '#004C99',
        _disabled: {
          bg: 'transparent',
        },
      },
      _active: {
        bg: '#CCE5FF',
        color: '#003D73',
        borderColor: '#003D73',
      },
    },

    // Cultural Context Variants
    'swedish-primary': {
      bg: 'linear-gradient(135deg, #0066CC 0%, #004C99 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 2px 4px rgba(0, 102, 204, 0.15)',
      _hover: {
        bg: 'linear-gradient(135deg, #004C99 0%, #003D73 100%)',
        boxShadow: '0 4px 8px rgba(0, 102, 204, 0.25)',
      },
    },

    'german-primary': {
      bg: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
      _hover: {
        bg: 'linear-gradient(135deg, #333333 0%, #555555 100%)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
      },
    },

    'french-primary': {
      bg: 'linear-gradient(135deg, #000091 0%, #000074 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 2px 4px rgba(0, 0, 145, 0.15)',
      _hover: {
        bg: 'linear-gradient(135deg, #000074 0%, #000058 100%)',
        boxShadow: '0 4px 8px rgba(0, 0, 145, 0.25)',
      },
    },

    'dutch-primary': {
      bg: 'linear-gradient(135deg, #01689B 0%, #154273 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 2px 4px rgba(1, 104, 155, 0.15)',
      _hover: {
        bg: 'linear-gradient(135deg, #154273 0%, #0A2C4D 100%)',
        boxShadow: '0 4px 8px rgba(1, 104, 155, 0.25)',
      },
    },
  },

  // Size variants for municipal buttons
  sizes: {
    'municipal-sm': {
      h: '40px',
      minW: '80px',
      fontSize: 'sm',
      px: 4,
    },
    'municipal-md': {
      h: '48px',
      minW: '100px',
      fontSize: 'md',
      px: 6,
    },
    'municipal-lg': {
      h: { base: '48px', md: '56px' },
      minW: { base: '120px', md: '160px' },
      fontSize: 'lg',
      px: { base: 6, md: 8 },
    },
  },

  // Default props
  defaultProps: {
    variant: 'municipal-primary',
    size: 'municipal-md',
  },
});

/**
 * Button text translations for different cultural contexts
 */
  swedish: {
    start: 'Starta utbildningen',
    continue: 'Fortsätt',
    submit: 'Skicka svar',
    cancel: 'Avbryt',
    back: 'Tillbaka',
    next: 'Nästa',
    finish: 'Slutför',
    tryAgain: 'Försök igen',
    close: 'Stäng',
    help: 'Hjälp',
    support: 'Kontakta support',
  },
  german: {
    start: 'Schulung starten',
    continue: 'Weiter',
    submit: 'Antwort senden',
    cancel: 'Abbrechen',
    back: 'Zurück',
    next: 'Weiter',
    finish: 'Abschließen',
    tryAgain: 'Erneut versuchen',
    close: 'Schließen',
    help: 'Hilfe',
    support: 'Support kontaktieren',
  },
  french: {
    start: 'Commencer la formation',
    continue: 'Continuer',
    submit: 'Envoyer la réponse',
    cancel: 'Annuler',
    back: 'Retour',
    next: 'Suivant',
    finish: 'Terminer',
    tryAgain: 'Réessayer',
    close: 'Fermer',
    help: 'Aide',
    support: 'Contacter le support',
  },
  dutch: {
    start: 'Training starten',
    continue: 'Doorgaan',
    submit: 'Antwoord versturen',
    cancel: 'Annuleren',
    back: 'Terug',
    next: 'Volgende',
    finish: 'Voltooien',
    tryAgain: 'Opnieuw proberen',
    close: 'Sluiten',
    help: 'Help',
    support: 'Contact opnemen',
  },
};

/**
 * Get button text based on cultural context
 */
  key: keyof typeof buttonTranslations.swedish,
  culturalContext: keyof typeof buttonTranslations = 'swedish'
): string => {
  return buttonTranslations[culturalContext]?.[key] || buttonTranslations.swedish[key];
};