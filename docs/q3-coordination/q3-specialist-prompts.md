# Q3 Specialist Prompts - Self-Contained Execution
## Context-Efficient Prompts för Q3 Game Engine Evolution

**Usage:** Copy-paste these prompts exactly to specialists when triggered  
**Context:** All necessary information embedded - no external references needed  
**Reflection:** Natural reflection questions embedded för knowledge building  

---

## 🏗️ PHASE 1: SYSTEM ARCHITECT - MULTI-WORLD ARCHITECTURE

**Copy-paste this complete prompt to System Architect:**

```markdown
# Q3 Multi-World Game Architecture - System Architect Task

## CONTEXT & STRATEGIC VISION
Q3 Game Engine Evolution pivots från infrastructure scaling to enhanced game generation. You're designing technical architecture för:

**Core System:** Central World Hub Page + 5 Worlds per game + Unique Code Authentication + Advanced Scene Library + Stable Scoring

**Current Q2 Foundation (Build Upon):**
- Scene System: DialogueScene, QuizScene, Q2 Interactive (drag-drop, timed, narrative)
- Character System: Emotions, archetypes, relationships, cultural adaptation
- Game State: Save/load, session persistence, progress tracking
- Performance: <2s loading på municipal networks, Anna Svensson iPhone 12 optimization
- DevTeam Integration: AI content generation with municipal appropriateness

**Municipal Constraints (CRITICAL):**
- Anna Svensson <2s loading requirement maintained
- 256MB memory limit på municipal devices
- European compliance (GDPR, accessibility, government security)
- Q2 backwards compatibility - ALL existing functionality preserved

## YOUR TASK: MULTI-WORLD TECHNICAL ARCHITECTURE

### Design Requirements:
1. **Central World Hub Architecture**: Primary user interface för navigation, total score display, progress tracking
2. **5-World System**: Independent game modules containing existing Q2 scenes
3. **Game State Extension**: Multi-world progression within existing GameState framework
4. **DevTeam API Enhancement**: Multi-world content generation (backwards compatible)
5. **Performance Strategy**: Lazy loading, memory management, municipal network optimization

### Critical Success Criteria:
- All Q2 components work unchanged within world context
- Hub loads <1s, world transitions <2s
- Memory stays within 256MB municipal constraint
- DevTeam can generate both single-game AND multi-world content
- European localization extends naturally to world concepts

## DELIVERABLES:
1. **Technical Architecture Specification**: Hub + worlds relationship, component integration
2. **Game State Extension Design**: Multi-world progression within existing framework  
3. **DevTeam Integration Plan**: API enhancement för world-structured content
4. **Performance Strategy**: Loading, caching, memory management för municipal constraints
5. **Integration Interfaces**: Clear APIs för Game Designer UX och Test Engineer authentication

## REFLECTION QUESTIONS (Include in your response):
- What architectural decisions were most challenging och why?
- How does this design build upon Q2's strengths?
- What integration points are most critical för other specialists?
- Any municipal compliance considerations other specialists should know?

Begin your analysis focusing on leveraging Q2's proven foundation while enabling multi-world experiences.
```

---

## 🎨 PHASE 2: GAME DESIGNER - WORLD HUB UX DESIGN

**Copy-paste this complete prompt to Game Designer (after receiving System Architect output):**

```markdown
# Q3 World Hub UX Design - Game Designer Task

## CONTEXT & TECHNICAL FOUNDATION
[SYSTEM ARCHITECT CONTEXT WILL BE INSERTED HERE]

Building upon System Architect's multi-world architecture, you're designing the user experience för:

**Central World Hub Page:** Primary user interface where users see total score, track progress across 5 worlds, navigate between worlds

**Q2 UX Foundation (Extend):**
- Character-driven interactions with municipal contexts
- Achievement system with professional progression
- Cultural adaptation för Swedish, German, French, Dutch markets
- Accessibility compliance (WCAG 2.1 AA)
- Municipal appropriateness för government training

**User Journey Vision:**
1. User starts at World Hub Page (sees total score, world progress)
2. Selects and completes individual worlds (containing Q2 scenes)
3. Returns to hub after each world completion
4. Hub motivates completion av all worlds
5. Hub displays achievements och competitive elements (municipal appropriate)

## YOUR TASK: WORLD HUB UX DESIGN

### Design Requirements:
1. **Hub Interface Design**: Total score visualization, world progress tracking, intuitive navigation
2. **Multi-World User Journey**: Seamless flow between hub och worlds
3. **Motivation Design**: Hub encourages completion through appropriate competitive elements
4. **Cultural Adaptation**: Hub design appropriate för European municipal contexts
5. **Accessibility Design**: Universal design för all users och assistive technologies

### Municipal Appropriateness:
- Professional development focus maintained
- Competitive elements motivate without trivializing government training
- Cultural sensitivity across European markets
- Integration med existing Q2 achievement system

## DELIVERABLES:
1. **World Hub Page Design**: Interface layout, navigation patterns, score visualization
2. **Multi-World User Journey**: Complete user experience från hub through all worlds
3. **Cultural Adaptation Strategy**: Design variations för European markets
4. **Accessibility Compliance**: WCAG 2.1 AA specifications för hub experience
5. **Integration Requirements**: UX specifications för authentication och scene systems

## REFLECTION QUESTIONS (Include in your response):
- How does hub design build upon Q2's proven UX patterns?
- What cultural adaptations are most important för European markets?
- How does this UX support System Architect's technical architecture?
- What are critical integration points för Test Engineer authentication?

Begin your UX design focusing on creating engaging hub experience while maintaining municipal professionalism.
```

---

## 🔐 PHASE 3: TEST ENGINEER - AUTHENTICATION SYSTEM

**Copy-paste this complete prompt to Test Engineer (after receiving previous outputs):**

```markdown
# Q3 Authentication & Score Persistence - Test Engineer Task

## CONTEXT & FOUNDATION
[SYSTEM ARCHITECT AND UX DESIGNER CONTEXT WILL BE INSERTED HERE]

Building upon technical architecture och UX design, you're designing authentication för:

**Unique Code Authentication:** Passwordless access med multi-world score persistence, cross-device compatibility

**Current Q2 Security (Build Upon):**
- Municipal SSO integration (SAML)
- GDPR compliance with minimal data collection
- Game state persistence across sessions
- European compliance (Swedish, German, French, Dutch requirements)

**Integration Requirements:**
- Work seamlessly med World Hub Page UX design
- Support multi-world score accumulation from System Architect's design
- Maintain municipal compliance across European markets
- Compatible med existing Q2 authentication where needed

## YOUR TASK: AUTHENTICATION & SCORE PERSISTENCE

### Design Requirements:
1. **Unique Code System**: 8-character codes för easy manual entry, collision avoidance
2. **Score Persistence**: Multi-world score tracking, high score tables (municipal appropriate)  
3. **Session Management**: Cross-device sync, automatic save, session recovery
4. **Municipal Integration**: Compatible med existing SAML, GDPR compliant
5. **European Compliance**: Privacy requirements across all target markets

### Critical Success Criteria:
- <1s authentication speed för immediate access
- <2s cross-device synchronization
- Anonymous by design för GDPR compliance
- Municipal-appropriate security för training context
- Integration med UX hub design och technical architecture

## DELIVERABLES:
1. **Authentication System Design**: Code generation, validation, security framework
2. **Score Persistence Architecture**: Multi-world scoring, high score tables, data protection
3. **Session Management Framework**: Cross-device sync, auto-save, recovery procedures
4. **Municipal Compliance Validation**: GDPR, government security, European requirements
5. **Integration Testing Strategy**: Compatibility med architecture och UX components

## REFLECTION QUESTIONS (Include in your response):
- How does authentication design complement UX och technical architecture?
- What are key municipal compliance considerations för other specialists?
- How does this system build upon Q2's proven security patterns?
- What performance optimizations are most critical för municipal users?

Begin your authentication design focusing on simplicity och security while supporting multi-world progression.
```

---

## 🎮 PHASE 4: GAME DESIGNER - ADVANCED SCENE SUPPORT

**Copy-paste this complete prompt to Game Designer (after receiving all previous outputs):**

```markdown
# Q3 Advanced Scene Support & Stable Scoring - Game Designer Task

## CONTEXT & COMPLETE FOUNDATION
[ALL PREVIOUS SPECIALIST CONTEXT WILL BE INSERTED HERE]

Building upon complete system architecture, UX design, och authentication system, you're enhancing content för:

**Advanced Scene Library:** Expanded scene types beyond DialogueScene/QuizScene/Q2Interactive
**Stable Scoring:** Consistent scoring across all content types för fair multi-world progression

**Current Q2 Content (Extend):**
- DialogueScene: Character-driven municipal conversations
- QuizScene: Professional knowledge validation
- Q2 Interactive: Drag-drop workflows, timed challenges, branching narratives
- Municipal appropriateness across European contexts
- Integration med character emotions, archetypes, achievements

**Integration Context:**
- Technical architecture supports advanced scenes within world framework
- UX design requires consistent scoring för hub visualization
- Authentication system persists advanced scene progress across worlds
- All enhancements must maintain Q2 backwards compatibility

## YOUR TASK: ADVANCED SCENE SUPPORT & STABLE SCORING

### Design Requirements:
1. **Scene Library Expansion**: New scene types för richer municipal training content
2. **Stable Scoring Algorithm**: Fair scoring across all scene types och content complexity
3. **Multi-World Integration**: Scene progression supporting world completion criteria
4. **AI Content Enhancement**: DevTeam generation för advanced scene types
5. **Cultural Intelligence**: European adaptation för expanded content variety

### Municipal Context:
- Professional development focus maintained through content expansion
- Scene variety supports diverse municipal training scenarios
- Scoring motivates without trivializing government training
- Cultural adaptation appropriate för European municipal contexts

## DELIVERABLES:
1. **Advanced Scene Library**: New scene type specifications för municipal training
2. **Stable Scoring Algorithm**: Cross-content scoring consistency framework
3. **Multi-World Scene Integration**: Scene progression within world completion
4. **AI Content Generation Enhancement**: DevTeam integration för advanced scenes
5. **Cultural Adaptation Framework**: European appropriateness för expanded content

## REFLECTION QUESTIONS (Include in your response):
- How do advanced scenes build upon Q2's proven content patterns?
- How does stable scoring support the complete multi-world system?
- What are key integration points med technical architecture och authentication?
- What cultural considerations are most important för advanced content?

Begin your content enhancement focusing on enriching municipal training while maintaining professional standards.
```

---

## 🔗 PHASE 5: INTEGRATION VALIDATION

**Integration validation performed by Head Developer using all specialist outputs to ensure complete system compatibility.**

---

**These self-contained prompts eliminate context fragmentation och enable efficient specialist coordination while building collective knowledge through embedded reflection.**