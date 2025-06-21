/**
 * Mock Service Factory for Dependency Injection
 * Provides centralized mocking infrastructure for all services
 * 
 * Emergency Implementation for Service Layer Testing
 * Roadmap Ref: Q1-Foundation-Autonomi-Milestone-1.1
 */

import { vi } from 'vitest';

// Service Mock Interfaces
export interface MockService {
  reset(): void;
  getCallCount(): number;
  getLastCall(): any;
}

export interface MockServiceConfig {
  defaultReturnValue?: any;
  throwOnCall?: boolean;
  errorMessage?: string;
  asyncDelay?: number;
}

/**
 * Base Mock Service Class
 * Provides common functionality for all service mocks
 */
export class BaseMockService implements MockService {
  protected calls: any[] = [];
  protected config: MockServiceConfig;
  
  constructor(config: MockServiceConfig = {}) {
    this.config = config;
  }
  
  reset(): void {
    this.calls = [];
  }
  
  getCallCount(): number {
    return this.calls.length;
  }
  
  getLastCall(): any {
    return this.calls[this.calls.length - 1];
  }
  
  protected recordCall(method: string, args: any[]): void {
    this.calls.push({ method, args, timestamp: Date.now() });
  }
  
  protected async handleCall(method: string, args: any[]): Promise<any> {
    this.recordCall(method, args);
    
    if (this.config.throwOnCall) {
      throw new Error(this.config.errorMessage || `Mock ${method} error`);
    }
    
    if (this.config.asyncDelay) {
      await new Promise(resolve => setTimeout(resolve, this.config.asyncDelay));
    }
    
    return this.config.defaultReturnValue;
  }
}

/**
 * Enterprise SSO Mock
 */
export class MockEnterpriseSSO extends BaseMockService {
  authenticateUser = vi.fn(async (tenantId: string, authMethod: string, authData: any) => {
    return this.handleCall('authenticateUser', [tenantId, authMethod, authData]) || {
      id: `${tenantId}:mock-user`,
      email: 'mock@user.com',
      displayName: 'Mock User',
      tenantId,
      culturalContext: 'swedish_mobile',
      permissions: ['read:content', 'write:progress'],
      dataScope: {
        namespace: `tenant:${tenantId}`,
        allowedDataAccess: [`content:${tenantId}`],
        restrictedOperations: []
      },
      sessionNamespace: `tenant:${tenantId}:user:mock-user`
    };
  });
  
  validateSAMLResponse = vi.fn(async (response: string) => {
    return this.handleCall('validateSAMLResponse', [response]) || {
      success: true,
      profile: { nameID: 'mock-user', email: 'mock@user.com' }
    };
  });
}

/**
 * Infrastructure Monitoring Mock
 */
export class MockInfrastructureMonitoring extends BaseMockService {
  private static instance: MockInfrastructureMonitoring;
  
  static getInstance(): MockInfrastructureMonitoring {
    if (!this.instance) {
      this.instance = new MockInfrastructureMonitoring();
    }
    return this.instance;
  }
  
  recordMetric = vi.fn((metric: any) => {
    this.recordCall('recordMetric', [metric]);
  });
  
  reportError = vi.fn((error: Error, context?: any) => {
    this.recordCall('reportError', [error, context]);
  });
  
  reportMessage = vi.fn((message: string, level: string) => {
    this.recordCall('reportMessage', [message, level]);
  });
  
  getHealthStatus = vi.fn(() => {
    return this.handleCall('getHealthStatus', []) || {
      status: 'healthy',
      timestamp: Date.now(),
      services: {},
      metrics: []
    };
  });
  
  getPerformanceBaseline = vi.fn(() => {
    return this.handleCall('getPerformanceBaseline', []) || {
      lcp: 2000,
      fid: 100,
      cls: 0.1
    };
  });
}

/**
 * GDPR Compliance Framework Mock
 */
export class MockGDPRComplianceFramework extends BaseMockService {
  checkCompliance = vi.fn(async (data: any) => {
    return this.handleCall('checkCompliance', [data]) || {
      compliant: true,
      issues: []
    };
  });
  
  anonymizeData = vi.fn((data: any) => {
    return this.handleCall('anonymizeData', [data]) || {
      ...data,
      personalData: '[REDACTED]'
    };
  });
  
  generateComplianceReport = vi.fn(async () => {
    return this.handleCall('generateComplianceReport', []) || {
      timestamp: new Date().toISOString(),
      status: 'compliant',
      dataProcessingActivities: []
    };
  });
}

/**
 * Error Monitoring Mock
 */
export class MockErrorMonitoring extends BaseMockService {
  captureException = vi.fn((error: Error, context?: any) => {
    this.recordCall('captureException', [error, context]);
    return { eventId: 'mock-event-id' };
  });
  
  captureMessage = vi.fn((message: string, level: string) => {
    this.recordCall('captureMessage', [message, level]);
    return { eventId: 'mock-event-id' };
  });
  
  setUser = vi.fn((user: any) => {
    this.recordCall('setUser', [user]);
  });
  
  setContext = vi.fn((key: string, context: any) => {
    this.recordCall('setContext', [key, context]);
  });
}

/**
 * Performance Analytics Mock
 */
export class MockPerformanceAnalytics extends BaseMockService {
  trackMetric = vi.fn((name: string, value: number, tags?: any) => {
    this.recordCall('trackMetric', [name, value, tags]);
  });
  
  startTransaction = vi.fn((name: string) => {
    const transaction = {
      name,
      finish: vi.fn(),
      setData: vi.fn(),
      setStatus: vi.fn()
    };
    this.recordCall('startTransaction', [name]);
    return transaction;
  });
  
  measurePerformance = vi.fn(async (fn: Function) => {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    this.recordCall('measurePerformance', [duration]);
    return result;
  });
}

/**
 * Municipal Integration APIs Mock
 */
export class MockMunicipalIntegrationAPIs extends BaseMockService {
  validateMunicipalConfig = vi.fn(async (config: any) => {
    return this.handleCall('validateMunicipalConfig', [config]) || {
      valid: true,
      errors: []
    };
  });
  
  fetchMunicipalData = vi.fn(async (tenantId: string, endpoint: string) => {
    return this.handleCall('fetchMunicipalData', [tenantId, endpoint]) || {
      data: {},
      status: 'success'
    };
  });
  
  syncWithMunicipalSystem = vi.fn(async (tenantId: string, data: any) => {
    return this.handleCall('syncWithMunicipalSystem', [tenantId, data]) || {
      synced: true,
      timestamp: new Date().toISOString()
    };
  });
}

/**
 * Service Mock Factory
 * Creates and manages mock instances for all services
 */
export class ServiceMockFactory {
  private static mocks: Map<string, MockService> = new Map();
  
  static create<T extends MockService>(
    ServiceClass: new (config?: MockServiceConfig) => T,
    config?: MockServiceConfig
  ): T {
    const mockInstance = new ServiceClass(config);
    const className = ServiceClass.name;
    this.mocks.set(className, mockInstance);
    return mockInstance;
  }
  
  static get(serviceName: string): MockService | undefined {
    return this.mocks.get(serviceName);
  }
  
  static resetAll(): void {
    this.mocks.forEach(mock => mock.reset());
  }
  
  static resetMock(serviceName: string): void {
    const mock = this.mocks.get(serviceName);
    if (mock) {
      mock.reset();
    }
  }
  
  static getAllCallCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.mocks.forEach((mock, name) => {
      counts[name] = mock.getCallCount();
    });
    return counts;
  }
}

/**
 * Mock Provider for Testing
 * Provides pre-configured mocks for common test scenarios
 */
export class MockProvider {
  static getAuthenticatedUserMock(overrides?: Partial<any>) {
    return {
      id: 'malmo_stad:anna.svensson',
      email: 'anna.svensson@malmo.se',
      displayName: 'Anna Svensson',
      tenantId: 'malmo_stad',
      culturalContext: 'swedish_mobile',
      permissions: ['read:content', 'write:progress', 'access:analytics'],
      dataScope: {
        namespace: 'tenant:malmo_stad',
        allowedDataAccess: ['content:malmo_stad', 'users:malmo_stad'],
        restrictedOperations: ['cross_tenant_access']
      },
      sessionNamespace: 'tenant:malmo_stad:user:anna.svensson',
      ...overrides
    };
  }
  
  static getTenantConfigMock(tenantId: string, overrides?: Partial<any>) {
    const configs: Record<string, any> = {
      malmo_stad: {
        name: 'Malmö Stad',
        country: 'SE',
        language: 'sv-SE',
        authProvider: 'saml',
        samlConfig: {
          entryPoint: 'https://login.malmo.se/adfs/ls',
          issuer: 'diginativa-runtime-engine'
        }
      },
      berlin_de: {
        name: 'Stadt Berlin',
        country: 'DE',
        language: 'de-DE',
        authProvider: 'saml',
        samlConfig: {
          entryPoint: 'https://auth.berlin.de/saml/sso',
          issuer: 'diginativa-europa'
        }
      }
    };
    
    return {
      ...configs[tenantId] || configs.malmo_stad,
      ...overrides
    };
  }
  
  static getHealthStatusMock(status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy') {
    return {
      status,
      timestamp: Date.now(),
      services: {
        api: { name: 'api', status: status === 'healthy' ? 'up' : 'down', lastCheck: Date.now() },
        database: { name: 'database', status: 'up', lastCheck: Date.now() },
        auth: { name: 'auth', status: status === 'unhealthy' ? 'down' : 'up', lastCheck: Date.now() }
      },
      metrics: []
    };
  }
}

// Export mock implementations for direct module mocking
export const mockImplementations = {
  '@node-saml/node-saml': {
    SAML: vi.fn().mockImplementation((config) => ({
      validatePostResponse: vi.fn(),
      getAuthorizeUrl: vi.fn(),
      generateServiceProviderMetadata: vi.fn()
    }))
  },
  '../infrastructure-monitoring': {
    InfrastructureMonitoring: MockInfrastructureMonitoring
  },
  '../error-monitoring': {
    errorMonitoring: new MockErrorMonitoring()
  },
  '../performance-analytics': {
    performanceAnalytics: new MockPerformanceAnalytics()
  }
};