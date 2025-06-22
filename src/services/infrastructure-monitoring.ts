/**
 * Infrastructure Monitoring Service
 * Provides comprehensive monitoring for DigiNativa Runtime Engine
 * 
 * Supports Q1-Foundation-Autonomi-Milestone-1.1
 * Essential for autonomous operation reliability
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Infrastructure monitoring configuration
export interface MonitoringConfig {
  sentryDsn?: string;
  environment: 'development' | 'staging' | 'production';
  sampleRate?: number;
  tracesSampleRate?: number;
  enablePerformanceMonitoring?: boolean;
  enableErrorTracking?: boolean;
  enableHealthChecks?: boolean;
  healthCheckEndpoints?: HealthCheckEndpoint[];
}

// Health check endpoint configuration
export interface HealthCheckEndpoint {
  name: string;
  url: string;
  interval: number;
  method?: 'GET' | 'POST';
  expectedStatus?: number;
  timeout?: number;
  critical?: boolean;
}

// Performance metric types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: number;
  tags?: Record<string, string>;
}

// Infrastructure health status
export interface InfrastructureHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  services: Record<string, ServiceHealth>;
  metrics: PerformanceMetric[];
}

// Individual service health
export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  lastCheck: number;
  responseTime?: number;
  error?: string;
}

/**
 * Infrastructure Monitoring Service Class
 */
export class InfrastructureMonitoring {
  private static instance: InfrastructureMonitoring;
  private config: MonitoringConfig;
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private performanceMetrics: PerformanceMetric[] = [];
  private serviceHealthStatus: Record<string, ServiceHealth> = {};
  private initialized: boolean = false;

  private constructor() {
    this.config = {
      environment: 'development',
      sampleRate: 1.0,
      tracesSampleRate: 0.1,
      enablePerformanceMonitoring: true,
      enableErrorTracking: true,
      enableHealthChecks: true,
      healthCheckEndpoints: []
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): InfrastructureMonitoring {
    if (!InfrastructureMonitoring.instance) {
      InfrastructureMonitoring.instance = new InfrastructureMonitoring();
    }
    return InfrastructureMonitoring.instance;
  }

  /**
   * Initialize monitoring with configuration
   */
  public initialize(config: Partial<MonitoringConfig>): void {
    if (this.initialized) {
      console.warn('[InfrastructureMonitoring] Already initialized');
      return;
    }

    this.config = { ...this.config, ...config };
    
    if (this.config.sentryDsn && this.config.enableErrorTracking) {
      this.initializeSentry();
    }
    
    if (this.config.enablePerformanceMonitoring) {
      this.setupPerformanceObserver();
    }
    
    if (this.config.enableHealthChecks && this.config.healthCheckEndpoints?.length) {
      this.startHealthChecks();
    }
    
    this.initialized = true;
    console.info('[InfrastructureMonitoring] Initialized with config:', {
      environment: this.config.environment,
      performanceMonitoring: this.config.enablePerformanceMonitoring,
      healthChecks: this.config.enableHealthChecks,
      endpoints: this.config.healthCheckEndpoints?.length || 0
    });
  }

  /**
   * Initialize Sentry error tracking
   */
  private initializeSentry(): void {
    if (!this.config.enableErrorTracking || !this.config.sentryDsn) {
      console.log('[InfrastructureMonitoring] Sentry error tracking disabled');
      return;
    }

    try {
      Sentry.init({
        dsn: this.config.sentryDsn,
        environment: this.config.environment,
        integrations: [
          new BrowserTracing({
            // Set sampling rate for performance monitoring
            tracingOrigins: ['localhost', 'diginativa.se', /^\//],
            // Track user interactions
            routingInstrumentation: Sentry.reactRouterV6Instrumentation(
              React.useEffect,
              useLocation,
              useNavigationType,
              createRoutesFromChildren,
              matchRoutes
            ),
          }),
        ],
        // Performance Monitoring
        tracesSampleRate: this.config.enablePerformanceMonitoring 
          ? this.config.tracesSampleRate 
          : 0,
        // Error sampling
        sampleRate: this.config.sampleRate,
        // Municipal context
        beforeSend(event, hint) {
          // Add municipal context to errors
          if (event.contexts) {
            event.contexts.municipal = {
              theme: window.municipalTheme || 'sweden',
              brandingLevel: window.brandingLevel || 'standard',
              userType: 'municipal_employee'
            };
          }
          return event;
        },
        // Ignore certain errors
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          /^NetworkError/,
          /^TypeError: Failed to fetch/
        ],
      });

      console.log('[InfrastructureMonitoring] Sentry initialized successfully');
    } catch (error) {
      console.error('[InfrastructureMonitoring] Failed to initialize Sentry:', error);
    }
  }

  /**
   * Setup Performance Observer for Web Vitals
   */
  private setupPerformanceObserver(): void {
    if (!this.config.enablePerformanceMonitoring) {
      console.log('[InfrastructureMonitoring] Performance monitoring disabled');
      return;
    }

    try {
      // Observe Largest Contentful Paint (LCP)
        this.recordMetric({
          name: 'lcp',
          value: lastEntry.startTime,
          unit: 'ms',
          timestamp: Date.now(),
          tags: { vital: 'true' }
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observe First Input Delay (FID)
        entries.forEach((entry: Record<string, unknown>) => {
          this.recordMetric({
            name: 'fid',
            value: entry.processingStart - entry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
            tags: { vital: 'true' }
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Observe Cumulative Layout Shift (CLS)
        let clsScore = 0;
        entries.forEach((entry: Record<string, unknown>) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        this.recordMetric({
          name: 'cls',
          value: clsScore,
          unit: 'count',
          timestamp: Date.now(),
          tags: { vital: 'true' }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      console.log('[InfrastructureMonitoring] Performance observers initialized');
    } catch (error) {
      console.error('[InfrastructureMonitoring] Failed to setup performance observers:', error);
    }
  }

  /**
   * Start health checks for infrastructure endpoints
   */
  public startHealthChecks(endpoints?: HealthCheckEndpoint[]): void {
    
    if (!this.config.enableHealthChecks || checkEndpoints.length === 0) {
      console.log('[InfrastructureMonitoring] Health checks disabled or no endpoints configured');
      return;
    }

    checkEndpoints.forEach(endpoint => {
      // Initial check
      this.performHealthCheck(endpoint);

      // Schedule periodic checks
      }, endpoint.interval || 30000);

      this.healthCheckIntervals.set(endpoint.name, interval);
    });

    console.log(`[InfrastructureMonitoring] Started health checks for ${checkEndpoints.length} endpoints`);
  }

  /**
   * Perform single health check
   */
  private async performHealthCheck(endpoint: HealthCheckEndpoint): Promise<void> {
    
    try {

        method: endpoint.method || 'GET',
        signal: controller.signal,
        headers: {
          'X-Health-Check': 'true'
        }
      });

      clearTimeout(timeoutId);

      
      this.serviceHealthStatus[endpoint.name] = {
        name: endpoint.name,
        status: isHealthy ? 'up' : 'down',
        lastCheck: Date.now(),
        responseTime,
        error: isHealthy ? undefined : `Expected ${expectedStatus}, got ${response.status}`
      };

      // Record metric
      this.recordMetric({
        name: `health_check_${endpoint.name}`,
        value: isHealthy ? 1 : 0,
        unit: 'count',
        timestamp: Date.now(),
        tags: { 
          critical: (endpoint.critical || false).toString(),
          responseTime: responseTime.toString()
        }
      });

      // Report critical failures to Sentry
      if (!isHealthy && endpoint.critical) {
        Sentry.captureMessage(`Critical health check failed: ${endpoint.name}`, 'error');
      }

    } catch (error) {
      this.serviceHealthStatus[endpoint.name] = {
        name: endpoint.name,
        status: 'down',
        lastCheck: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      // Record failure metric
      this.recordMetric({
        name: `health_check_${endpoint.name}`,
        value: 0,
        unit: 'count',
        timestamp: Date.now(),
        tags: { 
          critical: (endpoint.critical || false).toString(),
          error: 'true'
        }
      });

      // Report to Sentry if critical
      if (endpoint.critical) {
        Sentry.captureException(error, {
          tags: { healthCheck: endpoint.name }
        });
      }
    }
  }

  /**
   * Record performance metric
   */
  public recordMetric(metric: PerformanceMetric): void {
    this.performanceMetrics.push(metric);

    // Keep only last 1000 metrics to prevent memory issues
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    // Send to Sentry as custom measurement
    if (this.config.enablePerformanceMonitoring) {
      if (transaction) {
        transaction.setMeasurement(metric.name, metric.value, metric.unit);
      }
    }
  }

  /**
   * Get current infrastructure health status
   */
  public getHealthStatus(): InfrastructureHealth {
    const _healthyServices = Object.values(this.serviceHealthStatus)
      .filter(s => s.status === 'up').length;
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (totalServices > 0) {
      if (healthPercentage < 50) {
        overallStatus = 'unhealthy';
      } else if (healthPercentage < 100) {
        overallStatus = 'degraded';
      }
    }

    return {
      status: overallStatus,
      timestamp: Date.now(),
      services: this.serviceHealthStatus,
      metrics: this.performanceMetrics.slice(-100) // Last 100 metrics
    };
  }

  /**
   * Get performance baseline metrics
   */
  public getPerformanceBaseline(): Record<string, number> {
    const baseline: Record<string, number> = {};
    
    // Group metrics by name and calculate averages
    const metricGroups: Record<string, number[]> = {};
    
    this.performanceMetrics.forEach(metric => {
      if (!metricGroups[metric.name]) {
        metricGroups[metric.name] = [];
      }
      metricGroups[metric.name].push(metric.value);
    });

    // Calculate averages for baselines
    Object.entries(metricGroups).forEach(([name, values]) => {
      baseline[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return baseline;
  }

  /**
   * Report custom error to monitoring
   */
  public reportError(error: Error, context?: Record<string, any>): void {
    if (this.config.enableErrorTracking) {
      Sentry.captureException(error, {
        contexts: {
          infrastructure: {
            ...context,
            monitoring: true
          }
        }
      });
    }
  }

  /**
   * Report custom message to monitoring
   */
  public reportMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (this.config.enableErrorTracking) {
      Sentry.captureMessage(message, level);
    }
  }

  /**
   * Cleanup monitoring resources
   */
  public cleanup(): void {
    // Clear health check intervals
    this.healthCheckIntervals.forEach(interval => clearInterval(interval));
    this.healthCheckIntervals.clear();
    
    // Clear metrics
    this.performanceMetrics = [];
    this.serviceHealthStatus = {};
    
    console.log('[InfrastructureMonitoring] Cleanup completed');
  }
}

// Export default configuration
export const defaultMonitoringConfig: MonitoringConfig = {
  environment: process.env.NODE_ENV as 'development' | 'staging' | 'production',
  sampleRate: 1.0,
  tracesSampleRate: 0.1,
  enablePerformanceMonitoring: true,
  enableErrorTracking: true,
  enableHealthChecks: true
};

// Export health check endpoints for DigiNativa
export const diginativaHealthEndpoints: HealthCheckEndpoint[] = [
  {
    name: 'api',
    url: '/api/health',
    method: 'GET',
    expectedStatus: 200,
    timeout: 5000,
    critical: true
  },
  {
    name: 'database',
    url: '/api/health/database',
    method: 'GET',
    expectedStatus: 200,
    timeout: 10000,
    critical: true
  },
  {
    name: 'cdn',
    url: 'https://cdn.diginativa.se/health',
    method: 'GET',
    expectedStatus: 200,
    timeout: 3000,
    critical: false
  },
  {
    name: 'devteam_api',
    url: '/api/v1/devteam/health',
    method: 'GET',
    expectedStatus: 200,
    timeout: 5000,
    critical: true
  }
];

// Declare global for municipal context
declare global {
  interface Window {
    municipalTheme?: string;
    brandingLevel?: string;
  }
}