// DevTeam Content Validation (System Architect requirements)
// JSON Schema validation with <5s feedback requirement

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  performance: {
    contentSize: number; // KB
    estimatedLoadTime: number; // ms
    lighthouseImpact: number; // estimated score impact
  };
}

// Content size limits from System Architect analysis
const CONTENT_LIMITS = {
  DIALOGUE_SCENE_MAX: 50 * 1024, // 50KB
  QUIZ_SCENE_MAX: 30 * 1024,     // 30KB
  ASSESSMENT_SCENE_MAX: 75 * 1024, // 75KB
  TOTAL_JSON_MAX: 500 * 1024,    // 500KB total
};

// Performance budgets from System Architect
const PERFORMANCE_BUDGETS = {
  MAX_LOADING_TIME: 2000,        // 2 seconds
  MIN_LIGHTHOUSE_SCORE: 95,      // 95+ score required
  VALIDATION_TIMEOUT: 5000,      // 5 seconds max validation
};

export const validateDevTeamContent = async (content: any): Promise<ValidationResult> => {
  const startTime = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Basic structure validation
    if (!content.submission_metadata) {
      errors.push("Missing required field: submission_metadata");
    }

    if (!content.game_content) {
      errors.push("Missing required field: game_content");
    }

    if (!content.game_content?.scenes || !Array.isArray(content.game_content.scenes)) {
      errors.push("Missing or invalid scenes array");
    }

    // Content size validation
    const contentString = JSON.stringify(content);
    const contentSize = new Blob([contentString]).size;

    if (contentSize > CONTENT_LIMITS.TOTAL_JSON_MAX) {
      errors.push(`Content size ${Math.round(contentSize / 1024)}KB exceeds limit ${CONTENT_LIMITS.TOTAL_JSON_MAX / 1024}KB`);
    }

    // Scene-specific validation
    if (content.game_content?.scenes) {
      for (const scene of content.game_content.scenes) {
        const sceneString = JSON.stringify(scene);
        const sceneSize = new Blob([sceneString]).size;

        switch (scene.scene_type) {
          case 'DialogueScene':
            if (sceneSize > CONTENT_LIMITS.DIALOGUE_SCENE_MAX) {
              errors.push(`DialogueScene ${scene.scene_id} size ${Math.round(sceneSize / 1024)}KB exceeds limit ${CONTENT_LIMITS.DIALOGUE_SCENE_MAX / 1024}KB`);
            }
            validateDialogueScene(scene, errors, warnings);
            break;

          case 'QuizScene':
            if (sceneSize > CONTENT_LIMITS.QUIZ_SCENE_MAX) {
              errors.push(`QuizScene ${scene.scene_id} size ${Math.round(sceneSize / 1024)}KB exceeds limit ${CONTENT_LIMITS.QUIZ_SCENE_MAX / 1024}KB`);
            }
            validateQuizScene(scene, errors, warnings);
            break;

          default:
            warnings.push(`Unknown scene type: ${scene.scene_type}`);
        }
      }
    }

    // Performance impact estimation
    const estimatedLoadTime = Math.max(500, contentSize * 0.002); // Rough estimation
    const lighthouseImpact = contentSize > CONTENT_LIMITS.TOTAL_JSON_MAX * 0.8 ? -5 : 0;

    // Validation timeout check (System Architect requirement)
    const validationTime = Date.now() - startTime;
    if (validationTime > PERFORMANCE_BUDGETS.VALIDATION_TIMEOUT) {
      warnings.push(`Validation took ${validationTime}ms, exceeds ${PERFORMANCE_BUDGETS.VALIDATION_TIMEOUT}ms target`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      performance: {
        contentSize: Math.round(contentSize / 1024), // KB
        estimatedLoadTime: Math.round(estimatedLoadTime),
        lighthouseImpact
      }
    };

  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      performance: {
        contentSize: 0,
        estimatedLoadTime: 0,
        lighthouseImpact: -10
      }
    };
  }
};

const validateDialogueScene = (scene: any, errors: string[], warnings: string[]) => {
  if (!scene.scene_id) {
    errors.push(`DialogueScene missing scene_id`);
  }

  if (!scene.characters || !Array.isArray(scene.characters)) {
    errors.push(`DialogueScene ${scene.scene_id} missing characters array`);
  }

  if (!scene.dialogue_turns || !Array.isArray(scene.dialogue_turns)) {
    errors.push(`DialogueScene ${scene.scene_id} missing dialogue_turns array`);
  }

  // Validate dialogue turns
  if (scene.dialogue_turns) {
    scene.dialogue_turns.forEach((turn: any, index: number) => {
      if (!turn.speaker || !turn.character_id || !turn.text) {
        errors.push(`DialogueScene ${scene.scene_id} turn ${index} missing required fields`);
      }

      if (turn.text && turn.text.length > 500) {
        warnings.push(`DialogueScene ${scene.scene_id} turn ${index} text is very long (${turn.text.length} chars)`);
      }
    });
  }

  // Anna Svensson 7-minute optimization check
  if (scene.scene_duration && scene.scene_duration > 420) {
    warnings.push(`DialogueScene ${scene.scene_id} duration ${scene.scene_duration}s exceeds Anna Svensson 7-minute target`);
  }
};

const validateQuizScene = (scene: any, errors: string[], warnings: string[]) => {
  if (!scene.scene_id) {
    errors.push(`QuizScene missing scene_id`);
  }

  if (!scene.questions || !Array.isArray(scene.questions)) {
    errors.push(`QuizScene ${scene.scene_id} missing questions array`);
  }

  // Validate questions
  if (scene.questions) {
    scene.questions.forEach((question: any, index: number) => {
      if (!question.question_id || !question.question_type || !question.question_text) {
        errors.push(`QuizScene ${scene.scene_id} question ${index} missing required fields`);
      }

      if (!['multiple_choice', 'true_false', 'multiple_select'].includes(question.question_type)) {
        errors.push(`QuizScene ${scene.scene_id} question ${index} invalid question_type: ${question.question_type}`);
      }

      if (!question.options || !Array.isArray(question.options)) {
        errors.push(`QuizScene ${scene.scene_id} question ${index} missing options array`);
      }

      // Validate options
      if (question.options) {
        const correctOptions = question.options.filter((opt: any) => opt.is_correct);
        
        if (correctOptions.length === 0) {
          errors.push(`QuizScene ${scene.scene_id} question ${index} has no correct options`);
        }

        if (question.question_type === 'true_false' && question.options.length !== 2) {
          errors.push(`QuizScene ${scene.scene_id} question ${index} true_false must have exactly 2 options`);
        }

        question.options.forEach((option: any, optIndex: number) => {
          if (!option.option_id || !option.text || typeof option.is_correct !== 'boolean') {
            errors.push(`QuizScene ${scene.scene_id} question ${index} option ${optIndex} missing required fields`);
          }
        });
      }
    });
  }

  // Quiz length validation for Anna Svensson persona
  if (scene.questions && scene.questions.length > 10) {
    warnings.push(`QuizScene ${scene.scene_id} has ${scene.questions.length} questions, may be too long for Anna Svensson 7-minute sessions`);
  }
};

export const validateMunicipalBranding = (branding: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!branding) {
    return {
      isValid: true,
      errors: [],
      warnings: ['No municipal branding provided - using default styling'],
      performance: { contentSize: 0, estimatedLoadTime: 0, lighthouseImpact: 0 }
    };
  }

  if (!branding.municipality) {
    errors.push("Municipal branding missing municipality name");
  }

  if (!branding.primaryColor) {
    warnings.push("Municipal branding missing primaryColor - using default");
  } else {
    // Basic color validation
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(branding.primaryColor)) {
      errors.push(`Invalid primaryColor format: ${branding.primaryColor}. Use hex format (#RRGGBB)`);
    }
  }

  if (branding.logoUrl) {
    // Basic URL validation
    try {
      new URL(branding.logoUrl);
    } catch {
      errors.push(`Invalid logoUrl: ${branding.logoUrl}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    performance: {
      contentSize: 1, // Minimal branding impact
      estimatedLoadTime: branding.logoUrl ? 100 : 0, // Logo loading time
      lighthouseImpact: 0
    }
  };
};

// Validate complete game manifest (for DevTeam API integration)
export const validateGameManifest = (manifest: any): ValidationResult => {
  const startTime = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Required top-level fields
    if (!manifest.gameId) {
      errors.push("Missing required field: gameId");
    }

    if (!manifest.metadata) {
      errors.push("Missing required field: metadata");
    } else {
      // Validate metadata
      const requiredMeta = ['title', 'description', 'duration', 'targetAudience', 'language'];
      requiredMeta.forEach(field => {
        if (!manifest.metadata[field]) {
          errors.push(`Missing required metadata field: ${field}`);
        }
      });
    }

    if (!manifest.scenes || !Array.isArray(manifest.scenes)) {
      errors.push("Missing or invalid scenes array");
    } else {
      // Validate each scene
      manifest.scenes.forEach((scene: any, index: number) => {
        if (!scene.id) {
          errors.push(`Scene ${index} missing id`);
        }
        if (!scene.type) {
          errors.push(`Scene ${index} missing type`);
        }
        
        // Scene-specific validation
        const sceneString = JSON.stringify(scene);
        const sceneSize = new Blob([sceneString]).size;
        
        if (scene.type === 'dialogue' && sceneSize > CONTENT_LIMITS.DIALOGUE_SCENE_MAX) {
          errors.push(`Dialogue scene ${scene.id} exceeds size limit`);
        }
        if (scene.type === 'quiz' && sceneSize > CONTENT_LIMITS.QUIZ_SCENE_MAX) {
          errors.push(`Quiz scene ${scene.id} exceeds size limit`);
        }
      });
    }

    // Total size check
    const manifestString = JSON.stringify(manifest);
    const manifestSize = new Blob([manifestString]).size;
    
    if (manifestSize > CONTENT_LIMITS.TOTAL_JSON_MAX) {
      errors.push(`Total manifest size ${Math.round(manifestSize / 1024)}KB exceeds ${CONTENT_LIMITS.TOTAL_JSON_MAX / 1024}KB limit`);
    }

    // Performance estimation
    const estimatedLoadTime = Math.max(500, manifestSize * 0.002);
    const lighthouseImpact = manifestSize > CONTENT_LIMITS.TOTAL_JSON_MAX * 0.8 ? -5 : 0;

    // Ensure <5s validation
    const validationTime = Date.now() - startTime;
    if (validationTime > PERFORMANCE_BUDGETS.VALIDATION_TIMEOUT) {
      warnings.push(`Validation took ${validationTime}ms, exceeds target`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      performance: {
        contentSize: Math.round(manifestSize / 1024),
        estimatedLoadTime: Math.round(estimatedLoadTime),
        lighthouseImpact
      }
    };

  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      performance: {
        contentSize: 0,
        estimatedLoadTime: 0,
        lighthouseImpact: -10
      }
    };
  }
};

export { CONTENT_LIMITS, PERFORMANCE_BUDGETS };

export default {
  validateDevTeamContent,
  validateMunicipalBranding,
  validateGameManifest,
  CONTENT_LIMITS,
  PERFORMANCE_BUDGETS
};