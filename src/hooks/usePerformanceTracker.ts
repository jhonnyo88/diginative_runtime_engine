/**
 * DigiNativa Runtime Engine - Performance Tracking Hook
 * Municipal sector optimization for Anna Svensson's 7-minute sessions
 */

import { useEffect, useCallback, useRef } from 'react';
import { captureMetric, capturePerformanceIssue } from '../services/error-monitoring';

interface PerformanceTrackerOptions {
  trackComponentMount?: boolean;
  trackUserInteractions?: boolean;
  trackRenderTime?: boolean;
  slowThreshold?: number; // ms
  componentName?: string;
}

interface PerformanceData {
  componentMountTime?: number;
  renderCount: number;
  lastRenderTime?: number;
  userInteractions: number;
  slowRenders: number;
}

export function usePerformanceTracker(options: PerformanceTrackerOptions = {}) {
  const {
    trackComponentMount = true,
    trackUserInteractions = true,
    trackRenderTime = true,
    slowThreshold = 16, // 60fps = 16ms per frame
    componentName = 'Unknown'
  } = options;

  const perfData = useRef<PerformanceData>({
    renderCount: 0,
    userInteractions: 0,
    slowRenders: 0
  });

  const mountTime = useRef<number>();
  const renderStartTime = useRef<number>();

  // Track component mount time
  useEffect(() => {
    if (!trackComponentMount) return;

    const startTime = performance.now();
    mountTime.current = startTime;

    return () => {
      const mountDuration = performance.now() - startTime;
      perfData.current.componentMountTime = mountDuration;

      captureMetric({
        name: 'component.mount_time',
        value: mountDuration,
        unit: 'ms',
        tags: {
          component: componentName,
          municipality: getCurrentMunicipality(),
          deviceType: getCurrentDeviceType()
        }
      });

      // Track slow mounts (Anna Svensson mobile optimization)
      if (mountDuration > 100) {
        capturePerformanceIssue(
          `${componentName}_mount`,
          mountDuration,
          100
        );
      }
    };
  }, [trackComponentMount, componentName]);

  // Track render performance
  useEffect(() => {
    if (!trackRenderTime) return;

    renderStartTime.current = performance.now();
    perfData.current.renderCount++;

    // Measure render time after render is complete
    const timeoutId = setTimeout(() => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        perfData.current.lastRenderTime = renderTime;

        if (renderTime > slowThreshold) {
          perfData.current.slowRenders++;
          capturePerformanceIssue(
            `${componentName}_render`,
            renderTime,
            slowThreshold
          );
        }

        // Track render metrics periodically
        if (perfData.current.renderCount % 10 === 0) {
          captureMetric({
            name: 'component.render_time',
            value: renderTime,
            unit: 'ms',
            tags: {
              component: componentName,
              renderCount: perfData.current.renderCount.toString(),
              municipality: getCurrentMunicipality(),
              deviceType: getCurrentDeviceType()
            }
          });
        }
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  });

  // Track user interaction performance
  const trackInteraction = useCallback((interactionType: string, startTime?: number) => {
    if (!trackUserInteractions) return () => {};

    const start = startTime || performance.now();
    perfData.current.userInteractions++;

    return (metadata?: Record<string, any>) => {
      const interactionTime = performance.now() - start;

      captureMetric({
        name: 'user_interaction.response_time',
        value: interactionTime,
        unit: 'ms',
        tags: {
          component: componentName,
          interactionType,
          municipality: getCurrentMunicipality(),
          deviceType: getCurrentDeviceType()
        }
      });

      // Anna Svensson mobile interaction threshold: 100ms
      const threshold = getCurrentDeviceType() === 'mobile' ? 100 : 50;
      if (interactionTime > threshold) {
        capturePerformanceIssue(
          `${componentName}_${interactionType}`,
          interactionTime,
          threshold
        );
      }

      return interactionTime;
    };
  }, [trackUserInteractions, componentName]);

  // Track specific game interactions
  const trackGameInteraction = useCallback((gameId: string, sceneId: string, action: string) => {
    const endTracking = trackInteraction(`game_${action}`);
    
    return (result?: 'success' | 'error', metadata?: Record<string, any>) => {
      const duration = endTracking(metadata);
      
      captureMetric({
        name: 'game.interaction_time',
        value: duration,
        unit: 'ms',
        tags: {
          gameId,
          sceneId,
          action,
          result: result || 'success',
          municipality: getCurrentMunicipality(),
          deviceType: getCurrentDeviceType()
        }
      });

      return duration;
    };
  }, [trackInteraction]);

  // Anna Svensson 7-minute session tracking
  const trackSessionProgress = useCallback((progressPercent: number) => {
    captureMetric({
      name: 'session.progress',
      value: progressPercent,
      unit: 'percent',
      tags: {
        component: componentName,
        municipality: getCurrentMunicipality(),
        deviceType: getCurrentDeviceType(),
        sessionDuration: getSessionDuration().toString()
      }
    });

    // Alert if session is approaching 7-minute limit
    const sessionDuration = getSessionDuration();
    if (sessionDuration > 360000) { // 6 minutes
      captureMetric({
        name: 'session.approaching_limit',
        value: 1,
        unit: 'count',
        tags: {
          municipality: getCurrentMunicipality(),
          deviceType: getCurrentDeviceType()
        }
      });
    }
  }, [componentName]);

  // Memory usage tracking
  const trackMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      captureMetric({
        name: 'browser.memory_usage',
        value: memory.usedJSHeapSize,
        unit: 'bytes',
        tags: {
          component: componentName,
          municipality: getCurrentMunicipality(),
          deviceType: getCurrentDeviceType()
        }
      });

      // Alert on high memory usage (Anna Svensson mobile optimization)
      const memoryLimitMB = getCurrentDeviceType() === 'mobile' ? 50 : 100;
      const memoryUsageMB = memory.usedJSHeapSize / 1024 / 1024;
      
      if (memoryUsageMB > memoryLimitMB) {
        capturePerformanceIssue(
          `${componentName}_memory`,
          memoryUsageMB,
          memoryLimitMB
        );
      }
    }
  }, [componentName]);

  // Get current performance data
  const getPerformanceData = useCallback((): PerformanceData => {
    return { ...perfData.current };
  }, []);

  return {
    trackInteraction,
    trackGameInteraction,
    trackSessionProgress,
    trackMemoryUsage,
    getPerformanceData
  };
}

// Custom hook for Anna Svensson's mobile performance
export function useMobilePerformanceOptimization() {
  const isMobile = getCurrentDeviceType() === 'mobile';
  
  useEffect(() => {
    if (!isMobile) return;

    // Track mobile-specific metrics
    const trackMobileMetrics = () => {
      // Network connection
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        captureMetric({
          name: 'mobile.connection_type',
          value: 1,
          unit: 'count',
          tags: {
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink?.toString() || 'unknown',
            municipality: getCurrentMunicipality()
          }
        });
      }

      // Battery status (if available)
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          captureMetric({
            name: 'mobile.battery_level',
            value: battery.level * 100,
            unit: 'percent',
            tags: {
              charging: battery.charging.toString(),
              municipality: getCurrentMunicipality()
            }
          });
        });
      }

      // Viewport size for responsive tracking
      captureMetric({
        name: 'mobile.viewport_size',
        value: window.innerWidth,
        unit: 'count',
        tags: {
          width: window.innerWidth.toString(),
          height: window.innerHeight.toString(),
          orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
          municipality: getCurrentMunicipality()
        }
      });
    };

    trackMobileMetrics();
    
    // Track on orientation change
    window.addEventListener('orientationchange', trackMobileMetrics);
    
    return () => {
      window.removeEventListener('orientationchange', trackMobileMetrics);
    };
  }, [isMobile]);

  return {
    isMobile,
    optimizeForMobile: isMobile
  };
}

// Utility functions
function getCurrentMunicipality(): string {
  return sessionStorage.getItem('municipality') || 'stockholm';
}

function getCurrentDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getSessionDuration(): number {
  const sessionStart = sessionStorage.getItem('sessionStart');
  if (!sessionStart) {
    const now = Date.now().toString();
    sessionStorage.setItem('sessionStart', now);
    return 0;
  }
  return Date.now() - parseInt(sessionStart);
}