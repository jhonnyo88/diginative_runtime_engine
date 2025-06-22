/**
 * Comprehensive Test Suite for Game State Manager Service
 * Task: task-emergency-002 - Critical Service Test Implementation
 * Service: game-state-manager.tsx
 * Roadmap Ref: Q1-Foundation-Autonomi-Milestone-1.1
 * 
 * Test Coverage:
 * - Unit Tests: All state management methods and React hooks
 * - Integration Tests: Database interactions and autosave functionality
 * - Health Checks: Service availability and session validation
 * - Component Tests: React components and JSX rendering
 * - Municipal Tests: Anna Svensson workflow optimization and interruption handling
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { 
  gameStateManager, 
  useGameState, 
  ResumeGameDialog,
  GameState, 
  GameResults 
} from '../../services/game-state-manager';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        })),
        is: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn()
          }))
        })),
        lt: vi.fn()
      })),
      is: vi.fn(() => ({
        lt: vi.fn()
      })),
      order: vi.fn(() => ({
        limit: vi.fn()
      }))
    })),
    upsert: vi.fn(),
    update: vi.fn(() => ({
      eq: vi.fn()
    })),
    insert: vi.fn(),
    delete: vi.fn(() => ({
      is: vi.fn(() => ({
        lt: vi.fn()
      }))
    }))
  }))
};

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase
}));

// Mock crypto.randomUUID
global.crypto = {
  randomUUID: vi.fn(() => 'test-session-id-12345')
} as any;

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  },
  writable: true
});

// Mock window and screen
Object.defineProperty(global, 'window', {
  value: {
    screen: {
      width: 375,
      height: 812
    }
  },
  writable: true
});

// Mock console methods to reduce noise
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('GameStateManager Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Clear any existing intervals
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Game Session Management', () => {
    it('should start a new game session successfully', async () => {
      // Mock successful database save
      const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      
      mockSupabase.from.mockReturnValue({
        upsert: mockUpsert,
        insert: mockInsert
      });

      const gameState = await gameStateManager.startGameSession(
        'anna.svensson@malmo.se',
        'gdpr-training-v2',
        'malmo_municipality',
        'swedish_municipal'
      );

      expect(gameState).toMatchObject({
        sessionId: 'test-session-id-12345',
        userId: 'anna.svensson@malmo.se',
        gameId: 'gdpr-training-v2',
        tenantId: 'malmo_municipality',
        culturalContext: 'swedish_municipal',
        sceneIndex: 0,
        currentSceneId: ''
      });

      expect(gameState.progress.completedScenes).toHaveLength(0);
      expect(gameState.progress.startTime).toBeDefined();
      expect(gameState.deviceInfo.isMobile).toBe(true);
      expect(gameState.deviceInfo.screenSize).toBe('375x812');

      // Verify database calls
      expect(mockUpsert).toHaveBeenCalledWith({
        id: 'test-session-id-12345',
        user_id: 'anna.svensson@malmo.se',
        game_id: 'gdpr-training-v2',
        tenant_id: 'malmo_municipality',
        started_at: expect.any(String),
        progress: expect.objectContaining({
          currentSceneId: '',
          sceneIndex: 0,
          completedScenes: [],
          culturalContext: 'swedish_municipal'
        })
      });

      // Verify analytics tracking
      expect(mockInsert).toHaveBeenCalledWith({
        session_id: 'test-session-id-12345',
        event_type: 'session_started',
        event_data: expect.objectContaining({
          sessionId: 'test-session-id-12345',
          userId: 'anna.svensson@malmo.se',
          culturalContext: 'swedish_municipal',
          deviceType: 'mobile'
        })
      });
    });

    it('should resume existing game session with valid data', async () => {
      const mockSessionData = {
        id: 'existing-session-123',
        user_id: 'anna.svensson@malmo.se',
        game_id: 'gdpr-training-v2',
        tenant_id: 'malmo_municipality',
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        completed_at: null,
        progress: {
          currentSceneId: 'scene-3',
          sceneIndex: 2,
          completedScenes: ['scene-1', 'scene-2'],
          sceneResults: {
            'scene-1': { score: 85, maxScore: 100 },
            'scene-2': { score: 92, maxScore: 100 }
          },
          totalTimeSpent: 180000, // 3 minutes
          culturalContext: 'swedish_municipal',
          deviceInfo: {
            isMobile: true,
            userAgent: 'test-agent',
            screenSize: '375x812'
          }
        }
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSessionData, error: null })
          })
        })
      });

      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        insert: mockInsert
      });

      const resumedState = await gameStateManager.resumeGameSession('existing-session-123');

      expect(resumedState).toMatchObject({
        sessionId: 'existing-session-123',
        userId: 'anna.svensson@malmo.se',
        gameId: 'gdpr-training-v2',
        currentSceneId: 'scene-3',
        sceneIndex: 2,
        culturalContext: 'swedish_municipal'
      });

      expect(resumedState?.progress.completedScenes).toEqual(['scene-1', 'scene-2']);
      expect(resumedState?.progress.totalTimeSpent).toBe(180000);

      // Verify analytics tracking for resume
      expect(mockInsert).toHaveBeenCalledWith({
        session_id: 'existing-session-123',
        event_type: 'session_resumed',
        event_data: expect.objectContaining({
          sessionId: 'existing-session-123',
          resumeAfterMinutes: 30,
          progress: 2
        })
      });
    });

    it('should return null for non-existent session', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await gameStateManager.resumeGameSession('non-existent-session');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to resume session:', 
        expect.objectContaining({ code: 'PGRST116' })
      );
    });

    it('should reject sessions older than 24 hours', async () => {
      const oldSessionData = {
        id: 'old-session-123',
        user_id: 'anna.svensson@malmo.se',
        started_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
        completed_at: null,
        progress: Record<string, unknown>
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: oldSessionData, error: null })
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await gameStateManager.resumeGameSession('old-session-123');

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Session too old to resume, starting new session'
      );
    });
  });

  describe('State Updates and Progress Tracking', () => {
    beforeEach(async () => {
      // Start a session for update tests
      const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      
      mockSupabase.from.mockReturnValue({
        upsert: mockUpsert,
        insert: mockInsert
      });

      await gameStateManager.startGameSession(
        'anna.svensson@malmo.se',
        'gdpr-training-v2',
        'malmo_municipality',
        'swedish_municipal'
      );
    });

    it('should update game state with scene completion', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      
      mockSupabase.from.mockReturnValue({
        upsert: mockUpsert,
        insert: mockInsert
      });

      await gameStateManager.updateGameState('test-session-id-12345', {
        currentSceneId: 'scene-1',
        sceneIndex: 1,
        sceneResult: { score: 85, maxScore: 100, timeSpent: 45000 },
        timeSpent: 45000
      });

      // Verify database update was called
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-session-id-12345',
          progress: expect.objectContaining({
            currentSceneId: 'scene-1',
            sceneIndex: 1,
            completedScenes: ['scene-1'],
            sceneResults: {
              'scene-1': { score: 85, maxScore: 100, timeSpent: 45000 }
            },
            totalTimeSpent: 45000
          })
        })
      );

      // Verify analytics tracking
      expect(mockInsert).toHaveBeenCalledWith({
        session_id: 'test-session-id-12345',
        event_type: 'scene_completed',
        event_data: expect.objectContaining({
          sessionId: 'test-session-id-12345',
          sceneId: 'scene-1',
          timeSpent: 45000
        })
      });
    });

    it('should handle state update without active session', async () => {
      await gameStateManager.updateGameState('non-existent-session', {
        currentSceneId: 'scene-1'
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('No active session to update');
    });

    it('should not duplicate completed scenes', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      
      mockSupabase.from.mockReturnValue({
        upsert: mockUpsert,
        insert: mockInsert
      });

      // Complete scene-1 twice
      await gameStateManager.updateGameState('test-session-id-12345', {
        currentSceneId: 'scene-1',
        sceneResult: { score: 85 }
      });

      await gameStateManager.updateGameState('test-session-id-12345', {
        currentSceneId: 'scene-1',
        sceneResult: { score: 90 }
      });

      // Verify scene-1 appears only once in completed scenes
      const lastCall = mockUpsert.mock.calls[mockUpsert.mock.calls.length - 1][0];
      expect(lastCall.progress.completedScenes).toEqual(['scene-1']);
    });
  });

  describe('Game Completion and Results', () => {
    beforeEach(async () => {
      // Start a session and complete some scenes
      const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      
      mockSupabase.from.mockReturnValue({
        upsert: mockUpsert,
        insert: mockInsert
      });

      await gameStateManager.startGameSession(
        'anna.svensson@malmo.se',
        'gdpr-training-v2',
        'malmo_municipality',
        'swedish_municipal'
      );

      // Complete some scenes
      await gameStateManager.updateGameState('test-session-id-12345', {
        currentSceneId: 'scene-1',
        sceneResult: { score: 85, maxScore: 100 }
      });

      await gameStateManager.updateGameState('test-session-id-12345', {
        currentSceneId: 'scene-2',
        sceneResult: { score: 95, maxScore: 100 }
      });
    });

    it('should complete game session and generate results', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      });
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      
      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
        insert: mockInsert
      });

      const results = await gameStateManager.completeGameSession('test-session-id-12345');

      expect(results).toMatchObject({
        sessionId: 'test-session-id-12345',
        totalScore: 90, // (85 + 95) / 200 * 100
        completionRate: 40, // 2 scenes out of 5 expected
        timeSpent: expect.any(Number)
      });

      expect(results?.achievements).toContain('speed_learner');
      expect(results?.achievements).toContain('mobile_professional');
      expect(results?.achievements).toContain('swedish_municipal_certified');

      // Verify database completion update
      expect(mockUpdate).toHaveBeenCalledWith({
        completed_at: expect.any(String),
        results: expect.objectContaining({
          sessionId: 'test-session-id-12345',
          totalScore: 90
        })
      });

      // Verify completion analytics
      expect(mockInsert).toHaveBeenCalledWith({
        session_id: 'test-session-id-12345',
        event_type: 'session_completed',
        event_data: expect.objectContaining({
          sessionId: 'test-session-id-12345',
          totalScore: 90,
          completionRate: 40
        })
      });
    });

    it('should award excellence achievement for high scores', async () => {
      // Update with perfect scores
      const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      });
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      
      mockSupabase.from.mockReturnValue({
        upsert: mockUpsert,
        update: mockUpdate,
        insert: mockInsert
      });

      await gameStateManager.updateGameState('test-session-id-12345', {
        currentSceneId: 'scene-3',
        sceneResult: { score: 100, maxScore: 100 }
      });

      await gameStateManager.updateGameState('test-session-id-12345', {
        currentSceneId: 'scene-4',
        sceneResult: { score: 98, maxScore: 100 }
      });

      const results = await gameStateManager.completeGameSession('test-session-id-12345');

      expect(results?.achievements).toContain('excellence_award');
      expect(results?.totalScore).toBeGreaterThanOrEqual(95);
    });

    it('should handle completion without active session', async () => {
      const results = await gameStateManager.completeGameSession('non-existent-session');

      expect(results).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('No active session to complete');
    });
  });

  describe('Session Management and Cleanup', () => {
    it('should fetch user incomplete sessions', async () => {
      const mockSessionsData = [
        {
          id: 'session-1',
          user_id: 'anna.svensson@malmo.se',
          game_id: 'gdpr-training-v2',
          tenant_id: 'malmo_municipality',
          started_at: new Date().toISOString(),
          progress: {
            currentSceneId: 'scene-2',
            sceneIndex: 1,
            completedScenes: ['scene-1'],
            culturalContext: 'swedish_municipal'
          }
        },
        {
          id: 'session-2',
          user_id: 'anna.svensson@malmo.se',
          game_id: 'ethics-training',
          tenant_id: 'malmo_municipality',
          started_at: new Date().toISOString(),
          progress: null
        }
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: mockSessionsData, error: null })
            })
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const sessions = await gameStateManager.getUserIncompleteSessions('anna.svensson@malmo.se');

      expect(sessions).toHaveLength(2);
      expect(sessions[0]).toMatchObject({
        sessionId: 'session-1',
        gameId: 'gdpr-training-v2',
        currentSceneId: 'scene-2',
        sceneIndex: 1,
        culturalContext: 'swedish_municipal'
      });

      // Second session should have default progress values
      expect(sessions[1]).toMatchObject({
        sessionId: 'session-2',
        gameId: 'ethics-training',
        progress: expect.objectContaining({
          completedScenes: [],
          sceneResults: Record<string, unknown>
        })
      });
    });

    it('should handle fetch sessions database error', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
            })
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const sessions = await gameStateManager.getUserIncompleteSessions('anna.svensson@malmo.se');

      expect(sessions).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch incomplete sessions:', 
        expect.objectContaining({ message: 'Database error' })
      );
    });

    it('should cleanup old incomplete sessions', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        is: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete
      });

      await gameStateManager.cleanupOldSessions();

      expect(mockDelete).toHaveBeenCalled();
      
      const deleteCall = mockDelete.mock.results[0].value;
      expect(deleteCall.is).toHaveBeenCalledWith('completed_at', null);
    });

    it('should handle cleanup database errors gracefully', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        is: vi.fn().mockReturnValue({
          lt: vi.fn().mockRejectedValue(new Error('Delete failed'))
        })
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete
      });

      await gameStateManager.cleanupOldSessions();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error cleaning up old sessions:', 
        expect.any(Error)
      );
    });
  });

  describe('Autosave Functionality', () => {
    it('should setup autosave when starting session', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      
      mockSupabase.from.mockReturnValue({
        upsert: mockUpsert,
        insert: mockInsert
      });

      await gameStateManager.startGameSession(
        'anna.svensson@malmo.se',
        'gdpr-training-v2',
        'malmo_municipality',
        'swedish_municipal'
      );

      // Fast-forward time to trigger autosave
      vi.advanceTimersByTime(30000); // 30 seconds

      // Wait for any pending promises
      await vi.runAllTimersAsync();

      // Verify autosave triggered database save
      expect(mockUpsert).toHaveBeenCalledTimes(2); // Initial save + autosave
    });

    it('should stop autosave when completing session', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      });
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      
      mockSupabase.from.mockReturnValue({
        upsert: mockUpsert,
        update: mockUpdate,
        insert: mockInsert
      });

      await gameStateManager.startGameSession(
        'anna.svensson@malmo.se',
        'gdpr-training-v2',
        'malmo_municipality',
        'swedish_municipal'
      );

      await gameStateManager.completeGameSession('test-session-id-12345');

      // Fast-forward time - autosave should not trigger
      const saveCallCount = mockUpsert.mock.calls.length;
      vi.advanceTimersByTime(60000); // 1 minute
      await vi.runAllTimersAsync();

      expect(mockUpsert).toHaveBeenCalledTimes(saveCallCount); // No additional saves
    });
  });
});

describe('useGameState React Hook Tests', () => {
  function TestComponent({ userId, gameId, tenantId }: { 
    userId: string; 
    gameId: string; 
    tenantId: string; 
  }) {
    const { gameState, isLoading, startNewGame, resumeGame, updateState, completeGame } = useGameState();

    return (
      <div>
        <div data-testid="loading">{isLoading ? 'Loading' : 'Ready'}</div>
        <div data-testid="session-id">{gameState?.sessionId || 'No session'}</div>
        <div data-testid="scene-index">{gameState?.sceneIndex || 0}</div>
        
        <button 
          data-testid="start-game"
          onClick={() => startNewGame(userId, gameId, tenantId, 'swedish_municipal')}
        >
          Start Game
        </button>
        
        <button 
          data-testid="resume-game"
          onClick={() => resumeGame('test-resume-session')}
        >
          Resume Game
        </button>
        
        <button 
          data-testid="update-state"
          onClick={() => updateState({ sceneIndex: 1, currentSceneId: 'scene-1' })}
        >
          Update State
        </button>
        
        <button 
          data-testid="complete-game"
          onClick={() => completeGame()}
        >
          Complete Game
        </button>
      </div>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful database operations
    const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null })
    });
    
    mockSupabase.from.mockReturnValue({
      upsert: mockUpsert,
      insert: mockInsert,
      update: mockUpdate
    });
  });

  it('should start new game through hook', async () => {
    render(
      <TestComponent 
        userId="anna.svensson@malmo.se"
        gameId="gdpr-training-v2"
        tenantId="malmo_municipality"
      />
    );

    expect(screen.getByTestId('session-id')).toHaveTextContent('No session');
    expect(screen.getByTestId('loading')).toHaveTextContent('Ready');

    fireEvent.click(screen.getByTestId('start-game'));

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    });

    // Should complete and show session ID
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Ready');
      expect(screen.getByTestId('session-id')).toHaveTextContent('test-session-id-12345');
    });
  });

  it('should resume game through hook', async () => {
    // Mock resume session response
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'test-resume-session',
              user_id: 'anna.svensson@malmo.se',
              game_id: 'gdpr-training-v2',
              tenant_id: 'malmo_municipality',
              started_at: new Date().toISOString(),
              completed_at: null,
              progress: {
                currentSceneId: 'scene-2',
                sceneIndex: 1,
                completedScenes: ['scene-1']
              }
            },
            error: null
          })
        })
      })
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      insert: vi.fn().mockResolvedValue({ data: null, error: null })
    });

    render(
      <TestComponent 
        userId="anna.svensson@malmo.se"
        gameId="gdpr-training-v2"
        tenantId="malmo_municipality"
      />
    );

    fireEvent.click(screen.getByTestId('resume-game'));

    await waitFor(() => {
      expect(screen.getByTestId('session-id')).toHaveTextContent('test-resume-session');
      expect(screen.getByTestId('scene-index')).toHaveTextContent('1');
    });
  });

  it('should update game state through hook', async () => {
    render(
      <TestComponent 
        userId="anna.svensson@malmo.se"
        gameId="gdpr-training-v2"
        tenantId="malmo_municipality"
      />
    );

    // Start game first
    fireEvent.click(screen.getByTestId('start-game'));
    
    await waitFor(() => {
      expect(screen.getByTestId('session-id')).toHaveTextContent('test-session-id-12345');
    });

    // Update state
    fireEvent.click(screen.getByTestId('update-state'));

    // Verify update was called (check would be in the gameStateManager mock)
    expect(mockSupabase.from).toHaveBeenCalled();
  });

  it('should complete game through hook', async () => {
    render(
      <TestComponent 
        userId="anna.svensson@malmo.se"
        gameId="gdpr-training-v2"
        tenantId="malmo_municipality"
      />
    );

    // Start game first
    fireEvent.click(screen.getByTestId('start-game'));
    
    await waitFor(() => {
      expect(screen.getByTestId('session-id')).toHaveTextContent('test-session-id-12345');
    });

    // Complete game
    fireEvent.click(screen.getByTestId('complete-game'));

    await waitFor(() => {
      expect(screen.getByTestId('session-id')).toHaveTextContent('No session');
    });
  });
});

describe('ResumeGameDialog Component Tests', () => {
  const mockIncompleteSessions: GameState[] = [
    {
      sessionId: 'session-1',
      userId: 'anna.svensson@malmo.se',
      gameId: 'GDPR Utbildning',
      tenantId: 'malmo_municipality',
      currentSceneId: 'scene-2',
      sceneIndex: 1,
      progress: {
        completedScenes: ['scene-1'],
        sceneResults: Record<string, unknown>,
        startTime: '2025-01-19T09:00:00Z',
        lastActiveTime: '2025-01-19T09:15:00Z',
        totalTimeSpent: 900000
      },
      culturalContext: 'swedish_municipal',
      deviceInfo: {
        isMobile: true,
        userAgent: 'test',
        screenSize: '375x812'
      }
    },
    {
      sessionId: 'session-2',
      userId: 'anna.svensson@malmo.se',
      gameId: 'Etik Utbildning',
      tenantId: 'malmo_municipality',
      currentSceneId: 'scene-1',
      sceneIndex: 0,
      progress: {
        completedScenes: [],
        sceneResults: Record<string, unknown>,
        startTime: '2025-01-19T10:00:00Z',
        lastActiveTime: '2025-01-19T10:05:00Z',
        totalTimeSpent: 300000
      },
      culturalContext: 'swedish_municipal',
      deviceInfo: {
        isMobile: true,
        userAgent: 'test',
        screenSize: '375x812'
      }
    }
  ];

  it('should render resume dialog with incomplete sessions', () => {
    const mockOnResume = vi.fn();
    const mockOnStartNew = vi.fn();

    render(
      <ResumeGameDialog
        incompleteSessions={mockIncompleteSessions}
        onResume={mockOnResume}
        onStartNew={mockOnStartNew}
      />
    );

    expect(screen.getByText('Fortsätt där du slutade, Anna!')).toBeInTheDocument();
    expect(screen.getByText('Du har 2 påbörjade utbildningar:')).toBeInTheDocument();
    
    expect(screen.getByText('GDPR Utbildning')).toBeInTheDocument();
    expect(screen.getByText('Etik Utbildning')).toBeInTheDocument();
    
    expect(screen.getByText('Förlopp: 1 scener klara')).toBeInTheDocument();
    expect(screen.getByText('Förlopp: 0 scener klara')).toBeInTheDocument();
    
    expect(screen.getByText('Börja ny utbildning istället')).toBeInTheDocument();
  });

  it('should call onResume when resume button clicked', () => {
    const mockOnResume = vi.fn();
    const mockOnStartNew = vi.fn();

    render(
      <ResumeGameDialog
        incompleteSessions={mockIncompleteSessions}
        onResume={mockOnResume}
        onStartNew={mockOnStartNew}
      />
    );

    const resumeButtons = screen.getAllByText('Fortsätt');
    fireEvent.click(resumeButtons[0]);

    expect(mockOnResume).toHaveBeenCalledWith('session-1');
  });

  it('should call onStartNew when start new button clicked', () => {
    const mockOnResume = vi.fn();
    const mockOnStartNew = vi.fn();

    render(
      <ResumeGameDialog
        incompleteSessions={mockIncompleteSessions}
        onResume={mockOnResume}
        onStartNew={mockOnStartNew}
      />
    );

    fireEvent.click(screen.getByText('Börja ny utbildning istället'));

    expect(mockOnStartNew).toHaveBeenCalled();
  });

  it('should not render when no incomplete sessions', () => {
    const mockOnResume = vi.fn();
    const mockOnStartNew = vi.fn();

    const { container } = render(
      <ResumeGameDialog
        incompleteSessions={[]}
        onResume={mockOnResume}
        onStartNew={mockOnStartNew}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should format dates in Swedish locale', () => {
    const mockOnResume = vi.fn();
    const mockOnStartNew = vi.fn();

    render(
      <ResumeGameDialog
        incompleteSessions={mockIncompleteSessions}
        onResume={mockOnResume}
        onStartNew={mockOnStartNew}
      />
    );

    // Check that dates are displayed (exact format may vary by environment)
    expect(screen.getByText(/Startat:/)).toBeInTheDocument();
  });
});

describe('Health Checks and Error Handling', () => {
  it('should handle database save failures gracefully', async () => {
    const mockUpsert = vi.fn().mockRejectedValue(new Error('Database connection failed'));
    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
    
    mockSupabase.from.mockReturnValue({
      upsert: mockUpsert,
      insert: mockInsert
    });

    await gameStateManager.startGameSession(
      'anna.svensson@malmo.se',
      'gdpr-training-v2',
      'malmo_municipality',
      'swedish_municipal'
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to save game state:', 
      expect.any(Error)
    );
  });

  it('should handle analytics tracking failures gracefully', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockInsert = vi.fn().mockRejectedValue(new Error('Analytics service unavailable'));
    
    mockSupabase.from.mockReturnValue({
      upsert: mockUpsert,
      insert: mockInsert
    });

    // Should not throw error despite analytics failure
    const gameState = await gameStateManager.startGameSession(
      'anna.svensson@malmo.se',
      'gdpr-training-v2',
      'malmo_municipality',
      'swedish_municipal'
    );

    expect(gameState).toBeDefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to track analytics event:', 
      expect.any(Error)
    );
  });

  it('should validate mobile detection for Anna Svensson workflow', async () => {
    // Test with desktop user agent
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      writable: true
    });

    const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
    
    mockSupabase.from.mockReturnValue({
      upsert: mockUpsert,
      insert: mockInsert
    });

    const gameState = await gameStateManager.startGameSession(
      'anna.svensson@malmo.se',
      'gdpr-training-v2',
      'malmo_municipality',
      'swedish_municipal'
    );

    expect(gameState.deviceInfo.isMobile).toBe(false);

    // Reset to mobile user agent
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      },
      writable: true
    });
  });

  it('should handle score calculation edge cases', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null })
    });
    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
    
    mockSupabase.from.mockReturnValue({
      upsert: mockUpsert,
      update: mockUpdate,
      insert: mockInsert
    });

    await gameStateManager.startGameSession(
      'anna.svensson@malmo.se',
      'gdpr-training-v2',
      'malmo_municipality',
      'swedish_municipal'
    );

    // Test with invalid scene results
    await gameStateManager.updateGameState('test-session-id-12345', {
      currentSceneId: 'scene-1',
      sceneResult: { score: null, maxScore: undefined }
    });

    await gameStateManager.updateGameState('test-session-id-12345', {
      currentSceneId: 'scene-2',
      sceneResult: Record<string, unknown> // Empty result
    });

    const results = await gameStateManager.completeGameSession('test-session-id-12345');

    expect(results?.totalScore).toBe(0); // Should handle invalid scores gracefully
  });
});