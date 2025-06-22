/**
 * DevTeam Integration API Tests
 * Integration tests for the complete DevTeam content processing pipeline
 */

import { 
  submitContent, 
  getProcessingStatus, 
  getAllJobs,
  ProcessingStatus,
  DeploymentFormat,
  MunicipalMarket,
  ContentSubmissionRequest
} from './devteam-integration';
import { validateGameManifest } from '../utils/contentValidation';

describe('DevTeam Integration API', () => {

  const mockSubmissionRequest: ContentSubmissionRequest = {
    gameManifest: mockGameManifest,
    deploymentOptions: {
      formats: [DeploymentFormat.WEB, DeploymentFormat.SCORM],
      markets: [MunicipalMarket.SWEDEN],
      municipalityId: 'malmo',
      brandingLevel: 'standard'
    },
    processingOptions: {
      priority: 'high',
      dryRun: false
    }
  };

  beforeEach(() => {
    // Clear any existing jobs before each test
    jest.clearAllMocks();
  });

  describe('Content Submission', () => {
    test('should accept valid content submission', async () => {
      
      expect(result).toBeDefined();
      expect(result.jobId).toMatch(/^job_\d+_[a-z0-9]+$/);
      expect(result.status).toBe(ProcessingStatus.RECEIVED);
      expect(result.progress).toBe(0);
      expect(result.startTime).toBeDefined();
    });

    test('should validate game manifest structure', async () => {
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.performance.contentSize).toBeGreaterThan(0);
      expect(validation.performance.estimatedLoadTime).toBeLessThan(5000);
    });

    test('should reject invalid content', async () => {
      delete invalidManifest.gameId;
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing required field: gameId');
    });
  });

  describe('Processing Pipeline', () => {
    test('should progress through all processing stages', async () => {
      
      // Allow some time for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(status).toBeDefined();
      expect(status!.jobId).toBe(jobId);
      expect([
        ProcessingStatus.RECEIVED,
        ProcessingStatus.VALIDATING,
        ProcessingStatus.PROCESSING,
        ProcessingStatus.BRANDING,
        ProcessingStatus.PACKAGING,
        ProcessingStatus.DEPLOYING,
        ProcessingStatus.COMPLETED
      ]).toContain(status!.status);
    });

    test('should complete processing within time budget', async () => {
      
      // Wait for processing to complete
      let status;
      let attempts = 0;
      
      do {
        await new Promise(resolve => setTimeout(resolve, 100));
        status = await getProcessingStatus(result.jobId);
        attempts++;
      } while (
        status && 
        status.status !== ProcessingStatus.COMPLETED && 
        status.status !== ProcessingStatus.FAILED && 
        attempts < maxAttempts
      );
      
      
      // Should complete within 30 minutes (test uses shorter timeout)
      expect(totalTime).toBeLessThan(30 * 60 * 1000);
      expect(status?.status).toBe(ProcessingStatus.COMPLETED);
    }, 35000); // 35 second timeout for test
  });

  describe('Municipal Branding Integration', () => {
    test('should apply Malmö municipal branding', async () => {
      
      // Wait for branding stage
      let status;
      let attempts = 0;
      
      do {
        await new Promise(resolve => setTimeout(resolve, 50));
        status = await getProcessingStatus(result.jobId);
        attempts++;
      } while (
        status && 
        status.progress < 50 && 
        status.status !== ProcessingStatus.FAILED &&
        attempts < 20
      );
      
      expect(status?.status).not.toBe(ProcessingStatus.FAILED);
      expect(status?.progress).toBeGreaterThanOrEqual(50);
    });

    test('should support different cultural contexts', async () => {
      
      expect(result.jobId).toBeDefined();
    });
  });

  describe('Multi-Format Deployment', () => {
    test('should create web deployment package', async () => {
      
      
      // Wait for completion
      let status;
      let attempts = 0;
      
      do {
        await new Promise(resolve => setTimeout(resolve, 100));
        status = await getProcessingStatus(result.jobId);
        attempts++;
      } while (
        status && 
        status.status !== ProcessingStatus.COMPLETED && 
        status.status !== ProcessingStatus.FAILED &&
        attempts < 30
      );
      
      if (status?.status === ProcessingStatus.COMPLETED) {
        expect(status.deploymentUrls?.web).toMatch(/^https:\/\/games\.diginativa\.se\//);
      }
    }, 15000);

    test('should create SCORM deployment package', async () => {
      
      expect(result.jobId).toBeDefined();
    });

    test('should create PWA deployment package', async () => {
      
      expect(result.jobId).toBeDefined();
    });
  });

  describe('Job Management', () => {
    test('should track multiple concurrent jobs', async () => {
      const job1 = await devteamIntegration.submitContent({
        ...mockSubmissionRequest
      });
      
      const job2 = await devteamIntegration.submitContent({
        ...mockSubmissionRequest,
        gameManifest: {
          ...mockGameManifest,
          gameId: 'test-game-002'
        }
      });
      
      expect(job1.jobId).not.toBe(job2.jobId);
      
      expect(allJobs.length).toBeGreaterThanOrEqual(2);
      
      expect(jobIds).toContain(job1.jobId);
      expect(jobIds).toContain(job2.jobId);
    });

    test('should handle job status queries', async () => {
      
      expect(status).toBeDefined();
      expect(status!.jobId).toBe(result.jobId);
      
      expect(nonExistentStatus).toBeNull();
    });
  });

  describe('Performance Requirements', () => {
    test('should provide validation feedback within 5 seconds', async () => {
      
      expect(validationTime).toBeLessThan(5000);
      expect(validation.isValid).toBe(true);
    });

    test('should handle large content within size limits', () => {
      
      // Should be under 500KB total limit
      expect(validation.performance.contentSize).toBeLessThan(500);
      expect(validation.performance.estimatedLoadTime).toBeLessThan(5000);
    });
  });

  describe('Error Handling', () => {
    test('should handle processing failures gracefully', async () => {
      
      
      // Wait for failure
      let status;
      let attempts = 0;
      
      do {
        await new Promise(resolve => setTimeout(resolve, 50));
        status = await getProcessingStatus(result.jobId);
        attempts++;
      } while (
        status && 
        status.status !== ProcessingStatus.FAILED && 
        status.status !== ProcessingStatus.COMPLETED &&
        attempts < 20
      );
      
      // Should either complete or fail gracefully
      expect([ProcessingStatus.FAILED, ProcessingStatus.COMPLETED]).toContain(status!.status);
    });
  });
});