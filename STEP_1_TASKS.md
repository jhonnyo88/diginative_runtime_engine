# DigiNativa Runtime Engine - Närsta Steg Fokus
**Datum:** 2025-01-17  
**Syfte:** Konkret förslag på vad vi ska fokusera på närmsta tiden  
**Kontext:** Baserat på teknisk roadmap och Game Designer feedback  

---

## 🎯 PRIORITERAT FOKUS: 3 SPRINTS

### **Sprint 1: Kritisk Stabilitet (Vecka 1)**
**Status:** BLOCKERANDE - Måste lösas först

#### **Task 1: Quiz Answer Text Rendering Bug (CRITICAL)**
- **Problem:** Quiz-alternativ är klickbara men innehåller ingen text - spelet är ospelbart
- **Teknisk analys:** QuizScene.tsx renderar `option.text` men text visas inte
- **Lösning:** Debug databindning mellan `digitaliseringsstrategi-demo.json` och QuizScene komponenten
- **Tidsram:** 1 dag
- **Ansvarig:** Head Developer

#### **Task 2: Player Name State Timing (KNOWN BUG)**
- **Problem:** `{{PLAYER_NAME}}` visas istället för spelarnamn i dialoger
- **Root cause:** React state batching - `setPlayerName` och `setGameStarted` i samma funktion
- **Lösning:** Implementera rätt timing mellan state updates
- **Tidsram:** 1 dag
- **Ansvarig:** Head Developer

#### **Task 3: Error Boundary Implementation**
- **Problem:** Inga graceful error handling när något går fel
- **Lösning:** React Error Boundary för hela spelet + fallback UI
- **Tidsram:** 0.5 dag
- **Ansvarig:** Head Developer

---

## 🎨 TASK-GD-010: Design System Foundation Setup  
**Prioritet:** HIGH  
**Kan startas:** Omedelbart (parallell med andra)  
**Deadline:** 2 dagar  
**Ansvarig:** Game Designer

**Syfte:** Etablera professionell design foundation för konsistens

**Game Designer directives konkretisering:**
1. **Färgpalett definition:**
   - Primary: #0066CC (Kommun-blå)
   - Secondary: #F5F5F5 (Ljusgrå bakgrund)  
   - Success: #00A651 (Grön)
   - Text: #333333 (Nästan svart)

2. **Typografi system:**
   - Headers: Inter/Roboto Bold (24px H1, 18px H2)
   - Body: Inter/Roboto Regular (16px)
   - Line-height: 1.5 för läsbarhet

3. **Spacing system:**
   - Base unit: 8px
   - Alla margins/paddings i multiplar av 8px

4. **Component specifications:**
   - Button design (ingen gradient, solid colors, 4-6px border-radius)
   - Card layout för content blocks
   - Modal design för focused actions
   - Progress indicator specifications

**Deliverables:** Design system dokument + Figma components

---

## 🔧 TASK-HD-015: Professional Button Component Implementation
**Prioritet:** HIGH  
**Kan startas:** När TASK-GD-010 är klar  
**Deadline:** 3 dagar  
**Ansvarig:** Head Developer  
**Dependencies:** TASK-GD-010

**Game Designer specifications:**
- Solid färg (kommunens primärblå #0066CC)
- Subtil skugga: `box-shadow: 0 2px 4px rgba(0,0,0,0.1)`
- INGEN gradient (dated enligt GD)
- Hover-state: mörkare nyans
- Padding: 12px 24px (generous)
- Border-radius: 4-6px (inte för runda)

**Teknisk implementation:**
1. Uppdatera Chakra UI theme med nya button styles
2. Identifiera alla button instances med `chakra-button css-91aukn`
3. Implementera hover effects och transitions
4. Säkerställ 48px minimum touch targets (Anna Svensson)
5. Testa accessibility compliance

**Success criteria:** Alla knappar följer professionell municipal design

---

## 📱 TASK-HD-016: Username Input Modal Implementation  
**Prioritet:** HIGH  
**Kan startas:** Omedelbart (parallell med andra)  
**Deadline:** 2 dagar  
**Ansvarig:** Head Developer

**Game Designer directive konkretisering:**
- Modal popup vid game start
- Rubrik: "Välkommen! Vad heter du?"
- Enkel design med input-fält
- "Fortsätt"-knapp (inte bara "OK")
- Focus management och backdrop

**Teknisk implementation:**
1. Skapa Modal component med Chakra UI
2. Ersätt nuvarande buried input field 
3. Implementera focus trap och keyboard navigation
4. Lägg till backdrop click-to-close (optional)
5. Integrera med befintlig player name system

**Success criteria:** Omöjligt att missa name input interaction

---

## 🎮 TASK-GD-011: Game Intro Screen Layout Redesign
**Prioritet:** HIGH (Game Designer's rekommendation: viktigare än monitoring panel)  
**Kan startas:** När TASK-GD-010 är klar  
**Deadline:** 3 dagar  
**Ansvarig:** Game Designer  
**Dependencies:** TASK-GD-010

**Problem:** Osammanhängande layout efter "Se Digitaliseringsstrategi Demo" click

**Game Designer's tre-delad layout:**
```
Header: DigiNativa logo + kommun-branding
Center: Välkomsttext + kursbeskrivning (max 2 meningar)  
Bottom: Start-knapp (prominent)
```

**Konkreta deliverables:**
1. Wireframe för centerad, kompakt layout
2. Visual hierarchy specification
3. Typography och spacing guidelines
4. Implementation guidelines för Head Developer
5. Anna Svensson mobile-first optimization

**Success criteria:** Professionell första intryck av game experience

---

## 📊 TASK-HD-017: Monitoring Panel Collapse Implementation
**Prioritet:** MEDIUM  
**Kan startas:** Omedelbart (parallell med andra)  
**Deadline:** 2 dagar  
**Ansvarig:** Head Developer

**Game Designer directive:**
- Kollapsad som default
- Diskret toggle-knapp med "i"-ikon i övre högra hörnet
- Expanderar som overlay, INTE permanent space
- Stör inte huvudflöde

**Teknisk implementation:**
1. Identifiera component med `css-d634rx` class
2. Ändra default state till collapsed
3. Implementera toggle functionality med ikon
4. Ensure overlay behavior (inte layout shift)
5. Session persistence (optional)

**Success criteria:** Ren startup experience, monitoring tillgängligt på begäran

---

## 🎨 TASK-HD-018: Intro Screen Layout Implementation  
**Prioritet:** HIGH  
**Kan startas:** När TASK-GD-011 är klar  
**Deadline:** 4 dagar  
**Ansvarig:** Head Developer  
**Dependencies:** TASK-GD-011, TASK-GD-010

**Implementera Game Designer's redesign:**
1. Centrera allt content vertikalt enligt wireframe
2. Implementera tre-delad layout (header/center/bottom)
3. Applicera design system färger och typografi
4. Säkerställ mobile responsiveness (Anna Svensson)
5. Integrera med GameContainer system

**Success criteria:** Professionell, sammanhängande intro screen layout

---

## 📋 STEG 1 PARALLELLKÖRNING

### **KAN STARTAS OMEDELBART (PARALLELLT):**
- ✅ **TASK-HD-008** (Quiz fix) - Isolerad bugg
- ✅ **TASK-GD-010** (Design system) - Foundation för allt annat  
- ✅ **TASK-HD-016** (Name modal) - Isolerad förbättring
- ✅ **TASK-HD-017** (Monitoring panel) - Isolerad förbättring

### **STARTAS NÄR DEPENDENCIES KLARA:**
- **TASK-HD-015** (Button implementation) → väntar på TASK-GD-010
- **TASK-GD-011** (Intro redesign) → väntar på TASK-GD-010  
- **TASK-HD-018** (Intro implementation) → väntar på TASK-GD-011 + TASK-GD-010

---

## 🎯 STEG 1 SUCCESS CRITERIA

**Måste vara klart innan Steg 2:**
1. ✅ Quiz fungerar (text visas i alla alternativ)
2. ✅ Professional button design implementerat  
3. ✅ Name input är modal (inte buried)
4. ✅ Intro screen är professionell och centrerad
5. ✅ Monitoring panel kollapsad som default
6. ✅ Design system etablerat för konsistens

**Ready for Steg 2 när:** Alla 6 punkter är testade och godkända

**Vilka 4 tasks ska startas parallellt imorgon:**
1. TASK-HD-008 (Quiz fix)  
2. TASK-GD-010 (Design system)
3. TASK-HD-016 (Name modal)
4. TASK-HD-017 (Monitoring panel)