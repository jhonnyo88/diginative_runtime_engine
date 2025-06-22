import { useEffect, useState } from 'react';

// Game Designer spec: Advanced animations with reduced motion support
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  respectReducedMotion?: boolean;
}

export const useAnimations = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check user's motion preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Scene transition animations
  const getSceneTransition = (config: AnimationConfig = {}) => {
    const {
      duration = prefersReducedMotion ? 200 : 600,
      delay = 0,
      easing = 'ease-out'
    } = config;

    return {
      initial: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: prefersReducedMotion ? 0 : -20 },
      transition: {
        duration: duration / 1000,
        delay: delay / 1000,
        ease: easing
      }
    };
  };

  // Celebration micro-interactions
  const getCelebrationAnimation = (type: 'success' | 'achievement' | 'completion') => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3 }
      };
    }

    switch (type) {
      case 'success':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { 
            scale: [0.8, 1.1, 1],
            opacity: 1
          },
          transition: {
            duration: 0.6,
            times: [0, 0.6, 1],
            ease: 'easeOut'
          }
        };
      case 'achievement':
        return {
          initial: { rotate: -10, scale: 0.8, opacity: 0 },
          animate: { 
            rotate: 0,
            scale: 1,
            opacity: 1
          },
          transition: {
            duration: 0.8,
            ease: 'backOut'
          }
        };
      case 'completion':
        return {
          initial: { y: -50, opacity: 0 },
          animate: { 
            y: 0,
            opacity: 1
          },
          transition: {
            duration: 1.0,
            ease: 'easeOut'
          }
        };
      default:
        return getSceneTransition();
    }
  };

  // Progress animations
  const getProgressAnimation = (progress: number, config: AnimationConfig = {}) => {
    const duration = prefersReducedMotion ? 300 : 1500;
    
    return {
      initial: { width: '0%' },
      animate: { width: `${progress}%` },
      transition: {
        duration: duration / 1000,
        ease: 'easeInOut',
        delay: config.delay ? config.delay / 1000 : 0
      }
    };
  };

  // Loading state animations
  const getLoadingAnimation = () => {
    if (prefersReducedMotion) {
      return {
        animate: { opacity: [1, 0.5, 1] },
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      };
    }

    return {
      animate: { 
        opacity: [1, 0.3, 1],
        scale: [1, 0.98, 1]
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    };
  };

  // Button interaction animations
  const getButtonAnimation = () => {
    if (prefersReducedMotion) {
      return {
        whileHover: { opacity: 0.9 },
        whileTap: { opacity: 0.8 }
      };
    }

    return {
      whileHover: { 
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2 }
      },
      whileTap: { 
        scale: 0.98,
        y: 0,
        transition: { duration: 0.1 }
      }
    };
  };

  // Focus indicator animations
  const getFocusAnimation = () => {
    return {
      initial: { outline: 'none' },
      focus: {
        outline: '3px solid',
        outlineColor: '#3182ce',
        outlineOffset: '2px',
        transition: { duration: 0.2 }
      }
    };
  };

  return {
    prefersReducedMotion,
    getSceneTransition,
    getCelebrationAnimation,
    getProgressAnimation,
    getLoadingAnimation,
    getButtonAnimation,
    getFocusAnimation
  };
};

// Utility hook for staggered animations
export const useStaggeredAnimation = (items: Record<string, unknown>[], delayBetween = 100) => {
  const { prefersReducedMotion } = useAnimations();
  
  const getStaggeredVariants = () => {
    if (prefersReducedMotion) {
      return {
        container: {
          animate: { transition: { staggerChildren: 0.05 } }
        },
        item: {
          initial: { opacity: 0 },
          animate: { opacity: 1 }
        }
      };
    }

    return {
      container: {
        animate: { 
          transition: { 
            staggerChildren: delayBetween / 1000,
            delayChildren: 0.1
          } 
        }
      },
      item: {
        initial: { opacity: 0, y: 20 },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.5, ease: 'easeOut' }
        }
      }
    };
  };

  return getStaggeredVariants();
};