/**
 * DigiNativa Runtime Engine - Game Manifest Types
 * Version 0.1.0
 * 
 * This file defines the JSON schema for game content manifests.
 * AI Content Team uses this to generate compatible game files.
 */

// Theme configuration for multi-tenant customization
export interface ThemeConfig {
  // Brand identity
  brand: {
    name: string;
    logo?: {
      url: string;
      alt: string;
      placement?: 'header' | 'corner' | 'watermark';
      maxHeight?: string; // e.g., "48px"
    };
  };
  
  // Color system using CSS custom properties
  colors?: {
    // Primary brand colors
    primary?: string;
    primaryDark?: string;
    primaryLight?: string;
    
    // Secondary colors
    secondary?: string;
    secondaryDark?: string;
    secondaryLight?: string;
    
    // Semantic colors
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
    
    // UI colors
    background?: string;
    surface?: string;
    text?: string;
    textSecondary?: string;
    border?: string;
  };
  
  // Typography
  typography?: {
    fontFamily?: {
      heading?: string;
      body?: string;
      mono?: string;
    };
    fontSizeScale?: number; // Multiplier for base font sizes
  };
  
  // Component style overrides (limited to maintain accessibility)
  components?: {
    button?: {
      borderRadius?: string;
      fontWeight?: string;
    };
    card?: {
      borderRadius?: string;
      shadow?: string;
    };
  };
}

// Game metadata
export interface GameMetadata {
  title: string;
  subtitle?: string;
  description?: string;
  duration: string; // e.g., "7 minutes"
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  learningObjectives?: string[];
  targetAudience?: string;
  language?: string; // ISO language code
  version?: string;
}

// Analytics configuration
export interface AnalyticsConfig {
  enabled: boolean;
  endpoint?: string;
  trackingId?: string;
  customEvents?: string[];
}

// Base scene interface
export interface BaseScene {
  id: string;
  type: 'dialogue' | 'quiz' | 'assessment' | 'resource' | 'summary';
  title?: string;
  navigation?: {
    next?: string; // Scene ID or "end"
    previous?: string;
    canSkip?: boolean;
  };
}

// Dialogue scene for narrative content
export interface DialogueScene extends BaseScene {
  type: 'dialogue';
  character?: {
    id: string;
    name: string;
    role?: string;
    avatar?: string;
  };
  messages: Array<{
    text: string;
    characterId?: string;
    emotion?: 'neutral' | 'happy' | 'concerned' | 'thinking';
    delay?: number; // Milliseconds before showing
  }>;
  choices?: Array<{
    id: string;
    text: string;
    nextScene?: string;
    points?: number;
  }>;
}

// Quiz scene for knowledge checks
export interface QuizScene extends BaseScene {
  type: 'quiz';
  question: string;
  questionType?: 'text' | 'image' | 'video';
  media?: {
    url: string;
    alt?: string;
    caption?: string;
  };
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    feedback?: string;
    points?: number;
  }>;
  allowMultiple?: boolean;
  showFeedback?: boolean;
  maxAttempts?: number;
}

// Assessment scene for final evaluation
export interface AssessmentScene extends BaseScene {
  type: 'assessment';
  instructions?: string;
  questions: Array<{
    id: string;
    text: string;
    weight?: number;
    options: Array<{
      id: string;
      text: string;
      score: number;
    }>;
  }>;
  scoring?: {
    passingScore?: number;
    showScore?: boolean;
    feedback?: {
      excellent?: string;
      good?: string;
      needsImprovement?: string;
    };
  };
}

// Resource scene for reference materials
export interface ResourceScene extends BaseScene {
  type: 'resource';
  description?: string;
  resources: Array<{
    id: string;
    title: string;
    type: 'pdf' | 'video' | 'link' | 'download';
    url: string;
    description?: string;
    thumbnail?: string;
    size?: string; // e.g., "2.4 MB"
  }>;
  layout?: 'grid' | 'list';
}

// Summary scene for completion
export interface SummaryScene extends BaseScene {
  type: 'summary';
  title: string;
  message: string;
  score?: {
    achieved: number;
    total: number;
    showPercentage?: boolean;
  };
  achievements?: Array<{
    id: string;
    title: string;
    description: string;
    icon?: string;
  }>;
  nextActions?: Array<{
    label: string;
    action: 'restart' | 'exit' | 'certificate' | 'share';
    url?: string;
  }>;
}

// Union type for all scenes
export type Scene = 
  | DialogueScene 
  | QuizScene 
  | AssessmentScene 
  | ResourceScene 
  | SummaryScene;

// Main game manifest structure
export interface GameManifest {
  // Schema version for backwards compatibility
  schemaVersion: '0.1.0';
  
  // Unique game identifier
  gameId: string;
  
  // Game metadata
  metadata: GameMetadata;
  
  // Theme configuration (optional - uses defaults if not provided)
  theme?: ThemeConfig;
  
  // Analytics configuration
  analytics?: AnalyticsConfig;
  
  // All game scenes
  scenes: Scene[];
  
  // Starting scene ID
  startScene: string;
  
  // Global game settings
  settings?: {
    allowNavigation?: boolean;
    showProgress?: boolean;
    autoSave?: boolean;
    soundEnabled?: boolean;
  };
}

// Type guards for runtime checking
export const isDialogueScene = (scene: Scene): scene is DialogueScene => 
  scene.type === 'dialogue';

export const isQuizScene = (scene: Scene): scene is QuizScene => 
  scene.type === 'quiz';

export const isAssessmentScene = (scene: Scene): scene is AssessmentScene => 
  scene.type === 'assessment';

export const isResourceScene = (scene: Scene): scene is ResourceScene => 
  scene.type === 'resource';

export const isSummaryScene = (scene: Scene): scene is SummaryScene => 
  scene.type === 'summary';