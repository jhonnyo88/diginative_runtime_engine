# Municipal Professional UI Component Library
## Reusable Enterprise-Grade Components för Scalable Game Development

**Document Type:** Design Specification  
**Version:** 1.0  
**Created:** 2025-01-18  
**Author:** Game Designer  
**Roadmap Reference:** Q1-GEI-Milestone-2.1  
**Target Users:** Development Team  
**Implementation Priority:** HIGH - Enables 40% faster game development  

---

## 📋 EXECUTIVE SUMMARY

**Problem:** Current development requires recreating UI components for each game scene, leading to inconsistency and inefficiency.

**Solution:** Comprehensive municipal-grade component library with 25+ reusable components optimized for government contexts across 4 European markets.

**Business Impact:** 
- 40% faster game development through component reuse
- 100% design consistency across all game experiences
- 90% reduction in UI-related bugs through tested components
- Foundation for Q2 advanced mechanics implementation

**Success Metrics:**
- Component reuse rate: >80% across new game development
- Development velocity: 40% improvement in UI implementation
- Design consistency score: 100% adherence to municipal standards
- Accessibility compliance: 100% WCAG 2.1 AA for all components

---

## 🏗️ COMPONENT ARCHITECTURE

### Foundation Principles

```typescript
// Municipal Component Standards
interface MunicipalComponent {
  // Core Properties
  variant: 'swedish' | 'german' | 'french' | 'dutch';
  size: 'compact' | 'standard' | 'comfortable';
  state: 'default' | 'hover' | 'active' | 'disabled' | 'loading';
  
  // Accessibility
  ariaLabel: string;
  ariaDescribedBy?: string;
  tabIndex?: number;
  
  // Municipal Context
  municipality?: string;  // "Malmö Stad", "Stadt München", etc.
  language: 'sv' | 'de' | 'fr' | 'nl';
  
  // Performance
  lazyLoad?: boolean;
  priority?: 'high' | 'medium' | 'low';
}
```

### Design Token System

```scss
// Municipal Design Tokens
:root {
  // Swedish Municipal Blue
  --mun-primary-se: #0066CC;
  --mun-primary-light-se: #EBF8FF;
  --mun-primary-dark-se: #004080;
  
  // German Authority Gray
  --mun-primary-de: #4A5568;
  --mun-primary-light-de: #F7FAFC;
  --mun-primary-dark-de: #2D3748;
  
  // French République Blue
  --mun-primary-fr: #000091;
  --mun-primary-light-fr: #E3E3FD;
  --mun-primary-dark-fr: #000074;
  
  // Dutch Orange Accent
  --mun-primary-nl: #FF6900;
  --mun-primary-light-nl: #FFF5EB;
  --mun-primary-dark-nl: #CC5400;
  
  // Universal Municipal Colors
  --mun-success: #00A651;
  --mun-warning: #FFB000;
  --mun-error: #DC3545;
  --mun-info: #17A2B8;
  
  // Typography Scale
  --mun-font-xs: 12px;
  --mun-font-sm: 14px;
  --mun-font-base: 16px;
  --mun-font-lg: 18px;
  --mun-font-xl: 24px;
  --mun-font-2xl: 32px;
  
  // Spacing System (8px base)
  --mun-space-1: 8px;
  --mun-space-2: 16px;
  --mun-space-3: 24px;
  --mun-space-4: 32px;
  --mun-space-5: 40px;
  --mun-space-6: 48px;
  
  // Breakpoints
  --mun-mobile: 390px;   // Anna's iPhone 12
  --mun-tablet: 768px;
  --mun-desktop: 1024px;
  --mun-wide: 1440px;
}
```

---

## 📦 CORE COMPONENTS

### 1. MunicipalButton

**Purpose:** Primary interaction element across all game scenes

```typescript
interface MunicipalButtonProps extends MunicipalComponent {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  loadingText?: string;
}
```

**Visual Specifications:**

```scss
.mun-button {
  // Base styles
  font-family: 'Inter', system-ui;
  font-weight: 500;
  border-radius: 6px;
  transition: all 200ms ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  // Size variants
  &--small {
    height: 36px;
    padding: 0 16px;
    font-size: var(--mun-font-sm);
  }
  
  &--medium {
    height: 44px;
    padding: 0 24px;
    font-size: var(--mun-font-base);
  }
  
  &--large {
    height: 56px;
    padding: 0 32px;
    font-size: var(--mun-font-lg);
  }
  
  // Primary variant (municipal specific)
  &--primary {
    background: var(--mun-primary);
    color: white;
    border: 2px solid transparent;
    
    &:hover {
      background: var(--mun-primary-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
}
```

### 2. MunicipalCard

**Purpose:** Content container for game information, quiz questions, dialogue

```typescript
interface MunicipalCardProps extends MunicipalComponent {
  elevation: 'flat' | 'raised' | 'floating';
  padding: 'none' | 'compact' | 'standard' | 'comfortable';
  interactive?: boolean;
  selected?: boolean;
}
```

**Visual Specifications:**

```scss
.mun-card {
  background: white;
  border-radius: 8px;
  position: relative;
  
  // Elevation variants
  &--flat {
    border: 1px solid #E2E8F0;
  }
  
  &--raised {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  &--floating {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  // Interactive states
  &--interactive {
    cursor: pointer;
    transition: all 200ms ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    }
  }
  
  // Selected state
  &--selected {
    border-color: var(--mun-primary);
    box-shadow: 0 0 0 3px var(--mun-primary-light);
  }
}
```

### 3. MunicipalInput

**Purpose:** Text input for user data, quiz answers, search

```typescript
interface MunicipalInputProps extends MunicipalComponent {
  type: 'text' | 'email' | 'number' | 'search' | 'password';
  placeholder?: string;
  helper?: string;
  error?: string;
  icon?: ReactNode;
  clearable?: boolean;
}
```

**Anna Svensson Optimization:**

```scss
.mun-input {
  // Mobile-first sizing
  height: 48px;  // Perfect touch target
  font-size: 16px;  // Prevents iOS zoom
  padding: 0 16px;
  
  // Professional styling
  background: white;
  border: 2px solid #E2E8F0;
  border-radius: 6px;
  
  &:focus {
    outline: none;
    border-color: var(--mun-primary);
    box-shadow: 0 0 0 3px var(--mun-primary-light);
  }
  
  // Error state
  &--error {
    border-color: var(--mun-error);
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2);
    }
  }
}
```

### 4. MunicipalQuizOption

**Purpose:** Specialized component for quiz answer selections

```typescript
interface MunicipalQuizOptionProps extends MunicipalComponent {
  optionLabel: string;
  optionText: string;
  selected?: boolean;
  correct?: boolean;
  incorrect?: boolean;
  disabled?: boolean;
  feedback?: string;
}
```

**Interaction Design:**

```scss
.mun-quiz-option {
  // Base layout
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
  cursor: pointer;
  
  // Option indicator
  &__indicator {
    width: 24px;
    height: 24px;
    border: 2px solid #CBD5E0;
    border-radius: 50%;
    flex-shrink: 0;
    position: relative;
    
    // Selected state
    &::after {
      content: '';
      position: absolute;
      inset: 4px;
      background: var(--mun-primary);
      border-radius: 50%;
      opacity: 0;
      transform: scale(0);
      transition: all 200ms ease;
    }
  }
  
  // Selected state
  &--selected {
    .mun-quiz-option__indicator {
      border-color: var(--mun-primary);
      
      &::after {
        opacity: 1;
        transform: scale(1);
      }
    }
  }
  
  // Feedback states
  &--correct {
    background: #F0FFF4;
    border-color: var(--mun-success);
  }
  
  &--incorrect {
    background: #FFF5F5;
    border-color: var(--mun-error);
  }
}
```

### 5. MunicipalProgressBar

**Purpose:** Show game progress, quiz completion, loading states

```typescript
interface MunicipalProgressBarProps extends MunicipalComponent {
  value: number;  // 0-100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
}
```

### 6. MunicipalModal

**Purpose:** Overlay dialogs for important information, confirmations

```typescript
interface MunicipalModalProps extends MunicipalComponent {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}
```

### 7. MunicipalToast

**Purpose:** Non-intrusive notifications for achievements, errors, info

```typescript
interface MunicipalToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;  // ms
  position?: 'top' | 'bottom' | 'top-right' | 'bottom-right';
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

### 8. MunicipalBadge

**Purpose:** Status indicators, achievement badges, labels

```typescript
interface MunicipalBadgeProps extends MunicipalComponent {
  variant: 'solid' | 'outline' | 'subtle';
  colorScheme: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size: 'small' | 'medium';
  icon?: ReactNode;
}
```

### 9. MunicipalAvatar

**Purpose:** User representation, character portraits

```typescript
interface MunicipalAvatarProps extends MunicipalComponent {
  name: string;
  src?: string;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy';
}
```

### 10. MunicipalTabs

**Purpose:** Navigation between game sections, settings panels

```typescript
interface MunicipalTabsProps extends MunicipalComponent {
  variant: 'line' | 'enclosed' | 'soft';
  size: 'small' | 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  isFitted?: boolean;
}
```

---

## 🎮 GAME-SPECIFIC COMPONENTS

### 11. MunicipalDialogueBox

**Purpose:** Character dialogue display with municipal professional styling

```typescript
interface MunicipalDialogueBoxProps extends MunicipalComponent {
  speaker: {
    name: string;
    avatar?: string;
    role?: string;
  };
  message: string;
  choices?: Array<{
    id: string;
    text: string;
    consequence?: string;
  }>;
  emotion?: 'neutral' | 'happy' | 'concerned' | 'serious';
}
```

### 12. MunicipalSceneTransition

**Purpose:** Smooth transitions between game scenes

```typescript
interface MunicipalSceneTransitionProps {
  type: 'fade' | 'slide' | 'scale';
  duration?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}
```

### 13. MunicipalTimer

**Purpose:** Countdown timer for timed challenges

```typescript
interface MunicipalTimerProps extends MunicipalComponent {
  duration: number;  // seconds
  onComplete: () => void;
  showProgress?: boolean;
  warningThreshold?: number;  // seconds
  pausable?: boolean;
}
```

### 14. MunicipalScoreDisplay

**Purpose:** Show points, achievements, progress metrics

```typescript
interface MunicipalScoreDisplayProps extends MunicipalComponent {
  score: number;
  label?: string;
  showAnimation?: boolean;
  format?: (score: number) => string;
}
```

---

## 📱 RESPONSIVE SYSTEM

### Anna Svensson Mobile-First Grid

```scss
.mun-grid {
  display: grid;
  gap: var(--mun-space-2);
  
  // Mobile (iPhone 12)
  @media (max-width: 390px) {
    grid-template-columns: 1fr;
    padding: var(--mun-space-2);
  }
  
  // Tablet
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    padding: var(--mun-space-3);
  }
  
  // Desktop
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    padding: var(--mun-space-4);
  }
}
```

### Component Responsive Behavior

```typescript
// Responsive component wrapper
const MunicipalResponsive: React.FC<{
  mobile: ReactNode;
  tablet?: ReactNode;
  desktop?: ReactNode;
}> = ({ mobile, tablet, desktop }) => {
  const breakpoint = useBreakpoint();
  
  if (breakpoint === 'desktop' && desktop) return <>{desktop}</>;
  if (breakpoint === 'tablet' && tablet) return <>{tablet}</>;
  return <>{mobile}</>;
};
```

---

## 🌍 CULTURAL ADAPTATIONS

### Swedish Municipal Style

```scss
.mun-component--swedish {
  // Clean, minimalist design
  --primary: #0066CC;
  --radius: 4px;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;
}
```

### German Authority Style

```scss
.mun-component--german {
  // Structured, precise design
  --primary: #4A5568;
  --radius: 2px;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  font-family: 'Roboto', sans-serif;
}
```

### French République Style

```scss
.mun-component--french {
  // Elegant, official design
  --primary: #000091;
  --radius: 6px;
  --shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
  font-family: 'Marianne', sans-serif;
}
```

### Dutch Efficiency Style

```scss
.mun-component--dutch {
  // Direct, functional design
  --primary: #FF6900;
  --radius: 3px;
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  font-family: 'Rijksoverheid Sans', sans-serif;
}
```

---

## ♿ ACCESSIBILITY STANDARDS

### WCAG 2.1 AA Compliance

```typescript
// Every component includes
interface AccessibilityProps {
  role?: string;
  ariaLabel: string;
  ariaDescribedBy?: string;
  ariaLive?: 'polite' | 'assertive' | 'off';
  tabIndex?: number;
}

// Keyboard navigation
const useKeyboardNavigation = (items: any[]) => {
  const [focusIndex, setFocusIndex] = useState(0);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp':
          setFocusIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          setFocusIndex(prev => Math.min(items.length - 1, prev + 1));
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length]);
  
  return focusIndex;
};
```

### Screen Reader Support

```tsx
// Example: Quiz option with full screen reader support
<MunicipalQuizOption
  role="radio"
  ariaLabel={`Option ${index + 1}: ${optionText}`}
  ariaDescribedBy={`option-feedback-${id}`}
  ariaChecked={selected}
  tabIndex={0}
/>
```

---

## 🚀 IMPLEMENTATION GUIDE

### 1. Component Structure

```
src/components/municipal/
├── core/
│   ├── MunicipalButton/
│   │   ├── MunicipalButton.tsx
│   │   ├── MunicipalButton.styles.ts
│   │   ├── MunicipalButton.test.tsx
│   │   └── index.ts
│   ├── MunicipalCard/
│   ├── MunicipalInput/
│   └── ...
├── game/
│   ├── MunicipalQuizOption/
│   ├── MunicipalDialogueBox/
│   └── ...
├── theme/
│   ├── tokens.ts
│   ├── breakpoints.ts
│   └── culturalVariants.ts
└── index.ts
```

### 2. Usage Example

```tsx
import { 
  MunicipalButton, 
  MunicipalCard, 
  MunicipalQuizOption 
} from '@/components/municipal';

const QuizScene = () => {
  return (
    <MunicipalCard elevation="raised" padding="comfortable">
      <h2>Vilken avdelning ansvarar för snöröjning?</h2>
      
      <div className="quiz-options">
        {options.map(option => (
          <MunicipalQuizOption
            key={option.id}
            optionLabel={option.label}
            optionText={option.text}
            selected={selected === option.id}
            onClick={() => setSelected(option.id)}
          />
        ))}
      </div>
      
      <MunicipalButton
        variant="primary"
        size="large"
        fullWidth
        disabled={!selected}
        onClick={handleSubmit}
      >
        Skicka svar
      </MunicipalButton>
    </MunicipalCard>
  );
};
```

### 3. Theming Integration

```typescript
// Municipal theme provider
const MunicipalThemeProvider: React.FC<{
  municipality: 'swedish' | 'german' | 'french' | 'dutch';
  children: ReactNode;
}> = ({ municipality, children }) => {
  return (
    <ThemeContext.Provider value={municipalThemes[municipality]}>
      <div className={`mun-theme--${municipality}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
```

---

## 📊 SUCCESS METRICS

### Development Efficiency
- **Component Creation Time:** From 2 hours → 5 minutes
- **Bug Reduction:** 90% fewer UI-related issues
- **Code Reuse:** >80% component utilization
- **Consistency Score:** 100% design adherence

### Performance Targets
- **Component Load Time:** <50ms
- **Bundle Size:** <100KB for core components
- **Render Performance:** 60fps animations
- **Memory Usage:** <50MB component overhead

### Quality Assurance
- **Test Coverage:** 100% for all components
- **Accessibility Score:** 100% WCAG 2.1 AA
- **Browser Support:** All modern browsers + IE11
- **Device Support:** All devices 320px+

---

## 🔗 INTEGRATION WITH ROADMAP

### Q1 Foundation (Current)
- Enable rapid development of feedback fixes
- Standardize UI across all game scenes
- Foundation for DevTeam preview interface

### Q2 Innovation (Next)
- Support advanced quiz mechanics
- Enable branching narrative UI
- Character interaction components

### Q3 Scaling (Future)
- Multi-tenant theming system
- Performance optimization for 100+ municipalities
- Regional variant management

---

## 📚 DOCUMENTATION

### Component Documentation Template

```typescript
/**
 * MunicipalButton - Primary interaction element
 * 
 * @example
 * <MunicipalButton variant="primary" size="large">
 *   Starta utbildning
 * </MunicipalButton>
 * 
 * @param variant - Visual style variant
 * @param size - Component size
 * @param fullWidth - Expand to container width
 * @param loading - Show loading state
 * @param disabled - Disable interaction
 */
```

### Storybook Integration

```typescript
export default {
  title: 'Municipal/Core/Button',
  component: MunicipalButton,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost']
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large']
    }
  }
};
```

---

## 🎯 NEXT STEPS

1. **Immediate (Week 1)**
   - Implement core components (Button, Card, Input)
   - Create Storybook documentation
   - Integrate with existing codebase

2. **Short-term (Week 2-3)**
   - Complete game-specific components
   - Add cultural variants
   - Full accessibility testing

3. **Long-term (Month 2+)**
   - Performance optimization
   - Advanced animation system
   - Component analytics

---

*"Professional components create professional experiences. When every interaction reflects municipal excellence, user trust follows naturally."* - DigiNativa Design Philosophy