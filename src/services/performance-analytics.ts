/**
 * DigiNativa Runtime Engine - Performance Analytics Service
 * Real-time performance monitoring for 10,000+ concurrent municipal users
 */

export interface SessionMetrics {
  sessionId: string;
  userId?: string;
  municipality: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  startTime: number;
  endTime?: number;
  duration?: number;
  gamesSessions: GameSessionMetric[];
  performanceMetrics: PerformanceSnapshot[];
  userInteractions: InteractionMetric[];
}

export interface GameSessionMetric {
  gameId: string;
  sceneId?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  completed: boolean;
  score?: number;
  interactions: number;
  errors: number;
  loadTime: number;
}

export interface PerformanceSnapshot {
  timestamp: number;
  metrics: {
    pageLoadTime?: number;
    renderTime?: number;
    memoryUsage?: number;
    networkLatency?: number;
    fps?: number;
    coreWebVitals?: CoreWebVitals;
  };
}

export interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

export interface InteractionMetric {
  timestamp: number;
  type: 'click' | 'touch' | 'keyboard' | 'scroll' | 'game-action';
  target: string;
  responseTime: number;
  successful: boolean;
  gameContext?: {
    gameId: string;
    sceneId: string;
    action: string;
  };
}

class PerformanceAnalyticsService {
  private currentSession: SessionMetrics;
  private performanceObserver?: PerformanceObserver;
  private metricsBuffer: PerformanceSnapshot[] = [];
  private isTracking = false;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    this.currentSession = this.initializeSession();
    this.startTracking();
  }

  private initializeSession(): SessionMetrics {

    const session: SessionMetrics = {
      sessionId,
      municipality,
      deviceType,
      startTime: Date.now(),
      gamesSessions: [],
      performanceMetrics: [],
      userInteractions: []
    };

    // Store session in sessionStorage for persistence
    sessionStorage.setItem('currentSession', JSON.stringify(session));
    
    return session;
  }

  private startTracking(): void {
    if (this.isTracking) return;
    
    this.isTracking = true;
    this.setupPerformanceObserver();
    this.setupCoreWebVitalsTracking();
    this.setupInteractionTracking();
    this.setupPeriodicMetricsCollection();
    
    console.info('Performance analytics tracking started');
  }

  private setupPerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    this.performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.processPerformanceEntry(entry);
      }
    });

    // Observe navigation, resource, measure, and paint entries
    try {
      this.performanceObserver.observe({ 
        entryTypes: ['navigation', 'resource', 'measure', 'paint'] 
      });
    } catch (error) {
      console.warn('Performance observer setup failed:', error);
    }
  }

  private setupCoreWebVitalsTracking(): void {
    // Largest Contentful Paint (LCP)
    this.trackLCP();
    
    // First Input Delay (FID)
    this.trackFID();
    
    // Cumulative Layout Shift (CLS)
    this.trackCLS();
    
    // First Contentful Paint (FCP)
    this.trackFCP();
  }

  private trackLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
        
        this.updateCoreWebVital('lcp', lastEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP tracking failed:', error);
    }
  }

  private trackFID(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
        for (const entry of list.getEntries()) {
          this.updateCoreWebVital('fid', (entry as any).processingStart - entry.startTime);
        }
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID tracking failed:', error);
    }
  }

  private trackCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;

    try {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.updateCoreWebVital('cls', clsValue);
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS tracking failed:', error);
    }
  }

  private trackFCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.updateCoreWebVital('fcp', entry.startTime);
          }
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('FCP tracking failed:', error);
    }
  }

  private setupInteractionTracking(): void {
    // Track clicks and touches
    ['click', 'touchend'].forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        this.trackInteraction({
          timestamp: Date.now(),
          type: eventType === 'click' ? 'click' : 'touch',
          target: this.getElementIdentifier(event.target as Element),
          responseTime: 0, // Will be updated by response tracking
          successful: true
        });
      }, { passive: true });
    });

    // Track keyboard interactions
    document.addEventListener('keydown', (event) => {
      this.trackInteraction({
        timestamp: Date.now(),
        type: 'keyboard',
        target: `key_${event.key}`,
        responseTime: 0,
        successful: true
      });
    }, { passive: true });

    // Track scroll performance
    let scrollTimer: number;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        this.trackInteraction({
          timestamp: Date.now(),
          type: 'scroll',
          target: 'document',
          responseTime: 0,
          successful: true
        });
      }, 100);
    }, { passive: true });
  }

  private setupPeriodicMetricsCollection(): void {
    setInterval(() => {
      this.collectCurrentMetrics();
      this.flushMetricsBuffer();
    }, this.flushInterval);

    // Collect initial metrics after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectCurrentMetrics();
      }, 1000);
    });
  }

  public startGameSession(gameId: string): void {
    const gameSession: GameSessionMetric = {
      gameId,
      startTime: Date.now(),
      completed: false,
      interactions: 0,
      errors: 0,
      loadTime: 0
    };

    this.currentSession.gamesSessions.push(gameSession);
    this.updateSessionStorage();
  }

  public endGameSession(gameId: string, completed: boolean, score?: number): void {
      .find(session => session.gameId === gameId && !session.endTime);
    
    if (gameSession) {
      gameSession.endTime = Date.now();
      gameSession.duration = gameSession.endTime - gameSession.startTime;
      gameSession.completed = completed;
      gameSession.score = score;
      
      this.updateSessionStorage();
      this.analyzeGamePerformance(gameSession);
    }
  }

  public trackGameInteraction(gameId: string, sceneId: string, action: string, responseTime: number): void {
    const interaction: InteractionMetric = {
      timestamp: Date.now(),
      type: 'game-action',
      target: `${gameId}_${sceneId}_${action}`,
      responseTime,
      successful: true,
      gameContext: { gameId, sceneId, action }
    };

    this.trackInteraction(interaction);

    // Update game session interaction count
      .find(session => session.gameId === gameId && !session.endTime);
    
    if (gameSession) {
      gameSession.interactions++;
      this.updateSessionStorage();
    }
  }

  public trackGameError(gameId: string, sceneId: string): void {
      .find(session => session.gameId === gameId && !session.endTime);
    
    if (gameSession) {
      gameSession.errors++;
      this.updateSessionStorage();
    }
  }

  private trackInteraction(interaction: InteractionMetric): void {
    this.currentSession.userInteractions.push(interaction);
    
    // Keep only last 100 interactions to prevent memory issues
    if (this.currentSession.userInteractions.length > 100) {
      this.currentSession.userInteractions = this.currentSession.userInteractions.slice(-100);
    }
    
    this.updateSessionStorage();
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    if (entry.entryType === 'navigation') {
      this.trackPageLoadMetrics(navEntry);
    } else if (entry.entryType === 'resource') {
      this.trackResourceLoadMetrics(resourceEntry);
    }
  }

  private trackPageLoadMetrics(entry: PerformanceNavigationTiming): void {

    this.addPerformanceSnapshot({
      timestamp: Date.now(),
      metrics: {
        pageLoadTime: metrics.pageLoadTime,
        networkLatency: metrics.networkLatency,
        coreWebVitals: {
          ttfb: metrics.ttfb
        }
      }
    });
  }

  private trackResourceLoadMetrics(entry: PerformanceResourceTiming): void {
    // Track slow resources (Anna Svensson mobile optimization)
    if (entry.duration > 1000) {
      console.warn(`Slow resource load: ${entry.name} took ${entry.duration}ms`);
    }
  }

  private collectCurrentMetrics(): void {
    const snapshot: PerformanceSnapshot = {
      timestamp: Date.now(),
      metrics: Record<string, unknown>
    };

    // Memory usage
    if ('memory' in performance) {
      snapshot.metrics.memoryUsage = memory.usedJSHeapSize;
    }

    // FPS estimation
    snapshot.metrics.fps = this.estimateFPS();

    this.addPerformanceSnapshot(snapshot);
  }

  private estimateFPS(): number {
    // Simple FPS estimation based on requestAnimationFrame
    let fps = 60; // Default assumption
    let lastTime = performance.now();
    let frameCount = 0;


    // Measure for 1 second
    requestAnimationFrame(measure);

    return fps;
  }

  private updateCoreWebVital(metric: keyof CoreWebVitals, value: number): void {
    if (latestSnapshot) {
      if (!latestSnapshot.metrics.coreWebVitals) {
        latestSnapshot.metrics.coreWebVitals = {};
      }
      latestSnapshot.metrics.coreWebVitals[metric] = value;
    } else {
      this.addPerformanceSnapshot({
        timestamp: Date.now(),
        metrics: {
          coreWebVitals: { [metric]: value }
        }
      });
    }
  }

  private addPerformanceSnapshot(snapshot: PerformanceSnapshot): void {
    this.metricsBuffer.push(snapshot);
    this.currentSession.performanceMetrics.push(snapshot);
    
    // Keep only last 50 snapshots in memory
    if (this.metricsBuffer.length > 50) {
      this.metricsBuffer = this.metricsBuffer.slice(-50);
    }
    
    if (this.currentSession.performanceMetrics.length > 100) {
      this.currentSession.performanceMetrics = this.currentSession.performanceMetrics.slice(-100);
    }
  }

  private flushMetricsBuffer(): void {
    if (this.metricsBuffer.length === 0) return;

    // Send metrics to backend/monitoring service
    this.sendMetricsToService(this.metricsBuffer);
    this.metricsBuffer = [];
  }

  private analyzeGamePerformance(gameSession: GameSessionMetric): void {
    // Analyze Anna Svensson's 7-minute session target
    if (gameSession.duration && gameSession.duration > sevenMinutes) {
      console.warn(`Game session exceeded 7-minute target: ${gameSession.duration}ms`);
    }

    // Analyze interaction efficiency
    if (gameSession.duration && gameSession.interactions > 0) {
      if (avgInteractionTime > 5000) { // 5 seconds per interaction
        console.warn(`Slow game interactions: ${avgInteractionTime}ms average`);
      }
    }
  }

  private async sendMetricsToService(metrics: PerformanceSnapshot[]): Promise<void> {
    try {
      // TODO: Send to actual monitoring backend
      console.info('[Performance Analytics]', {
        session: this.currentSession.sessionId,
        metricsCount: metrics.length,
        municipality: this.currentSession.municipality,
        deviceType: this.currentSession.deviceType
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  private updateSessionStorage(): void {
    sessionStorage.setItem('currentSession', JSON.stringify(this.currentSession));
  }

  // Utility methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getMunicipality(): string {
    return sessionStorage.getItem('municipality') || 'stockholm';
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getElementIdentifier(element: Element | null): string {
    if (!element) return 'unknown';
    
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  // Public API
  public getCurrentSession(): SessionMetrics {
    return { ...this.currentSession };
  }

  public getSessionSummary(): {
    duration: number;
    gamesPlayed: number;
    totalInteractions: number;
    averageResponseTime: number;
    completionRate: number;
  } {
    const _avgResponseTime = totalInteractions > 0
      ? this.currentSession.userInteractions.reduce((sum, i) => sum + i.responseTime, 0) / totalInteractions
      : 0;

    return {
      duration,
      gamesPlayed,
      totalInteractions,
      averageResponseTime: avgResponseTime,
      completionRate: gamesPlayed > 0 ? completedGames / gamesPlayed : 0
    };
  }
}

// Create singleton instance
