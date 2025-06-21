/**
 * DevTeam Pipeline API Routes
 * High-performance content processing endpoints
 * 
 * Roadmap Ref: Q1-AO-Milestone-1.2
 * Target: <30 second content processing consistently
 */

import { Router, type Request, type Response } from 'express';
import { getDevTeamPipeline, type ContentProcessingRequest, type DevTeamPipelineConfig } from '../services/devteam-api-pipeline';
import { InfrastructureMonitoring } from '../services/infrastructure-monitoring';
import type { GameManifest } from '../types/game-manifest';

const router = Router();
const monitoring = InfrastructureMonitoring.getInstance();
const pipeline = getDevTeamPipeline();

/**
 * POST /api/devteam/process - Submit content for processing
 */
router.post('/process', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { content, metadata } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required for processing'
      });
    }

    if (!metadata?.userId || !metadata?.teamId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Team ID are required in metadata'
      });
    }

    // Generate unique processing ID
    const processingId = `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create processing request
    const request: ContentProcessingRequest = {
      id: processingId,
      content: content as GameManifest,
      metadata: {
        userId: metadata.userId,
        teamId: metadata.teamId,
        priority: metadata.priority || 'normal',
        contentType: metadata.contentType || 'game',
        targetDeployment: metadata.targetDeployment,
        timestamp: Date.now()
      }
    };

    // Submit to pipeline
    const submittedId = await pipeline.submitContent(request);
    
    // Poll for result with timeout
    const result = await pollForResult(submittedId, 35000); // 35 second timeout
    
    const processingTime = Date.now() - startTime;

    if (!result) {
      // Content is still processing or timed out
      return res.status(202).json({
        success: false,
        processingId: submittedId,
        status: 'processing',
        message: 'Content processing in progress',
        processingTime,
        statusUrl: `/api/devteam/status/${submittedId}`,
        estimatedCompletion: Date.now() + 15000 // 15 seconds estimate
      });
    }

    // Record metrics
    monitoring.recordMetric({
      name: 'devteam_pipeline_request_completed',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        success: result.success.toString(),
        contentType: request.metadata.contentType,
        priority: request.metadata.priority,
        processingTime: processingTime.toString()
      }
    });

    // Check if we met the <30 second target
    const metTarget = processingTime < 30000;
    monitoring.recordMetric({
      name: 'devteam_pipeline_target_met',
      value: metTarget ? 1 : 0,
      unit: 'boolean',
      timestamp: Date.now(),
      tags: {
        target: '30_seconds',
        actualTime: processingTime.toString()
      }
    });

    // Return result
    res.json({
      success: result.success,
      processingId: result.id,
      processingTime,
      targetMet: metTarget,
      result: result.success ? {
        validatedContent: result.validatedContent,
        optimizedAssets: result.optimizedAssets,
        deploymentPackage: result.deploymentPackage,
        metrics: result.metrics
      } : undefined,
      error: result.error,
      warnings: result.warnings
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    monitoring.reportError(error as Error, {
      endpoint: 'devteam-pipeline-process',
      processingTime
    });

    res.status(500).json({
      success: false,
      error: 'Pipeline processing failed',
      processingTime
    });
  }
});

/**
 * POST /api/devteam/process/batch - Batch content processing
 */
router.post('/process/batch', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { items, batchMetadata } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required for batch processing'
      });
    }

    if (items.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Batch size cannot exceed 50 items'
      });
    }

    // Convert to processing requests
    const requests: ContentProcessingRequest[] = items.map((item, index) => ({
      id: `batch_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      content: item.content,
      metadata: {
        userId: item.metadata?.userId || batchMetadata?.userId,
        teamId: item.metadata?.teamId || batchMetadata?.teamId,
        priority: item.metadata?.priority || batchMetadata?.priority || 'normal',
        contentType: item.metadata?.contentType || batchMetadata?.contentType || 'game',
        targetDeployment: item.metadata?.targetDeployment,
        timestamp: Date.now()
      }
    }));

    // Process batch
    const results = await pipeline.processBatch(requests);
    
    const processingTime = Date.now() - startTime;
    const successCount = Array.from(results.values()).filter(r => r.success).length;
    const failureCount = items.length - successCount;

    // Record batch metrics
    monitoring.recordMetric({
      name: 'devteam_pipeline_batch_completed',
      value: items.length,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        successCount: successCount.toString(),
        failureCount: failureCount.toString(),
        processingTime: processingTime.toString()
      }
    });

    // Convert results to array format
    const resultArray = requests.map(req => {
      const result = results.get(req.id);
      return {
        id: req.id,
        success: result?.success || false,
        content: result?.success ? {
          validatedContent: result.validatedContent,
          optimizedAssets: result.optimizedAssets,
          deploymentPackage: result.deploymentPackage,
          metrics: result.metrics
        } : undefined,
        error: result?.error,
        warnings: result?.warnings
      };
    });

    res.json({
      success: failureCount === 0,
      batchId: `batch_${Date.now()}`,
      processingTime,
      summary: {
        totalItems: items.length,
        successCount,
        failureCount,
        averageProcessingTime: Array.from(results.values())
          .reduce((sum, r) => sum + r.metrics.totalTime, 0) / results.size
      },
      results: resultArray
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'devteam-pipeline-batch'
    });

    res.status(500).json({
      success: false,
      error: 'Batch processing failed'
    });
  }
});

/**
 * GET /api/devteam/status/:id - Check processing status
 */
router.get('/status/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pipeline.getResult(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Processing result not found',
        status: 'not_found'
      });
    }

    res.json({
      success: true,
      processingId: result.id,
      status: result.success ? 'completed' : 'failed',
      result: result.success ? {
        validatedContent: result.validatedContent,
        optimizedAssets: result.optimizedAssets,
        deploymentPackage: result.deploymentPackage,
        metrics: result.metrics
      } : undefined,
      error: result.error,
      warnings: result.warnings
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'devteam-pipeline-status'
    });

    res.status(500).json({
      success: false,
      error: 'Status check failed'
    });
  }
});

/**
 * GET /api/devteam/metrics - Pipeline performance metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const stats = pipeline.getStats();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        performance: {
          averageProcessingTime: stats.averageProcessingTime,
          throughputPerMinute: stats.throughputPerMinute,
          cacheEfficiency: stats.cacheEfficiency,
          targetCompliance: stats.averageProcessingTime < 30000 ? 'MEETING' : 'EXCEEDING'
        },
        queue: {
          activeJobs: stats.activeJobs,
          queueSize: stats.queueSize,
          utilization: stats.activeJobs / 10 // Max concurrent jobs
        },
        processing: {
          totalRequests: stats.totalRequests,
          processedRequests: stats.processedRequests,
          failedRequests: stats.failedRequests,
          successRate: stats.totalRequests > 0 ? stats.processedRequests / stats.totalRequests : 0
        }
      },
      targets: {
        processingTime: '< 30 seconds',
        throughput: '> 2 items/minute',
        cacheEfficiency: '> 70%',
        successRate: '> 95%'
      }
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'devteam-pipeline-metrics'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics'
    });
  }
});

/**
 * POST /api/devteam/optimize - Optimize specific content type
 */
router.post('/optimize', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { content, optimizationLevel = 'balanced' } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required for optimization'
      });
    }

    // Create high-priority optimization request
    const request: ContentProcessingRequest = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: content as GameManifest,
      metadata: {
        userId: req.headers['x-user-id'] as string || 'system',
        teamId: req.headers['x-team-id'] as string || 'system',
        priority: 'high',
        contentType: 'game',
        timestamp: Date.now()
      }
    };

    // Use optimized pipeline configuration
    const optimizedPipeline = getDevTeamPipeline({
      optimizationLevel: optimizationLevel as 'fast' | 'balanced' | 'thorough',
      maxConcurrentProcessing: 5
    });

    const submittedId = await optimizedPipeline.submitContent(request);
    const result = await pollForResult(submittedId, 25000); // 25 second timeout for optimization

    const processingTime = Date.now() - startTime;

    if (!result) {
      return res.status(408).json({
        success: false,
        error: 'Optimization timeout',
        processingTime
      });
    }

    // Calculate optimization benefits
    const originalSize = JSON.stringify(content).length;
    const optimizedSize = result.optimizedAssets?.totalSize || originalSize;
    const compressionRatio = originalSize > 0 ? optimizedSize / originalSize : 1;
    const sizeSavings = originalSize - optimizedSize;

    res.json({
      success: result.success,
      processingTime,
      optimization: {
        level: optimizationLevel,
        originalSize,
        optimizedSize,
        compressionRatio,
        sizeSavings,
        percentageSaved: ((1 - compressionRatio) * 100).toFixed(1)
      },
      result: result.success ? {
        optimizedContent: result.validatedContent,
        assets: result.optimizedAssets,
        metrics: result.metrics
      } : undefined,
      error: result.error,
      warnings: result.warnings
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    monitoring.reportError(error as Error, {
      endpoint: 'devteam-pipeline-optimize',
      processingTime
    });

    res.status(500).json({
      success: false,
      error: 'Optimization failed',
      processingTime
    });
  }
});

/**
 * GET /api/devteam/health - Pipeline health check
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const stats = pipeline.getStats();
    
    const isHealthy = 
      stats.averageProcessingTime < 40000 && // Allow some buffer above 30s target
      stats.activeJobs < 15 && // Not overloaded
      stats.cacheEfficiency > 0.5; // Reasonable cache performance

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        processingTime: {
          status: stats.averageProcessingTime < 40000 ? 'pass' : 'fail',
          value: stats.averageProcessingTime,
          threshold: 40000
        },
        queueLoad: {
          status: stats.activeJobs < 15 ? 'pass' : 'fail',
          value: stats.activeJobs,
          threshold: 15
        },
        cachePerformance: {
          status: stats.cacheEfficiency > 0.5 ? 'pass' : 'fail',
          value: stats.cacheEfficiency,
          threshold: 0.5
        }
      },
      metrics: {
        averageProcessingTime: stats.averageProcessingTime,
        activeJobs: stats.activeJobs,
        queueSize: stats.queueSize,
        throughput: stats.throughputPerMinute,
        successRate: stats.totalRequests > 0 ? stats.processedRequests / stats.totalRequests : 1
      }
    });

  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'devteam-pipeline-health'
    });

    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Helper function to poll for processing result
 */
async function pollForResult(processingId: string, timeoutMs: number): Promise<any> {
  const startTime = Date.now();
  const pollInterval = 500; // Check every 500ms
  
  while (Date.now() - startTime < timeoutMs) {
    const result = await pipeline.getResult(processingId);
    if (result) {
      return result;
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  return null; // Timeout
}

export default router;