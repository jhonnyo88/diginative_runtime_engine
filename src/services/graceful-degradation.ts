/**
 * Graceful Degradation Framework
 * Q1-AO-Milestone-1.2 Autonomous Operation Component
 * 
 * Handles AI content issues without crashes for >95% autonomous deployment rate
 * Provides fallback mechanisms for malformed content, network failures, and service disruptions
 */

import { DevTeamContentValidator } from '../validation/devteam-content-validator';
import { InfrastructureMonitoring } from './infrastructure-monitoring';

// Degradation levels
export enum DegradationLevel {
  NONE = 'none',
  MINOR = 'minor',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  CRITICAL = 'critical'
}

// Degradation reasons
export enum DegradationReason {
  MALFORMED_CONTENT = 'malformed_content',
  NETWORK_FAILURE = 'network_failure',
  SERVICE_DISRUPTION = 'service_disruption',
  VALIDATION_ERROR = 'validation_error',
  RENDERING_ERROR = 'rendering_error',
  DATA_CORRUPTION = 'data_corruption',
  TIMEOUT_ERROR = 'timeout_error',
  MEMORY_PRESSURE = 'memory_pressure'
}

// Recovery strategy
export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  SKIP = 'skip',
  DEFAULT = 'default',
  CACHE = 'cache',
  OFFLINE = 'offline'
}

// Degradation context
export interface DegradationContext {
  level: DegradationLevel;
  reason: DegradationReason;
  strategy: RecoveryStrategy;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  retryCount?: number;
  maxRetries?: number;
}

// Fallback content interfaces
export interface FallbackScene {
  id: string;
  type: 'dialogue' | 'quiz' | 'error';
  content: {
    title: string;
    message: string;
    actions?: Array<{
      label: string;
      action: 'retry' | 'skip' | 'exit';
    }>;
  };
}

export interface FallbackGameManifest {
  gameId: string;
  version: string;
  metadata: {
    title: string;
    description: string;
    duration: string;
    targetAudience: string;
    language: string;
  };
  scenes: FallbackScene[];
  degradationInfo: DegradationContext;
}

// Recovery callback types
export type RecoveryCallback = (context: DegradationContext) => Promise<any>;
export type FallbackProvider = (reason: DegradationReason, originalContent?: any) => any;

/**
 * Graceful Degradation Service
 * Manages graceful handling of content and system failures
 */
export class GracefulDegradationService {
  private static instance: GracefulDegradationService;
  private validator: DevTeamContentValidator;
  private monitoring: InfrastructureMonitoring | null;
  private fallbackProviders: Map<DegradationReason, FallbackProvider> = new Map();
  private recoveryCallbacks: Map<DegradationReason, RecoveryCallback> = new Map();
  private degradationHistory: DegradationContext[] = [];
  private isOfflineMode = false;
  private contentCache: Map<string, any> = new Map();
  
  private constructor() {
    this.validator = new DevTeamContentValidator();
    this.monitoring = InfrastructureMonitoring.getInstance();
    this.initializeDefaultFallbacks();
    this.setupNetworkMonitoring();
  }
  
  public static getInstance(): GracefulDegradationService {
    if (!GracefulDegradationService.instance) {
      GracefulDegradationService.instance = new GracefulDegradationService();
    }
    return GracefulDegradationService.instance;
  }
  
  /**
   * Initialize default fallback providers
   */
  private initializeDefaultFallbacks(): void {
    // Malformed content fallback
    this.registerFallbackProvider(DegradationReason.MALFORMED_CONTENT, (reason, originalContent) => {
      return this.createErrorGameManifest(
        'Content Format Error',
        'The game content has formatting issues. We\'ve provided a simplified version.',
        reason,
        originalContent
      );
    });
    
    // Network failure fallback
    this.registerFallbackProvider(DegradationReason.NETWORK_FAILURE, (reason, originalContent) => {
      const cachedContent = this.getCachedContent(originalContent?.gameId);
      if (cachedContent) {
        return {
          ...cachedContent,
          degradationInfo: this.createDegradationContext(DegradationLevel.MINOR, reason, RecoveryStrategy.CACHE)
        };
      }
      
      return this.createOfflineGameManifest(reason);
    });
    
    // Service disruption fallback
    this.registerFallbackProvider(DegradationReason.SERVICE_DISRUPTION, (reason) => {
      return this.createMaintenanceGameManifest(reason);
    });
    
    // Validation error fallback
    this.registerFallbackProvider(DegradationReason.VALIDATION_ERROR, (reason, originalContent) => {
      // Try to repair the content first
      const repairedContent = this.attemptContentRepair(originalContent);
      if (repairedContent) {
        return {
          ...repairedContent,
          degradationInfo: this.createDegradationContext(DegradationLevel.MINOR, reason, RecoveryStrategy.FALLBACK)
        };
      }
      
      return this.createErrorGameManifest(
        'Content Validation Error',
        'The game content couldn\'t be validated. Using a basic version instead.',
        reason,
        originalContent
      );
    });
    
    // Rendering error fallback
    this.registerFallbackProvider(DegradationReason.RENDERING_ERROR, (reason, originalContent) => {
      return this.createSimplifiedGameManifest(reason, originalContent);
    });
  }
  
  /**
   * Setup network connectivity monitoring
   */
  private setupNetworkMonitoring(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOfflineMode = false;
        this.handleNetworkRecovery();
      });
      
      window.addEventListener('offline', () => {
        this.isOfflineMode = true;
        this.handleNetworkFailure();
      });
      
      this.isOfflineMode = !navigator.onLine;
    }
  }
  
  /**
   * Handle content gracefully with fallback mechanisms
   */
  public async handleContent(content: any, options: {
    gameId?: string;
    retryCount?: number;
    maxRetries?: number;
    timeout?: number;
  } = {}): Promise<any> {
    const { gameId, retryCount = 0, maxRetries = 3, timeout = 5000 } = options;
    
    try {
      // Check for network issues first
      if (this.isOfflineMode) {
        return this.degradeContent(DegradationReason.NETWORK_FAILURE, content);
      }
      
      // Validate content with timeout
      const validationPromise = this.validateContentWithTimeout(content, timeout);
      const result = await validationPromise;
      
      if (result.isValid) {
        // Cache valid content
        if (gameId) {
          this.cacheContent(gameId, content);
        }
        return content;
      } else {
        // Handle validation errors
        return this.degradeContent(DegradationReason.VALIDATION_ERROR, content, {
          retryCount,
          maxRetries,
          metadata: { validationErrors: result.errors }
        });
      }
    } catch (error) {
      console.error('Content handling error:', error);
      
      // Determine error type and appropriate degradation
      const reason = this.classifyError(error);
      
      // Retry logic
      if (retryCount < maxRetries && this.shouldRetry(reason)) {
        console.log(`Retrying content handling (${retryCount + 1}/${maxRetries})`);
        await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
        return this.handleContent(content, { ...options, retryCount: retryCount + 1 });
      }
      
      // Final degradation
      return this.degradeContent(reason, content, { retryCount, maxRetries });
    }
  }
  
  /**
   * Validate content with timeout
   */
  private async validateContentWithTimeout(content: any, timeout: number): Promise<any> {
    return Promise.race([
      new Promise((resolve) => {
        const result = this.validator.validateGameManifest(content);
        resolve(result);
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Validation timeout')), timeout);
      })
    ]);
  }
  
  /**
   * Classify error type for appropriate degradation
   */
  private classifyError(error: any): DegradationReason {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return DegradationReason.NETWORK_FAILURE;
    }
    
    if (errorMessage.includes('timeout')) {
      return DegradationReason.TIMEOUT_ERROR;
    }
    
    if (errorMessage.includes('memory') || errorMessage.includes('quota')) {
      return DegradationReason.MEMORY_PRESSURE;
    }
    
    if (errorMessage.includes('parse') || errorMessage.includes('json')) {
      return DegradationReason.MALFORMED_CONTENT;
    }
    
    if (errorMessage.includes('render') || errorMessage.includes('component')) {
      return DegradationReason.RENDERING_ERROR;
    }
    
    return DegradationReason.SERVICE_DISRUPTION;
  }
  
  /**
   * Determine if error should trigger retry
   */
  private shouldRetry(reason: DegradationReason): boolean {
    const retryableReasons = [
      DegradationReason.NETWORK_FAILURE,
      DegradationReason.SERVICE_DISRUPTION,
      DegradationReason.TIMEOUT_ERROR
    ];
    
    return retryableReasons.includes(reason);
  }
  
  /**
   * Degrade content with appropriate fallback
   */
  public degradeContent(
    reason: DegradationReason,
    originalContent?: any,
    options: {
      retryCount?: number;
      maxRetries?: number;
      metadata?: Record<string, any>;
    } = {}
  ): any {
    const { retryCount = 0, maxRetries = 3, metadata = {} } = options;
    
    // Create degradation context
    const level = this.determineDegradationLevel(reason, retryCount, maxRetries);
    const strategy = this.determineRecoveryStrategy(reason, level);
    
    const context = this.createDegradationContext(level, reason, strategy, {
      retryCount,
      maxRetries,
      ...metadata
    });
    
    // Log degradation
    this.logDegradation(context, originalContent);
    
    // Get fallback content
    const fallbackProvider = this.fallbackProviders.get(reason);
    if (!fallbackProvider) {
      return this.createGenericErrorManifest(reason, originalContent);
    }
    
    const fallbackContent = fallbackProvider(reason, originalContent);
    
    // Add degradation info to content
    if (fallbackContent && typeof fallbackContent === 'object') {
      fallbackContent.degradationInfo = context;
    }
    
    return fallbackContent;
  }
  
  /**
   * Determine degradation level based on context
   */
  private determineDegradationLevel(
    reason: DegradationReason,
    retryCount: number,
    maxRetries: number
  ): DegradationLevel {
    const retryRatio = retryCount / maxRetries;
    
    switch (reason) {
      case DegradationReason.MALFORMED_CONTENT:
        return retryRatio > 0.5 ? DegradationLevel.MODERATE : DegradationLevel.MINOR;
      
      case DegradationReason.NETWORK_FAILURE:
        return this.isOfflineMode ? DegradationLevel.MODERATE : DegradationLevel.MINOR;
      
      case DegradationReason.SERVICE_DISRUPTION:
        return DegradationLevel.SEVERE;
      
      case DegradationReason.MEMORY_PRESSURE:
        return DegradationLevel.CRITICAL;
      
      default:
        return retryRatio > 0.7 ? DegradationLevel.SEVERE : DegradationLevel.MODERATE;
    }
  }
  
  /**
   * Determine recovery strategy
   */
  private determineRecoveryStrategy(reason: DegradationReason, level: DegradationLevel): RecoveryStrategy {
    if (level === DegradationLevel.CRITICAL) {
      return RecoveryStrategy.OFFLINE;
    }
    
    switch (reason) {
      case DegradationReason.NETWORK_FAILURE:
        return this.contentCache.size > 0 ? RecoveryStrategy.CACHE : RecoveryStrategy.OFFLINE;
      
      case DegradationReason.MALFORMED_CONTENT:
      case DegradationReason.VALIDATION_ERROR:
        return RecoveryStrategy.FALLBACK;
      
      case DegradationReason.SERVICE_DISRUPTION:
        return RecoveryStrategy.RETRY;
      
      default:
        return RecoveryStrategy.DEFAULT;
    }
  }
  
  /**
   * Create degradation context
   */
  private createDegradationContext(
    level: DegradationLevel,
    reason: DegradationReason,
    strategy: RecoveryStrategy,
    metadata: Record<string, any> = {}
  ): DegradationContext {
    const context: DegradationContext = {
      level,
      reason,
      strategy,
      message: this.getDegradationMessage(level, reason),
      timestamp: new Date(),
      metadata
    };
    
    this.degradationHistory.push(context);
    
    // Keep only last 100 degradation events
    if (this.degradationHistory.length > 100) {
      this.degradationHistory = this.degradationHistory.slice(-100);
    }
    
    return context;
  }
  
  /**
   * Get user-friendly degradation message
   */
  private getDegradationMessage(level: DegradationLevel, reason: DegradationReason): string {
    const messages = {
      [DegradationReason.MALFORMED_CONTENT]: 'Content format issue detected - using simplified version',
      [DegradationReason.NETWORK_FAILURE]: 'Network connectivity issue - using cached content',
      [DegradationReason.SERVICE_DISRUPTION]: 'Service temporarily unavailable - using fallback',
      [DegradationReason.VALIDATION_ERROR]: 'Content validation issue - using corrected version',
      [DegradationReason.RENDERING_ERROR]: 'Display issue detected - using simplified layout',
      [DegradationReason.DATA_CORRUPTION]: 'Data integrity issue - using backup content',
      [DegradationReason.TIMEOUT_ERROR]: 'Loading timeout - using cached version',
      [DegradationReason.MEMORY_PRESSURE]: 'System resources limited - using optimized content'
    };
    
    return messages[reason] || 'Technical issue detected - using alternative content';
  }
  
  /**
   * Log degradation event
   */
  private logDegradation(context: DegradationContext, originalContent?: any): void {
    console.warn('Content degradation event:', {
      level: context.level,
      reason: context.reason,
      strategy: context.strategy,
      message: context.message,
      metadata: context.metadata
    });
    
    // Report to monitoring service
    if (this.monitoring) {
      this.monitoring.reportDegradation({
        level: context.level,
        reason: context.reason,
        strategy: context.strategy,
        timestamp: context.timestamp,
        metadata: context.metadata,
        contentId: originalContent?.gameId || 'unknown'
      });
    }
  }
  
  /**
   * Attempt to repair malformed content
   */
  private attemptContentRepair(content: any): any | null {
    if (!content || typeof content !== 'object') {
      return null;
    }
    
    try {
      const repaired = { ...content };
      
      // Fix common structure issues
      if (!repaired.gameId) {
        repaired.gameId = `repaired-${Date.now()}`;
      }
      
      if (!repaired.version) {
        repaired.version = '1.0.0';
      }
      
      if (!repaired.metadata || typeof repaired.metadata !== 'object') {
        repaired.metadata = {
          title: 'Restored Game',
          description: 'Content automatically restored',
          duration: '5 minutes',
          targetAudience: 'All users',
          language: 'sv'
        };
      }
      
      if (!Array.isArray(repaired.scenes)) {
        repaired.scenes = [{
          id: 'scene-1',
          type: 'dialogue',
          messages: [{
            text: 'This content has been automatically restored.',
            characterId: 'system'
          }]
        }];
      }
      
      // Validate repaired content
      const validation = this.validator.validateGameManifest(repaired);
      return validation.isValid ? repaired : null;
      
    } catch (error) {
      console.warn('Content repair failed:', error);
      return null;
    }
  }
  
  /**
   * Create error game manifest
   */
  private createErrorGameManifest(
    title: string,
    message: string,
    reason: DegradationReason,
    originalContent?: any
  ): FallbackGameManifest {
    return {
      gameId: `error-${Date.now()}`,
      version: '1.0.0',
      metadata: {
        title,
        description: message,
        duration: '2 minutes',
        targetAudience: 'All users',
        language: 'sv'
      },
      scenes: [{
        id: 'error-scene',
        type: 'error',
        content: {
          title,
          message,
          actions: [
            { label: 'Försök igen', action: 'retry' },
            { label: 'Hoppa över', action: 'skip' }
          ]
        }
      }],
      degradationInfo: this.createDegradationContext(
        DegradationLevel.MODERATE,
        reason,
        RecoveryStrategy.FALLBACK,
        { originalGameId: originalContent?.gameId }
      )
    };
  }
  
  /**
   * Create offline game manifest
   */
  private createOfflineGameManifest(reason: DegradationReason): FallbackGameManifest {
    return {
      gameId: `offline-${Date.now()}`,
      version: '1.0.0',
      metadata: {
        title: 'Offline Mode',
        description: 'Working in offline mode with limited functionality',
        duration: '3 minutes',
        targetAudience: 'All users',
        language: 'sv'
      },
      scenes: [{
        id: 'offline-scene',
        type: 'dialogue',
        content: {
          title: 'Offline Mode',
          message: 'No internet connection. Some features may be limited.',
          actions: [
            { label: 'Continue Offline', action: 'skip' },
            { label: 'Try Again', action: 'retry' }
          ]
        }
      }],
      degradationInfo: this.createDegradationContext(
        DegradationLevel.MODERATE,
        reason,
        RecoveryStrategy.OFFLINE
      )
    };
  }
  
  /**
   * Create maintenance game manifest
   */
  private createMaintenanceGameManifest(reason: DegradationReason): FallbackGameManifest {
    return {
      gameId: `maintenance-${Date.now()}`,
      version: '1.0.0',
      metadata: {
        title: 'System Maintenance',
        description: 'System temporarily under maintenance',
        duration: '1 minute',
        targetAudience: 'All users',
        language: 'sv'
      },
      scenes: [{
        id: 'maintenance-scene',
        type: 'dialogue',
        content: {
          title: 'System Maintenance',
          message: 'The system is temporarily under maintenance. Please try again in a few minutes.',
          actions: [
            { label: 'Försök igen', action: 'retry' },
            { label: 'Avsluta', action: 'exit' }
          ]
        }
      }],
      degradationInfo: this.createDegradationContext(
        DegradationLevel.SEVERE,
        reason,
        RecoveryStrategy.RETRY
      )
    };
  }
  
  /**
   * Create simplified game manifest
   */
  private createSimplifiedGameManifest(reason: DegradationReason, originalContent?: any): FallbackGameManifest {
    return {
      gameId: originalContent?.gameId || `simplified-${Date.now()}`,
      version: '1.0.0',
      metadata: {
        title: originalContent?.metadata?.title || 'Simplified Game',
        description: 'Simplified version due to technical limitations',
        duration: '3 minutes',
        targetAudience: originalContent?.metadata?.targetAudience || 'All users',
        language: originalContent?.metadata?.language || 'sv'
      },
      scenes: [{
        id: 'simplified-scene',
        type: 'dialogue',
        content: {
          title: 'Simplified Mode',
          message: 'This is a simplified version of the content due to technical limitations.',
          actions: [
            { label: 'Continue', action: 'skip' },
            { label: 'Try Full Version', action: 'retry' }
          ]
        }
      }],
      degradationInfo: this.createDegradationContext(
        DegradationLevel.MINOR,
        reason,
        RecoveryStrategy.FALLBACK,
        { originalGameId: originalContent?.gameId }
      )
    };
  }
  
  /**
   * Create generic error manifest
   */
  private createGenericErrorManifest(reason: DegradationReason, originalContent?: any): FallbackGameManifest {
    return this.createErrorGameManifest(
      'Technical Issue',
      'A technical issue occurred. Using basic content instead.',
      reason,
      originalContent
    );
  }
  
  /**
   * Cache content for offline use
   */
  private cacheContent(gameId: string, content: any): void {
    try {
      this.contentCache.set(gameId, content);
      
      // Also cache in localStorage for persistence
      if (typeof window !== 'undefined' && window.localStorage) {
        const cacheKey = `diginativa-content-${gameId}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          content,
          timestamp: Date.now(),
          version: content.version
        }));
      }
    } catch (error) {
      console.warn('Failed to cache content:', error);
    }
  }
  
  /**
   * Get cached content
   */
  private getCachedContent(gameId?: string): any | null {
    if (!gameId) return null;
    
    // Try memory cache first
    const memoryCache = this.contentCache.get(gameId);
    if (memoryCache) {
      return memoryCache;
    }
    
    // Try localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cacheKey = `diginativa-content-${gameId}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          // Check if cache is not too old (24 hours)
          if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            return parsed.content;
          }
        }
      } catch (error) {
        console.warn('Failed to read cached content:', error);
      }
    }
    
    return null;
  }
  
  /**
   * Handle network recovery
   */
  private handleNetworkRecovery(): void {
    console.log('Network connection restored');
    
    // Trigger recovery callbacks
    const networkCallbacks = this.recoveryCallbacks.get(DegradationReason.NETWORK_FAILURE);
    if (networkCallbacks) {
      networkCallbacks(this.createDegradationContext(
        DegradationLevel.NONE,
        DegradationReason.NETWORK_FAILURE,
        RecoveryStrategy.RETRY
      ));
    }
  }
  
  /**
   * Handle network failure
   */
  private handleNetworkFailure(): void {
    console.warn('Network connection lost - entering offline mode');
  }
  
  /**
   * Register fallback provider
   */
  public registerFallbackProvider(reason: DegradationReason, provider: FallbackProvider): void {
    this.fallbackProviders.set(reason, provider);
  }
  
  /**
   * Register recovery callback
   */
  public registerRecoveryCallback(reason: DegradationReason, callback: RecoveryCallback): void {
    this.recoveryCallbacks.set(reason, callback);
  }
  
  /**
   * Get degradation statistics
   */
  public getDegradationStats(): {
    totalEvents: number;
    byReason: Record<DegradationReason, number>;
    byLevel: Record<DegradationLevel, number>;
    recentEvents: DegradationContext[];
  } {
    const byReason = {} as Record<DegradationReason, number>;
    const byLevel = {} as Record<DegradationLevel, number>;
    
    this.degradationHistory.forEach(event => {
      byReason[event.reason] = (byReason[event.reason] || 0) + 1;
      byLevel[event.level] = (byLevel[event.level] || 0) + 1;
    });
    
    return {
      totalEvents: this.degradationHistory.length,
      byReason,
      byLevel,
      recentEvents: this.degradationHistory.slice(-10)
    };
  }
  
  /**
   * Clear degradation history
   */
  public clearHistory(): void {
    this.degradationHistory = [];
  }
  
  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const gracefulDegradation = GracefulDegradationService.getInstance();
export default gracefulDegradation;