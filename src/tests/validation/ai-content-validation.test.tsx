import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// AI Content Validation Test Framework
// Ensures >95% autonomous deployment rate by catching malformed AI content
// Roadmap-Ref: Q1-AO-Milestone-1.2

// DevTeam JSON Schema Definitions
const _CharacterSchema = z.object({
  character_id: z.string().min(1),
  name: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  avatar_description: z.string().max(500).optional(),
  personality_traits: z.array(z.string()).max(10).optional()
});

const _DialogueTurnSchema = z.object({
  speaker: z.string().min(1),
  character_id: z.string().min(1),
  text: z.string().min(1).max(5000),
  emotion: z.enum(['neutral', 'happy', 'sad', 'confident', 'concerned', 'excited']).optional(),
  timing: z.number().min(0).optional()
});

const _DialogueSceneSchema = z.object({
  scene_id: z.string().regex(/^[a-zA-Z0-9-_]+$/),
  scene_type: z.literal('DialogueScene'),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  characters: z.array(CharacterSchema).min(1).max(10),
  dialogue_turns: z.array(DialogueTurnSchema).min(1).max(100),
  learning_objectives: z.array(z.string()).max(10).optional(),
  scene_duration: z.number().min(30).max(1800), // 30s to 30min
  cultural_context: z.enum(['swedish', 'german', 'french', 'dutch']).optional()
});

const _QuizOptionSchema = z.object({
  option_id: z.string().regex(/^[a-zA-Z0-9-_]+$/),
  text: z.string().min(1).max(500),
  is_correct: z.boolean(),
  feedback: z.string().max(1000).optional()
});

const _QuizQuestionSchema = z.object({
  question_id: z.string().regex(/^[a-zA-Z0-9-_]+$/),
  question_type: z.enum(['multiple_choice', 'true_false', 'multiple_select']),
  question_text: z.string().min(10).max(1000),
  options: z.array(QuizOptionSchema).min(2).max(6),
  explanation: z.string().max(2000).optional(),
  learning_objective: z.string().max(500).optional(),
  points: z.number().min(1).max(100).optional(),
  time_limit: z.number().min(10).max(300).optional()
});

const _QuizSceneSchema = z.object({
  scene_id: z.string().regex(/^[a-zA-Z0-9-_]+$/),
  scene_type: z.literal('QuizScene'),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  questions: z.array(QuizQuestionSchema).min(1).max(50),
  passing_score: z.number().min(0).max(100),
  scene_duration: z.number().min(60).max(3600), // 1min to 1hour
  feedback_immediate: z.boolean().optional(),
  allow_retry: z.boolean().optional()
});

const _GameManifestSchema = z.object({
  game_id: z.string().regex(/^[a-zA-Z0-9-_]+$/),
  game_version: z.string().regex(/^\d+\.\d+\.\d+$/),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  target_audience: z.string().max(500),
  learning_objectives: z.array(z.string()).min(1).max(20),
  scenes: z.array(z.union([DialogueSceneSchema, QuizSceneSchema])).min(1).max(100),
  total_duration: z.number().min(300).max(7200), // 5min to 2hours
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.enum(['sv', 'de', 'fr', 'nl', 'en']),
  cultural_adaptation: z.object({
    municipality: z.string().max(100),
    region: z.string().max(100),
    specific_terminology: z.record(z.string()).optional()
  }).optional()
});

// Validation Service
class AIContentValidator {
  private validationStats = {
    totalValidations: 0,
    successfulValidations: 0,
    failedValidations: 0,
    commonErrors: new Map<string, number>()
  };

  async validateGameManifest(content: unknown): Promise<ValidationResult> {
    this.validationStats.totalValidations++;
    
    try {
      this.validationStats.successfulValidations++;
      
      // Additional business rule validations
      if (businessRuleErrors.length > 0) {
        return {
          success: false,
          errors: businessRuleErrors,
          warnings: [],
          sanitizedContent: null
        };
      }
      
      return {
        success: true,
        errors: [],
        warnings: this.generateWarnings(validated),
        sanitizedContent: this.sanitizeContent(validated)
      };
    } catch (error) {
      this.validationStats.failedValidations++;
      
      if (error instanceof z.ZodError) {
        this.trackCommonErrors(errors);
        
        return {
          success: false,
          errors,
          warnings: [],
          sanitizedContent: null,
          suggestion: this.generateRecoverySuggestion(error)
        };
      }
      
      return {
        success: false,
        errors: ['Unknown validation error'],
        warnings: [],
        sanitizedContent: null
      };
    }
  }

  private validateBusinessRules(manifest: z.infer<typeof GameManifestSchema>): string[] {
    const errors: string[] = [];
    
    // Rule 1: At least one correct answer per quiz
    manifest.scenes.forEach(scene => {
      if (scene.scene_type === 'QuizScene') {
        scene.questions.forEach(question => {
          if (!hasCorrect) {
            errors.push(`Question ${question.question_id} has no correct answer`);
          }
        });
      }
    });
    
    // Rule 2: Unique scene IDs
    manifest.scenes.forEach(scene => {
      if (sceneIds.has(scene.scene_id)) {
        errors.push(`Duplicate scene ID: ${scene.scene_id}`);
      }
      sceneIds.add(scene.scene_id);
    });
    
    // Rule 3: Total duration matches scene durations
    if (Math.abs(totalSceneDuration - manifest.total_duration) > 60) {
      errors.push(`Total duration mismatch: manifest says ${manifest.total_duration}s but scenes total ${totalSceneDuration}s`);
    }
    
    return errors;
  }

  private generateWarnings(manifest: z.infer<typeof GameManifestSchema>): string[] {
    const warnings: string[] = [];
    
    // Warning: Very short scenes
    manifest.scenes.forEach(scene => {
      if (scene.scene_duration < 60) {
        warnings.push(`Scene ${scene.scene_id} is very short (${scene.scene_duration}s)`);
      }
    });
    
    // Warning: Quiz with many questions
    manifest.scenes.forEach(scene => {
      if (scene.scene_type === 'QuizScene' && scene.questions.length > 20) {
        warnings.push(`Quiz ${scene.scene_id} has ${scene.questions.length} questions - consider splitting`);
      }
    });
    
    return warnings;
  }

  private sanitizeContent(manifest: z.infer<typeof GameManifestSchema>): Record<string, unknown> {
    // Deep clone and sanitize
    
    // Sanitize text content
    const _sanitizeText = (text: string): string => {
      return text
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframes
        .replace(/javascript:/gi, '') // Remove javascript: URLs
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    };
    
    // Recursively sanitize all text fields
    const _sanitizeObject = (obj: Record<string, unknown>): void => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeText(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };
    
    sanitizeObject(sanitized);
    return sanitized;
  }

  private formatZodErrors(error: z.ZodError): string[] {
    return error.errors.map(err => {
      return `${path}: ${err.message}`;
    });
  }

  private trackCommonErrors(errors: string[]): void {
    errors.forEach(error => {
      this.validationStats.commonErrors.set(error, count + 1);
    });
  }

  private generateRecoverySuggestion(error: z.ZodError): string {
    
    if (firstError.code === 'invalid_type') {
      return `Expected ${firstError.expected} but got ${firstError.received} at ${firstError.path.join('.')}`;
    }
    
    if (firstError.code === 'too_small') {
      return `Value at ${firstError.path.join('.')} is too small. Minimum: ${firstError.minimum}`;
    }
    
    if (firstError.code === 'too_big') {
      return `Value at ${firstError.path.join('.')} is too large. Maximum: ${firstError.maximum}`;
    }
    
    return 'Check the schema documentation for correct format';
  }

  getValidationStats() {
    return {
      ...this.validationStats,
      successRate: this.validationStats.totalValidations > 0 
        ? (this.validationStats.successfulValidations / this.validationStats.totalValidations) * 100 
        : 0,
      topErrors: Array.from(this.validationStats.commonErrors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    };
  }
}

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  sanitizedContent: Record<string, unknown> | null;
  suggestion?: string;
}

// Test Suite
describe('AI Content Validation Test Framework', () => {
  let validator: AIContentValidator;

  beforeEach(() => {
    validator = new AIContentValidator();
  });

  describe('Basic Schema Validation', () => {
    it('validates correct game manifest', async () => {

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects manifest with missing required fields', async () => {

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('validates scene ID format', async () => {

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('scene_id'))).toBe(true);
    });
  });

  describe('Edge Cases and Malformed Content', () => {
    it('handles extremely large JSON payloads', async () => {


      expect(validationTime).toBeLessThan(5000); // Should validate in under 5 seconds
      expect(result.success).toBe(true);
    });

    it('handles deeply nested malformed JSON', async () => {

      expect(result.success).toBe(false);
      expect(result.suggestion).toBeDefined();
    });

    it('handles circular references gracefully', async () => {
      const circularManifest: Record<string, unknown> = {
        game_id: 'circular',
        game_version: '1.0.0',
        title: 'Circular Test',
        description: 'Test',
        target_audience: 'Test',
        learning_objectives: ['Test'],
        scenes: []
      };
      
      // Create circular reference
      circularManifest.circular = circularManifest;

      // Should handle without crashing
      expect(result.success).toBe(false);
    });
  });

  describe('Unicode and Special Characters', () => {
    it('handles various Unicode characters correctly', async () => {

      expect(result.success).toBe(true);
      expect(result.sanitizedContent.title).toContain('🎮');
      expect(result.sanitizedContent.scenes[0].dialogue_turns[0].text).toContain('你好世界');
    });

    it('handles RTL (Right-to-Left) text', async () => {

      expect(result.success).toBe(true);
    });

    it('strips zero-width characters that could be malicious', async () => {

      expect(result.success).toBe(true);
      // Should sanitize but not reject
    });
  });

  describe('SQL Injection and XSS Prevention', () => {
    it('sanitizes potential XSS attacks in text content', async () => {

      expect(result.success).toBe(true);
      expect(result.sanitizedContent.title).not.toContain('<script>');
      expect(result.sanitizedContent.description).not.toContain('onerror=');
      expect(result.sanitizedContent.scenes[0].dialogue_turns[0].text).not.toContain('javascript:');
    });

    it('handles SQL injection attempts in IDs', async () => {

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('scene_id'))).toBe(true);
    });

    it('prevents JSON injection attacks', async () => {

      expect(result.success).toBe(true);
      // Should sanitize but still validate
      expect(result.sanitizedContent.title).toBe('Test","malicious":true,"override":"');
    });
  });

  describe('Fuzz Testing', () => {
    it('handles random malformed data without crashing', async () => {

      for (const input of fuzzInputs) {
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('handles random property mutations', async () => {

      // Mutate random properties

      for (const mutation of mutations) {
        expect(result.success).toBe(false);
      }
    });
  });

  describe('Performance Testing', () => {
    it('validates 100 manifests in under 1 second', async () => {

      
      for (const manifest of manifests) {
        await validator.validateGameManifest(manifest);
      }
      
      expect(totalTime).toBeLessThan(1000);

      expect(stats.totalValidations).toBe(100);
      expect(stats.successRate).toBe(100);
    });

    it('handles 10MB JSON payload', async () => {
      // Create a large but valid manifest

      expect(jsonSize).toBeGreaterThan(5 * 1024 * 1024); // At least 5MB


      expect(result.success).toBe(true);
      expect(validationTime).toBeLessThan(10000); // Under 10 seconds for 10MB
    });
  });

  describe('Graceful Degradation', () => {
    it('provides helpful recovery suggestions for common errors', async () => {

      expect(result.success).toBe(false);
      expect(result.suggestion).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('attempts to recover from missing optional fields', async () => {

      expect(result.success).toBe(true);
      expect(result.warnings.length).toBe(1); // Warning about short scene
    });

    it('handles partial data gracefully', async () => {

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('Required'))).toBe(true);
    });
  });

  describe('Business Rule Validation', () => {
    it('ensures quiz questions have at least one correct answer', async () => {

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('no correct answer'))).toBe(true);
    });

    it('validates unique scene IDs', async () => {

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate scene ID'))).toBe(true);
    });

    it('validates duration consistency', async () => {

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('Total duration mismatch'))).toBe(true);
    });
  });

  describe('Validation Statistics', () => {
    it('tracks validation success rate', async () => {

      // Validate some good and bad manifests
      await validator.validateGameManifest(validManifest);
      await validator.validateGameManifest({});
      await validator.validateGameManifest(null);
      await validator.validateGameManifest(validManifest);

      expect(stats.totalValidations).toBe(4);
      expect(stats.successfulValidations).toBe(2);
      expect(stats.failedValidations).toBe(2);
      expect(stats.successRate).toBe(50);
    });

    it('tracks common validation errors', async () => {
      // Generate same error multiple times
      const _invalidManifests = Array(5).fill({
        game_id: 123, // Wrong type - should be string
        game_version: 'invalid' // Wrong format
      });

      for (const manifest of invalidManifests) {
        await validator.validateGameManifest(manifest);
      }

      expect(stats.topErrors.length).toBeGreaterThan(0);
      expect(stats.topErrors[0][1]).toBe(5); // Same error 5 times
    });
  });
});

// Export for use in other tests
export { AIContentValidator, GameManifestSchema, ValidationResult };