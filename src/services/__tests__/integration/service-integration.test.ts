/**
 * Service Integration Test Harness
 * Tests interactions between multiple services
 * 
 * Emergency Implementation - Critical Service Layer Testing
 * Roadmap Ref: Q1-Foundation-Autonomi-Milestone-1.1
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnterpriseSSO, TenantIsolationManager } from '../../enterprise-sso';
import { InfrastructureMonitoring } from '../../infrastructure-monitoring';
import { 
  ServiceMockFactory, 
  MockEnterpriseSSO, 
  MockInfrastructureMonitoring,
  MockErrorMonitoring,
  MockGDPRComplianceFramework,
  MockProvider
} from '../mocks/service-mocks';

// Mock all external services
vi.mock('../../infrastructure-monitoring', () => ({
  InfrastructureMonitoring: {
    getInstance: () => ServiceMockFactory.create(MockInfrastructureMonitoring)
  }
}));

vi.mock('../../error-monitoring', () => ({
  errorMonitoring: ServiceMockFactory.create(MockErrorMonitoring)
}));

vi.mock('../../gdpr-compliance-framework', () => ({
  GDPRComplianceFramework: ServiceMockFactory.create(MockGDPRComplianceFramework)
}));

describe('Service Integration Tests - Critical Authentication Flow', () => {
  let ssoService: EnterpriseSSO;
  let isolationManager: TenantIsolationManager;
  let monitoringMock: MockInfrastructureMonitoring;
  let errorMonitoringMock: MockErrorMonitoring;
  
  beforeEach(() => {
    // Reset all mocks
    ServiceMockFactory.resetAll();
    vi.clearAllMocks();
    
    // Setup environment
    process.env.SAML_MALMO_ENTRY_POINT = 'https://login.malmo.se/adfs/ls';
    process.env.SAML_MALMO_CERT = 'mock-cert';
    
    // Create service instances
    ssoService = new EnterpriseSSO();
    isolationManager = new TenantIsolationManager();
    
    // Get mock references
    monitoringMock = ServiceMockFactory.get('MockInfrastructureMonitoring') as MockInfrastructureMonitoring;
    errorMonitoringMock = ServiceMockFactory.get('MockErrorMonitoring') as MockErrorMonitoring;
  });
  
  afterEach(() => {
    delete process.env.SAML_MALMO_ENTRY_POINT;
    delete process.env.SAML_MALMO_CERT;
  });
  
  describe('Complete Authentication Flow with Monitoring', () => {
    it('should track authentication metrics through monitoring service', async () => {
      // Arrange
      
      // Mock SAML validation
      const { SAML } = await import('@node-saml/node-saml');
      (SAML as any).mockImplementation(() => ({
        validatePostResponse: vi.fn().mockResolvedValue({
          nameID: mockProfile.email,
          email: mockProfile.email,
          displayName: mockProfile.displayName
        })
      }));
      
      // Act
      
      // Assert - Authentication successful
      expect(authenticatedUser).toBeDefined();
      expect(authenticatedUser.email).toBe(mockProfile.email);
      
      // Assert - Monitoring metrics recorded
      expect(monitoringMock.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining('auth'),
          value: expect.any(Number),
          unit: 'ms'
        })
      );
    });
    
    it('should report authentication errors to error monitoring', async () => {
      // Arrange
      const { SAML } = await import('@node-saml/node-saml');
      (SAML as any).mockImplementation(() => ({
        validatePostResponse: vi.fn().mockRejectedValue(new Error('SAML validation failed'))
      }));
      
      // Act & Assert
      await expect(
        ssoService.authenticateUser('malmo_stad', 'saml', 'invalid-response')
      ).rejects.toThrow('Enterprise SSO authentication failed');
      
      // Verify error was reported
      expect(errorMonitoringMock.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tenantId: 'malmo_stad',
          authMethod: 'saml'
        })
      );
    });
  });
  
  describe('Session Isolation with GDPR Compliance', () => {
    it('should ensure GDPR compliance during session creation', async () => {
      // Arrange
      
      // Act
      
      // Assert - Session created
      expect(sessionIsolation.namespace).toBe(`tenant:${tenantId}:user:${userId}`);
      
      // Assert - GDPR compliance checked
      expect(gdprMock.checkCompliance).toHaveBeenCalledWith(
        expect.objectContaining({
          dataScope: sessionIsolation.dataAccess,
          permissions: sessionIsolation.permissions
        })
      );
    });
  });
  
  describe('Multi-Service Error Handling', () => {
    it('should handle cascading service failures gracefully', async () => {
      // Arrange - Make monitoring service fail
      monitoringMock.recordMetric = vi.fn().mockImplementation(() => {
        throw new Error('Monitoring service unavailable');
      });
      
      // Arrange - Valid SAML response
      const { SAML } = await import('@node-saml/node-saml');
      (SAML as any).mockImplementation(() => ({
        validatePostResponse: vi.fn().mockResolvedValue({
          nameID: 'test@user.com',
          email: 'test@user.com'
        })
      }));
      
      // Act - Should still authenticate despite monitoring failure
      
      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe('test@user.com');
      
      // Error should be logged but not break authentication
      expect(errorMonitoringMock.captureException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Monitoring service unavailable'
        })
      );
    });
  });
  
  describe('Performance Testing Across Services', () => {
    it('should complete full authentication + session isolation within performance budget', async () => {
      // Arrange
      
      // Mock SAML validation
      const { SAML } = await import('@node-saml/node-saml');
      (SAML as any).mockImplementation(() => ({
        validatePostResponse: vi.fn().mockResolvedValue({
          nameID: 'perf@test.com',
          email: 'perf@test.com'
        })
      }));
      
      // Act - Run multiple authentication flows
      const durations: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        
          user.id.split(':')[1],
          user.tenantId
        );
        
        durations.push(Date.now() - start);
      }
      
      // Assert - Performance metrics
      
      expect(avgDuration).toBeLessThan(maxDurationMs);
      expect(maxDuration).toBeLessThan(maxDurationMs * 2); // Allow some variance
      
      // Verify monitoring tracked performance
      expect(monitoringMock.recordMetric).toHaveBeenCalledTimes(iterations * 2); // Auth + session
    });
  });
  
  describe('Tenant Data Isolation Verification', () => {
    it('should prevent cross-tenant data access', async () => {
      // Arrange - Create sessions for multiple tenants
      
      // Act - Create isolated sessions
      for (const tenantId of tenants) {
        sessions.set(tenantId, session);
      }
      
      // Assert - Each session has unique namespace
      expect(uniqueNamespaces.size).toBe(tenants.length);
      
      // Assert - Data scopes are properly isolated
      for (const [tenantId, session] of sessions) {
        expect(session.dataAccess.allowedSchemas).toEqual([`tenant_${tenantId}_data`]);
        expect(session.dataAccess.rowLevelSecurity).toBe(`tenant_id = '${tenantId}'`);
        
        // Verify no access to other tenant data
        for (const otherTenant of tenants.filter(t => t !== tenantId)) {
          expect(session.dataAccess.allowedSchemas).not.toContain(`tenant_${otherTenant}_data`);
        }
      }
    });
  });
});

describe('Service Health Check Integration', () => {
  it('should verify all critical services are operational', async () => {
    // Arrange
    
    
    // Act - Check each service
    for (const service of criticalServices) {
      try {
        switch (service) {
          case 'enterprise-sso':
            healthChecks.set(service, { status: 'healthy', instance: !!sso });
            break;
            
          case 'infrastructure-monitoring':
            healthChecks.set(service, { status: health.status, data: health });
            break;
            
          case 'error-monitoring':
            healthChecks.set(service, { status: errorMon ? 'healthy' : 'unhealthy' });
            break;
            
          case 'gdpr-compliance':
            healthChecks.set(service, { status: gdpr ? 'healthy' : 'unhealthy' });
            break;
        }
      } catch (error) {
        healthChecks.set(service, { status: 'error', error: error.message });
      }
    }
    
    // Assert - All services should be healthy
    for (const [service, health] of healthChecks) {
      expect(health.status).toBe('healthy');
    }
  });
});

describe('Municipal Integration Scenarios', () => {
  
  municipalScenarios.forEach(scenario => {
    it(`should handle ${scenario.municipality} integration correctly`, async () => {
      // Arrange
      
      // Mock authentication based on method
      if (scenario.authMethod === 'saml') {
        const { SAML } = await import('@node-saml/node-saml');
        (SAML as any).mockImplementation(() => ({
          validatePostResponse: vi.fn().mockResolvedValue({
            nameID: `user@${scenario.tenantId}`,
            email: `user@${scenario.tenantId}`
          })
        }));
      }
      
      // Act
      let user;
      try {
        user = await ssoService.authenticateUser(
          scenario.tenantId,
          scenario.authMethod,
          'mock-auth-data'
        );
      } catch (error) {
        // OAuth not implemented yet
        if (scenario.authMethod === 'oauth') {
          expect(error).toBeDefined();
          return;
        }
        throw error;
      }
      
        user.id.split(':')[1],
        user.tenantId
      );
      
      // Assert
      expect(user.culturalContext).toBe(scenario.expectedCulture);
      expect(session.culturalPreferences.language).toBe(scenario.language);
      expect(session.namespace).toContain(scenario.tenantId);
    });
  });
});