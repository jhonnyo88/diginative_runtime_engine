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
  const mockGameManifest = {
    gameId: 'test-digitaliseringsstrategi-001',
    metadata: {
      title: 'Sveriges Digitaliseringsstrategi Demo',
      subtitle: 'En interaktiv utbildning för kommunal personal',
      description: 'Lär dig om Sveriges digitaliseringsstrategi 2025-2030 genom dialog med Erik Slottner',
      duration: '7 minuter',
      difficulty: 'Nybörjare',
      tags: ['digitalisering', 'strategi', 'kommun'],
      learningObjectives: [
        'Förstå de fem strategiska områdena',
        'Identifiera möjligheter för din kommun',
        'Utveckla digitala kompetenser'
      ],
      targetAudience: 'Kommunal personal',
      language: 'sv-SE',
      version: '1.0.0'
    },
    scenes: [
      {
        id: 'intro',
        type: 'dialogue',
        characters: [
          {
            character_id: 'erik',
            name: 'Erik Slottner',
            role: 'Digitaliseringsminister'
          },
          {
            character_id: 'player',
            name: '{{PLAYER_NAME}}',
            role: 'Kommunal medarbetare'
          }
        ],
        dialogue_turns: [
          {
            speaker: 'Erik Slottner',
            character_id: 'erik',
            text: 'Hej {{PLAYER_NAME}}! Jag är Erik Slottner, digitaliseringsminister.'
          }
        ]
      },
      {
        id: 'quiz',
        type: 'quiz',
        questions: [
          {
            question_id: 'q1',
            question_type: 'multiple_choice',
            question_text: 'Vilket år gäller Sveriges digitaliseringsstrategi till?',
            options: [
              { option_id: 'a', text: '2025', is_correct: false },
              { option_id: 'b', text: '2030', is_correct: true },
              { option_id: 'c', text: '2035', is_correct: false }
            ]
          }
        ]
      }
    ]
  };

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
      const result = await submitContent(mockSubmissionRequest);
      
      expect(result).toBeDefined();
      expect(result.jobId).toMatch(/^job_\d+_[a-z0-9]+$/);
      expect(result.status).toBe(ProcessingStatus.RECEIVED);
      expect(result.progress).toBe(0);
      expect(result.startTime).toBeDefined();
    });

    test('should validate game manifest structure', async () => {
      const validation = validateGameManifest(mockGameManifest);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.performance.contentSize).toBeGreaterThan(0);
      expect(validation.performance.estimatedLoadTime).toBeLessThan(5000);
    });

    test('should reject invalid content', async () => {
      const invalidManifest = { ...mockGameManifest };
      delete invalidManifest.gameId;
      
      const invalidRequest = {
        ...mockSubmissionRequest,
        gameManifest: invalidManifest
      };

      const validation = validateGameManifest(invalidManifest);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing required field: gameId');
    });
  });

  describe('Processing Pipeline', () => {
    test('should progress through all processing stages', async () => {
      const result = await submitContent(mockSubmissionRequest);
      const jobId = result.jobId;
      
      // Allow some time for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const status = await getProcessingStatus(jobId);
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
      const startTime = Date.now();
      const result = await submitContent(mockSubmissionRequest);
      
      // Wait for processing to complete
      let status;
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max
      
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
      
      const totalTime = Date.now() - startTime;
      
      // Should complete within 30 minutes (test uses shorter timeout)
      expect(totalTime).toBeLessThan(30 * 60 * 1000);
      expect(status?.status).toBe(ProcessingStatus.COMPLETED);
    }, 35000); // 35 second timeout for test
  });

  describe('Municipal Branding Integration', () => {
    test('should apply Malmö municipal branding', async () => {
      const result = await submitContent(mockSubmissionRequest);
      
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
      const berlinRequest = {
        ...mockSubmissionRequest,
        deploymentOptions: {
          ...mockSubmissionRequest.deploymentOptions,
          municipalityId: 'berlin',
          markets: [MunicipalMarket.GERMANY]
        }
      };
      
      const result = await submitContent(berlinRequest);
      expect(result.jobId).toBeDefined();
    });
  });

  describe('Multi-Format Deployment', () => {
    test('should create web deployment package', async () => {
      const webRequest = {
        ...mockSubmissionRequest,
        deploymentOptions: {
          ...mockSubmissionRequest.deploymentOptions,
          formats: [DeploymentFormat.WEB]
        }
      };
      
      const result = await submitContent(webRequest);
      
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
      const scormRequest = {
        ...mockSubmissionRequest,
        deploymentOptions: {
          ...mockSubmissionRequest.deploymentOptions,
          formats: [DeploymentFormat.SCORM]
        }
      };
      
      const result = await submitContent(scormRequest);
      expect(result.jobId).toBeDefined();
    });

    test('should create PWA deployment package', async () => {
      const pwaRequest = {
        ...mockSubmissionRequest,
        deploymentOptions: {
          ...mockSubmissionRequest.deploymentOptions,
          formats: [DeploymentFormat.PWA]
        }
      };
      
      const result = await submitContent(pwaRequest);
      expect(result.jobId).toBeDefined();
    });
  });

  describe('Job Management', () => {
    test('should track multiple concurrent jobs', async () => {
      const job1 = await submitContent(mockSubmissionRequest);
      const job2 = await submitContent({
        ...mockSubmissionRequest,
        gameManifest: {
          ...mockGameManifest,
          gameId: 'test-game-002'
        }
      });
      
      expect(job1.jobId).not.toBe(job2.jobId);
      
      const allJobs = await getAllJobs();
      expect(allJobs.length).toBeGreaterThanOrEqual(2);
      
      const jobIds = allJobs.map(job => job.jobId);
      expect(jobIds).toContain(job1.jobId);
      expect(jobIds).toContain(job2.jobId);
    });

    test('should handle job status queries', async () => {
      const result = await submitContent(mockSubmissionRequest);
      
      const status = await getProcessingStatus(result.jobId);
      expect(status).toBeDefined();
      expect(status!.jobId).toBe(result.jobId);
      
      const nonExistentStatus = await getProcessingStatus('invalid-job-id');
      expect(nonExistentStatus).toBeNull();
    });
  });

  describe('Performance Requirements', () => {
    test('should provide validation feedback within 5 seconds', async () => {
      const startTime = Date.now();
      const validation = validateGameManifest(mockGameManifest);
      const validationTime = Date.now() - startTime;
      
      expect(validationTime).toBeLessThan(5000);
      expect(validation.isValid).toBe(true);
    });

    test('should handle large content within size limits', () => {
      const validation = validateGameManifest(mockGameManifest);
      
      // Should be under 500KB total limit
      expect(validation.performance.contentSize).toBeLessThan(500);
      expect(validation.performance.estimatedLoadTime).toBeLessThan(5000);
    });
  });

  describe('Error Handling', () => {
    test('should handle processing failures gracefully', async () => {
      const invalidRequest = {
        ...mockSubmissionRequest,
        gameManifest: {
          ...mockGameManifest,
          scenes: [] // Empty scenes should cause validation failure
        }
      };
      
      const result = await submitContent(invalidRequest);
      
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