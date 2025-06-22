import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  validateDevTeamContent, 
  validateMunicipalBranding, 
  CONTENT_LIMITS, 
  PERFORMANCE_BUDGETS 
} from './contentValidation';

describe('DevTeam Content Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateDevTeamContent', () => {

    describe('Basic Structure Validation', () => {
      it('validates correct DevTeam content structure', async () => {

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.performance.contentSize).toBeGreaterThan(0);
        expect(result.performance.estimatedLoadTime).toBeGreaterThan(0);
      });

      it('fails validation when submission_metadata is missing', async () => {


        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Missing required field: submission_metadata');
      });

      it('fails validation when game_content is missing', async () => {


        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Missing required field: game_content');
      });

      it('fails validation when scenes array is missing', async () => {


        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Missing or invalid scenes array');
      });

      it('fails validation when scenes is not an array', async () => {


        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Missing or invalid scenes array');
      });
    });

    describe('Content Size Validation', () => {
      it('validates content within size limits', async () => {

        expect(result.performance.contentSize).toBeLessThan(CONTENT_LIMITS.TOTAL_JSON_MAX / 1024);
        expect(result.isValid).toBe(true);
      });

      it('fails validation when total content exceeds limit', async () => {
        // Create oversized content


        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('exceeds limit'))).toBe(true);
      });

      it('validates DialogueScene size limits', async () => {


        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('DialogueScene') && error.includes('exceeds limit'))).toBe(true);
      });

      it('validates QuizScene size limits', async () => {


        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('QuizScene') && error.includes('exceeds limit'))).toBe(true);
      });
    });

    describe('DialogueScene Validation', () => {
      it('validates DialogueScene required fields', async () => {


        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('missing scene_id'))).toBe(true);
        expect(result.errors.some(error => error.includes('missing characters array'))).toBe(true);
        expect(result.errors.some(error => error.includes('missing dialogue_turns array'))).toBe(true);
      });

      it('validates dialogue turn required fields', async () => {


        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('missing required fields'))).toBe(true);
      });

      it('warns about very long dialogue text', async () => {


        expect(result.warnings.some(warning => warning.includes('text is very long'))).toBe(true);
      });

      it('warns about scenes exceeding Anna Svensson 7-minute limit', async () => {


        expect(result.warnings.some(warning => warning.includes('exceeds Anna Svensson 7-minute target'))).toBe(true);
      });
    });

    describe('QuizScene Validation', () => {
      it('validates QuizScene required fields', async () => {


        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('QuizScene missing scene_id'))).toBe(true);
        expect(result.errors.some(error => error.includes('missing questions array'))).toBe(true);
      });

      it('validates question required fields', async () => {


        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('missing required fields'))).toBe(true);
      });

      it('validates question types', async () => {


        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('invalid question_type'))).toBe(true);
      });

      it('validates questions have correct answers', async () => {


        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('has no correct options'))).toBe(true);
      });

      it('validates true/false questions have exactly 2 options', async () => {


        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('true_false must have exactly 2 options'))).toBe(true);
      });

      it('warns about quizzes that may be too long for Anna Svensson', async () => {


        expect(result.warnings.some(warning => warning.includes('may be too long for Anna Svensson'))).toBe(true);
      });
    });

    describe('Performance Requirements', () => {
      it('estimates load time within performance budget', async () => {

        expect(result.performance.estimatedLoadTime).toBeLessThan(PERFORMANCE_BUDGETS.MAX_LOADING_TIME);
      });

      it('validates within System Architect validation timeout', async () => {

        expect(validationTime).toBeLessThan(PERFORMANCE_BUDGETS.VALIDATION_TIMEOUT);
        expect(result.isValid).toBe(true);
      });

      it('warns about slow validation', async () => {
        // Mock slow validation by using large content


        // Validation should still work but may include warnings about performance
        expect(result.isValid).toBe(true);
      });
    });

    describe('Unknown Scene Types', () => {
      it('warns about unknown scene types', async () => {


        expect(result.warnings.some(warning => warning.includes('Unknown scene type'))).toBe(true);
      });
    });

    describe('Error Handling', () => {
      it('handles validation errors gracefully', async () => {

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.performance.lighthouseImpact).toBe(-10);
      });

      it('handles malformed JSON gracefully', async () => {
        const circularRef: Record<string, unknown> = { name: 'test' };
        circularRef.self = circularRef;


        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('Validation error'))).toBe(true);
      });
    });
  });

  describe('validateMunicipalBranding', () => {

    it('validates correct municipal branding', () => {

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.performance.contentSize).toBe(1);
    });

    it('handles missing branding gracefully', () => {

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('No municipal branding provided - using default styling');
      expect(result.performance.contentSize).toBe(0);
    });

    it('requires municipality name', () => {


      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Municipal branding missing municipality name');
    });

    it('validates color format', () => {


      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Invalid primaryColor format'))).toBe(true);
    });

    it('accepts 3-digit hex colors', () => {


      expect(result.isValid).toBe(true);
    });

    it('accepts 6-digit hex colors', () => {


      expect(result.isValid).toBe(true);
    });

    it('validates logo URL format', () => {


      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Invalid logoUrl'))).toBe(true);
    });

    it('warns about missing primary color', () => {


      expect(result.warnings).toContain('Municipal branding missing primaryColor - using default');
    });

    it('calculates performance impact with logo', () => {

      expect(result.performance.estimatedLoadTime).toBe(100); // Logo loading time
    });

    it('calculates performance impact without logo', () => {


      expect(result.performance.estimatedLoadTime).toBe(0);
    });
  });

  describe('Constants and Configuration', () => {
    it('has appropriate content limits for System Architect requirements', () => {
      expect(CONTENT_LIMITS.DIALOGUE_SCENE_MAX).toBe(50 * 1024); // 50KB
      expect(CONTENT_LIMITS.QUIZ_SCENE_MAX).toBe(30 * 1024); // 30KB
      expect(CONTENT_LIMITS.ASSESSMENT_SCENE_MAX).toBe(75 * 1024); // 75KB
      expect(CONTENT_LIMITS.TOTAL_JSON_MAX).toBe(500 * 1024); // 500KB
    });

    it('has appropriate performance budgets', () => {
      expect(PERFORMANCE_BUDGETS.MAX_LOADING_TIME).toBe(2000); // 2 seconds
      expect(PERFORMANCE_BUDGETS.MIN_LIGHTHOUSE_SCORE).toBe(95); // 95+ score
      expect(PERFORMANCE_BUDGETS.VALIDATION_TIMEOUT).toBe(5000); // 5 seconds
    });
  });
});