StrategyPlay Runtime Engine: Teknisk Dokumentation & Vision1. Inledning & SyfteVälkommen till strategyplay-runtime-engine. Detta repository är hjärtat i StrategyPlays produktleverans och innehåller den centrala, återanvändbara UI-komponentmotorn för alla spelupplevelser vi skapar.Syftet med denna motor är att flytta oss från en modell där varje spel är en unik, monolitisk applikation, till en skalbar arkitektur där vi separerar innehåll från presentation. AI-teamet (devteam) fokuserar på att förstå och strukturera innehållet, medan denna Runtime Engine fokuserar på att presentera det på ett engagerande och högkvalitativt sätt.Huvudfördelar:Kvalitet & Konsistens: Alla spel får samma testade och högkvalitativa användarupplevelse.Underhållbarhet: En bugg eller en designförbättring fixas på ett ställe och kan rullas ut till alla spel.Hastighet & Effektivitet: AI-teamet behöver inte längre generera tusentals rader UI-kod, vilket gör hela processen snabbare, billigare och mer pålitlig.2. Arkitektonisk ÖversiktRuntime Engine är en kritisk, men fristående, del av StrategyPlays ekosystem. Den konsumeras som ett NPM-paket av de lättviktiga spel-applikationer som devteam genererar.graph TD
    subgraph Kundens Domän
        A[SaaS-portal] -- interagerar med --> B[API Gateway]
    end

    subgraph Vår Backend
        B -- skickar jobb till --> C[AI Factory / devteam]
    end

    subgraph Kod & Artefakter
        C -- genererar --> E[Lättviktig Spel-app Repo på GitHub]
        D[Runtime Engine Repo (Detta Repo)] -- publicerar NPM-paket till --> F[NPM Registry]
        E -- har beroende till --> F
    end

    E -- driftsätts till --> G[Live Spel-URL]
SaaS-portalen: Kundens gränssnitt.AI Factory (devteam): Vår backend som analyserar dokument. Dess nya huvuduppgift är att producera en game-content.json-fil.Runtime Engine (Detta repo): Bygger och publicerar ett NPM-paket som kan läsa och visualisera game-content.json.Genererad Spel-app: En minimal skal-applikation som devteam skapar. Den innehåller game-content.json och har ett NPM-beroende till vår Runtime Engine.3. Kärnkonceptet: Innehållsmanifestet (game-content.json)Detta är den viktigaste pusselbiten. game-content.json är ett deklarativt JSON-dokument som beskriver hela spelupplevelsen: scener, dialoger, frågor, bilder, karaktärer och logik.Vem skapar det? devteam (AI-fabriken).Vem läser det? Runtime Engine.Motorn är en "spelare" för dessa manifest-filer. Detta frikopplar innehållsanalysen från den visuella implementationen.Exempel på game-content.json (v0.1):{
  "schema_version": "0.1.0",
  "game_id": "komin-karin-hallbarhet-2025",
  "title": "Hållbarhetsstrategi 2025",
  "start_scene": "scene_intro",
  "theme": {
    "primary_color": "#005a9e",
    "logo_url": "[https://example.com/logo.png](https://example.com/logo.png)"
  },
  "scenes": {
    "scene_intro": {
      "type": "dialogue",
      "character_id": "ceo",
      "text": "Välkommen! Dags att se hur väl du känner till vår nya hållbarhetsstrategi.",
      "next_scene": "scene_q1"
    },
    "scene_q1": {
      "type": "quiz",
      "question": "Vilken av dessa är INTE en av våra tre strategiska pelare?",
      "options": [
        { "text": "Minskad klimatpåverkan", "is_correct": false, "feedback": "Fel, det är en central del!" },
        { "text": "Socialt ansvar", "is_correct": false, "feedback": "Fel, det är också en central del!" },
        { "text": "Maximerad kvartalsvinst", "is_correct": true, "feedback": "Rätt! Vår strategi fokuserar på långsiktigt värde." }
      ],
      "next_scene": "scene_summary"
    },
    "scene_summary": {
      "type": "summary",
      "title": "Bra jobbat!",
      "text": "Du har nu en bra grundförståelse för vår nya strategi."
    }
  }
}
4. Beroenden & Interaktionerdevteam → Runtime Engine (Indirekt): devteam behöver känna till schemat för game-content.json och de scen-typer (dialogue, quiz etc.) som motorn stöder. När devteam genererar en ny spel-app, specificerar den en version av strategyplay-runtime-engine i den nya appens package.json.Genererad Spel-app → Runtime Engine (Direkt): Det starkaste beroendet. Varje spel-app importerar och använder komponenter från detta paket för att fungera.5. Olösta Frågor & UtvecklingsfokusDetta är de strategiska tekniska frågor som behöver besvaras under utvecklingen av motorn.Schema-design för game-content.json:Hur designar vi ett schema som är både kraftfullt nog för komplexa interaktioner och enkelt nog för devteam att generera pålitligt?Hur hanterar vi branching/villkorslogik? (T.ex. "om användaren svarar X, gå till scen A, annars scen B").State Management:Hur hanterar vi spelets tillstånd (nuvarande scen, poäng, användarens svar)? Räcker React Context, eller behöver vi en mer robust lösning som Zustand eller Redux Toolkit?Styling & Theming:Hur implementerar vi kundspecifikt utseende (theme-objektet i manifestet)? CSS-variabler är en stark kandidat. Hur långt ska anpassningen kunna gå?Versionshantering:Hur hanterar vi ändringar i game-content.json-schemat på ett bakåtkompatibelt sätt? Vi måste säkerställa att en uppdatering av motorn inte förstör gamla, existerande spel.Event Tracking & Analys:Hur ska motorn rapportera händelser (t.ex. spel_startat, fråga_besvarad, spel_slutfört) för analys? Ska vi anropa en webhook som specificeras i manifestet?
