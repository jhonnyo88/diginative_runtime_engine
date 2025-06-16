/**
 * DigiNativa Runtime Engine - Authentication Context
 * Enterprise-grade authentication for Swedish municipal sector
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { 
  User, 
  AuthSession, 
  AuthContextType, 
  AuthResult, 
  LoginCredentials,
  Permission, 
  UserRole,
  AccessibilityPreferences,
  DataProcessingConsent,
  MunicipalityConfig
} from '../types/auth';
import { captureError } from '../services/error-monitoring';
import { performanceAnalytics } from '../services/performance-analytics';

interface AuthProviderProps {
  children: ReactNode;
  municipalityConfig?: MunicipalityConfig;
  mockMode?: boolean; // For development
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  municipalityConfig,
  mockMode = false 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check for existing session
      const savedSession = getStoredSession();
      if (savedSession && !isSessionExpired(savedSession)) {
        const result = await validateSession(savedSession);
        if (result.success && result.user && result.session) {
          setUser(result.user);
          setSession(result.session);
          
          // Track session restore
          captureError({
            name: 'SessionRestored',
            message: 'User session restored from storage',
            severity: 'low',
            category: 'runtime',
            metadata: {
              userId: result.user.id,
              municipality: result.user.municipality
            }
          });
        } else {
          clearStoredSession();
        }
      } else if (savedSession) {
        // Session expired
        clearStoredSession();
        captureError({
          name: 'SessionExpired',
          message: 'User session expired',
          severity: 'low',
          category: 'runtime'
        });
      }

      // Development mock mode
      if (mockMode && !user) {
        await initializeMockAuth();
      }

    } catch (error) {
      captureError({
        name: 'AuthInitializationError',
        message: error instanceof Error ? error.message : 'Unknown auth initialization error',
        severity: 'high',
        category: 'runtime',
        metadata: { error }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    try {
      setIsLoading(true);

      // Mock implementation for development
      if (mockMode) {
        return await mockLogin(credentials);
      }

      // Real authentication implementation
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          municipality: credentials.municipality || municipalityConfig?.id
        })
      });

      const result: AuthResult = await response.json();

      if (result.success && result.user && result.session) {
        setUser(result.user);
        setSession(result.session);
        storeSession(result.session);
        
        // Track successful login
        performanceAnalytics.trackGameInteraction(
          'system',
          'auth',
          'login_success',
          0
        );

        // Update session storage for analytics
        sessionStorage.setItem('municipality', result.user.municipality);
        sessionStorage.setItem('userId', result.user.id);
      }

      return result;
    } catch (error) {
      const authError: AuthResult = {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to authentication service',
          details: error
        }
      };

      captureError({
        name: 'LoginError',
        message: authError.error!.message,
        severity: 'high',
        category: 'runtime',
        metadata: { 
          email: credentials.email,
          municipality: credentials.municipality,
          error 
        }
      });

      return authError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (session && !mockMode) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.sessionId}`
          }
        });
      }

      // Track logout
      if (user) {
        performanceAnalytics.trackGameInteraction(
          'system',
          'auth',
          'logout',
          0
        );
      }

      // Clear state
      setUser(null);
      setSession(null);
      clearStoredSession();
      
      // Clear session storage
      sessionStorage.removeItem('municipality');
      sessionStorage.removeItem('userId');

    } catch (error) {
      captureError({
        name: 'LogoutError',
        message: error instanceof Error ? error.message : 'Logout failed',
        severity: 'medium',
        category: 'runtime',
        metadata: { error }
      });
    }
  };

  const refreshSession = async (): Promise<AuthResult> => {
    if (!session) {
      return {
        success: false,
        error: {
          code: 'SESSION_EXPIRED',
          message: 'No active session to refresh'
        }
      };
    }

    try {
      if (mockMode) {
        return { success: true, user, session };
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.sessionId}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: session.refreshToken
        })
      });

      const result: AuthResult = await response.json();

      if (result.success && result.session) {
        setSession(result.session);
        storeSession(result.session);
      } else {
        await logout();
      }

      return result;
    } catch (error) {
      captureError({
        name: 'SessionRefreshError',
        message: error instanceof Error ? error.message : 'Session refresh failed',
        severity: 'medium',
        category: 'runtime'
      });

      await logout();
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to refresh session'
        }
      };
    }
  };

  const loginWithSSO = async (provider: string, municipality: string): Promise<void> => {
    try {
      if (!municipalityConfig?.ssoConfig?.enabled) {
        throw new Error('SSO not configured for this municipality');
      }

      const ssoUrl = `/api/auth/sso/${provider}?municipality=${municipality}&redirect=${window.location.origin}/auth/callback`;
      window.location.href = ssoUrl;
    } catch (error) {
      captureError({
        name: 'SSOLoginError',
        message: error instanceof Error ? error.message : 'SSO login failed',
        severity: 'high',
        category: 'runtime',
        metadata: { provider, municipality }
      });
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role || false;
  };

  const canAccessMunicipality = (municipality: string): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.municipality === municipality;
  };

  const updatePreferences = async (preferences: Partial<AccessibilityPreferences>): Promise<void> => {
    if (!user) return;

    try {
      const updatedPreferences = {
        ...user.accessibilityPreferences,
        ...preferences
      };

      if (!mockMode) {
        await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session?.sessionId}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ accessibilityPreferences: updatedPreferences })
        });
      }

      setUser(prev => prev ? {
        ...prev,
        accessibilityPreferences: updatedPreferences
      } : null);

      // Track accessibility preference changes
      performanceAnalytics.trackGameInteraction(
        'system',
        'preferences',
        'accessibility_update',
        0
      );

    } catch (error) {
      captureError({
        name: 'PreferencesUpdateError',
        message: error instanceof Error ? error.message : 'Failed to update preferences',
        severity: 'medium',
        category: 'runtime'
      });
    }
  };

  const updateLanguage = async (language: 'sv' | 'en' | 'de' | 'fr' | 'nl'): Promise<void> => {
    if (!user) return;

    try {
      if (!mockMode) {
        await fetch('/api/user/language', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session?.sessionId}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ languagePreference: language })
        });
      }

      setUser(prev => prev ? {
        ...prev,
        languagePreference: language
      } : null);

    } catch (error) {
      captureError({
        name: 'LanguageUpdateError',
        message: error instanceof Error ? error.message : 'Failed to update language',
        severity: 'medium',
        category: 'runtime'
      });
    }
  };

  // Development mock authentication
  const initializeMockAuth = async () => {
    const mockUser: User = {
      id: 'mock-user-1',
      externalId: 'anna.svensson@malmo.se',
      email: 'anna.svensson@malmo.se',
      displayName: 'Anna Svensson',
      firstName: 'Anna',
      lastName: 'Svensson',
      municipality: 'malmo',
      department: 'Utbildning',
      role: 'user',
      permissions: ['games.play', 'analytics.view'],
      accessibilityPreferences: {
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        screenReader: false,
        keyboardNavigation: true,
        captionsEnabled: false,
        fontSize: 'medium',
        colorScheme: 'default'
      },
      languagePreference: 'sv',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mockSession: AuthSession = {
      sessionId: 'mock-session-1',
      userId: mockUser.id,
      municipality: mockUser.municipality,
      role: mockUser.role,
      permissions: mockUser.permissions,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
      deviceInfo: {
        userAgent: navigator.userAgent,
        ipAddress: '127.0.0.1',
        deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
      }
    };

    setUser(mockUser);
    setSession(mockSession);
    sessionStorage.setItem('municipality', mockUser.municipality);
    sessionStorage.setItem('userId', mockUser.id);
  };

  const mockLogin = async (credentials: LoginCredentials): Promise<AuthResult> => {
    // Simple mock validation
    if (credentials.email.endsWith('@malmo.se') && credentials.password === 'demo') {
      await initializeMockAuth();
      return {
        success: true,
        user,
        session
      };
    }

    return {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      }
    };
  };

  // Session management helpers
  const getStoredSession = (): AuthSession | null => {
    try {
      const stored = localStorage.getItem('diginativa_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const storeSession = (session: AuthSession): void => {
    localStorage.setItem('diginativa_session', JSON.stringify(session));
  };

  const clearStoredSession = (): void => {
    localStorage.removeItem('diginativa_session');
  };

  const isSessionExpired = (session: AuthSession): boolean => {
    return new Date(session.expiresAt) <= new Date();
  };

  const validateSession = async (session: AuthSession): Promise<AuthResult> => {
    if (mockMode) {
      return { success: true, user, session };
    }

    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.sessionId}`,
          'Content-Type': 'application/json'
        }
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to validate session'
        }
      };
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    permissions: user?.permissions || [],
    login,
    logout,
    refreshSession,
    loginWithSSO,
    hasPermission,
    hasRole,
    canAccessMunicipality,
    updatePreferences,
    updateLanguage
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Convenience hooks
export const usePermissions = () => {
  const { permissions, hasPermission } = useAuth();
  return { permissions, hasPermission };
};

export const useUserProfile = () => {
  const { user, updatePreferences, updateLanguage } = useAuth();
  return { user, updatePreferences, updateLanguage };
};