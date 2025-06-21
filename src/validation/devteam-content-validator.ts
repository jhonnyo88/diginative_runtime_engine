/**
 * Basic DevTeam JSON Validation Foundation
 * Roadmap Ref: Q1-AO-Milestone-1.2
 * 
 * Progressive implementation toward AI Content Pipeline Resilience
 * This is the foundation - basic TypeScript validation only
 * No advanced sanitization or transformation yet
 */

import type { GameManifest, BaseScene, DialogueScene, QuizScene } from '../types/game-manifest';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  type: 'missing' | 'invalid_type' | 'invalid_value' | 'structure';
}

export interface ValidationWarning {
  path: string;
  message: string;
  type: 'deprecated' | 'performance' | 'best_practice';
}

/**
 * Basic DevTeam content validator
 * Ensures AI-generated content meets minimum requirements
 */
export class DevTeamContentValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];

  /**
   * Validate individual scene content
   */
  validateSceneContent(content: unknown): ValidationResult {
    this.errors = [];
    this.warnings = [];

    if (!this.isObject(content)) {
      this.addError('root', 'Scene content must be a valid JSON object', 'invalid_type');
      return this.getResult();
    }

    this.validateScene(content as any, 'root');
    return this.getResult();
  }

  /**
   * Validate quiz scene content specifically
   */
  validateQuizContent(content: unknown): ValidationResult {
    this.errors = [];
    this.warnings = [];

    if (!this.isObject(content)) {
      this.addError('root', 'Quiz content must be a valid JSON object', 'invalid_type');
      return this.getResult();
    }

    const scene = { ...content as any, type: 'quiz' };
    this.validateQuizScene(scene, 'root');
    return this.getResult();
  }

  /**
   * Validate dialogue scene content specifically
   */
  validateDialogueContent(content: unknown): ValidationResult {
    this.errors = [];
    this.warnings = [];

    if (!this.isObject(content)) {
      this.addError('root', 'Dialogue content must be a valid JSON object', 'invalid_type');
      return this.getResult();
    }

    const scene = { ...content as any, type: 'dialogue' };
    this.validateDialogueScene(scene, 'root');
    return this.getResult();
  }

  /**
   * Validate complete game manifest from DevTeam
   */
  validateGameManifest(content: unknown): ValidationResult {
    this.errors = [];
    this.warnings = [];

    // Basic type check
    if (!this.isObject(content)) {
      this.addError('root', 'Content must be a valid JSON object', 'invalid_type');
      return this.getResult();
    }

    const manifest = content as any;

    // Required top-level fields
    this.validateRequiredField(manifest, 'gameId', 'string');
    this.validateRequiredField(manifest, 'version', 'string');
    this.validateRequiredField(manifest, 'metadata', 'object');
    this.validateRequiredField(manifest, 'scenes', 'array');

    // Validate metadata
    if (manifest.metadata && typeof manifest.metadata === 'object') {
      this.validateMetadata(manifest.metadata);
    }

    // Validate scenes
    if (Array.isArray(manifest.scenes)) {
      manifest.scenes.forEach((scene: any, index: number) => {
        this.validateScene(scene, `scenes[${index}]`);
      });
    }

    // Check for empty scenes array
    if (Array.isArray(manifest.scenes) && manifest.scenes.length === 0) {
      this.addError('scenes', 'Game must have at least one scene', 'invalid_value');
    }

    return this.getResult();
  }

  /**
   * Validate game metadata
   */
  private validateMetadata(metadata: any): void {
    const path = 'metadata';
    
    // Required metadata fields
    this.validateRequiredField(metadata, 'title', 'string', path);
    this.validateRequiredField(metadata, 'description', 'string', path);
    this.validateRequiredField(metadata, 'duration', 'string', path);
    this.validateRequiredField(metadata, 'targetAudience', 'string', path);
    this.validateRequiredField(metadata, 'language', 'string', path);

    // Validate language code
    if (metadata.language && !['sv', 'de', 'fr', 'nl', 'en'].includes(metadata.language)) {
      this.addWarning(`${path}.language`, 
        `Language '${metadata.language}' might not be fully supported`, 
        'best_practice'
      );
    }

    // Check duration format
    if (metadata.duration && typeof metadata.duration === 'string') {
      if (!metadata.duration.match(/^\d+\s*(minutes?|mins?)$/i)) {
        this.addWarning(`${path}.duration`, 
          'Duration should be in format "X minutes"', 
          'best_practice'
        );
      }
    }
  }

  /**
   * Validate individual scene
   */
  private validateScene(scene: any, path: string): void {
    // Required scene fields
    this.validateRequiredField(scene, 'id', 'string', path);
    this.validateRequiredField(scene, 'type', 'string', path);

    // Validate scene type
    const validTypes = ['dialogue', 'quiz', 'assessment', 'resource', 'summary'];
    if (scene.type && !validTypes.includes(scene.type)) {
      this.addError(`${path}.type`, 
        `Invalid scene type '${scene.type}'. Must be one of: ${validTypes.join(', ')}`, 
        'invalid_value'
      );
      return;
    }

    // Type-specific validation
    switch (scene.type) {
      case 'dialogue':
        this.validateDialogueScene(scene, path);
        break;
      case 'quiz':
        this.validateQuizScene(scene, path);
        break;
      // Other scene types can be added later
    }

    // Navigation validation
    if (scene.navigation) {
      this.validateNavigation(scene.navigation, `${path}.navigation`);
    }
  }

  /**
   * Validate dialogue scene specifics
   */
  private validateDialogueScene(scene: any, path: string): void {
    // Handle both direct messages and DevTeam format
    if (scene.dialogue_turns) {
      // DevTeam format
      if (!Array.isArray(scene.dialogue_turns)) {
        this.addError(`${path}.dialogue_turns`, 'dialogue_turns must be an array', 'invalid_type');
      } else {
        scene.dialogue_turns.forEach((turn: any, index: number) => {
          const turnPath = `${path}.dialogue_turns[${index}]`;
          this.validateRequiredField(turn, 'speaker', 'string', turnPath);
          this.validateRequiredField(turn, 'text', 'string', turnPath);
          this.validateRequiredField(turn, 'character_id', 'string', turnPath);
        });
      }
    } else if (scene.messages) {
      // Standard format
      if (!Array.isArray(scene.messages)) {
        this.addError(`${path}.messages`, 'messages must be an array', 'invalid_type');
      } else if (scene.messages.length === 0) {
        this.addError(`${path}.messages`, 'Dialogue must have at least one message', 'invalid_value');
      }
    } else {
      this.addError(path, 'Dialogue scene must have either messages or dialogue_turns', 'missing');
    }
  }

  /**
   * Validate quiz scene specifics
   */
  private validateQuizScene(scene: any, path: string): void {
    // Handle both formats
    if (scene.questions) {
      // DevTeam format with questions array
      if (!Array.isArray(scene.questions)) {
        this.addError(`${path}.questions`, 'questions must be an array', 'invalid_type');
      } else {
        scene.questions.forEach((question: any, qIndex: number) => {
          const qPath = `${path}.questions[${qIndex}]`;
          this.validateRequiredField(question, 'question_text', 'string', qPath);
          this.validateRequiredField(question, 'options', 'array', qPath);
          
          if (Array.isArray(question.options)) {
            let hasCorrect = false;
            question.options.forEach((option: any, oIndex: number) => {
              const optPath = `${qPath}.options[${oIndex}]`;
              // Support both 'text' and 'option_text'
              if (!option.text && !option.option_text) {
                this.addError(optPath, 'Option must have either text or option_text', 'missing');
              }
              if (option.is_correct === true) {
                hasCorrect = true;
              }
            });
            
            if (!hasCorrect) {
              this.addError(qPath, 'Quiz question must have at least one correct option', 'invalid_value');
            }
          }
        });
      }
    } else {
      // Standard format
      this.validateRequiredField(scene, 'question', 'string', path);
      this.validateRequiredField(scene, 'options', 'array', path);
      
      if (Array.isArray(scene.options) && scene.options.length < 2) {
        this.addError(`${path}.options`, 'Quiz must have at least 2 options', 'invalid_value');
      }
    }
  }

  /**
   * Validate scene navigation
   */
  private validateNavigation(navigation: any, path: string): void {
    if (navigation.next && typeof navigation.next !== 'string') {
      this.addError(`${path}.next`, 'Navigation next must be a string (scene ID or "end")', 'invalid_type');
    }
  }

  /**
   * Helper to validate required fields
   */
  private validateRequiredField(
    obj: any, 
    field: string, 
    expectedType: string, 
    parentPath: string = ''
  ): boolean {
    const path = parentPath ? `${parentPath}.${field}` : field;
    
    if (!(field in obj)) {
      this.addError(path, `Required field '${field}' is missing`, 'missing');
      return false;
    }

    const actualType = Array.isArray(obj[field]) ? 'array' : typeof obj[field];
    if (actualType !== expectedType) {
      this.addError(path, 
        `Field '${field}' must be of type ${expectedType}, got ${actualType}`, 
        'invalid_type'
      );
      return false;
    }

    return true;
  }

  /**
   * Type checking helpers
   */
  private isObject(value: unknown): value is object {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Error/warning management
   */
  private addError(path: string, message: string, type: ValidationError['type']): void {
    this.errors.push({ path, message, type });
  }

  private addWarning(path: string, message: string, type: ValidationWarning['type']): void {
    this.warnings.push({ path, message, type });
  }

  private getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

// Export singleton instance for easy use
export const devTeamValidator = new DevTeamContentValidator();