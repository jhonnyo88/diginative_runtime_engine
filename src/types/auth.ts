/**
 * DigiNativa Runtime Engine - Authentication Types
 * Enterprise-grade authentication for Swedish municipal sector
 */

export interface User {
  id: string;
  externalId: string; // SSO integration ID
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  municipality: string;
  department?: string;
  role: UserRole;
  permissions: Permission[];
  accessibilityPreferences: AccessibilityPreferences;
  languagePreference: 'sv' | 'en' | 'de' | 'fr' | 'nl';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 
  | 'user'              // Regular municipal employee
  | 'admin'             // Municipal administrator
  | 'super_admin'       // DigiNativa system administrator
  | 'content_manager'   // Game content manager
  | 'analyst';          // Analytics and reporting

export type Permission = 
  | 'games.play'                    // Play games
  | 'games.create'                  // Create/edit games
  | 'games.publish'                 // Publish games
  | 'games.analytics'               // View game analytics
  | 'users.view'                    // View user list
  | 'users.manage'                  // Manage users
  | 'municipality.admin'            // Municipality administration
  | 'system.admin'                  // System administration
  | 'content.manage'                // Content management
  | 'analytics.view'                // View analytics
  | 'analytics.export';             // Export analytics data

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  captionsEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  colorScheme: 'default' | 'high-contrast' | 'blue-yellow' | 'grayscale';
}

export interface AuthSession {
  sessionId: string;
  userId: string;
  municipality: string;
  role: UserRole;
  permissions: Permission[];
  expiresAt: string;
  refreshToken?: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  municipality?: string;
}

export interface SSOConfig {
  provider: 'azure-ad' | 'okta' | 'saml' | 'oidc';
  enabled: boolean;
  endpoints: {
    login: string;
    logout: string;
    callback: string;
  };
  clientId: string;
  tenantId?: string; // For Azure AD
  domain?: string; // For Okta
}

export interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permission[];
  
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AuthResult>;
  
  // SSO methods
  loginWithSSO: (provider: string, municipality: string) => Promise<void>;
  
  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  canAccessMunicipality: (municipality: string) => boolean;
  
  // User preferences
  updatePreferences: (preferences: Partial<AccessibilityPreferences>) => Promise<void>;
  updateLanguage: (language: 'sv' | 'en' | 'de' | 'fr' | 'nl') => Promise<void>;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  session?: AuthSession;
  error?: AuthError;
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_DISABLED'
  | 'SESSION_EXPIRED'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'MUNICIPALITY_ACCESS_DENIED'
  | 'SSO_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// GDPR Compliance
export interface DataProcessingConsent {
  analytics: boolean;
  performance: boolean;
  functional: boolean;
  marketing: boolean;
  consentDate: string;
  ipAddress: string;
  userAgent: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: AuditAction;
  resource: string;
  details: Record<string, unknown>;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  municipality: string;
}

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'GAME_START'
  | 'GAME_COMPLETE'
  | 'PERMISSION_CHANGE'
  | 'DATA_EXPORT'
  | 'SETTINGS_UPDATE'
  | 'CONTENT_CREATE'
  | 'CONTENT_UPDATE'
  | 'CONTENT_DELETE';

// Anna Svensson persona specific types
export interface MunicipalEmployeeProfile extends User {
  employeeId: string;
  position: string;
  startDate: string;
  trainingRequirements: string[];
  completedTraining: CompletedTraining[];
  workSchedule: WorkSchedule;
}

export interface CompletedTraining {
  gameId: string;
  completedAt: string;
  score: number;
  certificateId?: string;
  validUntil?: string;
}

export interface WorkSchedule {
  timezone: string;
  workingHours: {
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
  workingDays: number[]; // 0-6, Sunday=0
  preferredLanguage: 'sv' | 'en';
}

// Multi-tenant authorization
export interface MunicipalityConfig {
  id: string;
  name: string;
  domain: string;
  country: 'SE' | 'DE' | 'FR' | 'NL'; // Supported countries
  ssoConfig?: SSOConfig;
  brandingConfig: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily?: string;
  };
  features: {
    analytics: boolean;
    customGames: boolean;
    reporting: boolean;
    multiLanguage: boolean;
  };
  dataRetentionDays: number;
  maxUsers: number;
  subscriptionTier: 'basic' | 'standard' | 'premium';
}