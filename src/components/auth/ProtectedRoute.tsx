/**
 * DigiNativa Runtime Engine - Protected Route Component
 * Role-based access control for municipal features
 */

import React from 'react';
import type { ReactNode } from 'react';
import { Box, Spinner, Alert, AlertIcon, Text, Button, VStack } from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import type { Permission, UserRole } from '../../types/auth';
import { LoginForm } from './LoginForm';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredPermissions?: Permission[];
  requiredRole?: UserRole;
  requiredMunicipality?: string;
  fallback?: ReactNode;
  showLogin?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredPermissions = [],
  requiredRole,
  requiredMunicipality,
  fallback,
  showLogin = true,
  redirectTo
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    hasPermission, 
    hasRole, 
    canAccessMunicipality 
  } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minH="50vh"
        flexDirection="column"
      >
        <Spinner 
          size="xl" 
          color="blue.500" 
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
        />
        <Text mt={4} color="gray.600">
          Verifierar inloggning...
        </Text>
      </Box>
    );
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    if (redirectTo) {
      window.location.href = redirectTo;
      return null;
    }

    if (showLogin) {
      return (
        <Box minH="100vh" bg="gray.50" py={8}>
          <LoginForm 
            title="Inloggning krävs"
            onSuccess={() => window.location.reload()} 
          />
        </Box>
      );
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box p={8} maxW="500px" mx="auto">
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Inloggning krävs</Text>
            <Text fontSize="sm" mt={1}>
              Du måste logga in för att komma åt denna sida.
            </Text>
          </Box>
        </Alert>
      </Box>
    );
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box p={8} maxW="500px" mx="auto">
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Åtkomst nekad</Text>
            <Text fontSize="sm">
              Du har inte rätt behörighet för att komma åt denna sida.
            </Text>
            <Text fontSize="sm" color="gray.600">
              Krävs: {getRoleDisplayName(requiredRole)}<br/>
              Din roll: {user ? getRoleDisplayName(user.role) : 'Okänd'}
            </Text>
            <Button 
              size="sm" 
              colorScheme="blue" 
              onClick={() => window.history.back()}
              mt={2}
            >
              Gå tillbaka
            </Button>
          </VStack>
        </Alert>
      </Box>
    );
  }

  // Check permission requirements
  const missingPermissions = requiredPermissions.filter(
    permission => !hasPermission(permission)
  );

  if (missingPermissions.length > 0) {
    return (
      <Box p={8} maxW="500px" mx="auto">
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Otillräckliga behörigheter</Text>
            <Text fontSize="sm">
              Du saknar nödvändiga behörigheter för att komma åt denna sida.
            </Text>
            <Text fontSize="sm" color="gray.600">
              Saknade behörigheter:
            </Text>
            <Box as="ul" pl={4} fontSize="sm" color="gray.600">
              {missingPermissions.map(permission => (
                <li key={permission}>
                  {getPermissionDisplayName(permission)}
                </li>
              ))}
            </Box>
            <Text fontSize="xs" color="gray.500" mt={2}>
              Kontakta din administratör för att få nödvändiga behörigheter.
            </Text>
            <Button 
              size="sm" 
              colorScheme="blue" 
              onClick={() => window.history.back()}
              mt={2}
            >
              Gå tillbaka
            </Button>
          </VStack>
        </Alert>
      </Box>
    );
  }

  // Check municipality access
  if (requiredMunicipality && !canAccessMunicipality(requiredMunicipality)) {
    return (
      <Box p={8} maxW="500px" mx="auto">
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Kommunåtkomst nekad</Text>
            <Text fontSize="sm">
              Du har inte åtkomst till denna kommun.
            </Text>
            <Text fontSize="sm" color="gray.600">
              Krävs: {getMunicipalityDisplayName(requiredMunicipality)}<br/>
              Din kommun: {user ? getMunicipalityDisplayName(user.municipality) : 'Okänd'}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={2}>
              Kontakta support för att få åtkomst till andra kommuner.
            </Text>
            <Button 
              size="sm" 
              colorScheme="blue" 
              onClick={() => window.history.back()}
              mt={2}
            >
              Gå tillbaka
            </Button>
          </VStack>
        </Alert>
      </Box>
    );
  }

  // All checks passed - render children
  return <>{children}</>;
};

// Helper functions for display names
function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    user: 'Användare',
    admin: 'Administratör',
    super_admin: 'Systemadministratör',
    content_manager: 'Innehållshanterare',
    analyst: 'Analytiker'
  };
  return roleNames[role] || role;
}

function getPermissionDisplayName(permission: Permission): string {
  const permissionNames: Record<Permission, string> = {
    'games.play': 'Spela spel',
    'games.create': 'Skapa spel',
    'games.publish': 'Publicera spel',
    'games.analytics': 'Visa spelanalys',
    'users.view': 'Visa användare',
    'users.manage': 'Hantera användare',
    'municipality.admin': 'Kommunadministration',
    'system.admin': 'Systemadministration',
    'content.manage': 'Innehållshantering',
    'analytics.view': 'Visa analys',
    'analytics.export': 'Exportera analys'
  };
  return permissionNames[permission] || permission;
}

function getMunicipalityDisplayName(municipalityId: string): string {
  const municipalityNames: Record<string, string> = {
    'malmo': 'Malmö Stad',
    'stockholm': 'Stockholm Stad',
    'goteborg': 'Göteborg Stad',
    'uppsala': 'Uppsala Kommun',
    'linkoping': 'Linköping Kommun'
  };
  return municipalityNames[municipalityId] || municipalityId;
}

// Convenience component for game access
export const GameProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requiredPermissions={['games.play']}
    >
      {children}
    </ProtectedRoute>
  );
};

// Convenience component for admin access
export const AdminProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requiredRole="admin"
      requiredPermissions={['municipality.admin']}
    >
      {children}
    </ProtectedRoute>
  );
};

// Convenience component for content management
export const ContentManagerRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requiredPermissions={['content.manage', 'games.create']}
    >
      {children}
    </ProtectedRoute>
  );
};

// Convenience component for analytics access
export const AnalyticsRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requiredPermissions={['analytics.view']}
    >
      {children}
    </ProtectedRoute>
  );
};