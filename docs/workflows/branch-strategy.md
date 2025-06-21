# Git Branch Strategy - Kvalitetssäkrad Utveckling

## 🌳 Branch Structure

### Huvudbranches
```
main (production-ready)
  ├── develop (integration branch)
  │   ├── feature/Q2-drag-drop-workflows
  │   ├── feature/Q2-timer-challenges
  │   ├── bugfix/saml-swedish-municipality-id
  │   └── hotfix/redis-cluster-dependency
```

## 📋 Arbetsflöde

### 1. Main Branch (Produktion)
- **Syfte:** Endast produktionsklara releases
- **Merge Policy:** Endast från develop efter fullständig testning
- **Protection Rules:**
  - Kräver PR review från minst 2 specialister
  - Kräver att alla tester går igenom
  - Kräver quality gates (performance, security, accessibility)

### 2. Develop Branch (Integration)
- **Syfte:** Integration av alla nya features innan release
- **Merge Policy:** Feature branches mergas hit efter code review
- **Protection Rules:**
  - Kräver PR review från relevant specialist
  - Kräver unit tests och integration tests

### 3. Feature Branches
- **Namnkonvention:** `feature/Q[X]-[beskrivning]`
- **Syfte:** Utveckling av nya funktioner
- **Merge Policy:** Mergas till develop via PR

### 4. Bugfix Branches
- **Namnkonvention:** `bugfix/[kort-beskrivning]`
- **Syfte:** Åtgärda icke-kritiska buggar
- **Merge Policy:** Mergas till develop via PR

### 5. Hotfix Branches
- **Namnkonvention:** `hotfix/[kritisk-bugg]`
- **Syfte:** Kritiska buggar som behöver snabb fix
- **Merge Policy:** Kan mergas direkt till main OCH develop

## 🧪 Testing Strategy per Branch

### Pre-Merge till Develop
```bash
# Automatiska tester som körs på varje PR
npm run test:run              # Unit tests
npm run test:security-suite   # Security tests
npm run lint                  # Code quality
npm run test:accessibility    # WCAG compliance
```

### Pre-Merge till Main (Milestone Testing)
```bash
# Omfattande testning före release
npm run test:e2e              # End-to-end tests
npm run test:performance      # Performance benchmarks
npm run test:stress           # Load testing
npm run test:real-devices     # Real device testing
npm run test:compliance-gates # Municipal compliance
```

## 🚀 Release Process

### Q2 Milestone Example
1. **Feature Development (develop branch)**
   ```bash
   git checkout develop
   git checkout -b feature/Q2-municipal-workflows
   # Utveckla feature
   git push origin feature/Q2-municipal-workflows
   # Skapa PR till develop
   ```

2. **Integration Testing (develop branch)**
   ```bash
   # Efter merge till develop
   npm run test:integration
   npm run test:performance-regression
   ```

3. **Pre-Release Testing (staging)**
   ```bash
   # Deploy develop till staging
   npm run test:e2e:staging
   npm run test:real-devices
   npm run test:municipal-compliance
   ```

4. **Production Release (main branch)**
   ```bash
   # Om alla tester godkänns
   git checkout main
   git merge develop --no-ff
   git tag v2.0.0-Q2-complete
   git push origin main --tags
   ```

## 📊 Quality Gates

### Develop Branch Gates
- ✅ Unit test coverage > 90%
- ✅ No critical security vulnerabilities
- ✅ Performance regression < 5%
- ✅ Code review approved

### Main Branch Gates
- ✅ All develop gates PLUS:
- ✅ E2E test pass rate 100%
- ✅ Real device testing godkänt
- ✅ Municipal compliance verified
- ✅ Load testing benchmarks met
- ✅ Security audit passed

## 🛡️ Branch Protection Rules

### Main Branch Protection
```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "test/unit-tests",
      "test/e2e-tests", 
      "test/performance",
      "security/scan",
      "compliance/municipal"
    ]
  },
  "required_pull_request_reviews": {
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "enforce_admins": true
}
```

### Develop Branch Protection
```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "test/unit-tests",
      "test/integration",
      "lint/code-quality"
    ]
  },
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  }
}
```

## 🔧 Git Hooks Setup

### Pre-commit Hook (Utveckling)
```bash
#!/bin/bash
# Körs automatiskt vid varje commit
npm run lint
npm run test:run
npm run test:security-suite
```

### Pre-push Hook (Integration)
```bash
#!/bin/bash
# Körs automatiskt vid push till develop/main
if [[ $(git rev-parse --abbrev-ref HEAD) == "main" ]]; then
  npm run test:e2e
  npm run test:performance
fi
```

## 📝 Commit Message Standards
```
type(scope): beskrivning

feat(Q2-workflows): implementera drag-drop municipal document workflow
fix(saml): korrigera svenska kommun ID generation
docs(quality): uppdatera specialist feedback process
test(security): lägg till SQL injection prevention tests
perf(drag-drop): optimera touch gesture performance för iPhone 12
```

## 🎯 Specialist Responsibilities

### System Architect
- Review alla infrastructure-relaterade PRs
- Säkerställa architectural guidelines följs
- Performance testing coordination

### Security Specialist  
- Review alla security-relaterade ändringar
- Säkerställa security gates passeras
- Penetration testing coordination

### DevOps Specialist
- CI/CD pipeline maintenance
- Deployment automation
- Infrastructure monitoring

### Test Engineer
- Test strategy implementation
- Quality gates definition
- Test automation maintenance

Denna branch-strategi säkerställer att vi har en stabil main branch medan vi kan utveckla Q2 features parallellt med hög kvalitet.