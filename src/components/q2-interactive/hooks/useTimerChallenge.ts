/**
 * useTimerChallenge Hook - High-Precision Timer for Emergency Training
 * Task: proposal-030 - Q2 Interactive Mechanics Implementation
 * 
 * Precision timing with visual urgency feedback and performance optimization
 * Optimized för Anna Svensson iPhone 12 with battery efficiency
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerChallengeConfig {
  duration: number; // seconds
  onTimeUp: () => void;
  onUrgencyChange?: (urgencyLevel: string) => void;
  onSecondTick?: (timeRemaining: number) => void;
  performanceOptimized?: boolean;
}

interface TimerState {
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
  urgencyLevel: 'normal' | 'moderate' | 'urgent' | 'critical';
  startTime: number | null;
  pausedTime: number;
}


  const [state, setState] = useState<TimerState>({
    timeRemaining: config.duration,
    isActive: false,
    isPaused: false,
    urgencyLevel: 'normal',
    startTime: null,
    pausedTime: 0
  });


  // High-precision timer using requestAnimationFrame för smooth updates
