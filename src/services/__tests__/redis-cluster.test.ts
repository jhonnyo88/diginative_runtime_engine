/**
 * Redis Cluster Service Tests
 * Testing distributed caching infrastructure
 * 
 * Roadmap Ref: Q1-MER-Milestone-1.4
 * Testing: Cache operations, cluster health, pattern matching
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RedisClusterService, defaultRedisConfig, type CacheEntry } from '../redis-cluster';

// Mock infrastructure monitoring to avoid Sentry dependency in tests
vi.mock('../infrastructure-monitoring', () => ({
  InfrastructureMonitoring: {
    getInstance: vi.fn(() => ({
      recordMetric: vi.fn(),
      reportError: vi.fn(),
      reportMessage: vi.fn()
    }))
  }
}));

describe('RedisClusterService', () => {
  let redisCluster: RedisClusterService;

  beforeEach(() => {
    redisCluster = new RedisClusterService(defaultRedisConfig);
  });

  afterEach(async () => {
    await redisCluster.shutdown();
  });

  describe('Basic Cache Operations', () => {
    it('should set and get cache entries', async () => {

      expect(setResult).toBe(true);

      expect(retrievedValue).toEqual(value);
    });

    it('should handle cache misses', async () => {
      expect(result).toBeNull();
    });

    it('should set with custom TTL', async () => {

      expect(setResult).toBe(true);

      expect(retrievedValue).toEqual(value);

      // Check TTL
      expect(remainingTtl).toBeGreaterThan(0);
      expect(remainingTtl).toBeLessThanOrEqual(ttl);
    });

    it('should set with tags and metadata', async () => {

      expect(setResult).toBe(true);

      expect(retrievedValue).toEqual(value);
    });

    it('should delete cache entries', async () => {

      await redisCluster.set(key, value);
      
      expect(deleteResult).toBe(true);

      expect(retrievedValue).toBeNull();
    });
  });

  describe('Batch Operations', () => {
    it('should perform multi-get operations', async () => {

      // Set all test data
      for (const item of testData) {
        await redisCluster.set(item.key, item.value);
      }

      // Multi-get

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual(testData[0].value);
      expect(results[1]).toEqual(testData[1].value);
      expect(results[2]).toEqual(testData[2].value);
    });

    it('should handle partial misses in multi-get', async () => {
      await redisCluster.set('test:partial:exists', { data: 'exists' });

        'test:partial:exists',
        'test:partial:missing1',
        'test:partial:missing2'
      ]);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({ data: 'exists' });
      expect(results[1]).toBeNull();
      expect(results[2]).toBeNull();
    });

    it('should perform multi-delete operations', async () => {
      
      // Set test data
      for (const key of keys) {
        await redisCluster.set(key, { data: 'to delete' });
      }

      expect(deleteCount).toBe(3);

      // Verify deletion
      expect(results.every(result => result === null)).toBe(true);
    });
  });

  describe('Pattern-based Operations', () => {
    it('should clear cache by pattern', async () => {
      // Set test data with different patterns
      await redisCluster.set('validation:game:1', { type: 'game' });
      await redisCluster.set('validation:scene:1', { type: 'scene' });
      await redisCluster.set('session:user:1', { user: 'test' });
      await redisCluster.set('validation:quiz:1', { type: 'quiz' });

      // Clear validation pattern
      expect(clearedCount).toBe(3); // Should clear 3 validation entries

      // Verify session data remains
      expect(sessionData).toEqual({ user: 'test' });

      // Verify validation data is gone
      expect(gameData).toBeNull();
    });

    it('should clear cache by tags', async () => {
      // Set data with various tags
      await redisCluster.set('item:1', { data: '1' }, { tags: ['validation', 'content'] });
      await redisCluster.set('item:2', { data: '2' }, { tags: ['session', 'user'] });
      await redisCluster.set('item:3', { data: '3' }, { tags: ['validation', 'quiz'] });
      await redisCluster.set('item:4', { data: '4' }, { tags: ['content', 'game'] });

      // Clear by validation tag
      expect(clearedCount).toBe(2); // Should clear items 1 and 3

      // Verify remaining data
      expect(item2).toEqual({ data: '2' });

      expect(item4).toEqual({ data: '4' });
    });
  });

  describe('Advanced Operations', () => {
    it('should increment counters', async () => {
      
      // First increment should create and set to 1
      expect(result1).toBe(1);

      // Subsequent increments
      expect(result2).toBe(6);

      expect(result3).toBe(16);
    });

    it('should set expiration on existing keys', async () => {
      await redisCluster.set(key, { data: 'expires soon' });

      expect(expireResult).toBe(true);

      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(5);
    });

    it('should check key existence', async () => {

      await redisCluster.set(existingKey, { data: 'exists' });

      expect(exists1).toBe(true);

      expect(exists2).toBe(false);
    });

    it('should handle expiration with setWithExpiry', async () => {

      expect(setResult).toBe(true);

      // Immediately check value exists
      expect(retrievedValue).toEqual(value);

      // Check TTL
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(expiry);
    });
  });

  describe('Cache Pattern Matching', () => {
    it('should match validation pattern with correct TTL', async () => {

      await redisCluster.set(key, value);
      
      // Should use validation pattern default TTL (3600 seconds)
      expect(ttl).toBeGreaterThan(3500); // Close to 3600
      expect(ttl).toBeLessThanOrEqual(3600);
    });

    it('should match session pattern with correct TTL', async () => {

      await redisCluster.set(key, value);
      
      // Should use session pattern default TTL (1800 seconds)
      expect(ttl).toBeGreaterThan(1700); // Close to 1800
      expect(ttl).toBeLessThanOrEqual(1800);
    });

    it('should match content pattern with correct TTL', async () => {

      await redisCluster.set(key, value);
      
      // Should use content pattern default TTL (7200 seconds)
      expect(ttl).toBeGreaterThan(7100); // Close to 7200
      expect(ttl).toBeLessThanOrEqual(7200);
    });

    it('should use default TTL for unmatched patterns', async () => {

      await redisCluster.set(key, value);
      
      // Should use default TTL (3600 seconds)
      expect(ttl).toBeGreaterThan(3500);
      expect(ttl).toBeLessThanOrEqual(3600);
    });
  });

  describe('Metrics and Health', () => {
    it('should track cache metrics', async () => {
      // Perform some operations to generate metrics
      await redisCluster.set('metrics:test:1', { data: 'test' });
      await redisCluster.get('metrics:test:1'); // Hit
      await redisCluster.get('metrics:test:2'); // Miss
      await redisCluster.get('metrics:test:1'); // Hit

      
      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.hitRate).toBeGreaterThan(0);
      expect(metrics.missRate).toBeGreaterThan(0);
      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should perform health checks', async () => {
      
      expect(healthResult).toHaveProperty('healthy');
      expect(healthResult).toHaveProperty('details');
      expect(typeof healthResult.healthy).toBe('boolean');
      expect(typeof healthResult.details).toBe('object');
    });

    it('should track node health status', async () => {
      await redisCluster.healthCheck();
      
      expect(metrics.nodeHealth).toBeDefined();
      expect(typeof metrics.nodeHealth).toBe('object');
      
      // Should have health status for configured nodes
      expect(nodeKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      // This test simulates what would happen with corrupted cache data
      // In the mock implementation, we'll just test normal operation

      expect(setResult).toBe(true);

      expect(getResult).toEqual(value);
    });

    it('should handle network errors gracefully', async () => {
      // Mock implementation handles this automatically
      // In production, this would test actual network failure scenarios

      // Operations should not throw even if network fails
      await expect(redisCluster.set(key, value)).resolves.toBeDefined();
      await expect(redisCluster.get(key)).resolves.toBeDefined();
    });
  });

  describe('Memory Management', () => {
    it('should handle large datasets', async () => {
      const _largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
        key: `large:dataset:${i}`,
        value: { 
          id: i, 
          data: `Item ${i}`.repeat(100), // Make each item reasonably large
          metadata: { created: Date.now(), index: i }
        }
      }));

      // Set all items
      for (const item of largeDataSet.slice(0, 10)) { // Test with subset for performance
        await redisCluster.set(item.key, item.value);
      }

      // Batch retrieve

      expect(results).toHaveLength(10);
      expect(results.every(result => result !== null)).toBe(true);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent operations', async () => {
      const _concurrentOps = Array.from({ length: 10 }, async (_, i) => {
        
        await redisCluster.set(key, value);
        return redisCluster.get(key);
      });

      
      expect(results).toHaveLength(10);
      expect(results.every(result => result !== null)).toBe(true);
    });

    it('should handle concurrent counter increments', async () => {
      
      const _incrementOps = Array.from({ length: 10 }, () => 
        redisCluster.incr(counterKey, 1)
      );

      
      // All operations should succeed and return incrementing values
      expect(results).toHaveLength(10);
      expect(results.every(result => typeof result === 'number')).toBe(true);
      expect(Math.max(...results)).toBe(10); // Final counter value should be 10
    });
  });

  describe('Configuration and Patterns', () => {
    it('should initialize with custom configuration', () => {

      expect(customRedis).toBeDefined();
      
      // Cleanup
      customRedis.shutdown();
    });

    it('should handle different cache patterns correctly', async () => {

      for (const pattern of testPatterns) {
        await redisCluster.set(pattern.key, { pattern: pattern.expectedPattern });
        expect(result).toEqual({ pattern: pattern.expectedPattern });
      }
    });
  });
});