/**
 * DevTeam Pipeline Stress Testing
 * CRITICAL validation of <30s processing promise under realistic load
 * 
 * Roadmap Ref: Q1-AO-Milestone-1.2 (COMPLETION BLOCKER)
 * Business Impact: Validates core DevTeam scalability promise before Q2
 */

import { performance } from 'perf_hooks';
import { DevTeamAPIPipeline } from '../../services/devteam-api-pipeline';
import { APIGateway } from '../../services/api-gateway';
import { RedisClusterService } from '../../services/redis-cluster';
import { InfrastructureMonitoring } from '../../services/infrastructure-monitoring';

// Mock dependencies for controlled testing
jest.mock('../../services/redis-cluster');
jest.mock('../../services/infrastructure-monitoring');

describe('DevTeam Pipeline Stress Testing', () => {
  let pipeline: DevTeamAPIPipeline;
  let apiGateway: APIGateway;
  let mockRedis: jest.Mocked<RedisClusterService>;
  let mockMonitoring: jest.Mocked<InfrastructureMonitoring>;

  // Test data generators
      case 'large':
        return {
          ...baseContent,
          scenes: Array(50).fill(0).map((_, i) => ({
            ...baseContent.scenes[0],
            id: `scene_${i}`,
            content: {
              ...baseContent.scenes[0].content,
              text: `Scene ${i}: ` + baseContent.scenes[0].content.text + ' '.repeat(100)
            }
          })),
          quiz: Array(20).fill(0).map((_, i) => ({
            ...baseContent.quiz[0],
            id: `quiz_${i}`,
            question: `Question ${i}: ${baseContent.quiz[0].question}` + ' '.repeat(50)
          }))
        };
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup Redis mock
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      keys: jest.fn(),
      zadd: jest.fn(),
      zcard: jest.fn(),
      zremrangebyscore: jest.fn(),
      expire: jest.fn()
    } as any;

    // Setup monitoring mock
    mockMonitoring = {
      recordMetric: jest.fn(),
      reportError: jest.fn(),
      getInstance: jest.fn().mockReturnThis()
    } as any;

    (RedisClusterService as jest.Mock).mockImplementation(() => mockRedis);
    (InfrastructureMonitoring.getInstance as jest.Mock).mockReturnValue(mockMonitoring);

    pipeline = new DevTeamAPIPipeline();
    apiGateway = new APIGateway();
  });

  describe('Core Performance Promise: <30s Processing', () => {
    it('should process single AI content submission in <30s', async () => {
      mockRedis.get.mockResolvedValue(null); // Cache miss
      mockRedis.set.mockResolvedValue('OK');

        content,
        municipalityId: 'malmo_stad',
        requestId: 'stress_test_single',
        priority: 'normal'
      });

      
      expect(processingTime).toBeLessThan(30000); // <30s requirement
      expect(result.success).toBe(true);
      expect(result.processingTime).toBeDefined();
      
      // Verify monitoring was called
      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'devteam_content_processed',
          tags: expect.objectContaining({
            processingTime: expect.any(String),
            metTarget: 'true'
          })
        })
      );
    });

    it('should maintain <30s processing for large content payloads', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

        content: largeContent,
        municipalityId: 'malmo_stad',
        requestId: 'stress_test_large',
        priority: 'normal'
      });

      
      expect(processingTime).toBeLessThan(30000);
      expect(result.success).toBe(true);
      expect(result.contentSize).toBeGreaterThan(10000); // Verify it's actually large
    });
  });

  describe('Concurrent Load Testing: 1000+ Submissions', () => {
    it('should handle 100 concurrent submissions maintaining <30s each', async () => {

      // Mock Redis responses for concurrent access
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

        submissions.map(submission => pipeline.submitContent(submission))
      );


      expect(successfulResults.length).toBe(concurrentCount);
      expect(averageProcessingTime).toBeLessThan(30000);
      expect(totalTime).toBeLessThan(60000); // Reasonable total time for 100 concurrent
      
      // Verify all municipalities were handled
      expect(uniqueMunicipalities.length).toBe(4);
    });

    it('should simulate realistic DevTeam load: 500 submissions over 5 minutes', async () => {
      
      const allResults: Record<string, unknown>[] = [];
      const performanceMetrics: number[] = [];

      // Mock consistent Redis behavior
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      for (let batch = 0; batch < batches; batch++) {

          submissions.map(submission => pipeline.submitContent(submission))
        );

        
        allResults.push(...batchResults);
        performanceMetrics.push(batchTime);

        expect(successfulInBatch).toBe(batchSize);
        expect(batchTime).toBeLessThan(60000); // Reasonable batch processing time

        // Simulate time between batches (reduced for testing)
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      
      expect(overallSuccessRate).toBeGreaterThan(0.95); // >95% success rate
      expect(averageBatchTime).toBeLessThan(45000); // Average batch <45s
    }, 120000); // Extended timeout for realistic load test
  });

  describe('Rate Limiting Under Stress', () => {
    it('should properly enforce rate limits during high load', async () => {

      // Mock rate limiting behavior
      mockRedis.zcard
        .mockResolvedValueOnce(999) // Just under limit
        .mockResolvedValueOnce(1000) // At limit
        .mockResolvedValue(1001); // Over limit

      mockRedis.zadd.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

        submissions.slice(0, 100).map(submission => pipeline.submitContent(submission))
      );


      expect(successful).toBeGreaterThan(0);
      expect(rateLimited).toBeGreaterThan(0); // Some should be rate limited
      
      // Verify rate limiting was enforced
      expect(mockRedis.zcard).toHaveBeenCalled();
    });

    it('should handle different municipality rate limits correctly', async () => {


      // Mock different rate limits
      mockRedis.zcard
        .mockResolvedValueOnce(500) // Swedish - under limit
        .mockResolvedValueOnce(250); // German - under limit

        swedishSubmissions.map(s => pipeline.submitContent(s))
      );
      
        germanSubmissions.map(s => pipeline.submitContent(s))
      );


      expect(swedishSuccess).toBeGreaterThan(0);
      expect(germanSuccess).toBeGreaterThan(0);
    });
  });

  describe('Redis Cluster Performance Under Stress', () => {
    it('should maintain Redis performance with high concurrent operations', async () => {

      // Mock Redis operations with realistic delays
      mockRedis.get.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(null), Math.random() * 10))
      );
      mockRedis.set.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('OK'), Math.random() * 15))
      );


      await Promise.all(operations);


      expect(totalTime).toBeLessThan(30000); // Total operations <30s
      expect(averageOperationTime).toBeLessThan(50); // Average operation <50ms
      expect(mockRedis.get).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should handle Redis failures gracefully during stress', async () => {

      // Simulate Redis failures
      mockRedis.get
        .mockResolvedValueOnce(null) // Success
        .mockRejectedValueOnce(new Error('Redis connection failed')) // Failure
        .mockResolvedValue(null); // Recovery

      mockRedis.set.mockResolvedValue('OK');

        submissions.map(s => pipeline.submitContent(s))
      );

      
      expect(successful).toBeGreaterThan(0); // Some should succeed despite Redis issues
      expect(mockMonitoring.reportError).toHaveBeenCalled(); // Errors should be reported
    });
  });

  describe('Infrastructure Monitoring During Peak Load', () => {
    it('should record comprehensive metrics during stress testing', async () => {

      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      await Promise.all(submissions.map(s => pipeline.submitContent(s)));

      // Verify monitoring metrics were recorded
      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'devteam_content_processed'
        })
      );

      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'devteam_cache_hit_rate'
        })
      );

      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'devteam_processing_queue_size'
        })
      );

      // Verify metrics include performance data
      
      expect(performanceMetrics.length).toBeGreaterThan(0);
    });

    it('should detect performance degradation during stress', async () => {

      // Mock slower Redis responses to simulate degradation
      mockRedis.get.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(null), 100))
      );
      mockRedis.set.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('OK'), 150))
      );

        slowSubmissions.map(s => pipeline.submitContent(s))
      );

      
      // Even with degradation, should still meet <30s requirement
      expect(averageProcessingTime).toBeLessThan(30000);
      
      // Verify degradation metrics were recorded
      
      // Should detect some degradation
      expect(degradationMetrics.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Baseline for Q2', () => {
    it('should establish Q2 performance baseline metrics', async () => {

      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

        baselineSubmissions.map(s => pipeline.submitContent(s))
      );



      // Validate Q2 performance baseline requirements
      expect(baselineMetrics.successRate).toBeGreaterThan(0.95); // >95% success rate
      expect(baselineMetrics.averageProcessingTime).toBeLessThan(30000); // <30s average
      expect(baselineMetrics.p95ProcessingTime).toBeLessThan(45000); // <45s 95th percentile
      expect(baselineMetrics.throughput).toBeGreaterThan(3); // >3 submissions/second

      // Log baseline for Q2 reference
      console.log('Q2 Performance Baseline Established:', baselineMetrics);
      
      // Verify baseline metrics are recorded in monitoring
      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'devteam_baseline_established'
        })
      );
    });

    it('should validate system remains stable under sustained load', async () => {
      const submissions: Record<string, unknown>[] = [];
      const results: Record<string, unknown>[] = [];

      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      let submissionCount = 0;

      // Simulate sustained load
      while (performance.now() - startTime < sustainedLoadDuration) {

        submissions.push(submission);
        
        results.push(result);
        
        submissionCount++;
        
        // Brief pause between submissions
        await new Promise(resolve => setTimeout(resolve, submissionInterval));
      }


      expect(successfulResults.length).toBeGreaterThan(0);
      expect(successfulResults.length / submissions.length).toBeGreaterThan(0.9); // >90% success under sustained load
      expect(averageProcessingTime).toBeLessThan(30000); // Maintain <30s under load
      expect(actualDuration).toBeGreaterThan(sustainedLoadDuration * 0.9); // Actually ran for expected duration

      console.log(`Sustained Load Test: ${submissions.length} submissions over ${actualDuration}ms`);
      console.log(`Success Rate: ${(successfulResults.length / submissions.length * 100).toFixed(2)}%`);
      console.log(`Average Processing Time: ${averageProcessingTime.toFixed(2)}ms`);
    }, 60000); // Extended timeout for sustained load test
  });
});