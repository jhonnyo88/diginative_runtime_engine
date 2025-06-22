/**
 * Error Monitoring Service - Emergency Service Testing
 * Tests error capture, performance tracking, and monitoring functionality
 * 
 * Emergency Implementation - Critical Service Layer Testing
 * Roadmap Ref: Q1-Foundation-Autonomi-Milestone-1.1
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  errorMonitoring,
  captureError,
  captureMetric, 
  captureGameError,
  captureAccessibilityError,
  capturePerformanceIssue,
  type ErrorDetails,
  type PerformanceMetric,
  type ErrorContext
} from '../error-monitoring';
import { 
  ServiceMockFactory, 
  MockInfrastructureMonitoring,
  MockProvider 
} from './mocks/service-mocks';

// Mock window and global objects
const mockWindow = {
  addEventListener: vi.fn(),
  innerWidth: 1024,
  navigator: { userAgent: 'Test Browser' },
  performance: {
    timing: {
      navigationStart: 1000,
      loadEventEnd: 2000,
      domContentLoadedEventEnd: 1500
    },
    getEntriesByType: vi.fn().mockReturnValue([{
      domContentLoadedEventEnd: 1500,
      fetchStart: 1100
    }])
  },
  sessionStorage: {
    getItem: vi.fn(),
    setItem: vi.fn()
  },
  __DIGINATIVA_CONFIG__: {
    NODE_ENV: 'test',
    MONITORING_ENABLED: 'true',
    DEFAULT_MUNICIPALITY: 'malmo_stad'
  }
};

// Mock PerformanceObserver
const mockPerformanceObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn()
}));

// Setup global mocks
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

Object.defineProperty(global, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true
});

Object.defineProperty(global, 'sessionStorage', {
  value: mockWindow.sessionStorage,
  writable: true
});

Object.defineProperty(global, 'navigator', {
  value: mockWindow.navigator,
  writable: true
});

describe('ErrorMonitoringService - Emergency Service Testing', () => {
  let consoleInfoSpy: Record<string, unknown>;
  let consoleErrorSpy: Record<string, unknown>;
  let consoleWarnSpy: Record<string, unknown>;
  let monitoringMock: MockInfrastructureMonitoring;
  
  beforeEach(() => {
    // Reset all mocks
    ServiceMockFactory.resetAll();
    vi.clearAllMocks();
    
    // Setup console spies
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Reset window mocks
    mockWindow.sessionStorage.getItem.mockReset();
    mockWindow.sessionStorage.setItem.mockReset();
    mockWindow.addEventListener.mockReset();
    
    // Get monitoring mock
    monitoringMock = ServiceMockFactory.get('MockInfrastructureMonitoring') as MockInfrastructureMonitoring;
  });
  
  afterEach(() => {
    // Restore console methods
    consoleInfoSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
  
  describe('Critical Error Handling', () => {
    it('should immediately flush critical errors', () => {
      // Arrange
      const criticalError: Omit<ErrorDetails, 'context'> = {
        name: 'CriticalError',
        message: 'System failure',
        severity: 'critical',
        category: 'runtime'
      };
      
      // Act
      captureError(criticalError);
      
      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Critical error captured:',
        expect.objectContaining({
          name: 'CriticalError',
          severity: 'critical'
        })
      );
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/monitoring/errors'),
        expect.any(Object)
      );
    });
    
    it('should capture basic error structure correctly', () => {
      // Arrange
      const testError: Omit<ErrorDetails, 'context'> = {
        name: 'TestError',
        message: 'Test error message',
        severity: 'critical', // Use critical to force immediate flush
        category: 'runtime'
      };
      
      // Act
      captureError(testError);
      
      // Assert
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/monitoring/errors'),
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              name: 'TestError',
              message: 'Test error message',
              severity: 'critical',
              category: 'runtime'
            })
          ])
        })
      );
    });
  });
  
  describe('Game Error Handling', () => {
    it('should capture game errors with proper context', () => {
      // Arrange
      const gameError = new Error('Game script execution failed');
      
      // Act
      captureGameError('municipal-training', 'dialogue-scene', gameError, 'critical');
      
      // Assert
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/monitoring/errors'),
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              name: 'Error',
              message: 'Game script execution failed',
              severity: 'critical',
              category: 'game-content',
              context: expect.objectContaining({
                gameId: 'municipal-training',
                sceneId: 'dialogue-scene'
              })
            })
          ])
        })
      );
    });
  });
  
  describe('Accessibility Error Tracking', () => {
    it('should capture accessibility violations', () => {
      // Act
      captureAccessibilityError('button.submit', 'Missing aria-label', 'critical');
      
      // Assert
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/monitoring/errors'),
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              name: 'AccessibilityViolation',
              message: 'Accessibility violation: Missing aria-label',
              severity: 'critical',
              category: 'accessibility',
              metadata: expect.objectContaining({
                element: 'button.submit',
                violation: 'Missing aria-label',
                wcagLevel: 'AA'
              })
            })
          ])
        })
      );
    });
  });
  
  describe('Performance Monitoring', () => {
    it('should track metrics without errors when within threshold', () => {
      // Act
      capturePerformanceIssue('quiz-loading', 800, 1000);
      
      // Assert - Should capture metric but not error
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/monitoring/metrics'),
        expect.objectContaining({
          metrics: expect.arrayContaining([
            expect.objectContaining({
              name: 'performance.quiz-loading',
              value: 800,
              unit: 'ms'
            })
          ])
        })
      );
    });
    
    it('should capture performance issues when threshold exceeded', () => {
      // Act
      capturePerformanceIssue('slow-operation', 3000, 1000);
      
      // Assert - Should capture both error and metric
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/monitoring/errors'),
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              name: 'PerformanceIssue',
              severity: 'high', // 3000 > 1000 * 2
              category: 'performance',
              metadata: expect.objectContaining({
                operation: 'slow-operation',
                duration: 3000,
                threshold: 1000,
                ratio: 3
              })
            })
          ])
        })
      );
    });
  });
  
  describe('Context Detection', () => {
    it('should detect mobile device context', () => {
      // Arrange
      mockWindow.innerWidth = 500; // Mobile width
      
      // Act
      captureError({
        name: 'MobileTest',
        message: 'Mobile error test',
        severity: 'critical',
        category: 'runtime'
      });
      
      // Assert
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/monitoring/errors'),
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              context: expect.objectContaining({
                deviceType: 'mobile'
              })
            })
          ])
        })
      );
    });
    
    it('should detect tablet device context', () => {
      // Arrange
      mockWindow.innerWidth = 800; // Tablet width
      
      // Act
      captureError({
        name: 'TabletTest',
        message: 'Tablet error test',
        severity: 'critical',
        category: 'runtime'
      });
      
      // Assert
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/monitoring/errors'),
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              context: expect.objectContaining({
                deviceType: 'tablet'
              })
            })
          ])
        })
      );
    });
    
    it('should include municipal context', () => {
      // Act
      captureError({
        name: 'MunicipalTest',
        message: 'Municipal context test',
        severity: 'critical',
        category: 'runtime'
      });
      
      // Assert
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/monitoring/errors'),
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              context: expect.objectContaining({
                municipality: 'malmo_stad'
              })
            })
          ])
        })
      );
    });
  });
  
  describe('Session Management', () => {
    it('should generate new session ID when none exists', () => {
      // Arrange
      mockWindow.sessionStorage.getItem.mockReturnValue(null);
      
      // Act
      captureError({
        name: 'SessionTest',
        message: 'Session test',
        severity: 'critical',
        category: 'runtime'
      });
      
      // Assert
      expect(mockWindow.sessionStorage.setItem).toHaveBeenCalledWith(
        'sessionId',
        expect.stringMatching(/^session_\d+_[a-z0-9]+$/)
      );
    });
    
    it('should reuse existing session ID', () => {
      // Arrange
      mockWindow.sessionStorage.getItem.mockImplementation((key) => {
        if (key === 'sessionId') return 'existing-session-456';
        return null;
      });
      
      // Act
      captureError({
        name: 'SessionReuseTest',
        message: 'Session reuse test',
        severity: 'critical',
        category: 'runtime'
      });
      
      // Assert
      expect(mockWindow.sessionStorage.setItem).not.toHaveBeenCalledWith(
        'sessionId',
        expect.anything()
      );
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/monitoring/errors'),
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              context: expect.objectContaining({
                sessionId: 'existing-session-456'
              })
            })
          ])
        })
      );
    });
  });
  
  describe('Metric Capture', () => {
    it('should capture custom metrics with timestamps', () => {
      // Arrange
      const metric: Omit<PerformanceMetric, 'timestamp'> = {
        name: 'quiz.completion_time',
        value: 45000,
        unit: 'ms',
        tags: {
          municipality: 'malmo_stad',
          difficulty: 'intermediate'
        }
      };
      
      // Act - Force batch flush with 50 metrics
      for (let i = 0; i < 50; i++) {
        captureMetric({
          ...metric,
          name: `metric_${i}`
        });
      }
      
      // Assert
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/monitoring/metrics'),
        expect.objectContaining({
          metrics: expect.arrayContaining([
            expect.objectContaining({
              name: 'quiz.completion_time',
              value: 45000,
              unit: 'ms',
              timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            })
          ])
        })
      );
    });
  });
  
  describe('Error Handling Edge Cases', () => {
    it('should handle missing game state gracefully', () => {
      // Arrange
      mockWindow.sessionStorage.getItem.mockReturnValue(null);
      
      // Act
      captureError({
        name: 'NoGameStateTest',
        message: 'Error without game state',
        severity: 'critical',
        category: 'runtime'
      });
      
      // Assert
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/monitoring/errors'),
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              context: expect.objectContaining({
                gameId: undefined,
                sceneId: undefined
              })
            })
          ])
        })
      );
    });
    
    it('should handle invalid JSON in game state gracefully', () => {
      // Arrange
      mockWindow.sessionStorage.getItem.mockImplementation((key) => {
        if (key === 'currentGameState') return 'invalid-json{';
        return null;
      });
      
      // Act & Assert - Should not throw error
      expect(() => {
        captureError({
          name: 'MalformedGameStateTest',
          message: 'Error with malformed game state',
          severity: 'critical',
          category: 'runtime'
        });
      }).not.toThrow();
    });
  });
  
  describe('Service Integration', () => {
    it('should be properly initialized', () => {
      // Assert
      expect(errorMonitoring).toBeDefined();
      expect(typeof captureError).toBe('function');
      expect(typeof captureMetric).toBe('function');
      expect(typeof captureGameError).toBe('function');
      expect(typeof captureAccessibilityError).toBe('function');
      expect(typeof capturePerformanceIssue).toBe('function');
    });
    
    it('should setup global error handlers on window', () => {
      // Assert - Should have set up event listeners
      expect(mockWindow.addEventListener).toHaveBeenCalled();
    });
    
    it('should create React Error Boundary integration', () => {
      // Assert
      expect((mockWindow as any).__DIGINATIVA_ERROR_HANDLER__).toBeDefined();
      expect(typeof (mockWindow as any).__DIGINATIVA_ERROR_HANDLER__).toBe('function');
    });
  });
  
  describe('Performance Requirements', () => {
    it('should complete error capture within performance budget', () => {
      // Arrange
      const iterations = 100;
      const maxDurationMs = 5;
      const durations: number[] = [];
      
      // Act
      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        
        captureError({
          name: `PerfTest${i}`,
          message: `Performance test ${i}`,
          severity: 'low',
          category: 'runtime'
        });
        
        durations.push(Date.now() - start);
      }
      
      // Assert
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      expect(avgDuration).toBeLessThan(maxDurationMs);
    });
    
    it('should handle concurrent operations efficiently', async () => {
      // Arrange
      const promises = [];
      
      // Act
      for (let i = 0; i < 50; i++) {
        promises.push(
          Promise.resolve().then(() => {
            captureError({
              name: `ConcurrentTest${i}`,
              message: `Concurrent test ${i}`,
              severity: 'low',
              category: 'runtime'
            });
          })
        );
      }
      
      const start = Date.now();
      await Promise.all(promises);
      const duration = Date.now() - start;
      
      // Assert
      expect(duration).toBeLessThan(100);
    });
  });
});