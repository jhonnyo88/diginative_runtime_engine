/**
 * API Gateway with Advanced Rate Limiting
 * Final Q1 infrastructure component for enterprise scalability
 * 
 * Roadmap Ref: Q1-Foundation-Autonomi-Milestone-1.1
 * Business Impact: Protects against DDoS, enables DevTeam scaling, municipal-specific limits
 */

import { Request, Response, NextFunction } from 'express';
import { RedisClusterService } from './redis-cluster';
import { InfrastructureMonitoring } from './infrastructure-monitoring';
import { v4 as uuidv4 } from 'uuid';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator: (req: Request) => string; // Function to generate rate limit key
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  onLimitReached?: (req: Request, res: Response) => void;
}

export interface MunicipalRateLimitProfile {
  municipalityId: string;
  municipalityName: string;
  tier: 'basic' | 'premium' | 'enterprise';
  limits: {
    api: RateLimitConfig;
    validation: RateLimitConfig;
    authentication: RateLimitConfig;
    contentUpload: RateLimitConfig;
  };
  ddosProtection: {
    enabled: boolean;
    suspiciousThreshold: number; // requests per minute
    blockDuration: number; // milliseconds
  };
}

export interface APIKeyConfig {
  keyId: string;
  keyHash: string;
  municipalityId?: string;
  permissions: string[];
  rateLimit: RateLimitConfig;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: Date;
  retryAfter?: number;
}

export class APIGateway {
  private redis: RedisClusterService;
  private monitoring: InfrastructureMonitoring;
  private municipalProfiles: Map<string, MunicipalRateLimitProfile> = new Map();
  private apiKeys: Map<string, APIKeyConfig> = new Map();

  constructor() {
    this.redis = new RedisClusterService();
    this.monitoring = InfrastructureMonitoring.getInstance();
    this.initializeMunicipalProfiles();
    this.initializeDevTeamAPIKeys();
  }

  private initializeMunicipalProfiles(): void {
    // Swedish Municipalities
    const swedenBasic: MunicipalRateLimitProfile = {
      municipalityId: 'malmo_stad',
      municipalityName: 'Malmö Stad',
      tier: 'enterprise',
      limits: {
        api: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          maxRequests: 1000,
          keyGenerator: (req) => `api:${this.extractMunicipalityId(req)}:${req.ip}`,
          skipSuccessfulRequests: false,
          skipFailedRequests: false
        },
        validation: {
          windowMs: 60 * 1000, // 1 minute
          maxRequests: 100,
          keyGenerator: (req) => `validation:${this.extractMunicipalityId(req)}:${req.ip}`,
          skipSuccessfulRequests: true,
          skipFailedRequests: false
        },
        authentication: {
          windowMs: 5 * 60 * 1000, // 5 minutes
          maxRequests: 10,
          keyGenerator: (req) => `auth:${req.ip}`,
          skipSuccessfulRequests: true,
          skipFailedRequests: false
        },
        contentUpload: {
          windowMs: 60 * 1000, // 1 minute
          maxRequests: 10,
          keyGenerator: (req) => `upload:${this.extractMunicipalityId(req)}:${req.ip}`,
          skipSuccessfulRequests: true,
          skipFailedRequests: false
        }
      },
      ddosProtection: {
        enabled: true,
        suspiciousThreshold: 200, // requests per minute
        blockDuration: 15 * 60 * 1000 // 15 minutes
      }
    };

    // Clone for other Swedish municipalities with adjusted limits
    const gothenburgProfile = { ...swedenBasic };
    gothenburgProfile.municipalityId = 'goteborg_stad';
    gothenburgProfile.municipalityName = 'Göteborgs Stad';

    const stockholmProfile = { ...swedenBasic };
    stockholmProfile.municipalityId = 'stockholm_stad';
    stockholmProfile.municipalityName = 'Stockholms Stad';

    // German municipality profile - more conservative limits
    const berlinProfile: MunicipalRateLimitProfile = {
      municipalityId: 'berlin_de',
      municipalityName: 'Stadt Berlin',
      tier: 'premium',
      limits: {
        api: {
          windowMs: 15 * 60 * 1000,
          maxRequests: 500, // Lower for German compliance
          keyGenerator: (req) => `api:${this.extractMunicipalityId(req)}:${req.ip}`,
          skipSuccessfulRequests: false,
          skipFailedRequests: false
        },
        validation: {
          windowMs: 60 * 1000,
          maxRequests: 50,
          keyGenerator: (req) => `validation:${this.extractMunicipalityId(req)}:${req.ip}`,
          skipSuccessfulRequests: true,
          skipFailedRequests: false
        },
        authentication: {
          windowMs: 5 * 60 * 1000,
          maxRequests: 5, // Stricter auth limits
          keyGenerator: (req) => `auth:${req.ip}`,
          skipSuccessfulRequests: true,
          skipFailedRequests: false
        },
        contentUpload: {
          windowMs: 60 * 1000,
          maxRequests: 5,
          keyGenerator: (req) => `upload:${this.extractMunicipalityId(req)}:${req.ip}`,
          skipSuccessfulRequests: true,
          skipFailedRequests: false
        }
      },
      ddosProtection: {
        enabled: true,
        suspiciousThreshold: 100,
        blockDuration: 30 * 60 * 1000 // 30 minutes
      }
    };

    // Store profiles
    this.municipalProfiles.set('malmo_stad', swedenBasic);
    this.municipalProfiles.set('goteborg_stad', gothenburgProfile);
    this.municipalProfiles.set('stockholm_stad', stockholmProfile);
    this.municipalProfiles.set('berlin_de', berlinProfile);
  }

  private initializeDevTeamAPIKeys(): void {
    // DevTeam API keys for content pipeline access
    const devTeamKey: APIKeyConfig = {
      keyId: 'devteam_api_001',
      keyHash: process.env.DEVTEAM_API_KEY_HASH || 'development_key_hash',
      permissions: [
        'content:validate',
        'content:upload',
        'municipal:read',
        'pipeline:status'
      ],
      rateLimit: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 1000, // High limit for DevTeam automation
        keyGenerator: (req) => `devteam:${this.extractAPIKey(req)}`,
        skipSuccessfulRequests: true,
        skipFailedRequests: false
      },
      isActive: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    };

    // Admin API key for infrastructure management
    const adminKey: APIKeyConfig = {
      keyId: 'admin_api_001',
      keyHash: process.env.ADMIN_API_KEY_HASH || 'admin_development_key_hash',
      permissions: [
        'admin:municipalities',
        'admin:api_keys',
        'admin:rate_limits',
        'admin:monitoring',
        'admin:security'
      ],
      rateLimit: {
        windowMs: 60 * 1000,
        maxRequests: 200,
        keyGenerator: (req) => `admin:${this.extractAPIKey(req)}`,
        skipSuccessfulRequests: true,
        skipFailedRequests: false
      },
      isActive: true,
      createdAt: new Date()
    };

    this.apiKeys.set(devTeamKey.keyId, devTeamKey);
    this.apiKeys.set(adminKey.keyId, adminKey);
  }

  /**
   * Main rate limiting middleware with SAML context integration
   */
  public createRateLimitMiddleware(limitType: 'api' | 'validation' | 'authentication' | 'contentUpload') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const municipalityId = this.extractMunicipalityId(req);
        const profile = this.municipalProfiles.get(municipalityId) || this.getDefaultProfile();
        let config = { ...profile.limits[limitType] };

        // Apply SAML user privilege adjustments
        const adjustedConfig = this.applySAMLPrivilegeAdjustments(req, config, limitType);
        
        // Check rate limit with adjusted configuration
        const result = await this.checkRateLimit(req, adjustedConfig);
        
        if (!result.allowed) {
          // Record rate limit violation
          await this.monitoring.recordMetric({
            name: 'api_rate_limit_exceeded',
            value: 1,
            unit: 'count',
            timestamp: Date.now(),
            tags: {
              municipalityId,
              limitType,
              ip: req.ip || 'unknown',
              userAgent: req.get('User-Agent')?.substring(0, 50) || 'unknown'
            }
          });

          // Set rate limit headers
          res.set({
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remainingRequests.toString(),
            'X-RateLimit-Reset': Math.ceil(result.resetTime.getTime() / 1000).toString(),
            'Retry-After': result.retryAfter?.toString() || '60'
          });

          if (config.onLimitReached) {
            config.onLimitReached(req, res);
          } else {
            res.status(429).json({
              success: false,
              error: 'Rate limit exceeded',
              retryAfter: result.retryAfter,
              resetTime: result.resetTime.toISOString()
            });
          }
          return;
        }

        // Set success headers with SAML context
        res.set({
          'X-RateLimit-Limit': adjustedConfig.maxRequests.toString(),
          'X-RateLimit-Remaining': result.remainingRequests.toString(),
          'X-RateLimit-Reset': Math.ceil(result.resetTime.getTime() / 1000).toString(),
          'X-Municipality-Context': municipalityId,
          'X-SAML-Enhanced': (req as any).samlUser ? 'true' : 'false'
        });

        // Record successful request with SAML context
        await this.recordSAMLContextMetrics(req, limitType, 'allowed');

        next();
      } catch (error) {
        console.error('Rate limiting error:', error);
        // In case of rate limiting system failure, allow request but log error
        await this.monitoring.reportError(error as Error, {
          context: 'rate_limiting_middleware',
          municipalityId: this.extractMunicipalityId(req),
          limitType
        });
        next();
      }
    };
  }

  /**
   * DDoS protection middleware
   */
  public createDDoSProtectionMiddleware() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const municipalityId = this.extractMunicipalityId(req);
        const profile = this.municipalProfiles.get(municipalityId) || this.getDefaultProfile();

        if (!profile.ddosProtection.enabled) {
          next();
          return;
        }

        const clientKey = `ddos:${req.ip}:${municipalityId}`;
        const windowMs = 60 * 1000; // 1 minute window
        const currentTime = Date.now();
        const windowStart = currentTime - windowMs;

        // Get request count in current window
        const requests = await this.redis.zrangebyscore(clientKey, windowStart, currentTime);
        const requestCount = requests.length;

        if (requestCount >= profile.ddosProtection.suspiciousThreshold) {
          // Block this IP
          const blockKey = `blocked:${req.ip}`;
          await this.redis.set(blockKey, 'blocked', profile.ddosProtection.blockDuration / 1000);

          // Record DDoS attempt
          await this.monitoring.recordMetric({
            name: 'ddos_protection_triggered',
            value: 1,
            unit: 'count',
            timestamp: currentTime,
            tags: {
              municipalityId,
              ip: req.ip || 'unknown',
              requestCount: requestCount.toString(),
              threshold: profile.ddosProtection.suspiciousThreshold.toString()
            }
          });

          res.status(429).json({
            success: false,
            error: 'Too many requests detected. Access temporarily blocked.',
            retryAfter: Math.ceil(profile.ddosProtection.blockDuration / 1000)
          });
          return;
        }

        // Check if IP is currently blocked
        const isBlocked = await this.redis.get(`blocked:${req.ip}`);
        if (isBlocked) {
          res.status(429).json({
            success: false,
            error: 'Access blocked due to suspicious activity',
            retryAfter: await this.redis.ttl(`blocked:${req.ip}`)
          });
          return;
        }

        // Record this request
        await this.redis.zadd(clientKey, currentTime, `${currentTime}-${uuidv4()}`);
        await this.redis.expire(clientKey, Math.ceil(windowMs / 1000));

        next();
      } catch (error) {
        console.error('DDoS protection error:', error);
        await this.monitoring.reportError(error as Error, {
          context: 'ddos_protection_middleware'
        });
        next();
      }
    };
  }

  /**
   * API key authentication middleware
   */
  public createAPIKeyMiddleware(requiredPermissions: string[] = []) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const apiKey = this.extractAPIKey(req);
        if (!apiKey) {
          res.status(401).json({
            success: false,
            error: 'API key required'
          });
          return;
        }

        // Validate API key
        const keyConfig = await this.validateAPIKey(apiKey);
        if (!keyConfig) {
          res.status(401).json({
            success: false,
            error: 'Invalid API key'
          });
          return;
        }

        // Check permissions
        if (requiredPermissions.length > 0) {
          const hasPermission = requiredPermissions.some(permission => 
            keyConfig.permissions.includes(permission) || 
            keyConfig.permissions.includes('admin:*')
          );

          if (!hasPermission) {
            res.status(403).json({
              success: false,
              error: 'Insufficient permissions'
            });
            return;
          }
        }

        // Check API key rate limit
        const result = await this.checkRateLimit(req, keyConfig.rateLimit);
        if (!result.allowed) {
          res.status(429).json({
            success: false,
            error: 'API key rate limit exceeded',
            retryAfter: result.retryAfter
          });
          return;
        }

        // Update last used timestamp
        keyConfig.lastUsed = new Date();
        this.apiKeys.set(keyConfig.keyId, keyConfig);

        // Attach key info to request
        (req as any).apiKey = keyConfig;

        next();
      } catch (error) {
        console.error('API key validation error:', error);
        res.status(500).json({
          success: false,
          error: 'Authentication error'
        });
      }
    };
  }

  private async checkRateLimit(req: Request, config: RateLimitConfig): Promise<RateLimitResult> {
    const key = config.keyGenerator(req);
    const currentTime = Date.now();
    const windowStart = currentTime - config.windowMs;

    // Clean old entries and count current requests
    await this.redis.zremrangebyscore(key, 0, windowStart);
    const currentCount = await this.redis.zcard(key);

    if (currentCount >= config.maxRequests) {
      // Get the oldest request in current window to calculate reset time
      const oldestRequests = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
      const resetTime = oldestRequests.length > 0 
        ? new Date(parseInt(oldestRequests[1]) + config.windowMs)
        : new Date(currentTime + config.windowMs);

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime.getTime() - currentTime) / 1000)
      };
    }

    // Add current request
    await this.redis.zadd(key, currentTime, `${currentTime}-${uuidv4()}`);
    await this.redis.expire(key, Math.ceil(config.windowMs / 1000));

    return {
      allowed: true,
      remainingRequests: config.maxRequests - currentCount - 1,
      resetTime: new Date(currentTime + config.windowMs)
    };
  }

  private async validateAPIKey(apiKey: string): Promise<APIKeyConfig | null> {
    // In production, hash the provided key and compare
    for (const [keyId, config] of this.apiKeys) {
      if (config.keyHash === apiKey && config.isActive) {
        // Check expiration
        if (config.expiresAt && new Date() > config.expiresAt) {
          return null;
        }
        return config;
      }
    }
    return null;
  }

  private extractMunicipalityId(req: Request): string {
    // Extract from various sources with SAML context priority
    return req.headers['x-municipality-id'] as string ||
           req.query.municipalityId as string ||
           (req as any).samlUser?.municipalityId ||
           this.extractMunicipalityFromSAMLSession(req) ||
           'default';
  }

  private extractMunicipalityFromSAMLSession(req: Request): string | null {
    const samlUser = (req as any).samlUser;
    if (!samlUser) return null;

    // Extract municipality from SAML attributes
    const municipality = samlUser.municipality;
    if (municipality) {
      // Map municipality names to IDs
      const municipalityMap: Record<string, string> = {
        'Malmö Stad': 'malmo_stad',
        'Göteborgs Stad': 'goteborg_stad', 
        'Stockholms Stad': 'stockholm_stad',
        'Stadt Berlin': 'berlin_de'
      };
      return municipalityMap[municipality] || null;
    }

    // Extract from email domain if available
    const email = samlUser.email;
    if (email) {
      const domain = email.split('@')[1];
      const domainMap: Record<string, string> = {
        'malmo.se': 'malmo_stad',
        'goteborg.se': 'goteborg_stad',
        'stockholm.se': 'stockholm_stad',
        'berlin.de': 'berlin_de'
      };
      return domainMap[domain] || null;
    }

    return null;
  }

  private extractAPIKey(req: Request): string | null {
    // Check Authorization header: Bearer <key>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check X-API-Key header
    const apiKeyHeader = req.headers['x-api-key'];
    if (apiKeyHeader) {
      return apiKeyHeader as string;
    }

    // Check query parameter
    return req.query.apiKey as string || null;
  }

  private getDefaultProfile(): MunicipalRateLimitProfile {
    return {
      municipalityId: 'default',
      municipalityName: 'Default Profile',
      tier: 'basic',
      limits: {
        api: {
          windowMs: 15 * 60 * 1000,
          maxRequests: 100,
          keyGenerator: (req) => `api:default:${req.ip}`,
          skipSuccessfulRequests: false,
          skipFailedRequests: false
        },
        validation: {
          windowMs: 60 * 1000,
          maxRequests: 20,
          keyGenerator: (req) => `validation:default:${req.ip}`,
          skipSuccessfulRequests: true,
          skipFailedRequests: false
        },
        authentication: {
          windowMs: 5 * 60 * 1000,
          maxRequests: 5,
          keyGenerator: (req) => `auth:${req.ip}`,
          skipSuccessfulRequests: true,
          skipFailedRequests: false
        },
        contentUpload: {
          windowMs: 60 * 1000,
          maxRequests: 2,
          keyGenerator: (req) => `upload:default:${req.ip}`,
          skipSuccessfulRequests: true,
          skipFailedRequests: false
        }
      },
      ddosProtection: {
        enabled: true,
        suspiciousThreshold: 50,
        blockDuration: 10 * 60 * 1000
      }
    };
  }

  /**
   * Get rate limit statistics for monitoring
   */
  public async getRateLimitStats(municipalityId?: string): Promise<{
    requests: number;
    blocked: number;
    apiKeyUsage: Record<string, number>;
    ddosBlocks: number;
  }> {
    const pattern = municipalityId ? `*:${municipalityId}:*` : '*';
    const keys = await this.redis.keys(pattern);
    
    let totalRequests = 0;
    let blockedRequests = 0;
    let ddosBlocks = 0;
    const apiKeyUsage: Record<string, number> = {};

    for (const key of keys) {
      if (key.startsWith('blocked:')) {
        ddosBlocks++;
      } else if (key.includes('devteam:') || key.includes('admin:')) {
        const usage = await this.redis.zcard(key);
        const keyType = key.split(':')[0];
        apiKeyUsage[keyType] = (apiKeyUsage[keyType] || 0) + usage;
      } else {
        const requests = await this.redis.zcard(key);
        totalRequests += requests;
      }
    }

    return {
      requests: totalRequests,
      blocked: blockedRequests,
      apiKeyUsage,
      ddosBlocks
    };
  }

  /**
   * Create a new API key
   */
  public async createAPIKey(config: Omit<APIKeyConfig, 'keyId' | 'keyHash' | 'createdAt'>): Promise<{
    keyId: string;
    apiKey: string;
  }> {
    const keyId = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const apiKey = `dk_${Buffer.from(`${keyId}:${Date.now()}`).toString('base64')}`;
    const keyHash = Buffer.from(apiKey).toString('base64'); // In production, use proper hashing

    const keyConfig: APIKeyConfig = {
      keyId,
      keyHash,
      createdAt: new Date(),
      ...config
    };

    this.apiKeys.set(keyId, keyConfig);

    return { keyId, apiKey };
  }

  /**
   * Update municipality rate limit profile
   */
  public updateMunicipalityProfile(municipalityId: string, updates: Partial<MunicipalRateLimitProfile>): boolean {
    const existing = this.municipalProfiles.get(municipalityId);
    if (!existing) {
      return false;
    }

    const updated = { ...existing, ...updates };
    this.municipalProfiles.set(municipalityId, updated);
    return true;
  }

  /**
   * Apply SAML user privilege adjustments to rate limits
   */
  private applySAMLPrivilegeAdjustments(
    req: Request, 
    config: RateLimitConfig, 
    limitType: string
  ): RateLimitConfig {
    const samlUser = (req as any).samlUser;
    if (!samlUser) return config;

    const adjustedConfig = { ...config };
    const userRoles = samlUser.roles || [];

    // Municipal administrator privileges
    if (userRoles.includes('municipal_admin') || userRoles.includes('admin')) {
      adjustedConfig.maxRequests = Math.floor(config.maxRequests * 2); // 2x limit for admins
      adjustedConfig.keyGenerator = (req) => `saml_admin:${this.extractMunicipalityId(req)}:${samlUser.userId || samlUser.nameID}`;
    }
    // IT staff privileges  
    else if (userRoles.includes('it_staff') || userRoles.includes('technical_admin')) {
      adjustedConfig.maxRequests = Math.floor(config.maxRequests * 1.5); // 1.5x limit for IT staff
      adjustedConfig.keyGenerator = (req) => `saml_it:${this.extractMunicipalityId(req)}:${samlUser.userId || samlUser.nameID}`;
    }
    // Regular municipal employee
    else if (userRoles.some(role => role.includes('municipal_employee'))) {
      adjustedConfig.maxRequests = Math.floor(config.maxRequests * 1.2); // 1.2x limit for employees
      adjustedConfig.keyGenerator = (req) => `saml_employee:${this.extractMunicipalityId(req)}:${samlUser.userId || samlUser.nameID}`;
    }
    // Authenticated user (basic bonus)
    else {
      adjustedConfig.maxRequests = Math.floor(config.maxRequests * 1.1); // 1.1x limit for authenticated users
      adjustedConfig.keyGenerator = (req) => `saml_auth:${this.extractMunicipalityId(req)}:${samlUser.userId || samlUser.nameID}`;
    }

    return adjustedConfig;
  }

  /**
   * Record SAML context metrics for monitoring
   */
  private async recordSAMLContextMetrics(
    req: Request, 
    limitType: string, 
    outcome: 'allowed' | 'blocked'
  ): Promise<void> {
    const samlUser = (req as any).samlUser;
    const municipalityId = this.extractMunicipalityId(req);
    
    await this.monitoring.recordMetric({
      name: 'api_gateway_saml_context',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        municipalityId,
        limitType,
        outcome,
        authenticated: samlUser ? 'true' : 'false',
        userRoles: samlUser?.roles?.join(',') || 'none',
        sessionIndex: samlUser?.sessionIndex || 'none',
        municipality: samlUser?.municipality || 'unknown'
      }
    });
  }

  /**
   * Check if SAML session is still valid
   */
  public async validateSAMLSession(req: Request): Promise<{
    valid: boolean;
    municipalityId?: string;
    privileges?: string[];
    sessionExpiry?: Date;
  }> {
    const samlUser = (req as any).samlUser;
    if (!samlUser) {
      return { valid: false };
    }

    // Check session expiry if available
    if (samlUser.sessionExpiry && new Date() > new Date(samlUser.sessionExpiry)) {
      return { valid: false };
    }

    const municipalityId = this.extractMunicipalityId(req);
    const privileges = this.extractSAMLPrivileges(samlUser);

    return {
      valid: true,
      municipalityId,
      privileges,
      sessionExpiry: samlUser.sessionExpiry ? new Date(samlUser.sessionExpiry) : undefined
    };
  }

  /**
   * Extract SAML user privileges for rate limiting
   */
  private extractSAMLPrivileges(samlUser: any): string[] {
    const privileges: string[] = [];
    const roles = samlUser.roles || [];

    if (roles.includes('municipal_admin') || roles.includes('admin')) {
      privileges.push('admin_privileges');
    }
    if (roles.includes('it_staff') || roles.includes('technical_admin')) {
      privileges.push('technical_privileges');
    }
    if (roles.some((role: string) => role.includes('municipal_employee'))) {
      privileges.push('employee_privileges');
    }
    if (samlUser.department) {
      privileges.push(`department_${samlUser.department.toLowerCase()}`);
    }

    return privileges;
  }

  /**
   * Municipal administrator override for rate limits
   */
  public async createAdminOverrideMiddleware() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const samlUser = (req as any).samlUser;
      
      if (!samlUser) {
        next();
        return;
      }

      const userRoles = samlUser.roles || [];
      const isAdmin = userRoles.includes('municipal_admin') || 
                     userRoles.includes('admin') ||
                     userRoles.includes('saml_admin');

      if (isAdmin) {
        // Check for emergency override header
        const emergencyOverride = req.headers['x-emergency-override'];
        if (emergencyOverride === 'true') {
          // Log emergency override usage
          await this.monitoring.recordMetric({
            name: 'admin_emergency_override',
            value: 1,
            unit: 'count',
            timestamp: Date.now(),
            tags: {
              adminUser: samlUser.email || samlUser.nameID,
              municipalityId: this.extractMunicipalityId(req),
              ipAddress: req.ip || 'unknown'
            }
          });

          // Set override flag
          (req as any).emergencyOverride = true;
        }
      }

      next();
    };
  }

  /**
   * Get enhanced statistics with SAML context
   */
  public async getSAMLEnhancedStats(municipalityId?: string): Promise<{
    requests: number;
    blocked: number;
    samlAuthenticated: number;
    privilegeDistribution: Record<string, number>;
    municipalityBreakdown: Record<string, number>;
  }> {
    const baseStats = await this.getRateLimitStats(municipalityId);
    
    // Enhanced stats would be calculated from monitoring metrics
    // For now, return basic structure with mock data
    return {
      ...baseStats,
      samlAuthenticated: Math.floor(baseStats.requests * 0.7), // 70% authenticated
      privilegeDistribution: {
        'admin_privileges': Math.floor(baseStats.requests * 0.05),
        'technical_privileges': Math.floor(baseStats.requests * 0.15),
        'employee_privileges': Math.floor(baseStats.requests * 0.50),
        'anonymous': Math.floor(baseStats.requests * 0.30)
      },
      municipalityBreakdown: {
        'malmo_stad': Math.floor(baseStats.requests * 0.4),
        'goteborg_stad': Math.floor(baseStats.requests * 0.3),
        'stockholm_stad': Math.floor(baseStats.requests * 0.2),
        'berlin_de': Math.floor(baseStats.requests * 0.1)
      }
    };
  }
}

// Singleton instance
export const apiGateway = new APIGateway();

// Export convenience middleware functions
export const rateLimitAPI = () => apiGateway.createRateLimitMiddleware('api');
export const rateLimitValidation = () => apiGateway.createRateLimitMiddleware('validation');
export const rateLimitAuth = () => apiGateway.createRateLimitMiddleware('authentication');
export const rateLimitUpload = () => apiGateway.createRateLimitMiddleware('contentUpload');
export const ddosProtection = () => apiGateway.createDDoSProtectionMiddleware();
export const requireAPIKey = (permissions: string[] = []) => apiGateway.createAPIKeyMiddleware(permissions);