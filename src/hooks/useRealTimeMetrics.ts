import { useState, useEffect, useCallback } from 'react';
import { analyticsService, type TenantMetrics, type UserActivity } from '../services/analytics';

interface RealTimeMetricsOptions {
  tenantId: string;
  updateInterval?: number; // seconds
  enableWebSocket?: boolean;
}

interface MetricsState {
  metrics: TenantMetrics | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdated: Date | null;
}

/**
 * React hook for real-time metrics in admin dashboard
 * Supports WebSocket and HTTP fallback for 10,000+ concurrent users
 */
export const useRealTimeMetrics = (options: RealTimeMetricsOptions) => {
  const { tenantId, updateInterval = 30, enableWebSocket = true } = options;
  
  const [state, setState] = useState<MetricsState>({
    metrics: null,
    isLoading: true,
    error: null,
    isConnected: false,
    lastUpdated: null
  });

  const updateMetrics = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const metrics = await analyticsService.getTenantMetrics(tenantId);
      
      setState(prev => ({
        ...prev,
        metrics,
        isLoading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      }));
    }
  }, [tenantId]);

  const trackUserActivity = useCallback((activity: Partial<UserActivity>) => {
    const fullActivity: UserActivity = {
      userId: 'current-user', // In production, get from auth context
      tenantId,
      timestamp: new Date(),
      ...activity
    } as UserActivity;

    analyticsService.trackActivity(fullActivity);
  }, [tenantId]);

  // Initialize connection and metrics
  useEffect(() => {
    let unsubscribe: Function | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const initialize = async () => {
      if (enableWebSocket) {
        try {
          // Try WebSocket connection first
          await analyticsService.connect(tenantId);
          
          setState(prev => ({ ...prev, isConnected: true }));

          // Subscribe to real-time metric updates
          unsubscribe = analyticsService.subscribe('metrics_update', (newMetrics: TenantMetrics) => {
            setState(prev => ({
              ...prev,
              metrics: newMetrics,
              lastUpdated: new Date()
            }));
          });

          // Get initial metrics
          await updateMetrics();
          
          console.log('Real-time analytics connected via WebSocket');
          return;

        } catch (error) {
          console.warn('WebSocket connection failed, falling back to HTTP polling:', error);
        }
      }

      // Fallback to HTTP polling
      await updateMetrics();
      
      pollInterval = setInterval(updateMetrics, updateInterval * 1000);
      console.log(`Analytics polling started (${updateInterval}s interval)`);
    };

    initialize();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      analyticsService.disconnect();
    };
  }, [tenantId, updateInterval, enableWebSocket, updateMetrics]);

  // Export functionality
  const exportData = useCallback(async (timeframe: string, format: 'csv' | 'json' | 'xlsx') => {
    try {
      await analyticsService.exportTenantData(tenantId, timeframe, format);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Export failed'
      }));
      throw error;
    }
  }, [tenantId]);

  // Manual refresh
  const refresh = useCallback(() => {
    updateMetrics();
  }, [updateMetrics]);

  return {
    // Current state
    metrics: state.metrics,
    isLoading: state.isLoading,
    error: state.error,
    isConnected: state.isConnected,
    lastUpdated: state.lastUpdated,
    
    // Actions
    trackActivity: trackUserActivity,
    exportData,
    refresh,
    
    // Computed values
    isRealTime: state.isConnected && enableWebSocket,
    connectionStatus: state.isConnected ? 'connected' : 'polling' as const
  };
};

/**
 * Hook for system-wide metrics (super admin only)
 */
export const useSystemMetrics = () => {
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const metrics = await analyticsService.getSystemMetrics();
        setSystemMetrics(metrics);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch system metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystemMetrics();

    // Poll system metrics every 60 seconds
    const interval = setInterval(fetchSystemMetrics, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    systemMetrics,
    isLoading,
    error
  };
};

/**
 * Hook for activity stream monitoring
 */
export const useActivityStream = (tenantId: string, limit: number = 50) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let unsubscribe: Function | null = null;

    const connectToActivityStream = async () => {
      try {
        await analyticsService.connect(tenantId);
        setIsConnected(true);

        // Subscribe to new activity events
        unsubscribe = analyticsService.subscribe('user_activity', (activity: UserActivity) => {
          setActivities(prev => {
            const updated = [activity, ...prev];
            return updated.slice(0, limit); // Keep only latest N activities
          });
        });

      } catch (error) {
        console.warn('Failed to connect to activity stream:', error);
        setIsConnected(false);
      }
    };

    connectToActivityStream();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [tenantId, limit]);

  return {
    activities,
    isConnected,
    addActivity: (activity: UserActivity) => {
      setActivities(prev => [activity, ...prev].slice(0, limit));
    }
  };
};