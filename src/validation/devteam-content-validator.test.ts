import { describe, it, expect, beforeEach } from 'vitest';
import { DevTeamContentValidator } from './devteam-content-validator';

describe('DevTeamContentValidator', () => {
  let validator: DevTeamContentValidator;

  beforeEach(() => {
    validator = new DevTeamContentValidator();
  });

  describe('Basic Validation', () => {
    it('should reject non-object content', () => {
      const result = validator.validateGameManifest('invalid string');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe('invalid_type');
    });

    it('should validate minimal valid game manifest', () => {
      const manifest = {
        gameId: 'test-game-001',
        version: '1.0.0',
        metadata: {
          title: 'Test Game',
          description: 'A test game',
          duration: '5 minutes',
          targetAudience: 'Municipal employees',
          language: 'sv'
        },
        scenes: [
          {
            id: 'scene-1',
            type: 'dialogue',
            messages: [{ text: 'Hello' }]
          }
        ]
      };

      const result = validator.validateGameManifest(manifest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch missing required fields', () => {
      const manifest = {
        gameId: 'test-game-001',
        // missing version
        metadata: {
          title: 'Test Game'
          // missing other required fields
        },
        scenes: []
      };

      const result = validator.validateGameManifest(manifest);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'version')).toBe(true);
      expect(result.errors.some(e => e.path === 'metadata.description')).toBe(true);
    });
  });

  describe('Quiz Scene Validation', () => {
    it('should validate standard quiz format', () => {
      const manifest = {
        gameId: 'quiz-game',
        version: '1.0.0',
        metadata: {
          title: 'Quiz Game',
          description: 'Test quiz',
          duration: '10 minutes',
          targetAudience: 'All',
          language: 'sv'
        },
        scenes: [{
          id: 'quiz-1',
          type: 'quiz',
          question: 'What is 2+2?',
          options: [
            { id: 'opt-1', text: '3', isCorrect: false },
            { id: 'opt-2', text: '4', isCorrect: true }
          ]
        }]
      };

      const result = validator.validateGameManifest(manifest);
      expect(result.isValid).toBe(true);
    });

    it('should validate DevTeam quiz format with option_text', () => {
      const manifest = {
        gameId: 'quiz-game',
        version: '1.0.0',
        metadata: {
          title: 'Quiz Game',
          description: 'Test quiz',
          duration: '10 minutes',
          targetAudience: 'All',
          language: 'sv'
        },
        scenes: [{
          id: 'quiz-1',
          type: 'quiz',
          questions: [{
            question_text: 'What is GDPR?',
            options: [
              { option_text: 'General Data Protection Regulation', is_correct: true },
              { option_text: 'Global Data Privacy Rules', is_correct: false }
            ]
          }]
        }]
      };

      const result = validator.validateGameManifest(manifest);
      expect(result.isValid).toBe(true);
    });

    it('should require at least one correct answer', () => {
      const manifest = {
        gameId: 'quiz-game',
        version: '1.0.0',
        metadata: {
          title: 'Quiz Game',
          description: 'Test quiz',
          duration: '10 minutes',
          targetAudience: 'All',
          language: 'sv'
        },
        scenes: [{
          id: 'quiz-1',
          type: 'quiz',
          questions: [{
            question_text: 'What is GDPR?',
            options: [
              { option_text: 'Wrong answer 1', is_correct: false },
              { option_text: 'Wrong answer 2', is_correct: false }
            ]
          }]
        }]
      };

      const result = validator.validateGameManifest(manifest);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('correct option'))).toBe(true);
    });
  });

  describe('Dialogue Scene Validation', () => {
    it('should validate standard dialogue format', () => {
      const manifest = {
        gameId: 'dialogue-game',
        version: '1.0.0',
        metadata: {
          title: 'Dialogue Game',
          description: 'Test dialogue',
          duration: '15 minutes',
          targetAudience: 'All',
          language: 'sv'
        },
        scenes: [{
          id: 'dialogue-1',
          type: 'dialogue',
          messages: [
            { text: 'Welcome!', characterId: 'narrator' },
            { text: 'Hello there!', characterId: 'player' }
          ]
        }]
      };

      const result = validator.validateGameManifest(manifest);
      expect(result.isValid).toBe(true);
    });

    it('should validate DevTeam dialogue format', () => {
      const manifest = {
        gameId: 'dialogue-game',
        version: '1.0.0',
        metadata: {
          title: 'Dialogue Game',
          description: 'Test dialogue',
          duration: '15 minutes',
          targetAudience: 'All',
          language: 'sv'
        },
        scenes: [{
          id: 'dialogue-1',
          type: 'dialogue',
          dialogue_turns: [
            {
              speaker: 'Anna Svensson',
              character_id: 'anna',
              text: 'Welcome to GDPR training!'
            }
          ]
        }]
      };

      const result = validator.validateGameManifest(manifest);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Warnings', () => {
    it('should warn about unsupported language codes', () => {
      const manifest = {
        gameId: 'test-game',
        version: '1.0.0',
        metadata: {
          title: 'Test Game',
          description: 'A test game',
          duration: '5 minutes',
          targetAudience: 'All',
          language: 'es' // Spanish not in supported list
        },
        scenes: [{
          id: 'scene-1',
          type: 'dialogue',
          messages: [{ text: 'Hola!' }]
        }]
      };

      const result = validator.validateGameManifest(manifest);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.path === 'metadata.language')).toBe(true);
    });

    it('should warn about incorrect duration format', () => {
      const manifest = {
        gameId: 'test-game',
        version: '1.0.0',
        metadata: {
          title: 'Test Game',
          description: 'A test game',
          duration: '5m', // Should be "5 minutes"
          targetAudience: 'All',
          language: 'sv'
        },
        scenes: [{
          id: 'scene-1',
          type: 'dialogue',
          messages: [{ text: 'Hello!' }]
        }]
      };

      const result = validator.validateGameManifest(manifest);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.path === 'metadata.duration')).toBe(true);
    });
  });
});