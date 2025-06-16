# Content Schema Documentation - DigiNativa Runtime Engine 📋

**Complete JSON Schema for Educational Game Manifests**

This document defines the precise structure for creating game content that the DigiNativa Runtime Engine can render into engaging educational experiences.

---

## 🏗️ Schema Overview

The DigiNativa content schema enables non-technical content creators to build sophisticated educational games using pure JSON. The runtime engine transforms these manifests into fully interactive, accessible experiences.

### **Schema Philosophy**
- **Declarative**: Describe what you want, not how to build it
- **Accessible**: Built-in WCAG 2.1 AA compliance
- **Mobile-First**: Optimized for Anna Svensson's workflow
- **Reusable**: Same patterns work across all game types

---

## 📊 Root Game Manifest Schema

```typescript
interface GameManifest {
  gameId: string;                    // Unique identifier
  version: string;                   // Schema version (e.g., "1.0.0")
  metadata: GameMetadata;            // Game information and settings
  scenes: Scene[];                   // Ordered list of game scenes
  analytics: AnalyticsConfig;        // Tracking and measurement setup
  accessibility: AccessibilityConfig; // A11y customizations
  branding?: BrandingConfig;         // Visual theme overrides
}
```

### **Example Root Structure**
```json
{
  "gameId": "sweden-digital-strategy-2025",
  "version": "1.0.0",
  "metadata": {
    "title": "Sveriges Digitaliseringsstrategi",
    "description": "Praktisk implementering för kommunal förvaltning",
    "duration": 420,
    "targetAudience": "municipal-administrators",
    "difficulty": "intermediate",
    "language": "sv-SE"
  },
  "scenes": [],
  "analytics": {},
  "accessibility": {}
}
```

---

## 🎮 Metadata Configuration

```typescript
interface GameMetadata {
  title: string;                     // Display name (max 60 chars)
  description: string;               // Brief summary (max 200 chars)
  duration: number;                  // Expected completion time (seconds)
  targetAudience: AudienceType;      // Primary user group
  difficulty: DifficultyLevel;       // Complexity level
  language: string;                  // ISO 639-1 language code
  learningObjectives: string[];      // What users will learn
  prerequisites?: string[];          // Required prior knowledge
  certification?: CertificationConfig; // Completion credentials
  tags: string[];                    // Searchable keywords
}

type AudienceType = 
  | "municipal-administrators"
  | "it-managers" 
  | "department-heads"
  | "frontline-staff"
  | "citizens";

type DifficultyLevel = "beginner" | "intermediate" | "advanced";
```

### **Example Metadata**
```json
{
  "metadata": {
    "title": "GDPR för Kommunal Verksamhet",
    "description": "Lär dig hantera personuppgifter enligt GDPR i kommunal kontext",
    "duration": 420,
    "targetAudience": "municipal-administrators",
    "difficulty": "intermediate", 
    "language": "sv-SE",
    "learningObjectives": [
      "Förstå GDPR:s tillämpning i kommunal verksamhet",
      "Identifiera personuppgifter i kommunala processer",
      "Hantera medborgarförfrågningar enligt artikel 15",
      "Implementera säkra rutiner för datahantering"
    ],
    "prerequisites": [
      "Grundläggande kunskap om kommunal förvaltning",
      "Förtrogenhet med digitala arbetssätt"
    ],
    "certification": {
      "enabled": true,
      "passingScore": 80,
      "certificateName": "GDPR Kommunal Grundkurs"
    },
    "tags": ["gdpr", "personuppgifter", "kommun", "juridik", "säkerhet"]
  }
}
```

---

## 🎭 Scene Schema Definitions

### **Base Scene Interface**
```typescript
interface Scene {
  sceneId: string;                   // Unique scene identifier
  type: SceneType;                   // Scene component type
  title: string;                     // Scene display title
  description?: string;              // Optional scene summary
  duration?: number;                 // Expected scene duration (seconds)
  required: boolean;                 // Can user skip this scene?
  data: SceneData;                   // Scene-specific configuration
  navigation?: NavigationConfig;     // Custom navigation options
  analytics?: SceneAnalyticsConfig; // Scene-specific tracking
}

type SceneType = 
  | "dialogue" 
  | "quiz" 
  | "assessment" 
  | "resource" 
  | "introduction"
  | "summary";
```

---

## 💬 DialogueScene Schema

**Purpose**: Present narrative content through character interactions

```typescript
interface DialogueSceneData {
  characters: Character[];           // Scene participants
  dialogue: DialogueEntry[];        // Conversation flow
  choices?: DialogueChoice[];       // Optional user decisions
  background?: BackgroundConfig;    // Visual scene setting
  autoProgress?: boolean;           // Auto-advance dialogue
  progressDelay?: number;           // Delay between auto-advances (ms)
}

interface Character {
  id: string;                       // Character identifier
  name: string;                     // Display name
  role: string;                     // Job title/description
  avatar: string;                   // Avatar image identifier
  description?: string;             // Character background
}

interface DialogueEntry {
  speaker: string;                  // Character ID
  text: string;                     // Dialogue text
  emotion?: EmotionType;            // Character expression
  actions?: DialogueAction[];       // Visual/audio effects
  delay?: number;                   // Display delay (ms)
}

interface DialogueChoice {
  id: string;                       // Choice identifier  
  text: string;                     // Choice display text
  consequence?: string;             // Immediate outcome text
  sceneJump?: string;               // Jump to different scene
  analyticsEvent?: string;          // Custom tracking event
}

type EmotionType = "neutral" | "happy" | "concerned" | "confused" | "confident";
```

### **Example DialogueScene**
```json
{
  "sceneId": "digital-strategy-intro",
  "type": "dialogue",
  "title": "Strategimöte med IT-avdelningen",
  "duration": 120,
  "required": true,
  "data": {
    "characters": [
      {
        "id": "anna",
        "name": "Anna Svensson",
        "role": "Kommunal förvaltare",
        "avatar": "anna-professional",
        "description": "Erfaren administratör med fokus på medborgarservice"
      },
      {
        "id": "erik",
        "name": "Erik Lindberg", 
        "role": "IT-chef",
        "avatar": "erik-it-manager",
        "description": "Ansvarig för kommunens digitala transformation"
      }
    ],
    "dialogue": [
      {
        "speaker": "anna",
        "text": "Vi har fått i uppdrag att implementera Sveriges nya digitaliseringsstrategi. Vilka är de viktigaste utmaningarna för vår kommun?",
        "emotion": "concerned"
      },
      {
        "speaker": "erik", 
        "text": "Främst medborgarnära tjänster och datahantering. Vi måste balansera tillgänglighet med integritetsskydd.",
        "emotion": "confident"
      }
    ],
    "choices": [
      {
        "id": "focus-accessibility",
        "text": "Prioritera tillgängliga digitala tjänster först",
        "consequence": "Erik nickar instämmande. 'Bra ansats - vi börjar med medborgarportalen.'"
      },
      {
        "id": "focus-security",
        "text": "Fokusera på säkerhet och integritet först", 
        "consequence": "Erik ser fundersam ut. 'Viktigt, men vi riskerar att försena tjänsteutvecklingen.'"
      }
    ],
    "autoProgress": false
  }
}
```

---

## 📝 QuizScene Schema

**Purpose**: Test knowledge through interactive questions

```typescript
interface QuizSceneData {
  questions: QuizQuestion[];        // List of quiz questions
  settings: QuizSettings;           // Quiz behavior configuration
  scoring: ScoringConfig;           // How to calculate results
  feedback: FeedbackConfig;         // Response customization
}

interface QuizQuestion {
  id: string;                       // Question identifier
  type: QuestionType;               // Question format
  question: string;                 // Question text
  options: QuestionOption[];        // Answer choices
  explanation?: string;             // Why the correct answer is right
  points?: number;                  // Question point value
  timeLimit?: number;               // Answer time limit (seconds)
  hints?: string[];                 // Progressive help hints
}

interface QuestionOption {
  id: string;                       // Option identifier
  text: string;                     // Option display text
  correct: boolean;                 // Is this the right answer?
  feedback: string;                 // Response to this choice
  points?: number;                  // Partial credit points
}

interface QuizSettings {
  randomizeQuestions: boolean;      // Shuffle question order
  randomizeOptions: boolean;        // Shuffle answer choices
  allowRetries: boolean;            // Can user retry incorrect answers
  showCorrectAnswers: boolean;      // Display correct answers after attempt
  immediateMode: boolean;           // Show feedback after each question
}

type QuestionType = 
  | "multiple-choice"
  | "true-false"
  | "multiple-select"
  | "ranking"
  | "scenario-based";
```

### **Example QuizScene**
```json
{
  "sceneId": "strategy-knowledge-check",
  "type": "quiz", 
  "title": "Kunskapstest: Digitaliseringsstrategin",
  "duration": 180,
  "required": true,
  "data": {
    "questions": [
      {
        "id": "q1-digital-first",
        "type": "multiple-choice",
        "question": "Enligt digitaliseringsstrategin, vad innebär principen 'Digital i första hand'?",
        "options": [
          {
            "id": "opt1",
            "text": "Alla kommunala tjänster ska endast finnas digitalt",
            "correct": false,
            "feedback": "Fel. Strategin betonar digitalt som förstahandsval, inte enda alternativ."
          },
          {
            "id": "opt2", 
            "text": "Digitala lösningar ska vara den naturliga vägen för medborgare och företag",
            "correct": true,
            "feedback": "Korrekt! Digital i första hand betyder att digitala vägar ska vara enkla och naturliga att välja."
          },
          {
            "id": "opt3",
            "text": "Kommunen ska prioritera IT-investeringar framför andra projekt",
            "correct": false,
            "feedback": "Fel. Det handlar om användarupplevelse, inte investeringsprioriteringar."
          }
        ],
        "explanation": "Digital i första hand handlar om att göra digitala tjänster så enkla och tillgängliga att de blir det naturliga valet.",
        "points": 10,
        "timeLimit": 60
      }
    ],
    "settings": {
      "randomizeQuestions": false,
      "randomizeOptions": true,
      "allowRetries": true,
      "showCorrectAnswers": true,
      "immediateMode": true
    },
    "scoring": {
      "passingScore": 80,
      "maxAttempts": 3,
      "penaltyPerAttempt": 10
    }
  }
}
```

---

## 📊 AssessmentScene Schema

**Purpose**: Comprehensive evaluation with certification

```typescript
interface AssessmentSceneData {
  assessmentType: AssessmentType;   // Type of assessment
  questions: AssessmentQuestion[];  // Assessment questions
  scoring: AssessmentScoring;       // Scoring methodology
  certification: CertificationConfig; // Certificate generation
  timeLimit?: number;               // Total assessment time (seconds)
  attempts: AttemptConfig;          // Retry policies
}

interface AssessmentQuestion {
  id: string;                       // Question identifier
  type: QuestionType;               // Question format  
  question: string;                 // Question text
  scenario?: ScenarioContext;       // Real-world context
  options: QuestionOption[];        // Answer choices
  rubric?: ScoringRubric;          // Detailed scoring criteria
  weight: number;                   // Question importance (0-1)
}

interface ScenarioContext {
  title: string;                    // Scenario name
  description: string;              // Background situation
  context: string;                  // Detailed context
  resources?: ResourceLink[];       // Reference materials
}

interface CertificationConfig {
  enabled: boolean;                 // Generate certificates
  certificateName: string;          // Certificate title
  authority: string;                // Issuing organization
  validityPeriod?: number;          // Certificate validity (days)
  requirements: CertificationRequirement[]; // Completion criteria
}

type AssessmentType = 
  | "knowledge-check"
  | "competency-evaluation" 
  | "scenario-based"
  | "comprehensive";
```

### **Example AssessmentScene**
```json
{
  "sceneId": "final-competency-assessment",
  "type": "assessment",
  "title": "Slutbedömning: Digitaliseringsstrategi",
  "duration": 300,
  "required": true,
  "data": {
    "assessmentType": "competency-evaluation",
    "questions": [
      {
        "id": "scenario-citizen-request",
        "type": "scenario-based",
        "question": "Hur hanterar du denna situation enligt digitaliseringsstrategin?",
        "scenario": {
          "title": "Medborgarförfrågan om digital service",
          "description": "En 70-årig medborgare vill ansöka om bygglov men har svårt med digitala verktyg",
          "context": "Medborgaren kommer till kommunhuset och säger att hen inte kan använda den digitala tjänsten. Hen begär hjälp och vill fylla i en pappersansökan istället.",
          "resources": [
            {
              "title": "Digitaliseringsstrategins principer",
              "url": "strategy-principles.pdf"
            }
          ]
        },
        "options": [
          {
            "id": "paper-only",
            "text": "Ge hen en pappersansökan att fylla i hemma",
            "correct": false,
            "feedback": "Detta stödjer inte strategins mål om digital utveckling."
          },
          {
            "id": "guided-digital",
            "text": "Erbjud guidning för att använda den digitala tjänsten",
            "correct": true,
            "feedback": "Perfekt! Detta följer principen om stöd för digital delaktighet."
          }
        ],
        "weight": 0.3
      }
    ],
    "certification": {
      "enabled": true,
      "certificateName": "Digitaliseringsstrategi Grundkurs",
      "authority": "DigiNativa Utbildningsplattform",
      "validityPeriod": 365,
      "requirements": [
        {
          "type": "minimum-score",
          "value": 80
        },
        {
          "type": "completion-time",
          "value": 900
        }
      ]
    }
  }
}
```

---

## 📚 ResourceScene Schema

**Purpose**: Provide reference materials and downloads

```typescript
interface ResourceSceneData {
  resources: Resource[];            // Available resources
  layout: ResourceLayout;           // How to display resources
  downloadTracking: boolean;        // Track download events
  offline?: OfflineConfig;          // Offline availability
}

interface Resource {
  id: string;                       // Resource identifier
  title: string;                    // Resource name
  description: string;              // Resource summary
  type: ResourceType;               // Resource format
  url: string;                      // Resource location
  size?: string;                    // File size (e.g., "2.3 MB")
  language: string;                 // Content language
  lastUpdated: string;              // ISO date string
  tags: string[];                   // Searchable keywords
  downloadable: boolean;            // Can user download this?
  essential: boolean;               // Mark as high priority
}

type ResourceType = 
  | "pdf"
  | "word-document" 
  | "spreadsheet"
  | "presentation"
  | "video"
  | "audio"
  | "web-link"
  | "interactive-tool";

type ResourceLayout = "grid" | "list" | "categories";
```

### **Example ResourceScene**
```json
{
  "sceneId": "strategy-resources",
  "type": "resource",
  "title": "Resurser och Verktyg",
  "duration": 60,
  "required": false,
  "data": {
    "resources": [
      {
        "id": "strategy-full-document",
        "title": "Sveriges Digitaliseringsstrategi - Fullständig version",
        "description": "Komplett strategidokument med alla prioriteringsområden och åtgärder",
        "type": "pdf",
        "url": "https://resources.diginativa.se/strategy-full.pdf",
        "size": "3.2 MB",
        "language": "sv-SE",
        "lastUpdated": "2025-06-01",
        "tags": ["strategi", "politik", "digitalisering"],
        "downloadable": true,
        "essential": true
      },
      {
        "id": "implementation-checklist",
        "title": "Implementeringschecklista för kommuner",
        "description": "Praktisk guide för att implementera strategin i kommunal verksamhet",
        "type": "word-document",
        "url": "https://resources.diginativa.se/implementation-checklist.docx",
        "size": "1.8 MB",
        "language": "sv-SE",
        "lastUpdated": "2025-06-10",
        "tags": ["implementering", "checklista", "kommun"],
        "downloadable": true,
        "essential": true
      }
    ],
    "layout": "grid",
    "downloadTracking": true,
    "offline": {
      "enabled": true,
      "cacheDuration": 2592000
    }
  }
}
```

---

## 📊 Analytics Configuration

```typescript
interface AnalyticsConfig {
  enabled: boolean;                 // Enable/disable tracking
  provider: AnalyticsProvider;      // Analytics service
  events: AnalyticsEvent[];         // Events to track
  privacy: PrivacyConfig;           // Data protection settings
  realtime: boolean;                // Real-time event sending
}

interface AnalyticsEvent {
  name: string;                     // Event identifier
  description: string;              // Event purpose
  parameters: EventParameter[];     // Data to collect
  frequency: EventFrequency;        // How often to send
}

type AnalyticsProvider = 
  | "diginativa-analytics"
  | "google-analytics" 
  | "municipal-dashboard"
  | "custom";

type EventFrequency = "immediate" | "batched" | "session-end";
```

### **Example Analytics Configuration**
```json
{
  "analytics": {
    "enabled": true,
    "provider": "diginativa-analytics",
    "events": [
      {
        "name": "scene_completion",
        "description": "User completes a game scene",
        "parameters": [
          {
            "name": "scene_id",
            "type": "string",
            "required": true
          },
          {
            "name": "completion_time",
            "type": "number", 
            "required": true
          },
          {
            "name": "score",
            "type": "number",
            "required": false
          }
        ],
        "frequency": "immediate"
      }
    ],
    "privacy": {
      "anonymize": true,
      "dataRetention": 365,
      "consentRequired": true
    },
    "realtime": true
  }
}
```

---

## ♿ Accessibility Configuration

```typescript
interface AccessibilityConfig {
  features: AccessibilityFeature[];  // Enabled a11y features
  customizations: A11yCustomization[]; // User preference overrides
  compliance: ComplianceLevel;        // WCAG compliance target
  testing: A11yTestingConfig;         // Automated testing setup
}

interface AccessibilityFeature {
  name: string;                      // Feature identifier
  enabled: boolean;                  // Feature state
  configuration?: Record<string, any>; // Feature-specific settings
}

type ComplianceLevel = "AA" | "AAA";
```

### **Example Accessibility Configuration**
```json
{
  "accessibility": {
    "features": [
      {
        "name": "high-contrast-mode",
        "enabled": true,
        "configuration": {
          "togglePosition": "top-right",
          "defaultState": false
        }
      },
      {
        "name": "font-size-controls",
        "enabled": true,
        "configuration": {
          "minSize": 16,
          "maxSize": 24,
          "stepSize": 2
        }
      },
      {
        "name": "keyboard-navigation",
        "enabled": true,
        "configuration": {
          "skipLinks": true,
          "focusIndicators": "enhanced"
        }
      }
    ],
    "compliance": "AA",
    "testing": {
      "automated": true,
      "tools": ["axe-core", "lighthouse"],
      "reportGeneration": true
    }
  }
}
```

---

## ✅ Schema Validation

### **JSON Schema Validation**
The runtime engine validates all game manifests against a formal JSON Schema before rendering. Invalid manifests are rejected with detailed error messages.

### **Business Logic Validation**
Beyond structural validation, the engine performs business logic checks:

- **Duration Consistency**: Scene durations sum to total game duration
- **Navigation Integrity**: All scene jumps reference existing scenes  
- **Character Consistency**: All dialogue speakers reference defined characters
- **Resource Availability**: All linked resources are accessible
- **Accessibility Compliance**: Content meets WCAG 2.1 AA requirements

### **Content Quality Checks**
- **Swedish Language Validation**: Proper grammar and terminology
- **Municipal Context Accuracy**: Realistic scenarios and legal references
- **Anna Persona Alignment**: Content suitable for target user
- **Mobile Optimization**: Text length and interaction complexity

---

## 🛠️ Content Creation Tools

### **Schema Generator**
Interactive web tool for non-technical content creators:
- Visual scene builder with drag-and-drop interface
- Real-time preview of game experience
- Automatic schema validation and error highlighting
- Export to JSON manifest format

### **Validation CLI**
Command-line tool for technical validation:
```bash
npx @diginativa/content-validator validate game-manifest.json
npx @diginativa/content-validator test --accessibility --performance
npx @diginativa/content-validator preview --device=mobile
```

### **Testing Framework** 
Automated testing for content quality:
- Accessibility compliance checking
- Performance impact analysis  
- Mobile experience validation
- Swedish language quality review

---

**This schema enables the creation of world-class educational games that transform Swedish public sector digital competency through engaging, accessible, and immediately applicable learning experiences.**

📋 **Schema. Validate. Transform. 🇸🇪**