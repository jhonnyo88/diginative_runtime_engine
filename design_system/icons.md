# DigiNativa Icon System 🎯

## Design Philosophy

Ikoner designade för Anna Svensson - tydliga, tillgängliga och professionella ikoner som fungerar perfekt på hennes iPhone 12 under 7-minuters lunchpausen.

## Designprinciper

### ✅ Anna Svensson Optimering
- **Minimum 24x24px** för touch targets
- **Tjock streckbredd** (2px) för mobilsynlighet  
- **Hög kontrast** för läsbarhet i solljus
- **Universella symboler** - inga kulturspecifika referenser

### 🎨 Visuell Stil
- **Stroke-baserad design** med 2px linjewbredd
- **Rounded corners** (2px radius) för mjuk, professionell känsla
- **Konsekvent optisk balans** - alla ikoner ser lika stora ut
- **Svenska tillgänglighetsfärger** kompatibla

### 📐 Tekniska Specs
- **Format**: SVG (optimerad med SVGO)
- **Storlekar**: 16x16, 24x24, 32x32px
- **Färger**: Använder design tokens (brand.500, gray.600, etc.)
- **Kontrast**: WCAG AA minimum 4.5:1

## Icon Library

### Navigation & Flow
- **next/continue**: Chevron höger med rundad pil
- **previous/back**: Chevron vänster  
- **play/start**: Triangel höger (fylld)
- **pause**: Två vertikala rektanglar
- **restart**: Cirkulär pil moturs

### Feedback & Assessment  
- **check/correct**: Checkmark i cirkel
- **x/incorrect**: X i cirkel
- **help/info**: i i cirkel med border
- **star/achievement**: 5-pointed star (fylld)
- **certificate**: Dokument med band

### Actions & Resources
- **download**: Nedåtpil över linje
- **upload**: Uppåtpil över linje  
- **progress**: Cirkulär progress (75% fylld)
- **time/clock**: Klocka med visare

## Färgvarianter

### Primary (brand.500)
Används för primära actions och navigation
```css
color: #005293
```

### Secondary (gray.600) 
Används för sekundära actions och information
```css
color: #475569
```

### Success (success.500)
Används för positiv feedback och achievements
```css  
color: #22C55E
```

### Error (error.500)
Används för fel och warnings
```css
color: #EF4444
```

## Implementation

### SVG Sprite
Alla ikoner kombineras i en sprite sheet för optimal performance:
```html
<svg>
  <use href="/design_assets/icons/sprite.svg#icon-next" />
</svg>
```

### Chakra UI Integration
```tsx
import { Icon } from '@chakra-ui/react'
import { NextIcon } from '@/design_assets/icons'

<Icon as={NextIcon} boxSize="6" color="brand.500" />
```

## Accessibility

### Screen Reader Support
Alla ikoner har meningsfulla aria-labels:
```html
<Icon aria-label="Fortsätt till nästa steg" />
```

### High Contrast Mode
Ikoner fungerar med Windows High Contrast och macOS Increase Contrast:
- Automatisk kantlinje vid behov
- Färgbyten respekteras

### Keyboard Navigation  
Alla klickbara ikoner har:
- Focus states med 2px outline
- Minimum 48x48px touch area
- Tab order som följer logisk sekvens

## Anna Svensson Use Cases

### På tunnelbanan (dålig belysning)
- Högt kontrast design syns tydligt
- Stora touch targets fungerar med handskar

### Under lunchpausen (snabb interaktion)
- Tydliga symboler kräver ingen eftertanke
- Universella ikoner (inga lokala referenser)

### Med glasögon (läsbarhet)
- 24px minimum storlek
- Tjocka linjer (2px) ger tydlighet

## Kvalitetsstandard

✅ WCAG 2.1 AA compliance  
✅ Testad på iPhone 12 (375px bredd)  
✅ Fungerar i direktsoljus  
✅ Kulturellt neutrala symboler  
✅ Optimerad för svenska offentliga sektorn