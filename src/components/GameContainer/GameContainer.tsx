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
const MotionBox = motion(Box);
const MotionContainer = motion(Container);

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
const BREAKPOINTS = {
  xs: '0px',      // Ultra-small devices
  sm: '375px',    // Anna Svensson iPhone 12 (PRIMARY TARGET)
  md: '768px',    // Tablets and small laptops
  lg: '1024px',   // Klaus Mueller desktop
  xl: '1200px'    // Enterprise municipal workstations
};

// Container configurations by variant
const CONTAINER_CONFIGS = {
  default: {
    maxWidth: { base: '100%', sm: '100%', md: '768px', lg: '1024px', xl: '1200px' },
    padding: { base: '1rem', md: '2rem', lg: '3rem', xl: '4rem auto' },
    centerOnLoad: true
  },
  fullscreen: {
    maxWidth: '100vw',
    padding: 0,
    centerOnLoad: false
  },
  modal: {
    maxWidth: '600px',
    padding: '2rem',
    centerOnLoad: true
  },
  sidebar: {
    maxWidth: '1400px',
    padding: { base: '1rem', lg: '2rem' },
    centerOnLoad: true
  }
};

// Municipal color schemes
const MUNICIPAL_COLORS = {
  sweden: {
    primary: '#005293',
    secondary: '#E6F3FF',
    background: '#FFFFFF',
    accent: '#64748B'
  },
  germany: {
    primary: '#1F2937',
    secondary: '#F3F4F6',
    background: '#FFFFFF',
    accent: '#6B7280'
  },
  france: {
    primary: '#7C3AED',
    secondary: '#F3E8FF',
    background: '#FFFFFF',
    accent: '#8B5CF6'
  },
  netherlands: {
    primary: '#EA580C',
    secondary: '#FFF7ED',
    background: '#FFFFFF',
    accent: '#FB923C'
  }
};

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
  const config = CONTAINER_CONFIGS[variant];
  const municipalColors = MUNICIPAL_COLORS[municipalTheme];
  
  // Responsive values for Anna Svensson iPhone 12 optimization
  const containerMaxWidth = maxWidth || config.maxWidth;
  const containerPadding = config.padding;
  
  // Background color with municipal theming
  const backgroundColor = useColorModeValue(
    bg || municipalColors.background,
    bg || '#1A202C'
  );
  
  // Container spacing based on branding level
  const spacing = useBreakpointValue({
    base: brandingLevel === 'minimal' ? 4 : 6,
    md: brandingLevel === 'minimal' ? 6 : 8,
    lg: brandingLevel === 'minimal' ? 8 : 10
  });
  
  // Animation variants for smooth container entrance
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: variant === 'modal' ? 50 : 20,
      scale: variant === 'modal' ? 0.95 : 1
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: variant === 'modal' ? 50 : -20,
      scale: variant === 'modal' ? 0.95 : 1,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  };
  
  // Content animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  };
  
  // Main container content
  const containerContent = (
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
  const renderVariantContent = () => {
    switch (variant) {
      case 'fullscreen':
        return (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg={backgroundColor}
            zIndex="modal"
            overflow="auto"
            // Smooth scrolling for Anna Svensson mobile
            sx={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {containerContent}
          </Box>
        );
        
      case 'modal':
        return (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.500"
            zIndex="modal"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
          >
            <MotionBox
              bg={backgroundColor}
              borderRadius="lg"
              shadow="2xl"
              maxH="90vh"
              overflow="auto"
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 }
              }}
            >
              {containerContent}
            </MotionBox>
          </Box>
        );
        
      case 'sidebar':
        return (
          <HStack
            maxW={containerMaxWidth}
            mx="auto"
            spacing={spacing}
            align="stretch"
            p={containerPadding}
          >
            <Box flex="1">
              {containerContent}
            </Box>
          </HStack>
        );
        
      default:
        return containerContent;
    }
  };
  
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