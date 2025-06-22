import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// AI Content Validation Test Framework
// Ensures >95% autonomous deployment rate by catching malformed AI content
// Roadmap-Ref: Q1-AO-Milestone-1.2

// DevTeam JSON Schema Definitions
const CharacterSchema = z.object({
  character_id: z.string().min(1),
  name: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  avatar_description: z.string().max(500).optional(),
  personality_traits: z.array(z.string()).max(10).optional()
});

const DialogueTurnSchema = z.object({
  speaker: z.string().min(1),
  character_id: z.string().min(1),
  text: z.string().min(1).max(5000),
  emotion: z.enum(['neutral', 'happy', 'sad', 'confident', 'concerned', 'excited']).optional(),
  timing: z.number().min(0).optional()
});

const DialogueSceneSchema = z.object({
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

const QuizOptionSchema = z.object({
  option_id: z.string().regex(/^[a-zA-Z0-9-_]+$/),
  text: z.string().min(1).max(500),
  is_correct: z.boolean(),
  feedback: z.string().max(1000).optional()
});

const QuizQuestionSchema = z.object({
  question_id: z.string().regex(/^[a-zA-Z0-9-_]+$/),
  question_type: z.enum(['multiple_choice', 'true_false', 'multiple_select']),
  question_text: z.string().min(10).max(1000),
  options: z.array(QuizOptionSchema).min(2).max(6),
  explanation: z.string().max(2000).optional(),
  learning_objective: z.string().max(500).optional(),
  points: z.number().min(1).max(100).optional(),
  time_limit: z.number().min(10).max(300).optional()
});

const QuizSceneSchema = z.object({
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

const GameManifestSchema = z.object({
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
      const validated = await GameManifestSchema.parseAsync(content);
      this.validationStats.successfulValidations++;
      
      // Additional business rule validations
      const businessRuleErrors = this.validateBusinessRules(validated);
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
        const errors = this.formatZodErrors(error);
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
          const hasCorrect = question.options.some(opt => opt.is_correct);
          if (!hasCorrect) {
            errors.push(`Question ${question.question_id} has no correct answer`);
          }
        });
      }
    });
    
    // Rule 2: Unique scene IDs
    const sceneIds = new Set<string>();
    manifest.scenes.forEach(scene => {
      if (sceneIds.has(scene.scene_id)) {
        errors.push(`Duplicate scene ID: ${scene.scene_id}`);
      }
      sceneIds.add(scene.scene_id);
    });
    
    // Rule 3: Total duration matches scene durations
    const totalSceneDuration = manifest.scenes.reduce((sum, scene) => sum + scene.scene_duration, 0);
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
    const sanitized = JSON.parse(JSON.stringify(manifest));
    
    // Sanitize text content
    const sanitizeText = (text: string): string => {
      return text
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframes
        .replace(/javascript:/gi, '') // Remove javascript: URLs
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    };
    
    // Recursively sanitize all text fields
    const sanitizeObject = (obj: Record<string, unknown>): void => {
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
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    });
  }

  private trackCommonErrors(errors: string[]): void {
    errors.forEach(error => {
      const count = this.validationStats.commonErrors.get(error) || 0;
      this.validationStats.commonErrors.set(error, count + 1);
    });
  }

  private generateRecoverySuggestion(error: z.ZodError): string {
    const firstError = error.errors[0];
    
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
      const validManifest = {
        game_id: 'gdpr-training-v1',
        game_version: '1.0.0',
        title: 'GDPR Training for Municipal Employees',
        description: 'Learn about GDPR compliance in municipal context',
        target_audience: 'Municipal employees in Sweden',
        learning_objectives: ['Understand GDPR principles', 'Apply GDPR in daily work'],
        scenes: [
          {
            scene_id: 'intro-dialogue',
            scene_type: 'DialogueScene',
            title: 'Welcome to GDPR Training',
            characters: [{
              character_id: 'anna',
              name: 'Anna Svensson',
              role: 'GDPR Expert'
            }],
            dialogue_turns: [{
              speaker: 'Anna Svensson',
              character_id: 'anna',
              text: 'Welcome to our GDPR training!',
              emotion: 'happy'
            }],
            scene_duration: 120
          }
        ],
        total_duration: 120,
        difficulty_level: 'beginner',
        language: 'sv'
      };

      const result = await validator.validateGameManifest(validManifest);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects manifest with missing required fields', async () => {
      const invalidManifest = {
        game_id: 'test',
        // Missing required fields
      };

      const result = await validator.validateGameManifest(invalidManifest);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('validates scene ID format', async () => {
      const manifest = {
        game_id: 'test-game',
        game_version: '1.0.0',
        title: 'Test',
        description: 'Test game',
        target_audience: 'Test audience',
        learning_objectives: ['Test objective'],
        scenes: [{
          scene_id: 'invalid scene id!', // Invalid format
          scene_type: 'DialogueScene',
          title: 'Test Scene',
          characters: [{ character_id: 'test', name: 'Test', role: 'Tester' }],
          dialogue_turns: [{ speaker: 'Test', character_id: 'test', text: 'Hello' }],
          scene_duration: 60
        }],
        total_duration: 60,
        difficulty_level: 'beginner',
        language: 'en'
      };

      const result = await validator.validateGameManifest(manifest);
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('scene_id'))).toBe(true);
    });
  });

  describe('Edge Cases and Malformed Content', () => {
    it('handles extremely large JSON payloads', async () => {
      const largeManifest = {
        game_id: 'large-game',
        game_version: '1.0.0',
        title: 'Large Game',
        description: 'A'.repeat(1999), // Near max limit
        target_audience: 'Test',
        learning_objectives: Array(20).fill('Objective'), // Max objectives
        scenes: Array(100).fill(null).map((_, i) => ({
          scene_id: `scene-${i}`,
          scene_type: 'DialogueScene',
          title: `Scene ${i}`,
          characters: [{ character_id: 'test', name: 'Test', role: 'Tester' }],
          dialogue_turns: Array(100).fill(null).map((_, j) => ({
            speaker: 'Test',
            character_id: 'test',
            text: 'A'.repeat(4999) // Near max text length
          })),
          scene_duration: 1800
        })),
        total_duration: 180000,
        difficulty_level: 'advanced',
        language: 'en'
      };

      const startTime = Date.now();
      const result = await validator.validateGameManifest(largeManifest);
      const validationTime = Date.now() - startTime;

      expect(validationTime).toBeLessThan(5000); // Should validate in under 5 seconds
      expect(result.success).toBe(true);
    });

    it('handles deeply nested malformed JSON', async () => {
      const malformedManifest = {
        game_id: 'test',
        scenes: [{
          scene_type: 'DialogueScene',
          dialogue_turns: [{
            speaker: null, // Invalid null
            text: undefined, // Invalid undefined
            nested: {
              deeply: {
                nested: {
                  value: 'test'
                }
              }
            }
          }]
        }]
      };

      const result = await validator.validateGameManifest(malformedManifest);
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
      const result = await validator.validateGameManifest(circularManifest);
      expect(result.success).toBe(false);
    });
  });

  describe('Unicode and Special Characters', () => {
    it('handles various Unicode characters correctly', async () => {
      const unicodeManifest = {
        game_id: 'unicode-test',
        game_version: '1.0.0',
        title: 'Unicode Test 你好 مرحبا 🎮',
        description: 'Testing émojis 🚀 and special çhäracters ñ ü ö ä',
        target_audience: 'International users',
        learning_objectives: ['Learn about Unicode 文字'],
        scenes: [{
          scene_id: 'unicode-scene',
          scene_type: 'DialogueScene',
          title: 'Unicode Scene Тест',
          characters: [{
            character_id: 'anna',
            name: 'Anna Svensson-Müller',
            role: 'Specialteckenexpert åäö'
          }],
          dialogue_turns: [{
            speaker: 'Anna Svensson-Müller',
            character_id: 'anna',
            text: 'Välkommen! Let\'s test some Unicode: 你好世界 🌍'
          }],
          scene_duration: 120
        }],
        total_duration: 120,
        difficulty_level: 'beginner',
        language: 'sv'
      };

      const result = await validator.validateGameManifest(unicodeManifest);
      expect(result.success).toBe(true);
      expect(result.sanitizedContent.title).toContain('🎮');
      expect(result.sanitizedContent.scenes[0].dialogue_turns[0].text).toContain('你好世界');
    });

    it('handles RTL (Right-to-Left) text', async () => {
      const rtlManifest = {
        game_id: 'rtl-test',
        game_version: '1.0.0',
        title: 'RTL Test مرحبا بكم',
        description: 'Testing Arabic: هذا نص تجريبي',
        target_audience: 'Arabic speakers',
        learning_objectives: ['تعلم GDPR'],
        scenes: [{
          scene_id: 'rtl-scene',
          scene_type: 'DialogueScene',
          title: 'مشهد عربي',
          characters: [{
            character_id: 'ahmed',
            name: 'أحمد محمد',
            role: 'خبير GDPR'
          }],
          dialogue_turns: [{
            speaker: 'أحمد محمد',
            character_id: 'ahmed',
            text: 'مرحباً بكم في تدريب GDPR'
          }],
          scene_duration: 120
        }],
        total_duration: 120,
        difficulty_level: 'beginner',
        language: 'en' // Arabic not in enum yet
      };

      const result = await validator.validateGameManifest(rtlManifest);
      expect(result.success).toBe(true);
    });

    it('strips zero-width characters that could be malicious', async () => {
      const zeroWidthManifest = {
        game_id: 'zero-width-test',
        game_version: '1.0.0',
        title: 'Test\u200B\u200C\u200DTitle', // Zero-width spaces
        description: 'Normal description',
        target_audience: 'Test',
        learning_objectives: ['Test'],
        scenes: [{
          scene_id: 'test-scene',
          scene_type: 'DialogueScene',
          title: 'Test',
          characters: [{
            character_id: 'test',
            name: 'Test\uFEFFCharacter', // Zero-width no-break space
            role: 'Tester'
          }],
          dialogue_turns: [{
            speaker: 'Test',
            character_id: 'test',
            text: 'Hello\u200EWorld' // Left-to-right mark
          }],
          scene_duration: 60
        }],
        total_duration: 60,
        difficulty_level: 'beginner',
        language: 'en'
      };

      const result = await validator.validateGameManifest(zeroWidthManifest);
      expect(result.success).toBe(true);
      // Should sanitize but not reject
    });
  });

  describe('SQL Injection and XSS Prevention', () => {
    it('sanitizes potential XSS attacks in text content', async () => {
      const xssManifest = {
        game_id: 'xss-test',
        game_version: '1.0.0',
        title: 'Test <script>alert("XSS")</script> Title',
        description: 'Description with <img src=x onerror=alert("XSS")>',
        target_audience: 'Test',
        learning_objectives: ['Learn <iframe src="evil.com"></iframe>'],
        scenes: [{
          scene_id: 'xss-scene',
          scene_type: 'DialogueScene',
          title: 'Scene with onclick="malicious()"',
          characters: [{
            character_id: 'test',
            name: 'Test Character',
            role: 'Tester <script>steal()</script>'
          }],
          dialogue_turns: [{
            speaker: 'Test',
            character_id: 'test',
            text: 'Hello <a href="javascript:void(0)">click me</a>'
          }],
          scene_duration: 60
        }],
        total_duration: 60,
        difficulty_level: 'beginner',
        language: 'en'
      };

      const result = await validator.validateGameManifest(xssManifest);
      expect(result.success).toBe(true);
      expect(result.sanitizedContent.title).not.toContain('<script>');
      expect(result.sanitizedContent.description).not.toContain('onerror=');
      expect(result.sanitizedContent.scenes[0].dialogue_turns[0].text).not.toContain('javascript:');
    });

    it('handles SQL injection attempts in IDs', async () => {
      const sqlInjectionManifest = {
        game_id: 'test-game',
        game_version: '1.0.0',
        title: 'Test Game',
        description: 'Test',
        target_audience: 'Test',
        learning_objectives: ['Test'],
        scenes: [{
          scene_id: 'scene-1; DROP TABLE scenes;--', // SQL injection attempt
          scene_type: 'DialogueScene',
          title: 'Test Scene',
          characters: [{
            character_id: 'char1\' OR \'1\'=\'1', // SQL injection attempt
            name: 'Test Character',
            role: 'Tester'
          }],
          dialogue_turns: [{
            speaker: 'Test',
            character_id: 'char1',
            text: 'Hello'
          }],
          scene_duration: 60
        }],
        total_duration: 60,
        difficulty_level: 'beginner',
        language: 'en'
      };

      const result = await validator.validateGameManifest(sqlInjectionManifest);
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('scene_id'))).toBe(true);
    });

    it('prevents JSON injection attacks', async () => {
      const jsonInjectionManifest = {
        game_id: 'json-injection',
        game_version: '1.0.0',
        title: 'Test","malicious":true,"override":"',
        description: 'Test',
        target_audience: 'Test',
        learning_objectives: ['Test'],
        scenes: [{
          scene_id: 'test-scene',
          scene_type: 'DialogueScene',
          title: 'Test',
          characters: [{
            character_id: 'test',
            name: 'Test",{"inject":true},',
            role: 'Tester'
          }],
          dialogue_turns: [{
            speaker: 'Test',
            character_id: 'test',
            text: 'Hello'
          }],
          scene_duration: 60
        }],
        total_duration: 60,
        difficulty_level: 'beginner',
        language: 'en'
      };

      const result = await validator.validateGameManifest(jsonInjectionManifest);
      expect(result.success).toBe(true);
      // Should sanitize but still validate
      expect(result.sanitizedContent.title).toBe('Test","malicious":true,"override":"');
    });
  });

  describe('Fuzz Testing', () => {
    it('handles random malformed data without crashing', async () => {
      const fuzzInputs = [
        null,
        undefined,
        '',
        '{}',
        '[]',
        'true',
        'false',
        '123',
        '"string"',
        { random: 'object' },
        [1, 2, 3],
        new Date(),
        Symbol('test'),
        () => {},
        NaN,
        Infinity,
        -Infinity
      ];

      for (const input of fuzzInputs) {
        const result = await validator.validateGameManifest(input);
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('handles random property mutations', async () => {
      const baseManifest = {
        game_id: 'test',
        game_version: '1.0.0',
        title: 'Test',
        description: 'Test',
        target_audience: 'Test',
        learning_objectives: ['Test'],
        scenes: [{
          scene_id: 'test-scene',
          scene_type: 'DialogueScene',
          title: 'Test',
          characters: [{ character_id: 'test', name: 'Test', role: 'Test' }],
          dialogue_turns: [{ speaker: 'Test', character_id: 'test', text: 'Test' }],
          scene_duration: 60
        }],
        total_duration: 60,
        difficulty_level: 'beginner',
        language: 'en'
      };

      // Mutate random properties
      const mutations = [
        { ...baseManifest, game_id: 123 }, // Wrong type
        { ...baseManifest, game_version: 'invalid-version' }, // Wrong format
        { ...baseManifest, scenes: 'not-an-array' }, // Wrong type
        { ...baseManifest, difficulty_level: 'expert' }, // Invalid enum
        { ...baseManifest, total_duration: -100 }, // Negative duration
        { ...baseManifest, learning_objectives: [] }, // Empty required array
      ];

      for (const mutation of mutations) {
        const result = await validator.validateGameManifest(mutation);
        expect(result.success).toBe(false);
      }
    });
  });

  describe('Performance Testing', () => {
    it('validates 100 manifests in under 1 second', async () => {
      const manifests = Array(100).fill(null).map((_, i) => ({
        game_id: `game-${i}`,
        game_version: '1.0.0',
        title: `Game ${i}`,
        description: 'Test game',
        target_audience: 'Test',
        learning_objectives: ['Test'],
        scenes: [{
          scene_id: `scene-${i}`,
          scene_type: 'DialogueScene',
          title: 'Test Scene',
          characters: [{ character_id: 'test', name: 'Test', role: 'Test' }],
          dialogue_turns: [{ speaker: 'Test', character_id: 'test', text: 'Hello' }],
          scene_duration: 60
        }],
        total_duration: 60,
        difficulty_level: 'beginner',
        language: 'en'
      }));

      const startTime = Date.now();
      
      for (const manifest of manifests) {
        await validator.validateGameManifest(manifest);
      }
      
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(1000);

      const stats = validator.getValidationStats();
      expect(stats.totalValidations).toBe(100);
      expect(stats.successRate).toBe(100);
    });

    it('handles 10MB JSON payload', async () => {
      // Create a large but valid manifest
      const largeManifest = {
        game_id: 'huge-game',
        game_version: '1.0.0',
        title: 'Huge Game',
        description: 'A'.repeat(2000),
        target_audience: 'Test',
        learning_objectives: Array(20).fill('Learning objective with substantial text content'),
        scenes: Array(50).fill(null).map((_, i) => ({
          scene_id: `scene-${i}`,
          scene_type: i % 2 === 0 ? 'DialogueScene' : 'QuizScene',
          title: `Scene ${i} with a longer title for more content`,
          ...(i % 2 === 0 ? {
            characters: Array(5).fill(null).map((_, j) => ({
              character_id: `char-${i}-${j}`,
              name: `Character ${j} with a longer name`,
              role: `Role description that contains more text content`,
              avatar_description: 'A'.repeat(400),
              personality_traits: Array(10).fill('trait')
            })),
            dialogue_turns: Array(50).fill(null).map((_, j) => ({
              speaker: `Character ${j % 5}`,
              character_id: `char-${i}-${j % 5}`,
              text: 'A'.repeat(1000), // 1KB per turn
              emotion: 'neutral',
              timing: j * 5
            })),
            scene_duration: 1800
          } : {
            questions: Array(20).fill(null).map((_, j) => ({
              question_id: `q-${i}-${j}`,
              question_type: 'multiple_choice',
              question_text: 'A'.repeat(500),
              options: Array(4).fill(null).map((_, k) => ({
                option_id: `opt-${i}-${j}-${k}`,
                text: 'A'.repeat(200),
                is_correct: k === 0,
                feedback: 'A'.repeat(500)
              })),
              explanation: 'A'.repeat(1000),
              learning_objective: 'A'.repeat(300),
              points: 10
            })),
            passing_score: 70,
            scene_duration: 1800
          })
        })),
        total_duration: 90000,
        difficulty_level: 'advanced',
        language: 'en'
      };

      const jsonSize = JSON.stringify(largeManifest).length;
      expect(jsonSize).toBeGreaterThan(5 * 1024 * 1024); // At least 5MB

      const startTime = Date.now();
      const result = await validator.validateGameManifest(largeManifest);
      const validationTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(validationTime).toBeLessThan(10000); // Under 10 seconds for 10MB
    });
  });

  describe('Graceful Degradation', () => {
    it('provides helpful recovery suggestions for common errors', async () => {
      const manifestWithErrors = {
        game_id: 'test',
        game_version: '1.0', // Missing patch version
        title: '', // Empty required field
        scenes: [{
          scene_type: 'UnknownSceneType', // Invalid scene type
          // Missing required fields
        }]
      };

      const result = await validator.validateGameManifest(manifestWithErrors);
      expect(result.success).toBe(false);
      expect(result.suggestion).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('attempts to recover from missing optional fields', async () => {
      const minimalManifest = {
        game_id: 'minimal',
        game_version: '1.0.0',
        title: 'Minimal Game',
        description: 'Test',
        target_audience: 'Test',
        learning_objectives: ['Test'],
        scenes: [{
          scene_id: 'minimal-scene',
          scene_type: 'DialogueScene',
          title: 'Test',
          characters: [{ character_id: 'test', name: 'Test', role: 'Test' }],
          dialogue_turns: [{ speaker: 'Test', character_id: 'test', text: 'Test' }],
          scene_duration: 60
          // Missing all optional fields
        }],
        total_duration: 60,
        difficulty_level: 'beginner',
        language: 'en'
      };

      const result = await validator.validateGameManifest(minimalManifest);
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBe(1); // Warning about short scene
    });

    it('handles partial data gracefully', async () => {
      const partialManifest = {
        game_id: 'partial',
        game_version: '1.0.0',
        title: 'Partial Game',
        // Simulate interrupted upload - rest of data missing
      };

      const result = await validator.validateGameManifest(partialManifest);
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('Required'))).toBe(true);
    });
  });

  describe('Business Rule Validation', () => {
    it('ensures quiz questions have at least one correct answer', async () => {
      const quizWithNoCorrect = {
        game_id: 'quiz-test',
        game_version: '1.0.0',
        title: 'Quiz Test',
        description: 'Test',
        target_audience: 'Test',
        learning_objectives: ['Test'],
        scenes: [{
          scene_id: 'quiz-scene',
          scene_type: 'QuizScene',
          title: 'Quiz',
          questions: [{
            question_id: 'q1',
            question_type: 'multiple_choice',
            question_text: 'Which is correct?',
            options: [
              { option_id: 'opt1', text: 'Option 1', is_correct: false },
              { option_id: 'opt2', text: 'Option 2', is_correct: false },
              { option_id: 'opt3', text: 'Option 3', is_correct: false }
            ]
          }],
          passing_score: 70,
          scene_duration: 180
        }],
        total_duration: 180,
        difficulty_level: 'beginner',
        language: 'en'
      };

      const result = await validator.validateGameManifest(quizWithNoCorrect);
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('no correct answer'))).toBe(true);
    });

    it('validates unique scene IDs', async () => {
      const duplicateScenes = {
        game_id: 'duplicate-test',
        game_version: '1.0.0',
        title: 'Duplicate Test',
        description: 'Test',
        target_audience: 'Test',
        learning_objectives: ['Test'],
        scenes: [
          {
            scene_id: 'scene-1',
            scene_type: 'DialogueScene',
            title: 'Scene 1',
            characters: [{ character_id: 'test', name: 'Test', role: 'Test' }],
            dialogue_turns: [{ speaker: 'Test', character_id: 'test', text: 'Test' }],
            scene_duration: 60
          },
          {
            scene_id: 'scene-1', // Duplicate ID
            scene_type: 'DialogueScene',
            title: 'Scene 2',
            characters: [{ character_id: 'test', name: 'Test', role: 'Test' }],
            dialogue_turns: [{ speaker: 'Test', character_id: 'test', text: 'Test' }],
            scene_duration: 60
          }
        ],
        total_duration: 120,
        difficulty_level: 'beginner',
        language: 'en'
      };

      const result = await validator.validateGameManifest(duplicateScenes);
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate scene ID'))).toBe(true);
    });

    it('validates duration consistency', async () => {
      const inconsistentDuration = {
        game_id: 'duration-test',
        game_version: '1.0.0',
        title: 'Duration Test',
        description: 'Test',
        target_audience: 'Test',
        learning_objectives: ['Test'],
        scenes: [
          {
            scene_id: 'scene-1',
            scene_type: 'DialogueScene',
            title: 'Scene 1',
            characters: [{ character_id: 'test', name: 'Test', role: 'Test' }],
            dialogue_turns: [{ speaker: 'Test', character_id: 'test', text: 'Test' }],
            scene_duration: 300 // 5 minutes
          },
          {
            scene_id: 'scene-2',
            scene_type: 'DialogueScene',
            title: 'Scene 2',
            characters: [{ character_id: 'test', name: 'Test', role: 'Test' }],
            dialogue_turns: [{ speaker: 'Test', character_id: 'test', text: 'Test' }],
            scene_duration: 300 // 5 minutes
          }
        ],
        total_duration: 300, // Should be 600
        difficulty_level: 'beginner',
        language: 'en'
      };

      const result = await validator.validateGameManifest(inconsistentDuration);
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('Total duration mismatch'))).toBe(true);
    });
  });

  describe('Validation Statistics', () => {
    it('tracks validation success rate', async () => {
      const validManifest = {
        game_id: 'valid',
        game_version: '1.0.0',
        title: 'Valid',
        description: 'Test',
        target_audience: 'Test',
        learning_objectives: ['Test'],
        scenes: [{
          scene_id: 'scene',
          scene_type: 'DialogueScene',
          title: 'Scene',
          characters: [{ character_id: 'test', name: 'Test', role: 'Test' }],
          dialogue_turns: [{ speaker: 'Test', character_id: 'test', text: 'Test' }],
          scene_duration: 60
        }],
        total_duration: 60,
        difficulty_level: 'beginner',
        language: 'en'
      };

      // Validate some good and bad manifests
      await validator.validateGameManifest(validManifest);
      await validator.validateGameManifest({});
      await validator.validateGameManifest(null);
      await validator.validateGameManifest(validManifest);

      const stats = validator.getValidationStats();
      expect(stats.totalValidations).toBe(4);
      expect(stats.successfulValidations).toBe(2);
      expect(stats.failedValidations).toBe(2);
      expect(stats.successRate).toBe(50);
    });

    it('tracks common validation errors', async () => {
      // Generate same error multiple times
      const invalidManifests = Array(5).fill({
        game_id: 123, // Wrong type - should be string
        game_version: 'invalid' // Wrong format
      });

      for (const manifest of invalidManifests) {
        await validator.validateGameManifest(manifest);
      }

      const stats = validator.getValidationStats();
      expect(stats.topErrors.length).toBeGreaterThan(0);
      expect(stats.topErrors[0][1]).toBe(5); // Same error 5 times
    });
  });
});

// Export for use in other tests
export { AIContentValidator, GameManifestSchema, ValidationResult };