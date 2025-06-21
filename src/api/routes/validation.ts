/**
 * Content Validation API Routes
 * Provides endpoints for DevTeam content validation
 * 
 * Roadmap Ref: Q1-AO-Milestone-1.2
 */

import { Router } from 'express';
import { validateContent, validateBatch, validationHealthCheck } from '../content-validation';

const router = Router();

/**
 * POST /api/validation/content
 * Validate a single content item
 */
router.post('/content', validateContent);

/**
 * POST /api/validation/batch
 * Validate multiple content items in one request
 */
router.post('/batch', validateBatch);

/**
 * GET /api/validation/health
 * Check validation service health
 */
router.get('/health', validationHealthCheck);

export default router;