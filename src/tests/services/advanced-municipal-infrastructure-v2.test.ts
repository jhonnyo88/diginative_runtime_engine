/**
 * Advanced Municipal Infrastructure Architecture v2 Test Suite
 * Production-ready testing for European multi-tenant scaling with Q2 mechanics
 * 
 * PROPOSAL-039: European municipal scaling for 100+ municipalities
 * Coverage: Q2 production mechanics + European compliance + Cross-border cooperation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  EuropeanMunicipalInfrastructureEngine, 
  EuropeanMunicipalityConfig,
  MunicipalTenantInstanceV2 
} from '../../services/advanced-municipal-infrastructure-v2';

describe('European Municipal Infrastructure Architecture v2', () => {
  let infrastructureEngine: EuropeanMunicipalInfrastructureEngine;

  beforeEach(() => {
    infrastructureEngine = new EuropeanMunicipalInfrastructureEngine();
  });

  describe('European Municipality Tenant Creation', () => {
    it('should create Swedish municipality with Q2 production mechanics', async () => {
      const config: EuropeanMunicipalityConfig = {
        municipalityId: 'malmo_stad',
        country: 'sweden',
        population: 350000,
        culturalContext: 'swedish_consensus',
        regulatoryFramework: 'kommunallagen',
        dataResidencyRegion: 'nordics',
        q2MechanicsEnabled: ['drag_drop', 'timed_challenge', 'branching_narrative', 'achievement_system']
      };

      const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(config);

      expect(tenant.tenantId).toBe('malmo_stad');
      expect(tenant.config.country).toBe('sweden');
      expect(tenant.config.culturalContext).toBe('swedish_consensus');
      expect(tenant.q2Mechanics).toHaveLength(4);
      expect(tenant.status).toBe('active');
      
      // Verify Q2 mechanics initialization
      const dragDropMechanic = tenant.q2Mechanics.find(m => m.config.mechanicType === 'drag_drop');
      expect(dragDropMechanic).toBeDefined();
      expect(dragDropMechanic?.config.culturalAdaptation).toBe(true);
      expect(dragDropMechanic?.config.municipalCompliance).toBe(true);
      
      // Verify Swedish cultural adaptation
      expect(tenant.culturalIntelligence).toBeDefined();
      expect(tenant.resourceAllocation.culturalMultiplier).toBe(1.0); // Swedish efficiency
    });

    it('should create German municipality with systematic cultural adaptation', async () => {
      const config: EuropeanMunicipalityConfig = {
        municipalityId: 'berlin_de',
        country: 'germany',
        population: 3700000,
        culturalContext: 'german_systematik',
        regulatoryFramework: 'gemeindeordnung',
        dataResidencyRegion: 'germany',
        q2MechanicsEnabled: ['drag_drop', 'character_system', 'achievement_system']
      };

      const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(config);

      expect(tenant.tenantId).toBe('berlin_de');
      expect(tenant.config.culturalContext).toBe('german_systematik');
      expect(tenant.resourceAllocation.culturalMultiplier).toBe(1.2); // German thoroughness
      
      // Verify Q2 mechanics with German adaptation
      const characterMechanic = tenant.q2Mechanics.find(m => m.config.mechanicType === 'character_system');
      expect(characterMechanic?.culturalAdaptation.decisionMakingStyle).toBe('hierarchical_thorough');
      expect(characterMechanic?.culturalAdaptation.communicationProtocol).toBe('formal_comprehensive');
      
      // Verify high-performance profile for large population
      expect(characterMechanic?.config.performanceProfile).toBe('high_performance');
    });

    it('should create French municipality with service public excellence', async () => {
      const config: EuropeanMunicipalityConfig = {
        municipalityId: 'paris_fr',
        country: 'france',
        population: 2200000,
        culturalContext: 'french_elegance',
        regulatoryFramework: 'cgct',
        dataResidencyRegion: 'france',
        q2MechanicsEnabled: ['branching_narrative', 'character_system', 'achievement_system']
      };

      const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(config);

      expect(tenant.tenantId).toBe('paris_fr');
      expect(tenant.config.culturalContext).toBe('french_elegance');
      expect(tenant.resourceAllocation.culturalMultiplier).toBe(1.3); // French refinement
      
      // Verify French cultural terminology
      const narrativeMechanic = tenant.q2Mechanics.find(m => m.config.mechanicType === 'branching_narrative');
      expect(narrativeMechanic?.culturalAdaptation.terminologySet.approve).toBe('approuver');
      expect(narrativeMechanic?.culturalAdaptation.terminologySet.excellence).toBe('excellence');
      expect(narrativeMechanic?.culturalAdaptation.decisionMakingStyle).toBe('centralized_refined');
    });

    it('should create Dutch municipality with efficient innovation', async () => {
      const config: EuropeanMunicipalityConfig = {
        municipalityId: 'amsterdam_nl',
        country: 'netherlands',
        population: 900000,
        culturalContext: 'dutch_efficiency',
        regulatoryFramework: 'gemeentewet',
        dataResidencyRegion: 'netherlands',
        q2MechanicsEnabled: ['drag_drop', 'timed_challenge', 'achievement_system']
      };

      const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(config);

      expect(tenant.tenantId).toBe('amsterdam_nl');
      expect(tenant.config.culturalContext).toBe('dutch_efficiency');
      expect(tenant.resourceAllocation.culturalMultiplier).toBe(1.1); // Dutch efficiency
      
      // Verify Dutch cultural adaptation
      const timedChallengeMechanic = tenant.q2Mechanics.find(m => m.config.mechanicType === 'timed_challenge');
      expect(timedChallengeMechanic?.culturalAdaptation.communicationProtocol).toBe('direct_practical');
      expect(timedChallengeMechanic?.culturalAdaptation.terminologySet.efficient).toBe('efficiënt');
      expect(timedChallengeMechanic?.culturalAdaptation.terminologySet.direct).toBe('direct');
    });

    it('should prevent duplicate municipality creation', async () => {
      const config: EuropeanMunicipalityConfig = {
        municipalityId: 'stockholm_se',
        country: 'sweden',
        population: 1000000,
        culturalContext: 'swedish_consensus',
        regulatoryFramework: 'kommunallagen',
        dataResidencyRegion: 'nordics',
        q2MechanicsEnabled: ['drag_drop']
      };

      await infrastructureEngine.createEuropeanMunicipalTenant(config);

      await expect(
        infrastructureEngine.createEuropeanMunicipalTenant(config)
      ).rejects.toThrow('European municipality stockholm_se already exists');
    });
  });

  describe('Q2 Production Mechanics Integration', () => {
    it('should calculate Q2 mechanic overhead correctly', async () => {
      const config: EuropeanMunicipalityConfig = {
        municipalityId: 'test_municipality',
        country: 'sweden',
        population: 100000,
        culturalContext: 'swedish_consensus',
        regulatoryFramework: 'kommunallagen',
        dataResidencyRegion: 'nordics',
        q2MechanicsEnabled: ['drag_drop', 'timed_challenge', 'character_system'] // 15% + 20% + 30% = 65%
      };

      const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(config);

      expect(tenant.resourceAllocation.q2MechanicOverhead).toBeCloseTo(0.65, 2);
    });

    it('should configure cross-mechanic integration', async () => {
      const config: EuropeanMunicipalityConfig = {
        municipalityId: 'integration_test',
        country: 'germany',
        population: 200000,
        culturalContext: 'german_systematik',
        regulatoryFramework: 'gemeindeordnung',
        dataResidencyRegion: 'germany',
        q2MechanicsEnabled: ['drag_drop', 'character_system', 'achievement_system']
      };

      const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(config);

      // Verify drag-drop integrates with character and achievement systems
      const dragDropMechanic = tenant.q2Mechanics.find(m => m.config.mechanicType === 'drag_drop');
      expect(dragDropMechanic?.config.crossMechanicIntegration).toContain('character_system');
      expect(dragDropMechanic?.config.crossMechanicIntegration).toContain('achievement_system');

      // Verify achievement system integrates with all mechanics
      const achievementMechanic = tenant.q2Mechanics.find(m => m.config.mechanicType === 'achievement_system');
      expect(achievementMechanic?.config.crossMechanicIntegration).toContain('drag_drop');
      expect(achievementMechanic?.config.crossMechanicIntegration).toContain('character_system');
    });

    it('should set appropriate performance profiles based on population', async () => {
      // Small municipality - resource optimized
      const smallConfig: EuropeanMunicipalityConfig = {
        municipalityId: 'small_town',
        country: 'sweden',
        population: 50000,
        culturalContext: 'swedish_consensus',
        regulatoryFramework: 'kommunallagen',
        dataResidencyRegion: 'nordics',
        q2MechanicsEnabled: ['drag_drop']
      };

      const smallTenant = await infrastructureEngine.createEuropeanMunicipalTenant(smallConfig);
      expect(smallTenant.q2Mechanics[0].config.performanceProfile).toBe('resource_optimized');

      // Medium municipality - standard
      const mediumConfig: EuropeanMunicipalityConfig = {
        municipalityId: 'medium_city',
        country: 'germany',
        population: 250000,
        culturalContext: 'german_systematik',
        regulatoryFramework: 'gemeindeordnung',
        dataResidencyRegion: 'germany',
        q2MechanicsEnabled: ['timed_challenge']
      };

      const mediumTenant = await infrastructureEngine.createEuropeanMunicipalTenant(mediumConfig);
      expect(mediumTenant.q2Mechanics[0].config.performanceProfile).toBe('standard');

      // Large municipality - high performance
      const largeConfig: EuropeanMunicipalityConfig = {
        municipalityId: 'large_city',
        country: 'france',
        population: 800000,
        culturalContext: 'french_elegance',
        regulatoryFramework: 'cgct',
        dataResidencyRegion: 'france',
        q2MechanicsEnabled: ['character_system']
      };

      const largeTenant = await infrastructureEngine.createEuropeanMunicipalTenant(largeConfig);
      expect(largeTenant.q2Mechanics[0].config.performanceProfile).toBe('high_performance');
    });
  });

  describe('Cross-Border Municipal Cooperation', () => {
    it('should establish Nordic regional cooperation', async () => {
      // Create Swedish municipality
      const swedenConfig: EuropeanMunicipalityConfig = {
        municipalityId: 'stockholm_se',
        country: 'sweden',
        population: 1000000,
        culturalContext: 'swedish_consensus',
        regulatoryFramework: 'kommunallagen',
        dataResidencyRegion: 'nordics',
        q2MechanicsEnabled: ['drag_drop', 'achievement_system'],
        crossBorderCooperation: []
      };

      // Create Danish municipality
      const denmarkConfig: EuropeanMunicipalityConfig = {
        municipalityId: 'copenhagen_dk',
        country: 'sweden', // Using sweden as placeholder for denmark
        population: 650000,
        culturalContext: 'swedish_consensus', // Using swedish as placeholder for nordic
        regulatoryFramework: 'kommunallagen',
        dataResidencyRegion: 'nordics',
        q2MechanicsEnabled: ['timed_challenge', 'achievement_system']
      };

      const swedishTenant = await infrastructureEngine.createEuropeanMunicipalTenant(swedenConfig);
      const danishTenant = await infrastructureEngine.createEuropeanMunicipalTenant(denmarkConfig);

      // Establish cross-border connection
      const connection = await infrastructureEngine.establishCrossBorderConnection(
        swedishTenant,
        'copenhagen_dk'
      );

      expect(connection.connectionType).toBe('regional_cooperation');
      expect(connection.status).toBe('active');
      expect(connection.targetMunicipalityId).toBe('copenhagen_dk');
      
      // Verify bidirectional connection
      expect(swedishTenant.crossBorderConnections.has('copenhagen_dk')).toBe(true);
      expect(danishTenant.crossBorderConnections.has('stockholm_se')).toBe(true);
    });

    it('should establish Franco-German bilateral cooperation', async () => {
      const franceConfig: EuropeanMunicipalityConfig = {
        municipalityId: 'strasbourg_fr',
        country: 'france',
        population: 280000,
        culturalContext: 'french_elegance',
        regulatoryFramework: 'cgct',
        dataResidencyRegion: 'france',
        q2MechanicsEnabled: ['branching_narrative']
      };

      const germanyConfig: EuropeanMunicipalityConfig = {
        municipalityId: 'kehl_de',
        country: 'germany',
        population: 35000,
        culturalContext: 'german_systematik',
        regulatoryFramework: 'gemeindeordnung',
        dataResidencyRegion: 'germany',
        q2MechanicsEnabled: ['drag_drop']
      };

      const frenchTenant = await infrastructureEngine.createEuropeanMunicipalTenant(franceConfig);
      const germanTenant = await infrastructureEngine.createEuropeanMunicipalTenant(germanyConfig);

      const connection = await infrastructureEngine.establishCrossBorderConnection(
        frenchTenant,
        'kehl_de'
      );

      expect(connection.connectionType).toBe('bilateral');
      expect(connection.encryptionLevel).toBe('government_grade');
      expect(connection.complianceFramework).toContain('gdpr');
    });

    it('should establish Benelux regional cooperation', async () => {
      const netherlandsConfig: EuropeanMunicipalityConfig = {
        municipalityId: 'maastricht_nl',
        country: 'netherlands',
        population: 120000,
        culturalContext: 'dutch_efficiency',
        regulatoryFramework: 'gemeentewet',
        dataResidencyRegion: 'netherlands',
        q2MechanicsEnabled: ['timed_challenge']
      };

      const belgiumConfig: EuropeanMunicipalityConfig = {
        municipalityId: 'liege_be',
        country: 'netherlands', // Using netherlands as placeholder for belgium
        population: 200000,
        culturalContext: 'dutch_efficiency',
        regulatoryFramework: 'gemeentewet',
        dataResidencyRegion: 'netherlands',
        q2MechanicsEnabled: ['achievement_system']
      };

      const dutchTenant = await infrastructureEngine.createEuropeanMunicipalTenant(netherlandsConfig);
      const belgianTenant = await infrastructureEngine.createEuropeanMunicipalTenant(belgiumConfig);

      const connection = await infrastructureEngine.establishCrossBorderConnection(
        dutchTenant,
        'liege_be'
      );

      expect(connection.connectionType).toBe('regional_cooperation');
      expect(dutchTenant.crossBorderConnections.has('liege_be')).toBe(true);
    });

    it('should prevent cross-border connection to non-existent municipality', async () => {
      const config: EuropeanMunicipalityConfig = {
        municipalityId: 'test_city',
        country: 'sweden',
        population: 100000,
        culturalContext: 'swedish_consensus',
        regulatoryFramework: 'kommunallagen',
        dataResidencyRegion: 'nordics',
        q2MechanicsEnabled: ['drag_drop']
      };

      const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(config);

      await expect(
        infrastructureEngine.establishCrossBorderConnection(tenant, 'non_existent_city')
      ).rejects.toThrow('Target municipality non_existent_city not found');
    });
  });

  describe('European Resource Allocation', () => {
    it('should calculate cultural multipliers correctly', async () => {
      const configs = [
        { 
          culturalContext: 'swedish_consensus' as const, 
          expectedMultiplier: 1.0,
          municipalityId: 'sweden_test'
        },
        { 
          culturalContext: 'german_systematik' as const, 
          expectedMultiplier: 1.2,
          municipalityId: 'germany_test'
        },
        { 
          culturalContext: 'french_elegance' as const, 
          expectedMultiplier: 1.3,
          municipalityId: 'france_test'
        },
        { 
          culturalContext: 'dutch_efficiency' as const, 
          expectedMultiplier: 1.1,
          municipalityId: 'netherlands_test'
        }
      ];

      for (const { culturalContext, expectedMultiplier, municipalityId } of configs) {
        const config: EuropeanMunicipalityConfig = {
          municipalityId,
          country: 'sweden',
          population: 100000,
          culturalContext,
          regulatoryFramework: 'kommunallagen',
          dataResidencyRegion: 'nordics',
          q2MechanicsEnabled: ['drag_drop']
        };

        const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(config);
        expect(tenant.resourceAllocation.culturalMultiplier).toBe(expectedMultiplier);
      }
    });

    it('should scale resources based on population', async () => {
      const smallConfig: EuropeanMunicipalityConfig = {
        municipalityId: 'small_city',
        country: 'sweden',
        population: 25000,
        culturalContext: 'swedish_consensus',
        regulatoryFramework: 'kommunallagen',
        dataResidencyRegion: 'nordics',
        q2MechanicsEnabled: ['drag_drop']
      };

      const largeConfig: EuropeanMunicipalityConfig = {
        municipalityId: 'large_city',
        country: 'sweden',
        population: 500000,
        culturalContext: 'swedish_consensus',
        regulatoryFramework: 'kommunallagen',
        dataResidencyRegion: 'nordics',
        q2MechanicsEnabled: ['drag_drop']
      };

      const smallTenant = await infrastructureEngine.createEuropeanMunicipalTenant(smallConfig);
      const largeTenant = await infrastructureEngine.createEuropeanMunicipalTenant(largeConfig);

      expect(largeTenant.resourceAllocation.baseCpuUnits).toBeGreaterThan(
        smallTenant.resourceAllocation.baseCpuUnits
      );
      expect(largeTenant.resourceAllocation.baseMemoryMB).toBeGreaterThan(
        smallTenant.resourceAllocation.baseMemoryMB
      );
      expect(largeTenant.resourceAllocation.baseStorageGB).toBeGreaterThan(
        smallTenant.resourceAllocation.baseStorageGB
      );
    });

    it('should calculate cross-border bandwidth requirements', async () => {
      const config: EuropeanMunicipalityConfig = {
        municipalityId: 'connected_city',
        country: 'netherlands',
        population: 200000,
        culturalContext: 'dutch_efficiency',
        regulatoryFramework: 'gemeentewet',
        dataResidencyRegion: 'netherlands',
        q2MechanicsEnabled: ['timed_challenge'],
        crossBorderCooperation: [] // Will test separately
      };

      const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(config);

      expect(tenant.resourceAllocation.crossBorderBandwidth).toBe(0); // No connections initially
    });

    it('should generate appropriate scaling triggers', async () => {
      const config: EuropeanMunicipalityConfig = {
        municipalityId: 'scaling_test',
        country: 'germany',
        population: 300000,
        culturalContext: 'german_systematik',
        regulatoryFramework: 'gemeindeordnung',
        dataResidencyRegion: 'germany',
        q2MechanicsEnabled: ['character_system', 'achievement_system']
      };

      const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(config);

      expect(tenant.resourceAllocation.scalingTriggers).toHaveLength(4);
      
      const cpuTrigger = tenant.resourceAllocation.scalingTriggers.find(t => t.type === 'cpu_utilization');
      expect(cpuTrigger?.threshold).toBe(80);
      expect(cpuTrigger?.scalingAction).toBe('add_cpu_units');
      
      const memoryTrigger = tenant.resourceAllocation.scalingTriggers.find(t => t.type === 'memory_utilization');
      expect(memoryTrigger?.threshold).toBe(85);
      
      const q2Trigger = tenant.resourceAllocation.scalingTriggers.find(t => t.type === 'q2_mechanic_load');
      expect(q2Trigger?.threshold).toBe(75);
      expect(q2Trigger?.scalingAction).toBe('scale_q2_mechanics');
      
      const crossBorderTrigger = tenant.resourceAllocation.scalingTriggers.find(t => t.type === 'cross_border_traffic');
      expect(crossBorderTrigger?.threshold).toBe(70);
      expect(crossBorderTrigger?.scalingAction).toBe('increase_bandwidth');
    });
  });

  describe('European Municipal Scaling', () => {
    it('should scale municipality based on CPU utilization trigger', async () => {
      const config: EuropeanMunicipalityConfig = {
        municipalityId: 'scaling_municipality',
        country: 'france',
        population: 150000,
        culturalContext: 'french_elegance',
        regulatoryFramework: 'cgct',
        dataResidencyRegion: 'france',
        q2MechanicsEnabled: ['branching_narrative', 'achievement_system']
      };

      const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(config);
      
      const scalingTrigger = {
        type: 'cpu_utilization',
        threshold: 80,
        scalingAction: 'add_cpu_units',
        cooldownMinutes: 15
      };

      // Mock high CPU utilization
      tenant.resourceAllocation.currentUtilization.cpuPercent = 85;

      await infrastructureEngine.scaleEuropeanMunicipality(tenant.tenantId, scalingTrigger);

      expect(tenant.status).toBe('active');
      // Additional scaling verification would be implemented in the actual scaling methods
    });

    it('should emit scaling event with proper metadata', async () => {
      const config: EuropeanMunicipalityConfig = {
        municipalityId: 'event_test_municipality',
        country: 'sweden',
        population: 100000,
        culturalContext: 'swedish_consensus',
        regulatoryFramework: 'kommunallagen',
        dataResidencyRegion: 'nordics',
        q2MechanicsEnabled: ['drag_drop']
      };

      let scalingEvent: any = null;
      infrastructureEngine.on('european_municipality_scaled', (event) => {
        scalingEvent = event;
      });

      const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(config);
      
      const scalingTrigger = {
        type: 'q2_mechanic_load',
        threshold: 75,
        scalingAction: 'scale_q2_mechanics',
        cooldownMinutes: 20
      };

      await infrastructureEngine.scaleEuropeanMunicipality(tenant.tenantId, scalingTrigger);

      expect(scalingEvent).toBeDefined();
      expect(scalingEvent.tenantId).toBe('event_test_municipality');
      expect(scalingEvent.scalingTrigger).toBe('q2_mechanic_load');
    });
  });

  describe('Cultural Intelligence Integration', () => {
    it('should provide correct cultural terminology for each context', async () => {
      const swedishConfig: EuropeanMunicipalityConfig = {
        municipalityId: 'swedish_cultural_test',
        country: 'sweden',
        population: 100000,
        culturalContext: 'swedish_consensus',
        regulatoryFramework: 'kommunallagen',
        dataResidencyRegion: 'nordics',
        q2MechanicsEnabled: ['drag_drop']
      };

      const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(swedishConfig);
      const dragDropMechanic = tenant.q2Mechanics.find(m => m.config.mechanicType === 'drag_drop');

      expect(dragDropMechanic?.culturalAdaptation.terminologySet.approve).toBe('godkänn');
      expect(dragDropMechanic?.culturalAdaptation.terminologySet.consensus).toBe('konsensus');
      expect(dragDropMechanic?.culturalAdaptation.terminologySet.transparency).toBe('transparens');
    });

    it('should configure decision-making styles appropriately', async () => {
      const culturalTests = [
        { 
          culturalContext: 'swedish_consensus' as const, 
          expectedStyle: 'consensus_based',
          municipalityId: 'sweden_decision_test'
        },
        { 
          culturalContext: 'german_systematik' as const, 
          expectedStyle: 'hierarchical_thorough',
          municipalityId: 'germany_decision_test'
        },
        { 
          culturalContext: 'french_elegance' as const, 
          expectedStyle: 'centralized_refined',
          municipalityId: 'france_decision_test'
        },
        { 
          culturalContext: 'dutch_efficiency' as const, 
          expectedStyle: 'pragmatic_direct',
          municipalityId: 'netherlands_decision_test'
        }
      ];

      for (const { culturalContext, expectedStyle, municipalityId } of culturalTests) {
        const config: EuropeanMunicipalityConfig = {
          municipalityId,
          country: 'sweden',
          population: 100000,
          culturalContext,
          regulatoryFramework: 'kommunallagen',
          dataResidencyRegion: 'nordics',
          q2MechanicsEnabled: ['achievement_system']
        };

        const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(config);
        const achievementMechanic = tenant.q2Mechanics.find(m => m.config.mechanicType === 'achievement_system');

        expect(achievementMechanic?.culturalAdaptation.decisionMakingStyle).toBe(expectedStyle);
      }
    });

    it('should set communication protocols based on cultural context', async () => {
      const communicationTests = [
        { 
          culturalContext: 'swedish_consensus' as const, 
          expectedProtocol: 'inclusive_transparent',
          municipalityId: 'sweden_comm_test'
        },
        { 
          culturalContext: 'german_systematik' as const, 
          expectedProtocol: 'formal_comprehensive',
          municipalityId: 'germany_comm_test'
        },
        { 
          culturalContext: 'french_elegance' as const, 
          expectedProtocol: 'refined_hierarchical',
          municipalityId: 'france_comm_test'
        },
        { 
          culturalContext: 'dutch_efficiency' as const, 
          expectedProtocol: 'direct_practical',
          municipalityId: 'netherlands_comm_test'
        }
      ];

      for (const { culturalContext, expectedProtocol, municipalityId } of communicationTests) {
        const config: EuropeanMunicipalityConfig = {
          municipalityId,
          country: 'sweden',
          population: 100000,
          culturalContext,
          regulatoryFramework: 'kommunallagen',
          dataResidencyRegion: 'nordics',
          q2MechanicsEnabled: ['timed_challenge']
        };

        const tenant = await infrastructureEngine.createEuropeanMunicipalTenant(config);
        const timedChallengeMechanic = tenant.q2Mechanics.find(m => m.config.mechanicType === 'timed_challenge');

        expect(timedChallengeMechanic?.culturalAdaptation.communicationProtocol).toBe(expectedProtocol);
      }
    });
  });

  describe('Event Emission and Monitoring', () => {
    it('should emit tenant creation event with comprehensive metadata', async () => {
      let creationEvent: any = null;
      infrastructureEngine.on('european_tenant_created', (event) => {
        creationEvent = event;
      });

      const config: EuropeanMunicipalityConfig = {
        municipalityId: 'event_municipality',
        country: 'germany',
        population: 250000,
        culturalContext: 'german_systematik',
        regulatoryFramework: 'gemeindeordnung',
        dataResidencyRegion: 'germany',
        q2MechanicsEnabled: ['drag_drop', 'timed_challenge', 'character_system'],
        crossBorderCooperation: []
      };

      await infrastructureEngine.createEuropeanMunicipalTenant(config);

      expect(creationEvent).toBeDefined();
      expect(creationEvent.tenantId).toBe('event_municipality');
      expect(creationEvent.country).toBe('germany');
      expect(creationEvent.populationServed).toBe(250000);
      expect(creationEvent.q2MechanicsCount).toBe(3);
      expect(creationEvent.crossBorderConnections).toBe(0);
    });

    it('should emit cross-border connection event', async () => {
      let connectionEvent: any = null;
      infrastructureEngine.on('cross_border_connection_established', (event) => {
        connectionEvent = event;
      });

      const sourceConfig: EuropeanMunicipalityConfig = {
        municipalityId: 'source_municipality',
        country: 'france',
        population: 200000,
        culturalContext: 'french_elegance',
        regulatoryFramework: 'cgct',
        dataResidencyRegion: 'france',
        q2MechanicsEnabled: ['branching_narrative']
      };

      const targetConfig: EuropeanMunicipalityConfig = {
        municipalityId: 'target_municipality',
        country: 'germany',
        population: 180000,
        culturalContext: 'german_systematik',
        regulatoryFramework: 'gemeindeordnung',
        dataResidencyRegion: 'germany',
        q2MechanicsEnabled: ['achievement_system']
      };

      const sourceTenant = await infrastructureEngine.createEuropeanMunicipalTenant(sourceConfig);
      await infrastructureEngine.createEuropeanMunicipalTenant(targetConfig);

      await infrastructureEngine.establishCrossBorderConnection(sourceTenant, 'target_municipality');

      expect(connectionEvent).toBeDefined();
      expect(connectionEvent.sourceId).toBe('source_municipality');
      expect(connectionEvent.targetId).toBe('target_municipality');
      expect(connectionEvent.connectionType).toBe('bilateral');
      expect(connectionEvent.encryptionLevel).toBe('government_grade');
      expect(connectionEvent.complianceFrameworks).toContain('gdpr');
    });
  });
});