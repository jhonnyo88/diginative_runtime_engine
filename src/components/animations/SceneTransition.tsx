import React from 'react';
import { Box } from '@chakra-ui/react';
import { useAnimations } from '../../hooks/useAnimations';

interface SceneTransitionProps {
  children: React.ReactNode;
  sceneId: string;
  isLoading?: boolean;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  children,
  sceneId,
  isLoading = false
}) => {
  const { getSceneTransition, getLoadingAnimation, prefersReducedMotion } = useAnimations();

  const transitionAnimation = getSceneTransition();
  const loadingAnimation = getLoadingAnimation();

  // Game Designer spec: Professional scene transitions for municipal context
  return (
    <Box
      key={sceneId}
      w="100%"
      h="100%"
      position="relative"
      sx={{
        '@keyframes slideIn': {
          from: {
            opacity: 0,
            transform: prefersReducedMotion ? 'none' : 'translateY(20px)'
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)'
          }
        },
        '@keyframes slideOut': {
          from: {
            opacity: 1,
            transform: 'translateY(0)'
          },
          to: {
            opacity: 0,
            transform: prefersReducedMotion ? 'none' : 'translateY(-20px)'
          }
        },
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 }
        }
      }}
      animation={
        isLoading 
          ? `pulse ${prefersReducedMotion ? 2 : 1.5}s ease-in-out infinite`
          : `slideIn ${prefersReducedMotion ? 0.2 : 0.6}s ease-out`
      }
      // Ensure smooth transitions for Anna Svensson
      style={{
        animationFillMode: 'both',
        willChange: prefersReducedMotion ? 'opacity' : 'transform, opacity'
      }}
    >
      {children}
    </Box>
  );
};

// Loading skeleton component
export const LoadingSkeleton: React.FC<{ 
  height?: string;
  borderRadius?: string;
  count?: number;
}> = ({ 
  height = '20px', 
  borderRadius = 'md',
  count = 1 
}) => {
  const { getLoadingAnimation } = useAnimations();

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          h={height}
          bg="gray.200"
          borderRadius={borderRadius}
          mb={count > 1 ? 2 : 0}
          sx={{
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '-200px 0' },
              '100%': { backgroundPosition: 'calc(200px + 100%) 0' }
            }
          }}
          animation="shimmer 1.5s ease-in-out infinite"
          backgroundImage="linear-gradient(90deg, #f0f0f0 0px, #e0e0e0 40px, #f0f0f0 80px)"
          backgroundSize="200px 100%"
          backgroundRepeat="no-repeat"
        />
      ))}
    </>
  );
};