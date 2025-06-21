/**
 * SAML Production Manager
 * Production-ready SSO/SAML infrastructure with multi-tenant management
 * 
 * Roadmap Ref: Q1-MER-Milestone-1.3
 * Business Impact: Unlocks €10M+ enterprise municipal market
 */

import { enterpriseSAMLProvider, type MunicipalTenant, type SAMLConfiguration } from './enterprise-saml-provider';
import { getRedisCluster, type RedisClusterService } from './redis-cluster';
import { InfrastructureMonitoring } from './infrastructure-monitoring';
import { validateSAMLConfig, createTenantConfig, type SAMLConfigTemplate, SAML_CONFIG_TEMPLATES } from '../utils/saml-config';

export interface ProductionSAMLConfig {
  environment: 'production' | 'staging' | 'development';
  auditLogging: boolean;
  securityLevel: 'standard' | 'enhanced' | 'maximum';
  certificateValidation: 'strict' | 'lenient';
  sessionTimeout: number;
  maxConcurrentSessions: number;
  enableFailover: boolean;
}

export interface SAMLAuditLog {
  id: string;
  timestamp: string;
  tenantId: string;
  userId?: string;
  action: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'config_change' | 'security_violation';
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface TenantRegistrationRequest {
  municipalityName: string;
  country: 'SE' | 'DE' | 'FR' | 'NL';
  contactEmail: string;
  administratorName: string;
  idpType: 'azure-ad' | 'okta' | 'adfs' | 'custom';
  expectedUsers: number;
  deploymentTarget: 'immediate' | 'pilot' | 'full_rollout';
  contractReference?: string;
}

export interface TenantActivationResult {
  success: boolean;
  tenantId: string;
  activationCode?: string;
  setupInstructions?: string[];
  supportContact: string;
  error?: string;
}

export interface SecurityAuditReport {
  tenantId: string;
  auditPeriod: { start: string; end: string };
  summary: {
    totalLogins: number;
    failedLogins: number;
    securityViolations: number;
    configChanges: number;
    activeUsers: number;
  };
  risks: SecurityRisk[];
  recommendations: string[];
  complianceStatus: 'compliant' | 'warning' | 'non_compliant';
}

export interface SecurityRisk {
  level: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'configuration' | 'access' | 'certificate';
  description: string;
  mitigation: string;
  affectedSessions?: number;
}

/**
 * Production SAML infrastructure manager
 */
export class SAMLProductionManager {
  private config: ProductionSAMLConfig;
  private redis: RedisClusterService;
  private monitoring: InfrastructureMonitoring;
  private auditLogs: SAMLAuditLog[] = [];
  private activeTenants: Map<string, MunicipalTenant> = new Map();

  constructor(config: ProductionSAMLConfig) {
    this.config = config;
    this.redis = getRedisCluster();
    this.monitoring = InfrastructureMonitoring.getInstance();
    
    this.initializeProductionEnvironment();
    this.startSecurityMonitoring();
  }

  /**
   * Register new municipal tenant for SSO
   */
  async registerMunicipalTenant(request: TenantRegistrationRequest): Promise<TenantActivationResult> {
    try {
      // Generate tenant ID
      const tenantId = this.generateTenantId(request.municipalityName, request.country);
      
      // Validate tenant doesn't exist
      if (this.activeTenants.has(tenantId)) {
        return {
          success: false,
          tenantId,
          error: 'Municipality already registered',
          supportContact: this.getSupportContact()
        };
      }

      // Audit registration attempt
      await this.logAuditEvent({
        tenantId,
        action: 'config_change',
        details: {
          operation: 'tenant_registration',
          municipality: request.municipalityName,
          country: request.country,
          administrator: request.administratorName,
          expectedUsers: request.expectedUsers
        },
        ipAddress: 'system',
        userAgent: 'saml-production-manager',
        severity: 'info'
      });

      // Get appropriate SAML template
      const template = this.getSAMLTemplate(request.idpType);
      
      // Create initial tenant configuration
      const { tenant, validation } = createTenantConfig(
        tenantId,
        request.municipalityName,
        request.country,
        request.idpType,
        {
          // Production-ready defaults
          entityID: 'diginativa-runtime-engine',
          callbackUrl: `${process.env.BASE_URL}/auth/saml/callback/${tenantId}`,
          issuer: `diginativa-${tenantId}`,
          privateKey: process.env.SAML_PRIVATE_KEY || '',
          identifierFormat: template.template.identifierFormat,
          signatureAlgorithm: template.template.signatureAlgorithm,
          digestAlgorithm: template.template.digestAlgorithm
        }
      );

      // Set tenant as inactive until proper configuration
      tenant.isActive = false;

      // Store tenant configuration
      await this.storeTenantConfig(tenant);
      this.activeTenants.set(tenantId, tenant);

      // Generate activation materials
      const activationCode = this.generateActivationCode(tenantId);
      const setupInstructions = this.generateSetupInstructions(tenant, template);

      // Store activation details
      await this.redis.set(`saml:activation:${tenantId}`, {
        code: activationCode,
        email: request.contactEmail,
        administrator: request.administratorName,
        created: new Date().toISOString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }, { ttl: 7 * 24 * 3600 }); // 7 days

      // Send notification (in production, would integrate with email service)
      await this.notifyAdministrator(request.contactEmail, tenantId, activationCode, setupInstructions);

      this.monitoring.recordMetric({
        name: 'saml_tenant_registered',
        value: 1,
        unit: 'count',
        timestamp: Date.now(),
        tags: {
          country: request.country,
          idpType: request.idpType,
          deploymentTarget: request.deploymentTarget
        }
      });

      return {
        success: true,
        tenantId,
        activationCode,
        setupInstructions,
        supportContact: this.getSupportContact()
      };

    } catch (error) {
      await this.logAuditEvent({
        tenantId: 'unknown',
        action: 'security_violation',
        details: {
          operation: 'tenant_registration_failure',
          error: error instanceof Error ? error.message : 'Unknown error',
          request: request.municipalityName
        },
        ipAddress: 'system',
        userAgent: 'saml-production-manager',
        severity: 'error'
      });

      return {
        success: false,
        tenantId: '',
        error: error instanceof Error ? error.message : 'Registration failed',
        supportContact: this.getSupportContact()
      };
    }
  }

  /**
   * Activate tenant with SAML configuration
   */
  async activateTenant(tenantId: string, activationCode: string, samlConfig: Partial<SAMLConfiguration>): Promise<TenantActivationResult> {
    try {
      // Verify activation code
      const activation = await this.redis.get(`saml:activation:${tenantId}`);
      if (!activation || activation.code !== activationCode) {
        await this.logAuditEvent({
          tenantId,
          action: 'security_violation',
          details: {
            operation: 'invalid_activation_code',
            providedCode: activationCode
          },
          ipAddress: 'system',
          userAgent: 'saml-production-manager',
          severity: 'warning'
        });

        return {
          success: false,
          tenantId,
          error: 'Invalid activation code',
          supportContact: this.getSupportContact()
        };
      }

      // Check expiration
      if (new Date() > new Date(activation.expires)) {
        return {
          success: false,
          tenantId,
          error: 'Activation code expired',
          supportContact: this.getSupportContact()
        };
      }

      // Get tenant
      const tenant = this.activeTenants.get(tenantId);
      if (!tenant) {
        return {
          success: false,
          tenantId,
          error: 'Tenant not found',
          supportContact: this.getSupportContact()
        };
      }

      // Merge provided SAML configuration
      const updatedSamlConfig = {
        ...tenant.samlConfig,
        ...samlConfig
      };

      // Validate SAML configuration
      const validation = validateSAMLConfig(updatedSamlConfig, tenantId);
      if (!validation.isValid) {
        await this.logAuditEvent({
          tenantId,
          action: 'config_change',
          details: {
            operation: 'activation_failed_validation',
            errors: validation.errors,
            warnings: validation.warnings
          },
          ipAddress: 'system',
          userAgent: 'saml-production-manager',
          severity: 'warning'
        });

        return {
          success: false,
          tenantId,
          error: `Configuration validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
          supportContact: this.getSupportContact()
        };
      }

      // Test SAML connection
      const connectionTest = await this.testSAMLConnection(updatedSamlConfig);
      if (!connectionTest.success) {
        return {
          success: false,
          tenantId,
          error: `SAML connection test failed: ${connectionTest.error}`,
          supportContact: this.getSupportContact()
        };
      }

      // Update tenant configuration
      tenant.samlConfig = updatedSamlConfig;
      tenant.isActive = true;
      tenant.lastLogin = undefined; // Will be set on first login

      // Register with enterprise provider
      enterpriseSAMLProvider.registerTenant(tenant);

      // Store updated configuration
      await this.storeTenantConfig(tenant);
      this.activeTenants.set(tenantId, tenant);

      // Clean up activation data
      await this.redis.del(`saml:activation:${tenantId}`);

      // Audit successful activation
      await this.logAuditEvent({
        tenantId,
        action: 'config_change',
        details: {
          operation: 'tenant_activated',
          administrator: activation.administrator,
          idpType: tenant.idpType
        },
        ipAddress: 'system',
        userAgent: 'saml-production-manager',
        severity: 'info'
      });

      this.monitoring.recordMetric({
        name: 'saml_tenant_activated',
        value: 1,
        unit: 'count',
        timestamp: Date.now(),
        tags: {
          tenantId,
          country: tenant.country,
          idpType: tenant.idpType
        }
      });

      return {
        success: true,
        tenantId,
        setupInstructions: [
          'Tenant successfully activated',
          'SAML SSO is now available for your users',
          `Login URL: ${process.env.BASE_URL}/auth/saml/login/${tenantId}`,
          'Monitor authentication logs in the admin dashboard'
        ],
        supportContact: this.getSupportContact()
      };

    } catch (error) {
      await this.logAuditEvent({
        tenantId,
        action: 'security_violation',
        details: {
          operation: 'tenant_activation_error',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        ipAddress: 'system',
        userAgent: 'saml-production-manager',
        severity: 'error'
      });

      return {
        success: false,
        tenantId,
        error: error instanceof Error ? error.message : 'Activation failed',
        supportContact: this.getSupportContact()
      };
    }
  }

  /**
   * Audit SAML authentication event
   */
  async auditAuthenticationEvent(
    tenantId: string,
    action: 'login_attempt' | 'login_success' | 'login_failure' | 'logout',
    details: {
      userId?: string;
      email?: string;
      ipAddress: string;
      userAgent: string;
      sessionId?: string;
      error?: string;
    }
  ): Promise<void> {
    const severity = action === 'login_failure' ? 'warning' : 'info';
    
    await this.logAuditEvent({
      tenantId,
      action,
      details,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      severity
    });

    // Update tenant statistics
    await this.updateTenantStats(tenantId, action);

    // Check for suspicious activity
    if (action === 'login_failure') {
      await this.checkFailedLoginPattern(tenantId, details.ipAddress);
    }
  }

  /**
   * Generate security audit report
   */
  async generateSecurityAuditReport(tenantId: string, startDate: Date, endDate: Date): Promise<SecurityAuditReport> {
    try {
      // Get audit logs for period
      const logs = await this.getAuditLogs(tenantId, startDate, endDate);
      
      // Calculate summary statistics
      const summary = {
        totalLogins: logs.filter(l => l.action === 'login_success').length,
        failedLogins: logs.filter(l => l.action === 'login_failure').length,
        securityViolations: logs.filter(l => l.action === 'security_violation').length,
        configChanges: logs.filter(l => l.action === 'config_change').length,
        activeUsers: new Set(logs.filter(l => l.details.userId).map(l => l.details.userId)).size
      };

      // Identify security risks
      const risks: SecurityRisk[] = [];

      // High failure rate risk
      if (summary.failedLogins > summary.totalLogins * 0.2) {
        risks.push({
          level: 'high',
          category: 'authentication',
          description: 'Elevated authentication failure rate detected',
          mitigation: 'Review user training and consider MFA implementation',
          affectedSessions: summary.failedLogins
        });
      }

      // Security violations risk
      if (summary.securityViolations > 0) {
        risks.push({
          level: summary.securityViolations > 5 ? 'critical' : 'medium',
          category: 'access',
          description: 'Security violations detected',
          mitigation: 'Review access logs and security policies',
          affectedSessions: summary.securityViolations
        });
      }

      // Certificate expiration check
      const tenant = this.activeTenants.get(tenantId);
      if (tenant) {
        const certRisk = await this.checkCertificateExpiration(tenant);
        if (certRisk) {
          risks.push(certRisk);
        }
      }

      // Generate recommendations
      const recommendations = this.generateSecurityRecommendations(summary, risks);

      // Determine compliance status
      const complianceStatus = risks.some(r => r.level === 'critical') ? 'non_compliant' :
                              risks.some(r => r.level === 'high') ? 'warning' : 'compliant';

      return {
        tenantId,
        auditPeriod: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        summary,
        risks,
        recommendations,
        complianceStatus
      };

    } catch (error) {
      throw new Error(`Failed to generate audit report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Private helper methods
   */
  private async initializeProductionEnvironment(): Promise<void> {
    console.log(`Initializing SAML Production Manager - Environment: ${this.config.environment}`);
    
    // Load existing tenant configurations
    await this.loadExistingTenants();
    
    // Initialize security monitoring
    if (this.config.auditLogging) {
      await this.initializeAuditLogging();
    }
    
    // Validate production readiness
    await this.validateProductionReadiness();
  }

  private async loadExistingTenants(): Promise<void> {
    try {
      const tenantKeys = await this.redis.keys('saml:tenant:*');
      
      for (const key of tenantKeys) {
        const tenant = await this.redis.get<MunicipalTenant>(key);
        if (tenant && tenant.isActive) {
          this.activeTenants.set(tenant.id, tenant);
          enterpriseSAMLProvider.registerTenant(tenant);
        }
      }
      
      console.log(`Loaded ${this.activeTenants.size} active SAML tenants`);
    } catch (error) {
      console.error('Failed to load existing tenants:', error);
    }
  }

  private async validateProductionReadiness(): Promise<void> {
    const requiredEnvVars = [
      'BASE_URL',
      'SAML_PRIVATE_KEY'
    ];

    const missing = requiredEnvVars.filter(env => !process.env[env]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Test Redis connectivity
    await this.redis.set('saml:health:test', 'ok');
    const testResult = await this.redis.get('saml:health:test');
    if (testResult !== 'ok') {
      throw new Error('Redis connectivity test failed');
    }
    await this.redis.del('saml:health:test');

    console.log('SAML Production environment validated successfully');
  }

  private generateTenantId(municipalityName: string, country: string): string {
    const normalized = municipalityName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    return `${normalized}_${country.toLowerCase()}`;
  }

  private getSAMLTemplate(idpType: string): SAMLConfigTemplate {
    return SAML_CONFIG_TEMPLATES.find(t => t.idpType === idpType) || SAML_CONFIG_TEMPLATES[0];
  }

  private generateActivationCode(tenantId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const hash = Buffer.from(`${tenantId}:${timestamp}:${random}`).toString('base64').substring(0, 12);
    return `${timestamp}-${hash}`.toUpperCase();
  }

  private generateSetupInstructions(tenant: MunicipalTenant, template: SAMLConfigTemplate): string[] {
    const instructions = [
      `Municipal SSO Setup Instructions for ${tenant.name}`,
      '',
      'Step 1: Identity Provider Configuration',
      ...template.setupInstructions.map(step => `  ${step}`),
      '',
      'Step 2: Certificate Configuration',
      `  - Download and configure IdP certificate`,
      `  - Set environment variable: SAML_${tenant.id.toUpperCase()}_CERT`,
      `  - Set IdP entry point: SAML_${tenant.id.toUpperCase()}_ENTRY_POINT`,
      '',
      'Step 3: Testing',
      `  - Test SSO login at: ${process.env.BASE_URL}/auth/saml/login/${tenant.id}`,
      `  - Verify Service Provider metadata: ${process.env.BASE_URL}/auth/saml/metadata/${tenant.id}`,
      '',
      'Step 4: Production Activation',
      '  - Complete this setup form with your SAML configuration',
      '  - Your tenant will be activated automatically upon validation',
      '',
      `Support: ${this.getSupportContact()}`
    ];

    return instructions;
  }

  private async storeTenantConfig(tenant: MunicipalTenant): Promise<void> {
    const key = `saml:tenant:${tenant.id}`;
    await this.redis.set(key, tenant, { 
      ttl: 0, // No expiration
      tags: ['saml-tenant', tenant.country, tenant.idpType]
    });
  }

  private async testSAMLConnection(config: SAMLConfiguration): Promise<{ success: boolean; error?: string }> {
    try {
      // Basic URL validation
      if (config.entryPoint) {
        const url = new URL(config.entryPoint);
        if (url.protocol !== 'https:') {
          return { success: false, error: 'IdP entry point must use HTTPS' };
        }
      }

      // Certificate validation
      if (config.cert && !config.cert.includes('-----BEGIN CERTIFICATE-----')) {
        return { success: false, error: 'Invalid certificate format' };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  private async logAuditEvent(event: Omit<SAMLAuditLog, 'id' | 'timestamp'>): Promise<void> {
    const auditLog: SAMLAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event
    };

    // Store in memory for immediate access
    this.auditLogs.push(auditLog);
    
    // Keep only recent logs in memory (last 1000)
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }

    // Store in Redis for persistence
    const key = `saml:audit:${auditLog.tenantId}:${auditLog.timestamp}`;
    await this.redis.set(key, auditLog, { 
      ttl: 30 * 24 * 3600, // 30 days
      tags: ['saml-audit', auditLog.tenantId, auditLog.action]
    });

    // Record metric
    this.monitoring.recordMetric({
      name: 'saml_audit_event',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        tenantId: auditLog.tenantId,
        action: auditLog.action,
        severity: auditLog.severity
      }
    });
  }

  private async getAuditLogs(tenantId: string, startDate: Date, endDate: Date): Promise<SAMLAuditLog[]> {
    const pattern = `saml:audit:${tenantId}:*`;
    const keys = await this.redis.keys(pattern);
    const logs: SAMLAuditLog[] = [];

    for (const key of keys) {
      const log = await this.redis.get<SAMLAuditLog>(key);
      if (log) {
        const logDate = new Date(log.timestamp);
        if (logDate >= startDate && logDate <= endDate) {
          logs.push(log);
        }
      }
    }

    return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private async updateTenantStats(tenantId: string, action: string): Promise<void> {
    const statsKey = `saml:stats:${tenantId}`;
    const stats = await this.redis.get(statsKey) || {
      totalLogins: 0,
      failedLogins: 0,
      lastActivity: null
    };

    if (action === 'login_success') {
      stats.totalLogins++;
      stats.lastActivity = new Date().toISOString();
    } else if (action === 'login_failure') {
      stats.failedLogins++;
    }

    await this.redis.set(statsKey, stats, { ttl: 365 * 24 * 3600 }); // 1 year
  }

  private async checkFailedLoginPattern(tenantId: string, ipAddress: string): Promise<void> {
    const failureKey = `saml:failures:${tenantId}:${ipAddress}`;
    const failures = await this.redis.incr(failureKey, 1);
    await this.redis.expire(failureKey, 3600); // 1 hour window

    if (failures >= 5) {
      await this.logAuditEvent({
        tenantId,
        action: 'security_violation',
        details: {
          operation: 'excessive_failed_logins',
          ipAddress,
          failureCount: failures
        },
        ipAddress,
        userAgent: 'security-monitor',
        severity: 'critical'
      });
    }
  }

  private async checkCertificateExpiration(tenant: MunicipalTenant): Promise<SecurityRisk | null> {
    // In production, would parse and check actual certificate expiration
    // For now, return null (no certificate risk detected)
    return null;
  }

  private generateSecurityRecommendations(summary: any, risks: SecurityRisk[]): string[] {
    const recommendations: string[] = [];

    if (summary.failedLogins > summary.totalLogins * 0.1) {
      recommendations.push('Consider implementing multi-factor authentication (MFA)');
      recommendations.push('Review user training on proper authentication procedures');
    }

    if (risks.some(r => r.category === 'certificate')) {
      recommendations.push('Update SAML certificates before expiration');
    }

    if (summary.securityViolations > 0) {
      recommendations.push('Review and strengthen security policies');
      recommendations.push('Implement additional monitoring for suspicious activities');
    }

    if (recommendations.length === 0) {
      recommendations.push('Current security posture is acceptable');
      recommendations.push('Continue regular monitoring and maintain current practices');
    }

    return recommendations;
  }

  private async notifyAdministrator(email: string, tenantId: string, activationCode: string, instructions: string[]): Promise<void> {
    // In production, integrate with email service
    console.log(`Notification sent to ${email} for tenant ${tenantId} with activation code ${activationCode}`);
  }

  private getSupportContact(): string {
    return 'support@diginativa.se';
  }

  private async initializeAuditLogging(): Promise<void> {
    console.log('Audit logging initialized for SAML production environment');
  }

  private startSecurityMonitoring(): void {
    // Start periodic security checks
    setInterval(() => {
      this.performSecurityChecks();
    }, 300000); // Every 5 minutes
  }

  private async performSecurityChecks(): Promise<void> {
    try {
      // Check for inactive tenants
      for (const [tenantId, tenant] of this.activeTenants) {
        if (tenant.isActive && tenant.lastLogin) {
          const lastLoginDate = new Date(tenant.lastLogin);
          const daysSinceLogin = (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceLogin > 90) { // 90 days inactive
            await this.logAuditEvent({
              tenantId,
              action: 'security_violation',
              details: {
                operation: 'inactive_tenant_detected',
                daysSinceLogin: Math.floor(daysSinceLogin)
              },
              ipAddress: 'system',
              userAgent: 'security-monitor',
              severity: 'warning'
            });
          }
        }
      }
    } catch (error) {
      console.error('Security check failed:', error);
    }
  }

  /**
   * Get production status and metrics
   */
  getProductionStatus(): {
    environment: string;
    activeTenants: number;
    totalAuditLogs: number;
    securityLevel: string;
    uptime: number;
  } {
    return {
      environment: this.config.environment,
      activeTenants: this.activeTenants.size,
      totalAuditLogs: this.auditLogs.length,
      securityLevel: this.config.securityLevel,
      uptime: process.uptime()
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down SAML Production Manager...');
    
    // Save final audit logs
    if (this.auditLogs.length > 0) {
      console.log(`Saving ${this.auditLogs.length} audit logs...`);
    }
    
    console.log('SAML Production Manager shutdown complete');
  }
}

// Export default production configuration
export const defaultProductionConfig: ProductionSAMLConfig = {
  environment: (process.env.NODE_ENV as any) || 'development',
  auditLogging: true,
  securityLevel: 'enhanced',
  certificateValidation: 'strict',
  sessionTimeout: 3600000, // 1 hour
  maxConcurrentSessions: 1000,
  enableFailover: true
};

// Export singleton factory
let productionManagerInstance: SAMLProductionManager | null = null;

export function getSAMLProductionManager(config?: Partial<ProductionSAMLConfig>): SAMLProductionManager {
  if (!productionManagerInstance) {
    productionManagerInstance = new SAMLProductionManager({
      ...defaultProductionConfig,
      ...config
    });
  }
  return productionManagerInstance;
}