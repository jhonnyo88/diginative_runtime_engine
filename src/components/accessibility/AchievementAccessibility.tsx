/**
 * TASK-HD-014: Achievement System Accessibility Enhancement
 * WCAG 2.1 AA compliance utilities for municipal achievement system
 */

import { useEffect, useRef } from 'react';

export interface AchievementAccessibilityProps {
  announceAchievement: boolean;
  achievementTitle: string;
  achievementDescription: string;
  municipalContext: string;
  reducedMotion: boolean;
  highContrast: boolean;
}

// Hook for screen reader announcements
export const useAchievementAnnouncer = () => {
  const announceAchievement = (
    title: string,
    description: string,
    municipalValue: string,
    culturalContext: string = 'swedish'
  ) => {
    const announcement = `${title}. ${description}. ${municipalValue}`;
    
    // Create screen reader announcement
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.setAttribute('aria-atomic', 'true');
    ariaLive.style.position = 'absolute';
    ariaLive.style.left = '-10000px';
    ariaLive.style.width = '1px';
    ariaLive.style.height = '1px';
    ariaLive.style.overflow = 'hidden';
    
    document.body.appendChild(ariaLive);
    ariaLive.textContent = announcement;
    
    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(ariaLive);
    }, 1000);
  };

  return { announceAchievement };
};

// Hook for focus management
export const useAchievementFocus = () => {
  const focusToast = (element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  };

  return { focusToast };
};

// Hook for high contrast detection
export const useHighContrastDetection = () => {
  const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  
  const accessibleColors = {
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    borderColor: '#FFFFFF'
  };

  return { isHighContrast, accessibleColors };
};

// Hook for reduced motion detection
export const useReducedMotionDetection = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return { prefersReducedMotion };
};

// Hook for keyboard navigation
export const useAchievementKeyboardNavigation = () => {
  const handleKeyDown = (event: KeyboardEvent, onDismiss?: () => void) => {
    if (event.key === 'Escape' && onDismiss) {
      onDismiss();
    }
    if (event.key === 'Enter' && onDismiss) {
      onDismiss();
    }
  };

  return { handleKeyDown };
};