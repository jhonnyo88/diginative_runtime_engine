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

  const _perfData = useRef<PerformanceData>({
    renderCount: 0,
    userInteractions: 0,
    slowRenders: 0
  });


  // Track component mount time
  useEffect(() => {
    if (!trackComponentMount) return;

    mountTime.current = startTime;

    return () => {
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
