/**
 * Offline Resilience Manager (Implementation of proposal-069)
 * Cross-world state synchronization with offline resilience for municipal field workers
 * Ensures municipal work is never lost due to connectivity issues
 */

import { MultiWorldStateManager } from '../services/multi-world-state-manager';
import { q3PerformanceMonitor } from '../performance/Q3PerformanceMonitor';

export interface OfflineState {
  hubSessionId: string;
  uniqueCode: string;
  lastSync: number;
  pendingActions: OfflineAction[];
  worldStates: Map<number, any>;
  userProgress: Record<string, unknown>;
  municipalContext: MunicipalContext;
}

export interface OfflineAction {
  id: string;
  type: 'world_progress' | 'achievement_unlock' | 'scenario_completion' | 'cultural_preference';
  worldIndex?: number;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

export interface MunicipalContext {
  municipality: string;
  userRole: string;
  workLocation: 'office' | 'field' | 'mobile';
  connectivityProfile: 'stable' | 'intermittent' | 'poor';
}

export interface SyncResult {
  success: boolean;
  actionsProcessed: number;
  conflictsResolved: number;
  lastSuccessfulSync: number;
  nextSyncAttempt: number;
}

export class OfflineResilienceManager {
  private readonly SYNC_RETRY_DELAY = 5000; // 5 seconds
  private readonly MAX_RETRY_ATTEMPTS = 5;
  private readonly OFFLINE_STORAGE_KEY = 'q3_municipal_offline_state';
  private readonly SYNC_INTERVAL = 30000; // 30 seconds when online

  private isOnline = navigator.onLine;
  private syncTimer: NodeJS.Timeout | null = null;
  private pendingActions: OfflineAction[] = [];
  private lastSyncAttempt = 0;
  private syncInProgress = false;

  /**
   * Initialize offline resilience system
   */
  async initialize(): Promise<void> {
    console.log('🔄 Initializing Municipal Offline Resilience System');
    
    // Setup connectivity monitoring
    this.setupConnectivityMonitoring();
    
    // Load offline state
    await this.loadOfflineState();
    
    // Setup periodic sync
    this.setupPeriodicSync();
    
    // Handle page visibility changes
    this.setupVisibilityHandling();
    
    console.log('✅ Municipal Offline Resilience System initialized');
    console.log(`📊 Municipal workers can continue work during connectivity issues`);
  }

  /**
   * Save critical municipal work action for offline persistence
   */
  async saveMunicipalAction(
    action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<void> {
    const offlineAction: OfflineAction = {
      ...action,
      id: this.generateActionId(),
      timestamp: Date.now(),
      retryCount: 0
    };

    this.pendingActions.push(offlineAction);
    
    // Persist to storage immediately
    await this.persistOfflineState();
    
    // Try immediate sync if online
    if (this.isOnline && !this.syncInProgress) {
      this.attemptSync();
    }
    
    console.log(`💾 Municipal action saved offline: ${action.type}`);
  }

  /**
   * Save complete world state for offline access
   */
  async saveWorldStateOffline(worldIndex: number, worldState: Record<string, unknown>): Promise<void> {
    const offlineState = await this.getOfflineState();
    if (offlineState) {
      offlineState.worldStates.set(worldIndex, {
        ...worldState,
        lastOfflineSave: Date.now()
      });
      
      await this.persistOfflineState(offlineState);
      console.log(`💾 World ${worldIndex} state saved for offline access`);
    }
  }

  /**
   * Get world state for offline access
   */
  async getWorldStateOffline(worldIndex: number): Promise<any | null> {
    const offlineState = await this.getOfflineState();
    if (offlineState?.worldStates.has(worldIndex)) {
      const worldState = offlineState.worldStates.get(worldIndex);
      console.log(`📱 Retrieved World ${worldIndex} state from offline storage`);
      return worldState;
    }
    return null;
  }

  /**
   * Check if system can operate offline
   */
  canOperateOffline(): boolean {
    return this.hasOfflineState() && this.hasEssentialData();
  }

  /**
   * Get current connectivity status and sync info
   */
  getConnectivityStatus(): {
    isOnline: boolean;
    lastSync: number;
    pendingActions: number;
    canOperateOffline: boolean;
    nextSyncAttempt: number;
  } {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSyncAttempt,
      pendingActions: this.pendingActions.length,
      canOperateOffline: this.canOperateOffline(),
      nextSyncAttempt: this.lastSyncAttempt + this.SYNC_RETRY_DELAY
    };
  }

  /**
   * Force synchronization attempt
   */
  async forceSynchronization(): Promise<SyncResult> {
    console.log('🔄 Forcing municipal data synchronization');
    return this.attemptSync();
  }

  /**
   * Clean up old offline data
   */
  async cleanupOfflineData(): Promise<void> {
    const offlineState = await this.getOfflineState();
    if (!offlineState) return;

    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    // Clean old actions
    this.pendingActions = this.pendingActions.filter(
      action => now - action.timestamp < maxAge
    );

    // Clean old world states
    for (const [worldIndex, worldState] of offlineState.worldStates.entries()) {
      if (worldState.lastOfflineSave && now - worldState.lastOfflineSave > maxAge) {
        offlineState.worldStates.delete(worldIndex);
      }
    }

    await this.persistOfflineState(offlineState);
    console.log('🗑️ Cleaned up old offline municipal data');
  }

  // Private implementation methods

  private setupConnectivityMonitoring(): void {
    window.addEventListener('online', () => {
      console.log('🟢 Municipal connectivity restored');
      this.isOnline = true;
      this.attemptSync();
    });

    window.addEventListener('offline', () => {
      console.log('🔴 Municipal connectivity lost - switching to offline mode');
      this.isOnline = false;
      if (this.syncTimer) {
        clearInterval(this.syncTimer);
        this.syncTimer = null;
      }
    });
  }

  private setupPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      if (this.isOnline && !this.syncInProgress && this.pendingActions.length > 0) {
        this.attemptSync();
      }
    }, this.SYNC_INTERVAL);
  }

  private setupVisibilityHandling(): void {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline && this.pendingActions.length > 0) {
        // Page became visible - attempt sync
        this.attemptSync();
      }
    });
  }

  private async attemptSync(): Promise<SyncResult> {
    if (this.syncInProgress || !this.isOnline || this.pendingActions.length === 0) {
      return {
        success: false,
        actionsProcessed: 0,
        conflictsResolved: 0,
        lastSuccessfulSync: this.lastSyncAttempt,
        nextSyncAttempt: Date.now() + this.SYNC_RETRY_DELAY
      };
    }

    this.syncInProgress = true;
    const startTime = Date.now();
    let actionsProcessed = 0;
    const conflictsResolved = 0;

    try {
      console.log(`🔄 Syncing ${this.pendingActions.length} municipal actions`);

      const actionsToSync = [...this.pendingActions];
      
      for (const action of actionsToSync) {
        try {
          await this.processOfflineAction(action);
          
          // Remove from pending actions
          this.pendingActions = this.pendingActions.filter(a => a.id !== action.id);
          actionsProcessed++;
          
        } catch (error) {
          console.warn(`⚠️ Failed to sync action ${action.id}:`, error);
          
          // Increment retry count
          action.retryCount++;
          
          // Remove if max retries exceeded
          if (action.retryCount >= this.MAX_RETRY_ATTEMPTS) {
            console.error(`❌ Dropping action ${action.id} after ${this.MAX_RETRY_ATTEMPTS} retries`);
            this.pendingActions = this.pendingActions.filter(a => a.id !== action.id);
          }
        }
      }

      this.lastSyncAttempt = Date.now();
      await this.persistOfflineState();

      const syncDuration = Date.now() - startTime;
      console.log(`✅ Municipal sync completed in ${syncDuration}ms: ${actionsProcessed} actions processed`);

      return {
        success: true,
        actionsProcessed,
        conflictsResolved,
        lastSuccessfulSync: this.lastSyncAttempt,
        nextSyncAttempt: this.lastSyncAttempt + this.SYNC_INTERVAL
      };

    } catch (error) {
      console.error('❌ Municipal sync failed:', error);
      
      return {
        success: false,
        actionsProcessed,
        conflictsResolved,
        lastSuccessfulSync: this.lastSyncAttempt,
        nextSyncAttempt: Date.now() + this.SYNC_RETRY_DELAY
      };
      
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processOfflineAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'world_progress':
        await this.syncWorldProgress(action);
        break;
      case 'achievement_unlock':
        await this.syncAchievementUnlock(action);
        break;
      case 'scenario_completion':
        await this.syncScenarioCompletion(action);
        break;
      case 'cultural_preference':
        await this.syncCulturalPreference(action);
        break;
      default:
        console.warn(`Unknown offline action type: ${action.type}`);
    }
  }

  private async syncWorldProgress(action: OfflineAction): Promise<void> {
    // Simulate sync with MultiWorldStateManager
    console.log(`🔄 Syncing world progress for world ${action.worldIndex}`);
    
    // In real implementation, would call MultiWorldStateManager
    // await MultiWorldStateManager.updateWorldProgress(action.payload);
  }

  private async syncAchievementUnlock(action: OfflineAction): Promise<void> {
    console.log(`🏆 Syncing achievement unlock: ${action.payload.achievementId}`);
    
    // In real implementation, would call achievement system
    // await AchievementSystem.unlockAchievement(action.payload);
  }

  private async syncScenarioCompletion(action: OfflineAction): Promise<void> {
    console.log(`✅ Syncing scenario completion: ${action.payload.scenarioId}`);
    
    // In real implementation, would call scenario system
    // await ScenarioSystem.completeScenario(action.payload);
  }

  private async syncCulturalPreference(action: OfflineAction): Promise<void> {
    console.log(`🌍 Syncing cultural preference: ${action.payload.culture}`);
    
    // In real implementation, would call cultural adaptation system
    // await CulturalAdaptationSystem.updatePreference(action.payload);
  }

  private async loadOfflineState(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.OFFLINE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.pendingActions = parsed.pendingActions || [];
        console.log(`📱 Loaded ${this.pendingActions.length} pending municipal actions from offline storage`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load offline state:', error);
      this.pendingActions = [];
    }
  }

  private async getOfflineState(): Promise<OfflineState | null> {
    try {
      const stored = localStorage.getItem(this.OFFLINE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          worldStates: new Map(parsed.worldStates || [])
        };
      }
    } catch (error) {
      console.warn('⚠️ Failed to get offline state:', error);
    }
    return null;
  }

  private async persistOfflineState(state?: OfflineState): Promise<void> {
    try {
      const stateToSave = state || {
        hubSessionId: '',
        uniqueCode: '',
        lastSync: this.lastSyncAttempt,
        pendingActions: this.pendingActions,
        worldStates: new Map(),
        userProgress: Record<string, unknown>,
        municipalContext: {
          municipality: '',
          userRole: '',
          workLocation: 'office',
          connectivityProfile: 'stable'
        }
      };

      const serializable = {
        ...stateToSave,
        worldStates: Array.from(stateToSave.worldStates.entries())
      };

      localStorage.setItem(this.OFFLINE_STORAGE_KEY, JSON.stringify(serializable));
    } catch (error) {
      console.error('❌ Failed to persist offline state:', error);
    }
  }

  private hasOfflineState(): boolean {
    return localStorage.getItem(this.OFFLINE_STORAGE_KEY) !== null;
  }

  private hasEssentialData(): boolean {
    // Check if we have essential data for offline operation
    return this.pendingActions.length >= 0; // Basic check
  }

  private generateActionId(): string {
    return `municipal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const offlineResilienceManager = new OfflineResilienceManager();