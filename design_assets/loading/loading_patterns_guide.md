# Loading States & Skeleton Screens - Design Patterns Guide
## Optimized for Anna Svensson's 3-Second Patience Window

**Created:** 2025-01-16  
**Target Persona:** Anna Svensson - 45-årig kommunal administratör  
**Design Principle:** Perceived performance over actual performance  
**Key Constraint:** 3-second maximum patience before frustration  

---

## Executive Summary

This guide defines loading patterns that respect Anna Svensson's limited patience and busy municipal work environment. Every loading state is designed with the understanding that Anna may be interrupted, multitasking, or using her iPhone 12 during a short break.

**Core Philosophy:** Show something useful immediately, then progressively enhance.

---

## 1. Anna Svensson Loading Psychology

### 1.1 Context Analysis

**Anna's Typical Loading Scenarios:**
- **Morning rush:** Quick training session before meetings start (7:45-8:00 AM)
- **Lunch break:** 20-minute window for completing modules (12:00-12:20 PM)  
- **End of day:** Catching up on assignments before leaving (16:45-17:00 PM)
- **Mobile moments:** Waiting for meetings, on public transport, coffee breaks

**Patience Factors:**
- **Government system expectations:** "Systems can be slow, but should work"
- **Mobile context:** "If it doesn't load quickly, I'll do it later at my desk"
- **Interruption likelihood:** High - phone calls, colleague questions, urgent emails
- **Task switching:** Anna often juggles multiple responsibilities

### 1.2 Optimization Strategy

**Immediate Gratification (0-100ms):**
- Visual feedback that something is happening
- Familiar interface structure appears instantly
- Progress indication starts immediately

**Content Preview (100ms-500ms):**
- Essential content structure becomes visible
- Navigation elements are functional
- Anna can start reading/processing information

**Progressive Enhancement (500ms-2s):**
- Full content and interactions load
- Visual polish and animations complete
- Anna can complete intended actions

**Emergency Measures (2s+):**
- Clear explanation of delay
- Options to continue offline or try later
- Preservation of any progress made

---

## 2. Scene-Specific Loading Patterns

### 2.1 DialogueScene Loading

**Challenge:** Anna needs to quickly understand the conversation context and characters.

**Solution - Progressive Content Reveal:**

```
Phase 1 (0-100ms): Structure Skeleton
┌─────────────────────────────────────┐
│ [●] Malmö Stad Utbildning          │ ← Header loads instantly
├─────────────────────────────────────┤
│ ○ [████████████████████████]       │ ← Character placeholder
│   [██████████████████████████████] │ ← Speech bubble skeleton  
│   [████████████████████]           │
│                                     │
│ [████████████████] [████████████]   │ ← Choice button skeletons
│ [████████████████████]              │
└─────────────────────────────────────┘

Phase 2 (100-300ms): Content Preview
┌─────────────────────────────────────┐
│ [●] GDPR-utbildning för kommunen    │ ← Topic title appears
├─────────────────────────────────────┤
│ 👤 Anna Karlsson, Dataskyddsombud   │ ← Character info loads
│   "Hej Anna! Idag ska vi gå..."     │ ← First dialogue text
│   [██████████████████████████████] │ ← Rest still loading
│                                     │
│ [████████████████] [████████████]   │ ← Choices still loading
│ [████████████████████]              │
└─────────────────────────────────────┘

Phase 3 (300-800ms): Full Interaction
┌─────────────────────────────────────┐
│ [●] GDPR-utbildning för kommunen    │
├─────────────────────────────────────┤
│ 👤 Anna Karlsson, Dataskyddsombud   │
│   "Hej Anna! Idag ska vi gå igenom  │ ← Complete dialogue
│   de viktigaste GDPR-reglerna som   │
│   påverkar ditt dagliga arbete."    │
│                                     │
│ ▶ Berätta om personuppgiftshantering│ ← Interactive choices
│ ▶ Vad händer vid regelbrott?        │
└─────────────────────────────────────┘
```

**Anna-Specific Optimizations:**
- **Topic preview:** Anna knows immediately if this is relevant to her current needs
- **Character familiarity:** Municipal context clearly established from first frame
- **Reading time:** Anna can start processing dialogue before all choices are loaded

### 2.2 QuizScene Loading

**Challenge:** Anna wants to understand the question and start thinking about the answer immediately.

**Solution - Question-First Strategy:**

```
Phase 1 (0-150ms): Question Structure
┌─────────────────────────────────────┐
│ Fråga 3 av 5                        │ ← Progress context
├─────────────────────────────────────┤
│ [██████████████████████████████]    │ ← Question skeleton
│ [████████████████████]              │
│                                     │
│ ○ [████████████████████████████]    │ ← Answer skeletons
│ ○ [██████████████████]              │
│ ○ [████████████████████████]        │
│ ○ [██████████████]                  │
└─────────────────────────────────────┘

Phase 2 (150-400ms): Question Content
┌─────────────────────────────────────┐
│ Fråga 3 av 5 - GDPR Grundprinciper  │
├─────────────────────────────────────┤
│ Vilken är den viktigaste grund-      │ ← Question text loads first
│ principen inom GDPR för kommunal     │
│ verksamhet?                          │
│                                     │
│ ○ [████████████████████████████]    │ ← Answers still loading
│ ○ [██████████████████]              │
│ ○ [████████████████████████]        │
│ ○ [██████████████]                  │
└─────────────────────────────────────┘

Phase 3 (400-700ms): Complete Interaction
┌─────────────────────────────────────┐
│ Fråga 3 av 5 - GDPR Grundprinciper  │
├─────────────────────────────────────┤
│ Vilken är den viktigaste grund-      │
│ principen inom GDPR för kommunal     │
│ verksamhet?                          │
│                                     │
│ ○ Samtycke krävs alltid             │ ← All answers interactive
│ ○ Laglig, rättvis och transparent   │
│ ○ Personuppgifter raderas efter 1 år│
│ ○ Endast chefer får hantera data    │
└─────────────────────────────────────┘
```

**Anna-Specific Benefits:**
- **Immediate comprehension:** Anna can read and think about the question while answers load
- **Progress awareness:** Clear indication of remaining questions helps with time management
- **Topic context:** Subject area helps Anna activate relevant knowledge

### 2.3 AssessmentScene Loading

**Challenge:** Anna wants to see her results and achievements quickly to feel accomplished.

**Solution - Celebration-Focused Loading:**

```
Phase 1 (0-200ms): Achievement Framework
┌─────────────────────────────────────┐
│ Grattis! Utbildning genomförd ✓     │ ← Success message instant
├─────────────────────────────────────┤
│          ┌─────────────┐            │ ← Score circle skeleton
│          │     ⟲       │            │
│          │             │            │
│          └─────────────┘            │
│                                     │
│ ⚪ [██████] ⚪ [██████] ⚪ [██████]    │ ← Achievement placeholders
│                                     │
│ [████████████ CERTIFIKAT ████████]  │ ← Certificate preview
└─────────────────────────────────────┘

Phase 2 (200-600ms): Score Revelation
┌─────────────────────────────────────┐
│ Grattis! GDPR-utbildning genomförd ✓│
├─────────────────────────────────────┤
│          ┌─────────────┐            │
│          │     92%     │            │ ← Score animates in
│          │   Utmärkt   │            │
│          └─────────────┘            │
│                                     │
│ 🏆 [██████] 🎯 [██████] ⭐ [██████]   │ ← Achievement icons load
│                                     │
│ [████████████ CERTIFIKAT ████████]  │
└─────────────────────────────────────┘

Phase 3 (600-1000ms): Full Achievement Display
┌─────────────────────────────────────┐
│ Grattis! GDPR-utbildning genomförd ✓│
├─────────────────────────────────────┤
│          ┌─────────────┐            │
│          │     92%     │            │
│          │   Utmärkt   │            │
│          └─────────────┘            │
│                                     │
│ 🏆 GDPR Expert  🎯 Snabb Lärare      │ ← Achievement details
│ ⭐ Första Certifikat                 │
│                                     │
│ 📄 Ladda ner ditt certifikat        │ ← Interactive certificate
└─────────────────────────────────────┘
```

**Anna-Specific Motivation:**
- **Immediate success:** Anna feels accomplished before all details load
- **Progressive revelation:** Building excitement with each loading phase
- **Practical value:** Certificate download available as soon as possible

---

## 3. Error State Design for Municipal Context

### 3.1 Network Connection Issues

**Anna's Context:** Municipal networks can be unreliable, especially on mobile devices or in certain building areas.

**Design Solution - Reassuring & Actionable:**

```
Connection Error State:
┌─────────────────────────────────────┐
│        📶❌ Anslutningsproblem        │
│                                     │
│ Anslutningen till utbildnings-      │
│ plattformen har tappats.            │
│                                     │
│ Din progress är sparad och kommer   │
│ att synkroniseras när anslutningen  │
│ återställs.                         │
│                                     │
│ ┌─────────────┐ ┌─────────────────┐ │
│ │ Försök igen │ │ Fortsätt offline│ │
│ └─────────────┘ └─────────────────┘ │
│                                     │
│ 💡 Tips: Kontrollera WiFi eller     │
│    prova från en annan plats        │
└─────────────────────────────────────┘
```

**Key Design Principles:**
- **Blame-free:** Not Anna's fault, technical issue
- **Progress preservation:** Anna's work is safe
- **Multiple options:** Anna can choose how to proceed
- **Helpful guidance:** Practical troubleshooting tips

### 3.2 Slow Loading (2+ seconds)

**Anna's Context:** When loading takes longer than expected, Anna needs to understand why and what her options are.

**Design Solution - Transparent Communication:**

```
Extended Loading State:
┌─────────────────────────────────────┐
│ ⏳ Laddar GDPR-utbildning...         │
│                                     │
│ ▓▓▓▓▓▓▓▓░░░░ 65%                    │
│                                     │
│ Anslutningen verkar långsam idag.   │
│ Vi fortsätter att ladda innehållet. │
│                                     │
│ ✓ Dina svar är sparade              │
│ ⏳ Hämtar interaktivt innehåll      │
│ ⏳ Laddar mediaresurser              │
│                                     │
│ ┌─────────────────┐ ┌─────────────┐ │
│ │ Fortsätt vänta  │ │ Försök senare│ │
│ └─────────────────┘ └─────────────┘ │
└─────────────────────────────────────┘
```

**Anna-Specific Features:**
- **Transparent progress:** Anna knows exactly what's happening
- **Time estimation:** Realistic expectation setting
- **Choice preservation:** Anna can leave and return safely
- **Clear options:** Multiple ways to proceed

---

## 4. Mobile-Specific Loading Optimizations

### 4.1 iPhone 12 Touch Response

**Challenge:** Anna uses her iPhone 12 for training during breaks and needs immediate touch feedback.

**Solution - Haptic + Visual Feedback:**

```javascript
// Touch Interaction Pattern
onTouchStart = () => {
  // Immediate haptic feedback (if available)
  navigator.vibrate && navigator.vibrate(10);
  
  // Immediate visual feedback
  setButtonPressed(true);
  
  // Show loading state
  setIsLoading(true);
}

onTouchEnd = () => {
  // Reset visual state
  setButtonPressed(false);
  
  // Continue with actual action
  performAction();
}
```

**Visual Design:**
- **Touch feedback:** Immediate color/scale change on touch
- **Loading indicator:** Small spinner appears within 100ms
- **Progress preservation:** Touch area remains stable during loading

### 4.2 Battery Conservation

**Challenge:** Anna's phone battery needs to last the full workday.

**Solution - Efficient Animation Strategy:**

**High Battery (>50%):**
- Full skeleton animations with shimmer effects
- Smooth transitions and micro-interactions
- Complete visual feedback system

**Medium Battery (20-50%):**
- Simplified animations (pulse instead of shimmer)
- Reduced animation frequency
- Essential feedback only

**Low Battery (<20%):**
- Static loading indicators
- Minimal animations (fade in/out only)
- Focus on content over visual effects

---

## 5. Accessibility Implementation

### 5.1 Screen Reader Support

**Loading State Announcements:**
```html
<!-- Live region for loading updates -->
<div aria-live="polite" aria-atomic="false" class="sr-only">
  <span id="loading-status">Laddar GDPR-utbildning</span>
</div>

<!-- Progress indicator with proper labeling -->
<div role="progressbar" 
     aria-valuenow="65" 
     aria-valuemin="0" 
     aria-valuemax="100"
     aria-labelledby="loading-status"
     aria-describedby="loading-description">
  <div id="loading-description" class="sr-only">
    Laddar interaktivt innehåll, 65 procent klart
  </div>
</div>
```

**Key Accessibility Features:**
- **Polite announcements:** Don't interrupt Anna's screen reader flow
- **Progress description:** Clear understanding of what's happening
- **Skip options:** Way to bypass loading areas if needed

### 5.2 Keyboard Navigation

**Focus Management During Loading:**
```javascript
// Preserve focus context through loading states
const useLoadingFocus = () => {
  const [focusedElement, setFocusedElement] = useState(null);
  
  useEffect(() => {
    if (isLoading) {
      // Save current focus
      setFocusedElement(document.activeElement);
      
      // Move focus to loading indicator
      loadingIndicator.current?.focus();
    } else {
      // Restore previous focus
      focusedElement?.focus();
    }
  }, [isLoading]);
};
```

**Navigation Features:**
- **Focus preservation:** Anna doesn't lose her place
- **Skip links:** Bypass loading areas
- **Escape hatch:** Cancel loading when possible

---

## 6. Performance Specifications

### 6.1 Loading Time Targets

**Critical Performance Metrics:**

| Metric | Target | Anna's Experience |
|--------|--------|-------------------|
| First Paint | <100ms | "Something is happening" |
| First Contentful Paint | <300ms | "I can see the content structure" |
| First Meaningful Paint | <800ms | "I can start reading/interacting" |
| Time to Interactive | <1.5s | "I can complete my task" |
| Perceived Load Time | <2s | "This feels fast enough" |

### 6.2 Network Condition Adaptation

**Connection Quality Detection:**
```javascript
// Adapt loading strategy based on connection
const useNetworkAdaptation = () => {
  const connection = navigator.connection;
  
  if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
    return 'minimal'; // Text-only, no animations
  } else if (connection?.effectiveType === '3g') {
    return 'reduced'; // Basic animations, progressive enhancement
  } else {
    return 'full'; // Complete experience
  }
};
```

**Adaptation Strategy:**
- **Slow connections:** Essential content first, minimal animations
- **Fast connections:** Full visual experience with all enhancements
- **Variable connections:** Dynamic adjustment based on performance

---

## 7. Testing & Validation

### 7.1 Anna Svensson User Testing

**Test Scenarios:**
1. **Morning rush test:** Can Anna complete a quick check-in during busy morning?
2. **Interruption test:** What happens when Anna gets a phone call during loading?
3. **Mobile network test:** How does the experience work on municipal mobile network?
4. **Patience test:** At what point does Anna consider abandoning the task?

**Success Criteria:**
- 90% of users wait through 2-second loading
- 95% success rate for error recovery
- No complaints about "slow" performance under 1.5 seconds
- Positive feedback on loading transparency

### 7.2 Performance Testing

**Automated Testing:**
```javascript
// Jest test for loading performance
describe('Loading Performance', () => {
  test('shows content within 300ms', async () => {
    const startTime = performance.now();
    render(<DialogueScene />);
    
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
    
    const loadTime = performance.now() - startTime;
    expect(loadTime).toBeLessThan(300);
  });
});
```

**Monitoring Metrics:**
- Real User Monitoring (RUM) for actual Anna Svensson experiences
- Synthetic testing from various network conditions
- Error rate monitoring for loading failures
- Abandonment rate tracking for long loads

---

## 8. Implementation Checklist

### 8.1 Developer Handoff

**Required Deliverables:**
- [ ] Component specifications with exact timing
- [ ] Animation keyframes and CSS transitions
- [ ] Error message copy in Swedish
- [ ] Accessibility testing requirements
- [ ] Performance budget definitions

**Chakra UI Integration:**
- [ ] Extended Skeleton component with custom variants
- [ ] Custom Progress component with Anna-specific styling
- [ ] Error Alert components with municipal branding
- [ ] Loading state hooks and context providers

### 8.2 Quality Assurance

**Testing Requirements:**
- [ ] Test on iPhone 12 with various battery levels
- [ ] Validate on municipal network conditions
- [ ] Screen reader testing with NVDA and VoiceOver
- [ ] Keyboard navigation validation
- [ ] Performance testing with Lighthouse
- [ ] Real user testing with municipal employees

---

## Conclusion

These loading patterns are specifically crafted for Anna Svensson's work environment and usage patterns. Every design decision prioritizes her limited time, potential interruptions, and need for reliable, transparent system behavior.

The key to success is **progressive enhancement** - showing useful content immediately and building the complete experience over time, while always providing clear feedback about what's happening and what Anna can expect.

**Next Steps:**
1. Developer implementation with Chakra UI integration
2. Performance testing on target devices and networks
3. User testing with actual municipal employees
4. Iterative refinement based on real usage data

*This loading system positions DigiNativa as a platform that truly understands and respects the busy municipal worker's time and context.*