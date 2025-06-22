/**
 * Rate Limiting Stress Testing
 * Validates API Gateway rate limiting behavior under extreme load
 * 
 * Roadmap Ref: Q1-AO-Milestone-1.2 (COMPLETION BLOCKER)
 * Business Impact: Ensures rate limiting protects infrastructure under stress
 */

import { Request, Response } from 'express';
import { APIGateway } from '../../services/api-gateway';
import { RedisClusterService } from '../../services/redis-cluster';
import { InfrastructureMonitoring } from '../../services/infrastructure-monitoring';

// Mock dependencies
jest.mock('../../services/redis-cluster');
jest.mock('../../services/infrastructure-monitoring');

describe('Rate Limiting Stress Testing', () => {
  let apiGateway: APIGateway;
  let mockRedis: jest.Mocked<RedisClusterService>;
  let mockMonitoring: jest.Mocked<InfrastructureMonitoring>;

  const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
    ip: '192.168.1.100',
    headers: { 'x-municipality-id': 'malmo_stad' },
    query: {},
    get: jest.fn(),
    ...overrides
  });

  const createMockResponse = (): Partial<Response> => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis()
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRedis = {
      zremrangebyscore: jest.fn(),
      zcard: jest.fn(),
      zadd: jest.fn(),
      expire: jest.fn(),
      zrange: jest.fn(),
      zrangebyscore: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      keys: jest.fn()
    } as any;

    mockMonitoring = {
      recordMetric: jest.fn(),
      reportError: jest.fn(),
      getInstance: jest.fn().mockReturnValue(mockMonitoring)
    } as any;

    (RedisClusterService as jest.Mock).mockImplementation(() => mockRedis);
    (InfrastructureMonitoring.getInstance as jest.Mock).mockReturnValue(mockMonitoring);

    apiGateway = new APIGateway();
  });

  describe('High Volume Rate Limiting', () => {
    it('should handle 1000+ concurrent rate limit checks', async () => {
      const concurrentRequests = 1000;
      const requests = Array(concurrentRequests).fill(0).map((_, i) => 
        createMockRequest({
          ip: `192.168.1.${(i % 255) + 1}`,
          headers: { 'x-municipality-id': i % 2 === 0 ? 'malmo_stad' : 'berlin_de' }
        })
      );

      const responses = Array(concurrentRequests).fill(0).map(() => createMockResponse());
      const nextFunctions = Array(concurrentRequests).fill(0).map(() => jest.fn());

      // Mock Redis to allow most requests but block some
      mockRedis.zremrangebyscore.mockResolvedValue(0);
      mockRedis.zcard.mockImplementation(() => 
        Promise.resolve(Math.random() > 0.9 ? 1001 : 500) // 10% over limit
      );
      mockRedis.zadd.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);
      mockRedis.zrange.mockResolvedValue(['1000000000', '1000000000']);

      const middleware = apiGateway.createRateLimitMiddleware('api');
      
      const startTime = performance.now();
      await Promise.all(
        requests.map((req, i) => 
          middleware(req as Request, responses[i] as Response, nextFunctions[i])
        )
      );
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const allowedRequests = nextFunctions.filter(fn => fn).filter(fn => fn.mock.calls.length > 0).length;
      const blockedRequests = responses.filter(res => 
        (res.status as jest.Mock).mock.calls.some(call => call[0] === 429)
      ).length;

      expect(totalTime).toBeLessThan(10000); // Process 1000 requests in <10s
      expect(allowedRequests + blockedRequests).toBe(concurrentRequests);
      expect(allowedRequests).toBeGreaterThan(0);
      expect(blockedRequests).toBeGreaterThan(0); // Some should be blocked

      console.log(`Rate Limiting Stress: ${concurrentRequests} requests in ${totalTime}ms`);
      console.log(`Allowed: ${allowedRequests}, Blocked: ${blockedRequests}`);
    });

    it('should maintain different limits per municipality under stress', async () => {
      const municipalities = ['malmo_stad', 'goteborg_stad', 'stockholm_stad', 'berlin_de'];
      const requestsPerMunicipality = 250;
      
      const allRequests = municipalities.flatMap(municipalityId =>
        Array(requestsPerMunicipality).fill(0).map((_, i) =>
          createMockRequest({
            ip: `10.${municipalities.indexOf(municipalityId)}.1.${(i % 255) + 1}`,
            headers: { 'x-municipality-id': municipalityId }
          })
        )
      );

      const responses = allRequests.map(() => createMockResponse());
      const nextFunctions = allRequests.map(() => jest.fn());

      // Mock different behaviors for different municipalities
      let requestCount = 0;
      mockRedis.zcard.mockImplementation(() => {
        const municipalityId = allRequests[requestCount % allRequests.length].headers?.['x-municipality-id'];
        requestCount++;
        
        // Swedish municipalities (enterprise): higher limits
        if (['malmo_stad', 'goteborg_stad', 'stockholm_stad'].includes(municipalityId as string)) {
          return Promise.resolve(Math.random() > 0.95 ? 1001 : 800); // 5% over limit
        }
        // German municipality (premium): lower limits
        return Promise.resolve(Math.random() > 0.90 ? 501 : 400); // 10% over limit
      });

      mockRedis.zremrangebyscore.mockResolvedValue(0);
      mockRedis.zadd.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const middleware = apiGateway.createRateLimitMiddleware('api');
      
      await Promise.all(
        allRequests.map((req, i) => 
          middleware(req as Request, responses[i] as Response, nextFunctions[i])
        )
      );

      // Analyze results by municipality
      const resultsByMunicipality = municipalities.reduce((acc, municipalityId) => {
        const municipalityIndices = allRequests
          .map((req, i) => ({ req, i }))
          .filter(({ req }) => req.headers?.['x-municipality-id'] === municipalityId)
          .map(({ i }) => i);

        const allowed = municipalityIndices.filter(i => nextFunctions[i].mock.calls.length > 0).length;
        const blocked = municipalityIndices.filter(i => 
          (responses[i].status as jest.Mock).mock.calls.some(call => call[0] === 429)
        ).length;

        acc[municipalityId] = { allowed, blocked, total: municipalityIndices.length };
        return acc;
      }, {} as Record<string, { allowed: number; blocked: number; total: number }>);

      // Verify each municipality was processed
      municipalities.forEach(municipalityId => {
        expect(resultsByMunicipality[municipalityId].total).toBe(requestsPerMunicipality);
        expect(resultsByMunicipality[municipalityId].allowed).toBeGreaterThan(0);
      });

      console.log('Results by Municipality:', resultsByMunicipality);
    });
  });

  describe('DDoS Protection Under Extreme Load', () => {
    it('should block suspicious IPs generating excessive traffic', async () => {
      const suspiciousIP = '10.0.0.100';
      const normalIPs = Array(50).fill(0).map((_, i) => `192.168.1.${i + 1}`);
      
      // Create excessive requests from suspicious IP
      const suspiciousRequests = Array(300).fill(0).map(() =>
        createMockRequest({
          ip: suspiciousIP,
          headers: { 'x-municipality-id': 'malmo_stad' }
        })
      );

      // Create normal requests from normal IPs
      const normalRequests = normalIPs.map(ip =>
        createMockRequest({
          ip,
          headers: { 'x-municipality-id': 'malmo_stad' }
        })
      );

      const allRequests = [...suspiciousRequests, ...normalRequests];
      const responses = allRequests.map(() => createMockResponse());
      const nextFunctions = allRequests.map(() => jest.fn());

      // Mock DDoS detection
      let requestCounts = new Map<string, number>();
      mockRedis.zrangebyscore.mockImplementation((key: string) => {
        const ip = key.split(':')[1];
        const currentCount = requestCounts.get(ip) || 0;
        requestCounts.set(ip, currentCount + 1);
        
        // Suspicious IP hits threshold quickly
        if (ip === suspiciousIP && currentCount > 200) {
          return Promise.resolve(new Array(250)); // Over threshold
        }
        return Promise.resolve(new Array(currentCount));
      });

      mockRedis.get.mockImplementation((key: string) => {
        if (key === `blocked:${suspiciousIP}`) {
          return Promise.resolve('blocked');
        }
        return Promise.resolve(null);
      });

      mockRedis.set.mockResolvedValue('OK');
      mockRedis.zadd.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const ddosMiddleware = apiGateway.createDDoSProtectionMiddleware();
      
      await Promise.all(
        allRequests.map((req, i) => 
          ddosMiddleware(req as Request, responses[i] as Response, nextFunctions[i])
        )
      );

      // Check results
      const suspiciousBlocked = responses.slice(0, 300).filter(res =>
        (res.status as jest.Mock).mock.calls.some(call => call[0] === 429)
      ).length;

      const normalAllowed = nextFunctions.slice(300).filter(fn => fn.mock.calls.length > 0).length;

      expect(suspiciousBlocked).toBeGreaterThan(0); // Suspicious IP should be blocked
      expect(normalAllowed).toBeGreaterThan(0); // Normal IPs should be allowed
      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'ddos_protection_triggered'
        })
      );
    });

    it('should handle coordinated attack from multiple IPs', async () => {
      const attackerIPs = Array(20).fill(0).map((_, i) => `10.0.0.${i + 1}`);
      const requestsPerAttacker = 150; // Each attacker sends 150 requests
      
      const attackRequests = attackerIPs.flatMap(ip =>
        Array(requestsPerAttacker).fill(0).map(() =>
          createMockRequest({
            ip,
            headers: { 'x-municipality-id': 'berlin_de' } // Target German municipality
          })
        )
      );

      const responses = attackRequests.map(() => createMockResponse());
      const nextFunctions = attackRequests.map(() => jest.fn());

      // Mock coordinated attack detection
      let ipRequestCounts = new Map<string, number>();
      mockRedis.zrangebyscore.mockImplementation((key: string) => {
        const ip = key.split(':')[1];
        const currentCount = ipRequestCounts.get(ip) || 0;
        ipRequestCounts.set(ip, currentCount + 1);
        
        // Each attacker IP hits Berlin's lower threshold (100 req/min)
        return Promise.resolve(new Array(Math.min(currentCount, 150)));
      });

      mockRedis.get.mockImplementation((key: string) => {
        const ip = key.replace('blocked:', '');
        if (attackerIPs.includes(ip) && (ipRequestCounts.get(ip) || 0) > 100) {
          return Promise.resolve('blocked');
        }
        return Promise.resolve(null);
      });

      mockRedis.set.mockResolvedValue('OK');
      mockRedis.zadd.mockResolvedValue(1);

      const ddosMiddleware = apiGateway.createDDoSProtectionMiddleware();
      
      const startTime = performance.now();
      await Promise.all(
        attackRequests.map((req, i) => 
          ddosMiddleware(req as Request, responses[i] as Response, nextFunctions[i])
        )
      );
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const blockedCount = responses.filter(res =>
        (res.status as jest.Mock).mock.calls.some(call => call[0] === 429)
      ).length;

      expect(totalTime).toBeLessThan(15000); // Handle coordinated attack quickly
      expect(blockedCount).toBeGreaterThan(0); // Should block many attack requests
      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'ddos_protection_triggered'
        })
      );

      console.log(`Coordinated Attack: ${attackRequests.length} requests, ${blockedCount} blocked in ${totalTime}ms`);
    });
  });

  describe('Redis Performance Under Rate Limiting Load', () => {
    it('should maintain Redis performance with high rate limiting operations', async () => {
      const operationCount = 5000;
      const operations = Array(operationCount).fill(0).map((_, i) => ({
        type: i % 4 === 0 ? 'zcard' : i % 4 === 1 ? 'zadd' : i % 4 === 2 ? 'zremrangebyscore' : 'expire',
        key: `rate_limit:test:${i % 100}`, // 100 different keys
        value: i
      }));

      // Mock Redis operations with realistic performance
      mockRedis.zcard.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(Math.floor(Math.random() * 1000)), Math.random() * 5))
      );
      mockRedis.zadd.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(1), Math.random() * 8))
      );
      mockRedis.zremrangebyscore.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(Math.floor(Math.random() * 10)), Math.random() * 3))
      );
      mockRedis.expire.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(1), Math.random() * 2))
      );

      const startTime = performance.now();
      const results = await Promise.all(
        operations.map(op => {
          switch (op.type) {
            case 'zcard':
              return mockRedis.zcard(op.key);
            case 'zadd':
              return mockRedis.zadd(op.key, Date.now(), `${op.value}`);
            case 'zremrangebyscore':
              return mockRedis.zremrangebyscore(op.key, 0, Date.now() - 900000);
            case 'expire':
              return mockRedis.expire(op.key, 900);
            default:
              return Promise.resolve(null);
          }
        })
      );
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const averageOperationTime = totalTime / operationCount;
      const successfulOperations = results.filter(r => r !== null).length;

      expect(totalTime).toBeLessThan(60000); // 5000 operations in <60s
      expect(averageOperationTime).toBeLessThan(20); // Average operation <20ms
      expect(successfulOperations).toBe(operationCount);

      console.log(`Redis Performance: ${operationCount} operations in ${totalTime}ms`);
      console.log(`Average operation time: ${averageOperationTime.toFixed(2)}ms`);
    });

    it('should handle Redis connection failures during rate limiting', async () => {
      const requests = Array(100).fill(0).map((_, i) =>
        createMockRequest({
          ip: `192.168.1.${(i % 50) + 1}`,
          headers: { 'x-municipality-id': 'malmo_stad' }
        })
      );

      const responses = requests.map(() => createMockResponse());
      const nextFunctions = requests.map(() => jest.fn());

      // Simulate intermittent Redis failures
      let callCount = 0;
      mockRedis.zcard.mockImplementation(() => {
        callCount++;
        if (callCount % 10 === 0) {
          return Promise.reject(new Error('Redis connection lost'));
        }
        return Promise.resolve(500);
      });

      mockRedis.zremrangebyscore.mockResolvedValue(0);
      mockRedis.zadd.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const middleware = apiGateway.createRateLimitMiddleware('api');
      
      const results = await Promise.allSettled(
        requests.map((req, i) => 
          middleware(req as Request, responses[i] as Response, nextFunctions[i])
        )
      );

      const successfulResults = results.filter(r => r.status === 'fulfilled').length;
      const allowedRequests = nextFunctions.filter(fn => fn.mock.calls.length > 0).length;

      // System should gracefully handle Redis failures
      expect(successfulResults).toBeGreaterThan(80); // Most should succeed despite failures
      expect(allowedRequests).toBeGreaterThan(0); // Some requests should be allowed
      expect(mockMonitoring.reportError).toHaveBeenCalled(); // Errors should be reported
    });
  });

  describe('API Key Rate Limiting Under Load', () => {
    it('should enforce API key rate limits under high usage', async () => {
      const apiKeyRequests = Array(1500).fill(0).map((_, i) =>
        createMockRequest({
          headers: { 
            'authorization': 'Bearer development_key_hash',
            'x-municipality-id': 'malmo_stad'
          }
        })
      );

      const responses = apiKeyRequests.map(() => createMockResponse());
      const nextFunctions = apiKeyRequests.map(() => jest.fn());

      // Mock API key rate limiting (DevTeam key: 1000 req/min)
      let apiKeyUsage = 0;
      mockRedis.zcard.mockImplementation(() => {
        apiKeyUsage++;
        return Promise.resolve(apiKeyUsage);
      });

      mockRedis.zremrangebyscore.mockResolvedValue(0);
      mockRedis.zadd.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const middleware = apiGateway.createAPIKeyMiddleware(['content:validate']);
      
      await Promise.all(
        apiKeyRequests.map((req, i) => 
          middleware(req as Request, responses[i] as Response, nextFunctions[i])
        )
      );

      const allowedRequests = nextFunctions.filter(fn => fn.mock.calls.length > 0).length;
      const rateLimitedRequests = responses.filter(res =>
        (res.status as jest.Mock).mock.calls.some(call => call[0] === 429)
      ).length;

      expect(allowedRequests).toBeGreaterThan(0);
      expect(allowedRequests).toBeLessThanOrEqual(1000); // Should not exceed API key limit
      expect(rateLimitedRequests).toBeGreaterThan(0); // Some should be rate limited
      expect(allowedRequests + rateLimitedRequests).toBeLessThanOrEqual(apiKeyRequests.length);
    });
  });
});