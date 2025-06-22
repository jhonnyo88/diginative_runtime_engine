/**
 * API Gateway Test Suite
 * Comprehensive testing for rate limiting, DDoS protection, and API key management
 * 
 * Roadmap Ref: Q1-Foundation-Autonomi-Milestone-1.1
 * Business Impact: Ensures enterprise-grade API protection
 */

import { Request, Response } from 'express';
import { APIGateway } from '../../services/api-gateway';
import { RedisClusterService } from '../../services/redis-cluster';
import { InfrastructureMonitoring } from '../../services/infrastructure-monitoring';

// Mock dependencies
jest.mock('../../services/redis-cluster');
jest.mock('../../services/infrastructure-monitoring');

describe('APIGateway', () => {
  let apiGateway: APIGateway;
  let mockRedis: jest.Mocked<RedisClusterService>;
  let mockMonitoring: jest.Mocked<InfrastructureMonitoring>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockRedis = {
      zrangebyscore: jest.fn(),
      zcard: jest.fn(),
      zremrangebyscore: jest.fn(),
      zadd: jest.fn(),
      expire: jest.fn(),
      zrange: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      ttl: jest.fn(),
      keys: jest.fn(),
      del: jest.fn()
    } as any;

    mockMonitoring = {
      recordMetric: jest.fn(),
      reportError: jest.fn(),
      getInstance: jest.fn().mockReturnValue(mockMonitoring)
    } as any;

    (RedisClusterService as jest.Mock).mockImplementation(() => mockRedis);
    (InfrastructureMonitoring.getInstance as jest.Mock).mockReturnValue(mockMonitoring);

    apiGateway = new APIGateway();

    // Setup request/response mocks
    mockReq = {
      ip: '192.168.1.100',
      headers: {},
      query: {},
      get: jest.fn()
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      mockReq.headers = { 'x-municipality-id': 'malmo_stad' };
    });

    it('should allow requests within rate limit', async () => {
      // Mock Redis responses for rate limit check
      mockRedis.zremrangebyscore.mockResolvedValue(0);
      mockRedis.zcard.mockResolvedValue(5); // 5 requests in window
      mockRedis.zadd.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const middleware = apiGateway.createRateLimitMiddleware('api');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'X-RateLimit-Limit': '1000',
          'X-RateLimit-Remaining': expect.any(String)
        })
      );
    });

    it('should block requests exceeding rate limit', async () => {
      // Mock Redis responses for exceeded rate limit
      mockRedis.zremrangebyscore.mockResolvedValue(0);
      mockRedis.zcard.mockResolvedValue(1000); // At limit
      mockRedis.zrange.mockResolvedValue(['1000000000', '1000000000']);

      const middleware = apiGateway.createRateLimitMiddleware('api');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Rate limit exceeded'
        })
      );
    });

    it('should use municipality-specific rate limits', async () => {
      // Test Berlin (German municipality) with stricter limits
      mockReq.headers = { 'x-municipality-id': 'berlin_de' };
      mockRedis.zremrangebyscore.mockResolvedValue(0);
      mockRedis.zcard.mockResolvedValue(450);

      const middleware = apiGateway.createRateLimitMiddleware('api');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'X-RateLimit-Limit': '500' // Berlin's lower limit
        })
      );
    });

    it('should handle validation endpoint rate limiting', async () => {
      mockRedis.zremrangebyscore.mockResolvedValue(0);
      mockRedis.zcard.mockResolvedValue(50);

      const middleware = apiGateway.createRateLimitMiddleware('validation');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedis.zadd).toHaveBeenCalledWith(
        expect.stringContaining('validation:malmo_stad'),
        expect.any(Number),
        expect.any(String)
      );
    });

    it('should record rate limit violations in monitoring', async () => {
      mockRedis.zcard.mockResolvedValue(1000);
      mockRedis.zrange.mockResolvedValue(['1000000000', '1000000000']);

      const middleware = apiGateway.createRateLimitMiddleware('api');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'api_rate_limit_exceeded',
          value: 1,
          tags: expect.objectContaining({
            municipalityId: 'malmo_stad',
            limitType: 'api'
          })
        })
      );
    });
  });

  describe('DDoS Protection', () => {
    it('should allow normal traffic', async () => {
      mockReq.headers = { 'x-municipality-id': 'malmo_stad' };
      mockRedis.zrangebyscore.mockResolvedValue(new Array(50)); // Normal traffic
      mockRedis.get.mockResolvedValue(null); // Not blocked

      const middleware = apiGateway.createDDoSProtectionMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedis.zadd).toHaveBeenCalled();
    });

    it('should block suspicious traffic', async () => {
      mockReq.headers = { 'x-municipality-id': 'malmo_stad' };
      mockRedis.zrangebyscore.mockResolvedValue(new Array(250)); // Suspicious traffic
      mockRedis.get.mockResolvedValue(null);

      const middleware = apiGateway.createDDoSProtectionMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Too many requests detected')
        })
      );
      expect(mockRedis.set).toHaveBeenCalledWith(
        'blocked:192.168.1.100',
        'blocked',
        expect.any(Number)
      );
    });

    it('should block already blocked IPs', async () => {
      mockRedis.get.mockResolvedValue('blocked');
      mockRedis.ttl.mockResolvedValue(300);

      const middleware = apiGateway.createDDoSProtectionMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Access blocked')
        })
      );
    });

    it('should record DDoS protection triggers', async () => {
      mockReq.headers = { 'x-municipality-id': 'berlin_de' };
      mockRedis.zrangebyscore.mockResolvedValue(new Array(150)); // Exceeds Berlin's threshold

      const middleware = apiGateway.createDDoSProtectionMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'ddos_protection_triggered',
          tags: expect.objectContaining({
            municipalityId: 'berlin_de',
            requestCount: '150'
          })
        })
      );
    });
  });

  describe('API Key Management', () => {
    it('should validate DevTeam API key', async () => {
      mockReq.headers = { authorization: 'Bearer development_key_hash' };
      mockRedis.zcard.mockResolvedValue(10);

      const middleware = apiGateway.createAPIKeyMiddleware(['content:validate']);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).apiKey).toBeDefined();
    });

    it('should reject invalid API key', async () => {
      mockReq.headers = { authorization: 'Bearer invalid_key' };

      const middleware = apiGateway.createAPIKeyMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid API key'
        })
      );
    });

    it('should check API key permissions', async () => {
      mockReq.headers = { authorization: 'Bearer development_key_hash' };
      mockRedis.zcard.mockResolvedValue(5);

      const middleware = apiGateway.createAPIKeyMiddleware(['admin:security']);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Insufficient permissions'
        })
      );
    });

    it('should enforce API key rate limits', async () => {
      mockReq.headers = { authorization: 'Bearer development_key_hash' };
      mockRedis.zcard.mockResolvedValue(1001); // Exceeds DevTeam limit

      const middleware = apiGateway.createAPIKeyMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'API key rate limit exceeded'
        })
      );
    });

    it('should handle X-API-Key header', async () => {
      mockReq.headers = { 'x-api-key': 'development_key_hash' };
      mockRedis.zcard.mockResolvedValue(10);

      const middleware = apiGateway.createAPIKeyMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle API key in query parameter', async () => {
      mockReq.query = { apiKey: 'development_key_hash' };
      mockRedis.zcard.mockResolvedValue(10);

      const middleware = apiGateway.createAPIKeyMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Municipality ID Extraction', () => {
    it('should extract from X-Municipality-ID header', async () => {
      mockReq.headers = { 'x-municipality-id': 'stockholm_stad' };
      mockRedis.zcard.mockResolvedValue(10);

      const middleware = apiGateway.createRateLimitMiddleware('api');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRedis.zadd).toHaveBeenCalledWith(
        expect.stringContaining('stockholm_stad'),
        expect.any(Number),
        expect.any(String)
      );
    });

    it('should extract from query parameter', async () => {
      mockReq.query = { municipalityId: 'goteborg_stad' };
      mockRedis.zcard.mockResolvedValue(10);

      const middleware = apiGateway.createRateLimitMiddleware('api');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRedis.zadd).toHaveBeenCalledWith(
        expect.stringContaining('goteborg_stad'),
        expect.any(Number),
        expect.any(String)
      );
    });

    it('should use default profile for unknown municipality', async () => {
      mockReq.headers = { 'x-municipality-id': 'unknown_municipality' };
      mockRedis.zcard.mockResolvedValue(50);

      const middleware = apiGateway.createRateLimitMiddleware('api');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'X-RateLimit-Limit': '100' // Default limit
        })
      );
    });
  });

  describe('Statistics and Management', () => {
    it('should calculate rate limit statistics', async () => {
      mockRedis.keys.mockResolvedValue([
        'api:malmo_stad:192.168.1.1',
        'validation:malmo_stad:192.168.1.2',
        'blocked:192.168.1.100',
        'devteam:api_001'
      ]);
      
      mockRedis.zcard
        .mockResolvedValueOnce(25) // api requests
        .mockResolvedValueOnce(10) // validation requests
        .mockResolvedValueOnce(50); // devteam requests

      const stats = await apiGateway.getRateLimitStats('malmo_stad');

      expect(stats).toEqual({
        requests: 35,
        blocked: 0,
        apiKeyUsage: { devteam: 50 },
        ddosBlocks: 1
      });
    });

    it('should create new API keys', async () => {
      const result = await apiGateway.createAPIKey({
        permissions: ['content:validate'],
        isActive: true,
        rateLimit: {
          windowMs: 60000,
          maxRequests: 100,
          keyGenerator: () => 'test',
          skipSuccessfulRequests: true,
          skipFailedRequests: false
        }
      });

      expect(result.keyId).toMatch(/^api_\d+_/);
      expect(result.apiKey).toMatch(/^dk_/);
    });

    it('should update municipality profiles', async () => {
      const result = apiGateway.updateMunicipalityProfile('malmo_stad', {
        tier: 'premium'
      });

      expect(result).toBe(true);
    });

    it('should reject updates for unknown municipalities', async () => {
      const result = apiGateway.updateMunicipalityProfile('unknown_municipality', {
        tier: 'premium'
      });

      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle Redis connection errors gracefully', async () => {
      mockRedis.zcard.mockRejectedValue(new Error('Redis connection failed'));

      const middleware = apiGateway.createRateLimitMiddleware('api');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled(); // Should allow request on error
      expect(mockMonitoring.reportError).toHaveBeenCalled();
    });

    it('should handle DDoS protection errors gracefully', async () => {
      mockRedis.zrangebyscore.mockRejectedValue(new Error('Redis error'));

      const middleware = apiGateway.createDDoSProtectionMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled(); // Should allow request on error
      expect(mockMonitoring.reportError).toHaveBeenCalled();
    });
  });

  describe('Municipal-Specific Configurations', () => {
    it('should apply Swedish municipality configuration', async () => {
      mockReq.headers = { 'x-municipality-id': 'malmo_stad' };
      mockRedis.zcard.mockResolvedValue(500);

      const middleware = apiGateway.createRateLimitMiddleware('api');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'X-RateLimit-Limit': '1000' // Swedish enterprise limit
        })
      );
    });

    it('should apply German municipality configuration', async () => {
      mockReq.headers = { 'x-municipality-id': 'berlin_de' };
      mockRedis.zcard.mockResolvedValue(250);

      const middleware = apiGateway.createRateLimitMiddleware('api');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'X-RateLimit-Limit': '500' // German premium limit
        })
      );
    });

    it('should use different DDoS thresholds by municipality', async () => {
      // Test Berlin's more conservative DDoS protection
      mockReq.headers = { 'x-municipality-id': 'berlin_de' };
      mockRedis.zrangebyscore.mockResolvedValue(new Array(105)); // Just over Berlin's threshold
      mockRedis.get.mockResolvedValue(null);

      const middleware = apiGateway.createDDoSProtectionMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: expect.objectContaining({
            threshold: '100' // Berlin's threshold
          })
        })
      );
    });
  });
});