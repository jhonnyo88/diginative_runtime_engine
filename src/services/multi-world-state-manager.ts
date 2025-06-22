/**
 * Multi-World State Manager
 * Extends Q2 GameStateManager for Q3 multi-world experiences
 * Preserves all Q2 functionality while adding hub session management
 */

import { supabase } from '../lib/supabase';
import { GameState, GameResults } from './game-state-manager';
import {
  WorldHubState,
  MultiWorldProgress,
  WorldCompletionStatus,
  WorldProgress,
  CrossWorldAchievement,
  UniqueCodeAuthentication,
  GDPRCompliantHubSession,
  CompetencyType,
  WorldTheme,
  calculateTotalScore,
  calculateOverallProgress,
  canUnlockWorld,
  isValidWorldIndex
} from '../types/q3-multi-world';

export class MultiWorldStateManager {
  private readonly HUB_SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly AUTOSAVE_INTERVAL = 30000; // 30 seconds (preserved from Q2)
  private readonly UNIQUE_CODE_LENGTH = 8;
  
  private hubSessionCache: Map<string, WorldHubState> = new Map();
  private autosaveTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Generate unique 8-character code for hub session authentication
   */
  generateUniqueCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters
    let result = '';
    for (let i = 0; i < this.UNIQUE_CODE_LENGTH; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Create new hub session with unique code authentication
   */
  async createHubSession(
    userId: string,
    tenantId: string,
    culturalContext: 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal'
  ): Promise<{ hubState: WorldHubState; uniqueCode: string }> {
    const uniqueCode = this.generateUniqueCode();
    const hubSessionId = `hub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.HUB_SESSION_DURATION);
    
    // Initialize world completion status for all 5 worlds
    const worldCompletionStatus: WorldCompletionStatus[] = [1, 2, 3, 4, 5].map(worldIndex => ({
      worldIndex,
      worldId: this.getWorldIdForIndex(worldIndex),
      status: worldIndex === 1 ? 'available' : 'locked', // World 1 always available
      score: 0,
      completionPercentage: 0,
      timeSpent: 0,
      achievementsUnlocked: [],
      competencyGains: {} as Record<CompetencyType, number>
    }));

    const hubState: WorldHubState = {
      hubSessionId,
      uniqueCode,
      userId,
      tenantId,
      totalScore: 0,
      worldsCompleted: 0,
      hubProgressData: {
        overallCompletionPercentage: 0,
        totalTimeSpent: 0,
        competencyLevels: {} as Record<CompetencyType, number>,
        unlockedAchievements: [],
        municipalCertificationProgress: 0,
        professionalDevelopmentScore: 0
      },
      worldCompletionStatus,
      culturalContext,
      createdAt: now,
      lastActiveAt: now,
      expiresAt
    };

    // Store in database with GDPR compliance
    await this.storeHubSessionInDatabase(hubState);
    
    // Cache for performance
    this.hubSessionCache.set(hubSessionId, hubState);
    
    // Start autosave timer
    this.startAutosave(hubSessionId);

    return { hubState, uniqueCode };
  }

  /**
   * Authenticate using unique code and retrieve hub session
   */
  async authenticateWithUniqueCode(uniqueCode: string): Promise<WorldHubState | null> {
    try {
      const { data, error } = await supabase
        .from('world_hub_sessions')
        .select('*')
        .eq('unique_code', uniqueCode.toUpperCase())
        .single();

      if (error || !data) {
        return null;
      }

      // Check if session has expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      if (now > expiresAt) {
        // Clean up expired session
        await this.cleanupExpiredSession(data.hub_session_id);
        return null;
      }

      // Convert database record to WorldHubState
      const hubState: WorldHubState = {
        hubSessionId: data.hub_session_id,
        uniqueCode: data.unique_code,
        userId: data.user_id,
        tenantId: data.tenant_id,
        totalScore: data.total_score || 0,
        worldsCompleted: data.worlds_completed || 0,
        currentWorldIndex: data.current_world_index,
        hubProgressData: data.hub_progress_data || this.getDefaultHubProgressData(),
        worldCompletionStatus: data.world_completion_status || this.getDefaultWorldCompletionStatus(),
        culturalContext: data.cultural_context,
        createdAt: new Date(data.created_at),
        lastActiveAt: new Date(data.last_active_at),
        expiresAt: new Date(data.expires_at)
      };

      // Update last active time
      hubState.lastActiveAt = now;
      await this.updateHubSession(hubState);

      // Cache for performance
      this.hubSessionCache.set(hubState.hubSessionId, hubState);
      
      // Start autosave timer
      this.startAutosave(hubState.hubSessionId);

      return hubState;
    } catch (error) {
      console.error('Error authenticating with unique code:', error);
      return null;
    }
  }

  /**
   * Update world completion status when a world is completed
   */
  async completeWorld(
    hubSessionId: string,
    worldIndex: number,
    worldResults: GameResults
  ): Promise<WorldHubState | null> {
    if (!isValidWorldIndex(worldIndex)) {
      throw new Error(`Invalid world index: ${worldIndex}`);
    }

    const hubState = await this.getHubSession(hubSessionId);
    if (!hubState) {
      return null;
    }

    // Update world completion status
    const worldStatus = hubState.worldCompletionStatus.find(w => w.worldIndex === worldIndex);
    if (!worldStatus) {
      throw new Error(`World ${worldIndex} not found in hub session`);
    }

    worldStatus.status = 'completed';
    worldStatus.score = worldResults.totalScore;
    worldStatus.completionPercentage = 100;
    worldStatus.timeSpent += worldResults.timeSpent;
    worldStatus.completedAt = new Date();
    worldStatus.achievementsUnlocked = worldResults.achievements;

    // Update hub totals
    hubState.totalScore = calculateTotalScore(hubState);
    hubState.worldsCompleted = hubState.worldCompletionStatus.filter(w => w.status === 'completed').length;
    hubState.hubProgressData.overallCompletionPercentage = calculateOverallProgress(hubState);
    hubState.hubProgressData.totalTimeSpent += worldResults.timeSpent;

    // Unlock next available worlds based on prerequisites
    this.updateWorldUnlockStatus(hubState);

    // Check for cross-world achievements
    await this.evaluateCrossWorldAchievements(hubState);

    // Update last active time
    hubState.lastActiveAt = new Date();

    // Save to database
    await this.updateHubSession(hubState);

    return hubState;
  }

  /**
   * Start a world session within the hub context
   */
  async startWorldSession(
    hubSessionId: string,
    worldIndex: number,
    gameId: string
  ): Promise<{ hubState: WorldHubState; gameState: GameState } | null> {
    if (!isValidWorldIndex(worldIndex)) {
      throw new Error(`Invalid world index: ${worldIndex}`);
    }

    const hubState = await this.getHubSession(hubSessionId);
    if (!hubState) {
      return null;
    }

    // Check if world is unlocked
    const worldStatus = hubState.worldCompletionStatus.find(w => w.worldIndex === worldIndex);
    if (!worldStatus || worldStatus.status === 'locked') {
      throw new Error(`World ${worldIndex} is not available`);
    }

    // Update world status to in_progress if not already completed
    if (worldStatus.status === 'available') {
      worldStatus.status = 'in_progress';
      worldStatus.startedAt = new Date();
    }

    // Update current world index
    hubState.currentWorldIndex = worldIndex;
    hubState.lastActiveAt = new Date();

    // Create Q2 GameState for the world (preserving Q2 compatibility)
    const gameState: GameState = {
      sessionId: `${hubSessionId}_world_${worldIndex}_${Date.now()}`,
      userId: hubState.userId,
      gameId,
      tenantId: hubState.tenantId,
      currentSceneId: '',
      sceneIndex: 0,
      progress: {
        completedScenes: [],
        sceneResults: {},
        startTime: new Date().toISOString(),
        lastActiveTime: new Date().toISOString(),
        totalTimeSpent: 0
      },
      culturalContext: hubState.culturalContext,
      deviceInfo: {
        isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`
      }
    };

    // Save updates
    await this.updateHubSession(hubState);

    return { hubState, gameState };
  }

  /**
   * Get current hub session state
   */
  async getHubSession(hubSessionId: string): Promise<WorldHubState | null> {
    // Check cache first
    const cached = this.hubSessionCache.get(hubSessionId);
    if (cached) {
      return cached;
    }

    // Load from database
    try {
      const { data, error } = await supabase
        .from('world_hub_sessions')
        .select('*')
        .eq('hub_session_id', hubSessionId)
        .single();

      if (error || !data) {
        return null;
      }

      const hubState: WorldHubState = {
        hubSessionId: data.hub_session_id,
        uniqueCode: data.unique_code,
        userId: data.user_id,
        tenantId: data.tenant_id,
        totalScore: data.total_score || 0,
        worldsCompleted: data.worlds_completed || 0,
        currentWorldIndex: data.current_world_index,
        hubProgressData: data.hub_progress_data || this.getDefaultHubProgressData(),
        worldCompletionStatus: data.world_completion_status || this.getDefaultWorldCompletionStatus(),
        culturalContext: data.cultural_context,
        createdAt: new Date(data.created_at),
        lastActiveAt: new Date(data.last_active_at),
        expiresAt: new Date(data.expires_at)
      };

      // Cache for performance
      this.hubSessionCache.set(hubSessionId, hubState);

      return hubState;
    } catch (error) {
      console.error('Error loading hub session:', error);
      return null;
    }
  }

  /**
   * Update hub session in database and cache
   */
  private async updateHubSession(hubState: WorldHubState): Promise<void> {
    try {
      const { error } = await supabase
        .from('world_hub_sessions')
        .upsert({
          hub_session_id: hubState.hubSessionId,
          unique_code: hubState.uniqueCode,
          user_id: hubState.userId,
          tenant_id: hubState.tenantId,
          total_score: hubState.totalScore,
          worlds_completed: hubState.worldsCompleted,
          current_world_index: hubState.currentWorldIndex,
          hub_progress_data: hubState.hubProgressData,
          world_completion_status: hubState.worldCompletionStatus,
          cultural_context: hubState.culturalContext,
          created_at: hubState.createdAt.toISOString(),
          last_active_at: hubState.lastActiveAt.toISOString(),
          expires_at: hubState.expiresAt.toISOString()
        });

      if (error) {
        throw error;
      }

      // Update cache
      this.hubSessionCache.set(hubState.hubSessionId, hubState);
    } catch (error) {
      console.error('Error updating hub session:', error);
      throw error;
    }
  }

  /**
   * Store new hub session in database
   */
  private async storeHubSessionInDatabase(hubState: WorldHubState): Promise<void> {
    try {
      const { error } = await supabase
        .from('world_hub_sessions')
        .insert({
          hub_session_id: hubState.hubSessionId,
          unique_code: hubState.uniqueCode,
          user_id: hubState.userId,
          tenant_id: hubState.tenantId,
          total_score: hubState.totalScore,
          worlds_completed: hubState.worldsCompleted,
          current_world_index: hubState.currentWorldIndex,
          hub_progress_data: hubState.hubProgressData,
          world_completion_status: hubState.worldCompletionStatus,
          cultural_context: hubState.culturalContext,
          created_at: hubState.createdAt.toISOString(),
          last_active_at: hubState.lastActiveAt.toISOString(),
          expires_at: hubState.expiresAt.toISOString()
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error storing hub session:', error);
      throw error;
    }
  }

  /**
   * Update world unlock status based on completed prerequisites
   */
  private updateWorldUnlockStatus(hubState: WorldHubState): void {
    for (let worldIndex = 1; worldIndex <= 5; worldIndex++) {
      const worldStatus = hubState.worldCompletionStatus.find(w => w.worldIndex === worldIndex);
      if (!worldStatus || worldStatus.status !== 'locked') {
        continue;
      }

      if (canUnlockWorld(worldIndex, hubState)) {
        worldStatus.status = 'available';
      }
    }
  }

  /**
   * Evaluate and unlock cross-world achievements
   */
  private async evaluateCrossWorldAchievements(hubState: WorldHubState): Promise<void> {
    // This will be implemented with specific cross-world achievement logic
    // For now, we'll add basic completion achievements
    
    const completedWorlds = hubState.worldCompletionStatus.filter(w => w.status === 'completed').length;
    
    // Achievement for completing first world
    if (completedWorlds >= 1 && !hubState.hubProgressData.unlockedAchievements.includes('first_world_complete')) {
      hubState.hubProgressData.unlockedAchievements.push('first_world_complete');
    }
    
    // Achievement for completing half the worlds
    if (completedWorlds >= 3 && !hubState.hubProgressData.unlockedAchievements.includes('halfway_champion')) {
      hubState.hubProgressData.unlockedAchievements.push('halfway_champion');
    }
    
    // Achievement for completing all worlds
    if (completedWorlds === 5 && !hubState.hubProgressData.unlockedAchievements.includes('world_master')) {
      hubState.hubProgressData.unlockedAchievements.push('world_master');
      hubState.hubProgressData.municipalCertificationProgress = 100;
    }
  }

  /**
   * Start autosave timer for hub session
   */
  private startAutosave(hubSessionId: string): void {
    // Clear existing timer if any
    const existingTimer = this.autosaveTimers.get(hubSessionId);
    if (existingTimer) {
      clearInterval(existingTimer);
    }

    // Start new autosave timer
    const timer = setInterval(async () => {
      const hubState = this.hubSessionCache.get(hubSessionId);
      if (hubState) {
        hubState.lastActiveAt = new Date();
        await this.updateHubSession(hubState);
      }
    }, this.AUTOSAVE_INTERVAL);

    this.autosaveTimers.set(hubSessionId, timer);
  }

  /**
   * Clean up expired session
   */
  private async cleanupExpiredSession(hubSessionId: string): Promise<void> {
    try {
      // Remove from database
      await supabase
        .from('world_hub_sessions')
        .delete()
        .eq('hub_session_id', hubSessionId);

      // Remove from cache
      this.hubSessionCache.delete(hubSessionId);

      // Clear autosave timer
      const timer = this.autosaveTimers.get(hubSessionId);
      if (timer) {
        clearInterval(timer);
        this.autosaveTimers.delete(hubSessionId);
      }
    } catch (error) {
      console.error('Error cleaning up expired session:', error);
    }
  }

  /**
   * Get world ID for a given world index
   */
  private getWorldIdForIndex(worldIndex: number): string {
    const worldIds: Record<number, string> = {
      1: 'municipal-foundations',
      2: 'citizen-service',
      3: 'emergency-response',
      4: 'leadership-development',
      5: 'innovation-implementation'
    };
    return worldIds[worldIndex] || `world-${worldIndex}`;
  }

  /**
   * Get default hub progress data
   */
  private getDefaultHubProgressData() {
    return {
      overallCompletionPercentage: 0,
      totalTimeSpent: 0,
      competencyLevels: {} as Record<CompetencyType, number>,
      unlockedAchievements: [],
      municipalCertificationProgress: 0,
      professionalDevelopmentScore: 0
    };
  }

  /**
   * Get default world completion status for all 5 worlds
   */
  private getDefaultWorldCompletionStatus(): WorldCompletionStatus[] {
    return [1, 2, 3, 4, 5].map(worldIndex => ({
      worldIndex,
      worldId: this.getWorldIdForIndex(worldIndex),
      status: worldIndex === 1 ? 'available' : 'locked', // World 1 always available
      score: 0,
      completionPercentage: 0,
      timeSpent: 0,
      achievementsUnlocked: [],
      competencyGains: {} as Record<CompetencyType, number>
    }));
  }

  /**
   * GDPR compliance: Export user data
   */
  async exportUserData(userId: string): Promise<Record<string, unknown>> {
    try {
      const { data, error } = await supabase
        .from('world_hub_sessions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return {
        hubSessions: data,
        exportedAt: new Date().toISOString(),
        dataRetentionPolicy: '30 days for completed sessions'
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  /**
   * GDPR compliance: Delete user data
   */
  async deleteUserData(userId: string): Promise<void> {
    try {
      // Delete hub sessions
      await supabase
        .from('world_hub_sessions')
        .delete()
        .eq('user_id', userId);

      // Clear from cache
      for (const [sessionId, hubState] of this.hubSessionCache.entries()) {
        if (hubState.userId === userId) {
          this.hubSessionCache.delete(sessionId);
          
          // Clear autosave timer
          const timer = this.autosaveTimers.get(sessionId);
          if (timer) {
            clearInterval(timer);
            this.autosaveTimers.delete(sessionId);
          }
        }
      }
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const multiWorldStateManager = new MultiWorldStateManager();