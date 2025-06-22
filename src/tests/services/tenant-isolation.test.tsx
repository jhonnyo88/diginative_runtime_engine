/**
 * Municipal Tenant Isolation Testing
 * Comprehensive testing for government-grade tenant separation
 * 
 * Roadmap Ref: Q2-Scaling-Infrastructure (proposal-028)
 * Business Impact: Validates 100+ municipality scaling security
 */

import { Request, Response } from 'express';
import { 
  TenantRedisService, 
  TenantSecurityValidator, 
  GDPRComplianceTenantManager,
  tenantContextMiddleware,
  TenantAwareService,
  TenantCacheKeys
} from '../tenant-isolation';
import { RedisClusterService } from '../redis-cluster';
import { InfrastructureMonitoring } from '../infrastructure-monitoring';

// Mock dependencies
jest.mock('../redis-cluster');
jest.mock('../infrastructure-monitoring');

describe('Municipal Tenant Isolation', () => {
  let tenantRedis: TenantRedisService;
  let securityValidator: TenantSecurityValidator;
  let gdprManager: GDPRComplianceTenantManager;
  let mockRedis: jest.Mocked<RedisClusterService>;
  let mockMonitoring: jest.Mocked<InfrastructureMonitoring>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      mget: jest.fn(),
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

    tenantRedis = new TenantRedisService();
    securityValidator = new TenantSecurityValidator();
    gdprManager = new GDPRComplianceTenantManager();
  });

  describe('TenantRedisService', () => {
    describe('Namespace Isolation', () => {
      it('should create tenant-specific keys with proper namespace', async () => {
        mockRedis.get.mockResolvedValue('test_value');
        
        await tenantRedis.get('malmo_stad', 'test_key');
        
        expect(mockRedis.get).toHaveBeenCalledWith('tenant:malmo_stad:test_key');
        expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'tenant_cache_access',
            tags: expect.objectContaining({
              municipality_id: 'malmo_stad',
              operation: 'get'
            })
          })
        );
      });

      it('should reject invalid municipality IDs', async () => {
        const invalidIds = ['MALMO_STAD', 'malmö-stad', 'malmo stad', 'a'.repeat(51), '123'];
        
        for (const invalidId of invalidIds) {
          await expect(tenantRedis.get(invalidId, 'test_key'))
            .rejects.toThrow('Invalid municipality ID format');
        }
      });

      it('should accept valid municipality IDs', async () => {
        mockRedis.get.mockResolvedValue('test_value');
        const validIds = ['malmo_stad', 'berlin_de', 'test123', 'a_b_c'];
        
        for (const validId of validIds) {
          await expect(tenantRedis.get(validId, 'test_key'))
            .resolves.toBe('test_value');
        }
      });
    });

    describe('Cache Operations', () => {
      it('should perform SET operations with tenant isolation', async () => {
        mockRedis.set.mockResolvedValue('OK');
        
        await tenantRedis.set('goteborg_stad', 'session_123', 'session_data');
        
        expect(mockRedis.set).toHaveBeenCalledWith(
          'tenant:goteborg_stad:session_123',
          'session_data'
        );
      });

      it('should perform SET with TTL operations', async () => {
        mockRedis.setex.mockResolvedValue('OK');
        
        await tenantRedis.set('stockholm_stad', 'temp_data', 'value', 3600);
        
        expect(mockRedis.setex).toHaveBeenCalledWith(
          'tenant:stockholm_stad:temp_data',
          3600,
          'value'
        );
      });

      it('should perform bulk GET operations with tenant isolation', async () => {
        mockRedis.mget.mockResolvedValue(['value1', 'value2', null]);
        
        const results = await tenantRedis.mget('berlin_de', ['key1', 'key2', 'key3']);
        
        expect(mockRedis.mget).toHaveBeenCalledWith(
          'tenant:berlin_de:key1',
          'tenant:berlin_de:key2',
          'tenant:berlin_de:key3'
        );
        expect(results).toEqual(['value1', 'value2', null]);
      });
    });

    describe('Tenant Data Management', () => {
      it('should list tenant keys without namespace prefix', async () => {
        mockRedis.keys.mockResolvedValue([
          'tenant:malmo_stad:session_123',
          'tenant:malmo_stad:config_branding',
          'tenant:malmo_stad:ai_content_456'
        ]);
        
        const keys = await tenantRedis.getTenantKeys('malmo_stad');
        
        expect(keys).toEqual([
          'session_123',
          'config_branding',
          'ai_content_456'
        ]);
      });

      it('should delete all tenant data in batches', async () => {
        const tenantKeys = Array(250).fill(0).map((_, i) => `tenant:test_municipality:key_${i}`);
        mockRedis.keys.mockResolvedValue(tenantKeys);
        mockRedis.del.mockResolvedValue(100); // Mock 100 keys deleted per batch
        
        const deletedCount = await tenantRedis.deleteTenantData('test_municipality');
        
        expect(mockRedis.keys).toHaveBeenCalledWith('tenant:test_municipality:*');
        expect(mockRedis.del).toHaveBeenCalledTimes(3); // 250 keys / 100 batch size = 3 batches
        expect(deletedCount).toBe(300); // 3 batches * 100 deleted per batch
      });

      it('should handle empty tenant data deletion', async () => {
        mockRedis.keys.mockResolvedValue([]);
        
        const deletedCount = await tenantRedis.deleteTenantData('empty_municipality');
        
        expect(deletedCount).toBe(0);
        expect(mockRedis.del).not.toHaveBeenCalled();
      });
    });
  });

  describe('TenantSecurityValidator', () => {
    describe('Response Data Validation', () => {
      it('should allow single object with correct municipality ID', async () => {
        const data = {
          id: 'content_123',
          municipality_id: 'malmo_stad',
          content: 'test data'
        };
        
        await expect(securityValidator.validateResponseData(data, 'malmo_stad'))
          .resolves.toBe(true);
      });

      it('should reject single object with different municipality ID', async () => {
        const data = {
          id: 'content_123',
          municipality_id: 'berlin_de',
          content: 'test data'
        };
        
        await expect(securityValidator.validateResponseData(data, 'malmo_stad'))
          .rejects.toThrow('Response contains cross-tenant data');
          
        expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'tenant_security_violation',
            tags: expect.objectContaining({
              violation_type: 'response_data_cross_tenant'
            })
          })
        );
      });

      it('should validate array data for tenant isolation', async () => {
        const validData = [
          { id: '1', municipality_id: 'goteborg_stad' },
          { id: '2', municipality_id: 'goteborg_stad' },
          { id: '3', municipality_id: 'goteborg_stad' }
        ];
        
        await expect(securityValidator.validateResponseData(validData, 'goteborg_stad'))
          .resolves.toBe(true);
      });

      it('should reject array containing cross-tenant data', async () => {
        const invalidData = [
          { id: '1', municipality_id: 'goteborg_stad' },
          { id: '2', municipality_id: 'stockholm_stad' }, // Cross-tenant violation
          { id: '3', municipality_id: 'goteborg_stad' }
        ];
        
        await expect(securityValidator.validateResponseData(invalidData, 'goteborg_stad'))
          .rejects.toThrow('Response contains cross-tenant data');
      });

      it('should allow data without municipality_id field', async () => {
        const data = { id: 'content_123', content: 'test data' };
        
        await expect(securityValidator.validateResponseData(data, 'malmo_stad'))
          .resolves.toBe(true);
      });
    });

    describe('File Access Validation', () => {
      it('should allow file paths with correct municipality isolation', async () => {
        const validPaths = [
          '/uploads/malmo_stad/documents/file.pdf',
          '/cache/malmo_stad/images/logo.png',
          '/data/malmo_stad/export.json'
        ];
        
        for (const path of validPaths) {
          await expect(securityValidator.validateFileAccess(path, 'malmo_stad'))
            .resolves.toBe(true);
        }
      });

      it('should reject file paths without municipality isolation', async () => {
        const invalidPaths = [
          '/uploads/berlin_de/documents/file.pdf',
          '/shared/documents/file.pdf',
          '/cache/file.png'
        ];
        
        for (const path of invalidPaths) {
          await expect(securityValidator.validateFileAccess(path, 'malmo_stad'))
            .rejects.toThrow('Cross-tenant file access denied');
        }
      });
    });
  });

  describe('Tenant Context Middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
      req = {
        headers: {},
        query: {},
        samlUser: undefined
      } as any;
      
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis()
      };
      
      next = jest.fn();
    });

    it('should extract municipality ID from headers', async () => {
      req.headers = { 'x-municipality-id': 'malmo_stad' };
      
      const middleware = tenantContextMiddleware();
      await middleware(req as Request, res as Response, next);
      
      expect((req as any).tenantContext).toEqual(
        expect.objectContaining({
          municipalityId: 'malmo_stad',
          municipalityName: 'Malmö Stad'
        })
      );
      expect(next).toHaveBeenCalled();
    });

    it('should extract municipality ID from query parameters', async () => {
      req.query = { municipalityId: 'berlin_de' };
      
      const middleware = tenantContextMiddleware();
      await middleware(req as Request, res as Response, next);
      
      expect((req as any).tenantContext).toEqual(
        expect.objectContaining({
          municipalityId: 'berlin_de',
          municipalityName: 'Stadt Berlin'
        })
      );
    });

    it('should extract municipality ID from SAML user context', async () => {
      (req as any).samlUser = { municipalityId: 'stockholm_stad' };
      
      const middleware = tenantContextMiddleware();
      await middleware(req as Request, res as Response, next);
      
      expect((req as any).tenantContext).toEqual(
        expect.objectContaining({
          municipalityId: 'stockholm_stad',
          municipalityName: 'Stockholms Stad'
        })
      );
    });

    it('should reject requests without municipality context', async () => {
      const middleware = tenantContextMiddleware();
      await middleware(req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Municipality context required'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid municipality ID formats', async () => {
      req.headers = { 'x-municipality-id': 'INVALID-FORMAT!' };
      
      const middleware = tenantContextMiddleware();
      await middleware(req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid municipality ID format'
        })
      );
    });

    it('should reject unknown municipalities', async () => {
      req.headers = { 'x-municipality-id': 'unknown_municipality' };
      
      const middleware = tenantContextMiddleware();
      await middleware(req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Municipality not found or inactive'
        })
      );
    });
  });

  describe('TenantAwareService Base Class', () => {
    class TestTenantService extends TenantAwareService {
      async testValidateAccess(
        requestMunicipalityId: string,
        resourceMunicipalityId: string,
        userId: string,
        action: string
      ) {
        return this.validateTenantAccess(requestMunicipalityId, resourceMunicipalityId, userId, action);
      }
      
      testValidateQuery(query: string, params: any[], expectedMunicipalityId: string) {
        return this.validateQueryTenantFilter(query, params, expectedMunicipalityId);
      }
    }

    let testService: TestTenantService;

    beforeEach(() => {
      testService = new TestTenantService();
    });

    it('should allow same-tenant access', async () => {
      await expect(testService.testValidateAccess(
        'malmo_stad',
        'malmo_stad',
        'user123',
        'read_content'
      )).resolves.toBeUndefined();
    });

    it('should block cross-tenant access', async () => {
      await expect(testService.testValidateAccess(
        'malmo_stad',
        'berlin_de',
        'user123',
        'read_content'
      )).rejects.toThrow('Cross-tenant access denied');
      
      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'tenant_security_violation'
        })
      );
    });

    it('should validate queries include municipality_id filter', () => {
      const validQuery = 'SELECT * FROM ai_content WHERE municipality_id = ? AND content_id = ?';
      const params = ['malmo_stad', 'content_123'];
      
      expect(() => testService.testValidateQuery(validQuery, params, 'malmo_stad'))
        .not.toThrow();
    });

    it('should reject queries without municipality_id filter', () => {
      const invalidQuery = 'SELECT * FROM ai_content WHERE content_id = ?';
      const params = ['content_123'];
      
      expect(() => testService.testValidateQuery(invalidQuery, params, 'malmo_stad'))
        .toThrow('Database query missing required tenant isolation filter');
    });

    it('should validate municipality parameter matches expected', () => {
      const query = 'SELECT * FROM ai_content WHERE municipality_id = ? AND content_id = ?';
      const invalidParams = ['berlin_de', 'content_123']; // Wrong municipality
      
      expect(() => testService.testValidateQuery(query, invalidParams, 'malmo_stad'))
        .toThrow('Municipality ID parameter missing or invalid in query');
    });
  });

  describe('GDPR Compliance Manager', () => {
    describe('Data Export', () => {
      it('should export tenant data with proper isolation', async () => {
        mockRedis.keys.mockResolvedValue([
          'tenant:malmo_stad:session_123',
          'tenant:malmo_stad:content_456'
        ]);
        mockRedis.get.mockResolvedValueOnce('session_data').mockResolvedValueOnce('content_data');
        
        const result = await gdprManager.processTenantDataRequest('malmo_stad', 'export');
        
        expect(result.success).toBe(true);
        expect(result.exportedRecords).toBe(2);
        expect(result.data).toHaveProperty('cacheData');
      });

      it('should handle export for specific subject', async () => {
        const result = await gdprManager.processTenantDataRequest(
          'berlin_de', 
          'export', 
          'user123'
        );
        
        expect(result.success).toBe(true);
        expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'gdpr_compliance_action',
            tags: expect.objectContaining({
              action_type: 'data_export'
            })
          })
        );
      });
    });

    describe('Data Deletion', () => {
      it('should delete tenant data and cache', async () => {
        mockRedis.keys.mockResolvedValue(['tenant:test_municipality:key1', 'tenant:test_municipality:key2']);
        mockRedis.del.mockResolvedValue(2);
        
        const result = await gdprManager.processTenantDataRequest('test_municipality', 'delete');
        
        expect(result.success).toBe(true);
        expect(result.deletedCacheKeys).toBe(2);
      });
    });

    describe('Error Handling', () => {
      it('should handle errors gracefully and report them', async () => {
        mockRedis.keys.mockRejectedValue(new Error('Redis connection failed'));
        
        const result = await gdprManager.processTenantDataRequest('malmo_stad', 'export');
        
        expect(result.success).toBe(false);
        expect(result.message).toContain('Failed to process export request');
        expect(mockMonitoring.reportError).toHaveBeenCalled();
      });
    });
  });

  describe('Cache Key Patterns', () => {
    it('should generate consistent cache keys', () => {
      expect(TenantCacheKeys.AI_CONTENT('content_123')).toBe('ai_content:content_123');
      expect(TenantCacheKeys.GAME_SESSION('session_456')).toBe('game_session:session_456');
      expect(TenantCacheKeys.BRANDING()).toBe('branding:active');
      expect(TenantCacheKeys.USER_SESSION('user_789')).toBe('user_session:user_789');
    });

    it('should generate date-based metric keys', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(TenantCacheKeys.METRICS('performance')).toBe(`metrics:performance:${today}`);
    });
  });

  describe('Integration Testing', () => {
    it('should maintain tenant isolation across full request cycle', async () => {
      // Simulate full request with tenant context
      const req = {
        headers: { 'x-municipality-id': 'malmo_stad' },
        params: { contentId: 'content_123' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis()
      } as any;
      
      const next = jest.fn();
      
      // Apply tenant middleware
      const middleware = tenantContextMiddleware();
      await middleware(req, res, next);
      
      // Verify tenant context is properly set
      expect(req.tenantContext).toEqual(
        expect.objectContaining({
          municipalityId: 'malmo_stad',
          municipalityName: 'Malmö Stad'
        })
      );
      
      // Verify response headers include tenant information
      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'X-Tenant-Municipality': 'malmo_stad'
        })
      );
    });
  });
});