/**
 * GameContainer Component
 * Professional Municipal Layout System for DigiNativa Runtime Engine
 * 
 * Eliminates layout catastrophe and implements responsive municipal standards
 * Optimized for Anna Svensson iPhone 12 and scalable to enterprise workstations
 */

import React from 'react';
import {
  Container,
  Box,
  useColorModeValue,
  useBreakpointValue,
  VStack,
  HStack
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced ErrorBoundary import
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';

// Motion components for animations

// Container variant types
export type GameContainerVariant = 'default' | 'fullscreen' | 'modal' | 'sidebar';
export type MunicipalTheme = 'sweden' | 'germany' | 'france' | 'netherlands';
export type BrandingLevel = 'minimal' | 'standard' | 'full';

// Props interface following System Architect specification
export interface GameContainerProps {
  // Layout Configuration
  variant?: GameContainerVariant;
  maxWidth?: string | number | Record<string, string | number>;
  
  // Content Management
  children: React.ReactNode;
  bg?: string | Record<string, string>;
  
  // Accessibility
  ariaLabel?: string;
  role?: string;
  
  // Municipal Branding
  municipalTheme?: MunicipalTheme;
  brandingLevel?: BrandingLevel;
  
  // Performance
  enableScrollOptimization?: boolean;
  lazyLoad?: boolean;
  
  // Error Handling
  errorBoundary?: boolean;
  fallbackComponent?: React.ComponentType;
}

// Responsive breakpoint configuration

// Container configurations by variant

// Municipal color schemes

/**
 * GameContainer Component
 * Professional municipal layout system that eliminates vänsterpackad layout
 */
export const GameContainer: React.FC<GameContainerProps> = ({
  variant = 'default',
  maxWidth,
  children,
  bg,
  ariaLabel,
  role = 'main',
  municipalTheme = 'sweden',
  brandingLevel = 'standard',
  enableScrollOptimization = true,
  lazyLoad = false,
  errorBoundary = true,
  fallbackComponent,
  ...props
}) => {
  // Get container configuration
  
  // Responsive values for Anna Svensson iPhone 12 optimization
  
  // Background color with municipal theming
  const _backgroundColor = useColorModeValue(
    bg || municipalColors.background,
    bg || '#1A202C'
  );
  
  // Container spacing based on branding level
  const _spacing = useBreakpointValue({
    base: brandingLevel === 'minimal' ? 4 : 6,
    md: brandingLevel === 'minimal' ? 6 : 8,
    lg: brandingLevel === 'minimal' ? 8 : 10
  });
  
  // Animation variants for smooth container entrance
  
  // Content animation variants
  
  // Main container content
  const _containerContent = (
    <MotionContainer
      maxW={containerMaxWidth}
      p={containerPadding}
      bg={backgroundColor}
      position="relative"
      mx="auto" // Critical: Centers container to eliminate vänsterpackad layout
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      centerContent={config.centerOnLoad}
      aria-label={ariaLabel || `${municipalTheme} municipal game container`}
      role={role}
      // Performance optimizations
      style={{
        willChange: 'transform, opacity',
        contain: enableScrollOptimization ? 'layout style paint' : undefined
      }}
      {...props}
    >
      <MotionBox
        w="100%"
        variants={contentVariants}
        // Municipal professional spacing
        sx={{
          '& > *:not(:last-child)': {
            marginBottom: spacing
          }
        }}
        // Anna Svensson iPhone 12 touch optimization
        minH={{ base: variant === 'fullscreen' ? '100vh' : 'auto', sm: 'auto' }}
        // Professional focus management
        _focusWithin={{
          outline: `2px solid ${municipalColors.primary}`,
          outlineOffset: '4px'
        }}
      >
        {children}
      </MotionBox>
    </MotionContainer>
  );
  
  // Variant-specific wrappers
  
  // Wrap with Enhanced ErrorBoundary if enabled
  if (errorBoundary) {
    return (
      <EnhancedErrorBoundary
        municipalTheme={municipalTheme}
        brandingLevel={brandingLevel}
        fallbackComponent={fallbackComponent}
      >
        <AnimatePresence mode="wait">
          {renderVariantContent()}
        </AnimatePresence>
      </EnhancedErrorBoundary>
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      {renderVariantContent()}
    </AnimatePresence>
  );
};

// Default export
export default GameContainer;

// Named exports for variants
export const DefaultGameContainer: React.FC<Omit<GameContainerProps, 'variant'>> = (props) => (
  <GameContainer variant="default" {...props} />
);

export const FullscreenGameContainer: React.FC<Omit<GameContainerProps, 'variant'>> = (props) => (
  <GameContainer variant="fullscreen" {...props} />
);

export const ModalGameContainer: React.FC<Omit<GameContainerProps, 'variant'>> = (props) => (
  <GameContainer variant="modal" {...props} />
);

export const SidebarGameContainer: React.FC<Omit<GameContainerProps, 'variant'>> = (props) => (
  <GameContainer variant="sidebar" {...props} />
);