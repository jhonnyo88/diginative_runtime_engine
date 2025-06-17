import React from 'react';
import { Button as ChakraButton, forwardRef } from '@chakra-ui/react';
import type { ComponentProps } from 'react';
import { motion } from 'framer-motion';

// Municipal Button Props extending Chakra's Button
type ChakraButtonProps = ComponentProps<typeof ChakraButton>;
export interface MunicipalButtonProps extends ChakraButtonProps {
  variant?: 'municipal-primary' | 'municipal-secondary' | 'municipal-outline';
  culturalContext?: 'swedish' | 'german' | 'french' | 'dutch';
  municipalEntity?: string;
  governmentLevel?: 'municipal' | 'regional' | 'federal';
  accessibilityStandard?: 'DOS2018' | 'BITV2' | 'RGAA4' | 'WCAG21AA';
  trustIndicators?: boolean;
  supportContact?: string;
  progressContext?: 'session' | 'section' | 'complete';
  annaOptimization?: boolean;
}

// Motion component for button animations
const MotionButton = motion(ChakraButton);

/**
 * Enhanced Municipal Button Component
 * Implements professional button design system for government services
 * Based on Game Designer task-gd-007 specifications
 */
export const MunicipalButton = forwardRef<MunicipalButtonProps, 'button'>(
  (props, ref) => {
    const {
      variant = 'municipal-primary',
      culturalContext = 'swedish',
      municipalEntity,
      governmentLevel = 'municipal',
      accessibilityStandard = 'WCAG21AA',
      trustIndicators,
      supportContact,
      progressContext,
      annaOptimization = true,
      children,
      isLoading,
      loadingText,
      ...rest
    } = props;

    // Get cultural loading text
    const getCulturalLoadingText = () => {
      if (loadingText) return loadingText;
      switch (culturalContext) {
        case 'swedish': return 'Bearbetar...';
        case 'german': return 'Verarbeitung...';
        case 'french': return 'Traitement...';
        case 'dutch': return 'Verwerken...';
        default: return 'Bearbetar...';
      }
    };

    // Motion variants for professional interactions
    const buttonVariants = {
      rest: {
        scale: 1,
        y: 0,
      },
      hover: {
        scale: 1,
        y: variant === 'municipal-primary' ? -1 : -0.5,
        transition: { duration: 0.15, ease: 'easeOut' }
      },
      tap: {
        scale: 0.98,
        y: 0,
        transition: { duration: 0.1 }
      }
    };

    return (
      <MotionButton
        ref={ref}
        variant={variant}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        isLoading={isLoading}
        loadingText={getCulturalLoadingText()}
        // Ensure minimum touch targets for Anna Svensson
        minH={annaOptimization ? { base: '48px', md: '56px' } : '48px'}
        minW={annaOptimization ? { base: '120px', md: '160px' } : '100px'}
        // Professional typography
        fontWeight="500"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        // Accessibility attributes
        aria-label={rest['aria-label'] || (typeof children === 'string' ? children : undefined)}
        data-cultural-context={culturalContext}
        data-municipal-entity={municipalEntity}
        data-government-level={governmentLevel}
        data-accessibility-standard={accessibilityStandard}
        {...rest}
      >
        {children}
      </MotionButton>
    );
  }
);

MunicipalButton.displayName = 'MunicipalButton';