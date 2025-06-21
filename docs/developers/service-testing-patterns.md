# Service Testing Patterns Guide

**Emergency Implementation** - Service Layer Testing Infrastructure  
**Status:** CRITICAL - Blocks ALL Production Deployment  
**Roadmap Ref:** Q1-Foundation-Autonomi-Milestone-1.1

## Executive Summary

This guide documents the emergency service testing patterns implemented to address the critical gap of ZERO test coverage for 8 essential services. These patterns ensure service reliability and prevent catastrophic production failures.

## Critical Services Requiring Tests

1. **enterprise-sso.ts** ✅ (Tests Implemented)
2. **gdpr-compliance-framework.ts** ⚠️ (Pending)
3. **error-monitoring.ts** ⚠️ (Pending)
4. **performance-analytics.ts** ⚠️ (Pending)
5. **municipal-integration-apis.ts** ⚠️ (Pending)
6. **game-state-manager.tsx** ⚠️ (Pending)
7. **municipal-achievement-engine.ts** ⚠️ (Pending)
8. **analytics.ts** ⚠️ (Pending)

## Service Testing Framework Structure

```
src/services/
├── __tests__/
│   ├── enterprise-sso.test.ts          # Service unit tests
│   ├── mocks/
│   │   └── service-mocks.ts            # Mock factory & implementations
│   └── integration/
│       └── service-integration.test.ts # Multi-service integration tests
├── enterprise-sso.ts                    # Service implementation
└── [other-services].ts
```

## Core Testing Patterns

### 1. Service Unit Testing Pattern

Every service must have comprehensive unit tests covering:

```typescript
describe('ServiceName - Emergency Service Testing', () => {
  let service: ServiceClass;
  
  beforeEach(() => {
    // Setup environment
    // Initialize service
    // Clear mocks
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  describe('Critical Flow Tests', () => {
    // Test happy path
    // Test error handling
    // Test edge cases
  });
  
  describe('Security Tests', () => {
    // Test authentication
    // Test authorization
    // Test data isolation
  });
  
  describe('Performance Tests', () => {
    // Test concurrent operations
    // Test resource limits
  });
});
```

### 2. Mock Service Factory Pattern

Centralized mocking for consistent test behavior:

```typescript
export class MockServiceName extends BaseMockService {
  methodName = vi.fn(async (...args) => {
    return this.handleCall('methodName', args) || defaultReturnValue;
  });
}

// Usage in tests
const mockService = ServiceMockFactory.create(MockServiceName, {
  defaultReturnValue: mockData,
  throwOnCall: false
});
```

### 3. Integration Testing Pattern

Test service interactions and cascading failures:

```typescript
describe('Service Integration Tests', () => {
  it('should handle cross-service communication', async () => {
    // Setup multiple service mocks
    // Execute integrated flow
    // Verify service interactions
    // Check error propagation
  });
});
```

## Implementation Guidelines

### Step 1: Analyze Service Dependencies

```typescript
// Identify external dependencies
import { ExternalLib } from '@external/lib';
import { OtherService } from '../other-service';

// Mock all external dependencies
vi.mock('@external/lib');
vi.mock('../other-service');
```

### Step 2: Create Comprehensive Test Coverage

Required test categories for each service:

1. **Authentication/Authorization Tests** (if applicable)
   - Valid credentials
   - Invalid credentials
   - Token expiration
   - Permission checks

2. **Data Validation Tests**
   - Valid inputs
   - Invalid inputs
   - Boundary conditions
   - Null/undefined handling

3. **Error Handling Tests**
   - Network failures
   - Timeout scenarios
   - Invalid responses
   - Cascading failures

4. **Performance Tests**
   - Concurrent operations
   - Large data sets
   - Memory usage
   - Response times

5. **Security Tests**
   - SQL injection prevention
   - XSS prevention
   - Data isolation
   - Secure communication

### Step 3: Implement Mock Factory

```typescript
export class MockYourService extends BaseMockService {
  // Mock all public methods
  publicMethod = vi.fn(async (param: Type) => {
    return this.handleCall('publicMethod', [param]) || {
      // Default return structure
    };
  });
}
```

### Step 4: Write Integration Tests

```typescript
describe('YourService Integration', () => {
  it('should integrate with monitoring service', async () => {
    const monitoring = ServiceMockFactory.get('MockInfrastructureMonitoring');
    
    // Execute service operation
    await yourService.criticalOperation();
    
    // Verify monitoring was called
    expect(monitoring.recordMetric).toHaveBeenCalled();
  });
});
```

## Emergency Implementation Checklist

For each untested service:

- [ ] Create `__tests__/[service-name].test.ts`
- [ ] Implement minimum 80% code coverage
- [ ] Add mock to `service-mocks.ts`
- [ ] Create integration tests if service interacts with others
- [ ] Verify all critical paths are tested
- [ ] Add performance benchmarks
- [ ] Document any discovered issues

## Example: Enterprise SSO Implementation

The enterprise-sso.ts service demonstrates the complete pattern:

### 1. Comprehensive Unit Tests
- ✅ SAML authentication flows
- ✅ Multi-tenant isolation
- ✅ Cultural context mapping
- ✅ Error handling
- ✅ Security validations

### 2. Mock Implementation
```typescript
export class MockEnterpriseSSO extends BaseMockService {
  authenticateUser = vi.fn(async (tenantId, authMethod, authData) => {
    // Configurable mock behavior
  });
}
```

### 3. Integration Tests
- ✅ Authentication + Session Isolation
- ✅ Error propagation across services
- ✅ Performance under load
- ✅ Municipal integration scenarios

## Testing Best Practices

### 1. Test Isolation
Each test should be completely independent:
```typescript
beforeEach(() => {
  ServiceMockFactory.resetAll();
  vi.clearAllMocks();
});
```

### 2. Realistic Mock Data
Use MockProvider for consistent test data:
```typescript
const user = MockProvider.getAuthenticatedUserMock({
  tenantId: 'malmo_stad'
});
```

### 3. Error Scenarios
Always test failure modes:
```typescript
it('should handle service unavailability', async () => {
  mockService.method = vi.fn().mockRejectedValue(new Error('Service down'));
  // Test graceful degradation
});
```

### 4. Performance Assertions
Include performance requirements:
```typescript
it('should complete within 50ms', async () => {
  const start = Date.now();
  await service.operation();
  expect(Date.now() - start).toBeLessThan(50);
});
```

## Common Pitfalls to Avoid

1. **Don't mock too deeply** - Mock at service boundaries, not internal methods
2. **Don't share state** - Each test should setup its own state
3. **Don't ignore async** - Always await async operations
4. **Don't skip error cases** - Error handling is critical for production
5. **Don't hardcode values** - Use constants and mock providers

## Monitoring Integration

All services should integrate with monitoring:

```typescript
// In service implementation
const monitoring = InfrastructureMonitoring.getInstance();
monitoring.recordMetric({
  name: 'service_operation_duration',
  value: duration,
  unit: 'ms'
});

// In tests
expect(monitoringMock.recordMetric).toHaveBeenCalledWith(
  expect.objectContaining({
    name: 'service_operation_duration'
  })
);
```

## Next Steps

1. **Immediate** (Next 24 hours)
   - Implement tests for `gdpr-compliance-framework.ts`
   - Implement tests for `error-monitoring.ts`

2. **High Priority** (Next 48 hours)
   - Complete remaining 5 services
   - Add integration test suite

3. **Follow-up** (Next week)
   - Add performance benchmarks
   - Create service health dashboard
   - Implement automated test coverage reporting

## Success Metrics

- ✅ 100% of critical services have tests
- ✅ Minimum 80% code coverage per service
- ✅ All integration points tested
- ✅ Performance benchmarks established
- ✅ Zero production failures from untested services

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Testing Best Practices](https://testingjavascript.com/)

---

**CRITICAL REMINDER:** Every service without tests is a production failure waiting to happen. The enterprise-sso.ts implementation provides the complete pattern - follow it exactly for remaining services.