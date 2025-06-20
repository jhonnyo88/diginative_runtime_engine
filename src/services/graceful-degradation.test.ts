/**
 * Graceful Degradation Framework Tests
 * Q1-AO-Milestone-1.2 Test Coverage
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  GracefulDegradationService,
  DegradationLevel,
  DegradationReason,
  RecoveryStrategy
} from './graceful-degradation';

// Mock dependencies
vi.mock('./infrastructure-monitoring', () => ({
  InfrastructureMonitoring: {
    getInstance: () => ({
      reportDegradation: vi.fn()
    })
  }
}));

vi.mock('../validation/devteam-content-validator', () => ({
  DevTeamContentValidator: vi.fn().mockImplementation(() => ({
    validateGameManifest: vi.fn().mockReturnValue({
      isValid: true,
      errors: [],
      warnings: []
    })
  }))
}));

// Mock window and navigator for browser environment
Object.defineProperty(window, 'navigator', {
  value: {
    onLine: true
  },
  writable: true
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

describe('GracefulDegradationService', () => {
  let service: GracefulDegradationService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    service = GracefulDegradationService.getInstance();
    service.clearHistory();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should create singleton instance', () => {
      const instance1 = GracefulDegradationService.getInstance();
      const instance2 = GracefulDegradationService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize with default fallback providers', () => {
      expect(service).toBeDefined();
      // Test that fallback providers are registered
      const errorContent = service.degradeContent(DegradationReason.MALFORMED_CONTENT);
      expect(errorContent).toBeDefined();
      expect(errorContent.degradationInfo).toBeDefined();
    });
  });

  describe('Content Handling', () => {
    it('should handle valid content successfully', async () => {
      const validContent = {
        gameId: 'test-game',
        version: '1.0.0',
        metadata: {
          title: 'Test Game',
          description: 'Test description',
          duration: '5 minutes',
          targetAudience: 'Test users',
          language: 'sv'
        },
        scenes: []
      };

      const result = await service.handleContent(validContent, { gameId: 'test-game' });
      expect(result).toEqual(validContent);
    });

    it('should handle malformed content with degradation', async () => {
      const malformedContent = { invalid: 'content' };
      
      // Mock validator to return invalid
      const mockValidator = {
        validateGameManifest: vi.fn().mockReturnValue({
          isValid: false,
          errors: [{ path: 'root', message: 'Invalid structure', type: 'structure' }],
          warnings: []
        })
      };
      
      // Replace the validator
      (service as any).validator = mockValidator;

      const result = await service.handleContent(malformedContent);
      
      expect(result).toBeDefined();
      expect(result.degradationInfo).toBeDefined();
      expect(result.degradationInfo.reason).toBe(DegradationReason.VALIDATION_ERROR);
    });

    it('should handle timeout errors with retry logic', async () => {
      const content = { gameId: 'test' };
      let callCount = 0;
      
      // Mock validator to timeout first few times
      const mockValidator = {
        validateGameManifest: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount <= 2) {
            throw new Error('Validation timeout');
          }
          return { isValid: true, errors: [], warnings: [] };
        })
      };
      
      (service as any).validator = mockValidator;

      const result = await service.handleContent(content, { 
        gameId: 'test',
        maxRetries: 3,
        timeout: 100
      });

      expect(callCount).toBe(3);
      expect(result).toBeDefined();
    });

    it('should respect max retry limit', async () => {
      const content = { gameId: 'test' };
      
      // Mock validator to always fail
      const mockValidator = {
        validateGameManifest: vi.fn().mockImplementation(() => {
          throw new Error('Network failure');
        })
      };
      
      (service as any).validator = mockValidator;

      const result = await service.handleContent(content, { 
        gameId: 'test',
        maxRetries: 2
      });

      expect(result.degradationInfo).toBeDefined();
      expect(result.degradationInfo.metadata.retryCount).toBe(2);
    });
  });

  describe('Error Classification', () => {
    it('should classify network errors correctly', () => {
      const networkError = new Error('Network request failed');
      const reason = (service as any).classifyError(networkError);
      expect(reason).toBe(DegradationReason.NETWORK_FAILURE);
    });

    it('should classify timeout errors correctly', () => {
      const timeoutError = new Error('Request timeout');
      const reason = (service as any).classifyError(timeoutError);
      expect(reason).toBe(DegradationReason.TIMEOUT_ERROR);
    });

    it('should classify parse errors correctly', () => {
      const parseError = new Error('JSON parse error');
      const reason = (service as any).classifyError(parseError);
      expect(reason).toBe(DegradationReason.MALFORMED_CONTENT);
    });

    it('should classify memory errors correctly', () => {
      const memoryError = new Error('Memory quota exceeded');
      const reason = (service as any).classifyError(memoryError);
      expect(reason).toBe(DegradationReason.MEMORY_PRESSURE);
    });

    it('should default to service disruption for unknown errors', () => {
      const unknownError = new Error('Unknown error');
      const reason = (service as any).classifyError(unknownError);
      expect(reason).toBe(DegradationReason.SERVICE_DISRUPTION);
    });
  });

  describe('Degradation Levels', () => {
    it('should determine appropriate degradation level for malformed content', () => {
      const level = (service as any).determineDegradationLevel(
        DegradationReason.MALFORMED_CONTENT,
        1,
        3
      );
      expect(level).toBe(DegradationLevel.MINOR);
    });

    it('should escalate degradation level with retry count', () => {
      const level = (service as any).determineDegradationLevel(
        DegradationReason.MALFORMED_CONTENT,
        2,
        3
      );
      expect(level).toBe(DegradationLevel.MODERATE);
    });

    it('should set critical level for memory pressure', () => {
      const level = (service as any).determineDegradationLevel(
        DegradationReason.MEMORY_PRESSURE,
        0,
        3
      );
      expect(level).toBe(DegradationLevel.CRITICAL);
    });
  });

  describe('Recovery Strategies', () => {
    it('should choose cache strategy for network failures with cache', () => {
      // Add content to cache
      (service as any).contentCache.set('test-game', { gameId: 'test-game' });
      
      const strategy = (service as any).determineRecoveryStrategy(
        DegradationReason.NETWORK_FAILURE,
        DegradationLevel.MINOR
      );
      expect(strategy).toBe(RecoveryStrategy.CACHE);
    });

    it('should choose offline strategy for critical degradation', () => {
      const strategy = (service as any).determineRecoveryStrategy(
        DegradationReason.NETWORK_FAILURE,
        DegradationLevel.CRITICAL
      );
      expect(strategy).toBe(RecoveryStrategy.OFFLINE);
    });

    it('should choose fallback strategy for validation errors', () => {
      const strategy = (service as any).determineRecoveryStrategy(
        DegradationReason.VALIDATION_ERROR,
        DegradationLevel.MODERATE
      );
      expect(strategy).toBe(RecoveryStrategy.FALLBACK);
    });
  });

  describe('Content Repair', () => {
    it('should repair missing game metadata', () => {
      const malformedContent = {
        gameId: 'test-game',
        scenes: []
      };

      const repaired = (service as any).attemptContentRepair(malformedContent);
      
      expect(repaired).toBeDefined();
      expect(repaired.version).toBe('1.0.0');
      expect(repaired.metadata).toBeDefined();
      expect(repaired.metadata.title).toBe('Restored Game');
    });

    it('should repair missing scenes array', () => {
      const malformedContent = {
        gameId: 'test-game',
        version: '1.0.0',
        metadata: {
          title: 'Test Game',
          description: 'Test',
          duration: '5 minutes',
          targetAudience: 'Test',
          language: 'sv'
        }
      };

      const repaired = (service as any).attemptContentRepair(malformedContent);
      
      expect(repaired).toBeDefined();
      expect(Array.isArray(repaired.scenes)).toBe(true);
      expect(repaired.scenes.length).toBeGreaterThan(0);
    });

    it('should return null for unrepairable content', () => {
      const unrepairable = null;
      const repaired = (service as any).attemptContentRepair(unrepairable);
      expect(repaired).toBeNull();
    });
  });

  describe('Fallback Content Generation', () => {
    it('should create error game manifest', () => {
      const errorManifest = service.degradeContent(
        DegradationReason.MALFORMED_CONTENT,
        { gameId: 'original-game' }
      );

      expect(errorManifest).toBeDefined();
      expect(errorManifest.gameId).toMatch(/^error-/);
      expect(errorManifest.metadata.title).toBe('Content Format Error');
      expect(errorManifest.scenes).toHaveLength(1);
      expect(errorManifest.degradationInfo).toBeDefined();
    });

    it('should create offline game manifest', () => {
      const offlineManifest = service.degradeContent(DegradationReason.NETWORK_FAILURE);

      expect(offlineManifest).toBeDefined();
      expect(offlineManifest.gameId).toMatch(/^offline-/);
      expect(offlineManifest.metadata.title).toBe('Offline Mode');
      expect(offlineManifest.degradationInfo.strategy).toBe(RecoveryStrategy.OFFLINE);
    });

    it('should create maintenance game manifest', () => {
      const maintenanceManifest = service.degradeContent(DegradationReason.SERVICE_DISRUPTION);

      expect(maintenanceManifest).toBeDefined();
      expect(maintenanceManifest.gameId).toMatch(/^maintenance-/);
      expect(maintenanceManifest.metadata.title).toBe('System Maintenance');
      expect(maintenanceManifest.degradationInfo.level).toBe(DegradationLevel.SEVERE);
    });
  });

  describe('Content Caching', () => {
    it('should cache valid content', () => {
      const content = { gameId: 'test-game', version: '1.0.0' };
      (service as any).cacheContent('test-game', content);

      const cached = (service as any).getCachedContent('test-game');
      expect(cached).toEqual(content);
    });

    it('should handle localStorage caching', () => {
      const content = { gameId: 'test-game', version: '1.0.0' };
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem');
      
      (service as any).cacheContent('test-game', content);
      
      expect(setItemSpy).toHaveBeenCalledWith(
        'diginativa-content-test-game',
        expect.stringContaining('test-game')
      );
    });

    it('should retrieve from localStorage when memory cache empty', () => {
      const content = { gameId: 'test-game', version: '1.0.0' };
      const getItemSpy = vi.spyOn(window.localStorage, 'getItem').mockReturnValue(
        JSON.stringify({
          content,
          timestamp: Date.now(),
          version: '1.0.0'
        })
      );

      const cached = (service as any).getCachedContent('test-game');
      
      expect(getItemSpy).toHaveBeenCalledWith('diginativa-content-test-game');
      expect(cached).toEqual(content);
    });

    it('should ignore expired localStorage cache', () => {
      const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      vi.spyOn(window.localStorage, 'getItem').mockReturnValue(
        JSON.stringify({
          content: { gameId: 'test-game' },
          timestamp: oldTimestamp,
          version: '1.0.0'
        })
      );

      const cached = (service as any).getCachedContent('test-game');
      expect(cached).toBeNull();
    });
  });

  describe('Network Monitoring', () => {
    it('should handle network online event', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Simulate network recovery
      (service as any).handleNetworkRecovery();
      
      expect(consoleSpy).toHaveBeenCalledWith('Network connection restored');
      consoleSpy.mockRestore();
    });

    it('should handle network offline event', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Simulate network failure
      (service as any).handleNetworkFailure();
      
      expect(consoleSpy).toHaveBeenCalledWith('Network connection lost - entering offline mode');
      consoleSpy.mockRestore();
    });
  });

  describe('Custom Providers and Callbacks', () => {
    it('should register custom fallback provider', () => {
      const customProvider = vi.fn().mockReturnValue({ custom: 'fallback' });
      
      service.registerFallbackProvider(DegradationReason.RENDERING_ERROR, customProvider);
      
      const result = service.degradeContent(DegradationReason.RENDERING_ERROR, { test: 'data' });
      
      expect(customProvider).toHaveBeenCalledWith(DegradationReason.RENDERING_ERROR, { test: 'data' });
      expect(result.custom).toBe('fallback');
    });

    it('should register recovery callback', () => {
      const recoveryCallback = vi.fn();
      
      service.registerRecoveryCallback(DegradationReason.NETWORK_FAILURE, recoveryCallback);
      
      // Trigger network recovery
      (service as any).handleNetworkRecovery();
      
      expect(recoveryCallback).toHaveBeenCalled();
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should track degradation statistics', () => {
      // Trigger some degradations
      service.degradeContent(DegradationReason.MALFORMED_CONTENT);
      service.degradeContent(DegradationReason.NETWORK_FAILURE);
      service.degradeContent(DegradationReason.MALFORMED_CONTENT);

      const stats = service.getDegradationStats();
      
      expect(stats.totalEvents).toBe(3);
      expect(stats.byReason[DegradationReason.MALFORMED_CONTENT]).toBe(2);
      expect(stats.byReason[DegradationReason.NETWORK_FAILURE]).toBe(1);
      expect(stats.recentEvents).toHaveLength(3);
    });

    it('should clear degradation history', () => {
      service.degradeContent(DegradationReason.MALFORMED_CONTENT);
      
      let stats = service.getDegradationStats();
      expect(stats.totalEvents).toBe(1);
      
      service.clearHistory();
      
      stats = service.getDegradationStats();
      expect(stats.totalEvents).toBe(0);
    });

    it('should limit history size to 100 events', () => {
      // Generate more than 100 events
      for (let i = 0; i < 150; i++) {
        service.degradeContent(DegradationReason.MALFORMED_CONTENT);
      }

      const stats = service.getDegradationStats();
      expect(stats.totalEvents).toBe(100);
    });
  });

  describe('Retry Logic', () => {
    it('should identify retryable errors', () => {
      expect((service as any).shouldRetry(DegradationReason.NETWORK_FAILURE)).toBe(true);
      expect((service as any).shouldRetry(DegradationReason.SERVICE_DISRUPTION)).toBe(true);
      expect((service as any).shouldRetry(DegradationReason.TIMEOUT_ERROR)).toBe(true);
      expect((service as any).shouldRetry(DegradationReason.MALFORMED_CONTENT)).toBe(false);
    });
  });

  describe('User Messages', () => {
    it('should provide appropriate user messages for each reason', () => {
      const message1 = (service as any).getDegradationMessage(
        DegradationLevel.MINOR,
        DegradationReason.MALFORMED_CONTENT
      );
      expect(message1).toContain('Content format issue');

      const message2 = (service as any).getDegradationMessage(
        DegradationLevel.MODERATE,
        DegradationReason.NETWORK_FAILURE
      );
      expect(message2).toContain('Network connectivity issue');
    });
  });
});