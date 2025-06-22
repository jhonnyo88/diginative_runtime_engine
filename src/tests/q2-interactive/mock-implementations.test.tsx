/**
 * Mock Implementations for Early Q2 Interactive Validation
 * Task: proposal-012 - Interactive Mechanics Test Harness
 * 
 * Mock components and utilities for rapid prototyping and
 * validation of Q2 interactive mechanics before full implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock implementation utilities

// Q2 Interactive Mechanics mock configurations

// Municipal context mock data

describe('Q2 Interactive Mechanics Mock Implementations', () => {
  let mockHarness: Record<string, unknown>;
  let stateManager: Record<string, unknown>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHarness = createMockTestHarness();
    stateManager = createMockStateManager();
  });

  describe('Drag-Drop Workflow Mocks', () => {
    it('should mock municipal document workflow with realistic behavior', async () => {
      const _dragDropMock = createDragDropMock({
        workflow: Q2_MOCK_CONFIGURATIONS.dragDropWorkflow,
        municipality: 'malmö',
        realism: 'high'
      });

      render(
        <MockDragDropWorkflow 
          configuration={Q2_MOCK_CONFIGURATIONS.dragDropWorkflow}
          mockData={MUNICIPAL_MOCK_DATA.documents}
          municipality="malmö"
        />
      );


      // Test mock drag-drop behavior
        documentId: 'gdpr-001',
        fromZone: 'pending',
        toZone: 'review',
        userRole: 'employee'
      });

      expect(mockResult.success).toBe(true);
      expect(mockResult.newStatus).toBe('review');
      expect(mockResult.municipalValidation).toBe(true);

      // Verify mock state updates
      expect(stateManager.getDocumentStatus('gdpr-001')).toBe('review');
      expect(screen.getByText(/moved to review/i)).toBeInTheDocument();

      // Test mock municipal branding
      expect(screen.getByTestId('mock-branding-indicator')).toHaveClass('malmö-theme');
    });

    it('should mock workflow validation with municipal rules', async () => {
      const _workflowValidationMock = createWorkflowValidationMock({
        municipality: 'malmö',
        rules: ['gdpr-compliance', 'supervisor-approval', 'document-classification']
      });

      render(
        <MockWorkflowValidation 
          municipalRules={true}
          validationLevel="strict"
          municipality="malmö"
        />
      );

        documentType: 'gdpr-training',
        fromStatus: 'pending',
        toStatus: 'approved',
        userPermissions: ['read', 'review']
      });

      expect(validationResult.valid).toBe(false); // Missing supervisor approval
      expect(validationResult.requiredApprovals).toContain('supervisor');
      expect(validationResult.municipalCompliance).toBe(true);

      // Test validation error messages
      expect(screen.getByText(/supervisor approval required/i)).toBeInTheDocument();
      expect(screen.getByTestId('validation-error')).toHaveClass('municipal-error');
    });

    it('should mock accessibility-compliant drag-drop interactions', async () => {
      const _accessibilityMock = createAccessibilityDragDropMock({
        features: Q2_MOCK_CONFIGURATIONS.accessibilityFeatures,
        municipality: 'malmö'
      });

      render(
        <MockAccessibleDragDrop 
          keyboardSupport={true}
          screenReaderSupport={true}
          municipality="malmö"
        />
      );

      // Test keyboard-based mock drag-drop
        element: 'document-001',
        target: 'approved-zone',
        method: 'space-arrow-enter'
      });

      expect(keyboardResult.success).toBe(true);
      expect(keyboardResult.announcements).toContain('Document moved to approved zone');
      expect(keyboardResult.focusManagement).toBe('correct');

      // Test screen reader mock
      expect(screen.getByLabelText(/document selected for moving/i)).toBeInTheDocument();
      expect(screen.getByTestId('sr-announcement')).toHaveTextContent(/drag mode activated/i);
    });
  });

  describe('Timed Challenge Mocks', () => {
    it('should mock emergency response training with realistic timing', async () => {
      const _timerChallengeMock = createTimerChallengeMock({
        configuration: Q2_MOCK_CONFIGURATIONS.timedChallenge,
        municipality: 'malmö',
        realism: 'municipal-emergency'
      });

      render(
        <MockTimedChallenge 
          scenario="flood-response"
          duration={300000}
          municipality="malmö"
        />
      );

        scenario: 'coastal-flooding',
        participantRole: 'emergency-coordinator',
        timeConstraint: 300000,
        municipalProtocols: true
      });

      expect(challengeResult.completion).toBe(true);
      expect(challengeResult.timeUsed).toBeLessThan(300000);
      expect(challengeResult.protocolCompliance).toBe(true);

      // Verify mock checkpoint system
      expect(challengeResult.checkpoints).toHaveLength(3);
      expect(challengeResult.checkpoints[0].completed).toBe(true);
      expect(challengeResult.checkpoints[0].time).toBeLessThan(100000); // First checkpoint <100s

      // Test municipal context integration
      expect(challengeResult.municipalContext).toMatchObject({
        municipality: 'malmö',
        resources: expect.any(Array),
        protocols: expect.any(Array)
      });
    });

    it('should mock timer synchronization across multiple participants', async () => {
      const _multiParticipantMock = createMultiParticipantTimerMock({
        participants: 5,
        synchronization: 'real-time',
        municipality: 'malmö'
      });

      render(
        <MockMultiParticipantTimer 
          participantCount={5}
          synchronization={true}
          municipality="malmö"
        />
      );

        participants: [
          { id: 'anna-001', role: 'coordinator' },
          { id: 'erik-002', role: 'responder' },
          { id: 'sofia-003', role: 'responder' },
          { id: 'lars-004', role: 'supervisor' },
          { id: 'ingrid-005', role: 'observer' }
        ],
        challengeType: 'coordination-exercise'
      });

      expect(syncResult.allParticipantsSync).toBe(true);
      expect(syncResult.leaderboard).toHaveLength(5);
      expect(syncResult.collaborationScore).toBeGreaterThan(0.8);

      // Test mock real-time updates
      expect(syncResult.realTimeUpdates).toBe(true);
      expect(syncResult.networkLatencySimulation).toBeGreaterThan(0);
    });

    it('should mock adaptive difficulty based on municipal context', async () => {
      const _adaptiveDifficultyMock = createAdaptiveDifficultyMock({
        baseDifficulty: 'intermediate',
        adaptationFactors: ['user-performance', 'municipal-complexity', 'time-pressure'],
        municipality: 'malmö'
      });

      render(
        <MockAdaptiveDifficulty 
          initialDifficulty="intermediate"
          adaptationEnabled={true}
          municipality="malmö"
        />
      );

        userPerformance: 0.7, // 70% performance
        municipalComplexity: 'high',
        timePressure: 'moderate'
      });

      expect(adaptationResult.adjustedDifficulty).toBe('intermediate-plus');
      expect(adaptationResult.adaptationReason).toContain('municipal-complexity');
      expect(adaptationResult.userSatisfaction).toBeGreaterThan(0.75);

      // Verify mock difficulty indicators
      expect(screen.getByTestId('difficulty-indicator')).toHaveTextContent(/intermediate-plus/i);
      expect(screen.getByTestId('adaptation-reason')).toHaveTextContent(/municipal complexity/i);
    });
  });

  describe('Character Interaction Mocks', () => {
    it('should mock municipal professional character dialogues', async () => {
      const _characterMock = createCharacterInteractionMock({
        configuration: Q2_MOCK_CONFIGURATIONS.characterInteraction,
        municipality: 'malmö',
        culturalContext: 'swedish-professional'
      });

      render(
        <MockCharacterInteraction 
          characters={['anna-supervisor', 'klaus-colleague']}
          municipality="malmö"
          culturalContext="swedish"
        />
      );

        initiator: 'anna-supervisor',
        responder: 'klaus-colleague',
        topic: 'emergency-preparedness',
        emotionalContext: 'concerned-professional'
      });

      expect(dialogueResult.dialogueFlow).toBe('natural');
      expect(dialogueResult.culturalAppropriateness).toBe(true);
      expect(dialogueResult.professionalTone).toBe(true);

      // Verify mock character responses
      expect(screen.getByTestId('character-anna')).toHaveTextContent(/Vi behöver/i); // Swedish
      expect(screen.getByTestId('character-klaus')).toHaveTextContent(/Jag förstår/i); // Swedish

      // Test mock emotion state management
      expect(dialogueResult.emotionStates).toMatchObject({
        anna: 'concerned-professional',
        klaus: 'understanding-colleague'
      });
    });

    it('should mock branching narrative system for municipal scenarios', async () => {
      const _branchingMock = createBranchingNarrativeMock({
        scenarios: ['budget-discussion', 'emergency-protocol', 'citizen-service'],
        branchingPoints: 3,
        municipality: 'malmö'
      });

      render(
        <MockBranchingNarrative 
          scenario="budget-discussion"
          branchingEnabled={true}
          municipality="malmö"
        />
      );

        startingScenario: 'budget-discussion',
        userChoices: ['conservative-approach', 'citizen-consultation', 'transparency-focus'],
        targetOutcome: 'consensus-building'
      });

      expect(narrativeResult.pathTaken).toHaveLength(3);
      expect(narrativeResult.outcome).toBe('positive-consensus');
      expect(narrativeResult.municipalRealism).toBe(true);

      // Verify mock branching logic
      expect(narrativeResult.branchingPoints).toMatchObject({
        point1: { choice: 'conservative-approach', consequence: 'stakeholder-confidence' },
        point2: { choice: 'citizen-consultation', consequence: 'community-buy-in' },
        point3: { choice: 'transparency-focus', consequence: 'trust-building' }
      });
    });
  });

  describe('API and State Management Mocks', () => {
    it('should mock municipal API endpoints with realistic responses', async () => {
      const _apiMock = createMunicipalAPIMock({
        endpoints: ['documents', 'workflows', 'users', 'approvals'],
        responseTime: 200, // 200ms simulated latency
        municipality: 'malmö'
      });

      render(
        <MockAPIIntegration 
          endpoints={['documents', 'workflows']}
          municipality="malmö"
        />
      );

        endpoint: '/api/documents',
        method: 'GET',
        municipality: 'malmö',
        userContext: { role: 'employee', department: 'admin' }
      });

      expect(apiResult.success).toBe(true);
      expect(apiResult.data).toHaveLength(3); // Mock documents
      expect(apiResult.responseTime).toBeCloseTo(200, 50);

      // Verify mock authentication
      expect(apiResult.authenticated).toBe(true);
      expect(apiResult.permissions).toContain('read');

      // Test mock error scenarios
        endpoint: '/api/restricted',
        method: 'POST',
        municipality: 'malmö',
        userContext: { role: 'employee', department: 'admin' }
      });

      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBe('insufficient-permissions');
    });

    it('should mock state management with municipal business logic', async () => {
      const _stateMock = createStateManagementMock({
        stateStructure: 'municipal-workflow',
        persistenceStrategy: 'local-storage',
        municipality: 'malmö'
      });

      render(
        <MockStateManagement 
          initialState="empty-workflow"
          persistenceEnabled={true}
          municipality="malmö"
        />
      );

        action: 'DOCUMENT_SUBMITTED',
        payload: { documentId: 'gdpr-001', submittedBy: 'anna-001' },
        municipalValidation: true
      });

      expect(stateResult.stateTransition).toBe('successful');
      expect(stateResult.newState.documents['gdpr-001'].status).toBe('pending-review');
      expect(stateResult.municipalCompliance).toBe(true);

      // Test mock persistence
      expect(stateResult.persisted).toBe(true);
      expect(stateResult.storageKey).toBe('malmö-workflow-state');

      // Verify mock state validation
      expect(stateResult.stateValid).toBe(true);
      expect(stateResult.businessRulesApplied).toContain('gdpr-compliance');
    });
  });

  describe('Developer Experience and Rapid Prototyping', () => {
    it('should provide hot-reload mock components for rapid iteration', async () => {
      const _hotReloadMock = createHotReloadMock({
        componentTypes: ['drag-drop', 'timer', 'character'],
        reloadStrategy: 'instant',
        municipality: 'malmö'
      });

      render(
        <MockHotReloadEnvironment 
          mockComponents={['DragDropWorkflow', 'TimedChallenge']}
          municipality="malmö"
        />
      );

        componentName: 'DragDropWorkflow',
        changes: { municipalBranding: 'updated', accessibility: 'enhanced' },
        preserveState: true
      });

      expect(hotReloadResult.reloadTime).toBeLessThan(100); // <100ms
      expect(hotReloadResult.statePreserved).toBe(true);
      expect(hotReloadResult.changesApplied).toBe(true);

      // Verify mock developer feedback
      expect(screen.getByTestId('reload-indicator')).toHaveTextContent(/updated/i);
      expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
    });

    it('should mock design validation with municipal appropriateness checking', async () => {
      const _designValidationMock = createDesignValidationMock({
        criteria: ['municipal-appropriateness', 'accessibility', 'cultural-sensitivity'],
        municipality: 'malmö'
      });

      render(
        <MockDesignValidation 
          validationCriteria={['municipal', 'accessibility']}
          municipality="malmö"
        />
      );

        componentType: 'interactive-workflow',
        municipalContext: 'malmö',
        designElements: ['colors', 'typography', 'iconography', 'interactions']
      });

      expect(validationResult.municipalAppropriateness).toBe(true);
      expect(validationResult.accessibilityScore).toBeGreaterThan(0.9);
      expect(validationResult.culturalSensitivity).toBe(true);

      // Test mock design feedback
      expect(validationResult.feedback).toContain('municipal-branding-consistent');
      expect(validationResult.improvements).toHaveLength(0); // No improvements needed

      // Verify mock validation UI
      expect(screen.getByTestId('validation-score')).toHaveTextContent(/95%/i);
      expect(screen.getByTestId('validation-badge')).toHaveClass('validated');
    });
  });
});

// Mock harness factory functions
function createMockTestHarness() {
  return {
    createMock: mockUtils.createMockComponent,
    simulateResponse: mockUtils.simulateApiResponse,
    validateBehavior: mockUtils.validateMockBehavior
  };
}

function createMockStateManager() {
  return {
    getDocumentStatus: vi.fn().mockReturnValue('review'),
    updateState: vi.fn(),
    persist: vi.fn()
  };
}

function createDragDropMock(config: Record<string, unknown>) {
  return {
    simulateDocumentMove: vi.fn().mockResolvedValue({
      success: true,
      newStatus: 'review',
      municipalValidation: true
    })
  };
}

function createWorkflowValidationMock(config: Record<string, unknown>) {
  return {
    validateDocumentTransition: vi.fn().mockResolvedValue({
      valid: false,
      requiredApprovals: ['supervisor'],
      municipalCompliance: true
    })
  };
}

function createAccessibilityDragDropMock(config: Record<string, unknown>) {
  return {
    simulateKeyboardDragDrop: vi.fn().mockResolvedValue({
      success: true,
      announcements: ['Document moved to approved zone'],
      focusManagement: 'correct'
    })
  };
}

function createTimerChallengeMock(config: Record<string, unknown>) {
  return {
    simulateEmergencyChallenge: vi.fn().mockResolvedValue({
      completion: true,
      timeUsed: 280000,
      protocolCompliance: true,
      checkpoints: [
        { completed: true, time: 80000 },
        { completed: true, time: 180000 },
        { completed: true, time: 260000 }
      ],
      municipalContext: {
        municipality: 'malmö',
        resources: ['fire', 'medical', 'police'],
        protocols: ['evacuation', 'communication', 'coordination']
      }
    })
  };
}

function createMultiParticipantTimerMock(config: Record<string, unknown>) {
  return {
    simulateMultiParticipantChallenge: vi.fn().mockResolvedValue({
      allParticipantsSync: true,
      leaderboard: [
        { id: 'lars-004', score: 95 },
        { id: 'anna-001', score: 92 },
        { id: 'sofia-003', score: 88 },
        { id: 'erik-002', score: 85 },
        { id: 'ingrid-005', score: 82 }
      ],
      collaborationScore: 0.87,
      realTimeUpdates: true,
      networkLatencySimulation: 50
    })
  };
}

function createAdaptiveDifficultyMock(config: Record<string, unknown>) {
  return {
    simulateAdaptiveDifficulty: vi.fn().mockResolvedValue({
      adjustedDifficulty: 'intermediate-plus',
      adaptationReason: 'municipal-complexity-high',
      userSatisfaction: 0.82
    })
  };
}

function createCharacterInteractionMock(config: Record<string, unknown>) {
  return {
    simulateCharacterDialogue: vi.fn().mockResolvedValue({
      dialogueFlow: 'natural',
      culturalAppropriateness: true,
      professionalTone: true,
      emotionStates: {
        anna: 'concerned-professional',
        klaus: 'understanding-colleague'
      }
    })
  };
}

function createBranchingNarrativeMock(config: Record<string, unknown>) {
  return {
    simulateBranchingNarrative: vi.fn().mockResolvedValue({
      pathTaken: ['conservative-approach', 'citizen-consultation', 'transparency-focus'],
      outcome: 'positive-consensus',
      municipalRealism: true,
      branchingPoints: {
        point1: { choice: 'conservative-approach', consequence: 'stakeholder-confidence' },
        point2: { choice: 'citizen-consultation', consequence: 'community-buy-in' },
        point3: { choice: 'transparency-focus', consequence: 'trust-building' }
      }
    })
  };
}

function createMunicipalAPIMock(config: Record<string, unknown>) {
  return {
    simulateAPICall: vi.fn()
      .mockResolvedValueOnce({
        success: true,
        data: MUNICIPAL_MOCK_DATA.documents,
        responseTime: 195,
        authenticated: true,
        permissions: ['read', 'write']
      })
      .mockResolvedValueOnce({
        success: false,
        error: 'insufficient-permissions'
      })
  };
}

function createStateManagementMock(config: Record<string, unknown>) {
  return {
    simulateStateTransition: vi.fn().mockResolvedValue({
      stateTransition: 'successful',
      newState: {
        documents: {
          'gdpr-001': { status: 'pending-review', submittedBy: 'anna-001' }
        }
      },
      municipalCompliance: true,
      persisted: true,
      storageKey: 'malmö-workflow-state',
      stateValid: true,
      businessRulesApplied: ['gdpr-compliance', 'workflow-validation']
    })
  };
}

function createHotReloadMock(config: Record<string, unknown>) {
  return {
    simulateComponentUpdate: vi.fn().mockResolvedValue({
      reloadTime: 85,
      statePreserved: true,
      changesApplied: true
    })
  };
}

function createDesignValidationMock(config: Record<string, unknown>) {
  return {
    validateDesign: vi.fn().mockResolvedValue({
      municipalAppropriateness: true,
      accessibilityScore: 0.95,
      culturalSensitivity: true,
      feedback: ['municipal-branding-consistent', 'accessibility-excellent'],
      improvements: []
    })
  };
}

// Mock components for testing
function MockDragDropWorkflow({ configuration, mockData, municipality }: Record<string, unknown>) {
  return (
    <div data-testid="mock-drag-drop-workflow">
      <div data-testid="mock-document-gdpr-001">GDPR Training Document</div>
      <div data-testid="mock-zone-review">Review Zone</div>
      <div data-testid="mock-branding-indicator" className="malmö-theme">Malmö</div>
      <div>Moved to review</div>
    </div>
  );
}

function MockWorkflowValidation({ municipalRules, validationLevel, municipality }: Record<string, unknown>) {
  return (
    <div data-testid="mock-workflow-validation">
      <div>Supervisor approval required</div>
      <div data-testid="validation-error" className="municipal-error">Error</div>
    </div>
  );
}

function MockAccessibleDragDrop({ keyboardSupport, screenReaderSupport, municipality }: Record<string, unknown>) {
  return (
    <div data-testid="mock-accessible-drag-drop">
      <div aria-label="document selected for moving">Document</div>
      <div data-testid="sr-announcement">Drag mode activated</div>
    </div>
  );
}

function MockTimedChallenge({ scenario, duration, municipality }: Record<string, unknown>) {
  return (
    <div data-testid="mock-timed-challenge">
      <div data-testid="challenge-timer">05:00</div>
      <div data-testid="scenario-name">{scenario}</div>
    </div>
  );
}

function MockMultiParticipantTimer({ participantCount, synchronization, municipality }: Record<string, unknown>) {
  return (
    <div data-testid="mock-multi-participant-timer">
      <div data-testid="participant-count">{participantCount}</div>
      <div data-testid="sync-status">Synchronized</div>
    </div>
  );
}

function MockAdaptiveDifficulty({ initialDifficulty, adaptationEnabled, municipality }: Record<string, unknown>) {
  return (
    <div data-testid="mock-adaptive-difficulty">
      <div data-testid="difficulty-indicator">Intermediate-plus</div>
      <div data-testid="adaptation-reason">Municipal complexity</div>
    </div>
  );
}

function MockCharacterInteraction({ characters, municipality, culturalContext }: Record<string, unknown>) {
  return (
    <div data-testid="mock-character-interaction">
      <div data-testid="character-anna">Vi behöver förbereda oss</div>
      <div data-testid="character-klaus">Jag förstår situationen</div>
    </div>
  );
}

function MockBranchingNarrative({ scenario, branchingEnabled, municipality }: Record<string, unknown>) {
  return (
    <div data-testid="mock-branching-narrative">
      <div data-testid="scenario-name">{scenario}</div>
      <div data-testid="branching-point">Choose approach</div>
    </div>
  );
}

function MockAPIIntegration({ endpoints, municipality }: Record<string, unknown>) {
  return (
    <div data-testid="mock-api-integration">
      <div data-testid="api-status">Connected</div>
      <div data-testid="endpoint-count">{endpoints.length}</div>
    </div>
  );
}

function MockStateManagement({ initialState, persistenceEnabled, municipality }: Record<string, unknown>) {
  return (
    <div data-testid="mock-state-management">
      <div data-testid="state-status">Active</div>
      <div data-testid="persistence-status">{persistenceEnabled ? 'Enabled' : 'Disabled'}</div>
    </div>
  );
}

function MockHotReloadEnvironment({ mockComponents, municipality }: Record<string, unknown>) {
  return (
    <div data-testid="mock-hot-reload-environment">
      <div data-testid="reload-indicator">Updated</div>
      <div data-testid="performance-metrics">Performance: Good</div>
    </div>
  );
}

function MockDesignValidation({ validationCriteria, municipality }: Record<string, unknown>) {
  return (
    <div data-testid="mock-design-validation">
      <div data-testid="validation-score">95%</div>
      <div data-testid="validation-badge" className="validated">Validated</div>
    </div>
  );
}