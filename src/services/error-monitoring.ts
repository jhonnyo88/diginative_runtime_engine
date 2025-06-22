/**
 * DigiNativa Runtime Engine - Error Monitoring Service
 * Enterprise-grade error tracking for Swedish municipal sector
 */

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  gameId?: string;
  sceneId?: string;
  municipality?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  userAgent?: string;
  timestamp: string;
  environment: string;
}

export interface ErrorDetails {
  name: string;
  message: string;
  stack?: string;
  code?: string | number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'runtime' | 'network' | 'validation' | 'performance' | 'accessibility' | 'game-content';
  context: ErrorContext;
  metadata?: Record<string, any>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  tags: Record<string, string>;
  timestamp: string;
}

class ErrorMonitoringService {
  private errorQueue: ErrorDetails[] = [];
  private metricsQueue: PerformanceMetric[] = [];
  private batchSize = 50;
  private flushInterval = 30000; // 30 seconds
  private isEnabled = true;
  private apiEndpoint = '/api/monitoring';

  constructor() {
    this.initializeMonitoring();
    this.setupGlobalErrorHandlers();
    this.startPerformanceTracking();
  }

  private initializeMonitoring(): void {
    // Check if monitoring is enabled
    this.isEnabled = this.getConfig('MONITORING_ENABLED', 'true') === 'true';
    
    if (!this.isEnabled) {
      console.warn('Error monitoring is disabled');
      return;
    }

    // Setup periodic flushing
    setInterval(() => {
      this.flushErrors();
      this.flushMetrics();
    }, this.flushInterval);

    console.info('Error monitoring service initialized');
  }

  private setupGlobalErrorHandlers(): void {
    // Unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        name: 'UnhandledError',
        message: event.message,
        stack: event.error?.stack,
        severity: 'high',
        category: 'runtime',
        context: this.getCurrentContext(),
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        name: 'UnhandledPromiseRejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        severity: 'high',
        category: 'runtime',
        context: this.getCurrentContext(),
        metadata: {
          reason: event.reason
        }
      });
    });

    // React Error Boundary integration
    if (typeof window !== 'undefined') {
      (window as any).__DIGINATIVA_ERROR_HANDLER__ = this.captureError.bind(this);
    }
  }

  private startPerformanceTracking(): void {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.trackPageLoadMetrics();
      }, 0);
    });

    // Track navigation performance
    if ('navigation' in performance && 'getEntriesByType' in performance) {
        for (const entry of list.getEntries()) {
          this.trackNavigationMetric(entry);
        }
      });
      
      observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
    }
  }

  public captureError(error: Omit<ErrorDetails, 'context'> & { context?: Partial<ErrorContext> }): void {
    if (!this.isEnabled) return;

    const errorDetails: ErrorDetails = {
      ...error,
      context: {
        ...this.getCurrentContext(),
        ...error.context
      }
    };

    // Log critical errors immediately
    if (error.severity === 'critical') {
      console.error('Critical error captured:', errorDetails);
    }

    this.errorQueue.push(errorDetails);

    // Flush immediately for critical errors
    if (error.severity === 'critical' || this.errorQueue.length >= this.batchSize) {
      this.flushErrors();
    }
  }

  public captureMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    if (!this.isEnabled) return;

    const metricWithTimestamp: PerformanceMetric = {
      ...metric,
      timestamp: new Date().toISOString()
    };

    this.metricsQueue.push(metricWithTimestamp);

    if (this.metricsQueue.length >= this.batchSize) {
      this.flushMetrics();
    }
  }

  public captureGameError(gameId: string, sceneId: string, error: Error, severity: ErrorDetails['severity'] = 'medium'): void {
    this.captureError({
      name: error.name,
      message: error.message,
      stack: error.stack,
      severity,
      category: 'game-content',
      context: {
        gameId,
        sceneId
      },
      metadata: {
        errorType: 'game-execution'
      }
    });
  }

  public captureAccessibilityError(element: string, violation: string, severity: ErrorDetails['severity'] = 'medium'): void {
    this.captureError({
      name: 'AccessibilityViolation',
      message: `Accessibility violation: ${violation}`,
      severity,
      category: 'accessibility',
      metadata: {
        element,
        violation,
        wcagLevel: 'AA'
      }
    });
  }

  public capturePerformanceIssue(operation: string, duration: number, threshold: number): void {
    if (duration > threshold) {
      this.captureError({
        name: 'PerformanceIssue',
        message: `Operation '${operation}' took ${duration}ms (threshold: ${threshold}ms)`,
        severity: duration > threshold * 2 ? 'high' : 'medium',
        category: 'performance',
        metadata: {
          operation,
          duration,
          threshold,
          ratio: duration / threshold
        }
      });
    }

    this.captureMetric({
      name: `performance.${operation}`,
      value: duration,
      unit: 'ms',
      tags: {
        operation,
        municipality: this.getCurrentMunicipality(),
        deviceType: this.getCurrentDeviceType()
      }
    });
  }

  private getCurrentContext(): ErrorContext {
    
    return {
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      gameId: gameState?.gameId,
      sceneId: gameState?.sceneId,
      municipality: this.getCurrentMunicipality(),
      deviceType: this.getCurrentDeviceType(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      environment: this.getConfig('NODE_ENV', 'development')
    };
  }

  private trackPageLoadMetrics(): void {
    if (!('performance' in window) || !performance.timing) return;


    // Core Web Vitals for Anna Svensson's mobile experience
    this.captureMetric({
      name: 'web_vitals.page_load_time',
      value: timing.loadEventEnd - timing.navigationStart,
      unit: 'ms',
      tags: {
        municipality: this.getCurrentMunicipality(),
        deviceType: this.getCurrentDeviceType()
      }
    });

    this.captureMetric({
      name: 'web_vitals.dom_content_loaded',
      value: timing.domContentLoadedEventEnd - timing.navigationStart,
      unit: 'ms',
      tags: {
        municipality: this.getCurrentMunicipality(),
        deviceType: this.getCurrentDeviceType()
      }
    });

    // First Contentful Paint (if available)
    if (navigation?.domContentLoadedEventEnd) {
      this.captureMetric({
        name: 'web_vitals.first_contentful_paint',
        value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        unit: 'ms',
        tags: {
          municipality: this.getCurrentMunicipality(),
          deviceType: this.getCurrentDeviceType()
        }
      });
    }
  }

  private trackNavigationMetric(entry: PerformanceEntry): void {
    if (entry.entryType === 'resource') {
      
      // Track slow resources
      if (resourceEntry.duration > 1000) {
        this.captureError({
          name: 'SlowResource',
          message: `Resource '${resourceEntry.name}' took ${resourceEntry.duration}ms to load`,
          severity: 'medium',
          category: 'performance',
          metadata: {
            resourceName: resourceEntry.name,
            duration: resourceEntry.duration,
            size: resourceEntry.transferSize
          }
        });
      }
    }
  }

  private async flushErrors(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    this.errorQueue = [];

    try {
      await this.sendToEndpoint(`${this.apiEndpoint}/errors`, { errors });
    } catch (error) {
      console.error('Failed to send errors to monitoring service:', error);
      // Re-queue errors for retry (with limit to prevent memory issues)
      this.errorQueue = [...errors.slice(-10), ...this.errorQueue];
    }
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricsQueue.length === 0) return;

    this.metricsQueue = [];

    try {
      await this.sendToEndpoint(`${this.apiEndpoint}/metrics`, { metrics });
    } catch (error) {
      console.error('Failed to send metrics to monitoring service:', error);
      // Re-queue metrics for retry (with limit)
      this.metricsQueue = [...metrics.slice(-10), ...this.metricsQueue];
    }
  }

  private async sendToEndpoint(endpoint: string, data: Record<string, unknown>): Promise<void> {
    // In production, this would send to your monitoring backend
    // For now, we'll use console.info for development visibility
    console.info(`[Monitoring] ${endpoint}:`, data);
    
    // TODO: Implement actual API call when backend is ready
    // await fetch(endpoint, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
  }

  // Utility methods
  private getCurrentUserId(): string | undefined {
    // TODO: Integrate with authentication system
    return sessionStorage.getItem('userId') || undefined;
  }

  private getCurrentSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private getCurrentMunicipality(): string {
    // TODO: Get from user profile or URL
    return this.getConfig('DEFAULT_MUNICIPALITY', 'stockholm');
  }

  private getCurrentDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getGameState(): { gameId?: string; sceneId?: string } | null {
    // TODO: Integrate with game state management
    return gameState ? JSON.parse(gameState) : null;
  }

  private getConfig(key: string, defaultValue: string): string {
    // TODO: Integrate with environment configuration
    return (window as any).__DIGINATIVA_CONFIG__?.[key] || defaultValue;
  }
}

// Create singleton instance

// Export convenience functions
