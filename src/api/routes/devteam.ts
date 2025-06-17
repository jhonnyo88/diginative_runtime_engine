/**
 * DevTeam API Routes
 * Express routes for DevTeam content integration
 */

import { Router, Request, Response } from 'express';
import { 
  submitContent, 
  getProcessingStatus, 
  getAllJobs,
  ContentSubmissionSchema 
} from '../devteam-integration';
import { ZodError } from 'zod';

const router = Router();

/**
 * POST /api/v1/process-content
 * Submit AI-generated content for processing
 */
router.post('/process-content', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedRequest = ContentSubmissionSchema.parse(req.body);
    
    // Submit content for processing
    const result = await submitContent(validatedRequest);
    
    // Return processing job information
    res.status(202).json({
      success: true,
      jobId: result.jobId,
      status: result.status,
      message: result.message,
      processingUrl: `/api/v1/process-status/${result.jobId}`
    });
    
  } catch (error) {
    if (error instanceof ZodError) {
      // Validation error - provide detailed feedback
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      });
    } else {
      // General error
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

/**
 * GET /api/v1/process-status/:jobId
 * Get processing status for a specific job
 */
router.get('/process-status/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    const status = await getProcessingStatus(jobId);
    
    if (!status) {
      res.status(404).json({
        success: false,
        error: 'Job not found',
        message: `No processing job found with ID: ${jobId}`
      });
      return;
    }
    
    res.json({
      success: true,
      ...status
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/process-status
 * Get all active processing jobs
 */
router.get('/process-status', async (req: Request, res: Response) => {
  try {
    const jobs = await getAllJobs();
    
    res.json({
      success: true,
      totalJobs: jobs.length,
      jobs: jobs
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/game-delivery/:jobId
 * Get deployment URLs for completed job
 */
router.get('/game-delivery/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    const status = await getProcessingStatus(jobId);
    
    if (!status) {
      res.status(404).json({
        success: false,
        error: 'Job not found',
        message: `No processing job found with ID: ${jobId}`
      });
      return;
    }
    
    if (status.status !== 'completed') {
      res.status(202).json({
        success: false,
        error: 'Job not completed',
        message: `Job is currently ${status.status} (${status.progress}% complete)`,
        processingUrl: `/api/v1/process-status/${jobId}`
      });
      return;
    }
    
    res.json({
      success: true,
      jobId: jobId,
      deploymentUrls: status.deploymentUrls,
      processingTime: calculateProcessingTime(status.startTime, status.endTime!)
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'DevTeam Integration API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * Helper function to calculate processing time
 */
function calculateProcessingTime(startTime: string, endTime: string): string {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const durationMs = end - start;
  
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  return `${minutes}m ${seconds}s`;
}

export default router;