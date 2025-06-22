/**
 * Game State Manager - Save/Resume Functionality
 * Critical för Anna Svensson municipal work interruptions
 */

import React from 'react';
import { supabase } from '../lib/supabase';

export interface GameState {
  sessionId: string;
  userId: string;
  gameId: string;
  tenantId: string;
  currentSceneId: string;
  sceneIndex: number;
  progress: {
    completedScenes: string[];
    sceneResults: Record<string, any>;
    startTime: string;
    lastActiveTime: string;
    totalTimeSpent: number; // milliseconds
  };
  culturalContext: 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal';
  deviceInfo: {
    isMobile: boolean;
    userAgent: string;
    screenSize: string;
  };
}

export interface GameResults {
  sessionId: string;
  completedAt: string;
  totalScore: number;
  achievements: string[];
  sceneResults: Record<string, any>;
  timeSpent: number;
  completionRate: number;
}

class GameStateManager {
  private readonly AUTOSAVE_INTERVAL = 30000; // 30 seconds för Anna Svensson
  private readonly MAX_SESSION_DURATION = 20 * 60 * 1000; // 20 minutes max
  private autosaveTimer: NodeJS.Timeout | null = null;
  private currentState: GameState | null = null;

  /**
   * Start new game session with automatic state tracking
   */
  async startGameSession(
    userId: string,
    gameId: string,
    tenantId: string,
    culturalContext: GameState['culturalContext']
  ): Promise<GameState> {
    
    const initialState: GameState = {
      sessionId,
      userId,
      gameId,
      tenantId,
      currentSceneId: '',
      sceneIndex: 0,
      progress: {
        completedScenes: [],
        sceneResults: Record<string, unknown>,
        startTime: new Date().toISOString(),
        lastActiveTime: new Date().toISOString(),
        totalTimeSpent: 0
      },
      culturalContext,
      deviceInfo: {
        isMobile: this.detectMobile(),
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`
      }
    };

    // Save initial state to database
    await this.saveStateToDatabase(initialState);
    
    // Start autosave för Anna Svensson interruption handling
    this.startAutosave(initialState);
    
    this.currentState = initialState;
    
    // Track session start analytics
    await this.trackAnalyticsEvent('session_started', {
      sessionId,
      userId,
      gameId,
      culturalContext,
      deviceType: initialState.deviceInfo.isMobile ? 'mobile' : 'desktop'
    });

    return initialState;
  }

  /**
   * Resume existing game session - critical för Anna Svensson workflow
   */
  async resumeGameSession(sessionId: string): Promise<GameState | null> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('completed_at', null) // Only resume incomplete sessions
        .single();

      if (error || !data) {
        console.error('Failed to resume session:', error);
        return null;
      }

      // Check if session is too old (24 hours för municipal work patterns)
      
      if (sessionAge > MAX_RESUME_AGE) {
        console.warn('Session too old to resume, starting new session');
        return null;
      }

      const resumedState: GameState = {
        sessionId: data.id,
        userId: data.user_id,
        gameId: data.game_id,
        tenantId: data.tenant_id,
        currentSceneId: data.progress?.currentSceneId || '',
        sceneIndex: data.progress?.sceneIndex || 0,
        progress: {
          completedScenes: data.progress?.completedScenes || [],
          sceneResults: data.progress?.sceneResults || {},
          startTime: data.started_at,
          lastActiveTime: new Date().toISOString(),
          totalTimeSpent: data.progress?.totalTimeSpent || 0
        },
        culturalContext: data.progress?.culturalContext || 'swedish_municipal',
        deviceInfo: data.progress?.deviceInfo || {
          isMobile: this.detectMobile(),
          userAgent: navigator.userAgent,
          screenSize: `${window.screen.width}x${window.screen.height}`
        }
      };

      // Restart autosave för resumed session
      this.startAutosave(resumedState);
      this.currentState = resumedState;

      // Track session resume analytics
      await this.trackAnalyticsEvent('session_resumed', {
        sessionId,
        userId: resumedState.userId,
        gameId: resumedState.gameId,
        resumeAfterMinutes: Math.round(sessionAge / (1000 * 60)),
        progress: resumedState.progress.completedScenes.length
      });

      return resumedState;
    } catch (error) {
      console.error('Error resuming session:', error);
      return null;
    }
  }

  /**
   * Update game state - called after each scene completion
   */
  async updateGameState(
    sessionId: string,
    updates: Partial<Pick<GameState, 'currentSceneId' | 'sceneIndex'>> & {
      sceneResult?: Record<string, unknown>;
      timeSpent?: number;
    }
  ): Promise<void> {
    if (!this.currentState || this.currentState.sessionId !== sessionId) {
      console.error('No active session to update');
      return;
    }


    // Update current state
    if (updates.currentSceneId) {
      this.currentState.currentSceneId = updates.currentSceneId;
    }
    
    if (updates.sceneIndex !== undefined) {
      this.currentState.sceneIndex = updates.sceneIndex;
    }

    if (updates.sceneResult && updates.currentSceneId) {
      // Mark scene as completed
      if (!this.currentState.progress.completedScenes.includes(updates.currentSceneId)) {
        this.currentState.progress.completedScenes.push(updates.currentSceneId);
      }
      
      // Store scene result
      this.currentState.progress.sceneResults[updates.currentSceneId] = updates.sceneResult;
    }

    // Update timing
    this.currentState.progress.lastActiveTime = now;
    this.currentState.progress.totalTimeSpent += timeSpent;

    // Save to database immediately för Anna Svensson reliability
    await this.saveStateToDatabase(this.currentState);

    // Track scene completion analytics
    if (updates.sceneResult) {
      await this.trackAnalyticsEvent('scene_completed', {
        sessionId,
        sceneId: updates.currentSceneId,
        timeSpent,
        result: updates.sceneResult
      });
    }
  }

  /**
   * Complete game session and generate results
   */
  async completeGameSession(sessionId: string): Promise<GameResults | null> {
    if (!this.currentState || this.currentState.sessionId !== sessionId) {
      console.error('No active session to complete');
      return null;
    }


    const results: GameResults = {
      sessionId,
      completedAt,
      totalScore,
      achievements,
      sceneResults: this.currentState.progress.sceneResults,
      timeSpent: this.currentState.progress.totalTimeSpent,
      completionRate
    };

    // Update database with completion
    await supabase
      .from('game_sessions')
      .update({
        completed_at: completedAt,
        results: results
      })
      .eq('id', sessionId);

    // Stop autosave
    this.stopAutosave();

    // Track completion analytics
    await this.trackAnalyticsEvent('session_completed', {
      sessionId,
      userId: this.currentState.userId,
      gameId: this.currentState.gameId,
      totalScore,
      achievements: achievements.length,
      totalTimeMinutes: Math.round(this.currentState.progress.totalTimeSpent / (1000 * 60)),
      completionRate
    });

    this.currentState = null;
    return results;
  }

  /**
   * Get all incomplete sessions för user (Anna Svensson dashboard)
   */
  async getUserIncompleteSessions(userId: string): Promise<GameState[]> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .is('completed_at', null)
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Failed to fetch incomplete sessions:', error);
        return [];
      }

      return data.map(session => ({
        sessionId: session.id,
        userId: session.user_id,
        gameId: session.game_id,
        tenantId: session.tenant_id,
        currentSceneId: session.progress?.currentSceneId || '',
        sceneIndex: session.progress?.sceneIndex || 0,
        progress: session.progress || {
          completedScenes: [],
          sceneResults: Record<string, unknown>,
          startTime: session.started_at,
          lastActiveTime: session.started_at,
          totalTimeSpent: 0
        },
        culturalContext: session.progress?.culturalContext || 'swedish_municipal',
        deviceInfo: session.progress?.deviceInfo || {
          isMobile: false,
          userAgent: '',
          screenSize: ''
        }
      }));
    } catch (error) {
      console.error('Error fetching incomplete sessions:', error);
      return [];
    }
  }

  /**
   * Clean up old incomplete sessions (municipal data hygiene)
   */
  async cleanupOldSessions(): Promise<void> {
    cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 days old

    try {
      await supabase
        .from('game_sessions')
        .delete()
        .is('completed_at', null)
        .lt('started_at', cutoffDate.toISOString());
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
    }
  }

  // Private methods

  private startAutosave(state: GameState): void {
    this.stopAutosave(); // Clear any existing timer

    this.autosaveTimer = setInterval(async () => {
      if (this.currentState) {
        this.currentState.progress.lastActiveTime = new Date().toISOString();
        await this.saveStateToDatabase(this.currentState);
      }
    }, this.AUTOSAVE_INTERVAL);
  }

  private stopAutosave(): void {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
    }
  }

  private async saveStateToDatabase(state: GameState): Promise<void> {
    try {
      await supabase
        .from('game_sessions')
        .upsert({
          id: state.sessionId,
          user_id: state.userId,
          game_id: state.gameId,
          tenant_id: state.tenantId,
          started_at: state.progress.startTime,
          progress: {
            currentSceneId: state.currentSceneId,
            sceneIndex: state.sceneIndex,
            completedScenes: state.progress.completedScenes,
            sceneResults: state.progress.sceneResults,
            lastActiveTime: state.progress.lastActiveTime,
            totalTimeSpent: state.progress.totalTimeSpent,
            culturalContext: state.culturalContext,
            deviceInfo: state.deviceInfo
          }
        });
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  private calculateTotalScore(sceneResults: Record<string, any>): number {
    let totalScore = 0;
    let totalPossible = 0;

    Object.values(sceneResults).forEach(result => {
      if (result && typeof result.score === 'number') {
        totalScore += result.score;
        totalPossible += result.maxScore || 100;
      }
    });

    return totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  }

  private calculateAchievements(state: GameState): string[] {
    const achievements: string[] = [];
    const { progress } = state;

    // Time-based achievements (Anna Svensson efficiency)
    if (progress.totalTimeSpent < 5 * 60 * 1000) { // Under 5 minutes
      achievements.push('speed_learner');
    }

    // Completion achievements
    if (progress.completedScenes.length >= 5) {
      achievements.push('scene_master');
    }

    // Mobile achievements (Anna Svensson mobile-first)
    if (state.deviceInfo.isMobile) {
      achievements.push('mobile_professional');
    }

    // Perfect score achievement
    if (totalScore >= 95) {
      achievements.push('excellence_award');
    }

    // Municipal context achievements
    if (state.culturalContext === 'swedish_municipal') {
      achievements.push('swedish_municipal_certified');
    }

    return achievements;
  }

  private calculateCompletionRate(state: GameState): number {
    // This would need to be calculated based on total scenes in game manifest
    // For now, simplified calculation
    return Math.min(100, (state.progress.completedScenes.length / expectedScenes) * 100);
  }

  private detectMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private async trackAnalyticsEvent(eventType: string, eventData: Record<string, unknown>): Promise<void> {
    try {
      await supabase
        .from('analytics_events')
        .insert({
          session_id: this.currentState?.sessionId,
          event_type: eventType,
          event_data: eventData
        });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }
}

// Export singleton instance

// React hook för easy integration
export function useGameState(sessionId?: string) {
  const [gameState, setGameState] = React.useState<GameState | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const _startNewGame = async (
    userId: string,
    gameId: string,
    tenantId: string,
    culturalContext: GameState['culturalContext']
  ) => {
    setIsLoading(true);
    try {
      setGameState(state);
      return state;
    } finally {
      setIsLoading(false);
    }
  };

  const _resumeGame = async (sessionId: string) => {
    setIsLoading(true);
    try {
      setGameState(state);
      return state;
    } finally {
      setIsLoading(false);
    }
  };

  const _updateState = async (updates: Record<string, unknown>) => {
    if (gameState) {
      await gameStateManager.updateGameState(gameState.sessionId, updates);
    }
  };

  const _completeGame = async () => {
    if (gameState) {
      setGameState(null);
      return results;
    }
  };

  return {
    gameState,
    isLoading,
    startNewGame,
    resumeGame,
    updateState,
    completeGame
  };
}

// Anna Svensson optimized component för resumed sessions
export function ResumeGameDialog({ 
  incompleteSessions, 
  onResume, 
  onStartNew 
}: {
  incompleteSessions: GameState[];
  onResume: (sessionId: string) => void;
  onStartNew: () => void;
}) {
  if (incompleteSessions.length === 0) {
    return null;
  }

  return (
    <div className="resume-game-dialog">
      <h3>Fortsätt där du slutade, Anna!</h3>
      <p>Du har {incompleteSessions.length} påbörjade utbildningar:</p>
      
      {incompleteSessions.map(session => (
        <div key={session.sessionId} className="session-card">
          <h4>{session.gameId}</h4>
          <p>Förlopp: {session.progress.completedScenes.length} scener klara</p>
          <p>Startat: {new Date(session.progress.startTime).toLocaleDateString('sv-SE')}</p>
          <button onClick={() => onResume(session.sessionId)}>
            Fortsätt
          </button>
        </div>
      ))}
      
      <button onClick={onStartNew} className="start-new-button">
        Börja ny utbildning istället
      </button>
    </div>
  );
}