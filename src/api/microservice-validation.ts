/**
 * Microservice Validation API Integration
 * Connects validation endpoints to distributed validation services
 * 
 * Roadmap Ref: Q1-MER-Milestone-1.4
 * Business Impact: Enables horizontal scaling for DevTeam platform
 */

import { Router, type Request, type Response } from 'express';
import { getValidationService, type ValidationRequest, type ValidationResponse } from '../services/validation-microservice';
import { getRedisCluster } from '../services/redis-cluster';
import { InfrastructureMonitoring } from '../services/infrastructure-monitoring';


/**
 * POST /api/v2/validate - Microservice-based validation
 */
router.post('/validate', async (req: Request, res: Response) => {
  
  try {
    const { content, contentType = 'game', priority = 'normal', metadata } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required for validation',
        validationId: null
      });
    }

    // Generate unique request ID
    
    // Create validation request
    const validationRequest: ValidationRequest = {
      id: requestId,
      content,
      contentType,
      priority,
      metadata: {
        ...metadata,
        userId: req.headers['x-user-id'] as string,
        teamId: req.headers['x-team-id'] as string,
        timestamp: Date.now(),
        source: 'api'
      }
    };

    // Submit to validation service
    
    // Poll for result (in production, use WebSocket or callback)
    
    if (!result) {
      return res.status(408).json({
        success: false,
        error: 'Validation timeout',
        validationId: submittedId,
        retryUrl: `/api/v2/validate/status/${submittedId}`
      });
    }


    // Record metrics
    monitoring.recordMetric({
      name: 'microservice_validation_request',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        contentType,
        priority,
        success: result.success.toString(),
        cached: result.cached.toString()
      }
    });

    monitoring.recordMetric({
      name: 'microservice_validation_time',
      value: processingTime,
      unit: 'ms',
      timestamp: Date.now(),
      tags: { contentType, priority }
    });

    // Return result
    res.json({
      success: result.success,
      validationId: result.id,
      result: result.result,
      sanitizedContent: result.sanitizedContent,
      processingTime,
      serviceInstance: result.serviceInstance,
      cached: result.cached,
      error: result.error
    });

  } catch (error) {
    
    monitoring.reportError(error as Error, {
      endpoint: 'microservice-validation',
      processingTime
    });

    res.status(500).json({
      success: false,
      error: 'Validation service error',
      validationId: null,
      processingTime
    });
  }
});

/**
 * POST /api/v2/validate/batch - Batch validation with microservice
 */
router.post('/validate/batch', async (req: Request, res: Response) => {
  
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required for batch validation',
        results: []
      });
    }

    if (items.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Batch size cannot exceed 100 items',
        results: []
      });
    }

    // Submit all validation requests
      return requestId;
    });

    
    // Poll for all results

    res.json({
      success: timeoutCount === 0,
      results: results.map((result, index) => ({
        index,
        success: result?.success || false,
        result: result?.result,
        sanitizedContent: result?.sanitizedContent,
        error: result?.error || (result === null ? 'Validation timeout' : undefined),
        validationId: requestIds[index],
        serviceInstance: result?.serviceInstance,
        cached: result?.cached
      })),
      summary: {
        totalItems: items.length,
        successCount,
        failureCount,
        timeoutCount,
        processingTime
      }
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'microservice-batch-validation'
    });

    res.status(500).json({
      success: false,
      error: 'Batch validation service error',
      results: []
    });
  }
});

/**
 * GET /api/v2/validate/status/:id - Check validation status
 */
router.get('/validate/status/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Validation result not found',
        status: 'not_found'
      });
    }

    res.json({
      success: true,
      validationId: result.id,
      status: result.success ? 'completed' : 'failed',
      result: result.result,
      sanitizedContent: result.sanitizedContent,
      error: result.error,
      processingTime: result.processingTime,
      serviceInstance: result.serviceInstance,
      cached: result.cached
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'validation-status'
    });

    res.status(500).json({
      success: false,
      error: 'Status check failed',
      status: 'error'
    });
  }
});

/**
 * GET /api/v2/validate/metrics - Service metrics endpoint
 */
router.get('/validate/metrics', async (req: Request, res: Response) => {
  try {

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      validation: validationMetrics,
      redis: {
        metrics: redisMetrics,
        health: redisHealth
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'validation-metrics'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics'
    });
  }
});

/**
 * POST /api/v2/validate/cache/clear - Clear validation cache
 */
router.post('/validate/cache/clear', async (req: Request, res: Response) => {
  try {
    const { pattern, tags } = req.body;
    let clearedCount = 0;

    if (pattern) {
      clearedCount = await redisCluster.clearByPattern(`validation:${pattern}`);
    } else if (tags && Array.isArray(tags)) {
      clearedCount = await redisCluster.clearByTags(['validation', ...tags]);
    } else {
      clearedCount = await redisCluster.clearByPattern('validation:*');
    }

    monitoring.recordMetric({
      name: 'validation_cache_clear',
      value: clearedCount,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        pattern: pattern || 'all',
        tags: tags ? tags.join(',') : 'none'
      }
    });

    res.json({
      success: true,
      clearedCount,
      message: `Cleared ${clearedCount} validation cache entries`
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'validation-cache-clear'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

/**
 * GET /api/v2/validate/health - Health check endpoint
 */
router.get('/validate/health', async (req: Request, res: Response) => {
  try {
    
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        validation: {
          status: validationMetrics.healthStatus,
          serviceId: validationMetrics.serviceId,
          queueSize: validationMetrics.pendingJobs,
          averageResponseTime: validationMetrics.averageProcessingTime
        },
        redis: {
          status: redisHealth.healthy ? 'healthy' : 'unhealthy',
          details: redisHealth.details
        }
      },
      uptime: process.uptime()
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'validation-health'
    });

    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * WebSocket handler for real-time validation
 */
export function setupMicroserviceValidationWebSocket(io: Record<string, unknown>): void {
  io.on('connection', (socket: Record<string, unknown>) => {
    console.log('Client connected to microservice validation WebSocket');

    socket.on('validate-realtime', async (data: Record<string, unknown>) => {
      try {
        
        const validationRequest: ValidationRequest = {
          id: requestId,
          content: data.content,
          contentType: data.contentType || 'game',
          priority: 'high', // Real-time gets high priority
          metadata: {
            userId: data.userId,
            teamId: data.teamId,
            timestamp: Date.now(),
            source: 'websocket'
          }
        };

        await validationService.submitValidation(validationRequest);
        
        // Poll for result with shorter timeout for real-time
        
        if (result) {
          socket.emit('validation-result', {
            validationId: result.id,
            success: result.success,
            result: result.result,
            sanitizedContent: result.sanitizedContent,
            error: result.error,
            processingTime: result.processingTime,
            cached: result.cached
          });
        } else {
          socket.emit('validation-error', {
            validationId: requestId,
            error: 'Real-time validation timeout'
          });
        }

      } catch (error) {
        socket.emit('validation-error', {
          error: 'Validation service error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from microservice validation WebSocket');
    });
  });
}

/**
 * Helper function to poll for validation result
 */
async function pollForResult(requestId: string, timeoutMs: number): Promise<ValidationResponse | null> {
  
  while (Date.now() - startTime < timeoutMs) {
    if (result) {
      return result;
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  return null; // Timeout
}

export default router;