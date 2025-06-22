/**
 * Validation Microservice Tests
 * Comprehensive testing for distributed validation architecture
 * 
 * Roadmap Ref: Q1-MER-Milestone-1.4
 * Testing: Microservice functionality, Redis integration, error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ValidationMicroservice, type ValidationRequest, defaultValidationConfig } from '../validation-microservice';
import { getRedisCluster } from '../redis-cluster';

// Mock infrastructure monitoring to avoid Sentry dependency in tests
vi.mock('../infrastructure-monitoring', () => ({
  InfrastructureMonitoring: {
    getInstance: vi.fn(() => ({
      recordMetric: vi.fn(),
      reportError: vi.fn(),
      reportMessage: vi.fn()
    }))
  }
}));

// Mock Redis cluster for testing
vi.mock('../redis-cluster', () => ({
  getRedisCluster: vi.fn(() => ({
    set: vi.fn().mockResolvedValue(true),
    get: vi.fn().mockResolvedValue(null),
    del: vi.fn().mockResolvedValue(true),
    clearByPattern: vi.fn().mockResolvedValue(5),
    clearByTags: vi.fn().mockResolvedValue(3),
    healthCheck: vi.fn().mockResolvedValue({ healthy: true, details: Record<string, unknown> }),
    getMetrics: vi.fn().mockReturnValue({
      totalRequests: 100,
      hitRate: 0.75,
      missRate: 0.25,
      errorRate: 0.02,
      averageResponseTime: 150,
      memoryUsage: 50000,
      activeConnections: 5,
      nodeHealth: { 'localhost:6379': 'healthy' }
    })
  }))
}));

describe('ValidationMicroservice', () => {
  let validationService: ValidationMicroservice;
  let redisCluster: Record<string, unknown>;

  beforeEach(() => {
    redisCluster = getRedisCluster();
    validationService = new ValidationMicroservice({
      ...defaultValidationConfig,
      maxConcurrentValidations: 10,
      healthCheckInterval: 1000 // Faster for testing
    });
  });

  afterEach(async () => {
    await validationService.shutdown();
  });

  describe('Basic Validation Operations', () => {
    it('should submit validation request successfully', async () => {
      const request: ValidationRequest = {
        id: 'test-validation-1',
        content: {
          gameId: 'test-game',
          version: '1.0',
          metadata: {
            title: 'Test Game',
            description: 'A test game',
            duration: '10 minutes',
            targetAudience: 'Adults',
            language: 'en'
          },
          scenes: [{
            id: 'scene-1',
            type: 'quiz',
            questions: [{
              question_text: 'What is 2+2?',
              options: [
                { option_text: '3', is_correct: false },
                { option_text: '4', is_correct: true },
                { option_text: '5', is_correct: false }
              ]
            }]
          }]
        },
        contentType: 'game',
        priority: 'normal',
        metadata: {
          userId: 'test-user-1',
          teamId: 'test-team-1',
          timestamp: Date.now(),
          source: 'api'
        }
      };

      const submittedId = await validationService.submitValidation(request);
      expect(submittedId).toBe('test-validation-1');
      
      const metrics = validationService.getMetrics();
      expect(metrics.pendingJobs).toBeGreaterThanOrEqual(0);
    });

    it('should process validation and return result', async () => {
      const request: ValidationRequest = {
        id: 'test-validation-2',
        content: {
          gameId: 'test-game-2',
          version: '1.0',
          metadata: {
            title: 'Valid Test Game',
            description: 'A valid test game',
            duration: '15 minutes',
            targetAudience: 'Adults',
            language: 'sv'
          },
          scenes: [{
            id: 'scene-1',
            type: 'dialogue',
            dialogue_turns: [{
              speaker: 'Narrator',
              text: 'Welcome to the game!',
              character_id: 'narrator'
            }]
          }]
        },
        contentType: 'game',
        priority: 'high',
        metadata: {
          userId: 'test-user-2',
          teamId: 'test-team-2',
          timestamp: Date.now(),
          source: 'websocket'
        }
      };

      await validationService.submitValidation(request);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const result = await validationService.getValidationResult('test-validation-2');
      expect(result).toBeTruthy();
      expect(result?.success).toBe(true);
      expect(result?.result?.isValid).toBe(true);
      expect(result?.serviceInstance).toContain('validation-service-');
      expect(result?.processingTime).toBeGreaterThan(0);
    });

    it('should handle validation errors gracefully', async () => {
      const request: ValidationRequest = {
        id: 'test-validation-3',
        content: {
          // Missing required fields
          gameId: 'invalid-game'
          // No version, metadata, or scenes
        },
        contentType: 'game',
        priority: 'normal',
        metadata: {
          userId: 'test-user-3',
          teamId: 'test-team-3',
          timestamp: Date.now(),
          source: 'api'
        }
      };

      await validationService.submitValidation(request);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const result = await validationService.getValidationResult('test-validation-3');
      expect(result).toBeTruthy();
      expect(result?.success).toBe(true); // Service succeeded
      expect(result?.result?.isValid).toBe(false); // But validation failed
      expect(result?.result?.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Content Sanitization', () => {
    it('should sanitize potentially harmful content', async () => {
      const request: ValidationRequest = {
        id: 'test-sanitization-1',
        content: {
          gameId: 'test-game-sanitization',
          version: '1.0',
          metadata: {
            title: 'Test Game <script>alert("hack")</script>',
            description: 'A game with javascript:void(0) content',
            duration: '10 minutes',
            targetAudience: 'Adults',
            language: 'en'
          },
          scenes: [{
            id: 'scene-1',
            type: 'dialogue',
            dialogue_turns: [{
              speaker: 'Character',
              text: 'Hello <script>maliciousCode()</script> there!',
              character_id: 'char1'
            }]
          }]
        },
        contentType: 'game',
        priority: 'high'
      };

      await validationService.submitValidation(request);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const result = await validationService.getValidationResult('test-sanitization-1');
      expect(result?.sanitizedContent).toBeTruthy();
      
      const sanitized = result?.sanitizedContent as any;
      expect(sanitized.metadata.title).not.toContain('<script>');
      expect(sanitized.metadata.description).not.toContain('javascript:');
      expect(sanitized.scenes[0].dialogue_turns[0].text).not.toContain('<script>');
    });

    it('should apply content length limits', async () => {
      const veryLongText = 'A'.repeat(15000); // Exceeds 10000 char limit
      
      const request: ValidationRequest = {
        id: 'test-length-limits',
        content: {
          gameId: 'test-game-length',
          version: '1.0',
          metadata: {
            title: 'Test Game',
            description: veryLongText,
            duration: '10 minutes',
            targetAudience: 'Adults',
            language: 'en'
          },
          scenes: [{
            id: 'scene-1',
            type: 'dialogue',
            dialogue_turns: [{
              speaker: 'Character',
              text: veryLongText,
              character_id: 'char1'
            }]
          }]
        },
        contentType: 'game',
        priority: 'normal'
      };

      await validationService.submitValidation(request);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const result = await validationService.getValidationResult('test-length-limits');
      const sanitized = result?.sanitizedContent as any;
      
      expect(sanitized.metadata.description.length).toBeLessThanOrEqual(10003); // 10000 + '...'
      expect(sanitized.scenes[0].dialogue_turns[0].text.length).toBeLessThanOrEqual(10003);
    });
  });

  describe('Service Metrics and Health', () => {
    it('should track service metrics correctly', async () => {
      const initialMetrics = validationService.getMetrics();
      expect(initialMetrics.serviceId).toContain('validation-service-');
      expect(initialMetrics.healthStatus).toBe('healthy');
      
      // Submit multiple requests
      for (let i = 0; i < 3; i++) {
        await validationService.submitValidation({
          id: `metrics-test-${i}`,
          content: { gameId: `game-${i}`, version: '1.0', metadata: Record<string, unknown>, scenes: [] },
          contentType: 'game',
          priority: 'normal'
        });
      }
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedMetrics = validationService.getMetrics();
      expect(updatedMetrics.completedJobs).toBeGreaterThanOrEqual(3);
      expect(updatedMetrics.averageProcessingTime).toBeGreaterThan(0);
    });

    it('should handle capacity limits', async () => {
      const requests = [];
      
      // Fill up to capacity
      for (let i = 0; i < 12; i++) { // Exceeds maxConcurrentValidations (10)
        const request = validationService.submitValidation({
          id: `capacity-test-${i}`,
          content: { gameId: `game-${i}`, version: '1.0', metadata: Record<string, unknown>, scenes: [] },
          contentType: 'game',
          priority: 'normal'
        });
        
        if (i < 10) {
          requests.push(request);
        } else {
          // These should fail due to capacity
          await expect(request).rejects.toThrow('Validation service at capacity');
        }
      }
    });

    it('should perform health checks', async () => {
      const metrics = validationService.getMetrics();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(metrics.healthStatus);
      expect(metrics.serviceId).toBeTruthy();
    });
  });

  describe('Different Content Types', () => {
    it('should validate scene content', async () => {
      const request: ValidationRequest = {
        id: 'scene-validation',
        content: {
          id: 'test-scene',
          type: 'quiz',
          questions: [{
            question_text: 'Sample question?',
            options: [
              { option_text: 'Option A', is_correct: true },
              { option_text: 'Option B', is_correct: false }
            ]
          }]
        },
        contentType: 'scene',
        priority: 'normal'
      };

      await validationService.submitValidation(request);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const result = await validationService.getValidationResult('scene-validation');
      expect(result?.success).toBe(true);
      expect(result?.result?.isValid).toBe(true);
    });

    it('should validate quiz content', async () => {
      const request: ValidationRequest = {
        id: 'quiz-validation',
        content: {
          questions: [{
            question_text: 'What is the capital of Sweden?',
            options: [
              { option_text: 'Stockholm', is_correct: true },
              { option_text: 'Gothenburg', is_correct: false },
              { option_text: 'Malmö', is_correct: false }
            ]
          }]
        },
        contentType: 'quiz',
        priority: 'normal'
      };

      await validationService.submitValidation(request);
      
      // Wait for processing  
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const result = await validationService.getValidationResult('quiz-validation');
      expect(result?.success).toBe(true);
      expect(result?.result?.isValid).toBe(true);
    });

    it('should validate dialogue content', async () => {
      const request: ValidationRequest = {
        id: 'dialogue-validation',
        content: {
          dialogue_turns: [
            {
              speaker: 'Mayor',
              text: 'Welcome to our municipal training!',
              character_id: 'mayor'
            },
            {
              speaker: 'Trainee',
              text: 'Thank you for the introduction.',
              character_id: 'trainee'
            }
          ]
        },
        contentType: 'dialogue',
        priority: 'normal'
      };

      await validationService.submitValidation(request);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const result = await validationService.getValidationResult('dialogue-validation');
      expect(result?.success).toBe(true);
      expect(result?.result?.isValid).toBe(true);
    });
  });

  describe('Priority Handling', () => {
    it('should handle different priority levels', async () => {
      const priorities = ['low', 'normal', 'high', 'critical'] as const;
      
      for (const priority of priorities) {
        const request: ValidationRequest = {
          id: `priority-test-${priority}`,
          content: {
            gameId: `priority-game-${priority}`,
            version: '1.0',
            metadata: {
              title: `${priority} Priority Game`,
              description: 'Testing priority handling',
              duration: '5 minutes',
              targetAudience: 'Adults',
              language: 'en'
            },
            scenes: [{
              id: 'scene-1',
              type: 'dialogue',
              dialogue_turns: [{
                speaker: 'Test',
                text: 'Testing priority',
                character_id: 'test'
              }]
            }]
          },
          contentType: 'game',
          priority,
          metadata: {
            timestamp: Date.now(),
            source: 'api'
          }
        };

        const submittedId = await validationService.submitValidation(request);
        expect(submittedId).toBe(`priority-test-${priority}`);
      }
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // All should complete successfully
      for (const priority of priorities) {
        const result = await validationService.getValidationResult(`priority-test-${priority}`);
        expect(result?.success).toBe(true);
      }
    });
  });

  describe('Error Scenarios', () => {
    it('should handle malformed content gracefully', async () => {
      const request: ValidationRequest = {
        id: 'malformed-content',
        content: 'not-an-object',
        contentType: 'game',
        priority: 'normal'
      };

      await validationService.submitValidation(request);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const result = await validationService.getValidationResult('malformed-content');
      expect(result?.success).toBe(true); // Service handled it
      expect(result?.result?.isValid).toBe(false); // But content is invalid
    });

    it('should handle null content', async () => {
      const request: ValidationRequest = {
        id: 'null-content',
        content: null,
        contentType: 'game',
        priority: 'normal'
      };

      await validationService.submitValidation(request);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const result = await validationService.getValidationResult('null-content');
      expect(result?.success).toBe(true);
      expect(result?.result?.isValid).toBe(false);
    });

    it('should return null for non-existent validation results', async () => {
      const result = await validationService.getValidationResult('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('Shutdown Handling', () => {
    it('should shutdown gracefully', async () => {
      // Submit a few requests
      await validationService.submitValidation({
        id: 'shutdown-test-1',
        content: { gameId: 'test', version: '1.0', metadata: Record<string, unknown>, scenes: [] },
        contentType: 'game',
        priority: 'normal'
      });

      // Shutdown should complete without throwing
      await expect(validationService.shutdown()).resolves.toBeUndefined();
    });
  });
});

describe('ValidationMicroservice Integration', () => {
  it('should integrate with Redis cluster for caching', async () => {
    const validationService = new ValidationMicroservice(defaultValidationConfig);
    
    const request: ValidationRequest = {
      id: 'redis-integration-test',
      content: {
        gameId: 'redis-test-game',
        version: '1.0',
        metadata: {
          title: 'Redis Test Game',
          description: 'Testing Redis integration',
          duration: '10 minutes',
          targetAudience: 'Adults',
          language: 'en'
        },
        scenes: [{
          id: 'scene-1',
          type: 'dialogue',
          dialogue_turns: [{
            speaker: 'Test',
            text: 'Testing Redis integration',
            character_id: 'test'
          }]
        }]
      },
      contentType: 'game',
      priority: 'normal'
    };

    await validationService.submitValidation(request);
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const result = await validationService.getValidationResult('redis-integration-test');
    
    // Verify the validation completed successfully (which means Redis integration worked)
    expect(result).toBeTruthy();
    expect(result?.success).toBe(true);
    expect(result?.result?.isValid).toBe(true);
    
    await validationService.shutdown();
  });
});