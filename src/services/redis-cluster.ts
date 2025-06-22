/**
 * Redis Cluster Service
 * Distributed caching infrastructure for microservice architecture
 * 
 * Roadmap Ref: Q1-MER-Milestone-1.4
 * Business Impact: Enables horizontal scaling of validation services
 */

export interface RedisClusterConfig {
  nodes: RedisNode[];
  maxRetries: number;
  retryDelayOnFailover: number;
  enableReadyCheck: boolean;
  redisOptions: {
    password?: string;
    db: number;
    keyPrefix: string;
  };
  clusterOptions: {
    enableOfflineQueue: boolean;
    maxRetriesPerRequest: number;
    scaleReads: 'master' | 'slave' | 'all';
  };
}

export interface RedisNode {
  host: string;
  port: number;
  password?: string;
}

export interface CacheEntry {
  key: string;
  value: unknown;
  ttl?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface CachePattern {
  pattern: string;
  description: string;
  defaultTTL: number;
  tags: string[];
}

export interface ClusterMetrics {
  totalRequests: number;
  hitRate: number;
  missRate: number;
  errorRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  activeConnections: number;
  nodeHealth: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
}

/**
 * Redis cluster management with intelligent caching strategies
 */
export class RedisClusterService {
  private config: RedisClusterConfig;
  private cluster: Record<string, unknown>; // In production: import { Cluster } from 'ioredis'
  private metrics: ClusterMetrics;
  private cachePatterns: Map<string, CachePattern> = new Map();
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(config: RedisClusterConfig) {
    this.config = config;
    this.metrics = {
      totalRequests: 0,
      hitRate: 0,
      missRate: 0,
      errorRate: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      activeConnections: 0,
      nodeHealth: {}
    };
    
    this.initializeCachePatterns();
    this.initializeCluster();
    this.startHealthMonitoring();
  }

  /**
   * Initialize predefined cache patterns
   */
  private initializeCachePatterns(): void {
    this.cachePatterns.set('validation:*', {
      pattern: 'validation:*',
      description: 'Content validation results',
      defaultTTL: 3600, // 1 hour
      tags: ['validation', 'content']
    });

    this.cachePatterns.set('session:*', {
      pattern: 'session:*',
      description: 'User session data',
      defaultTTL: 1800, // 30 minutes
      tags: ['session', 'user']
    });

    this.cachePatterns.set('content:*', {
      pattern: 'content:*',
      description: 'Game content cache',
      defaultTTL: 7200, // 2 hours
      tags: ['content', 'game']
    });

    this.cachePatterns.set('metrics:*', {
      pattern: 'metrics:*',
      description: 'Performance metrics',
      defaultTTL: 300, // 5 minutes
      tags: ['metrics', 'monitoring']
    });

    this.cachePatterns.set('municipal:*', {
      pattern: 'municipal:*',
      description: 'Municipal configuration data',
      defaultTTL: 86400, // 24 hours
      tags: ['municipal', 'config']
    });
  }

  /**
   * Initialize Redis cluster connection
   */
  private initializeCluster(): void {
    try {
      // In production, use actual Redis cluster
      // this.cluster = new Cluster(this.config.nodes, this.config.clusterOptions);
      
      // Mock implementation for development
      this.cluster = new MockRedisCluster(this.config);
      
      this.cluster.on('connect', () => {
        console.log('Redis cluster connected successfully');
      });

      this.cluster.on('error', (error: Error) => {
        console.error('Redis cluster error:', error);
        this.metrics.errorRate += 1;
      });

      this.cluster.on('node error', (error: Error, node: RedisNode) => {
        console.error(`Redis node error on ${node.host}:${node.port}:`, error);
        this.metrics.nodeHealth[`${node.host}:${node.port}`] = 'unhealthy';
      });

    } catch (error) {
      console.error('Failed to initialize Redis cluster:', error);
      throw error;
    }
  }

  /**
   * Set cache entry with intelligent TTL
   */
  async set(key: string, value: unknown, options?: {
    ttl?: number;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const pattern = this.findMatchingPattern(key);
      const ttl = options?.ttl || pattern?.defaultTTL || 3600;
      
      const cacheEntry: CacheEntry = {
        key,
        value,
        ttl,
        tags: options?.tags || pattern?.tags || [],
        metadata: {
          ...options?.metadata,
          createdAt: Date.now(),
          pattern: pattern?.pattern
        }
      };

      const serialized = JSON.stringify(cacheEntry);
      await this.cluster.setex(this.prefixKey(key), ttl, serialized);
      
      this.updateMetrics('set', Date.now() - startTime, true);
      return true;

    } catch (error) {
      console.error(`Failed to set cache key ${key}:`, error);
      this.updateMetrics('set', Date.now() - startTime, false);
      return false;
    }
  }

  /**
   * Get cache entry with hit/miss tracking
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      const serialized = await this.cluster.get(this.prefixKey(key));
      
      if (!serialized) {
        this.updateMetrics('get', Date.now() - startTime, false);
        return null;
      }

      const cacheEntry: CacheEntry = JSON.parse(serialized);
      this.updateMetrics('get', Date.now() - startTime, true);
      
      return cacheEntry.value as T;

    } catch (error) {
      console.error(`Failed to get cache key ${key}:`, error);
      this.updateMetrics('get', Date.now() - startTime, false);
      return null;
    }
  }

  /**
   * Multi-get for batch operations
   */
  async mget<T = unknown>(keys: string[]): Promise<(T | null)[]> {
    const startTime = Date.now();
    
    try {
      const prefixedKeys = keys.map(key => this.prefixKey(key));
      const results = await this.cluster.mget(prefixedKeys);
      
      const parsed = results.map((serialized: string | null) => {
        if (!serialized) return null;
        
        try {
          const cacheEntry: CacheEntry = JSON.parse(serialized);
          return cacheEntry.value as T;
        } catch {
          return null;
        }
      });

      const hits = parsed.filter(result => result !== null).length;
      this.updateMetrics('mget', Date.now() - startTime, hits > 0, hits / keys.length);
      
      return parsed;

    } catch (error) {
      console.error('Failed to perform mget operation:', error);
      this.updateMetrics('mget', Date.now() - startTime, false);
      return keys.map(() => null);
    }
  }

  /**
   * Delete cache entry
   */
  async del(key: string): Promise<boolean> {
    try {
      const result = await this.cluster.del(this.prefixKey(key));
      return result > 0;
    } catch (error) {
      console.error(`Failed to delete cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async mdel(keys: string[]): Promise<number> {
    try {
      const prefixedKeys = keys.map(key => this.prefixKey(key));
      return await this.cluster.del(...prefixedKeys);
    } catch (error) {
      console.error('Failed to perform mdel operation:', error);
      return 0;
    }
  }

  /**
   * Clear cache by pattern/tags
   */
  async clearByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.cluster.keys(this.prefixKey(pattern));
      if (keys.length === 0) return 0;
      
      return await this.cluster.del(...keys);
    } catch (error) {
      console.error(`Failed to clear cache by pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Clear cache by tags
   */
  async clearByTags(tags: string[]): Promise<number> {
    try {
      // In production, implement tag-based indexing
      // For now, scan and filter by metadata
      const allKeys = await this.cluster.keys(this.prefixKey('*'));
      let deletedCount = 0;

      for (const key of allKeys) {
        const serialized = await this.cluster.get(key);
        if (!serialized) continue;

        try {
          const cacheEntry: CacheEntry = JSON.parse(serialized);
          const hasMatchingTag = cacheEntry.tags?.some(tag => tags.includes(tag));
          
          if (hasMatchingTag) {
            await this.cluster.del(key);
            deletedCount++;
          }
        } catch {
          // Skip invalid entries
        }
      }

      return deletedCount;
    } catch (error) {
      console.error(`Failed to clear cache by tags ${tags.join(', ')}:`, error);
      return 0;
    }
  }

  /**
   * Set with expiration time
   */
  async setWithExpiry(key: string, value: unknown, expirySeconds: number): Promise<boolean> {
    return this.set(key, value, { ttl: expirySeconds });
  }

  /**
   * Increment counter
   */
  async incr(key: string, increment: number = 1): Promise<number> {
    try {
      return await this.cluster.incrby(this.prefixKey(key), increment);
    } catch (error) {
      console.error(`Failed to increment key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Set expiration on existing key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.cluster.expire(this.prefixKey(key), seconds);
      return result === 1;
    } catch (error) {
      console.error(`Failed to set expiration on key ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.cluster.exists(this.prefixKey(key));
      return result === 1;
    } catch (error) {
      console.error(`Failed to check existence of key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL for key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.cluster.ttl(this.prefixKey(key));
    } catch (error) {
      console.error(`Failed to get TTL for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Get cluster metrics
   */
  getMetrics(): ClusterMetrics {
    return { ...this.metrics };
  }

  /**
   * Health check for all nodes
   */
  async healthCheck(): Promise<{ healthy: boolean; details: Record<string, any> }> {
    try {
      const details: Record<string, any> = {};
      
      // Check cluster info
      const info = await this.cluster.cluster('info');
      details.clusterInfo = info;
      
      // Check individual nodes
      for (const node of this.config.nodes) {
        const nodeKey = `${node.host}:${node.port}`;
        try {
          const ping = await this.cluster.ping();
          details[nodeKey] = { status: ping === 'PONG' ? 'healthy' : 'unhealthy', response: ping };
          this.metrics.nodeHealth[nodeKey] = ping === 'PONG' ? 'healthy' : 'unhealthy';
        } catch (error) {
          details[nodeKey] = { status: 'unhealthy', error: error.message };
          this.metrics.nodeHealth[nodeKey] = 'unhealthy';
        }
      }

      const allHealthy = Object.values(this.metrics.nodeHealth).every(status => status === 'healthy');
      
      return {
        healthy: allHealthy,
        details
      };

    } catch (error) {
      return {
        healthy: false,
        details: { error: error.message }
      };
    }
  }

  /**
   * Private helper methods
   */
  private prefixKey(key: string): string {
    return `${this.config.redisOptions.keyPrefix}${key}`;
  }

  private findMatchingPattern(key: string): CachePattern | undefined {
    for (const [pattern, config] of this.cachePatterns) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      if (regex.test(key)) {
        return config;
      }
    }
    return undefined;
  }

  private updateMetrics(operation: string, responseTime: number, success: boolean, hitRate?: number): void {
    this.metrics.totalRequests++;
    
    // Update average response time
    const totalTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1);
    this.metrics.averageResponseTime = (totalTime + responseTime) / this.metrics.totalRequests;
    
    if (operation === 'get' || operation === 'mget') {
      if (success) {
        const currentHits = this.metrics.hitRate * (this.metrics.totalRequests - 1);
        this.metrics.hitRate = (currentHits + (hitRate || 1)) / this.metrics.totalRequests;
      } else {
        const currentMisses = this.metrics.missRate * (this.metrics.totalRequests - 1);
        this.metrics.missRate = (currentMisses + 1) / this.metrics.totalRequests;
      }
    }
    
    if (!success) {
      this.metrics.errorRate++;
    }
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.healthCheck();
    }, 30000); // Every 30 seconds
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    try {
      await this.cluster.disconnect();
      console.log('Redis cluster disconnected successfully');
    } catch (error) {
      console.error('Error during Redis cluster shutdown:', error);
    }
  }
}

/**
 * Mock Redis cluster for development/testing
 */
class MockRedisCluster {
  private data: Map<string, string> = new Map();
  private expiry: Map<string, number> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(private config: RedisClusterConfig) {
    // Simulate connection delay
    setTimeout(() => {
      this.emit('connect');
    }, 100);
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  emit(event: string, ...args: Record<string, unknown>[]): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(...args));
  }

  async setex(key: string, seconds: number, value: string): Promise<string> {
    this.data.set(key, value);
    this.expiry.set(key, Date.now() + (seconds * 1000));
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    const expireTime = this.expiry.get(key);
    if (expireTime && Date.now() > expireTime) {
      this.data.delete(key);
      this.expiry.delete(key);
      return null;
    }
    return this.data.get(key) || null;
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    return Promise.all(keys.map(key => this.get(key)));
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0;
    keys.forEach(key => {
      if (this.data.delete(key)) {
        this.expiry.delete(key);
        deleted++;
      }
    });
    return deleted;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.data.keys()).filter(key => regex.test(key));
  }

  async incrby(key: string, increment: number): Promise<number> {
    const current = parseInt(this.data.get(key) || '0', 10);
    const newValue = current + increment;
    this.data.set(key, newValue.toString());
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (this.data.has(key)) {
      this.expiry.set(key, Date.now() + (seconds * 1000));
      return 1;
    }
    return 0;
  }

  async exists(key: string): Promise<number> {
    return this.data.has(key) ? 1 : 0;
  }

  async ttl(key: string): Promise<number> {
    const expireTime = this.expiry.get(key);
    if (!expireTime) return -1;
    const remaining = Math.floor((expireTime - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async cluster(command: string): Promise<string> {
    return 'cluster_state:ok\ncluster_slots_assigned:16384\ncluster_slots_ok:16384';
  }

  async disconnect(): Promise<void> {
    this.data.clear();
    this.expiry.clear();
  }
}

// Export default configuration
export const defaultRedisConfig: RedisClusterConfig = {
  nodes: [
    { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379') },
    { host: process.env.REDIS_HOST_2 || 'localhost', port: parseInt(process.env.REDIS_PORT_2 || '6380') },
    { host: process.env.REDIS_HOST_3 || 'localhost', port: parseInt(process.env.REDIS_PORT_3 || '6381') }
  ],
  maxRetries: 3,
  retryDelayOnFailover: 1000,
  enableReadyCheck: true,
  redisOptions: {
    password: process.env.REDIS_PASSWORD,
    db: 0,
    keyPrefix: 'diginativa:'
  },
  clusterOptions: {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
    scaleReads: 'slave'
  }
};

// Export singleton factory
let redisClusterInstance: RedisClusterService | null = null;

export function getRedisCluster(config?: Partial<RedisClusterConfig>): RedisClusterService {
  if (!redisClusterInstance) {
    redisClusterInstance = new RedisClusterService({
      ...defaultRedisConfig,
      ...config
    });
  }
  return redisClusterInstance;
}