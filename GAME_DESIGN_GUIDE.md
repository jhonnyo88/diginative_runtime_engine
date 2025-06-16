# Game Design Guide - DigiNativa Runtime Engine 🎨

**Creating Engaging Educational Experiences for Swedish Public Sector**

This guide enables non-technical content creators to design compelling, accessible educational games using the DigiNativa Runtime Engine.

---

## 🎯 Design Philosophy: Anna-First

### **Meet Anna Svensson - Your Primary User**
- **Role**: Municipal Administrator, Malmö Municipality
- **Age**: 45, experienced public sector professional
- **Context**: Busy schedule, mobile-first, policy-focused learning needs
- **Goal**: Practical knowledge she can apply immediately in her work

### **Anna's Learning Journey Principles**
1. **Respect for Time**: 7-minute maximum sessions
2. **Practical Focus**: Every scenario connects to real work situations
3. **Immediate Application**: Knowledge usable within 24 hours
4. **Professional Tone**: Appropriate for experienced administrators
5. **Mobile Accessibility**: Perfect experience on iPhone during lunch break

---

## 🏗️ Game Structure Framework

### **Universal Game Architecture**
```
🎮 Educational Game Structure:
├── 📖 Introduction (1 minute)
├── 🎭 Interactive Scenarios (4-5 minutes)
├── 📝 Knowledge Check (1 minute)
└── 📋 Resources & Next Steps (1 minute)
```

### **Scene Types Available**

#### **1. DialogueScene - Narrative Learning**
**Purpose**: Present complex policy through character interactions
**Duration**: 1-2 minutes per scene
**Anna's Value**: See policy applied in realistic municipal contexts

```json
{
  "type": "dialogue",
  "title": "Digitalisering med Medborgarperspektiv",
  "characters": [
    {
      "name": "Anna",
      "role": "Kommunal förvaltare",
      "avatar": "anna-municipal"
    },
    {
      "name": "Erik",
      "role": "IT-chef",
      "avatar": "erik-it"
    }
  ],
  "dialogue": [
    {
      "speaker": "Anna",
      "text": "Vi behöver implementera den nya digitaliseringsstrategin, men hur påverkar det våra medborgares integritet?"
    }
  ]
}
```

#### **2. QuizScene - Knowledge Application**
**Purpose**: Test understanding through realistic scenarios
**Duration**: 30-60 seconds per question
**Anna's Value**: Validate knowledge before applying at work

```json
{
  "type": "quiz",
  "title": "Strategisk Implementering",
  "question": "En medborgare begär utdrag från alla digitala system. Enligt digitaliseringsstrategin, vad är din första åtgärd?",
  "options": [
    {
      "text": "Samla all data från samtliga system omedelbart",
      "correct": false,
      "feedback": "Detta kan bryta mot GDPR-principen om proportionalitet."
    },
    {
      "text": "Bedöm vilken data som är relevant för begäran",
      "correct": true,
      "feedback": "Korrekt! Strategin betonar proportionalitet och relevans."
    }
  ]
}
```

#### **3. AssessmentScene - Competency Validation**
**Purpose**: Certify learning completion and readiness
**Duration**: 2-3 minutes
**Anna's Value**: Documentation for professional development

#### **4. ResourceScene - Reference Materials**
**Purpose**: Provide downloadable policies and implementation guides
**Duration**: As needed
**Anna's Value**: Quick access to official documents during real work

---

## 🎨 Visual Design Guidelines

### **DigiNativa Brand Identity**
- **Colors**: Swedish government accessibility palette
  - Primary: `#0A3161` (Dark Blue)
  - Secondary: `#1E88E5` (Light Blue)  
  - Success: `#2E7D32` (Green)
  - Warning: `#F57C00` (Orange)
  - Text: `#212121` (Dark Gray)

- **Typography**: 
  - Headers: `Inter Bold` (Swedish government standard)
  - Body: `Inter Regular` 
  - Minimum size: 16px (mobile accessibility)

- **Accessibility Standards**:
  - Contrast ratio: 4.5:1 minimum (WCAG AA)
  - Focus indicators: 3px blue outline
  - Touch targets: 44px minimum

### **Mobile-First Design Principles**
```
📱 Anna's iPhone 12 Experience:
├── Single-column layout
├── Large touch targets (44px+)
├── Clear navigation breadcrumbs
├── Offline capability for content
└── Portrait orientation optimized
```

---

## 🎭 Scenario Design Best Practices

### **1. Realistic Municipal Context**
**DO**: Base scenarios on actual Swedish municipal work
- Policy implementation meetings
- Citizen service interactions  
- Inter-departmental collaboration
- Digital transformation challenges

**DON'T**: Create generic business scenarios
- Abstract theoretical examples
- Private sector contexts
- Non-Swedish legal frameworks

### **2. Character Development**
**Anna-Compatible Characters**:
- **Municipal colleagues**: IT managers, department heads, legal advisors
- **Citizens**: Diverse ages, digital literacy levels, accessibility needs
- **Regional partners**: County administrators, other municipalities

**Character Authenticity**:
- Swedish names and cultural context
- Realistic job titles and responsibilities
- Age-appropriate technology comfort levels
- Municipal hierarchy awareness

### **3. Decision Point Design**
**Effective Choices**:
- 2-3 options maximum (mobile screen space)
- Clear consequences for each choice
- Real-world applicability
- Legal/policy compliance implications

**Choice Quality Criteria**:
```
✅ Good Choice:
"How should Anna prioritize citizen data requests under the new digital strategy?"
A) Process requests in order received
B) Prioritize by complexity level  
C) Focus on strategic impact first

❌ Poor Choice:
"What should Anna do?"
A) Something
B) Something else
C) Another thing
```

---

## 📊 Learning Objectives Framework

### **Bloom's Taxonomy for Public Sector**
1. **Remember**: Key policy principles and legal requirements
2. **Understand**: How strategies apply to municipal context
3. **Apply**: Use knowledge in realistic work scenarios
4. **Analyze**: Evaluate implementation challenges and solutions
5. **Evaluate**: Assess policy effectiveness and citizen impact
6. **Create**: Develop municipal-specific implementation plans

### **Assessment Criteria Alignment**
Each game must enable Anna to:
- **Explain** the strategy to colleagues
- **Apply** principles in daily work
- **Identify** implementation challenges
- **Recommend** solutions to leadership
- **Document** compliance and progress

---

## 🚀 Content Creation Workflow

### **Step 1: Strategy Analysis (1 day)**
1. Read source strategy document thoroughly
2. Identify 3-5 key learning objectives
3. Map to Anna's daily work scenarios
4. Define success criteria for application

### **Step 2: Scenario Development (2 days)**
1. Create realistic municipal context
2. Develop authentic character interactions
3. Design meaningful decision points
4. Write immediate feedback and explanations

### **Step 3: Assessment Design (1 day)**
1. Create knowledge validation questions
2. Develop practical application scenarios
3. Define certification criteria
4. Compile reference resources

### **Step 4: JSON Manifest Creation (1 day)**
1. Structure content using engine schema
2. Validate accessibility requirements
3. Test mobile responsiveness
4. Review with Anna persona checklist

---

## 🔍 Quality Assurance Checklist

### **Anna Svensson Validation**
- [ ] **Time Respect**: Completable in 7 minutes or less
- [ ] **Mobile Perfect**: Excellent experience on iPhone 12
- [ ] **Work Relevant**: Directly applicable to municipal administration
- [ ] **Professionally Appropriate**: Tone suitable for experienced administrators
- [ ] **Actionable Knowledge**: Immediately usable insights

### **Accessibility Compliance**
- [ ] **WCAG 2.1 AA**: All content meets accessibility standards
- [ ] **Keyboard Navigation**: Complete game playable without mouse
- [ ] **Screen Reader**: Perfect semantic markup and ARIA labels
- [ ] **Color Contrast**: 4.5:1 ratio minimum for all text
- [ ] **Focus Management**: Clear visual indicators for interactive elements

### **Content Quality Standards**
- [ ] **Swedish Context**: Accurate legal and cultural references
- [ ] **Policy Alignment**: Faithful to source strategy documents
- [ ] **Realistic Scenarios**: Based on actual municipal challenges
- [ ] **Clear Outcomes**: Measurable learning objectives achieved
- [ ] **Engagement Quality**: Maintains interest throughout experience

---

## 📋 Example: Sweden Digital Strategy Game

### **Game Structure Overview**
```json
{
  "gameId": "sweden-digital-strategy-2025",
  "metadata": {
    "title": "Sveriges Digitaliseringsstrategi - Praktisk Implementering",
    "description": "Lär dig implementera digitaliseringsstrategin i din kommun",
    "duration": "7 minuter",
    "targetAudience": "Kommunala förvaltare",
    "learningObjectives": [
      "Förstå strategins fem prioriteringsområden",
      "Tillämpa principer i kommunal verksamhet",
      "Identifiera implementeringsutmaningar",
      "Utveckla handlingsplaner för din avdelning"
    ]
  }
}
```

### **Scene Flow Example**
1. **Introduction**: Anna receives strategy implementation assignment
2. **Dialogue**: Discussion with IT manager about citizen service digitalization
3. **Quiz**: Test understanding of data sovereignty principles
4. **Scenario**: Handle citizen request for digital service access
5. **Assessment**: Demonstrate strategy application readiness
6. **Resources**: Download implementation templates and legal guidelines

---

## 🎯 Success Metrics for Game Designers

### **Engagement Quality**
- **Completion Rate**: 85%+ users finish entire game
- **Return Rate**: 60%+ users access resources after completion
- **Application Rate**: 70%+ users report applying knowledge within 1 week

### **Learning Effectiveness**
- **Knowledge Retention**: 80%+ correct answers on follow-up assessment (1 month)
- **Confidence Increase**: 50%+ improvement in self-reported strategy confidence
- **Implementation Success**: 75%+ users successfully implement at least one strategy element

### **Anna Satisfaction**
- **Time Efficiency**: Rated 4.5+ stars for respecting time constraints
- **Relevance**: 90%+ agree content directly applies to their work
- **Professionalism**: 95%+ rate tone as appropriate for municipal context

---

**Design games that transform Swedish municipal administration through engaging, accessible, and immediately applicable digital learning experiences.**

🎨 **Create. Engage. Transform. 🇸🇪**