/**
 * Q3 Performance Monitor
 * Real-time performance monitoring for Q3 Multi-World Game Engine
 * Ensures <800ms hub loading and <1.5s world transitions
 */

import { WorldHubState } from '../types/q3-multi-world';

export interface PerformanceThresholds {
  hubLoading: number; // 800ms target
  worldTransition: number; // 1500ms target
  memoryUsage: number; // 256MB target
  annasvenssonTotal: number; // 2000ms preserved
}

export interface PerformanceMetrics {
  hubLoadTime: number;
  worldTransitionTime: number;
  memoryUsage: number;
  renderTime: number;
  interactionDelay: number;
  bundleSize: number;
  cacheHitRate: number;
  timestamp: number;
}

export interface PerformanceAlert {
  type: 'warning' | 'critical';
  metric: keyof PerformanceMetrics;
  threshold: number;
  actualValue: number;
  timestamp: number;
  message: string;
}

export class Q3PerformanceMonitor {
  private readonly thresholds: PerformanceThresholds = {
    hubLoading: 800, // ms
    worldTransition: 1500, // ms
    memoryUsage: 256 * 1024 * 1024, // 256MB in bytes
    annasvenssonTotal: 2000 // ms
  };

  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private observers: PerformanceObserver[] = [];
  private monitoringActive = false;

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.monitoringActive) {
      console.warn('Performance monitoring already active');
      return;
    }

    console.log('🔧 Starting Q3 Performance Monitoring');
    
    this.monitoringActive = true;
    
    // Setup navigation timing observer
    this.setupNavigationObserver();
    
    // Setup resource timing observer
    this.setupResourceObserver();
    
    // Setup memory monitoring
    this.setupMemoryMonitoring();
    
    // Setup Web Vitals monitoring
    this.setupWebVitalsMonitoring();
    
    // Setup custom measurement observer
    this.setupCustomMeasurementObserver();
    
    console.log('✅ Q3 Performance Monitoring active');
    console.log(`📊 Targets: Hub <${this.thresholds.hubLoading}ms, Transitions <${this.thresholds.worldTransition}ms`);
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (!this.monitoringActive) return;

    console.log('🛑 Stopping Q3 Performance Monitoring');
    
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.monitoringActive = false;
  }

  /**
   * Measure hub loading performance
   */
  measureHubLoading(startTime: number): void {
    
    // Mark measurement for Performance API
    performance.mark('hub-load-end');
    
    if (performance.getEntriesByName('hub-load-start').length > 0) {
      performance.measure('hub-loading', 'hub-load-start', 'hub-load-end');
    }

    this.recordMetric('hubLoadTime', hubLoadTime);
    
    if (hubLoadTime > this.thresholds.hubLoading) {
      this.createAlert('warning', 'hubLoadTime', this.thresholds.hubLoading, hubLoadTime,
        `Hub loading time ${hubLoadTime}ms exceeds target ${this.thresholds.hubLoading}ms`);
    }
  }

  /**
   * Measure world transition performance
   */
  measureWorldTransition(startTime: number, worldIndex: number): void {
    
    performance.mark(`world-${worldIndex}-transition-end`);
    performance.measure(`world-${worldIndex}-transition`, 
      `world-${worldIndex}-transition-start`, 
      `world-${worldIndex}-transition-end`);

    this.recordMetric('worldTransitionTime', transitionTime);
    
    if (transitionTime > this.thresholds.worldTransition) {
      this.createAlert('warning', 'worldTransitionTime', this.thresholds.worldTransition, transitionTime,
        `World ${worldIndex} transition time ${transitionTime}ms exceeds target ${this.thresholds.worldTransition}ms`);
    }
  }

  /**
   * Start measuring hub loading
   */
  startHubLoadMeasurement(): void {
    performance.mark('hub-load-start');
  }

  /**
   * Start measuring world transition
   */
  startWorldTransitionMeasurement(worldIndex: number): void {
    performance.mark(`world-${worldIndex}-transition-start`);
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get performance history
   */
  getMetricsHistory(limit: number = 50): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    
    return this.alerts.filter(alert => now - alert.timestamp < alertTimeout);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageHubLoadTime: number;
    averageWorldTransitionTime: number;
    averageMemoryUsage: number;
    alertCount: number;
    complianceScore: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageHubLoadTime: 0,
        averageWorldTransitionTime: 0,
        averageMemoryUsage: 0,
        alertCount: 0,
        complianceScore: 100
      };
    }

    
    
    
    // Calculate compliance score based on threshold adherence
    

    return {
      averageHubLoadTime: Math.round(averageHubLoadTime),
      averageWorldTransitionTime: Math.round(averageWorldTransitionTime),
      averageMemoryUsage: Math.round(averageMemoryUsage),
      alertCount: activeAlerts.length,
      complianceScore
    };
  }

  /**
   * Setup navigation timing observer
   */
  private setupNavigationObserver(): void {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          
          this.recordMetric('hubLoadTime', loadTime);
          
          if (loadTime > this.thresholds.hubLoading) {
            this.createAlert('warning', 'hubLoadTime', this.thresholds.hubLoading, loadTime,
              `Navigation load time ${loadTime}ms exceeds hub loading target`);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.push(observer);
  }

  /**
   * Setup resource timing observer
   */
  private setupResourceObserver(): void {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          
          // Monitor large resources that could impact loading
          if (resourceEntry.transferSize > 1024 * 1024) { // 1MB
            console.warn(`Large resource detected: ${resourceEntry.name} (${Math.round(resourceEntry.transferSize / 1024)}KB)`);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    setInterval(() => {
      if ((performance as any).memory) {
        
        this.recordMetric('memoryUsage', usedMemory);
        
        if (usedMemory > this.thresholds.memoryUsage) {
          this.createAlert('critical', 'memoryUsage', this.thresholds.memoryUsage, usedMemory,
            `Memory usage ${Math.round(usedMemory / 1024 / 1024)}MB exceeds target ${Math.round(this.thresholds.memoryUsage / 1024 / 1024)}MB`);
        }
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Setup Web Vitals monitoring
   */
  private setupWebVitalsMonitoring(): void {
    // Largest Contentful Paint
      for (const entry of list.getEntries()) {
        if (lcp > 2500) { // 2.5s threshold
          this.createAlert('warning', 'renderTime', 2500, lcp,
            `Largest Contentful Paint ${Math.round(lcp)}ms exceeds 2.5s threshold`);
        }
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(lcpObserver);

    // First Input Delay
      for (const entry of list.getEntries()) {
        this.recordMetric('interactionDelay', fid);
        
        if (fid > 100) { // 100ms threshold
          this.createAlert('warning', 'interactionDelay', 100, fid,
            `First Input Delay ${Math.round(fid)}ms exceeds 100ms threshold`);
        }
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.push(fidObserver);
  }

  /**
   * Setup custom measurement observer
   */
  private setupCustomMeasurementObserver(): void {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          // Handle custom measurements
          if (entry.name.includes('hub-loading')) {
            this.recordMetric('hubLoadTime', entry.duration);
          } else if (entry.name.includes('world') && entry.name.includes('transition')) {
            this.recordMetric('worldTransitionTime', entry.duration);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });
    this.observers.push(observer);
  }

  /**
   * Record performance metric
   */
  private recordMetric(metricName: keyof PerformanceMetrics, value: number): void {
    
    // Get or create current metrics object
      ? this.metrics[this.metrics.length - 1]
      : {
          hubLoadTime: 0,
          worldTransitionTime: 0,
          memoryUsage: 0,
          renderTime: 0,
          interactionDelay: 0,
          bundleSize: 0,
          cacheHitRate: 0,
          timestamp: now
        };

    currentMetrics[metricName] = value;
    currentMetrics.timestamp = now;

    // Add or update metrics
    if (this.metrics.length > 0 && (now - this.metrics[this.metrics.length - 1].timestamp < 1000)) {
      this.metrics[this.metrics.length - 1] = currentMetrics;
    } else {
      this.metrics.push(currentMetrics);
    }

    // Keep only last 100 measurements
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(
    type: 'warning' | 'critical',
    metric: keyof PerformanceMetrics,
    threshold: number,
    actualValue: number,
    message: string
  ): void {
    const alert: PerformanceAlert = {
      type,
      metric,
      threshold,
      actualValue,
      timestamp: Date.now(),
      message
    };

    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    // Log alert
    if (type === 'critical') {
      console.error(`🚨 CRITICAL Performance Alert: ${message}`);
    } else {
      console.warn(`⚠️ Performance Warning: ${message}`);
    }
  }
}

// Export singleton instance
