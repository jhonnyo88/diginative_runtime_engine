import { useEffect, useState } from 'react';

// Game Designer spec: Advanced animations with reduced motion support
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  respectReducedMotion?: boolean;
}

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check user's motion preferences
    setPrefersReducedMotion(mediaQuery.matches);


    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Scene transition animations
  };

  // Celebration micro-interactions
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
  };

  // Loading state animations
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
  const { prefersReducedMotion } = useAnimations();
  
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