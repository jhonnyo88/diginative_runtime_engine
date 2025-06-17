import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { useAnimations } from '../../hooks/useAnimations';

interface CelebrationEffectsProps {
  type: 'success' | 'achievement' | 'completion';
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

export const CelebrationEffects: React.FC<CelebrationEffectsProps> = ({
  onComplete,
  duration = 3000
}) => {
  useEffect(() => {
    // Complete immediately since we're not showing the celebration
    const timer = setTimeout(() => {
      onComplete?.();
    }, 0);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // TASK-HD-014: Disabled intrusive popups - replaced with municipal subtle feedback
  // Achievement System Redesign: No more popup overlays that interrupt municipal workflow
  return null;
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
  const { prefersReducedMotion } = useAnimations();
  
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

// TASK-HD-014: Progress celebration disabled - replaced with subtle municipal progress indicators
export const ProgressCelebration: React.FC<{
  progress: number;
  milestone?: number;
  show?: boolean;
}> = () => {
  // Achievement System Redesign: No more intrusive progress popups
  // Milestone recognition will be handled by subtle indicators in progress bars
  return null;
};