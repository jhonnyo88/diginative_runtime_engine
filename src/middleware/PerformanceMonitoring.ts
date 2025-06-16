// Expert specification: Performance monitoring middleware för cultural contexts
// Real-time performance tracking för Anna Svensson, Klaus Mueller, Marie Dubois, Pieter van Berg

import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

// Expert interfaces: Performance tracking types
interface CulturalPerformanceMetrics {
  culturalContext: CulturalContext;
  responseTime: number;
  timestamp: number;
  endpoint: string;
  userId?: string;
  municipalTenant?: string;
  personaOptimization: PersonaOptimization;
}

interface PersonaOptimization {
  persona: 'anna_svensson' | 'klaus_mueller' | 'marie_dubois' | 'pieter_van_berg';
  targetResponseTime: number;
  actualResponseTime: number;
  performanceRating: 'excellent' | 'good' | 'acceptable' | 'poor';
  optimizationSuggestions: string[];
}

type CulturalContext = 'swedish_mobile' | 'german_systematic' | 'french_collaborative' | 'dutch_progressive';

// Expert class: Cultural performance monitoring
export class CulturalPerformanceMonitor {
  private metricsBuffer: CulturalPerformanceMetrics[] = [];
  private readonly bufferSize = 1000;
  private readonly flushInterval = 30000; // 30 seconds

  constructor() {
    // Expert initialization: Start metrics flushing
    this.startMetricsFlushing();
  }

  // Expert middleware: Performance tracking middleware
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = performance.now();
      const culturalContext = this.extractCulturalContext(req);
      const persona = this.mapCulturalContextToPersona(culturalContext);

      // Expert tracking: Override response.end to capture completion time
      const originalEnd = res.end;
      res.end = function(this: Response, ...args: any[]) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        // Expert analysis: Record performance metrics
        const metrics: CulturalPerformanceMetrics = {
          culturalContext,
          responseTime,
          timestamp: Date.now(),
          endpoint: req.path,
          userId: req.headers['x-user-id'] as string,
          municipalTenant: req.headers['x-municipal-tenant'] as string,
          personaOptimization: {
            persona,
            targetResponseTime: this.getTargetResponseTime(persona),
            actualResponseTime: responseTime,
            performanceRating: this.calculatePerformanceRating(persona, responseTime),
            optimizationSuggestions: this.generateOptimizationSuggestions(persona, responseTime)
          }
        };

        // Expert requirement: Add metrics to buffer
        this.addMetrics(metrics);

        // Expert monitoring: Set performance headers
        res.setHeader('X-Cultural-Performance', responseTime.toFixed(2));
        res.setHeader('X-Persona-Optimization', persona);
        res.setHeader('X-Performance-Rating', metrics.personaOptimization.performanceRating);

        return originalEnd.apply(this, args);
      }.bind(res);

      next();
    };
  }

  // Expert function: Extract cultural context from request
  private extractCulturalContext(req: Request): CulturalContext {
    // Expert priority: Check explicit cultural context header
    const explicitContext = req.headers['x-cultural-context'] as CulturalContext;
    if (explicitContext && this.isValidCulturalContext(explicitContext)) {
      return explicitContext;
    }

    // Expert fallback: Determine från Accept-Language and User-Agent
    const acceptLanguage = req.headers['accept-language'] || '';
    const userAgent = req.headers['user-agent'] || '';

    // Expert mapping: Language to cultural context
    if (acceptLanguage.includes('de')) {
      return 'german_systematic';
    } else if (acceptLanguage.includes('fr')) {
      return 'french_collaborative';
    } else if (acceptLanguage.includes('nl')) {
      return 'dutch_progressive';
    } else if (userAgent.includes('iPhone') || userAgent.includes('Mobile')) {
      return 'swedish_mobile';
    }

    // Expert default: Swedish mobile för unknown contexts
    return 'swedish_mobile';
  }

  // Expert function: Map cultural context to persona
  private mapCulturalContextToPersona(context: CulturalContext): PersonaOptimization['persona'] {
    const mapping: Record<CulturalContext, PersonaOptimization['persona']> = {
      'swedish_mobile': 'anna_svensson',
      'german_systematic': 'klaus_mueller',
      'french_collaborative': 'marie_dubois',
      'dutch_progressive': 'pieter_van_berg'
    };

    return mapping[context];
  }

  // Expert function: Get target response time för persona
  private getTargetResponseTime(persona: PersonaOptimization['persona']): number {
    const targets = {
      'anna_svensson': 100,    // Swedish mobile: <100ms
      'klaus_mueller': 50,     // German systematic: <50ms
      'marie_dubois': 75,      // French collaborative: <75ms
      'pieter_van_berg': 25    // Dutch progressive: <25ms
    };

    return targets[persona];
  }

  // Expert function: Calculate performance rating
  private calculatePerformanceRating(
    persona: PersonaOptimization['persona'], 
    actualTime: number
  ): PersonaOptimization['performanceRating'] {
    const target = this.getTargetResponseTime(persona);

    if (actualTime <= target) {
      return 'excellent';
    } else if (actualTime <= target * 1.5) {
      return 'good';
    } else if (actualTime <= target * 2) {
      return 'acceptable';
    } else {
      return 'poor';
    }
  }

  // Expert function: Generate optimization suggestions
  private generateOptimizationSuggestions(
    persona: PersonaOptimization['persona'], 
    actualTime: number
  ): string[] {
    const target = this.getTargetResponseTime(persona);
    const suggestions: string[] = [];

    if (actualTime > target) {
      // Expert suggestions: Persona-specific optimizations
      switch (persona) {
        case 'anna_svensson':
          suggestions.push('Optimize för mobile network conditions');
          suggestions.push('Enable progressive loading för iPhone 12');
          suggestions.push('Reduce bundle size för mobile performance');
          break;

        case 'klaus_mueller':
          suggestions.push('Implement systematic caching strategy');
          suggestions.push('Optimize database queries för detailed analysis');
          suggestions.push('Enable compression för systematic data transfer');
          break;

        case 'marie_dubois':
          suggestions.push('Optimize collaborative features loading');
          suggestions.push('Implement aesthetic asset lazy loading');
          suggestions.push('Cache collaborative context data');
          break;

        case 'pieter_van_berg':
          suggestions.push('Minimize DOM manipulation för efficiency');
          suggestions.push('Implement aggressive caching strategy');
          suggestions.push('Optimize API endpoints för direct actions');
          break;
      }

      // Expert suggestions: General performance improvements
      if (actualTime > target * 2) {
        suggestions.push('Consider CDN optimization');
        suggestions.push('Review database sharding strategy');
        suggestions.push('Implement response compression');
      }
    }

    return suggestions;
  }

  // Expert function: Validate cultural context
  private isValidCulturalContext(context: string): context is CulturalContext {
    return ['swedish_mobile', 'german_systematic', 'french_collaborative', 'dutch_progressive'].includes(context);
  }

  // Expert function: Add metrics to buffer
  private addMetrics(metrics: CulturalPerformanceMetrics): void {
    this.metricsBuffer.push(metrics);

    // Expert optimization: Prevent memory overflow
    if (this.metricsBuffer.length > this.bufferSize) {
      this.metricsBuffer = this.metricsBuffer.slice(-this.bufferSize);
    }

    // Expert analysis: Log poor performance immediately
    if (metrics.personaOptimization.performanceRating === 'poor') {
      console.warn(`🚨 Poor performance detected för ${metrics.personaOptimization.persona}:`, {
        endpoint: metrics.endpoint,
        actualTime: metrics.responseTime,
        targetTime: metrics.personaOptimization.targetResponseTime,
        suggestions: metrics.personaOptimization.optimizationSuggestions
      });
    }
  }

  // Expert function: Start periodic metrics flushing
  private startMetricsFlushing(): void {
    setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  // Expert function: Flush metrics to monitoring system
  private flushMetrics(): void {
    if (this.metricsBuffer.length === 0) return;

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    // Expert analysis: Calculate aggregated metrics
    const aggregatedMetrics = this.calculateAggregatedMetrics(metricsToFlush);

    // Expert output: Send to monitoring system (Prometheus/Grafana)
    this.sendToMonitoringSystem(aggregatedMetrics);

    // Expert logging: Performance summary
    console.log('📊 Cultural Performance Metrics:', {
      timestamp: new Date().toISOString(),
      totalRequests: metricsToFlush.length,
      averageResponseTime: aggregatedMetrics.averageResponseTime,
      culturalDistribution: aggregatedMetrics.culturalDistribution,
      performanceRatings: aggregatedMetrics.performanceRatings
    });
  }

  // Expert function: Calculate aggregated metrics
  private calculateAggregatedMetrics(metrics: CulturalPerformanceMetrics[]) {
    const totalRequests = metrics.length;
    const averageResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;

    // Expert analysis: Cultural context distribution
    const culturalDistribution = metrics.reduce((acc, m) => {
      acc[m.culturalContext] = (acc[m.culturalContext] || 0) + 1;
      return acc;
    }, {} as Record<CulturalContext, number>);

    // Expert analysis: Performance ratings distribution
    const performanceRatings = metrics.reduce((acc, m) => {
      const rating = m.personaOptimization.performanceRating;
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Expert analysis: Persona-specific metrics
    const personaMetrics = metrics.reduce((acc, m) => {
      const persona = m.personaOptimization.persona;
      if (!acc[persona]) {
        acc[persona] = {
          count: 0,
          totalTime: 0,
          averageTime: 0,
          targetMet: 0
        };
      }
      
      acc[persona].count++;
      acc[persona].totalTime += m.responseTime;
      acc[persona].averageTime = acc[persona].totalTime / acc[persona].count;
      
      if (m.responseTime <= m.personaOptimization.targetResponseTime) {
        acc[persona].targetMet++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return {
      totalRequests,
      averageResponseTime,
      culturalDistribution,
      performanceRatings,
      personaMetrics,
      timestamp: Date.now()
    };
  }

  // Expert function: Send metrics to monitoring system
  private sendToMonitoringSystem(aggregatedMetrics: any): void {
    // Expert implementation: Send to Prometheus via HTTP POST
    // This would integrate with the Prometheus pushgateway or direct scraping endpoint
    
    // Expert requirement: Emit metrics för Prometheus scraping
    const prometheusMetrics = this.formatPrometheusMetrics(aggregatedMetrics);
    
    // Expert logging: Make metrics available för scraping endpoint
    // In production, this would be exposed via /metrics endpoint
    console.log('Prometheus Metrics:', prometheusMetrics);
  }

  // Expert function: Format metrics för Prometheus
  private formatPrometheusMetrics(metrics: any): string {
    const lines: string[] = [];

    // Expert metric: Cultural response time
    Object.entries(metrics.personaMetrics).forEach(([persona, data]: [string, any]) => {
      lines.push(`cultural_response_time{persona="${persona}"} ${data.averageTime}`);
      lines.push(`cultural_target_compliance{persona="${persona}"} ${(data.targetMet / data.count) * 100}`);
    });

    // Expert metric: Cultural context distribution
    Object.entries(metrics.culturalDistribution).forEach(([context, count]: [string, any]) => {
      lines.push(`cultural_requests_total{cultural_context="${context}"} ${count}`);
    });

    // Expert metric: Performance ratings
    Object.entries(metrics.performanceRatings).forEach(([rating, count]: [string, any]) => {
      lines.push(`performance_rating_total{rating="${rating}"} ${count}`);
    });

    // Expert metric: Overall performance
    lines.push(`overall_response_time_avg ${metrics.averageResponseTime}`);
    lines.push(`total_requests_processed ${metrics.totalRequests}`);

    return lines.join('\n');
  }

  // Expert function: Get current performance statistics
  public getCurrentStats() {
    if (this.metricsBuffer.length === 0) {
      return { message: 'No performance data available' };
    }

    return this.calculateAggregatedMetrics(this.metricsBuffer);
  }

  // Expert function: Get persona-specific statistics
  public getPersonaStats(persona: PersonaOptimization['persona']) {
    const personaMetrics = this.metricsBuffer.filter(
      m => m.personaOptimization.persona === persona
    );

    if (personaMetrics.length === 0) {
      return { message: `No data för persona: ${persona}` };
    }

    const averageTime = personaMetrics.reduce((sum, m) => sum + m.responseTime, 0) / personaMetrics.length;
    const targetTime = this.getTargetResponseTime(persona);
    const targetMet = personaMetrics.filter(m => m.responseTime <= targetTime).length;
    const complianceRate = (targetMet / personaMetrics.length) * 100;

    return {
      persona,
      totalRequests: personaMetrics.length,
      averageResponseTime: averageTime,
      targetResponseTime: targetTime,
      complianceRate: complianceRate,
      performanceRating: complianceRate >= 95 ? 'excellent' : 
                        complianceRate >= 85 ? 'good' : 
                        complianceRate >= 70 ? 'acceptable' : 'poor'
    };
  }
}

// Expert export: Singleton instance för application-wide use
export const culturalPerformanceMonitor = new CulturalPerformanceMonitor();