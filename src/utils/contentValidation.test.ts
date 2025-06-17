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
    const validDevTeamContent = {
      submission_metadata: {
        content_id: 'test-content-001',
        submission_timestamp: '2025-01-17T12:00:00Z',
        content_version: '1.0.0',
        target_persona: 'anna_svensson',
        cultural_context: 'swedish_municipal'
      },
      game_content: {
        game_manifest: {
          game_id: 'gdpr-training-001',
          title: 'GDPR Training för Stockholm Kommun',
          description: 'Interactive privacy training for municipal employees'
        },
        scenes: [
          {
            scene_id: 'dialogue-001',
            scene_type: 'DialogueScene',
            title: 'Privacy Introduction',
            description: 'Learn privacy basics',
            characters: [
              {
                character_id: 'anna',
                name: 'Anna Svensson',
                role: 'Data Protection Officer',
                avatar_description: 'Professional Swedish municipal worker'
              }
            ],
            dialogue_turns: [
              {
                speaker: 'Anna Svensson',
                character_id: 'anna',
                text: 'Welcome to privacy training.',
                emotion: 'neutral',
                timing: 0
              }
            ],
            learning_objectives: ['Understand privacy basics'],
            scene_duration: 300
          },
          {
            scene_id: 'quiz-001',
            scene_type: 'QuizScene',
            title: 'Privacy Quiz',
            description: 'Test your knowledge',
            questions: [
              {
                question_id: 'q1',
                question_type: 'multiple_choice',
                question_text: 'What is GDPR?',
                options: [
                  {
                    option_id: 'opt1',
                    text: 'General Data Protection Regulation',
                    is_correct: true
                  },
                  {
                    option_id: 'opt2',
                    text: 'General Document Protection Rules',
                    is_correct: false
                  }
                ],
                explanation: 'GDPR stands for General Data Protection Regulation.',
                learning_objective: 'Know GDPR definition',
                points: 10
              }
            ],
            passing_score: 70,
            scene_duration: 180,
            feedback_immediate: true
          }
        ]
      }
    };

    describe('Basic Structure Validation', () => {
      it('validates correct DevTeam content structure', async () => {
        const result = await validateDevTeamContent(validDevTeamContent);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.performance.contentSize).toBeGreaterThan(0);
        expect(result.performance.estimatedLoadTime).toBeGreaterThan(0);
      });

      it('fails validation when submission_metadata is missing', async () => {
        const invalidContent = {
          ...validDevTeamContent,
          submission_metadata: undefined
        };

        const result = await validateDevTeamContent(invalidContent);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Missing required field: submission_metadata');
      });

      it('fails validation when game_content is missing', async () => {
        const invalidContent = {
          ...validDevTeamContent,
          game_content: undefined
        };

        const result = await validateDevTeamContent(invalidContent);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Missing required field: game_content');
      });

      it('fails validation when scenes array is missing', async () => {
        const invalidContent = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: undefined
          }
        };

        const result = await validateDevTeamContent(invalidContent);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Missing or invalid scenes array');
      });

      it('fails validation when scenes is not an array', async () => {
        const invalidContent = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: 'not-an-array'
          }
        };

        const result = await validateDevTeamContent(invalidContent);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Missing or invalid scenes array');
      });
    });

    describe('Content Size Validation', () => {
      it('validates content within size limits', async () => {
        const result = await validateDevTeamContent(validDevTeamContent);

        expect(result.performance.contentSize).toBeLessThan(CONTENT_LIMITS.TOTAL_JSON_MAX / 1024);
        expect(result.isValid).toBe(true);
      });

      it('fails validation when total content exceeds limit', async () => {
        // Create oversized content
        const largeContent = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: Array(1000).fill(validDevTeamContent.game_content.scenes[0]).map((scene, index) => ({
              ...scene,
              scene_id: `scene-${index}`,
              title: `Scene ${index}`.repeat(1000), // Make it large
              description: 'Very long description '.repeat(1000)
            }))
          }
        };

        const result = await validateDevTeamContent(largeContent);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('exceeds limit'))).toBe(true);
      });

      it('validates DialogueScene size limits', async () => {
        const contentWithLargeDialogue = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: [
              {
                ...validDevTeamContent.game_content.scenes[0],
                dialogue_turns: Array(1000).fill({
                  speaker: 'Anna Svensson',
                  character_id: 'anna',
                  text: 'Very long dialogue text that exceeds reasonable limits for Anna Svensson 7-minute sessions '.repeat(100),
                  emotion: 'neutral',
                  timing: 0
                })
              }
            ]
          }
        };

        const result = await validateDevTeamContent(contentWithLargeDialogue);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('DialogueScene') && error.includes('exceeds limit'))).toBe(true);
      });

      it('validates QuizScene size limits', async () => {
        const contentWithLargeQuiz = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: [
              {
                scene_id: 'quiz-large',
                scene_type: 'QuizScene',
                title: 'Large Quiz',
                description: 'Quiz with many questions',
                questions: Array(200).fill({
                  question_id: 'q1',
                  question_type: 'multiple_choice',
                  question_text: 'Very long question text that exceeds reasonable limits '.repeat(50),
                  options: Array(10).fill({
                    option_id: 'opt1',
                    text: 'Very long option text '.repeat(20),
                    is_correct: true
                  }),
                  explanation: 'Very long explanation '.repeat(100),
                  learning_objective: 'Learn something',
                  points: 10
                }),
                passing_score: 70,
                scene_duration: 180,
                feedback_immediate: true
              }
            ]
          }
        };

        const result = await validateDevTeamContent(contentWithLargeQuiz);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('QuizScene') && error.includes('exceeds limit'))).toBe(true);
      });
    });

    describe('DialogueScene Validation', () => {
      it('validates DialogueScene required fields', async () => {
        const contentWithInvalidDialogue = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: [
              {
                scene_type: 'DialogueScene',
                // Missing scene_id, characters, dialogue_turns
                title: 'Invalid Dialogue'
              }
            ]
          }
        };

        const result = await validateDevTeamContent(contentWithInvalidDialogue);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('missing scene_id'))).toBe(true);
        expect(result.errors.some(error => error.includes('missing characters array'))).toBe(true);
        expect(result.errors.some(error => error.includes('missing dialogue_turns array'))).toBe(true);
      });

      it('validates dialogue turn required fields', async () => {
        const contentWithInvalidTurns = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: [
              {
                ...validDevTeamContent.game_content.scenes[0],
                dialogue_turns: [
                  {
                    // Missing speaker, character_id, text
                    emotion: 'neutral',
                    timing: 0
                  }
                ]
              }
            ]
          }
        };

        const result = await validateDevTeamContent(contentWithInvalidTurns);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('missing required fields'))).toBe(true);
      });

      it('warns about very long dialogue text', async () => {
        const contentWithLongText = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: [
              {
                ...validDevTeamContent.game_content.scenes[0],
                dialogue_turns: [
                  {
                    speaker: 'Anna Svensson',
                    character_id: 'anna',
                    text: 'Very long dialogue text that exceeds 500 characters '.repeat(20),
                    emotion: 'neutral',
                    timing: 0
                  }
                ]
              }
            ]
          }
        };

        const result = await validateDevTeamContent(contentWithLongText);

        expect(result.warnings.some(warning => warning.includes('text is very long'))).toBe(true);
      });

      it('warns about scenes exceeding Anna Svensson 7-minute limit', async () => {
        const contentWithLongScene = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: [
              {
                ...validDevTeamContent.game_content.scenes[0],
                scene_duration: 500 // Exceeds 420 seconds (7 minutes)
              }
            ]
          }
        };

        const result = await validateDevTeamContent(contentWithLongScene);

        expect(result.warnings.some(warning => warning.includes('exceeds Anna Svensson 7-minute target'))).toBe(true);
      });
    });

    describe('QuizScene Validation', () => {
      it('validates QuizScene required fields', async () => {
        const contentWithInvalidQuiz = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: [
              {
                scene_type: 'QuizScene',
                // Missing scene_id, questions
                title: 'Invalid Quiz'
              }
            ]
          }
        };

        const result = await validateDevTeamContent(contentWithInvalidQuiz);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('QuizScene missing scene_id'))).toBe(true);
        expect(result.errors.some(error => error.includes('missing questions array'))).toBe(true);
      });

      it('validates question required fields', async () => {
        const contentWithInvalidQuestions = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: [
              {
                ...validDevTeamContent.game_content.scenes[1],
                questions: [
                  {
                    // Missing required fields
                    question_text: 'What is GDPR?'
                  }
                ]
              }
            ]
          }
        };

        const result = await validateDevTeamContent(contentWithInvalidQuestions);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('missing required fields'))).toBe(true);
      });

      it('validates question types', async () => {
        const contentWithInvalidQuestionType = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: [
              {
                ...validDevTeamContent.game_content.scenes[1],
                questions: [
                  {
                    question_id: 'q1',
                    question_type: 'invalid_type',
                    question_text: 'What is GDPR?',
                    options: [],
                    explanation: 'Test',
                    learning_objective: 'Test',
                    points: 10
                  }
                ]
              }
            ]
          }
        };

        const result = await validateDevTeamContent(contentWithInvalidQuestionType);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('invalid question_type'))).toBe(true);
      });

      it('validates questions have correct answers', async () => {
        const contentWithNoCorrectAnswers = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: [
              {
                ...validDevTeamContent.game_content.scenes[1],
                questions: [
                  {
                    question_id: 'q1',
                    question_type: 'multiple_choice',
                    question_text: 'What is GDPR?',
                    options: [
                      {
                        option_id: 'opt1',
                        text: 'Option 1',
                        is_correct: false
                      },
                      {
                        option_id: 'opt2',
                        text: 'Option 2',
                        is_correct: false
                      }
                    ],
                    explanation: 'Test',
                    learning_objective: 'Test',
                    points: 10
                  }
                ]
              }
            ]
          }
        };

        const result = await validateDevTeamContent(contentWithNoCorrectAnswers);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('has no correct options'))).toBe(true);
      });

      it('validates true/false questions have exactly 2 options', async () => {
        const contentWithInvalidTrueFalse = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: [
              {
                ...validDevTeamContent.game_content.scenes[1],
                questions: [
                  {
                    question_id: 'q1',
                    question_type: 'true_false',
                    question_text: 'Is this true?',
                    options: [
                      {
                        option_id: 'opt1',
                        text: 'True',
                        is_correct: true
                      }
                      // Missing second option
                    ],
                    explanation: 'Test',
                    learning_objective: 'Test',
                    points: 10
                  }
                ]
              }
            ]
          }
        };

        const result = await validateDevTeamContent(contentWithInvalidTrueFalse);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('true_false must have exactly 2 options'))).toBe(true);
      });

      it('warns about quizzes that may be too long for Anna Svensson', async () => {
        const contentWithLongQuiz = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: [
              {
                ...validDevTeamContent.game_content.scenes[1],
                questions: Array(15).fill({
                  question_id: 'q1',
                  question_type: 'multiple_choice',
                  question_text: 'What is GDPR?',
                  options: [
                    {
                      option_id: 'opt1',
                      text: 'Correct answer',
                      is_correct: true
                    }
                  ],
                  explanation: 'Test',
                  learning_objective: 'Test',
                  points: 10
                }).map((q, index) => ({ ...q, question_id: `q${index + 1}` }))
              }
            ]
          }
        };

        const result = await validateDevTeamContent(contentWithLongQuiz);

        expect(result.warnings.some(warning => warning.includes('may be too long for Anna Svensson'))).toBe(true);
      });
    });

    describe('Performance Requirements', () => {
      it('estimates load time within performance budget', async () => {
        const result = await validateDevTeamContent(validDevTeamContent);

        expect(result.performance.estimatedLoadTime).toBeLessThan(PERFORMANCE_BUDGETS.MAX_LOADING_TIME);
      });

      it('validates within System Architect validation timeout', async () => {
        const startTime = Date.now();
        const result = await validateDevTeamContent(validDevTeamContent);
        const validationTime = Date.now() - startTime;

        expect(validationTime).toBeLessThan(PERFORMANCE_BUDGETS.VALIDATION_TIMEOUT);
        expect(result.isValid).toBe(true);
      });

      it('warns about slow validation', async () => {
        // Mock slow validation by using large content
        const largeContent = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: Array(100).fill(validDevTeamContent.game_content.scenes[0]).map((scene, index) => ({
              ...scene,
              scene_id: `scene-${index}`
            }))
          }
        };

        const result = await validateDevTeamContent(largeContent);

        // Validation should still work but may include warnings about performance
        expect(result.isValid).toBe(true);
      });
    });

    describe('Unknown Scene Types', () => {
      it('warns about unknown scene types', async () => {
        const contentWithUnknownScene = {
          ...validDevTeamContent,
          game_content: {
            ...validDevTeamContent.game_content,
            scenes: [
              {
                scene_id: 'unknown-001',
                scene_type: 'UnknownScene',
                title: 'Unknown Scene'
              }
            ]
          }
        };

        const result = await validateDevTeamContent(contentWithUnknownScene);

        expect(result.warnings.some(warning => warning.includes('Unknown scene type'))).toBe(true);
      });
    });

    describe('Error Handling', () => {
      it('handles validation errors gracefully', async () => {
        const result = await validateDevTeamContent(null);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.performance.lighthouseImpact).toBe(-10);
      });

      it('handles malformed JSON gracefully', async () => {
        const circularRef: any = { name: 'test' };
        circularRef.self = circularRef;

        const result = await validateDevTeamContent(circularRef);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('Validation error'))).toBe(true);
      });
    });
  });

  describe('validateMunicipalBranding', () => {
    const validMunicipalBranding = {
      municipality: 'Stockholm Kommun',
      primaryColor: '#1e40af',
      logoUrl: 'https://stockholm.se/logo.svg'
    };

    it('validates correct municipal branding', () => {
      const result = validateMunicipalBranding(validMunicipalBranding);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.performance.contentSize).toBe(1);
    });

    it('handles missing branding gracefully', () => {
      const result = validateMunicipalBranding(null);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('No municipal branding provided - using default styling');
      expect(result.performance.contentSize).toBe(0);
    });

    it('requires municipality name', () => {
      const invalidBranding = {
        ...validMunicipalBranding,
        municipality: undefined
      };

      const result = validateMunicipalBranding(invalidBranding);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Municipal branding missing municipality name');
    });

    it('validates color format', () => {
      const invalidBranding = {
        ...validMunicipalBranding,
        primaryColor: 'invalid-color'
      };

      const result = validateMunicipalBranding(invalidBranding);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Invalid primaryColor format'))).toBe(true);
    });

    it('accepts 3-digit hex colors', () => {
      const validBranding = {
        ...validMunicipalBranding,
        primaryColor: '#f0a'
      };

      const result = validateMunicipalBranding(validBranding);

      expect(result.isValid).toBe(true);
    });

    it('accepts 6-digit hex colors', () => {
      const validBranding = {
        ...validMunicipalBranding,
        primaryColor: '#ff00aa'
      };

      const result = validateMunicipalBranding(validBranding);

      expect(result.isValid).toBe(true);
    });

    it('validates logo URL format', () => {
      const invalidBranding = {
        ...validMunicipalBranding,
        logoUrl: 'invalid-url'
      };

      const result = validateMunicipalBranding(invalidBranding);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Invalid logoUrl'))).toBe(true);
    });

    it('warns about missing primary color', () => {
      const brandingWithoutColor = {
        ...validMunicipalBranding,
        primaryColor: undefined
      };

      const result = validateMunicipalBranding(brandingWithoutColor);

      expect(result.warnings).toContain('Municipal branding missing primaryColor - using default');
    });

    it('calculates performance impact with logo', () => {
      const result = validateMunicipalBranding(validMunicipalBranding);

      expect(result.performance.estimatedLoadTime).toBe(100); // Logo loading time
    });

    it('calculates performance impact without logo', () => {
      const brandingWithoutLogo = {
        municipality: 'Stockholm Kommun',
        primaryColor: '#1e40af'
      };

      const result = validateMunicipalBranding(brandingWithoutLogo);

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