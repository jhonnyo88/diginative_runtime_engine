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
  const { tenantId, updateInterval = 30, enableWebSocket = true } = options;
  
  const [state, setState] = useState<MetricsState>({
    metrics: null,
    isLoading: true,
    error: null,
    isConnected: false,
    lastUpdated: null
  });

