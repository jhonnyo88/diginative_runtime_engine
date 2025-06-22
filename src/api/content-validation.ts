/**
 * Content Validation API Integration
 * Integrates DevTeamContentValidator into content submission pipeline
 * 
 * Roadmap Ref: Q1-AO-Milestone-1.2
 * Enables <30 seconds validation feedback for DevTeam
 */

import { Request, Response, NextFunction } from 'express';
import { DevTeamContentValidator } from '../validation/devteam-content-validator';
import { InfrastructureMonitoring } from '../services/infrastructure-monitoring';
import type { ValidationResult, ValidationError, ValidationWarning } from '../validation/devteam-content-validator';

// Cache for validated content schemas
const validationCache = new Map<string, CachedValidation>();

interface CachedValidation {
  hash: string;
  result: ValidationResult;
  timestamp: number;
  contentType: string;
}

interface ValidationRequest {
  content: unknown;
  contentType?: 'game' | 'scene' | 'quiz' | 'dialogue';
  userId?: string;
  teamId?: string;
}

interface ValidationResponse {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  processingTime: number;
  validationId: string;
  suggestions?: string[];
  cached?: boolean;
}

/**
 * Generate hash for content to enable caching
 */
function generateContentHash(content: unknown): string {
  const str = JSON.stringify(content);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Generate suggestions based on validation errors
 */
function generateSuggestions(errors: ValidationError[]): string[] {
  const suggestions: string[] = [];
  
  errors.forEach(error => {
    switch (error.type) {
      case 'missing':
        if (error.path.includes('title')) {
          suggestions.push('Add a title field to your content');
        } else if (error.path.includes('scenes')) {
          suggestions.push('Include at least one scene in your game manifest');
        }
        break;
      case 'invalid_type':
        if (error.path.includes('duration')) {
          suggestions.push('Duration should be a number in seconds');
        } else if (error.path.includes('options')) {
          suggestions.push('Quiz options should be an array of answer choices');
        }
        break;
      case 'invalid_value':
        if (error.message.includes('empty')) {
          suggestions.push('Ensure all text fields have content');
        }
        break;
    }
  });
  
  return [...new Set(suggestions)]; // Remove duplicates
}

/**
 * Content validation middleware
 * Validates incoming content before processing
 */
export async function validateContent(
  req: Request<Record<string, unknown>, Record<string, unknown>, ValidationRequest>,
  res: Response<ValidationResponse>,
  _next: NextFunction
): Promise<void> {
  const startTime = Date.now();
  const monitoring = InfrastructureMonitoring.getInstance();
  
  try {
    const { content, contentType = 'game', userId, teamId } = req.body;
    
    // Check if content is provided
    if (!content) {
      res.status(400).json({
        valid: false,
        errors: [{
          path: 'root',
          message: 'No content provided for validation',
          type: 'missing'
        }],
        warnings: [],
        processingTime: Date.now() - startTime,
        validationId: `val_${Date.now()}`,
        cached: false
      });
      return;
    }
    
    // Generate content hash for caching
    const contentHash = generateContentHash(content);
    const cacheKey = `${contentType}_${contentHash}`;
    
    // Check cache first
    const cached = validationCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < 3600000) { // 1 hour cache
      const processingTime = Date.now() - startTime;
      
      // Record cache hit metric
      monitoring.recordMetric({
        name: 'validation_cache_hit',
        value: 1,
        unit: 'count',
        timestamp: Date.now(),
        tags: { contentType }
      });
      
      res.json({
        ...cached.result,
        processingTime,
        validationId: `val_${Date.now()}`,
        cached: true,
        suggestions: generateSuggestions(cached.result.errors)
      });
      return;
    }
    
    // Perform validation
    const validator = new DevTeamContentValidator();
    let result: ValidationResult;
    
    switch (contentType) {
      case 'scene':
        result = validator.validateScene(content);
        break;
      case 'quiz':
        result = validator.validateQuizScene(content);
        break;
      case 'dialogue':
        result = validator.validateDialogueScene(content);
        break;
      case 'game':
      default:
        result = validator.validateGameManifest(content);
    }
    
    // Cache the result
    validationCache.set(cacheKey, {
      hash: contentHash,
      result,
      timestamp: Date.now(),
      contentType
    });
    
    // Clean old cache entries
    if (validationCache.size > 1000) {
      const entries = Array.from(validationCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      entries.slice(0, 100).forEach(([key]) => validationCache.delete(key));
    }
    
    const processingTime = Date.now() - startTime;
    
    // Record validation metrics
    monitoring.recordMetric({
      name: 'validation_processing_time',
      value: processingTime,
      unit: 'ms',
      timestamp: Date.now(),
      tags: { 
        contentType, 
        valid: result.isValid.toString(),
        userId: userId || 'anonymous',
        teamId: teamId || 'unknown'
      }
    });
    
    monitoring.recordMetric({
      name: 'validation_error_count',
      value: result.errors.length,
      unit: 'count',
      timestamp: Date.now(),
      tags: { contentType }
    });
    
    // Generate response
    const response: ValidationResponse = {
      valid: result.isValid,
      errors: result.errors,
      warnings: result.warnings,
      processingTime,
      validationId: `val_${Date.now()}`,
      suggestions: generateSuggestions(result.errors),
      cached: false
    };
    
    // Log validation for audit trail
    if (!result.isValid) {
      monitoring.reportMessage(
        `Content validation failed: ${result.errors.length} errors for ${contentType}`,
        'warning'
      );
    }
    
    res.json(response);
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    monitoring.reportError(error as Error, {
      endpoint: 'content-validation',
      processingTime
    });
    
    res.status(500).json({
      valid: false,
      errors: [{
        path: 'root',
        message: 'Internal validation error',
        type: 'structure'
      }],
      warnings: [],
      processingTime,
      validationId: `val_${Date.now()}`,
      cached: false
    });
  }
}

/**
 * Batch validation endpoint for multiple content items
 */
export async function validateBatch(
  req: Request<{}, {}, { items: ValidationRequest[] }>,
  res: Response<{ results: ValidationResponse[]; totalProcessingTime: number }>
): Promise<void> {
  const startTime = Date.now();
  const monitoring = InfrastructureMonitoring.getInstance();
  
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      res.status(400).json({
        results: [],
        totalProcessingTime: Date.now() - startTime
      });
      return;
    }
    
    // Validate each item in parallel
    const results = await Promise.all(
      items.map(async (item) => {
        const itemStart = Date.now();
        const validator = new DevTeamContentValidator();
        
        const result = validator.validateGameManifest(item.content);
        
        return {
          valid: result.isValid,
          errors: result.errors,
          warnings: result.warnings,
          processingTime: Date.now() - itemStart,
          validationId: `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          suggestions: generateSuggestions(result.errors),
          cached: false
        };
      })
    );
    
    const totalProcessingTime = Date.now() - startTime;
    
    // Record batch metrics
    monitoring.recordMetric({
      name: 'batch_validation_size',
      value: items.length,
      unit: 'count',
      timestamp: Date.now()
    });
    
    monitoring.recordMetric({
      name: 'batch_validation_time',
      value: totalProcessingTime,
      unit: 'ms',
      timestamp: Date.now()
    });
    
    res.json({
      results,
      totalProcessingTime
    });
    
  } catch (error) {
    monitoring.reportError(error as Error, {
      endpoint: 'batch-validation'
    });
    
    res.status(500).json({
      results: [],
      totalProcessingTime: Date.now() - startTime
    });
  }
}

/**
 * Real-time validation WebSocket handler
 * Provides instant feedback during content creation
 */
export function setupRealtimeValidation(io: Record<string, unknown>): void {
  const monitoring = InfrastructureMonitoring.getInstance();
  
  io.on('connection', (socket: Record<string, unknown>) => {
    console.log('DevTeam editor connected for real-time validation');
    
    socket.on('validate', async (data: ValidationRequest) => {
      const startTime = Date.now();
      
      try {
        const validator = new DevTeamContentValidator();
        const result = validator.validateGameManifest(data.content);
        
        const processingTime = Date.now() - startTime;
        
        // Emit validation result
        socket.emit('validation-result', {
          valid: result.isValid,
          errors: result.errors,
          warnings: result.warnings,
          processingTime,
          suggestions: generateSuggestions(result.errors)
        });
        
        // Record real-time validation metric
        monitoring.recordMetric({
          name: 'realtime_validation_time',
          value: processingTime,
          unit: 'ms',
          timestamp: Date.now()
        });
        
      } catch (error) {
        socket.emit('validation-error', {
          error: 'Validation failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
    
    socket.on('disconnect', () => {
      console.log('DevTeam editor disconnected');
    });
  });
}

/**
 * Validation health check endpoint
 */
export function validationHealthCheck(req: Request, res: Response): void {
  const monitoring = InfrastructureMonitoring.getInstance();
  
  // Test validation with sample content
  const testContent = {
    title: 'Health Check Test',
    description: 'Test game for validation health check',
    scenes: [{
      id: 'test-scene',
      type: 'quiz',
      title: 'Test Quiz',
      questions: [{
        text: 'Test question?',
        options: ['A', 'B', 'C'],
        correctAnswer: 0
      }]
    }]
  };
  
  const validator = new DevTeamContentValidator();
  const startTime = Date.now();
  const result = validator.validateGameManifest(testContent);
  const processingTime = Date.now() - startTime;
  
  const healthStatus = monitoring.getHealthStatus();
  
  res.json({
    status: 'healthy',
    validationWorking: result.isValid,
    processingTime,
    cacheSize: validationCache.size,
    infrastructureHealth: healthStatus.status,
    timestamp: new Date().toISOString()
  });
}

// Export validation router setup
export function setupValidationRoutes(router: Record<string, unknown>): void {
  router.post('/api/validate', validateContent);
  router.post('/api/validate/batch', validateBatch);
  router.get('/api/validate/health', validationHealthCheck);
}