# Advanced Quiz Mechanics Interactive Prototypes
## High-Fidelity Design Specifications för Q2 Implementation

**Document Type:** Interactive Prototype Specifications  
**Version:** 1.0  
**Created:** 2025-01-18  
**Author:** Game Designer  
**Roadmap Reference:** Q2-GEI-Milestone-2.1  
**Target Users:** Development Team, DevTeam Content Creators  
**Implementation Priority:** Q2 CRITICAL - Enables 40% premium pricing  

---

## 📋 EXECUTIVE SUMMARY

**Purpose:** Transform research into actionable, interactive prototypes demonstrating four advanced quiz mechanics that justify premium pricing through superior engagement.

**Deliverables:**
1. Drag-Drop Workflow Simulation - Interactive Figma prototype
2. Decision Tree Navigation - Clickable flow prototype  
3. Timed Challenge System - Animated timing mechanics
4. Collaborative Quiz Interface - Multi-user interaction patterns

**Business Impact:**
- Visual demonstration for stakeholder buy-in
- Clear implementation guide for developers
- DevTeam preview of content creation possibilities
- Marketing assets for premium feature promotion

---

## 🎯 PROTOTYPE 1: DRAG-DROP WORKFLOW SIMULATION

### Interactive Design Specifications

#### Desktop Layout (1440x900)
```
┌─────────────────────────────────────────────────────────────────┐
│ Malmö Stad - Budgetfördelning 2025                   ⏱ 05:32   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Dra budgetposterna till rätt kvartal                           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Tillgängliga budgetposter                                │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │   │
│  │ │ Skolverks.  │ │ Vägunderh.  │ │ Äldreomsorg │        │   │
│  │ │ 15 MSEK     │ │ 8 MSEK      │ │ 22 MSEK     │        │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘        │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │   │
│  │ │ IT-system   │ │ Kultur      │ │ Miljöarbete │        │   │
│  │ │ 5 MSEK      │ │ 3 MSEK      │ │ 6 MSEK      │        │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────┬─────────────────┬─────────────────┐       │
│  │ Q1 Jan-Mar      │ Q2 Apr-Jun      │ Q3 Jul-Sep      │       │
│  ├─────────────────┼─────────────────┼─────────────────┤       │
│  │                 │                 │                 │       │
│  │ Drop zone       │ Drop zone       │ Drop zone       │       │
│  │                 │                 │                 │       │
│  │ Total: 0 MSEK   │ Total: 0 MSEK   │ Total: 0 MSEK   │       │
│  └─────────────────┴─────────────────┴─────────────────┘       │
│                                                                   │
│  Återstående budget: 59 MSEK    [Kontrollera fördelning]       │
└─────────────────────────────────────────────────────────────────┘
```

#### Mobile Layout (iPhone 12 - 390x844)
```
┌──────────────────────┐
│ Budgetfördelning     │
│ ⏱ 05:32             │
├──────────────────────┤
│ Svep för att se alla │
│                      │
│ ┌──────┐ ┌──────┐   │
│ │Skola │ │ Väg  │ → │
│ │15MSEK│ │8MSEK │   │
│ └──────┘ └──────┘   │
│                      │
│ ▼ Q1 Jan-Mar         │
│ ┌──────────────────┐ │
│ │                  │ │
│ │   Släpp här      │ │
│ │                  │ │
│ └──────────────────┘ │
│ Total: 0 MSEK        │
│                      │
│ ▼ Q2 Apr-Jun         │
│ ┌──────────────────┐ │
│ │   Släpp här      │ │
│ └──────────────────┘ │
│                      │
│ [Kontrollera] →      │
└──────────────────────┘
```

### Interaction Patterns

#### Drag Initiation
```scss
.budget-item {
  cursor: grab;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &.dragging {
    cursor: grabbing;
    opacity: 0.8;
    transform: scale(1.05) rotate(2deg);
    z-index: 1000;
    
    // Ghost image at original position
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0.2;
      border: 2px dashed #0066CC;
    }
  }
}
```

#### Drop Zone Feedback
```typescript
interface DropZoneFeedback {
  idle: {
    border: '2px dashed #E2E8F0',
    background: '#FAFAFA',
    message: 'Släpp budgetpost här'
  },
  active: {
    border: '3px solid #0066CC',
    background: '#EBF8FF',
    message: 'Släpp för att placera',
    animation: 'pulse 1s infinite'
  },
  valid: {
    border: '3px solid #00A651',
    background: '#F0FFF4',
    message: '✓ Giltig placering'
  },
  invalid: {
    border: '3px solid #DC3545',
    background: '#FFF5F5',
    message: '✗ Kan inte placeras här'
  }
}
```

### Validation & Feedback

```typescript
interface WorkflowValidation {
  rules: [
    {
      id: 'essential-services-q1',
      description: 'Kärnverksamheter måste finansieras i Q1',
      check: (distribution) => {
        return distribution.q1.includes('school') && 
               distribution.q1.includes('eldercare');
      },
      feedback: 'Kom ihåg att skola och äldreomsorg behöver finansiering från årets början!'
    },
    {
      id: 'infrastructure-summer',
      description: 'Vägarbete sker under sommaren',
      check: (distribution) => {
        return distribution.q2.includes('road-maintenance') ||
               distribution.q3.includes('road-maintenance');
      }
    }
  ]
}
```

---

## 🌳 PROTOTYPE 2: DECISION TREE NAVIGATION

### Interactive Flow Design

#### Step-by-Step Navigation
```
┌─────────────────────────────────────────────────────────────────┐
│ Bygglovsansökan - Beslutsträd                    Steg 3 av 7   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Din väg: Nybyggnad → Bostadshus → Detaljplanelagt område       │
│  ────────────────────────────────────────────────────────────   │
│                                                                   │
│  ❓ Överensstämmer byggnaden med detaljplanen?                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📋 Detaljplanens krav:                                   │   │
│  │ • Max byggnadshöjd: 8,5 meter                           │   │
│  │ • Min avstånd till tomtgräns: 4,5 meter                │   │
│  │ • Max byggnadsarea: 25% av tomten                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────┐  ┌─────────────────────────┐     │
│  │ ✅ Ja, helt och hållet  │  │ ⚠️ Nej, avvikelser finns │     │
│  │                         │  │                         │     │
│  │ → Standard bygglov      │  │ → Kräver dispens        │     │
│  │ → 3 veckors handlägg.   │  │ → 8 veckors handlägg.   │     │
│  └─────────────────────────┘  └─────────────────────────┘     │
│                                                                   │
│  [← Föregående]                                    [Visa träd]  │
└─────────────────────────────────────────────────────────────────┘
```

#### Visual Decision Tree
```
                    [Start: Bygglovsansökan]
                            │
                ┌───────────┴───────────┐
                │                       │
          [Nybyggnad]             [Tillbyggnad]
                │                       │
        ┌───────┴───────┐              ...
        │               │
   [Bostadshus]    [Verksamhet]
        │               │
   ┌────┴────┐         ...
   │         │
[Inom]    [Utom]
[plan]    [plan]
   │         │
  ✅        ⚠️
```

### Mobile Decision Interface
```
┌──────────────────────┐
│ Bygglovsansökan  3/7 │
├──────────────────────┤
│ Din väg så långt:   │
│ 🏠 Nybyggnad         │
│ 🏡 Bostadshus        │
│ 📋 Detaljplan        │
├──────────────────────┤
│                      │
│ Stämmer med planen?  │
│                      │
│ ┌──────────────────┐ │
│ │ Se detaljkrav →  │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │  ✅ Ja, stämmer  │ │
│ │ 3 veckors handl. │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │  ⚠️ Avvikelser   │ │
│ │ 8 veckors handl. │ │
│ └──────────────────┘ │
│                      │
│ [← Tillbaka]         │
└──────────────────────┘
```

### Decision Tracking System

```typescript
interface DecisionPath {
  steps: Array<{
    id: string;
    question: string;
    answer: string;
    timestamp: Date;
    consequence: {
      type: 'positive' | 'neutral' | 'negative';
      description: string;
      timeImpact?: string;
      costImpact?: string;
    };
  }>;
  
  currentScore: {
    efficiency: number;  // 0-100
    compliance: number;  // 0-100
    citizenSatisfaction: number;  // 0-100
  };
  
  summary: {
    totalTime: string;
    decisionsOptimal: number;
    decisionsSuboptimal: number;
    regulatoryCompliance: boolean;
  };
}
```

---

## ⏱️ PROTOTYPE 3: TIMED CHALLENGE MECHANICS

### Crisis Response Interface

#### Emergency Scenario Timer
```
┌─────────────────────────────────────────────────────────────────┐
│ 🚨 KRISHANTERING: Översvämning i centrum         ⏱ 02:45      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Prioritera åtgärder i rätt ordning:                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Tillgängliga åtgärder:                    Tid kvar: ▓▓░  │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ □ Aktivera krishanteringsgruppen          (30 sek)      │   │
│  │ □ Informera allmänheten via VMA           (45 sek)      │   │
│  │ □ Evakuera låglänta områden               (60 sek)      │   │
│  │ □ Stäng av el i drabbade områden          (20 sek)      │   │
│  │ □ Kontakta räddningstjänsten              (15 sek)      │   │
│  │ □ Öppna krisboenden                       (40 sek)      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Valda åtgärder (i ordning):                                    │
│  1. ________________________________                            │
│  2. ________________________________                            │
│  3. ________________________________                            │
│                                                                   │
│  [Bekräfta prioritering]            Konsekvenser: Visas efter  │
└─────────────────────────────────────────────────────────────────┘
```

### Timer Visual States

```scss
// Normal state (>30 seconds)
.timer-normal {
  background: linear-gradient(90deg, #00A651 0%, #00A651 var(--progress), #E2E8F0 var(--progress));
  color: #1A202C;
  font-weight: 500;
  
  .timer-icon {
    animation: none;
  }
}

// Warning state (10-30 seconds)
.timer-warning {
  background: linear-gradient(90deg, #FFB000 0%, #FFB000 var(--progress), #E2E8F0 var(--progress));
  color: #1A202C;
  font-weight: 600;
  
  .timer-icon {
    animation: pulse 1s infinite;
  }
}

// Critical state (<10 seconds)
.timer-critical {
  background: linear-gradient(90deg, #DC3545 0%, #DC3545 var(--progress), #E2E8F0 var(--progress));
  color: white;
  font-weight: 700;
  
  .timer-icon {
    animation: shake 0.5s infinite;
  }
  
  .timer-digits {
    font-size: 1.2em;
    animation: blink 0.5s infinite;
  }
}
```

### Mobile Timer Optimization

```typescript
interface MobileTimerAdaptation {
  // Haptic feedback for time warnings
  vibrationPatterns: {
    warning: [200, 100, 200],  // Double pulse at 30s
    critical: [500, 100, 500, 100, 500],  // Triple long pulse at 10s
    expired: [1000]  // Long vibration at 0s
  },
  
  // Audio cues for accessibility
  audioCues: {
    warning: 'warning-chime.mp3',
    critical: 'urgent-alert.mp3',
    expired: 'timeout.mp3'
  },
  
  // Visual adaptations
  mobileUI: {
    timerPosition: 'fixed-top',
    fontSize: '18px',
    highContrast: true,
    reduceAnimations: respectsMotionPreference()
  }
}
```

---

## 👥 PROTOTYPE 4: COLLABORATIVE QUIZ INTERFACE

### Multi-User Session Design

#### Team Leader View
```
┌─────────────────────────────────────────────────────────────────┐
│ Samarbetsövning: Budgetplanering      👥 4/4 anslutna          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Team Status:                          Fråga 3 av 8             │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │ Anna S. 🟢  │ Erik L. 🟢  │ Maria K. 🟡 │ Johan B. 🟢 │   │
│  │ Svarar...   │ Klar ✓      │ Tänker...   │ Klar ✓      │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┘   │
│                                                                   │
│  Vilka faktorer ska prioriteras vid budgetfördelning?           │
│                                                                   │
│  Team-svar (majoritetsröstning):                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ☑ Lagstadgade krav                             (4/4) ✓  │   │
│  │ ☑ Medborgarnas behov                           (3/4) ✓  │   │
│  │ ☐ Politiska vallöften                          (1/4)    │   │
│  │ ☑ Långsiktig hållbarhet                        (4/4) ✓  │   │
│  │ ☐ Kortsiktiga besparingar                      (0/4)    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  💬 Team-chatt:                                                 │
│  Erik: "Kom ihåg att lagen går först!"                         │
│  Maria: "Vad räknas som långsiktigt?"                          │
│                                                                   │
│  [Skicka team-svar]                         [Diskutera mer]    │
└─────────────────────────────────────────────────────────────────┘
```

#### Individual Team Member View
```
┌──────────────────────┐
│ Budgetplanering  3/8 │
│ 👥 Lagövning         │
├──────────────────────┤
│ Ditt svar:           │
│                      │
│ ☑ Lagstadgade krav   │
│ ☑ Medborgarnas behov │
│ ☐ Politiska löften   │
│ ☑ Hållbarhet         │
│ ☐ Besparingar        │
│                      │
│ Team (3/4 klara):    │
│ Anna S. 🟢 Erik L. 🟢│
│ Du 🟡    Johan B. 🟢 │
│                      │
│ 💬 Erik: "Kom ihåg   │
│ att lagen går först!"│
│                      │
│ [Klar] [Ändra svar]  │
└──────────────────────┘
```

### Real-Time Synchronization

```typescript
interface CollaborativeQuizState {
  session: {
    id: string;
    code: string;  // 6-digit join code
    host: string;
    participants: Participant[];
    settings: {
      maxParticipants: number;
      votingMethod: 'majority' | 'consensus' | 'weighted';
      timeLimit?: number;
      allowLateJoin: boolean;
    };
  };
  
  currentQuestion: {
    id: string;
    responses: Map<string, Response>;
    teamConsensus?: Response;
    discussion: Message[];
  };
  
  sync: {
    method: 'websocket' | 'polling';
    latency: number;
    conflictResolution: 'last-write-wins' | 'operational-transform';
  };
}

// WebSocket events
interface CollaborativeEvents {
  'participant:joined': (participant: Participant) => void;
  'participant:left': (participantId: string) => void;
  'response:updated': (participantId: string, response: Response) => void;
  'consensus:reached': (finalAnswer: Response) => void;
  'message:sent': (message: Message) => void;
  'question:next': (question: Question) => void;
}
```

### Collaboration Patterns

```scss
// Visual indicators for team synchronization
.participant-avatar {
  position: relative;
  
  // Status indicators
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
  }
  
  &--active::after {
    background: #00A651;
    animation: pulse 2s infinite;
  }
  
  &--thinking::after {
    background: #FFB000;
    animation: rotate 1s linear infinite;
  }
  
  &--complete::after {
    background: #00A651;
    &::before {
      content: '✓';
      color: white;
      font-size: 8px;
    }
  }
  
  &--disconnected::after {
    background: #6C757D;
  }
}

// Consensus visualization
.consensus-meter {
  height: 8px;
  background: #E2E8F0;
  border-radius: 4px;
  overflow: hidden;
  
  &__fill {
    height: 100%;
    background: linear-gradient(90deg, #DC3545 0%, #FFB000 50%, #00A651 100%);
    width: var(--consensus-percentage);
    transition: width 0.3s ease;
  }
}
```

---

## 📱 MOBILE-FIRST ADAPTATIONS

### Touch Gesture Library

```typescript
interface TouchGestures {
  // Drag-drop gestures
  dragDrop: {
    threshold: 10,  // pixels before drag starts
    feedback: 'haptic-light',
    preview: 'semi-transparent',
    scrollBehavior: 'edge-scroll'
  },
  
  // Decision tree navigation
  swipe: {
    horizontal: 'navigate-choices',
    vertical: 'scroll-content',
    diagonal: 'disabled'
  },
  
  // Timer interactions
  timerTap: {
    single: 'pause/resume',
    double: 'reset',
    long: 'show-settings'
  },
  
  // Collaborative features
  collaboration: {
    twoFingerTap: 'team-chat',
    pinch: 'zoom-overview',
    shake: 'request-help'
  }
}
```

### Performance Optimizations

```typescript
interface PerformanceTargets {
  // Animation performance
  animations: {
    fps: 60,
    useGPU: true,
    willChange: ['transform', 'opacity'],
    reduceMotion: respectUserPreference()
  },
  
  // Network optimization
  network: {
    cacheStrategy: 'offline-first',
    deltaSync: true,  // Only sync changes
    compression: 'gzip',
    reconnection: 'automatic'
  },
  
  // Memory management
  memory: {
    maxQuizSize: '5MB',
    imageOptimization: 'progressive',
    lazyLoading: true,
    gcStrategy: 'aggressive'
  }
}
```

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)
1. **Core Interaction Engine**
   - Touch gesture recognition system
   - Drag-drop physics engine
   - Timer synchronization service
   - WebSocket infrastructure

2. **Component Library Extension**
   - DraggableItem component
   - DropZone component
   - DecisionNode component
   - CollaborativeAvatar component

### Phase 2: Mechanic Implementation (Week 3-4)
1. **Drag-Drop Workflow**
   - Municipal workflow templates
   - Validation rule engine
   - Progress tracking system

2. **Decision Tree Navigation**
   - Tree visualization layouts
   - Path tracking algorithm
   - Consequence calculation

### Phase 3: Advanced Features (Week 5-6)
1. **Timed Challenges**
   - Crisis scenario library
   - Adaptive difficulty system
   - Performance analytics

2. **Collaborative System**
   - Real-time synchronization
   - Consensus algorithms
   - Team performance metrics

### Phase 4: Polish & Optimization (Week 7-8)
1. **Performance Tuning**
   - 60fps animations
   - <100ms interaction response
   - Offline capability

2. **Accessibility Enhancement**
   - Screen reader optimization
   - Keyboard navigation
   - High contrast modes

---

## 📊 SUCCESS METRICS

### Engagement Metrics
- **Interaction Rate:** >95% active participation
- **Completion Rate:** >85% finish advanced quizzes
- **Retry Rate:** >60% attempt challenges multiple times
- **Team Participation:** >90% contribute in collaborative mode

### Performance Metrics
- **Load Time:** <2s for complex mechanics
- **Interaction Response:** <100ms for all actions
- **Animation FPS:** Consistent 60fps
- **Network Resilience:** Full offline functionality

### Learning Outcomes
- **Skill Improvement:** 40% better performance after 3 attempts
- **Knowledge Retention:** 80% recall after 1 week
- **Practical Application:** 70% report using skills at work
- **Team Collaboration:** 90% improved team communication

---

## 🎨 DESIGN SYSTEM INTEGRATION

### Component Hierarchy
```
MunicipalQuizAdvanced/
├── DragDropQuiz/
│   ├── DraggableItem
│   ├── DropZone
│   └── WorkflowValidator
├── DecisionTreeQuiz/
│   ├── DecisionNode
│   ├── PathVisualizer
│   └── ConsequenceDisplay
├── TimedQuiz/
│   ├── CountdownTimer
│   ├── PriorityList
│   └── ResultsAnalysis
└── CollaborativeQuiz/
    ├── ParticipantList
    ├── ConsensusTracker
    └── TeamChat
```

---

## 🔗 DEVTEAM INTEGRATION

### Content Creation Templates

```json
{
  "advancedQuizTemplates": {
    "dragDrop": {
      "budgetAllocation": "pre-configured Swedish municipal budget",
      "documentFlow": "standard permit application workflow",
      "prioritization": "crisis response ordering"
    },
    "decisionTree": {
      "permitApproval": "building permit decision flow",
      "citizenService": "complaint resolution tree",
      "policyImplementation": "new regulation rollout"
    },
    "timedChallenge": {
      "crisisResponse": "emergency scenarios library",
      "dailyDeadlines": "routine task prioritization",
      "meetingPrep": "agenda preparation under pressure"
    },
    "collaborative": {
      "budgetNegotiation": "department budget discussions",
      "policyDrafting": "collaborative policy creation",
      "projectPlanning": "team project prioritization"
    }
  }
}
```

---

*"Interactive prototypes bridge imagination and implementation. When stakeholders can touch, drag, and experience the future, buy-in becomes enthusiasm."* - DigiNativa Design Philosophy