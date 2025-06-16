# Technical Specification - DigiNativa Runtime Engine ⚙️

**Complete Architecture and Implementation Guide for Developers**

This document provides comprehensive technical specifications for building the DigiNativa Runtime Engine - a React-based system that transforms JSON game manifests into engaging, accessible educational experiences.

---

## 🏗️ System Architecture Overview

### **High-Level Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                 DigiNativa Runtime Engine                   │
├─────────────────────────────────────────────────────────────┤
│  React Application Layer                                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │ StrategyPlayHost│ │   Scene Router  │ │Analytics Engine │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Component Library (Scene Renderers)                        │
│  ┌─────────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────┐ │
│  │DialogueScene│ │QuizScene │ │AssessmentScene│ │ResourceScene│ │
│  └─────────────┘ └──────────┘ └──────────────┘ └──────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Core Services                                               │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│  │Schema       │ │Accessibility │ │Performance Monitor    │ │
│  │Validator    │ │Engine        │ │                       │ │
│  └─────────────┘ └──────────────┘ └────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │JSON Game Manifest│ │User Progress   │ │Analytics Events │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **Technology Stack**
- **Frontend**: React 18+ with TypeScript 5+
- **Build Tool**: Vite 5+ for optimal performance
- **Testing**: Vitest + React Testing Library + Playwright
- **Documentation**: Storybook 8+ with accessibility addon
- **Validation**: Zod for runtime schema validation
- **Accessibility**: React Aria + custom WCAG 2.1 AA implementation
- **Analytics**: Custom event system with pluggable providers
- **Styling**: CSS Modules + CSS Custom Properties for theming

---

## 🧭 Core Component Architecture

### **StrategyPlayHost - Engine Orchestrator**

The central component that manages game state, scene transitions, and system services.

```typescript
interface StrategyPlayHostProps {
  gameManifest: GameManifest;
  analytics?: AnalyticsProvider;
  theme?: ThemeConfig;
  accessibility?: AccessibilityConfig;
  onGameComplete: (results: GameResults) => void;
  onError: (error: GameError) => void;
}

interface StrategyPlayHostState {
  currentSceneIndex: number;
  sceneHistory: string[];
  userProgress: UserProgress;
  gameState: GameState;
  errors: GameError[];
  performance: PerformanceMetrics;
}

// Implementation Pattern
export const StrategyPlayHost: React.FC<StrategyPlayHostProps> = ({
  gameManifest,
  analytics,
  theme,
  accessibility,
  onGameComplete,
  onError
}) => {
  // 1. Validate game manifest on mount
  const validatedManifest = useMemo(() => 
    validateGameManifest(gameManifest), [gameManifest]);
  
  // 2. Initialize game state
  const [gameState, dispatch] = useReducer(gameStateReducer, {
    currentSceneIndex: 0,
    sceneHistory: [],
    userProgress: initializeProgress(validatedManifest),
    gameState: 'initializing',
    errors: [],
    performance: initializePerformanceTracking()
  });
  
  // 3. Provide contexts to child components
  return (
    <AnalyticsProvider value={analytics}>
      <AccessibilityProvider value={accessibility}>
        <ThemeProvider value={theme}>
          <GameStateProvider value={gameState}>
            <SceneRenderer 
              scene={validatedManifest.scenes[gameState.currentSceneIndex]}
              onSceneComplete={handleSceneComplete}
            />
          </GameStateProvider>
        </ThemeProvider>
      </AccessibilityProvider>
    </AnalyticsProvider>
  );
};
```

### **Scene Router - Dynamic Component Selection**

Selects and renders the appropriate scene component based on manifest data.

```typescript
interface SceneRendererProps {
  scene: Scene;
  onSceneComplete: (results: SceneResults) => void;
}

const SceneRenderer: React.FC<SceneRendererProps> = ({ scene, onSceneComplete }) => {
  // Dynamic component selection based on scene type
  const SceneComponent = useMemo(() => {
    switch (scene.type) {
      case 'dialogue': return DialogueScene;
      case 'quiz': return QuizScene;
      case 'assessment': return AssessmentScene;
      case 'resource': return ResourceScene;
      case 'introduction': return IntroductionScene;
      case 'summary': return SummaryScene;
      default: throw new Error(`Unknown scene type: ${scene.type}`);
    }
  }, [scene.type]);
  
  // Performance monitoring
  const performanceRef = usePerformanceMonitor(scene.sceneId);
  
  // Error boundary for individual scenes
  return (
    <SceneErrorBoundary sceneId={scene.sceneId} onError={handleSceneError}>
      <SceneComponent
        ref={performanceRef}
        sceneData={scene.data}
        onSceneComplete={onSceneComplete}
      />
    </SceneErrorBoundary>
  );
};
```

---

## 🎭 Scene Component Implementations

### **DialogueScene - Narrative Interactions**

Renders character-based conversations with decision points.

```typescript
interface DialogueSceneProps {
  sceneData: DialogueSceneData;
  onSceneComplete: (results: SceneResults) => void;
}

export const DialogueScene: React.FC<DialogueSceneProps> = ({
  sceneData,
  onSceneComplete
}) => {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();
  const { announceToScreenReader } = useAccessibility();
  
  const currentDialogue = sceneData.dialogue[currentDialogueIndex];
  const currentCharacter = sceneData.characters.find(
    c => c.id === currentDialogue.speaker
  );
  
  // Auto-progress dialogue if configured
  useEffect(() => {
    if (sceneData.autoProgress && currentDialogue) {
      const delay = sceneData.progressDelay || currentDialogue.delay || 3000;
      const timer = setTimeout(() => {
        if (currentDialogueIndex < sceneData.dialogue.length - 1) {
          setCurrentDialogueIndex(prev => prev + 1);
          announceToScreenReader(sceneData.dialogue[currentDialogueIndex + 1].text);
        }
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [currentDialogueIndex, sceneData.autoProgress]);
  
  const handleChoiceSelection = useCallback((choiceId: string) => {
    setSelectedChoice(choiceId);
    trackEvent('dialogue_choice_made', {
      sceneId: sceneData.sceneId,
      choiceId,
      dialogueIndex: currentDialogueIndex
    });
    
    const choice = sceneData.choices?.find(c => c.id === choiceId);
    if (choice?.consequence) {
      announceToScreenReader(choice.consequence);
    }
    
    // Complete scene after choice or continue dialogue
    setTimeout(() => {
      onSceneComplete({
        sceneId: sceneData.sceneId,
        completed: true,
        choices: [choiceId],
        timeSpent: Date.now() - sceneStartTime
      });
    }, 2000);
  }, [sceneData, currentDialogueIndex, trackEvent, announceToScreenReader]);
  
  return (
    <section 
      className="dialogue-scene"
      role="main"
      aria-labelledby="dialogue-title"
    >
      <h2 id="dialogue-title" className="scene-title">
        {sceneData.title}
      </h2>
      
      <div className="dialogue-container">
        <div className="character-display">
          <img 
            src={`/avatars/${currentCharacter?.avatar}.svg`}
            alt={`${currentCharacter?.name}, ${currentCharacter?.role}`}
            className={`character-avatar emotion-${currentDialogue.emotion || 'neutral'}`}
          />
          <div className="character-info">
            <h3 className="character-name">{currentCharacter?.name}</h3>
            <p className="character-role">{currentCharacter?.role}</p>
          </div>
        </div>
        
        <div 
          className="dialogue-text"
          role="dialog"
          aria-live="polite"
          aria-label={`${currentCharacter?.name} säger:`}
        >
          <p>{currentDialogue.text}</p>
        </div>
        
        {sceneData.choices && currentDialogueIndex === sceneData.dialogue.length - 1 && (
          <div className="dialogue-choices" role="group" aria-labelledby="choices-title">
            <h4 id="choices-title">Välj ditt svar:</h4>
            {sceneData.choices.map((choice, index) => (
              <button
                key={choice.id}
                className="dialogue-choice-button"
                onClick={() => handleChoiceSelection(choice.id)}
                disabled={selectedChoice !== null}
                aria-describedby={`choice-${choice.id}-description`}
              >
                <span className="choice-text">{choice.text}</span>
                {selectedChoice === choice.id && choice.consequence && (
                  <div 
                    id={`choice-${choice.id}-description`}
                    className="choice-consequence"
                    aria-live="polite"
                  >
                    {choice.consequence}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        
        {!sceneData.autoProgress && !sceneData.choices && (
          <button 
            className="continue-button"
            onClick={() => {
              if (currentDialogueIndex < sceneData.dialogue.length - 1) {
                setCurrentDialogueIndex(prev => prev + 1);
              } else {
                onSceneComplete({
                  sceneId: sceneData.sceneId,
                  completed: true,
                  choices: [],
                  timeSpent: Date.now() - sceneStartTime
                });
              }
            }}
            aria-label={
              currentDialogueIndex < sceneData.dialogue.length - 1 
                ? "Fortsätt samtalet" 
                : "Avsluta scenen"
            }
          >
            {currentDialogueIndex < sceneData.dialogue.length - 1 ? "Fortsätt" : "Nästa"}
          </button>
        )}
      </div>
    </section>
  );
};
```

### **QuizScene - Interactive Assessments**

Handles multiple choice questions with immediate feedback.

```typescript
interface QuizSceneProps {
  sceneData: QuizSceneData;
  onSceneComplete: (results: SceneResults) => void;
}

export const QuizScene: React.FC<QuizSceneProps> = ({
  sceneData,
  onSceneComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const { trackEvent } = useAnalytics();
  const { announceToScreenReader } = useAccessibility();
  
  const currentQuestion = sceneData.questions[currentQuestionIndex];
  
  // Handle time limits
  useEffect(() => {
    if (currentQuestion.timeLimit) {
      setTimeRemaining(currentQuestion.timeLimit);
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            handleTimeUp();
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex]);
  
  const handleAnswerSelection = useCallback((questionId: string, optionId: string) => {
    const question = sceneData.questions.find(q => q.id === questionId);
    if (!question) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: question.type === 'multiple-select' 
        ? [...(prev[questionId] || []), optionId]
        : [optionId]
    }));
    
    trackEvent('quiz_answer_selected', {
      questionId,
      optionId,
      questionType: question.type,
      timeRemaining
    });
    
    if (sceneData.settings.immediateMode) {
      setShowFeedback(true);
      const selectedOption = question.options.find(opt => opt.id === optionId);
      if (selectedOption) {
        announceToScreenReader(selectedOption.feedback);
      }
    }
  }, [sceneData, timeRemaining, trackEvent, announceToScreenReader]);
  
  const calculateScore = useCallback(() => {
    let totalPoints = 0;
    let earnedPoints = 0;
    
    sceneData.questions.forEach(question => {
      const questionPoints = question.points || 1;
      totalPoints += questionPoints;
      
      const userAnswers = answers[question.id] || [];
      const correctOptions = question.options.filter(opt => opt.correct);
      
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        const isCorrect = userAnswers.length === 1 && 
          correctOptions.some(opt => opt.id === userAnswers[0]);
        if (isCorrect) earnedPoints += questionPoints;
      } else if (question.type === 'multiple-select') {
        const correctAnswers = correctOptions.map(opt => opt.id).sort();
        const userAnswersCorrect = userAnswers.sort();
        const isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswersCorrect);
        if (isCorrect) earnedPoints += questionPoints;
      }
    });
    
    return { earnedPoints, totalPoints, percentage: (earnedPoints / totalPoints) * 100 };
  }, [answers, sceneData.questions]);
  
  const handleQuizCompletion = useCallback(() => {
    const score = calculateScore();
    const passed = score.percentage >= (sceneData.scoring.passingScore || 80);
    
    trackEvent('quiz_completed', {
      sceneId: sceneData.sceneId,
      score: score.percentage,
      passed,
      timeSpent: Date.now() - sceneStartTime
    });
    
    onSceneComplete({
      sceneId: sceneData.sceneId,
      completed: true,
      score: score.percentage,
      passed,
      answers,
      timeSpent: Date.now() - sceneStartTime
    });
  }, [calculateScore, sceneData, answers, trackEvent]);
  
  return (
    <section 
      className="quiz-scene"
      role="main"
      aria-labelledby="quiz-title"
    >
      <header className="quiz-header">
        <h2 id="quiz-title" className="scene-title">{sceneData.title}</h2>
        <div className="quiz-progress" role="progressbar" 
             aria-valuenow={currentQuestionIndex + 1}
             aria-valuemin={1}
             aria-valuemax={sceneData.questions.length}
             aria-label="Quiz progress">
          <span className="progress-text">
            Fråga {currentQuestionIndex + 1} av {sceneData.questions.length}
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / sceneData.questions.length) * 100}%` }}
            />
          </div>
        </div>
        {timeRemaining && (
          <div className="time-remaining" aria-live="polite">
            <span>Tid kvar: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
          </div>
        )}
      </header>
      
      <div className="question-container">
        <h3 className="question-text">{currentQuestion.question}</h3>
        
        <div className="question-options" role="group" aria-labelledby="options-title">
          <h4 id="options-title" className="sr-only">Svarsalternativ</h4>
          {currentQuestion.options.map((option, index) => {
            const isSelected = answers[currentQuestion.id]?.includes(option.id);
            const showOptionFeedback = showFeedback && isSelected;
            
            return (
              <div key={option.id} className="option-container">
                <button
                  className={`option-button ${isSelected ? 'selected' : ''} ${showOptionFeedback ? (option.correct ? 'correct' : 'incorrect') : ''}`}
                  onClick={() => handleAnswerSelection(currentQuestion.id, option.id)}
                  disabled={showFeedback}
                  aria-describedby={showOptionFeedback ? `feedback-${option.id}` : undefined}
                >
                  <span className="option-marker">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option.text}</span>
                  {showOptionFeedback && (
                    <span className="option-status" aria-label={option.correct ? "Korrekt svar" : "Felaktigt svar"}>
                      {option.correct ? "✓" : "✗"}
                    </span>
                  )}
                </button>
                
                {showOptionFeedback && (
                  <div 
                    id={`feedback-${option.id}`}
                    className="option-feedback"
                    aria-live="polite"
                  >
                    {option.feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {currentQuestion.explanation && showFeedback && (
          <div className="question-explanation" aria-live="polite">
            <h5>Förklaring:</h5>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}
        
        <div className="question-navigation">
          {showFeedback ? (
            currentQuestionIndex < sceneData.questions.length - 1 ? (
              <button 
                className="next-question-button"
                onClick={() => {
                  setCurrentQuestionIndex(prev => prev + 1);
                  setShowFeedback(false);
                  setTimeRemaining(null);
                }}
              >
                Nästa fråga
              </button>
            ) : (
              <button 
                className="complete-quiz-button"
                onClick={handleQuizCompletion}
              >
                Avsluta quiz
              </button>
            )
          ) : (
            <button
              className="submit-answer-button"
              onClick={() => setShowFeedback(true)}
              disabled={!answers[currentQuestion.id]?.length}
            >
              Svara
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
```

---

## 🔧 Performance Optimization

### **Code Splitting Strategy**
```typescript
// Lazy load scene components to reduce initial bundle size
const DialogueScene = lazy(() => import('./scenes/DialogueScene'));
const QuizScene = lazy(() => import('./scenes/QuizScene'));
const AssessmentScene = lazy(() => import('./scenes/AssessmentScene'));
const ResourceScene = lazy(() => import('./scenes/ResourceScene'));

// Scene router with suspense
const SceneRenderer: React.FC<SceneRendererProps> = ({ scene, onSceneComplete }) => {
  return (
    <Suspense fallback={<SceneLoadingSpinner />}>
      <DynamicSceneComponent scene={scene} onSceneComplete={onSceneComplete} />
    </Suspense>
  );
};
```

### **Performance Budgets**
```typescript
// Enforced performance constraints
const PERFORMANCE_BUDGETS = {
  initialLoad: 2000,        // 2 seconds max initial load
  sceneTransition: 100,     // 100ms max scene transition
  interactionResponse: 50,  // 50ms max interaction response
  bundleSize: 512000,       // 512KB max bundle size (gzipped)
  memoryUsage: 50000000,    // 50MB max memory usage
} as const;

// Performance monitoring hook
const usePerformanceMonitor = (sceneId: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>();
  
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes(sceneId)) {
          setMetrics(prev => ({
            ...prev,
            [entry.name]: entry.duration
          }));
          
          // Alert if budget exceeded
          if (entry.duration > PERFORMANCE_BUDGETS.sceneTransition) {
            console.warn(`Performance budget exceeded for ${entry.name}: ${entry.duration}ms`);
          }
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    return () => observer.disconnect();
  }, [sceneId]);
  
  return metrics;
};
```

### **Memory Management**
```typescript
// Cleanup unused scenes and assets
const useSceneCleanup = () => {
  const [loadedScenes, setLoadedScenes] = useState<Set<string>>(new Set());
  
  const cleanupScene = useCallback((sceneId: string) => {
    // Remove scene from memory
    setLoadedScenes(prev => {
      const newSet = new Set(prev);
      newSet.delete(sceneId);
      return newSet;
    });
    
    // Cleanup audio/video resources
    const mediaElements = document.querySelectorAll(`[data-scene="${sceneId}"]`);
    mediaElements.forEach(element => {
      if (element instanceof HTMLMediaElement) {
        element.pause();
        element.src = '';
        element.load();
      }
    });
    
    // Force garbage collection (development only)
    if (process.env.NODE_ENV === 'development' && window.gc) {
      window.gc();
    }
  }, []);
  
  return { loadedScenes, cleanupScene };
};
```

---

## ♿ Accessibility Implementation

### **WCAG 2.1 AA Compliance**
```typescript
// Accessibility context provider
const AccessibilityProvider: React.FC<{
  children: React.ReactNode;
  config: AccessibilityConfig;
}> = ({ children, config }) => {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 16,
    screenReaderEnabled: false,
  });
  
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }, []);
  
  const updateFontSize = useCallback((newSize: number) => {
    const clampedSize = Math.max(14, Math.min(24, newSize));
    setPreferences(prev => ({ ...prev, fontSize: clampedSize }));
    document.documentElement.style.setProperty('--base-font-size', `${clampedSize}px`);
  }, []);
  
  // Detect system preferences
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    setPreferences(prev => ({
      ...prev,
      reducedMotion: motionQuery.matches,
      highContrast: contrastQuery.matches,
    }));
    
    const motionHandler = (e: MediaQueryListEvent) => 
      setPreferences(prev => ({ ...prev, reducedMotion: e.matches }));
    const contrastHandler = (e: MediaQueryListEvent) => 
      setPreferences(prev => ({ ...prev, highContrast: e.matches }));
    
    motionQuery.addEventListener('change', motionHandler);
    contrastQuery.addEventListener('change', contrastHandler);
    
    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      contrastQuery.removeEventListener('change', contrastHandler);
    };
  }, []);
  
  const contextValue = {
    preferences,
    announceToScreenReader,
    updateFontSize,
    toggleHighContrast: () => setPreferences(prev => ({ ...prev, highContrast: !prev.highContrast })),
    toggleReducedMotion: () => setPreferences(prev => ({ ...prev, reducedMotion: !prev.reducedMotion })),
  };
  
  return (
    <AccessibilityContext.Provider value={contextValue}>
      <div 
        className={`runtime-engine ${preferences.highContrast ? 'high-contrast' : ''} ${preferences.reducedMotion ? 'reduced-motion' : ''}`}
        style={{ fontSize: preferences.fontSize }}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};
```

### **Keyboard Navigation**
```typescript
// Universal keyboard navigation hook
const useKeyboardNavigation = (containerId: string) => {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    let currentIndex = 0;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          currentIndex = (currentIndex + 1) % focusableElements.length;
          (focusableElements[currentIndex] as HTMLElement).focus();
          break;
          
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          currentIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
          (focusableElements[currentIndex] as HTMLElement).focus();
          break;
          
        case 'Home':
          e.preventDefault();
          currentIndex = 0;
          (focusableElements[currentIndex] as HTMLElement).focus();
          break;
          
        case 'End':
          e.preventDefault();
          currentIndex = focusableElements.length - 1;
          (focusableElements[currentIndex] as HTMLElement).focus();
          break;
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerId]);
};
```

---

## 🧪 Testing Strategy

### **Unit Testing with Vitest**
```typescript
// Example component test
describe('DialogueScene', () => {
  const mockSceneData: DialogueSceneData = {
    sceneId: 'test-dialogue',
    title: 'Test Dialogue',
    characters: [
      { id: 'anna', name: 'Anna', role: 'Administrator', avatar: 'anna-avatar' }
    ],
    dialogue: [
      { speaker: 'anna', text: 'Test dialogue text' }
    ],
    choices: [
      { id: 'choice1', text: 'Test choice', consequence: 'Test consequence' }
    ]
  };
  
  it('renders dialogue correctly', () => {
    render(
      <DialogueScene 
        sceneData={mockSceneData}
        onSceneComplete={vi.fn()}
      />
    );
    
    expect(screen.getByText('Test dialogue text')).toBeInTheDocument();
    expect(screen.getByText('Anna')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });
  
  it('handles choice selection', async () => {
    const mockOnComplete = vi.fn();
    render(
      <DialogueScene 
        sceneData={mockSceneData}
        onSceneComplete={mockOnComplete}
      />
    );
    
    const choiceButton = screen.getByText('Test choice');
    await userEvent.click(choiceButton);
    
    expect(screen.getByText('Test consequence')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          sceneId: 'test-dialogue',
          completed: true,
          choices: ['choice1']
        })
      );
    });
  });
  
  it('meets accessibility standards', async () => {
    const { container } = render(
      <DialogueScene 
        sceneData={mockSceneData}
        onSceneComplete={vi.fn()}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### **Integration Testing with Playwright**
```typescript
// Example E2E test
test('complete GDPR game flow', async ({ page }) => {
  await page.goto('/games/gdpr-guide');
  
  // Test initial load performance
  const performanceMetrics = await page.evaluate(() => 
    JSON.parse(JSON.stringify(performance.getEntriesByType('navigation')[0]))
  );
  expect(performanceMetrics.loadEventEnd - performanceMetrics.fetchStart).toBeLessThan(2000);
  
  // Complete dialogue scene
  await expect(page.getByRole('heading', { name: /GDPR/ })).toBeVisible();
  await page.getByRole('button', { name: /Fortsätt/ }).click();
  
  // Complete quiz scene
  await page.getByRole('button', { name: /Korrekt hantering/ }).click();
  await page.getByRole('button', { name: /Svara/ }).click();
  await page.getByRole('button', { name: /Nästa fråga/ }).click();
  
  // Verify completion
  await expect(page.getByText(/Du har slutfört/)).toBeVisible();
  
  // Test accessibility
  const accessibilityResults = await page.accessibility.snapshot();
  expect(accessibilityResults).toMatchSnapshot('gdpr-game-a11y.json');
});
```

### **Performance Testing**
```typescript
// Performance monitoring in tests
test('scene transitions meet performance budgets', async ({ page }) => {
  await page.goto('/games/test-game');
  
  // Start performance monitoring
  await page.addInitScript(() => {
    window.performanceMarks = [];
    const originalMark = performance.mark;
    performance.mark = function(name) {
      window.performanceMarks.push({ name, timestamp: Date.now() });
      return originalMark.call(this, name);
    };
  });
  
  // Navigate through scenes
  await page.getByRole('button', { name: /Nästa/ }).click();
  
  // Check transition performance
  const marks = await page.evaluate(() => window.performanceMarks);
  const transitionTime = marks.find(m => m.name === 'scene-transition-end').timestamp - 
                        marks.find(m => m.name === 'scene-transition-start').timestamp;
  
  expect(transitionTime).toBeLessThan(100); // 100ms budget
});
```

---

## 📦 Build and Deployment

### **Vite Configuration**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    // Bundle analysis
    bundleAnalyzer({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
    // Accessibility testing
    a11y({
      // Include accessibility checks in build
      include: /\.(vue|js|ts|jsx|tsx)$/,
    }),
  ],
  build: {
    // Performance optimization
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          scenes: ['./src/scenes/index.ts'],
          analytics: ['./src/analytics/index.ts'],
        },
      },
    },
    // Enforce bundle size limits
    chunkSizeWarningLimit: 500, // 500KB warning
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      threshold: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
});
```

### **CI/CD Pipeline**
```yaml
# .github/workflows/engine-ci.yml
name: DigiNativa Engine CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type checking
        run: npm run type-check
      
      - name: Unit tests
        run: npm run test:coverage
      
      - name: Accessibility tests  
        run: npm run test:a11y
      
      - name: E2E tests
        run: npm run test:e2e
      
      - name: Build
        run: npm run build
      
      - name: Bundle analysis
        run: npm run analyze
      
      - name: Performance audit
        run: npm run lighthouse

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Build package
        run: npm run build
      
      - name: Publish to NPM
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 📊 Quality Assurance

### **Code Quality Standards**
```typescript
// ESLint configuration for engine
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  rules: {
    // Performance requirements
    'react/jsx-no-bind': 'error',
    'react/jsx-no-literals': 'warn',
    
    // Accessibility requirements
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/no-autofocus': 'error',
    
    // Code quality
    '@typescript-eslint/no-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

### **Automated Quality Gates**
```typescript
// Quality gate checks
const QUALITY_GATES = {
  codeCoverage: 90,           // 90% minimum code coverage
  bundleSize: 500 * 1024,     // 500KB max bundle size
  lighthouseScore: 90,        // 90+ Lighthouse performance
  a11yViolations: 0,          // Zero accessibility violations
  typeScriptErrors: 0,        // Zero TypeScript errors
  securityVulnerabilities: 0, // Zero security issues
} as const;

// Pre-commit hooks
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test && npm run build"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "npm run test:related"
    ]
  }
}
```

---

This technical specification provides the complete blueprint for building a production-ready, scalable, and accessible educational game engine that will power DigiNativa's transformation of Swedish public sector digital learning.

⚙️ **Architect. Build. Optimize. 🇸🇪**