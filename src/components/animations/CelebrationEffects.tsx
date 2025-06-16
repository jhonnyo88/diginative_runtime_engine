import React, { useEffect, useState } from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { useAnimations } from '../../hooks/useAnimations';
import { CheckIcon, StarIcon } from '../icons/GameIcons';

interface CelebrationEffectsProps {
  type: 'success' | 'achievement' | 'completion';
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

export const CelebrationEffects: React.FC<CelebrationEffectsProps> = ({
  type,
  message,
  onComplete,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { getCelebrationAnimation, prefersReducedMotion } = useAnimations();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  const animation = getCelebrationAnimation(type);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon w="48px" h="48px" color="green.500" />;
      case 'achievement':
        return <StarIcon w="48px" h="48px" color="yellow.500" />;
      case 'completion':
        return <CheckIcon w="64px" h="64px" color="blue.500" />;
      default:
        return <CheckIcon w="48px" h="48px" color="green.500" />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'success':
        return 'Bra jobbat!';
      case 'achievement':
        return 'Utmärkelse uppnådd!';
      case 'completion':
        return 'Slutfört!';
      default:
        return 'Fantastiskt!';
    }
  };

  // Game Designer spec: Municipal-appropriate celebration
  return (
    <Box
      position="fixed"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      zIndex={9999}
      pointerEvents="none"
      sx={{
        '@keyframes celebrationBounce': {
          '0%': { 
            transform: 'translate(-50%, -50%) scale(0.8)',
            opacity: 0
          },
          '60%': { 
            transform: 'translate(-50%, -50%) scale(1.1)',
            opacity: 1
          },
          '100%': { 
            transform: 'translate(-50%, -50%) scale(1)',
            opacity: 1
          }
        },
        '@keyframes celebrationFade': {
          '0%': { opacity: 0 },
          '20%': { opacity: 1 },
          '80%': { opacity: 1 },
          '100%': { opacity: 0 }
        }
      }}
      animation={
        prefersReducedMotion 
          ? `celebrationFade ${duration/1000}s ease-out`
          : `celebrationBounce 0.6s ease-out, celebrationFade ${duration/1000}s ease-out`
      }
    >
      <VStack
        gap={4}
        bg="white"
        p={8}
        borderRadius="2xl"
        shadow="2xl"
        border="3px solid"
        borderColor={
          type === 'success' ? 'green.200' :
          type === 'achievement' ? 'yellow.200' :
          'blue.200'
        }
        textAlign="center"
        maxW="300px"
      >
        <Box
          sx={{
            '@keyframes iconPulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' }
            }
          }}
          animation={prefersReducedMotion ? 'none' : 'iconPulse 2s ease-in-out infinite'}
        >
          {getIcon()}
        </Box>
        
        <Text
          fontSize="xl"
          fontWeight="bold"
          color={
            type === 'success' ? 'green.700' :
            type === 'achievement' ? 'yellow.700' :
            'blue.700'
          }
        >
          {message || getDefaultMessage()}
        </Text>
      </VStack>
    </Box>
  );
};

// Micro-interaction for button feedback
export const ButtonFeedback: React.FC<{
  children: React.ReactNode;
  feedbackType?: 'subtle' | 'prominent';
  disabled?: boolean;
}> = ({ 
  children, 
  feedbackType = 'subtle',
  disabled = false 
}) => {
  const { getButtonAnimation, prefersReducedMotion } = useAnimations();
  
  if (disabled || prefersReducedMotion) {
    return <>{children}</>;
  }

  const intensity = feedbackType === 'prominent' ? 1.05 : 1.02;
  
  return (
    <Box
      sx={{
        transition: 'all 0.2s ease-out',
        cursor: 'pointer',
        '&:hover': {
          transform: `scale(${intensity}) translateY(-2px)`,
          filter: 'brightness(1.05)'
        },
        '&:active': {
          transform: 'scale(0.98) translateY(0)',
          transition: 'all 0.1s ease-out'
        }
      }}
    >
      {children}
    </Box>
  );
};

// Progress celebration for completion milestones
export const ProgressCelebration: React.FC<{
  progress: number;
  milestone?: number;
  show?: boolean;
}> = ({ 
  progress, 
  milestone = 25,
  show = false 
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  
  useEffect(() => {
    if (show && progress > 0 && progress % milestone === 0) {
      setShouldShow(true);
      const timer = setTimeout(() => setShouldShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [progress, milestone, show]);

  if (!shouldShow) return null;

  return (
    <CelebrationEffects
      type="achievement"
      message={`${progress}% slutfört! 🎉`}
      duration={2000}
      onComplete={() => setShouldShow(false)}
    />
  );
};