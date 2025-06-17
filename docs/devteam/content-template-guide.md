# DigiNativa Game Content Templates Guide 📝

## Introduction

Återanvändbara innehållsmallar för snabb spelutveckling inom svenska kommuner. Designade för Anna Svensson och hennes kollegor - praktiska, relevanta och enkla att implementera för effektiv kompetensutveckling.

**⚠️ IMPORTANT**: This guide provides content examples and templates. For DevTeam AI-generated content, use the mandatory JSON schema defined in [`devteam-json-schema-specification.md`](devteam-json-schema-specification.md).

## Template Philosophy

### 🎯 Anna Svensson-Driven Content Design
- **Tidsbegränsning**: Allt innehåll optimerat för 7-minuters lunchpausslärande
- **Praktikrelevans**: Verkliga situationer från kommunal vardagsverksamhet
- **Kognitiv last**: Lagom mängd information per segment
- **Professionell ton**: Respektfullt och trovärdigt för myndighetsmiljö

### 📋 Template Categories

#### **1. GDPR Training Templates**
- Personuppgiftshantering i kommunal verksamhet
- Samtycke och rättsliga grunder
- Incidenthantering och dataskydd
- Registerutdrag och medborgarrättigheter

#### **2. Municipal Policy Templates**  
- Kommunallagen och dess tillämpning
- Offentlighetsprincipen och sekretess
- Upphandlingsregler och korruption
- Arbetsmiljö och säkerhet

#### **3. Workplace Safety Templates**
- Systematiskt arbetsmiljöarbete
- Brandskydd och utrymning
- Ergonomi och skärmarbete
- Incident- och tillbudsrapportering

#### **4. Onboarding Templates**
- Introduktion till kommunal verksamhet
- IT-säkerhet och systemåtkomst
- Kommunikation och bemötande
- Värdegrund och etik

#### **5. Assessment Templates**
- Kunskapsvalidering efter utbildning
- Kompetenscertifiering
- Praktisk tillämpning
- Kontinuerlig utveckling

## Template Structure Standards

### 📐 Standardiserad Mall-Arkitektur

#### **Metadata Template**
```json
{
  "submission_metadata": {
    "submission_id": "gdpr-basic-2025-001",
    "customer_order_id": "municipality-pilot-001",
    "generated_at": "2025-01-17T10:00:00Z",
    "content_version": "1.0.0",
    "processing_priority": "normal"
  },
  "game_content": {
    "game_id": "gdpr-basic-v1",
    "title": "GDPR Grundutbildning för Kommunala Tjänstemän",
    "description": "Grundläggande GDPR-kunskap för hantering av personuppgifter",
    "estimated_duration": 420,
    "target_audience": "municipal-administrators", 
    "difficulty_level": "beginner",
    "learning_objectives": [
      "Förstå GDPR:s grundprinciper",
      "Kunna hantera personuppgifter korrekt",
      "Känna till incidenthantering"
    ],
    "scenes": []
  }
}
```

**Note**: This example shows the DevTeam JSON schema structure. For complete schema requirements, see [`devteam-json-schema-specification.md`](devteam-json-schema-specification.md).

#### **Scene Flow Template**
```json
{
  "sceneFlow": [
    {
      "sceneType": "DialogueScene",
      "purpose": "Introduktion och kontext",
      "duration": "90 sekunder",
      "characters": ["anna", "juridisk_radgivare"]
    },
    {
      "sceneType": "QuizScene", 
      "purpose": "Kunskapsvalidering",
      "duration": "120 sekunder",
      "questionCount": 3
    },
    {
      "sceneType": "DialogueScene",
      "purpose": "Fördjupning och exempel",
      "duration": "150 sekunder",
      "characters": ["anna", "it_specialist"]
    },
    {
      "sceneType": "AssessmentScene",
      "purpose": "Sammanfattning och certifiering",
      "duration": "60 sekunder",
      "certificationRequired": true
    }
  ]
}
```

## Content Template Library

### 🔒 GDPR Training Templates

#### **Template: GDPR Grundutbildning**
```json
{
  "templateName": "GDPR Grundutbildning",
  "targetPersona": "Anna Svensson - Kommunal administratör",
  
  "scene1_dialogue_intro": {
    "sceneType": "DialogueScene",
    "title": "Välkommen till GDPR-utbildning",
    "characters": {
      "anna": "Anna Andersson, kommunal administratör",
      "jurist": "Marie Larsson, juridisk rådgivare"
    },
    "dialogue": [
      {
        "speaker": "jurist",
        "text": "Hej Anna! Idag ska vi gå igenom de viktigaste GDPR-reglerna som påverkar ditt dagliga arbete."
      },
      {
        "speaker": "anna", 
        "text": "Bra! Jag har hört så mycket om GDPR men vill förstå vad det betyder i praktiken."
      },
      {
        "speaker": "jurist",
        "text": "GDPR handlar om att skydda medborgarnas personuppgifter. Som kommunal tjänsteman hanterar du dagligen känslig information om våra invånare."
      }
    ],
    "choices": [
      {
        "text": "Vilka typer av personuppgifter hanterar jag?",
        "consequence": "Går vidare till fördjupning om personuppgiftstyper"
      },
      {
        "text": "Vad händer om jag gör fel?",
        "consequence": "Går vidare till riskgenomgång"
      }
    ]
  },
  
  "scene2_quiz_knowledge": {
    "sceneType": "QuizScene",
    "title": "GDPR Kunskapstest",
    "questions": [
      {
        "questionText": "Vilken är den viktigaste principen inom GDPR?",
        "options": [
          "Samtycke krävs alltid",
          "Personuppgifter ska behandlas lagligt, rättvist och transparent",
          "Alla personuppgifter måste raderas efter ett år",
          "Endast chefer får hantera personuppgifter"
        ],
        "correctAnswer": 1,
        "explanation": "GDPR bygger på principen om laglig, rättvis och transparent behandling. Samtycke är bara en av flera rättsliga grunder."
      },
      {
        "questionText": "Vad ska du göra om en medborgare begär att få se sina personuppgifter?",
        "options": [
          "Hänvisa till chefen",
          "Säga att det inte är möjligt",
          "Behandla begäran enligt kommunens rutin för registerutdrag",
          "Kräva skriftlig ansökan med tre veckors handläggningstid"
        ],
        "correctAnswer": 2,
        "explanation": "Medborgare har rätt till registerutdrag. Kommunen ska ha rutiner för detta som följer GDPR:s krav på svar inom en månad."
      }
    ]
  },
  
  "scene3_dialogue_practical": {
    "sceneType": "DialogueScene", 
    "title": "Praktiska exempel från din arbetsdag",
    "characters": {
      "anna": "Anna Andersson, kommunal administratör",
      "it_specialist": "Lars Nilsson, IT-säkerhetschef"
    },
    "dialogue": [
      {
        "speaker": "it_specialist",
        "text": "Anna, låt oss gå igenom några praktiska situationer. Du får en e-post med personnummer - vad gör du?"
      },
      {
        "speaker": "anna",
        "text": "Jag bör kanske inte vidarebefordra den utan att tänka på säkerheten?"
      },
      {
        "speaker": "it_specialist", 
        "text": "Exakt! Personnummer är särskilda kategorier av personuppgifter. Använd säker e-post eller kommunens interna system."
      }
    ]
  },
  
  "scene4_assessment": {
    "sceneType": "AssessmentScene",
    "title": "GDPR Grundutbildning Slutförd",
    "passingScore": 80,
    "certificate": {
      "title": "GDPR Grundcertifikat för Kommunala Tjänstemän",
      "validFor": "12 månader",
      "issuingAuthority": "DigiNativa Utbildningsplattform"
    },
    "achievements": [
      {
        "name": "GDPR Medvetenhet",
        "description": "Förstår grundläggande GDPR-principer"
      },
      {
        "name": "Praktisk Tillämpning", 
        "description": "Kan hantera personuppgifter enligt regelverket"
      }
    ]
  }
}
```

#### **Template: GDPR Incidenthantering**
```json
{
  "templateName": "GDPR Incidenthantering",
  "specialFocus": "Hantering av personuppgiftsincidenter",
  
  "scene1_dialogue_incident": {
    "scenario": "E-post med känsliga uppgifter skickad till fel mottagare",
    "characters": ["anna", "chef", "it_specialist"],
    "learningGoal": "Förstå incidenthanteringsprocessen"
  },
  
  "scene2_simulation_steps": {
    "sceneType": "SimulationScene",
    "title": "Steg-för-steg incidenthantering",
    "decisionPoints": [
      "Identifiera typ av incident",
      "Bedöma allvarlighetsgrad",
      "Rapportera enligt rutin",
      "Dokumentera händelsen",
      "Informera berörda personer"
    ]
  },
  
  "scene3_quiz_timeline": {
    "focus": "Tidsfrister för rapportering",
    "criticalInfo": "72 timmar till Integritetsskyddsmyndigheten, 'utan onödigt dröjsmål' till registrerade"
  }
}
```

### 🏛️ Municipal Policy Templates

#### **Template: Kommunallagen Grundläggande**
```json
{
  "templateName": "Kommunallagen för Praktiker",
  "targetAudience": "Nya och erfarna kommunala tjänstemän",
  
  "scene1_dialogue_intro": {
    "context": "Anna börjar ny tjänst och behöver förstå kommunallagens grundprinciper",
    "characters": {
      "anna": "Anna Andersson, ny medarbetare",
      "mentor": "Gunnar Svensson, erfaren handläggare"
    },
    "keyTopics": [
      "Likställighetsprincipen",
      "Objektivitetsprincipen", 
      "Proportionalitetsprincipen",
      "Kommunal kompetens"
    ]
  },
  
  "scene2_case_study": {
    "sceneType": "CaseStudyScene",
    "title": "Fallstudie: Bidragsansökan",
    "scenario": "En medborgare ansöker om ekonomiskt bistånd. Hur tillämpar du kommunallagens principer?",
    "documents": [
      "Ansökningshandlingar",
      "Kommunala riktlinjer", 
      "Tidigare beslut",
      "Kommunallagen"
    ],
    "decisions": [
      "Bedömning av behov",
      "Tillämpning av likställighetsprincipen",
      "Dokumentation av beslut"
    ]
  }
}
```

#### **Template: Offentlighetsprincipen**
```json
{
  "templateName": "Offentlighetsprincipen i Praktiken",
  "relevantFor": "Alla som hanterar allmänna handlingar",
  
  "scene1_dialogue_request": {
    "scenario": "Journalist begär ut handlingar",
    "timeFrame": "Måste hanteras omedelbart",
    "characters": ["anna", "pressansvarig", "jurist"]
  },
  
  "scene2_quiz_exceptions": {
    "focus": "Vad som är sekretessbelagt",
    "commonMistakes": [
      "Tror att all e-post är sekretess",
      "Blandar ihop personlig integritet med sekretess",
      "Förstår inte skillnaden mellan allmän handling och arbetsmaterial"
    ]
  }
}
```

### 🛡️ Workplace Safety Templates

#### **Template: Systematiskt Arbetsmiljöarbete**
```json
{
  "templateName": "SAM för Kommunala Arbetsplatser",
  "applicableTo": "Alla medarbetare och chefer",
  
  "scene1_dialogue_intro": {
    "setting": "Kontor i kommunhuset",
    "characters": {
      "anna": "Anna Andersson, medarbetare",
      "skyddsombud": "Petra Lindqvist, skyddsombud"
    },
    "topics": [
      "Vad är systematiskt arbetsmiljöarbete?",
      "Annas roll och ansvar",
      "Hur rapporterar man risker?"
    ]
  },
  
  "scene2_simulation_riskbedömning": {
    "sceneType": "SimulationScene",
    "title": "Identifiera risker på din arbetsplats",
    "interactive_elements": [
      "Klicka på potentiella risker i kontorsmiljön",
      "Bedöm allvarlighetsgrad",
      "Föreslå åtgärder"
    ],
    "common_risks": [
      "Ergonomiska problem vid datorarbete",
      "Halkrisk vid ingångar",
      "Stress och hög arbetsbelastning",
      "Bristfällig belysning"
    ]
  }
}
```

### 🌟 Onboarding Templates

#### **Template: Introduktion för Nya Medarbetare**
```json
{
  "templateName": "Välkommen till Kommunen",
  "duration": "15 minuter fördelat på 3 sessions",
  
  "session1_welcome": {
    "title": "Välkommen till teamet",
    "characters": {
      "anna": "Anna Andersson, ny medarbetare", 
      "chef": "Maria Johansson, närmaste chef",
      "kollega": "Erik Lindström, kollega och fadder"
    },
    "content": [
      "Kommunens värdegrund",
      "Organisationsstruktur",
      "Din roll och dina arbetsuppgifter",
      "Vem du kan vända dig till"
    ]
  },
  
  "session2_systems": {
    "title": "IT-system och verktyg",
    "practical_focus": "Direkt tillämpliga kunskaper",
    "topics": [
      "Inloggning och lösenordsrutiner",
      "E-post och kalender",
      "Ärendehanteringssystem",
      "Intranät och information"
    ]
  },
  
  "session3_culture": {
    "title": "Kommunikation och bemötande",
    "scenarios": [
      "Telefonsamtal från medborgare",
      "E-posthantering", 
      "Möteskultur",
      "Konfliktsituationer"
    ]
  }
}
```

## Implementation Guidelines

### 🛠️ Template Customization Process

#### **Step 1: Choose Base Template**
```javascript
// Template selection based on content type
const selectTemplate = (contentType, audience, duration) => {
  const templates = {
    'gdpr-basic': gdprBasicTemplate,
    'municipal-policy': policyTemplate,
    'workplace-safety': safetyTemplate,
    'onboarding': onboardingTemplate
  };
  
  return templates[contentType];
};
```

#### **Step 2: Customize for Local Context**
```json
{
  "localizations": {
    "municipality": "Malmö Stad",
    "specificRules": "Malmö stads riktlinjer för handläggning",
    "localContacts": {
      "it_support": "IT-service@malmo.se",
      "hr_department": "Personal@malmo.se"
    },
    "localExamples": [
      "Malmö stads medborgartjänst",
      "Miljöförvaltningens tillsynsarbete",
      "Skolförvaltningens elevregister"
    ]
  }
}
```

#### **Step 3: Validate Content Quality**
```javascript
// Content quality checklist
const validateContent = (template) => {
  return {
    annaRelevance: checkAnnaRelevance(template),
    timeConstraint: checkDuration(template), // Max 7 minutes
    accessibilityCompliance: checkWCAG(template),
    swedishLanguage: checkLanguageQuality(template),
    factualAccuracy: checkFactualContent(template)
  };
};
```

### 📊 Template Performance Metrics

#### **Effectiveness Measurements**
```json
{
  "success_metrics": {
    "completion_rate": "95%+ target",
    "knowledge_retention": "80%+ after 1 week",
    "practical_application": "Measured through workplace observation",
    "user_satisfaction": "4.5+ stars",
    "time_efficiency": "Content delivered within time limit"
  },
  
  "quality_indicators": {
    "content_accuracy": "Validated by subject matter experts",
    "cultural_appropriateness": "Suitable for Swedish municipal culture",
    "engagement_level": "Interactive elements maintain attention",
    "accessibility_score": "100% WCAG 2.1 AA compliance"
  }
}
```

### 🔄 Template Maintenance Strategy

#### **Regular Update Schedule**
- **Monthly**: Content accuracy review
- **Quarterly**: User feedback integration
- **Bi-annually**: Legal and regulatory updates
- **Annually**: Complete template overhaul

#### **Version Control System**
```json
{
  "versioning": {
    "major_updates": "Legal changes, structural modifications",
    "minor_updates": "Content improvements, new examples",
    "patch_updates": "Typos, minor corrections"
  },
  
  "approval_process": {
    "content_expert": "Subject matter specialist approval",
    "language_review": "Swedish language quality check", 
    "accessibility_audit": "WCAG compliance verification",
    "user_testing": "Anna Svensson persona validation"
  }
}
```

## Content Creation Best Practices

### ✍️ Writing Guidelines for Anna Svensson

#### **Language and Tone**
- **Professional but approachable** - Municipal authority with human warmth
- **Clear and concrete** - Avoid abstract concepts, use specific examples
- **Action-oriented** - Tell Anna exactly what to do
- **Swedish public sector appropriate** - Respectful, inclusive, authoritative

#### **Content Structure**
```markdown
# Optimal Content Flow for 7-Minute Sessions

## Introduction (30 seconds)
- Clear purpose statement
- Relevance to Anna's daily work
- What she'll learn and why it matters

## Core Content (4-5 minutes)
- Maximum 3 key concepts per session
- Real-world examples from municipal work
- Interactive elements every 90 seconds

## Practice/Application (1-2 minutes)
- Immediate application opportunity
- Quiz or scenario-based learning
- Mistake prevention focus

## Summary/Next Steps (30 seconds)
- Key takeaways summary
- How to apply learning immediately
- Where to find additional help
```

#### **Visual Content Guidelines**
- **Characters reflect Swedish municipal diversity**
- **Settings recognizable from municipal work**
- **Graphics support learning, not decorate**
- **Mobile-optimized for Anna's iPhone 12**

### 🎯 Scenario Development Framework

#### **Realistic Municipal Scenarios**
```json
{
  "scenario_types": {
    "citizen_service": {
      "examples": [
        "Handling citizen complaints",
        "Processing permit applications", 
        "Providing municipal information"
      ],
      "learning_focus": "Service quality and efficiency"
    },
    
    "administrative_tasks": {
      "examples": [
        "Document management",
        "Data entry and validation",
        "Report preparation"
      ],
      "learning_focus": "Accuracy and compliance"
    },
    
    "collaboration": {
      "examples": [
        "Inter-departmental projects",
        "Team meetings and decisions",
        "Knowledge sharing"
      ],
      "learning_focus": "Communication and teamwork"
    }
  }
}
```

## Quality Assurance Framework

### 🔍 Template Validation Process

#### **Content Accuracy Checklist**
- ✅ **Legal compliance**: Current laws and regulations
- ✅ **Factual accuracy**: Verified information sources
- ✅ **Municipal relevance**: Applicable to Swedish public sector
- ✅ **Practical utility**: Directly applicable to work tasks

#### **User Experience Validation**
- ✅ **Anna Svensson test**: Would this help Anna in her work?
- ✅ **Time constraint**: Completable during lunch break
- ✅ **Cognitive load**: Appropriate information density
- ✅ **Mobile usability**: Works perfectly on iPhone 12

#### **Technical Quality Standards**
- ✅ **Accessibility**: WCAG 2.1 AA compliant
- ✅ **Performance**: Loads quickly on mobile
- ✅ **Compatibility**: Works across devices and browsers
- ✅ **Maintainability**: Easy to update and modify

## Conclusion

These content templates provide a scalable foundation for rapid development of high-quality municipal training games. By focusing on Anna Svensson's needs and maintaining consistent quality standards, we can efficiently create engaging, relevant learning experiences that improve municipal service delivery across Sweden.

**Key Success Factors:**
- ✅ **Practical relevance** to daily municipal work
- ✅ **Time efficiency** for busy public servants
- ✅ **Quality consistency** across all content
- ✅ **Scalable processes** for rapid content creation

📝 **Great content templates don't just save time—they ensure every Swedish municipal employee gets the same high-quality learning experience that Anna Svensson deserves.** 🇸🇪