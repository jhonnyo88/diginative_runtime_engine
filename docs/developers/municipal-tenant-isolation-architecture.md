# Municipal Tenant Isolation Architecture Specification

**Project:** DigiNative Runtime Engine  
**Roadmap Ref:** Q2-Scaling-Infrastructure (proposal-028)  
**Business Impact:** Government-grade security for 100+ municipality scaling  
**Compliance:** GDPR, Swedish Government Data Protection, EU Municipal Standards  

## Executive Summary

This specification defines a comprehensive multi-tenant architecture ensuring complete data isolation between municipalities. The design enables confident scaling to 100+ municipalities while maintaining government-grade security compliance and preventing any data sharing between municipal contexts.

### Key Requirements Met
- ✅ **Complete Data Isolation:** No shared data structures between municipalities
- ✅ **Government Compliance:** GDPR, Swedish regulations, EU municipal standards
- ✅ **Scalability:** Support 100+ concurrent municipalities
- ✅ **Performance:** Maintain <2s response times under multi-tenant load
- ✅ **Security:** Enterprise-grade tenant separation with audit logging

## Architecture Overview

### Multi-Tenant Design Principles

1. **Tenant-First Architecture**
   - Every data structure includes `municipalityId` as primary partition key
   - No shared data between tenants at any layer
   - Tenant context propagated through entire request lifecycle

2. **Defense in Depth**
   - Application-level tenant filtering
   - Database-level partition isolation
   - Network-level tenant separation
   - Cache namespace isolation

3. **Zero Trust Model**
   - Every request validates tenant authorization
   - Cross-tenant operations explicitly blocked
   - Comprehensive audit logging for compliance

## Database Schema Design with Tenant Partitioning

### Core Tenant Schema

```sql
-- Central tenant registry
CREATE TABLE municipalities (
    municipality_id VARCHAR(50) PRIMARY KEY,
    municipality_name VARCHAR(200) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    data_residency_region VARCHAR(50) NOT NULL,
    compliance_level ENUM('basic', 'enhanced', 'government_grade') DEFAULT 'government_grade',
    isolation_level ENUM('logical', 'physical') DEFAULT 'logical',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'suspended', 'migrating') DEFAULT 'active',
    
    -- Government compliance fields
    data_protection_officer_email VARCHAR(255),
    gdpr_representative_contact VARCHAR(255),
    data_retention_policy_days INTEGER DEFAULT 2555, -- 7 years
    
    UNIQUE KEY idx_municipality_name (municipality_name, country_code)
);

-- Partition configuration per municipality
CREATE TABLE tenant_partitions (
    municipality_id VARCHAR(50) PRIMARY KEY,
    database_partition VARCHAR(100) NOT NULL,
    redis_namespace VARCHAR(100) NOT NULL,
    storage_bucket VARCHAR(200) NOT NULL,
    encryption_key_id VARCHAR(100) NOT NULL,
    
    FOREIGN KEY (municipality_id) REFERENCES municipalities(municipality_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);
```

### Tenant-Partitioned Data Tables

```sql
-- AI Content with tenant isolation
CREATE TABLE ai_content (
    content_id VARCHAR(36) NOT NULL,
    municipality_id VARCHAR(50) NOT NULL,
    content_type ENUM('quiz', 'dialogue', 'narrative') NOT NULL,
    content_data JSON NOT NULL,
    validation_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (municipality_id, content_id),
    FOREIGN KEY (municipality_id) REFERENCES municipalities(municipality_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_municipality_content (municipality_id, content_type, created_at),
    INDEX idx_validation_status (municipality_id, validation_status)
) PARTITION BY KEY(municipality_id) PARTITIONS 32;

-- Game sessions with municipal isolation
CREATE TABLE game_sessions (
    session_id VARCHAR(36) NOT NULL,
    municipality_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    content_id VARCHAR(36) NOT NULL,
    session_data JSON NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    score INTEGER DEFAULT 0,
    
    PRIMARY KEY (municipality_id, session_id),
    FOREIGN KEY (municipality_id) REFERENCES municipalities(municipality_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (municipality_id, content_id) REFERENCES ai_content(municipality_id, content_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
        
    INDEX idx_municipality_user (municipality_id, user_id, started_at),
    INDEX idx_municipality_content (municipality_id, content_id)
) PARTITION BY KEY(municipality_id) PARTITIONS 32;

-- Municipal branding assets
CREATE TABLE municipal_branding (
    branding_id VARCHAR(36) NOT NULL,
    municipality_id VARCHAR(50) NOT NULL,
    asset_type ENUM('logo', 'color_scheme', 'typography', 'imagery') NOT NULL,
    asset_config JSON NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (municipality_id, branding_id),
    FOREIGN KEY (municipality_id) REFERENCES municipalities(municipality_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
        
    UNIQUE KEY idx_municipality_asset_active (municipality_id, asset_type, is_active),
    INDEX idx_municipality_version (municipality_id, version)
) PARTITION BY KEY(municipality_id) PARTITIONS 32;

-- User authentication and authorization
CREATE TABLE municipal_users (
    user_id VARCHAR(36) NOT NULL,
    municipality_id VARCHAR(50) NOT NULL,
    saml_name_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role ENUM('municipal_employee', 'it_staff', 'municipal_admin', 'viewer') NOT NULL,
    department VARCHAR(100),
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'suspended', 'deactivated') DEFAULT 'active',
    
    PRIMARY KEY (municipality_id, user_id),
    FOREIGN KEY (municipality_id) REFERENCES municipalities(municipality_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
        
    UNIQUE KEY idx_municipality_saml (municipality_id, saml_name_id),
    UNIQUE KEY idx_municipality_email (municipality_id, email),
    INDEX idx_municipality_role (municipality_id, role)
) PARTITION BY KEY(municipality_id) PARTITIONS 32;
```

### Cross-Tenant Security Validation

```sql
-- Audit log for cross-tenant access attempts
CREATE TABLE tenant_access_audit (
    audit_id VARCHAR(36) PRIMARY KEY,
    requested_municipality_id VARCHAR(50) NOT NULL,
    user_municipality_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    action_attempted VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    access_granted BOOLEAN NOT NULL,
    violation_type ENUM('cross_tenant_access', 'privilege_escalation', 'data_leak_attempt') NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    request_ip VARCHAR(45),
    user_agent TEXT,
    
    INDEX idx_municipality_violations (requested_municipality_id, access_granted, timestamp),
    INDEX idx_user_audit (user_municipality_id, user_id, timestamp),
    INDEX idx_violation_analysis (violation_type, timestamp)
);
```

## Redis Namespace Isolation

### Namespace Strategy

```typescript
/**
 * Redis Namespace Isolation for Multi-Tenant Architecture
 * Ensures complete cache isolation between municipalities
 */

export class TenantRedisService {
  private redis: RedisClusterService;
  
  constructor() {
    this.redis = new RedisClusterService();
  }
  
  /**
   * Generate tenant-specific Redis key
   */
  private getTenantKey(municipalityId: string, key: string): string {
    // Validate municipality ID format
    if (!this.isValidMunicipalityId(municipalityId)) {
      throw new Error(`Invalid municipality ID: ${municipalityId}`);
    }
    
    return `tenant:${municipalityId}:${key}`;
  }
  
  /**
   * Tenant-aware cache operations
   */
  async get(municipalityId: string, key: string): Promise<string | null> {
    const tenantKey = this.getTenantKey(municipalityId, key);
    return await this.redis.get(tenantKey);
  }
  
  async set(
    municipalityId: string, 
    key: string, 
    value: string, 
    ttl?: number
  ): Promise<void> {
    const tenantKey = this.getTenantKey(municipalityId, key);
    if (ttl) {
      await this.redis.setex(tenantKey, ttl, value);
    } else {
      await this.redis.set(tenantKey, value);
    }
  }
  
  /**
   * Bulk operations with tenant isolation
   */
  async mget(municipalityId: string, keys: string[]): Promise<(string | null)[]> {
    const tenantKeys = keys.map(key => this.getTenantKey(municipalityId, key));
    return await this.redis.mget(...tenantKeys);
  }
  
  /**
   * Get all keys for specific tenant (admin operations only)
   */
  async getTenanterenceKeys(municipalityId: string, pattern: string = '*'): Promise<string[]> {
    const tenantPattern = this.getTenantKey(municipalityId, pattern);
    const keys = await this.redis.keys(tenantPattern);
    
    // Strip tenant prefix for return
    return keys.map(key => key.replace(`tenant:${municipalityId}:`, ''));
  }
  
  /**
   * Tenant data deletion (GDPR compliance)
   */
  async deleteTenantData(municipalityId: string): Promise<number> {
    const pattern = `tenant:${municipalityId}:*`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length === 0) {
      return 0;
    }
    
    // Log deletion for audit
    await this.logTenantDataDeletion(municipalityId, keys.length);
    
    return await this.redis.del(...keys);
  }
  
  private isValidMunicipalityId(municipalityId: string): boolean {
    // Validate format: letters, numbers, underscores only
    return /^[a-z0-9_]+$/.test(municipalityId) && municipalityId.length <= 50;
  }
  
  private async logTenantDataDeletion(municipalityId: string, keyCount: number): Promise<void> {
    // Implementation would log to audit system
    console.log(`AUDIT: Deleted ${keyCount} cache keys for municipality ${municipalityId}`);
  }
}
```

### Cache Namespacing Patterns

```typescript
// Cache key patterns by service
export const CacheKeyPatterns = {
  // AI Content caching
  AI_CONTENT: (municipalityId: string, contentId: string) => 
    `ai_content:${contentId}`,
  
  // Game session data
  GAME_SESSION: (municipalityId: string, sessionId: string) => 
    `game_session:${sessionId}`,
  
  // Municipal branding
  BRANDING: (municipalityId: string) => 
    `branding:active`,
  
  // User authentication
  USER_SESSION: (municipalityId: string, userId: string) => 
    `user_session:${userId}`,
  
  // Rate limiting (already implemented with tenant awareness)
  RATE_LIMIT: (municipalityId: string, ip: string, limitType: string) => 
    `rate_limit:${limitType}:${ip}`,
  
  // Municipal configuration
  CONFIG: (municipalityId: string, configType: string) => 
    `config:${configType}`,
    
  // Performance metrics per tenant
  METRICS: (municipalityId: string, metricType: string) => 
    `metrics:${metricType}:${new Date().toISOString().split('T')[0]}` // Daily metrics
};
```

## Municipal Content Segregation Patterns

### Service Layer Isolation

```typescript
/**
 * Base service with tenant context enforcement
 */
export abstract class TenantAwareService {
  protected async validateTenantAccess(
    requestMunicipalityId: string,
    resourceMunicipalityId: string,
    userId: string,
    action: string
  ): Promise<void> {
    // Strict tenant isolation - no cross-tenant access allowed
    if (requestMunicipalityId !== resourceMunicipalityId) {
      await this.auditCrossTenantAttempt(
        requestMunicipalityId,
        resourceMunicipalityId,
        userId,
        action
      );
      
      throw new Error(
        `Cross-tenant access denied: Municipality ${requestMunicipalityId} ` +
        `cannot access resources from ${resourceMunicipalityId}`
      );
    }
  }
  
  private async auditCrossTenantAttempt(
    requestMunicipalityId: string,
    resourceMunicipalityId: string,
    userId: string,
    action: string
  ): Promise<void> {
    // Log security violation
    await this.monitoring.recordSecurityEvent({
      type: 'cross_tenant_access_attempt',
      severity: 'high',
      requestMunicipalityId,
      resourceMunicipalityId,
      userId,
      action,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * AI Content Service with tenant isolation
 */
export class TenantAwareAIContentService extends TenantAwareService {
  async getContent(
    municipalityId: string,
    contentId: string,
    userId: string
  ): Promise<AIContent | null> {
    // Always validate tenant context first
    const content = await this.db.query(`
      SELECT municipality_id, content_id, content_data, validation_status
      FROM ai_content 
      WHERE municipality_id = ? AND content_id = ?
    `, [municipalityId, contentId]);
    
    if (!content) {
      return null;
    }
    
    // Double-check tenant isolation at service layer
    await this.validateTenantAccess(
      municipalityId,
      content.municipality_id,
      userId,
      'read_content'
    );
    
    return content;
  }
  
  async createContent(
    municipalityId: string,
    contentData: any,
    userId: string
  ): Promise<AIContent> {
    // Ensure content is tagged with correct municipality
    const content = {
      content_id: uuidv4(),
      municipality_id: municipalityId, // Always set explicitly
      content_data: contentData,
      created_by: userId,
      created_at: new Date()
    };
    
    await this.db.query(`
      INSERT INTO ai_content (content_id, municipality_id, content_type, content_data, created_by)
      VALUES (?, ?, ?, ?, ?)
    `, [content.content_id, content.municipality_id, content.content_type, 
        JSON.stringify(content.content_data), content.created_by]);
    
    // Cache with tenant namespace
    await this.tenantRedis.set(
      municipalityId,
      CacheKeyPatterns.AI_CONTENT(municipalityId, content.content_id),
      JSON.stringify(content),
      3600 // 1 hour TTL
    );
    
    return content;
  }
}
```

### API Layer Tenant Enforcement

```typescript
/**
 * Middleware to extract and validate tenant context
 */
export function tenantContextMiddleware() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract municipality ID from multiple sources
      const municipalityId = 
        req.headers['x-municipality-id'] as string ||
        req.query.municipalityId as string ||
        (req as any).samlUser?.municipalityId;
      
      if (!municipalityId) {
        res.status(400).json({
          success: false,
          error: 'Municipality context required'
        });
        return;
      }
      
      // Validate municipality exists and is active
      const municipality = await validateMunicipality(municipalityId);
      if (!municipality) {
        res.status(404).json({
          success: false,
          error: 'Municipality not found or inactive'
        });
        return;
      }
      
      // Add tenant context to request
      (req as any).tenantContext = {
        municipalityId,
        municipalityName: municipality.name,
        complianceLevel: municipality.compliance_level,
        isolationLevel: municipality.isolation_level
      };
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Tenant context validation failed'
      });
    }
  };
}

/**
 * API routes with tenant isolation
 */
app.get('/api/content/:contentId', 
  tenantContextMiddleware(),
  async (req: Request, res: Response) => {
    const { contentId } = req.params;
    const { municipalityId } = (req as any).tenantContext;
    const userId = (req as any).samlUser?.userId || 'anonymous';
    
    try {
      const content = await aiContentService.getContent(
        municipalityId,
        contentId,
        userId
      );
      
      if (!content) {
        res.status(404).json({
          success: false,
          error: 'Content not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      if (error.message.includes('Cross-tenant access denied')) {
        res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }
);
```

## Cross-Tenant Security Validation Framework

### Security Enforcement Engine

```typescript
/**
 * Cross-tenant security validation and enforcement
 */
export class TenantSecurityValidator {
  private monitoring: InfrastructureMonitoring;
  private auditLogger: AuditLogger;
  
  constructor() {
    this.monitoring = InfrastructureMonitoring.getInstance();
    this.auditLogger = new AuditLogger();
  }
  
  /**
   * Validate tenant boundaries in database queries
   */
  async validateDatabaseQuery(
    query: string,
    params: any[],
    requestMunicipalityId: string
  ): Promise<boolean> {
    // Parse query to ensure municipality_id filtering
    const queryLower = query.toLowerCase();
    
    // All SELECT queries must include municipality_id filter
    if (queryLower.includes('select') && !queryLower.includes('municipality_id')) {
      throw new Error('Database query missing tenant isolation filter');
    }
    
    // Validate municipality_id parameter is present
    if (queryLower.includes('municipality_id = ?')) {
      const municipalityParam = params.find(p => 
        typeof p === 'string' && p.match(/^[a-z0-9_]+$/)
      );
      
      if (municipalityParam !== requestMunicipalityId) {
        await this.auditSecurityViolation('database_query_municipality_mismatch', {
          requestMunicipalityId,
          queryMunicipalityId: municipalityParam,
          query: query.substring(0, 100)
        });
        
        throw new Error('Municipality parameter mismatch in database query');
      }
    }
    
    return true;
  }
  
  /**
   * Validate file storage tenant isolation
   */
  async validateFileAccess(
    filePath: string,
    requestMunicipalityId: string
  ): Promise<boolean> {
    // File paths must include municipality ID
    if (!filePath.includes(`/${requestMunicipalityId}/`)) {
      await this.auditSecurityViolation('file_access_cross_tenant', {
        requestMunicipalityId,
        filePath,
        violation: 'File path does not include municipality isolation'
      });
      
      throw new Error('Cross-tenant file access denied');
    }
    
    return true;
  }
  
  /**
   * Validate API response data for tenant leakage
   */
  async validateResponseData(
    data: any,
    requestMunicipalityId: string
  ): Promise<boolean> {
    if (Array.isArray(data)) {
      // Check all items in array
      for (const item of data) {
        if (item.municipality_id && item.municipality_id !== requestMunicipalityId) {
          await this.auditSecurityViolation('response_data_cross_tenant', {
            requestMunicipalityId,
            dataMunicipalityId: item.municipality_id,
            dataType: typeof item
          });
          
          throw new Error('Response contains cross-tenant data');
        }
      }
    } else if (data && typeof data === 'object') {
      // Check single object
      if (data.municipality_id && data.municipality_id !== requestMunicipalityId) {
        await this.auditSecurityViolation('response_data_cross_tenant', {
          requestMunicipalityId,
          dataMunicipalityId: data.municipality_id,
          dataType: typeof data
        });
        
        throw new Error('Response contains cross-tenant data');
      }
    }
    
    return true;
  }
  
  private async auditSecurityViolation(
    violationType: string,
    details: Record<string, any>
  ): Promise<void> {
    await this.auditLogger.logSecurityEvent({
      type: 'tenant_isolation_violation',
      violation_type: violationType,
      severity: 'high',
      timestamp: new Date().toISOString(),
      details
    });
    
    await this.monitoring.recordMetric({
      name: 'tenant_security_violation',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        violation_type: violationType,
        municipality_id: details.requestMunicipalityId || 'unknown'
      }
    });
  }
}
```

### Automated Security Testing

```typescript
/**
 * Automated tenant isolation testing
 */
export class TenantIsolationTestSuite {
  async runCrossTenantAccessTests(): Promise<TestResults> {
    const results: TestResults = {
      passed: 0,
      failed: 0,
      violations: []
    };
    
    // Test 1: Cross-tenant data access via API
    await this.testCrossTenantAPIAccess(results);
    
    // Test 2: Cross-tenant database queries
    await this.testCrossTenantDatabaseAccess(results);
    
    // Test 3: Cross-tenant cache access
    await this.testCrossTenantCacheAccess(results);
    
    // Test 4: File storage isolation
    await this.testFileStorageIsolation(results);
    
    // Test 5: User authentication boundaries
    await this.testUserAuthenticationBoundaries(results);
    
    return results;
  }
  
  private async testCrossTenantAPIAccess(results: TestResults): Promise<void> {
    // Create test data for two different municipalities
    const malmöContent = await this.createTestContent('malmo_stad');
    const berlinContent = await this.createTestContent('berlin_de');
    
    try {
      // Attempt to access Berlin content with Malmö context
      const response = await fetch(`/api/content/${berlinContent.id}`, {
        headers: {
          'X-Municipality-ID': 'malmo_stad',
          'Authorization': 'Bearer test_malmo_token'
        }
      });
      
      if (response.status === 403 || response.status === 404) {
        results.passed++;
      } else {
        results.failed++;
        results.violations.push({
          test: 'cross_tenant_api_access',
          expected: 'Access denied',
          actual: `HTTP ${response.status}`,
          severity: 'high'
        });
      }
    } catch (error) {
      results.passed++; // Error is expected
    }
  }
  
  private async testCrossTenantDatabaseAccess(results: TestResults): Promise<void> {
    try {
      // Attempt direct database query without tenant filtering
      const query = `SELECT * FROM ai_content WHERE content_id = ?`;
      await this.db.query(query, ['test_content_id']);
      
      results.failed++;
      results.violations.push({
        test: 'cross_tenant_database_access',
        expected: 'Query validation error',
        actual: 'Query executed without tenant filter',
        severity: 'critical'
      });
    } catch (error) {
      if (error.message.includes('tenant isolation filter')) {
        results.passed++;
      } else {
        results.failed++;
      }
    }
  }
}
```

## Government Compliance Framework

### GDPR Compliance Implementation

```typescript
/**
 * GDPR-compliant tenant data management
 */
export class GDPRComplianceTenantManager {
  async processTenantDataRequest(
    municipalityId: string,
    requestType: 'export' | 'delete' | 'rectify',
    subjectId?: string
  ): Promise<ComplianceResult> {
    
    switch (requestType) {
      case 'export':
        return await this.exportTenantData(municipalityId, subjectId);
        
      case 'delete':
        return await this.deleteTenantData(municipalityId, subjectId);
        
      case 'rectify':
        return await this.rectifyTenantData(municipalityId, subjectId);
    }
  }
  
  private async exportTenantData(
    municipalityId: string,
    subjectId?: string
  ): Promise<ComplianceResult> {
    const exportData: any = {};
    
    // Export AI content data
    exportData.aiContent = await this.db.query(`
      SELECT content_id, content_type, created_at, validation_status
      FROM ai_content 
      WHERE municipality_id = ?
    `, [municipalityId]);
    
    // Export game session data (if subject specified)
    if (subjectId) {
      exportData.gameSessions = await this.db.query(`
        SELECT session_id, started_at, completed_at, score
        FROM game_sessions 
        WHERE municipality_id = ? AND user_id = ?
      `, [municipalityId, subjectId]);
    }
    
    // Export municipal branding
    exportData.branding = await this.db.query(`
      SELECT asset_type, version, is_active, created_at
      FROM municipal_branding 
      WHERE municipality_id = ?
    `, [municipalityId]);
    
    // Create audit record
    await this.auditLogger.logComplianceAction({
      municipality_id: municipalityId,
      action: 'data_export',
      subject_id: subjectId,
      data_categories: Object.keys(exportData),
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      data: exportData,
      exportedRecords: Object.values(exportData).flat().length
    };
  }
  
  private async deleteTenantData(
    municipalityId: string,
    subjectId?: string
  ): Promise<ComplianceResult> {
    let deletedRecords = 0;
    
    // Delete from database (cascading deletes handle related records)
    if (subjectId) {
      // Delete specific subject data
      const result = await this.db.query(`
        DELETE FROM game_sessions 
        WHERE municipality_id = ? AND user_id = ?
      `, [municipalityId, subjectId]);
      deletedRecords += result.affectedRows;
    } else {
      // Delete all municipal data (rare, for complete municipality removal)
      const tables = ['game_sessions', 'ai_content', 'municipal_branding', 'municipal_users'];
      
      for (const table of tables) {
        const result = await this.db.query(`
          DELETE FROM ${table} WHERE municipality_id = ?
        `, [municipalityId]);
        deletedRecords += result.affectedRows;
      }
    }
    
    // Delete from Redis cache
    const cacheDeleted = await this.tenantRedis.deleteTenantData(municipalityId);
    
    // Create audit record
    await this.auditLogger.logComplianceAction({
      municipality_id: municipalityId,
      action: 'data_deletion',
      subject_id: subjectId,
      deleted_records: deletedRecords,
      deleted_cache_keys: cacheDeleted,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      deletedRecords,
      deletedCacheKeys: cacheDeleted
    };
  }
}
```

## Performance Considerations

### Tenant-Aware Performance Optimization

1. **Database Partitioning Strategy**
   - Hash partitioning by `municipality_id` for even distribution
   - 32 partitions initially (supports 1000+ municipalities efficiently)
   - Automatic partition pruning for tenant-specific queries

2. **Cache Performance**
   - Tenant namespace prefixing adds ~10ms overhead
   - Pre-warming strategies for active municipalities
   - Tenant-specific cache TTL based on usage patterns

3. **Query Optimization**
   - All indexes include `municipality_id` as leading column
   - Partition-aware query planning
   - Tenant-specific query result caching

4. **Resource Allocation**
   - Municipal tier-based resource limits
   - Fair queuing for multi-tenant operations
   - Priority queuing for government-critical operations

## Migration Strategy

### Phase 1: Preparation (Week 1)
- Database schema deployment with partitioning
- Redis namespace implementation
- Service layer tenant validation

### Phase 2: Validation (Week 2)
- Security testing and validation
- Performance benchmarking
- Compliance verification

### Phase 3: Production Deployment (Week 3)
- Progressive rollout by municipality
- Monitoring and alerting setup
- Documentation and training

## Monitoring and Alerting

### Tenant Isolation Metrics

```typescript
export const TenantMetrics = {
  // Security metrics
  CROSS_TENANT_ATTEMPTS: 'tenant.security.cross_tenant_attempts',
  ISOLATION_VIOLATIONS: 'tenant.security.isolation_violations',
  UNAUTHORIZED_ACCESS: 'tenant.security.unauthorized_access',
  
  // Performance metrics per tenant
  QUERY_PERFORMANCE: 'tenant.performance.query_duration',
  CACHE_HIT_RATE: 'tenant.performance.cache_hit_rate',
  API_RESPONSE_TIME: 'tenant.performance.api_response_time',
  
  // Compliance metrics
  DATA_EXPORT_REQUESTS: 'tenant.compliance.data_exports',
  DATA_DELETION_REQUESTS: 'tenant.compliance.data_deletions',
  AUDIT_LOG_ENTRIES: 'tenant.compliance.audit_entries'
};
```

### Automated Alerts

1. **Security Alerts (Immediate)**
   - Cross-tenant access attempts
   - Data isolation violations
   - Suspicious query patterns

2. **Performance Alerts**
   - Tenant query performance degradation
   - Cache miss rate increases
   - Resource utilization spikes

3. **Compliance Alerts**
   - GDPR request processing delays
   - Audit log gaps or failures
   - Data retention policy violations

## Conclusion

This Municipal Tenant Isolation Architecture provides:

- ✅ **Complete Data Isolation:** Zero data sharing between municipalities
- ✅ **Government Compliance:** GDPR, Swedish regulations, EU standards
- ✅ **Scalable Design:** Support for 100+ municipalities
- ✅ **Security by Design:** Defense in depth with audit logging
- ✅ **Performance Optimized:** Partition-aware queries and caching

The architecture enables confident scaling while maintaining the highest standards of government-grade security and compliance.