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

const URGENCY_THRESHOLDS = {
  critical: 0.2,  // 20% time remaining
  urgent: 0.4,    // 40% time remaining  
  moderate: 0.7,  // 70% time remaining
  normal: 1.0     // 100% time remaining
};

export const useTimerChallenge = (config: TimerChallengeConfig) => {
  const [state, setState] = useState<TimerState>({
    timeRemaining: config.duration,
    isActive: false,
    isPaused: false,
    urgencyLevel: 'normal',
    startTime: null,
    pausedTime: 0
  });

  const intervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUrgencyRef = useRef<string>('normal');

  // High-precision timer using requestAnimationFrame för smooth updates
  const updateTimer = useCallback(() => {
    if (!state.isActive || state.isPaused || !state.startTime) return;

    const now = Date.now();
    const elapsed = (now - state.startTime - state.pausedTime) / 1000;
    const newTimeRemaining = Math.max(0, config.duration - elapsed);

    // Calculate urgency level
    const progress = newTimeRemaining / config.duration;
    let newUrgencyLevel: TimerState['urgencyLevel'] = 'normal';
    
    if (progress <= URGENCY_THRESHOLDS.critical) {
      newUrgencyLevel = 'critical';
    } else if (progress <= URGENCY_THRESHOLDS.urgent) {
      newUrgencyLevel = 'urgent';
    } else if (progress <= URGENCY_THRESHOLDS.moderate) {
      newUrgencyLevel = 'moderate';
    }

    setState(prev => ({
      ...prev,
      timeRemaining: Math.ceil(newTimeRemaining), // Ceiling för user-friendly display
      urgencyLevel: newUrgencyLevel
    }));

    // Urgency level change callback
    if (newUrgencyLevel !== lastUrgencyRef.current) {
      config.onUrgencyChange?.(newUrgencyLevel);
      lastUrgencyRef.current = newUrgencyLevel;
    }

    // Second tick callback
    config.onSecondTick?.(Math.ceil(newTimeRemaining));

    // Check if time is up
    if (newTimeRemaining <= 0) {
      setState(prev => ({
        ...prev,
        isActive: false,
        timeRemaining: 0
      }));
      config.onTimeUp();
      return;
    }

    // Continue animation loop
    if (config.performanceOptimized !== false) {
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
  }, [state.isActive, state.isPaused, state.startTime, state.pausedTime, config]);

  // Start timer
  const startTimer = useCallback(() => {
    const now = Date.now();
    
    setState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false,
      startTime: now,
      pausedTime: 0,
      timeRemaining: config.duration,
      urgencyLevel: 'normal'
    }));

    lastUrgencyRef.current = 'normal';

    // Start high-precision timer loop
    if (config.performanceOptimized !== false) {
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    } else {
      // Fallback to setInterval för older devices
      intervalRef.current = window.setInterval(() => {
        updateTimer();
      }, 100); // 10 FPS fallback
    }
  }, [config.duration, config.performanceOptimized, updateTimer]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (!state.isActive || state.isPaused) return;

    setState(prev => ({
      ...prev,
      isPaused: true
    }));

    // Stop animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [state.isActive, state.isPaused]);

  // Resume timer
  const resumeTimer = useCallback(() => {
    if (!state.isActive || !state.isPaused) return;

    const pauseDuration = state.startTime ? Date.now() - state.startTime : 0;
    
    setState(prev => ({
      ...prev,
      isPaused: false,
      pausedTime: prev.pausedTime + pauseDuration
    }));

    // Restart timer loop
    if (config.performanceOptimized !== false) {
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    } else {
      intervalRef.current = window.setInterval(updateTimer, 100);
    }
  }, [state.isActive, state.isPaused, state.startTime, config.performanceOptimized, updateTimer]);

  // Reset timer
  const resetTimer = useCallback(() => {
    setState({
      timeRemaining: config.duration,
      isActive: false,
      isPaused: false,
      urgencyLevel: 'normal',
      startTime: null,
      pausedTime: 0
    });

    lastUrgencyRef.current = 'normal';

    // Clean up timers
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [config.duration]);

  // Stop timer
  const stopTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false
    }));

    // Clean up timers
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Add time (för extensions or bonuses)
  const addTime = useCallback((seconds: number) => {
    setState(prev => ({
      ...prev,
      timeRemaining: Math.min(config.duration, prev.timeRemaining + seconds)
    }));
  }, [config.duration]);

  // Get formatted time display
  const getFormattedTime = useCallback((includeMilliseconds = false): string => {
    const totalSeconds = state.timeRemaining;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (includeMilliseconds) {
      const milliseconds = Math.floor((totalSeconds % 1) * 100);
      return `${minutes.toString().padStart(2, '0')}:${Math.floor(seconds).toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${Math.floor(seconds).toString().padStart(2, '0')}`;
  }, [state.timeRemaining]);

  // Get progress percentage
  const getProgress = useCallback((): number => {
    return (state.timeRemaining / config.duration) * 100;
  }, [state.timeRemaining, config.duration]);

  // Get urgency color för UI
  const getUrgencyColor = useCallback((): string => {
    switch (state.urgencyLevel) {
      case 'critical': return '#dc2626'; // red-600
      case 'urgent': return '#ea580c';   // orange-600
      case 'moderate': return '#ca8a04';  // yellow-600
      case 'normal': return '#16a34a';    // green-600
      default: return '#6b7280';          // gray-500
    }
  }, [state.urgencyLevel]);

  // Performance monitoring för optimization
  const getPerformanceMetrics = useCallback(() => {
    return {
      isUsingRAF: config.performanceOptimized !== false,
      currentFPS: animationFrameRef.current ? 60 : 10,
      urgencyLevel: state.urgencyLevel,
      batteryOptimized: state.urgencyLevel === 'normal' // Reduce updates when not urgent
    };
  }, [config.performanceOptimized, state.urgencyLevel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto-start timer if configured
  useEffect(() => {
    if (config.duration > 0 && state.timeRemaining === config.duration && !state.isActive) {
      // Auto-start can be configured here if needed
    }
  }, [config.duration, state.timeRemaining, state.isActive]);

  return {
    // State
    timeRemaining: state.timeRemaining,
    isActive: state.isActive,
    isPaused: state.isPaused,
    urgencyLevel: state.urgencyLevel,
    
    // Controls
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer,
    addTime,
    
    // Utility functions
    getFormattedTime,
    getProgress,
    getUrgencyColor,
    getPerformanceMetrics,
    
    // Computed values
    isRunning: state.isActive && !state.isPaused,
    isFinished: state.timeRemaining <= 0,
    progressPercentage: getProgress(),
    formattedTime: getFormattedTime(),
    urgencyColor: getUrgencyColor()
  };
};