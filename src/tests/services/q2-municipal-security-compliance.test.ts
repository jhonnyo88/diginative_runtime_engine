/**
 * Q2 Municipal Security and Compliance Framework Test Suite
 * Government-grade security testing for Q2 interactive mechanics with European data sovereignty
 * 
 * PROPOSAL-042: European government deployment security framework
 * Coverage: Q2 security + European compliance + Penetration testing + Cross-border encryption
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  Q2MunicipalSecurityEngine,
  Q2SecurityContext,
  EuropeanDataSovereigntyConfig,
  MunicipalTenantIsolation,
  Q2InteractionAuditLog
} from '../../services/q2-municipal-security-compliance';

describe('Q2 Municipal Security and Compliance Framework', () => {
  let securityEngine: Q2MunicipalSecurityEngine;

  beforeEach(() => {
    securityEngine = new Q2MunicipalSecurityEngine();
  });

  describe('Q2 Mechanic Security Establishment', () => {
    it('should establish government-grade security for drag-drop mechanic', async () => {
      const securityConfig = {
        country: 'sweden',
        dataTypes: ['municipal_workflows', 'citizen_requests'],
        userRoles: ['municipal_employee', 'administrator']
      };

      const securityContext = await securityEngine.establishQ2MechanicSecurity(
        'malmo_stad',
        'drag_drop',
        securityConfig
      );

      expect(securityContext.mechanicType).toBe('drag_drop');
      expect(securityContext.interactionLevel).toBe('municipal_internal');
      expect(securityContext.dataClassification).toBe('internal');
      expect(securityContext.encryptionRequired).toBe(false);
      expect(securityContext.auditTrailRequired).toBe(true);
      expect(securityContext.complianceFrameworks).toContain('gdpr');
      expect(securityContext.complianceFrameworks).toContain('kommunallagen');
    });

    it('should establish enhanced security for character system with citizen data', async () => {
      const securityConfig = {
        country: 'germany',
        dataTypes: ['citizen_personal_data', 'character_interactions'],
        userRoles: ['citizen', 'municipal_employee']
      };

      const securityContext = await securityEngine.establishQ2MechanicSecurity(
        'berlin_de',
        'character_system',
        securityConfig
      );

      expect(securityContext.mechanicType).toBe('character_system');
      expect(securityContext.interactionLevel).toBe('citizen_data');
      expect(securityContext.dataClassification).toBe('confidential');
      expect(securityContext.encryptionRequired).toBe(true);
      expect(securityContext.auditTrailRequired).toBe(true);
      expect(securityContext.complianceFrameworks).toContain('gdpr');
      expect(securityContext.complianceFrameworks).toContain('gemeindeordnung');
    });

    it('should establish restricted security for timed challenge emergency scenarios', async () => {
      const securityConfig = {
        country: 'france',
        dataTypes: ['emergency_response', 'resource_allocation'],
        userRoles: ['emergency_coordinator', 'municipal_admin']
      };

      const securityContext = await securityEngine.establishQ2MechanicSecurity(
        'paris_fr',
        'timed_challenge',
        securityConfig
      );

      expect(securityContext.mechanicType).toBe('timed_challenge');
      expect(securityContext.interactionLevel).toBe('emergency_response');
      expect(securityContext.dataClassification).toBe('restricted');
      expect(securityContext.encryptionRequired).toBe(true);
      expect(securityContext.auditTrailRequired).toBe(true);
      expect(securityContext.complianceFrameworks).toContain('gdpr');
      expect(securityContext.complianceFrameworks).toContain('cgct');
    });

    it('should establish security for branching narrative with municipal data', async () => {
      const securityConfig = {
        country: 'netherlands',
        dataTypes: ['decision_scenarios', 'municipal_policies'],
        userRoles: ['policy_maker', 'department_head']
      };

      const securityContext = await securityEngine.establishQ2MechanicSecurity(
        'amsterdam_nl',
        'branching_narrative',
        securityConfig
      );

      expect(securityContext.mechanicType).toBe('branching_narrative');
      expect(securityContext.interactionLevel).toBe('municipal_internal');
      expect(securityContext.dataClassification).toBe('internal');
      expect(securityContext.encryptionRequired).toBe(false);
      expect(securityContext.auditTrailRequired).toBe(true);
      expect(securityContext.complianceFrameworks).toContain('gdpr');
      expect(securityContext.complianceFrameworks).toContain('gemeentewet');
    });

    it('should establish security for achievement system with confidential data', async () => {
      const securityConfig = {
        country: 'sweden',
        dataTypes: ['professional_assessments', 'competency_data'],
        userRoles: ['municipal_employee', 'hr_manager']
      };

      const securityContext = await securityEngine.establishQ2MechanicSecurity(
        'goteborg_se',
        'achievement_system',
        securityConfig
      );

      expect(securityContext.mechanicType).toBe('achievement_system');
      expect(securityContext.interactionLevel).toBe('municipal_internal');
      expect(securityContext.dataClassification).toBe('confidential');
      expect(securityContext.encryptionRequired).toBe(true);
      expect(securityContext.auditTrailRequired).toBe(true);
      expect(securityContext.complianceFrameworks).toContain('gdpr');
      expect(securityContext.complianceFrameworks).toContain('kommunallagen');
    });

    it('should emit security establishment event', async () => {
      let securityEvent: Record<string, unknown> = null;
      securityEngine.on('q2_mechanic_security_established', (event) => {
        securityEvent = event;
      });

      const securityConfig = {
        country: 'germany',
        dataTypes: ['test_data'],
        userRoles: ['test_user']
      };

      await securityEngine.establishQ2MechanicSecurity(
        'test_municipality',
        'drag_drop',
        securityConfig
      );

      expect(securityEvent).toBeDefined();
      expect(securityEvent.municipalityId).toBe('test_municipality');
      expect(securityEvent.mechanicType).toBe('drag_drop');
      expect(securityEvent.securityLevel).toBe('internal');
      expect(securityEvent.complianceFrameworks).toContain('gdpr');
      expect(securityEvent.complianceFrameworks).toContain('gemeindeordnung');
    });
  });

  describe('Municipal Tenant Isolation', () => {
    it('should establish government-grade isolation for Swedish municipality', async () => {
      const sovereigntyConfig: EuropeanDataSovereigntyConfig = {
        country: 'sweden',
        dataResidencyRegion: 'nordics',
        nationalDataProtectionLaw: 'kommunallagen',
        crossBorderDataFlowRestrictions: ['non_eu_countries'],
        citizenDataRights: {
          rightToAccess: true,
          rightToRectification: true,
          rightToErasure: true,
          rightToDataPortability: true,
          rightToObject: true,
          rightToRestrictProcessing: true,
          notificationRequirements: ['72_hour_breach_notification']
        },
        municipalDataClassification: {
          citizenPersonalData: 'confidential',
          municipalOperations: 'internal',
          publicServices: 'public',
          emergencyResponse: 'restricted',
          crossMunicipalCooperation: 'confidential',
          auditTrails: 'restricted'
        },
        auditRequirements: {
          retentionPeriodYears: 7,
          auditLogEncryption: true,
          realTimeMonitoring: true,
          complianceReporting: true,
          incidentResponseRequired: true
        }
      };

      const tenantIsolation = await securityEngine.establishMunicipalTenantIsolation(
        'stockholm_se',
        sovereigntyConfig
      );

      expect(tenantIsolation.tenantId).toBe('stockholm_se');
      expect(tenantIsolation.isolationLevel).toBe('government_grade');
      expect(tenantIsolation.networkSegmentation).toBeDefined();
      expect(tenantIsolation.dataEncryption).toBeDefined();
      expect(tenantIsolation.accessControls).toBeDefined();
      expect(tenantIsolation.auditTrail).toBeDefined();
      expect(tenantIsolation.complianceMonitoring).toBeDefined();
    });

    it('should establish German municipality with BDSG compliance', async () => {
      const sovereigntyConfig: EuropeanDataSovereigntyConfig = {
        country: 'germany',
        dataResidencyRegion: 'germany',
        nationalDataProtectionLaw: 'gemeindeordnung',
        crossBorderDataFlowRestrictions: ['non_eu_countries', 'specific_agreements_required'],
        citizenDataRights: {
          rightToAccess: true,
          rightToRectification: true,
          rightToErasure: true,
          rightToDataPortability: true,
          rightToObject: true,
          rightToRestrictProcessing: true,
          notificationRequirements: ['immediate_authority_notification', '72_hour_citizen_notification']
        },
        municipalDataClassification: {
          citizenPersonalData: 'confidential',
          municipalOperations: 'internal',
          publicServices: 'public',
          emergencyResponse: 'restricted',
          crossMunicipalCooperation: 'confidential',
          auditTrails: 'restricted'
        },
        auditRequirements: {
          retentionPeriodYears: 10,
          auditLogEncryption: true,
          realTimeMonitoring: true,
          complianceReporting: true,
          incidentResponseRequired: true
        }
      };

      const tenantIsolation = await securityEngine.establishMunicipalTenantIsolation(
        'munich_de',
        sovereigntyConfig
      );

      expect(tenantIsolation.tenantId).toBe('munich_de');
      expect(tenantIsolation.isolationLevel).toBe('government_grade');
    });

    it('should establish French municipality with CNIL compliance', async () => {
      const sovereigntyConfig: EuropeanDataSovereigntyConfig = {
        country: 'france',
        dataResidencyRegion: 'france',
        nationalDataProtectionLaw: 'cgct',
        crossBorderDataFlowRestrictions: ['non_eu_countries', 'ministerial_approval_required'],
        citizenDataRights: {
          rightToAccess: true,
          rightToRectification: true,
          rightToErasure: true,
          rightToDataPortability: true,
          rightToObject: true,
          rightToRestrictProcessing: true,
          notificationRequirements: ['cnil_notification', 'prefect_notification']
        },
        municipalDataClassification: {
          citizenPersonalData: 'confidential',
          municipalOperations: 'internal',
          publicServices: 'public',
          emergencyResponse: 'restricted',
          crossMunicipalCooperation: 'confidential',
          auditTrails: 'restricted'
        },
        auditRequirements: {
          retentionPeriodYears: 5,
          auditLogEncryption: true,
          realTimeMonitoring: true,
          complianceReporting: true,
          incidentResponseRequired: true
        }
      };

      const tenantIsolation = await securityEngine.establishMunicipalTenantIsolation(
        'lyon_fr',
        sovereigntyConfig
      );

      expect(tenantIsolation.tenantId).toBe('lyon_fr');
      expect(tenantIsolation.isolationLevel).toBe('government_grade');
    });

    it('should establish Dutch municipality with AP compliance', async () => {
      const sovereigntyConfig: EuropeanDataSovereigntyConfig = {
        country: 'netherlands',
        dataResidencyRegion: 'netherlands',
        nationalDataProtectionLaw: 'gemeentewet',
        crossBorderDataFlowRestrictions: ['non_eu_countries'],
        citizenDataRights: {
          rightToAccess: true,
          rightToRectification: true,
          rightToErasure: true,
          rightToDataPortability: true,
          rightToObject: true,
          rightToRestrictProcessing: true,
          notificationRequirements: ['ap_notification', 'municipal_notification']
        },
        municipalDataClassification: {
          citizenPersonalData: 'confidential',
          municipalOperations: 'internal',
          publicServices: 'public',
          emergencyResponse: 'restricted',
          crossMunicipalCooperation: 'confidential',
          auditTrails: 'restricted'
        },
        auditRequirements: {
          retentionPeriodYears: 7,
          auditLogEncryption: true,
          realTimeMonitoring: true,
          complianceReporting: true,
          incidentResponseRequired: true
        }
      };

      const tenantIsolation = await securityEngine.establishMunicipalTenantIsolation(
        'rotterdam_nl',
        sovereigntyConfig
      );

      expect(tenantIsolation.tenantId).toBe('rotterdam_nl');
      expect(tenantIsolation.isolationLevel).toBe('government_grade');
    });

    it('should emit tenant isolation event', async () => {
      let isolationEvent: Record<string, unknown> = null;
      securityEngine.on('municipal_tenant_isolation_established', (event) => {
        isolationEvent = event;
      });

      const sovereigntyConfig: EuropeanDataSovereigntyConfig = {
        country: 'sweden',
        dataResidencyRegion: 'nordics',
        nationalDataProtectionLaw: 'kommunallagen',
        crossBorderDataFlowRestrictions: [],
        citizenDataRights: {
          rightToAccess: true,
          rightToRectification: true,
          rightToErasure: true,
          rightToDataPortability: true,
          rightToObject: true,
          rightToRestrictProcessing: true,
          notificationRequirements: []
        },
        municipalDataClassification: {
          citizenPersonalData: 'confidential',
          municipalOperations: 'internal',
          publicServices: 'public',
          emergencyResponse: 'restricted',
          crossMunicipalCooperation: 'confidential',
          auditTrails: 'restricted'
        },
        auditRequirements: {
          retentionPeriodYears: 7,
          auditLogEncryption: true,
          realTimeMonitoring: true,
          complianceReporting: true,
          incidentResponseRequired: true
        }
      };

      await securityEngine.establishMunicipalTenantIsolation(
        'test_isolation_municipality',
        sovereigntyConfig
      );

      expect(isolationEvent).toBeDefined();
      expect(isolationEvent.municipalityId).toBe('test_isolation_municipality');
      expect(isolationEvent.isolationLevel).toBe('government_grade');
      expect(isolationEvent.dataResidencyRegion).toBe('nordics');
      expect(isolationEvent.complianceFrameworks).toContain('kommunallagen');
    });
  });

  describe('Q2 Interaction Audit Logging', () => {
    beforeEach(async () => {
      // Setup security context for testing
      const securityConfig = {
        country: 'sweden',
        dataTypes: ['test_data'],
        userRoles: ['test_user']
      };

      await securityEngine.establishQ2MechanicSecurity(
        'test_municipality',
        'drag_drop',
        securityConfig
      );
    });

    it('should log drag-drop interaction with comprehensive audit trail', async () => {
      const interactionData = {
        type: 'document_workflow',
        dataFields: ['document_id', 'workflow_status', 'user_action'],
        userRole: 'municipal_employee'
      };

      const auditLog = await securityEngine.logQ2Interaction(
        'test_municipality',
        'user123',
        'drag_drop',
        interactionData
      );

      expect(auditLog.logId).toBeDefined();
      expect(auditLog.municipalityId).toBe('test_municipality');
      expect(auditLog.userId).toBe('user123');
      expect(auditLog.mechanicType).toBe('drag_drop');
      expect(auditLog.interactionType).toBe('document_workflow');
      expect(auditLog.dataAccessed).toEqual(['document_id', 'workflow_status', 'user_action']);
      expect(auditLog.securityLevel).toBe('internal');
      expect(auditLog.complianceValidation.isCompliant).toBe(true);
      expect(auditLog.encryptionStatus.algorithm).toBe('aes256');
    });

    it('should log character system interaction with confidential data', async () => {
      // Setup character system security
      const securityConfig = {
        country: 'germany',
        dataTypes: ['character_data'],
        userRoles: ['citizen']
      };

      await securityEngine.establishQ2MechanicSecurity(
        'character_test_municipality',
        'character_system',
        securityConfig
      );

      const interactionData = {
        type: 'character_dialogue',
        dataFields: ['character_state', 'dialogue_history', 'emotional_response'],
        userRole: 'citizen'
      };

      const auditLog = await securityEngine.logQ2Interaction(
        'character_test_municipality',
        'citizen456',
        'character_system',
        interactionData
      );

      expect(auditLog.logId).toBeDefined();
      expect(auditLog.mechanicType).toBe('character_system');
      expect(auditLog.securityLevel).toBe('confidential');
      expect(auditLog.encryptionStatus.auditTrailEncrypted).toBe(true);
      expect(auditLog.complianceValidation.frameworks).toContain('gdpr');
      expect(auditLog.complianceValidation.frameworks).toContain('gemeindeordnung');
    });

    it('should log timed challenge emergency interaction', async () => {
      // Setup timed challenge security
      const securityConfig = {
        country: 'france',
        dataTypes: ['emergency_data'],
        userRoles: ['emergency_coordinator']
      };

      await securityEngine.establishQ2MechanicSecurity(
        'emergency_test_municipality',
        'timed_challenge',
        securityConfig
      );

      const interactionData = {
        type: 'emergency_response',
        dataFields: ['resource_allocation', 'response_time', 'coordination_data'],
        userRole: 'emergency_coordinator'
      };

      const auditLog = await securityEngine.logQ2Interaction(
        'emergency_test_municipality',
        'coordinator789',
        'timed_challenge',
        interactionData
      );

      expect(auditLog.mechanicType).toBe('timed_challenge');
      expect(auditLog.securityLevel).toBe('restricted');
      expect(auditLog.encryptionStatus.crossBorderCompliant).toBe(true);
      expect(auditLog.complianceValidation.riskLevel).toBe('low');
    });

    it('should emit interaction logging event', async () => {
      let loggingEvent: Record<string, unknown> = null;
      securityEngine.on('q2_interaction_logged', (event) => {
        loggingEvent = event;
      });

      const interactionData = {
        type: 'test_interaction',
        dataFields: ['test_field'],
        userRole: 'test_role'
      };

      await securityEngine.logQ2Interaction(
        'test_municipality',
        'test_user',
        'drag_drop',
        interactionData
      );

      expect(loggingEvent).toBeDefined();
      expect(loggingEvent.municipalityId).toBe('test_municipality');
      expect(loggingEvent.mechanicType).toBe('drag_drop');
      expect(loggingEvent.complianceStatus).toBe(true);
      expect(loggingEvent.riskLevel).toBe('low');
      expect(loggingEvent.crossBorderInvolved).toBe(false);
    });

    it('should throw error for missing security context', async () => {
      const interactionData = {
        type: 'test_interaction',
        dataFields: ['test_field'],
        userRole: 'test_role'
      };

      await expect(
        securityEngine.logQ2Interaction(
          'non_existent_municipality',
          'test_user',
          'drag_drop',
          interactionData
        )
      ).rejects.toThrow('Security context not found');
    });
  });

  describe('Cross-Border Encryption Setup', () => {
    it('should setup encryption for Nordic regional cooperation', async () => {
      const cooperationAgreement = {
        agreementId: 'nordic_cooperation_001',
        sourceCountry: 'sweden',
        targetCountry: 'norway',
        dataClassification: 'internal',
        requiredCompliance: ['gdpr', 'nordic_council']
      };

      const encryptionConfig = await securityEngine.setupCrossBorderEncryption(
        'stockholm_se',
        'oslo_no',
        cooperationAgreement
      );

      expect(encryptionConfig.agreementId).toBe('nordic_cooperation_001');
      expect(encryptionConfig.encryptionLevel).toBe('government_grade');
      expect(encryptionConfig.complianceFrameworks).toContain('gdpr');
      expect(encryptionConfig.complianceFrameworks).toContain('nordic_council');
      expect(encryptionConfig.encryptionKeys).toBeDefined();
      expect(encryptionConfig.secureChannel).toBeDefined();
      expect(encryptionConfig.keyRotationSchedule).toBeDefined();
    });

    it('should setup encryption for Franco-German bilateral cooperation', async () => {
      const cooperationAgreement = {
        agreementId: 'franco_german_001',
        sourceCountry: 'france',
        targetCountry: 'germany',
        dataClassification: 'confidential',
        requiredCompliance: ['gdpr', 'franco_german_treaty']
      };

      const encryptionConfig = await securityEngine.setupCrossBorderEncryption(
        'strasbourg_fr',
        'kehl_de',
        cooperationAgreement
      );

      expect(encryptionConfig.agreementId).toBe('franco_german_001');
      expect(encryptionConfig.encryptionLevel).toBe('government_grade');
      expect(encryptionConfig.complianceFrameworks).toContain('gdpr');
      expect(encryptionConfig.complianceFrameworks).toContain('franco_german_treaty');
    });

    it('should setup encryption for Benelux cooperation', async () => {
      const cooperationAgreement = {
        agreementId: 'benelux_cooperation_001',
        sourceCountry: 'netherlands',
        targetCountry: 'belgium',
        dataClassification: 'internal',
        requiredCompliance: ['gdpr', 'benelux_treaty']
      };

      const encryptionConfig = await securityEngine.setupCrossBorderEncryption(
        'maastricht_nl',
        'liege_be',
        cooperationAgreement
      );

      expect(encryptionConfig.agreementId).toBe('benelux_cooperation_001');
      expect(encryptionConfig.encryptionLevel).toBe('government_grade');
      expect(encryptionConfig.complianceFrameworks).toContain('gdpr');
      expect(encryptionConfig.complianceFrameworks).toContain('benelux_treaty');
    });

    it('should emit cross-border encryption event', async () => {
      let encryptionEvent: Record<string, unknown> = null;
      securityEngine.on('cross_border_encryption_established', (event) => {
        encryptionEvent = event;
      });

      const cooperationAgreement = {
        agreementId: 'test_cooperation',
        sourceCountry: 'sweden',
        targetCountry: 'denmark',
        dataClassification: 'internal',
        requiredCompliance: ['gdpr']
      };

      await securityEngine.setupCrossBorderEncryption(
        'test_source',
        'test_target',
        cooperationAgreement
      );

      expect(encryptionEvent).toBeDefined();
      expect(encryptionEvent.sourceMunicipalityId).toBe('test_source');
      expect(encryptionEvent.targetMunicipalityId).toBe('test_target');
      expect(encryptionEvent.encryptionLevel).toBe('government_grade');
      expect(encryptionEvent.complianceFrameworks).toContain('gdpr');
    });
  });

  describe('Penetration Testing Framework', () => {
    it('should execute comprehensive penetration testing for Q2 production deployment', async () => {
      const testingScope = {
        targetSystems: ['q2_drag_drop', 'q2_timed_challenge', 'q2_character_system'],
        testTypes: ['authentication_bypass', 'sql_injection', 'xss_vulnerabilities', 'privilege_escalation'],
        complianceFrameworks: ['gdpr', 'kommunallagen']
      };

      const testResult = await securityEngine.executePenetrationTesting(testingScope);

      expect(testResult.testId).toBeDefined();
      expect(testResult.timestamp).toBeInstanceOf(Date);
      expect(testResult.scope).toEqual(testingScope);
      expect(testResult.vulnerabilities).toBeDefined();
      expect(testResult.riskAssessment).toBeDefined();
      expect(testResult.remediationPlan).toBeDefined();
      expect(testResult.complianceImpact).toBeDefined();
      expect(typeof testResult.retestingRequired).toBe('boolean');
    });

    it('should execute security testing for cross-border connections', async () => {
      const testingScope = {
        targetSystems: ['cross_border_encryption', 'data_flow_validation', 'audit_trail_sharing'],
        testTypes: ['encryption_strength', 'man_in_middle', 'data_sovereignty_breach'],
        complianceFrameworks: ['gdpr', 'bilateral_agreements']
      };

      const testResult = await securityEngine.executePenetrationTesting(testingScope);

      expect(testResult.scope.targetSystems).toContain('cross_border_encryption');
      expect(testResult.scope.testTypes).toContain('encryption_strength');
      expect(testResult.scope.complianceFrameworks).toContain('gdpr');
    });

    it('should execute security testing for municipal tenant isolation', async () => {
      const testingScope = {
        targetSystems: ['tenant_network_segmentation', 'data_encryption', 'access_controls'],
        testTypes: ['tenant_isolation_bypass', 'data_leakage', 'unauthorized_access'],
        complianceFrameworks: ['gdpr', 'gemeindeordnung']
      };

      const testResult = await securityEngine.executePenetrationTesting(testingScope);

      expect(testResult.scope.targetSystems).toContain('tenant_network_segmentation');
      expect(testResult.scope.testTypes).toContain('tenant_isolation_bypass');
      expect(testResult.scope.complianceFrameworks).toContain('gemeindeordnung');
    });

    it('should emit penetration testing completion event', async () => {
      let testingEvent: Record<string, unknown> = null;
      securityEngine.on('penetration_testing_completed', (event) => {
        testingEvent = event;
      });

      const testingScope = {
        targetSystems: ['test_system'],
        testTypes: ['test_type'],
        complianceFrameworks: ['gdpr']
      };

      await securityEngine.executePenetrationTesting(testingScope);

      expect(testingEvent).toBeDefined();
      expect(testingEvent.testId).toBeDefined();
      expect(testingEvent.vulnerabilitiesFound).toBe(0);
      expect(testingEvent.highRiskCount).toBe(0);
      expect(testingEvent.complianceStatus).toBe('compliant');
    });
  });

  describe('European Compliance Frameworks', () => {
    it('should validate GDPR compliance requirements', async () => {
      const securityConfig = {
        country: 'sweden',
        dataTypes: ['citizen_personal_data'],
        userRoles: ['municipal_employee']
      };

      const securityContext = await securityEngine.establishQ2MechanicSecurity(
        'gdpr_test_municipality',
        'character_system',
        securityConfig
      );

      expect(securityContext.complianceFrameworks).toContain('gdpr');
      expect(securityContext.encryptionRequired).toBe(true); // GDPR requires encryption for personal data
      expect(securityContext.auditTrailRequired).toBe(true); // GDPR requires processing logs
    });

    it('should validate Swedish Kommunallagen compliance', async () => {
      const securityConfig = {
        country: 'sweden',
        dataTypes: ['municipal_decisions', 'transparency_data'],
        userRoles: ['decision_maker']
      };

      const securityContext = await securityEngine.establishQ2MechanicSecurity(
        'kommunal_test_municipality',
        'branching_narrative',
        securityConfig
      );

      expect(securityContext.complianceFrameworks).toContain('kommunallagen');
      expect(securityContext.auditTrailRequired).toBe(true); // Kommunallagen requires decision transparency
    });

    it('should validate German Gemeindeordnung compliance', async () => {
      const securityConfig = {
        country: 'germany',
        dataTypes: ['municipal_administration', 'citizen_services'],
        userRoles: ['beamter']
      };

      const securityContext = await securityEngine.establishQ2MechanicSecurity(
        'gemeindeordnung_test_municipality',
        'drag_drop',
        securityConfig
      );

      expect(securityContext.complianceFrameworks).toContain('gemeindeordnung');
      expect(securityContext.auditTrailRequired).toBe(true); // Gemeindeordnung requires comprehensive audits
    });

    it('should validate French CGCT compliance', async () => {
      const securityConfig = {
        country: 'france',
        dataTypes: ['service_public_data', 'collectivite_operations'],
        userRoles: ['fonctionnaire']
      };

      const securityContext = await securityEngine.establishQ2MechanicSecurity(
        'cgct_test_municipality',
        'achievement_system',
        securityConfig
      );

      expect(securityContext.complianceFrameworks).toContain('cgct');
      expect(securityContext.encryptionRequired).toBe(true); // CGCT requires data protection
    });

    it('should validate Dutch Gemeentewet compliance', async () => {
      const securityConfig = {
        country: 'netherlands',
        dataTypes: ['gemeente_services', 'citizen_efficiency'],
        userRoles: ['ambtenaar']
      };

      const securityContext = await securityEngine.establishQ2MechanicSecurity(
        'gemeentewet_test_municipality',
        'timed_challenge',
        securityConfig
      );

      expect(securityContext.complianceFrameworks).toContain('gemeentewet');
      expect(securityContext.encryptionRequired).toBe(true); // Gemeentewet requires citizen privacy protection
    });
  });

  describe('Security Event Monitoring', () => {
    it('should monitor and emit all required security events', async () => {
      const events: Record<string, unknown>[] = [];
      const eventTypes = [
        'q2_mechanic_security_established',
        'municipal_tenant_isolation_established',
        'q2_interaction_logged',
        'cross_border_encryption_established',
        'penetration_testing_completed'
      ];

      eventTypes.forEach(eventType => {
        securityEngine.on(eventType, (event) => {
          events.push({ type: eventType, data: event });
        });
      });

      // Trigger various security operations
      const securityConfig = {
        country: 'sweden',
        dataTypes: ['test_data'],
        userRoles: ['test_user']
      };

      await securityEngine.establishQ2MechanicSecurity(
        'event_test_municipality',
        'drag_drop',
        securityConfig
      );

      const sovereigntyConfig: EuropeanDataSovereigntyConfig = {
        country: 'sweden',
        dataResidencyRegion: 'nordics',
        nationalDataProtectionLaw: 'kommunallagen',
        crossBorderDataFlowRestrictions: [],
        citizenDataRights: {
          rightToAccess: true,
          rightToRectification: true,
          rightToErasure: true,
          rightToDataPortability: true,
          rightToObject: true,
          rightToRestrictProcessing: true,
          notificationRequirements: []
        },
        municipalDataClassification: {
          citizenPersonalData: 'confidential',
          municipalOperations: 'internal',
          publicServices: 'public',
          emergencyResponse: 'restricted',
          crossMunicipalCooperation: 'confidential',
          auditTrails: 'restricted'
        },
        auditRequirements: {
          retentionPeriodYears: 7,
          auditLogEncryption: true,
          realTimeMonitoring: true,
          complianceReporting: true,
          incidentResponseRequired: true
        }
      };

      await securityEngine.establishMunicipalTenantIsolation(
        'event_test_municipality',
        sovereigntyConfig
      );

      const interactionData = {
        type: 'test_interaction',
        dataFields: ['test_field'],
        userRole: 'test_role'
      };

      await securityEngine.logQ2Interaction(
        'event_test_municipality',
        'test_user',
        'drag_drop',
        interactionData
      );

      expect(events.length).toBeGreaterThanOrEqual(3);
      expect(events.some(e => e.type === 'q2_mechanic_security_established')).toBe(true);
      expect(events.some(e => e.type === 'municipal_tenant_isolation_established')).toBe(true);
      expect(events.some(e => e.type === 'q2_interaction_logged')).toBe(true);
    });
  });
});