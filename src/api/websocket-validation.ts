/**
 * WebSocket Real-time Validation Service
 * Provides instant validation feedback for DevTeam content creation
 * 
 * Roadmap Ref: Q1-AO-Milestone-1.2
 * Enables <3 second validation feedback loop
 */

import { Server as SocketIOServer } from 'socket.io';
import { DevTeamContentValidator } from '../validation/devteam-content-validator';
import { InfrastructureMonitoring } from '../services/infrastructure-monitoring';
import type { ValidationResult } from '../validation/devteam-content-validator';

interface ValidationSession {
  userId: string;
  teamId: string;
  connectedAt: number;
  lastValidation: number;
  validationCount: number;
}

interface RealtimeValidationRequest {
  content: unknown;
  contentType: 'game' | 'scene' | 'quiz' | 'dialogue';
  cursorPosition?: { line: number; column: number };
  partial?: boolean; // For incremental validation
}

interface RealtimeValidationResponse {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    type: string;
    line?: number;
    column?: number;
  }>;
  warnings: Array<{
    path: string;
    message: string;
    type: string;
  }>;
  suggestions: string[];
  processingTime: number;
  validationId: string;
}

export class WebSocketValidationService {
  private io: SocketIOServer;
  private sessions: Map<string, ValidationSession> = new Map();
  private validator: DevTeamContentValidator;
  private monitoring: InfrastructureMonitoring;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.validator = new DevTeamContentValidator();
    this.monitoring = InfrastructureMonitoring.getInstance();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`DevTeam editor connected: ${socket.id}`);

      // Handle authentication
      socket.on('auth', (data: { userId: string; teamId: string }) => {
        this.sessions.set(socket.id, {
          userId: data.userId,
          teamId: data.teamId,
          connectedAt: Date.now(),
          lastValidation: 0,
          validationCount: 0
        });

        socket.emit('auth-success', {
          sessionId: socket.id,
          timestamp: Date.now()
        });
      });

      // Handle validation requests
      socket.on('validate', async (request: RealtimeValidationRequest) => {
        await this.handleValidation(socket, request);
      });

      // Handle incremental validation (for typing)
      socket.on('validate-incremental', async (request: RealtimeValidationRequest) => {
        await this.handleIncrementalValidation(socket, request);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        if (session) {
          this.monitoring.recordMetric({
            name: 'devteam_session_duration',
            value: sessionDuration,
            unit: 'ms',
            timestamp: Date.now(),
            tags: {
              userId: session.userId,
              teamId: session.teamId,
              validationCount: session.validationCount.toString()
            }
          });
        }
        this.sessions.delete(socket.id);
        console.log(`DevTeam editor disconnected: ${socket.id}`);
      });
    });
  }

  private async handleValidation(socket: Record<string, unknown>, request: RealtimeValidationRequest): Promise<void> {

    if (!session) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      // Rate limiting - max 10 validations per second
      if (session.lastValidation && (Date.now() - session.lastValidation) < 100) {
        socket.emit('rate-limited', { 
          message: 'Too many validation requests',
          retryAfter: 100 - (Date.now() - session.lastValidation)
        });
        return;
      }

      // Perform validation
      let result: ValidationResult;
      switch (request.contentType) {
        case 'scene':
          result = this.validator.validateScene(request.content);
          break;
        case 'quiz':
          result = this.validator.validateQuizScene(request.content);
          break;
        case 'dialogue':
          result = this.validator.validateDialogueScene(request.content);
          break;
        case 'game':
        default:
          result = this.validator.validateGameManifest(request.content);
      }


      // Update session
      session.lastValidation = Date.now();
      session.validationCount++;

      // Generate suggestions based on errors

      // Emit validation result
      const response: RealtimeValidationResponse = {
        valid: result.isValid,
        errors: result.errors.map(error => ({
          ...error,
          line: this.estimateErrorLine(error.path, request.content),
          column: 0
        })),
        warnings: result.warnings,
        suggestions,
        processingTime,
        validationId: `rtval_${Date.now()}_${socket.id}`
      };

      socket.emit('validation-result', response);

      // Emit to preview pane if validation successful
      if (result.isValid) {
        socket.emit('preview-update', {
          content: request.content,
          timestamp: Date.now()
        });
      }

      // Record metrics
      this.monitoring.recordMetric({
        name: 'websocket_validation_time',
        value: processingTime,
        unit: 'ms',
        timestamp: Date.now(),
        tags: {
          contentType: request.contentType,
          valid: result.isValid.toString(),
          userId: session.userId
        }
      });

    } catch (error) {
      this.monitoring.reportError(error as Error, {
        service: 'websocket-validation',
        userId: session.userId
      });

      socket.emit('validation-error', {
        error: 'Validation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleIncrementalValidation(socket: Record<string, unknown>, request: RealtimeValidationRequest): Promise<void> {
    // Debounce incremental validation
    if (!session || !request.partial) return;

    // Simple validation for partial content
    
    try {
      // Quick JSON parse check
      if (typeof request.content === 'string') {
        JSON.parse(request.content);
      }
    } catch (e) {
      errors.push({
        path: 'root',
        message: 'Invalid JSON syntax',
        type: 'syntax',
        line: request.cursorPosition?.line
      });
    }

    socket.emit('validation-incremental', {
      errors,
      validationId: `incr_${Date.now()}`
    });
  }

  private generateSmartSuggestions(errors: Record<string, unknown>[], contentType: string): string[] {
    const suggestions: string[] = [];

    errors.forEach(error => {
      // Content-type specific suggestions
      if (contentType === 'quiz' && error.path.includes('options')) {
        suggestions.push('Quiz must have at least 2 answer options');
        suggestions.push('Each option should have unique text');
      }

      if (contentType === 'dialogue' && error.path.includes('character')) {
        suggestions.push('Define character names for dialogue scenes');
        suggestions.push('Use consistent character IDs throughout the scene');
      }

      // General suggestions
      if (error.type === 'missing' && error.path.includes('title')) {
        suggestions.push('Every scene needs a descriptive title');
      }

      if (error.type === 'invalid_type') {
        suggestions.push(`Check the data type for ${error.path} - ${this.getExpectedType(error.path)}`);
      }
    });

    // Add best practices
    if (suggestions.length === 0 && errors.length === 0) {
      suggestions.push('✓ Content structure looks good!');
      suggestions.push('Consider adding descriptions for better accessibility');
    }

    return [...new Set(suggestions)].slice(0, 5); // Max 5 unique suggestions
  }

  private estimateErrorLine(path: string, content: unknown): number | undefined {
    // Simple line estimation based on path
    // In production, would use proper source mapping
    try {
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(path.split('.').pop() || '')) {
          return i + 1;
        }
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  private getExpectedType(path: string): string {
    const typeMap: Record<string, string> = {
      'duration': 'number (seconds)',
      'options': 'array of strings',
      'correctAnswer': 'number (index)',
      'title': 'string',
      'description': 'string',
      'scenes': 'array of scene objects',
      'dialogue': 'array of dialogue entries'
    };

    return typeMap[key] || 'check documentation';
  }

  /**
   * Broadcast validation statistics to admin dashboard
   */
  public broadcastStats(): void {

    this.io.emit('validation-stats', stats);
  }
}