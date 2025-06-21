# Daily Quality Workflow - Quick Reference Guide

## 🌅 Varje Morgon (5 minuter)

### För Alla Specialister:
```bash
# 1. Kolla din specialist-fil för uppdateringar
# 2. Läs docs/quality/Q1-bug-report.md för nya buggar
# 3. Kontrollera design_dev_sync.json för team-updates
# 4. Se om du har bugs tilldelade som kräver åtgärder inom 48h
```

## 🛠️ Git Workflow för All Utveckling

### Starta Ny Feature:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/Q2-[beskrivning]
# Utveckla feature
git add -A
git commit -m "feat(Q2): [beskrivning]"
git push origin feature/Q2-[beskrivning]
# Skapa PR till develop
```

### Fixa Bugs:
```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/[kort-beskrivning]
# Fixa bug
git add -A  
git commit -m "fix: [beskrivning]"
git push origin bugfix/[kort-beskrivning]
# Skapa PR till develop
```

## 🧪 Automatiska Kvalitetskontroller

### Pre-commit (körs automatiskt):
- npm run lint
- npm run test:run  
- npm run test:security-suite

### Pre-merge till develop:
- Unit tests
- Integration tests
- Code review från relevant specialist

### Pre-merge till main:
- Fullständig testsvit
- E2E testing
- Performance benchmarks
- Security audit

## 🔍 Bug Response Process

### När Du Får Bug Tilldelad:
1. **Inom 24h:** Bekräfta mottagande i design_dev_sync.json
2. **Inom 48h:** Åtgärda tekniska problemet
3. **Inom 48h:** Dokumentera root cause analysis
4. **Inom 1 vecka:** Implementera prevention measures

### Bug Response Template:
```markdown
## Bug Fix Report - [SPECIALIST]

**Bug ID:** Q1-BUG-xxx
**Status:** ✅ RESOLVED

### Technical Fix:
- Problem: [Kort beskrivning]
- Solution: [Teknisk lösning]
- Files changed: [Lista filer]
- Tests added: [Nya tester]

### Root Cause Analysis:
- Why it happened: [Process/verktyg gap]
- Prevention strategy: [Framtida åtgärder]

### Process Improvements:
- [ ] Updated checklist/guidelines
- [ ] New automated tests
- [ ] Documentation updated
- [ ] Knowledge shared with team
```

## 📊 Daglig Status Update

### I design_dev_sync.json:
```json
{
  "[din_roll]": {
    "current_task": "task-xx-001 | Roadmap-Ref: Q2-GEI-2.1",
    "progress": "40% - [Status beskrivning]",
    "current_branch": "feature/Q2-improvement",
    "bugs_assigned": 2,
    "bugs_resolved": 1,
    "blockers": "None",
    "quality_impact": "[Påverkan på kvalitet]"
  }
}
```

## 🎯 Specialist-Specifika Ansvar

### System Architect:
- **Focus:** Configuration validation, dependency injection
- **Bug Types:** Infrastructure, deployment, performance
- **Daily Check:** Redis cluster, SAML setup, environment validation

### Security Specialist:  
- **Focus:** Security testing performance, threat validation
- **Bug Types:** SQL injection, XSS, data isolation
- **Daily Check:** Security test performance, compliance validation

### Test Engineer:
- **Focus:** Quality process leadership, testing automation
- **Bug Types:** Test framework, coverage gaps, performance regression
- **Daily Check:** Test suite health, quality metrics, bug assignment

### Game Designer:
- **Focus:** UX/UI consistency, accessibility compliance
- **Bug Types:** Design system, cultural adaptation, WCAG compliance
- **Daily Check:** Design consistency, accessibility validation

## 🚀 Quality Gates Checkliste

### Develop Branch Quality Gates:
- [ ] Unit tests pass (100%)
- [ ] Integration tests pass
- [ ] Code review approved
- [ ] No critical security vulnerabilities
- [ ] Performance regression < 5%

### Main Branch Quality Gates:
- [ ] All develop gates PLUS:
- [ ] E2E tests pass (100%)
- [ ] Real device testing complete
- [ ] Municipal compliance verified
- [ ] Load testing benchmarks met
- [ ] Security audit passed

## 📞 Escalation Process

### Kritiska Blockers:
1. Uppdatera design_dev_sync.json med "BLOCKER" status
2. Notifiera relevant specialist inom 2h
3. Om blocker > 24h, escalate to Head Developer

### Quality Issues:
1. Dokumentera i bug report format
2. Tilldela enligt specialist expertområde
3. Sätt 48h deadline för kritiska issues
4. Följ upp prevention implementation

Detta workflow säkerställer att kvalitetsprocessen blir en naturlig del av det dagliga arbetet utan att sakta ner utvecklingstakten.