/**
 * DevTeam API Pipeline Optimization Service
 * Advanced caching and batch processing for <30s content processing
 * 
 * Roadmap Ref: Q1-AO-Milestone-1.2
 * Target: AI content → deployed game in <30 minutes consistently
 */

import { getRedisCluster, type RedisClusterService } from './redis-cluster';
import { getValidationService, type ValidationMicroservice } from './validation-microservice';
import { InfrastructureMonitoring } from './infrastructure-monitoring';
import type { GameManifest, BaseScene } from '../types/game-manifest';

export interface DevTeamPipelineConfig {
  maxConcurrentProcessing: number;
  batchSize: number;
  cacheStrategy: 'aggressive' | 'balanced' | 'minimal';
  contentValidationTimeout: number;
  deploymentTimeout: number;
  optimizationLevel: 'fast' | 'balanced' | 'thorough';
}

export interface ContentProcessingRequest {
  id: string;
  content: GameManifest;
  metadata: {
    userId: string;
    teamId: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    contentType: 'game' | 'update' | 'hotfix';
    targetDeployment?: string;
    timestamp: number;
  };
}

export interface ProcessingResult {
  id: string;
  success: boolean;
  validatedContent?: GameManifest;
  optimizedAssets?: OptimizedAssets;
  deploymentPackage?: DeploymentPackage;
  metrics: ProcessingMetrics;
  error?: string;
  warnings?: string[];
}

export interface OptimizedAssets {
  compressedScenes: BaseScene[];
  bundledScripts: string[];
  optimizedImages: AssetManifest[];
  minifiedStyles: string;
  totalSize: number;
  compressionRatio: number;
}

export interface DeploymentPackage {
  version: string;
  manifest: GameManifest;
  assets: OptimizedAssets;
  metadata: {
    buildTime: number;
    targetEnvironments: string[];
    rollbackVersion?: string;
  };
}

export interface ProcessingMetrics {
  validationTime: number;
  optimizationTime: number;
  deploymentTime: number;
  totalTime: number;
  cacheHits: number;
  cacheMisses: number;
  assetsProcessed: number;
  compressionSavings: number;
}

export interface AssetManifest {
  path: string;
  originalSize: number;
  compressedSize: number;
  hash: string;
  format: string;
}

export interface BatchProcessingStats {
  totalRequests: number;
  processedRequests: number;
  failedRequests: number;
  averageProcessingTime: number;
  throughputPerMinute: number;
  cacheEfficiency: number;
}

/**
 * Optimized DevTeam API pipeline for rapid content processing
 */
export class DevTeamAPIPipeline {
  private config: DevTeamPipelineConfig;
  private redis: RedisClusterService;
  private validation: ValidationMicroservice;
  private monitoring: InfrastructureMonitoring;
  private processingQueue: Map<string, ContentProcessingRequest> = new Map();
  private activeJobs: Map<string, Promise<ProcessingResult>> = new Map();
  private batchStats: BatchProcessingStats = {
    totalRequests: 0,
    processedRequests: 0,
    failedRequests: 0,
    averageProcessingTime: 0,
    throughputPerMinute: 0,
    cacheEfficiency: 0
  };

  constructor(config: DevTeamPipelineConfig) {
    this.config = config;
    this.redis = getRedisCluster();
    this.validation = getValidationService();
    this.monitoring = InfrastructureMonitoring.getInstance();
    
    this.startBatchProcessor();
    this.startMetricsCollection();
  }

  /**
   * Submit content for processing
   */
  async submitContent(request: ContentProcessingRequest): Promise<string> {
    
    try {
      // Check for existing processing
      if (this.activeJobs.has(request.id)) {
        throw new Error(`Content ${request.id} is already being processed`);
      }

      // Quick content hash for cache lookup
      
      // Check cache first for identical content
      if (cached && this.isCacheValid(cached, request)) {
        this.updateCacheStats(true);
        
        // Return cached result with new ID
        
        this.monitoring.recordMetric({
          name: 'devteam_pipeline_cache_hit',
          value: 1,
          unit: 'count',
          timestamp: Date.now(),
          tags: {
            contentType: request.metadata.contentType,
            priority: request.metadata.priority
          }
        });

        return request.id;
      }

      // Add to processing queue
      this.processingQueue.set(request.id, request);
      this.batchStats.totalRequests++;

      // Start processing if under concurrency limit
      if (this.activeJobs.size < this.config.maxConcurrentProcessing) {
        this.processContent(request);
      }

      this.monitoring.recordMetric({
        name: 'devteam_pipeline_request_submitted',
        value: 1,
        unit: 'count',
        timestamp: Date.now(),
        tags: {
          contentType: request.metadata.contentType,
          priority: request.metadata.priority,
          cached: 'false'
        }
      });

      return request.id;

    } catch (error) {
      this.monitoring.reportError(error as Error, {
        context: 'devteam_pipeline_submission',
        requestId: request.id
      });
      throw error;
    }
  }

  /**
   * Get processing result
   */
  async getResult(id: string): Promise<ProcessingResult | null> {
    // Check if still processing
    if (activeJob) {
      try {
        return await activeJob;
      } catch (error) {
        return {
          id,
          success: false,
          error: error instanceof Error ? error.message : 'Processing failed',
          metrics: {
            validationTime: 0,
            optimizationTime: 0,
            deploymentTime: 0,
            totalTime: 0,
            cacheHits: 0,
            cacheMisses: 0,
            assetsProcessed: 0,
            compressionSavings: 0
          }
        };
      }
    }

    // Check cache for completed results
    return await this.redis.get<ProcessingResult>(cacheKey);
  }

  /**
   * Process batch of content items
   */
  async processBatch(requests: ContentProcessingRequest[]): Promise<Map<string, ProcessingResult>> {

    try {
      // Group by priority for processing order
      
      // Process urgent and high priority first
      for (const priority of ['urgent', 'high', 'normal', 'low'] as const) {
        if (group.length === 0) continue;

        // Process in batches to respect concurrency limits
        
        for (const batch of batches) {
            return this.processContent(request);
          });

          
          batchResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              results.set(request.id, result.value);
            } else {
              results.set(request.id, {
                id: request.id,
                success: false,
                error: result.reason?.message || 'Batch processing failed',
                metrics: this.createEmptyMetrics()
              });
            }
          });
        }
      }


      this.monitoring.recordMetric({
        name: 'devteam_pipeline_batch_processed',
        value: requests.length,
        unit: 'count',
        timestamp: Date.now(),
        tags: {
          successCount: successCount.toString(),
          processingTime: processingTime.toString()
        }
      });

      return results;

    } catch (error) {
      this.monitoring.reportError(error as Error, {
        context: 'devteam_batch_processing',
        batchSize: requests.length
      });
      throw error;
    }
  }

  /**
   * Core content processing pipeline
   */
  private async processContent(request: ContentProcessingRequest): Promise<ProcessingResult> {
    const metrics: ProcessingMetrics = this.createEmptyMetrics();

    // Create processing promise
    this.activeJobs.set(request.id, processingPromise);

    try {
      
      // Cache successful results
      if (result.success) {
        await this.redis.set(cacheKey, result, { 
          ttl: this.getCacheTTL(request.metadata.contentType),
          tags: ['devteam-pipeline', request.metadata.contentType]
        });

        // Also cache by ID for retrieval
        await this.redis.set(resultCacheKey, result, { ttl: 3600 }); // 1 hour
      }

      this.updateBatchStats(result);
      return result;

    } finally {
      this.activeJobs.delete(request.id);
      this.processingQueue.delete(request.id);
    }
  }

  /**
   * Execute the complete processing pipeline
   */
  private async executeProcessingPipeline(
    request: ContentProcessingRequest, 
    metrics: ProcessingMetrics
  ): Promise<ProcessingResult> {
    try {
      // Step 1: Content Validation
      if (!validationResult.success) {
        return validationResult;
      }

      // Step 2: Asset Optimization
      if (!optimizationResult.success) {
        return optimizationResult;
      }

      // Step 3: Deployment Package Creation
      if (!deploymentResult.success) {
        return deploymentResult;
      }

      // Step 4: Performance Validation
      await this.validatePerformance(deploymentResult, metrics);

      metrics.totalTime = Date.now() - Date.now() + metrics.validationTime + metrics.optimizationTime + metrics.deploymentTime;

      return {
        id: request.id,
        success: true,
        validatedContent: validationResult.validatedContent,
        optimizedAssets: optimizationResult.optimizedAssets,
        deploymentPackage: deploymentResult.deploymentPackage,
        metrics,
        warnings: [
          ...validationResult.warnings || [],
          ...optimizationResult.warnings || [],
          ...deploymentResult.warnings || []
        ].filter(Boolean)
      };

    } catch (error) {
      return {
        id: request.id,
        success: false,
        error: error instanceof Error ? error.message : 'Pipeline processing failed',
        metrics
      };
    }
  }

  /**
   * Advanced content validation with caching
   */
  private async validateContent(
    request: ContentProcessingRequest, 
    metrics: ProcessingMetrics
  ): Promise<Partial<ProcessingResult> & { success: boolean }> {

    try {
      // Check validation cache
        content: request.content,
        validationRules: this.config.optimizationLevel
      });
      
      if (cachedValidation) {
        metrics.cacheHits++;
        metrics.validationTime = Date.now() - startTime;
        return {
          success: true,
          validatedContent: cachedValidation as GameManifest
        };
      }

      metrics.cacheMisses++;

      // Perform validation using microservice

      await this.validation.submitValidation(validationRequest);
      
      // Poll for result with timeout
        validationRequest.id, 
        this.config.contentValidationTimeout
      );

      if (!validationResult?.success || !validationResult.result?.isValid) {
        return {
          success: false,
          error: 'Content validation failed',
          warnings: validationResult?.result?.errors.map(e => e.message) || ['Validation timeout']
        };
      }

      // Apply advanced optimizations based on validation results
        request.content, 
        validationResult.result
      );

      // Cache validation result
      await this.redis.set(validationCacheKey, optimizedContent, { 
        ttl: 1800, // 30 minutes
        tags: ['validation', 'devteam-content']
      });

      metrics.validationTime = Date.now() - startTime;

      return {
        success: true,
        validatedContent: optimizedContent
      };

    } catch (error) {
      metrics.validationTime = Date.now() - startTime;
      return {
        success: false,
        error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Advanced asset optimization
   */
  private async optimizeAssets(
    request: ContentProcessingRequest,
    metrics: ProcessingMetrics
  ): Promise<Partial<ProcessingResult> & { success: boolean }> {

    try {
      const optimizedScenes: BaseScene[] = [];
      const bundledScripts: string[] = [];
      const optimizedImages: AssetManifest[] = [];
      let totalOriginalSize = 0;
      let totalOptimizedSize = 0;

      // Optimize scenes
      for (const scene of scenes) {
        optimizedScenes.push(optimizedScene.scene);
        totalOriginalSize += optimizedScene.originalSize;
        totalOptimizedSize += optimizedScene.optimizedSize;
        
        if (optimizedScene.scripts) {
          bundledScripts.push(...optimizedScene.scripts);
        }
        
        if (optimizedScene.images) {
          optimizedImages.push(...optimizedScene.images);
        }
      }

      // Bundle and minify scripts
      
      // Generate optimized styles

      const optimizedAssets: OptimizedAssets = {
        compressedScenes: optimizedScenes,
        bundledScripts: minifiedScripts,
        optimizedImages,
        minifiedStyles,
        totalSize: totalOptimizedSize,
        compressionRatio: totalOriginalSize > 0 ? totalOptimizedSize / totalOriginalSize : 1
      };

      metrics.optimizationTime = Date.now() - startTime;
      metrics.assetsProcessed = scenes.length + bundledScripts.length + optimizedImages.length;
      metrics.compressionSavings = totalOriginalSize - totalOptimizedSize;

      return {
        success: true,
        optimizedAssets
      };

    } catch (error) {
      metrics.optimizationTime = Date.now() - startTime;
      return {
        success: false,
        error: `Asset optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Create deployment package
   */
  private async createDeploymentPackage(
    request: ContentProcessingRequest,
    metrics: ProcessingMetrics,
    optimizationResult: Partial<ProcessingResult>
  ): Promise<Partial<ProcessingResult> & { success: boolean }> {

    try {
      if (!optimizationResult.optimizedAssets) {
        throw new Error('Missing optimized assets');
      }

      // Generate version based on content hash and timestamp
      
      const deploymentPackage: DeploymentPackage = {
        version,
        manifest: {
          ...request.content,
          scenes: optimizationResult.optimizedAssets.compressedScenes,
          version: version
        },
        assets: optimizationResult.optimizedAssets,
        metadata: {
          buildTime: Date.now(),
          targetEnvironments: this.getTargetEnvironments(request.metadata.contentType),
          rollbackVersion: await this.getPreviousVersion(request.content.gameId)
        }
      };

      // Validate deployment package size
      if (deploymentPackage.assets.totalSize > this.getMaxPackageSize()) {
        return {
          success: false,
          error: `Deployment package too large: ${deploymentPackage.assets.totalSize} bytes exceeds limit`,
          warnings: [`Consider reducing asset sizes or using progressive loading`]
        };
      }

      metrics.deploymentTime = Date.now() - startTime;

      return {
        success: true,
        deploymentPackage
      };

    } catch (error) {
      metrics.deploymentTime = Date.now() - startTime;
      return {
        success: false,
        error: `Deployment package creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Helper methods
   */
  private async optimizeScene(scene: BaseScene): Promise<{
    scene: BaseScene;
    originalSize: number;
    optimizedSize: number;
    scripts?: string[];
    images?: AssetManifest[];
  }> {
    
    // Create optimized copy
    const optimizedScene: BaseScene = {
      ...scene,
      // Remove development-only fields
      ...(process.env.NODE_ENV === 'production' && {
        debug: undefined,
        devNotes: undefined
      })
    };

    // Optimize text content
    if (optimizedScene.type === 'dialogue' && 'messages' in optimizedScene) {
      optimizedScene.messages = optimizedScene.messages?.map(msg => ({
        ...msg,
        text: this.optimizeText(msg.text)
      }));
    }


    return {
      scene: optimizedScene,
      originalSize,
      optimizedSize
    };
  }

  private optimizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .replace(/\n\s*\n/g, '\n'); // Remove extra line breaks
  }

  private async bundleAndMinifyScripts(scripts: string[]): Promise<string[]> {
    // In production, this would use a real bundler
    return scripts.map(script => script.replace(/\s+/g, ' ').trim());
  }

  private async generateOptimizedStyles(content: GameManifest): Promise<string> {
    // Generate minimal CSS based on content requirements
    return `
      .game-container { max-width: 100%; margin: 0 auto; }
      .scene { padding: 1rem; }
      .dialogue { margin-bottom: 1rem; }
      .quiz { background: #f5f5f5; padding: 1rem; border-radius: 4px; }
    `.replace(/\s+/g, ' ').trim();
  }

  private generateContentHash(content: Record<string, unknown>): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private createEmptyMetrics(): ProcessingMetrics {
    return {
      validationTime: 0,
      optimizationTime: 0,
      deploymentTime: 0,
      totalTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      assetsProcessed: 0,
      compressionSavings: 0
    };
  }

  private groupByPriority(requests: ContentProcessingRequest[]): Map<string, ContentProcessingRequest[]> {
    
    for (const request of requests) {
      if (!groups.has(priority)) {
        groups.set(priority, []);
      }
      groups.get(priority)!.push(request);
    }
    
    return groups;
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async pollForValidationResult(id: string, timeout: number): Promise<Record<string, unknown>> {
    
    while (Date.now() - startTime < timeout) {
      if (result) {
        return result;
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    return null;
  }

  private async applyContentOptimizations(content: GameManifest, validationResult: Record<string, unknown>): Promise<GameManifest> {
    // Apply optimizations based on validation warnings and performance hints
    return {
      ...content,
      scenes: content.scenes?.map(scene => ({
        ...scene,
        // Optimize based on validation feedback
        ...(validationResult.warnings?.some((w: Record<string, unknown>) => w.type === 'performance') && {
          preload: true
        })
      }))
    };
  }

  private async validatePerformance(result: Partial<ProcessingResult>, metrics: ProcessingMetrics): Promise<void> {
    if (!result.deploymentPackage) return;
    
    // Check if we meet the <30 second target
    if (metrics.totalTime > 30000) {
      throw new Error(`Processing time ${metrics.totalTime}ms exceeds 30 second target`);
    }
    
    // Validate package size for municipal networks
    if (result.deploymentPackage.assets.totalSize > maxSize) {
      throw new Error(`Package size ${result.deploymentPackage.assets.totalSize} exceeds municipal network limit`);
    }
  }

  private isCacheValid(cached: ProcessingResult, request: ContentProcessingRequest): boolean {
    // Cache is valid if content and processing requirements match
    return cached.success && 
           cached.deploymentPackage?.assets.totalSize !== undefined &&
           Date.now() - request.metadata.timestamp < this.getCacheTTL(request.metadata.contentType) * 1000;
  }

  private getCacheTTL(contentType: string): number {
    switch (contentType) {
      case 'hotfix': return 300; // 5 minutes
      case 'update': return 1800; // 30 minutes
      case 'game': return 3600; // 1 hour
      default: return 1800;
    }
  }

  private getTargetEnvironments(contentType: string): string[] {
    switch (contentType) {
      case 'hotfix': return ['production'];
      case 'update': return ['staging', 'production'];
      case 'game': return ['development', 'staging', 'production'];
      default: return ['staging'];
    }
  }

  private async getPreviousVersion(gameId: string): Promise<string | undefined> {
    return await this.redis.get<string>(versionKey);
  }

  private getMaxPackageSize(): number {
    // Based on municipal network constraints
    switch (this.config.optimizationLevel) {
      case 'fast': return 2 * 1024 * 1024; // 2MB
      case 'balanced': return 1 * 1024 * 1024; // 1MB
      case 'thorough': return 512 * 1024; // 512KB
      default: return 1 * 1024 * 1024;
    }
  }

  private updateCacheStats(hit: boolean): void {
    if (hit) {
      this.batchStats.cacheEfficiency = (this.batchStats.cacheEfficiency * this.batchStats.totalRequests + 1) / (this.batchStats.totalRequests + 1);
    }
  }

  private updateBatchStats(result: ProcessingResult): void {
    if (result.success) {
      this.batchStats.processedRequests++;
    } else {
      this.batchStats.failedRequests++;
    }
    
    this.batchStats.averageProcessingTime = (totalTime + result.metrics.totalTime) / (this.batchStats.processedRequests + this.batchStats.failedRequests);
  }

  private startBatchProcessor(): void {
    setInterval(() => {
      this.processPendingQueue();
    }, 1000); // Check every second
  }

  private async processPendingQueue(): Promise<void> {
    if (availableSlots <= 0) return;

    const _pending = Array.from(this.processingQueue.values())
      .sort((a, b) => {
        // Sort by priority, then by timestamp
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        return a.metadata.timestamp - b.metadata.timestamp;
      })
      .slice(0, availableSlots);

    for (const request of pending) {
      this.processContent(request);
    }
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.collectMetrics();
    }, 30000); // Every 30 seconds
  }

  private collectMetrics(): void {
    this.monitoring.recordMetric({
      name: 'devteam_pipeline_queue_size',
      value: this.processingQueue.size,
      unit: 'count',
      timestamp: Date.now()
    });

    this.monitoring.recordMetric({
      name: 'devteam_pipeline_active_jobs',
      value: this.activeJobs.size,
      unit: 'count',
      timestamp: Date.now()
    });

    this.monitoring.recordMetric({
      name: 'devteam_pipeline_throughput',
      value: this.batchStats.throughputPerMinute,
      unit: 'count',
      timestamp: Date.now()
    });

    this.monitoring.recordMetric({
      name: 'devteam_pipeline_cache_efficiency',
      value: this.batchStats.cacheEfficiency * 100,
      unit: 'percent',
      timestamp: Date.now()
    });
  }

  /**
   * Get current pipeline statistics
   */
  getStats(): BatchProcessingStats & { activeJobs: number; queueSize: number } {
    // Calculate throughput
    
    this.batchStats.throughputPerMinute = this.batchStats.processedRequests; // Simplified for demo

    return {
      ...this.batchStats,
      activeJobs: this.activeJobs.size,
      queueSize: this.processingQueue.size
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down DevTeam API Pipeline...');
    
    // Wait for active jobs to complete (with timeout)
    
    while (this.activeJobs.size > 0 && (Date.now() - startTime) < shutdownTimeout) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('DevTeam API Pipeline shutdown complete');
  }
}

// Export default configuration
export const defaultPipelineConfig: DevTeamPipelineConfig = {
  maxConcurrentProcessing: 10,
  batchSize: 5,
  cacheStrategy: 'balanced',
  contentValidationTimeout: 10000, // 10 seconds
  deploymentTimeout: 20000, // 20 seconds
  optimizationLevel: 'balanced'
};

// Export singleton factory
let pipelineInstance: DevTeamAPIPipeline | null = null;

export function getDevTeamPipeline(config?: Partial<DevTeamPipelineConfig>): DevTeamAPIPipeline {
  if (!pipelineInstance) {
    pipelineInstance = new DevTeamAPIPipeline({
      ...defaultPipelineConfig,
      ...config
    });
  }
  return pipelineInstance;
}