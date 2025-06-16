# DigiNativa Character Avatar Guidelines 👥

## Anna Svensson Perspective

Anna ser dessa karaktärer som sina kollegor - de ska kännas professionella, pålitliga och närvarande. Som 45-årig kommunal förvaltare behöver hon kunna relatera till och respektera de personer som visas i våra spel.

## Design Philosophy

### 🎯 Professionell men Approachbar
- **Kommunalt lämpliga** - Passar svenska myndigheters värderingar
- **Mångfald som standard** - Representerar Sveriges befolkning  
- **Åldersspektrum** - Inte bara unga tech-workers
- **Genuint välkomnande** - Inte forcerat eller artificiellt

### 📱 Tekniska Krav (Anna's iPhone 12)
- **Skalbar 32px-64px** - Måste vara läsbar på mobil
- **Hög kontrast ansiktsdrag** - Synligt i olika ljusförhållanden
- **Optimerad filstorlek** - WebP <10KB per avatar
- **Retina ready** - 2x resolution för skärphet

## Character Archetypes

### 1. Municipal Administrator (Anna's Peer)
**Persona**: Erfarenhet kommunal förvaltare, 40-55 år
- **Style**: Professionell men inte stiff
- **Klädsel**: Blazer eller skjorta, neutrale färger
- **Ansiktsuttryck**: Lugn kompetens, lätt leende
- **Hårstil**: Väl omvårdad, konservativ stil

### 2. Legal Advisor (Expertise Authority)  
**Persona**: Juridisk rådgivare, 35-50 år
- **Style**: Formell expertis utan arrogans
- **Klädsel**: Kostym eller formell klänning
- **Ansiktsuttryck**: Koncentrerad, tillgänglig
- **Accessoarer**: Diskreta glasögon okej

### 3. IT Specialist (Tech Support)
**Persona**: IT-support, 28-45 år  
- **Style**: Modern professionalism
- **Klädsel**: Smart casual, möjligt kraghankel
- **Ansiktsuttryck**: Hjälpsam, tålmodig
- **Details**: Mer avslappnad än andra roller

### 4. Manager/Supervisor (Leadership)
**Persona**: Avdelningschef, 45-60 år
- **Style**: Auktoritär men stödjande
- **Klädsel**: Elegant business attire  
- **Ansiktsuttryck**: Bestämd men positiv
- **Hållning**: Upprät, självsäker

### 5. HR Representative (Människokännedom)
**Persona**: HR-specialist, 35-50 år
- **Style**: Empatisk professionalitet
- **Klädsel**: Mjukare färger, tillgänglig stil
- **Ansiktsuttryck**: Varm, lyssnande
- **Energy**: Öppen kroppsspråk

### 6. Training Coordinator (Facilitator)
**Persona**: Utbildningskoordinator, 30-45 år
- **Style**: Pedagogisk entusiasm
- **Klädsel**: Praktisk elegans
- **Ansiktsuttryck**: Engagerad, uppmuntrande  
- **Pose**: Aktiv, forward-leaning

## Diversity & Inclusion Standards

### Ethnicity Representation
- **Svenska urfolksgrupper** - Samer representerade
- **Established communities** - Finlandssvenskar, Tornedalingar
- **New Swedes** - Mena, Afrikanska, Asiatiska bakgrunder
- **Mixed heritage** - Återspegla Sveriges mångfald

### Age Distribution
- **30-35 år**: 15% (Digital natives i ledarroller)
- **35-45 år**: 35% (Anna's generation - huvudmålgrupp)
- **45-55 år**: 35% (Erfarna medarbetare)
- **55+ år**: 15% (Senior expertise)

### Gender Balance
- **Women**: 55% (Speglar kommunal sektor)
- **Men**: 40% 
- **Non-binary**: 5% (Subtilt representerat)

## Visual Style Guidelines

### Color Palette  
- **Skin tones**: 8 naturliga nyanser från ljus till mörk
- **Hair colors**: Naturliga färger inkl. grått/vitt för äldre
- **Clothing**: Svenska myndighetsfärger (blå, grå, vit, svart)
- **Accent colors**: Subtle färger (burgundy, forest green)

### Art Direction
- **Illustration style**: Semi-realistic, professional
- **Line quality**: Clean, confident strokes  
- **Shading**: Subtle för dimension utan distraction
- **Background**: Transparent eller subtle gradient

### Emotional Range
- **Default**: Neutral positiv, tillgänglig
- **Engaged**: Fokuserad, aktiv lyssnande
- **Supportive**: Varm, uppmuntrande
- **Authoritative**: Bestämd men ej hård

## Technical Implementation

### File Organization
```
/design_assets/characters/
├── municipal-admin/
│   ├── anna-variant-1.svg
│   ├── lars-variant-1.svg
│   └── fatima-variant-1.svg
├── legal-advisor/
├── it-specialist/  
├── manager/
├── hr-representative/
└── training-coordinator/
```

### SVG Optimization
- **Hand-coded paths** för optimal compression
- **Reusable components** (eyes, mouths, hair shapes)
- **CSS custom properties** för theming
- **Accessibility markup** included

### Chakra UI Integration
```tsx
<Avatar 
  size="md"
  src="/characters/municipal-admin/anna-variant-1.svg"
  name="Anna Andersson"
  border="2px solid"
  borderColor="brand.500"
/>
```

## Anna Svensson Validation

### Relatability Test
"Skulle Anna känna sig bekväm att ha dessa personer som kollegor?"

### Professional Standards  
"Passar dessa karaktärer i svenska kommuners värdegrund?"

### Accessibility Check
"Kan Anna läsa ansiktsuttryck och kropps språk på hennes iPhone under olika förhållanden?"

### Cultural Appropriateness
"Representerar avatarerna Sveriges mångfald på ett respektfullt sätt?"

## Success Metrics

✅ **Representation accuracy** - Speglar svensk demografi  
✅ **Professional appropriateness** - Passar kommunal miljö  
✅ **Technical performance** - <10KB per avatar, snabb loading  
✅ **Accessibility compliance** - Fungerar för alla användare  
✅ **Anna approval** - Testad på målgruppen