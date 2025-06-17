# Municipal Button Migration Guide

## Overview
This guide helps migrate from the broken colorScheme implementation to the new professional Municipal Button system based on Game Designer task-gd-007 specifications.

## Migration Steps

### 1. Replace Broken Button Pattern

**Before (Broken):**
```tsx
<Button
  colorScheme={primaryColor.includes('#') ? undefined : 'blue'}
  bg={primaryColor}
  color="white"
  _hover={{ opacity: 0.8 }}
>
  Svara
</Button>
```

**After (Professional):**
```tsx
import { MunicipalButton } from '../components/Button';

<MunicipalButton
  variant="municipal-primary"
  culturalContext="swedish"
>
  Svara
</MunicipalButton>
```

### 2. Update QuizScene Implementation

Replace all Button instances in QuizScene.tsx:

```tsx
// Old implementation to remove:
<Button
  onClick={handleSubmitAnswer}
  colorScheme={primaryColor.includes('#') ? undefined : 'blue'}
  bg={primaryColor}
  color="white"
  _hover={{ opacity: 0.8 }}
  size={isMobile ? "lg" : "md"}
  minH="48px"
  minW="120px"
  isDisabled={!answers[currentQuestion.question_id]?.length || !hasValidOptions}
  aria-label="Svara på frågan"
>
  Svara
</Button>

// New implementation:
<MunicipalButton
  onClick={handleSubmitAnswer}
  variant="municipal-primary"
  culturalContext={culturalContext}
  municipalEntity={municipalBranding?.municipality}
  isDisabled={!answers[currentQuestion.question_id]?.length || !hasValidOptions}
  aria-label="Svara på frågan"
>
  {getButtonText('submit', culturalContext)}
</MunicipalButton>
```

### 3. Cultural Context Usage

```tsx
import { getButtonText } from '../../theme/municipalButtonTheme';

// Use cultural context for button text
const buttonText = getButtonText('continue', culturalContext);

<MunicipalButton
  variant="municipal-primary"
  culturalContext={culturalContext}
>
  {buttonText}
</MunicipalButton>
```

### 4. Button Hierarchy Examples

```tsx
// Primary Action (Start training, Submit answers)
<MunicipalButton variant="municipal-primary">
  Starta GDPR-utbildningen
</MunicipalButton>

// Secondary Action (Cancel, Back)
<MunicipalButton variant="municipal-secondary">
  Avbryt
</MunicipalButton>

// Outline Action (Optional actions, Read more)
<MunicipalButton variant="municipal-outline">
  Läs mer
</MunicipalButton>
```

### 5. Loading States

```tsx
<MunicipalButton
  variant="municipal-primary"
  isLoading={isSubmitting}
  loadingText="Bearbetar..." // Auto-translated based on culturalContext
  culturalContext="swedish"
>
  Skicka svar
</MunicipalButton>
```

### 6. Mobile Optimization (Anna Svensson)

```tsx
// Automatically optimized for mobile when annaOptimization is true (default)
<MunicipalButton
  variant="municipal-primary"
  annaOptimization={true} // Default, ensures 48px minimum touch targets
>
  Fortsätt
</MunicipalButton>
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'municipal-primary' \| 'municipal-secondary' \| 'municipal-outline' | 'municipal-primary' | Button style variant |
| culturalContext | 'swedish' \| 'german' \| 'french' \| 'dutch' | 'swedish' | Cultural adaptation |
| municipalEntity | string | undefined | Municipality name (e.g., 'Malmö Stad') |
| governmentLevel | 'municipal' \| 'regional' \| 'federal' | 'municipal' | Government level |
| annaOptimization | boolean | true | Enable mobile optimizations |

## Benefits of Migration

1. **Professional Appearance**: Government-grade button design with gradients and shadows
2. **Consistent Styling**: No more mixed colorScheme/bg approaches
3. **Cultural Context**: Automatic translations and cultural adaptations
4. **Accessibility**: WCAG 2.1 AA compliant with proper focus states
5. **Mobile Optimized**: 48px minimum touch targets for Anna Svensson
6. **Performance**: Reduced re-renders from conditional styling

## Testing Checklist

- [ ] All buttons display with correct municipal blue gradient
- [ ] Hover states show elevation and shadow enhancement
- [ ] Focus states display 3px blue outline
- [ ] Loading states show appropriate cultural text
- [ ] Touch targets are at least 48px on mobile
- [ ] Cultural context switches button text correctly
- [ ] Disabled states maintain professional appearance

## Support

For questions about the municipal button system, refer to:
- `/docs/developers/professional-button-design-specification.md`
- Game Designer task-gd-007 specifications