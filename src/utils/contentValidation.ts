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

// Performance budgets from System Architect

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

    if (contentSize > CONTENT_LIMITS.TOTAL_JSON_MAX) {
      errors.push(`Content size ${Math.round(contentSize / 1024)}KB exceeds limit ${CONTENT_LIMITS.TOTAL_JSON_MAX / 1024}KB`);
    }

    // Scene-specific validation
    if (content.game_content?.scenes) {
      for (const scene of content.game_content.scenes) {

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

    // Validation timeout check (System Architect requirement)
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
      manifest.scenes.forEach((scene: Record<string, unknown>, index: number) => {
        if (!scene.id) {
          errors.push(`Scene ${index} missing id`);
        }
        if (!scene.type) {
          errors.push(`Scene ${index} missing type`);
        }
        
        // Scene-specific validation
        
        if (scene.type === 'dialogue' && sceneSize > CONTENT_LIMITS.DIALOGUE_SCENE_MAX) {
          errors.push(`Dialogue scene ${scene.id} exceeds size limit`);
        }
        if (scene.type === 'quiz' && sceneSize > CONTENT_LIMITS.QUIZ_SCENE_MAX) {
          errors.push(`Quiz scene ${scene.id} exceeds size limit`);
        }
      });
    }

    // Total size check
    
    if (manifestSize > CONTENT_LIMITS.TOTAL_JSON_MAX) {
      errors.push(`Total manifest size ${Math.round(manifestSize / 1024)}KB exceeds ${CONTENT_LIMITS.TOTAL_JSON_MAX / 1024}KB limit`);
    }

    // Performance estimation

    // Ensure <5s validation
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