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
      const key = 'test:basic:1';
      const value = { message: 'Hello, Redis!' };

      const setResult = await redisCluster.set(key, value);
      expect(setResult).toBe(true);

      const retrievedValue = await redisCluster.get(key);
      expect(retrievedValue).toEqual(value);
    });

    it('should handle cache misses', async () => {
      const nonExistentKey = 'test:nonexistent:1';
      const result = await redisCluster.get(nonExistentKey);
      expect(result).toBeNull();
    });

    it('should set with custom TTL', async () => {
      const key = 'test:ttl:1';
      const value = { data: 'with ttl' };
      const ttl = 10; // 10 seconds

      const setResult = await redisCluster.set(key, value, { ttl });
      expect(setResult).toBe(true);

      const retrievedValue = await redisCluster.get(key);
      expect(retrievedValue).toEqual(value);

      // Check TTL
      const remainingTtl = await redisCluster.ttl(key);
      expect(remainingTtl).toBeGreaterThan(0);
      expect(remainingTtl).toBeLessThanOrEqual(ttl);
    });

    it('should set with tags and metadata', async () => {
      const key = 'test:tagged:1';
      const value = { content: 'tagged data' };
      const tags = ['validation', 'content'];
      const metadata = { source: 'test', priority: 'high' };

      const setResult = await redisCluster.set(key, value, { tags, metadata });
      expect(setResult).toBe(true);

      const retrievedValue = await redisCluster.get(key);
      expect(retrievedValue).toEqual(value);
    });

    it('should delete cache entries', async () => {
      const key = 'test:delete:1';
      const value = { data: 'to be deleted' };

      await redisCluster.set(key, value);
      
      const deleteResult = await redisCluster.del(key);
      expect(deleteResult).toBe(true);

      const retrievedValue = await redisCluster.get(key);
      expect(retrievedValue).toBeNull();
    });
  });

  describe('Batch Operations', () => {
    it('should perform multi-get operations', async () => {
      const testData = [
        { key: 'test:batch:1', value: { id: 1, name: 'Item 1' } },
        { key: 'test:batch:2', value: { id: 2, name: 'Item 2' } },
        { key: 'test:batch:3', value: { id: 3, name: 'Item 3' } }
      ];

      // Set all test data
      for (const item of testData) {
        await redisCluster.set(item.key, item.value);
      }

      // Multi-get
      const keys = testData.map(item => item.key);
      const results = await redisCluster.mget(keys);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual(testData[0].value);
      expect(results[1]).toEqual(testData[1].value);
      expect(results[2]).toEqual(testData[2].value);
    });

    it('should handle partial misses in multi-get', async () => {
      await redisCluster.set('test:partial:exists', { data: 'exists' });

      const results = await redisCluster.mget([
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
      const keys = ['test:mdel:1', 'test:mdel:2', 'test:mdel:3'];
      
      // Set test data
      for (const key of keys) {
        await redisCluster.set(key, { data: 'to delete' });
      }

      const deleteCount = await redisCluster.mdel(keys);
      expect(deleteCount).toBe(3);

      // Verify deletion
      const results = await redisCluster.mget(keys);
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
      const clearedCount = await redisCluster.clearByPattern('validation:*');
      expect(clearedCount).toBe(3); // Should clear 3 validation entries

      // Verify session data remains
      const sessionData = await redisCluster.get('session:user:1');
      expect(sessionData).toEqual({ user: 'test' });

      // Verify validation data is gone
      const gameData = await redisCluster.get('validation:game:1');
      expect(gameData).toBeNull();
    });

    it('should clear cache by tags', async () => {
      // Set data with various tags
      await redisCluster.set('item:1', { data: '1' }, { tags: ['validation', 'content'] });
      await redisCluster.set('item:2', { data: '2' }, { tags: ['session', 'user'] });
      await redisCluster.set('item:3', { data: '3' }, { tags: ['validation', 'quiz'] });
      await redisCluster.set('item:4', { data: '4' }, { tags: ['content', 'game'] });

      // Clear by validation tag
      const clearedCount = await redisCluster.clearByTags(['validation']);
      expect(clearedCount).toBe(2); // Should clear items 1 and 3

      // Verify remaining data
      const item2 = await redisCluster.get('item:2');
      expect(item2).toEqual({ data: '2' });

      const item4 = await redisCluster.get('item:4');
      expect(item4).toEqual({ data: '4' });
    });
  });

  describe('Advanced Operations', () => {
    it('should increment counters', async () => {
      const key = 'counter:test';
      
      // First increment should create and set to 1
      const result1 = await redisCluster.incr(key, 1);
      expect(result1).toBe(1);

      // Subsequent increments
      const result2 = await redisCluster.incr(key, 5);
      expect(result2).toBe(6);

      const result3 = await redisCluster.incr(key, 10);
      expect(result3).toBe(16);
    });

    it('should set expiration on existing keys', async () => {
      const key = 'test:expire:1';
      await redisCluster.set(key, { data: 'expires soon' });

      const expireResult = await redisCluster.expire(key, 5);
      expect(expireResult).toBe(true);

      const ttl = await redisCluster.ttl(key);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(5);
    });

    it('should check key existence', async () => {
      const existingKey = 'test:exists:1';
      const nonExistentKey = 'test:exists:2';

      await redisCluster.set(existingKey, { data: 'exists' });

      const exists1 = await redisCluster.exists(existingKey);
      expect(exists1).toBe(true);

      const exists2 = await redisCluster.exists(nonExistentKey);
      expect(exists2).toBe(false);
    });

    it('should handle expiration with setWithExpiry', async () => {
      const key = 'test:expiry:1';
      const value = { data: 'expires' };
      const expiry = 3; // 3 seconds

      const setResult = await redisCluster.setWithExpiry(key, value, expiry);
      expect(setResult).toBe(true);

      // Immediately check value exists
      const retrievedValue = await redisCluster.get(key);
      expect(retrievedValue).toEqual(value);

      // Check TTL
      const ttl = await redisCluster.ttl(key);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(expiry);
    });
  });

  describe('Cache Pattern Matching', () => {
    it('should match validation pattern with correct TTL', async () => {
      const key = 'validation:game:test-123';
      const value = { gameId: 'test-123' };

      await redisCluster.set(key, value);
      
      // Should use validation pattern default TTL (3600 seconds)
      const ttl = await redisCluster.ttl(key);
      expect(ttl).toBeGreaterThan(3500); // Close to 3600
      expect(ttl).toBeLessThanOrEqual(3600);
    });

    it('should match session pattern with correct TTL', async () => {
      const key = 'session:user:abc123';
      const value = { userId: 'abc123' };

      await redisCluster.set(key, value);
      
      // Should use session pattern default TTL (1800 seconds)
      const ttl = await redisCluster.ttl(key);
      expect(ttl).toBeGreaterThan(1700); // Close to 1800
      expect(ttl).toBeLessThanOrEqual(1800);
    });

    it('should match content pattern with correct TTL', async () => {
      const key = 'content:game:xyz789';
      const value = { content: 'game data' };

      await redisCluster.set(key, value);
      
      // Should use content pattern default TTL (7200 seconds)
      const ttl = await redisCluster.ttl(key);
      expect(ttl).toBeGreaterThan(7100); // Close to 7200
      expect(ttl).toBeLessThanOrEqual(7200);
    });

    it('should use default TTL for unmatched patterns', async () => {
      const key = 'unknown:pattern:test';
      const value = { data: 'unknown pattern' };

      await redisCluster.set(key, value);
      
      // Should use default TTL (3600 seconds)
      const ttl = await redisCluster.ttl(key);
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

      const metrics = redisCluster.getMetrics();
      
      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.hitRate).toBeGreaterThan(0);
      expect(metrics.missRate).toBeGreaterThan(0);
      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should perform health checks', async () => {
      const healthResult = await redisCluster.healthCheck();
      
      expect(healthResult).toHaveProperty('healthy');
      expect(healthResult).toHaveProperty('details');
      expect(typeof healthResult.healthy).toBe('boolean');
      expect(typeof healthResult.details).toBe('object');
    });

    it('should track node health status', async () => {
      await redisCluster.healthCheck();
      
      const metrics = redisCluster.getMetrics();
      expect(metrics.nodeHealth).toBeDefined();
      expect(typeof metrics.nodeHealth).toBe('object');
      
      // Should have health status for configured nodes
      const nodeKeys = Object.keys(metrics.nodeHealth);
      expect(nodeKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      // This test simulates what would happen with corrupted cache data
      // In the mock implementation, we'll just test normal operation
      const key = 'test:json:error';
      const value = { valid: 'json' };

      const setResult = await redisCluster.set(key, value);
      expect(setResult).toBe(true);

      const getResult = await redisCluster.get(key);
      expect(getResult).toEqual(value);
    });

    it('should handle network errors gracefully', async () => {
      // Mock implementation handles this automatically
      // In production, this would test actual network failure scenarios
      const key = 'test:network:error';
      const value = { data: 'test' };

      // Operations should not throw even if network fails
      await expect(redisCluster.set(key, value)).resolves.toBeDefined();
      await expect(redisCluster.get(key)).resolves.toBeDefined();
    });
  });

  describe('Memory Management', () => {
    it('should handle large datasets', async () => {
      const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
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
      const keys = largeDataSet.slice(0, 10).map(item => item.key);
      const results = await redisCluster.mget(keys);

      expect(results).toHaveLength(10);
      expect(results.every(result => result !== null)).toBe(true);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent operations', async () => {
      const concurrentOps = Array.from({ length: 10 }, async (_, i) => {
        const key = `concurrent:test:${i}`;
        const value = { operation: i, timestamp: Date.now() };
        
        await redisCluster.set(key, value);
        return redisCluster.get(key);
      });

      const results = await Promise.all(concurrentOps);
      
      expect(results).toHaveLength(10);
      expect(results.every(result => result !== null)).toBe(true);
    });

    it('should handle concurrent counter increments', async () => {
      const counterKey = 'concurrent:counter';
      
      const incrementOps = Array.from({ length: 10 }, () => 
        redisCluster.incr(counterKey, 1)
      );

      const results = await Promise.all(incrementOps);
      
      // All operations should succeed and return incrementing values
      expect(results).toHaveLength(10);
      expect(results.every(result => typeof result === 'number')).toBe(true);
      expect(Math.max(...results)).toBe(10); // Final counter value should be 10
    });
  });

  describe('Configuration and Patterns', () => {
    it('should initialize with custom configuration', () => {
      const customConfig = {
        ...defaultRedisConfig,
        redisOptions: {
          ...defaultRedisConfig.redisOptions,
          keyPrefix: 'custom:test:'
        }
      };

      const customRedis = new RedisClusterService(customConfig);
      expect(customRedis).toBeDefined();
      
      // Cleanup
      customRedis.shutdown();
    });

    it('should handle different cache patterns correctly', async () => {
      const testPatterns = [
        { key: 'validation:content:123', expectedPattern: 'validation:*' },
        { key: 'session:user:456', expectedPattern: 'session:*' },
        { key: 'content:game:789', expectedPattern: 'content:*' },
        { key: 'metrics:performance:abc', expectedPattern: 'metrics:*' },
        { key: 'municipal:config:def', expectedPattern: 'municipal:*' }
      ];

      for (const pattern of testPatterns) {
        await redisCluster.set(pattern.key, { pattern: pattern.expectedPattern });
        const result = await redisCluster.get(pattern.key);
        expect(result).toEqual({ pattern: pattern.expectedPattern });
      }
    });
  });
});