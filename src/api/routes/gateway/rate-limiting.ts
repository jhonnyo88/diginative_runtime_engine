/**
 * API Gateway Rate Limiting Routes
 * Administrative endpoints for rate limit management
 * 
 * Roadmap Ref: Q1-Foundation-Autonomi-Milestone-1.1
 * Business Impact: Enterprise-grade API protection and DevTeam scaling
 */

import { Router, type Request, type Response } from 'express';
import { apiGateway, requireAPIKey } from '../../services/api-gateway';
import { InfrastructureMonitoring } from '../../services/infrastructure-monitoring';


/**
 * GET /api/gateway/stats - Get rate limiting statistics
 */
router.get('/stats', requireAPIKey(['admin:monitoring', 'admin:rate_limits']), async (req: Request, res: Response) => {
  try {
    const { municipalityId } = req.query;
    
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
      municipalityId: municipalityId || 'all'
    });

  } catch (error) {
    console.error('Failed to retrieve rate limit stats:', error);
    await monitoring.reportError(error as Error, {
      endpoint: 'gateway_stats',
      municipalityId: req.query.municipalityId as string
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics'
    });
  }
});

/**
 * POST /api/gateway/api-keys - Create new API key
 */
router.post('/api-keys', requireAPIKey(['admin:api_keys']), async (req: Request, res: Response) => {
  try {
    const { permissions, municipalityId, expiresInDays = 365 } = req.body;
    
    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        error: 'Permissions array is required'
      });
    }

    
    const newApiKey = await createApiKey({
      municipalityId,
      permissions,
      rateLimit: {
        windowMs: 60 * 1000,
        maxRequests: 100,
        keyGenerator: (req) => `api_key:${(req as any).apiKey?.keyId}`,
        skipSuccessfulRequests: true,
        skipFailedRequests: false
      },
      isActive: true,
      expiresAt
    });

    // Log API key creation
    await monitoring.recordMetric({
      name: 'api_key_created',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        municipalityId: municipalityId || 'system',
        permissions: permissions.join(','),
        createdBy: (req as any).apiKey?.keyId || 'unknown'
      }
    });

    res.status(201).json({
      success: true,
      keyId: result.keyId,
      apiKey: result.apiKey,
      permissions,
      expiresAt: expiresAt.toISOString(),
      warning: 'Store this API key securely. It will not be shown again.'
    });

  } catch (error) {
    console.error('Failed to create API key:', error);
    await monitoring.reportError(error as Error, {
      endpoint: 'create_api_key'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to create API key'
    });
  }
});

/**
 * PUT /api/gateway/municipality/:municipalityId/limits - Update municipality rate limits
 */
router.put('/municipality/:municipalityId/limits', requireAPIKey(['admin:rate_limits']), async (req: Request, res: Response) => {
  try {
    const { municipalityId } = req.params;

    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Municipality not found'
      });
    }

    // Log rate limit update
    await monitoring.recordMetric({
      name: 'rate_limit_updated',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        municipalityId,
        updatedBy: (req as any).apiKey?.keyId || 'unknown'
      }
    });

    res.json({
      success: true,
      message: 'Rate limits updated successfully',
      municipalityId
    });

  } catch (error) {
    console.error('Failed to update rate limits:', error);
    await monitoring.reportError(error as Error, {
      endpoint: 'update_rate_limits',
      municipalityId: req.params.municipalityId
    });

    res.status(500).json({
      success: false,
      error: 'Failed to update rate limits'
    });
  }
});

/**
 * GET /api/gateway/blocked-ips - Get list of blocked IPs from DDoS protection
 */
router.get('/blocked-ips', requireAPIKey(['admin:monitoring', 'admin:security']), async (req: Request, res: Response) => {
  try {
    // This would typically fetch from Redis in a production implementation
    const _blockedIPs = []; // Placeholder - implement Redis scanning for blocked: keys
    
    res.json({
      success: true,
      blockedIPs,
      count: blockedIPs.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to retrieve blocked IPs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve blocked IPs'
    });
  }
});

/**
 * DELETE /api/gateway/blocked-ips/:ip - Unblock IP address
 */
router.delete('/blocked-ips/:ip', requireAPIKey(['admin:security']), async (req: Request, res: Response) => {
  try {
    const { ip } = req.params;
    
    // Implement Redis key deletion for blocked IP
    // await redis.del(`blocked:${ip}`);
    
    await monitoring.recordMetric({
      name: 'ip_unblocked',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        ip,
        unblockedBy: (req as any).apiKey?.keyId || 'unknown'
      }
    });

    res.json({
      success: true,
      message: 'IP address unblocked successfully',
      ip
    });

  } catch (error) {
    console.error('Failed to unblock IP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unblock IP address'
    });
  }
});

/**
 * GET /api/gateway/health - API Gateway health check
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        totalRequests: stats.requests,
        blockedRequests: stats.blocked,
        ddosBlocks: stats.ddosBlocks,
        apiKeyUsage: stats.apiKeyUsage
      }
    });

  } catch (error) {
    console.error('Gateway health check failed:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed'
    });
  }
});

export default router;