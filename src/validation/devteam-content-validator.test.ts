import { describe, it, expect, beforeEach } from 'vitest';
import { DevTeamContentValidator } from './devteam-content-validator';

describe('DevTeamContentValidator', () => {
  let validator: DevTeamContentValidator;

  beforeEach(() => {
    validator = new DevTeamContentValidator();
  });

  describe('Basic Validation', () => {
    it('should reject non-object content', () => {
      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe('invalid_type');
    });

    it('should validate minimal valid game manifest', () => {

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch missing required fields', () => {

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'version')).toBe(true);
      expect(result.errors.some(e => e.path === 'metadata.description')).toBe(true);
    });
  });

  describe('Quiz Scene Validation', () => {
    it('should validate standard quiz format', () => {

      expect(result.isValid).toBe(true);
    });

    it('should validate DevTeam quiz format with option_text', () => {

      expect(result.isValid).toBe(true);
    });

    it('should require at least one correct answer', () => {

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('correct option'))).toBe(true);
    });
  });

  describe('Dialogue Scene Validation', () => {
    it('should validate standard dialogue format', () => {

      expect(result.isValid).toBe(true);
    });

    it('should validate DevTeam dialogue format', () => {

      expect(result.isValid).toBe(true);
    });
  });

  describe('Warnings', () => {
    it('should warn about unsupported language codes', () => {

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.path === 'metadata.language')).toBe(true);
    });

    it('should warn about incorrect duration format', () => {

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.path === 'metadata.duration')).toBe(true);
    });
  });
});