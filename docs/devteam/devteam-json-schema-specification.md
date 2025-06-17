# DevTeam JSON Schema Specification
## Mandatory Content Format for AI-Generated Game Content

**System Architect Authority**: Full technical content format specification  
**Target Audience**: DevTeam developers integrating AI-generated content  
**Schema Version**: 1.0.0  
**Effective Date**: 2025-01-17  

---

## 🎯 SPECIFICATION OVERVIEW

This document defines the **mandatory JSON structure** that DevTeam must use when submitting AI-generated content to the Runtime Engine. This ensures seamless React component rendering and optimal performance.

### **Critical Requirements**
- **100% Schema Compliance**: All submissions must validate against this schema
- **Performance Optimized**: <2s loading, >95 Lighthouse score, <500KB total
- **Accessibility Ready**: Built-in WCAG 2.1 AA compliance support
- **Municipal Branding Compatible**: Supports dynamic branding injection

---

## 📋 ROOT CONTENT SUBMISSION SCHEMA

```typescript
interface DevTeamContentSubmission {
  // Metadata (Required)
  submission_metadata: {
    submission_id: string;           // UUID v4 format
    customer_order_id: string;       // Customer reference
    generated_at: string;            // ISO 8601 timestamp
    content_version: "1.0.0";        // MUST be 1.0.0
    processing_priority: "normal" | "high" | "urgent";
  };
  
  // AI-Generated Game Content (Required)
  game_content: {
    game_id: string;                 // Unique game identifier
    title: string;                   // Game display title (max 60 chars)
    description: string;             // Brief summary (max 200 chars)
    estimated_duration: number;      // Expected completion time (seconds)
    target_audience: "municipal-administrators" | "it-managers" | "department-heads" | "frontline-staff";
    difficulty_level: "beginner" | "intermediate" | "advanced";
    learning_objectives: string[];   // Array of learning goals
    
    // Content Scenes (Required - at least 1)
    scenes: DevTeamGameScene[];
  };
  
  // Cultural & Technical Requirements (Required)
  technical_requirements: {
    cultural_context: "swedish_municipal" | "german_municipal" | "french_municipal" | "dutch_municipal";
    municipal_branding: {
      primary_color?: string;        // Hex color code
      logo_url?: string;            // Municipal logo URL
      municipality_name: string;     // Official municipality name
    };
    performance_targets: {
      max_loading_time: 2000;        // Milliseconds - MUST be ≤2000
      min_lighthouse_score: 95;      // MUST be ≥95
    };
    accessibility_level: "WCAG_AA";  // MUST be WCAG_AA
  };
  
  // Content Quality Assurance (Required)
  content_qa: {
    pedagogical_validation: boolean;   // MUST be true
    cultural_appropriateness: boolean; // MUST be true  
    content_quality_score: number;     // MUST be ≥80 (0-100 scale)
    learning_outcome_alignment: boolean; // MUST be true
    ai_generation_confidence: number;   // 0-100 confidence score
  };
}
```

---

## 🎮 GAME SCENE SCHEMAS

### **Base Scene Interface**
```typescript
interface DevTeamGameScene {
  scene_id: string;                  // Unique within game
  scene_type: "dialogue" | "quiz" | "assessment" | "resource" | "introduction" | "summary";
  title: string;                     // Scene display title
  description?: string;              // Optional scene summary
  estimated_duration: number;        // Expected scene time (seconds)
  required: boolean;                 // Can user skip this scene?
  scene_data: DialogueSceneData | QuizSceneData | AssessmentSceneData;
}
```

### **DialogueScene Data Structure**
```typescript
interface DialogueSceneData {
  // Characters (Required - at least 1)
  characters: AIGeneratedCharacter[];
  
  // Dialogue Content (Required - at least 1 entry)
  dialogue_entries: DialogueEntry[];
  
  // Optional User Choices
  user_choices?: DialogueChoice[];
  
  // Scene Settings
  settings: {
    auto_progress: boolean;          // Auto-advance dialogue
    progress_delay?: number;         // MS delay between auto-advances
    allow_replay: boolean;           // Can user replay scene
  };
}

interface AIGeneratedCharacter {
  character_id: string;              // Unique within scene
  name: string;                      // Display name
  role: string;                      // Job title/municipal position
  personality_traits: string[];      // Character personality
  speaking_style: "formal" | "casual" | "technical" | "friendly";
  cultural_background: string;       // Cultural context info
  
  // Visual Representation
  avatar_description: string;        // Text description for avatar generation
  visual_style: "professional" | "approachable" | "authoritative" | "collaborative";
}

interface DialogueEntry {
  entry_id: string;                  // Unique within dialogue
  speaker_character_id: string;      // Must reference defined character
  dialogue_text: string;            // Character speech (max 200 chars per entry)
  emotional_tone: "neutral" | "happy" | "concerned" | "confused" | "confident" | "surprised";
  emphasis?: string[];               // Array of emphasized words/phrases
  display_order: number;            // Sequential order (1, 2, 3...)
  pause_after?: number;              // Optional pause in MS after this entry
}

interface DialogueChoice {
  choice_id: string;                 // Unique within scene
  choice_text: string;               // Button text (max 80 chars)
  consequence_text?: string;         // Immediate feedback text
  leads_to_scene?: string;           // Optional scene jump
  analytics_tag?: string;            // For tracking user choices
  learning_value: string;            // What this choice teaches
}
```

### **QuizScene Data Structure**
```typescript
interface QuizSceneData {
  // Quiz Configuration
  quiz_settings: {
    question_count: number;          // Total questions in quiz
    randomize_questions: boolean;    // Shuffle question order
    randomize_options: boolean;      // Shuffle answer options
    allow_retries: boolean;          // Can user retry wrong answers
    show_correct_answers: boolean;   // Display correct answers after attempt
    time_limit?: number;             // Optional time limit (seconds)
  };
  
  // Questions (Required - at least 1)
  questions: QuizQuestion[];
  
  // Scoring Configuration
  scoring: {
    passing_score: number;           // Percentage needed to pass (0-100)
    max_attempts: number;            // Maximum retry attempts
    penalty_per_retry?: number;      // Points deducted per retry
  };
}

interface QuizQuestion {
  question_id: string;               // Unique within quiz
  question_text: string;            // Question content (max 300 chars)
  question_type: "multiple_choice" | "true_false" | "multiple_select";
  
  // Answer Options (Required - 2+ for multiple choice, exactly 2 for true/false)
  options: QuizOption[];
  
  // Educational Content
  explanation: string;               // Why the correct answer is right
  learning_objective: string;        // What this question teaches
  difficulty: "easy" | "medium" | "hard";
  points: number;                    // Point value (1-10)
  
  // Optional Features
  hints?: string[];                  // Progressive help hints
  time_limit?: number;               // Question-specific time limit (seconds)
}

interface QuizOption {
  option_id: string;                 // Unique within question
  option_text: string;               // Answer choice text (max 150 chars)
  is_correct: boolean;               // Is this the right answer?
  feedback_text: string;            // Response when user selects this
  partial_credit?: number;           // Points for partially correct (0-1)
}
```

---

## 📊 PERFORMANCE REQUIREMENTS

### **Bundle Size Limits**
```typescript
interface PerformanceRequirements {
  max_content_size: {
    dialogue_scene: "50KB";          // Per scene JSON
    quiz_scene: "30KB";              // Per scene JSON
    assessment_scene: "75KB";        // Per scene JSON
    total_game: "500KB";             // Total JSON content
  };
  
  text_limits: {
    dialogue_entry: 200;             // Characters per dialogue entry
    quiz_question: 300;              // Characters per question
    quiz_option: 150;                // Characters per option
    explanation: 400;                // Characters per explanation
  };
  
  complexity_limits: {
    max_characters_per_scene: 6;     // Character count limit
    max_dialogue_entries: 20;        // Dialogue entries per scene
    max_quiz_questions: 15;          // Questions per quiz
    max_user_choices: 4;             // Choices per dialogue decision
  };
}
```

### **Rendering Speed Optimization**
- **Flat Structure**: No nesting beyond 3 levels
- **Unique IDs**: All IDs must be unique within scope
- **Sequential Ordering**: Use display_order fields consistently
- **Lazy Loading Ready**: Support progressive content loading

---

## 🔄 CONTENT PROCESSING PIPELINE

### **Processing Stages**
1. **Schema Validation**: JSON Schema compliance check (<5 seconds)
2. **Content Optimization**: Compression and asset processing
3. **Component Generation**: React component creation with municipal branding
4. **Quality Assurance**: Automated testing and performance validation
5. **Multi-Format Deployment**: Web app, SCORM, mobile PWA generation

### **Processing Timeline**
- **Total Processing Time**: <30 minutes from JSON to deployed game
- **Validation Feedback**: <5 seconds for schema validation
- **Error Recovery**: Support for resubmission after fixes

---

## ✅ VALIDATION & ERROR HANDLING

### **Validation Rules**
- **Required Fields**: All fields marked 'Required' must be present
- **Field Formats**: String fields must match length/format requirements  
- **Reference Integrity**: All ID references must point to existing objects
- **Performance Compliance**: Must meet size and complexity limits

### **Quality Gates**
```typescript
interface QualityGates {
  auto_reject: {
    content_quality_score: "< 80";
    invalid_schema: true;
    exceeds_performance_limits: true;
  };
  
  warnings: {
    content_quality_score: "80-85";
    approaching_size_limits: "> 80% of limits";
    cultural_context_mismatch: true;
  };
}
```

### **Common Error Types**
- **Schema Violations**: Missing required fields, invalid field types
- **Reference Errors**: Invalid character/scene references, duplicate IDs
- **Content Issues**: Text too long, insufficient options, no correct answers
- **Performance Issues**: Exceeds size limits, too complex structure

---

## 🧪 TESTING & VALIDATION

### **Pre-Submission Validation**
```bash
# Validate JSON schema compliance
POST /api/v1/validate-content
{
  "game_content": { /* Your AI-generated content */ },
  "validation_level": "strict"
}

# Response
{
  "valid": boolean,
  "errors": ValidationError[],
  "warnings": ValidationWarning[],
  "processing_estimate": "15 minutes"
}
```

### **End-to-End Testing Flow**
1. **Content Generation Test**: Submit test AI content
2. **Processing Validation**: Verify technical rendering
3. **Performance Testing**: Confirm <2s loading, >95 Lighthouse
4. **Accessibility Testing**: Validate WCAG 2.1 AA compliance
5. **Cultural Adaptation**: Test municipal branding injection

---

## 📈 SUCCESS METRICS

### **Content Processing KPIs**
- **Schema Compliance**: >99% of submissions pass validation
- **Processing Speed**: <30 minutes from JSON to deployed game
- **Quality Score**: >95% of games meet all quality gates
- **Error Recovery**: <5 minutes to fix and resubmit validation errors

### **Technical Performance KPIs**
- **Bundle Size**: <500KB total JSON content per game
- **Rendering Speed**: <2 seconds loading on municipal networks
- **Accessibility**: 100% WCAG 2.1 AA compliance
- **Lighthouse Score**: >95 all categories

---

## 🔗 IMPLEMENTATION CHECKLIST

### **DevTeam Requirements**
- [ ] Update AI generation pipeline to output this exact JSON schema
- [ ] Implement pre-submission schema validation
- [ ] Test with all scene types (dialogue, quiz, assessment)
- [ ] Validate cultural context handling for all 4 European markets
- [ ] Ensure content quality scores consistently >80

### **Runtime Engine Integration**
- [ ] JSON Schema validation endpoint operational
- [ ] React components can parse and render all scene types
- [ ] Performance monitoring for bundle size and rendering speed
- [ ] Municipal branding injection system functional
- [ ] Accessibility compliance verification automated

**This specification ensures DevTeam's AI-generated content integrates seamlessly with the Runtime Engine for world-class educational games supporting European municipal transformation.**