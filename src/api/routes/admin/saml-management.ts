/**
 * SAML Production Management API
 * Administrative endpoints for municipal SSO management
 * 
 * Roadmap Ref: Q1-MER-Milestone-1.3
 * Security: Admin-only endpoints with audit logging
 */

import { Router, type Request, type Response } from 'express';
import { getSAMLProductionManager, type TenantRegistrationRequest } from '../../services/saml-production-manager';
import { InfrastructureMonitoring } from '../../services/infrastructure-monitoring';
import { requireSAMLAuth } from '../auth/saml';

interface AuditLogEntry {
  logId: string;
  tenantId?: string;
  userId?: string;
  action: 'admin_login' | 'tenant_registration' | 'tenant_activation' | 'config_change' | 'audit_access' | 'security_scan' | 'emergency_action';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}


// Security audit logging
const _logAuditEvent = async (entry: AuditLogEntry): Promise<void> => {
  try {
    await monitoring.recordMetric({
      name: 'saml_audit_event',
      value: 1,
      unit: 'count',
      timestamp: entry.timestamp.getTime(),
      tags: {
        action: entry.action,
        tenantId: entry.tenantId || 'system',
        userId: entry.userId || 'unknown',
        success: entry.success.toString(),
        severity: entry.severity,
        ipAddress: entry.ipAddress
      }
    });
    
    // In production, also store in dedicated audit log storage
    console.log(`[AUDIT] ${entry.action} by ${entry.userId} - ${entry.success ? 'SUCCESS' : 'FAILURE'}`);
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};

// Admin authentication middleware
const _requireAdmin = async (req: Request, res: Response, next: (...args: unknown[]) => unknown) => {
  try {
    // In production, implement proper admin role checking
    
    if (!isAdmin) {
      await logAuditEvent({
        logId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: req.samlUser?.email || 'anonymous',
        action: 'admin_login',
        timestamp: new Date(),
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        success: false,
        details: { reason: 'insufficient_privileges', roles: userRoles },
        severity: 'medium'
      });
      
      return res.status(403).json({
        success: false,
        error: 'Admin privileges required'
      });
    }
    
    // Log successful admin access
    await logAuditEvent({
      logId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: req.samlUser?.email || 'unknown',
      action: 'admin_login',
      timestamp: new Date(),
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      success: true,
      details: { endpoint: req.path, roles: userRoles },
      severity: 'low'
    });
    
    next();
  } catch (error) {
    console.error('Admin auth check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication check failed'
    });
  }
};

/**
 * POST /api/admin/saml/register - Register new municipal tenant
 */
router.post('/register', requireSAMLAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const registrationRequest: TenantRegistrationRequest = req.body;
    
    // Validate required fields
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }

    // Validate country code
    if (!['SE', 'DE', 'FR', 'NL'].includes(registrationRequest.country)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid country code. Supported: SE, DE, FR, NL'
      });
    }

    // Validate IdP type
    if (!['azure-ad', 'okta', 'adfs', 'custom'].includes(registrationRequest.idpType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid IdP type. Supported: azure-ad, okta, adfs, custom'
      });
    }

    
    // Record admin action
    monitoring.recordMetric({
      name: 'saml_admin_action',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        action: 'register_tenant',
        adminUser: req.samlUser?.email || 'unknown',
        success: result.success.toString(),
        country: registrationRequest.country
      }
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        tenantId: result.tenantId,
        activationCode: result.activationCode,
        setupInstructions: result.setupInstructions,
        supportContact: result.supportContact,
        message: 'Municipal tenant registered successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        supportContact: result.supportContact
      });
    }

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'saml-admin-register',
      adminUser: req.samlUser?.email
    });

    res.status(500).json({
      success: false,
      error: 'Failed to register municipal tenant'
    });
  }
});

/**
 * POST /api/admin/saml/activate/:tenantId - Activate tenant with SAML config
 */
router.post('/activate/:tenantId', requireSAMLAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { activationCode, samlConfig } = req.body;
    
    if (!activationCode) {
      return res.status(400).json({
        success: false,
        error: 'Activation code is required'
      });
    }

    if (!samlConfig || !samlConfig.cert || !samlConfig.entryPoint) {
      return res.status(400).json({
        success: false,
        error: 'SAML configuration with cert and entryPoint is required'
      });
    }

    
    // Record admin action
    monitoring.recordMetric({
      name: 'saml_admin_action',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        action: 'activate_tenant',
        adminUser: req.samlUser?.email || 'unknown',
        tenantId,
        success: result.success.toString()
      }
    });

    if (result.success) {
      res.json({
        success: true,
        tenantId: result.tenantId,
        setupInstructions: result.setupInstructions,
        supportContact: result.supportContact,
        message: 'Tenant activated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        supportContact: result.supportContact
      });
    }

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'saml-admin-activate',
      adminUser: req.samlUser?.email,
      tenantId: req.params.tenantId
    });

    res.status(500).json({
      success: false,
      error: 'Failed to activate tenant'
    });
  }
});

/**
 * GET /api/admin/saml/tenants - List all registered tenants
 */
router.get('/tenants', requireSAMLAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, country, idpType } = req.query;
    
    // Get all tenants from enterprise provider
    
    // In production, filter based on query parameters
    const _tenants = []; // Would fetch from database/cache
    
    res.json({
      success: true,
      tenants,
      total: tenants.length,
      filters: {
        status: status || 'all',
        country: country || 'all',
        idpType: idpType || 'all'
      }
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'saml-admin-list-tenants',
      adminUser: req.samlUser?.email
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tenants'
    });
  }
});

/**
 * GET /api/admin/saml/audit/:tenantId - Get audit logs for tenant
 */
router.get('/audit/:tenantId', requireSAMLAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { startDate, endDate, action, severity } = req.query;
    
    const _start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    
    // Record admin access to audit logs
    monitoring.recordMetric({
      name: 'saml_audit_access',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        adminUser: req.samlUser?.email || 'unknown',
        tenantId,
        auditPeriodDays: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)).toString()
      }
    });

    res.json({
      success: true,
      tenantId,
      auditReport,
      metadata: {
        generatedBy: req.samlUser?.email,
        generatedAt: new Date().toISOString(),
        requestedPeriod: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      }
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'saml-admin-audit',
      adminUser: req.samlUser?.email,
      tenantId: req.params.tenantId
    });

    res.status(500).json({
      success: false,
      error: 'Failed to generate audit report'
    });
  }
});

/**
 * POST /api/admin/saml/security-scan - Perform security scan on tenant
 */
router.post('/security-scan', requireSAMLAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { tenantId, scanType = 'comprehensive' } = req.body;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required'
      });
    }

    // Generate security audit for the last 7 days
    
    
    // Perform additional security checks based on scan type

    // Record security scan
    monitoring.recordMetric({
      name: 'saml_security_scan',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        adminUser: req.samlUser?.email || 'unknown',
        tenantId,
        scanType,
        riskCount: auditReport.risks.length.toString(),
        complianceStatus: auditReport.complianceStatus
      }
    });

    res.json({
      success: true,
      scan: securityScan
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'saml-admin-security-scan',
      adminUser: req.samlUser?.email
    });

    res.status(500).json({
      success: false,
      error: 'Security scan failed'
    });
  }
});

/**
 * GET /api/admin/saml/status - Get overall SAML production status
 */
router.get('/status', requireSAMLAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    
    // Calculate additional metrics

    res.json({
      success: true,
      production: productionStatus,
      health: healthMetrics,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'saml-admin-status',
      adminUser: req.samlUser?.email
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve status'
    });
  }
});

/**
 * POST /api/admin/saml/emergency-disable/:tenantId - Emergency tenant disable
 */
router.post('/emergency-disable/:tenantId', requireSAMLAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { reason, severity = 'high' } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Reason for emergency disable is required'
      });
    }

    // Audit the emergency action
    await samlManager.auditAuthenticationEvent(tenantId, 'login_failure', {
      userId: req.samlUser?.email,
      email: req.samlUser?.email,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      error: `Emergency disable: ${reason}`
    });

    // Record emergency action
    monitoring.recordMetric({
      name: 'saml_emergency_action',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        action: 'emergency_disable',
        adminUser: req.samlUser?.email || 'unknown',
        tenantId,
        severity,
        reason: reason.substring(0, 50) // Truncate for tag
      }
    });

    res.json({
      success: true,
      message: 'Emergency disable completed',
      tenantId,
      disabledBy: req.samlUser?.email,
      disabledAt: new Date().toISOString(),
      reason,
      severity,
      nextSteps: [
        'Review security audit logs',
        'Coordinate with municipal IT administrator',
        'Resolve underlying issue',
        'Re-enable tenant when safe'
      ]
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'saml-admin-emergency-disable',
      adminUser: req.samlUser?.email,
      tenantId: req.params.tenantId
    });

    res.status(500).json({
      success: false,
      error: 'Emergency disable failed'
    });
  }
});

/**
 * GET /api/admin/saml/metrics - Get SAML performance metrics
 */
router.get('/metrics', requireSAMLAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { period = '24h' } = req.query;
    
    // Calculate timeframe
    
    
    // Mock metrics (in production, calculate from audit logs)

    res.json({
      success: true,
      metrics,
      period: {
        duration: period,
        startTime: startTime.toISOString(),
        endTime: new Date().toISOString()
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'saml-admin-metrics',
      adminUser: req.samlUser?.email
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics'
    });
  }
});

export default router;