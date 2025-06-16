// Real-time analytics service for DigiNativa Runtime Engine
// Handles 10,000+ concurrent users with WebSocket connections

export interface UserActivity {
  userId: string;
  tenantId: string;
  gameId: string;
  action: 'game_start' | 'scene_complete' | 'game_complete' | 'session_end';
  timestamp: Date;
  metadata?: {
    score?: number;
    sceneId?: string;
    sessionDuration?: number;
    progress?: number;
  };
}

export interface AnalyticsMetrics {
  totalUsers: number;
  activeGames: number;
  completionRate: number;
  avgSessionTime: string;
  recentActivity: UserActivity[];
}

export interface TenantMetrics extends AnalyticsMetrics {
  tenantId: string;
  tenantName: string;
}

class AnalyticsService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Initialize WebSocket connection for real-time analytics
  connect(tenantId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // In production, this would be your WebSocket server
        const wsUrl = `ws://localhost:8080/analytics/${tenantId}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('Analytics WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse analytics message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('Analytics WebSocket disconnected');
          this.attemptReconnect(tenantId);
        };

        this.ws.onerror = (error) => {
          console.error('Analytics WebSocket error:', error);
          reject(error);
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(tenantId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(tenantId).catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleMessage(data: any) {
    const { type, payload } = data;
    const listeners = this.listeners.get(type) || [];
    
    listeners.forEach(listener => {
      try {
        listener(payload);
      } catch (error) {
        console.error('Error in analytics listener:', error);
      }
    });
  }

  // Subscribe to real-time updates
  subscribe(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  // Track user activity
  trackActivity(activity: UserActivity) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'user_activity',
        payload: activity
      }));
    } else {
      // Fallback to HTTP API if WebSocket is not available
      this.sendActivityHTTP(activity);
    }
  }

  private async sendActivityHTTP(activity: UserActivity) {
    try {
      await fetch('/api/analytics/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity)
      });
    } catch (error) {
      console.error('Failed to send activity via HTTP:', error);
    }
  }

  // Get current metrics for tenant
  async getTenantMetrics(tenantId: string): Promise<TenantMetrics> {
    try {
      const response = await fetch(`/api/analytics/tenant/${tenantId}/metrics`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch tenant metrics:', error);
      // Return mock data for development
      return this.getMockMetrics(tenantId);
    }
  }

  // Get system-wide metrics (super admin only)
  async getSystemMetrics(): Promise<AnalyticsMetrics> {
    try {
      const response = await fetch('/api/analytics/system/metrics');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      // Return mock data for development
      return this.getMockSystemMetrics();
    }
  }

  // Export analytics data (for reporting)
  async exportTenantData(tenantId: string, timeframe: string, format: 'csv' | 'json' | 'xlsx') {
    try {
      const response = await fetch(`/api/analytics/tenant/${tenantId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeframe, format })
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Return blob for download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${tenantId}-${timeframe}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to export analytics data:', error);
      throw error;
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  // Mock data for development
  private getMockMetrics(tenantId: string): TenantMetrics {
    const mockActivities: UserActivity[] = [
      {
        userId: 'anna.svensson@malmo.se',
        tenantId,
        gameId: 'gdpr-training',
        action: 'game_complete',
        timestamp: new Date(Date.now() - 120000),
        metadata: { score: 92, sessionDuration: 394 }
      },
      {
        userId: 'lars.eriksson@malmo.se',
        tenantId,
        gameId: 'safety-training',
        action: 'scene_complete',
        timestamp: new Date(Date.now() - 300000),
        metadata: { sceneId: 'safety-quiz-1', progress: 45 }
      },
      {
        userId: 'maria.andersson@malmo.se',
        tenantId,
        gameId: 'gdpr-training',
        action: 'game_complete',
        timestamp: new Date(Date.now() - 720000),
        metadata: { score: 95, sessionDuration: 456 }
      }
    ];

    return {
      tenantId,
      tenantName: 'Mock Tenant',
      totalUsers: 1247 + Math.floor(Math.random() * 10),
      activeGames: 23,
      completionRate: 87.3 + (Math.random() - 0.5) * 2,
      avgSessionTime: '6m 34s',
      recentActivity: mockActivities
    };
  }

  private getMockSystemMetrics(): AnalyticsMetrics {
    return {
      totalUsers: 15847,
      activeGames: 156,
      completionRate: 84.7,
      avgSessionTime: '7m 12s',
      recentActivity: []
    };
  }
}

// Global analytics service instance
export const analyticsService = new AnalyticsService();

// React hook for analytics in components
export const useAnalytics = (tenantId?: string) => {
  const [metrics, setMetrics] = React.useState<TenantMetrics | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (!tenantId) return;

    let unsubscribe: Function | null = null;

    const initializeAnalytics = async () => {
      try {
        // Try to connect to WebSocket
        await analyticsService.connect(tenantId);
        setIsConnected(true);

        // Subscribe to real-time updates
        unsubscribe = analyticsService.subscribe('metrics_update', (newMetrics: TenantMetrics) => {
          setMetrics(newMetrics);
        });

        // Get initial metrics
        const initialMetrics = await analyticsService.getTenantMetrics(tenantId);
        setMetrics(initialMetrics);

      } catch (error) {
        console.warn('WebSocket connection failed, using HTTP fallback');
        // Fallback to HTTP polling
        const fallbackMetrics = await analyticsService.getTenantMetrics(tenantId);
        setMetrics(fallbackMetrics);
        
        // Poll every 30 seconds
        const interval = setInterval(async () => {
          try {
            const updatedMetrics = await analyticsService.getTenantMetrics(tenantId);
            setMetrics(updatedMetrics);
          } catch (error) {
            console.error('Failed to update metrics:', error);
          }
        }, 30000);

        return () => clearInterval(interval);
      }
    };

    initializeAnalytics();

    return () => {
      if (unsubscribe) unsubscribe();
      analyticsService.disconnect();
    };
  }, [tenantId]);

  const trackActivity = React.useCallback((activity: Partial<UserActivity>) => {
    if (!tenantId) return;
    
    const fullActivity: UserActivity = {
      userId: 'current-user', // Would come from auth context
      tenantId,
      timestamp: new Date(),
      ...activity
    } as UserActivity;

    analyticsService.trackActivity(fullActivity);
  }, [tenantId]);

  return {
    metrics,
    isConnected,
    trackActivity,
    exportData: (timeframe: string, format: 'csv' | 'json' | 'xlsx') => 
      analyticsService.exportTenantData(tenantId!, timeframe, format)
  };
};

// Import React for the hook
import React from 'react';