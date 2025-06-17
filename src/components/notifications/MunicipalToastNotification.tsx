import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack,
  IconButton,
  useBreakpointValue 
} from '@chakra-ui/react';
import { CloseIcon, CheckIcon, CertificateIcon, StarIcon } from '../icons/GameIcons';
import { 
  useAchievementAnnouncer, 
  useAchievementFocus, 
  useHighContrastDetection,
  useReducedMotionDetection,
  useAchievementKeyboardNavigation
} from '../accessibility/AchievementAccessibility';

import type { MunicipalAchievement } from '../../services/municipal-achievement-engine';

export interface MunicipalToastNotificationProps {
  // Municipal Toast Content
  achievement: MunicipalAchievement;
  
  // Professional Design Props
  design: {
    variant: 'municipal-achievement' | 'certification' | 'competence';
    culturalContext: 'swedish' | 'german' | 'french' | 'dutch';
    municipalEntity: 'malmö' | 'berlin' | 'paris' | 'amsterdam';
    professionalLevel: 'basic' | 'intermediate' | 'expert' | 'mentor';
  };
  
  // Accessibility & Control
  accessibility: {
    dismissible: boolean; // true - user can dismiss
    autoTimeout: number; // 4000ms default
    reducedMotion: boolean; // respects user preference
    screenReaderFriendly: boolean; // proper ARIA announcements
  };
  
  // Municipal Integration
  integration: {
    onDismiss?: () => void;
    onViewPortfolio?: () => void; // Link to achievement portfolio
    onShare?: () => void; // Professional sharing options
    analytics?: (event: string, data: any) => void;
  };
}

export const MunicipalToastNotification: React.FC<MunicipalToastNotificationProps> = ({
  achievement,
  design,
  accessibility,
  integration
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  
  // Responsive positioning
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // TASK-HD-014: Accessibility enhancements
  const { announceAchievement } = useAchievementAnnouncer();
  const { focusToast, restoreFocus } = useAchievementFocus();
  const { isHighContrast, getHighContrastColors } = useHighContrastDetection();
  const { prefersReducedMotion, getAnimationProps } = useReducedMotionDetection();
  const { handleKeyDown, createFocusableElement } = useAchievementKeyboardNavigation();
  
  // Municipal colors based on cultural context
  const getMunicipalColors = () => {
    switch (design.culturalContext) {
      case 'swedish':
        return { 
          primary: '#0066CC', // Municipal blue
          background: '#0066CC',
          text: '#FFFFFF'
        };
      case 'german':
        return { 
          primary: '#000000', // Federal black
          background: '#000000',
          text: '#FFFFFF'
        };
      case 'french':
        return { 
          primary: '#000091', // French Republic blue
          background: '#000091',
          text: '#FFFFFF'
        };
      case 'dutch':
        return { 
          primary: '#154273', // Nederlandse blue
          background: '#154273',
          text: '#FFFFFF'
        };
      default:
        return { 
          primary: '#0066CC',
          background: '#0066CC',
          text: '#FFFFFF'
        };
    }
  };

  const colors = getMunicipalColors();

  // Achievement icon based on variant
  const getAchievementIcon = () => {
    switch (design.variant) {
      case 'certification':
        return <CertificateIcon w="20px" h="20px" color={colors.text} aria-hidden="true" />;
      case 'competence':
        return <StarIcon w="20px" h="20px" color={colors.text} aria-hidden="true" />;
      case 'municipal-achievement':
      default:
        return <CheckIcon w="20px" h="20px" color={colors.text} aria-hidden="true" />;
    }
  };

  // TASK-HD-014: Accessibility initialization
  useEffect(() => {
    // Announce achievement to screen readers
    if (accessibility.screenReaderFriendly) {
      announceAchievement(
        achievement.title,
        achievement.description,
        achievement.municipalValue,
        design.culturalContext
      );
    }

    // Focus management for keyboard users
    if (accessibility.dismissible) {
      focusToast(toastRef.current);
    }

    // Track analytics
    integration.analytics?.('municipal_achievement_toast_shown', {
      achievementId: achievement.id,
      variant: design.variant,
      culturalContext: design.culturalContext,
      municipalEntity: design.municipalEntity,
      accessibilityFeatures: {
        screenReader: accessibility.screenReaderFriendly,
        reducedMotion: accessibility.reducedMotion,
        dismissible: accessibility.dismissible,
        highContrast: isHighContrast
      }
    });

    return () => {
      if (accessibility.dismissible) {
        restoreFocus();
      }
    };
  }, []);

  // Auto-dismiss handling
  useEffect(() => {
    if (accessibility.autoTimeout > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, accessibility.autoTimeout);

      return () => clearTimeout(timer);
    }
  }, [accessibility.autoTimeout]);

  // Handle dismissal with animation
  const handleDismiss = () => {
    setIsExiting(true);
    
    // Give time for exit animation
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      integration.onDismiss?.();
    }, accessibility.reducedMotion ? 0 : 300);

    return () => clearTimeout(exitTimer);
  };

  // TASK-HD-014: Enhanced keyboard handling for accessibility
  const handleToastKeyDown = (event: React.KeyboardEvent) => {
    handleKeyDown(event, {
      onEscape: accessibility.dismissible ? handleDismiss : undefined,
      onEnter: accessibility.dismissible ? handleDismiss : undefined,
      onSpace: accessibility.dismissible ? handleDismiss : undefined
    });
  };

  // TASK-HD-014: Apply high contrast colors if needed
  const accessibleColors = isHighContrast 
    ? getHighContrastColors({
        progressColor: colors.primary,
        milestoneColor: colors.primary,
        textColor: colors.text,
        backgroundColor: colors.background
      })
    : colors;

  if (!isVisible) return null;

  return (
    <Box
      ref={toastRef}
      position="fixed"
      top={isMobile ? "20px" : "24px"}
      right={isMobile ? "16px" : "24px"}
      zIndex={1000}
      maxW={isMobile ? "calc(100% - 32px)" : "400px"}
      minW="300px"
      role="alert"
      aria-live="polite"
      aria-labelledby="toast-title"
      aria-describedby="toast-description"
      onKeyDown={handleToastKeyDown}
      {...createFocusableElement({
        role: 'alert',
        tabIndex: accessibility.dismissible ? 0 : -1,
        ariaLabel: `${achievement.title}: ${achievement.description}`,
        onKeyDown: handleToastKeyDown
      })}
      sx={{
        '@keyframes slideInRight': {
          '0%': { 
            transform: 'translateX(100%)',
            opacity: 0
          },
          '100%': { 
            transform: 'translateX(0)',
            opacity: 1
          }
        },
        '@keyframes slideOutRight': {
          '0%': { 
            transform: 'translateX(0)',
            opacity: 1
          },
          '100%': { 
            transform: 'translateX(100%)',
            opacity: 0
          }
        },
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        '@keyframes fadeOut': {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 }
        }
      }}
      animation={
        prefersReducedMotion || accessibility.reducedMotion
          ? isExiting 
            ? 'fadeOut 0.3s ease-out'
            : 'fadeIn 0.3s ease-out'
          : isExiting 
            ? 'slideOutRight 0.3s ease-out'
            : 'slideInRight 0.3s ease-out'
      }
    >
      <Box
        bg={isHighContrast ? accessibleColors.backgroundColor : colors.background}
        color={isHighContrast ? accessibleColors.textColor : colors.text}
        borderRadius="8px"
        p={6}
        boxShadow={isHighContrast ? "0 2px 8px rgba(0, 0, 0, 0.5)" : "0 4px 12px rgba(0, 102, 204, 0.15)"}
        border="2px solid"
        borderColor={isHighContrast ? accessibleColors.borderColor : `${colors.primary}33`}
        position="relative"
      >
        {/* Dismiss button */}
        {accessibility.dismissible && (
          <IconButton
            aria-label="Stäng notifikation"
            icon={<CloseIcon />}
            size="sm"
            variant="ghost"
            color={colors.text}
            position="absolute"
            top="8px"
            right="8px"
            onClick={handleDismiss}
            _hover={{
              bg: `${colors.text}20`
            }}
            _focusVisible={{
              outline: '2px solid',
              outlineColor: colors.text,
              outlineOffset: '2px'
            }}
          />
        )}

        <VStack spacing={3} align="stretch">
          {/* Achievement header */}
          <HStack spacing={3}>
            {getAchievementIcon()}
            <VStack spacing={1} align="stretch" flex="1">
              <Text 
                id="toast-title"
                fontSize="md" 
                fontWeight="bold" 
                lineHeight="1.2"
                pr={accessibility.dismissible ? 6 : 0}
              >
                {achievement.title}
              </Text>
              <Text 
                id="toast-description"
                fontSize="sm" 
                opacity={0.9}
                lineHeight="1.3"
              >
                {achievement.description}
              </Text>
            </VStack>
          </HStack>

          {/* Municipal value */}
          <Text 
            fontSize="sm" 
            fontWeight="medium" 
            opacity={0.8}
            fontStyle="italic"
          >
            {achievement.municipalValue}
          </Text>

          {/* Next steps (if provided) */}
          {achievement.nextSteps && (
            <Text 
              fontSize="sm" 
              opacity={0.9}
              borderTop="1px solid"
              borderTopColor={`${colors.text}20`}
              pt={3}
            >
              <strong>Nästa steg:</strong> {achievement.nextSteps}
            </Text>
          )}

          {/* Municipal entity branding */}
          <Text 
            fontSize="xs" 
            opacity={0.7} 
            textAlign="right"
            fontWeight="medium"
          >
            {design.municipalEntity.charAt(0).toUpperCase() + design.municipalEntity.slice(1)} Stad
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

// Municipal achievement categories for GDPR training
export const MunicipalAchievementCategories = {
  // Municipal Competence Achievements
  GDPR_SPECIALIST: {
    id: 'gdpr_specialist',
    title: 'GDPR Specialist',
    description: 'Du behärskar nu kommunal datahantering och personuppgiftsskydd',
    municipalValue: 'Värdefull kompetens för säker informationshantering',
    nextSteps: 'Tillämpa GDPR-kunskaper i dina dagliga arbetsuppgifter'
  } as MunicipalAchievement,
  
  COMPLIANCE_CHAMPION: {
    id: 'compliance_champion',
    title: 'Efterlevnadschampion',
    description: 'Du visar excellenta kunskaper inom regelefterlevnad',
    municipalValue: 'Bidrar till kommunens juridiska säkerhet och trovärdighet',
    nextSteps: 'Dela din kunskap med kollegor och stöd teamets utveckling'
  } as MunicipalAchievement,

  EFFICIENCY_EXPERT: {
    id: 'efficiency_expert', 
    title: 'Effektivitetsexpert',
    description: 'Du slutförde utbildningen med högsta professionella standard',
    municipalValue: 'Visar engagemang för kontinuerlig kompetensutveckling',
    nextSteps: 'Kontakta din chef för att diskutera tillämpning på arbetsplatsen'
  } as MunicipalAchievement,

  MUNICIPAL_CERTIFIED: {
    id: 'municipal_certified',
    title: 'Malmö Stad Certifierad',
    description: 'Du har erhållit officiell kommunal certifiering inom GDPR',
    municipalValue: 'Erkänd kompetens som stärker kommunens digitala transformation',
    nextSteps: 'Ladda ner ditt certifikat och uppdatera din kompetensprofil'
  } as MunicipalAchievement
};

// Cultural text adaptations for different municipal contexts
export const getMunicipalToastText = (
  achievementKey: keyof typeof MunicipalAchievementCategories,
  culturalContext: 'swedish' | 'german' | 'french' | 'dutch'
): MunicipalAchievement => {
  const baseAchievement = MunicipalAchievementCategories[achievementKey];
  
  switch (culturalContext) {
    case 'german':
      return {
        ...baseAchievement,
        title: baseAchievement.title === 'GDPR Specialist' ? 'DSGVO Spezialist' :
               baseAchievement.title === 'Efterlevnadschampion' ? 'Compliance Champion' :
               baseAchievement.title === 'Effektivitetsexpert' ? 'Effizienz-Experte' :
               'Behördlich Zertifiziert',
        description: 'Sie beherrschen nun behördliche Datenverarbeitung und Datenschutz',
        municipalValue: 'Wertvolle Kompetenz für sichere Informationsverarbeitung',
        nextSteps: 'Wenden Sie Ihr DSGVO-Wissen in Ihren täglichen Arbeitsaufgaben an'
      };
    
    case 'french':
      return {
        ...baseAchievement,
        title: baseAchievement.title === 'GDPR Specialist' ? 'Spécialiste RGPD' :
               baseAchievement.title === 'Efterlevnadschampion' ? 'Champion de Conformité' :
               baseAchievement.title === 'Effektivitetsexpert' ? 'Expert en Efficacité' :
               'Certifié Municipal',
        description: 'Vous maîtrisez maintenant le traitement des données municipales et la protection des données personnelles',
        municipalValue: 'Compétence précieuse pour un traitement sécurisé de l\'information',
        nextSteps: 'Appliquez vos connaissances RGPD dans vos tâches quotidiennes'
      };
    
    case 'dutch':
      return {
        ...baseAchievement,
        title: baseAchievement.title === 'GDPR Specialist' ? 'AVG Specialist' :
               baseAchievement.title === 'Efterlevnadschampion' ? 'Compliance Kampioen' :
               baseAchievement.title === 'Effektivitetsexpert' ? 'Efficiëntie Expert' :
               'Gemeentelijk Gecertificeerd',
        description: 'U beheerst nu gemeentelijke gegevensverwerking en gegevensbescherming',
        municipalValue: 'Waardevolle competentie voor veilige informatieverwerking',
        nextSteps: 'Pas uw AVG-kennis toe in uw dagelijkse werktaken'
      };
    
    default: // Swedish
      return baseAchievement;
  }
};