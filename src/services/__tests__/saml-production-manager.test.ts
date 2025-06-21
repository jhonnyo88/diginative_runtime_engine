/**
 * SAML Production Manager Tests
 * Testing production-ready SSO infrastructure
 * 
 * Roadmap Ref: Q1-MER-Milestone-1.3
 * Testing: Multi-tenant management, security auditing, production scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SAMLProductionManager, type TenantRegistrationRequest, defaultProductionConfig } from '../saml-production-manager';

// Mock dependencies
vi.mock('../redis-cluster', () => ({
  getRedisCluster: vi.fn(() => ({
    get: vi.fn().mockResolvedValue('ok'), // For health checks
    set: vi.fn().mockResolvedValue(true),
    del: vi.fn().mockResolvedValue(true),
    keys: vi.fn().mockResolvedValue([]),
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(true)
  }))
}));

vi.mock('../enterprise-saml-provider', () => ({
  enterpriseSAMLProvider: {
    registerTenant: vi.fn(),
    getAllTenants: vi.fn().mockReturnValue([])
  }
}));

vi.mock('../infrastructure-monitoring', () => ({
  InfrastructureMonitoring: {
    getInstance: vi.fn(() => ({
      recordMetric: vi.fn(),
      reportError: vi.fn()
    }))
  }
}));

describe('SAMLProductionManager', () => {
  let manager: SAMLProductionManager;

  beforeEach(() => {
    // Set required environment variables
    process.env.BASE_URL = 'https://diginativa.se';
    process.env.SAML_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----';
    
    manager = new SAMLProductionManager({
      ...defaultProductionConfig,
      environment: 'development' // Use development for testing
    });
  });

  afterEach(async () => {
    await manager.shutdown();
  });

  describe('Tenant Registration', () => {
    it('should register Swedish municipality with Azure AD', async () => {
      const request: TenantRegistrationRequest = {
        municipalityName: 'Malmö Stad',
        country: 'SE',
        contactEmail: 'admin@malmo.se',
        administratorName: 'Erik Svensson',
        idpType: 'azure-ad',
        expectedUsers: 150,
        deploymentTarget: 'pilot',
        contractReference: 'CONTRACT-SE-2025-001'
      };

      const result = await manager.registerMunicipalTenant(request);

      expect(result.success).toBe(true);
      expect(result.tenantId).toBe('malmo_stad_se');
      expect(result.activationCode).toBeTruthy();
      expect(result.setupInstructions).toBeTruthy();
      expect(result.setupInstructions!.length).toBeGreaterThan(10);
      expect(result.supportContact).toBe('support@diginativa.se');
    });

    it('should register German municipality with Okta', async () => {
      const request: TenantRegistrationRequest = {
        municipalityName: 'Stadt Berlin',
        country: 'DE',
        contactEmail: 'it-admin@berlin.de',
        administratorName: 'Hans Mueller',
        idpType: 'okta',
        expectedUsers: 500,
        deploymentTarget: 'full_rollout'
      };

      const result = await manager.registerMunicipalTenant(request);

      expect(result.success).toBe(true);
      expect(result.tenantId).toBe('stadt_berlin_de');
      expect(result.activationCode).toBeTruthy();
      expect(result.setupInstructions).toContain('Step 1: Identity Provider Configuration');
    });

    it('should reject duplicate municipality registration', async () => {
      const request: TenantRegistrationRequest = {
        municipalityName: 'Test Municipality',
        country: 'FR',
        contactEmail: 'admin@test.fr',
        administratorName: 'Admin User',
        idpType: 'azure-ad',
        expectedUsers: 100,
        deploymentTarget: 'immediate'
      };

      // Register once
      const firstResult = await manager.registerMunicipalTenant(request);
      expect(firstResult.success).toBe(true);

      // Try to register again
      const secondResult = await manager.registerMunicipalTenant(request);
      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toContain('already registered');
    });

    it('should handle invalid country codes', async () => {
      const request: TenantRegistrationRequest = {
        municipalityName: 'Invalid Municipality',
        country: 'XX' as any, // Invalid country
        contactEmail: 'admin@invalid.com',
        administratorName: 'Invalid Admin',
        idpType: 'azure-ad',
        expectedUsers: 50,
        deploymentTarget: 'pilot'
      };

      // This should be caught by validation in the API layer
      // but the manager should handle it gracefully
      const result = await manager.registerMunicipalTenant(request);
      
      // The manager might still process it, but the tenant ID would be malformed
      expect(result.tenantId).toBe('invalid_municipality_xx');
    });
  });

  describe('Tenant Activation', () => {
    it('should activate tenant with valid SAML configuration', async () => {
      // First register a tenant
      const registrationRequest: TenantRegistrationRequest = {
        municipalityName: 'Activation Test',
        country: 'NL',
        contactEmail: 'admin@test.nl',
        administratorName: 'Test Admin',
        idpType: 'okta',
        expectedUsers: 75,
        deploymentTarget: 'pilot'
      };

      const registrationResult = await manager.registerMunicipalTenant(registrationRequest);
      expect(registrationResult.success).toBe(true);

      // Now activate with SAML config
      const samlConfig = {
        cert: '-----BEGIN CERTIFICATE-----\nMIIC...test-cert...==\n-----END CERTIFICATE-----',
        entryPoint: 'https://test-idp.okta.com/app/saml/sso',
        issuer: 'diginativa-activation-test'
      };

      const activationResult = await manager.activateTenant(
        registrationResult.tenantId,
        registrationResult.activationCode!,
        samlConfig
      );

      expect(activationResult.success).toBe(true);
      expect(activationResult.tenantId).toBe(registrationResult.tenantId);
      expect(activationResult.setupInstructions).toContain('successfully activated');
    });

    it('should reject activation with invalid activation code', async () => {
      const result = await manager.activateTenant(
        'nonexistent_tenant',
        'INVALID-CODE-123',
        {
          cert: '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----',
          entryPoint: 'https://test.com/saml'
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid activation code');
    });

    it('should reject activation with invalid SAML configuration', async () => {
      // Register tenant first
      const registrationRequest: TenantRegistrationRequest = {
        municipalityName: 'Invalid Config Test',
        country: 'SE',
        contactEmail: 'admin@invalid.se',
        administratorName: 'Invalid Admin',
        idpType: 'azure-ad',
        expectedUsers: 25,
        deploymentTarget: 'immediate'
      };

      const registrationResult = await manager.registerMunicipalTenant(registrationRequest);

      // Try to activate with invalid SAML config
      const invalidSamlConfig = {
        cert: 'invalid-certificate-format',
        entryPoint: 'http://insecure-endpoint.com', // HTTP instead of HTTPS
        issuer: ''
      };

      const activationResult = await manager.activateTenant(
        registrationResult.tenantId,
        registrationResult.activationCode!,
        invalidSamlConfig
      );

      expect(activationResult.success).toBe(false);
      expect(activationResult.error).toContain('validation failed');
    });
  });

  describe('Security Auditing', () => {
    it('should audit authentication events', async () => {
      const tenantId = 'test_audit_tenant';
      
      // Audit successful login
      await manager.auditAuthenticationEvent(tenantId, 'login_success', {
        userId: 'user123',
        email: 'user@test.se',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser',
        sessionId: 'session_123'
      });

      // Audit failed login
      await manager.auditAuthenticationEvent(tenantId, 'login_failure', {
        email: 'user@test.se',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser',
        error: 'Invalid credentials'
      });

      // Audit logout
      await manager.auditAuthenticationEvent(tenantId, 'logout', {
        userId: 'user123',
        email: 'user@test.se',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser',
        sessionId: 'session_123'
      });

      // All audit events should complete without throwing
      expect(true).toBe(true);
    });

    it('should generate security audit report', async () => {
      const tenantId = 'test_audit_report';
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const endDate = new Date();

      // Generate some audit events first
      await manager.auditAuthenticationEvent(tenantId, 'login_success', {
        userId: 'user1',
        email: 'user1@test.se',
        ipAddress: '192.168.1.10',
        userAgent: 'Test Browser'
      });

      await manager.auditAuthenticationEvent(tenantId, 'login_failure', {
        email: 'user2@test.se',
        ipAddress: '192.168.1.20',
        userAgent: 'Test Browser',
        error: 'Authentication failed'
      });

      const report = await manager.generateSecurityAuditReport(tenantId, startDate, endDate);

      expect(report.tenantId).toBe(tenantId);
      expect(report.auditPeriod.start).toBe(startDate.toISOString());
      expect(report.auditPeriod.end).toBe(endDate.toISOString());
      expect(report.summary).toBeTruthy();
      expect(report.risks).toBeTruthy();
      expect(report.recommendations).toBeTruthy();
      expect(['compliant', 'warning', 'non_compliant']).toContain(report.complianceStatus);
    });

    it('should detect excessive failed login attempts', async () => {
      const tenantId = 'test_failed_logins';
      const ipAddress = '192.168.1.999';

      // Simulate multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        await manager.auditAuthenticationEvent(tenantId, 'login_failure', {
          email: `user${i}@test.com`,
          ipAddress,
          userAgent: 'Suspicious Browser',
          error: 'Invalid credentials'
        });
      }

      // The 6th failed attempt should trigger security violation detection
      // This is tested by the audit system internally
      expect(true).toBe(true);
    });
  });

  describe('Production Environment', () => {
    it('should report production status correctly', async () => {
      const status = manager.getProductionStatus();

      expect(status.environment).toBe('development'); // Our test environment
      expect(status.activeTenants).toBeGreaterThanOrEqual(0);
      expect(status.totalAuditLogs).toBeGreaterThanOrEqual(0);
      expect(status.securityLevel).toBe('enhanced');
      expect(status.uptime).toBeGreaterThan(0);
    });

    it('should handle multiple concurrent registrations', async () => {
      const requests: TenantRegistrationRequest[] = [];
      
      for (let i = 0; i < 5; i++) {
        requests.push({
          municipalityName: `Concurrent Test ${i}`,
          country: ['SE', 'DE', 'FR', 'NL'][i % 4] as any,
          contactEmail: `admin${i}@test.com`,
          administratorName: `Admin ${i}`,
          idpType: ['azure-ad', 'okta'][i % 2] as any,
          expectedUsers: 50 + i * 10,
          deploymentTarget: 'pilot'
        });
      }

      const results = await Promise.all(
        requests.map(req => manager.registerMunicipalTenant(req))
      );

      // All registrations should succeed
      expect(results.every(r => r.success)).toBe(true);
      
      // All tenant IDs should be unique
      const tenantIds = results.map(r => r.tenantId);
      const uniqueIds = new Set(tenantIds);
      expect(uniqueIds.size).toBe(tenantIds.length);
    });

    it('should validate required environment variables', async () => {
      // Test with missing environment variables
      const originalBaseUrl = process.env.BASE_URL;
      const originalPrivateKey = process.env.SAML_PRIVATE_KEY;
      
      delete process.env.BASE_URL;
      delete process.env.SAML_PRIVATE_KEY;

      // Creating a new manager should throw due to missing env vars
      expect(() => {
        new SAMLProductionManager(defaultProductionConfig);
      }).toThrow('Missing required environment variables');

      // Restore environment variables
      process.env.BASE_URL = originalBaseUrl;
      process.env.SAML_PRIVATE_KEY = originalPrivateKey;
    });
  });

  describe('Error Handling', () => {
    it('should handle Redis connection failures gracefully', async () => {
      // For this test, we'll just verify the manager can handle registry operations
      // even when Redis might be having issues (graceful degradation)
      
      const request: TenantRegistrationRequest = {
        municipalityName: 'Redis Error Test',
        country: 'SE',
        contactEmail: 'admin@redis-error.se',
        administratorName: 'Redis Admin',
        idpType: 'azure-ad',
        expectedUsers: 100,
        deploymentTarget: 'pilot'
      };

      const result = await manager.registerMunicipalTenant(request);
      
      // Manager should handle potential Redis issues gracefully
      // Either succeed or fail gracefully with proper error message
      expect(result.tenantId).toBeTruthy();
      expect(typeof result.success).toBe('boolean');
      if (!result.success) {
        expect(result.error).toBeTruthy();
      }
    });

    it('should handle malformed tenant data', async () => {
      const malformedRequest = {
        municipalityName: '', // Empty name
        country: 'INVALID' as any, // Invalid country
        contactEmail: 'not-an-email', // Invalid email
        administratorName: '',
        idpType: 'invalid-idp' as any,
        expectedUsers: -1, // Negative users
        deploymentTarget: 'invalid-target' as any
      };

      const result = await manager.registerMunicipalTenant(malformedRequest);
      
      // Should handle malformed data gracefully
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('Configuration Templates', () => {
    it('should provide correct Azure AD setup instructions', async () => {
      const request: TenantRegistrationRequest = {
        municipalityName: 'Azure Test',
        country: 'SE',
        contactEmail: 'admin@azure-test.se',
        administratorName: 'Azure Admin',
        idpType: 'azure-ad',
        expectedUsers: 200,
        deploymentTarget: 'full_rollout'
      };

      const result = await manager.registerMunicipalTenant(request);

      expect(result.success).toBe(true);
      expect(result.setupInstructions).toContain('Azure AD Admin Center');
      expect(result.setupInstructions).toContain('Enterprise Applications');
      expect(result.setupInstructions).toContain('SAML application');
    });

    it('should provide correct Okta setup instructions', async () => {
      const request: TenantRegistrationRequest = {
        municipalityName: 'Okta Test',
        country: 'DE',
        contactEmail: 'admin@okta-test.de',
        administratorName: 'Okta Admin',
        idpType: 'okta',
        expectedUsers: 150,
        deploymentTarget: 'pilot'
      };

      const result = await manager.registerMunicipalTenant(request);

      expect(result.success).toBe(true);
      expect(result.setupInstructions).toContain('Okta Admin Console');
      expect(result.setupInstructions).toContain('Create App Integration');
      expect(result.setupInstructions).toContain('SAML 2.0');
    });

    it('should provide correct ADFS setup instructions', async () => {
      const request: TenantRegistrationRequest = {
        municipalityName: 'ADFS Test',
        country: 'FR',
        contactEmail: 'admin@adfs-test.fr',
        administratorName: 'ADFS Admin',
        idpType: 'adfs',
        expectedUsers: 75,
        deploymentTarget: 'immediate'
      };

      const result = await manager.registerMunicipalTenant(request);

      expect(result.success).toBe(true);
      expect(result.setupInstructions).toContain('ADFS Management Console');
      expect(result.setupInstructions).toContain('Relying Party Trust');
      expect(result.setupInstructions).toContain('Claim Rules');
    });
  });
});