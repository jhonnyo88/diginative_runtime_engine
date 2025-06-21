/**
 * AI Content Generation Load Tests
 * Task: proposal-029 - AI Content Stress Testing Framework
 * 
 * Tests AI content generation under peak municipal traffic
 * Validates performance during Monday morning rush and quarterly deadlines
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics for municipal compliance
const aiContentGenerationRate = new Rate('ai_content_generation_success');
const aiContentGenerationTime = new Trend('ai_content_generation_duration');
const municipalContextErrors = new Counter('municipal_context_errors');
const swedishContentValidation = new Rate('swedish_content_validation_success');

// Municipal test data
const municipalities = ['malmö', 'stockholm', 'göteborg', 'västerås', 'örebro'];
const userPersonas = [
  { name: 'Anna Svensson', department: 'IT', role: 'employee' },
  { name: 'Erik Andersson', department: 'HR', role: 'manager' },
  { name: 'Maria Lundberg', department: 'Economy', role: 'analyst' },
  { name: 'Johan Karlsson', department: 'Administration', role: 'coordinator' }
];

const contentTypes = [
  { type: 'gdpr_quiz', complexity: 'medium', expectedTokens: 500 },
  { type: 'security_training', complexity: 'high', expectedTokens: 800 },
  { type: 'digital_strategy', complexity: 'low', expectedTokens: 300 },
  { type: 'accessibility_training', complexity: 'medium', expectedTokens: 600 }
];

// Load testing scenarios
export const options = {
  scenarios: {
    // Monday Morning Rush: 500 municipal employees
    monday_morning_rush: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 50 },   // Gradual login 08:00-08:02
        { duration: '5m', target: 250 },  // Peak building 08:02-08:07
        { duration: '10m', target: 500 }, // Full peak 08:07-08:17
        { duration: '5m', target: 250 },  // Decline 08:17-08:22
        { duration: '3m', target: 50 },   // Normal levels 08:22-08:25
      ],
      gracefulRampDown: '2m',
      exec: 'municipalMorningRush',
    },

    // Quarterly Training Deadline: Massive concurrent load
    quarterly_deadline: {
      executor: 'ramping-vus',
      stages: [
        { duration: '5m', target: 100 },   // Initial load
        { duration: '10m', target: 1000 }, // Crisis mode
        { duration: '15m', target: 2000 }, // Peak panic
        { duration: '10m', target: 1000 }, // Settling
        { duration: '5m', target: 100 },   // Resolution
      ],
      gracefulRampDown: '3m',
      exec: 'quarterlyDeadlineCrisis',
      startTime: '30m', // Run after morning rush
    },

    // Municipal Integration Sync: Real-time system integration
    system_integration_sync: {
      executor: 'constant-vus',
      vus: 100,
      duration: '20m',
      exec: 'municipalSystemIntegration',
      startTime: '60m', // Run after other scenarios
    },

    // Anna Svensson 7-Minute Session: Critical path validation
    anna_svensson_session: {
      executor: 'per-vu-iterations',
      vus: 50,
      iterations: 10,
      maxDuration: '30m',
      exec: 'annaSvenssonCriticalPath',
      startTime: '90m', // Final validation
    }
  },
  
  thresholds: {
    // Municipal performance targets
    'ai_content_generation_duration': ['p(95)<3000'], // 95% under 3s
    'ai_content_generation_success': ['rate>0.95'],   // 95% success rate
    'http_req_duration': ['p(90)<2000'],              // 90% under 2s
    'http_req_failed': ['rate<0.05'],                 // <5% failure rate
    'swedish_content_validation_success': ['rate>0.98'], // 98% Swedish validation
    'municipal_context_errors': ['count<100'],        // <100 context errors total
  }
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';
const API_BASE = `${BASE_URL}/api`;

export function municipalMorningRush() {
  const municipality = municipalities[Math.floor(Math.random() * municipalities.length)];
  const user = userPersonas[Math.floor(Math.random() * userPersonas.length)];
  const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];

  // 1. Municipal SAML Authentication
  const authStart = Date.now();
  const authResponse = http.post(`${API_BASE}/auth/saml/login`, {
    municipality: municipality,
    user: user.name,
    department: user.department,
    role: user.role
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'sv-SE'
    }
  });

  check(authResponse, {
    'SAML auth successful': (r) => r.status === 200,
    'Municipal context set': (r) => r.json().municipality === municipality,
    'Swedish locale applied': (r) => r.json().language === 'sv-SE'
  });

  if (authResponse.status !== 200) {
    municipalContextErrors.add(1);
    return;
  }

  const authToken = authResponse.json().token;

  // 2. AI Content Generation Request
  const contentStart = Date.now();
  const aiContentResponse = http.post(`${API_BASE}/ai/generate-content`, {
    type: contentType.type,
    municipality: municipality,
    userContext: {
      name: user.name,
      department: user.department,
      role: user.role
    },
    requirements: {
      language: 'sv-SE',
      culturalContext: 'swedish_municipal',
      complexity: contentType.complexity,
      estimatedTokens: contentType.expectedTokens
    }
  }, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Accept-Language': 'sv-SE'
    }
  });

  const contentGenerationTime = Date.now() - contentStart;
  aiContentGenerationTime.add(contentGenerationTime);

  const contentSuccess = check(aiContentResponse, {
    'AI content generated': (r) => r.status === 200,
    'Content has Swedish text': (r) => {
      if (r.status === 200) {
        const content = r.json().content;
        return /[åäöÅÄÖ]/.test(content) || /\b(och|att|för|med|på|av)\b/.test(content);
      }
      return false;
    },
    'Municipal branding included': (r) => {
      if (r.status === 200) {
        const content = r.json().content;
        return content.includes(municipality) || content.includes('kommun');
      }
      return false;
    },
    'Content generation under 3s': (r) => contentGenerationTime < 3000,
    'Content validation passed': (r) => r.status === 200 && r.json().validated === true
  });

  aiContentGenerationRate.add(contentSuccess);

  if (aiContentResponse.status === 200) {
    const content = aiContentResponse.json().content;
    const hasSwedishText = /[åäöÅÄÖ]/.test(content) || /\b(och|att|för|med|på|av)\b/.test(content);
    swedishContentValidation.add(hasSwedishText);
  }

  // 3. Content Validation Pipeline
  if (aiContentResponse.status === 200) {
    const validationResponse = http.post(`${API_BASE}/validation/content`, {
      content: aiContentResponse.json().content,
      municipality: municipality,
      securityLevel: 'municipal_high'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    check(validationResponse, {
      'Content validation successful': (r) => r.status === 200,
      'XSS protection verified': (r) => r.status === 200 && r.json().xssClean === true,
      'Municipal compliance met': (r) => r.status === 200 && r.json().municipalCompliant === true
    });
  }

  // Simulate realistic user pause between requests
  sleep(Math.random() * 2 + 1); // 1-3 second pause
}

export function quarterlyDeadlineCrisis() {
  const municipality = municipalities[Math.floor(Math.random() * municipalities.length)];
  const user = userPersonas[Math.floor(Math.random() * userPersonas.length)];

  // High-frequency batch content generation during crisis
  const batchSize = Math.floor(Math.random() * 5) + 3; // 3-7 content pieces
  const batchRequest = {
    batchSize: batchSize,
    municipality: municipality,
    userContext: user,
    contentTypes: Array.from({ length: batchSize }, () => 
      contentTypes[Math.floor(Math.random() * contentTypes.length)]
    )
  };

  const batchStart = Date.now();
  const batchResponse = http.post(`${API_BASE}/ai/batch-generate`, batchRequest, {
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'sv-SE'
    }
  });

  const batchTime = Date.now() - batchStart;

  check(batchResponse, {
    'Batch generation successful': (r) => r.status === 200,
    'All batch items processed': (r) => {
      if (r.status === 200) {
        const results = r.json().results;
        return results.length === batchSize;
      }
      return false;
    },
    'Batch processing under 5s': (r) => batchTime < 5000,
    'Municipal isolation maintained': (r) => {
      if (r.status === 200) {
        const results = r.json().results;
        return results.every(result => result.municipality === municipality);
      }
      return false;
    }
  });

  // Minimal pause during crisis mode
  sleep(0.5);
}

export function municipalSystemIntegration() {
  const municipality = municipalities[Math.floor(Math.random() * municipalities.length)];
  
  // SharePoint integration sync
  const sharepointSync = http.post(`${API_BASE}/integration/sharepoint/sync`, {
    municipality: municipality,
    syncType: 'content_update',
    aiContentGeneration: true
  });

  check(sharepointSync, {
    'SharePoint sync successful': (r) => r.status === 200,
    'AI content adapted for SharePoint': (r) => r.status === 200 && r.json().adapted === true
  });

  // SAP SuccessFactors integration
  const sapSync = http.post(`${API_BASE}/integration/sap/employee-sync`, {
    municipality: municipality,
    generatePersonalizedContent: true
  });

  check(sapSync, {
    'SAP integration successful': (r) => r.status === 200,
    'Personalized content generated': (r) => r.status === 200 && r.json().personalizedContent === true
  });

  // Workday integration
  const workdaySync = http.post(`${API_BASE}/integration/workday/training-sync`, {
    municipality: municipality,
    aiContentRequirements: {
      language: 'sv-SE',
      municipalContext: true
    }
  });

  check(workdaySync, {
    'Workday integration successful': (r) => r.status === 200,
    'Municipal training content synced': (r) => r.status === 200 && r.json().trainingSynced === true
  });

  sleep(1);
}

export function annaSvenssonCriticalPath() {
  console.log('🎯 Testing Anna Svensson 7-minute critical path...');
  
  const sessionStart = Date.now();
  
  // 0-30s: Login and municipal context loading
  const loginStart = Date.now();
  const loginResponse = http.post(`${API_BASE}/auth/municipal-login`, {
    username: 'anna.svensson@malmo.se',
    municipality: 'malmö',
    department: 'IT',
    device: 'iPhone 12'
  });

  const loginTime = Date.now() - loginStart;
  
  check(loginResponse, {
    'Anna login successful': (r) => r.status === 200,
    'Login under 5s': (r) => loginTime < 5000,
    'Malmö context loaded': (r) => r.status === 200 && r.json().municipality === 'malmö'
  });

  if (loginResponse.status !== 200) return;

  const authToken = loginResponse.json().token;
  
  // 30s-2min: AI content generation for personalized GDPR quiz
  const contentStart = Date.now();
  const personalizedContent = http.post(`${API_BASE}/ai/personalized-quiz`, {
    userProfile: {
      name: 'Anna Svensson',
      municipality: 'malmö',
      department: 'IT',
      previousQuizzes: ['basic_gdpr', 'data_security'],
      competencyLevel: 'intermediate'
    },
    quizRequirements: {
      duration: '7_minutes',
      focusAreas: ['gdpr_compliance', 'municipal_data_handling'],
      language: 'sv-SE',
      culturalContext: 'malmö_municipal'
    }
  }, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });

  const contentGenerationTime = Date.now() - contentStart;
  
  check(personalizedContent, {
    'Personalized content generated': (r) => r.status === 200,
    'Content generation under 90s': (r) => contentGenerationTime < 90000,
    'Quiz tailored for Anna': (r) => {
      if (r.status === 200) {
        const quiz = r.json().quiz;
        return quiz.targetUser === 'Anna Svensson' && quiz.municipality === 'malmö';
      }
      return false;
    },
    'Swedish GDPR content': (r) => {
      if (r.status === 200) {
        const content = r.json().quiz.questions[0].question;
        return content.includes('GDPR') && /[åäöÅÄÖ]/.test(content);
      }
      return false;
    }
  });

  if (personalizedContent.status !== 200) return;

  // 2-6min: Interactive quiz with real-time validation
  const quiz = personalizedContent.json().quiz;
  const quizStart = Date.now();
  
  quiz.questions.forEach((question, index) => {
    const answerStart = Date.now();
    
    // Simulate Anna answering question
    const answerResponse = http.post(`${API_BASE}/quiz/answer`, {
      quizId: quiz.id,
      questionId: question.id,
      answer: question.options[0].text, // Always pick first option
      timestamp: Date.now(),
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const answerTime = Date.now() - answerStart;
    
    check(answerResponse, {
      [`Question ${index + 1} answered`]: (r) => r.status === 200,
      [`Answer validation under 1s`]: (r) => answerTime < 1000,
      [`Real-time feedback provided`]: (r) => r.status === 200 && r.json().feedback !== undefined
    });

    // Simulate Anna's reading time
    sleep(Math.random() * 30 + 15); // 15-45 seconds per question
  });

  const quizTime = Date.now() - quizStart;
  
  // 6-7min: Progress saving and achievement generation
  const saveStart = Date.now();
  const progressSave = http.post(`${API_BASE}/progress/save`, {
    userId: 'anna.svensson',
    quizId: quiz.id,
    municipality: 'malmö',
    completionData: {
      totalTime: quizTime,
      score: Math.floor(Math.random() * 20) + 80, // 80-100% score
      achievements: ['gdpr_expert', 'quick_learner']
    }
  }, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });

  const saveTime = Date.now() - saveStart;
  const totalSessionTime = Date.now() - sessionStart;
  
  check(progressSave, {
    'Progress saved successfully': (r) => r.status === 200,
    'Save under 10s': (r) => saveTime < 10000,
    'Achievements generated': (r) => r.status === 200 && r.json().achievements.length > 0,
    'Total session under 7 minutes': (r) => totalSessionTime < 420000, // 7 minutes
    'Anna session successful': (r) => r.status === 200 && totalSessionTime < 420000
  });

  console.log(`✅ Anna Svensson session completed in ${Math.round(totalSessionTime/1000)}s`);
}

// Teardown function for cleanup
export function teardown(data) {
  console.log('🧹 Cleaning up stress test data...');
  
  // Clean up any test data created during stress testing
  const cleanupResponse = http.delete(`${API_BASE}/test/cleanup`, {
    testRun: 'ai_content_stress_test',
    timestamp: Date.now()
  });

  console.log(`Cleanup response: ${cleanupResponse.status}`);
}