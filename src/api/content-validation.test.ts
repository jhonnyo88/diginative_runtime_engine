import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { validateContent, validateBatch, validationHealthCheck } from './content-validation';
import { DevTeamContentValidator } from '../validation/devteam-content-validator';
import { InfrastructureMonitoring } from '../services/infrastructure-monitoring';

// Mock dependencies
vi.mock('../validation/devteam-content-validator');
vi.mock('../services/infrastructure-monitoring');

describe('Content Validation API', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: vi.Mock;
  let mockValidator: Record<string, unknown>;
  let mockMonitoring: Record<string, unknown>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock validator
    mockValidator = {
      validateGameManifest: vi.fn().mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      }),
      validateScene: vi.fn().mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      }),
      validateQuizScene: vi.fn().mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      }),
      validateDialogueScene: vi.fn().mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      })
    };

    (DevTeamContentValidator as Record<string, unknown>).mockImplementation(() => mockValidator);

    // Setup mock monitoring
    mockMonitoring = {
      recordMetric: vi.fn(),
      reportError: vi.fn(),
      reportMessage: vi.fn()
    };

    (InfrastructureMonitoring.getInstance as Record<string, unknown>).mockReturnValue(mockMonitoring);

    // Setup request/response mocks
    mockRequest = {
      body: Record<string, unknown>
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    mockNext = vi.fn();
  });

  describe('validateContent', () => {
    it('should validate game content successfully', async () => {
      const testContent = {
        title: 'Test Game',
        description: 'Test Description',
        scenes: []
      };

      mockRequest.body = {
        content: testContent,
        contentType: 'game',
        userId: 'test-user',
        teamId: 'test-team'
      };

      await validateContent(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockValidator.validateGameManifest).toHaveBeenCalledWith(testContent);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: true,
          errors: [],
          warnings: [],
          validationId: expect.stringMatching(/^val_\d+$/),
          cached: false
        })
      );
    });

    it('should return error when no content provided', async () => {
      mockRequest.body = {};

      await validateContent(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: false,
          errors: expect.arrayContaining([
            expect.objectContaining({
              path: 'root',
              message: 'No content provided for validation',
              type: 'missing'
            })
          ])
        })
      );
    });

    it('should validate quiz scene content', async () => {
      const quizContent = {
        id: 'quiz-1',
        type: 'quiz',
        questions: []
      };

      mockRequest.body = {
        content: quizContent,
        contentType: 'quiz'
      };

      await validateContent(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockValidator.validateQuizScene).toHaveBeenCalledWith(quizContent);
    });

    it('should handle validation errors', async () => {
      mockValidator.validateGameManifest.mockReturnValue({
        isValid: false,
        errors: [
          {
            path: 'title',
            message: 'Title is required',
            type: 'missing'
          }
        ],
        warnings: []
      });

      mockRequest.body = {
        content: Record<string, unknown>,
        contentType: 'game'
      };

      await validateContent(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: false,
          errors: expect.arrayContaining([
            expect.objectContaining({
              path: 'title',
              message: 'Title is required'
            })
          ]),
          suggestions: expect.arrayContaining([
            'Add a title field to your content'
          ])
        })
      );

      expect(mockMonitoring.reportMessage).toHaveBeenCalledWith(
        expect.stringContaining('Content validation failed'),
        'warning'
      );
    });

    it('should use cache for repeated validations', async () => {
      const testContent = {
        title: 'Cached Game',
        scenes: []
      };

      mockRequest.body = {
        content: testContent,
        contentType: 'game'
      };

      // First validation
      await validateContent(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockValidator.validateGameManifest).toHaveBeenCalledTimes(1);

      // Reset response mock
      mockResponse.json = vi.fn();

      // Second validation (should use cache)
      await validateContent(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockValidator.validateGameManifest).toHaveBeenCalledTimes(1); // Not called again
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          cached: true
        })
      );

      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'validation_cache_hit'
        })
      );
    });

    it('should record performance metrics', async () => {
      mockRequest.body = {
        content: { title: 'Test' },
        contentType: 'game'
      };

      await validateContent(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'validation_processing_time',
          unit: 'ms'
        })
      );

      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'validation_error_count',
          unit: 'count'
        })
      );
    });

    it('should handle validation exceptions', async () => {
      mockValidator.validateGameManifest.mockImplementation(() => {
        throw new Error('Validation error');
      });

      mockRequest.body = {
        content: { title: 'Test' }
      };

      await validateContent(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockMonitoring.reportError).toHaveBeenCalled();
    });
  });

  describe('validateBatch', () => {
    it('should validate multiple items', async () => {
      const items = [
        { content: { title: 'Game 1' } },
        { content: { title: 'Game 2' } },
        { content: { title: 'Game 3' } }
      ];

      mockRequest.body = { items };

      await validateBatch(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockValidator.validateGameManifest).toHaveBeenCalledTimes(3);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: expect.arrayContaining([
          expect.objectContaining({ valid: true }),
          expect.objectContaining({ valid: true }),
          expect.objectContaining({ valid: true })
        ]),
        totalProcessingTime: expect.any(Number)
      });

      expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'batch_validation_size',
          value: 3
        })
      );
    });

    it('should handle invalid batch request', async () => {
      mockRequest.body = {};

      await validateBatch(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: [],
        totalProcessingTime: expect.any(Number)
      });
    });

    it('should handle batch validation errors', async () => {
      mockValidator.validateGameManifest.mockImplementation(() => {
        throw new Error('Batch error');
      });

      mockRequest.body = {
        items: [{ content: Record<string, unknown> }]
      };

      await validateBatch(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockMonitoring.reportError).toHaveBeenCalled();
    });
  });

  describe('validationHealthCheck', () => {
    it('should return healthy status', () => {
      validationHealthCheck(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockValidator.validateGameManifest).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          validationWorking: true,
          processingTime: expect.any(Number),
          cacheSize: expect.any(Number),
          timestamp: expect.any(String)
        })
      );
    });

    it('should indicate validation not working if test fails', () => {
      mockValidator.validateGameManifest.mockReturnValue({
        isValid: false,
        errors: [{ path: 'test', message: 'Test failed', type: 'invalid' }],
        warnings: []
      });

      validationHealthCheck(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          validationWorking: false
        })
      );
    });
  });
});