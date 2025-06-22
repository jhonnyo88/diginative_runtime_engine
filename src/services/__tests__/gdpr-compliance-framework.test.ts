/**
 * GDPR Compliance Framework - Emergency Service Testing
 * Tests EU compliance validation and audit functionality
 * 
 * Emergency Implementation - Critical Service Layer Testing
 * Roadmap Ref: Q1-Foundation-Autonomi-Milestone-1.1
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  EUComplianceManager,
  type ComplianceValidation,
  type PersonalData,
  type ProcessingPurpose,
  type ComplianceAuditReport
} from '../gdpr-compliance-framework';
import { 
  ServiceMockFactory, 
  MockInfrastructureMonitoring,
  MockErrorMonitoring,
  MockProvider 
} from './mocks/service-mocks';

// Mock external dependencies
vi.mock('../infrastructure-monitoring', () => ({
  InfrastructureMonitoring: {
    getInstance: () => ServiceMockFactory.create(MockInfrastructureMonitoring)
  }
}));

vi.mock('../error-monitoring', () => ({
  errorMonitoring: ServiceMockFactory.create(MockErrorMonitoring)
}));

describe('EUComplianceManager - Emergency Service Testing', () => {
  let complianceManager: EUComplianceManager;
  let monitoringMock: MockInfrastructureMonitoring;
  let errorMonitoringMock: MockErrorMonitoring;
  
  beforeEach(() => {
    // Reset all mocks
    ServiceMockFactory.resetAll();
    vi.clearAllMocks();
    
    // Create service instance
    complianceManager = new EUComplianceManager();
    
    // Get mock references
    monitoringMock = ServiceMockFactory.get('MockInfrastructureMonitoring') as MockInfrastructureMonitoring;
    errorMonitoringMock = ServiceMockFactory.get('MockErrorMonitoring') as MockErrorMonitoring;
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  describe('Jurisdiction-Specific Legal Basis Validation', () => {
    it('should determine correct German BDSG legal basis for municipal training', async () => {
      // Arrange
      const personalData: PersonalData = {
        category: 'user_data',
        sensitivity: 'normal',
        subjects: ['municipal_employee']
      };
      
      const purpose: ProcessingPurpose = {
        type: 'municipal_training',
        description: 'Employee competency development',
        municipal_context: 'malmo_stad_training'
      };
      
      // Act
        personalData,
        purpose,
        'DE',
        'berlin_de'
      );
      
      // Assert
      expect(validation.isCompliant).toBe(true);
      expect(validation.jurisdiction).toBe('DE');
      expect(validation.legalBasis.article).toBe('Art. 6(1)(e) DSGVO');
      expect(validation.legalBasis.german_specification).toContain('Wahrnehmung einer Aufgabe im öffentlichen Interesse');
      expect(validation.securityMeasures.encryption.minimum_standard).toBe('AES-256');
      expect(validation.retentionPeriod.period).toBe('6 years (German municipal requirements)');
    });
    
    it('should determine correct French RGPD legal basis for municipal training', async () => {
      // Arrange
      const personalData: PersonalData = {
        category: 'user_data', 
        sensitivity: 'normal',
        subjects: ['municipal_employee']
      };
      
      const purpose: ProcessingPurpose = {
        type: 'municipal_training',
        description: 'Formation professionnelle municipale',
        municipal_context: 'paris_fr_training'
      };
      
      // Act
        personalData,
        purpose,
        'FR',
        'paris_fr'
      );
      
      // Assert
      expect(validation.isCompliant).toBe(true);
      expect(validation.jurisdiction).toBe('FR');
      expect(validation.legalBasis.article).toBe('Art. 6(1)(e) RGPD');
      expect(validation.legalBasis.french_specification).toContain('Formation du personnel municipal');
      expect(validation.legalBasis.cnil_guidance).toContain('Délibération CNIL');
      expect(validation.retentionPeriod.period).toBe('5 years (French administrative requirements)');
    });
    
    it('should determine correct Dutch AVG legal basis for municipal training', async () => {
      // Arrange
      const personalData: PersonalData = {
        category: 'user_data',
        sensitivity: 'normal', 
        subjects: ['municipal_employee']
      };
      
      const purpose: ProcessingPurpose = {
        type: 'municipal_training',
        description: 'Gemeentelijke training programma',
        municipal_context: 'amsterdam_nl_training'
      };
      
      // Act
        personalData,
        purpose,
        'NL',
        'amsterdam_nl'
      );
      
      // Assert
      expect(validation.isCompliant).toBe(true);
      expect(validation.jurisdiction).toBe('NL');
      expect(validation.legalBasis.article).toBe('Art. 6(1)(e) AVG');
      expect(validation.legalBasis.dutch_specification).toContain('Gemeentelijke training');
      expect(validation.legalBasis.proportionality_assessment).toBe('Required under Dutch law');
    });
    
    it('should determine correct Swedish GDPR legal basis for municipal training', async () => {
      // Arrange
      const personalData: PersonalData = {
        category: 'user_data',
        sensitivity: 'normal',
        subjects: ['municipal_employee']
      };
      
      const purpose: ProcessingPurpose = {
        type: 'municipal_training',
        description: 'Kommunal kompetensutveckling',
        municipal_context: 'malmo_stad_training'
      };
      
      // Act
        personalData,
        purpose,
        'SE',
        'malmo_stad'
      );
      
      // Assert
      expect(validation.isCompliant).toBe(true);
      expect(validation.jurisdiction).toBe('SE');
      expect(validation.legalBasis.article).toBe('Art. 6(1)(e) GDPR');
      expect(validation.legalBasis.swedish_specification).toContain('Kommunal kompetensutveckling');
      expect(validation.legalBasis.municipal_mandate).toBe('Kommunallagen kap. 2 § 1');
    });
  });
  
  describe('Data Subject Rights Implementation', () => {
    it('should provide correct rights for German jurisdiction', async () => {
      // Arrange
      const personalData: PersonalData = {
        category: 'analytics_data',
        sensitivity: 'low',
        subjects: ['anonymous_user']
      };
      
      const purpose: ProcessingPurpose = {
        type: 'analytics',
        description: 'Service improvement analytics',
        municipal_context: 'berlin_de_analytics'
      };
      
      // Act
        personalData,
        purpose,
        'DE',
        'berlin_de'
      );
      
      // Assert
      expect(rights).toContain('right_to_information');
      expect(rights).toContain('right_of_access');
      expect(rights).toContain('right_to_rectification');
      expect(rights).toContain('right_to_erasure');
      expect(rights).toContain('right_to_compensation_german_law');
      expect(validation.applicableRights.response_timeline).toBe('1 month (German efficiency)');
    });
    
    it('should provide correct rights for Swedish jurisdiction with Offentlighetsprincipen', async () => {
      // Arrange
      const personalData: PersonalData = {
        category: 'user_data',
        sensitivity: 'normal',
        subjects: ['municipal_employee']
      };
      
      const purpose: ProcessingPurpose = {
        type: 'municipal_training',
        description: 'Kommunal utbildning',
        municipal_context: 'malmo_stad_training'
      };
      
      // Act
        personalData,
        purpose,
        'SE',
        'malmo_stad'
      );
      
      // Assert
      expect(rights).toContain('right_to_datainspektionen_complaint');
      expect(rights).toContain('offentlighetsprincipen_rights');
      expect(validation.applicableRights.exercise_mechanisms).toContain('SE specific rights exercise procedures');
    });
  });
  
  describe('Security Measures Validation', () => {
    it('should enforce AES-256 encryption for all jurisdictions', async () => {
      
      for (const jurisdiction of jurisdictions) {
        // Arrange
        const personalData: PersonalData = {
          category: 'user_data',
          sensitivity: 'high',
          subjects: ['municipal_employee']
        };
        
        const purpose: ProcessingPurpose = {
          type: 'municipal_training',
          description: 'Training data processing',
          municipal_context: `${jurisdiction.toLowerCase()}_training`
        };
        
        // Act
          personalData,
          purpose,
          jurisdiction,
          `test_${jurisdiction.toLowerCase()}`
        );
        
        // Assert
        expect(validation.securityMeasures.encryption.minimum_standard).toBe('AES-256');
        expect(validation.securityMeasures.access_controls.role_based).toBeDefined();
        expect(validation.securityMeasures.monitoring.security_monitoring).toBe('24/7 automated monitoring');
      }
    });
    
    it('should apply jurisdiction-specific key management requirements', async () => {
      // Test German HSM requirement
      const personalDataDE: PersonalData = {
        category: 'user_data',
        sensitivity: 'high',
        subjects: ['municipal_employee']
      };
      
      const purposeDE: ProcessingPurpose = {
        type: 'municipal_training',
        description: 'Sensitive training data',
        municipal_context: 'berlin_de_sensitive'
      };
      
        personalDataDE,
        purposeDE,
        'DE',
        'berlin_de'
      );
      
      expect(validationDE.securityMeasures.encryption.key_management).toBe('HSM required for municipal data');
    });
  });
  
  describe('Retention Period Calculation', () => {
    it('should calculate correct retention periods per jurisdiction', async () => {
      
      for (const testCase of testCases) {
        const personalData: PersonalData = {
          category: 'user_data',
          sensitivity: 'normal',
          subjects: ['municipal_employee']
        };
        
        const purpose: ProcessingPurpose = {
          type: 'municipal_training',
          description: 'Training data',
          municipal_context: `${testCase.jurisdiction.toLowerCase()}_training`
        };
        
          personalData,
          purpose,
          testCase.jurisdiction,
          `test_${testCase.jurisdiction.toLowerCase()}`
        );
        
        expect(validation.retentionPeriod.period).toBe(testCase.expected);
        expect(validation.retentionPeriod.automated_deletion).toBe(true);
        expect(validation.retentionPeriod.deletion_method).toBe('Secure deletion with audit trail');
      }
    });
  });
  
  describe('Compliance Audit Functionality', () => {
    it('should perform comprehensive compliance audit for tenant', async () => {
      // Act
      
      // Assert
      expect(auditReport).toBeDefined();
      expect(auditReport.tenantId).toBe('malmo_stad');
      expect(auditReport.jurisdiction).toBe('SE');
      expect(auditReport.complianceScore).toBeGreaterThanOrEqual(0);
      expect(auditReport.complianceScore).toBeLessThanOrEqual(100);
      expect(auditReport.auditDate).toBeDefined();
      expect(auditReport.nextAuditDate).toBeDefined();
      expect(Array.isArray(auditReport.findings)).toBe(true);
      expect(Array.isArray(auditReport.recommendations)).toBe(true);
    });
    
    it('should calculate next audit date correctly per jurisdiction', async () => {
      
      for (const jurisdiction of jurisdictions) {
          `test_${jurisdiction.toLowerCase()}`,
          jurisdiction
        );
        
        const _monthsDiff = (nextAuditDate.getFullYear() - currentDate.getFullYear()) * 12 + 
                          (nextAuditDate.getMonth() - currentDate.getMonth());
        
        // German, Dutch, Swedish: 12 months, French: 18 months
        expect(monthsDiff).toBeCloseTo(expectedMonths, 0);
      }
    });
  });
  
  describe('Error Handling and Edge Cases', () => {
    it('should throw error for unknown jurisdiction', async () => {
      // Arrange
      const personalData: PersonalData = {
        category: 'user_data',
        sensitivity: 'normal',
        subjects: ['municipal_employee']
      };
      
      const purpose: ProcessingPurpose = {
        type: 'municipal_training',
        description: 'Training',
        municipal_context: 'unknown_context'
      };
      
      // Act & Assert
      await expect(
        complianceManager.validateProcessing(
          personalData,
          purpose,
          'XX' as any,
          'unknown_tenant'
        )
      ).rejects.toThrow('Compliance rules not found för jurisdiction: XX');
    });
    
    it('should throw error for unsupported processing purpose', async () => {
      // Arrange
      const personalData: PersonalData = {
        category: 'user_data',
        sensitivity: 'normal',
        subjects: ['municipal_employee']
      };
      
      const purpose: ProcessingPurpose = {
        type: 'unknown_purpose',
        description: 'Unknown processing',
        municipal_context: 'test_context'
      };
      
      // Act & Assert
      await expect(
        complianceManager.validateProcessing(
          personalData,
          purpose,
          'DE',
          'test_tenant'
        )
      ).rejects.toThrow('No legal basis found för purpose: unknown_purpose in Germany');
    });
    
    it('should handle compliance audit failures gracefully', async () => {
      // Arrange - Create a new manager with failing audit logger
      
      // Mock the audit logger to throw an error
      (failingManager as any).auditLogger = {
        generateComplianceReport: vi.fn().mockRejectedValue(new Error('Audit system unavailable'))
      };
      
      // Act & Assert
      await expect(
        failingManager.performComplianceAudit('failing_tenant', 'DE')
      ).rejects.toThrow('Compliance audit failed för tenant failing_tenant');
    });
  });
  
  describe('Performance and Concurrent Operations', () => {
    it('should handle multiple concurrent validation requests', async () => {
      // Arrange
      
      for (let i = 0; i < 50; i++) {
        const personalData: PersonalData = {
          category: 'user_data',
          sensitivity: 'normal',
          subjects: ['municipal_employee']
        };
        
        const purpose: ProcessingPurpose = {
          type: 'municipal_training',
          description: `Concurrent validation ${i}`,
          municipal_context: `concurrent_${jurisdiction.toLowerCase()}_${i}`
        };
        
        validationPromises.push(
          complianceManager.validateProcessing(
            personalData,
            purpose,
            jurisdiction,
            `tenant_${i}`
          )
        );
      }
      
      // Act
      
      // Assert
      expect(results).toHaveLength(50);
      results.forEach(result => {
        expect(result.isCompliant).toBe(true);
        expect(result.validationTimestamp).toBeDefined();
      });
      
      // Performance assertion: Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second for 50 validations
    });
    
    it('should complete validation within performance budget', async () => {
      // Arrange
      const durations: number[] = [];
      
      // Act
      for (let i = 0; i < iterations; i++) {
        
        await complianceManager.validateProcessing(
          {
            category: 'user_data',
            sensitivity: 'normal',
            subjects: ['municipal_employee']
          },
          {
            type: 'municipal_training',
            description: `Performance test ${i}`,
            municipal_context: `perf_test_${i}`
          },
          'SE',
          'malmo_stad'
        );
        
        durations.push(Date.now() - start);
      }
      
      // Assert
      
      expect(avgDuration).toBeLessThan(maxDurationMs);
      expect(maxDuration).toBeLessThan(maxDurationMs * 3); // Allow some variance
    });
  });
  
  describe('Municipal Context Integration', () => {
    
    municipalScenarios.forEach(scenario => {
      it(`should handle ${scenario.municipality} compliance correctly`, async () => {
        // Arrange
        const personalData: PersonalData = {
          category: 'user_data',
          sensitivity: 'normal',
          subjects: ['municipal_employee']
        };
        
        const purpose: ProcessingPurpose = {
          type: 'municipal_training',
          description: `${scenario.municipality} employee training`,
          municipal_context: `${scenario.tenantId}_employee_development`
        };
        
        // Act
          personalData,
          purpose,
          scenario.jurisdiction,
          scenario.tenantId
        );
        
        // Assert
        expect(validation.isCompliant).toBe(true);
        expect(validation.jurisdiction).toBe(scenario.jurisdiction);
        expect(validation.tenantId).toBe(scenario.tenantId);
        expect(validation.legalBasis.article).toContain('Art. 6(1)(e)');
        
        // Verify jurisdiction-specific compliance requirements
        expect(validation.auditRequirements.documentation_standards).toContain(scenario.jurisdiction);
        expect(validation.retentionPeriod.jurisdiction_specific).toContain(scenario.jurisdiction);
      });
    });
  });
});