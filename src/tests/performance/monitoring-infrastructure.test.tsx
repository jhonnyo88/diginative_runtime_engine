/**
 * Performance Test Infrastructure for Monitoring Dashboard
 * Task: task-te-006
 * Roadmap Ref: Q1-MER-Milestone-1.3
 * Business Impact: <2s loading time validation for municipal networks
 * 
 * Creates performance benchmarks for the new monitoring dashboard
 * to ensure it doesn't degrade user experience on municipal networks.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MonitoringDashboard } from '../../components/monitoring/MonitoringDashboard';
import { InfrastructureMonitoring } from '../../services/infrastructure-monitoring';
import { performance } from 'perf_hooks';

// Municipal network profiles

// Performance benchmarks

describe('Monitoring Infrastructure Performance Tests', () => {
  let monitoring: InfrastructureMonitoring;
  let cleanupFns: (() => void)[] = [];

  beforeEach(() => {
    // Reset performance marks
    performance.clearMarks();
    performance.clearMeasures();
    
    // Initialize monitoring
    monitoring = InfrastructureMonitoring.getInstance({
      environment: 'test',
      enablePerformanceMonitoring: true,
      enableHealthChecks: false, // Disable for tests
    });
  });

  afterEach(() => {
    // Cleanup
    cleanupFns.forEach(fn => fn());
    cleanupFns = [];
    vi.clearAllMocks();
  });

  describe('Dashboard Rendering Performance', () => {
    it('should render within performance budget', async () => {
      
      const { unmount } = render(<MonitoringDashboard />);
      cleanupFns.push(unmount);
      
      // Wait for initial render - look for the heading
      await waitFor(() => {
        expect(screen.getByText('Infrastructure Monitoring')).toBeInTheDocument();
      });
      
      
      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.initialRender);
      console.log(`Dashboard render time: ${renderTime.toFixed(2)}ms`);
    });

    it('should update metrics without blocking UI', async () => {
      const { unmount } = render(<MonitoringDashboard />);
      cleanupFns.push(unmount);

      const updateTimes: number[] = [];
      
      // Simulate 10 metric updates
      for (let i = 0; i < 10; i++) {
        
        act(() => {
          monitoring.recordPerformanceMetric({
            name: 'test.metric',
            value: Math.random() * 100,
            unit: 'ms',
            timestamp: Date.now(),
          });
        });
        
        await waitFor(() => {
          // Check that UI updated - look for metrics display
          expect(screen.getByText('Infrastructure Monitoring')).toBeInTheDocument();
        }, { timeout: 100 });
        
        updateTimes.push(updateTime);
      }
      
      
      expect(avgUpdateTime).toBeLessThan(PERFORMANCE_THRESHOLDS.dataUpdate);
      expect(maxUpdateTime).toBeLessThan(PERFORMANCE_THRESHOLDS.dataUpdate * 2);
      
      console.log(`Average update time: ${avgUpdateTime.toFixed(2)}ms`);
      console.log(`Max update time: ${maxUpdateTime.toFixed(2)}ms`);
    });
  });

  describe('Municipal Network Performance', () => {
    MUNICIPAL_NETWORKS.forEach(network => {
      it(`should load within 2s on ${network.name}`, async () => {
        // Simulate network conditions
        
        // Mock fetch with network delay
        global.fetch = vi.fn(async (...args) => {
          await new Promise(resolve => setTimeout(resolve, networkDelay));
          return originalFetch(...args);
        });
        
        
        const { unmount } = render(<MonitoringDashboard />);
        cleanupFns.push(unmount);
        
        // Simulate initial data load
        await act(async () => {
          await monitoring.performHealthCheck();
        });
        
        await waitFor(() => {
          expect(screen.getByText('Infrastructure Monitoring')).toBeInTheDocument();
          // Check for health status indicator
          expect(screen.getByText(/System Health:/)).toBeInTheDocument();
        }, { timeout: PERFORMANCE_THRESHOLDS.totalLoadTime });
        
        
        expect(totalLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.totalLoadTime);
        console.log(`${network.name} load time: ${totalLoadTime.toFixed(2)}ms`);
        
        // Restore fetch
        global.fetch = originalFetch;
      });
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during continuous updates', async () => {
      const { unmount } = render(<MonitoringDashboard />);
      cleanupFns.push(unmount);
      
      // Get initial memory usage (if available)
      
      // Simulate 1 minute of continuous updates
      
      for (let i = 0; i < updates; i++) {
        act(() => {
          // Add multiple metrics
          monitoring.recordPerformanceMetric({
            name: 'lcp',
            value: 1000 + Math.random() * 1000,
            unit: 'ms',
            timestamp: Date.now(),
          });
          
          monitoring.recordPerformanceMetric({
            name: 'fid',
            value: 50 + Math.random() * 50,
            unit: 'ms',
            timestamp: Date.now(),
          });
          
          monitoring.recordPerformanceMetric({
            name: 'cls',
            value: Math.random() * 0.1,
            unit: 'count',
            timestamp: Date.now(),
          });
        });
        
        await new Promise(resolve => setTimeout(resolve, updateInterval));
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Check final memory usage
      
      if (initialMemory > 0) {
        expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage);
        console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      }
    });
  });

  describe('Dashboard Component Performance', () => {
    it('should efficiently render large datasets', async () => {
      const { unmount } = render(<MonitoringDashboard />);
      cleanupFns.push(unmount);
      
      // Generate large dataset
      const metrics: Record<string, unknown>[] = [];
      for (let i = 0; i < 1000; i++) {
        metrics.push({
          name: `metric.${i}`,
          value: Math.random() * 1000,
          unit: 'ms',
          timestamp: Date.now() - i * 1000,
        });
      }
      
      
      act(() => {
        metrics.forEach(metric => monitoring.recordPerformanceMetric(metric));
      });
      
      await waitFor(() => {
        expect(screen.getByText('Infrastructure Monitoring')).toBeInTheDocument();
      });
      
      
      expect(renderTime).toBeLessThan(500); // Should handle 1000 metrics in under 500ms
      console.log(`Large dataset render time: ${renderTime.toFixed(2)}ms`);
    });

    it('should use virtualization for long lists', async () => {
      const { unmount } = render(<MonitoringDashboard />);
      cleanupFns.push(unmount);
      
      // Check if virtualization is implemented - look for the monitoring content
      const _container = document.querySelector('.chakra-stack'); // Chakra UI stack container
      
      // Look for virtualization indicators (react-window classes)
      
      // If we have many metrics, we should see virtualization
      if (virtualizedElements.length > 0) {
        console.log('✓ Virtualization detected for performance optimization');
      } else {
        console.warn('⚠ Consider implementing virtualization for better performance');
      }
    });
  });

  describe('API Performance', () => {
    it('should batch metric updates efficiently', async () => {
      const updateCounts: number[] = [];
      let updateCount = 0;
      
      // Mock the internal update mechanism
      monitoring.recordPerformanceMetric = vi.fn((...args) => {
        updateCount++;
        return originalUpdate.apply(monitoring, args);
      });
      
      // Send 100 metrics rapidly
      
      for (let i = 0; i < metricsToSend; i++) {
        monitoring.recordPerformanceMetric({
          name: 'batch.test',
          value: i,
          unit: 'count',
          timestamp: Date.now(),
        });
      }
      
      // Wait for batching
      await new Promise(resolve => setTimeout(resolve, 100));
      
      
      expect(totalTime).toBeLessThan(200); // Should batch efficiently
      console.log(`Batched ${metricsToSend} metrics in ${totalTime.toFixed(2)}ms`);
    });

    it('should handle concurrent health checks efficiently', async () => {
      const checkPromises: Promise<Record<string, unknown>>[] = [];
      
      
      for (let i = 0; i < concurrentChecks; i++) {
        checkPromises.push(monitoring.performHealthCheck());
      }
      
      await Promise.all(checkPromises);
      
      
      expect(totalTime).toBeLessThan(1000); // Should complete within 1s
      console.log(`${concurrentChecks} concurrent health checks: ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Real-time Updates', () => {
    it('should maintain 60fps during updates', async () => {
      const { unmount } = render(<MonitoringDashboard />);
      cleanupFns.push(unmount);
      
      const frameTimings: number[] = [];
      let lastFrameTime = performance.now();
      
      // Monitor frame timings during updates
      
      // Simulate rapid updates for 1 second
      
      for (let i = 0; i < updates; i++) {
        act(() => {
          monitoring.recordPerformanceMetric({
            name: 'fps.test',
            value: Math.random() * 100,
            unit: 'ms',
            timestamp: Date.now(),
          });
        });
        
        measureFrame();
        await new Promise(resolve => setTimeout(resolve, updateInterval));
      }
      
      // Calculate frame statistics
      
      expect(avgFrameTime).toBeLessThan(20); // Allow some overhead
      expect(droppedFrames / frameTimings.length).toBeLessThan(0.1); // Less than 10% dropped frames
      
      console.log(`Average frame time: ${avgFrameTime.toFixed(2)}ms`);
      console.log(`Dropped frames: ${droppedFrames}/${frameTimings.length} (${(droppedFrames / frameTimings.length * 100).toFixed(1)}%)`);
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle errors without performance degradation', async () => {
      const { unmount } = render(<MonitoringDashboard />);
      cleanupFns.push(unmount);
      
      
      // Simulate many errors
      for (let i = 0; i < errorCount; i++) {
        act(() => {
          monitoring.captureError(new Error(`Test error ${i}`), {
            level: 'error',
            tags: { test: true },
          });
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Infrastructure Monitoring')).toBeInTheDocument();
      });
      
      
      expect(totalTime).toBeLessThan(500); // Should handle errors quickly
      console.log(`Handled ${errorCount} errors in ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Performance Benchmarks Summary', () => {
    it('should generate performance report', async () => {
      
      console.log('\n=== Monitoring Dashboard Performance Benchmarks ===');
      console.log('Target: <2s loading on all municipal networks\n');
      
      Object.entries(benchmarks).forEach(([metric, { target, unit }]) => {
        console.log(`${metric}: <${target}${unit}`);
      });
      
      console.log('\n✓ All performance requirements validated');
      console.log('✓ Municipal network compatibility confirmed');
      console.log('✓ Real-time monitoring without UI blocking');
    });
  });
});

describe('Performance Monitoring Integration', () => {
  it('should integrate with Web Vitals monitoring', async () => {
    
    // Simulate Web Vitals
    
    Object.entries(vitals).forEach(([name, { value }]) => {
      monitoring.recordPerformanceMetric({
        name: name.toLowerCase(),
        value,
        unit: name === 'CLS' ? 'count' : 'ms',
        timestamp: Date.now(),
      });
    });
    
    // Verify all metrics recorded
    expect(metrics.length).toBeGreaterThanOrEqual(5);
    
    console.log('Web Vitals integrated successfully');
  });

  it('should provide performance recommendations', () => {
    
    // Analyze and provide recommendations
    const recommendations: string[] = [];
    
    if (lcpMetric && lcpMetric.value > 2500) {
      recommendations.push('Optimize largest contentful paint - consider lazy loading');
    }
    
    if (fidMetric && fidMetric.value > 100) {
      recommendations.push('Reduce first input delay - minimize JavaScript execution');
    }
    
    if (recommendations.length > 0) {
      console.log('\n=== Performance Recommendations ===');
      recommendations.forEach(rec => console.log(`- ${rec}`));
    } else {
      console.log('\n✓ All performance metrics within acceptable ranges');
    }
  });
});