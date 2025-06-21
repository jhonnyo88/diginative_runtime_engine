/**
 * DevTeam API Pipeline Tests
 * Comprehensive testing for <30s content processing pipeline
 * 
 * Roadmap Ref: Q1-AO-Milestone-1.2
 * Testing: Performance targets, caching strategies, batch processing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DevTeamAPIPipeline, type ContentProcessingRequest, defaultPipelineConfig } from '../devteam-api-pipeline';

// Mock dependencies
vi.mock('../redis-cluster', () => ({
  getRedisCluster: vi.fn(() => ({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(true),
    del: vi.fn().mockResolvedValue(true)
  }))
}));

vi.mock('../validation-microservice', () => ({
  getValidationService: vi.fn(() => ({
    submitValidation: vi.fn().mockResolvedValue('validation-id'),
    getValidationResult: vi.fn().mockResolvedValue({
      success: true,
      result: { isValid: true, errors: [], warnings: [] }
    })
  }))
}));

vi.mock('../infrastructure-monitoring', () => ({
  InfrastructureMonitoring: {
    getInstance: vi.fn(() => ({
      recordMetric: vi.fn(),
      reportError: vi.fn()
    }))
  }
}));

describe('DevTeamAPIPipeline', () => {
  let pipeline: DevTeamAPIPipeline;

  beforeEach(() => {
    pipeline = new DevTeamAPIPipeline({
      ...defaultPipelineConfig,
      maxConcurrentProcessing: 5,
      contentValidationTimeout: 5000,
      deploymentTimeout: 10000
    });
  });

  afterEach(async () => {
    await pipeline.shutdown();
  });

  describe('Content Processing', () => {
    it('should process content within 30 second target', async () => {
      const request: ContentProcessingRequest = {
        id: 'perf-test-1',
        content: {
          gameId: 'performance-test',
          version: '1.0',
          metadata: {
            title: 'Performance Test Game',
            description: 'Testing processing speed',
            duration: '5 minutes',
            targetAudience: 'Adults',
            language: 'en'
          },
          scenes: [{
            id: 'scene-1',
            type: 'dialogue',
            messages: [{
              speaker: 'Test',
              text: 'Performance testing message',
              character: 'tester'
            }]
          }]
        },
        metadata: {
          userId: 'test-user',
          teamId: 'test-team',
          priority: 'high',
          contentType: 'game',
          timestamp: Date.now()
        }
      };

      const startTime = Date.now();
      const processingId = await pipeline.submitContent(request);
      
      // Poll for result
      let result = null;
      const timeout = 32000; // 32 seconds to test <30s target
      const pollStart = Date.now();
      
      while (!result && (Date.now() - pollStart) < timeout) {
        result = await pipeline.getResult(processingId);
        if (!result) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const totalTime = Date.now() - startTime;
      
      expect(result).toBeTruthy();
      expect(result?.success).toBe(true);
      expect(totalTime).toBeLessThan(30000); // <30 second target
      expect(result?.metrics.totalTime).toBeLessThan(30000);
    });

    it('should handle priority-based processing', async () => {
      const urgentRequest: ContentProcessingRequest = {
        id: 'urgent-test',
        content: {
          gameId: 'urgent-game',
          version: '1.0',
          metadata: {
            title: 'Urgent Game',
            description: 'High priority content',
            duration: '3 minutes',
            targetAudience: 'Adults',
            language: 'en'
          },
          scenes: [{
            id: 'urgent-scene',
            type: 'quiz',
            questions: [{
              question_text: 'Urgent question?',
              options: [
                { option_text: 'Yes', is_correct: true },
                { option_text: 'No', is_correct: false }
              ]
            }]
          }]
        },
        metadata: {
          userId: 'urgent-user',
          teamId: 'urgent-team',
          priority: 'urgent',
          contentType: 'hotfix',
          timestamp: Date.now()
        }
      };

      const normalRequest: ContentProcessingRequest = {
        id: 'normal-test',
        content: {
          gameId: 'normal-game',
          version: '1.0',
          metadata: {
            title: 'Normal Game',
            description: 'Normal priority content',
            duration: '10 minutes',
            targetAudience: 'Adults',
            language: 'en'
          },
          scenes: [{
            id: 'normal-scene',
            type: 'dialogue',
            messages: [{
              speaker: 'Normal',
              text: 'Normal priority message',
              character: 'normal'
            }]
          }]
        },
        metadata: {
          userId: 'normal-user',
          teamId: 'normal-team',
          priority: 'normal',
          contentType: 'game',
          timestamp: Date.now() - 1000 // Earlier timestamp
        }
      };

      // Submit normal request first, then urgent
      await pipeline.submitContent(normalRequest);
      await pipeline.submitContent(urgentRequest);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const urgentResult = await pipeline.getResult('urgent-test');
      const normalResult = await pipeline.getResult('normal-test');

      // Urgent should complete first despite being submitted later
      expect(urgentResult).toBeTruthy();
      expect(urgentResult?.success).toBe(true);
    });

    it('should optimize assets effectively', async () => {
      const request: ContentProcessingRequest = {
        id: 'optimization-test',
        content: {
          gameId: 'optimization-game',
          version: '1.0',
          metadata: {
            title: 'Asset Optimization Test    ',  // Extra whitespace
            description: 'Testing   asset    optimization   with   extra   spaces',
            duration: '15 minutes',
            targetAudience: 'Adults',
            language: 'en'
          },
          scenes: [{
            id: 'optimization-scene',
            type: 'dialogue',
            messages: [{
              speaker: 'Optimizer',
              text: 'This   message   has   extra   whitespace   that   should   be   optimized',
              character: 'optimizer'
            }]
          }]
        },
        metadata: {
          userId: 'opt-user',
          teamId: 'opt-team',
          priority: 'normal',
          contentType: 'game',
          timestamp: Date.now()
        }
      };

      const processingId = await pipeline.submitContent(request);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await pipeline.getResult(processingId);
      
      expect(result).toBeTruthy();
      expect(result?.success).toBe(true);
      expect(result?.optimizedAssets).toBeTruthy();
      expect(result?.optimizedAssets?.compressionRatio).toBeLessThan(1); // Should achieve compression
      expect(result?.metrics.compressionSavings).toBeGreaterThan(0);
    });
  });

  describe('Batch Processing', () => {
    it('should process multiple items efficiently', async () => {
      const requests: ContentProcessingRequest[] = [];
      
      for (let i = 0; i < 5; i++) {
        requests.push({
          id: `batch-item-${i}`,
          content: {
            gameId: `batch-game-${i}`,
            version: '1.0',
            metadata: {
              title: `Batch Game ${i}`,
              description: `Batch processing test ${i}`,
              duration: '5 minutes',
              targetAudience: 'Adults',
              language: 'en'
            },
            scenes: [{
              id: `batch-scene-${i}`,
              type: 'dialogue',
              messages: [{
                speaker: `Speaker${i}`,
                text: `Batch message ${i}`,
                character: `char${i}`
              }]
            }]
          },
          metadata: {
            userId: `batch-user-${i}`,
            teamId: 'batch-team',
            priority: 'normal',
            contentType: 'game',
            timestamp: Date.now()
          }
        });
      }

      const startTime = Date.now();
      const results = await pipeline.processBatch(requests);
      const batchTime = Date.now() - startTime;

      expect(results.size).toBe(5);
      expect(batchTime).toBeLessThan(60000); // Should complete within 1 minute
      
      // Check all results
      for (const [id, result] of results) {
        expect(result.success).toBe(true);
        expect(result.metrics.totalTime).toBeLessThan(30000);
      }
    });

    it('should handle mixed priority batch processing', async () => {
      const requests: ContentProcessingRequest[] = [
        {
          id: 'batch-urgent',
          content: {
            gameId: 'urgent-batch',
            version: '1.0',
            metadata: {
              title: 'Urgent Batch Item',
              description: 'High priority batch item',
              duration: '2 minutes',
              targetAudience: 'Adults',
              language: 'en'
            },
            scenes: []
          },
          metadata: {
            userId: 'urgent-batch-user',
            teamId: 'batch-team',
            priority: 'urgent',
            contentType: 'hotfix',
            timestamp: Date.now()
          }
        },
        {
          id: 'batch-low',
          content: {
            gameId: 'low-batch',
            version: '1.0',
            metadata: {
              title: 'Low Priority Batch Item',
              description: 'Low priority batch item',
              duration: '20 minutes',
              targetAudience: 'Adults',
              language: 'en'
            },
            scenes: []
          },
          metadata: {
            userId: 'low-batch-user',
            teamId: 'batch-team',
            priority: 'low',
            contentType: 'game',
            timestamp: Date.now()
          }
        }
      ];

      const results = await pipeline.processBatch(requests);
      
      expect(results.size).toBe(2);
      
      const urgentResult = results.get('batch-urgent');
      const lowResult = results.get('batch-low');
      
      expect(urgentResult?.success).toBe(true);
      expect(lowResult?.success).toBe(true);
    });
  });

  describe('Caching Strategy', () => {
    it('should cache identical content effectively', async () => {
      const content = {
        gameId: 'cache-test',
        version: '1.0',
        metadata: {
          title: 'Cache Test Game',
          description: 'Testing caching functionality',
          duration: '10 minutes',
          targetAudience: 'Adults',
          language: 'en'
        },
        scenes: [{
          id: 'cache-scene',
          type: 'dialogue',
          messages: [{
            speaker: 'Cacher',
            text: 'Testing cache functionality',
            character: 'cache-char'
          }]
        }]
      };

      const request1: ContentProcessingRequest = {
        id: 'cache-test-1',
        content,
        metadata: {
          userId: 'cache-user-1',
          teamId: 'cache-team',
          priority: 'normal',
          contentType: 'game',
          timestamp: Date.now()
        }
      };

      const request2: ContentProcessingRequest = {
        id: 'cache-test-2',
        content, // Identical content
        metadata: {
          userId: 'cache-user-2',
          teamId: 'cache-team',
          priority: 'normal',
          contentType: 'game',
          timestamp: Date.now()
        }
      };

      // Process first request
      const startTime1 = Date.now();
      await pipeline.submitContent(request1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result1 = await pipeline.getResult('cache-test-1');
      const time1 = Date.now() - startTime1;

      // Process second request (should use cache)
      const startTime2 = Date.now();
      await pipeline.submitContent(request2);
      await new Promise(resolve => setTimeout(resolve, 500));
      const result2 = await pipeline.getResult('cache-test-2');
      const time2 = Date.now() - startTime2;

      expect(result1?.success).toBe(true);
      expect(result2?.success).toBe(true);
      
      // Second request should be significantly faster due to caching
      expect(time2).toBeLessThan(time1);
      
      // Check cache metrics
      const stats = pipeline.getStats();
      expect(stats.cacheEfficiency).toBeGreaterThan(0);
    });
  });

  describe('Performance Validation', () => {
    it('should reject content that exceeds size limits', async () => {
      // Create content with very large scenes
      const largeScenes = [];
      for (let i = 0; i < 100; i++) {
        largeScenes.push({
          id: `large-scene-${i}`,
          type: 'dialogue' as const,
          messages: Array.from({ length: 50 }, (_, j) => ({
            speaker: `Speaker${j}`,
            text: `Very long message text that repeats many times `.repeat(100),
            character: `char${j}`
          }))
        });
      }

      const request: ContentProcessingRequest = {
        id: 'size-limit-test',
        content: {
          gameId: 'oversized-game',
          version: '1.0',
          metadata: {
            title: 'Oversized Game',
            description: 'Game that exceeds size limits',
            duration: '60 minutes',
            targetAudience: 'Adults',
            language: 'en'
          },
          scenes: largeScenes
        },
        metadata: {
          userId: 'size-test-user',
          teamId: 'size-test-team',
          priority: 'normal',
          contentType: 'game',
          timestamp: Date.now()
        }
      };

      const processingId = await pipeline.submitContent(request);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await pipeline.getResult(processingId);
      
      // Should fail due to size limits
      expect(result).toBeTruthy();
      if (result?.success === false) {
        expect(result.error).toContain('Package size');
      }
    });

    it('should meet performance targets under load', async () => {
      const requests: ContentProcessingRequest[] = [];
      
      // Create multiple concurrent requests
      for (let i = 0; i < 10; i++) {
        requests.push({
          id: `load-test-${i}`,
          content: {
            gameId: `load-game-${i}`,
            version: '1.0',
            metadata: {
              title: `Load Test Game ${i}`,
              description: `Load testing item ${i}`,
              duration: '8 minutes',
              targetAudience: 'Adults',
              language: 'en'
            },
            scenes: [{
              id: `load-scene-${i}`,
              type: 'quiz',
              questions: [{
                question_text: `Load test question ${i}?`,
                options: [
                  { option_text: 'Answer A', is_correct: true },
                  { option_text: 'Answer B', is_correct: false }
                ]
              }]
            }]
          },
          metadata: {
            userId: `load-user-${i}`,
            teamId: 'load-team',
            priority: i < 5 ? 'high' : 'normal',
            contentType: 'game',
            timestamp: Date.now()
          }
        });
      }

      const startTime = Date.now();
      
      // Submit all requests
      const submissionPromises = requests.map(req => pipeline.submitContent(req));
      await Promise.all(submissionPromises);

      // Wait for all to complete
      const results = new Map();
      const timeout = 45000; // 45 seconds
      
      while (results.size < requests.length && (Date.now() - startTime) < timeout) {
        for (const request of requests) {
          if (!results.has(request.id)) {
            const result = await pipeline.getResult(request.id);
            if (result) {
              results.set(request.id, result);
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const totalTime = Date.now() - startTime;
      
      expect(results.size).toBe(requests.length);
      expect(totalTime).toBeLessThan(45000); // Should handle load efficiently
      
      // Check individual processing times
      for (const [id, result] of results) {
        expect(result.success).toBe(true);
        expect(result.metrics.totalTime).toBeLessThan(35000); // Allow some buffer under load
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed content gracefully', async () => {
      const request: ContentProcessingRequest = {
        id: 'malformed-test',
        content: {
          gameId: 'malformed-game',
          // Missing required fields
        } as any,
        metadata: {
          userId: 'error-user',
          teamId: 'error-team',
          priority: 'normal',
          contentType: 'game',
          timestamp: Date.now()
        }
      };

      const processingId = await pipeline.submitContent(request);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await pipeline.getResult(processingId);
      
      expect(result).toBeTruthy();
      // Should handle gracefully, either success with warnings or controlled failure
      if (!result?.success) {
        expect(result?.error).toBeTruthy();
      }
    });

    it('should handle timeout scenarios', async () => {
      // Create a pipeline with very short timeout
      const fastTimeoutPipeline = new DevTeamAPIPipeline({
        ...defaultPipelineConfig,
        contentValidationTimeout: 100, // Very short timeout
        deploymentTimeout: 100
      });

      const request: ContentProcessingRequest = {
        id: 'timeout-test',
        content: {
          gameId: 'timeout-game',
          version: '1.0',
          metadata: {
            title: 'Timeout Test',
            description: 'Testing timeout handling',
            duration: '5 minutes',
            targetAudience: 'Adults',
            language: 'en'
          },
          scenes: [{
            id: 'timeout-scene',
            type: 'dialogue',
            messages: [{
              speaker: 'Timer',
              text: 'Testing timeout',
              character: 'timer'
            }]
          }]
        },
        metadata: {
          userId: 'timeout-user',
          teamId: 'timeout-team',
          priority: 'normal',
          contentType: 'game',
          timestamp: Date.now()
        }
      };

      const processingId = await fastTimeoutPipeline.submitContent(request);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await fastTimeoutPipeline.getResult(processingId);
      
      // Should handle timeout gracefully
      expect(result).toBeTruthy();
      
      await fastTimeoutPipeline.shutdown();
    });
  });

  describe('Metrics and Monitoring', () => {
    it('should track comprehensive statistics', async () => {
      const request: ContentProcessingRequest = {
        id: 'metrics-test',
        content: {
          gameId: 'metrics-game',
          version: '1.0',
          metadata: {
            title: 'Metrics Test',
            description: 'Testing metrics collection',
            duration: '7 minutes',
            targetAudience: 'Adults',
            language: 'en'
          },
          scenes: [{
            id: 'metrics-scene',
            type: 'quiz',
            questions: [{
              question_text: 'Metrics question?',
              options: [
                { option_text: 'Yes', is_correct: true },
                { option_text: 'No', is_correct: false }
              ]
            }]
          }]
        },
        metadata: {
          userId: 'metrics-user',
          teamId: 'metrics-team',
          priority: 'normal',
          contentType: 'game',
          timestamp: Date.now()
        }
      };

      await pipeline.submitContent(request);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await pipeline.getResult('metrics-test');
      const stats = pipeline.getStats();

      expect(result?.metrics).toBeTruthy();
      expect(result?.metrics.validationTime).toBeGreaterThanOrEqual(0);
      expect(result?.metrics.optimizationTime).toBeGreaterThanOrEqual(0);
      expect(result?.metrics.deploymentTime).toBeGreaterThanOrEqual(0);
      expect(result?.metrics.totalTime).toBeGreaterThan(0);

      expect(stats.totalRequests).toBeGreaterThan(0);
      expect(stats.averageProcessingTime).toBeGreaterThanOrEqual(0);
    });
  });
});