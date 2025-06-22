/**
 * Real-Time Performance Feedback System (Implementation of proposal-068)
 * Municipal UX with performance transparency for building user trust
 * Provides immediate visual performance indicators to municipal users
 */

import { q3PerformanceMonitor } from '../performance/Q3PerformanceMonitor';

export interface PerformanceIndicator {
  status: 'excellent' | 'good' | 'warning' | 'critical';
  color: string;
  message: string;
  details: string;
  actionRequired: boolean;
}

export interface PerformanceFeedbackConfig {
  showIndicator: boolean;
  detailLevel: 'minimal' | 'standard' | 'detailed';
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  municipalTheme: 'swedish' | 'german' | 'french' | 'dutch';
  userRole: 'citizen' | 'municipal_worker' | 'administrator';
}

export interface PerformanceMetrics {
  hubLoading: number;
  worldTransition: number;
  memoryUsage: number;
  networkLatency: number;
  renderTime: number;
  userInteractionDelay: number;
}

export class RealTimePerformanceFeedback {
  private readonly PERFORMANCE_THRESHOLDS = {
    hubLoading: {
      excellent: 400,
      good: 600,
      warning: 800,
      critical: 1200
    },
    worldTransition: {
      excellent: 800,
      good: 1200,
      warning: 1500,
      critical: 2000
    },
    memoryUsage: {
      excellent: 150 * 1024 * 1024, // 150MB
      good: 200 * 1024 * 1024,      // 200MB
      warning: 256 * 1024 * 1024,   // 256MB
      critical: 512 * 1024 * 1024   // 512MB
    },
    networkLatency: {
      excellent: 50,
      good: 100,
      warning: 200,
      critical: 500
    }
  };

  private config: PerformanceFeedbackConfig = {
    showIndicator: true,
    detailLevel: 'standard',
    position: 'top-right',
    municipalTheme: 'swedish',
    userRole: 'municipal_worker'
  };

  private currentMetrics: PerformanceMetrics = {
    hubLoading: 0,
    worldTransition: 0,
    memoryUsage: 0,
    networkLatency: 0,
    renderTime: 0,
    userInteractionDelay: 0
  };

  private feedbackElement: HTMLElement | null = null;
  private isVisible = false;
  private updateInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize real-time performance feedback system
   */
  async initialize(config?: Partial<PerformanceFeedbackConfig>): Promise<void> {
    console.log('📊 Initializing Real-Time Performance Feedback System');
    
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // Create feedback UI element
    this.createFeedbackElement();
    
    // Setup performance monitoring integration
    this.setupPerformanceMonitoringIntegration();
    
    // Start real-time updates
    this.startRealTimeUpdates();
    
    console.log('✅ Real-Time Performance Feedback System initialized');
    console.log(`🏛️ Municipal performance transparency active for ${this.config.municipalTheme} theme`);
  }

  /**
   * Update performance feedback configuration
   */
  updateConfig(newConfig: Partial<PerformanceFeedbackConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.feedbackElement) {
      this.updateFeedbackDisplay();
    }
    
    console.log('🔧 Performance feedback configuration updated');
  }

  /**
   * Show performance feedback to user
   */
  showFeedback(): void {
    if (this.feedbackElement && !this.isVisible) {
      this.feedbackElement.style.display = 'block';
      this.isVisible = true;
      console.log('👁️ Performance feedback shown to municipal user');
    }
  }

  /**
   * Hide performance feedback
   */
  hideFeedback(): void {
    if (this.feedbackElement && this.isVisible) {
      this.feedbackElement.style.display = 'none';
      this.isVisible = false;
      console.log('👁️ Performance feedback hidden');
    }
  }

  /**
   * Get current performance indicator
   */
  getCurrentIndicator(): PerformanceIndicator {
    
    return {
      status: overallStatus,
      color: this.getStatusColor(overallStatus),
      message: messages[overallStatus],
      details: this.getPerformanceDetails(),
      actionRequired: overallStatus === 'warning' || overallStatus === 'critical'
    };
  }

  /**
   * Report performance metric update
   */
  reportMetric(metric: keyof PerformanceMetrics, value: number): void {
    this.currentMetrics[metric] = value;
    
    if (this.isVisible) {
      this.updateFeedbackDisplay();
    }
    
    // Log significant performance changes
    if (this.isSignificantChange(metric, value)) {
      console.log(`📈 Performance metric updated: ${metric} = ${Math.round(value)}${this.getMetricUnit(metric)}`);
    }
  }

  /**
   * Get performance transparency data for municipal reporting
   */
  getTransparencyReport(): {
    currentStatus: string;
    metrics: PerformanceMetrics;
    targets: Record<string, unknown>;
    compliance: boolean;
    recommendations: string[];
  } {
    
    return {
      currentStatus: indicator.status,
      metrics: { ...this.currentMetrics },
      targets: this.PERFORMANCE_THRESHOLDS,
      compliance: indicator.status === 'excellent' || indicator.status === 'good',
      recommendations
    };
  }

  /**
   * Cleanup performance feedback system
   */
  cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    if (this.feedbackElement) {
      this.feedbackElement.remove();
      this.feedbackElement = null;
    }
    
    this.isVisible = false;
    
    console.log('🧹 Performance feedback system cleaned up');
  }

  // Private implementation methods

  private createFeedbackElement(): void {
    this.feedbackElement = document.createElement('div');
    this.feedbackElement.id = 'q3-performance-feedback';
    this.feedbackElement.className = 'q3-performance-feedback';
    
    // Apply municipal styling
    this.applyMunicipalStyling();
    
    // Position the element
    this.positionFeedbackElement();
    
    // Add to DOM
    document.body.appendChild(this.feedbackElement);
    
    // Initially hidden unless configured otherwise
    if (!this.config.showIndicator) {
      this.feedbackElement.style.display = 'none';
    } else {
      this.isVisible = true;
    }
  }

  private applyMunicipalStyling(): void {
    if (!this.feedbackElement) return;
    
    
    
    this.feedbackElement.style.cssText = `
      position: fixed;
      z-index: 9999;
      background: rgba(255, 255, 255, 0.95);
      border: 2px solid ${colors.primary};
      border-radius: 8px;
      padding: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      max-width: 300px;
      min-width: 200px;
      transition: all 0.3s ease;
    `;
  }

  private positionFeedbackElement(): void {
    if (!this.feedbackElement) return;
    
    
    Object.assign(this.feedbackElement.style, pos);
  }

  private setupPerformanceMonitoringIntegration(): void {
    // Integrate with Q3PerformanceMonitor
    console.log('🔗 Setting up performance monitoring integration');
    
    // In real implementation, would integrate with actual performance monitor
    // q3PerformanceMonitor.onMetricUpdate((metric, value) => {
    //   this.reportMetric(metric, value);
    // });
  }

  private startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.collectCurrentMetrics();
      if (this.isVisible) {
        this.updateFeedbackDisplay();
      }
    }, 2000); // Update every 2 seconds
  }

  private collectCurrentMetrics(): void {
    // Simulate collecting real metrics
    // In real implementation, would collect from actual performance APIs
    
    if (performance.memory) {
      this.currentMetrics.memoryUsage = performance.memory.usedJSHeapSize;
    }
    
    // Simulate other metrics with realistic values
    this.currentMetrics.networkLatency = 50 + Math.random() * 100;
    this.currentMetrics.renderTime = 10 + Math.random() * 20;
    this.currentMetrics.userInteractionDelay = 5 + Math.random() * 15;
  }

  private updateFeedbackDisplay(): void {
    if (!this.feedbackElement) return;
    
    
    this.feedbackElement.innerHTML = html;
    
    // Update border color based on status
    this.feedbackElement.style.borderColor = indicator.color;
  }

  private generateFeedbackHTML(indicator: PerformanceIndicator): string {
      ? `<div class="performance-details">${indicator.details}</div>` 
      : '';
    
    return `
      <div class="performance-header">
        <span class="status-icon" style="color: ${indicator.color};">${statusIcon}</span>
        <span class="status-message">${indicator.message}</span>
      </div>
      ${detailsHTML}
      ${indicator.actionRequired ? '<div class="action-required">⚠️ Åtgärd krävs</div>' : ''}
    `;
  }

  private calculateOverallStatus(): PerformanceIndicator['status'] {
    const statuses: PerformanceIndicator['status'][] = [];
    
    // Check each metric against thresholds
    for (const [metric, value] of Object.entries(this.currentMetrics)) {
      if (value > 0) { // Only check metrics that have been measured
        statuses.push(status);
      }
    }
    
    // Return worst status
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning')) return 'warning';
    if (statuses.includes('good')) return 'good';
    return 'excellent';
  }

  private getMetricStatus(metric: keyof PerformanceMetrics, value: number): PerformanceIndicator['status'] {
    if (!thresholds) return 'good';
    
    if (value <= thresholds.excellent) return 'excellent';
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.warning) return 'warning';
    return 'critical';
  }

  private getStatusColor(status: PerformanceIndicator['status']): string {
    return colors[status];
  }

  private getStatusIcon(status: PerformanceIndicator['status']): string {
    return icons[status];
  }

  private getLocalizedMessages(): Record<PerformanceIndicator['status'], string> {
    
    return messages[this.config.municipalTheme];
  }

  private getPerformanceDetails(): string {
    if (this.config.detailLevel === 'minimal') return '';
    
    const details: string[] = [];
    
    if (this.currentMetrics.hubLoading > 0) {
      details.push(`Hub: ${Math.round(this.currentMetrics.hubLoading)}ms`);
    }
    
    if (this.currentMetrics.worldTransition > 0) {
      details.push(`Övergång: ${Math.round(this.currentMetrics.worldTransition)}ms`);
    }
    
    if (this.currentMetrics.memoryUsage > 0) {
      details.push(`Minne: ${memoryMB}MB`);
    }
    
    return details.join(' • ');
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (indicator.status === 'warning' || indicator.status === 'critical') {
      recommendations.push('Stäng onödiga flikar för bättre prestanda');
      
      if (this.currentMetrics.memoryUsage > this.PERFORMANCE_THRESHOLDS.memoryUsage.warning) {
        recommendations.push('Hög minnesanvändning - överväg att starta om webbläsaren');
      }
      
      if (this.currentMetrics.networkLatency > this.PERFORMANCE_THRESHOLDS.networkLatency.warning) {
        recommendations.push('Kontrollera nätverksanslutningen');
      }
    }
    
    return recommendations;
  }

  private isSignificantChange(metric: keyof PerformanceMetrics, newValue: number): boolean {
    
    if (oldValue === 0) return true; // First measurement
    
    return change > threshold;
  }

  private getMetricUnit(metric: keyof PerformanceMetrics): string {
    return units[metric] || '';
  }
}

// Export singleton instance
