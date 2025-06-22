/**
 * Q2 Performance Monitoring Dashboard
 * Task: proposal-038 - Q2 Production Readiness
 * 
 * Real-time monitoring dashboard för Q2 Interactive Mechanics
 * Municipal-appropriate performance tracking and alerting
 */

import React, { useState, useEffect, useRef } from 'react';
import { Q2ProductionDeploymentManager, Q2HealthCheck, Q2_PRODUCTION_CONFIG } from '../services/q2-production-deployment';

interface Q2PerformanceData {
  timestamp: number;
  loadTime: number;
  memoryUsage: number;
  activeUsers: number;
  errorRate: number;
  fps: number;
  municipalMetrics: {
    completedSessions: number;
    achievementsEarned: number;
    culturalAdaptationScore: number;
    accessibilityCompliance: number;
  };
}

interface AlertConfig {
  id: string;
  type: 'performance' | 'error' | 'security' | 'municipal';
  severity: 'info' | 'warning' | 'critical';
  threshold: number;
  message: string;
  municipalImpact: string;
}

const Q2PerformanceMonitoringDashboard: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentHealth, setCurrentHealth] = useState<Q2HealthCheck | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<Q2PerformanceData[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<AlertConfig[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '4h' | '24h' | '7d'>('4h');
  

  // Alert configurations för municipal environment
  const alertConfigs: AlertConfig[] = [
    {
      id: 'load_time_warning',
      type: 'performance',
      severity: 'warning',
      threshold: 1500, // 1.5 seconds
      message: 'Q2 load time approaching limit',
      municipalImpact: 'User experience degradation may affect municipal training effectiveness'
    },
    {
      id: 'load_time_critical',
      type: 'performance',
      severity: 'critical',
      threshold: 2000, // 2 seconds
      message: 'Q2 load time exceeded municipal requirement',
      municipalImpact: 'Municipal users may abandon training sessions'
    },
    {
      id: 'memory_warning',
      type: 'performance',
      severity: 'warning',
      threshold: 200, // 200 MB
      message: 'Q2 memory usage high',
      municipalImpact: 'Device performance impact on municipal tablets/phones'
    },
    {
      id: 'error_rate_warning',
      type: 'error',
      severity: 'warning',
      threshold: 0.03, // 3%
      message: 'Q2 error rate elevated',
      municipalImpact: 'Municipal users experiencing failed interactions'
    },
    {
      id: 'error_rate_critical',
      type: 'error',
      severity: 'critical',
      threshold: 0.05, // 5%
      message: 'Q2 error rate critical',
      municipalImpact: 'Significant impact on municipal training reliability'
    },
    {
      id: 'fps_degradation',
      type: 'performance',
      severity: 'warning',
      threshold: 45, // Below 45 FPS
      message: 'Q2 animation performance degraded',
      municipalImpact: 'Touch interactions may feel unresponsive to municipal users'
    },
    {
      id: 'accessibility_compliance',
      type: 'municipal',
      severity: 'critical',
      threshold: 0.95, // Below 95%
      message: 'Q2 accessibility compliance degraded',
      municipalImpact: 'Municipal legal compliance risk - WCAG 2.1 AA requirement'
    }
  ];

  useEffect(() => {
    deploymentManager.current = new Q2ProductionDeploymentManager(Q2_PRODUCTION_CONFIG);
    return () => {
      stopMonitoring();
    };
  }, []);

  const _startMonitoring = async () => {
    if (!deploymentManager.current) return;

    setIsMonitoring(true);
    
    // Initial health check
    setCurrentHealth(initialHealth);
    updatePerformanceHistory(initialHealth);

    // Start continuous monitoring
    monitoringInterval.current = setInterval(async () => {
      if (deploymentManager.current) {
        setCurrentHealth(healthCheck);
        updatePerformanceHistory(healthCheck);
        checkAlerts(healthCheck);
      }
    }, 30000); // Check every 30 seconds
  };



    setPerformanceHistory(prev => {
      // Keep only data for selected time range
      return updated.filter(dp => dp.timestamp >= cutoffTime);
    });
  };

  const _calculateAverageFPS = (healthCheck: Q2HealthCheck): number => {
    // Calculate average FPS from component response times
    const _avgResponseTime = Object.values(healthCheck.components)
      .reduce((sum, comp) => sum + comp.responseTime, 0) / Object.keys(healthCheck.components).length;
    
    // Convert response time to estimated FPS (simplified calculation)
    return Math.max(30, 60 - (avgResponseTime / 10));
  };


  const _getTimeRangeMs = (range: string): number => {
    switch (range) {
      case '1h': return 60 * 60 * 1000;
      case '4h': return 4 * 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      default: return 4 * 60 * 60 * 1000;
    }
  };

  const _getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return '#16a34a';
      case 'degraded': return '#ca8a04';
      case 'critical': return '#dc2626';
      case 'maintenance': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const _getAlertColor = (severity: string): string => {
    switch (severity) {
      case 'info': return '#3b82f6';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const _formatNumber = (num: number, decimals: number = 1): string => {
    return num.toFixed(decimals);
  };

  const _formatPercentage = (num: number): string => {
    return `${(num * 100).toFixed(1)}%`;
  };

  if (!currentHealth && !isMonitoring) {
    return (
      <div className="q2-monitoring-dashboard p-6 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Q2 Performance Monitoring Dashboard
          </h1>
          <p className="text-gray-600 mb-6">
            Monitor Q2 Interactive Mechanics performance and municipal compliance in real-time
          </p>
          <button
            onClick={startMonitoring}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Q2 Monitoring
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="q2-monitoring-dashboard p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Q2 Performance Monitoring</h1>
          <p className="text-gray-600">Municipal Interactive Mechanics System Status</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="1h">Last Hour</option>
            <option value="4h">Last 4 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isMonitoring 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
        </div>
      </div>

      {/* System Status Overview */}
      {currentHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">System Status</h3>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusColor(currentHealth.status) }}
              />
            </div>
            <div className="text-2xl font-bold text-gray-900 capitalize">
              {currentHealth.status}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Last updated: {new Date(currentHealth.timestamp).toLocaleTimeString()}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Average Load Time</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                currentHealth.performance.averageLoadTime > 2000 ? 'bg-red-100 text-red-800' :
                currentHealth.performance.averageLoadTime > 1500 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {currentHealth.performance.averageLoadTime > 2000 ? 'CRITICAL' :
                 currentHealth.performance.averageLoadTime > 1500 ? 'WARNING' : 'GOOD'}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(currentHealth.performance.averageLoadTime, 0)}ms
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Municipal limit: 2000ms
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Memory Usage</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                currentHealth.performance.memoryUsage > 200 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {currentHealth.performance.memoryUsage > 200 ? 'HIGH' : 'NORMAL'}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(currentHealth.performance.memoryUsage)}MB
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Municipal limit: 256MB
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Error Rate</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                currentHealth.performance.errorRate > 0.05 ? 'bg-red-100 text-red-800' :
                currentHealth.performance.errorRate > 0.03 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {currentHealth.performance.errorRate > 0.05 ? 'CRITICAL' :
                 currentHealth.performance.errorRate > 0.03 ? 'WARNING' : 'GOOD'}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage(currentHealth.performance.errorRate)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Municipal tolerance: 5%
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h2>
          <div className="space-y-3">
            {activeAlerts.map((alert, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg border-l-4"
                style={{ borderLeftColor: getAlertColor(alert.severity), backgroundColor: `${getAlertColor(alert.severity)}10` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="px-2 py-1 text-xs font-medium rounded uppercase"
                        style={{ 
                          backgroundColor: getAlertColor(alert.severity),
                          color: 'white'
                        }}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {alert.message}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Municipal Impact:</strong> {alert.municipalImpact}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Component Health Status */}
      {currentHealth && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Q2 Component Health</h2>
            <div className="space-y-3">
              {Object.entries(currentHealth.components).map(([componentName, health]) => (
                <div key={componentName} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {componentName.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Response: {health.responseTime}ms
                      {health.errors.length > 0 && (
                        <span className="ml-2 text-red-600">
                          ({health.errors.length} errors)
                        </span>
                      )}
                    </div>
                  </div>
                  <span 
                    className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                      health.status === 'operational' ? 'bg-green-100 text-green-800' :
                      health.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {health.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Municipal Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Completed Sessions</div>
                <div className="text-xl font-bold text-gray-900">
                  {currentHealth.municipalMetrics.completedSessions.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Achievements Earned</div>
                <div className="text-xl font-bold text-gray-900">
                  {currentHealth.municipalMetrics.achievementsEarned.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Cultural Adaptation</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatPercentage(currentHealth.municipalMetrics.culturalAdaptationScore)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Accessibility Compliance</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatPercentage(currentHealth.municipalMetrics.accessibilityCompliance)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance History Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h2>
        <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
          <div className="text-center text-gray-600">
            <div className="text-sm">Performance chart visualization</div>
            <div className="text-xs mt-1">
              {performanceHistory.length} data points collected
            </div>
            <div className="text-xs mt-1">
              Load time, memory usage, error rate, and FPS trends over {selectedTimeRange}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Q2PerformanceMonitoringDashboard;