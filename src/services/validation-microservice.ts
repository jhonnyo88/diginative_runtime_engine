/**
 * Validation Microservice
 * Extract content validation to independent microservice architecture
 * 
 * Roadmap Ref: Q1-MER-Milestone-1.4 
 * Business Impact: Enables DevTeam scaling through distributed validation
 */

import { DevTeamContentValidator, type ValidationResult } from '../validation/devteam-content-validator';
import { InfrastructureMonitoring } from './infrastructure-monitoring';
import { getRedisCluster, type RedisClusterService } from './redis-cluster';

export interface ValidationServiceConfig {
  port: number;
  redisUrl: string;
  maxConcurrentValidations: number;
  healthCheckInterval: number;
  cacheTTL: number;
}

export interface ValidationRequest {
  id: string;
  content: unknown;
  contentType: 'game' | 'scene' | 'quiz' | 'dialogue';
  priority: 'low' | 'normal' | 'high' | 'critical';
  metadata?: {
    userId?: string;
    teamId?: string;
    timestamp: number;
    source: 'api' | 'websocket' | 'batch';
  };
}

export interface ValidationResponse {
  id: string;
  success: boolean;
  result?: ValidationResult;
  error?: string;
  processingTime: number;
  serviceInstance: string;
  cached: boolean;
  sanitizedContent?: unknown;
}

export interface ValidationQueueMetrics {
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  cacheHitRate: number;
}

/**
 * Distributed validation service with Redis backing
 */
export class ValidationMicroservice {
  private config: ValidationServiceConfig;
  private monitoring: InfrastructureMonitoring;
  private validator: DevTeamContentValidator;
  private redis: RedisClusterService;
  private serviceId: string;
  private processingQueue: Map<string, ValidationRequest> = new Map();
  private completedJobs: Map<string, ValidationResponse> = new Map();
  private healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  private metrics: ValidationQueueMetrics = {
    pendingJobs: 0,
    processingJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    averageProcessingTime: 0,
    cacheHitRate: 0
  };

  constructor(config: ValidationServiceConfig) {
    this.config = config;
    this.monitoring = InfrastructureMonitoring.getInstance();
    this.validator = new DevTeamContentValidator();
    this.redis = getRedisCluster();
    this.serviceId = `validation-service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.startHealthChecks();
    this.startMetricsCollection();
  }

  /**
   * Submit validation request to queue
   */
  async submitValidation(request: ValidationRequest): Promise<string> {
    try {
      // Check if we're at capacity
      if (this.processingQueue.size >= this.config.maxConcurrentValidations) {
        throw new Error('Validation service at capacity');
      }

      // Add to processing queue
      this.processingQueue.set(request.id, request);
      this.metrics.pendingJobs = this.processingQueue.size;

      // Process immediately (in production, this would use Redis pub/sub)
      setImmediate(() => this.processValidation(request));

      this.monitoring.recordMetric({
        name: 'validation_request_submitted',
        value: 1,
        unit: 'count',
        timestamp: Date.now(),
        tags: {
          contentType: request.contentType,
          priority: request.priority,
          serviceInstance: this.serviceId
        }
      });

      return request.id;
    } catch (error) {
      this.monitoring.reportError(error as Error, {
        context: 'validation_submission',
        requestId: request.id
      });
      throw error;
    }
  }

  /**
   * Get validation result
   */
  async getValidationResult(id: string): Promise<ValidationResponse | null> {
    return this.completedJobs.get(id) || null;
  }

  /**
   * Process validation request
   */
  private async processValidation(request: ValidationRequest): Promise<void> {
    const startTime = Date.now();
    
    try {
      this.metrics.processingJobs++;
      this.processingQueue.delete(request.id);

      // Check cache first
      const cacheKey = `validation:${this.generateContentHash(request.content)}`;
      const cachedResult = await this.redis.get<ValidationResult>(cacheKey);
      
      if (cachedResult) {
        const response: ValidationResponse = {
          id: request.id,
          success: true,
          result: cachedResult,
          processingTime: Date.now() - startTime,
          serviceInstance: this.serviceId,
          cached: true
        };
        
        this.completedJobs.set(request.id, response);
        this.metrics.processingJobs--;
        this.metrics.completedJobs++;
        this.updateCacheHitRate(true);
        return;
      }

      // Perform validation
      const result = await this.performValidation(request);
      
      // Apply sanitization pipeline
      const sanitizedContent = await this.sanitizeContent(request.content, result);

      const response: ValidationResponse = {
        id: request.id,
        success: true,
        result,
        processingTime: Date.now() - startTime,
        serviceInstance: this.serviceId,
        cached: false,
        sanitizedContent
      };

      // Cache result
      await this.redis.set(cacheKey, result, { ttl: this.config.cacheTTL });
      this.completedJobs.set(request.id, response);
      
      this.metrics.processingJobs--;
      this.metrics.completedJobs++;
      this.updateAverageProcessingTime(response.processingTime);
      this.updateCacheHitRate(false);

      this.monitoring.recordMetric({
        name: 'validation_completed',
        value: 1,
        unit: 'count',
        timestamp: Date.now(),
        tags: {
          contentType: request.contentType,
          valid: result.isValid.toString(),
          serviceInstance: this.serviceId,
          cached: 'false'
        }
      });

    } catch (error) {
      const response: ValidationResponse = {
        id: request.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown validation error',
        processingTime: Date.now() - startTime,
        serviceInstance: this.serviceId,
        cached: false
      };

      this.completedJobs.set(request.id, response);
      this.metrics.processingJobs--;
      this.metrics.failedJobs++;

      this.monitoring.reportError(error as Error, {
        context: 'validation_processing',
        requestId: request.id,
        contentType: request.contentType
      });
    }
  }

  /**
   * Perform actual validation
   */
  private async performValidation(request: ValidationRequest): Promise<ValidationResult> {
    switch (request.contentType) {
      case 'game':
        return this.validator.validateGameManifest(request.content);
      case 'scene':
        return this.validator.validateSceneContent(request.content);
      case 'quiz':
        return this.validator.validateQuizContent(request.content);
      case 'dialogue':
        return this.validator.validateDialogueContent(request.content);
      default:
        throw new Error(`Unsupported content type: ${request.contentType}`);
    }
  }

  /**
   * Advanced content sanitization pipeline
   */
  private async sanitizeContent(content: unknown, validationResult: ValidationResult): Promise<unknown> {
    if (!content || typeof content !== 'object') {
      return content;
    }

    const sanitized = JSON.parse(JSON.stringify(content)); // Deep clone

    // Remove potentially harmful content
    if (sanitized && typeof sanitized === 'object') {
      // Remove script tags and dangerous attributes
      this.sanitizeRecursive(sanitized);
      
      // Apply content length limits
      this.applyContentLimits(sanitized);
      
      // Normalize text encoding
      this.normalizeTextEncoding(sanitized);
    }

    return sanitized;
  }

  /**
   * Recursive sanitization
   */
  private sanitizeRecursive(obj: any): void {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remove script tags, dangerous protocols
        obj[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/vbscript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
        
        // Limit string length
        if (obj[key].length > 10000) {
          obj[key] = obj[key].substring(0, 10000) + '...';
        }
      } else if (Array.isArray(value)) {
        value.forEach(item => this.sanitizeRecursive(item));
      } else if (typeof value === 'object') {
        this.sanitizeRecursive(value);
      }
    }
  }

  /**
   * Apply content limits
   */
  private applyContentLimits(obj: any): void {
    if (!obj || typeof obj !== 'object') return;

    // Limit array sizes
    if (obj.scenes && Array.isArray(obj.scenes) && obj.scenes.length > 100) {
      obj.scenes = obj.scenes.slice(0, 100);
    }

    if (obj.questions && Array.isArray(obj.questions) && obj.questions.length > 50) {
      obj.questions = obj.questions.slice(0, 50);
    }

    if (obj.options && Array.isArray(obj.options) && obj.options.length > 10) {
      obj.options = obj.options.slice(0, 10);
    }
  }

  /**
   * Normalize text encoding
   */
  private normalizeTextEncoding(obj: any): void {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Normalize Unicode characters
        obj[key] = value.normalize('NFC');
      } else if (Array.isArray(value)) {
        value.forEach(item => this.normalizeTextEncoding(item));
      } else if (typeof value === 'object') {
        this.normalizeTextEncoding(value);
      }
    }
  }

  /**
   * Generate content hash for caching
   */
  private generateContentHash(content: unknown): string {
    const str = JSON.stringify(content);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }


  /**
   * Metrics updates
   */
  private updateAverageProcessingTime(newTime: number): void {
    const total = this.metrics.averageProcessingTime * this.metrics.completedJobs;
    this.metrics.averageProcessingTime = (total + newTime) / (this.metrics.completedJobs + 1);
  }

  private updateCacheHitRate(hit: boolean): void {
    const totalRequests = this.metrics.completedJobs + 1;
    const currentHits = this.metrics.cacheHitRate * this.metrics.completedJobs;
    this.metrics.cacheHitRate = (currentHits + (hit ? 1 : 0)) / totalRequests;
  }

  /**
   * Health monitoring
   */
  private startHealthChecks(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  private performHealthCheck(): void {
    const queueSize = this.processingQueue.size;
    const avgProcessingTime = this.metrics.averageProcessingTime;
    const errorRate = this.metrics.failedJobs / (this.metrics.completedJobs + this.metrics.failedJobs || 1);

    if (queueSize > this.config.maxConcurrentValidations * 0.9) {
      this.healthStatus = 'degraded';
    } else if (avgProcessingTime > 5000 || errorRate > 0.1) {
      this.healthStatus = 'degraded';
    } else if (queueSize > this.config.maxConcurrentValidations || errorRate > 0.25) {
      this.healthStatus = 'unhealthy';
    } else {
      this.healthStatus = 'healthy';
    }

    this.monitoring.recordMetric({
      name: 'validation_service_health',
      value: this.healthStatus === 'healthy' ? 1 : 0,
      unit: 'boolean',
      timestamp: Date.now(),
      tags: {
        serviceInstance: this.serviceId,
        status: this.healthStatus
      }
    });
  }

  /**
   * Metrics collection
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      this.collectMetrics();
    }, 30000); // Every 30 seconds
  }

  private collectMetrics(): void {
    this.monitoring.recordMetric({
      name: 'validation_queue_size',
      value: this.processingQueue.size,
      unit: 'count',
      timestamp: Date.now(),
      tags: { serviceInstance: this.serviceId }
    });

    this.monitoring.recordMetric({
      name: 'validation_average_processing_time',
      value: this.metrics.averageProcessingTime,
      unit: 'ms',
      timestamp: Date.now(),
      tags: { serviceInstance: this.serviceId }
    });

    this.monitoring.recordMetric({
      name: 'validation_cache_hit_rate',
      value: this.metrics.cacheHitRate * 100,
      unit: 'percent',
      timestamp: Date.now(),
      tags: { serviceInstance: this.serviceId }
    });
  }

  /**
   * Get service metrics
   */
  getMetrics(): ValidationQueueMetrics & { healthStatus: string; serviceId: string } {
    return {
      ...this.metrics,
      pendingJobs: this.processingQueue.size,
      healthStatus: this.healthStatus,
      serviceId: this.serviceId
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log(`Shutting down validation service ${this.serviceId}`);
    
    // Wait for current jobs to complete (with timeout)
    const shutdownTimeout = 30000; // 30 seconds
    const startTime = Date.now();
    
    while (this.processingQueue.size > 0 && (Date.now() - startTime) < shutdownTimeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Validation service ${this.serviceId} shutdown complete`);
  }
}

// Export default configuration
export const defaultValidationConfig: ValidationServiceConfig = {
  port: 3001,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  maxConcurrentValidations: 50,
  healthCheckInterval: 10000, // 10 seconds
  cacheTTL: 3600 // 1 hour
};

// Export singleton factory
let validationServiceInstance: ValidationMicroservice | null = null;

export function getValidationService(config?: Partial<ValidationServiceConfig>): ValidationMicroservice {
  if (!validationServiceInstance) {
    validationServiceInstance = new ValidationMicroservice({
      ...defaultValidationConfig,
      ...config
    });
  }
  return validationServiceInstance;
}